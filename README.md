# PrismaMed — Clinical Management System Frontend

[![Angular 19](https://img.shields.io/badge/Angular-19-DD0031.svg?style=flat-square&logo=angular)](https://angular.dev/)
[![PrimeNG 19](https://img.shields.io/badge/PrimeNG-19-4F46E5.svg?style=flat-square)](https://primeng.org/)
[![Tailwind CSS 3](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![RxJS 7](https://img.shields.io/badge/RxJS-7-B71C1C.svg?style=flat-square&logo=reactivex)](https://rxjs.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-darkgrey.svg?style=flat-square)]()

> A production-grade, secure, and responsive Single Page Application (SPA) for medical clinic management, built with Angular 19, PrimeNG, and Tailwind CSS.

---

## Table of Contents

- [Overview](#overview)
- [Key Features & Recent Improvements](#key-features--recent-improvements)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
  - [Default Credentials](#default-credentials)
- [Architecture & Standards](#architecture--standards)
  - [Language Strict Rules](#language-strict-rules)
  - [Directory Structure](#directory-structure)
  - [Authentication & Security](#authentication--security)
  - [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Feature Modules](#feature-modules)
  - [1. Registrations](#1-registrations)
  - [2. Appointments & Financials](#2-appointments--financials)
  - [3. Rich Analytical Reports](#3-rich-analytical-reports)
  - [4. Admin Auditing & Control](#4-admin-auditing--control)
- [Key Code Patterns](#key-code-patterns)
- [Custom Design Tokens](#custom-design-tokens)
- [Development Commands](#development-commands)

---

## Overview

PrismaMed Frontend is the client Single Page Application designed to interface with the PrismaMed API. It provides clinical users, receptionists, medical professionals, and administrators with an intuitive, highly responsive, and secure user interface to manage registrations, schedule medical appointments (*atendimentos*), monitor billing, view detailed financial reports, and inspect system audit logs.

The frontend is built using **Angular 19 Standalone Components** and **Signals**, compiling into highly optimized static assets. These assets can either be served dynamically during local development or packaged and embedded within the Spring Boot backend's JAR file to be served statically from `/`.

---

## Key Features & Recent Improvements

- **System Auditing & Logs UI**: A dedicated system log viewer (`/logs`) allowing administrators to monitor actions, perform paginated lazy-load queries, and filter system events by date range or username.
- **Excel Batch Import & Export UI**: User-friendly tools for administrators to download, edit, and bulk-upload medical procedures and clinic-doctor pricing configuration templates in Excel format (`.xlsx`).
- **Dynamic Guide Codes (`codigoGuia`)**: Integration for specifying unique insurance or system guide codes directly on clinics and care appointments.
- **Procedure Search Tags**: Quick search inputs using tags (`tag`) inside appointments to speed up search and selection.
- **Patient Address Autofill**: Automated client address autocomplete via the public ViaCEP API when entering a ZIP code (CEP).
- **Advanced PDF Reports UI**: Interactive configuration screens for filtering and downloading stylized PDF documents (Commissions/Repasse, ABC Analysis, Clinic Performance, Patient History). Displays visual warning headers ("ATENDIMENTO EM ABERTO - NÃO FINALIZADO") if printing records that are still open.

---

## Technology Stack

| Layer / Tool | Technology / Library | Purpose |
|---|---|---|
| **Core Framework** | Angular 19.1.x | Client-side SPA framework (Signals & Standalone Components) |
| **UI Component Library** | PrimeNG 19.1.x (Aura Theme) | Accessible, standardized UI components |
| **Icons** | PrimeIcons 7.0 | Vector icon package for navigation and status actions |
| **Styling Engine** | Tailwind CSS 3.4.x | Utility-first CSS with customized design system colors |
| **Reactivity & Streams** | RxJS 7.8 | Observable-based HTTP communication and complex event flows |
| **Runtime / Typing** | TypeScript 5.7 / tslib | Strict typing for domain data structures and API contracts |
| **Build Tooling** | Angular CLI 19.1 | Production compiling, tree-shaking, and dev server hosting |

---

## Getting Started

### Prerequisites

- **Node.js** (v18.x or v20.x recommended)
- **NPM** (v9.x or higher)
- **PrismaMed API** running on port `8080` (or configured via backend URL)

### Local Setup

1. **Clone the repository** and navigate to the project directory.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Launch the Local Dev Server**:
   ```bash
   npm start
   ```
   The local server will spin up at `http://localhost:4200/`. API requests are automatically routed to `http://localhost:8080/api` using the configurations in `proxy.conf.js`.
4. **Build for Production**:
   ```bash
   ng build
   ```
   Compiles optimized production static files into the `dist/` directory. Copy these files to the backend's static resource path (`src/main/resources/static/`) for unified distribution.

### Default Credentials

The seeded default administrative account can be used for initial setup:

| Username | Password | Default Roles |
|---|---|---|
| `admin` | `123456` | `ROLE_ADMIN` |

---

## Architecture & Standards

The application is structured to follow clean code, SOLID principles, and high-security frontend practices.

### Language Strict Rules

The repository follows a strict double-language rule to maintain consistency and user friendliness:
- **Internal Source Code (English)**: All code assets (class/interface names, variables, services, guards, interceptors, routing keys, internal comments, and file names) must be written exclusively in **English**.
- **User-Facing Strings (Brazilian Portuguese)**: All client-facing elements (labels, UI buttons, error/success messages, form validation alerts, page headers, tables, and tooltips) must be written strictly in **Português (Brasil)**.

### Directory Structure

Core source code resides within `src/app/` structured by technical role:
```
src/app/
├── core/
│   ├── guards/          # authGuard, roleGuard (RBAC enforcement)
│   ├── interceptors/    # authInterceptor (JWT headers & silent refresh)
│   ├── layout/          # AppLayoutComponent (Topbar, Sidebar, shell)
│   ├── models/          # Typed interfaces matching backend DTOs & logs
│   ├── services/        # BaseCrudService, CepService, LogService, entity APIs
│   └── utils/           # cpfValidator and common utilities
├── features/
│   ├── auth/            # Login screen and authentication flow
│   ├── dashboard/       # Home dashboard and summary panels
│   ├── clients/         # Client list & form with address fill
│   ├── medical/
│   │   ├── clinics/     # Clinic profiles and custom payment rules
│   │   ├── doctors/     # Doctor profiles and procedure links
│   │   └── procedures/  # Procedure catalog
│   ├── atendimento/     # Care appointments forms & search modals
│   ├── users/           # User administration (admin only)
│   ├── company/         # Organization settings Form
│   ├── relatorios/      # Analytical report filters & PDF views
│   ├── logs/            # System audit logs table (admin only)
│   └── administracao/   # Spreadsheet data importers (admin only)
└── shared/
    ├── components/      # Global loader, message modals, search widgets
    ├── constants/       # Global constants like STATUS_OPTIONS
    ├── imports/         # Centralized SHARED_UI_IMPORTS for UI dependencies
    └── pipes/           # Formatting pipes (e.g., BrlCurrencyPipe)
```

### Authentication & Security

1. **User Login (`POST /api/auth/login`)**: The `AuthService` stores the short-lived access token (`sysclinica-token`) and assigned user roles (`sysclinica-roles`) in the browser's `localStorage`.
2. **HTTP Authorization**: The `authInterceptor` automatically attaches the token using the `Authorization: Bearer <token>` header on every request.
3. **Silent Refresh**: On an HTTP `401 Unauthorized` response, the interceptor catches the error and issues a silent refresh request to the API (which validates HttpOnly cookies set by the backend). If the refresh completes, the original request is re-triggered; otherwise, the user session is invalidated and redirected to `/login`.
4. **Guards**: Routes are protected at the client-side level using functional guards (`authGuard` and `roleGuard`).

### Role-Based Access Control (RBAC)

The system restricts features based on the following authenticated user roles:

| Role | Access & Capabilities |
|---|---|
| `ROLE_ADMIN` | Full application access, including user management (`/users`), bulk data importer (`/administracao`), system audit logs (`/logs`), and authority to delete completed appointments. |
| `ROLE_CADASTROS` | Manage base entities: Doctors, Clinics, Procedures, Patients/Clients (view and update), and Company settings. |
| `ROLE_ATENDIMENTO` | Reception desk operational duties: Registering new clients and booking appointments (*atendimentos*). |
| `ROLE_RELATORIOS` | Access to all reporting features: Daily billing, commissions, ABC procedure analysis, clinic performance dashboards, and patient history. |

---

## Feature Modules

### 1. Registrations
- **Clients**: Full CRUD with full CPF digit validation, quick telephone-number search indexing, and automatic address autofill (CEP) integration.
- **Doctors**: Registry of doctors with associated clinics and specific pricing/procedures.
- **Clinics**: Medical facility configuration including custom billing/payment periods (`periodPayment`), prices charged by the clinic, and support for authorization guide code tracking (`guia`).
- **Procedures**: Complete procedure catalog filtering by medical category (e.g., *Consulta* or *Exame*).
- **Company Settings**: Management of a single-record organization profile.

### 2. Appointments & Financials
- **Atendimento (Appointments)**: Dynamic appointment booking utilizing interactive lookup dialogs for selecting client, doctor, clinic, and procedure.
- **Enhanced Search**: Instant tags-based procedure lookup to accelerate selection.
- **Financial Controls**: Tracking of individual payment methods, pricing details, custom clinic transfer values, and authorization guide codes (`guia`).
- **Authorization Enforcement**: Admin authority to delete finalized appointments when correction is required.

### 3. Rich Analytical Reports
- **Daily Appointments & Receipt (Atendimento Diário)**: Access to daily billing details and payment receipts, viewable by all authenticated clinic personnel.
- **Appointments Report**: Detailed multidimensional analysis grouped by clinic item and payment method.
- **Doctor Reimbursement (Repasse)**: Summary and granular analytical reports tracking reimbursement amounts, payment dates, and clinic transfers.
- **ABC Analysis**: Ranks and analyzes procedures based on volume and financial contribution.
- **Clinic Performance**: Comprehensive dashboard metrics of clinic throughput and procedure revenues.
- **Patient Medical History**: Aggregated timeline of all appointments, procedures, and attending doctors for any selected patient.

### 4. Admin Auditing & Control
- **System Activity Audit Logs**: High-security, paginated, and date-filtered audit log screen (`/logs`) enabling administrators to trace every transactional change and user action.
- **Bulk Data Purge**: Secure admin capability to wipe transaction logs and reset demonstration environments.

---

## Key Code Patterns

### Extending BaseCrudService
Standardizes data flows and handles state signals automatically:
```ts
@Injectable({ providedIn: 'root' })
export class DoctorService extends BaseCrudService<Doctor> {
  protected readonly endpoint = 'doctors';
}
```

### Shared UI Imports
Centralizes dependency imports to avoid boilerplate declarations in standalone components:
```ts
imports: [...SHARED_UI_IMPORTS, DatePickerModule]
```

### Global Message Service
Enforces consistent, stylized modals for alerts and confirmations:
```ts
this.messageService.show('success', 'Sucesso', 'Operação concluída.');
const confirmed = await this.messageService.question('Excluir?', 'Tem certeza?'); // Resolves true/false
```

---

## Custom Design Tokens

Configured in `tailwind.config.js` to ensure color scheme consistency:

| Token | Hex | Usage |
|---|---|---|
| `azul-prisma` | `#005293` | Primary brand blue |
| `verde-teal` | `#009B8E` | Secondary medical accent |
| `fundo-offwhite` | `#F4F7F8` | Page background |
| `branco-puro` | `#FFFFFF` | Card surfaces |
| `cinza-chumbo` | `#2D3748` | Primary text |
| `cinza-medio` | `#718096` | Secondary text |
| `cinza-contorno` | `#CBD5E0` | Borders |
| `verde-confirmacao` | `#2F855A` | Success messages |
| `vermelho-alerta` | `#C53030` | Danger and error states |

---

## Development Commands

```bash
# Run unit tests
ng test

# Run unit tests with code coverage report
ng test --code-coverage

# Build optimized production bundles
ng build --configuration production
```

---

*Developed by AJA-Software.*
