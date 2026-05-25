# Medcore HMIS Server

Backend API for the Medcore HMIS web application. The server is a Node.js + Express application using JavaScript ESM, Prisma ORM, and a Supabase-hosted PostgreSQL database.

The backend now includes a broader demo seed for the core HMIS workflow: facility setup, RBAC, users, patients, EMR, finance, pharmacy, cash office, debtors, debtor schemes, credit control, and patient billing.

## Stack

- Node.js + Express
- Prisma ORM
- Supabase PostgreSQL
- JWT access and refresh tokens
- Zod request validation
- RBAC permissions and role checks
- Tenant and branch scoping
- Audit logging
- PDF and CSV export helpers

## Project Layout

```text
server/
  prisma/
    schema.prisma
    seed.js
    migrations/
  src/
    app.js
    server.js
    config/
    constants/
    controllers/
    middlewares/
    modules/
    routes/
    services/
    utils/
    validators/
```

The codebase currently uses two backend organization styles:

- `src/routes`, `src/controllers`, `src/services`, `src/validators` for core platform, billing, pharmacy, cash, and auth routes.
- `src/modules/*` for newer bounded modules such as appointments, departments, credit-control, debtors, debtor-schemes, and EMR support.

## Requirements

- Node.js 20 or newer
- npm
- A PostgreSQL database, usually Supabase Postgres
- Valid values in `server/.env`

## Environment

Create a local `.env` from the example:

```bash
cp .env.example .env
```

Required variables:

```env
NODE_ENV=development
PORT=4000
API_PREFIX=/api
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_ACCESS_SECRET=replace_with_long_random_access_secret
JWT_REFRESH_SECRET=replace_with_long_random_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:5000,http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
```

For Supabase, use the pooled connection URL for `DATABASE_URL` and the direct database URL for `DIRECT_URL` when running migrations.

Important: do not commit real Supabase credentials or production JWT secrets. Rotate any credentials that have been shared outside your private environment.

## Install

```bash
npm install
```

Generate Prisma Client after install or after editing `prisma/schema.prisma`:

```bash
npm run prisma:generate
```

## Quick Start

From the `server/` directory:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

If you are pointing `.env` at a shared Supabase project, confirm the target database before running `npm run prisma:seed`; the command writes demo records to the configured database.

## Database

For local development migrations:

```bash
npm run prisma:migrate
```

For deployed environments:

```bash
npm run prisma:deploy
```

Seed baseline data:

```bash
npm run prisma:seed
```

The seed script uses these login defaults:

```env
SEED_SUPER_ADMIN_EMAIL=admin@medcore.local
SEED_SUPER_ADMIN_PASSWORD=Admin@123
```

Change these before using a shared or production environment.

### Seed Coverage

`prisma/seed.js` is idempotent for the main demo records and creates a linked workflow across modules:

- Platform: tenant, main branch, satellite branch, departments, system permissions, roles, and staff users.
- Patients: patient demographics, contacts, payer profile, documents, alerts, visit, and patient visit records.
- EMR: encounter, triage, vital signs, allergy, clinical note, diagnosis, order, prescription, discharge summary, and audit log.
- Finance: credit customer, payer scheme, invoice, invoice items, approval history, payment, payment allocation, receipt, and claim.
- Pharmacy: drug category, store, supplier, drug, batch, stock movement, prescription, purchase order, pharmacy sale, and sale item.
- Cash office: counter, cashier profile, open session, cash payment, refund request, and handover.
- Debtors and schemes: debtor account, contacts, contracts, statements, reconciliations, documents, debtor scheme, department rule, copayment category/rule, and authorization rule.
- Credit control: case, follow-up, promise to pay, credit hold, dispute, and write-off recommendation.
- Patient billing: bill, bill item, billing adjustment, and cash payment link.

The appointment seed is conditional: it runs only when the Prisma Client exposes an `appointment` model. The current route layer mounts `/api/appointments`, while the main Prisma schema may not include an appointment model in every branch of development.

Default seeded login:

```text
admin@medcore.local / Admin@123
```

## Run

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Health check:

```text
GET /health
```

Default API base URL:

```text
http://localhost:4000/api
```

## Scripts

```bash
npm run dev              # Start nodemon development server
npm start                # Start server with node
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run Prisma migrate dev
npm run prisma:deploy    # Apply migrations in deploy environments
npm run prisma:seed      # Seed default data
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix lint issues
npm run format           # Format files with Prettier
npm run format:check     # Check formatting
```

## Request Flow

`src/app.js` configures shared middleware:

- Helmet security headers
- CORS from `CORS_ORIGIN`
- Rate limiting
- HPP protection
- JSON and URL-encoded body parsing
- Cookie parsing
- Morgan request logging
- Request sanitization
- Audit logger
- `/health`
- API routes under `API_PREFIX`
- 404 and centralized error handling

Most protected routes run through:

```text
authenticateUser -> tenantScope -> branchScope
```

Public route groups:

- `/api/auth`
- `/api/references`

All other route groups require a valid bearer access token.

## Route Groups

Core:

- `/api/auth`
- `/api/references`
- `/api/tenants`
- `/api/branches`
- `/api/users`
- `/api/roles`

Clinical and operations:

- `/api/departments`
- `/api/appointments`
- `/api/emr`

Finance:

- `/api/invoices`
- `/api/invoice-items`
- `/api/payments`
- `/api/receipts`
- `/api/reports`
- `/api/cash`

Pharmacy:

- `/api/pharmacy`

Credit and debtors:

- `/api/credit-control`
- `/api/debtors`
- `/api/debtor-schemes`

## Authentication

Login:

```text
POST /api/auth/login
```

Refresh token:

```text
POST /api/auth/refresh-token
```

Current user:

```text
GET /api/auth/me
```

Protected requests should include:

```http
Authorization: Bearer <access-token>
```

Optional tenant and branch targeting:

```http
x-tenant-id: <tenant-id>
x-branch-id: <branch-id>
```

Non-super-admin users are restricted to their assigned tenant and branch access.

## Frontend Integration Notes

The Vite frontend defaults to:

```text
VITE_API_BASE_URL=http://localhost:4000/api
```

The server CORS origin list must include the frontend dev server, usually:

```env
CORS_ORIGIN=http://localhost:5000,http://localhost:3000
```

Frontend API calls should target paths relative to `/api`, for example:

```text
/auth/login
/users
/appointments
/emr
/pharmacy/drugs
/cash/sessions/me
```

Seeded demo users are attached to the `MEDCORE` tenant and `MAIN` branch. Non-super-admin requests should include the tenant and branch headers when the frontend has selected an operating context:

```http
x-tenant-id: <tenant-id>
x-branch-id: <branch-id>
```

## Prisma Notes

Run this after schema edits:

```bash
npm run prisma:generate
```

If Prisma reports relation errors, run:

```bash
npx prisma format
```

Then generate again.

Current schema includes legacy and newer module models. Be careful when renaming models or relation fields because several services still reference legacy names.

Useful Prisma checks:

```bash
npx prisma validate
npm run prisma:generate
node --check prisma/seed.js
```

## Verification

Recommended local checks:

```bash
npm run prisma:generate
npx prisma validate
node --check prisma/seed.js
npm run lint
node -e "import('./src/app.js').then(() => console.log('app imports ok'))"
```

`prisma:generate`, `npx prisma validate`, `node --check prisma/seed.js`, and the app import should pass before starting integration testing. Lint may still report issues in partially implemented legacy module files until those modules are fully normalized.

## Security Checklist

- Keep service role keys out of frontend code.
- Keep Supabase database credentials only in server-side `.env` files.
- Use long random JWT secrets for every environment.
- Rotate secrets if they appear in logs, screenshots, commits, or shared files.
- Keep `CORS_ORIGIN` limited to trusted frontend origins.
- Use direct database URLs only for migrations and administrative operations.
