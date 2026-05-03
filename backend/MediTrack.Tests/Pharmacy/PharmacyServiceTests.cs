using MediTrack.Core.DTOs;
using MediTrack.Core.Interfaces;
using MediTrack.Core.Models;
using MediTrack.Infrastructure.Services;
using Moq;

namespace MediTrack.Tests.Pharmacy;

public class PharmacyServiceTests
{
    private readonly Mock<IFormularyRepository> _formularyMock = new();

    private PharmacyService CreateSut() => new(_formularyMock.Object);

    [Fact]
    public async Task GetFormularyAsync_WithKnownNDC_ReturnsFormularyResult()
    {
        var drug = new Formulary
        {
            FormularyId = Guid.NewGuid(),
            NDCCode = "00071-0155-23",
            DrugName = "Lipitor 20mg",
            Tier = 2,
            Copay = 35m,
            RequiresPriorAuth = false,
            CoverageLimit = 365,
            IsActive = true
        };

        _formularyMock.Setup(f => f.GetByNDCCodeAsync("00071-0155-23", It.IsAny<CancellationToken>()))
            .ReturnsAsync(drug);
        _formularyMock.Setup(f => f.GetAlternativesAsync(2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Formulary>
            {
                new() { NDCCode = "00093-0058-01", DrugName = "Atorvastatin 20mg", Tier = 1, Copay = 10m }
            });

        var sut = CreateSut();
        var result = await sut.GetFormularyAsync("00071-0155-23");

        Assert.NotNull(result);
        Assert.Equal("Lipitor 20mg", result!.DrugName);
        Assert.Equal(2, result.Tier);
        Assert.Equal("Preferred Brand", result.TierLabel);
        Assert.Equal(35m, result.Copay);
        Assert.False(result.RequiresPriorAuth);
        Assert.Single(result.Alternatives);
        Assert.Equal("Atorvastatin 20mg", result.Alternatives[0].DrugName);
    }

    [Fact]
    public async Task GetFormularyAsync_WithUnknownNDC_ReturnsNull()
    {
        _formularyMock.Setup(f => f.GetByNDCCodeAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Formulary?)null);

        var sut = CreateSut();
        var result = await sut.GetFormularyAsync("UNKNOWN-CODE");

        Assert.Null(result);
    }

    [Fact]
    public async Task SubmitPrescriptionAsync_WhenDrugRequiresPriorAuth_StatusShouldBePendingAuth()
    {
        _formularyMock.Setup(f => f.GetByNDCCodeAsync("00002-7516-80", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Formulary
            {
                NDCCode = "00002-7516-80",
                DrugName = "Humira 40mg",
                Tier = 4,
                Copay = 150m,
                RequiresPriorAuth = true,
                IsActive = true
            });

        var sut = CreateSut();
        var result = await sut.SubmitPrescriptionAsync(new SubmitPrescriptionRequest(
            Guid.NewGuid(), Guid.NewGuid(),
            "00002-7516-80", "Humira 40mg", 2, 28, DateTime.Today));

        Assert.True(result.RequiresPriorAuth);
        Assert.Equal("PendingAuth", result.Status);
    }

    [Fact]
    public async Task SubmitPrescriptionAsync_WhenNoPriorAuthNeeded_StatusShouldBeApproved()
    {
        _formularyMock.Setup(f => f.GetByNDCCodeAsync("00003-0894-21", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Formulary
            {
                NDCCode = "00003-0894-21",
                DrugName = "Metformin 500mg",
                Tier = 1,
                Copay = 5m,
                RequiresPriorAuth = false,
                IsActive = true
            });

        var sut = CreateSut();
        var result = await sut.SubmitPrescriptionAsync(new SubmitPrescriptionRequest(
            Guid.NewGuid(), Guid.NewGuid(),
            "00003-0894-21", "Metformin 500mg", 90, 90, DateTime.Today));

        Assert.False(result.RequiresPriorAuth);
        Assert.Equal("Approved", result.Status);
    }
}
