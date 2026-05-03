using Microsoft.EntityFrameworkCore;
using MediTrack.Core.Models;
using MediTrack.Infrastructure.Data;

namespace MediTrack.Infrastructure.Repositories;

public class PatientRepository : Core.Interfaces.IPatientRepository
{
    private readonly MediTrackDbContext _db;
    public PatientRepository(MediTrackDbContext db) => _db = db;

    public async Task<Patient?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _db.Patients
            .Include(p => p.InsurancePlan)
            .FirstOrDefaultAsync(p => p.PatientId == id, ct);

    public async Task<Patient?> GetByMemberIdAsync(string memberId, CancellationToken ct = default) =>
        await _db.Patients
            .Include(p => p.InsurancePlan)
            .FirstOrDefaultAsync(p => p.MemberId == memberId && p.IsActive, ct);

    public async Task<List<Patient>> GetAllAsync(CancellationToken ct = default) =>
        await _db.Patients.Include(p => p.InsurancePlan).Where(p => p.IsActive).ToListAsync(ct);
}

public class AuditRepository : Core.Interfaces.IAuditRepository
{
    private readonly MediTrackDbContext _db;
    public AuditRepository(MediTrackDbContext db) => _db = db;

    public async Task AddAsync(AuditLog log, CancellationToken ct = default)
    {
        _db.AuditLogs.Add(log);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<(IEnumerable<AuditLog> Items, int Total)> GetPagedAsync(
        int page, int pageSize, string? entityType, CancellationToken ct = default)
    {
        var query = _db.AuditLogs.AsQueryable();
        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(a => a.EntityType == entityType);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }
}
