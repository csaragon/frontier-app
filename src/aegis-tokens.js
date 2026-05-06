// Aegis — ThinkLP Design System: Semantic Token Object
// Components reference T, never raw hex values.
// Source: Aegis_Design_System_v2.html (April 2026 refinements applied)

export const T = {
  // ── Surface ─────────────────────────────────────────────
  surface1:           '#ffffff',   // neutral 5  — default page bg
  surface2:           '#f4f4f6',   // neutral 30 — light-grey page bg
  surface3:           '#f1f2f4',   // neutral 50 — darker grey page bg
  surfaceInverse1:    '#001e76',   // navy 500   — dark/inverse page bg
  surfaceInverse2:    '#000e47',   // navy 800   — darker inverse bg

  // ── On-surface (text + icons) ───────────────────────────
  onSurface1:         '#555f6d',   // neutral 600 — body, label, secondary
  onSurface2:         '#16191d',   // neutral 900 — primary body, headings
  onSurface3:         '#001e76',   // navy 500    — page/component titles
  onSurfaceInverse1:  '#ffffff',   // neutral 0   — text on dark bg
  onSurfaceInverse2:  '#d4e2ff',   // ocean 50    — muted text on dark bg

  // ── Surface-container (component backgrounds) ──────────
  surfaceContainer1:  '#ffffff',   // neutral 0   — cards, modals
  surfaceContainer2:  '#f4f4f6',   // neutral 30  — light-grey containers
  surfaceContainer3:  '#f1f2f4',   // neutral 50  — disabled bg
  surfaceContainer4:  '#e2e5e9',   // neutral 100 — darkest container bg

  // ── Border ─────────────────────────────────────────────
  border1:            '#e2e5e9',   // neutral 100 — decorative borders, dividers
  border2:            '#c3c8d0',   // neutral 200 — functional/interactive borders
  border3:            '#8692a2',   // neutral 400 — darker functional borders
  borderInverse1:     '#f1f2f4',   // neutral 50  — borders on dark backgrounds

  // ── Action ─────────────────────────────────────────────
  action1:            '#001e76',   // navy 500    — text/icons on buttons
  action2:            '#000e47',   // navy 800    — hover text/icons on buttons
  actionContainer1:   '#2226f7',   // ocean 500   — brand button bg
  actionContainer2:   '#1316a8',   // ocean 700   — brand button hover bg
  actionContainer3:   '#d4e2ff',   // ocean 50    — checkbox hover, hover states (confirmed April 2026)
  onAction1:          '#ffffff',   // neutral 0   — text/icons on action containers

  // ── Border-accent ──────────────────────────────────────
  borderAccent2:      '#001e76',   // navy 500    — outline button border
  borderAccent3:      '#001356',   // navy 700    — outline button hover border

  // ── Disabled ───────────────────────────────────────────
  disabled1:          '#8692a2',   // neutral 400 — text/icons in disabled components
  disabledContainer1: '#ffffff',   // neutral 5   — disabled container bg (white)
  disabledContainer2: '#e2e5e9',   // neutral 100 — disabled container bg (grey)
  onDisabled1:        '#8692a2',   // neutral 400 — text on disabledContainer1
  onDisabled2:        '#555f6d',   // neutral 600 — text on disabledContainer2
  borderDisabled1:    '#e2e5e9',   // neutral 100 — disabled borders

  // ── Error ──────────────────────────────────────────────
  error1:             '#971838',   // rose 800    — destructive hover
  errorContainer1:    '#fae5e6',   // rose 100    — error/destructive bg
  errorContainer2:    '#d81a45',   // rose 600    — destructive button bg
  onError1:           '#b6143a',   // rose 700    — text/icons on error container
  borderError1:       '#971838',   // rose 800    — error border
  borderError2:       '#971838',   // rose 950    — error border hover (TBD Figma)

  // ── Info ───────────────────────────────────────────────
  infoContainer1:     '#d4e2ff',   // navy 50     — info bg (refinement #10/#12)
  onInfo1:            '#001e76',   // navy 500    — text on info container

  // ── Success ────────────────────────────────────────────
  success1:           '#115e59',   // teal 800    — success text/icons
  successContainer1:  '#ccfbf1',   // teal 100    — success bg
  onSuccess1:         '#0f766e',   // teal 700    — text on success container

  // ── Warning ────────────────────────────────────────────
  warning1:           '#854d0e',   // yellow 800  — warning text/icons
  warningContainer1:  '#fef9c3',   // yellow 100  — warning bg
  onWarning1:         '#854d0e',   // yellow 800  — text on warning container
};

export const F = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ── Category palette (Frontier-specific, not Aegis tokens) ─────────────────
// Used only for audit-category badges. Do not use for general UI coloring.
export const CAT_PALETTE = {
  "Fire Safety":     { color: "#7c3aed", bg: "#faf5ff" },
  "Health & Safety": { color: "#b6143a", bg: "#fae5e6" },  // updated to Aegis rose
  "Loss Prevention": { color: "#001e76", bg: "#d4e2ff" },  // navy / actionContainer3
  "PPE":             { color: "#c2410c", bg: "#fff7ed" },
  "OSHA":            { color: "#001e76", bg: "#d4e2ff" },  // mapped to navy/info
  "Operations":      { color: "#0f766e", bg: "#ccfbf1" },  // updated to Aegis teal
};

// ── Radius scale ────────────────────────────────────────────────────────────
export const R = {
  sm:   4,     // nav items, badges, checkboxes
  md:   6,     // sub-elements (icon containers)
  lg:   8,     // buttons, inputs, alerts, toasts, modals
  xl:   12,    // data cards, KPI cards, panels
  full: 9999,  // avatars, toggles, round pills
};

// ── Shadow scale ────────────────────────────────────────────────────────────
export const S = {
  sm:     '0px 1px 2px rgba(0,0,0,0.05)',
  base:   '0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
  md:     '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)',
  lg:     '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
  activeNav: '0px -1px 1.7px rgba(0,0,0,0.03), 0px 5.7px 5.9px rgba(0,0,0,0.07), 0px 0px 5.9px rgba(0,0,0,0.07)',
  toast:  '0px -1px 1.44px rgba(0,0,0,0.03), 0px 4.3px 4.4px rgba(0,0,0,0.09), 0px 0px 4.4px rgba(0,0,0,0.08)',
};
