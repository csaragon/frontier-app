import { useState } from "react";
import { featureFlags, STUB_TEMPLATES } from "./shared.js";

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
};

// Icon: stacked rectangles with lines (template/document grid)
function TemplateIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="6" rx="1" />
      <rect x="3" y="12" width="10" height="9" rx="1" />
      <rect x="16" y="12" width="5" height="4" rx="1" />
      <rect x="16" y="19" width="5" height="2" rx="1" />
    </svg>
  );
}

// Icon: arrow pointing up out of a tray
function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

// Icon: pencil/edit
function ScratchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function RouteCard({ routeKey, icon, title, description, estTime, disabled, disabledText, onPickRoute }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => !disabled && onPickRoute(routeKey)}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => !disabled && setHover(false)}
      style={{
        flex: 1,
        minWidth: 200,
        padding: 24,
        borderRadius: 10,
        border: `1px solid ${hover ? C.navy : C.g2}`,
        background: C.white,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s",
        boxShadow: hover ? "0 4px 16px rgba(0,0,0,0.09)" : "none",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        flexDirection: "column",
        fontFamily: F,
      }}
    >
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: C.g1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: C.navy,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.g6, marginTop: 16 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.g5, marginTop: 6, lineHeight: "18px" }}>{description}</div>
      {disabled && disabledText && (
        <div style={{ fontSize: 11, color: C.g4, marginTop: 6, fontStyle: "italic" }}>{disabledText}</div>
      )}
      <div style={{
        marginTop: 16,
        display: "inline-block",
        padding: "3px 8px",
        borderRadius: 999,
        background: C.navy3,
        color: C.navy,
        fontSize: 10,
        fontWeight: 600,
        alignSelf: "flex-start",
      }}>
        {estTime}
      </div>
    </div>
  );
}

export default function PickAPath({ onPickRoute, onCancel, entryPoint = "catalog" }) {
  const catalogIsEmpty = STUB_TEMPLATES.length === 0;

  return (
    <div style={{
      height: "100vh",
      background: C.g1,
      display: "flex",
      flexDirection: "column",
      fontFamily: F,
    }}>
      {/* Top bar */}
      <div style={{
        height: 52,
        background: C.white,
        borderBottom: `1px solid ${C.g2}`,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        flexShrink: 0,
      }}>
        <button
          onClick={onCancel}
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
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Cancel
        </button>
      </div>

      {/* Centered content */}
      <div style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "48px 24px",
        width: "100%",
        boxSizing: "border-box",
      }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: C.g6 }}>
          New audit template
        </h1>
        <p style={{ margin: "0 0 40px", fontSize: 13, color: C.g4 }}>
          Choose how you want to start.
        </p>

        {/* TODO: [assumption-7] Feature-flagged; hidden by default */}
        {featureFlags.aiTemplateSearch && (
          <div style={{ marginBottom: 32, position: "relative" }}>
            <input
              disabled
              placeholder="Describe your audit and we'll get you started (coming soon)"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 50px 10px 14px",
                borderRadius: 8,
                border: `1px solid ${C.g3}`,
                fontSize: 13,
                fontFamily: F,
                color: C.g4,
                background: C.g1,
                cursor: "not-allowed",
              }}
            />
            <span style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: C.ocean,
              color: C.white,
              fontSize: 9,
              fontWeight: 700,
              padding: "2px 5px",
              borderRadius: 4,
            }}>AI</span>
          </div>
        )}

        {/* Route cards */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <RouteCard
            routeKey="template"
            icon={<TemplateIcon />}
            title="Start from a template"
            description="Browse pre-built templates and customize."
            estTime="~2 min"
            disabled={catalogIsEmpty}
            disabledText={catalogIsEmpty ? "No templates available yet." : undefined}
            onPickRoute={onPickRoute}
          />
          <RouteCard
            routeKey="upload"
            icon={<UploadIcon />}
            title="Upload a document"
            description="Turn an existing checklist or document into an audit."
            estTime="Under a minute"
            onPickRoute={onPickRoute}
          />
          <RouteCard
            routeKey="scratch"
            icon={<ScratchIcon />}
            title="Build from scratch"
            description="Start with a blank canvas and build your way."
            estTime="~10 min"
            onPickRoute={onPickRoute}
          />
        </div>

        {/* Footer cancel */}
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <button
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              color: C.g4,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: F,
              textDecoration: "none",
              padding: "4px 8px",
              borderRadius: 4,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; e.currentTarget.style.color = C.g5; }}
            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; e.currentTarget.style.color = C.g4; }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
