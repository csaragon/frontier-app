// Implements: TLP-87 (grid view for bulk editing)
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useFocusTrap } from "../a11yUtils.js";
import { defaultScoringForQuestion } from "./QuestionScoringRow.jsx";

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
};
const FOCUS_RING = "0 0 0 2px #fff, 0 0 0 4px #2226f7";
const ROW_H = 44;
const VIRT_THRESHOLD = 200;
const VIRT_BUFFER    = 5; // extra rows above/below viewport

const QUESTION_TYPES = ["Pass/Fail","Yes/No","Rating","Multiple Choice","Multi-Select","Dropdown","Text","Number"];

// Scoring columns depend on model
function getScoreCols(model) {
  if (model === "points")   return [{ key:"maxpts",  label:"Max pts",   w:90 }];
  if (model === "weighted") return [{ key:"weight",  label:"Weight %",  w:90 }];
  if (model === "passfail") return [{ key:"passval", label:"Pass value", w:110 }];
  return [];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function flattenRows(sections) {
  return sections.flatMap((s, si) =>
    s.questions.map((q, qi) => ({ q, sectionId: s.id, sectionName: s.name, sectionIdx: si, qIdx: qi }))
  );
}

function getScoreVal(q, scoring, model) {
  const sc = scoring.perQuestion[q.id] || defaultScoringForQuestion(q, model);
  if (model === "points")   return sc.maxPoints ?? 5;
  if (model === "weighted") return sc.weight ?? 0;
  if (model === "passfail") return sc.passingValue ?? "Pass";
  return null;
}

function getPassOptions(q) {
  if (q.type === "Pass/Fail") return ["Pass", "Fail"];
  if (q.type === "Yes/No")    return ["Yes",  "No"];
  if (q.type === "Rating")    return ["1","2","3","4","5"];
  return null;
}

// ── Validation (mirrors Step3Scoring) ─────────────────────────────────────────

function computeGridErrors(sections, scoring, conditionalIds) {
  const errors = [];
  const model  = scoring.model;
  const getSc  = q => scoring.perQuestion[q.id] || defaultScoringForQuestion(q, model);

  if (model === "weighted") {
    sections.forEach(s => {
      const countable = s.questions.filter(q => !conditionalIds.has(q.id));
      if (!countable.length) return;
      const total = countable.reduce((sum, q) => sum + (parseFloat(getSc(q).weight) || 0), 0);
      if (Math.abs(total - 100) > 0.01)
        errors.push({ qId: null, sectionId: s.id, col: "weight",
          msg: `Section "${s.name}": weights total ${Math.round(total * 100) / 100}% — must equal 100%.` });
    });
  }
  if (model === "points") {
    sections.forEach(s =>
      s.questions.forEach(q => {
        const sc  = getSc(q);
        const max = parseFloat(sc.maxPoints) || 0;
        if ((q.type === "Rating" || q.type === "Text") && sc.ratingPoints) {
          const over = Object.entries(sc.ratingPoints).find(([, p]) => parseFloat(p) > max);
          if (over) errors.push({ qId: q.id, col: "maxpts", msg: `"${q.text.slice(0,40)}": rating ${over[0]} exceeds max pts.` });
        }
        if (q.type === "Number" && sc.conditions) {
          if (sc.conditions.find(c => parseFloat(c.points) > max))
            errors.push({ qId: q.id, col: "maxpts", msg: `"${q.text.slice(0,40)}": a condition exceeds max pts.` });
        }
      })
    );
  }
  sections.forEach(s => s.questions.forEach(q => {
    if (!q.text?.trim()) errors.push({ qId: q.id, col: "text", msg: "Question text is required." });
  }));
  return errors;
}

// ── Modal shell ───────────────────────────────────────────────────────────────

function Modal({ onClose, children, width = 420, labelId }) {
  const dialogRef = useRef(null);
  useFocusTrap(dialogRef, onClose);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        style={{ background:C.bgSurface, borderRadius:12, padding:24, width, maxWidth:"92vw", boxShadow:"0 16px 48px rgba(0,0,0,0.22)" }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalBtns({ onCancel, onConfirm, confirmLabel, confirmDisabled, danger }) {
  return (
    <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:20 }}>
      <button type="button" onClick={onCancel} style={{ padding:"7px 14px", borderRadius:7, border:`1px solid ${C.borderDef}`, background:C.bgSurface, color:C.textSec, fontSize:12, fontFamily:F, cursor:"pointer" }}>Cancel</button>
      <button type="button" onClick={confirmDisabled ? undefined : onConfirm} disabled={confirmDisabled}
        style={{ padding:"7px 14px", borderRadius:7, border:"none", background:confirmDisabled ? C.borderDef : danger ? C.error : C.primary, color:confirmDisabled ? C.textMuted : "#fff", fontSize:12, fontFamily:F, fontWeight:600, cursor:confirmDisabled?"not-allowed":"pointer" }}>
        {confirmLabel}
      </button>
    </div>
  );
}

// ── Type-change warning modal ─────────────────────────────────────────────────

function TypeChangeModal({ newType, count = 1, onConfirm, onClose }) {
  return (
    <Modal onClose={onClose} labelId="type-change-modal-title">
      <div id="type-change-modal-title" style={{ fontSize:14, fontWeight:700, color:C.navyDeep, fontFamily:F, marginBottom:8 }}>Reset scoring configuration?</div>
      <div style={{ fontSize:12, color:C.textSec, fontFamily:F, lineHeight:"18px", marginBottom:4 }}>
        Changing {count > 1 ? `${count} questions` : "this question"} to <strong>{newType}</strong> will clear {count > 1 ? "their" : "its"} existing scoring configuration.
      </div>
      <div style={{ fontSize:11, color:C.warning, fontFamily:F, background:C.warningBg, borderRadius:6, padding:"8px 10px" }}>
        This cannot be undone — scoring settings will reset to defaults for the new type.
      </div>
      <ModalBtns onCancel={onClose} onConfirm={onConfirm} confirmLabel="Change type and reset" />
    </Modal>
  );
}

// ── Bulk edit modal ───────────────────────────────────────────────────────────

function BulkEditModal({ field, count, sections, onConfirm, onClose }) {
  const [val, setVal] = useState("");
  const iStyle = { padding:"7px 10px", borderRadius:7, border:`1px solid ${C.borderDef}`, fontSize:12, fontFamily:F, color:C.navyDeep, outline:"none", width:"100%" };

  const fieldLabel = field === "type" ? "Question type" : field === "required" ? "Required" : "Weight %";

  return (
    <Modal onClose={onClose} labelId="bulk-edit-modal-title">
      <div id="bulk-edit-modal-title" style={{ fontSize:14, fontWeight:700, color:C.navyDeep, fontFamily:F, marginBottom:8 }}>Bulk edit: {fieldLabel}</div>
      <div style={{ fontSize:12, color:C.textSec, fontFamily:F, marginBottom:16 }}>
        This will update <strong>{count} question{count !== 1 ? "s" : ""}</strong>.
      </div>
      {field === "type" && (
        <select value={val} onChange={e => setVal(e.target.value)} style={{ ...iStyle, cursor:"pointer" }}
          onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.borderDef}>
          <option value="">Select type...</option>
          {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      )}
      {field === "required" && (
        <div style={{ display:"flex", gap:10 }}>
          {["true","false"].map(v => (
            <label key={v} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontFamily:F, color:C.navyDeep, cursor:"pointer" }}>
              <input type="radio" name="bulk-req" value={v} checked={val === v} onChange={() => setVal(v)} style={{ accentColor:C.primary }} />
              {v === "true" ? "Required" : "Optional"}
            </label>
          ))}
        </div>
      )}
      {field === "weight" && (
        <input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="Enter weight %" style={iStyle}
          onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.borderDef} />
      )}
      <ModalBtns onCancel={onClose} onConfirm={() => onConfirm(val)} confirmLabel={`Update ${count} question${count !== 1 ? "s" : ""}`} confirmDisabled={!val} />
    </Modal>
  );
}

// ── Bulk delete modal ─────────────────────────────────────────────────────────

function BulkDeleteModal({ count, onConfirm, onClose }) {
  const [typed, setTyped] = useState("");
  const expected = `DELETE ${count} question${count !== 1 ? "s" : ""}`;
  const confirmed = typed === expected;
  return (
    <Modal onClose={onClose} labelId="bulk-delete-modal-title">
      <div id="bulk-delete-modal-title" style={{ fontSize:14, fontWeight:700, color:C.navyDeep, fontFamily:F, marginBottom:8 }}>Delete {count} question{count !== 1 ? "s" : ""}?</div>
      <div style={{ fontSize:12, color:C.textSec, fontFamily:F, lineHeight:"18px", marginBottom:16 }}>
        This will permanently remove <strong>{count} question{count !== 1 ? "s" : ""}</strong> from the template. This cannot be undone.
      </div>
      <label htmlFor="bulk-delete-confirm" style={{ fontSize:11, fontWeight:600, color:C.error, fontFamily:F, display:"block", marginBottom:4 }}>
        Type <em style={{ fontFamily:"monospace" }}>{expected}</em> to confirm
      </label>
      <input id="bulk-delete-confirm" value={typed} onChange={e => setTyped(e.target.value)} placeholder={expected}
        style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:`1px solid ${confirmed ? C.error : C.borderDef}`, fontSize:11, fontFamily:F, color:C.navyDeep, outline:"none", boxSizing:"border-box", letterSpacing:0.5 }}
        onFocus={e => e.target.style.borderColor = C.error} onBlur={e => e.target.style.borderColor = confirmed ? C.error : C.borderDef}
      />
      <ModalBtns onCancel={onClose} onConfirm={onConfirm} confirmLabel="Delete permanently" confirmDisabled={!confirmed} danger />
    </Modal>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────

function Chip({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding:"3px 10px", borderRadius:999, border:`1px solid ${active ? C.primary : C.borderDef}`, background:active ? C.primaryBg : C.bgSurface, color:active ? C.primary : C.textSec, fontSize:11, fontWeight:active?600:400, fontFamily:F, cursor:"pointer", whiteSpace:"nowrap" }}>
      {label}
    </button>
  );
}

function FilterBar({ sections, sectionFilter, setSectionFilter, typeFilter, setTypeFilter, scoreFilter, setScoreFilter }) {
  const anyActive = sectionFilter.size || typeFilter.size || scoreFilter.size;
  const toggle = (set, setFn, val) => setFn(prev => { const n = new Set(prev); n.has(val) ? n.delete(val) : n.add(val); return n; });

  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", padding:"10px 0 12px", borderBottom:`1px solid ${C.borderSubtle}`, marginBottom:0 }}>
      <span style={{ fontSize:10, fontWeight:700, color:C.textMuted, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.05em", flexShrink:0 }}>Filter:</span>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
        {sections.map(s => <Chip key={s.id} label={s.name} active={sectionFilter.has(s.id)} onClick={() => toggle(sectionFilter, setSectionFilter, s.id)} />)}
        <span style={{ width:1, height:14, background:C.borderSubtle, margin:"0 4px" }} />
        {QUESTION_TYPES.map(t => <Chip key={t} label={t} active={typeFilter.has(t)} onClick={() => toggle(typeFilter, setTypeFilter, t)} />)}
        <span style={{ width:1, height:14, background:C.borderSubtle, margin:"0 4px" }} />
        {["Scored","Unscored"].map(s => <Chip key={s} label={s} active={scoreFilter.has(s)} onClick={() => toggle(scoreFilter, setScoreFilter, s)} />)}
      </div>
      {anyActive > 0 && (
        <button type="button" onClick={() => { setSectionFilter(new Set()); setTypeFilter(new Set()); setScoreFilter(new Set()); }}
          style={{ fontSize:11, color:C.primary, background:"none", border:"none", cursor:"pointer", fontFamily:F, padding:"0 4px", textDecoration:"underline" }}>
          Clear all
        </button>
      )}
    </div>
  );
}

// ── Sort caret ────────────────────────────────────────────────────────────────

function SortCaret({ dir }) {
  if (!dir) return <span style={{ opacity:0.3, fontSize:10, marginLeft:3 }}>⇅</span>;
  return <span style={{ fontSize:10, marginLeft:3 }}>{dir === "asc" ? "↑" : "↓"}</span>;
}

// ── Toggle cell ───────────────────────────────────────────────────────────────

function Toggle({ value, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={onChange}
      style={{ width:32, height:18, borderRadius:999, border:"none", background:value ? C.primary : C.borderDef, cursor:"pointer", position:"relative", flexShrink:0, padding:0, outline:"none" }}
      onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
      onBlur={e => (e.currentTarget.style.boxShadow = "none")}
    >
      <span style={{ position:"absolute", top:2, left:value?14:2, width:14, height:14, borderRadius:"50%", background:"#fff", transition:"left 0.15s" }} />
    </button>
  );
}

// ── Cell editor ───────────────────────────────────────────────────────────────

function CellInput({ value, onSave, onCancel, type = "text", options }) {
  const [v, setV] = useState(String(value ?? ""));
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); ref.current?.select?.(); }, []);

  const commit = () => onSave(v);
  const keyDown = e => {
    if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); commit(); }
    if (e.key === "Escape") onCancel();
  };

  const iStyle = { padding:"3px 6px", borderRadius:5, border:`1px solid ${C.primary}`, fontSize:11, fontFamily:F, color:C.navyDeep, background:C.bgSurface, outline:"none", width:"100%", boxSizing:"border-box", boxShadow:FOCUS_RING };

  if (options) return (
    <select ref={ref} value={v} onChange={e => setV(e.target.value)} onBlur={commit} onKeyDown={keyDown} style={{ ...iStyle, cursor:"pointer" }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  return <input ref={ref} value={v} type={type} onChange={e => setV(e.target.value)} onBlur={commit} onKeyDown={keyDown} style={iStyle} />;
}

// ── Main grid component ───────────────────────────────────────────────────────

export default function ScoringGrid({ sections, scoring, dispatch, model, conditionalIds }) {
  // Filter state
  const [sectionFilter,  setSectionFilter]  = useState(new Set());
  const [typeFilter,     setTypeFilter]      = useState(new Set());
  const [scoreFilter,    setScoreFilter]     = useState(new Set());

  // Sort state
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  // Selection
  const [selection, setSelection] = useState(new Set());

  // Inline editing
  const [editingCell, setEditingCell] = useState(null); // {qId, col}

  // Modals
  const [typeChangeModal, setTypeChangeModal] = useState(null); // {qId, newType} or {bulkIds, newType}
  const [bulkEditModal,   setBulkEditModal]   = useState(null); // field key
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  // Virtualization
  const containerRef  = useRef(null);
  const [scrollTop,   setScrollTop]   = useState(0);
  const [viewHeight,  setViewHeight]  = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setViewHeight(el.clientHeight);
    const onScroll = () => setScrollTop(el.scrollTop);
    const onResize = () => setViewHeight(el.clientHeight);
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => { el.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
  }, []);

  // Flat row list
  const allRows = useMemo(() => flattenRows(sections), [sections]);

  // Validation errors
  const errors = useMemo(() => computeGridErrors(sections, scoring, conditionalIds), [sections, scoring, conditionalIds]);
  const errorsByQId = useMemo(() => {
    const m = {};
    errors.forEach(e => { if (e.qId) { (m[e.qId] = m[e.qId] || []).push(e); } });
    return m;
  }, [errors]);

  // Filtered rows
  const filteredRows = useMemo(() => allRows.filter(row => {
    if (sectionFilter.size && !sectionFilter.has(row.sectionId)) return false;
    if (typeFilter.size    && !typeFilter.has(row.q.type))       return false;
    if (scoreFilter.size) {
      const hasCustom = !!scoring.perQuestion[row.q.id];
      if (scoreFilter.has("Scored")   && !hasCustom) return false;
      if (scoreFilter.has("Unscored") &&  hasCustom) return false;
    }
    return true;
  }), [allRows, sectionFilter, typeFilter, scoreFilter, scoring]);

  // Sorted rows (display-only)
  const sortedRows = useMemo(() => {
    if (!sortCol) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      let av, bv;
      if (sortCol === "section")  { av = a.sectionName; bv = b.sectionName; }
      else if (sortCol === "text")     { av = a.q.text;     bv = b.q.text; }
      else if (sortCol === "type")     { av = a.q.type;     bv = b.q.type; }
      else if (sortCol === "required") { av = a.q.required ? 1 : 0; bv = b.q.required ? 1 : 0; }
      else if (sortCol === "weight" || sortCol === "maxpts") {
        av = getScoreVal(a.q, scoring, model);
        bv = getScoreVal(b.q, scoring, model);
      }
      else { av = ""; bv = ""; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ?  1 : -1;
      return 0;
    });
  }, [filteredRows, sortCol, sortDir, scoring, model]);

  const totalCount = sortedRows.length;
  const useVirt    = totalCount > VIRT_THRESHOLD;

  // Virtualization window
  const { startIdx, endIdx, topPad, bottomPad } = useMemo(() => {
    if (!useVirt) return { startIdx: 0, endIdx: totalCount - 1, topPad: 0, bottomPad: 0 };
    const rowsPerView = Math.ceil(viewHeight / ROW_H);
    const start = Math.max(0, Math.floor(scrollTop / ROW_H) - VIRT_BUFFER);
    const end   = Math.min(totalCount - 1, start + rowsPerView + VIRT_BUFFER * 2);
    return { startIdx: start, endIdx: end, topPad: start * ROW_H, bottomPad: (totalCount - 1 - end) * ROW_H };
  }, [useVirt, totalCount, scrollTop, viewHeight]);

  const visibleRows = sortedRows.slice(startIdx, endIdx + 1);

  // Column definitions
  const scoreCols = getScoreCols(model);
  const cols = [
    { key:"section",  label:"Section",    w:150, sortable:true },
    { key:"text",     label:"Question",   w:280, sortable:true },
    { key:"type",     label:"Type",       w:150, sortable:true },
    ...scoreCols,
    { key:"required", label:"Required",   w:84,  sortable:true },
    { key:"logic",    label:"Logic",      w:70,  sortable:false },
  ];

  // Sort toggle
  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  // Selection helpers
  const visibleIds  = new Set(sortedRows.map(r => r.q.id));
  const allSelected = visibleIds.size > 0 && [...visibleIds].every(id => selection.has(id));
  const toggleAll   = () => setSelection(allSelected ? new Set() : new Set(visibleIds));
  const toggleRow   = id => setSelection(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Dispatch helpers
  const updateQ     = (qId, updates) => dispatch({ type:"STRUCTURE_UPDATE_QUESTION", id:qId, updates });
  const updateScore = (qId, updates) => {
    const q  = allRows.find(r => r.q.id === qId)?.q;
    const sc = scoring.perQuestion[qId] || (q ? defaultScoringForQuestion(q, model) : {});
    dispatch({ type:"SET_QUESTION_SCORING", id:qId, updates:{ ...sc, ...updates } });
  };
  const moveToSection = (qId, targetSectionId) => dispatch({ type:"STRUCTURE_MOVE_QUESTION_TO_SECTION", questionId:qId, targetSectionId });

  // Type change: always goes through modal to warn about scoring reset
  const requestTypeChange = (qId, newType, isBulk = false) => {
    setTypeChangeModal(isBulk ? { bulkIds: qId, newType } : { qId, newType });
  };
  const confirmTypeChange = () => {
    if (!typeChangeModal) return;
    const { qId, bulkIds, newType } = typeChangeModal;
    const ids = bulkIds || [qId];
    ids.forEach(id => {
      updateQ(id, { type: newType });
      dispatch({ type:"SET_QUESTION_SCORING", id, updates: defaultScoringForQuestion({ type: newType }, model) });
    });
    setTypeChangeModal(null);
  };

  // Bulk edit confirm
  const confirmBulkEdit = (field, value) => {
    const ids = [...selection];
    if (field === "type") {
      requestTypeChange(ids, value, true);
    } else if (field === "required") {
      ids.forEach(id => updateQ(id, { required: value === "true" }));
    } else if (field === "weight") {
      ids.forEach(id => updateScore(id, { weight: parseFloat(value) || 0 }));
    }
    setBulkEditModal(null);
    setSelection(new Set());
  };

  // Bulk delete confirm
  const confirmBulkDelete = () => {
    dispatch({ type:"STRUCTURE_DELETE_QUESTIONS", ids: selection });
    setSelection(new Set());
    setBulkDeleteModal(false);
  };

  // Cell save
  const saveCell = (qId, col, value) => {
    setEditingCell(null);
    if (col === "text")     { updateQ(qId, { text: value }); return; }
    if (col === "section")  { moveToSection(qId, value); return; }
    if (col === "maxpts")   { updateScore(qId, { maxPoints: parseFloat(value) || 0 }); return; }
    if (col === "weight")   { updateScore(qId, { weight: parseFloat(value) || 0 }); return; }
    if (col === "passval") {
      const q = allRows.find(r => r.q.id === qId)?.q;
      if (!q) return;
      const sc = scoring.perQuestion[qId] || defaultScoringForQuestion(q, model);
      updateScore(qId, { ...sc, passingValue: value });
      return;
    }
  };

  const firstErrorId = errors.find(e => e.qId)?.qId;

  const thStyle = {
    position:"sticky", top:0, zIndex:10,
    background:C.bgApp, borderBottom:`2px solid ${C.borderSubtle}`,
    padding:"0 10px", height:36, textAlign:"left",
    fontSize:10, fontWeight:700, color:C.navy, fontFamily:F,
    textTransform:"uppercase", letterSpacing:"0.05em",
    whiteSpace:"nowrap", userSelect:"none",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>

      {/* Filter bar */}
      <FilterBar
        sections={sections}
        sectionFilter={sectionFilter} setSectionFilter={setSectionFilter}
        typeFilter={typeFilter}       setTypeFilter={setTypeFilter}
        scoreFilter={scoreFilter}     setScoreFilter={setScoreFilter}
      />

      {/* Error banner */}
      {errors.length > 0 && (
        <div role="alert" style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", background:C.errorBg, border:`1px solid #fca5a5`, borderRadius:8, margin:"10px 0 0", fontSize:11, color:C.error, fontFamily:F }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink:0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>
          <span><strong>{errors.length}</strong> validation error{errors.length !== 1 ? "s" : ""}</span>
          {firstErrorId && (
            <button type="button" onClick={() => document.getElementById(`gr-${firstErrorId}`)?.scrollIntoView({ behavior:"smooth", block:"center" })}
              style={{ fontSize:11, color:C.primary, background:"none", border:"none", cursor:"pointer", fontFamily:F, textDecoration:"underline", padding:0 }}>
              Jump to first error
            </button>
          )}
        </div>
      )}

      {/* Floating bulk action bar */}
      {selection.size > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:C.navy, borderRadius:8, margin:"10px 0 0", color:"#fff", fontFamily:F, fontSize:12 }}>
          <span style={{ fontWeight:600 }}>{selection.size} selected</span>
          <span style={{ width:1, height:16, background:"rgba(255,255,255,0.3)" }} />
          <button type="button" onClick={() => setBulkEditModal("type")}     style={{ padding:"4px 10px", borderRadius:5, border:"1px solid rgba(255,255,255,0.3)", background:"transparent", color:"#fff", fontSize:11, fontFamily:F, cursor:"pointer" }}>Edit type...</button>
          {model === "weighted" && (
            <button type="button" onClick={() => setBulkEditModal("weight")}   style={{ padding:"4px 10px", borderRadius:5, border:"1px solid rgba(255,255,255,0.3)", background:"transparent", color:"#fff", fontSize:11, fontFamily:F, cursor:"pointer" }}>Edit weight...</button>
          )}
          <button type="button" onClick={() => setBulkEditModal("required")}  style={{ padding:"4px 10px", borderRadius:5, border:"1px solid rgba(255,255,255,0.3)", background:"transparent", color:"#fff", fontSize:11, fontFamily:F, cursor:"pointer" }}>Edit required...</button>
          <button type="button" onClick={() => setBulkDeleteModal(true)}      style={{ padding:"4px 10px", borderRadius:5, border:"1px solid rgba(255,0,0,0.4)", background:"rgba(220,38,38,0.15)", color:"#fca5a5", fontSize:11, fontFamily:F, cursor:"pointer" }}>Delete selected</button>
          <button type="button" onClick={() => setSelection(new Set())} aria-label="Clear selection" style={{ marginLeft:"auto", background:"none", border:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:18, lineHeight:1, padding:"0 2px", outline:"none" }} onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)} onBlur={e => (e.currentTarget.style.boxShadow = "none")}>&times;</button>
        </div>
      )}

      {/* Table */}
      <div ref={containerRef} style={{ flex:1, overflowY:"auto", overflowX:"auto", marginTop:10, borderRadius:8, border:`1px solid ${C.borderSubtle}` }}>
        <table style={{ borderCollapse:"collapse", tableLayout:"fixed", width: cols.reduce((s,c) => s + (c.w || c.minWidth || 200), 40) + 40 }}>
          <colgroup>
            <col style={{ width:40 }} />
            {cols.map(c => <col key={c.key} style={{ width: c.w || c.minWidth || 200 }} />)}
          </colgroup>
          <thead>
            <tr>
              {/* Checkbox */}
              <th scope="col" style={{ ...thStyle, width:40 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ accentColor:C.primary, outline:"none" }} aria-label="Select all visible questions"
                  onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)} onBlur={e => (e.currentTarget.style.boxShadow = "none")} />
              </th>
              {cols.map(c => {
                const isSorted = sortCol === c.key;
                const ariaSortVal = isSorted ? (sortDir === "asc" ? "ascending" : "descending") : undefined;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    style={{ ...thStyle, cursor: c.sortable ? "pointer" : "default" }}
                    aria-sort={ariaSortVal}
                    tabIndex={c.sortable ? 0 : undefined}
                    onClick={c.sortable ? () => handleSort(c.key) : undefined}
                    onKeyDown={c.sortable ? e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSort(c.key); } } : undefined}
                    onFocus={c.sortable ? e => (e.currentTarget.style.outline = `2px solid ${C.primary}`) : undefined}
                    onBlur={c.sortable ? e => (e.currentTarget.style.outline = "none") : undefined}
                  >
                    {c.label}
                    {c.sortable && <SortCaret dir={isSorted ? sortDir : null} />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Top virtualisation padding */}
            {useVirt && topPad > 0 && <tr style={{ height: topPad }}><td colSpan={cols.length + 1} /></tr>}

            {visibleRows.map(({ q, sectionId, sectionName }) => {
              const isConditional = conditionalIds.has(q.id);
              const sc = scoring.perQuestion[q.id] || defaultScoringForQuestion(q, model);
              const qErrors = errorsByQId[q.id] || [];
              const hasErr  = qErrors.length > 0;
              const isSelected = selection.has(q.id);

              const cellStyle = (col) => ({
                padding: "0 10px", height: ROW_H, fontSize: 11, fontFamily: F,
                color: C.navyDeep, borderBottom: `1px solid ${C.borderSubtle}`,
                background: isSelected ? C.primaryBg : hasErr ? C.errorBg : "transparent",
                verticalAlign: "middle",
                outline: hasErr && col === qErrors[0]?.col ? `2px solid ${C.error}` : "none",
              });

              const editing = (col) => editingCell?.qId === q.id && editingCell?.col === col;

              const startEdit = (col) => {
                if (isConditional && (col === "maxpts" || col === "weight" || col === "passval")) return;
                setEditingCell({ qId: q.id, col });
              };

              return (
                <tr key={q.id} id={`gr-${q.id}`}>
                  {/* Checkbox */}
                  <td style={{ ...cellStyle(null), textAlign:"center" }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleRow(q.id)} style={{ accentColor:C.primary, outline:"none" }}
                      aria-label={`Select question: ${(q.text || "Empty").slice(0, 60)}`}
                      onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)} onBlur={e => (e.currentTarget.style.boxShadow = "none")} />
                  </td>

                  {/* Section dropdown */}
                  <td style={cellStyle("section")} onClick={() => startEdit("section")}>
                    {editing("section") ? (
                      <CellInput
                        value={sectionId}
                        options={null}
                        onSave={v => saveCell(q.id, "section", v)}
                        onCancel={() => setEditingCell(null)}
                        // custom select for sections
                        type="text"
                      />
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
                        {editing("section") ? null : (
                          <select value={sectionId} onChange={e => moveToSection(q.id, e.target.value)}
                            style={{ border:"none", background:"transparent", fontSize:11, fontFamily:F, color:C.textSec, cursor:"pointer", outline:"none", maxWidth:"100%" }}
                            onClick={e => e.stopPropagation()}>
                            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Question text */}
                  <td style={cellStyle("text")} onClick={() => startEdit("text")}>
                    {editing("text") ? (
                      <CellInput value={q.text} onSave={v => saveCell(q.id, "text", v)} onCancel={() => setEditingCell(null)} />
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", gap:6, position:"relative", cursor:"text" }}>
                        <span style={{ overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", lineHeight:"15px" }}>
                          {q.text || <em style={{ color:C.error }}>Empty</em>}
                        </span>
                        {editingCell?.qId === q.id && editingCell?.col === "text" && (
                          <span style={{ position:"absolute", top:0, right:0, width:6, height:6, borderRadius:"50%", background:C.warning }} />
                        )}
                      </div>
                    )}
                  </td>

                  {/* Type */}
                  <td style={cellStyle("type")}>
                    <select value={q.type}
                      onChange={e => { if (e.target.value !== q.type) requestTypeChange(q.id, e.target.value); }}
                      style={{ border:`1px solid ${C.borderSubtle}`, borderRadius:5, background:C.bgApp, fontSize:11, fontFamily:F, color:C.navyDeep, cursor:"pointer", outline:"none", padding:"3px 6px", width:"100%" }}
                      onFocus={e => e.target.style.borderColor = C.primary}
                      onBlur={e => e.target.style.borderColor = C.borderSubtle}>
                      {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>

                  {/* Score / max pts / weight / passval */}
                  {scoreCols.map(sc2 => {
                    const colKey = sc2.key;
                    const rawVal = getScoreVal(q, scoring, model);
                    const isExcluded = isConditional && (colKey === "weight" || colKey === "maxpts");
                    return (
                      <td key={colKey} style={cellStyle(colKey)} onClick={() => !isExcluded && startEdit(colKey)}>
                        {isExcluded ? (
                          <em style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>Excluded</em>
                        ) : editing(colKey) ? (
                          colKey === "passval" ? (
                            <CellInput
                              value={String(rawVal ?? "")}
                              options={getPassOptions(q) || undefined}
                              onSave={v => saveCell(q.id, colKey, v)}
                              onCancel={() => setEditingCell(null)}
                            />
                          ) : (
                            <CellInput value={String(rawVal ?? 0)} type="number"
                              onSave={v => saveCell(q.id, colKey, v)}
                              onCancel={() => setEditingCell(null)} />
                          )
                        ) : (
                          <div style={{ display:"flex", alignItems:"center", gap:6, position:"relative", cursor:"pointer" }}>
                            <span style={{ color: hasErr && qErrors.some(e => e.col === colKey) ? C.error : C.navyDeep }}>
                              {rawVal != null ? String(rawVal) : "—"}
                            </span>
                            {editingCell?.qId === q.id && editingCell?.col === colKey && (
                              <span style={{ position:"absolute", top:0, right:0, width:6, height:6, borderRadius:"50%", background:C.warning }} />
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Required toggle */}
                  <td style={{ ...cellStyle("required"), textAlign:"center" }}>
                    <Toggle value={!!q.required} onChange={() => updateQ(q.id, { required: !q.required })} label={`Required: ${q.required ? "yes" : "no"} for "${(q.text || "Empty").slice(0, 40)}"`} />
                  </td>

                  {/* Logic indicator */}
                  <td style={{ ...cellStyle("logic"), textAlign:"center" }}>
                    {isConditional ? (
                      <span style={{ padding:"2px 7px", borderRadius:3, background:C.warningBg, border:`1px solid #fde68a`, fontSize:9, fontWeight:700, color:C.warning, fontFamily:F }}>
                        Conditional
                      </span>
                    ) : (
                      <span style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Bottom virtualisation padding */}
            {useVirt && bottomPad > 0 && <tr style={{ height: bottomPad }}><td colSpan={cols.length + 1} /></tr>}

            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={cols.length + 1} style={{ padding:"40px 0", textAlign:"center", fontSize:12, color:C.textMuted, fontFamily:F }}>
                  No questions match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Row count */}
      <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginTop:6, textAlign:"right" }}>
        Showing {sortedRows.length} of {allRows.length} question{allRows.length !== 1 ? "s" : ""}
        {useVirt && <span style={{ marginLeft:8, color:C.warning }}>• Virtualised ({VIRT_THRESHOLD}+ rows)</span>}
      </div>

      {/* Modals */}
      {typeChangeModal && (
        <TypeChangeModal
          newType={typeChangeModal.newType}
          count={typeChangeModal.bulkIds?.length || 1}
          onConfirm={confirmTypeChange}
          onClose={() => setTypeChangeModal(null)}
        />
      )}
      {bulkEditModal && (
        <BulkEditModal
          field={bulkEditModal}
          count={selection.size}
          sections={sections}
          onConfirm={(val) => confirmBulkEdit(bulkEditModal, val)}
          onClose={() => setBulkEditModal(null)}
        />
      )}
      {bulkDeleteModal && (
        <BulkDeleteModal
          count={selection.size}
          onConfirm={confirmBulkDelete}
          onClose={() => setBulkDeleteModal(false)}
        />
      )}
    </div>
  );
}
