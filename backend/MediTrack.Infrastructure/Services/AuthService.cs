using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MediTrack.Core.DTOs;
using MediTrack.Core.Interfaces;
using MediTrack.Core.Models;

namespace MediTrack.Infrastructure.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;
    public TokenService(IConfiguration config) => _config = config;

    public string GenerateAccessToken(User user)
    {
        var claims = new[]
        {
            new System.Security.Claims.Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new System.Security.Claims.Claim(ClaimTypes.Email, user.Email),
            new System.Security.Claims.Claim(ClaimTypes.Role, user.Role),
            new System.Security.Claims.Claim("linked_entity", user.LinkedEntityId?.ToString() ?? "")
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: "meditrack-api",
            audience: "meditrack-client",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
}

public class AuthService
{
    private readonly IUserRepository _users;
    private readonly ITokenService _tokens;

    public AuthService(IUserRepository users, ITokenService tokens)
    {
        _users = users;
        _tokens = tokens;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _users.GetByEmailAsync(request.Email, ct);
        if (user == null || string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var accessToken = _tokens.GenerateAccessToken(user);
        var refreshToken = _tokens.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        user.LastLoginAt = DateTime.UtcNow;
        await _users.UpdateAsync(user, ct);

        return new LoginResponse(accessToken, refreshToken, 900, user.Role, user.UserId);
    }

    public async Task<LoginResponse?> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var user = await _users.GetByRefreshTokenAsync(refreshToken, ct);
        if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
            return null;

        var newAccess = _tokens.GenerateAccessToken(user);
        var newRefresh = _tokens.GenerateRefreshToken();

        user.RefreshToken = newRefresh;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _users.UpdateAsync(user, ct);

        return new LoginResponse(newAccess, newRefresh, 900, user.Role, user.UserId);
    }

    public async Task LogoutAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct);
        if (user == null) return;
        user.RefreshToken = null;
        user.RefreshTokenExpiry = null;
        await _users.UpdateAsync(user, ct);
    }
}
