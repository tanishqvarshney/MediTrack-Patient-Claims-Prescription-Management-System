using TanCura.Core.Enums;
using TanCura.Core.Interfaces;
using TanCura.Core.Models;
using TanCura.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace TanCura.Worker;

public interface IClaimProcessor
{
    Task<List<Claim>> GetPendingBatchAsync(int batchSize, CancellationToken ct = default);
    Task ProcessClaimAsync(Claim claim, CancellationToken ct = default);
}

public class ClaimProcessor : IClaimProcessor
{
    private readonly TanCuraDbContext _db;
    private readonly IPayerApiClient _payer;
    private readonly INotificationService _notify;
    private readonly ILogger<ClaimProcessor> _logger;

    public ClaimProcessor(
        TanCuraDbContext db,
        IPayerApiClient payer,
        INotificationService notify,
        ILogger<ClaimProcessor> logger)
    {
        _db = db;
        _payer = payer;
        _notify = notify;
        _logger = logger;
    }

    public async Task<List<Claim>> GetPendingBatchAsync(int batchSize, CancellationToken ct = default)
    {
        var claimIds = await _db.Database
            .SqlQuery<Guid>($"""
                SELECT TOP ({batchSize}) ClaimId FROM Claims WITH (UPDLOCK, READPAST)
                WHERE Status = 'Pending' ORDER BY SubmittedDate
            """)
            .ToListAsync(ct);

        if (!claimIds.Any()) return [];

        var claims = await _db.Claims
            .Include(c => c.Patient)
            .Where(c => claimIds.Contains(c.ClaimId))
            .ToListAsync(ct);

        foreach (var c in claims) c.Status = ClaimStatus.Processing;
        await _db.SaveChangesAsync(ct);
        return claims;
    }

    public async Task ProcessClaimAsync(Claim claim, CancellationToken ct = default)
    {
        _logger.LogInformation("Processing claim {ClaimNumber}", claim.ClaimNumber);

        try
        {
            var response = await _payer.AdjudicateAsync(new PayerAdjudicationRequest(
                claim.ClaimNumber,
                claim.Patient?.MemberId ?? string.Empty,
                claim.TotalAmount), ct);

            claim.Status = response.Approved ? ClaimStatus.Approved : ClaimStatus.Rejected;
            claim.RejectionReason = response.Approved ? null : response.DenialReason;
            claim.ProcessedDate = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            if (claim.Patient?.Email != null)
                await _notify.SendClaimStatusUpdateAsync(
                    claim.Patient.Email, claim.ClaimNumber, claim.Status.ToString(), ct);

            _logger.LogInformation("Claim {ClaimNumber} → {Status}", claim.ClaimNumber, claim.Status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process claim {ClaimNumber}", claim.ClaimNumber);
            claim.Status = ClaimStatus.Pending; // Reset for retry
            await _db.SaveChangesAsync(ct);
        }
    }
}
