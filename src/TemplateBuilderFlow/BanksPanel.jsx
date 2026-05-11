import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { AnsTypeIcon, LogicIcons, IconAction, IconConditional, IconEscalation, IconPhoto, FEATURE_COLORS } from "./typeIcons.jsx";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy: "#001e76", navy2: "#001356",
  white: "#ffffff",
  g1: "#f4f4f6", g2: "#e2e5e9", g3: "#c3c8d0", g4: "#8692a2", g5: "#555f6d", g6: "#16191d",
  red: "#b6143a",
};

const CAT_COLORS = {
  "Health & Safety":  { color: "#b6143a", bg: "#fae5e6" },
  "Loss Prevention":  { color: "#2226f7", bg: "#d4e2ff" },
  "Operations":       { color: "#0f766e", bg: "#ccfbf1" },
  "Fire Safety":      { color: "#7c3aed", bg: "#faf5ff" },
  "PPE Compliance":   { color: "#c2410c", bg: "#fff7ed" },
  "OSHA Compliance":  { color: "#001e76", bg: "#e0f2fe" },
  "Cash Handling":    { color: "#a16207", bg: "#fefce8" },
  "Asset Protection": { color: "#166534", bg: "#f0fdf4" },
};

const ANSWER_TYPE_COLORS = {
  "Yes/No/NA":       { bg: "#d9e5f5", color: "#2b4b94" },
  "Yes/No":          { bg: "#d9e5f5", color: "#2b4b94" },
  "Pass/Fail":       { bg: "#e0dcf8", color: "#4030a6" },
  "Rating Scale":    { bg: "#e8d8f5", color: "#5c2c98" },
  "Free Text":       { bg: "#d6ecf5", color: "#1e5f80" },
  "Number":          { bg: "#d6dff0", color: "#2e3e72" },
  "Multiple Choice": { bg: "#e6e9ed", color: "#48535f" },
  "Photo Required":  { bg: "#e0dcf8", color: "#4030a6" },
};

function ansTypeColor(v) {
  return ANSWER_TYPE_COLORS[v] ?? { bg: C.g1, color: C.g5 };
}

// ── Stub data ──────────────────────────────────────────────────────────────────

export const SECTION_BANK = [
  { id:"bs-1", name:"Fire Safety Basics", category:"Fire Safety", description:"Core fire safety checks for any retail location.", author:"Marcus Webb", questionCount:5, version:"2.1", updatedAt:"2025-11-02", tags:["safety","inspection"], questions:[
    {id:"bq-s1-1", title:"Are fire extinguishers mounted and accessible?", answerType:"Yes/No/NA", required:true,  hasAction:true, hasEscalation:true, hasConditional:true,
      actionData:{ description:"Assign corrective action to Store Manager to document and resolve extinguisher placement" },
      escalationData:{ condition:"Action unresolved after 24 hrs", notifyRole:"District Manager" },
      conditional:{ when:"Answer is No", followUp:[
        {id:"bq-s1-1a", title:"Describe the issue with extinguisher placement", answerType:"Free Text", required:true},
        {id:"bq-s1-1b", title:"Upload photo of non-compliant extinguisher location", answerType:"Photo Required", required:false},
      ]}},
    {id:"bq-s1-2", title:"When was the last fire drill?", answerType:"Free Text", required:false},
    {id:"bq-s1-3", title:"Are sprinkler heads unobstructed?", answerType:"Yes/No/NA", required:true, hasAction:true,
      actionData:{ description:"Flag for immediate facilities review — clear sprinkler head obstruction and document" }},
    {id:"bq-s1-4", title:"Rate the overall fire readiness (1-5)", answerType:"Rating Scale", required:false, hasConditional:true,
      conditional:{ when:"Rating is 3 or below", followUp:[
        {id:"bq-s1-4a", title:"Describe the primary fire readiness concern", answerType:"Free Text", required:true},
        {id:"bq-s1-4b", title:"Has a corrective action been initiated?", answerType:"Yes/No", required:true},
      ]}},
    {id:"bq-s1-5", title:"Upload photo of extinguisher tags", answerType:"Photo Required", required:true, hasPhoto:true},
  ]},
  { id:"bs-2", name:"PPE Compliance Check", category:"PPE Compliance", description:"Verify PPE availability and usage.", author:"Diane Torres", questionCount:4, version:"1.3", updatedAt:"2025-10-28", tags:["ppe","compliance"], questions:[
    {id:"bq-s2-1", title:"Is PPE available at required stations?", answerType:"Yes/No/NA", required:true},
    {id:"bq-s2-2", title:"Are employees wearing required PPE?", answerType:"Pass/Fail", required:true, hasAction:true, hasEscalation:true, hasConditional:true,
      actionData:{ description:"Log coaching session and corrective conversation with non-compliant employee" },
      escalationData:{ condition:"Repeat non-compliance or refusal to correct", notifyRole:"HR Manager" },
      conditional:{ when:"Answer is Fail", followUp:[
        {id:"bq-s2-2a", title:"Which stations have non-compliant PPE usage?", answerType:"Free Text", required:true},
        {id:"bq-s2-2b", title:"Were employees coached on PPE requirements?", answerType:"Yes/No", required:true},
      ]}},
    {id:"bq-s2-3", title:"Note any PPE deficiencies observed", answerType:"Free Text", required:false},
    {id:"bq-s2-4", title:"Take photo of PPE station", answerType:"Photo Required", required:false, hasPhoto:true},
  ]},
  { id:"bs-3", name:"Cash Handling Standards", category:"Cash Handling", description:"Verify cash handling procedures and controls.", author:"Rachel Kim", questionCount:6, version:"3.0", updatedAt:"2025-10-15", tags:["cash","procedure"], questions:[
    {id:"bq-s3-1", title:"Is the safe locked when not in use?", answerType:"Yes/No/NA", required:true},
    {id:"bq-s3-2", title:"Are dual-control procedures followed for cash counts?", answerType:"Yes/No", required:true},
    {id:"bq-s3-3", title:"How many cash drops occurred today?", answerType:"Number", required:false},
    {id:"bq-s3-4", title:"Are register funds within expected variance?", answerType:"Pass/Fail", required:true, hasConditional:true,
      conditional:{ when:"Answer is Fail", followUp:[
        {id:"bq-s3-4a", title:"What is the variance amount?", answerType:"Number", required:true},
        {id:"bq-s3-4b", title:"Describe the discrepancy", answerType:"Free Text", required:true},
      ]}},
    {id:"bq-s3-5", title:"Describe any cash handling concerns", answerType:"Free Text", required:false},
    {id:"bq-s3-6", title:"Rate cash handling compliance", answerType:"Rating Scale", required:false},
  ]},
  { id:"bs-4", name:"Slip & Trip Hazards", category:"Health & Safety", description:"Assess floor conditions and slip/trip risks.", author:"James Okafor", questionCount:4, version:"1.5", updatedAt:"2025-09-30", tags:["safety","retail"], questions:[
    {id:"bq-s4-1", title:"Are all aisles free of obstructions?", answerType:"Yes/No/NA", required:true, hasConditional:true,
      conditional:{ when:"Answer is No", followUp:[
        {id:"bq-s4-1a", title:"Identify the blocked aisles by number or location", answerType:"Free Text", required:true},
      ]}},
    {id:"bq-s4-2", title:"Are wet floor signs present where needed?", answerType:"Yes/No/NA", required:true},
    {id:"bq-s4-3", title:"Rate overall floor safety", answerType:"Rating Scale", required:false},
    {id:"bq-s4-4", title:"Photo evidence of hazard areas", answerType:"Photo Required", required:false},
  ]},
  { id:"bs-5", name:"Emergency Exits", category:"Health & Safety", description:"Verify emergency exit compliance.", author:"Sandra Patel", questionCount:3, version:"2.0", updatedAt:"2025-09-18", tags:["safety","compliance","inspection"], questions:[
    {id:"bq-s5-1", title:"Are all emergency exits unobstructed?", answerType:"Yes/No/NA", required:true},
    {id:"bq-s5-2", title:"Do emergency doors open outward?", answerType:"Pass/Fail", required:true, hasConditional:true,
      conditional:{ when:"Answer is Fail", followUp:[
        {id:"bq-s5-2a", title:"Which exit doors are non-compliant?", answerType:"Free Text", required:true},
        {id:"bq-s5-2b", title:"Has facilities been notified?", answerType:"Yes/No", required:true},
      ]}},
    {id:"bq-s5-3", title:"Are exit signs illuminated?", answerType:"Yes/No/NA", required:true},
  ]},
  { id:"bs-6", name:"Chemical Storage", category:"OSHA Compliance", description:"Check chemical storage and SDS compliance.", author:"Tom Nguyen", questionCount:4, version:"1.1", updatedAt:"2025-08-22", tags:["compliance","procedure","hazmat"], questions:[
    {id:"bq-s6-1", title:"Are chemicals stored in approved containers?", answerType:"Yes/No/NA", required:true},
    {id:"bq-s6-2", title:"Is the SDS binder current and accessible?", answerType:"Yes/No", required:true},
    {id:"bq-s6-3", title:"Are hazmat storage areas properly labeled?", answerType:"Pass/Fail", required:true, hasConditional:true,
      conditional:{ when:"Answer is Fail", followUp:[
        {id:"bq-s6-3a", title:"Which areas are missing or have incorrect labels?", answerType:"Free Text", required:true},
        {id:"bq-s6-3b", title:"Photo of non-compliant labeling area", answerType:"Photo Required", required:false},
      ]}},
    {id:"bq-s6-4", title:"Photo of chemical storage area", answerType:"Photo Required", required:false},
  ]},
];

export const QUESTION_BANK = [
  {id:"bq-1",  title:"Are all fire extinguishers accessible?",               answerType:"Yes/No/NA",       required:true,  tags:["safety","inspection"],  hasAction:true, hasEscalation:true, category:"Fire Safety",      version:"2.1"},
  {id:"bq-2",  title:"Rate overall store cleanliness (1–5)",                 answerType:"Rating Scale",    required:false, tags:["retail","compliance"],                                      category:"Operations",        version:"1.0"},
  {id:"bq-3",  title:"Are employees wearing required PPE?",                  answerType:"Pass/Fail",       required:true,  tags:["ppe","safety"],         hasAction:true,                    category:"PPE Compliance",    version:"1.3"},
  {id:"bq-4",  title:"Describe any safety concerns observed",               answerType:"Free Text",       required:false, tags:["safety"],                                                   category:"Health & Safety",   version:"1.0"},
  {id:"bq-5",  title:"Number of employees on floor during inspection",       answerType:"Number",          required:false, tags:["retail"],                                                   category:"Operations",        version:"1.0"},
  {id:"bq-6",  title:"Select areas inspected today",                         answerType:"Multiple Choice", required:false, tags:["inspection"],           hasConditional:true,               category:"Operations",        version:"1.2"},
  {id:"bq-7",  title:"Is the safe secured when not in use?",                 answerType:"Yes/No",          required:true,  tags:["cash","procedure"],     hasEscalation:true,                category:"Cash Handling",     version:"3.0"},
  {id:"bq-8",  title:"Upload photo of current floor conditions",             answerType:"Photo Required",  required:false, tags:["retail","inspection"],  hasPhoto:true,                     category:"Operations",        version:"1.0"},
  {id:"bq-9",  title:"Are aisle end-caps free of hazards?",                  answerType:"Yes/No/NA",       required:true,  tags:["safety","retail"],      hasAction:true,                    category:"Health & Safety",   version:"1.5"},
  {id:"bq-10", title:"Rate emergency preparedness readiness",                answerType:"Rating Scale",    required:false, tags:["safety","compliance"],  hasConditional:true,               category:"Health & Safety",   version:"2.0"},
  {id:"bq-11", title:"Is the first aid kit fully stocked?",                  answerType:"Yes/No/NA",       required:true,  tags:["safety"],               hasEscalation:true,                category:"Health & Safety",   version:"2.0"},
  {id:"bq-12", title:"Are break room food storage rules followed?",          answerType:"Pass/Fail",       required:false, tags:["compliance"],           hasAction:true,                    category:"OSHA Compliance",   version:"1.1"},
  {id:"bq-13", title:"How many incidents reported this week?",               answerType:"Number",          required:false, tags:["safety"],               hasEscalation:true,                category:"Health & Safety",   version:"1.5"},
  {id:"bq-14", title:"Are security cameras functional and unobstructed?",    answerType:"Yes/No/NA",       required:true,  tags:["safety","compliance"],  hasEscalation:true,                category:"OSHA Compliance",   version:"1.1"},
  {id:"bq-15", title:"Asset tag verification complete?",                     answerType:"Yes/No",          required:false, tags:["compliance","procedure"],                                   category:"Asset Protection",  version:"1.0"},
];

// ── Helper ─────────────────────────────────────────────────────────────────────

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const CATEGORIES_FILTER = [
  "Health & Safety", "Loss Prevention", "Operations", "Fire Safety",
  "PPE Compliance", "OSHA Compliance", "Cash Handling", "Asset Protection",
];
const TAGS_FILTER = ["retail", "safety", "compliance", "monthly", "weekly", "critical", "inspection", "procedure"];

// ── Icons ──────────────────────────────────────────────────────────────────────

function IconFunnel() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}

// ── Filter Dropdown ────────────────────────────────────────────────────────────

const LOGIC_FILTERS = [
  { key: "hasConditional", label: "Conditional" },
  { key: "hasAction",      label: "Action" },
  { key: "hasEscalation",  label: "Escalation" },
  { key: "hasPhoto",       label: "Photo" },
];

function FilterDropdown({ tab, selectedCategories, setSelectedCategories, selectedTags, setSelectedTags, selectedLogic, setSelectedLogic, onClear, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  function toggleCat(cat) {
    setSelectedCategories(prev => {
      const n = new Set(prev);
      n.has(cat) ? n.delete(cat) : n.add(cat);
      return n;
    });
  }
  function toggleTag(tag) {
    setSelectedTags(prev => {
      const n = new Set(prev);
      n.has(tag) ? n.delete(tag) : n.add(tag);
      return n;
    });
  }
  function toggleLogic(key) {
    setSelectedLogic(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }

  const hasActiveFilters = selectedCategories.size > 0 || selectedTags.size > 0 || selectedLogic.size > 0;

  return (
    <div ref={ref} style={{
      position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 300,
      background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8,
      boxShadow: "0 4px 16px rgba(0,0,0,0.14)", width: 240, overflow: "hidden",
      fontFamily: F,
    }}>
      {tab === "sections" && (
        <div style={{ padding: "10px 12px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Category</div>
          {CATEGORIES_FILTER.map(cat => {
            const style = CAT_COLORS[cat] ?? { color: C.g5, bg: C.g1 };
            const checked = selectedCategories.has(cat);
            return (
              <label key={cat} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 0", cursor: "pointer" }}>
                <div
                  onClick={() => toggleCat(cat)}
                  style={{
                    width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                    border: `1.5px solid ${checked ? C.navy : C.g3}`,
                    background: checked ? C.navy : C.white,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {checked && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
                </div>
                <span style={{ fontSize: 12, color: style.color, background: style.bg, borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>{cat}</span>
              </label>
            );
          })}
        </div>
      )}
      {tab === "questions" && (
        <div style={{ padding: "10px 12px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Logic</div>
          {LOGIC_FILTERS.map(({ key, label }) => {
            const checked = selectedLogic.has(key);
            return (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 0", cursor: "pointer" }}>
                <div
                  onClick={() => toggleLogic(key)}
                  style={{
                    width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                    border: `1.5px solid ${checked ? C.navy : C.g3}`,
                    background: checked ? C.navy : C.white,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {checked && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
                </div>
                <span style={{ fontSize: 12, color: C.g6, fontWeight: 500 }}>{label}</span>
              </label>
            );
          })}
        </div>
      )}
      <div style={{ padding: tab === "sections" ? "0 12px 10px" : "0 12px 10px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Tags</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {TAGS_FILTER.map(tag => {
            const checked = selectedTags.has(tag);
            return (
              <button key={tag} onClick={() => toggleTag(tag)}
                style={{
                  fontSize: 12, fontWeight: 500, fontFamily: F, borderRadius: 4, padding: "2px 7px",
                  border: `1px solid ${checked ? C.navy : C.g3}`,
                  background: checked ? "#eef1ff" : C.g1,
                  color: checked ? C.navy : C.g5,
                  cursor: "pointer",
                }}
              >{tag}</button>
            );
          })}
        </div>
      </div>
      {hasActiveFilters && (
        <div style={{ borderTop: `1px solid ${C.g2}`, padding: "8px 12px" }}>
          <button onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.navy, fontFamily: F, fontWeight: 500, padding: 0 }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

// ── Section Bank Card ──────────────────────────────────────────────────────────

function TriggerTip({ children, label, color, bg }) {
  const [show, setShow] = useState(false);
  const timer = useRef(null);
  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center", flexShrink: 0 }}
      onMouseEnter={() => { timer.current = setTimeout(() => setShow(true), 1000); }}
      onMouseLeave={() => { clearTimeout(timer.current); setShow(false); }}
    >
      {children}
      {show && (
        <div style={{
          position: "absolute", top: "calc(100% + 5px)", left: "50%",
          transform: "translateX(-50%)",
          background: bg, color,
          fontSize: 10, fontWeight: 700, fontFamily: F,
          padding: "2px 7px", borderRadius: 4,
          whiteSpace: "nowrap", pointerEvents: "none", zIndex: 700,
          boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
        }}>
          {label}
        </div>
      )}
    </span>
  );
}

function SectionPreviewModal({ section, onClose, onAdd, onAddPickedAsSection }) {
  const [pickedIds, setPickedIds] = useState(new Set(section.questions?.map(q => q.id) ?? []));
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showLogicPreview, setShowLogicPreview] = useState(true);
  const typeDropRef = useRef(null);

  useEffect(() => {
    if (!showTypeDropdown) return;
    function handle(e) { if (typeDropRef.current && !typeDropRef.current.contains(e.target)) setShowTypeDropdown(false); }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showTypeDropdown]);

  const catStyle = CAT_COLORS[section.category] ?? { color: C.g5, bg: C.g1 };
  const totalQs = section.questions?.length ?? 0;
  const allTypes = useMemo(() => [...new Set((section.questions || []).map(q => q.answerType))], [section.questions]);

  const visibleQuestions = useMemo(() => (section.questions || []).filter(q => {
    const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedTypes.size === 0 || selectedTypes.has(q.answerType);
    return matchSearch && matchType;
  }), [section.questions, search, selectedTypes]);

  function toggleType(type) {
    setSelectedTypes(prev => { const n = new Set(prev); n.has(type) ? n.delete(type) : n.add(type); return n; });
  }
  function togglePicked(id) {
    setPickedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function pickAll() { setPickedIds(new Set(section.questions?.map(q => q.id) ?? [])); }
  function clearPicked() { setPickedIds(new Set()); }

  function handleAdd() {
    const all = new Set(section.questions?.map(q => q.id) ?? []);
    const isAll = pickedIds.size === all.size && [...pickedIds].every(id => all.has(id));
    if (isAll) { onAdd(section); }
    else if (pickedIds.size > 0 && onAddPickedAsSection) {
      onAddPickedAsSection(section, (section.questions || []).filter(q => pickedIds.has(q.id)));
    }
    onClose();
  }

  const activeTypeCount = selectedTypes.size;
  const hasFilters = search || activeTypeCount > 0;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(16,24,40,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.white, borderRadius: 12,
        width: "100%", maxWidth: 900, maxHeight: "90vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
        overflow: "hidden", fontFamily: F,
      }}>

        {/* Header */}
        <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${C.g2}`, flexShrink: 0 }}>
          {/* Catalog Preview label */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.navy, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.07em" }}>Catalog Preview</span>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, padding: 4, borderRadius: 4, display: "flex" }}
              onMouseEnter={e => e.currentTarget.style.color = C.g6}
              onMouseLeave={e => e.currentTarget.style.color = C.g4}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {/* Section name + meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.g6 }}>{section.name}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: catStyle.color, background: catStyle.bg, borderRadius: 4, padding: "1px 7px" }}>{section.category}</span>
          </div>
          <div style={{ fontSize: 13, color: C.g4, lineHeight: "18px", marginBottom: 8 }}>{section.description}</div>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.g4, flexWrap: "wrap" }}>
            <span><strong style={{ color: C.g5 }}>{totalQs}</strong> {totalQs === 1 ? "question" : "questions"}</span>
            {section.author && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {section.author}
              </span>
            )}
            {section.version && <span>v{section.version}</span>}
            <span>Updated {formatDate(section.updatedAt)}</span>
          </div>
        </div>

        {/* Filter bar: search + type dropdown + conditional toggle */}
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

          {/* Type multi-select dropdown */}
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
              <IconFunnel />
              Type{activeTypeCount > 0 ? ` · ${activeTypeCount}` : ""}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showTypeDropdown && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200,
                background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8,
                boxShadow: "0 4px 16px rgba(0,0,0,0.14)", width: 210, overflow: "hidden", fontFamily: F,
              }}>
                <div style={{ padding: "8px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Answer Type</div>
                  {allTypes.map(type => {
                    const tc = ansTypeColor(type);
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
            title={showLogicPreview ? "Hide conditional logic preview" : "Show conditional logic preview"}
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

          {/* Clear all filters */}
          {hasFilters && (
            <button onClick={() => { setSearch(""); setSelectedTypes(new Set()); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: C.g4, fontFamily: F, padding: "6px 4px", flexShrink: 0, whiteSpace: "nowrap" }}>
              Clear
            </button>
          )}
        </div>

        {/* Question table */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "28px 28px 1fr 130px 48px 90px",
            alignItems: "center",
            padding: "6px 20px",
            borderBottom: `1px solid ${C.g2}`,
            background: C.g1,
            gap: 8,
            position: "sticky", top: 0, zIndex: 1,
          }}>
            <div
              onClick={pickedIds.size === totalQs ? clearPicked : pickAll}
              title={pickedIds.size === totalQs ? "Clear all" : "Select all"}
              style={{
                width: 14, height: 14, borderRadius: 4,
                border: `1.5px solid ${pickedIds.size > 0 ? C.navy : C.g3}`,
                background: pickedIds.size === totalQs ? C.navy : pickedIds.size > 0 ? "#eef1ff" : C.white,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
              }}
            >
              {pickedIds.size === totalQs && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
              {pickedIds.size > 0 && pickedIds.size < totalQs && <div style={{ width: 6, height: 2, background: C.navy, borderRadius: 1 }} />}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.04em" }}>#</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Question</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Type</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Req&apos;d</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Logic</div>
          </div>

          {/* Empty state */}
          {visibleQuestions.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center", color: C.g4, fontSize: 12, fontFamily: F }}>
              No questions match.{" "}
              <button onClick={() => { setSearch(""); setSelectedTypes(new Set()); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.navy, fontSize: 12, fontFamily: F, fontWeight: 500, padding: 0 }}>Clear filters</button>
            </div>
          )}

          {/* Table rows */}
          {visibleQuestions.map((q, i) => {
            const at = ansTypeColor(q.answerType);
            const checked = pickedIds.has(q.id);
            const hasActionPreview      = !!q.hasAction;
            const hasConditionalPreview = !!q.conditional;
            const hasEscalationPreview  = !!q.hasEscalation;
            const hasPhotoPreview       = !!q.hasPhoto;
            const hasAnyPreview         = hasActionPreview || hasConditionalPreview || hasEscalationPreview || hasPhotoPreview;
            return (
              <div key={q.id}>
                <div
                  onClick={() => togglePicked(q.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "28px 28px 1fr 130px 48px 90px",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 20px",
                    borderBottom: (hasAnyPreview && showLogicPreview) ? "none" : `1px solid ${C.g2}`,
                    background: checked ? "#f7f9ff" : C.white,
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (!checked) e.currentTarget.style.background = C.g1; }}
                  onMouseLeave={e => { e.currentTarget.style.background = checked ? "#f7f9ff" : C.white; }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: 4, flexShrink: 0, border: `1.5px solid ${checked ? C.navy : C.g3}`, background: checked ? C.navy : C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {checked && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: C.g4, fontFamily: F }}>{i + 1}</span>
                  <div style={{ fontSize: 12, color: C.g6, fontFamily: F, lineHeight: "16px", fontWeight: checked ? 600 : 400, minWidth: 0 }}>{q.title}</div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: at.color, background: at.bg, borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap", justifySelf: "start" }}>{q.answerType}</span>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {q.required
                      ? <span style={{ fontSize: 10, fontWeight: 700, color: C.red, background: "#fae5e6", borderRadius: 3, padding: "1px 5px" }}>Yes</span>
                      : <span style={{ fontSize: 10, color: C.g3 }}>—</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <LogicIcons question={q} size={12} />
                  </div>
                </div>

                {/* Trigger preview block */}
                {hasAnyPreview && showLogicPreview && (
                  <div style={{ marginLeft: 60, marginRight: 20, marginBottom: 6, fontFamily: F }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.g5, marginBottom: 5 }}>
                      {q.conditional?.when
                        ? `If ${q.conditional.when}`
                        : (!q.hasAction && !q.hasEscalation) ? "Photo required"
                        : "When flagged"}
                    </div>
                    <div style={{ paddingLeft: 12, display: "flex", flexDirection: "column", gap: 5 }}>
                      {hasActionPreview && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                          <TriggerTip label="Action" color={FEATURE_COLORS.action.color} bg={FEATURE_COLORS.action.bg}>
                            <span style={{ display: "flex", color: FEATURE_COLORS.action.color, marginTop: 1 }}><IconAction size={11} /></span>
                          </TriggerTip>
                          <span style={{ fontSize: 11, color: C.g5, lineHeight: "15px" }}>{q.actionData?.description ?? "Corrective action will be created."}</span>
                        </div>
                      )}
                      {hasConditionalPreview && q.conditional.followUp.map(fq => {
                        const fat = ansTypeColor(fq.answerType);
                        return (
                          <div key={fq.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <TriggerTip label="Conditional" color={FEATURE_COLORS.conditional.color} bg={FEATURE_COLORS.conditional.bg}>
                              <span style={{ display: "flex", color: FEATURE_COLORS.conditional.color }}><IconConditional size={11} /></span>
                            </TriggerTip>
                            <span style={{ fontSize: 11, color: C.g6, lineHeight: "15px", flex: 1, minWidth: 0 }}>{fq.title}</span>
                            <span style={{ fontSize: 9, fontWeight: 600, color: fat.color, background: fat.bg, borderRadius: 3, padding: "1px 5px", whiteSpace: "nowrap", flexShrink: 0 }}>{fq.answerType}</span>
                          </div>
                        );
                      })}
                      {hasEscalationPreview && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                          <TriggerTip label="Escalation" color={FEATURE_COLORS.escalation.color} bg={FEATURE_COLORS.escalation.bg}>
                            <span style={{ display: "flex", color: FEATURE_COLORS.escalation.color, marginTop: 1 }}><IconEscalation size={11} /></span>
                          </TriggerTip>
                          <span style={{ fontSize: 11, color: C.g5, lineHeight: "15px" }}>
                            {q.escalationData
                              ? `${q.escalationData.condition} → Notify: ${q.escalationData.notifyRole}`
                              : "Escalation alert triggered on response."}
                          </span>
                        </div>
                      )}
                      {hasPhotoPreview && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <TriggerTip label="Photo" color={FEATURE_COLORS.photo.color} bg={FEATURE_COLORS.photo.bg}>
                            <span style={{ display: "flex", color: FEATURE_COLORS.photo.color }}><IconPhoto size={11} /></span>
                          </TriggerTip>
                          <span style={{ fontSize: 11, color: C.g5 }}>Photo evidence capture required.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {hasAnyPreview && showLogicPreview && <div style={{ marginBottom: 4, borderBottom: `1px solid ${C.g2}` }} />}
                {hasAnyPreview && !showLogicPreview && <div style={{ borderBottom: `1px solid ${C.g2}` }} />}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.g2}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 12, color: pickedIds.size === 0 ? C.g4 : C.navy, fontFamily: F, fontWeight: pickedIds.size === 0 ? 400 : 500 }}>
            {pickedIds.size === 0 ? "Select at least one question" : pickedIds.size === totalQs ? `All ${totalQs} questions selected` : `${pickedIds.size} of ${totalQs} selected`}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {pickedIds.size > 0 && (
              <button onClick={clearPicked} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontFamily: F, fontWeight: 500, color: C.navy, textDecoration: "underline", padding: 0 }}>
                Deselect all
              </button>
            )}
            <button onClick={onClose} style={{ fontSize: 12, fontWeight: 500, fontFamily: F, color: C.g5, background: C.g1, border: `1px solid ${C.g2}`, borderRadius: 6, padding: "7px 14px", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = C.g2}
              onMouseLeave={e => e.currentTarget.style.background = C.g1}>
              Cancel
            </button>
            <button onClick={handleAdd} disabled={pickedIds.size === 0} style={{
              fontSize: 12, fontWeight: 700, fontFamily: F,
              color: C.white, background: pickedIds.size === 0 ? C.g3 : C.navy,
              border: "none", borderRadius: 6, padding: "7px 16px",
              cursor: pickedIds.size === 0 ? "not-allowed" : "pointer",
            }}
              onMouseEnter={e => { if (pickedIds.size > 0) e.currentTarget.style.background = C.navy2; }}
              onMouseLeave={e => { if (pickedIds.size > 0) e.currentTarget.style.background = C.navy; }}
            >
              {pickedIds.size === totalQs ? "Add all to template" : `Add ${pickedIds.size} to template`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionBankCard({ section, onAdd, onAddPickedAsSection, isSelected, onToggleSelect }) {
  const [hover, setHover] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const catStyle = CAT_COLORS[section.category] ?? { color: C.g5, bg: C.g1 };

  return (
    <>
      {/* Compact card */}
      <div
        draggable="true"
        onDragStart={e => e.dataTransfer.setData("bankItem", JSON.stringify({ type: "bank-section", item: section }))}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: isSelected ? "#f7f9ff" : C.white,
          border: `1px solid ${isSelected ? C.navy : (hover ? C.navy : C.g2)}`,
          borderRadius: 8,
          padding: "12px 14px",
          marginBottom: 8,
          cursor: "grab",
          boxShadow: hover ? "0 2px 8px rgba(0,30,118,0.10)" : "none",
          transition: "border-color 0.12s, box-shadow 0.12s, background 0.12s",
        }}
      >
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 5 }}>
          <div
            onClick={e => { e.stopPropagation(); onToggleSelect(section.id); }}
            style={{
              width: 14, height: 14, borderRadius: 4, flexShrink: 0,
              border: `1.5px solid ${isSelected ? C.navy : C.g3}`,
              background: isSelected ? C.navy : C.white,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", marginTop: 2,
            }}
            title={isSelected ? "Deselect" : "Select"}
          >
            {isSelected && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.g6, fontFamily: F, lineHeight: "17px", marginBottom: 4 }}>{section.name}</div>
            <span style={{ fontSize: 10, fontWeight: 700, color: catStyle.color, background: catStyle.bg, borderRadius: 4, padding: "1px 5px", whiteSpace: "nowrap" }}>{section.category}</span>
          </div>
        </div>

        {/* Description */}
        <div style={{ fontSize: 12, color: C.g4, fontFamily: F, lineHeight: "17px", marginBottom: 8, paddingLeft: 22 }}>
          {section.description}
        </div>

        {/* Bottom row: metadata + action button */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, fontSize: 11, color: C.g4, fontFamily: F, flex: 1, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600, color: C.g5 }}>{section.questionCount} {section.questionCount === 1 ? "question" : "questions"}</span>
            {section.version && <span>v{section.version}</span>}
          </div>
          <button
            onClick={e => { e.stopPropagation(); setModalOpen(true); }}
            style={{
              fontSize: 11, fontWeight: 600, fontFamily: F,
              color: C.navy, background: "none",
              border: `1px solid #c7cff7`, borderRadius: 4, padding: "3px 8px",
              cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              display: "flex", alignItems: "center", gap: 4,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#eef1ff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Preview and Add
          </button>
        </div>
      </div>

      {modalOpen && (
        <SectionPreviewModal
          section={section}
          onClose={() => setModalOpen(false)}
          onAdd={onAdd}
          onAddPickedAsSection={onAddPickedAsSection}
        />
      )}
    </>
  );
}

// ── Question Bank Card ─────────────────────────────────────────────────────────

function QuestionBankCard({ question, onAdd, isSelected, onToggleSelect }) {
  const [hover, setHover] = useState(false);
  const at = ansTypeColor(question.answerType);

  return (
    <div
      draggable="true"
      onDragStart={e => e.dataTransfer.setData("bankItem", JSON.stringify({ type: "bank-question", item: question }))}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px",
        background: isSelected ? "#f0f3ff" : hover ? C.g1 : C.white,
        borderBottom: `1px solid ${C.g2}`,
        cursor: "grab",
        transition: "background 0.1s",
      }}
    >
      <div
        onClick={e => { e.stopPropagation(); onToggleSelect(question.id); }}
        style={{
          width: 14, height: 14, borderRadius: 4, flexShrink: 0,
          border: `1.5px solid ${isSelected ? C.navy : C.g3}`,
          background: isSelected ? C.navy : C.white,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", marginTop: 2,
        }}
        title={isSelected ? "Deselect" : "Select"}
      >
        {isSelected && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: C.g6, fontFamily: F, lineHeight: "17px", marginBottom: 5 }}>
          {question.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          {/* Category + version */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
            {question.category && (() => {
              const cs = CAT_COLORS[question.category] ?? { color: C.g4, bg: C.g1 };
              return <span style={{ fontSize: 9, fontWeight: 600, fontFamily: F, color: cs.color, background: cs.bg, borderRadius: 3, padding: "1px 5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>{question.category}</span>;
            })()}
            {question.version && <span style={{ fontSize: 9, fontFamily: F, color: C.g4, whiteSpace: "nowrap", flexShrink: 0 }}>v{question.version}</span>}
          </div>
          {/* Type + Req + logic */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 9, fontWeight: 600, fontFamily: F, color: at.color, background: at.bg, borderRadius: 3, padding: "1px 5px", whiteSpace: "nowrap" }}>{question.answerType}</span>
            {question.required && <span style={{ fontSize: 9, fontWeight: 600, fontFamily: F, color: C.red, background: "#fae5e6", borderRadius: 3, padding: "1px 5px" }}>Req</span>}
            <LogicIcons question={question} size={10} />
          </div>
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onAdd(question); }}
        style={{
          fontSize: 11, fontWeight: 600, fontFamily: F,
          color: C.navy, background: "none",
          border: `1px solid #c7cff7`, borderRadius: 4, padding: "2px 7px",
          cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, marginTop: 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#eef1ff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
      >Add</button>
    </div>
  );
}

// ── BanksPanel ─────────────────────────────────────────────────────────────────

function OpenCatalogBtn({ onOpen }) {
  const [tip, setTip] = useState(false);
  const timer = useRef(null);
  return (
    <div style={{ position: "relative", marginTop: 10 }}>
      <button
        onClick={onOpen}
        onMouseEnter={() => { timer.current = setTimeout(() => setTip(true), 1000); }}
        onMouseLeave={() => { clearTimeout(timer.current); setTip(false); }}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: C.navy, borderRadius: 6 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      {tip && (
        <div style={{
          position: "absolute", top: "50%", right: "calc(100% + 8px)", transform: "translateY(-50%)",
          background: C.g6, color: C.white, padding: "5px 9px", borderRadius: 6,
          fontSize: 11, fontFamily: F, whiteSpace: "nowrap", pointerEvents: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        }}>
          Open catalog
        </div>
      )}
    </div>
  );
}

export default function BanksPanel({
  sections,
  onAddSectionFromBank,
  onAddQuestionFromBank,
  onAddManySectionsFromBank,
  onAddManyQuestionsFromBank,
  onAddPickedAsSection,
  onToast,
}) {
  const [tab, setTab] = useState("sections"); // "sections" | "questions"
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [selectedLogic, setSelectedLogic] = useState(new Set());
  // Multi-select tracked separately per tab so switching tabs preserves picks
  const [selectedSectionIds, setSelectedSectionIds] = useState(new Set());
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
  const filterBtnRef = useRef(null);
  const [panelWidth, setPanelWidth] = useState(320);
  const dragState = useRef(null);

  const startResize = useCallback(e => {
    e.preventDefault();
    dragState.current = { startX: e.clientX, startWidth: panelWidth };
    function onMove(e) {
      if (!dragState.current) return;
      const delta = dragState.current.startX - e.clientX;
      setPanelWidth(Math.max(280, Math.min(640, dragState.current.startWidth + delta)));
    }
    function onUp() {
      dragState.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [panelWidth]);

  // Filter section bank
  const filteredSections = SECTION_BANK.filter(sec => {
    const q = search.toLowerCase();
    const matchSearch = !q || sec.name.toLowerCase().includes(q) || sec.description.toLowerCase().includes(q) || sec.tags.some(t => t.toLowerCase().includes(q));
    const matchCat = selectedCategories.size === 0 || selectedCategories.has(sec.category);
    const matchTag = selectedTags.size === 0 || sec.tags.some(t => selectedTags.has(t));
    return matchSearch && matchCat && matchTag;
  });

  // Filter question bank
  const filteredQuestions = QUESTION_BANK.filter(q => {
    const sq = search.toLowerCase();
    const matchSearch = !sq || q.title.toLowerCase().includes(sq) || q.tags.some(t => t.toLowerCase().includes(sq));
    const matchTag = selectedTags.size === 0 || q.tags.some(t => selectedTags.has(t));
    const matchLogic = selectedLogic.size === 0 || [...selectedLogic].every(key => q[key]);
    return matchSearch && matchTag && matchLogic;
  });

  const activeFilterCount = selectedCategories.size + selectedTags.size + selectedLogic.size;
  const hasSearch = search.length > 0;

  function toggleSectionSelect(id) {
    setSelectedSectionIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function toggleQuestionSelect(id) {
    setSelectedQuestionIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function clearSelected() {
    if (tab === "sections") setSelectedSectionIds(new Set());
    else setSelectedQuestionIds(new Set());
  }
  function addSelected() {
    if (tab === "sections") {
      const items = SECTION_BANK.filter(s => selectedSectionIds.has(s.id));
      if (items.length > 0 && onAddManySectionsFromBank) onAddManySectionsFromBank(items);
      setSelectedSectionIds(new Set());
    } else {
      const items = QUESTION_BANK.filter(q => selectedQuestionIds.has(q.id));
      if (items.length > 0 && onAddManyQuestionsFromBank) onAddManyQuestionsFromBank(items);
      setSelectedQuestionIds(new Set());
    }
  }

  const selectedCount = tab === "sections" ? selectedSectionIds.size : selectedQuestionIds.size;
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <div style={{
        width: 44,
        flexShrink: 0,
        background: C.white,
        borderLeft: `1px solid ${C.g2}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
      }}>
        <OpenCatalogBtn onOpen={() => setOpen(true)} />
      </div>
    );
  }

  return (
    <div style={{
      width: panelWidth,
      flexShrink: 0,
      background: C.white,
      borderLeft: `1px solid ${C.g2}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      height: "100%",
      position: "relative",
    }}>
      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        title="Drag to resize"
        style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 5,
          cursor: "ew-resize", zIndex: 10, background: "transparent",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,30,118,0.18)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      />
      {/* Header row */}
      <div style={{ padding: "12px 12px 0", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.g6, fontFamily: F, flex: 1 }}>Catalog</span>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: C.g4, borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = C.g6}
          onMouseLeave={e => e.currentTarget.style.color = C.g4}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Tab row */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.g2}`, flexShrink: 0, marginTop: 4 }}>
        {[["sections", "Sections", SECTION_BANK.length], ["questions", "Questions", QUESTION_BANK.length]].map(([key, label, count]) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)} style={{
              fontSize: 12, fontWeight: active ? 600 : 400, fontFamily: F,
              color: active ? C.navy : C.g4,
              background: "none", border: "none",
              borderBottom: active ? `2px solid ${C.navy}` : "2px solid transparent",
              padding: "8px 14px", marginBottom: -1,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
              transition: "color 0.1s",
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = C.g5; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = C.g4; }}
            >
              {label}
              <span style={{
                fontSize: 10, fontWeight: 600, fontFamily: F,
                color: active ? C.navy : C.g4,
                background: C.g1,
                borderRadius: 10, padding: "0 5px",
                lineHeight: "16px",
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search + filter row */}
      <div style={{ padding: "10px 12px 0", display: "flex", gap: 6, flexShrink: 0, position: "relative" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={tab === "sections" ? "Search sections..." : "Search questions..."}
          style={{
            flex: 1,
            fontSize: 12, fontFamily: F, color: C.g6,
            border: `1px solid ${C.g2}`, borderRadius: 8,
            padding: "7px 10px", outline: "none",
            background: C.white, minWidth: 0,
          }}
          onFocus={e => e.currentTarget.style.borderColor = C.navy}
          onBlur={e => e.currentTarget.style.borderColor = C.g2}
        />
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            ref={filterBtnRef}
            onClick={() => setShowFilter(f => !f)}
            title="Filter"
            style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 12, fontWeight: 600, fontFamily: F,
              color: activeFilterCount > 0 ? C.navy : C.g4,
              background: activeFilterCount > 0 ? "#eef1ff" : C.g1,
              border: `1px solid ${activeFilterCount > 0 ? "#c7cff7" : C.g2}`,
              borderRadius: 6, padding: "6px 8px", cursor: "pointer",
            }}
          >
            <IconFunnel />
            {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
          </button>
          {showFilter && (
            <FilterDropdown
              tab={tab}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              selectedLogic={selectedLogic}
              setSelectedLogic={setSelectedLogic}
              onClear={() => { setSelectedCategories(new Set()); setSelectedTags(new Set()); setSelectedLogic(new Set()); }}
              onClose={() => setShowFilter(false)}
            />
          )}
        </div>
      </div>

      {/* Multi-select action bar */}
      {selectedCount > 0 && (
        <div style={{
          margin: "10px 12px 0",
          padding: "7px 10px",
          background: "#eef1ff",
          border: `1px solid #c7cff7`,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, fontFamily: F, flex: 1 }}>
            {selectedCount} selected
          </span>
          <button
            onClick={clearSelected}
            style={{
              fontSize: 12, fontWeight: 500, fontFamily: F,
              color: C.g5, background: "none", border: "none",
              padding: "3px 6px", cursor: "pointer",
            }}
          >Clear</button>
          <button
            onClick={addSelected}
            style={{
              fontSize: 12, fontWeight: 600, fontFamily: F,
              color: C.white, background: C.navy, border: "none",
              borderRadius: 4, padding: "4px 10px", cursor: "pointer",
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.navy2}
            onMouseLeave={e => e.currentTarget.style.background = C.navy}
          >Add {selectedCount}</button>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: tab === "sections" ? "10px 12px" : 0 }}>
        {tab === "sections" && (
          <>
            {filteredSections.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 12px", color: C.g4, fontFamily: F }}>
                {hasSearch || activeFilterCount > 0 ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.g5, marginBottom: 6 }}>No matches.</div>
                    <button
                      onClick={() => { setSearch(""); setSelectedCategories(new Set()); setSelectedTags(new Set()); }}
                      style={{ fontSize: 12, color: C.navy, background: "none", border: "none", cursor: "pointer", fontFamily: F, fontWeight: 500 }}
                    >Clear search</button>
                  </>
                ) : (
                  <div style={{ fontSize: 12, lineHeight: "18px" }}>
                    No saved sections yet. Items added to the Section Bank will appear here.
                  </div>
                )}
              </div>
            ) : (
              filteredSections.map(sec => (
                <SectionBankCard
                  key={sec.id}
                  section={sec}
                  onAdd={onAddSectionFromBank}
                  onAddPickedAsSection={onAddPickedAsSection}
                  isSelected={selectedSectionIds.has(sec.id)}
                  onToggleSelect={toggleSectionSelect}
                />
              ))
            )}
          </>
        )}
        {tab === "questions" && (
          <>
            {filteredQuestions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 12px", color: C.g4, fontFamily: F }}>
                {hasSearch || activeFilterCount > 0 ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.g5, marginBottom: 6 }}>No matches.</div>
                    <button
                      onClick={() => { setSearch(""); setSelectedTags(new Set()); setSelectedLogic(new Set()); }}
                      style={{ fontSize: 12, color: C.navy, background: "none", border: "none", cursor: "pointer", fontFamily: F, fontWeight: 500 }}
                    >Clear search</button>
                  </>
                ) : (
                  <div style={{ fontSize: 12, lineHeight: "18px" }}>
                    No saved questions yet. Items added to the Question Bank will appear here.
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Table header */}
                <div style={{
                  display: "grid", gridTemplateColumns: "20px 1fr 88px 30px 50px 36px",
                  alignItems: "center", padding: "5px 12px",
                  borderBottom: `1px solid ${C.g2}`, background: C.g1,
                  gap: 6, position: "sticky", top: 0, zIndex: 1,
                }}>
                  <div />
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Question</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Type</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Req</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Logic</div>
                  <div />
                </div>

                {filteredQuestions.map(q => {
                  const at = ansTypeColor(q.answerType);
                  const isSel = selectedQuestionIds.has(q.id);
                  const qCatStyle = CAT_COLORS[q.category] ?? { color: C.g4, bg: C.g1 };
                  return (
                    <div key={q.id}>
                      <div
                        draggable="true"
                        onDragStart={e => e.dataTransfer.setData("bankItem", JSON.stringify({ type: "bank-question", item: q }))}
                        onClick={() => toggleQuestionSelect(q.id)}
                        style={{
                          display: "grid", gridTemplateColumns: "20px 1fr 88px 30px 50px 36px",
                          alignItems: "flex-start", gap: 6, padding: "8px 12px",
                          borderBottom: `1px solid ${C.g2}`,
                          background: isSel ? "#f0f3ff" : C.white,
                          cursor: "pointer", transition: "background 0.1s",
                        }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = C.g1; }}
                        onMouseLeave={e => { e.currentTarget.style.background = isSel ? "#f0f3ff" : C.white; }}
                      >
                        <div style={{
                          width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                          border: `1.5px solid ${isSel ? C.navy : C.g3}`,
                          background: isSel ? C.navy : C.white,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {isSel && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
                        </div>
                        <div style={{ fontSize: 11, color: C.g6, fontFamily: F, lineHeight: "15px", minWidth: 0 }}>
                          {q.title}
                          {(q.category || q.version) && (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                              {q.category && <span style={{ fontSize: 9, fontWeight: 600, color: qCatStyle.color, background: qCatStyle.bg, borderRadius: 3, padding: "1px 5px", whiteSpace: "nowrap" }}>{q.category}</span>}
                              {q.version && <span style={{ fontSize: 9, color: C.g4, fontFamily: F }}>v{q.version}</span>}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 600, color: at.color, background: at.bg, borderRadius: 3, padding: "1px 5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", justifySelf: "start", maxWidth: "100%", marginTop: 1 }}>{q.answerType}</span>
                        <div style={{ display: "flex", justifyContent: "center", marginTop: 1 }}>
                          {q.required
                            ? <span style={{ fontSize: 9, fontWeight: 700, color: C.red, background: "#fae5e6", borderRadius: 3, padding: "1px 4px" }}>Yes</span>
                            : <span style={{ fontSize: 9, color: C.g3 }}>—</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginTop: 1 }}>
                          <LogicIcons question={q} size={10} />
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); onAddQuestionFromBank(q); }}
                          style={{
                            fontSize: 10, fontWeight: 600, fontFamily: F,
                            color: C.navy, background: "none",
                            border: `1px solid #c7cff7`, borderRadius: 4, padding: "2px 5px",
                            cursor: "pointer", whiteSpace: "nowrap",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#eef1ff"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                        >Add</button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
