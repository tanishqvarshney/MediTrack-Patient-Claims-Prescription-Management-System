using Microsoft.EntityFrameworkCore;
using MediTrack.Core.Enums;
using MediTrack.Core.Interfaces;
using MediTrack.Core.Models;
using MediTrack.Infrastructure.Data;

namespace MediTrack.Infrastructure.Repositories;

public class ClaimRepository : IClaimRepository
{
    private readonly MediTrackDbContext _db;
    public ClaimRepository(MediTrackDbContext db) => _db = db;

    public async Task<Claim?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _db.Claims
            .Include(c => c.Patient)
            .Include(c => c.Provider)
            .Include(c => c.LineItems)
            .FirstOrDefaultAsync(c => c.ClaimId == id, ct);

    public async Task<Claim?> GetByClaimNumberAsync(string claimNumber, CancellationToken ct = default) =>
        await _db.Claims.FirstOrDefaultAsync(c => c.ClaimNumber == claimNumber, ct);

    public async Task<(IEnumerable<Claim> Items, int Total)> GetPagedAsync(
        int page, int pageSize, string? status, Guid? patientId, CancellationToken ct = default)
    {
        var query = _db.Claims
            .Include(c => c.Patient)
            .Include(c => c.Provider)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(c => c.Status == Enum.Parse<ClaimStatus>(status, true));

        if (patientId.HasValue)
            query = query.Where(c => c.PatientId == patientId.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(c => c.SubmittedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<Claim> AddAsync(Claim claim, CancellationToken ct = default)
    {
        _db.Claims.Add(claim);
        await _db.SaveChangesAsync(ct);
        return claim;
    }

    public async Task UpdateAsync(Claim claim, CancellationToken ct = default)
    {
        _db.Claims.Update(claim);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<int> CountDuplicatesAsync(
        Guid patientId, Guid providerId, DateTime serviceDate, decimal amount, CancellationToken ct = default) =>
        await _db.Claims.CountAsync(c =>
            c.PatientId == patientId &&
            c.ProviderId == providerId &&
            c.ServiceDate.Date == serviceDate.Date &&
            Math.Abs(c.TotalAmount - amount) < 0.01m &&
            c.SubmittedDate >= DateTime.UtcNow.AddDays(-30), ct);

    public async Task<List<Claim>> GetPendingBatchAsync(int batchSize, CancellationToken ct = default)
    {
        // Use raw SQL with UPDLOCK, READPAST to prevent concurrent double-processing
        var claimIds = await _db.Database
            .SqlQuery<Guid>($"""
                SELECT TOP ({batchSize}) ClaimId FROM Claims WITH (UPDLOCK, READPAST)
                WHERE Status = 'Pending' ORDER BY SubmittedDate
            """)
            .ToListAsync(ct);

        if (!claimIds.Any()) return new List<Claim>();

        var claims = await _db.Claims
            .Include(c => c.Patient)
            .Where(c => claimIds.Contains(c.ClaimId))
            .ToListAsync(ct);

        foreach (var claim in claims)
            claim.Status = ClaimStatus.Processing;

        await _db.SaveChangesAsync(ct);
        return claims;
    }

    public async Task<decimal> GetPatientYearlyTotalAsync(Guid patientId, int year, CancellationToken ct = default) =>
        await _db.Claims
            .Where(c => c.PatientId == patientId &&
                        c.ServiceDate.Year == year &&
                        c.Status == ClaimStatus.Approved)
            .SumAsync(c => c.TotalAmount, ct);
}

public class FormularyRepository : IFormularyRepository
{
    private readonly MediTrackDbContext _db;
    public FormularyRepository(MediTrackDbContext db) => _db = db;

    public async Task<Formulary?> GetByNDCCodeAsync(string ndcCode, CancellationToken ct = default) =>
        await _db.Formulary.FirstOrDefaultAsync(f => f.NDCCode == ndcCode && f.IsActive, ct);

    public async Task<List<Formulary>> GetAlternativesAsync(int tier, CancellationToken ct = default) =>
        await _db.Formulary
            .Where(f => f.Tier < tier && f.IsActive)
            .OrderBy(f => f.Tier)
            .Take(3)
            .ToListAsync(ct);
}

public class UserRepository : IUserRepository
{
    private readonly MediTrackDbContext _db;
    public UserRepository(MediTrackDbContext db) => _db = db;

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        await _db.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive, ct);

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _db.Users.FindAsync(new object[] { id }, ct);

    public async Task<User?> GetByRefreshTokenAsync(string token, CancellationToken ct = default) =>
        await _db.Users.FirstOrDefaultAsync(u => u.RefreshToken == token, ct);

    public async Task UpdateAsync(User user, CancellationToken ct = default)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync(ct);
    }
}

public class ProviderRepository : IProviderRepository
{
    private readonly MediTrackDbContext _db;
    public ProviderRepository(MediTrackDbContext db) => _db = db;

    public async Task<Provider?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _db.Providers.FindAsync(new object[] { id }, ct);

    public async Task<List<Provider>> GetAllAsync(CancellationToken ct = default) =>
        await _db.Providers.Where(p => p.IsActive).ToListAsync(ct);
}
