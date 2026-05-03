using Microsoft.AspNetCore.Mvc;
using MediTrack.Core.DTOs;
using MediTrack.Infrastructure.Services;

namespace MediTrack.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;

    public AuthController(AuthService auth) => _auth = auth;

    /// <summary>Login and receive JWT tokens</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await _auth.LoginAsync(request, ct);
        if (result == null) return Unauthorized(new { message = "Invalid credentials" });
        return Ok(result);
    }

    /// <summary>Rotate access token using a valid refresh token</summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(LoginResponse), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request, CancellationToken ct)
    {
        var result = await _auth.RefreshAsync(request.RefreshToken, ct);
        if (result == null) return Unauthorized(new { message = "Invalid or expired refresh token" });
        return Ok(result);
    }

    /// <summary>Revoke refresh token (logout)</summary>
    [HttpPost("logout")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userId, out var uid))
            await _auth.LogoutAsync(uid, ct);
        return NoContent();
    }
}
