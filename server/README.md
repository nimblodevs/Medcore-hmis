# Medcore HMIS Backend (Outpatient Credit Invoicing)

This backend is implemented in **Node.js + Express (JavaScript ESM)** with:

- Prisma ORM
- Supabase PostgreSQL
- JWT authentication (access + refresh)
- RBAC permissions
- Tenant + branch scoping
- Audit logging
- Soft delete support on key tables

## 1. Setup

1. Install dependencies:

```bash
npm install
```

2. Copy and edit environment variables:

```bash
cp .env.example .env
```

3. Update `.env` values for your Supabase project and JWT secrets.

## 2. Database

Run Prisma generate/migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Seed default RBAC roles/permissions:

```bash
npm run prisma:seed
```

## 3. Run Server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Health check:

`GET /health`

## 4. API Prefix

All routes are mounted under:

`/api`

## 5. Security Controls Included

- Helmet headers
- CORS allow-list from `.env`
- Rate limiting
- Request sanitization
- Zod request validation
- JWT authentication
- RBAC authorization middleware
- Tenant and branch scope middleware
- Centralized error handler
- Audit logging middleware

## 6. Key Endpoint Groups

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/references/next`

- `GET /api/tenants`
- `POST /api/tenants`
- `PATCH /api/tenants/:id`
- `GET /api/branches`
- `POST /api/branches`
- `PATCH /api/branches/:id`

- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
- `GET /api/roles`
- `POST /api/roles`
- `POST /api/users/:id/roles`
- `POST /api/users/:id/branches`
- `POST /api/users/:id/departments`

- `GET /api/departments`
- `POST /api/departments`
- `PATCH /api/departments/:id`

- `GET /api/invoices`
- `GET /api/invoices/:id`
- `POST /api/invoices`
- `PATCH /api/invoices/:id`
- `POST /api/invoices/:id/submit-approval`
- `POST /api/invoices/:id/approve`
- `POST /api/invoices/:id/reject`
- `POST /api/invoices/:id/submit-to-payer`
- `POST /api/invoices/:id/generate-claim`
- `POST /api/invoices/:id/cancel`
- `POST /api/invoices/:id/reverse`

- `POST /api/invoices/:id/items`
- `PATCH /api/invoice-items/:id`
- `DELETE /api/invoice-items/:id`

- `POST /api/payments`
- `POST /api/payments/:id/allocate`
- `POST /api/receipts`
- `GET /api/receipts/:id`
- `GET /api/invoices/:id/receipts`

- `GET /api/reports/credit-invoices`
- `GET /api/reports/outstanding-balances`
- `GET /api/reports/tenant-summary`
- `GET /api/reports/branch-summary`

## 7. Important Business Rules Enforced

- No duplicate invoice for same outpatient visit + billing type
- Credit invoices require `creditCustomerId`
- Insurance invoices require `schemeId` and optional authorization policy check
- Credit limit validation before invoice creation
- Invoice total consistency check against item sums
- Co-pay separated from credit amount (`creditAmount = netAmount - patientCopayAmount`)
- Approval required before submit to payer
- Item edits allowed only for `DRAFT` or `REVERSED`
- Payment allocation allowed only on `APPROVED`, `SUBMITTED_TO_PAYER`, `PARTIALLY_PAID`
- Invoice status auto-updates to `PARTIALLY_PAID` or `FULLY_PAID` after allocations

## 8. Notes

- This is the first production-focused backend slice for OP credit invoicing and payment lifecycle.
- Extend with additional clinical modules (encounters, pharmacy, lab) using same tenant/branch scoping and RBAC pattern.
