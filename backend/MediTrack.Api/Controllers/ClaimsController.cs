using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediTrack.Core.DTOs;
using MediTrack.Core.Interfaces;
using System.Security.Claims;

namespace MediTrack.Api.Controllers;

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

    /// <summary>List claims with filtering and pagination (Admin only)</summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(PagedResult<ClaimSummaryDto>), 200)]
    public async Task<IActionResult> GetClaims([FromQuery] ClaimQueryParams query, CancellationToken ct)
    {
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
