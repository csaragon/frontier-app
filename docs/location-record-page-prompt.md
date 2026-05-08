# Location Record Page — Build Prompt

> Paste this into Claude when you're ready to (re)generate `src/records/LocationRecordPage.jsx`. It captures the design system, existing patterns to preserve, and per-tab specs.

---

## Goal

Update `src/records/LocationRecordPage.jsx` so the page has **seven tabs** instead of two. Rename the existing **Info Card** tab to **Scorecard** (its content moves with it). Add five new tabs between Scorecard and Reports. Reports stays as-is.

**Final tab order, left to right:**

1. Scorecard *(was Info Card; same content)*
2. Details
3. Related
4. Employees
5. Assets
6. Activity
7. Reports *(unchanged; keeps the `INSIGHTS` badge)*

Everything outside the tab strip — the app sidebar, page header (back link, breadcrumb, location name, status pill, critical badge, compliance score tile, edit/kebab buttons, role selector) — stays exactly as it is today. **Do not redesign the header.**

---

## Design system — non-negotiables

All visual decisions must come from the Aegis tokens in `src/aegis-tokens.js`. Do **not** introduce Tailwind, CSS modules, styled-components, or new color/spacing values.

**Imports at top of file (already present):**

```jsx
import { T, F } from "../aegis-tokens.js";
```

**Local C alias (already defined in this file — keep using it):**

```jsx
const C = {
  navy:      T.action1,            // #001e76
  navyDeep:  T.onSurface2,         // #16191d
  textSec:   T.onSurface1,         // #555f6d
  textMuted: T.disabled1,          // #8692a2
  bgApp:     T.surface2,           // #f4f4f6 — page background
  bgSurf:    T.surface1,           // #ffffff — card background
  border:    T.border1,            // #e2e5e9
  primary:   T.actionContainer1,   // #2226f7 — interactive blue
  primaryBg: T.actionContainer3,   // #d4e2ff — selected/hover blue
  success:   T.success1, successBg: T.successContainer1,
  warning:   T.warning1, warningBg: T.warningContainer1,
  error:     T.onError1, errorBg:   T.errorContainer1,
};
```

**Reuse existing helpers** in this file — don't reimplement them:

- `Avatar({ emp, size })` — circular initials avatar
- `Pill({ label, color, bg, sm })` — rounded status chip
- `SectionCard({ title, action, helper, children })` — white card with header strip; **wrap every section inside a tab in this**
- `EditableField({ label, value, fieldKey, canEdit, onSave })` — uppercase mini-label + inline-edit value
- `FilterPills({ options, selected, onSelect })` — pill-shaped filter row
- `scoreColor(s)` / `scoreBg(s)` — score-to-color mapping (≥85 success, ≥70 warning, else error)
- Status meta maps: `STATUS_META`, `AP_STATUS_META`, `AUDIT_STATUS_META`, `PRIORITY_COLOR`

**Typography** — inline `style` objects only. Common sizes: 10px (uppercase mini-labels, letter-spacing 0.04em, weight 700, color `C.textMuted`), 12px (body / table cells), 13px (section titles, weight 700, color `C.navyDeep`), 14–16px (numbers in tiles), 22–32px (headline numbers, weight 800–900). Always pass `fontFamily:F`.

**Layout container per tab:** `<div style={{ maxWidth:920, margin:"0 auto", padding:"20px 24px" }}>` (matches today's Info Card). Each section inside is wrapped in `<SectionCard>`.

---

## Tab nav — exact pattern to replicate

Replace the two-tab array with a seven-tab array. Keep the underline-only style. Keep the `INSIGHTS` badge on Reports only.

```jsx
{/* Tab nav */}
<div style={{ display:"flex", gap:0, overflowX:"auto" }}>
  {[
    ["scorecard","Scorecard"],
    ["details",  "Details"],
    ["related",  "Related"],
    ["employees","Employees"],
    ["assets",   "Assets"],
    ["activity", "Activity"],
    ["reports",  "Reports"],
  ].map(([id,label]) => (
    <button key={id} onClick={() => setActiveTab(id)}
      style={{ padding:"8px 18px", border:"none", background:"none", cursor:"pointer",
        fontSize:13, fontFamily:F, fontWeight:activeTab===id?700:400,
        color:activeTab===id?C.primary:C.textSec,
        borderBottom: activeTab===id?`2px solid ${C.primary}`:"2px solid transparent",
        display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
      {label}
      {id==="reports" && (
        <span style={{ fontSize:10, fontWeight:700, color:"#fff", background:C.primary,
          padding:"1px 5px", borderRadius:4, letterSpacing:"0.02em" }}>INSIGHTS</span>
      )}
    </button>
  ))}
</div>
```

Default `activeTab` should be `"scorecard"`.

Body region remains:
```jsx
<div style={{ flex:1, overflowY:"auto" }}>
  {activeTab === "scorecard" && (<ScorecardTab .../>)}
  {activeTab === "details"   && (<DetailsTab   .../>)}
  ...
</div>
```

You may keep the tab content inline OR extract per-tab function components inside the same file — pick whichever stays under ~1,200 lines per tab area. Don't split into separate files unless asked.

---

## Data source

All data comes from `getLocationDetail(locationId)` in `src/records/locationStubData.js` (already imported). If a tab needs a field that isn't on the detail object yet, **add it to the stub generator** and use realistic fake values consistent with the rest of the file.

---

## Per-tab specifications

### 1. Scorecard *(was Info Card)*

**Status:** Inherits all current Info Card content. No content changes — just rename the tab key from `"info"` to `"scorecard"` and the label from `"Info Card"` to `"Scorecard"`.

Existing sections to keep (in this order):
1. Location Basics
2. Performance Board
3. Active Programs
4. Recent Audits
5. Open Action Plans
6. Critical Question Failure Patterns
7. Employees On-site

> _Christina to confirm whether any of these sections should move to a different new tab — see Details / Related / Employees / Activity below._

---

### 2. Details

A long, scrollable record detail. Reference layout (screenshot in `docs/details-tab-reference.png` if added) only informs **information architecture** — visual styling matches the rest of this app, **not** the screenshot.

#### Style rules — match existing app

- Reuse `<SectionCard>` for every section. No new card style.
- Reuse `<EditableField>` for every editable field — keep the existing **uppercase 10 px mini-label** pattern (`weight 700`, `letter-spacing 0.04em`, `color C.textMuted`, `marginBottom:3`). Do **not** introduce sentence-case bold labels or info-circle icons.
- Two-column field grid inside each section: `display:grid; gridTemplateColumns:"1fr 1fr"; gap:32px;` — same pattern as the existing "Location Basics" section.
- Phone / email / URL values: render the value text in `C.primary` (no underline) — that's how the existing code styles linked text (e.g., the "Region"/"District" links in Location Basics).
- Boolean fields: render the value as the word `Yes` (`color:C.navyDeep, weight:600`) or `No` (`color:C.textMuted`). No checkmark icons.
- Currency: render with `$` prefix, two decimals, `fontVariantNumeric:"tabular-nums"`.
- Section collapse: extend `SectionCard` to accept `collapsible` + `defaultOpen` props. Header gets a tiny chevron (▾ open / ▸ closed) on the **left** of the title; whole header is the click target. Keep all other `SectionCard` styling (border, padding, title typography) identical.

#### Layout

Single-column main body — the existing `<div style={{ maxWidth:920, margin:"0 auto", padding:"20px 24px" }}>` container. **Do not introduce a right rail inside this tab.**

> **Right-rail widgets from the reference (Map, Start New Case, Start New Audit, Outstanding Actions, Audits by Location, Upload Files, File List) are deferred.** If we want them later, they should be page-level chrome (visible on every tab), not Details-only. Skip them for V1 of the Details tab.

#### Section specs

Each section is a `<SectionCard collapsible defaultOpen={true|false}>` with the 2-column field grid inside. All fields use `<EditableField>` and respect the existing `canEdit(fieldKey)` permission helper. Field rows inside a section flow into the grid in the order listed (left col fills first, then right col — i.e., row-major down the left, then down the right, matching how the existing Location Basics section reads).

**1. Location Information** *(defaultOpen: true)*

Left col: Location Name · Location Number · Region · District · Division
Right col: Location Record Type · Active *(boolean)* · Open Date *(date)* · Location Types *(comma-separated)* · Phone *(phone link)*

**2. Store-Specific Attributes** *(defaultOpen: true)*

Left col: Square Footage
Right col: Has Self-Checkout *(boolean)*

**3. Alarm Details** *(defaultOpen: false)*

Left col: Alarm Authorized People *(multi-line)* · Alarm Contract Date *(date)* · Alarm Monthly Fee *(currency)*
Right col: Alarm Contact Phone *(phone link)* · Alarm Contract Expiration *(date)* · Alarm Vendor

For the multi-line "Alarm Authorized People" value, render preserved line breaks (`whiteSpace:"pre-line"`).

**4. CCTV Details** *(defaultOpen: false)*

Left col: CCTV Recorder Type · CCTV Recorder Brand · CCTV Recorder Serial Number · CCTV Number of Cameras
Right col: CCTV Install Date *(date)* · CCTV Date of Last Update *(date)* · CCTV License Date *(date)* · CCTV License Expiration *(date)*

**5. Guard Details** *(defaultOpen: false)*

Left col: Vendor · Industry · Guard Vendor · Guard Vendor Contact Phone *(phone)* · Guard Vendor Supervisor Name · Guard Vendor Supervisor Phone *(phone)* · Guard Schedule
Right col: Type · Contract Type · Guard Contract Date *(date)* · Guard Contract Expiration *(date)* · Guard – Number of Guards · Guard Hourly Rate *(currency)* · Guard Hours per Week

**6. Key Holder List** *(defaultOpen: false)*

Single full-width field (don't use the 2-col grid for this section). Render the `keyHolders` value with line breaks preserved (`whiteSpace:"pre-line"`, `fontSize:12`, `color:C.navyDeep`). Below the value, in `fontSize:11, color:C.textMuted`: "Last reviewed: {date} · Reviewed by: {name}".

**7. Shrink Details** *(defaultOpen: false)*

Left col: Shrink Dollars *(currency)* · Annual Revenue *(currency)* · Risk Tolerance
Right col: Shrink Percent *(append "%" to value)* · Shrink Icon Color *(render value text plus a 12 × 12 rounded swatch in that color, inline)* · Inv Period Sales *(currency)*

**8. Address Details** *(defaultOpen: true)*

Two-line block (no grid):
- "SHIPPING ADDRESS" mini-label, then the address rendered on three lines (street / "City, State Zip" / country) — all in `C.primary` text, clickable, opens the existing `<MapModal>` on click.
- Below the address, a "View map" pill button (same style as the existing `View map` button in Location Basics).

#### Stub data additions

Extend `getLocationDetail()` in `src/records/locationStubData.js` to provide the new fields. Use realistic fake values consistent with the existing 30 locations. Add per location:

- `openDate` *(string)*, `division` *(string)*, `locationTypes` *(string[])*
- `squareFootage` *(number)*, `hasSelfCheckout` *(boolean)*
- `alarm`: `{ authorizedPeople, contactPhone, contractDate, contractExpiration, monthlyFee, vendor }`
- `cctv`: `{ recorderType, recorderBrand, recorderSerialNumber, numberOfCameras, installDate, dateOfLastUpdate, licenseDate, licenseExpiration }`
- `guard`: `{ vendor, type, industry, contractType, vendorName, vendorContactPhone, vendorSupervisorName, vendorSupervisorPhone, contractDate, contractExpiration, numberOfGuards, hourlyRate, hoursPerWeek, schedule }`
- `keyHolders`: `{ list (multi-line string), lastReviewedDate, lastReviewedBy }`
- `shrink`: `{ shrinkDollars, shrinkPercent, annualRevenue, iconColor, riskTolerance, invPeriodSales }`
- `shippingAddress`: `{ street, city, state, zip, country }`

---

### 3. Related

> _TBD — Christina will provide content spec._

Placeholder structure: lists of related records (programs, templates, parent location, child locations, vendors, etc.).

---

### 4. Employees

> _TBD — Christina will provide content spec._

Placeholder structure: roster table with avatars, role, last activity, audit/AP counts. Likely reuses the existing "Employees On-site" filter pills (auditors / recent / all).

---

### 5. Assets

> _TBD — Christina will provide content spec._

Placeholder structure: asset inventory (equipment, fixtures, safety devices). Probably a filterable table with status, last inspection, next due.

---

### 6. Activity

> _TBD — Christina will provide content spec._

Placeholder structure: chronological feed of audits, action plans, comments, escalations, edits — likely with type/date filters.

---

### 7. Reports

**Status:** Keep current implementation. Sidebar list of `DEFAULT_REPORTS` + main content area. Keep the `INSIGHTS` badge.

---

## Verification checklist (run after build)

- [ ] All seven tabs render and switch on click; default is Scorecard.
- [ ] No new colors, fonts, spacing values introduced outside `T` / `F` / `C`.
- [ ] Every section wraps in `<SectionCard>`.
- [ ] Mini-labels are 10px / weight 700 / uppercase / 0.04em letter-spacing / `C.textMuted`.
- [ ] Active tab = `C.primary` text + 2px `C.primary` underline; inactive = `C.textSec` + transparent underline.
- [ ] `INSIGHTS` badge appears on Reports only.
- [ ] Page header (back link, breadcrumb, name, badges, score tile, edit/kebab, role selector) is unchanged.
- [ ] Tab nav scrolls horizontally on narrow viewports (`overflowX:"auto"`, `whiteSpace:"nowrap"` on tab labels).
- [ ] No console warnings on tab switch.
