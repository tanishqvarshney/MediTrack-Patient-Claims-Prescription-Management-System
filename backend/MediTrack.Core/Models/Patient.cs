namespace MediTrack.Core.Models;

public class Patient
{
    public Guid PatientId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public DateTime DateOfBirth { get; set; }
    public string MemberId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Guid InsurancePlanId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public InsurancePlan? InsurancePlan { get; set; }
    public ICollection<Claim> Claims { get; set; } = new List<Claim>();
    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
}

public class Provider
{
    public Guid ProviderId { get; set; }
    public string NPI { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Specialty { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Claim> Claims { get; set; } = new List<Claim>();
}

public class InsurancePlan
{
    public Guid PlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string PayerId { get; set; } = string.Empty;
    public decimal? DeductibleAmt { get; set; }
    public decimal? OopMaxAmt { get; set; }
    public DateTime EffectiveDate { get; set; }
    public DateTime? TerminationDate { get; set; }
    public bool IsActive => TerminationDate == null || TerminationDate > DateTime.UtcNow;
}
