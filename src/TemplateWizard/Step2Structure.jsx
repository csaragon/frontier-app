// Implements: TLP-18 + TLP-82 (section/question banks), TLP-119 (reorder)
import { useState, useRef, useCallback } from "react";
import { SECTIONS, QUESTIONS, CAT_COLORS, TYPE_META } from "../Catalog.jsx";

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
  success:      "#059669", successBg: "#ecfdf5",
  error:        "#dc2626", errorBg:   "#fef2f2",
  warning:      "#b45309", warningBg: "#fffbeb",
};
const FOCUS_RING = "0 0 0 2px #fff, 0 0 0 4px #2226f7";

const Q_TYPES = ["Yes/No", "Pass/Fail", "Rating", "Text", "Number", "Multiple Choice", "Multi-Select", "Dropdown"];
const MODULES  = ["Loss Prevention", "Health & Safety", "Fire Safety", "Operations", "OSHA", "PPE"];

function uid() { return `i-${Date.now()}-${Math.floor(Math.random() * 9999)}`; }

function sectionFromBank(s) {
  return {
    id: uid(), name: s.name, category: s.cat, collapsed: false,
    questions: QUESTIONS.filter(q => s.qs.includes(q.id)).map(q => ({
      id: uid(), text: q.text, type: q.type, category: q.category,
    })),
  };
}

function questionFromBank(q) {
  return { id: uid(), text: q.text, type: q.type, category: q.category };
}

function Badge({ label, color, bg }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 6px", borderRadius:4, fontSize:9, fontWeight:600, fontFamily:F, background:bg, color, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

// ── Section gap drop zone ────────────────────────────────────────────────────

function SectionGap({ insertAt, dragRef, dropZone, setDropZone, onDropSection }) {
  const accepts = ["panel-section", "canvas-section"].includes(dragRef.current?.type);
  const isActive = dropZone?.kind === "section-gap" && dropZone?.at === insertAt;
  return (
    <div
      onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = accepts ? "move" : "none"; setDropZone({ kind:"section-gap", at:insertAt, valid:accepts }); }}
      onDragLeave={() => setDropZone(null)}
      onDrop={e => { e.preventDefault(); e.stopPropagation(); if (accepts) onDropSection(insertAt); setDropZone(null); }}
      style={{ height:isActive ? 36 : 8, borderRadius:6, border:isActive ? `2px dashed ${dropZone?.valid ? C.primary : C.error}` : "2px dashed transparent", background:isActive ? (dropZone?.valid ? C.primaryBg : C.errorBg) : "transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"height 0.12s", flexShrink:0 }}
    >
      {isActive && dropZone?.valid && <span style={{ fontSize:10, color:C.primary, fontFamily:F, fontWeight:600 }}>Drop section here</span>}
    </div>
  );
}

// ── Question gap drop zone ───────────────────────────────────────────────────

function QuestionGap({ sectionIdx, insertAt, dragRef, dropZone, setDropZone, onDropQuestion }) {
  const accepts = ["panel-question", "canvas-question"].includes(dragRef.current?.type);
  const isActive = dropZone?.kind === "question-gap" && dropZone?.sectionIdx === sectionIdx && dropZone?.at === insertAt;
  return (
    <div
      onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDropZone({ kind:"question-gap", sectionIdx, at:insertAt, valid:accepts }); }}
      onDragLeave={() => setDropZone(null)}
      onDrop={e => { e.preventDefault(); e.stopPropagation(); if (accepts) onDropQuestion(sectionIdx, insertAt); setDropZone(null); }}
      style={{ height:isActive ? 28 : 4, borderRadius:4, border:isActive ? `2px dashed ${dropZone?.valid ? C.primary : C.error}` : "2px dashed transparent", background:isActive ? (dropZone?.valid ? C.primaryBg : C.errorBg) : "transparent", transition:"height 0.1s", flexShrink:0 }}
    />
  );
}

// ── Inline new-question form ─────────────────────────────────────────────────

function InlineQuestionForm({ sectionIdx, onSave, onCancel }) {
  const [text, setText]         = useState("");
  const [type, setType]         = useState("Yes/No");
  const [required, setRequired] = useState(false);

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave(sectionIdx, { id:uid(), text:trimmed, type, required, category:"General" });
  };

  return (
    <div style={{ margin:"6px 0 4px", padding:"12px", borderRadius:8, border:`1.5px solid ${C.primary}`, background:C.primaryBg }}>
      <div style={{ fontSize:10, fontWeight:700, color:C.primary, fontFamily:F, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>New question</div>
      <textarea
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save(); if (e.key === "Escape") onCancel(); }}
        placeholder="Enter question text…"
        rows={2}
        style={{ width:"100%", padding:"7px 9px", borderRadius:6, border:`1px solid ${C.borderDef}`, fontSize:12, fontFamily:F, color:C.navyDeep, resize:"vertical", outline:"none", boxSizing:"border-box", background:"#fff" }}
        onFocus={e => (e.target.style.borderColor = C.primary)}
        onBlur={e => (e.target.style.borderColor = C.borderDef)}
      />
      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
        {/* Type select */}
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          style={{ flex:1, padding:"5px 8px", borderRadius:6, border:`1px solid ${C.borderDef}`, fontSize:11, fontFamily:F, color:C.navyDeep, background:"#fff", outline:"none" }}
        >
          {Q_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {/* Required toggle */}
        <label style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:C.textSec, fontFamily:F, cursor:"pointer", flexShrink:0 }}>
          <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} style={{ cursor:"pointer" }} />
          Required
        </label>
        {/* Actions */}
        <button
          onClick={onCancel}
          style={{ padding:"5px 10px", borderRadius:6, border:`1px solid ${C.borderDef}`, background:"transparent", color:C.textSec, fontSize:11, fontFamily:F, cursor:"pointer" }}
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={!text.trim()}
          style={{ padding:"5px 10px", borderRadius:6, border:"none", background: text.trim() ? C.primary : C.borderDef, color:"#fff", fontSize:11, fontWeight:600, fontFamily:F, cursor: text.trim() ? "pointer" : "not-allowed" }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ── Question row in canvas ───────────────────────────────────────────────────

function QuestionRow({ q, sectionIdx, qIdx, dragRef, onRemove, isConditional }) {
  const tm = TYPE_META[q.type] || { color:C.textSec, bg:C.bgApp };
  const [hov, setHov] = useState(false);
  return (
    <div
      draggable
      onDragStart={() => { dragRef.current = { type:"canvas-question", sectionIdx, questionIdx:qIdx, data:q }; }}
      onDragEnd={() => { dragRef.current = null; }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:6, background:hov ? C.primaryBg : "transparent", transition:"background 0.1s" }}
    >
      <svg aria-hidden="true" width="10" height="14" viewBox="0 0 10 14" fill={C.textMuted} style={{ flexShrink:0, cursor:"grab" }}>
        <circle cx="3" cy="2.5" r="1.2"/><circle cx="7" cy="2.5" r="1.2"/>
        <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
        <circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
      </svg>
      <div style={{ flex:1, fontSize:11, color:C.navyDeep, fontFamily:F, lineHeight:"15px", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
        {q.text}
      </div>
      <Badge label={q.type} color={tm.color} bg={tm.bg} />
      {q.required && <span style={{ fontSize:9, fontWeight:700, color:C.error, fontFamily:F, flexShrink:0 }}>REQ</span>}
      {isConditional && <span style={{ padding:"1px 5px", borderRadius:3, background:"#fffbeb", border:"1px solid #fde68a", fontSize:9, fontWeight:700, color:"#b45309", fontFamily:F, flexShrink:0 }}>COND</span>}
      <button
        onClick={() => onRemove(sectionIdx, qIdx)}
        style={{ background:"none", border:"none", cursor:"pointer", color:C.textMuted, padding:3, borderRadius:4, flexShrink:0, display:"flex", alignItems:"center" }}
        onMouseEnter={e => (e.currentTarget.style.color = C.error)}
        onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}

// ── Section card in canvas ───────────────────────────────────────────────────

function SectionCard({ section, idx, dragRef, dropZone, setDropZone, onDropQuestion, onUpdate, onRemove, onDuplicate, addQuestionMenu, setAddQuestionMenu, conditionalIds, inlineNewQ, setInlineNewQ, onSaveNewQ, onPickFromCatalog }) {
  const [editingName, setEditingName] = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const menuRef   = useRef(null);
  const enterRef  = useRef(0);
  const catStyle  = CAT_COLORS[section.category] || { color:C.textSec, bg:C.bgApp };
  const isCreatingQ = inlineNewQ?.sectionIdx === idx;

  return (
    <div
      draggable
      onDragStart={e => { dragRef.current = { type:"canvas-section", sectionIdx:idx, data:section }; e.dataTransfer.effectAllowed = "move"; }}
      onDragEnd={() => { dragRef.current = null; }}
      style={{ background:C.bgSurface, borderRadius:10, border:`1px solid ${C.borderSubtle}`, overflow:"hidden" }}
    >
      {/* Section header */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", background:C.bgApp, borderBottom:section.collapsed ? "none" : `1px solid ${C.borderSubtle}` }}>
        <svg aria-hidden="true" width="10" height="14" viewBox="0 0 10 14" fill={C.textMuted} style={{ flexShrink:0, cursor:"grab" }}>
          <circle cx="3" cy="2.5" r="1.2"/><circle cx="7" cy="2.5" r="1.2"/>
          <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
          <circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
        </svg>

        {editingName ? (
          <input
            autoFocus
            value={section.name}
            onChange={e => onUpdate(idx, { name:e.target.value })}
            onBlur={() => setEditingName(false)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditingName(false); }}
            style={{ flex:1, fontSize:12, fontWeight:600, fontFamily:F, color:C.navyDeep, border:`1px solid ${C.primary}`, borderRadius:5, padding:"3px 7px", outline:"none", background:C.bgSurface }}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            title="Click to rename"
            style={{ flex:1, textAlign:"left", fontSize:12, fontWeight:600, fontFamily:F, color:C.navy, background:"none", border:"1px solid transparent", borderRadius:5, padding:"3px 7px", cursor:"text", outline:"none" }}
          >
            {section.name}
          </button>
        )}

        <Badge label={section.category} color={catStyle.color} bg={catStyle.bg} />
        <span style={{ fontSize:10, color:C.textMuted, fontFamily:F, whiteSpace:"nowrap" }}>{section.questions.length}q</span>

        <button
          onClick={() => onUpdate(idx, { collapsed:!section.collapsed })}
          style={{ background:"none", border:"none", cursor:"pointer", color:C.textMuted, padding:3, display:"flex", alignItems:"center", borderRadius:4 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform:section.collapsed ? "rotate(-90deg)" : "none", transition:"transform 0.15s" }}><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        <div style={{ position:"relative" }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background:"none", border:"none", cursor:"pointer", color:C.textMuted, padding:3, display:"flex", alignItems:"center", borderRadius:4 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={C.textMuted}><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </button>
          {menuOpen && (
            <div ref={menuRef} style={{ position:"absolute", top:"calc(100% + 4px)", right:0, zIndex:500, background:C.bgSurface, border:`1px solid ${C.borderSubtle}`, borderRadius:8, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", minWidth:130, overflow:"hidden" }}>
              {[
                { label:"Rename",    action:() => { setEditingName(true); setMenuOpen(false); } },
                { label:"Duplicate", action:() => { onDuplicate(idx); setMenuOpen(false); } },
                { label:"Delete",    action:() => { onRemove(idx); setMenuOpen(false); }, danger:true },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                  style={{ display:"block", width:"100%", padding:"9px 14px", textAlign:"left", background:"none", border:"none", cursor:"pointer", fontSize:12, fontFamily:F, color:item.danger ? C.error : C.navyDeep, outline:"none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = item.danger ? C.errorBg : C.bgApp)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Questions body */}
      {!section.collapsed && (
        <div
          onDragEnter={e => { e.preventDefault(); e.stopPropagation(); enterRef.current++; const accepts = ["panel-question","canvas-question"].includes(dragRef.current?.type); if (!dropZone || dropZone.kind !== "question-gap") setDropZone({ kind:"section-body", sectionIdx:idx, valid:accepts }); }}
          onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
          onDragLeave={e => { e.stopPropagation(); enterRef.current--; if (enterRef.current <= 0) { enterRef.current = 0; if (dropZone?.kind === "section-body") setDropZone(null); } }}
          onDrop={e => { e.preventDefault(); e.stopPropagation(); enterRef.current = 0; const dt = dragRef.current?.type; if (dt === "panel-question" || dt === "canvas-question") onDropQuestion(idx, section.questions.length); setDropZone(null); }}
          style={{ padding:"6px 8px", background:dropZone?.kind === "section-body" && dropZone?.sectionIdx === idx ? (dropZone.valid ? C.primaryBg : C.errorBg) : "transparent", minHeight:40, transition:"background 0.1s" }}
        >
          {section.questions.length === 0 && !isCreatingQ && !(dropZone?.kind === "section-body" && dropZone?.sectionIdx === idx) && (
            <div style={{ padding:"10px 0", textAlign:"center", fontSize:11, color:C.textMuted, fontFamily:F }}>
              No questions yet — add one below or pick from the catalog →
            </div>
          )}

          {section.questions.map((q, qIdx) => (
            <div key={q.id}>
              <QuestionGap sectionIdx={idx} insertAt={qIdx} dragRef={dragRef} dropZone={dropZone} setDropZone={setDropZone} onDropQuestion={onDropQuestion} />
              <QuestionRow
                q={q} sectionIdx={idx} qIdx={qIdx} dragRef={dragRef}
                isConditional={conditionalIds.has(q.id)}
                onRemove={(sIdx, qI) => onUpdate(sIdx, { questions:section.questions.filter((_, i) => i !== qI) })}
              />
            </div>
          ))}

          <QuestionGap sectionIdx={idx} insertAt={section.questions.length} dragRef={dragRef} dropZone={dropZone} setDropZone={setDropZone} onDropQuestion={onDropQuestion} />

          {/* Inline question form */}
          {isCreatingQ && (
            <InlineQuestionForm
              sectionIdx={idx}
              onSave={(sIdx, q) => { onSaveNewQ(sIdx, q); setInlineNewQ(null); }}
              onCancel={() => setInlineNewQ(null)}
            />
          )}

          {/* + Add question row */}
          {!isCreatingQ && (
            <div style={{ position:"relative", marginTop:4 }}>
              <button
                onClick={() => setAddQuestionMenu(addQuestionMenu === idx ? null : idx)}
                style={{ width:"100%", padding:"6px 0", borderRadius:6, border:`1px dashed ${C.borderDef}`, background:"transparent", color:C.textSec, fontSize:11, fontFamily:F, cursor:"pointer", outline:"none" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderDef; e.currentTarget.style.color = C.textSec; }}
              >
                + Add question
              </button>
              {addQuestionMenu === idx && (
                <div style={{ position:"absolute", bottom:"calc(100% + 4px)", left:0, zIndex:500, background:C.bgSurface, border:`1px solid ${C.borderSubtle}`, borderRadius:8, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", minWidth:220, overflow:"hidden" }}>
                  <button
                    onClick={() => { setInlineNewQ({ sectionIdx:idx, text:"", type:"Yes/No", required:false }); setAddQuestionMenu(null); }}
                    style={{ display:"block", width:"100%", padding:"10px 14px", textAlign:"left", background:"none", border:"none", cursor:"pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.bgApp)}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    <div style={{ fontSize:12, color:C.navyDeep, fontFamily:F, fontWeight:500 }}>Create new question</div>
                    <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginTop:2 }}>Write a custom question from scratch</div>
                  </button>
                  <button
                    onClick={() => { onPickFromCatalog(idx); setAddQuestionMenu(null); }}
                    style={{ display:"block", width:"100%", padding:"10px 14px", textAlign:"left", background:"none", border:"none", cursor:"pointer", borderTop:`1px solid ${C.borderSubtle}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.bgApp)}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    <div style={{ fontSize:12, color:C.navyDeep, fontFamily:F, fontWeight:500 }}>Pick from catalog</div>
                    <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginTop:2 }}>Browse and add existing questions</div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Catalog panel cards ──────────────────────────────────────────────────────

function PanelSectionCard({ section, dragRef, onAdd }) {
  const catStyle = CAT_COLORS[section.cat] || { color:C.textSec, bg:C.bgApp };
  const [hov, setHov] = useState(false);
  return (
    <div
      draggable
      onDragStart={e => { dragRef.current = { type:"panel-section", data:section }; e.dataTransfer.effectAllowed = "copy"; }}
      onDragEnd={() => { dragRef.current = null; }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${hov ? C.borderDef : C.borderSubtle}`, background:C.bgSurface, marginBottom:6, transition:"border-color 0.1s" }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <svg aria-hidden="true" width="10" height="14" viewBox="0 0 10 14" fill={C.textMuted} style={{ flexShrink:0, cursor:"grab" }}>
          <circle cx="3" cy="2.5" r="1.2"/><circle cx="7" cy="2.5" r="1.2"/>
          <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
          <circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
        </svg>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, fontWeight:600, color:C.navy, fontFamily:F }}>{section.name}</div>
          <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginTop:1 }}>{section.qCount} questions</div>
        </div>
        <Badge label={section.cat} color={catStyle.color} bg={catStyle.bg} />
        {hov && (
          <button
            onClick={() => onAdd(section)}
            style={{ padding:"3px 10px", borderRadius:5, border:"none", background:C.primary, color:"#fff", fontSize:10, fontWeight:600, fontFamily:F, cursor:"pointer", flexShrink:0, whiteSpace:"nowrap" }}
          >
            + Add
          </button>
        )}
      </div>
    </div>
  );
}

function PanelQuestionCard({ question, dragRef, targetSection, onAdd }) {
  const tm       = TYPE_META[question.type]         || { color:C.textSec, bg:C.bgApp };
  const catStyle = CAT_COLORS[question.category]    || { color:C.textSec, bg:C.bgApp };
  const [hov, setHov] = useState(false);
  return (
    <div
      draggable
      onDragStart={e => { dragRef.current = { type:"panel-question", data:question }; e.dataTransfer.effectAllowed = "copy"; }}
      onDragEnd={() => { dragRef.current = null; }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${hov ? C.borderDef : C.borderSubtle}`, background:C.bgSurface, marginBottom:6, transition:"border-color 0.1s" }}
    >
      <div style={{ fontSize:11, color:C.navyDeep, fontFamily:F, lineHeight:"15px", marginBottom:6, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
        {question.text}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
        <Badge label={question.type} color={tm.color} bg={tm.bg} />
        <Badge label={question.category} color={catStyle.color} bg={catStyle.bg} />
        {hov && (
          <button
            onClick={() => onAdd(question)}
            style={{ marginLeft:"auto", padding:"2px 8px", borderRadius:5, border:"none", background: targetSection !== null ? C.primary : C.navy, color:"#fff", fontSize:10, fontWeight:600, fontFamily:F, cursor:"pointer", flexShrink:0, whiteSpace:"nowrap" }}
          >
            {targetSection !== null ? "Add to section" : "+ Add"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Step2Structure ──────────────────────────────────────────────────────

export default function Step2Structure({ sections, dispatch, conditionalIds = new Set() }) {
  const dragRef = useRef(null);
  const [dropZone,       setDropZone]       = useState(null);
  const [panelTab,       setPanelTab]       = useState("sections");
  const [search,         setSearch]         = useState("");
  const [modFilter,      setModFilter]      = useState("All");
  const [addSectionMenu, setAddSectionMenu] = useState(false);
  const [addQuestionMenu,setAddQuestionMenu]= useState(null);
  const [inlineNewQ,     setInlineNewQ]     = useState(null);    // { sectionIdx }
  const [catalogTarget,  setCatalogTarget]  = useState(null);    // sectionIdx the catalog is targeting

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

  // ── Filtered catalog data ───────────────────────────────────────────────────
  const panelSections  = SECTIONS.filter(s => (modFilter === "All" || s.cat === modFilter) && s.name.toLowerCase().includes(search.toLowerCase()));
  const panelQuestions = QUESTIONS.filter(q => (modFilter === "All" || q.category === modFilter) && (q.text.toLowerCase().includes(search.toLowerCase()) || q.category.toLowerCase().includes(search.toLowerCase())));

  // ── Canvas mutations ────────────────────────────────────────────────────────
  const addSection      = useCallback((section, at) => dispatch({ type:"STRUCTURE_ADD_SECTION", section, at }), [dispatch]);
  const removeSection   = useCallback((idx) => dispatch({ type:"STRUCTURE_REMOVE_SECTION", idx }), [dispatch]);
  const updateSection   = useCallback((idx, updates) => dispatch({ type:"STRUCTURE_UPDATE_SECTION", idx, updates }), [dispatch]);
  const duplicateSection= useCallback((idx) => {
    const s = sections[idx];
    dispatch({ type:"STRUCTURE_ADD_SECTION", section:{ ...s, id:uid(), name:`${s.name} (copy)`, questions:s.questions.map(q => ({ ...q, id:uid() })) }, at:idx + 1 });
  }, [dispatch, sections]);

  const saveNewQuestion = useCallback((sectionIdx, q) => {
    dispatch({ type:"STRUCTURE_ADD_QUESTION", sectionIdx, question:q, at:sections[sectionIdx]?.questions.length ?? 0 });
  }, [dispatch, sections]);

  // When user clicks "Pick from catalog" in a section's add-question menu
  const handlePickFromCatalog = useCallback((sectionIdx) => {
    setCatalogTarget(sectionIdx);
    setPanelTab("questions");
  }, []);

  // ── Catalog click-to-add ────────────────────────────────────────────────────
  const handleAddSectionFromCatalog = useCallback((s) => {
    addSection(sectionFromBank(s), sections.length);
  }, [addSection, sections.length]);

  const handleAddQuestionFromCatalog = useCallback((q) => {
    const targetIdx = catalogTarget !== null ? catalogTarget : sections.length - 1;
    if (targetIdx < 0) return; // no sections yet
    dispatch({ type:"STRUCTURE_ADD_QUESTION", sectionIdx:targetIdx, question:questionFromBank(q), at:sections[targetIdx]?.questions.length ?? 0 });
  }, [catalogTarget, dispatch, sections]);

  // ── Drop handlers ───────────────────────────────────────────────────────────
  const handleDropSection = useCallback((insertAt) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.type === "panel-section") {
      addSection(sectionFromBank(drag.data), insertAt);
    } else if (drag.type === "canvas-section") {
      const from = drag.sectionIdx;
      if (from === insertAt || from === insertAt - 1) return;
      dispatch({ type:"STRUCTURE_REORDER_SECTIONS", fromIdx:from, toIdx:insertAt > from ? insertAt - 1 : insertAt });
    }
    dragRef.current = null;
  }, [addSection, dispatch]);

  const handleDropQuestion = useCallback((toSectionIdx, toQIdx) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.type === "panel-question") {
      dispatch({ type:"STRUCTURE_ADD_QUESTION", sectionIdx:toSectionIdx, question:questionFromBank(drag.data), at:toQIdx });
    } else if (drag.type === "canvas-question") {
      dispatch({ type:"STRUCTURE_REORDER_QUESTION", fromSectionIdx:drag.sectionIdx, fromQIdx:drag.questionIdx, toSectionIdx, toQIdx });
    }
    dragRef.current = null;
  }, [dispatch]);

  return (
    <div style={{ display:"flex", gap:0, height:"100%", overflow:"hidden" }}>

      {/* ── Left canvas */}
      <div style={{ flex:1, overflowY:"auto", padding:"0 16px 24px 0", minWidth:0 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.navyDeep, fontFamily:F }}>Template structure</div>
          <span style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>{sections.length} section{sections.length !== 1 ? "s" : ""} · {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}</span>
        </div>

        {/* Section overview pills */}
        {sections.length > 0 && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14, padding:"10px 12px", background:C.bgSurface, borderRadius:8, border:`1px solid ${C.borderSubtle}` }}>
            {sections.map((s, idx) => {
              const cs = CAT_COLORS[s.category] || { color:C.textSec, bg:C.bgApp };
              return (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:999, background:cs.bg, border:`1px solid ${cs.color}30` }}>
                  <span style={{ fontSize:10, fontWeight:600, color:cs.color, fontFamily:F }}>{s.name}</span>
                  <span style={{ fontSize:9, color:cs.color, fontFamily:F, opacity:0.7 }}>{s.questions.length}q</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {sections.length === 0 && (
          <div style={{ textAlign:"center", padding:"48px 24px", color:C.textMuted, fontFamily:F, background:C.bgSurface, borderRadius:10, border:`1px solid ${C.borderSubtle}` }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.textSec, marginBottom:6 }}>No sections yet</div>
            <div style={{ fontSize:12 }}>Click "+ Add section" below, or use the catalog panel on the right to add a pre-built section.</div>
          </div>
        )}

        {/* Sections */}
        <SectionGap insertAt={0} dragRef={dragRef} dropZone={dropZone} setDropZone={setDropZone} onDropSection={handleDropSection} />
        {sections.map((section, idx) => (
          <div key={section.id}>
            <SectionCard
              section={section} idx={idx}
              dragRef={dragRef} dropZone={dropZone} setDropZone={setDropZone}
              onDropQuestion={handleDropQuestion}
              onUpdate={updateSection} onRemove={removeSection} onDuplicate={duplicateSection}
              addQuestionMenu={addQuestionMenu} setAddQuestionMenu={setAddQuestionMenu}
              conditionalIds={conditionalIds}
              inlineNewQ={inlineNewQ} setInlineNewQ={setInlineNewQ} onSaveNewQ={saveNewQuestion}
              onPickFromCatalog={handlePickFromCatalog}
            />
            <SectionGap insertAt={idx + 1} dragRef={dragRef} dropZone={dropZone} setDropZone={setDropZone} onDropSection={handleDropSection} />
          </div>
        ))}

        {/* + Add section */}
        <div style={{ position:"relative", marginTop:8 }}>
          <button
            onClick={() => setAddSectionMenu(o => !o)}
            style={{ width:"100%", padding:"10px 0", borderRadius:8, border:`2px dashed ${C.borderDef}`, background:"transparent", color:C.primary, fontSize:12, fontFamily:F, fontWeight:600, cursor:"pointer", outline:"none" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.background = C.primaryBg; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderDef; e.currentTarget.style.background = "transparent"; }}
          >
            + Add section
          </button>
          {addSectionMenu && (
            <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:500, background:C.bgSurface, border:`1px solid ${C.borderSubtle}`, borderRadius:8, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", minWidth:240, overflow:"hidden" }}>
              <button
                onClick={() => { addSection({ id:uid(), name:"New section", category:"Operations", collapsed:false, questions:[] }, sections.length); setAddSectionMenu(false); }}
                style={{ display:"block", width:"100%", padding:"10px 16px", textAlign:"left", background:"none", border:"none", cursor:"pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.bgApp)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <div style={{ fontSize:12, color:C.navyDeep, fontFamily:F, fontWeight:500 }}>Blank section</div>
                <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginTop:2 }}>Start with an empty section</div>
              </button>
              <div style={{ borderTop:`1px solid ${C.borderSubtle}` }}>
                <div style={{ fontSize:9, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", padding:"8px 16px 4px", fontFamily:F }}>From catalog</div>
                {SECTIONS.slice(0, 5).map(s => (
                  <button
                    key={s.id}
                    onClick={() => { addSection(sectionFromBank(s), sections.length); setAddSectionMenu(false); }}
                    style={{ display:"block", width:"100%", padding:"8px 16px", textAlign:"left", background:"none", border:"none", cursor:"pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.bgApp)}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    <div style={{ fontSize:12, color:C.navyDeep, fontFamily:F }}>{s.name}</div>
                    <div style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>{s.qCount} questions</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right catalog panel */}
      <div style={{ width:300, borderLeft:`1px solid ${C.borderSubtle}`, display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0, background:C.bgSurface }}>

        {/* Panel header */}
        <div style={{ padding:"10px 12px 0", borderBottom:`1px solid ${C.borderSubtle}`, flexShrink:0 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.navyDeep, fontFamily:F, marginBottom:8 }}>Catalog</div>
          {/* Tabs */}
          <div style={{ display:"flex", gap:0 }}>
            {[{ key:"sections", label:"Sections", count:panelSections.length }, { key:"questions", label:"Questions", count:panelQuestions.length }].map(t => {
              const active = panelTab === t.key;
              return (
                <button key={t.key} onClick={() => setPanelTab(t.key)}
                  style={{ flex:1, padding:"8px 0", border:"none", borderBottom:active ? `2px solid ${C.primary}` : "2px solid transparent", background:"transparent", color:active ? C.primary : C.textSec, fontSize:11, fontWeight:active ? 600 : 400, fontFamily:F, cursor:"pointer" }}
                >
                  {t.label} <span style={{ marginLeft:4, padding:"1px 5px", borderRadius:999, background:active ? C.primaryLight : C.bgApp, color:active ? C.primaryHover : C.textMuted, fontSize:9, fontWeight:600 }}>{t.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog target indicator */}
        {catalogTarget !== null && panelTab === "questions" && (
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:"#fffbeb", borderBottom:`1px solid #fde68a`, flexShrink:0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ flex:1, fontSize:10, color:"#b45309", fontFamily:F, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              Adding to: {sections[catalogTarget]?.name ?? "section"}
            </span>
            <button onClick={() => setCatalogTarget(null)} style={{ fontSize:10, color:"#b45309", fontFamily:F, background:"none", border:"none", cursor:"pointer", padding:"0 2px", fontWeight:600 }}>✕</button>
          </div>
        )}

        {/* Search + filter */}
        <div style={{ padding:"10px 12px", borderBottom:`1px solid ${C.borderSubtle}`, flexShrink:0 }}>
          <div style={{ position:"relative" }}>
            <svg style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={panelTab === "sections" ? "Search sections…" : "Search questions…"}
              style={{ width:"100%", padding:"6px 8px 6px 28px", borderRadius:7, border:`1px solid ${C.borderDef}`, fontSize:11, fontFamily:F, color:C.navyDeep, background:C.bgSurface, outline:"none", boxSizing:"border-box" }}
              onFocus={e => (e.target.style.borderColor = C.primary)}
              onBlur={e => (e.target.style.borderColor = C.borderDef)}
            />
          </div>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:8 }}>
            {["All", ...MODULES].map(m => (
              <button key={m} onClick={() => setModFilter(m)}
                style={{ padding:"2px 8px", borderRadius:999, fontSize:9, border:`1px solid ${modFilter === m ? C.primary : C.borderDef}`, background:modFilter === m ? C.primaryLight : C.bgSurface, color:modFilter === m ? C.primaryHover : C.textSec, fontWeight:modFilter === m ? 600 : 400, fontFamily:F, cursor:"pointer" }}
              >{m}</button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div style={{ flex:1, overflowY:"auto", padding:12 }}>
          {panelTab === "sections" && (
            panelSections.length === 0
              ? <div style={{ textAlign:"center", padding:"32px 0", fontSize:12, color:C.textMuted, fontFamily:F }}>No sections match.</div>
              : panelSections.map(s => <PanelSectionCard key={s.id} section={s} dragRef={dragRef} onAdd={handleAddSectionFromCatalog} />)
          )}
          {panelTab === "questions" && (
            panelQuestions.length === 0
              ? <div style={{ textAlign:"center", padding:"32px 0", fontSize:12, color:C.textMuted, fontFamily:F }}>No questions match.</div>
              : panelQuestions.map(q => (
                  <PanelQuestionCard
                    key={q.id} question={q} dragRef={dragRef}
                    targetSection={catalogTarget}
                    onAdd={sections.length > 0 ? handleAddQuestionFromCatalog : null}
                  />
                ))
          )}
          {sections.length === 0 && panelTab === "questions" && (
            <div style={{ marginTop:8, padding:"8px 10px", borderRadius:6, background:"#fffbeb", border:"1px solid #fde68a", fontSize:10, color:"#b45309", fontFamily:F }}>
              Add a section first, then pick questions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
