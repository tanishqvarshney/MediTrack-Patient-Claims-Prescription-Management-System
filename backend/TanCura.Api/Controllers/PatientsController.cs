using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TanCura.Core.Interfaces;

namespace TanCura.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly IPatientRepository _patients;
    public PatientsController(IPatientRepository patients) => _patients = patients;

    [HttpGet]
    public async Task<IActionResult> GetPatients()
    {
        var patients = await _patients.GetAllAsync();
        return Ok(patients);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPatient(Guid id)
    {
        var patient = await _patients.GetByIdAsync(id);
        if (patient == null) return NotFound();
        return Ok(patient);
    }
}
