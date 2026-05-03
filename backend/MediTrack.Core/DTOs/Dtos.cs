using System.ComponentModel.DataAnnotations;
using MediTrack.Core.Enums;

namespace MediTrack.Core.DTOs;

// ---- Claims ----
public record SubmitClaimRequest(
    [Required] Guid PatientId,
    [Required] Guid ProviderId,
    [Required] DateTime ServiceDate,
    [Required][Range(0.01, double.MaxValue)] decimal TotalAmount,
    [Required][MinLength(1)] List<LineItemRequest> LineItems
);

public record LineItemRequest(
    [Required] string ProcedureCode,
    string? DiagnosisCode,
    [Range(1, int.MaxValue)] int Quantity,
    [Range(0.01, double.MaxValue)] decimal UnitCost
);

public record SubmitClaimResponse(
    Guid ClaimId,
    string ClaimNumber,
    string Status,
    DateTime SubmittedDate,
    ValidationSummary ValidationResults
);

public record ValidationSummary(
    bool EligibilityPassed,
    bool DuplicateFound,
    bool CoverageLimitPassed,
    bool IsValid
);

public record ClaimDetailDto(
    Guid ClaimId,
    string ClaimNumber,
    string PatientName,
    string ProviderName,
    DateTime ServiceDate,
    DateTime SubmittedDate,
    decimal TotalAmount,
    string Status,
    string? RejectionReason,
    DateTime? ProcessedDate,
    List<LineItemDto> LineItems
);

public record LineItemDto(string ProcedureCode, string? DiagnosisCode, int Quantity, decimal UnitCost, decimal LineTotal);

public record ClaimSummaryDto(
    Guid ClaimId,
    string ClaimNumber,
    string PatientName,
    DateTime ServiceDate,
    decimal TotalAmount,
    string Status
);

public record UpdateClaimStatusRequest([Required] string Status, string? RejectionReason);

public record ClaimQueryParams(
    int Page = 1,
    int PageSize = 20,
    string? Status = null,
    Guid? PatientId = null,
    DateTime? From = null,
    DateTime? To = null
);

// ---- Pharmacy ----
public record FormularyResult(
    string NDCCode,
    string DrugName,
    int Tier,
    string TierLabel,
    decimal Copay,
    bool RequiresPriorAuth,
    int? CoverageLimit,
    List<FormularyAlternative> Alternatives
);

public record FormularyAlternative(string NDCCode, string DrugName, int Tier, decimal Copay);

public record SubmitPrescriptionRequest(
    [Required] Guid PatientId,
    [Required] Guid ProviderId,
    [Required] string DrugCode,
    [Required] string DrugName,
    [Range(1, 1000)] int Quantity,
    [Range(1, 365)] int DaysSupply,
    [Required] DateTime WrittenDate
);

public record SubmitPrescriptionResponse(Guid PrescriptionId, string Status, bool RequiresPriorAuth);

// ---- Auth ----
public record LoginRequest([Required][EmailAddress] string Email, [Required] string Password);
public record LoginResponse(string AccessToken, string RefreshToken, int ExpiresIn, string Role, Guid UserId);
public record RefreshTokenRequest([Required] string RefreshToken);

// ---- Admin Metrics ----
public record ClaimMetricsResponse(
    int TotalClaims,
    int Approved,
    int Rejected,
    int Pending,
    decimal TotalAmountProcessed,
    double AvgProcessingHours,
    List<DailyClaimBreakdown> DailyBreakdown
);

public record DailyClaimBreakdown(string Date, int Submitted, int Approved, int Rejected);

// ---- Shared ----
public record PagedResult<T>(IEnumerable<T> Items, int Total, int Page, int PageSize);
