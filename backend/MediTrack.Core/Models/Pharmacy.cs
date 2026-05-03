using MediTrack.Core.Enums;

namespace MediTrack.Core.Models;
public class Prescription
{
    public Guid PrescriptionId { get; set; }
    public Guid PatientId { get; set; }
    public Guid ProviderId { get; set; }
    public string DrugCode { get; set; } = string.Empty;   // NDC Code
    public string DrugName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int DaysSupply { get; set; }
    public DateTime WrittenDate { get; set; }
    public DateTime? FilledDate { get; set; }
    public PrescriptionStatus Status { get; set; } = PrescriptionStatus.Pending;

    public Patient? Patient { get; set; }
    public Provider? Provider { get; set; }
}

public class Formulary
{
    public Guid FormularyId { get; set; }
    public string NDCCode { get; set; } = string.Empty;
    public string DrugName { get; set; } = string.Empty;
    public int Tier { get; set; }
    public string TierLabel => Tier switch
    {
        1 => "Generic",
        2 => "Preferred Brand",
        3 => "Non-Preferred Brand",
        4 => "Specialty",
        _ => "Unknown"
    };
    public decimal Copay { get; set; }
    public bool RequiresPriorAuth { get; set; }
    public int? CoverageLimit { get; set; }  // days per year
    public bool IsActive { get; set; } = true;
}

public class User
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;        // Patient | Provider | Admin
    public Guid? LinkedEntityId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
}

public class AuditLog
{
    public long LogId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
