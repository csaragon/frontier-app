import { useState } from "react";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy:    "#001e76",
  navy2:   "#001356",
  navy3:   "#e8ecf8",
  ocean:   "#2226f7",
  white:   "#ffffff",
  g1:      "#f4f4f6",
  g2:      "#e2e5e9",
  g3:      "#c3c8d0",
  g4:      "#8692a2",
  g5:      "#555f6d",
  g6:      "#16191d",
  teal:    "#0f766e",
  teal2:   "#ccfbf1",
  red:     "#b6143a",
  green:   "#115e59",
  greenBg: "#ccfbf1",
};

const ROUTE_LABELS = {
  template: { label: "Starting from template", color: C.navy,    bg: C.navy3 },
  upload:   { label: "Uploaded document",       color: C.teal,    bg: C.teal2 },
  scratch:  { label: "Building from scratch",   color: C.ocean,   bg: "#e0e7ff" },
};

function RouteBadge({ routeOrigin }) {
  const cfg = ROUTE_LABELS[routeOrigin] || ROUTE_LABELS.scratch;
  return (
    <span style={{
      fontSize: 12,
      fontWeight: 700,
      color: cfg.color,
      background: cfg.bg,
      borderRadius: 4,
      padding: "3px 10px",
      fontFamily: F,
    }}>
      {cfg.label}
    </span>
  );
}

// TODO: [assumption-6] Description field REQUIRED on Details step — flag for review
// TODO: [assumption-5] Auto-save fires after each completed step, not on every keystroke
// TODO: [assumption-9] Version header stubbed: when editing existing, show "Template name · v3 → v4" in header

export default function WizardPlaceholder({ routeOrigin = "scratch", templateId = null, entryPoint = "catalog", onBack }) {
  const [discardHover, setDiscardHover] = useState(false);

  const subtitleMap = {
    template: templateId ? `Template ID: ${templateId} pre-loaded` : "Template pre-loaded",
    upload:   "4 sections and 23 questions extracted from your document",
    scratch:  "Empty template — start adding details",
  };
  const subtitle = subtitleMap[routeOrigin] || subtitleMap.scratch;

  return (
    <div style={{ height: "100vh", background: C.g1, display: "flex", flexDirection: "column", fontFamily: F }}>
      {/* Top bar */}
      <div style={{
        height: 52,
        background: C.white,
        borderBottom: `1px solid ${C.g2}`,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 12,
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.g5,
            fontSize: 13,
            fontFamily: F,
            padding: "4px 8px",
            borderRadius: 6,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.g1; e.currentTarget.style.color = C.g6; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.g5; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {/* Version header stub */}
        {templateId && (
          <span style={{ fontSize: 12, color: C.g4, marginLeft: 4 }}>
            Editing: Template #{templateId} · v2 → v3 (stub)
          </span>
        )}

        <div style={{ flex: 1 }} />

        {/* Auto-save indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
            <polyline points="16 16 12 12 8 16" />
          </svg>
          <span style={{ fontSize: 12, color: C.teal, fontFamily: F }}>Saved just now</span>
        </div>
      </div>

      {/* Centered content */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "48px 24px", overflowY: "auto" }}>
        <div style={{ maxWidth: 560, width: "100%" }}>
          <div style={{ marginBottom: 16 }}>
            <RouteBadge routeOrigin={routeOrigin} />
          </div>

          <h1 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: C.g6 }}>
            Wizard placeholder — Step 1: Details
          </h1>
          <p style={{ margin: "0 0 28px", fontSize: 13, color: C.g5 }}>
            {subtitle}
          </p>

          {/* Placeholder body */}
          <div style={{
            background: C.g1,
            borderRadius: 12,
            border: `1px dashed ${C.g3}`,
            padding: 32,
            textAlign: "center",
            marginBottom: 28,
          }}>
            <p style={{ margin: 0, fontSize: 12, color: C.g4, lineHeight: "20px" }}>
              The wizard steps (Details → Scoring → Questions → Schedule &amp; Assign) will be built in the next phase.
            </p>
          </div>

          {/* Bottom buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={onBack}
              style={{
                background: C.navy,
                color: C.white,
                border: "none",
                borderRadius: 8,
                padding: "9px 22px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: F,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.navy2; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.navy; }}
            >
              Save &amp; Close
            </button>
            <button
              onClick={onBack}
              onMouseEnter={() => setDiscardHover(true)}
              onMouseLeave={() => setDiscardHover(false)}
              style={{
                background: "none",
                border: "none",
                color: discardHover ? "#8b0022" : C.red,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: F,
                padding: "9px 12px",
                textDecoration: discardHover ? "underline" : "none",
              }}
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
