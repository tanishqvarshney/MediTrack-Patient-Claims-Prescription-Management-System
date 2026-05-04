# 🛡️ TanCura: Healthcare Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=github)](https://tanishqvarshney.github.io/MediTrack-Patient-Claims-Prescription-Management-System/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![FAANG-Grade UI](https://img.shields.io/badge/UI-Premium-blueviolet.svg)](https://tanishqvarshney.github.io/MediTrack-Patient-Claims-Prescription-Management-System/)

**TanCura** is a premium, intelligence-driven healthcare platform designed for high-performance claims management and pharmaceutical benefit orchestration. Built with a modern, cloud-native architecture, it delivers a **FAANG-level user experience** through advanced glassmorphism, cinematic micro-animations, and a "Midnight Slate" design system.

---

## 🖼️ Visual Walkthrough

### 1. Cinematic Intelligence Portal
Experience a premium, secure entry point designed with high-fidelity frosted glassmorphism, animated medical HUD overlays, and modern security standards.
![TanCura Login](assets/walkthrough/login.png)

### 2. Intelligent Claims Hub
A centralized dashboard featuring real-time data visualization, clinical metrics, and predictive claim analytics in a sophisticated, glass-accented interface.
![TanCura Dashboard](assets/walkthrough/dashboard.png)

---

## ✨ Key Features

*   **💎 Premium Glassmorphism UI**: High-fidelity "Frosted Glass" interface with backdrop blurring, soft glowing borders, and fluid animations.
*   **📊 Intelligence Dashboard**: Real-time KPI visualization for claims processing, rejected cases, and provider metrics.
*   **💊 Pharmaceutical Oracle**: Sophisticated drug benefit verification with clinical precision and NDC-level accuracy.
*   **⚙️ Automated Adjudication**: Background-managed claim state transitions with a robust audit-ready engine.
*   **🛡️ Audit Mastery**: Comprehensive PHI-compliant transaction logging for every clinical decision and access event.

---

## 🏗 System Architecture

```mermaid
graph TD
    A[TanCura Web Client (Angular 17)] --> B[Nginx Reverse Proxy]
    B --> C[Claims API (ASP.NET Core 8)]
    C --> D[(SQL Server 2022)]
    D --> E[Intelligent Worker Service]
    E --> F[Mock Payer Clearinghouse]
    C --> G[Redis Cache]
```

---

## 🚀 Quick Start (Docker Orchestration)

Deploy the entire intelligence ecosystem in minutes:

```bash
# 1. Initialize environment
cp .env.example .env

# 2. Launch the ecosystem
docker-compose up -d --build

# 3. Access Points
#    Frontend:    http://localhost:4200 (Intelligence Hub)
#    API Gateway: http://localhost:5001/swagger (API Docs)
```

---

## 🔑 Default Credentials (Development)

| Persona | Identity | Access Key |
| :--- | :--- | :--- |
| **System Admin** | `admin@tancura.io` | `TanCura123!` |
| **Provider** | `provider@clinic.com` | `TanCura123!` |
| **Patient** | `patient@example.com` | `TanCura123!` |

---

## 🔧 Technical Stack

*   **Core**: .NET 8, C#, Entity Framework Core
*   **Frontend**: Angular 17, Material Design, TypeScript, CSS Custom Properties (Glassmorphism)
*   **Storage**: MS SQL Server 2022, Redis 7
*   **Infrastructure**: Docker, Nginx, GitHub Actions (CI/CD)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

© 2026 **TanCura Healthcare Intelligence**. All rights reserved.
