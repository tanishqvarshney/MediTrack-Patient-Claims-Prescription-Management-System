using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using TanCura.Core.Interfaces;

namespace TanCura.Infrastructure.Services;

/// <summary>
/// Mock payer API client. In production, replace with real payer endpoint + OAuth2 client credentials.
/// </summary>
public class MockPayerApiClient : IPayerApiClient
{
    private readonly HttpClient _http;
    private readonly ILogger<MockPayerApiClient> _logger;

    public MockPayerApiClient(HttpClient http, ILogger<MockPayerApiClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<PayerAdjudicationResponse> AdjudicateAsync(
        PayerAdjudicationRequest request, CancellationToken ct = default)
    {
        try
        {
            // In real implementation: POST to payer API endpoint
            // var response = await _http.PostAsJsonAsync("/adjudicate", request, ct);
            // return await response.Content.ReadFromJsonAsync<PayerAdjudicationResponse>(ct);

            // Mock: approve 85% of claims
            await Task.Delay(Random.Shared.Next(100, 500), ct);
            bool approved = Random.Shared.NextDouble() > 0.15;
            string? denial = approved ? null : new[] {
                "Service not covered", "Prior auth required", "Benefit limit reached"
            }[Random.Shared.Next(3)];

            return new PayerAdjudicationResponse(approved, denial, approved ? request.Amount : 0);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Payer API call failed for claim {ClaimNumber}", request.ClaimNumber);
            throw;
        }
    }
}

public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;
    public NotificationService(ILogger<NotificationService> logger) => _logger = logger;

    public Task SendClaimStatusUpdateAsync(
        string email, string claimNumber, string status, CancellationToken ct = default)
    {
        // In production: integrate with SendGrid / Azure Communication Services
        _logger.LogInformation(
            "NOTIFICATION → {Email} | Claim {ClaimNumber} status: {Status}",
            email, claimNumber, status);
        return Task.CompletedTask;
    }
}
