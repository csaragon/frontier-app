// Implements: TLP-19 (Excel pre-fill via Seymour, mocked)
import { useState, useEffect, useRef } from "react";
import { useFocusTrap } from "./a11yUtils.js";
import { generateFromExcel } from "../seymourMock.js";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  primary:      "#2226f7",
  primaryHover: "#1316a8",
  primaryBg:    "#f0f2ff",
  primaryLight: "#d4e2ff",
  navy:         "#001e76",
  navyDeep:     "#16191d",
  textSec:      "#555f6d",
  textMuted:    "#8692a2",
  bgApp:        "#f4f4f6",
  bgSurface:    "#ffffff",
  borderSubtle: "#e2e5e9",
  borderDef:    "#c3c8d0",
  success:      "#059669",
  successBg:    "#ecfdf5",
  error:        "#dc2626",
  errorBg:      "#fef2f2",
  warning:      "#b45309",
  warningBg:    "#fffbeb",
  info:         "#0369a1",
  infoBg:       "#f0f9ff",
};
const FOCUS_RING = "0 0 0 2px #fff, 0 0 0 4px #2226f7";

const ANALYSIS_STEPS = [
  "Reading headers...",
  "Detecting sections...",
  "Mapping question types...",
  "Proposing conditional logic...",
];

const CONF_META = {
  High:   { color: C.success,  bg: C.successBg, label: "High" },
  Medium: { color: C.warning,  bg: C.warningBg, label: "Medium" },
  Low:    { color: C.error,    bg: C.errorBg,   label: "Low" },
};

const TYPE_META = {
  "Pass/Fail":       { color: "#059669", bg: "#ecfdf5" },
  "Yes/No":          { color: "#0369a1", bg: "#f0f9ff" },
  "Rating":          { color: "#7c3aed", bg: "#faf5ff" },
  "Multiple Choice": { color: "#b45309", bg: "#fffbeb" },
  "Multi-Select":    { color: "#b45309", bg: "#fff7ed" },
  "Dropdown":        { color: "#555f6d", bg: "#f4f4f6" },
  "Text":            { color: "#555f6d", bg: "#f4f4f6" },
  "Number":          { color: "#0284c7", bg: "#f0f9ff" },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function ConfBadge({ conf }) {
  const m = CONF_META[conf] || CONF_META.Low;
  return (
    <span style={{ padding:"1px 6px", borderRadius:3, fontSize:9, fontWeight:700, fontFamily:F, background:m.bg, color:m.color, letterSpacing:"0.03em", textTransform:"uppercase", flexShrink:0 }}>
      {m.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const m = TYPE_META[type] || { color:C.textSec, bg:C.bgApp };
  return (
    <span style={{ padding:"1px 6px", borderRadius:3, fontSize:9, fontWeight:600, fontFamily:F, background:m.bg, color:m.color, flexShrink:0 }}>
      {type}
    </span>
  );
}

// ── Template tree (left pane) ──────────────────────────────────────────────────

function TemplateTree({ sections, mappings }) {
  const [collapsed, setCollapsed] = useState({});
  const mapByQId = Object.fromEntries((mappings || []).map(m => [m.questionId, m]));

  return (
    <div>
      {sections.map((section, si) => {
        const isCollapsed = !!collapsed[section.id];
        const flagged = section.questions.filter(q => mapByQId[q.id]?.flag).length;
        return (
          <div key={section.id} style={{ marginBottom:6 }}>
            {/* Section header */}
            <button
              type="button"
              onClick={() => setCollapsed(prev => ({ ...prev, [section.id]: !isCollapsed }))}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"9px 12px", background:C.bgApp, border:`1px solid ${C.borderSubtle}`, borderRadius:8, cursor:"pointer", textAlign:"left" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2.5" style={{ flexShrink:0, transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition:"transform 0.15s" }}><polyline points="6 9 12 15 18 9"/></svg>
              <span style={{ fontSize:12, fontWeight:700, color:C.navy, fontFamily:F, flex:1 }}>{section.name}</span>
              <span style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>{section.questions.length}q</span>
              {flagged > 0 && (
                <span style={{ padding:"1px 6px", borderRadius:3, background:C.warningBg, color:C.warning, fontSize:9, fontWeight:700, fontFamily:F }}>{flagged} flagged</span>
              )}
            </button>

            {/* Questions */}
            {!isCollapsed && (
              <div style={{ paddingLeft:12, marginTop:3, display:"flex", flexDirection:"column", gap:2 }}>
                {section.questions.map(q => {
                  const m   = mapByQId[q.id];
                  const conf = m?.confidence || "High";
                  const tm  = TYPE_META[q.type] || { color:C.textSec, bg:C.bgApp };
                  return (
                    <div key={q.id} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"6px 10px", borderRadius:6, background: m?.flag ? C.warningBg : C.bgSurface, border:`1px solid ${m?.flag ? "#fde68a" : C.borderSubtle}` }}>
                      {conf !== "High" && <span style={{ width:6, height:6, borderRadius:"50%", background: CONF_META[conf].color, flexShrink:0, marginTop:3 }} />}
                      <span style={{ fontSize:11, color:C.navyDeep, fontFamily:F, flex:1, lineHeight:"15px" }}>{q.text}</span>
                      <TypeBadge type={q.type} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Mapping review (right pane) ────────────────────────────────────────────────

function MappingReview({ sections, mappings }) {
  const allQs = sections.flatMap(s => s.questions.map(q => ({ ...q, sectionName: s.name })));
  const mapByQId = Object.fromEntries(mappings.map(m => [m.questionId, m]));

  // Flagged / low-conf rows at top
  const rows = allQs.map(q => ({ q, m: mapByQId[q.id] }));
  const flagged = rows.filter(r => r.m?.flag || r.m?.confidence !== "High");
  const clean   = rows.filter(r => !r.m?.flag && r.m?.confidence === "High");
  const sorted  = [...flagged, ...clean];

  return (
    <div>
      {sorted.map(({ q, m }) => {
        if (!m) return null;
        const isFlagged = !!m.flag || m.confidence !== "High";
        return (
          <div key={q.id} style={{
            padding:"10px 14px", borderRadius:8, marginBottom:8,
            background: isFlagged ? C.warningBg : C.bgSurface,
            border:`1px solid ${isFlagged ? "#fde68a" : C.borderSubtle}`,
          }}>
            {/* Question text + section */}
            <div style={{ fontSize:11, fontWeight:500, color:C.navyDeep, fontFamily:F, marginBottom:5, lineHeight:"15px" }}>
              {q.text}
            </div>
            <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginBottom:6 }}>{q.sectionName}</div>

            {/* Source + type + confidence */}
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:10, color:C.textSec, fontFamily:F, background:C.bgApp, border:`1px solid ${C.borderSubtle}`, borderRadius:4, padding:"2px 7px" }}>
                {m.excelRef}
              </span>
              <TypeBadge type={m.inferredType} />
              <ConfBadge conf={m.confidence} />
            </div>

            {/* Flag */}
            {m.flag && (
              <div style={{ marginTop:7, display:"flex", alignItems:"flex-start", gap:5, fontSize:10, color:C.warning, fontFamily:F, lineHeight:"14px" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink:0, marginTop:1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                {m.flag}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Review modal (full-screen) ─────────────────────────────────────────────────

function ReviewModal({ result, onAccept, onEditStructure, onStartOver }) {
  const totalQs = result.sections.reduce((s, sec) => s + sec.questions.length, 0);
  const dialogRef = useRef(null);
  useFocusTrap(dialogRef, onStartOver);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="seymour-review-title"
      style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", flexDirection:"column", background:C.bgApp, fontFamily:F }}
    >

      {/* Header */}
      <div style={{ height:60, flexShrink:0, background:C.bgSurface, borderBottom:`1px solid ${C.borderSubtle}`, display:"flex", alignItems:"center", padding:"0 24px", gap:16 }}>
        {/* Seymour logo / title */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:C.primary, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <span id="seymour-review-title" style={{ fontSize:13, fontWeight:700, color:C.navyDeep }}>Seymour Review</span>
        </div>

        <div style={{ width:1, height:20, background:C.borderSubtle }} />

        {/* Summary */}
        <div style={{ fontSize:12, color:C.textSec, fontFamily:F }}>
          Generated <strong style={{ color:C.navyDeep }}>{result.sections.length}</strong> sections,{" "}
          <strong style={{ color:C.navyDeep }}>{totalQs}</strong> questions
          {result.flaggedCount > 0 && (
            <span style={{ marginLeft:8, padding:"2px 8px", borderRadius:4, background:C.warningBg, color:C.warning, fontSize:11, fontWeight:600 }}>
              {result.flaggedCount} flagged for review
            </span>
          )}
        </div>

        {/* Template name chip */}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>Proposed name:</span>
          <span style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F, background:C.primaryBg, padding:"3px 10px", borderRadius:6, border:`1px solid ${C.primaryLight}` }}>
            {result.templateName}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:8, marginLeft:16 }}>
          <button type="button" onClick={onStartOver}
            style={{ padding:"7px 14px", borderRadius:7, border:`1px solid ${C.borderDef}`, background:C.bgSurface, color:C.textSec, fontSize:12, fontFamily:F, cursor:"pointer" }}
            onFocus={e => e.currentTarget.style.boxShadow = FOCUS_RING}
            onBlur={e => e.currentTarget.style.boxShadow = "none"}>
            Start over
          </button>
          <button type="button" onClick={onEditStructure}
            style={{ padding:"7px 14px", borderRadius:7, border:`1px solid ${C.borderDef}`, background:C.bgSurface, color:C.primary, fontSize:12, fontFamily:F, fontWeight:500, cursor:"pointer" }}
            onFocus={e => e.currentTarget.style.boxShadow = FOCUS_RING}
            onBlur={e => e.currentTarget.style.boxShadow = "none"}>
            Edit structure
          </button>
          <button type="button" onClick={onAccept}
            style={{ padding:"7px 16px", borderRadius:7, border:"none", background:C.primary, color:"#fff", fontSize:12, fontFamily:F, fontWeight:600, cursor:"pointer" }}
            onFocus={e => e.currentTarget.style.boxShadow = FOCUS_RING}
            onBlur={e => e.currentTarget.style.boxShadow = "none"}>
            Accept all as-is
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* Left pane — template tree */}
        <div style={{ width:360, flexShrink:0, borderRight:`1px solid ${C.borderSubtle}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.borderSubtle}`, flexShrink:0 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.navyDeep, fontFamily:F }}>Proposed structure</div>
            <div style={{ fontSize:11, color:C.textMuted, fontFamily:F, marginTop:2 }}>Sections and questions Seymour detected</div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"14px 16px" }}>
            <TemplateTree sections={result.sections} mappings={result.mappings} />
          </div>
        </div>

        {/* Right pane — mapping review */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.borderSubtle}`, flexShrink:0, display:"flex", alignItems:"center", gap:10 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.navyDeep, fontFamily:F }}>Mapping review</div>
              <div style={{ fontSize:11, color:C.textMuted, fontFamily:F, marginTop:2 }}>Flagged and uncertain items appear first</div>
            </div>
            {result.flaggedCount > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:C.warningBg, border:`1px solid #fde68a`, borderRadius:8, marginLeft:"auto" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.warning} strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span style={{ fontSize:11, fontWeight:600, color:C.warning, fontFamily:F }}>
                  {result.flaggedCount} item{result.flaggedCount !== 1 ? "s" : ""} need review
                </span>
              </div>
            )}
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"14px 20px" }}>
            <MappingReview sections={result.sections} mappings={result.mappings} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Analysis progress ──────────────────────────────────────────────────────────

function AnalysisProgress({ filename, onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= ANALYSIS_STEPS.length) {
      const t = setTimeout(() => onComplete(generateFromExcel(filename)), 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep(s => s + 1), 750);
    return () => clearTimeout(t);
  }, [step, filename, onComplete]);

  const pct = Math.round((step / ANALYSIS_STEPS.length) * 100);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:"32px 24px" }}>
      {/* Spinner */}
      <div style={{ position:"relative", width:52, height:52 }}>
        <svg width="52" height="52" viewBox="0 0 52 52" style={{ animation:"spin 1.2s linear infinite" }}>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <circle cx="26" cy="26" r="22" fill="none" stroke={C.borderSubtle} strokeWidth="3" />
          <circle cx="26" cy="26" r="22" fill="none" stroke={C.primary} strokeWidth="3"
            strokeDasharray="138" strokeDashoffset={138 - (138 * pct / 100)}
            strokeLinecap="round" />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.navyDeep, fontFamily:F, marginBottom:4 }}>
          Seymour is analyzing your file
        </div>
        <div style={{ fontSize:12, color:C.primary, fontFamily:F, fontWeight:500, minHeight:18 }}>
          {step < ANALYSIS_STEPS.length ? ANALYSIS_STEPS[step] : "Done!"}
        </div>
        <div style={{ fontSize:11, color:C.textMuted, fontFamily:F, marginTop:4 }}>{filename}</div>
      </div>
      {/* Progress bar */}
      <div style={{ width:"100%", maxWidth:260, height:4, borderRadius:2, background:C.borderSubtle }}>
        <div style={{ height:"100%", borderRadius:2, background:C.primary, width:`${pct}%`, transition:"width 0.3s ease" }} />
      </div>
    </div>
  );
}

// ── Upload trigger UI ──────────────────────────────────────────────────────────

function UploadTrigger({ onFile, error }) {
  const inputRef = useRef(null);

  const handleFiles = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "xlsx" && ext !== "xls") {
      onFile(null, `"${file.name}" is not a supported Excel file. Please upload a .xlsx or .xls file.`);
    } else {
      onFile(file, null);
    }
    e.target.value = "";
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop an Excel file or click to browse. Accepts .xlsx and .xls files."
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); inputRef.current?.click(); } }}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.background = C.primaryBg; }}
        onDragLeave={e => { e.currentTarget.style.borderColor = error ? C.error : C.borderDef; e.currentTarget.style.background = C.bgSurface; }}
        onDrop={e => {
          e.preventDefault();
          e.currentTarget.style.borderColor = C.borderDef;
          e.currentTarget.style.background = C.bgSurface;
          const file = e.dataTransfer.files?.[0];
          if (!file) return;
          const ext = file.name.split(".").pop().toLowerCase();
          if (ext !== "xlsx" && ext !== "xls") {
            onFile(null, `"${file.name}" is not supported. Drop a .xlsx or .xls file.`);
          } else {
            onFile(file, null);
          }
        }}
        style={{
          border:`2px dashed ${error ? C.error : C.borderDef}`, borderRadius:10, padding:"22px 20px",
          textAlign:"center", cursor:"pointer", background:C.bgSurface, transition:"all 0.15s", outline:"none",
        }}
        onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
        onBlur={e => (e.currentTarget.style.boxShadow = "none")}
      >
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5" style={{ display:"block", margin:"0 auto 10px" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <div style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F }}>
          Drop an Excel file or <span style={{ color:C.primary, textDecoration:"underline" }}>browse</span>
        </div>
        <div style={{ fontSize:11, color:C.textMuted, fontFamily:F, marginTop:4 }}>.xlsx and .xls only</div>
      </div>
      {error && (
        <div style={{ marginTop:8, display:"flex", alignItems:"flex-start", gap:6, fontSize:11, color:C.error, fontFamily:F, lineHeight:"15px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {error}
        </div>
      )}
      <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{ display:"none" }} onChange={handleFiles} />
    </div>
  );
}

// ── Main exported component ────────────────────────────────────────────────────

export default function SeymourUpload({ onApply, onCancel, initialResult = null }) {
  const [phase,   setPhase]   = useState(initialResult ? "reviewing" : "idle");
  const [file,    setFile]    = useState(null);
  const [fileErr, setFileErr] = useState(null);
  const [result,  setResult]  = useState(initialResult);

  const handleFile = (f, err) => {
    setFileErr(err);
    if (f) { setFile(f); setPhase("analyzing"); }
  };

  const handleAnalysisDone = r => { setResult(r); setPhase("reviewing"); };

  const handleAccept = () => onApply({ ...result, goStep: 2 });
  const handleEdit   = () => onApply({ ...result, goStep: 2 });
  const handleOver   = () => { setPhase("idle"); setFile(null); setFileErr(null); setResult(null); onCancel?.(); };

  if (phase === "reviewing" && result) {
    return (
      <ReviewModal
        result={result}
        onAccept={handleAccept}
        onEditStructure={handleEdit}
        onStartOver={handleOver}
      />
    );
  }

  if (phase === "analyzing" && file) {
    return (
      <div role="dialog" aria-modal="true" aria-label="Analyzing Excel file" style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.5)" }}>
        <div style={{ background:C.bgSurface, borderRadius:14, padding:"32px 40px", width:360, boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
          <AnalysisProgress filename={file.name} onComplete={handleAnalysisDone} />
        </div>
      </div>
    );
  }

  // idle — return just the trigger UI (inline, no overlay)
  return <UploadTrigger onFile={handleFile} error={fileErr} />;
}

// ── Inline card variant (for Step 1 sidebar) ───────────────────────────────────

export function SeymourCard({ onApply, onCancel }) {
  const [open, setOpen] = useState(false);
  const cardDialogRef = useRef(null);
  useFocusTrap(cardDialogRef, () => setOpen(false));

  return (
    <>
      <div style={{ marginTop:20, padding:"14px 16px", borderRadius:10, border:`1px solid ${C.primaryLight}`, background:C.primaryBg, display:"flex", alignItems:"flex-start", gap:12 }}>
        {/* Icon */}
        <div style={{ width:32, height:32, borderRadius:8, background:C.primary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.primary, fontFamily:F, marginBottom:2 }}>
            Start from Excel
          </div>
          <div style={{ fontSize:11, color:C.textSec, fontFamily:F, marginBottom:10, lineHeight:"16px" }}>
            Upload an Excel audit checklist. Seymour will auto-generate sections, questions, and conditional logic for your review.
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{ padding:"6px 14px", borderRadius:7, border:"none", background:C.primary, color:"#fff", fontSize:11, fontWeight:600, fontFamily:F, cursor:"pointer" }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          >
            Upload Excel file
          </button>
        </div>
      </div>

      {open && (
        <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.42)" }} onClick={() => setOpen(false)}>
          <div
            ref={cardDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="seymour-card-dialog-title"
            style={{ background:C.bgSurface, borderRadius:14, padding:"28px 32px", width:420, boxShadow:"0 16px 48px rgba(0,0,0,0.22)" }}
            onClick={e => e.stopPropagation()}
          >
            <div id="seymour-card-dialog-title" style={{ fontSize:14, fontWeight:700, color:C.navyDeep, fontFamily:F, marginBottom:6 }}>Upload Excel for Seymour</div>
            <div style={{ fontSize:12, color:C.textSec, fontFamily:F, marginBottom:16 }}>Seymour will analyze your file and propose a template structure for your review.</div>
            <SeymourUpload
              onApply={result => { setOpen(false); onApply(result); }}
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
