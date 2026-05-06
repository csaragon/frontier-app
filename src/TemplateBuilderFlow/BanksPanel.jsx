import { useState, useRef, useEffect } from "react";

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
  "Yes/No/NA":       { bg: "#ccfbf1", color: "#065f46" },
  "Yes/No":          { bg: "#eff6ff", color: "#1d4ed8" },
  "Pass/Fail":       { bg: "#fff7ed", color: "#9a3412" },
  "Rating Scale":    { bg: "#faf5ff", color: "#6d28d9" },
  "Free Text":       { bg: "#f9fafb", color: "#374151" },
  "Number":          { bg: "#f0fdfa", color: "#0f766e" },
  "Multiple Choice": { bg: "#fefce8", color: "#92400e" },
  "Photo Required":  { bg: "#ecfeff", color: "#0e7490" },
};

function ansTypeColor(v) {
  return ANSWER_TYPE_COLORS[v] ?? { bg: C.g1, color: C.g5 };
}

// ── Stub data ──────────────────────────────────────────────────────────────────

export const SECTION_BANK = [
  { id:"bs-1", name:"Fire Safety Basics", category:"Fire Safety", description:"Core fire safety checks for any retail location.", questionCount:5, updatedAt:"2025-11-02", tags:["safety","inspection"], questions:[
    {id:"bq-s1-1", title:"Are fire extinguishers mounted and accessible?", answerType:"Yes/No/NA", required:true},
    {id:"bq-s1-2", title:"When was the last fire drill?", answerType:"Free Text", required:false},
    {id:"bq-s1-3", title:"Are sprinkler heads unobstructed?", answerType:"Yes/No/NA", required:true},
    {id:"bq-s1-4", title:"Rate the overall fire readiness (1-5)", answerType:"Rating Scale", required:false},
    {id:"bq-s1-5", title:"Upload photo of extinguisher tags", answerType:"Photo Required", required:true},
  ]},
  { id:"bs-2", name:"PPE Compliance Check", category:"PPE Compliance", description:"Verify PPE availability and usage.", questionCount:4, updatedAt:"2025-10-28", tags:["ppe","compliance"], questions:[
    {id:"bq-s2-1", title:"Is PPE available at required stations?", answerType:"Yes/No/NA", required:true},
    {id:"bq-s2-2", title:"Are employees wearing required PPE?", answerType:"Pass/Fail", required:true},
    {id:"bq-s2-3", title:"Note any PPE deficiencies observed", answerType:"Free Text", required:false},
    {id:"bq-s2-4", title:"Take photo of PPE station", answerType:"Photo Required", required:false},
  ]},
  { id:"bs-3", name:"Cash Handling Standards", category:"Cash Handling", description:"Verify cash handling procedures and controls.", questionCount:6, updatedAt:"2025-10-15", tags:["cash","procedure"], questions:[
    {id:"bq-s3-1", title:"Is the safe locked when not in use?", answerType:"Yes/No/NA", required:true},
    {id:"bq-s3-2", title:"Are dual-control procedures followed for cash counts?", answerType:"Yes/No", required:true},
    {id:"bq-s3-3", title:"How many cash drops occurred today?", answerType:"Number", required:false},
    {id:"bq-s3-4", title:"Are register funds within expected variance?", answerType:"Pass/Fail", required:true},
    {id:"bq-s3-5", title:"Describe any cash handling concerns", answerType:"Free Text", required:false},
    {id:"bq-s3-6", title:"Rate cash handling compliance", answerType:"Rating Scale", required:false},
  ]},
  { id:"bs-4", name:"Slip & Trip Hazards", category:"Health & Safety", description:"Assess floor conditions and slip/trip risks.", questionCount:4, updatedAt:"2025-09-30", tags:["safety","retail"], questions:[
    {id:"bq-s4-1", title:"Are all aisles free of obstructions?", answerType:"Yes/No/NA", required:true},
    {id:"bq-s4-2", title:"Are wet floor signs present where needed?", answerType:"Yes/No/NA", required:true},
    {id:"bq-s4-3", title:"Rate overall floor safety", answerType:"Rating Scale", required:false},
    {id:"bq-s4-4", title:"Photo evidence of hazard areas", answerType:"Photo Required", required:false},
  ]},
  { id:"bs-5", name:"Emergency Exits", category:"Health & Safety", description:"Verify emergency exit compliance.", questionCount:3, updatedAt:"2025-09-18", tags:["safety","compliance","inspection"], questions:[
    {id:"bq-s5-1", title:"Are all emergency exits unobstructed?", answerType:"Yes/No/NA", required:true},
    {id:"bq-s5-2", title:"Do emergency doors open outward?", answerType:"Pass/Fail", required:true},
    {id:"bq-s5-3", title:"Are exit signs illuminated?", answerType:"Yes/No/NA", required:true},
  ]},
  { id:"bs-6", name:"Chemical Storage", category:"OSHA Compliance", description:"Check chemical storage and SDS compliance.", questionCount:4, updatedAt:"2025-08-22", tags:["compliance","procedure","hazmat"], questions:[
    {id:"bq-s6-1", title:"Are chemicals stored in approved containers?", answerType:"Yes/No/NA", required:true},
    {id:"bq-s6-2", title:"Is the SDS binder current and accessible?", answerType:"Yes/No", required:true},
    {id:"bq-s6-3", title:"Are hazmat storage areas properly labeled?", answerType:"Pass/Fail", required:true},
    {id:"bq-s6-4", title:"Photo of chemical storage area", answerType:"Photo Required", required:false},
  ]},
];

export const QUESTION_BANK = [
  {id:"bq-1",  title:"Are all fire extinguishers accessible?",               answerType:"Yes/No/NA",       tags:["safety","inspection"]},
  {id:"bq-2",  title:"Rate overall store cleanliness (1–5)",                 answerType:"Rating Scale",    tags:["retail","compliance"]},
  {id:"bq-3",  title:"Are employees wearing required PPE?",                  answerType:"Pass/Fail",       tags:["ppe","safety"]},
  {id:"bq-4",  title:"Describe any safety concerns observed",               answerType:"Free Text",       tags:["safety"]},
  {id:"bq-5",  title:"Number of employees on floor during inspection",       answerType:"Number",          tags:["retail"]},
  {id:"bq-6",  title:"Select areas inspected today",                         answerType:"Multiple Choice", tags:["inspection"]},
  {id:"bq-7",  title:"Is the safe secured when not in use?",                 answerType:"Yes/No",          tags:["cash","procedure"]},
  {id:"bq-8",  title:"Upload photo of current floor conditions",             answerType:"Photo Required",  tags:["retail","inspection"]},
  {id:"bq-9",  title:"Are aisle end-caps free of hazards?",                  answerType:"Yes/No/NA",       tags:["safety","retail"]},
  {id:"bq-10", title:"Rate emergency preparedness readiness",                answerType:"Rating Scale",    tags:["safety","compliance"]},
  {id:"bq-11", title:"Is the first aid kit fully stocked?",                  answerType:"Yes/No/NA",       tags:["safety"]},
  {id:"bq-12", title:"Are break room food storage rules followed?",          answerType:"Pass/Fail",       tags:["compliance"]},
  {id:"bq-13", title:"How many incidents reported this week?",               answerType:"Number",          tags:["safety"]},
  {id:"bq-14", title:"Are security cameras functional and unobstructed?",    answerType:"Yes/No/NA",       tags:["safety","compliance"]},
  {id:"bq-15", title:"Asset tag verification complete?",                     answerType:"Yes/No",          tags:["compliance","procedure"]},
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

function IconSidebar() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
}
function IconFunnel() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}
function IconSection() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="5" rx="1"/><rect x="3" y="17" width="18" height="5" rx="1"/></svg>;
}
function IconQuestion() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function IconGrip() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <circle cx="9"  cy="6"  r="1.4" fill="currentColor"/>
      <circle cx="9"  cy="12" r="1.4" fill="currentColor"/>
      <circle cx="9"  cy="18" r="1.4" fill="currentColor"/>
      <circle cx="15" cy="6"  r="1.4" fill="currentColor"/>
      <circle cx="15" cy="12" r="1.4" fill="currentColor"/>
      <circle cx="15" cy="18" r="1.4" fill="currentColor"/>
    </svg>
  );
}

// ── Filter Dropdown ────────────────────────────────────────────────────────────

function FilterDropdown({ tab, selectedCategories, setSelectedCategories, selectedTags, setSelectedTags, onClear, onClose }) {
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

  const hasActiveFilters = selectedCategories.size > 0 || selectedTags.size > 0;

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
      <div style={{ padding: tab === "sections" ? "0 12px 10px" : "10px 12px" }}>
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

function SectionBankCard({ section, onAdd, isSelected, onToggleSelect }) {
  const [hover, setHover] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const catStyle = CAT_COLORS[section.category] ?? { color: C.g5, bg: C.g1 };

  return (
    <div
      draggable="true"
      onDragStart={e => e.dataTransfer.setData("bankItem", JSON.stringify({ type: "bank-section", item: section }))}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: isSelected ? "#f7f9ff" : C.white,
        border: `1px solid ${isSelected ? C.navy : (hover ? C.navy : C.g2)}`,
        borderRadius: 8,
        padding: "10px 12px",
        marginBottom: 8,
        cursor: "grab",
        boxShadow: hover ? "0 2px 8px rgba(0,30,118,0.10)" : "none",
        transition: "border-color 0.12s, box-shadow 0.12s, background 0.12s",
        position: "relative",
      }}
    >
      {/* Top row: checkbox + name + category pill + add button */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
        <div
          onClick={e => { e.stopPropagation(); onToggleSelect(section.id); }}
          style={{
            width: 14, height: 14, borderRadius: 4, flexShrink: 0,
            border: `1.5px solid ${isSelected ? C.navy : C.g3}`,
            background: isSelected ? C.navy : C.white,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", marginTop: 1,
          }}
          title={isSelected ? "Deselect" : "Select"}
        >
          {isSelected && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.g6, fontFamily: F, lineHeight: "16px" }}>{section.name}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: catStyle.color, background: catStyle.bg, borderRadius: 4, padding: "1px 5px", whiteSpace: "nowrap", flexShrink: 0 }}>{section.category}</span>
          </div>
          <div style={{ fontSize: 12, color: C.g4, fontFamily: F, marginTop: 2 }}>
            {section.questionCount} {section.questionCount === 1 ? "question" : "questions"}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onAdd(section); }}
          style={{
            fontSize: 12, fontWeight: 600, fontFamily: F,
            color: C.navy, background: "none",
            border: `1px solid #c7cff7`, borderRadius: 4, padding: "2px 8px",
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#eef1ff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
        >+ Add</button>
      </div>
      {/* Description */}
      <div style={{ fontSize: 12, color: C.g4, fontFamily: F, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingLeft: 22, marginBottom: 6 }}>
        {section.description}
      </div>
      {/* Preview toggle */}
      <button
        onClick={e => { e.stopPropagation(); setPreviewOpen(p => !p); }}
        style={{
          fontSize: 12, color: C.navy, background: "none", border: "none",
          padding: "0 0 0 22px", cursor: "pointer", fontFamily: F, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 4,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: previewOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.12s" }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        {previewOpen ? "Hide questions" : "Preview questions"}
      </button>
      {previewOpen && section.questions && (
        <div style={{ marginTop: 8, marginLeft: 22, paddingLeft: 10, borderLeft: `2px solid ${C.g2}` }}>
          {section.questions.map(q => {
            const at = ansTypeColor(q.answerType);
            return (
              <div key={q.id} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, fontFamily: F,
                  color: at.color, background: at.bg,
                  borderRadius: 4, padding: "1px 4px",
                  flexShrink: 0, marginTop: 1, whiteSpace: "nowrap",
                }}>{q.answerType}</span>
                <span style={{ fontSize: 12, color: C.g5, fontFamily: F, lineHeight: "15px" }}>
                  {q.title}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {/* Last updated */}
      <div style={{ fontSize: 12, color: C.g3, fontFamily: F, paddingLeft: 22, marginTop: 4 }}>
        {formatDate(section.updatedAt)}
      </div>
    </div>
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
        background: isSelected ? "#f7f9ff" : C.white,
        border: `1px solid ${isSelected ? C.navy : (hover ? C.navy : C.g2)}`,
        borderRadius: 8,
        padding: "9px 12px",
        marginBottom: 6,
        cursor: "grab",
        boxShadow: hover ? "0 2px 8px rgba(0,30,118,0.10)" : "none",
        transition: "border-color 0.12s, box-shadow 0.12s, background 0.12s",
      }}
    >
      {/* Top row: checkbox + answer type + add button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, minWidth: 0 }}>
          <div
            onClick={e => { e.stopPropagation(); onToggleSelect(question.id); }}
            style={{
              width: 14, height: 14, borderRadius: 4, flexShrink: 0,
              border: `1.5px solid ${isSelected ? C.navy : C.g3}`,
              background: isSelected ? C.navy : C.white,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
            title={isSelected ? "Deselect" : "Select"}
          >
            {isSelected && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, fontFamily: F, color: at.color, background: at.bg, borderRadius: 4, padding: "1px 5px" }}>{question.answerType}</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onAdd(question); }}
          style={{
            fontSize: 12, fontWeight: 600, fontFamily: F,
            color: C.navy, background: "none",
            border: `1px solid #c7cff7`, borderRadius: 4, padding: "2px 8px",
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#eef1ff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
        >+ Add</button>
      </div>
      {/* Title */}
      <div style={{
        fontSize: 12, color: C.g6, fontFamily: F, lineHeight: "17px",
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        marginBottom: 5,
        paddingLeft: 21,
      }}>
        {question.title}
      </div>
      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingLeft: 21 }}>
          {question.tags.map(tag => (
            <span key={tag} style={{ fontSize: 10, fontFamily: F, color: C.g4, background: C.g1, borderRadius: 4, padding: "1px 5px" }}>{tag}</span>
          ))}
        </div>
      )}
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
  onToast,
}) {
  const [tab, setTab] = useState("sections"); // "sections" | "questions"
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedTags, setSelectedTags] = useState(new Set());
  // Multi-select tracked separately per tab so switching tabs preserves picks
  const [selectedSectionIds, setSelectedSectionIds] = useState(new Set());
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
  const filterBtnRef = useRef(null);

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
    return matchSearch && matchTag;
  });

  const activeFilterCount = selectedCategories.size + selectedTags.size;
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
      width: 320,
      flexShrink: 0,
      background: C.white,
      borderLeft: `1px solid ${C.g2}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      height: "100%",
    }}>
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
      <div style={{ display: "flex", padding: "8px 12px 0", gap: 2, flexShrink: 0, borderBottom: `1px solid ${C.g2}`, marginTop: 4 }}>
        {[["sections", "Sections"], ["questions", "Questions"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            fontSize: 12, fontWeight: 600, fontFamily: F,
            color: tab === key ? C.navy : C.g4,
            background: "none", border: "none",
            borderBottom: tab === key ? `2px solid ${C.navy}` : "2px solid transparent",
            padding: "4px 8px 8px",
            cursor: "pointer",
            marginBottom: -1,
          }}>{label}</button>
        ))}
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
              onClear={() => { setSelectedCategories(new Set()); setSelectedTags(new Set()); }}
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
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
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
                      onClick={() => { setSearch(""); setSelectedTags(new Set()); }}
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
              filteredQuestions.map(q => (
                <QuestionBankCard
                  key={q.id}
                  question={q}
                  onAdd={onAddQuestionFromBank}
                  isSelected={selectedQuestionIds.has(q.id)}
                  onToggleSelect={toggleQuestionSelect}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
