using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MediTrack.Core.DTOs;
using MediTrack.Infrastructure.Data;
using MediTrack.Core.Models;
using BCrypt.Net;

namespace MediTrack.Tests.Claims;

/// <summary>
/// End-to-end integration tests using WebApplicationFactory + in-memory DB.
/// Tests the full HTTP pipeline: routing → controller → service → DB.
/// </summary>
public class ClaimsApiIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public ClaimsApiIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    // ─── Auth ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task Login_WithValidCredentials_Returns200AndTokens()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login",
            new LoginRequest("admin@test.com", "Password123!"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.NotNull(body?.AccessToken);
        Assert.NotEmpty(body!.AccessToken);
        Assert.Equal("Admin", body.Role);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login",
            new LoginRequest("admin@test.com", "WrongPassword"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ─── Claims — Unauthenticated ───────────────────────────────────────────

    [Fact]
    public async Task SubmitClaim_WithoutToken_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/claims",
            new { patientId = Guid.NewGuid(), totalAmount = 100 });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetClaims_WithoutToken_Returns401()
    {
        var response = await _client.GetAsync("/api/v1/claims");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ─── Claims — Authenticated as Provider ────────────────────────────────

    [Fact]
    public async Task SubmitClaim_AsProvider_WithValidData_Returns201()
    {
        var token = await GetTokenAsync("provider@test.com", "Password123!");
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MediTrackDbContext>();
        var (patientId, providerId) = await SeedClaimPrerequisitesAsync(db);

        var response = await _client.PostAsJsonAsync("/api/v1/claims", new
        {
            patientId,
            providerId,
            serviceDate = DateTime.Today.ToString("yyyy-MM-dd"),
            totalAmount = 250.00,
            lineItems = new[]
            {
                new { procedureCode = "99213", diagnosisCode = "J06.9", quantity = 1, unitCost = 250.00 }
            }
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<SubmitClaimResponse>();
        Assert.NotNull(body);
        Assert.StartsWith("CLM-", body!.ClaimNumber);
        Assert.NotNull(body.ValidationResults);
    }

    [Fact]
    public async Task GetClaimsList_AsPatient_Returns403()
    {
        // The list endpoint is Admin-only; Patient should get Forbidden
        var token = await GetTokenAsync("patient@test.com", "Password123!");
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/v1/claims");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetClaimById_AsAdmin_Returns200OrNotFound()
    {
        var token = await GetTokenAsync("admin@test.com", "Password123!");
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Non-existent claim
        var response = await _client.GetAsync($"/api/v1/claims/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ─── Pharmacy ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetFormulary_WithKnownNDC_Returns200()
    {
        var token = await GetTokenAsync("admin@test.com", "Password123!");
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/v1/pharmacy/formulary/00003-0894-21");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<FormularyResult>();
        Assert.NotNull(body);
        Assert.Contains("Metformin", body!.DrugName);
    }

    [Fact]
    public async Task GetFormulary_WithUnknownNDC_Returns404()
    {
        var token = await GetTokenAsync("admin@test.com", "Password123!");
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/v1/pharmacy/formulary/INVALID-NDC-CODE");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private async Task<string> GetTokenAsync(string email, string password)
    {
        // Temporarily clear existing auth header
        _client.DefaultRequestHeaders.Authorization = null;
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login",
            new LoginRequest(email, password));
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();
        return body!.AccessToken;
    }

    private static async Task<(Guid patientId, Guid providerId)> SeedClaimPrerequisitesAsync(
        MediTrackDbContext db)
    {
        var plan = new InsurancePlan
        {
            PlanId = Guid.NewGuid(), PlanName = "Test Plan",
            PayerId = "TEST", OopMaxAmt = 10000, DeductibleAmt = 500,
            EffectiveDate = DateTime.Today.AddYears(-1)
        };
        await db.InsurancePlans.AddAsync(plan);

        var patient = new Patient
        {
            PatientId = Guid.NewGuid(), FirstName = "John", LastName = "Test",
            DateOfBirth = new DateTime(1985, 6, 15), MemberId = $"MBR-{Guid.NewGuid():N}",
            Email = "john.test@example.com", InsurancePlanId = plan.PlanId, IsActive = true,
            InsurancePlan = plan
        };
        await db.Patients.AddAsync(patient);

        var provider = new Provider
        {
            ProviderId = Guid.NewGuid(), NPI = $"NPI{Random.Shared.Next(1000000, 9999999)}",
            Name = "Test Clinic", Specialty = "General", IsActive = true
        };
        await db.Providers.AddAsync(provider);
        await db.SaveChangesAsync();

        return (patient.PatientId, provider.ProviderId);
    }
}

/// <summary>
/// Custom factory: replaces SQL Server with in-memory DB and seeds test users.
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove real SQL Server DbContext
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<MediTrackDbContext>));
            if (descriptor != null) services.Remove(descriptor);

            // Add in-memory DB
            services.AddDbContext<MediTrackDbContext>(options =>
                options.UseInMemoryDatabase("MediTrackTestDb_" + Guid.NewGuid()));

            // Seed test data
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<MediTrackDbContext>();
            db.Database.EnsureCreated();
            SeedTestData(db);
        });

        builder.UseEnvironment("Testing");
    }

    private static void SeedTestData(MediTrackDbContext db)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

        db.Users.AddRange(
            new User { UserId = Guid.NewGuid(), Email = "admin@test.com",    PasswordHash = passwordHash, Role = "Admin",    IsActive = true },
            new User { UserId = Guid.NewGuid(), Email = "provider@test.com", PasswordHash = passwordHash, Role = "Provider", IsActive = true },
            new User { UserId = Guid.NewGuid(), Email = "patient@test.com",  PasswordHash = passwordHash, Role = "Patient",  IsActive = true }
        );

        db.Formulary.AddRange(
            new Formulary { FormularyId = Guid.NewGuid(), NDCCode = "00003-0894-21", DrugName = "Metformin 500mg", Tier = 1, Copay = 5m, IsActive = true },
            new Formulary { FormularyId = Guid.NewGuid(), NDCCode = "00071-0155-23", DrugName = "Lipitor 20mg",   Tier = 2, Copay = 35m, IsActive = true }
        );

        db.SaveChanges();
    }
}
