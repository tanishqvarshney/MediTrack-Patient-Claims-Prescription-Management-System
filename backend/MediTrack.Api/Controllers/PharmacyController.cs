using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediTrack.Core.DTOs;
using MediTrack.Core.Interfaces;

namespace MediTrack.Api.Controllers;

[ApiController]
[Route("api/v1/pharmacy")]
[Authorize]
public class PharmacyController : ControllerBase
{
    private readonly IPharmacyService _pharmacy;

    public PharmacyController(IPharmacyService pharmacy) => _pharmacy = pharmacy;

    /// <summary>Look up formulary tier, copay and prior auth for an NDC code</summary>
    [HttpGet("formulary/{ndcCode}")]
    [ProducesResponseType(typeof(FormularyResult), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetFormulary(string ndcCode, CancellationToken ct)
    {
        var result = await _pharmacy.GetFormularyAsync(ndcCode, ct);
        if (result == null) return NotFound(new { message = $"No formulary data found for NDC: {ndcCode}" });
        return Ok(result);
    }

    /// <summary>Submit a new prescription</summary>
    [HttpPost("prescriptions")]
    [Authorize(Policy = "ProviderOrAdmin")]
    [ProducesResponseType(typeof(SubmitPrescriptionResponse), 201)]
    public async Task<IActionResult> SubmitPrescription(
        [FromBody] SubmitPrescriptionRequest request, CancellationToken ct)
    {
        var result = await _pharmacy.SubmitPrescriptionAsync(request, ct);
        return CreatedAtAction(nameof(GetFormulary), new { ndcCode = request.DrugCode }, result);
    }
}
