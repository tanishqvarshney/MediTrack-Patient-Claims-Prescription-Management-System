using Microsoft.EntityFrameworkCore;
using TanCura.Core.Models;

namespace TanCura.Infrastructure.Data;

public class TanCuraDbContext : DbContext
{
    public TanCuraDbContext(DbContextOptions<TanCuraDbContext> options) : base(options) { }

    public DbSet<Claim> Claims => Set<Claim>();
    public DbSet<ClaimLineItem> ClaimLineItems => Set<ClaimLineItem>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Provider> Providers => Set<Provider>();
    public DbSet<InsurancePlan> InsurancePlans => Set<InsurancePlan>();
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<Formulary> Formulary => Set<Formulary>();
    public DbSet<User> Users => Set<User>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ---- Claim ----
        modelBuilder.Entity<Claim>(e =>
        {
            e.HasKey(c => c.ClaimId);
            e.Property(c => c.ClaimId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(c => c.ClaimNumber).HasMaxLength(50).IsRequired();
            e.HasIndex(c => c.ClaimNumber).IsUnique();
            e.Property(c => c.TotalAmount).HasColumnType("decimal(12,2)");
            e.Property(c => c.Status).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(c => c.Status);
            e.HasIndex(c => c.PatientId);
            e.HasIndex(c => c.SubmittedDate);
            e.HasOne(c => c.Patient).WithMany(p => p.Claims).HasForeignKey(c => c.PatientId);
            e.HasOne(c => c.Provider).WithMany(p => p.Claims).HasForeignKey(c => c.ProviderId);
        });

        // ---- ClaimLineItem ----
        modelBuilder.Entity<ClaimLineItem>(e =>
        {
            e.HasKey(li => li.LineItemId);
            e.Property(li => li.LineItemId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(li => li.ProcedureCode).HasMaxLength(10).IsRequired();
            e.Property(li => li.UnitCost).HasColumnType("decimal(10,2)");
            e.Ignore(li => li.LineTotal); // computed client-side
            e.HasOne(li => li.Claim).WithMany(c => c.LineItems).HasForeignKey(li => li.ClaimId);
        });

        // ---- Patient ----
        modelBuilder.Entity<Patient>(e =>
        {
            e.HasKey(p => p.PatientId);
            e.Property(p => p.PatientId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(p => p.MemberId).HasMaxLength(50).IsRequired();
            e.HasIndex(p => p.MemberId).IsUnique();
            e.Ignore(p => p.FullName);
        });

        // ---- Formulary ----
        modelBuilder.Entity<Formulary>(e =>
        {
            e.HasKey(f => f.FormularyId);
            e.Property(f => f.FormularyId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(f => f.NDCCode).HasMaxLength(20).IsRequired();
            e.HasIndex(f => f.NDCCode).IsUnique();
            e.Property(f => f.Copay).HasColumnType("decimal(8,2)");
            e.Ignore(f => f.TierLabel);
        });

        // ---- User ----
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.UserId);
            e.Property(u => u.UserId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(u => u.Email).HasMaxLength(256).IsRequired();
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasMaxLength(20).IsRequired();
        });

        // ---- AuditLog ----
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasKey(a => a.LogId);
            e.Property(a => a.EntityType).HasMaxLength(50).IsRequired();
            e.Property(a => a.Action).HasMaxLength(50).IsRequired();
            e.HasIndex(a => a.EntityId);
            e.HasIndex(a => a.Timestamp);
        });

        // ---- Provider ----
        modelBuilder.Entity<Provider>(e =>
        {
            e.HasKey(p => p.ProviderId);
            e.Property(p => p.ProviderId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(p => p.NPI).HasMaxLength(10).IsRequired();
            e.HasIndex(p => p.NPI).IsUnique();
        });

        // ---- InsurancePlan ----
        modelBuilder.Entity<InsurancePlan>(e =>
        {
            e.HasKey(p => p.PlanId);
            e.Property(p => p.PlanId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(p => p.PlanName).HasMaxLength(100).IsRequired();
            e.Property(p => p.PayerId).HasMaxLength(20).IsRequired();
            e.Property(p => p.DeductibleAmt).HasColumnType("decimal(10,2)");
            e.Property(p => p.OopMaxAmt).HasColumnType("decimal(10,2)");
        });

        // ---- Prescription ----
        modelBuilder.Entity<Prescription>(e =>
        {
            e.HasKey(p => p.PrescriptionId);
            e.Property(p => p.PrescriptionId).HasDefaultValueSql("NEWSEQUENTIALID()");
            e.Property(p => p.DrugCode).HasMaxLength(20).IsRequired();
            e.Property(p => p.DrugName).HasMaxLength(100).IsRequired();
            e.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);
        });
    }
}
