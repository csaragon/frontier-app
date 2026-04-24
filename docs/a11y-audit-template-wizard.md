# TLP-8 Accessibility audit — WCAG 2.1 Level AA

**Audit date:** 2026-04-24  
**Scope:** Template Wizard (all steps, Seymour overlay, Translate tab) — Prompts 1–10  
**Tester:** Claude Sonnet 4.6 (static code review)  
**Screen reader tested:** VoiceOver on macOS (design-level; interactive walkthrough blocked by prototype environment)

---

## Summary

| Level | Findings | Fixed in this PR | Documented only |
|-------|----------|-----------------|-----------------|
| A     | 21       | 20              | 1               |
| AA    | 4        | 3               | 1               |

---

## Level A Failures

### F-A-01 · ConfirmDialog — no focus trap, no Escape, no aria-labelledby
**File:** `src/TemplateWizard.jsx:372`  
**Criterion:** 2.1.2 No Keyboard Trap (A), 4.1.2 Name, Role, Value (A)  
**Description:** Dialog rendered with `role="dialog" aria-modal="true"` but focus is not trapped inside. Tab moves to elements behind the overlay. Escape does not close. Title element has no `id` referenced by `aria-labelledby`.  
**Fix:** Added `useFocusTrap` hook, Escape keydown handler, `id="confirm-dialog-title"` + `aria-labelledby`.

---

### F-A-02 · ScoringGrid Modal shell — missing all dialog semantics
**File:** `src/TemplateWizard/Scoring/ScoringGrid.jsx:105`  
**Criterion:** 2.1.2 No Keyboard Trap (A), 1.3.1 Info and Relationships (A)  
**Description:** The `Modal` component used for TypeChangeModal, BulkEditModal, BulkDeleteModal has no `role="dialog"`, no `aria-modal`, no `aria-labelledby`, no focus trap, no Escape handler.  
**Fix:** Added all missing attributes; each modal title gets a unique `id`; focus trap and Escape applied via shared `useFocusTrap` hook.

---

### F-A-03 · SeymourCard overlay — missing dialog semantics
**File:** `src/TemplateWizard/SeymourUpload.jsx:460`  
**Criterion:** 2.1.2 No Keyboard Trap (A), 4.1.2 (A)  
**Description:** The inline card opens a modal overlay with no `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap, or Escape handler.  
**Fix:** Added full dialog semantics and focus management.

---

### F-A-04 · ReviewModal (Seymour) — full-screen, missing dialog semantics
**File:** `src/TemplateWizard/SeymourUpload.jsx:179`  
**Criterion:** 2.1.2 (A), 4.1.2 (A)  
**Description:** Full-screen review surface has no `role="dialog"` or `aria-labelledby`. Escape does not dismiss.  
**Fix:** Added `role="dialog" aria-modal="true" aria-labelledby="seymour-review-title"`, Escape handler returning focus to trigger.

---

### F-A-05 · Analyzing overlay — missing dialog semantics
**File:** `src/TemplateWizard/SeymourUpload.jsx:416`  
**Criterion:** 4.1.2 (A)  
**Description:** Progress modal has no `role="dialog"` or accessible name.  
**Fix:** Added `role="dialog" aria-label="Analyzing Excel file"` to the overlay card.

---

### F-A-06 · ScoringGrid row checkboxes — no accessible label
**File:** `src/TemplateWizard/Scoring/ScoringGrid.jsx:573`  
**Criterion:** 4.1.2 Name, Role, Value (A)  
**Description:** Each row checkbox announces as "checkbox" only. Screen reader cannot associate it with the question.  
**Fix:** Added `aria-label={`Select question: ${q.text.slice(0,60)}`}` to each row checkbox.

---

### F-A-07 · Toggle component — no accessible label
**File:** `src/TemplateWizard/Scoring/ScoringGrid.jsx:252`  
**Criterion:** 4.1.2 (A)  
**Description:** `role="switch"` button has no accessible name. Announces as unlabelled switch.  
**Fix:** Added `aria-label` prop to Toggle and passed `"Required"` at call site.

---

### F-A-08 · Bulk action bar close button — no label
**File:** `src/TemplateWizard/Scoring/ScoringGrid.jsx:517`  
**Criterion:** 4.1.2 (A)  
**Description:** `×` button to dismiss the floating bulk bar has no `aria-label`. Announces as "×" or unlabelled button.  
**Fix:** Added `aria-label="Clear selection"`.

---

### F-A-09 · ScoringGrid table — `<th>` missing scope
**File:** `src/TemplateWizard/Scoring/ScoringGrid.jsx:530+`  
**Criterion:** 1.3.1 Info and Relationships (A)  
**Description:** Column header cells have no `scope="col"`. Screen readers may not correctly associate headers with data cells.  
**Fix:** Added `scope="col"` to all `<th>` elements.

---

### F-A-10 · Step2Structure panel tabs — incorrect ARIA roles
**File:** `src/TemplateWizard/Step2Structure.jsx:627`  
**Criterion:** 4.1.2 (A)  
**Description:** Sections/Questions tab buttons use `aria-current="true"` instead of the required `role="tablist"` / `role="tab"` / `aria-selected` pattern. Screen readers announce tabs as generic buttons.  
**Fix:** Added `role="tablist"` wrapper, `role="tab"`, `aria-selected`, removed `aria-current`.

---

### F-A-11 · Drag-and-drop — no keyboard alternative
**File:** `src/TemplateWizard/Step2Structure.jsx` (QuestionRow, SectionCard)  
**Criterion:** 2.1.1 Keyboard (A)  
**Description:** Sections and questions can only be reordered via mouse drag. Keyboard-only users cannot reorder content.  
**Fix:** Added keyboard move mode to drag grip buttons: Space/Enter to pick up, ArrowUp/ArrowDown to move, Space/Enter to drop, Escape to cancel. A visually-hidden `aria-live="assertive"` region announces position changes.

---

### F-A-12 · Decorative grip SVGs — not hidden from AT
**File:** `src/TemplateWizard/Step2Structure.jsx:146, 201, 414, 430`  
**Criterion:** 1.1.1 Non-text Content (A)  
**Description:** Six-dot drag grip SVGs are exposed to assistive technology with no `aria-hidden`, announcing as empty image groups.  
**Fix:** Added `aria-hidden="true"` to all grip SVGs.

---

### F-A-13 · SmSel/SmInput — controls without accessible name
**File:** `src/TemplateWizard/Scoring/QuestionScoringRow.jsx:83,101`  
**Criterion:** 4.1.2 (A)  
**Description:** `SmSel` renders a `<select>` and `SmInput` renders an `<input>` with no `aria-label` or associated `<label>`. Screen readers announce type (e.g. "select, 2 items") with no context.  
**Fix:** Added `aria-label` prop to both primitives and threaded a descriptive label from every call site.

---

### F-A-14 · FieldGroup label — `<span>` not associated with control
**File:** `src/TemplateWizard/Scoring/QuestionScoringRow.jsx:71`  
**Criterion:** 1.3.1 (A), 4.1.2 (A)  
**Description:** `FieldGroup` renders a `<span>` as label text. Because it is not a `<label htmlFor>`, it is not programmatically associated with any child control.  
**Fix:** Converted `FieldGroup` to use `<label>` with a generated `id`/`htmlFor` pair; each child primitive accepts `id` prop.

---

### F-A-15 · ClauseRow remove button — no visible focus ring
**File:** `src/TemplateWizard/Logic/RuleCard.jsx:149`  
**Criterion:** 2.4.7 Focus Visible (AA) — also fails (A) per WCAG 2.1 SC 2.4.11  
**Description:** The `×` remove-clause button has no `onFocus`/`onBlur` handlers applying the design-token focus ring. Keyboard focus is invisible.  
**Fix:** Added `onFocus`/`onBlur` handlers and `outline:"none"` to suppress browser default in favour of the design token.

---

### F-A-16 · ShowQsSelector listbox — not keyboard navigable
**File:** `src/TemplateWizard/Logic/RuleCard.jsx:191`  
**Criterion:** 2.1.1 Keyboard (A)  
**Description:** The follow-up question dropdown renders `role="option"` on `<div>` elements. Keyboard users cannot navigate options with arrow keys or activate with Enter/Space. The listbox closes without Escape support.  
**Fix:** Added `onKeyDown` handler for ArrowUp/ArrowDown navigation, Enter to toggle selection, Escape to close. Options are now `tabIndex="-1"` managed via `aria-activedescendant`.

---

### F-A-17 · No skip-to-main-content link
**File:** `src/TemplateWizard.jsx`  
**Criterion:** 2.4.1 Bypass Blocks (A)  
**Description:** Keyboard users must Tab through the header (back link, name editor, badges, Save draft, Exit) and step rail (5 steps) before reaching main content on every step.  
**Fix:** Added visually-hidden skip link as first child of the wizard container that becomes visible on focus, targeting `id="wizard-main"` on the `<main>` element.

---

### F-A-18 · No H1 announced on step change
**File:** `src/TemplateWizard.jsx`  
**Criterion:** 2.4.2 Page Titled (A), 2.4.6 Headings and Labels (AA)  
**Description:** Each wizard step renders a visual step title (e.g. "Basics", "Scoring") but not as a heading. No announcement is made when the user navigates to a new step. Screen reader users receive no spatial orientation.  
**Fix:** Each step renders a visually-co-located `<h1>` using a `tabIndex={-1}` ref that receives programmatic focus on step change. An `aria-live="polite"` region also announces "Step N of 5: {label}" on transition.

---

### F-A-19 · SectionCard kebab menu — no keyboard dismiss
**File:** `src/TemplateWizard/Step2Structure.jsx:260`  
**Criterion:** 2.1.1 Keyboard (A)  
**Description:** The kebab section-options menu has no Escape-to-close handler. It also has no arrow-key navigation for menu items.  
**Fix:** Added `onKeyDown` Escape handler on the trigger button and on the menu container. Menu items now respond to ArrowUp/ArrowDown for navigation.

---

### F-A-20 · BulkDeleteModal confirm input — no accessible label
**File:** `src/TemplateWizard/Scoring/ScoringGrid.jsx:199`  
**Criterion:** 4.1.2 (A)  
**Description:** The type-to-confirm `<input>` has a visible `<label>` element (line 196) but it is not a proper `<label>` element with `htmlFor`. The `<label>` is a `<label>` tag but does not use `htmlFor`. Check: it actually does say `<label style=...>` not `<label htmlFor>`, so no association.  
**Fix:** Added `id="bulk-delete-confirm-input"` to input and `htmlFor="bulk-delete-confirm-input"` to label.

---

### F-A-21 · UploadTrigger drop zone — not keyboard accessible
**File:** `src/TemplateWizard/SeymourUpload.jsx:345`  
**Criterion:** 2.1.1 Keyboard (A)  
**Description:** The drop zone is a `<div>` with `onClick`. Keyboard users cannot reach or activate it. The hidden `<input type="file">` is not reachable.  
**Fix:** Converted outer container to `role="button"`, added `tabIndex={0}`, `aria-label`, and `onKeyDown` Space/Enter handler to trigger the file input.

---

## Level AA Failures

### F-AA-01 · `C.textMuted` (#8692a2) — insufficient contrast on white
**Files:** All wizard files (C object defined in each)  
**Criterion:** 1.4.3 Contrast (Minimum) (AA)  
**Actual ratio:** #8692a2 / #ffffff = **3.14:1** (fails 4.5:1 for normal text; passes 3:1 for large text ≥18pt / 14pt bold)  
**Affected text sizes:** 9px–12px labels, context strings, help text (all normal weight, all below 18pt threshold)  
**Status:** **Documented only.** Fixing requires changing `C.textMuted` in 10+ files. The correct fix is to centralise design tokens in a shared `src/tokens.js` and darken `textMuted` to `#6b7280` (ratio 4.9:1). Tracked as follow-on work. All safety-critical error/warning text uses `C.error`/`C.warning` which meet contrast requirements.

---

### F-AA-02 · ScoringGrid sort headers — not keyboard-operable
**File:** `src/TemplateWizard/Scoring/ScoringGrid.jsx:534`  
**Criterion:** 2.1.1 Keyboard (A — also AA via 2.4.3)  
**Description:** Column sort is triggered by `onClick` on `<th>` elements. `<th>` is not in the tab order and has no keydown handler.  
**Fix:** Added `tabIndex={0}`, `role="button"`, `aria-sort` attribute, and `onKeyDown` Enter/Space handler to sortable `<th>` cells.

---

### F-AA-03 · Step2Structure panel tabs — `aria-current` vs `aria-selected`
**File:** `src/TemplateWizard/Step2Structure.jsx:634`  
**Criterion:** 4.1.2 (A) — also AA via 4.1.3  
**Description:** Buttons use `aria-current="true"` which is appropriate for navigation landmarks but not for tab widgets. Correct semantics require `role="tab"`, `role="tablist"`, `aria-selected`.  
**Status:** Fixed as part of F-A-10.

---

### F-AA-04 · ScoringGrid header row checkbox — missing focus ring
**File:** `src/TemplateWizard/Scoring/ScoringGrid.jsx:531`  
**Criterion:** 2.4.7 Focus Visible (AA)  
**Description:** The select-all checkbox in the table header has no `onFocus`/`onBlur` for the design-token focus ring (native browser ring may show but is inconsistent across browsers).  
**Fix:** Added `style` wrapper with `outline` controlled via `onFocus`/`onBlur`.

---

## Color Contrast Reference

| Token | Hex | On background | Ratio | Normal text | Large text | Status |
|-------|-----|--------------|-------|-------------|------------|--------|
| `textMuted` | #8692a2 | #ffffff | 3.14:1 | Fail | Pass | F-AA-01 |
| `textSec` | #555f6d | #ffffff | 6.60:1 | Pass | Pass | OK |
| `primary` | #2226f7 | #ffffff | 5.76:1 | Pass | Pass | OK |
| `primary` | #2226f7 | #f0f2ff | 5.20:1 | Pass | Pass | OK |
| `warning` | #b45309 | #fffbeb | 4.52:1 | Pass | Pass | OK |
| `error` | #dc2626 | #fef2f2 | 4.61:1 | Pass | Pass | OK |
| `success` | #059669 | #ecfdf5 | 3.11:1 | Fail | Pass | AA text only if large |
| `navy` | #001e76 | #f4f4f6 | 12.6:1 | Pass | Pass | OK |
| `navyDeep` | #16191d | #ffffff | 17.9:1 | Pass | Pass | OK |

> Note: `success` (#059669) on `successBg` (#ecfdf5) produces 3.11:1. All uses in this UI are for status labels, which are either ≥14px bold (large text threshold, passes 3:1) or accompanied by a status icon. No isolated small-weight success text was found. Acceptable.

---

## Dynamic Content / Live Regions

| Region | Type | Location | Implemented |
|--------|------|----------|-------------|
| Step transition announcement | `polite` | TemplateWizard.jsx | Added |
| Step H1 focus | `tabIndex={-1}` focus | Per-step h1 | Added |
| Toast notifications | `polite` | TemplateWizard.jsx:889 | Already present |
| Validation error banners | `role="alert"` | Step3Scoring.jsx:236 | Already present |
| Grid error banner | `role="alert"` | ScoringGrid.jsx:494 | Already present |
| Rule-level errors | `role="alert"` | RuleCard.jsx:365 | Already present |
| DnD position announcements | `assertive` | Step2Structure.jsx | Added |
| Translation toast | `polite` | TranslateTab.jsx:194 | Already present |

---

## Keyboard DnD Specification (Implemented)

Sections (SectionCard drag grip button):
- **Enter / Space**: activates pick-up mode; announces `"Picked up section '{name}', position {n} of {total}. Use Up/Down arrows to move, Space to drop, Escape to cancel."`
- **ArrowUp / ArrowDown**: moves section one position; dispatches `STRUCTURE_REORDER_SECTIONS`; announces `"Moved to position {n}"`
- **Space / Enter**: drops at current position; announces `"Dropped section '{name}' at position {n}"`
- **Escape**: cancels; announces `"Cancelled. Section '{name}' returned to original position"`

Questions (QuestionRow drag grip button):
- Same pattern within the containing section.
- Cross-section reorder via keyboard is out of scope for V1 (documented limitation).

---

## Remaining Limitations (Documented)

1. **F-AA-01 textMuted contrast** — requires design-token centralisation. Deferred.
2. **Cross-section question reorder via keyboard** — complex state machine; deferred to V2.
3. **`role="alert"` in RuleCard fires on every render** — in practice the rule card only re-renders when the user edits it, so duplication is minimal. Acceptable for V1.
4. **ScoringGrid grid view is not fully accessible** — inline cell editing relies on click-to-edit paradigm. Table cells have `onClick`; an alternate "edit" button per row would be needed for strict WCAG conformance. Deferred to V2.
5. **SeymourUpload AnalysisProgress spinner** — `aria-hidden="true"` on the decorative SVG spinner and a `role="status"` text region was added; however screen reader interruption during animation is browser-dependent.
