using MediTrack.Core.Models;
using MediTrack.Core.Enums;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace MediTrack.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(MediTrackDbContext context)
    {
        // 1. Seed Insurance Plans
        if (await context.InsurancePlans.CountAsync() < 3)
        {
            var existingNames = await context.InsurancePlans.Select(p => p.PlanName).ToListAsync();
            
            if (!existingNames.Contains("MediTrack Gold PPO"))
                context.InsurancePlans.Add(new InsurancePlan { PlanId = Guid.NewGuid(), PlanName = "MediTrack Gold PPO", PayerId = "PAYER001", DeductibleAmt = 1500.00m, OopMaxAmt = 5000.00m, EffectiveDate = DateTime.UtcNow.AddYears(-1) });
            
            if (!existingNames.Contains("MediTrack Silver HMO"))
                context.InsurancePlans.Add(new InsurancePlan { PlanId = Guid.NewGuid(), PlanName = "MediTrack Silver HMO", PayerId = "PAYER002", DeductibleAmt = 3000.00m, OopMaxAmt = 8000.00m, EffectiveDate = DateTime.UtcNow.AddYears(-1) });
            
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
            new Provider { Name = "North Star Neurology", NPI = "2223334444", Specialty = "Neurology" }
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
            new Patient { FirstName = "Michael", LastName = "Wilson", DateOfBirth = new DateTime(1982, 3, 5), MemberId = "MBR567890", Email = "michael.w@meditrack.io", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Sarah", LastName = "Brown", DateOfBirth = new DateTime(1988, 7, 19), MemberId = "MBR112233", Email = "sarah.b@gmail.com", InsurancePlanId = silverPlan.PlanId },
            new Patient { FirstName = "David", LastName = "Miller", DateOfBirth = new DateTime(1965, 12, 2), MemberId = "MBR445566", Email = "david.m@yahoo.com", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Lisa", LastName = "Garcia", DateOfBirth = new DateTime(1992, 4, 10), MemberId = "MBR778899", Email = "lisa.g@outlook.com", InsurancePlanId = silverPlan.PlanId },
            new Patient { FirstName = "Kevin", LastName = "Anderson", DateOfBirth = new DateTime(1980, 9, 25), MemberId = "MBR990011", Email = "kevin.a@gmail.com", InsurancePlanId = goldPlan.PlanId },
            new Patient { FirstName = "Karen", LastName = "Taylor", DateOfBirth = new DateTime(1972, 6, 14), MemberId = "MBR223344", Email = "karen.t@meditrack.io", InsurancePlanId = silverPlan.PlanId }
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

        // 4. Seed Users
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
        var providers = await context.Providers.ToListAsync();
        var patients = await context.Patients.ToListAsync();
        var existingEmails = await context.Users.Select(u => u.Email).ToListAsync();

        var usersToAdd = new List<User>
        {
            new User { Email = "admin@meditrack.io", PasswordHash = passwordHash, Role = "Admin" },
            new User { Email = "provider@clinic.com", PasswordHash = passwordHash, Role = "Provider", LinkedEntityId = providers[0].ProviderId },
            new User { Email = "patient@example.com", PasswordHash = passwordHash, Role = "Patient", LinkedEntityId = patients[0].PatientId },
            new User { Email = "dr.smith@metrop.com", PasswordHash = passwordHash, Role = "Provider", LinkedEntityId = providers[1].ProviderId }
        };

        foreach (var u in usersToAdd)
        {
            if (!existingEmails.Contains(u.Email))
            {
                u.UserId = Guid.NewGuid();
                context.Users.Add(u);
            }
        }
        await context.SaveChangesAsync();

        // 5. Seed Formulary
        var existingNdcs = await context.Formulary.Select(f => f.NDCCode).ToListAsync();
        var formularyToAdd = new List<Formulary>
        {
            new Formulary { NDCCode = "0002-3227-30", DrugName = "Humalog 100units/ml", Tier = 2, Copay = 35.00m, RequiresPriorAuth = false },
            new Formulary { NDCCode = "0006-4112-03", DrugName = "Januvia 100mg", Tier = 3, Copay = 50.00m, RequiresPriorAuth = true },
            new Formulary { NDCCode = "0069-1520-68", DrugName = "Lipitor 20mg", Tier = 1, Copay = 10.00m, RequiresPriorAuth = false },
            new Formulary { NDCCode = "0074-3799-02", DrugName = "Humira 40mg/0.8ml", Tier = 4, Copay = 150.00m, RequiresPriorAuth = true },
            new Formulary { NDCCode = "0009-3475-01", DrugName = "Xanax 0.5mg", Tier = 2, Copay = 25.00m, RequiresPriorAuth = false },
            new Formulary { NDCCode = "0002-4462-30", DrugName = "Cialis 20mg", Tier = 3, Copay = 60.00m, RequiresPriorAuth = true }
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

        // 6. Seed Claims
        if (!await context.Claims.AnyAsync())
        {
            context.Claims.AddRange(
                new Claim
                {
                    ClaimId = Guid.NewGuid(),
                    ClaimNumber = "CLM" + DateTime.UtcNow.Ticks.ToString().Substring(10),
                    PatientId = patients[0].PatientId,
                    ProviderId = providers[0].ProviderId,
                    ServiceDate = DateTime.UtcNow.AddDays(-5),
                    SubmittedDate = DateTime.UtcNow.AddDays(-4),
                    TotalAmount = 250.00m,
                    Status = ClaimStatus.Approved,
                    LineItems = new List<ClaimLineItem> { new ClaimLineItem { ProcedureCode = "99213", Quantity = 1, UnitCost = 250.00m } }
                },
                new Claim
                {
                    ClaimId = Guid.NewGuid(),
                    ClaimNumber = "CLM" + (DateTime.UtcNow.Ticks + 1).ToString().Substring(10),
                    PatientId = patients[1].PatientId,
                    ProviderId = providers[1].ProviderId,
                    ServiceDate = DateTime.UtcNow.AddDays(-10),
                    SubmittedDate = DateTime.UtcNow.AddDays(-9),
                    TotalAmount = 1500.00m,
                    Status = ClaimStatus.Pending,
                    LineItems = new List<ClaimLineItem> { new ClaimLineItem { ProcedureCode = "Q0144", Quantity = 1, UnitCost = 1500.00m } }
                }
            );
            await context.SaveChangesAsync();
        }
    }
}
