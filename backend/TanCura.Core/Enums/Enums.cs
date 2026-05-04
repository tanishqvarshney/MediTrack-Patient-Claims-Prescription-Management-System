namespace TanCura.Core.Enums;

public enum ClaimStatus
{
    Pending = 0,
    Processing = 1,
    Approved = 2,
    Rejected = 3,
    Paid = 4
}

public enum PrescriptionStatus
{
    Pending = 0,
    Approved = 1,
    Denied = 2,
    Filled = 3,
    Cancelled = 4
}

public enum UserRole
{
    Patient = 0,
    Provider = 1,
    Admin = 2
}
