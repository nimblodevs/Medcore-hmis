# Hospital Patient Management System — Implementation Plan

## Overview
**Timeline**: 8 weeks  
**Priority**: CRITICAL (Foundation for all other modules)  
**Status**: Frontend registration exists; needs backend integration and refactor

---

## Executive Summary

The Patient Management System (PMS) is the cornerstone of the hospital ecosystem. Every module—pharmacy, laboratory, billing, clinical services—depends on accurate patient identity and visit tracking.

**Key Objectives:**
1. Stabilize existing registration frontend
2. Build robust backend with duplicate prevention
3. Implement audit trails for all patient actions
4. Enable reliable patient search across identifiers
5. Support multi-payer workflows (Cash, Insurance, SHA, Corporate, Credit)

**Critical Constraints:**
- NEVER hard delete patient records
- Backend owns UHID generation and duplicate detection
- One active visit per patient (MVP rule)
- All sensitive actions must be auditable

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Database Schema Setup

#### Enums to Add
```prisma
enum PatientStatus {
  ACTIVE
  SUSPENDED
  ARCHIVED
  DECEASED
}

enum Gender {
  MALE
  FEMALE
  OTHER
  UNKNOWN
}

enum MaritalStatus {
  SINGLE
  MARRIED
  DIVORCED
  WIDOWED
  UNKNOWN
}

enum PayerType {
  CASH
  INSURANCE
  CORPORATE
  SHA
  PATIENT_CREDIT
}

enum VisitType {
  OUTPATIENT
  INPATIENT
  EMERGENCY
  DAYCARE
  WALKIN
  REFERRAL
  REVIEW
  FOLLOW_UP_48HRS
}

enum VisitStatus {
  OPEN
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum PatientDocumentType {
  NATIONAL_ID
  PASSPORT
  BIRTH_CERTIFICATE
  INSURANCE_CARD
  OTHER
}

enum PatientAlertType {
  ALLERGY
  FALL_RISK
  VIP
  SECURITY
  PAYMENT_REQUIRED
  CLINICAL_WARNING
  OTHER
}

enum PatientAuditAction {
  PATIENT_CREATED
  PATIENT_UPDATED
  PATIENT_STATUS_CHANGED
  VISIT_CREATED
  VISIT_UPDATED
  VISIT_CANCELLED
  DOCUMENT_UPLOADED
  ALERT_CREATED
  ALERT_RESOLVED
}
```

#### Core Models
- `Patient` - Master patient record with hospitalNumber (UHID)
- `PatientContact` - Next of kin and emergency contacts
- `PatientVisit` - Visit episodes with status tracking
- `PatientPayerProfile` - Insurance/corporate/credit relationships
- `PatientDocument` - Uploaded identity documents (metadata only)
- `PatientAlert` - Active warnings displayed in header
- `PatientAuditLog` - Immutable audit trail

#### Indexes Required
```prisma
@@index([firstName])
@@index([lastName])
@@index([phone])
@@index([nationalId])
@@index([hospitalNumber])
@@index([visitNumber])
@@index([status])
@@index([patientId])
@@index([action])
```

### 1.2 Backend Module Structure

```
backend/src/modules/patient-management/
├── patients/
│   ├── patient.service.js
│   ├── patient.repository.js
│   └── patient.validators.js
├── contacts/
│   ├── patient-contact.service.js
│   └── patient-contact.validators.js
├── visits/
│   ├── patient-visit.service.js
│   └── patient-visit.validators.js
├── payer-profiles/
│   ├── patient-payer-profile.service.js
│   └── patient-payer-profile.validators.js
├── documents/
│   ├── patient-document.service.js
│   └── patient-document.validators.js
├── alerts/
│   ├── patient-alert.service.js
│   └── patient-alert.validators.js
├── audit/
│   ├── patient-audit.service.js
│   └── patient-audit.constants.js
├── search/
│   └── patient-search.service.js
├── utils/
│   ├── patient-number-generator.js
│   └── duplicate-detector.js
└── routes/
    └── patient.routes.js
```

### 1.3 Core Utilities

#### Patient Number Generator (`patient-number-generator.js`)
```javascript
// Format: HSPYYYYNNNNNN (e.g., HSP2026000001)
// Must be generated in transaction to prevent duplicates
// Sequential within year with database-level uniqueness constraint
```

#### Duplicate Detector (`duplicate-detector.js`)
```javascript
// Blocking rules:
// - Exact national ID match → BLOCK
// - Exact passport number match → BLOCK
// 
// Warning rules (show modal with existing patient):
// - Same first name + last name + DOB
// - Same phone number
// - Similar name (fuzzy match > 85%)
```

### 1.4 Audit Service

Track all actions:
- PATIENT_CREATED (with full demographics snapshot)
- PATIENT_UPDATED (with previousValues/newValues JSON)
- PATIENT_STATUS_CHANGED (ACTIVE → SUSPENDED, etc.)
- VISIT_CREATED/VISIT_UPDATED/VISIT_CANCELLED
- DOCUMENT_UPLOADED
- ALERT_CREATED/ALERT_RESOLVED

**Implementation:**
```javascript
await prisma.$transaction(async (tx) => {
  const patient = await tx.patient.create({ data: patientData });
  
  await tx.patientAuditLog.create({
    data: {
      patientId: patient.id,
      actorId: user.id,
      action: 'PATIENT_CREATED',
      entityType: 'Patient',
      entityId: patient.id,
      newValues: sanitizeForAudit(patientData),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }
  });
  
  return patient;
});
```

### 1.5 Validators (Zod Schemas)

#### Create Patient Schema
```javascript
export const createPatientSchema = z.object({
  firstName: z.string().min(2).max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(2).max(100),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']),
  dateOfBirth: z.coerce.date().optional(),
  nationalId: z.string().max(50).optional(),
  passportNumber: z.string().max(50).optional(),
  phone: z.string().regex(/^\+?[254]?[7]\d{8}$/).optional(), // Kenyan format
  alternativePhone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  address: z.string().max(300).optional(),
  county: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'UNKNOWN']).optional()
});
```

#### Create Visit Schema
```javascript
export const createPatientVisitSchema = z.object({
  visitType: z.enum(['OUTPATIENT', 'INPATIENT', 'EMERGENCY', 'DAYCARE', 'WALKIN', 'REFERRAL', 'REVIEW', 'FOLLOW_UP_48HRS']),
  payerType: z.enum(['CASH', 'INSURANCE', 'CORPORATE', 'SHA', 'PATIENT_CREDIT']),
  payerProfileId: z.string().uuid().optional(),
  departmentName: z.string().max(120).optional(),
  clinicName: z.string().max(120).optional(),
  attendingDoctorId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional()
}).refine(data => {
  // Payer profile required for non-cash
  if (data.payerType !== 'CASH' && !data.payerProfileId) {
    return false;
  }
  return true;
}, { message: 'Payer profile required for non-cash patients' });
```

#### Create Payer Profile Schema
```javascript
export const createPatientPayerProfileSchema = z.object({
  payerType: z.enum(['CASH', 'INSURANCE', 'CORPORATE', 'SHA', 'PATIENT_CREDIT']),
  insuranceProvider: z.string().max(160).optional(),
  policyNumber: z.string().max(100).optional(),
  memberNumber: z.string().max(100).optional(),
  corporateAccountId: z.string().uuid().optional(),
  creditAccountId: z.string().uuid().optional(),
  isDefault: z.boolean().default(false),
  notes: z.string().max(1000).optional()
});
```

### Deliverables Week 1-2
- [ ] Prisma schema migrated to Supabase
- [ ] All enums added
- [ ] Patient number generator tested
- [ ] Duplicate detector with blocking/warning logic
- [ ] Audit service logging all actions
- [ ] Zod validators for all entities
- [ ] Repository layer with indexed queries
- [ ] Unit tests for duplicate detection edge cases

---

## Phase 2: Patient Registration & Search (Week 3-4)

### 2.1 Patient Service Functions

#### `createPatient(patientData, user, req)`
```javascript
// Business rules:
// 1. Run duplicate detection
// 2. Generate UHID in transaction
// 3. Create patient record
// 4. Create audit log
// 5. Return full patient object with hospitalNumber
```

#### `updatePatient(patientId, updates, user, req)`
```javascript
// Business rules:
// 1. Cannot update if patient is DECEASED (except minimal fields)
// 2. Cannot change nationalId/passport if already set (requires admin override)
// 3. Log previousValues and newValues in audit
// 4. Update updatedAt automatically
```

#### `getPatientById(patientId)`
```javascript
// Returns:
// - Patient demographics
// - Active alerts
// - Latest visit status
// - Default payer profile
// - Contact count
```

#### `searchPatients(query, options)`
```javascript
// Search strategies (in priority order):
// 1. Exact UHID match (hospitalNumber)
// 2. Exact national ID match
// 3. Exact passport number match
// 4. Phone number match
// 5. Name search (firstName OR lastName, case-insensitive, partial match)
// 6. Combined: firstName + lastName + DOB
//
// Returns: Paginated results with relevance scoring
```

### 2.2 API Endpoints

#### Patient Endpoints
```http
GET    /api/patients                      # List with pagination & filters
POST   /api/patients                      # Register new patient
GET    /api/patients/:id                  # Get patient details
PATCH  /api/patients/:id                  # Update patient demographics
POST   /api/patients/:id/archive          # Archive patient (soft delete)
POST   /api/patients/:id/activate         # Reactivate archived patient
POST   /api/patients/:id/suspend          # Suspend patient (e.g., fraudulent)
POST   /api/patients/:id/deceased         # Mark as deceased (requires certificate)
GET    /api/patients/search               # Search with query params
GET    /api/patients/uhid/:uhid           # Lookup by UHID only
```

#### Request/Response Examples

**POST /api/patients**
```json
// Request
{
  "firstName": "John",
  "lastName": "Kamau",
  "gender": "MALE",
  "dateOfBirth": "1990-05-15",
  "nationalId": "12345678",
  "phone": "+254712345678",
  "email": "john@example.com",
  "county": "Nairobi",
  "city": "Nairobi"
}

// Success Response
{
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "id": "uuid",
    "hospitalNumber": "HSP2026000001",
    "firstName": "John",
    "lastName": "Kamau",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}

// Error Response (Duplicate)
{
  "success": false,
  "message": "A patient with this national ID already exists",
  "errors": [],
  "duplicatePatient": {
    "id": "uuid",
    "hospitalNumber": "HSP2025000123",
    "fullName": "John Kamau",
    "dateOfBirth": "1990-05-15",
    "phone": "+254712345678"
  }
}
```

**GET /api/patients/search?query=HSP2026**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "uuid",
        "hospitalNumber": "HSP2026000001",
        "fullName": "John Kamau",
        "age": 35,
        "phone": "+254712345678",
        "lastVisit": "2026-01-10",
        "activeAlerts": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

### 2.3 Frontend Integration Strategy

#### DO NOT Rebuild Registration Page
The existing registration page already supports:
- Multi-tab workflow (Demographics, Payer, NOK/Emergency, Administrative)
- UHID lookup
- Duplicate warnings
- Dynamic payer validation
- Kenyan phone validation
- DOB age calculation

#### Refactor Tasks
1. **Extract Custom Hooks**
   - `usePatientRegistrationForm()` - Form state, validation, payload generation
   - `usePatientLookup()` - UHID search, patient selection, prefill logic
   - `usePatientValidation()` - Orchestrate duplicate checks

2. **Migrate to React Hook Form**
   - Replace manual useState with RHF
   - Use Zod resolver for validation
   - Handle nested fields (contacts[], payerProfiles[])
   - Simplify reset logic after successful submission

3. **Replace Simulated Submission**
   ```javascript
   // BEFORE
   await new Promise(resolve => setTimeout(resolve, 1500));
   
   // AFTER
   const mutation = useMutation({
     mutationFn: registerPatient,
     onSuccess: (data) => {
       showSuccessModal(data.hospitalNumber);
       reset();
     },
     onError: (error) => {
       if (error.duplicatePatient) {
         showDuplicateModal(error.duplicatePatient);
       }
     }
   });
   ```

4. **Add React Query Hooks**
   ```javascript
   usePatientSearch(query)
   usePatientById(id)
   usePatientByUhid(uhid)
   usePatientVisits(patientId)
   usePatientPayerProfiles(patientId)
   usePatientAlerts(patientId)
   ```

### Deliverables Week 3-4
- [ ] Patient CRUD APIs fully functional
- [ ] Duplicate detection with blocking/warning UI
- [ ] Patient search with debouncing and pagination
- [ ] UHID lookup endpoint
- [ ] Frontend migrated to React Hook Form
- [ ] Custom hooks extracted (usePatientRegistrationForm, usePatientLookup)
- [ ] React Query integration for all server state
- [ ] Success modal showing generated UHID
- [ ] Duplicate warning modal with existing patient details
- [ ] Unit tests for all service functions

---

## Phase 3: Contacts & Payer Profiles (Week 5)

### 3.1 Patient Contact Service

#### Functions
```javascript
createContact(patientId, contactData, user)
updateContact(contactId, updates, user)
deleteContact(contactId, user)  // Soft delete via isActive flag
setPrimaryContact(contactId, patientId)
setEmergencyContact(contactId, patientId)
getContactsByPatient(patientId)
```

#### Business Rules
- Each patient can have multiple contacts
- One contact can be marked as `isPrimary: true`
- One or more contacts can be marked as `isEmergency: true`
- Cannot delete last remaining contact (warn user)
- Phone numbers validated (Kenyan format)

### 3.2 Patient Payer Profile Service

#### Functions
```javascript
createPayerProfile(patientId, profileData, user)
updatePayerProfile(profileId, updates, user)
deactivatePayerProfile(profileId, user)
setDefaultPayerProfile(profileId, patientId)
getPayerProfilesByPatient(patientId)
getDefaultPayerProfile(patientId)
validatePayerProfileForVisit(payerType, payerProfileId)
```

#### Business Rules
- Patients can have multiple payer profiles (e.g., both insurance and corporate)
- One profile must be `isDefault: true`
- If payer type is INSURANCE/SHA/CORPORATE/CREDIT, profile is required
- CASH payer does not require a profile
- Cannot deactivate default profile without setting new default first
- Corporate/credit profiles must reference valid account IDs

### 3.3 API Endpoints

#### Contact Endpoints
```http
GET    /api/patients/:patientId/contacts
POST   /api/patients/:patientId/contacts
PATCH  /api/patients/contacts/:id
DELETE /api/patients/contacts/:id
POST   /api/patients/contacts/:id/set-primary
POST   /api/patients/contacts/:id/set-emergency
```

#### Payer Profile Endpoints
```http
GET    /api/patients/:patientId/payer-profiles
POST   /api/patients/:patientId/payer-profiles
PATCH  /api/patients/payer-profiles/:id
POST   /api/patients/payer-profiles/:id/set-default
POST   /api/patients/payer-profiles/:id/deactivate
```

### 3.4 Frontend Components

#### Contacts Tab
- Add/edit/delete contact form
- Toggle switches for "Primary Contact" and "Emergency Contact"
- Validation: At least one phone number required
- Display: Relationship, phone, email, address

#### Payer Details Tab
- Dynamic form based on selected payer type:
  - **CASH**: No additional fields
  - **INSURANCE/SHA**: Provider, policy number, member number
  - **CORPORATE**: Corporate account selector
  - **PATIENT_CREDIT**: Credit account selector
- "Set as Default" checkbox
- Active/inactive toggle
- Notes field

### Deliverables Week 5
- [ ] Contact CRUD APIs
- [ ] Payer profile CRUD APIs
- [ ] Default payer logic enforced
- [ ] Emergency contact flagging
- [ ] Frontend tabs fully connected to APIs
- [ ] Dynamic payer form validation
- [ ] Corporate/credit account integration (dropdown selectors)
- [ ] Unit tests for payer validation rules

---

## Phase 4: Visit Management (Week 6)

### 4.1 Patient Visit Service

#### Functions
```javascript
createVisit(patientId, visitData, user)
updateVisit(visitId, updates, user)
completeVisit(visitId, completedBy)
cancelVisit(visitId, reason, cancelledBy)
getVisitById(visitId)
getVisitsByPatient(patientId, filters)
getActiveVisit(patientId)
```

#### Business Rules
- **One active visit per patient** (MVP rule)
  - Cannot create new visit if patient has OPEN or IN_PROGRESS visit
  - Admin/receptionist override permission: `patients.visits.override_active`
- Visit number auto-generated: `VST-YYYYNNNNNN`
- Status transitions:
  - OPEN → IN_PROGRESS (when doctor starts consultation)
  - IN_PROGRESS → COMPLETED (when consultation ends)
  - OPEN/IN_PROGRESS → CANCELLED (with reason required)
- Cannot cancel visit with financial activity (requires finance review)
- COMPLETED visits cannot be modified

### 4.2 API Endpoints

```http
GET    /api/patients/:patientId/visits
POST   /api/patients/:patientId/visits
GET    /api/patients/visits/:id
PATCH  /api/patients/visits/:id
POST   /api/patients/visits/:id/complete
POST   /api/patients/visits/:id/cancel
GET    /api/patients/visits/active/:patientId
```

#### Request Example
```json
// POST /api/patients/:patientId/visits
{
  "visitType": "OUTPATIENT",
  "payerType": "INSURANCE",
  "payerProfileId": "uuid",
  "departmentName": "General Outpatient Clinic",
  "clinicName": "Medical Clinic",
  "attendingDoctorId": "uuid",
  "notes": "Follow-up for hypertension"
}
```

### 4.3 Frontend Pages

#### Visits Page (`/patients/:id/visits`)
- Table of all visits with columns:
  - Visit Number
  - Type (OUTPATIENT, INPATIENT, etc.)
  - Status (badge color-coded)
  - Department/Clinic
  - Check-in Date
  - Completed/Cancelled Date
  - Actions (View, Complete, Cancel)
- "Create New Visit" button (disabled if active visit exists, unless override)
- Filter by status, type, date range
- Export to CSV

#### Create Visit Modal
- Visit type dropdown
- Payer type dropdown (pre-filled from default profile)
- Payer profile selector (if multiple profiles exist)
- Department/clinic text inputs
- Doctor selector (optional)
- Notes textarea
- Validation: Payer profile required for non-cash

### Deliverables Week 6
- [ ] Visit CRUD APIs
- [ ] One-active-visit enforcement
- [ ] Status transition logic
- [ ] Visit number generation
- [ ] Complete/cancel endpoints with audit logging
- [ ] Visits page with table and filters
- [ ] Create visit modal
- [ ] Active visit warning UI
- [ ] Override permission check
- [ ] Unit tests for visit lifecycle

---

## Phase 5: Documents & Alerts (Week 7)

### 5.1 Document Service

#### Functions
```javascript
uploadDocument(patientId, file, documentType, notes, user)
getDocumentsByPatient(patientId)
deleteDocument(documentId, user)
getDocumentById(documentId)
```

#### Business Rules
- Files stored in **Supabase Storage** (not database)
- Database stores metadata only: fileName, fileUrl, mimeType, fileSize
- Allowed file types: PDF, JPG, PNG, WEBP
- Max file size: 5MB (configurable)
- Document types: NATIONAL_ID, PASSPORT, BIRTH_CERTIFICATE, INSURANCE_CARD, OTHER
- Cannot delete if patient has active visits (requires admin override)
- Audit log created on upload/delete

#### Supabase Storage Setup
```javascript
// Bucket: patient-documents
// Path pattern: {patientId}/{documentType}/{timestamp}-{fileName}
// RLS Policy: Only authenticated users with patients.view permission
```

### 5.2 Alert Service

#### Functions
```javascript
createAlert(patientId, alertData, user)
resolveAlert(alertId, resolvedBy)
getActiveAlertsByPatient(patientId)
getAllAlertsByPatient(patientId)
getAlertById(alertId)
```

#### Business Rules
- Alert types: ALLERGY, FALL_RISK, VIP, SECURITY, PAYMENT_REQUIRED, CLINICAL_WARNING, OTHER
- Active alerts (`isActive: true`) displayed prominently in patient header
- Alerts require title; description optional
- Only creator or admin can resolve alert
- Resolved alerts retained in history (not deleted)
- Audit log created on creation/resolution

### 5.3 API Endpoints

#### Document Endpoints
```http
GET    /api/patients/:patientId/documents
POST   /api/patients/:patientId/documents      # Multipart form data
DELETE /api/patients/documents/:id
GET    /api/patients/documents/:id/download    # Presigned URL
```

#### Alert Endpoints
```http
GET    /api/patients/:patientId/alerts
POST   /api/patients/:patientId/alerts
POST   /api/patients/alerts/:id/resolve
GET    /api/patients/alerts/active             # All active alerts across patients
```

### 5.4 Frontend Components

#### Documents Tab
- File upload dropzone with drag-and-drop
- Document type selector
- Table of uploaded documents:
  - File name (clickable download link)
  - Type
  - Upload date
  - Uploaded by
  - Actions (Delete)
- File size and type validation
- Progress indicator during upload

#### Alerts Section (Patient Header)
- Red banner for critical alerts (ALLERGY, SECURITY, FALL_RISK)
- Yellow banner for warnings (PAYMENT_REQUIRED, CLINICAL_WARNING)
- Blue banner for informational (VIP)
- Click to expand full alert details
- "Resolve" button for authorized users

#### Alerts Tab
- Create alert form (type, title, description)
- List of all alerts (active and resolved)
- Status badges (Active/Resolved)
- Resolve button with confirmation
- Filter by status and type

### Deliverables Week 7
- [ ] Supabase Storage bucket configured
- [ ] Document upload API with multipart support
- [ ] Presigned URL generation for downloads
- [ ] Alert CRUD APIs
- [ ] Alert resolution workflow
- [ ] Patient header component showing active alerts
- [ ] Documents tab with upload/download
- [ ] Alerts tab with create/resolve
- [ ] File type/size validation
- [ ] Unit tests for document and alert workflows

---

## Phase 6: Reports (Week 8, Part 1)

### 6.1 Report Service Functions

```javascript
getRegistrationReport(startDate, endDate, filters)
getVisitReport(startDate, endDate, filters)
getPayerTypeReport(startDate, endDate)
getActivePatientsReport(asOfDate)
getArchivedPatientsReport()
getDocumentUploadsReport(startDate, endDate)
getActiveAlertsReport()
exportToCSV(data, columns, filename)
```

### 6.2 Required Reports

#### Daily Registrations Report
- Total registrations today
- Registrations by gender
- Registrations by age group (0-5, 6-18, 19-35, 36-50, 51-65, 65+)
- Registrations by county
- Hourly distribution chart

#### Visits Report
- Total visits in period
- Visits by type (OUTPATIENT, INPATIENT, EMERGENCY, etc.)
- Visits by department/clinic
- Visits by status
- Average visit duration (check-in to completion)
- Visits by payer type

#### Payer Type Distribution
- Pie chart: CASH vs INSURANCE vs SHA vs CORPORATE vs CREDIT
- Trend line over time
- Top insurance providers
- Top corporate accounts

#### Active Patients Report
- Total active patients as of date
- Patients with active visits
- Patients with outstanding balances (integration with billing)
- Patients with active alerts

#### Document Uploads Report
- Total documents uploaded
- Documents by type
- Average file size
- Uploads per day

#### Active Alerts Report
- Total active alerts
- Alerts by type
- Alerts unresolved > 7 days
- Alerts by creator

### 6.3 API Endpoints

```http
GET /api/patients/reports/registrations?startDate=&endDate=
GET /api/patients/reports/visits?startDate=&endDate=
GET /api/patients/reports/payer-types?startDate=&endDate=
GET /api/patients/reports/active-patients?asOf=
GET /api/patients/reports/archived-patients
GET /api/patients/reports/documents?startDate=&endDate=
GET /api/patients/reports/alerts
GET /api/patients/reports/export?type=registrations&format=csv
```

### 6.4 Frontend Reports Page

#### Features
- Date range picker (today, last 7 days, last 30 days, custom)
- Report type selector
- Interactive charts (Recharts library)
- Data tables with sorting
- Export buttons (CSV, PDF)
- Print-friendly layout
- Filter controls (department, payer type, county, etc.)

### Deliverables Week 8 (Part 1)
- [ ] All report service functions implemented
- [ ] Report APIs with date filtering
- [ ] CSV export functionality
- [ ] PDF export using pdfkit (consistent with pharmacy module)
- [ ] Reports dashboard page
- [ ] Interactive charts for key metrics
- [ ] Export buttons working
- [ ] Date range filters
- [ ] Unit tests for report calculations

---

## Phase 7: Frontend Refactor & Polish (Week 8, Part 2)

### 7.1 Modularization Tasks

#### Break Down Registration Page
Current monolithic component → Modular structure:
```
components/registration/
├── PatientRegistrationPage.jsx    # Main container
├── PatientDemographicsTab.jsx     # Tab 1: Personal info
├── PatientPayerDetailsTab.jsx     # Tab 2: Insurance/corporate
├── PatientNokEmergencyTab.jsx     # Tab 3: Contacts
├── PatientAdministrativeTab.jsx   # Tab 4: Documents, alerts
├── PatientSearchBox.jsx           # Reusable search input
├── PatientSuccessModal.jsx        # Post-registration success
├── PatientHeader.jsx              # Patient summary banner
├── PatientAgePreview.jsx          # Age calculator display
└── DuplicateWarningModal.jsx      # Duplicate detection popup
```

#### Extract Custom Hooks
```javascript
// hooks/usePatientRegistrationForm.js
export function usePatientRegistrationForm() {
  // useForm initialization
  // Validation schema
  // Payload transformation
  // Touched state management
  // Reset logic
  // Derived values (age, full name)
}

// hooks/usePatientLookup.js
export function usePatientLookup() {
  // Debounced search
  // UHID lookup
  // Patient selection
  // Prefill logic
  // Loading states
}

// hooks/usePatientValidation.js
export function usePatientValidation() {
  // Duplicate check orchestration
  // Phone validation
  // Email validation
  // Payer profile validation
  // Error formatting
}
```

### 7.2 React Query Integration

#### Query Keys
```javascript
const patientKeys = {
  all: ['patients'],
  lists: () => [...patientKeys.all, 'list'],
  list: (filters) => [...patientKeys.lists(), filters],
  details: () => [...patientKeys.all, 'detail'],
  detail: (id) => [...patientKeys.details(), id],
  uhid: (uhid) => [...patientKeys.all, 'uhid', uhid],
  search: (query) => [...patientKeys.all, 'search', query],
  visits: (patientId) => [...patientKeys.detail(patientId), 'visits'],
  payerProfiles: (patientId) => [...patientKeys.detail(patientId), 'payerProfiles'],
  alerts: (patientId) => [...patientKeys.detail(patientId), 'alerts'],
  documents: (patientId) => [...patientKeys.detail(patientId), 'documents']
};
```

#### Custom Hooks
```javascript
export function usePatientSearch(query) {
  return useQuery({
    queryKey: patientKeys.search(query),
    queryFn: () => patientApi.search(query),
    enabled: query.length >= 3,
    staleTime: 5 * 60 * 1000
  });
}

export function usePatientById(id) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientApi.getById(id),
    staleTime: 10 * 60 * 1000
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: patientApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      toast.success(`Patient registered: ${data.hospitalNumber}`);
    }
  });
}
```

### 7.3 Zustand Cleanup

#### Remove Server State
Delete any patient-related state from Zustand stores:
```javascript
// BEFORE (WRONG)
const usePatientStore = create((set) => ({
  currentPatient: null,
  searchResults: [],
  setPatient: (patient) => set({ currentPatient: patient }),
  setSearchResults: (results) => set({ searchResults: results })
}));

// AFTER (CORRECT)
// Use React Query for server state
// Use Zustand ONLY for UI state
const usePatientUIStore = create((set) => ({
  isRegistrationModalOpen: false,
  activeTab: 'demographics',
  duplicatePatientToShow: null,
  openRegistrationModal: () => set({ isRegistrationModalOpen: true }),
  closeRegistrationModal: () => set({ isRegistrationModalOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDuplicatePatientToShow: (patient) => set({ duplicatePatientToShow: patient })
}));
```

### 7.4 Patient Profile Page

#### Route: `/patients/:id`
Tabs:
1. **Overview**
   - Demographics card
   - Active alerts banner
   - Current visit status
   - Default payer profile
   - Quick stats (total visits, documents, alerts)

2. **Visits**
   - Visit history table
   - Create new visit button
   - Filter by status/type

3. **Payer Profiles**
   - List of all payer profiles
   - Add new profile button
   - Set default toggle
   - Activate/deactivate

4. **Contacts**
   - Next of kin cards
   - Emergency contacts
   - Add/edit/delete

5. **Documents**
   - Uploaded files grid
   - Upload new document
   - Download/delete

6. **Alerts**
   - Active alerts
   - Resolved alerts history
   - Create new alert
   - Resolve alert

7. **Audit Trail**
   - Timeline of all changes
   - Filter by action type
   - View before/after snapshots

### Deliverables Week 8 (Part 2)
- [ ] Registration page modularized into components
- [ ] Custom hooks extracted (usePatientRegistrationForm, usePatientLookup, usePatientValidation)
- [ ] React Query hooks for all entities
- [ ] Zustand cleaned up (UI state only)
- [ ] Patient profile page with 7 tabs
- [ ] Patient dashboard page
- [ ] Patient search page with quick preview
- [ ] All forms migrated to React Hook Form
- [ ] Loading states and error handling
- [ ] Optimistic updates where appropriate
- [ ] Unit tests for hooks
- [ ] E2E tests for registration workflow

---

## Cross-Module Integration

### Pharmacy Integration
```javascript
// When dispensing medication:
// 1. Lookup patient by ID
// 2. Verify active visit exists
// 3. Check payer type from visit
// 4. Validate payer profile
// 5. Create pharmacy sale linked to visit
```

### Billing Integration
```javascript
// When creating invoice:
// 1. Get patient's default payer profile
// 2. Determine if cash or credit
// 3. For credit: validate credit account
// 4. Link invoice to patient and visit
```

### Laboratory/Radiology Integration
```javascript
// When ordering test:
// 1. Verify patient has active visit
// 2. Attach order to visit
// 3. Use patient demographics for report header
// 4. Show patient alerts to technician
```

### Cash Management Integration
```javascript
// When recording payment:
// 1. Link payment to patient account
// 2. Update patient balance
// 3. Create audit log
// 4. Notify if payment alert should be cleared
```

---

## Testing Strategy

### Unit Tests (Jest)
- Patient number generation (sequential, no duplicates)
- Duplicate detection logic (blocking vs warning)
- Payer profile validation (required for non-cash)
- Visit lifecycle transitions
- Alert creation/resolution
- Report calculations

### Integration Tests (Supertest)
- Full registration workflow
- Search with various query types
- Visit creation with active visit check
- Document upload to Supabase
- Payer profile CRUD operations

### E2E Tests (Playwright/Cypress)
- Register new patient end-to-end
- Search and select existing patient
- Create visit for patient
- Upload document
- Create and resolve alert
- Generate and export report

### Performance Tests
- Patient search with 100k+ records (< 200ms response)
- Concurrent registration requests (no UHID collisions)
- Large document uploads (5MB files)

---

## Security Considerations

### Access Control
```javascript
// Permissions required:
patients.create           // Register new patients
patients.view             // View patient details
patients.update           // Update demographics
patients.archive          // Archive patients
patients.search           // Search patients
patients.visits.create    // Create visits
patients.visits.cancel    // Cancel visits
patients.payer_profiles.manage
patients.documents.upload
patients.alerts.create
patients.alerts.resolve
patients.reports.view
```

### Data Privacy
- Encrypt sensitive fields at rest (national ID, passport)
- Mask national ID in API responses (show last 4 digits only)
- Audit all access to patient records
- Role-based visibility (receptionist vs doctor vs auditor)
- Session timeout for idle users

### Rate Limiting
- Search endpoint: 100 requests/minute per user
- Registration: 20 requests/minute per user
- Document upload: 10 requests/minute per user

---

## Deployment Checklist

### Database
- [ ] All migrations applied to Supabase
- [ ] Indexes verified on search columns
- [ ] RLS policies configured for Supabase Storage
- [ ] Backup strategy in place

### Backend
- [ ] Environment variables configured
- [ ] Supabase client initialized
- [ ] File upload limits configured
- [ ] Audit logging enabled
- [ ] Rate limiting enabled

### Frontend
- [ ] React Query devtools disabled in production
- [ ] Error boundaries in place
- [ ] Loading states for all async operations
- [ ] Form validation messages clear and helpful
- [ ] Mobile-responsive layouts tested

### Monitoring
- [ ] Winston logs shipping to centralized system
- [ ] Error tracking (Sentry) configured
- [ ] Performance metrics tracked
- [ ] Alert thresholds defined

---

## Definition of Done

The Patient Management System is complete when:

### Backend
- [ ] All Prisma models and enums implemented
- [ ] Patient number generation works (no duplicates)
- [ ] Duplicate detection blocks/warns appropriately
- [ ] All CRUD APIs functional with validation
- [ ] Audit logs created for all sensitive actions
- [ ] Search is fast and accurate (indexed)
- [ ] File uploads work with Supabase Storage
- [ ] All business rules enforced server-side

### Frontend
- [ ] Registration page uses real APIs (no simulated delays)
- [ ] React Hook Form migration complete
- [ ] React Query manages all server state
- [ ] Zustand used only for UI state
- [ ] Duplicate warning modal shows existing patient
- [ ] Success modal displays generated UHID
- [ ] Patient search is debounced and paginated
- [ ] Patient profile page shows all related data
- [ ] All forms have proper validation and error messages
- [ ] Loading states and error handling implemented
- [ ] Responsive design works on tablets

### Integration
- [ ] Pharmacy can lookup patients and verify visits
- [ ] Billing can access payer profiles
- [ ] Laboratory can view patient alerts
- [ ] Cash management can link payments to patients

### Quality
- [ ] Unit test coverage > 80%
- [ ] Integration tests for critical workflows
- [ ] E2E tests for registration and search
- [ ] Performance tests pass (search < 200ms)
- [ ] Security audit completed
- [ ] Accessibility (WCAG AA) verified

### Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Component documentation (Storybook)
- [ ] User guide for receptionists
- [ ] Admin guide for configuration
- [ ] Troubleshooting runbook

---

## Risk Mitigation

### High-Risk Items
1. **Duplicate Patient Records**
   - Mitigation: Strict blocking on national ID/passport, fuzzy matching on names
   - Fallback: Manual merge process (future enhancement)

2. **UHID Generation Collisions**
   - Mitigation: Database unique constraint + transaction
   - Fallback: Retry logic with exponential backoff

3. **Search Performance Degradation**
   - Mitigation: Proper indexing, query optimization
   - Fallback: Pagination, result limits, caching

4. **Frontend Regression During Refactor**
   - Mitigation: Incremental migration, feature flags
   - Fallback: Rollback to previous version

5. **Supabase Storage Downtime**
   - Mitigation: Graceful degradation (metadata saved, retry upload)
   - Fallback: Local temporary storage

---

## Future Enhancements (Post-MVP)

### Phase 9+ (Not in MVP Scope)
- Patient portal for self-registration
- SMS notifications for appointments
- Biometric identification (fingerprint)
- Advanced duplicate merging tools
- Family relationship tracking
- Patient photo capture
- Document OCR for automatic data extraction
- Appointment scheduling module
- Queue management integration
- Multi-facility patient identifier mapping
- GDPR/compliance data export tools
- Patient consent management
- Advanced reporting with custom dashboards

---

## Conclusion

The Patient Management System is the foundation upon which all other hospital modules depend. By prioritizing:

1. **Reliable patient identity** (UHID, duplicate prevention)
2. **Comprehensive audit trails** (every action logged)
3. **Flexible payer support** (cash, insurance, SHA, corporate, credit)
4. **Stable visit tracking** (one active visit rule)
5. **Clean architecture** (backend owns business rules)

...we create a system that will serve the hospital reliably for years to come.

The existing registration frontend is a strong starting point. Rather than rebuilding, we will:
- Stabilize and modularize
- Connect to real backend APIs
- Migrate to React Hook Form and React Query
- Incrementally improve maintainability

This approach minimizes risk while delivering a production-ready system in 8 weeks.
