# MediCore HMIS Theme

## Theme Principle

MediCore should follow the patient registration form as the reference UI: calm, clinical, compact, and operational. Every page should help hospital staff complete repeated work quickly, with visible hierarchy, predictable controls, clear validation, and restrained visual styling.

## Product Feel

- Trustworthy outpatient facility software, not a marketing site.
- Fast and form-first for clerks, nurses, cashiers, pharmacists, finance teams, and admins.
- Clinical but warm: cyan, sky, white, slate, and measured status colors.
- Dense but breathable layouts with clear section breaks and compact rhythm.
- Light surfaces, subtle borders, and soft shadows instead of heavy decoration.
- The interface should feel like a working hospital tool: direct labels, useful status, and no ornamental copy.

## Core Visual Tokens

- Font: `Outfit`.
- App background: `slate-50` / `#f8fafc`.
- Primary brand and active state: `cyan-700`.
- Secondary cyan accents: `cyan-600`, `cyan-500`, `cyan-400`.
- Soft header surfaces: `cyan-50` to `sky-50`.
- Main text: `slate-950` or `slate-900`.
- Secondary text: `slate-600` and `slate-500`.
- Muted labels: `slate-400`.
- Standard border: `slate-200`.
- Subtle section border: `slate-200/80`.
- Panel background: `white`.
- Muted panel background: `slate-50/70`.
- Success: `emerald`.
- Warning or pending: `amber`.
- Error and required: `rose` or `red`.

## Shape And Elevation

- Inputs and small controls use `rounded-lg` or 8px radius.
- Tabs, search panels, and inline actions use `rounded-xl` or 12px radius.
- Section cards and page headers use `rounded-2xl` or 16px radius.
- Modals may use `rounded-3xl` when they are focused confirmation moments.
- Default card elevation is `shadow-sm`.
- Dropdowns and lookup menus may use `shadow-2xl` plus `ring-1 ring-black/5`.
- Sticky footers use a top border and a very soft upward shadow.

## App Shell

- Keep the app shell persistent: left sidebar, top navbar, and a full-width work surface.
- Main content uses a centered max width around `max-w-[1600px]`.
- Work surfaces use `p-4` on mobile and `md:p-8` on desktop.
- Sidebar navigation should be administrative and scannable, with icon plus label rows.
- Facility context belongs near navigation: MFL number, online badge, location, and facility type.
- Active navigation uses cyan tinting and strong but quiet contrast.

## Page Headers

- Registration-style workflow pages start with a rounded cyan-to-sky header panel.
- Header panel classes should resemble `rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-50 px-4 py-4 shadow-sm sm:px-6`.
- Use direct workflow names such as `New Registration`, `Patient Record`, `Users`, `Roles`, `Drugs`, or `Invoices`.
- Subtitle copy should be one practical sentence describing the work being done.
- High-priority controls belong in the header when they change the page context, such as patient lookup or patient type.
- Use an inset white control panel for lookup controls: `rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-cyan-100`.

## Form Layout

- Forms use `space-y-5`.
- Primary identifiers should appear before tabbed or section-specific content.
- Long forms use section cards with short descriptive headers.
- Section bodies use responsive grids:
  - `grid-cols-1` on mobile.
  - `sm:grid-cols-2`.
  - `md:grid-cols-3`.
  - `xl:grid-cols-4`.
  - `2xl:grid-cols-6`.
- Use compact gaps: `gap-x-4 gap-y-5`.
- Use `contents` when conditional groups should flow inside the parent grid.
- Use column spans only to support content density, not decorative layout.

## Section Cards

- Section container: `overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm`.
- Section header: `border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5`.
- Section header text: `text-sm text-slate-600`.
- Section body: `p-4 sm:p-6`.
- Section descriptions should explain operational purpose, such as matching, billing, communication, or follow-up.
- Do not put page sections inside decorative cards. Use cards only for real grouped content.

## Form Controls

- Standard field height: 40px or `h-10`.
- Standard field radius: `rounded-lg`.
- Field border: `border-slate-200`.
- Field background: `bg-white`.
- Field text: `text-sm text-slate-900`.
- Field shadow: `shadow-xs`.
- Placeholder and field icons: `text-slate-400`.
- Label: `text-sm font-semibold text-slate-800`.
- Label bottom spacing: `mb-1.5`.
- Required marker: `ml-0.5 text-rose-600`.
- Focus state: `focus:border-cyan-400 focus:ring-4 focus:ring-cyan-600/10`.
- Disabled state: `cursor-not-allowed bg-slate-100 text-slate-500`.
- Left icons should be `size-4`, placed at `left-3`, and paired with `pl-10` for inputs/selects.
- Textareas use the same field treatment with `min-h-16 resize-y py-2`.

## Validation And Errors

- All user-facing validation should be friendly and specific.
- Invalid fields use `border-red-300 focus:border-red-400 focus:ring-red-500/10`.
- Error helper text uses `mt-1.5 text-xs font-medium text-red-600`.
- Preserve `aria-invalid` and `aria-describedby` when showing errors.
- Required fields should be marked visually, but labels must still be explicit.
- When errors exist in hidden tab panels, show a tab error badge.
- Error badges use an alert icon plus count, not color alone.

## Tabs

- Tabs are compact pill buttons with icons.
- Tab group uses `flex flex-wrap items-center gap-2`.
- Tab button shape: `rounded-xl px-3.5 py-2`.
- Tab text: `text-sm font-semibold`.
- Active tab: `bg-cyan-700 text-white shadow-sm`.
- Inactive tab: `text-slate-700 hover:bg-slate-100`.
- Tabs should expose `role="tab"`, `aria-selected`, and `aria-controls`.
- Active-tab error badge: `bg-white text-rose-600`.
- Inactive-tab error badge: `bg-rose-100 text-rose-700`.

## Search And Lookup

- Patient search supports UHID, name, phone, and ID.
- Lookup dropdown container: `absolute z-20 mt-1 max-h-80 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5`.
- Lookup dropdowns use `role="listbox"` and row options use `role="option"`.
- Dropdown headers are sticky and muted: `sticky top-0 z-10 border-b border-slate-100 bg-slate-50/90 px-4 py-2 backdrop-blur-sm`.
- Search result rows should show:
  - patient initials avatar
  - full name
  - active/inactive status badge
  - UHID
  - document or patient ID
  - phone
  - date of birth
- Row hover and keyboard focus use a light cyan tint: `hover:bg-cyan-50/60 focus:bg-cyan-50/60`.
- Avatars start slate and shift to cyan on row hover.
- Empty states should be centered, concise, and calm.

## Action Bars

- Long forms use a sticky bottom action bar.
- Sticky footer pattern: `sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur`.
- Footer buttons stack on small screens and align right on larger screens.
- Secondary actions use white background, slate border, slate text, and light slate hover.
- Primary submit actions use `bg-cyan-700 text-white hover:bg-cyan-800 active:bg-cyan-900`.
- Loading submit states should keep the button width stable and use `Loader2` with `animate-spin`.
- Use motion sparingly for hover, tap, and state transitions.

## Confirmation Modal

- Success confirmations use a focused modal, not a toast alone.
- Backdrop: `bg-slate-950/60 backdrop-blur-sm`.
- Modal shell: `max-w-md rounded-3xl border border-slate-200 bg-white`.
- Modal shadow: `shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]`.
- Use a top accent bar from cyan through sky to emerald.
- Success icon: emerald circular icon treatment.
- Patient summary cards use slate-tinted surfaces with a cyan initials avatar.
- UHID should be prominent, monospace, and copyable.

## Status Colors

- Primary action and active state: cyan.
- Successful, online, active: emerald.
- Error, required, destructive: rose or red.
- Warning, pending, maintenance: amber.
- Neutral content, borders, and secondary actions: slate.
- Status badges should use tinted backgrounds and readable text.
- Use small uppercase labels for compact statuses such as `ACTIVE`.

## Content Tone

- Use exact operational labels, not decorative copy.
- Prefer healthcare-specific terms: `Patient`, `UHID`, `Payer`, `NOK`, `Emergency Contact`, `Administrative Details`.
- Formal labels are acceptable when they reduce ambiguity, such as `Surname / Family Name` and `First Name / Given Name`.
- Helper descriptions should explain why the section matters for matching, communication, billing, or follow-up.
- Avoid visible instructions about how the UI works unless they prevent data-entry errors.
- Button labels should describe the command: `Clear Details`, `Save Registration`, `Update Record`, `New Registration`.

## Accessibility

- Preserve visible labels on every field.
- Do not rely on placeholder text as the only field description.
- Keep focus rings visible and consistent.
- Use `aria-invalid` and error text for invalid fields.
- Use role and aria state for tabs and lookup lists.
- Do not rely on color alone for status; pair color with badges, icons, or text.
- Keep keyboard focus behavior equal to hover behavior in interactive lists.
