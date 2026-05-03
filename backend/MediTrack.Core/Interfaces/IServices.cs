using MediTrack.Core.DTOs;

namespace MediTrack.Core.Interfaces;

public interface IClaimsService
{
    Task<SubmitClaimResponse> SubmitClaimAsync(SubmitClaimRequest request, string userId, CancellationToken ct = default);
    Task<ClaimDetailDto> GetClaimAsync(Guid claimId, CancellationToken ct = default);
    Task<PagedResult<ClaimSummaryDto>> GetClaimsAsync(ClaimQueryParams query, CancellationToken ct = default);
    Task UpdateStatusAsync(Guid claimId, UpdateClaimStatusRequest request, CancellationToken ct = default);
}

public interface IEligibilityService
{
    Task<EligibilityResult> CheckAsync(Guid patientId, DateTime serviceDate, CancellationToken ct = default);
}

public interface IPharmacyService
{
    Task<FormularyResult?> GetFormularyAsync(string ndcCode, CancellationToken ct = default);
    Task<SubmitPrescriptionResponse> SubmitPrescriptionAsync(SubmitPrescriptionRequest request, CancellationToken ct = default);
}

public interface ITokenService
{
    string GenerateAccessToken(Core.Models.User user);
    string GenerateRefreshToken();
}

public interface INotificationService
{
    Task SendClaimStatusUpdateAsync(string email, string claimNumber, string status, CancellationToken ct = default);
}

public interface IPayerApiClient
{
    Task<PayerAdjudicationResponse> AdjudicateAsync(PayerAdjudicationRequest request, CancellationToken ct = default);
}

// Supporting types for interfaces
public record EligibilityResult(bool IsActive, bool PlanActive, decimal OopMaxAmt, decimal RemainingBenefit);
public record PayerAdjudicationRequest(string ClaimNumber, string PatientMemberId, decimal Amount);
public record PayerAdjudicationResponse(bool Approved, string? DenialReason, decimal ApprovedAmount);
