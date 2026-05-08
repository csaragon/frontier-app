import { useState } from "react";
import { CAT_COLORS } from "./shared.js";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy:    "#001e76",
  navy2:   "#001356",
  navy3:   "#e8ecf8",
  ocean:   "#2226f7",
  ocean2:  "#1316a8",
  ocean3:  "#d4e2ff",
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
  red2:    "#fae5e6",
  yel:     "#854d0e",
  yel2:    "#fef9c3",
  amber:   "#854d0e",
  amberBg: "#fef9c3",
  green:   "#115e59",
  greenBg: "#ccfbf1",
};

// Per-category static section/question data for PreviewModal
const TEMPLATE_SECTIONS = {
  "Fire Safety": [
    {
      title: "Egress Routes",
      questions: [
        { text: "Are all emergency exits clearly marked and unobstructed?", type: "Yes/No" },
        { text: "Are exit signs illuminated and in working condition?", type: "Yes/No" },
        { text: "Is the minimum aisle width maintained throughout the store?", type: "Numeric" },
      ],
    },
    {
      title: "Suppression Systems",
      questions: [
        { text: "Are sprinkler heads free from obstructions and paint?", type: "Yes/No" },
        { text: "When was the last fire extinguisher inspection completed?", type: "Date" },
        { text: "Are fire suppression system service logs current?", type: "Yes/No" },
      ],
    },
    {
      title: "Staff Readiness",
      questions: [
        { text: "Have all staff completed fire safety training in the past 12 months?", type: "Yes/No" },
        { text: "Is the fire warden list current and posted?", type: "Yes/No" },
        { text: "Was the last fire drill completed within the required period?", type: "Yes/No" },
      ],
    },
  ],
  "Health & Safety": [
    {
      title: "Hazard Identification",
      questions: [
        { text: "Are all slip and fall hazards identified and mitigated?", type: "Yes/No" },
        { text: "Are wet floor signs available and in good condition?", type: "Yes/No" },
        { text: "Is the safety incident log current and accessible?", type: "Yes/No" },
      ],
    },
    {
      title: "Employee Safety",
      questions: [
        { text: "Are employees trained on current safety procedures?", type: "Yes/No" },
        { text: "Are safety data sheets (SDS) available and current?", type: "Yes/No" },
        { text: "How many safety incidents occurred in the last 30 days?", type: "Numeric" },
      ],
    },
    {
      title: "Equipment & Facilities",
      questions: [
        { text: "Are all ladders and step stools in safe working condition?", type: "Yes/No" },
        { text: "Are first aid kits fully stocked and accessible?", type: "Yes/No" },
        { text: "Are all electrical panels accessible and labeled?", type: "Yes/No" },
      ],
    },
  ],
  "Loss Prevention": [
    {
      title: "Surveillance & Access",
      questions: [
        { text: "Are all CCTV cameras operational and providing clear footage?", type: "Yes/No" },
        { text: "Are access control systems functioning for all restricted areas?", type: "Yes/No" },
        { text: "Is the DVR/NVR recording continuously with adequate storage?", type: "Yes/No" },
      ],
    },
    {
      title: "Cash Handling",
      questions: [
        { text: "Are cash handling procedures followed at all registers?", type: "Yes/No" },
        { text: "Are safe counts completed and logged per policy?", type: "Yes/No" },
        { text: "Are till overages/shortages within acceptable thresholds?", type: "Numeric" },
      ],
    },
    {
      title: "Shrink Controls",
      questions: [
        { text: "Are EAS tags applied to all required merchandise?", type: "Yes/No" },
        { text: "Are fitting room policies being enforced?", type: "Yes/No" },
        { text: "Is the returns desk process being followed consistently?", type: "Yes/No" },
      ],
    },
  ],
  "Operations": [
    {
      title: "Staffing & Coverage",
      questions: [
        { text: "Are staffing boards current and posted in the break room?", type: "Yes/No" },
        { text: "Are all required positions filled for this shift?", type: "Yes/No" },
        { text: "Are department handoff procedures being followed?", type: "Yes/No" },
      ],
    },
    {
      title: "Planogram Compliance",
      questions: [
        { text: "Are all planograms installed per the current reset schedule?", type: "Yes/No" },
        { text: "Are price labels current and accurate?", type: "Yes/No" },
        { text: "What is the overall planogram compliance percentage?", type: "Numeric" },
      ],
    },
    {
      title: "Store Standards",
      questions: [
        { text: "Are all departments meeting cleanliness standards?", type: "Yes/No" },
        { text: "Are fixtures properly assembled and in good condition?", type: "Yes/No" },
        { text: "Are back-of-house areas organized per store standards?", type: "Yes/No" },
      ],
    },
  ],
  "PPE Compliance": [
    {
      title: "PPE Availability",
      questions: [
        { text: "Is all required PPE available and stocked at each workstation?", type: "Yes/No" },
        { text: "Are PPE inspection records current?", type: "Yes/No" },
        { text: "Are replacement PPE supplies on hand?", type: "Yes/No" },
      ],
    },
    {
      title: "PPE Condition",
      questions: [
        { text: "Is all PPE in serviceable condition with no visible damage?", type: "Yes/No" },
        { text: "Are expired items removed from service?", type: "Yes/No" },
        { text: "How many PPE items are due for replacement?", type: "Numeric" },
      ],
    },
    {
      title: "Usage Compliance",
      questions: [
        { text: "Are employees wearing required PPE for their roles?", type: "Yes/No" },
        { text: "Have all employees been trained on correct PPE usage?", type: "Yes/No" },
        { text: "Are PPE compliance incidents documented and addressed?", type: "Yes/No" },
      ],
    },
  ],
};

function getTemplateSections(template) {
  return TEMPLATE_SECTIONS[template.cat] || TEMPLATE_SECTIONS["Health & Safety"];
}

function OverlayBase({ children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        fontFamily: F,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

function ModalPanel({ children, width = 560, style = {} }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width,
        maxWidth: "calc(100vw - 32px)",
        background: C.white,
        borderRadius: 12,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function BtnPrimary({ onClick, children, style = {} }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? C.navy2 : C.navy,
        color: C.white,
        border: "none",
        borderRadius: 8,
        padding: "8px 18px",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: F,
        cursor: "pointer",
        transition: "background 0.12s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function BtnSecondary({ onClick, children, style = {} }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? C.g1 : C.white,
        color: C.g6,
        border: `1px solid ${C.g3}`,
        borderRadius: 8,
        padding: "8px 18px",
        fontSize: 13,
        fontWeight: 500,
        fontFamily: F,
        cursor: "pointer",
        transition: "background 0.12s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function BtnGhost({ onClick, children, color = C.g5, style = {} }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "none",
        color: hover ? C.g6 : color,
        border: "none",
        borderRadius: 8,
        padding: "8px 14px",
        fontSize: 13,
        fontWeight: 500,
        fontFamily: F,
        cursor: "pointer",
        transition: "color 0.12s",
        textDecoration: hover ? "underline" : "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function TypeBadge({ type }) {
  const colors = {
    "Yes/No":  { color: C.teal,  bg: C.teal2 },
    "Numeric": { color: C.ocean, bg: C.ocean3 },
    "Date":    { color: C.amber, bg: C.amberBg },
  };
  const c = colors[type] || colors["Yes/No"];
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 600,
      color: c.color,
      background: c.bg,
      borderRadius: 4,
      padding: "2px 6px",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      {type}
    </span>
  );
}

// ─── PreviewModal ───────────────────────────────────────────────────────────

export function PreviewModal({ template, onUse, onFullPreview, onClose, userLangs = [] }) {
  const [openSections, setOpenSections] = useState({ 0: true });
  const sections = getTemplateSections(template);
  const catStyle = { color: C.g5, bg: C.g1 };
  const missingLangs = userLangs.filter((l) => !template.langs.includes(l));
  const allSupported = missingLangs.length === 0;

  const toggleSection = (i) => {
    setOpenSections((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <OverlayBase onClose={onClose}>
      <ModalPanel width={640} style={{ maxHeight: "80vh" }}>
        {/* Header */}
        <div style={{
          padding: "18px 20px",
          borderBottom: `1px solid ${C.g2}`,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.g6, fontFamily: F }}>
                {template.name}
              </h2>
              <CategoryPill cat={template.cat} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, display: "flex", padding: 4, borderRadius: 6, flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C.g6; e.currentTarget.style.background = C.g1; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.g4; e.currentTarget.style.background = "none"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "18px 20px" }}>
          {/* Description */}
          <p style={{ margin: "0 0 20px", fontSize: 13, color: C.g5, lineHeight: "20px", fontFamily: F }}>
            {template.description}
          </p>

          {/* Language support */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 8,
            background: allSupported ? C.greenBg : C.amberBg,
            border: `1px solid ${allSupported ? "#bbf7d0" : "#fde68a"}`,
            marginBottom: 20,
          }}>
            {allSupported ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ fontSize: 12, color: C.green, fontWeight: 500, fontFamily: F }}>
                  All required languages supported ({userLangs.join(", ")})
                </span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span style={{ fontSize: 12, color: C.amber, fontWeight: 500, fontFamily: F }}>
                  Missing: {missingLangs.join(", ")}
                </span>
              </>
            )}
          </div>

          {/* Sections accordion */}
          <div style={{ fontSize: 12, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, fontFamily: F }}>
            Sections &amp; Questions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sections.map((sec, si) => (
              <div key={si} style={{ border: `1px solid ${C.g2}`, borderRadius: 8, overflow: "hidden" }}>
                <button
                  onClick={() => toggleSection(si)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: openSections[si] ? C.g1 : C.white,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: F,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.g6 }}>{sec.title}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: C.g4 }}>{sec.questions.length} questions</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: openSections[si] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>
                {openSections[si] && (
                  <div style={{ padding: "0 14px 10px" }}>
                    {sec.questions.slice(0, 3).map((q, qi) => (
                      <div key={qi} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 0",
                        borderTop: qi === 0 ? `1px solid ${C.g2}` : "none",
                        paddingTop: qi === 0 ? 10 : 8,
                      }}>
                        <span style={{ fontSize: 12, color: C.g5, flex: 1, fontFamily: F, lineHeight: "18px" }}>{q.text}</span>
                        <TypeBadge type={q.type} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 20px",
          borderTop: `1px solid ${C.g2}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
          background: C.white,
        }}>
          <BtnPrimary onClick={onUse}>Use this template</BtnPrimary>
          <button
            onClick={onFullPreview}
            style={{
              background: "none",
              border: "none",
              color: C.ocean,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: F,
              cursor: "pointer",
              textDecoration: "underline",
              padding: "8px 4px",
            }}
          >
            View full preview
          </button>
          <div style={{ flex: 1 }} />
          <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
        </div>
      </ModalPanel>
    </OverlayBase>
  );
}

// ─── CategoryPill (shared helper used by PreviewModal) ───────────────────────

function CategoryPill({ cat }) {
  const style = CAT_COLORS[cat] || { color: C.g5, bg: C.g2 };
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      color: style.color,
      background: style.bg,
      borderRadius: 4,
      padding: "2px 7px",
      whiteSpace: "nowrap",
      fontFamily: F,
    }}>
      {cat}
    </span>
  );
}

// ─── SwitchRouteModal ────────────────────────────────────────────────────────

export function SwitchRouteModal({ onSave, onDiscard, onCancel }) {
  return (
    <OverlayBase onClose={onCancel}>
      <ModalPanel width={440}>
        <div style={{ padding: "24px 24px 20px", fontFamily: F }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: C.g6 }}>
            Switch your path?
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: C.g5, lineHeight: "20px" }}>
            Switching will discard everything in this draft. Save your current progress first?
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <BtnPrimary onClick={onSave}>Save as draft</BtnPrimary>
            <button
              onClick={onDiscard}
              style={{
                background: "none",
                border: "none",
                color: C.red,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: F,
                cursor: "pointer",
                padding: "8px 4px",
                textDecoration: "underline",
              }}
            >
              Discard and switch
            </button>
            <div style={{ flex: 1 }} />
            <BtnSecondary onClick={onCancel}>Cancel</BtnSecondary>
          </div>
        </div>
      </ModalPanel>
    </OverlayBase>
  );
}

// ─── CancelProcessingModal ───────────────────────────────────────────────────

export function CancelProcessingModal({ onConfirm, onCancel }) {
  return (
    <OverlayBase onClose={onCancel}>
      <ModalPanel width={400}>
        <div style={{ padding: "24px 24px 20px", fontFamily: F }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: C.g6 }}>
            Cancel processing?
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: C.g5, lineHeight: "20px" }}>
            Your file won't be saved.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={onConfirm}
              style={{
                background: C.red,
                color: C.white,
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: F,
                cursor: "pointer",
              }}
            >
              Yes, cancel
            </button>
            <BtnSecondary onClick={onCancel}>Keep waiting</BtnSecondary>
          </div>
        </div>
      </ModalPanel>
    </OverlayBase>
  );
}

// ─── DiscardModal ────────────────────────────────────────────────────────────

export function DiscardModal({ onSaveAndExit, onExitWithout, onCancel }) {
  const [discardHov, setDiscardHov] = useState(false);
  return (
    <div style={{
      position: "fixed",
      bottom: 28,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      background: C.g6,
      borderRadius: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      fontFamily: F,
      whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 13, color: C.white, fontWeight: 500 }}>
        Discard unsaved changes?
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onCancel}
          style={{
            background: "rgba(255,255,255,0.12)",
            color: C.white,
            border: "1px solid rgba(255,255,255,0.20)",
            borderRadius: 7,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: F,
            cursor: "pointer",
          }}
        >
          Keep editing
        </button>
        <button
          onClick={onSaveAndExit}
          style={{
            background: C.white,
            color: C.g6,
            border: "none",
            borderRadius: 7,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: F,
            cursor: "pointer",
          }}
        >
          Save draft
        </button>
        <button
          onClick={onExitWithout}
          onMouseEnter={() => setDiscardHov(true)}
          onMouseLeave={() => setDiscardHov(false)}
          style={{
            background: discardHov ? "#fae5e6" : C.red2,
            color: C.red,
            border: "none",
            borderRadius: 7,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: F,
            cursor: "pointer",
            transition: "background 0.12s",
          }}
        >
          Discard
        </button>
      </div>
    </div>
  );
}
