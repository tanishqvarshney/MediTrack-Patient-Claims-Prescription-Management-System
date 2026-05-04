using TanCura.Core.Models;
using TanCura.Core.Enums;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace TanCura.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(TanCuraDbContext context)
    {
        // 1. Seed Insurance Plans
        if (await context.InsurancePlans.CountAsync() < 3)
        {
            var existingNames = await context.InsurancePlans.Select(p => p.PlanName).ToListAsync();
            
            if (!existingNames.Contains("TanCura Gold PPO"))
                context.InsurancePlans.Add(new InsurancePlan { PlanId = Guid.NewGuid(), PlanName = "TanCura Gold PPO", PayerId = "PAYER001", DeductibleAmt = 1500.00m, OopMaxAmt = 5000.00m, EffectiveDate = DateTime.UtcNow.AddYears(-1) });
            
            if (!existingNames.Contains("TanCura Silver HMO"))
                context.InsurancePlans.Add(new InsurancePlan { PlanId = Guid.NewGuid(), PlanName = "TanCura Silver HMO", PayerId = "PAYER002", DeductibleAmt = 3000.00m, OopMaxAmt = 8000.00m, EffectiveDate = DateTime.UtcNow.AddYears(-1) });
            
            if (!existingNames.Contains("BlueCross Basic"))
                context.InsurancePlans.Add(new InsurancePlan { PlanId = Guid.NewGuid(), PlanName = "BlueCross Basic", PayerId = "BCBS001", DeductibleAmt = 500.00m, OopMaxAmt = 3000.00m, EffectiveDate = DateTime.UtcNow.AddYears(-2) });
            
            await context.SaveChangesAsync();
        }

        var plans = await context.InsurancePlans.ToListAsync();
        var goldPlan = plans.FirstOrDefault(p => p.PlanName.Contains("Gold")) ?? plans.First();
        var silverPlan = plans.FirstOrDefault(p => p.PlanName.Contains("Silver")) ?? plans.First();

        // 2. Seed Providers
        var existingNpis = await context.Providers.Select(p => p.NPI).ToListAsync();
        var providersToAdd = new List<Provider>
        {
            new Provider { Name = "City Health Clinic", NPI = "1234567890", Specialty = "General Practice" },
            new Provider { Name = "Metropolitan Hospital", NPI = "9876543210", Specialty = "Emergency Medicine" },
            new Provider { Name = "Sunnyvale Pediatrics", NPI = "5556667777", Specialty = "Pediatrics" },
            new Provider { Name = "Downtown Cardiology", NPI = "1112223333", Specialty = "Cardiology" },
            new Provider { Name = "Pacific Oncology", NPI = "4445556666", Specialty = "Oncology" },
            new Provider { Name = "Westside Orthopedics", NPI = "7778889999", Specialty = "Orthopedics" },
            new Provider { Name = "North Star Neurology", NPI = "2223334444", Specialty = "Neurology" },
            new Provider { Name = "Unity Family Medicine", NPI = "3334445555", Specialty = "Family Medicine" },
            new Provider { Name = "Summit Physical Therapy", NPI = "6667778888", Specialty = "Physical Therapy" },
            new Provider { Name = "Lakeside Dermatology", NPI = "9990001111", Specialty = "Dermatology" },
            new Provider { Name = "Central Valley Urology", NPI = "2221110000", Specialty = "Urology" },
            new Provider { Name = "Coastal ENT", NPI = "5554443333", Specialty = "Otolaryngology" }
        };

        foreach (var p in providersToAdd)
        {
            if (!existingNpis.Contains(p.NPI))
            {
                p.ProviderId = Guid.NewGuid();
                context.Providers.Add(p);
            }
        }
        await context.SaveChangesAsync();

        // 3. Seed Patients
        var existingMembers = await context.Patients.Select(p => p.MemberId).ToListAsync();
        var patientsToAdd = new List<Patient>
        {
            new Patient { FirstName = "John", LastName = "Doe", DateOfBirth = new DateTime(1985, 5, 12), MemberId = "MBR123456", Email = "john.doe@gmail.com", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Jane", LastName = "Smith", DateOfBirth = new DateTime(1990, 8, 22), MemberId = "MBR789012", Email = "jane.smith@yahoo.com", InsurancePlanId = silverPlan.PlanId },
            new Patient { FirstName = "Robert", LastName = "Johnson", DateOfBirth = new DateTime(1975, 1, 30), MemberId = "MBR345678", Email = "robert.j@outlook.com", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Emily", LastName = "Davis", DateOfBirth = new DateTime(1995, 11, 15), MemberId = "MBR901234", Email = "emily.d@gmail.com", InsurancePlanId = silverPlan.PlanId },
            new Patient { FirstName = "Michael", LastName = "Wilson", DateOfBirth = new DateTime(1982, 3, 5), MemberId = "MBR567890", Email = "michael.w@tancura.io", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Sarah", LastName = "Brown", DateOfBirth = new DateTime(1988, 7, 19), MemberId = "MBR112233", Email = "sarah.b@gmail.com", InsurancePlanId = silverPlan.PlanId },
            new Patient { FirstName = "David", LastName = "Miller", DateOfBirth = new DateTime(1965, 12, 2), MemberId = "MBR445566", Email = "david.m@yahoo.com", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Lisa", LastName = "Garcia", DateOfBirth = new DateTime(1992, 4, 10), MemberId = "MBR778899", Email = "lisa.g@outlook.com", InsurancePlanId = silverPlan.PlanId },
            new Patient { FirstName = "Kevin", LastName = "Anderson", DateOfBirth = new DateTime(1980, 9, 25), MemberId = "MBR990011", Email = "kevin.a@gmail.com", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Karen", LastName = "Taylor", DateOfBirth = new DateTime(1972, 6, 14), MemberId = "MBR223344", Email = "karen.t@tancura.io", InsurancePlanId = silverPlan.PlanId },
            new Patient { FirstName = "Steven", LastName = "Wright", DateOfBirth = new DateTime(1984, 2, 28), MemberId = "MBR887766", Email = "s.wright@gmail.com", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Amanda", LastName = "Lee", DateOfBirth = new DateTime(1991, 10, 5), MemberId = "MBR554433", Email = "amanda.lee@yahoo.com", InsurancePlanId = silverPlan.PlanId },
            new Patient { FirstName = "Brian", LastName = "Hall", DateOfBirth = new DateTime(1978, 5, 17), MemberId = "MBR221100", Email = "brian.hall@outlook.com", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Michelle", LastName = "Scott", DateOfBirth = new DateTime(1987, 8, 9), MemberId = "MBR443322", Email = "m.scott@gmail.com", InsurancePlanId = silverPlan.PlanId },
            new Patient { FirstName = "Jason", LastName = "Green", DateOfBirth = new DateTime(1993, 12, 12), MemberId = "MBR665544", Email = "j.green@tancura.io", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Patricia", LastName = "Adams", DateOfBirth = new DateTime(1968, 3, 24), MemberId = "MBR887799", Email = "p.adams@yahoo.com", InsurancePlanId = silverPlan.PlanId },
            new Patient { FirstName = "Gregory", LastName = "Nelson", DateOfBirth = new DateTime(1974, 6, 30), MemberId = "MBR114477", Email = "g.nelson@outlook.com", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Laura", LastName = "King", DateOfBirth = new DateTime(1996, 1, 15), MemberId = "MBR336699", Email = "l.king@gmail.com", InsurancePlanId = silverPlan.PlanId },
            new Patient { FirstName = "Jeffrey", LastName = "Baker", DateOfBirth = new DateTime(1981, 11, 20), MemberId = "MBR558822", Email = "j.baker@tancura.io", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Angela", LastName = "Hill", DateOfBirth = new DateTime(1989, 4, 3), MemberId = "MBR779944", Email = "a.hill@gmail.com", InsurancePlanId = silverPlan.PlanId },
            new Patient { FirstName = "Thomas", LastName = "Clark", DateOfBirth = new DateTime(1977, 9, 12), MemberId = "MBR113355", Email = "t.clark@yahoo.com", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Jessica", LastName = "Lewis", DateOfBirth = new DateTime(1994, 2, 28), MemberId = "MBR662288", Email = "j.lewis@gmail.com", InsurancePlanId = silverPlan.PlanId }
        };

        foreach (var p in patientsToAdd)
        {
            if (!existingMembers.Contains(p.MemberId))
            {
                p.PatientId = Guid.NewGuid();
                context.Patients.Add(p);
            }
        }
        await context.SaveChangesAsync();

        // 4. Seed Users (Refresh to ensure LinkedEntityId is correct)
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("TanCura123!");
        var providersList = await context.Providers.ToListAsync();
        var patientsList = await context.Patients.ToListAsync();
        
        // Remove existing test users to ensure they get the new links
        var testEmails = new[] { "admin@tancura.io", "provider@clinic.com", "patient@example.com", "dr.smith@metrop.com" };
        var existingTestUsers = await context.Users.Where(u => testEmails.Contains(u.Email)).ToListAsync();
        context.Users.RemoveRange(existingTestUsers);
        await context.SaveChangesAsync();

        var usersToAdd = new List<User>
        {
            new User { Email = "admin@tancura.io", PasswordHash = passwordHash, Role = "Admin" },
            new User { Email = "provider@clinic.com", PasswordHash = passwordHash, Role = "Provider", LinkedEntityId = providersList[0].ProviderId },
            new User { Email = "patient@example.com", PasswordHash = passwordHash, Role = "Patient", LinkedEntityId = patientsList[0].PatientId },
            new User { Email = "dr.smith@metrop.com", PasswordHash = passwordHash, Role = "Provider", LinkedEntityId = providersList[1].ProviderId }
        };

        foreach (var u in usersToAdd)
        {
            u.UserId = Guid.NewGuid();
            context.Users.Add(u);
        }
        await context.SaveChangesAsync();

        // 5. Seed Formulary (Expanded)
        var existingNdcs = await context.Formulary.Select(f => f.NDCCode).ToListAsync();
        var formularyToAdd = new List<Formulary>
        {
            new Formulary { NDCCode = "0002-3227-30", DrugName = "Humalog 100units/ml", Tier = 2, Copay = 35.00m, RequiresPriorAuth = false },
            new Formulary { NDCCode = "0006-4112-03", DrugName = "Januvia 100mg", Tier = 3, Copay = 50.00m, RequiresPriorAuth = true },
            new Formulary { NDCCode = "0069-1520-68", DrugName = "Lipitor 20mg", Tier = 1, Copay = 10.00m, RequiresPriorAuth = false },
            new Formulary { NDCCode = "0074-3799-02", DrugName = "Humira 40mg/0.8ml", Tier = 4, Copay = 150.00m, RequiresPriorAuth = true },
            new Formulary { NDCCode = "0009-3475-01", DrugName = "Xanax 0.5mg", Tier = 2, Copay = 25.00m, RequiresPriorAuth = false },
            new Formulary { NDCCode = "0002-4462-30", DrugName = "Cialis 20mg", Tier = 3, Copay = 60.00m, RequiresPriorAuth = true },
            new Formulary { NDCCode = "0009-0013-01", DrugName = "Medrol 4mg", Tier = 1, Copay = 5.00m, RequiresPriorAuth = false },
            new Formulary { NDCCode = "0006-0942-68", DrugName = "Singulair 10mg", Tier = 2, Copay = 20.00m, RequiresPriorAuth = false },
            new Formulary { NDCCode = "0088-2220-33", DrugName = "Lantus SoloStar", Tier = 2, Copay = 40.00m, RequiresPriorAuth = false },
            new Formulary { NDCCode = "54868-0822-0", DrugName = "Amoxicillin 500mg", Tier = 1, Copay = 0.00m, RequiresPriorAuth = false },
            new Formulary { NDCCode = "0007-4112-01", DrugName = "Janumet 50/1000mg", Tier = 3, Copay = 65.00m, RequiresPriorAuth = true },
            new Formulary { NDCCode = "0002-1436-01", DrugName = "Trulicity 0.75mg", Tier = 3, Copay = 80.00m, RequiresPriorAuth = true },
            new Formulary { NDCCode = "0069-4200-30", DrugName = "Viagra 50mg", Tier = 3, Copay = 90.00m, RequiresPriorAuth = true },
            new Formulary { NDCCode = "0009-0452-01", DrugName = "Zoloft 50mg", Tier = 1, Copay = 10.00m, RequiresPriorAuth = false },
            new Formulary { NDCCode = "0006-3843-01", DrugName = "Zocor 20mg", Tier = 1, Copay = 8.00m, RequiresPriorAuth = false },
            new Formulary { NDCCode = "0173-0719-20", DrugName = "Advair Diskus", Tier = 2, Copay = 45.00m, RequiresPriorAuth = false }
        };

        foreach (var f in formularyToAdd)
        {
            if (!existingNdcs.Contains(f.NDCCode))
            {
                f.FormularyId = Guid.NewGuid();
                context.Formulary.Add(f);
            }
        }
        await context.SaveChangesAsync();

        // 6. Seed Claims (Clear and re-seed to ensure fresh data)
        context.ClaimLineItems.RemoveRange(context.ClaimLineItems);
        context.Claims.RemoveRange(context.Claims);
        await context.SaveChangesAsync();

        var p0 = patientsList[0];
        var p1 = patientsList[1];
        var p2 = patientsList[2];
        var p3 = patientsList[3];
        var prov0 = providersList[0];
        var prov1 = providersList[1];
        var prov2 = providersList[2];

        context.Claims.AddRange(
            // --- PAID CLAIMS ---
            new Claim
            {
                ClaimId = Guid.NewGuid(),
                ClaimNumber = "CLM-2024-001",
                PatientId = p0.PatientId,
                ProviderId = prov0.ProviderId,
                ServiceDate = DateTime.UtcNow.AddDays(-30),
                SubmittedDate = DateTime.UtcNow.AddDays(-29),
                TotalAmount = 450.00m,
                Status = ClaimStatus.Paid,
                ProcessedDate = DateTime.UtcNow.AddDays(-25),
                LineItems = new List<ClaimLineItem> { new ClaimLineItem { ProcedureCode = "99214", Quantity = 1, UnitCost = 450.00m } }
            },
            new Claim
            {
                ClaimId = Guid.NewGuid(),
                ClaimNumber = "CLM-2024-002",
                PatientId = p1.PatientId,
                ProviderId = prov1.ProviderId,
                ServiceDate = DateTime.UtcNow.AddDays(-28),
                SubmittedDate = DateTime.UtcNow.AddDays(-27),
                TotalAmount = 1250.00m,
                Status = ClaimStatus.Paid,
                ProcessedDate = DateTime.UtcNow.AddDays(-20),
                LineItems = new List<ClaimLineItem> { new ClaimLineItem { ProcedureCode = "27447", Quantity = 1, UnitCost = 1250.00m } }
            },

            // --- REJECTED CLAIMS ---
            new Claim
            {
                ClaimId = Guid.NewGuid(),
                ClaimNumber = "CLM-2024-ERR-01",
                PatientId = p2.PatientId,
                ProviderId = prov0.ProviderId,
                ServiceDate = DateTime.UtcNow.AddDays(-15),
                SubmittedDate = DateTime.UtcNow.AddDays(-14),
                TotalAmount = 800.00m,
                Status = ClaimStatus.Rejected,
                RejectionReason = "Member eligibility expired",
                ProcessedDate = DateTime.UtcNow.AddDays(-12),
                LineItems = new List<ClaimLineItem> { new ClaimLineItem { ProcedureCode = "70450", Quantity = 1, UnitCost = 800.00m } }
            },

            // --- PROCESSING CLAIMS ---
            new Claim
            {
                ClaimId = Guid.NewGuid(),
                ClaimNumber = "CLM-2024-PRC-01",
                PatientId = p3.PatientId,
                ProviderId = prov2.ProviderId,
                ServiceDate = DateTime.UtcNow.AddDays(-5),
                SubmittedDate = DateTime.UtcNow.AddDays(-4),
                TotalAmount = 150.00m,
                Status = ClaimStatus.Processing,
                LineItems = new List<ClaimLineItem> { new ClaimLineItem { ProcedureCode = "99213", Quantity = 1, UnitCost = 150.00m } }
            },
            new Claim
            {
                ClaimId = Guid.NewGuid(),
                ClaimNumber = "CLM-2024-PRC-02",
                PatientId = p0.PatientId,
                ProviderId = prov1.ProviderId,
                ServiceDate = DateTime.UtcNow.AddDays(-4),
                SubmittedDate = DateTime.UtcNow.AddDays(-3),
                TotalAmount = 300.00m,
                Status = ClaimStatus.Processing,
                LineItems = new List<ClaimLineItem> { new ClaimLineItem { ProcedureCode = "99214", Quantity = 1, UnitCost = 300.00m } }
            },

            // --- PENDING CLAIMS ---
            new Claim
            {
                ClaimId = Guid.NewGuid(),
                ClaimNumber = "CLM-2024-PND-01",
                PatientId = p1.PatientId,
                ProviderId = prov0.ProviderId,
                ServiceDate = DateTime.UtcNow.AddDays(-2),
                SubmittedDate = DateTime.UtcNow.AddDays(-1),
                TotalAmount = 220.00m,
                Status = ClaimStatus.Pending,
                LineItems = new List<ClaimLineItem> { new ClaimLineItem { ProcedureCode = "99213", Quantity = 1, UnitCost = 220.00m } }
            },
            new Claim
            {
                ClaimId = Guid.NewGuid(),
                ClaimNumber = "CLM-2024-PND-02",
                PatientId = p2.PatientId,
                ProviderId = prov2.ProviderId,
                ServiceDate = DateTime.UtcNow.AddDays(-1),
                SubmittedDate = DateTime.UtcNow,
                TotalAmount = 55.00m,
                Status = ClaimStatus.Pending,
                LineItems = new List<ClaimLineItem> { new ClaimLineItem { ProcedureCode = "36415", Quantity = 1, UnitCost = 55.00m } }
            },
            new Claim
            {
                ClaimId = Guid.NewGuid(),
                ClaimNumber = "CLM-2024-PND-03",
                PatientId = p3.PatientId,
                ProviderId = prov1.ProviderId,
                ServiceDate = DateTime.UtcNow.AddDays(-3),
                SubmittedDate = DateTime.UtcNow.AddDays(-2),
                TotalAmount = 1200.00m,
                Status = ClaimStatus.Pending,
                LineItems = new List<ClaimLineItem> { new ClaimLineItem { ProcedureCode = "72141", Quantity = 1, UnitCost = 1200.00m } }
            }
        );
        await context.SaveChangesAsync();

        // 7. Seed Prescriptions
        if (!await context.Prescriptions.AnyAsync())
        {
            context.Prescriptions.AddRange(
                new Prescription
                {
                    PrescriptionId = Guid.NewGuid(),
                    PatientId = p0.PatientId,
                    ProviderId = prov0.ProviderId,
                    DrugCode = "0069-1520-68",
                    DrugName = "Lipitor 20mg",
                    Quantity = 30,
                    DaysSupply = 30,
                    WrittenDate = DateTime.UtcNow.AddDays(-20),
                    FilledDate = DateTime.UtcNow.AddDays(-19),
                    Status = PrescriptionStatus.Filled
                },
                new Prescription
                {
                    PrescriptionId = Guid.NewGuid(),
                    PatientId = p0.PatientId,
                    ProviderId = prov0.ProviderId,
                    DrugCode = "0002-3227-30",
                    DrugName = "Humalog 100units/ml",
                    Quantity = 5,
                    DaysSupply = 30,
                    WrittenDate = DateTime.UtcNow.AddDays(-5),
                    Status = PrescriptionStatus.Pending
                },
                new Prescription
                {
                    PrescriptionId = Guid.NewGuid(),
                    PatientId = p1.PatientId,
                    ProviderId = prov1.ProviderId,
                    DrugCode = "0074-3799-02",
                    DrugName = "Humira 40mg/0.8ml",
                    Quantity = 2,
                    DaysSupply = 28,
                    WrittenDate = DateTime.UtcNow.AddDays(-10),
                    Status = PrescriptionStatus.Approved
                }
            );
            await context.SaveChangesAsync();
        }
    }
}
