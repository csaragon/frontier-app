import { useState, useRef, useEffect, useMemo } from "react";
import { CAT_COLORS } from "./shared.js";
import { LogicIcons, IconAction, IconConditional, IconEscalation, IconPhoto, FEATURE_COLORS } from "./typeIcons.jsx";

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
        { text: "Are all emergency exits clearly marked and unobstructed?", type: "Yes/No/NA", required: true, hasAction: true },
        { text: "Are exit signs illuminated and in working condition?", type: "Yes/No/NA", required: true },
        { text: "Is the minimum aisle width maintained throughout the store?", type: "Number", required: false, hasEscalation: true },
      ],
    },
    {
      title: "Suppression Systems",
      questions: [
        { text: "Are sprinkler heads free from obstructions and paint?", type: "Pass/Fail", required: true, hasAction: true },
        { text: "When was the last fire extinguisher inspection completed?", type: "Free Text", required: true },
        { text: "Are fire suppression system service logs current?", type: "Yes/No", required: true },
      ],
    },
    {
      title: "Staff Readiness",
      questions: [
        { text: "Have all staff completed fire safety training in the past 12 months?", type: "Yes/No", required: true, hasConditional: true },
        { text: "Is the fire warden list current and posted?", type: "Yes/No", required: false },
        { text: "Was the last fire drill completed within the required period?", type: "Yes/No", required: true, hasEscalation: true },
      ],
    },
  ],
  "Health & Safety": [
    {
      title: "Hazard Identification",
      questions: [
        { text: "Are all slip and fall hazards identified and mitigated?", type: "Yes/No/NA", required: true, hasAction: true, hasPhoto: true },
        { text: "Are wet floor signs available and in good condition?", type: "Yes/No", required: true },
        { text: "Is the safety incident log current and accessible?", type: "Yes/No", required: false },
      ],
    },
    {
      title: "Employee Safety",
      questions: [
        { text: "Are employees trained on current safety procedures?", type: "Yes/No", required: true, hasConditional: true },
        { text: "Are safety data sheets (SDS) available and current?", type: "Pass/Fail", required: true },
        { text: "How many safety incidents occurred in the last 30 days?", type: "Number", required: false, hasEscalation: true },
      ],
    },
    {
      title: "Equipment & Facilities",
      questions: [
        { text: "Are all ladders and step stools in safe working condition?", type: "Pass/Fail", required: true, hasAction: true },
        { text: "Are first aid kits fully stocked and accessible?", type: "Yes/No", required: true },
        { text: "Are all electrical panels accessible and labeled?", type: "Yes/No", required: false },
      ],
    },
  ],
  "Loss Prevention": [
    {
      title: "Surveillance & Access",
      questions: [
        { text: "Are all CCTV cameras operational and providing clear footage?", type: "Yes/No/NA", required: true, hasEscalation: true },
        { text: "Are access control systems functioning for all restricted areas?", type: "Yes/No", required: true },
        { text: "Is the DVR/NVR recording continuously with adequate storage?", type: "Pass/Fail", required: false },
      ],
    },
    {
      title: "Cash Handling",
      questions: [
        { text: "Are cash handling procedures followed at all registers?", type: "Yes/No/NA", required: true, hasConditional: true, hasAction: true },
        { text: "Are safe counts completed and logged per policy?", type: "Pass/Fail", required: true },
        { text: "Are till overages/shortages within acceptable thresholds?", type: "Number", required: false, hasEscalation: true },
      ],
    },
    {
      title: "Shrink Controls",
      questions: [
        { text: "Are EAS tags applied to all required merchandise?", type: "Yes/No", required: true, hasAction: true },
        { text: "Are fitting room policies being enforced?", type: "Yes/No", required: false },
        { text: "Is the returns desk process being followed consistently?", type: "Pass/Fail", required: true, hasConditional: true },
      ],
    },
  ],
  "Operations": [
    {
      title: "Staffing & Coverage",
      questions: [
        { text: "Are staffing boards current and posted in the break room?", type: "Yes/No", required: false },
        { text: "Are all required positions filled for this shift?", type: "Yes/No", required: true, hasEscalation: true },
        { text: "Are department handoff procedures being followed?", type: "Pass/Fail", required: false },
      ],
    },
    {
      title: "Planogram Compliance",
      questions: [
        { text: "Are all planograms installed per the current reset schedule?", type: "Yes/No", required: true, hasAction: true },
        { text: "Are price labels current and accurate?", type: "Pass/Fail", required: true },
        { text: "What is the overall planogram compliance percentage?", type: "Rating Scale", required: false },
      ],
    },
    {
      title: "Store Standards",
      questions: [
        { text: "Are all departments meeting cleanliness standards?", type: "Rating Scale", required: true, hasConditional: true },
        { text: "Are fixtures properly assembled and in good condition?", type: "Yes/No", required: false, hasAction: true },
        { text: "Are back-of-house areas organized per store standards?", type: "Yes/No", required: false },
      ],
    },
  ],
  "PPE Compliance": [
    {
      title: "PPE Availability",
      questions: [
        { text: "Is all required PPE available and stocked at each workstation?", type: "Yes/No/NA", required: true, hasAction: true },
        { text: "Are PPE inspection records current?", type: "Yes/No", required: true },
        { text: "Are replacement PPE supplies on hand?", type: "Yes/No", required: false },
      ],
    },
    {
      title: "PPE Condition",
      questions: [
        { text: "Is all PPE in serviceable condition with no visible damage?", type: "Pass/Fail", required: true, hasAction: true },
        { text: "Are expired items removed from service?", type: "Yes/No", required: true, hasConditional: true },
        { text: "How many PPE items are due for replacement?", type: "Number", required: false, hasEscalation: true },
      ],
    },
    {
      title: "Usage Compliance",
      questions: [
        { text: "Are employees wearing required PPE for their roles?", type: "Pass/Fail", required: true, hasAction: true, hasConditional: true },
        { text: "Have all employees been trained on correct PPE usage?", type: "Yes/No", required: false },
        { text: "Are PPE compliance incidents documented and addressed?", type: "Yes/No", required: false },
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

const ANSWER_TYPE_COLORS = {
  "Yes/No":          { bg: "#d9e5f5", color: "#2b4b94" },
  "Yes/No/NA":       { bg: "#d9e5f5", color: "#2b4b94" },
  "Pass/Fail":       { bg: "#e0dcf8", color: "#4030a6" },
  "Rating Scale":    { bg: "#e8d8f5", color: "#5c2c98" },
  "Free Text":       { bg: "#d6ecf5", color: "#1e5f80" },
  "Number":          { bg: "#d6dff0", color: "#2e3e72" },
  "Multiple Choice": { bg: "#e6e9ed", color: "#48535f" },
  "Photo Required":  { bg: "#e0dcf8", color: "#4030a6" },
  "Date":            { bg: C.amberBg, color: C.amber },
};

function TypeBadge({ type }) {
  const c = ANSWER_TYPE_COLORS[type] || { bg: C.g1, color: C.g5 };
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
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showLogicPreview, setShowLogicPreview] = useState(false);
  const typeDropRef = useRef(null);

  const sections = getTemplateSections(template);
  const missingLangs = userLangs.filter((l) => !template.langs.includes(l));
  const allSupported = missingLangs.length === 0;

  useEffect(() => {
    if (!showTypeDropdown) return;
    function handle(e) { if (typeDropRef.current && !typeDropRef.current.contains(e.target)) setShowTypeDropdown(false); }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showTypeDropdown]);

  const allTypes = useMemo(
    () => [...new Set(sections.flatMap(s => s.questions.map(q => q.type)))],
    [sections]
  );

  const activeTypeCount = selectedTypes.size;
  const hasFilters = search.trim() !== "" || activeTypeCount > 0;

  const filteredSections = sections.map(sec => ({
    ...sec,
    questions: sec.questions.filter(q => {
      const matchSearch = !search.trim() || q.text.toLowerCase().includes(search.toLowerCase());
      const matchType = selectedTypes.size === 0 || selectedTypes.has(q.type);
      return matchSearch && matchType;
    }),
  }));

  const toggleSection = (i) => setOpenSections((prev) => ({ ...prev, [i]: !prev[i] }));
  function toggleType(type) {
    setSelectedTypes(prev => { const n = new Set(prev); n.has(type) ? n.delete(type) : n.add(type); return n; });
  }

  return (
    <OverlayBase onClose={onClose}>
      <ModalPanel width={720} style={{ maxHeight: "88vh" }}>

        {/* Header */}
        <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${C.g2}`, flexShrink: 0 }}>
          {/* Template Preview label + close */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.navy, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.07em" }}>Template Preview</span>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, padding: 4, borderRadius: 4, display: "flex" }}
              onMouseEnter={e => e.currentTarget.style.color = C.g6}
              onMouseLeave={e => e.currentTarget.style.color = C.g4}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          {/* Template name + category */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.g6, fontFamily: F }}>{template.name}</span>
            <CategoryPill cat={template.cat} />
          </div>
          {/* Description */}
          <div style={{ fontSize: 13, color: C.g4, lineHeight: "18px", marginBottom: 8, fontFamily: F }}>{template.description}</div>
          {/* Metadata row */}
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.g4, flexWrap: "wrap", fontFamily: F }}>
            <span><strong style={{ color: C.g5 }}>{template.sections}</strong> sections</span>
            <span><strong style={{ color: C.g5 }}>{template.questions}</strong> questions</span>
            <span>Updated {template.updatedDays === 1 ? "1 day" : `${template.updatedDays} days`} ago</span>
            {!allSupported && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: C.amber }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Missing: {missingLangs.join(", ")}
              </span>
            )}
            {allSupported && userLangs.length > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: C.green }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {userLangs.join(", ")} supported
              </span>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ padding: "8px 20px", borderBottom: `1px solid ${C.g2}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 180px", minWidth: 140 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search questions…"
              style={{
                width: "100%", boxSizing: "border-box",
                paddingLeft: 28, paddingRight: search ? 26 : 10, paddingTop: 6, paddingBottom: 6,
                fontSize: 12, fontFamily: F, color: C.g6,
                border: `1px solid ${C.g2}`, borderRadius: 7, outline: "none", background: C.white,
              }}
              onFocus={e => e.currentTarget.style.borderColor = C.navy}
              onBlur={e => e.currentTarget.style.borderColor = C.g2}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.g4, padding: 2, display: "flex" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          {/* Type dropdown */}
          <div ref={typeDropRef} style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setShowTypeDropdown(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 500, fontFamily: F,
                color: activeTypeCount > 0 ? C.navy : C.g5,
                background: activeTypeCount > 0 ? "#eef1ff" : C.g1,
                border: `1px solid ${activeTypeCount > 0 ? "#c7cff7" : C.g2}`,
                borderRadius: 7, padding: "6px 10px", cursor: "pointer",
              }}
              onMouseEnter={e => { if (!activeTypeCount) e.currentTarget.style.background = C.g2; }}
              onMouseLeave={e => { if (!activeTypeCount) e.currentTarget.style.background = C.g1; }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Type{activeTypeCount > 0 ? ` · ${activeTypeCount}` : ""}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showTypeDropdown && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200,
                background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8,
                boxShadow: "0 4px 16px rgba(0,0,0,0.14)", width: 200, overflow: "hidden", fontFamily: F,
              }}>
                <div style={{ padding: "8px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Answer Type</div>
                  {allTypes.map(type => {
                    const tc = ANSWER_TYPE_COLORS[type] || { bg: C.g1, color: C.g5 };
                    const checked = selectedTypes.has(type);
                    return (
                      <label key={type} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", cursor: "pointer" }}>
                        <div onClick={() => toggleType(type)} style={{
                          width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                          border: `1.5px solid ${checked ? C.navy : C.g3}`,
                          background: checked ? C.navy : C.white,
                          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                        }}>
                          {checked && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: tc.color, background: tc.bg, borderRadius: 4, padding: "1px 6px" }}>{type}</span>
                      </label>
                    );
                  })}
                </div>
                {activeTypeCount > 0 && (
                  <div style={{ borderTop: `1px solid ${C.g2}`, padding: "7px 12px" }}>
                    <button onClick={() => setSelectedTypes(new Set())} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: C.navy, fontFamily: F, fontWeight: 500, padding: 0 }}>Clear</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview toggle */}
          <button
            onClick={() => setShowLogicPreview(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
              fontSize: 12, fontWeight: 600, fontFamily: F,
              color: showLogicPreview ? C.navy : C.g5,
              background: showLogicPreview ? "#eef1ff" : C.g1,
              border: `1px solid ${showLogicPreview ? "#c7cff7" : C.g2}`,
              borderRadius: 7, padding: "6px 10px", cursor: "pointer",
            }}
            onMouseEnter={e => { if (!showLogicPreview) e.currentTarget.style.background = C.g2; }}
            onMouseLeave={e => { if (!showLogicPreview) e.currentTarget.style.background = C.g1; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Preview
          </button>

          {hasFilters && (
            <button onClick={() => { setSearch(""); setSelectedTypes(new Set()); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: C.g4, fontFamily: F, padding: "6px 4px", flexShrink: 0 }}>
              Clear
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "14px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredSections.map((sec, si) => (
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
                    <span style={{ fontSize: 12, color: hasFilters && sec.questions.length === 0 ? C.g3 : C.g4 }}>
                      {sec.questions.length} questions
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: openSections[si] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>
                {openSections[si] && (
                  <div style={{ padding: "0 14px 10px" }}>
                    {sec.questions.length === 0 ? (
                      <div style={{ padding: "14px 0", textAlign: "center", fontSize: 12, color: C.g4, fontFamily: F }}>No questions match.</div>
                    ) : (
                      <>
                        {/* Table header */}
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "20px 1fr 90px 32px 50px",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 0",
                          borderTop: `1px solid ${C.g2}`,
                          borderBottom: `1px solid ${C.g2}`,
                        }}>
                          {["#", "Question", "Type", "Req", "Logic"].map((h) => (
                            <div key={h} style={{ fontSize: 9, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: F }}>{h}</div>
                          ))}
                        </div>
                        {sec.questions.map((q, qi) => {
                          const hasActionPreview      = !!q.hasAction;
                          const hasConditionalPreview = !!q.hasConditional;
                          const hasEscalationPreview  = !!q.hasEscalation;
                          const hasPhotoPreview       = !!q.hasPhoto;
                          const hasAnyPreview         = hasActionPreview || hasConditionalPreview || hasEscalationPreview || hasPhotoPreview;
                          const isLast                = qi === sec.questions.length - 1;
                          return (
                            <div key={qi}>
                              <div style={{
                                display: "grid",
                                gridTemplateColumns: "20px 1fr 90px 32px 50px",
                                alignItems: "flex-start",
                                gap: 8,
                                padding: "7px 0",
                                borderBottom: (!hasAnyPreview || !showLogicPreview) && !isLast ? `1px solid ${C.g2}` : "none",
                              }}>
                                <span style={{ fontSize: 10, fontWeight: 600, color: C.g4, fontFamily: F }}>{qi + 1}</span>
                                <div style={{ fontSize: 12, color: C.g6, fontFamily: F, lineHeight: "16px" }}>{q.text}</div>
                                <div><TypeBadge type={q.type} /></div>
                                <div>
                                  {q.required
                                    ? <span style={{ fontSize: 9, fontWeight: 700, color: C.red, background: C.red2, borderRadius: 3, padding: "1px 5px", fontFamily: F }}>Yes</span>
                                    : <span style={{ fontSize: 9, color: C.g3, fontFamily: F }}>—</span>}
                                </div>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <LogicIcons question={q} size={11} />
                                </div>
                              </div>
                              {/* Trigger preview block */}
                              {hasAnyPreview && showLogicPreview && (
                                <div style={{ marginLeft: 28, marginBottom: 6, fontFamily: F }}>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: C.g5, marginBottom: 4 }}>
                                    {hasPhotoPreview && !hasActionPreview && !hasEscalationPreview && !hasConditionalPreview ? "Photo required" : "When flagged"}
                                  </div>
                                  <div style={{ paddingLeft: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                                    {hasActionPreview && (
                                      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                                        <span style={{ display: "flex", color: FEATURE_COLORS.action.color, marginTop: 1, flexShrink: 0 }}><IconAction size={11} /></span>
                                        <span style={{ fontSize: 11, color: C.g5, lineHeight: "15px" }}>Corrective action will be created.</span>
                                      </div>
                                    )}
                                    {hasConditionalPreview && (
                                      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                                        <span style={{ display: "flex", color: FEATURE_COLORS.conditional.color, marginTop: 1, flexShrink: 0 }}><IconConditional size={11} /></span>
                                        <span style={{ fontSize: 11, color: C.g5, lineHeight: "15px" }}>Conditional follow-up question will appear.</span>
                                      </div>
                                    )}
                                    {hasEscalationPreview && (
                                      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                                        <span style={{ display: "flex", color: FEATURE_COLORS.escalation.color, marginTop: 1, flexShrink: 0 }}><IconEscalation size={11} /></span>
                                        <span style={{ fontSize: 11, color: C.g5, lineHeight: "15px" }}>Escalation alert triggered on response.</span>
                                      </div>
                                    )}
                                    {hasPhotoPreview && (
                                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ display: "flex", color: FEATURE_COLORS.photo.color, flexShrink: 0 }}><IconPhoto size={11} /></span>
                                        <span style={{ fontSize: 11, color: C.g5 }}>Photo evidence capture required.</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {hasAnyPreview && showLogicPreview && !isLast && (
                                <div style={{ borderBottom: `1px solid ${C.g2}`, marginBottom: 4 }} />
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
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
