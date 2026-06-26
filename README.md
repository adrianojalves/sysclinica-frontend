# SysClinica — Frontend

Professional clinical management system focused on security, high performance, and user experience.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Angular** | 19 | Signals, native Control Flow, Standalone Components |
| **PrimeNG** | 19 | UI component library (Aura theme) |
| **Tailwind CSS** | 3 | Utility-first CSS with custom design tokens |
| **RxJS** | 7.8 | Asynchronous streams and reactivity |
| **TypeScript** | 5 | Static typing throughout |

## Architecture & Security

Built following **SOLID** principles with enterprise security practices:

- **JWT Authentication** — Token stored in `localStorage`; attached via `Authorization: Bearer` header on every request.
- **Silent Refresh** — Automatic token renewal on 401 using `HttpOnly` cookies (set by the backend) to prevent XSS exposure.
- **RBAC** — Route-level access control enforced by functional guards (`authGuard`, `roleGuard`).
- **Functional Interceptors** — Centralized HTTP handling with automatic refresh flow and logout on failure.
- **Global Messaging** — Signal-driven modal system (`success`, `error`, `warning`, `info`, `question`) — no `alert()`/`confirm()` anywhere.
- **BaseCrudService** — Generic abstract class providing `findAll`, `findById`, `save`, `update`, `delete` with loading signal and unified error handling.

## Project Structure

```
src/app/
├── core/
│   ├── guards/          # authGuard, roleGuard
│   ├── interceptors/    # authInterceptor (JWT attach + silent refresh)
│   ├── layout/          # AppLayoutComponent, Sidebar, Topbar
│   ├── models/          # Typed interfaces for all entities
│   ├── services/        # BaseCrudService + all entity services
│   └── utils/           # cpfValidator
├── features/
│   ├── auth/            # Login
│   ├── dashboard/       # Home dashboard
│   ├── clients/         # Client list & form
│   ├── medical/
│   │   ├── clinics/     # Clinic list & form
│   │   ├── doctors/     # Doctor list & form
│   │   └── procedures/  # Procedure list & form
│   ├── atendimento/     # Appointment form & search modal
│   ├── users/           # User list & form (admin only)
│   ├── company/         # Company settings form
│   ├── relatorios/      # Reports module (5 reports)
│   └── administracao/   # Table import (admin only)
└── shared/
    ├── components/      # Search modals, message modal, global loader, toast
    ├── constants/       # STATUS_OPTIONS, PROCEDURE_TYPE_OPTIONS
    ├── imports/         # SHARED_UI_IMPORTS array
    └── pipes/           # BrlCurrencyPipe
```

## Feature Modules

### Registration (ROLE_ADMIN / ROLE_CADASTROS)
- **Clients** — Full CRUD with CPF validation and CEP auto-fill via ViaCEP API.
- **Doctors** — Registration with clinic and procedure associations.
- **Clinics** — Clinic management with procedure pricing (`ClinicProcedure`).
- **Procedures** — Procedure catalog with type filtering (Consulta / Exame).
- **Company** — Single-record company settings form.

### Appointments (ROLE_ADMIN / ROLE_CADASTROS / ROLE_ATENDIMENTO)
- **Atendimento** — Appointment form with client, doctor, clinic, and procedure lookup modals; payment method and status tracking.

### Reports (ROLE_ADMIN / ROLE_RELATORIOS)
| Route | Report |
|---|---|
| `/relatorios/atendimentos` | Appointments — summary and analytical by item and payment method |
| `/relatorios/repasse` | Doctor reimbursement report |
| `/relatorios/abc` | ABC analysis of procedures |
| `/relatorios/desempenho` | Clinic performance report |
| `/relatorios/historico-paciente` | Patient history report |

All reports support PDF download via `PdfDownloadService`.

### Administration (ROLE_ADMIN only)
- **Table Import** — Bulk data import from external table files.
- **Users** — User management with role assignment.

## Access Control (RBAC)

| Role | Access |
|---|---|
| `ROLE_ADMIN` | All routes |
| `ROLE_CADASTROS` | Clients (list/edit), doctors, clinics, procedures, company, appointments |
| `ROLE_ATENDIMENTO` | Client creation, appointments |
| `ROLE_RELATORIOS` | All report routes |

## Key Patterns

**Extending BaseCrudService:**
```ts
@Injectable({ providedIn: 'root' })
export class DoctorService extends BaseCrudService<Doctor> {
  protected readonly endpoint = 'doctors';
}
```

**Shared imports:**
```ts
imports: [...SHARED_UI_IMPORTS, OtherModule]
```

**Global messaging:**
```ts
this.messageService.show('success' | 'error' | 'warning' | 'info', 'Title', 'Text');
const confirmed = await this.messageService.question('Title', 'Text'); // resolves true/false
```

**Search modals** (PrimeNG `DynamicDialogRef`):
```ts
// Opened via DialogService; closed with:
this.ref.close(selectedItem);
```

## Custom Design Tokens

Defined in `tailwind.config.js`:

| Token | Hex | Usage |
|---|---|---|
| `azul-prisma` | `#005293` | Primary brand blue |
| `verde-teal` | `#009B8E` | Secondary accent |
| `fundo-offwhite` | `#F4F7F8` | Page background |
| `branco-puro` | `#FFFFFF` | Card/surface |
| `cinza-chumbo` | `#2D3748` | Primary text |
| `cinza-medio` | `#718096` | Secondary text |
| `cinza-contorno` | `#CBD5E0` | Borders |
| `verde-confirmacao` | `#2F855A` | Success states |
| `vermelho-alerta` | `#C53030` | Error/danger states |

## Development

> The backend (Spring Boot) must be running on port **8080** for API calls to work locally.
> In production, the Angular build is embedded inside the Spring Boot JAR and shares the same host/port (`apiUrl: '/api'`).

```bash
npm install       # Install dependencies
npm start         # Dev server at http://localhost:4200
ng build          # Production build → dist/
ng test           # Unit tests (Karma/Jasmine)
```

## API Contract

Backend API documentation is available at `docs/api-docs.json` (OpenAPI/Swagger format). All service models, endpoint paths, and request/response shapes are derived from this file.

---

*Developed by AJA-Software.*
