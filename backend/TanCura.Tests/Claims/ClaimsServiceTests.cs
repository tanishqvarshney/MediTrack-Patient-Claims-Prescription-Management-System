using Moq;
using TanCura.Core.DTOs;
using TanCura.Core.Interfaces;
using TanCura.Core.Models;
using TanCura.Infrastructure.Services;

namespace TanCura.Tests.Claims;

public class ClaimsServiceTests
{
    private readonly Mock<IClaimRepository> _claimRepo = new();
    private readonly Mock<IPatientRepository> _patientRepo = new();
    private readonly Mock<IEligibilityService> _eligibility = new();

    private ClaimsService CreateSut() =>
        new(_claimRepo.Object, _patientRepo.Object, _eligibility.Object);

    [Fact]
    public async Task SubmitClaim_WhenEligible_ShouldReturnPendingStatus()
    {
        _eligibility.Setup(e => e.CheckAsync(It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EligibilityResult(true, true, 10000, 9000));
        _claimRepo.Setup(r => r.CountDuplicatesAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<decimal>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);
        _claimRepo.Setup(r => r.GetPatientYearlyTotalAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(500m);
        _claimRepo.Setup(r => r.AddAsync(It.IsAny<Claim>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Claim c, CancellationToken _) => c);

        var sut = CreateSut();
        var result = await sut.SubmitClaimAsync(
            new SubmitClaimRequest(Guid.NewGuid(), Guid.NewGuid(), DateTime.Today, 250m,
                [new("99213", "J06.9", 1, 250m)]),
            "user-123");

        Assert.Equal("Pending", result.Status);
        Assert.True(result.ValidationResults.IsValid);
        Assert.True(result.ValidationResults.EligibilityPassed);
        Assert.False(result.ValidationResults.DuplicateFound);
    }

    [Fact]
    public async Task SubmitClaim_WhenIneligible_ShouldReturnRejectedStatus()
    {
        _eligibility.Setup(e => e.CheckAsync(It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EligibilityResult(false, false, 0, 0));
        _claimRepo.Setup(r => r.CountDuplicatesAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<decimal>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);
        _claimRepo.Setup(r => r.GetPatientYearlyTotalAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(0m);
        _claimRepo.Setup(r => r.AddAsync(It.IsAny<Claim>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Claim c, CancellationToken _) => c);

        var sut = CreateSut();
        var result = await sut.SubmitClaimAsync(
            new SubmitClaimRequest(Guid.NewGuid(), Guid.NewGuid(), DateTime.Today, 100m,
                [new("99213", null, 1, 100m)]),
            "user-123");

        Assert.Equal("Rejected", result.Status);
        Assert.False(result.ValidationResults.IsValid);
        Assert.False(result.ValidationResults.EligibilityPassed);
    }

    [Fact]
    public async Task SubmitClaim_WhenDuplicateExists_ShouldFail()
    {
        _eligibility.Setup(e => e.CheckAsync(It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EligibilityResult(true, true, 10000, 9000));
        _claimRepo.Setup(r => r.CountDuplicatesAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<decimal>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(1); // duplicate found
        _claimRepo.Setup(r => r.GetPatientYearlyTotalAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(0m);
        _claimRepo.Setup(r => r.AddAsync(It.IsAny<Claim>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Claim c, CancellationToken _) => c);

        var sut = CreateSut();
        var result = await sut.SubmitClaimAsync(
            new SubmitClaimRequest(Guid.NewGuid(), Guid.NewGuid(), DateTime.Today, 300m,
                [new("99213", null, 1, 300m)]),
            "user-123");

        Assert.True(result.ValidationResults.DuplicateFound);
        Assert.Equal("Rejected", result.Status);
    }

    [Fact]
    public async Task SubmitClaim_WhenCoverageLimitExceeded_ShouldFail()
    {
        _eligibility.Setup(e => e.CheckAsync(It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EligibilityResult(true, true, 1000, 100)); // OopMax=1000
        _claimRepo.Setup(r => r.CountDuplicatesAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<decimal>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);
        _claimRepo.Setup(r => r.GetPatientYearlyTotalAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(950m); // 950 + 200 > 1000
        _claimRepo.Setup(r => r.AddAsync(It.IsAny<Claim>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Claim c, CancellationToken _) => c);

        var sut = CreateSut();
        var result = await sut.SubmitClaimAsync(
            new SubmitClaimRequest(Guid.NewGuid(), Guid.NewGuid(), DateTime.Today, 200m,
                [new("99213", null, 1, 200m)]),
            "user-123");

        Assert.False(result.ValidationResults.CoverageLimitPassed);
        Assert.Equal("Rejected", result.Status);
    }
}
