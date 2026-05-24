# MediCore Theme Implementation Audit

## Overview
This audit identifies pages that need updates to align with the MediCore HMIS theme defined in `theme.md`. The theme is heavily based on the `RegistrationForm.jsx` reference implementation.

## Core Theme Tokens (from theme.md)

### Colors
- **Primary**: `cyan-700` (active states, primary buttons)
- **Secondary accents**: `cyan-600`, `cyan-500`, `cyan-400`
- **Background**: `slate-50` / `#f8fafc`
- **Text**: `slate-950`, `slate-900` (primary), `slate-600`, `slate-500` (secondary), `slate-400` (muted)
- **Borders**: `slate-200` (standard), `slate-200/80` (subtle)
- **Status colors**: `emerald` (success), `amber` (warning), `rose/red` (error)

### Shape & Elevation
- **Inputs**: `rounded-lg` (8px)
- **Tabs/Search**: `rounded-xl` (12px)
- **Cards/Sections**: `rounded-2xl` (16px)
- **Modals**: `rounded-3xl` (for focused confirmations)
- **Default elevation**: `shadow-sm`
- **Dropdowns**: `shadow-2xl` + `ring-1 ring-black/5`

### Form Controls
- Height: `h-10` (40px)
- Border: `border-slate-200`
- Focus: `focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10`
- Label: `text-sm font-semibold text-slate-800 mb-1.5`
- Required marker: `ml-0.5 text-rose-600`

---

## Pages Requiring Updates

### 1. Authentication Pages ❌

#### `/features/auth/pages/LoginPage.jsx`
**Issues:**
- Uses generic `bg-slate-100` instead of theme background
- Card uses `rounded-xl` but should use `rounded-2xl` or `rounded-3xl` for modal-like feel
- Missing cyan accent header panel
- Button styles don't match theme (`bg-primary` vs `bg-cyan-700`)
- Input fields missing proper focus states

**Required Changes:**
```jsx
// Current
<div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
<Card className="w-full max-w-md">

// Should be
<div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
<div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]">
  <div className="rounded-t-3xl border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-6 py-4">
    <h1 className="text-lg font-bold text-slate-900">Sign In</h1>
    <p className="text-sm text-slate-600">Access your hospital cash management account</p>
  </div>
```

#### `/features/auth/pages/ProfilePage.jsx`
**Issues:**
- Uses generic card components without theme styling
- Missing section cards with proper headers
- Stats boxes use `rounded-lg bg-slate-50` instead of `rounded-2xl`
- No proper page header with gradient panel

#### `/features/auth/components/ChangePasswordForm.jsx`
**Issues:**
- Dialog content should use `rounded-3xl` for confirmation moments
- Input fields missing proper label styling
- Missing error state styling per theme

---

### 2. User Management Pages ⚠️

#### `/features/users/pages/UsersPage.jsx`
**Issues:**
- Page header missing gradient cyan-to-sky panel
- Card component uses default styling
- Table lacks proper theme styling
- Search input missing proper focus states

**Required Changes:**
```jsx
// Add page header
<div className="overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-6">
  <h1 className="text-xl font-bold text-slate-900">User Management</h1>
  <p className="text-sm text-slate-600">Manage hospital staff accounts and permissions</p>
</div>

// Section cards
<section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
  <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
    <p className="text-sm text-slate-600">All Users Directory</p>
  </div>
```

#### `/features/users/pages/UserDetailPage.jsx`
**Issues:**
- Similar issues as UsersPage
- Tabs need proper styling (pill buttons with `rounded-xl`)
- Stats cards need `rounded-2xl` with proper shadows

#### `/features/users/components/CreateUserForm.jsx`
**Issues:**
- Dialog should use `rounded-3xl`
- Form fields need proper label/error styling
- Grid layout should follow theme spacing

---

### 3. Departments Pages ⚠️

#### `/features/departments/pages/DepartmentsPage.jsx`
**Issues:**
- Uses `text-gray-*` instead of `text-slate-*`
- Container uses generic `rounded-lg`
- Form labels missing proper styling
- Missing section card structure

**Required Changes:**
```jsx
// Replace all text-gray-* with text-slate-*
// Change rounded-lg to rounded-2xl for cards
// Update form structure
<div className="space-y-5">
  <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
```

---

### 4. EMR Pages ❌

#### `/features/emr/pages/EmrDashboardPage.jsx`
**Issues:**
- Heavy use of `text-gray-500` throughout
- Cards use generic styling without theme tokens
- Missing proper page header
- Stats cards lack proper icon treatments
- Table needs theme styling

**Critical Issues:**
```jsx
// Current
<p className="text-gray-500">Total Encounters</p>

// Should be
<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Encounters</p>
```

#### `/features/emr/pages/EmrEncounterWorkspacePage.jsx`
**Issues:**
- Multiple `text-gray-500` instances
- Missing proper section cards
- Form layout doesn't follow theme grid system

#### All EMR Component Forms
(`OrderForm.jsx`, `DiagnosisForm.jsx`, `TriageForm.jsx`, `PrescriptionForm.jsx`, `SoapNoteForm.jsx`, `VitalsForm.jsx`, `DischargeSummaryForm.jsx`)
**Issues:**
- Need consistent form field styling
- Missing proper section headers
- Tab navigation needs theme styling
- Error states not following theme

---

### 5. Appointment Management Pages ❌

#### `/features/appointment-management/pages/AppointmentsDashboardPage.jsx`
**Issues:**
- Uses Tailwind default colors (`bg-blue-500`, etc.) instead of theme colors
- Stats cards use inline styles
- Missing proper page header with gradient
- Quick actions section needs proper button styling

**Required Changes:**
```jsx
// Current
<div className={`w-3 h-3 rounded-full ${stat.color} mr-3`}></div>

// Should be
<div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
```

#### Other Appointment Pages
(`AppointmentCheckInPage.jsx`, `BookAppointmentPage.jsx`, `AppointmentCalendarPage.jsx`, `AppointmentReportsPage.jsx`, `AppointmentDetailsPage.jsx`)
**Issues:**
- Likely similar issues as dashboard
- Need verification and updates

---

### 6. Cash Management Pages ⚠️

#### `/features/cash/pages/CashDashboard.jsx`
**Issues:**
- Mixes old and new component imports
- Some proper theme usage but inconsistent
- Stats cards could be improved with proper icon treatments
- Table needs consistent styling

**Partial Compliance:**
- Uses some correct colors (`bg-cyan-100`, `text-cyan-700`)
- But still uses `rounded-lg` in some places

#### Other Cash Pages
(`CashCountersPage.jsx`, `CashSessionsPage.jsx`, `CashSessionDetailsPage.jsx`, `CashierProfilesPage.jsx`)
**Issues:**
- Need verification for theme compliance
- Forms likely need updates

---

### 7. Invoice Management Pages ⚠️

#### `/features/invoice-management/pages/InvoicesPage.jsx`
**Issues:**
- Mixes theme-compliant and non-compliant elements
- Stats cards use `rounded-full` icons inconsistently
- Table styling mostly good but could be improved
- Filter section needs proper input styling

#### Other Invoice Pages
(`CreateInvoicePage.jsx`, `InvoiceDetailsPage.jsx`, `InvoicePreview.jsx`, `InvoiceReportsPage.jsx`, `InvoiceDisputesPage.jsx`)
**Issues:**
- `InvoiceReportsPage.jsx` uses `rounded-lg` extensively
- Need consistent form styling
- Report layouts need theme alignment

---

### 8. Finance Pages ❌

All pages in `/pages/Finance/`:
- `AgingAnalysis.jsx`
- `CashierTransactions.jsx`
- `CreditPayments.jsx`
- `Debtors.jsx`
- `Dispatches.jsx`
- `FinanceDashboard.jsx`
- `InsuranceClaimPayments.jsx`
- `InvoicePreview.jsx`
- `Invoices.jsx`
- `OpConsBilling.jsx`
- `OpServiceBilling.jsx`
- `Schemes.jsx`

**Issues:**
- Identified by grep as using `rounded-lg`, `text-gray-*`, or `bg-slate-100`
- Need comprehensive review and updates

---

### 9. Patient Management ⚠️

#### `/pages/Patient/PatientList.jsx`
**Status:** ✅ Mostly Compliant
**Minor Issues:**
- Generally follows theme well
- Some areas could be tightened

#### `/pages/Patient/RegistrationForm.jsx`
**Status:** ✅ Reference Implementation
**Notes:** This is the gold standard - all other pages should match this

---

### 10. User Management Shell ⚠️

#### `/pages/UserManagement/UserManagementShell.jsx`
**Status:** ✅ Mostly Compliant
**Notes:** Good theme implementation, serves as secondary reference

---

## UI Components Requiring Updates

### `/components/ui/Input.jsx`
**Issues:**
- Default border uses `border-input` CSS variable instead of `border-slate-200`
- Focus ring uses `ring-ring` instead of explicit cyan colors
- Missing proper label styling (should be `text-sm font-semibold text-slate-800`)
- Error styling uses `border-destructive` instead of `border-red-300`

**Required Changes:**
```jsx
// Current
className={cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent ...",
  error && "border-destructive focus-visible:ring-destructive",

// Should be
className={cn(
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-600/10",
  error && "border-red-300 focus:border-red-400 focus:ring-red-500/10",
```

### `/components/ui/Card.jsx`
**Issues:**
- Uses `rounded-xl` instead of `rounded-2xl`
- Uses CSS variables instead of explicit theme colors
- Missing proper shadow (`shadow-sm`)

### `/components/ui/Button.jsx`
**Issues:**
- Uses `rounded-md` instead of `rounded-lg` or `rounded-xl`
- Variant colors use CSS variables
- Should have explicit cyan colors for primary

### `/components/ui/Select.jsx`
**Issues:**
- Needs to match input field styling
- Dropdown should use `shadow-2xl ring-1 ring-black/5`

### `/components/ui/Table.jsx`
**Issues:**
- Needs proper header styling (`bg-slate-50`, `text-[9px] font-bold uppercase`)
- Row hover states need cyan tint
- Border colors need updating

### `/components/ui/Tabs.jsx`
**Issues:**
- Tab buttons should be `rounded-xl px-3.5 py-2`
- Active tab: `bg-cyan-700 text-white`
- Inactive tab: `text-slate-700 hover:bg-slate-100`

### `/components/ui/Dialog.jsx`
**Issues:**
- Modal should use `rounded-3xl` for confirmation dialogs
- Backdrop: `bg-slate-950/60 backdrop-blur-sm`
- Modal shell: `max-w-md rounded-3xl border border-slate-200 bg-white`

---

## Priority Order for Updates

### Phase 1: Critical (Authentication & Core Navigation)
1. Update UI components first (Input, Card, Button, Select, etc.)
2. LoginPage.jsx
3. ProfilePage.jsx
4. Sidebar.jsx and Navbar.jsx

### Phase 2: High Priority (User Management)
5. UsersPage.jsx
6. UserDetailPage.jsx
7. CreateUserForm.jsx
8. DepartmentsPage.jsx

### Phase 3: Medium Priority (EMR & Appointments)
9. EmrDashboardPage.jsx
10. EmrEncounterWorkspacePage.jsx
11. All EMR form components
12. AppointmentsDashboardPage.jsx
13. All appointment pages

### Phase 4: Lower Priority (Finance & Reports)
14. Finance dashboard and pages
15. Invoice management pages
16. Cash management pages
17. Report pages

---

## Testing Checklist

For each updated page, verify:
- [ ] Page header uses gradient cyan-to-sky panel (`rounded-2xl`)
- [ ] Section cards use `rounded-2xl border border-slate-200/80 bg-white shadow-sm`
- [ ] Section headers use `border-b border-slate-200 bg-slate-50/70 px-4 py-3`
- [ ] Form inputs are `h-10 rounded-lg border-slate-200`
- [ ] Focus states use cyan (`focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10`)
- [ ] Labels are `text-sm font-semibold text-slate-800 mb-1.5`
- [ ] Required markers are `text-rose-600`
- [ ] Buttons use `bg-cyan-700` for primary actions
- [ ] Status badges use proper tinted backgrounds
- [ ] Tables have proper header styling
- [ ] No `text-gray-*` classes (use `text-slate-*`)
- [ ] No generic `rounded-lg` for cards (use `rounded-2xl`)
- [ ] Typography uses Outfit font family
- [ ] Spacing follows theme (`gap-x-4 gap-y-5` for grids)

---

## Conclusion

The codebase has approximately **90 JSX files**, with an estimated **60+ pages/components** requiring updates to fully align with the theme.md specification. The RegistrationForm.jsx serves as the excellent reference implementation, and the UserManagementShell.jsx also demonstrates good theme compliance.

**Estimated effort:** 
- UI Component updates: 4-6 hours
- Authentication pages: 2-3 hours  
- User Management: 3-4 hours
- EMR module: 8-10 hours
- Appointment module: 4-6 hours
- Finance/Invoice modules: 6-8 hours
- Testing and QA: 4-6 hours

**Total estimated effort: 30-40 hours** for complete theme alignment across all pages.
