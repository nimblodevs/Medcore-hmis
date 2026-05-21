# MediCore HMIS Theme

## Theme Principle

MediCore should feel like the patient registration form: calm, clinical, compact, and operational. The UI should help hospital staff capture accurate information quickly, with clear hierarchy, visible validation, and enough visual softness to reduce fatigue during repeated data-entry work.

## Product Feel

- Trustworthy outpatient facility software, not a marketing site.
- Fast, form-first, and built for daily clerk, nurse, cashier, and admin workflows.
- Warm clinical tone: cyan, sky, white, slate, and measured status colors.
- Dense but breathable layouts with clear section breaks and predictable controls.
- Light surfaces, subtle borders, and restrained shadows instead of heavy decoration.

## Visual Language

- Use `Outfit` as the primary font.
- Use a light slate application background: `#f8fafc`.
- Anchor the brand and active UI with cyan, especially `cyan-600` and `cyan-700`.
- Use white cards and panels with `slate-200` borders.
- Prefer 8px radii for fields and 12-16px radii for grouped panels.
- Keep shadows subtle: enough to separate dropdowns, headers, and panels without making the app feel floaty.

## Layout Pattern

- Keep the app shell persistent: left sidebar, top bar, and a full-width work surface.
- Navigation should feel administrative and scannable, with icon plus label rows.
- The sidebar brand should pair a medical icon with `MediCore`, using cyan on the `Core` accent.
- Facility context belongs near navigation: MFL number, online badge, location, and facility type.
- Page content should use vertical rhythm around `space-y-5` with compact, repeatable sections.

## Registration Form Pattern

- Start registration pages with a soft cyan-to-sky header panel.
- Header copy should be short and direct:
  - Title: `New Registration`, `Patient Record`, or similarly explicit workflow names.
  - Subtitle: one practical sentence, such as `Register a new patient into the system`.
- Place high-priority lookup controls in the header: patient search and patient type.
- Use a white inset control panel inside the cyan header for search/type controls.
- Capture primary identifiers before tabs or deeper sections.
- Organize long forms into section cards with a short descriptive header.
- Use tabs for major registration sections:
  - Demography & Contact Details
  - Payer Details
  - NOK & Emergency Contact
  - Administrative Details

## Form Controls

- Standard field height: 40px.
- Standard field radius: 8px.
- Field border: `slate-200`.
- Field background: white.
- Text: `slate-900`.
- Placeholder: `slate-400`.
- Label: 14px, semibold, `slate-800`.
- Required marker: rose/red.
- Focus state: `cyan-400` border with a soft `cyan-600/10` ring.
- Disabled and read-only fields should use `slate-100` or `slate-50` and muted slate text.
- Use left icons inside inputs and selects for scan speed, especially identity, user, phone, calendar, location, payer, and document fields.
- Error state should switch the border and focus ring to red, with concise 12px red helper text below the field.

## Section Cards

- Use white section cards with subtle slate borders and small shadows.
- Section radius: 16px.
- Section header background: translucent `slate-50`.
- Section header copy should explain the operational purpose, not repeat the title.
- Field grids should adapt from one column on mobile to dense multi-column layouts on large screens.
- Use compact gaps: enough to separate fields, not enough to turn the form into a landing page.

## Tabs

- Tabs are compact pill buttons with icons.
- Active tab: `cyan-700` background, white text, subtle shadow.
- Inactive tab: slate text with a light slate hover background.
- Tab radius: 12px.
- Use error badges on tabs when validation issues live inside hidden sections.
- Error badge on active tab: white background with rose text.
- Error badge on inactive tab: rose-tinted background with rose text.

## Search And Lookup

- Patient search should support UHID, name, phone, and ID.
- Search result menus should feel like clinical records:
  - patient initials avatar
  - full name
  - status badge
  - UHID
  - patient ID
  - phone
  - date of birth
- Search dropdowns should use white surfaces, slate borders, strong shadows, and a sticky muted header.
- Hover states should lightly tint rows with cyan and shift key icons/text toward cyan.
- Empty results should be centered, concise, and calm.

## Status Colors

- Primary action and active state: cyan.
- Successful/online/active state: emerald.
- Error/required/destructive state: rose or red.
- Warnings and pending states: amber.
- Neutral content, borders, and secondary actions: slate.
- Use badges for status, with small uppercase text and tinted backgrounds.

## Content Tone

- Use exact operational labels, not decorative copy.
- Prefer healthcare-specific terms: `Patient`, `UHID`, `Payer`, `NOK`, `Emergency Contact`, `Administrative Details`.
- Labels may be formal when clarity requires it, such as `Surname / Family Name` and `First Name / Given Name`.
- Helper descriptions should explain why the section matters for matching, communication, billing, or follow-up.
- Avoid visible instructions about how the UI works unless they prevent data-entry errors.

## Accessibility

- Preserve visible labels on every field.
- Do not rely on placeholder text as the only field description.
- Keep focus rings visible and consistent.
- Use `aria-invalid` and error text for invalid fields.
- Do not rely on color alone for status; pair color with badges, icons, or text.
- Keep tab buttons keyboard accessible and expose selected state.
