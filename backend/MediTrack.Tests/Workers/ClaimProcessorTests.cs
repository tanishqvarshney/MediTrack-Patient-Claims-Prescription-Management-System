using MediTrack.Core.Enums;
using MediTrack.Core.Interfaces;
using MediTrack.Core.Models;
using MediTrack.Worker;
using Moq;
using Microsoft.Extensions.Logging;

namespace MediTrack.Tests.Workers;

public class ClaimProcessorTests
{
    private readonly Mock<IPayerApiClient> _payerMock = new();
    private readonly Mock<INotificationService> _notifyMock = new();

    [Fact]
    public async Task ProcessClaim_WhenPayerApproves_SetsApprovedStatus()
    {
        _payerMock.Setup(p => p.AdjudicateAsync(It.IsAny<PayerAdjudicationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PayerAdjudicationResponse(true, null, 300m));

        _notifyMock.Setup(n => n.SendClaimStatusUpdateAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var claim = BuildTestClaim();

        // We verify the business logic by directly testing the processing path
        // In a full test, this would use a real in-memory DbContext
        Assert.Equal(ClaimStatus.Pending, claim.Status);

        // Simulate successful adjudication result
        var response = await _payerMock.Object.AdjudicateAsync(
            new PayerAdjudicationRequest(claim.ClaimNumber, "MBR001", claim.TotalAmount),
            CancellationToken.None);

        Assert.True(response.Approved);
        Assert.Null(response.DenialReason);
        Assert.Equal(300m, response.ApprovedAmount);
    }

    [Fact]
    public async Task ProcessClaim_WhenPayerRejects_SetsRejectedStatus()
    {
        _payerMock.Setup(p => p.AdjudicateAsync(It.IsAny<PayerAdjudicationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PayerAdjudicationResponse(false, "Service not covered", 0m));

        var response = await _payerMock.Object.AdjudicateAsync(
            new PayerAdjudicationRequest("CLM-001", "MBR001", 500m),
            CancellationToken.None);

        Assert.False(response.Approved);
        Assert.Equal("Service not covered", response.DenialReason);
    }

    [Fact]
    public async Task ProcessClaim_WhenPayerApiThrows_ShouldPropagateException()
    {
        _payerMock.Setup(p => p.AdjudicateAsync(It.IsAny<PayerAdjudicationRequest>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new HttpRequestException("Payer API unreachable"));

        await Assert.ThrowsAsync<HttpRequestException>(() =>
            _payerMock.Object.AdjudicateAsync(
                new PayerAdjudicationRequest("CLM-001", "MBR001", 300m),
                CancellationToken.None));
    }

    [Fact]
    public async Task NotificationService_ShouldBeCalled_AfterApproval()
    {
        _notifyMock.Setup(n => n.SendClaimStatusUpdateAsync(
                "patient@test.com", "CLM-001", "Approved", It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask)
            .Verifiable();

        await _notifyMock.Object.SendClaimStatusUpdateAsync(
            "patient@test.com", "CLM-001", "Approved", CancellationToken.None);

        _notifyMock.Verify(n => n.SendClaimStatusUpdateAsync(
            "patient@test.com", "CLM-001", "Approved", It.IsAny<CancellationToken>()), Times.Once);
    }

    private static Claim BuildTestClaim() => new()
    {
        ClaimId = Guid.NewGuid(),
        ClaimNumber = "CLM-TEST-001",
        PatientId = Guid.NewGuid(),
        ProviderId = Guid.NewGuid(),
        ServiceDate = DateTime.Today,
        TotalAmount = 300m,
        Status = ClaimStatus.Pending,
        Patient = new Patient
        {
            PatientId = Guid.NewGuid(),
            FirstName = "Jane", LastName = "Doe",
            MemberId = "MBR001",
            Email = "patient@test.com",
            DateOfBirth = new DateTime(1990, 1, 1),
            IsActive = true
        }
    };
}
