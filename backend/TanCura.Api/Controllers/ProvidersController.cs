using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TanCura.Core.Interfaces;

namespace TanCura.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class ProvidersController : ControllerBase
{
    private readonly IProviderRepository _providers;
    public ProvidersController(IProviderRepository providers) => _providers = providers;

    [HttpGet]
    public async Task<IActionResult> GetProviders()
    {
        var providers = await _providers.GetAllAsync();
        return Ok(providers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProvider(Guid id)
    {
        var provider = await _providers.GetByIdAsync(id);
        if (provider == null) return NotFound();
        return Ok(provider);
    }
}
