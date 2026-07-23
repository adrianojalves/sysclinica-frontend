# SysClinica — Frontend

Professional clinical management system focused on security, high performance, and user experience. The system is designed to streamline registrations, medical appointments, billing, doctor reimbursements, and comprehensive audit logs.

## Tech Stack & Libraries

| Technology | Version | Purpose |
|---|---|---|
| **Angular** | 19.1.x | Modern reactive framework using Signals, native Control Flow, and Standalone Components |
| **PrimeNG** | 19.1.x | Enterprise UI component library styled with the Aura theme |
| **Tailwind CSS** | 3.4.x | Utility-first CSS with customized healthcare design tokens |
| **RxJS** | 7.8.x | Reactive streams for HTTP requests and complex async operations |
| **TypeScript** | 5.7.x | Static typing and interfaces for type safety throughout |

## Key Capabilities & Features

### 1. Registrations (Administration & Medical Catalog)
- **Clients**: Full CRUD with full CPF digit validation, quick telephone-number search indexing, and automatic address autofill (CEP) integration using the public ViaCEP API.
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

*All reports support instant formatting and PDF export/download via `PdfDownloadService`.*

### 4. Admin Auditing & Control
- **System Activity Audit Logs**: High-security, paginated, and date-filtered audit log screen (`/logs`) enabling administrators to trace every transactional change and user action.
- **Bulk Data Purge**: Secure admin capability to wipe transaction logs and reset demonstration environments.

---

## Architecture & Security

Built following **SOLID** principles, emphasizing low coupling, strong cohesion, and high-security enterprise practices:

- **JWT Authentication**: Token stored locally and automatically attached using the `Authorization: Bearer` header on all API calls.
- **Silent Refresh**: Robust token renewal on `401 Unauthorized` responses utilizing secure backend-managed HttpOnly cookies, guarding against XSS/CSRF token theft.
- **Role-Based Access Control (RBAC)**: Fine-grained, route-level access control enforced via functional guards (`authGuard`, `roleGuard`).
- **Functional Interceptors**: Centralized HTTP interceptors to handle token injection, error mapping, and automated logouts on session expiration.
- **Signal-driven UI State**: Native Angular Signals manage component reactivity, dialogs, loaders, and page state.
- **Global Messaging Modal**: Single dynamic modal system (`success`, `error`, `warning`, `info`, `question`) to standardize confirmations without native browser alerts.
- **BaseCrudService**: Generic base class providing standardized CRUD operations, automated loading state signals, and global error handling.

---

## Project Structure

```
src/app/
├── core/
│   ├── guards/          # authGuard, roleGuard
│   ├── interceptors/    # authInterceptor (JWT attach + silent refresh)
│   ├── layout/          # AppLayoutComponent, Sidebar, Topbar
│   ├── models/          # Typed interfaces for all entities & logs
│   ├── services/        # BaseCrudService, CepService, LogService, and entity APIs
│   └── utils/           # cpfValidator and common functions
├── features/
│   ├── auth/            # Login and authentication views
│   ├── dashboard/       # Home dashboard and summary metrics
│   ├── clients/         # Client list & form with ViaCEP
│   ├── medical/
│   │   ├── clinics/     # Clinic profiles and custom payment rules
│   │   ├── doctors/     # Doctor profiles and procedure associations
│   │   └── procedures/  # Procedure catalog
│   ├── atendimento/     # Appointment creation and search dialogs
│   ├── users/           # User administration (admin only)
│   ├── company/         # Organization settings Form
│   ├── relatorios/      # Analytical report screens & PDF builders
│   ├── logs/            # System audit logs viewer (admin only)
│   └── administracao/   # Data tools and CSV/table importers
└── shared/
    ├── components/      # Global loader, message dialog, search modal widgets
    ├── constants/       # Global constants like STATUS_OPTIONS
    ├── imports/         # Centralized SHARED_UI_IMPORTS for UI dependencies
    └── pipes/           # Formatting pipes (e.g., BrlCurrencyPipe)
```

---

## Access Control (RBAC Matrix)

| Role | Access & Capabilities |
|---|---|
| `ROLE_ADMIN` | All features and administrative tools: User management, importing tables, system audit logs, deleting completed appointments, and data purge tools. |
| `ROLE_CADASTROS` | Medical data management: Clinics, doctors, procedures, clients (list & edit), company details, and appointments. |
| `ROLE_ATENDIMENTO` | Reception desk duties: Creating clients, booking appointments, and viewing daily receipt reports. |
| `ROLE_RELATORIOS` | Analytical role: Full access to the financial, performance, ABC, repasse, and history reports. |

---

## Key Code Patterns

### Extending BaseCrudService
Standardizes data flows for entity endpoints:
```ts
@Injectable({ providedIn: 'root' })
export class DoctorService extends BaseCrudService<Doctor> {
  protected readonly endpoint = 'doctors';
}
```

### Shared UI Imports
Reduces boilerplate component imports:
```ts
imports: [...SHARED_UI_IMPORTS, DatePickerModule]
```

### Global Message Service
Used for notifications and async user confirmations:
```ts
this.messageService.show('success', 'Sucesso', 'Operação concluída.');
const confirmed = await this.messageService.question('Excluir?', 'Tem certeza?'); // resolves to true/false
```

---

## Custom Design Tokens

Configured in `tailwind.config.js` for color palette harmony:

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

## Development & Build

> **Note**: The backend (Spring Boot) must run on port **8080** for development API requests to route correctly. In production, the built Angular assets are served statically from within the Spring Boot application jar (`apiUrl: '/api'`).

```bash
npm install       # Install dependencies
npm start         # Run local dev server at http://localhost:4200
ng build          # Compile production build assets to dist/
ng test           # Run client unit tests
```

---

*Developed by AJA-Software.*
