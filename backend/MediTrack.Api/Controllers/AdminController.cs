using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediTrack.Core.DTOs;
using MediTrack.Core.Models;
using MediTrack.Infrastructure.Data;

namespace MediTrack.Api.Controllers;

[ApiController]
[Route("api/v1/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly MediTrackDbContext _db;
    private readonly ILogger<AdminController> _logger;

    public AdminController(MediTrackDbContext db, ILogger<AdminController> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>Claims volume and financial metrics for date range</summary>
    [HttpGet("metrics/claims")]
    [ProducesResponseType(typeof(ClaimMetricsResponse), 200)]
    public async Task<IActionResult> GetClaimMetrics(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken ct)
    {
        var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
        var toDate = to ?? DateTime.UtcNow;

        var claims = await _db.Claims
            .Where(c => c.SubmittedDate >= fromDate && c.SubmittedDate <= toDate)
            .ToListAsync(ct);

        var approved = claims.Count(c => c.Status == Core.Enums.ClaimStatus.Approved);
        var rejected = claims.Count(c => c.Status == Core.Enums.ClaimStatus.Rejected);
        var pending = claims.Count(c => c.Status == Core.Enums.ClaimStatus.Pending);

        var avgProcessingHours = claims
            .Where(c => c.ProcessedDate.HasValue)
            .Select(c => (c.ProcessedDate!.Value - c.SubmittedDate).TotalHours)
            .DefaultIfEmpty(0)
            .Average();

        var daily = claims
            .GroupBy(c => c.SubmittedDate.Date)
            .OrderBy(g => g.Key)
            .Select(g => new DailyClaimBreakdown(
                g.Key.ToString("yyyy-MM-dd"),
                g.Count(),
                g.Count(c => c.Status == Core.Enums.ClaimStatus.Approved),
                g.Count(c => c.Status == Core.Enums.ClaimStatus.Rejected)
            )).ToList();

        return Ok(new ClaimMetricsResponse(
            claims.Count, approved, rejected, pending,
            claims.Where(c => c.Status == Core.Enums.ClaimStatus.Approved).Sum(c => c.TotalAmount),
            Math.Round(avgProcessingHours, 2),
            daily
        ));
    }

    /// <summary>Paginated audit log entries</summary>
    [HttpGet("audit-logs")]
    [ProducesResponseType(typeof(PagedResult<AuditLog>), 200)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? entityType = null,
        CancellationToken ct = default)
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

        return Ok(new PagedResult<AuditLog>(items, total, page, pageSize));
    }

    /// <summary>Top rejection reasons grouped and counted</summary>
    [HttpGet("metrics/rejections")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetRejectionReasons(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
        var toDate = to ?? DateTime.UtcNow;

        var reasons = await _db.Claims
            .Where(c => c.Status == Core.Enums.ClaimStatus.Rejected
                && c.SubmittedDate >= fromDate && c.SubmittedDate <= toDate
                && c.RejectionReason != null)
            .GroupBy(c => c.RejectionReason!)
            .Select(g => new { Reason = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToListAsync(ct);

        return Ok(reasons);
    }
}
