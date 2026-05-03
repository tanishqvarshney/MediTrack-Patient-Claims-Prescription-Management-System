-- =============================================================
-- MediTrack Database Initialization Script
-- Run once against an empty SQL Server database
-- =============================================================

USE master;
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'MediTrack')
    CREATE DATABASE MediTrack;
GO
USE MediTrack;
GO

-- ─── Seed Insurance Plans ─────────────────────────────────────
INSERT INTO InsurancePlans (PlanId, PlanName, PayerId, DeductibleAmt, OopMaxAmt, EffectiveDate)
VALUES
    ('A0000001-0000-0000-0000-000000000001', 'BlueCross Gold', 'BC001', 500.00, 5000.00, '2026-01-01'),
    ('A0000001-0000-0000-0000-000000000002', 'Aetna Silver', 'AET001', 1000.00, 7500.00, '2026-01-01'),
    ('A0000001-0000-0000-0000-000000000003', 'United PPO', 'UHC001', 750.00, 6000.00, '2026-01-01');

-- ─── Seed Formulary ───────────────────────────────────────────
INSERT INTO Formulary (FormularyId, NDCCode, DrugName, Tier, Copay, RequiresPriorAuth, CoverageLimit, IsActive)
VALUES
    (NEWID(), '00071-0155-23', 'Lipitor 20mg (Atorvastatin)', 2, 35.00, 0, 365, 1),
    (NEWID(), '00093-0058-01', 'Atorvastatin 20mg (Generic)', 1, 10.00, 0, 365, 1),
    (NEWID(), '00002-7516-80', 'Humira 40mg/0.4ml', 4, 150.00, 1, 26, 1),
    (NEWID(), '50458-579-30', 'Eliquis 5mg', 3, 90.00, 0, 365, 1),
    (NEWID(), '00003-0894-21', 'Metformin 500mg', 1, 5.00, 0, 365, 1),
    (NEWID(), '00093-5071-98', 'Lisinopril 10mg', 1, 5.00, 0, 365, 1);

-- ─── Seed Test Users ──────────────────────────────────────────
-- Passwords are BCrypt hashes of "Password123!"
INSERT INTO Users (UserId, Email, PasswordHash, Role, IsActive)
VALUES
    ('B0000001-0000-0000-0000-000000000001',
     'admin@meditrack.io',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uG.',
     'Admin', 1),
    ('B0000001-0000-0000-0000-000000000002',
     'provider@clinic.com',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uG.',
     'Provider', 1),
    ('B0000001-0000-0000-0000-000000000003',
     'patient@example.com',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uG.',
     'Patient', 1);

-- ─── Indexed View: Claim Metrics ──────────────────────────────
IF OBJECT_ID('vw_ClaimMetricsSummary', 'V') IS NOT NULL
    DROP VIEW vw_ClaimMetricsSummary;
GO

CREATE VIEW vw_ClaimMetricsSummary
WITH SCHEMABINDING AS
SELECT
    CAST(SubmittedDate AS DATE) AS ClaimDate,
    Status,
    COUNT_BIG(*) AS ClaimCount,
    SUM(TotalAmount) AS TotalAmount
FROM dbo.Claims
GROUP BY CAST(SubmittedDate AS DATE), Status;
GO

CREATE UNIQUE CLUSTERED INDEX IX_ClaimMetrics_DateStatus
    ON vw_ClaimMetricsSummary (ClaimDate, Status);
GO

PRINT 'MediTrack seed data applied successfully.';
