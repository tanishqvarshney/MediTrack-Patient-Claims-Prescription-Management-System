using TanCura.Core.Models;

namespace TanCura.Core.Interfaces;

public interface IClaimRepository
{
    Task<Claim?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Claim?> GetByClaimNumberAsync(string claimNumber, CancellationToken ct = default);
    Task<(IEnumerable<Claim> Items, int Total)> GetPagedAsync(
        int page, int pageSize, string? status, Guid? patientId, Guid? providerId, CancellationToken ct = default);
    Task<Claim> AddAsync(Claim claim, CancellationToken ct = default);
    Task UpdateAsync(Claim claim, CancellationToken ct = default);
    Task<int> CountDuplicatesAsync(Guid patientId, Guid providerId, DateTime serviceDate, decimal amount, CancellationToken ct = default);
    Task<List<Claim>> GetPendingBatchAsync(int batchSize, CancellationToken ct = default);
    Task<decimal> GetPatientYearlyTotalAsync(Guid patientId, int year, CancellationToken ct = default);
}

public interface IPatientRepository
{
    Task<Patient?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Patient?> GetByMemberIdAsync(string memberId, CancellationToken ct = default);
    Task<List<Patient>> GetAllAsync(CancellationToken ct = default);
}

public interface IProviderRepository
{
    Task<Provider?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<Provider>> GetAllAsync(CancellationToken ct = default);
}

public interface IFormularyRepository
{
    Task<Formulary?> GetByNDCCodeAsync(string ndcCode, CancellationToken ct = default);
    Task<List<Formulary>> GetAlternativesAsync(int tier, CancellationToken ct = default);
    Task<List<Formulary>> SearchAsync(string query, CancellationToken ct = default);
}

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetByRefreshTokenAsync(string token, CancellationToken ct = default);
    Task UpdateAsync(User user, CancellationToken ct = default);
}

public interface IAuditRepository
{
    Task AddAsync(AuditLog log, CancellationToken ct = default);
    Task<(IEnumerable<AuditLog> Items, int Total)> GetPagedAsync(
        int page, int pageSize, string? entityType, CancellationToken ct = default);
}
