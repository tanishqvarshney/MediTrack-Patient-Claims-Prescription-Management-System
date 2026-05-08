# 🛡️ TanCura: Healthcare Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=github)](https://tanishqvarshney.github.io/MediTrack-Patient-Claims-Prescription-Management-System/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![FAANG-Grade UI](https://img.shields.io/badge/UI-Premium-blueviolet.svg)](https://tanishqvarshney.github.io/MediTrack-Patient-Claims-Prescription-Management-System/)

**TanCura** is a premium, production-grade Healthcare Intelligence platform. It orchestrates complex medical claims, clinical adjudications, and pharmaceutical benefits with **FAANG-grade precision**. Built for a cinematic experience, TanCura combines advanced glassmorphism design with a high-performance .NET 8 / Angular 17 architecture.

---

## 🎥 Platform Walkthrough
Experience the full cinematic orchestration of the TanCura platform in action:
[![TanCura Platform Walkthrough](https://img.shields.io/badge/YouTube-Video%20Walkthrough-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=O21aBlcPXGE)

---

## 🖼️ Visual Walkthrough

### 1. Cinematic Intelligence Portal
A secure, high-fidelity entry point featuring **frosted glassmorphism**, animated medical HUD overlays, and precision tactile interactions.
![TanCura Login](assets/screenshots/login.png)

### 2. Strategic Intelligence Dashboard
The core hub for medical orchestration. Features real-time KPI monitoring, claims velocity tracking, and glass-accented clinical data visualization.
![TanCura Dashboard](assets/screenshots/dashboard.png)

### 3. Clinical Ledger & Adjudication
Unified workspace for orchestrating complex clinical records with high-performance filtering and real-time status telemetry.
![TanCura Ledger](assets/screenshots/ledger.png)

### 4. Assisted Claims Submission
Intelligence-assisted claim orchestration interface designed for clinical accuracy and provider network efficiency.
![TanCura Submit Claim](assets/screenshots/submit_claim.png)

### 5. Provider Network Orchestration
Real-time orchestration of clinical facilities and specialists with integrated credentialing and status monitoring.
![TanCura Provider Network](assets/screenshots/providers.png)

### 6. Comprehensive Patient Directory
Unified workspace for member record management featuring insurance plan tracking and clinical profile orchestration.
![TanCura Patient Directory](assets/screenshots/patients.png)

### 7. Intelligent Global Search
High-performance clinical search engine providing sub-second retrieval across claims, patients, and provider networks.
![TanCura Search Results](assets/screenshots/search_results.png)

### 8. Surgical Clinical Modals
Advanced, task-oriented interfaces for member enrollment, provider registration, and credential updates.
````carousel
![New Member Enrollment](assets/screenshots/add_patient_modal.png)
<!-- slide -->
![New Provider Registration](assets/screenshots/add_provider_modal.png)
<!-- slide -->
![Update Facility Credentials](assets/screenshots/update_provider_modal.png)
````

### 9. Pharmaceutical Benefit Verification
Real-time drug formulary search engine with integrated Tier-status tracking and prior authorization telemetry.
![TanCura Pharmacy](assets/screenshots/pharmacy.png)

### 10. System Governance & Orchestration
Unified administrative control center for platform branding, security compliance, and clinical data lifecycle management.
![TanCura Settings](assets/screenshots/settings.png)

---

## 🚀 Key Intelligence Modules

*   **💎 High-Fidelity Glassmorphism**: A state-of-the-art UI system using backdrop-blur tokens, glowing crystalline borders, and fluid micro-animations.
*   **💊 Pharmaceutical Oracle**: Real-time pharmaceutical benefit verification engine with NDC-level clinical accuracy.
*   **📋 Clinical Claims Hub**: Unified workspace for claim submission, detailed adjudication viewing, and intelligent filtering.
*   **⚙️ Autonomous Adjudication**: A background-driven adjudication engine that manages claim lifecycles from "Pending" to "Paid" with zero manual intervention.
*   **🛡️ Audit Mastery**: Secure, immutable transaction logging for every clinical decision, ensuring 100% compliance and visibility.

---

## 🏗 System Architecture

```mermaid
graph TD
    A["TanCura Web Client (Angular 17)"] --> B[Nginx Reverse Proxy]
    B --> C["Claims API (ASP.NET Core 8)"]
    C --> D[(SQL Server 2022)]
    D --> E[Intelligent Worker Service]
    E --> F[Mock Payer Clearinghouse]
    C --> G[Redis Cache]
```

---

## 💻 Tech Stack & Engineering

*   **Frontend**: Angular 17, RxJS, SCSS (Crystalline Design System), Material 17
*   **Backend**: .NET 8 (Web API), Entity Framework Core 8, MediatR
*   **Persistence**: MS SQL Server 2022, Redis (Distributed Caching)
*   **Infrastructure**: Docker Orchestration, GitHub Actions (CI/CD)

---

## 🚦 Getting Started (Local Development)

Launch the entire ecosystem in under 3 minutes:

```bash
# 1. Initialize environment
cp .env.example .env

# 2. Launch the ecosystem via Docker
docker-compose up -d --build

# 3. Access Points
#    Intelligence Hub: http://localhost:4200
#    API Documentation: http://localhost:5001/swagger
```

### 🔑 Test Credentials

| Persona | Identity | Access Key |
| :--- | :--- | :--- |
| **System Admin** | `admin@tancura.io` | `TanCura123!` |
| **Provider** | `provider@clinic.com` | `TanCura123!` |
| **Patient** | `patient@example.com` | `TanCura123!` |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

© 2026 **TanCura Healthcare Intelligence**. Designed for the future of clinical orchestration.
