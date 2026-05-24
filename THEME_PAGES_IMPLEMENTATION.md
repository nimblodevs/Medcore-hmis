# MediCore HMIS Theme - Page-Level Implementation Guide

## Overview

This document provides the implementation guide for applying the MediCore theme to all pages using the new layout components created in `/workspace/client/src/components/layout/`.

## Created Layout Components

### 1. PageHeader Components (`/workspace/client/src/components/layout/PageHeader.jsx`)

#### WorkflowHeader
For form-based workflow pages (Registration, Patient Record, etc.)
- Cyan-to-sky gradient background
- Rounded-2xl container with cyan-100 border
- Optional inset lookup control panel

```jsx
<WorkflowHeader
  title="New Registration"
  subtitle="Create a new patient record with demographic and contact details."
  lookupControl={
    <PatientSearchBox />
  }
>
  <ActionButton variant="secondary">Clear</ActionButton>
  <ActionButton variant="primary">Save Registration</ActionButton>
</WorkflowHeader>
```

#### PageHeader
For standard pages (dashboards, lists, admin pages)
- Clean white background
- Optional breadcrumbs
- Action buttons slot

```jsx
<PageHeader
  breadcrumbs="Finance"
  title="OP Invoices"
  subtitle="View finalized invoices and create an invoice from interim billings."
>
  <button className="rounded-xl bg-cyan-700 ...">Add Invoice</button>
</PageHeader>
```

#### SearchBar
Consistent search input styling
```jsx
<SearchBar
  placeholder="Search..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
```

### 2. SectionCard Components (`/workspace/client/src/components/layout/SectionCard.jsx`)

#### SectionCard
Grouped content container following theme.md exactly:
- Container: `overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm`
- Header: `border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5`
- Body: `p-4 sm:p-6`

```jsx
<SectionCard
  title="Patient Demographics"
  description="Legal name, date of birth, and gender for identification and matching."
>
  <SectionGrid columns="default">
    <Input label="First Name" required />
    <Input label="Middle Name" />
    <Input label="Surname" required />
  </SectionGrid>
</SectionCard>
```

#### SectionGrid
Responsive grid with theme breakpoints:
- `default`: grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6
- `wide`: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- `compact`: grid-cols-1 sm:grid-cols-2 md:grid-cols-3
- `dual`: grid-cols-1 md:grid-cols-2
- `single`: grid-cols-1

```jsx
<SectionGrid columns="default" gap-x-4 gap-y-5>
  {/* Fields automatically responsive */}
</SectionGrid>
```

### 3. ActionBar Components (`/workspace/client/src/components/layout/ActionBar.jsx`)

#### ActionBar
Sticky bottom action bar for forms:
- `sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur`
- Buttons stack on mobile, align right on desktop

```jsx
<ActionBar>
  <ActionButton variant="secondary">Cancel</ActionButton>
  <ActionButton variant="primary" loading={isSaving}>
    Save Registration
  </ActionButton>
</ActionBar>
```

#### ActionButton
Consistent button variants:
- `primary`: cyan-700 background
- `secondary`: white with slate border
- `danger`: rose-600 background
- `ghost`: text only

```jsx
<ActionButton variant="primary" icon={Save}>
  Save
</ActionButton>
```

### 4. StatsCard Components (`/workspace/client/src/components/layout/StatsCard.jsx`)

#### StatsCard
Dashboard metric cards:
- rounded-2xl, border-slate-200, bg-white, shadow-sm
- Icon with colored background
- Title, value, optional note

```jsx
<StatsCard
  title="Active Users"
  value={24}
  note="Across three branches"
  icon={Users}
  iconBg="bg-cyan-100"
  iconColor="text-cyan-700"
/>
```

#### StatsGrid
Responsive grid for stats:
- `auto`: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- `dual`: grid-cols-1 md:grid-cols-2
- `triple`: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- `quad`: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

```jsx
<StatsGrid columns="quad">
  <StatsCard ... />
  <StatsCard ... />
  <StatsCard ... />
  <StatsCard ... />
</StatsGrid>
```

## Updated Pages

### ✅ Finance/Invoices.jsx
- Replaced custom header with `<PageHeader>`
- Replaced custom stats with `<StatsGrid>` and `<StatsCard>`
- Replaced custom search with `<SearchBar>`
- Changed table hover to `hover:bg-cyan-50/30`
- Changed rounded-3xl to rounded-2xl for consistency

### ✅ Finance/CashierTransactions.jsx
- Same updates as Invoices.jsx
- Consistent theme application

## Migration Checklist for Remaining Pages

### Phase 1: High-Priority Patient & Finance Pages
- [ ] Patient/RegistrationForm.jsx - Already theme-compliant (reference)
- [ ] Patient/PatientList.jsx - Already theme-compliant
- [ ] Finance/Schemes.jsx
- [ ] Finance/Debtors.jsx
- [ ] Finance/OpServiceBilling.jsx
- [ ] Finance/OpConsBilling.jsx

### Phase 2: User Management
- [ ] UserManagement/UsersPage.jsx - Uses UserManagementShell (already themed)
- [ ] UserManagement/RolesPage.jsx
- [ ] UserManagement/BranchesPage.jsx
- [ ] UserManagement/DepartmentsPage.jsx

### Phase 3: Pharmacy
- [ ] pharmacy/pages/DrugsPage.jsx - Good but use new components
- [ ] pharmacy/pages/StockPage.jsx
- [ ] pharmacy/pages/DispensingPage.jsx
- [ ] pharmacy/pages/PurchasesPage.jsx
- [ ] pharmacy/pages/PharmacyDashboard.jsx
- [ ] pharmacy/pages/ReportsPage.jsx

### Phase 4: Cash Management
- [ ] cash/pages/CashDashboard.jsx - Uses shadcn components, migrate
- [ ] cash/pages/CashSessionsPage.jsx
- [ ] cash/pages/CashCountersPage.jsx
- [ ] cash/pages/CashierProfilesPage.jsx
- [ ] cash/pages/CashSessionDetailsPage.jsx

### Phase 5: EMR & Other Features
- [ ] emr/components/diagnoses/DiagnosisForm.jsx
- [ ] emr/components/orders/OrderForm.jsx
- [ ] emr/components/discharge/DischargeSummaryForm.jsx
- [ ] All remaining feature pages

## Migration Pattern

### Before (Custom Implementation)
```jsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="text-2xl font-black tracking-tight text-slate-900">Page Title</h1>
    <p className="text-sm font-medium text-slate-500">Subtitle text here.</p>
  </div>
  <button className="rounded-2xl bg-cyan-600 ...">Action</button>
</div>

<div className="grid gap-4 sm:grid-cols-2">
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">Label</p>
        <p className="text-base font-black text-slate-900">Value</p>
      </div>
    </div>
  </div>
</div>

<div className="relative">
  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
  <input className="w-full rounded-2xl ..." />
</div>
```

### After (Using Layout Components)
```jsx
import { PageHeader, SearchBar } from "../../components/layout/PageHeader";
import { StatsCard, StatsGrid } from "../../components/layout/StatsCard";

<PageHeader
  breadcrumbs="Section"
  title="Page Title"
  subtitle="Subtitle text here."
>
  <button className="rounded-xl bg-cyan-700 ...">Action</button>
</PageHeader>

<StatsGrid columns="dual">
  <StatsCard
    title="Label"
    value="Value"
    icon={Icon}
    iconBg="bg-cyan-100"
    iconColor="text-cyan-700"
  />
</StatsGrid>

<SearchBar
  placeholder="Search..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
```

## Theme Tokens Quick Reference

### Colors
- Primary: `cyan-700`, `cyan-600`, `cyan-500`
- Background: `slate-50` (#f8fafc)
- Text: `slate-900`, `slate-700`, `slate-600`, `slate-500`, `slate-400`
- Success: `emerald-*`
- Warning: `amber-*`
- Error: `rose-*` or `red-*`

### Shapes
- Inputs: `rounded-lg`
- Tabs/Buttons: `rounded-xl`
- Cards/Sections: `rounded-2xl`
- Modals: `rounded-3xl`

### Spacing
- Field height: `h-10` (40px)
- Form spacing: `space-y-5`
- Grid gaps: `gap-x-4 gap-y-5`
- Card padding: `p-4 sm:p-6`

### Focus States
- All inputs: `focus:border-cyan-400 focus:ring-2 focus:ring-cyan-600/10`
- Tables rows: `hover:bg-cyan-50/30`

## Testing Checklist

- [ ] All headers display correctly on mobile and desktop
- [ ] Stats cards render properly in all grid configurations
- [ ] Search bars have correct focus states
- [ ] Section cards have proper spacing and borders
- [ ] Action bars stick to bottom on scroll
- [ ] Table row hover uses cyan-50/30
- [ ] All rounded corners match theme (rounded-2xl for cards)
- [ ] Typography hierarchy is consistent
- [ ] Color usage follows theme tokens

## Estimated Time

- ~15-20 minutes per page for straightforward migrations
- ~30-40 minutes for complex forms with multiple sections
- Total estimated time for 60+ pages: 25-35 hours
