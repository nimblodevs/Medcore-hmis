# Hospital Management Systems - Implementation Plans

This document contains detailed implementation plans for four core hospital management systems:
1. **Hospital Pharmacy Management System**
2. **Hospital Cash Management System**
3. **Hospital User Management System**
4. **Hospital Invoice Management System**

Each plan follows the same structure:
- Overview & Business Goals
- Core Principles
- Scope & Boundaries
- Database Design
- API Design
- Implementation Phases
- Definition of Done

---

## 1. Hospital Pharmacy Management System

### Overview
Manages medicines, pharmacy inventory, prescriptions, dispensing, sales (cash/credit), returns, and stock reporting.

### Business Goals
Answer critical questions:
- Which medicines are in stock? Which batches are expiring soon?
- Which medicines were dispensed to a patient? Was payment collected?
- Which prescriptions are pending/partially dispensed?
- Which items are out of stock? Which adjustments were made and by whom?
- Which credit invoices include pharmacy items?

### Core Principles
1. **Patient Safety First**: Never dispense expired stock. Never allow negative stock. Track batch, expiry, prescriber, pharmacist.
2. **Transaction-Based Inventory**: Stock changes only via `StockMovement` records (RECEIVED, DISPENSED, RETURNED, ADJUSTED).
3. **Backend Owns Financial Logic**: Frontend never calculates totals, discounts, or payment status.
4. **Separate Cash/Credit Workflows**: Explicit flows for cash payers vs credit payers.
5. **Decimal for Money**: All monetary values use `Decimal @db.Decimal(12,2)`.
6. **Auditable Actions**: Every stock movement, sale, return, and adjustment is logged.

### Scope
**In Scope:**
- Pharmacy items (medicines, consumables, supplies)
- Stock batches with expiry tracking
- Prescriptions and dispensing
- Cash sales and credit billing
- Returns (restockable/non-restockable)
- Stock reports (low stock, expiring, movements)

**Out of Scope (MVP):**
- Drug interaction engine
- Automated procurement
- Controlled narcotics register (beyond audit trails)
- Manufacturing

### Supported Payer Types
```
CASH
INSURANCE
CORPORATE
PATIENT_CREDIT
SHA (Social Health Authority)
```

### Primary Users & Roles
- **SUPER_ADMIN, ADMIN**: Configure items, prices, permissions
- **PHARMACIST**: Review prescriptions, dispense, process returns
- **PHARMACY_CASHIER**: Record cash payments
- **FINANCE_MANAGER**: Review sales, reconciliation
- **CREDIT_CONTROLLER, CREDIT_OFFICER, SENIOR_CREDIT_OFFICER**: Manage credit billing
- **AUDITOR**: View audit trails

### Database Design

#### Enums
```prisma
enum PharmacyItemStatus { ACTIVE, INACTIVE }
enum PharmacyItemType { MEDICINE, CONSUMABLE, SUPPLY, OTHER }
enum PayerType { CASH, INSURANCE, CORPORATE, PATIENT_CREDIT, SHA }
enum PrescriptionStatus { PENDING, APPROVED, PARTIALLY_DISPENSED, DISPENSED, CANCELLED, REJECTED }
enum PrescriptionItemStatus { PENDING, APPROVED, DISPENSED, PARTIALLY_DISPENSED, UNAVAILABLE, SUBSTITUTED, REJECTED }
enum PharmacySaleStatus { DRAFT, PENDING_PAYMENT, PAID, CREDIT_APPROVED, DISPENSED, PARTIALLY_DISPENSED, CANCELLED, REFUNDED }
enum StockMovementType { RECEIVED, DISPENSED, RETURNED, ADJUSTED, TRANSFER_IN, TRANSFER_OUT, EXPIRED_DISPOSAL }
enum PharmacyPaymentStatus { UNPAID, PAID, PARTIALLY_PAID, CREDIT_BILLED, CANCELLED }
enum PharmacyReturnStatus { REQUESTED, APPROVED, REJECTED, COMPLETED }
```

#### Core Models
- `PharmacyItem`: itemCode, name, genericName, brandName, itemType, dosageForm, strength, sellingPrice, costPrice, reorderLevel
- `PharmacyBatch`: pharmacyItemId, batchNumber, expiryDate, quantityOnHand, unitCost
- `PharmacyStore`: name, code, location
- `Prescription`: prescriptionNumber, patientName, prescriberName, payerType, creditAccountId, status
- `PrescriptionItem`: prescribedQuantity, approvedQuantity, dispensedQuantity, status
- `PharmacySale`: saleNumber, grossAmount, discountAmount, netAmount, paidAmount, outstandingAmount, paymentStatus, saleStatus
- `PharmacySaleItem`: pharmacyItemId, batchId, quantity, unitPrice, totalAmount, dispensedQuantity
- `PharmacyStockMovement`: movementType, quantity, reason, referenceType, referenceId
- `PharmacyReturn`: saleId, saleItemId, quantity, reason, isRestockable, status, refundRequired

### API Design (`/api/pharmacy`)

#### Items
- `GET /items`, `POST /items`, `GET /items/:id`, `PATCH /items/:id`
- `POST /items/:id/activate`, `POST /items/:id/deactivate`

#### Stock
- `GET /batches`, `POST /stock/receive`, `POST /stock/adjust`
- `GET /stock/movements`, `GET /stock/low-stock`, `GET /stock/expiring`

#### Prescriptions
- `GET /prescriptions`, `POST /prescriptions`, `GET /prescriptions/:id`
- `POST /prescriptions/:id/approve`, `POST /prescriptions/:id/cancel`

#### Sales
- `GET /sales`, `POST /sales`, `GET /sales/:id`
- `POST /sales/:id/confirm-cash-payment`
- `POST /sales/:id/approve-credit`
- `POST /sales/:id/dispense`, `POST /sales/:id/cancel`

#### Returns
- `GET /returns`, `POST /returns`
- `POST /returns/:id/approve`, `POST /returns/:id/reject`, `POST /returns/:id/complete`

#### Reports
- `GET /reports/sales-summary`, `/cash-sales`, `/credit-sales`
- `GET /reports/stock-on-hand`, `/low-stock`, `/expiring-stock`
- `GET /reports/dispensing-summary`, `/returns`
- `GET /reports/receipt/:saleId.pdf`, `GET /reports/sales-report.csv`

### Implementation Phases

**Phase 1 — Foundation (Week 1)**
- Add Prisma models and enums
- Create module structure (services, repositories, validators)
- Implement stock calculation service
- Implement audit service

**Phase 2 — Item & Stock Management (Week 2)**
- Pharmacy item CRUD with validation
- Stock receiving with batch/expiry
- Stock adjustments with approval workflow
- Low-stock and expiring-stock queries

**Phase 3 — Prescriptions (Week 3)**
- Create prescription with items
- Approve/reject/cancel workflows
- Convert prescription to sale
- Partial dispensing support

**Phase 4 — Sales (Week 4)**
- Create sale with automatic total calculation
- Cash payer workflow with payment confirmation
- Credit payer workflow with account validation
- Integration with invoice management for credit billing

**Phase 5 — Dispensing (Week 5)**
- Batch selection with expiry warnings
- Stock validation (no negative, no expired)
- Stock movement creation
- Mark sale as dispensed/partially dispensed

**Phase 6 — Returns (Week 6)**
- Return request creation
- Approve/reject/complete workflows
- Restocking logic (check expiry)
- Refund/credit note triggers

**Phase 7 — Reports (Week 7)**
- Sales summary reports (daily, by payer type)
- Stock reports (on-hand, low, expiring)
- PDF receipt generation
- CSV export functionality

**Phase 8 — Frontend (Week 8-9)**
- React Query hooks for all entities
- Dashboard with KPIs
- Items, Stock, Prescriptions, Sales pages
- Dispensing queue with batch selection
- Returns management page
- Reports page with export

### Definition of Done
- [ ] Pharmacy items can be created/managed with activation states
- [ ] Stock received by batch with expiry tracking
- [ ] Low stock and expiring stock detected automatically
- [ ] Prescriptions created, reviewed, and converted to sales
- [ ] Cash sales require payment before dispensing
- [ ] Credit sales validate account status and limit
- [ ] Credit sales create invoice line items
- [ ] Stock deducted only on dispensing (not on draft)
- [ ] Expired stock cannot be dispensed
- [ ] Negative stock prevented at database level
- [ ] Partial dispensing supported
- [ ] Returns processed with restocking logic
- [ ] All actions create audit logs
- [ ] Permissions enforced via middleware
- [ ] PDF receipts and CSV exports functional
- [ ] Frontend uses React Query correctly
- [ ] Tables support search, filter, pagination, export

---

## 2. Hospital Cash Management System

### Overview
Manages cash sessions, cash transactions, till management, cashier workflows, and cash reconciliation. Ensures accurate tracking of all cash inflows and outflows across the hospital.

### Business Goals
Answer critical questions:
- Which cashier is on duty? What is their till balance?
- How much cash was collected today? By which cashier?
- Which transactions belong to which cash session?
- Are there any discrepancies between expected and actual cash?
- Which payments are pending reconciliation?
- What is the cash flow by department/service type?

### Core Principles
1. **Session-Based Tracking**: Every cash transaction belongs to an active cash session.
2. **Immutable Transactions**: Once recorded, cash transactions cannot be modified (only reversed via adjustment).
3. **Dual Control**: Opening/closing sessions requires supervisor approval for high-value tills.
4. **Real-Time Reconciliation**: Expected balance calculated from transactions; actual balance entered on close.
5. **Audit Trail**: Every session open, close, and adjustment is logged with user and timestamp.
6. **Decimal Precision**: All amounts use `Decimal @db.Decimal(12,2)`.

### Scope
**In Scope:**
- Cash sessions (open, active, closed, reconciled)
- Cash transactions (payments, refunds, adjustments)
- Till management (starting balance, expected balance, variance)
- Cashier assignment and handover
- Reconciliation workflows
- Cash reports (daily summaries, variance reports)

**Out of Scope (MVP):**
- Multi-currency support
- Petty cash management (separate module)
- Bank deposit integration
- Advanced fraud detection

### Supported Transaction Types
```
PAYMENT         // Cash received from patient/client
REFUND          // Cash returned to patient/client
ADJUSTMENT      // Correction (requires approval)
TRANSFER_IN     // Cash received from another till
TRANSFER_OUT    // Cash sent to another till
OPENING_BALANCE // Session start balance
CLOSING_BALANCE // Session end balance
```

### Primary Users & Roles
- **SUPER_ADMIN, ADMIN**: Configure cash points, limits, permissions
- **CASHIER**: Open sessions, record transactions, close sessions
- **SENIOR_CASHIER**: Approve adjustments, supervise handovers
- **FINANCE_MANAGER**: Review reconciliation, approve variances
- **AUDITOR**: View audit trails and reports

### Database Design

#### Enums
```prisma
enum CashSessionStatus { OPEN, ACTIVE, CLOSING, CLOSED, RECONCILED }
enum CashTransactionType { PAYMENT, REFUND, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT, OPENING_BALANCE, CLOSING_BALANCE }
enum CashTransactionStatus { PENDING, COMPLETED, REVERSED, FLAGGED }
enum CashPointType { PHARMACY, RECEPTION, LABORATORY, CONSULTATION, MAIN_TILL }
```

#### Core Models
- `CashPoint`: name, code, type, location, isActive, defaultLimit
- `CashSession`: cashPointId, openedById, openedAt, closedById, closedAt, openingBalance, closingBalance, expectedBalance, variance, status, supervisorId
- `CashTransaction`: sessionId, type, amount, referenceType, referenceId (e.g., saleId), description, status, performedById
- `CashAdjustment`: sessionId, amount, reason, approvedById, status
- `CashReconciliation`: sessionId, countedCash, chequeAmount, mobileMoneyAmount, totalActual, variance, notes, reconciledById

### API Design (`/api/cash`)

#### Cash Points
- `GET /cash-points`, `POST /cash-points`, `PATCH /cash-points/:id`
- `POST /cash-points/:id/activate`, `POST /cash-points/:id/deactivate`

#### Sessions
- `POST /sessions/open` (with opening balance)
- `GET /sessions/active` (filter by cashPoint, cashier)
- `GET /sessions/:id` (with transactions)
- `POST /sessions/:id/close` (enter closing balance)
- `POST /sessions/:id/reconcile` (submit for approval)

#### Transactions
- `POST /transactions` (record payment/refund)
- `GET /transactions` (filter by session, date, type)
- `GET /transactions/:id`
- `POST /transactions/:id/flag` (mark for review)

#### Adjustments
- `POST /adjustments` (requires approval if > threshold)
- `POST /adjustments/:id/approve`
- `POST /adjustments/:id/reject`

#### Reports
- `GET /reports/daily-summary` (by cash point, cashier)
- `GET /reports/variance-report` (sessions with discrepancies)
- `GET /reports/cashier-performance` (transactions per cashier)
- `GET /reports/session-history.pdf`

### Implementation Phases

**Phase 1 — Foundation (Week 1)**
- Add Prisma models and enums
- Create cash point configuration
- Implement session state machine (open → active → closing → closed)

**Phase 2 — Session Management (Week 2)**
- Open session with starting balance
- Active session: record transactions
- Close session: enter counted cash
- Calculate expected vs actual balance

**Phase 3 — Transaction Recording (Week 3)**
- Record cash payments (linked to sales/invoices)
- Record refunds (requires approval)
- Prevent modifications; allow reversals only
- Flag suspicious transactions

**Phase 4 — Adjustments & Transfers (Week 4)**
- Adjustment workflow with approval thresholds
- Transfer between tills (dual authorization)
- Variance handling and escalation

**Phase 5 — Reconciliation (Week 5)**
- Multi-method reconciliation (cash, cheque, mobile money)
- Supervisor approval for variances > threshold
- Generate reconciliation certificates

**Phase 6 — Reports (Week 6)**
- Daily cash summary by point/cashier
- Variance analysis report
- Cashier performance metrics
- PDF session history export

**Phase 7 — Frontend (Week 7-8)**
- Cashier dashboard (active session, quick actions)
- Transaction entry form with validation
- Session close wizard
- Reconciliation interface
- Finance manager approval queue
- Reports page with export

### Definition of Done
- [ ] Cash points configured and activatable
- [ ] Sessions opened with starting balance
- [ ] Transactions recorded immutably
- [ ] Sessions closed with counted cash entry
- [ ] Expected balance auto-calculated
- [ ] Variance detected and flagged
- [ ] Adjustments require approval above threshold
- [ ] Transfers between tills tracked
- [ ] Reconciliation completed with multi-method support
- [ ] All actions audited
- [ ] Role-based permissions enforced
- [ ] Daily summary and variance reports functional
- [ ] PDF session history export working
- [ ] Frontend supports complete cashier workflow

---

## 3. Hospital User Management System

### Overview
Manages user accounts, roles, permissions, authentication, sessions, and audit trails. Provides secure access control across all hospital modules.

### Business Goals
Answer critical questions:
- Who has access to which modules?
- Which users have sensitive permissions (approve credit, dispense without payment)?
- What actions did a specific user perform?
- Are there any inactive accounts that should be disabled?
- Which roles exist and what permissions do they grant?
- How many failed login attempts occurred?

### Core Principles
1. **Role-Based Access Control (RBAC)**: Permissions granted via roles, not directly to users.
2. **Least Privilege**: Users receive minimum permissions necessary for their job.
3. **Immutable Audit Logs**: User actions cannot be deleted or modified.
4. **Secure Authentication**: Password hashing, session tokens, failed attempt tracking.
5. **Granular Permissions**: Fine-grained permissions (e.g., `pharmacy.sales.dispense`, `credit.override_limit`).
6. **Multi-Factor Ready**: Architecture supports MFA addition without redesign.

### Scope
**In Scope:**
- User accounts (create, update, activate, deactivate)
- Roles (predefined and custom)
- Permissions (granular, module-specific)
- Authentication (login, logout, password reset)
- Session management
- Audit logging (who did what, when)
- Password policies

**Out of Scope (MVP):**
- Multi-factor authentication (future phase)
- LDAP/Active Directory integration
- OAuth/SAML SSO
- Biometric authentication

### Supported Roles
```
SUPER_ADMIN       // Full system access
ADMIN             // Module configuration, user management
DOCTOR            // Prescriptions, patient records
NURSE             // Patient care, vitals
PHARMACIST        // Dispensing, stock management
PHARMACY_CASHIER  // Cash payments in pharmacy
LAB_TECHNICIAN    // Lab orders and results
ACCOUNTANT        // Invoicing, payments
FINANCE_MANAGER   // Financial reports, approvals
CREDIT_OFFICER    // Credit account management
SENIOR_CREDIT_OFFICER // High-limit credit approval
CREDIT_CONTROLLER // Credit oversight
RECEPTIONIST      // Patient registration, appointments
AUDITOR           // Read-only audit trail access
```

### Database Design

#### Enums
```prisma
enum UserRole { SUPER_ADMIN, ADMIN, DOCTOR, NURSE, PHARMACIST, PHARMACY_CASHIER, LAB_TECHNICIAN, ACCOUNTANT, FINANCE_MANAGER, CREDIT_OFFICER, SENIOR_CREDIT_OFFICER, CREDIT_CONTROLLER, RECEPTIONIST, AUDITOR }
enum UserStatus { ACTIVE, INACTIVE, SUSPENDED, PENDING_ACTIVATION }
enum AuditAction { LOGIN, LOGOUT, PASSWORD_CHANGE, USER_CREATED, USER_UPDATED, ROLE_ASSIGNED, PERMISSION_GRANTED, ENTITY_CREATED, ENTITY_UPDATED, ENTITY_DELETED, APPROVAL_GRANTED, APPROVAL_REJECTED }
enum AuditEntityType { USER, ROLE, PATIENT, PRESCRIPTION, SALE, INVOICE, CREDIT_ACCOUNT, CASH_SESSION, STOCK_MOVEMENT }
```

#### Core Models
- `User`: email, passwordHash, firstName, lastName, phone, role, status, lastLoginAt, failedLoginAttempts, lockedUntil
- `Role`: name, description, isSystemRole (cannot delete)
- `Permission`: name, description, module (pharmacy, cash, invoice, credit)
- `RolePermission`: roleId, permissionId
- `AuditLog`: userId, action, entityType, entityId, oldValues, newValues, ipAddress, userAgent, createdAt
- `Session`: userId, token, expiresAt, isActive, lastActivityAt
- `PasswordResetToken`: userId, token, expiresAt, used

### API Design (`/api/auth` and `/api/users`)

#### Authentication
- `POST /auth/login` (email, password → token)
- `POST /auth/logout` (invalidate session)
- `POST /auth/refresh-token`
- `POST /auth/forgot-password` (send reset email)
- `POST /auth/reset-password` (token + new password)
- `POST /auth/change-password` (authenticated user)

#### Users
- `GET /users` (filter by role, status, search)
- `POST /users` (create with role)
- `GET /users/:id`
- `PATCH /users/:id` (update profile, status)
- `POST /users/:id/activate`, `POST /users/:id/deactivate`, `POST /users/:id/suspend`
- `POST /users/:id/assign-role`

#### Roles & Permissions
- `GET /roles` (list all roles with permissions)
- `POST /roles` (create custom role)
- `PATCH /roles/:id` (add/remove permissions)
- `DELETE /roles/:id` (if not system role)
- `GET /permissions` (list all available permissions)

#### Audit Logs
- `GET /audit-logs` (filter by user, action, date range, entity)
- `GET /audit-logs/:id`
- `GET /audit-logs/user/:userId`
- `GET /audit-logs/entity/:entityType/:entityId`

#### Session Management
- `GET /sessions/me` (current user sessions)
- `DELETE /sessions/:id` (revoke specific session)
- `DELETE /sessions/all` (revoke all sessions for user)

### Implementation Phases

**Phase 1 — Foundation (Week 1)**
- Add Prisma models and enums
- Implement password hashing (bcrypt)
- Create JWT token generation/validation
- Session management infrastructure

**Phase 2 — Authentication (Week 2)**
- Login endpoint with rate limiting
- Logout and token refresh
- Password reset flow (token generation, email placeholder)
- Failed login tracking and account lockout

**Phase 3 — User Management (Week 3)**
- CRUD operations for users
- Role assignment and status changes
- Search and filter functionality
- Bulk user import (CSV)

**Phase 4 — Roles & Permissions (Week 4)**
- Predefined system roles (seed data)
- Custom role creation
- Permission assignment to roles
- Middleware: `requireRole()` and `requirePermission()`

**Phase 5 — Audit Logging (Week 5)**
- Automatic audit log creation on sensitive actions
- Query audit logs by user, entity, action
- Immutable log storage (no updates/deletes)
- IP address and user agent tracking

**Phase 6 — Security Hardening (Week 6)**
- Rate limiting on auth endpoints
- Account lockout after N failed attempts
- Session expiration and revocation
- Password strength validation

**Phase 7 — Reports & Frontend (Week 7-8)**
- User list page with filters
- Role management interface
- Audit log viewer with advanced search
- User profile page
- Login, logout, password change forms

### Definition of Done
- [ ] Users can be created with roles and statuses
- [ ] Login/logout with JWT tokens functional
- [ ] Password reset flow working (email placeholder)
- [ ] Account lockout after failed attempts
- [ ] Roles can be assigned/modified
- [ ] Custom roles can be created (non-system)
- [ ] Permissions enforced via middleware
- [ ] Audit logs created for all sensitive actions
- [ ] Audit logs queryable by multiple filters
- [ ] Sessions can be revoked individually or en masse
- [ ] Password policies enforced (length, complexity)
- [ ] Rate limiting on auth endpoints
- [ ] Frontend pages for user/role/audit management
- [ ] Seeder script for initial roles and permissions

---

## 4. Hospital Invoice Management System

### Overview
Manages invoicing, invoice line items, payment allocation, credit billing, and financial reporting. Integrates with pharmacy, laboratory, consultation, and other revenue-generating modules.

### Business Goals
Answer critical questions:
- Which invoices are unpaid/partially paid/overdue?
- How much revenue was generated this month? By department?
- Which credit accounts have outstanding balances?
- Which payments have not been allocated to invoices?
- What is the aging report for receivables?
- Which invoices were created from pharmacy/lab/consultation services?

### Core Principles
1. **Invoice Immutability**: Once issued, invoices cannot be modified (only credited or adjusted via separate records).
2. **Payment Allocation**: Payments must be explicitly allocated to invoices (no automatic assumptions).
3. **Credit Integration**: Credit invoices link to credit accounts with limit tracking.
4. **Decimal Precision**: All amounts use `Decimal @db.Decimal(12,2)`.
5. **Audit Trail**: Invoice creation, modification, voiding, and payment allocation are logged.
6. **Multi-Source Line Items**: Invoice lines can originate from pharmacy sales, lab tests, consultations, etc.

### Scope
**In Scope:**
- Invoice creation (manual and automated from modules)
- Invoice line items (service type, quantity, unit price, total)
- Payment allocation (partial, full, overpayment)
- Credit invoices (linked to credit accounts)
- Credit notes (for returns/adjustments)
- Invoice status management (draft, issued, paid, partially_paid, overdue, void)
- Aging reports and revenue summaries

**Out of Scope (MVP):**
- Recurring invoices
- Multi-currency invoicing
- Tax calculation engine (simple tax field only)
- Electronic billing integration (eTIMS)

### Supported Invoice Types
```
STANDARD        // Regular invoice for services
CREDIT          // Linked to credit account
PROFORMA        // Preliminary invoice (not accounting document)
CREDIT_NOTE     // Reversal/adjustment of previous invoice
DEBIT_NOTE      // Additional charges on previous invoice
```

### Invoice Statuses
```
DRAFT           // Not yet issued
ISSUED          // Sent to client, payment due
PARTIALLY_PAID  // Some payment received
PAID            // Fully paid
OVERDUE         // Past due date
VOID            // Cancelled (no financial impact)
WRITTEN_OFF     // Bad debt written off
```

### Primary Users & Roles
- **SUPER_ADMIN, ADMIN**: Configure invoice settings, tax rates
- **ACCOUNTANT**: Create invoices, allocate payments, issue credit notes
- **FINANCE_MANAGER**: Approve write-offs, review aging reports
- **CREDIT_OFFICER, SENIOR_CREDIT_OFFICER**: Manage credit invoices
- **CREDIT_CONTROLLER**: Oversee credit portfolio
- **AUDITOR**: View audit trails and reports

### Database Design

#### Enums
```prisma
enum InvoiceType { STANDARD, CREDIT, PROFORMA, CREDIT_NOTE, DEBIT_NOTE }
enum InvoiceStatus { DRAFT, ISSUED, PARTIALLY_PAID, PAID, OVERDUE, VOID, WRITTEN_OFF }
enum InvoiceLineSourceType { PHARMACY_SALE, LAB_ORDER, CONSULTATION, PROCEDURE, MISCELLANEOUS }
enum PaymentAllocationStatus { UNALLOCATED, PARTIALLY_ALLOCATED, FULLY_ALLOCATED }
```

#### Core Models
- `Invoice`: invoiceNumber, type, status, patientName, patientNumber, creditAccountId, issueDate, dueDate, grossAmount, discountAmount, taxAmount, netAmount, paidAmount, outstandingAmount, currency
- `InvoiceLine`: invoiceId, description, sourceType, sourceId (e.g., pharmacySaleId), quantity, unitPrice, discountAmount, taxRate, totalAmount
- `Payment`: paymentNumber, amount, paymentMethod (CASH, CARD, MOBILE_MONEY, CHEQUE, BANK_TRANSFER), paymentDate, referenceNumber, receivedById
- `PaymentAllocation`: paymentId, invoiceId, allocatedAmount, allocatedAt, allocatedById
- `CreditNote`: creditNoteNumber, originalInvoiceId, amount, reason, issuedById, issuedAt
- `AgingBucket`: invoiceId, current, days_30, days_60, days_90, days_120_plus (calculated view)

### API Design (`/api/invoices`)

#### Invoices
- `GET /invoices` (filter by status, date range, patient, credit account)
- `POST /invoices` (create manual invoice)
- `GET /invoices/:id` (with line items and allocations)
- `POST /invoices/:id/issue` (change from draft to issued)
- `POST /invoices/:id/void` (cancel invoice)
- `POST /invoices/:id/write-off` (requires approval)

#### Invoice Lines
- `POST /invoices/:id/lines` (add line item)
- `PATCH /invoices/:id/lines/:lineId` (only in draft status)
- `DELETE /invoices/:id/lines/:lineId` (only in draft status)

#### Payments
- `POST /payments` (record payment)
- `GET /payments` (filter by date, method, unallocated)
- `GET /payments/:id`
- `POST /payments/:id/allocate` (allocate to invoice(s))
- `POST /payments/:id/unallocate` (reverse allocation)

#### Credit Notes
- `POST /credit-notes` (create against invoice)
- `GET /credit-notes` (filter by invoice, date)
- `GET /credit-notes/:id`

#### Reports
- `GET /reports/aging-report` (receivables by age bucket)
- `GET /reports/revenue-summary` (by department, period)
- `GET /reports/unpaid-invoices`
- `GET /reports/credit-account-balances`
- `GET /reports/invoice-detail.pdf`

### Implementation Phases

**Phase 1 — Foundation (Week 1)**
- Add Prisma models and enums
- Invoice number generation (sequential, unique)
- Status state machine (draft → issued → paid/overdue)

**Phase 2 — Invoice Creation (Week 2)**
- Manual invoice creation with line items
- Automated invoice creation from pharmacy sales
- Automated invoice creation from lab orders
- Draft vs issued behavior (editing restrictions)

**Phase 3 — Payment Recording (Week 3)**
- Record payments with multiple methods
- Payment status: unallocated, partially allocated, fully allocated
- Prevent over-allocation (validation)
- Payment reference tracking

**Phase 4 — Payment Allocation (Week 4)**
- Allocate payment to single or multiple invoices
- Partial allocation support
- Unallocate payment (with audit trail)
- Auto-allocate to oldest invoice option

**Phase 5 — Credit Management (Week 5)**
- Credit invoices linked to credit accounts
- Credit limit validation on invoice creation
- Outstanding balance updates on payment allocation
- Credit note creation for returns/adjustments

**Phase 6 — Aging & Write-Offs (Week 6)**
- Aging bucket calculation (current, 30, 60, 90, 120+ days)
- Overdue invoice detection (cron job or on-demand)
- Write-off workflow with approval
- Bad debt reporting

**Phase 7 — Reports (Week 7)**
- Aging report (summary and detail)
- Revenue summary by department/service type
- Unpaid invoices list
- Credit account balances
- PDF invoice detail export

**Phase 8 — Frontend (Week 8-9)**
- Invoice list with filters and status badges
- Invoice creation/edit form (draft mode)
- Payment recording and allocation wizard
- Credit note creation
- Aging report dashboard
- Invoice detail view with timeline

### Definition of Done
- [ ] Invoices created manually and from modules (pharmacy, lab)
- [ ] Invoice numbers unique and sequential
- [ ] Invoice status transitions enforced (draft → issued → paid)
- [ ] Line items immutable after invoice issued
- [ ] Payments recorded with multiple methods
- [ ] Payments allocated to invoices (partial/full supported)
- [ ] Over-allocation prevented
- [ ] Credit invoices linked to credit accounts
- [ ] Credit limit validated on invoice creation
- [ ] Credit notes created against invoices
- [ ] Aging buckets calculated correctly
- [ ] Overdue invoices detected and flagged
- [ ] Write-off workflow with approval
- [ ] All actions audited
- [ ] Aging report, revenue summary, unpaid invoices functional
- [ ] PDF invoice export working
- [ ] Frontend supports complete invoicing workflow

---

## Cross-System Integration Points

### Pharmacy ↔ Cash
- Cash payment confirmation in pharmacy triggers cash transaction recording
- Pharmacy cashier role requires cash session to be active

### Pharmacy ↔ Invoice
- Credit pharmacy sales create invoice line items automatically
- Invoice outstanding balance affects credit account limit

### Pharmacy ↔ Credit
- Credit account validation before dispensing
- Outstanding balance updated on credit sale approval

### Cash ↔ Invoice
- Cash payments allocated to invoices
- Payment allocation reduces invoice outstanding amount

### User ↔ All Systems
- Every sensitive action in all modules creates an audit log
- Role-based permissions control access to all endpoints
- Session management applies across all modules

### Common Patterns Across Systems
1. **Decimal for Money**: All financial values use `Decimal @db.Decimal(12,2)`
2. **Audit Logging**: Every create/update/delete/approval action logged
3. **Soft Deletes**: Use `status` fields instead of hard deletes
4. **UUID Primary Keys**: All models use `String @id @default(uuid())`
5. **Timestamps**: `createdAt` and `updatedAt` on all models
6. **Indexing**: Foreign keys and frequently queried fields indexed
7. **Transaction Safety**: Multi-step operations wrapped in Prisma transactions
8. **Zod Validation**: All input validated with Zod schemas
9. **Consistent API Responses**: `{ success, message, data, errors }`
10. **Role Middleware**: `requireRole()` and `requirePermission()` on all routes

---

## Technology Stack (All Systems)

**Backend:**
- Node.js + Express
- Prisma ORM
- PostgreSQL
- Zod validation
- JWT authentication
- bcrypt password hashing

**Frontend:**
- React + Vite
- React Query (server state)
- Zustand (UI state only)
- React Router
- shadcn/ui components
- Tailwind CSS

**Infrastructure:**
- Docker (optional for deployment)
- Environment variables for configuration
- Migration scripts via Prisma

---

## Estimated Timeline (Total)

| System | Weeks | Notes |
|--------|-------|-------|
| Pharmacy | 9 | Most complex due to inventory + sales + dispensing |
| Cash | 8 | Session management and reconciliation intensive |
| User | 8 | Security-critical, requires thorough testing |
| Invoice | 9 | Complex payment allocation and aging logic |
| **Integration & Testing** | 4 | Cross-system workflows, end-to-end testing |
| **Buffer** | 4 | Unforeseen issues, refinements |
| **Total** | **42 weeks** (~10 months) | For MVP with all core features |

**Note:** Teams can parallelize work. Example:
- Developer A: Pharmacy Phases 1-4
- Developer B: User Management Phases 1-5
- Developer C: Cash Management Phases 1-4
- After Phase 4, rotate to Invoice and integration work

---

## Risk Mitigation Strategies

1. **Scope Creep**: Stick to MVP scope. Defer "nice-to-have" features to Phase 2.
2. **Data Integrity**: Use database constraints (unique, foreign keys, check constraints).
3. **Financial Errors**: Backend owns all calculations. Frontend displays only.
4. **Security Vulnerabilities**: Regular dependency updates, input validation, rate limiting.
5. **Performance Issues**: Indexing strategy, pagination on all list endpoints, query optimization.
6. **Audit Gaps**: Code review checklist includes "Does this action need an audit log?"
7. **Integration Failures**: Define clear API contracts between modules. Use transactions for cross-module operations.

---

## Success Metrics

**Functional:**
- All "Definition of Done" items checked off
- Zero critical bugs in production (P0/P1)
- 95%+ test coverage on financial logic

**Operational:**
- < 200ms average API response time
- 99.9% uptime during business hours
- < 1 hour mean time to recovery (MTTR)

**User Satisfaction:**
- < 5 support tickets per week after 1 month
- Positive feedback from pilot users (pharmacists, cashiers, accountants)
- Successful completion of month-end close without issues

---

*Document Version: 1.0*
*Last Updated: 2025*
*Author: Senior Hospital Systems Architect*
