import { useState } from "react";
import { featureFlags, STUB_TEMPLATES } from "./shared.js";
import { T, F } from "../aegis-tokens.js";

const C = {
  navy:  T.action1,
  navy2: T.action2,
  navy3: T.actionContainer3,
  ocean: T.actionContainer1,
  white: T.surface1,
  g1:    T.surface2,
  g2:    T.border1,
  g3:    T.border2,
  g4:    T.disabled1,
  g5:    T.onSurface1,
  g6:    T.onSurface2,
};

const DRAFTS_CAP = 5;

function CatalogIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="6" rx="1" />
      <rect x="3" y="12" width="10" height="9" rx="1" />
      <rect x="16" y="12" width="5" height="4" rx="1" />
      <rect x="16" y="19" width="5" height="2" rx="1" />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  );
}

function ScratchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function RouteCard({ routeKey, icon, title, description, pill, pillColor, featured, disabled, disabledText, onPickRoute }) {
  const [hover, setHover] = useState(false);

  const borderColor = featured
    ? (hover ? C.navy : "#4f6bed")
    : (hover ? C.navy : C.g2);

  const bg = featured
    ? (hover ? "#f0f3ff" : "#f5f7ff")
    : C.white;

  const iconBg = featured ? C.navy : C.g1;
  const iconColor = featured ? C.white : C.navy;

  return (
    <div
      onClick={() => !disabled && onPickRoute(routeKey)}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => !disabled && setHover(false)}
      style={{
        flex: 1,
        minWidth: 200,
        padding: featured ? "26px 24px" : 24,
        borderRadius: 12,
        border: `${featured ? "2px" : "1px"} solid ${borderColor}`,
        background: bg,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s",
        boxShadow: hover
          ? featured
            ? "0 6px 24px rgba(0,30,118,0.16)"
            : "0 4px 16px rgba(0,0,0,0.09)"
          : featured
            ? "0 2px 10px rgba(0,30,118,0.10)"
            : "none",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        flexDirection: "column",
        fontFamily: F,
        position: "relative",
      }}
    >
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: iconColor,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.g6, marginTop: 16 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.g5, marginTop: 6, lineHeight: "18px" }}>{description}</div>
      {disabled && disabledText && (
        <div style={{ fontSize: 12, color: C.g4, marginTop: 6, fontStyle: "italic" }}>{disabledText}</div>
      )}
      {pill && (
        <div style={{
          marginTop: 16,
          display: "inline-block",
          padding: "3px 9px",
          borderRadius: 999,
          background: pillColor?.bg ?? C.navy3,
          color: pillColor?.text ?? C.navy,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.04em",
          alignSelf: "flex-start",
        }}>
          {pill}
        </div>
      )}
    </div>
  );
}

const MODULE_META = {
  "Fire Safety":     { color: "#b6143a", bg: "#fae5e6" },
  "Health & Safety": { color: "#854d0e", bg: "#fef9c3" },
  "Loss Prevention": { color: "#2226f7", bg: "#d4e2ff" },
  "PPE":             { color: "#115e59", bg: "#ccfbf1" },
  "OSHA":            { color: "#7c3aed", bg: "#faf5ff" },
  "Operations":      { color: "#001e76", bg: "#d4e2ff" },
};

function DraftRow({ t, onResume }) {
  const [hov, setHov] = useState(false);
  const mod = MODULE_META[t.cat] || { color: C.g4, bg: C.g1 };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: C.white,
        border: `1px solid ${hov ? C.g3 : C.g2}`,
        borderRadius: 8,
        padding: "11px 16px",
        transition: "border-color 0.12s, box-shadow 0.12s",
        boxShadow: hov ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: mod.bg,
        border: `1.5px solid ${mod.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: mod.color, fontFamily: F, textAlign: "center", lineHeight: "11px" }}>
          {t.cat.split(" ").map(w => w[0]).join("").slice(0, 2)}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.g6, fontFamily: F, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
        <div style={{ fontSize: 12, color: C.g4, fontFamily: F }}>
          {t.sections} section{t.sections !== 1 ? "s" : ""} · {t.questions} question{t.questions !== 1 ? "s" : ""} · Updated {t.updated}
        </div>
      </div>

      <div style={{
        padding: "3px 8px", borderRadius: 999,
        background: "#fef9c3", border: "1px solid #854d0e30",
        fontSize: 10, fontWeight: 600, color: "#854d0e",
        fontFamily: F, flexShrink: 0,
      }}>
        Draft
      </div>

      <button
        onClick={() => onResume(t.id)}
        style={{
          padding: "5px 12px", borderRadius: 6,
          border: `1px solid ${C.ocean}`,
          background: "#d4e2ff",
          color: C.ocean,
          fontSize: 12, fontWeight: 600, fontFamily: F,
          cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#dde4ff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#d4e2ff"; }}
      >
        Resume
      </button>
    </div>
  );
}

export default function PickAPath({ onPickRoute, onCancel, entryPoint = "catalog", templates = [], onResumeDraft, onViewAllDrafts }) {
  const catalogIsEmpty = STUB_TEMPLATES.length === 0;
  const allDrafts = templates
    .filter(t => t.state === "draft")
    .sort((a, b) => new Date(b.updated) - new Date(a.updated));

  const visibleDrafts = allDrafts.slice(0, DRAFTS_CAP);
  const hasMore = allDrafts.length > DRAFTS_CAP;

  return (
    <div style={{
      height: "100%",
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
        <h1 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: C.g6 }}>
          New audit template
        </h1>
        <p style={{ margin: "0 0 40px", fontSize: 13, color: C.g4 }}>
          Choose how you want to start.
        </p>

        {/* Route cards — order: Catalog, AI, Scratch */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <RouteCard
            routeKey="template"
            icon={<CatalogIcon />}
            title="Choose from the catalog"
            description="Browse pre-built templates and customize for your needs."
            disabled={catalogIsEmpty}
            disabledText={catalogIsEmpty ? "No templates available yet." : undefined}
            onPickRoute={onPickRoute}
          />
          <RouteCard
            routeKey="ai"
            icon={<AiIcon />}
            title="AI Audit Builder"
            description="Upload an Excel file or describe what you need — we'll build it for you."
            pill="Fastest"
            pillColor={{ bg: C.navy, text: C.white }}
            featured
            onPickRoute={onPickRoute}
          />
          <RouteCard
            routeKey="scratch"
            icon={<ScratchIcon />}
            title="Build from scratch"
            description="Start with a blank canvas and build your way."
            onPickRoute={onPickRoute}
          />
        </div>

        {/* Continue where you left off */}
        {visibleDrafts.length > 0 && onResumeDraft && (
          <div style={{
            marginTop: 40,
            background: C.white,
            border: `1px solid ${C.g2}`,
            borderRadius: 12,
            padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.g6, fontFamily: F }}>
                  Continue where you left off
                </div>
                <div style={{ fontSize: 12, color: C.g4, fontFamily: F, marginTop: 2 }}>
                  {allDrafts.length} draft{allDrafts.length !== 1 ? "s" : ""} waiting to be published
                </div>
              </div>
              {hasMore && onViewAllDrafts && (
                <button
                  onClick={onViewAllDrafts}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: C.ocean, fontSize: 12, fontWeight: 600,
                    fontFamily: F, padding: "4px 0", textDecoration: "underline",
                    flexShrink: 0,
                  }}
                >
                  View all drafts
                </button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {visibleDrafts.map(t => (
                <DraftRow key={t.id} t={t} onResume={onResumeDraft} />
              ))}
            </div>
            {hasMore && !onViewAllDrafts && (
              <div style={{ marginTop: 10, fontSize: 12, color: C.g4, fontFamily: F, textAlign: "center" }}>
                +{allDrafts.length - DRAFTS_CAP} more drafts
              </div>
            )}
          </div>
        )}

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
