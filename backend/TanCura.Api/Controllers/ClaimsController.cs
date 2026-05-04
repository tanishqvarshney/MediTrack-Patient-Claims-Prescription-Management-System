using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TanCura.Core.DTOs;
using TanCura.Core.Interfaces;
using System.Security.Claims;

namespace TanCura.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class ClaimsController : ControllerBase
{
    private readonly IClaimsService _claims;
    private readonly ILogger<ClaimsController> _logger;

    public ClaimsController(IClaimsService claims, ILogger<ClaimsController> logger)
    {
        _claims = claims;
        _logger = logger;
    }

    /// <summary>Submit a new claim (Providers only)</summary>
    [HttpPost]
    [Authorize(Policy = "ProviderOrAdmin")]
    [ProducesResponseType(typeof(SubmitClaimResponse), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> SubmitClaim(
        [FromBody] SubmitClaimRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
        var result = await _claims.SubmitClaimAsync(request, userId, ct);
        return CreatedAtAction(nameof(GetClaim), new { id = result.ClaimId }, result);
    }

    /// <summary>Get claim by ID</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ClaimDetailDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetClaim(Guid id, CancellationToken ct)
    {
        try
        {
            var claim = await _claims.GetClaimAsync(id, ct);
            return Ok(claim);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>List claims with filtering and pagination</summary>
    [HttpGet]
    [Authorize] // Allow any authenticated user; filtering happens inside
    [ProducesResponseType(typeof(PagedResult<ClaimSummaryDto>), 200)]
    public async Task<IActionResult> GetClaims([FromQuery] ClaimQueryParams query, CancellationToken ct)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var linkedEntityId = User.FindFirstValue("linked_entity");

        _logger.LogInformation("GetClaims requested. Role: {Role}, LinkedEntity: {EntityId}", role, linkedEntityId);

        // If the user is a Provider, they can only see their own claims
        if (role?.Equals("Provider", StringComparison.OrdinalIgnoreCase) == true && Guid.TryParse(linkedEntityId, out var providerId))
        {
            query = query with { ProviderId = providerId };
            _logger.LogInformation("Filtering by ProviderId: {ProviderId}", providerId);
        }
        // If the user is a Patient, they can only see their own claims
        else if (role?.Equals("Patient", StringComparison.OrdinalIgnoreCase) == true && Guid.TryParse(linkedEntityId, out var patientId))
        {
            query = query with { PatientId = patientId };
            _logger.LogInformation("Filtering by PatientId: {PatientId}", patientId);
        }

        var result = await _claims.GetClaimsAsync(query, ct);
        return Ok(result);
    }

    /// <summary>Get claims for a specific patient</summary>
    [HttpGet("patient/{patientId:guid}")]
    [ProducesResponseType(typeof(PagedResult<ClaimSummaryDto>), 200)]
    public async Task<IActionResult> GetPatientClaims(Guid patientId, CancellationToken ct)
    {
        var query = new ClaimQueryParams(PatientId: patientId);
        var result = await _claims.GetClaimsAsync(query, ct);
        return Ok(result);
    }

    /// <summary>Update claim status (Admin only)</summary>
    [HttpPut("{id:guid}/status")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateStatus(
        Guid id, [FromBody] UpdateClaimStatusRequest request, CancellationToken ct)
    {
        try
        {
            await _claims.UpdateStatusAsync(id, request, ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
