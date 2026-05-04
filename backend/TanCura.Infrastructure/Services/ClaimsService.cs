using TanCura.Core.DTOs;
using TanCura.Core.Enums;
using TanCura.Core.Interfaces;
using TanCura.Core.Models;

namespace TanCura.Infrastructure.Services;

public class ClaimsService : IClaimsService
{
    private readonly IClaimRepository _claims;
    private readonly IPatientRepository _patients;
    private readonly IEligibilityService _eligibility;

    public ClaimsService(
        IClaimRepository claims,
        IPatientRepository patients,
        IEligibilityService eligibility)
    {
        _claims = claims;
        _patients = patients;
        _eligibility = eligibility;
    }

    public async Task<SubmitClaimResponse> SubmitClaimAsync(
        SubmitClaimRequest request, string userId, CancellationToken ct = default)
    {
        // Run validation
        var validation = await ValidateAsync(request, ct);

        var claim = new Claim
        {
            ClaimId = Guid.NewGuid(),
            ClaimNumber = GenerateClaimNumber(),
            PatientId = request.PatientId,
            ProviderId = request.ProviderId,
            ServiceDate = request.ServiceDate,
            TotalAmount = request.TotalAmount,
            Status = validation.IsValid ? ClaimStatus.Pending : ClaimStatus.Rejected,
            RejectionReason = validation.IsValid ? null : BuildRejectionReason(validation),
            LineItems = request.LineItems.Select(li => new ClaimLineItem
            {
                LineItemId = Guid.NewGuid(),
                ProcedureCode = li.ProcedureCode,
                DiagnosisCode = li.DiagnosisCode,
                Quantity = li.Quantity,
                UnitCost = li.UnitCost
            }).ToList()
        };

        await _claims.AddAsync(claim, ct);

        return new SubmitClaimResponse(
            claim.ClaimId,
            claim.ClaimNumber,
            claim.Status.ToString(),
            claim.SubmittedDate,
            validation);
    }

    public async Task<ClaimDetailDto> GetClaimAsync(Guid claimId, CancellationToken ct = default)
    {
        var claim = await _claims.GetByIdAsync(claimId, ct)
            ?? throw new KeyNotFoundException($"Claim {claimId} not found");

        return new ClaimDetailDto(
            claim.ClaimId,
            claim.ClaimNumber,
            claim.Patient?.FullName ?? string.Empty,
            claim.Provider?.Name ?? string.Empty,
            claim.ServiceDate,
            claim.SubmittedDate,
            claim.TotalAmount,
            claim.Status.ToString(),
            claim.RejectionReason,
            claim.ProcessedDate,
            claim.LineItems.Select(li => new LineItemDto(
                li.ProcedureCode, li.DiagnosisCode, li.Quantity, li.UnitCost, li.LineTotal
            )).ToList()
        );
    }

    public async Task<PagedResult<ClaimSummaryDto>> GetClaimsAsync(
        ClaimQueryParams query, CancellationToken ct = default)
    {
        var (items, total) = await _claims.GetPagedAsync(
            query.Page, query.PageSize, query.Status, query.PatientId, query.ProviderId, ct);

        var dtos = items.Select(c => new ClaimSummaryDto(
            c.ClaimId, c.ClaimNumber,
            c.Patient?.FullName ?? string.Empty,
            c.ServiceDate, c.TotalAmount, c.Status.ToString()
        ));

        return new PagedResult<ClaimSummaryDto>(dtos, total, query.Page, query.PageSize);
    }

    public async Task UpdateStatusAsync(
        Guid claimId, UpdateClaimStatusRequest request, CancellationToken ct = default)
    {
        var claim = await _claims.GetByIdAsync(claimId, ct)
            ?? throw new KeyNotFoundException($"Claim {claimId} not found");

        claim.Status = Enum.Parse<ClaimStatus>(request.Status, true);
        claim.RejectionReason = request.RejectionReason;
        claim.ProcessedDate = DateTime.UtcNow;

        await _claims.UpdateAsync(claim, ct);
    }

    // --- Private Helpers ---

    private async Task<ValidationSummary> ValidateAsync(SubmitClaimRequest req, CancellationToken ct)
    {
        var eligibility = await _eligibility.CheckAsync(req.PatientId, req.ServiceDate, ct);
        var dupCount = await _claims.CountDuplicatesAsync(
            req.PatientId, req.ProviderId, req.ServiceDate, req.TotalAmount, ct);
        var yearlyTotal = await _claims.GetPatientYearlyTotalAsync(
            req.PatientId, req.ServiceDate.Year, ct);

        bool eligPassed = eligibility.IsActive && eligibility.PlanActive;
        bool dupFound = dupCount > 0;
        bool coveragePassed = yearlyTotal + req.TotalAmount <= eligibility.OopMaxAmt;

        return new ValidationSummary(
            eligPassed, dupFound, coveragePassed,
            eligPassed && !dupFound && coveragePassed);
    }

    private static string GenerateClaimNumber() =>
        $"CLM-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(10000, 99999)}";

    private static string BuildRejectionReason(ValidationSummary v)
    {
        var reasons = new List<string>();
        if (!v.EligibilityPassed) reasons.Add("Patient ineligible");
        if (v.DuplicateFound) reasons.Add("Duplicate claim detected");
        if (!v.CoverageLimitPassed) reasons.Add("Coverage limit exceeded");
        return string.Join("; ", reasons);
    }
}

public class EligibilityService : IEligibilityService
{
    private readonly Core.Interfaces.IPatientRepository _patients;

    public EligibilityService(Core.Interfaces.IPatientRepository patients)
        => _patients = patients;

    public async Task<EligibilityResult> CheckAsync(
        Guid patientId, DateTime serviceDate, CancellationToken ct = default)
    {
        var patient = await _patients.GetByIdAsync(patientId, ct);
        if (patient == null)
            return new EligibilityResult(false, false, 0, 0);

        var plan = patient.InsurancePlan;
        bool planActive = plan != null &&
                          plan.EffectiveDate <= serviceDate &&
                          (plan.TerminationDate == null || plan.TerminationDate > serviceDate);

        return new EligibilityResult(
            patient.IsActive,
            planActive,
            plan?.OopMaxAmt ?? 0,
            plan?.OopMaxAmt ?? 0);
    }
}

public class PharmacyService : IPharmacyService
{
    private readonly IFormularyRepository _formulary;

    public PharmacyService(IFormularyRepository formulary) => _formulary = formulary;

    public async Task<FormularyResult?> GetFormularyAsync(string ndcCode, CancellationToken ct = default)
    {
        var drug = await _formulary.GetByNDCCodeAsync(ndcCode, ct);
        if (drug == null) return null;

        var alternatives = await _formulary.GetAlternativesAsync(drug.Tier, ct);

        return MapToResult(drug, alternatives);
    }

    public async Task<List<FormularyResult>> SearchFormularyAsync(string query, CancellationToken ct = default)
    {
        var drugs = await _formulary.SearchAsync(query, ct);
        var results = new List<FormularyResult>();
        
        foreach(var drug in drugs)
        {
            var alts = await _formulary.GetAlternativesAsync(drug.Tier, ct);
            results.Add(MapToResult(drug, alts));
        }

        return results;
    }

    private static FormularyResult MapToResult(TanCura.Core.Models.Formulary drug, List<TanCura.Core.Models.Formulary> alternatives)
    {
        return new FormularyResult(
            drug.NDCCode,
            drug.DrugName,
            drug.Tier,
            drug.TierLabel,
            drug.Copay,
            drug.RequiresPriorAuth,
            drug.CoverageLimit,
            alternatives.Select(a => new FormularyAlternative(a.NDCCode, a.DrugName, a.Tier, a.Copay)).ToList()
        );
    }

    public async Task<SubmitPrescriptionResponse> SubmitPrescriptionAsync(
        SubmitPrescriptionRequest request, CancellationToken ct = default)
    {
        var drug = await _formulary.GetByNDCCodeAsync(request.DrugCode, ct);
        return new SubmitPrescriptionResponse(
            Guid.NewGuid(),
            drug?.RequiresPriorAuth == true ? "PendingAuth" : "Approved",
            drug?.RequiresPriorAuth ?? false);
    }
}
