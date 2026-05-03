using MediTrack.Core.Enums;

namespace MediTrack.Core.Models;
public class Claim
{
    public Guid ClaimId { get; set; }
    public string ClaimNumber { get; set; } = string.Empty;
    public Guid PatientId { get; set; }
    public Guid ProviderId { get; set; }
    public DateTime ServiceDate { get; set; }
    public DateTime SubmittedDate { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }
    public ClaimStatus Status { get; set; } = ClaimStatus.Pending;
    public string? RejectionReason { get; set; }
    public DateTime? ProcessedDate { get; set; }

    // Navigation
    public Patient? Patient { get; set; }
    public Provider? Provider { get; set; }
    public ICollection<ClaimLineItem> LineItems { get; set; } = new List<ClaimLineItem>();
}

public class ClaimLineItem
{
    public Guid LineItemId { get; set; }
    public Guid ClaimId { get; set; }
    public string ProcedureCode { get; set; } = string.Empty;
    public string? DiagnosisCode { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal UnitCost { get; set; }
    public decimal LineTotal => Quantity * UnitCost;

    public Claim? Claim { get; set; }
}
