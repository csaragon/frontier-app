import { useState, useRef, useEffect } from "react";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { featureFlags } from "./shared.js";
import QuestionEditor from "./QuestionEditor.jsx";
import BanksPanel from "./BanksPanel.jsx";
import GridSection from "./GridSection.jsx";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy: "#001e76", navy2: "#001356",
  white: "#ffffff",
  g1: "#f4f4f6", g2: "#e2e5e9", g3: "#c3c8d0", g4: "#8692a2", g5: "#555f6d", g6: "#16191d",
  amber: "#b45309", amberBg: "#fffbeb",
  red: "#b6143a",
  teal: "#0f766e",
  purple: "#7c3aed", purpleLt: "#f5f3ff", purpleMd: "#ede9fe",
};

const ANSWER_TYPES = [
  { value: "Yes/No/NA",       bg: "#ecfdf5", color: "#065f46" },
  { value: "Yes/No",          bg: "#eff6ff", color: "#1d4ed8" },
  { value: "Pass/Fail",       bg: "#fff7ed", color: "#9a3412" },
  { value: "Rating Scale",    bg: "#faf5ff", color: "#6d28d9" },
  { value: "Free Text",       bg: "#f9fafb", color: "#374151" },
  { value: "Number",          bg: "#f0fdfa", color: "#0f766e" },
  { value: "Multiple Choice", bg: "#fefce8", color: "#92400e" },
  { value: "Grid",            bg: "#f0f2ff", color: "#1e40af" },
  { value: "Asset",           bg: "#fff1f2", color: "#9f1239" },
  { value: "Photo Required",  bg: "#ecfeff", color: "#0e7490" },
];

const DEFAULT_SECTIONS = [
  {
    id: "sec-1", name: "Fire Safety", weight: 40, collapsed: false, isGrid: false, gridData: null,
    questions: [
      { id: "q-1", title: "Are all fire extinguishers properly mounted and accessible?", answerType: "Yes/No/NA",   required: true,  informational: false, critical: false, typeConfig: {}, inBank: false, scoring: {}, media: {}, action: { type: "none" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } },
      { id: "q-2", title: "When was the last fire drill conducted?",                    answerType: "Free Text",   required: false, informational: true,  critical: false, typeConfig: {}, inBank: false, scoring: {}, media: {}, action: { type: "none" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } },
      { id: "q-3", title: "How many exits are marked with illuminated signage?",        answerType: "Number",      required: true,  informational: false, critical: false, typeConfig: {}, inBank: false, scoring: {}, media: {}, action: { type: "none" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } },
      { id: "q-4", title: "Describe any fire safety concerns observed during this visit.", answerType: "Free Text", required: false, informational: false, critical: false, typeConfig: {}, inBank: false, scoring: {}, media: {}, action: { type: "none" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } },
    ],
  },
  {
    id: "sec-2", name: "Emergency Exits", weight: 35, collapsed: false, isGrid: false, gridData: null,
    questions: [
      { id: "q-5", title: "Are all emergency exits unobstructed and accessible?", answerType: "Yes/No/NA",   required: true,  informational: false, critical: false, typeConfig: {}, inBank: false, scoring: {}, media: {}, action: { type: "none" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } },
      { id: "q-6", title: "Do emergency exit doors open outward?",                answerType: "Pass/Fail",   required: true,  informational: false, critical: false, typeConfig: {}, inBank: false, scoring: {}, media: {}, action: { type: "none" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } },
      { id: "q-7", title: "Rate the overall emergency exit compliance.",           answerType: "Rating Scale", required: false, informational: false, critical: false, typeConfig: {}, inBank: false, scoring: {}, media: {}, action: { type: "none" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } },
    ],
  },
  {
    id: "sec-3", name: "Chemical Storage", weight: 25, collapsed: false, isGrid: false, gridData: null,
    questions: [
      { id: "q-8", title: "Are all chemicals stored in approved containers with proper labeling?", answerType: "Yes/No/NA", required: true,  informational: false, critical: false, typeConfig: {}, inBank: false, scoring: {}, media: {}, action: { type: "none" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } },
      { id: "q-9", title: "Is the MSDS / SDS binder current and accessible to all employees?",    answerType: "Yes/No",    required: true,  informational: false, critical: false, typeConfig: {}, inBank: false, scoring: {}, media: {}, action: { type: "none" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } },
    ],
  },
];

let _uid = 0;
function genId(prefix) { return `${prefix}-${Date.now()}-${++_uid}`; }
function ansTypeMeta(v) { return ANSWER_TYPES.find(t => t.value === v) ?? ANSWER_TYPES[5]; }
function findContainer(id, secs) {
  if (secs.find(s => s.id === id)) return id;
  for (const s of secs) { if (s.questions.find(q => q.id === id)) return s.id; }
  return null;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconGrip() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="9"  cy="6"  r="1.4" fill="currentColor"/>
      <circle cx="9"  cy="12" r="1.4" fill="currentColor"/>
      <circle cx="9"  cy="18" r="1.4" fill="currentColor"/>
      <circle cx="15" cy="6"  r="1.4" fill="currentColor"/>
      <circle cx="15" cy="12" r="1.4" fill="currentColor"/>
      <circle cx="15" cy="18" r="1.4" fill="currentColor"/>
    </svg>
  );
}
function IconChevRight() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function IconChevDown() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function IconPlus({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IconDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5"  r="1.4" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.4" fill="currentColor"/>
      <circle cx="12" cy="19" r="1.4" fill="currentColor"/>
    </svg>
  );
}
function IconRows() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function IconGrid() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function IconSidebar() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
}
function IconClose() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IconWarn() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

// ── Small shared atoms ────────────────────────────────────────────────────────

function AnswerBadge({ value }) {
  const m = ansTypeMeta(value);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", background: m.bg, color: m.color, fontSize: 11, fontWeight: 600, fontFamily: F, borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap" }}>
      {value}
    </span>
  );
}

function SmallBadge({ label, bg, color }) {
  return <span style={{ fontSize: 11, fontWeight: 600, fontFamily: F, background: bg, color, borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap" }}>{label}</span>;
}

function Checkbox({ checked }) {
  return (
    <div style={{ width: 15, height: 15, borderRadius: 4, flexShrink: 0, border: `1.5px solid ${checked ? C.navy : C.g3}`, background: checked ? C.navy : C.white, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.1s, border-color 0.1s" }}>
      {checked && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 32, height: 18, borderRadius: 9, flexShrink: 0, background: checked ? C.navy : C.g3, position: "relative", cursor: "pointer", transition: "background 0.15s" }}>
      <div style={{ position: "absolute", top: 2, left: checked ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: C.white, transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }}/>
    </div>
  );
}

// QuestionEditorModal replaced by QuestionEditor imported from ./QuestionEditor.jsx

// ── Fix Math Modal ────────────────────────────────────────────────────────────

function FixMathModal({ sections, onAutoBalance, onClose }) {
  const total = sections.reduce((s, sec) => s + Number(sec.weight ?? 0), 0);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, fontFamily: F }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.white, borderRadius: 12, width: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.g6 }}>Fix Section Weights</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, padding: 4, display: "flex", alignItems: "center" }}>
            <IconClose />
          </button>
        </div>
        <div style={{ padding: "14px 20px 20px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: C.g5, lineHeight: "19px" }}>
            Section weights must total <strong>100%</strong>. Currently totaling <strong style={{ color: C.amber }}>{total}%</strong>.
          </p>
          {sections.map(s => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: C.g5, borderBottom: `1px solid ${C.g2}` }}>
              <span>{s.name}</span>
              <span style={{ fontWeight: 600, color: C.g6 }}>{s.weight ?? 0}%</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0", fontSize: 13, fontWeight: 700, color: Math.round(total) === 100 ? C.teal : C.amber }}>
            <span>Total</span><span>{total}%</span>
          </div>
        </div>
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.g2}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.g3}`, borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onAutoBalance} style={{ background: C.navy, color: C.white, border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = C.navy2} onMouseLeave={e => e.currentTarget.style.background = C.navy}
          >Auto-balance</button>
        </div>
      </div>
    </div>
  );
}

// ── Kebab Menu ────────────────────────────────────────────────────────────────

function KebabMenu({ onRename, onDuplicate, onDelete, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const item = (label, onClick, danger = false) => (
    <button key={label} onClick={() => { onClick(); onClose(); }}
      style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "7px 14px", fontSize: 13, fontWeight: 500, fontFamily: F, color: danger ? C.red : C.g6, cursor: "pointer" }}
      onMouseEnter={e => e.currentTarget.style.background = C.g1}
      onMouseLeave={e => e.currentTarget.style.background = "none"}
    >{label}</button>
  );

  return (
    <div ref={ref} style={{ position: "absolute", top: "100%", right: 0, zIndex: 200, background: C.white, borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.14)", border: `1px solid ${C.g2}`, minWidth: 140, overflow: "hidden", marginTop: 4 }}>
      {item("Rename", onRename)}
      {item("Duplicate", onDuplicate)}
      <div style={{ height: 1, background: C.g2 }}/>
      {item("Delete", onDelete, true)}
    </div>
  );
}

// ── Question Row ──────────────────────────────────────────────────────────────

function SortableQuestionRow({ question, isSelected, onSelect, onClick, viewMode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }}>
      <QuestionRow question={question} isSelected={isSelected} onSelect={onSelect} onClick={onClick} viewMode={viewMode} dragProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function QuestionIndicatorIcons({ question }) {
  return (
    <>
      {question.action?.type && question.action.type !== "none" && (
        <span title="Has action" style={{ display: "flex", color: "#b45309" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </span>
      )}
      {(question.conditional?.items?.length ?? 0) > 0 && (
        <span title="Has conditional logic" style={{ display: "flex", color: "#7c3aed" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
        </span>
      )}
      {(question.escalation?.rules?.length ?? 0) > 0 && (
        <span title="Has escalation" style={{ display: "flex", color: "#b6143a" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
        </span>
      )}
      {question.media?.requireOnFail && (
        <span title="Photo required on fail" style={{ display: "flex", color: "#0369a1" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </span>
      )}
    </>
  );
}

function QuestionRow({ question, isSelected, onSelect, onClick, viewMode, dragProps = {} }) {
  const [hover, setHover] = useState(false);

  if (viewMode === "grid") {
    return (
      <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ background: isSelected ? "#f0f2ff" : hover ? "#f8f9fb" : C.white, border: `1px solid ${isSelected ? "#c7ccff" : C.g2}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer", transition: "background 0.1s", display: "flex", flexDirection: "column", gap: 6 }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
          <div onClick={e => { e.stopPropagation(); onSelect(); }} style={{ flexShrink: 0, marginTop: 1 }}><Checkbox checked={isSelected} /></div>
          <span style={{ fontSize: 12, color: C.g6, fontFamily: F, lineHeight: "17px", flex: 1 }}>{question.title}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingLeft: 20, alignItems: "center" }}>
          <AnswerBadge value={question.answerType} />
          {question.required      && <SmallBadge label="Required"   bg="#fef2f2" color={C.red} />}
          {question.informational && <SmallBadge label="Info only"  bg="#f0f9ff" color="#0369a1" />}
          <QuestionIndicatorIcons question={question} />
        </div>
      </div>
    );
  }

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: isSelected ? "#f0f2ff" : hover ? "#f8f9fb" : C.white, borderRadius: 6, transition: "background 0.1s", borderBottom: `1px solid ${C.g1}` }}
    >
      <div {...dragProps} style={{ color: hover ? C.g4 : C.g3, cursor: "grab", flexShrink: 0, display: "flex", alignItems: "center", touchAction: "none" }}>
        <IconGrip />
      </div>
      <div onClick={e => { e.stopPropagation(); onSelect(); }} style={{ flexShrink: 0 }}><Checkbox checked={isSelected} /></div>
      <span onClick={onClick} style={{ flex: 1, fontSize: 13, color: C.g6, fontFamily: F, lineHeight: "18px", cursor: "pointer" }}>{question.title}</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
        <AnswerBadge value={question.answerType} />
        {question.required      && <SmallBadge label="Required"  bg="#fef2f2" color={C.red} />}
        {question.informational && <SmallBadge label="Info only" bg="#f0f9ff" color="#0369a1" />}
        <QuestionIndicatorIcons question={question} />
      </div>
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SortableSectionCard(props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.section.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1 }}>
      <SectionCard {...props} dragProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

// Grid toggle button icon (4 squares)
function IconGrid4() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
}

function SectionCard({ section, isWeighted, selectedQs, onSelectQ, onEditQ, onAddQ, viewMode, onToggleCollapse, onWeightChange, onRename, onDuplicate, onDelete, onToggleGrid, onUpdateGrid, methodology, dragProps = {} }) {
  const [showKebab, setShowKebab]       = useState(false);
  const [editingName, setEditingName]   = useState(false);
  const [nameVal, setNameVal]           = useState(section.name);
  const [weightVal, setWeightVal]       = useState(String(section.weight ?? 0));

  useEffect(() => { setNameVal(section.name); }, [section.name]);
  useEffect(() => { setWeightVal(String(section.weight ?? 0)); }, [section.weight]);

  function commitName() {
    const t = nameVal.trim();
    if (t && t !== section.name) onRename(t); else setNameVal(section.name);
    setEditingName(false);
  }

  const qCount = section.isGrid ? 1 : section.questions.length;
  const qLabel = section.isGrid ? "1 question (grid)" : `${qCount} ${qCount === 1 ? "question" : "questions"}`;

  return (
    <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 10, marginBottom: 10, overflow: "visible" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: section.collapsed ? "none" : `1px solid ${C.g2}`, position: "relative" }}>
        <div {...dragProps} style={{ color: C.g3, cursor: "grab", flexShrink: 0, display: "flex", alignItems: "center", touchAction: "none" }}
          onMouseEnter={e => e.currentTarget.style.color = C.g4} onMouseLeave={e => e.currentTarget.style.color = C.g3}
        ><IconGrip /></div>

        <button onClick={onToggleCollapse} style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, display: "flex", alignItems: "center", padding: 2, borderRadius: 4, flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = C.g6} onMouseLeave={e => e.currentTarget.style.color = C.g4}
        >{section.collapsed ? <IconChevRight /> : <IconChevDown />}</button>

        {editingName ? (
          <input value={nameVal} onChange={e => setNameVal(e.target.value)} onBlur={commitName}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); commitName(); } if (e.key === "Escape") { setNameVal(section.name); setEditingName(false); } }}
            autoFocus style={{ flex: 1, fontSize: 14, fontWeight: 700, color: C.g6, fontFamily: F, border: `1px solid ${C.navy}`, borderRadius: 5, padding: "3px 7px", outline: "none", background: C.white }}
          />
        ) : (
          <span onClick={() => setEditingName(true)} title="Click to rename"
            style={{ fontSize: 14, fontWeight: 700, color: C.g6, fontFamily: F, flex: 1, cursor: "text" }}
          >{section.name}</span>
        )}

        {/* Question count badge */}
        <span style={{ fontSize: 11, fontWeight: 600, color: C.g4, fontFamily: F, background: C.g1, borderRadius: 10, padding: "2px 8px", flexShrink: 0 }}>
          {qLabel}
        </span>

        {/* Grid badge when active */}
        {section.isGrid && (
          <span style={{ fontSize: 10, fontWeight: 700, fontFamily: F, color: "#1e40af", background: "#f0f2ff", borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>
            Grid
          </span>
        )}

        {/* Grid toggle button */}
        <button
          onClick={() => onToggleGrid(section.id)}
          title={section.isGrid ? "Switch to question list" : "Switch to grid section"}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 11, fontWeight: 600, fontFamily: F,
            color: section.isGrid ? C.navy : C.g4,
            background: section.isGrid ? "#eef1ff" : "none",
            border: section.isGrid ? `1px solid #c7cff7` : `1px dashed ${C.g3}`,
            borderRadius: 5, padding: "2px 8px", cursor: "pointer", flexShrink: 0,
          }}
          onMouseEnter={e => { if (!section.isGrid) { e.currentTarget.style.borderColor = C.navy; e.currentTarget.style.color = C.navy; } }}
          onMouseLeave={e => { if (!section.isGrid) { e.currentTarget.style.borderColor = C.g3; e.currentTarget.style.color = C.g4; } }}
        >
          <IconGrid4 />
          Grid
        </button>

        {isWeighted && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <input type="number" value={weightVal} onChange={e => setWeightVal(e.target.value)}
              onBlur={() => {
                const v = Number(weightVal);
                if (!isNaN(v) && v >= 0 && v <= 100) onWeightChange(v);
                else setWeightVal(String(section.weight ?? 0));
              }}
              min={0} max={100}
              style={{ width: 50, textAlign: "center", fontSize: 13, fontFamily: F, color: C.g6, border: `1px solid ${C.g3}`, borderRadius: 5, padding: "3px 6px", outline: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = C.navy}
              onBlur2={e => e.currentTarget.style.borderColor = C.g3}
            />
            <span style={{ fontSize: 12, color: C.g4, fontFamily: F }}>%</span>
          </div>
        )}

        <div style={{ position: "relative", flexShrink: 0 }}>
          <button onClick={() => setShowKebab(k => !k)}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, display: "flex", alignItems: "center", padding: 4, borderRadius: 5 }}
            onMouseEnter={e => { e.currentTarget.style.background = C.g1; e.currentTarget.style.color = C.g6; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.g4; }}
          ><IconDots /></button>
          {showKebab && (
            <KebabMenu
              onRename={() => setEditingName(true)}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onClose={() => setShowKebab(false)}
            />
          )}
        </div>
      </div>

      {/* Body */}
      {!section.collapsed && (
        <div style={{ padding: "8px 12px 8px" }}>
          {section.isGrid ? (
            /* Grid editor */
            <GridSection
              section={section}
              methodology={methodology}
              onUpdate={(gridData) => onUpdateGrid(section.id, gridData)}
              onToggleOff={() => onToggleGrid(section.id)}
            />
          ) : (
            /* Normal question list */
            <>
              <SortableContext items={section.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                {viewMode === "grid" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: section.questions.length > 0 ? 8 : 0 }}>
                    {section.questions.map(q => (
                      <SortableQuestionRow key={q.id} question={q} isSelected={selectedQs.has(q.id)} onSelect={() => onSelectQ(q.id)} onClick={() => onEditQ(q)} viewMode="grid" />
                    ))}
                  </div>
                ) : (
                  <div style={{ marginBottom: section.questions.length > 0 ? 6 : 0 }}>
                    {section.questions.map(q => (
                      <SortableQuestionRow key={q.id} question={q} isSelected={selectedQs.has(q.id)} onSelect={() => onSelectQ(q.id)} onClick={() => onEditQ(q)} viewMode="row" />
                    ))}
                  </div>
                )}
              </SortableContext>

              <button onClick={() => onAddQ(section.id)}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px dashed ${C.g3}`, borderRadius: 6, padding: "6px 12px", width: "100%", fontSize: 12, fontWeight: 500, color: C.g4, fontFamily: F, cursor: "pointer", transition: "color 0.1s, border-color 0.1s" }}
                onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
              ><IconPlus size={12} /> Add question</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── LeftRail replaced by BanksPanel (imported from ./BanksPanel.jsx) ──────────

// ── Add Section Inline ────────────────────────────────────────────────────────

function AddSectionInline({ value, onChange, onConfirm, onCancel }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder="Section name…" autoFocus
        onKeyDown={e => { if (e.key === "Enter") onConfirm(); if (e.key === "Escape") onCancel(); }}
        style={{ flex: 1, fontFamily: F, fontSize: 13, color: C.g6, border: `1px solid ${C.navy}`, borderRadius: 7, padding: "8px 12px", outline: "none", background: C.white }}
      />
      <button onClick={onConfirm} disabled={!value.trim()}
        style={{ background: value.trim() ? C.navy : C.g2, color: value.trim() ? C.white : C.g4, border: "none", borderRadius: 7, padding: "8px 14px", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: value.trim() ? "pointer" : "not-allowed" }}
      >Add</button>
      <button onClick={onCancel}
        style={{ background: "none", border: `1px solid ${C.g3}`, borderRadius: 7, padding: "8px 14px", fontSize: 13, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer" }}
      >Cancel</button>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3000); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "#16191d", color: "#fff", padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: F, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.20)", pointerEvents: "none" }}>
      {message}
    </div>
  );
}

// ── Bank Reuse Modal ──────────────────────────────────────────────────────────

function BankReuseModal({ bankSection, onConfirm, onClose }) {
  const [selectedQIds, setSelectedQIds] = useState(new Set(bankSection.questions.map(q => q.id)));

  function toggle(id) {
    setSelectedQIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function selectAll() { setSelectedQIds(new Set(bankSection.questions.map(q => q.id))); }
  function deselectAll() { setSelectedQIds(new Set()); }

  const selectedQuestions = bankSection.questions.filter(q => selectedQIds.has(q.id));

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, fontFamily: F }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.white, borderRadius: 12, width: 480, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.g6 }}>Add section from bank</div>
            <div style={{ fontSize: 12, color: C.g4, marginTop: 2 }}>
              <strong style={{ color: C.g6 }}>{bankSection.name}</strong> — choose which questions to include
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, padding: 4, display: "flex", alignItems: "center" }}>
            <IconClose />
          </button>
        </div>
        {/* Select all / deselect all */}
        <div style={{ padding: "10px 20px 0", display: "flex", gap: 12, flexShrink: 0 }}>
          <button onClick={selectAll} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.navy, fontFamily: F, fontWeight: 500, padding: 0 }}>Select all</button>
          <button onClick={deselectAll} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.g4, fontFamily: F, fontWeight: 500, padding: 0 }}>Deselect all</button>
          <span style={{ marginLeft: "auto", fontSize: 12, color: C.g4, fontFamily: F }}>{selectedQIds.size} of {bankSection.questions.length} selected</span>
        </div>
        {/* Question list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px" }}>
          {bankSection.questions.map(q => {
            const checked = selectedQIds.has(q.id);
            return (
              <label key={q.id}
                style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.g1}`, cursor: "pointer" }}
              >
                <div
                  onClick={() => toggle(q.id)}
                  style={{
                    width: 15, height: 15, borderRadius: 4, flexShrink: 0, marginTop: 2,
                    border: `1.5px solid ${checked ? C.navy : C.g3}`,
                    background: checked ? C.navy : C.white,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {checked && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
                </div>
                <div onClick={() => toggle(q.id)} style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.g6, fontFamily: F, lineHeight: "18px" }}>{q.title}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, fontFamily: F, color: C.g4, background: C.g1, borderRadius: 4, padding: "1px 5px" }}>{q.answerType}</span>
                    {q.required && <span style={{ fontSize: 10, fontWeight: 600, fontFamily: F, color: "#b6143a", background: "#fef2f2", borderRadius: 4, padding: "1px 5px" }}>Required</span>}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.g2}`, display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ background: "none", border: `1px solid ${C.g3}`, borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer" }}
          >Cancel</button>
          <button
            onClick={() => { if (selectedQuestions.length > 0) onConfirm(selectedQuestions); }}
            disabled={selectedQuestions.length === 0}
            style={{
              background: selectedQuestions.length > 0 ? C.navy : C.g2,
              color: selectedQuestions.length > 0 ? C.white : C.g4,
              border: "none", borderRadius: 7, padding: "7px 16px",
              fontSize: 13, fontWeight: 600, fontFamily: F,
              cursor: selectedQuestions.length > 0 ? "pointer" : "not-allowed",
            }}
            onMouseEnter={e => { if (selectedQuestions.length > 0) e.currentTarget.style.background = C.navy2; }}
            onMouseLeave={e => { if (selectedQuestions.length > 0) e.currentTarget.style.background = C.navy; }}
          >
            Add {selectedQuestions.length} question{selectedQuestions.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Grid Confirm Modal ────────────────────────────────────────────────────────

function GridConfirmModal({ direction, qCount, onConfirm, onCancel }) {
  const isOn = direction === "on";
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, fontFamily: F }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ background: C.white, borderRadius: 12, width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.g6 }}>
            {isOn ? "Switch to Grid Section?" : "Switch back to question list?"}
          </span>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, padding: 4, display: "flex", alignItems: "center" }}>
            <IconClose />
          </button>
        </div>
        <div style={{ padding: "10px 20px 20px" }}>
          <p style={{ margin: 0, fontSize: 13, color: C.g5, lineHeight: "19px" }}>
            {isOn
              ? `The ${qCount} question${qCount !== 1 ? "s" : ""} in this section will be removed and replaced with a grid structure.`
              : "The grid structure will be removed. You can add individual questions afterwards."}
          </p>
        </div>
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.g2}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel}
            style={{ background: "none", border: `1px solid ${C.g3}`, borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer" }}
          >Cancel</button>
          <button onClick={onConfirm}
            style={{ background: C.navy, color: C.white, border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = C.navy2}
            onMouseLeave={e => e.currentTarget.style.background = C.navy}
          >{isOn ? "Switch to Grid" : "Switch to Questions"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Step 3 Main ───────────────────────────────────────────────────────────────

export default function Step3Sections({ formData, onChange, onNext, onBack, methodology }) {
  const isWeighted = methodology === "weighted";

  const [sections, setSections]       = useState(() => formData?.sections ?? DEFAULT_SECTIONS);
  const [viewMode, setViewMode]       = useState(() => formData?.viewMode ?? "row");
  const [railOpen, setRailOpen]       = useState(true);
  const [selectedQs, setSelectedQs]   = useState(new Set());
  const [editingQ, setEditingQ]       = useState(null); // { q, sectionId, isNew }
  const [showFixMath, setShowFixMath] = useState(false);
  const [activeId, setActiveId]       = useState(null);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [toastMsg, setToastMsg]       = useState(null);
  const [bankReuseModal, setBankReuseModal] = useState(null); // { bankSection }
  const [gridConfirmModal, setGridConfirmModal] = useState(null); // { sectionId, direction: "on"|"off" }

  const sectionsRef = useRef(sections);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const totalWeight = sections.reduce((s, sec) => s + Number(sec.weight ?? 0), 0);
  const weightError = isWeighted && Math.round(totalWeight) !== 100;

  function emit(secs, vm) {
    onChange({ sections: secs, viewMode: vm ?? viewMode });
  }

  function showToast(msg) { setToastMsg(msg); }

  function handleSelectQ(id) {
    setSelectedQs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handleViewMode(m) { setViewMode(m); emit(sections, m); }

  function handleToggleCollapse(sectionId) {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, collapsed: !s.collapsed } : s));
  }

  function handleWeightChange(sectionId, val) {
    const next = sections.map(s => s.id === sectionId ? { ...s, weight: val } : s);
    setSections(next); emit(next);
  }

  function handleRename(sectionId, name) {
    const next = sections.map(s => s.id === sectionId ? { ...s, name } : s);
    setSections(next); emit(next);
  }

  function handleDuplicate(sectionId) {
    const src = sections.find(s => s.id === sectionId);
    if (!src) return;
    const copy = { ...src, id: genId("sec"), name: src.name + " (copy)", questions: src.questions.map(q => ({ ...q, id: genId("q") })) };
    const idx = sections.findIndex(s => s.id === sectionId);
    const next = [...sections.slice(0, idx + 1), copy, ...sections.slice(idx + 1)];
    setSections(next); emit(next);
  }

  function handleDeleteSection(sectionId) {
    const next = sections.filter(s => s.id !== sectionId);
    setSections(next); emit(next);
  }

  function handleAddSection() {
    const name = newSectionName.trim();
    if (!name) return;
    const newSec = { id: genId("sec"), name, weight: 0, collapsed: false, isGrid: false, gridData: null, questions: [] };
    const next = [...sections, newSec];
    setSections(next); emit(next);
    setNewSectionName(""); setAddingSection(false);
  }

  function handleSaveQ(patch) {
    if (!editingQ) return;
    const { q, sectionId, isNew } = editingQ;
    let next;
    if (isNew) {
      const newQ = { id: genId("q"), ...patch };
      next = sections.map(s => s.id === sectionId ? { ...s, questions: [...s.questions, newQ] } : s);
    } else {
      next = sections.map(s => s.id !== sectionId ? s : {
        ...s, questions: s.questions.map(item => item.id === q.id ? { ...item, ...patch } : item),
      });
    }
    setSections(next); emit(next); setEditingQ(null);
  }

  function handleAutoBalance() {
    const n = sections.length;
    if (n === 0) return;
    const base = Math.floor(100 / n);
    const rem = 100 - base * n;
    const next = sections.map((s, i) => ({ ...s, weight: base + (i < rem ? 1 : 0) }));
    setSections(next); emit(next); setShowFixMath(false);
  }

  function handleDeleteSelected() {
    const next = sections.map(s => ({ ...s, questions: s.questions.filter(q => !selectedQs.has(q.id)) }));
    setSections(next); emit(next); setSelectedQs(new Set());
  }

  // ── Bank handlers ────────────────────────────────────────────────────────────

  function handleAddSectionFromBank(bankSection) {
    setBankReuseModal({ bankSection });
  }

  function handleAddQuestionFromBank(bankQuestion) {
    if (sections.length === 0) {
      showToast("Add a section first, then use question bank items.");
      return;
    }
    const targetSection = sections[sections.length - 1];
    const newQ = {
      id: genId("q"),
      title: bankQuestion.title,
      answerType: bankQuestion.answerType,
      required: bankQuestion.required ?? false,
      critical: false, informational: false, instructions: "",
      typeConfig: {}, inBank: true, scoring: {}, media: {},
      action: { type: "none" }, escalation: { rules: [] },
      conditional: { operator: "AND", items: [] },
    };
    const next = sections.map(s => s.id === targetSection.id ? { ...s, questions: [...s.questions, newQ] } : s);
    setSections(next); emit(next);
    showToast(`Added "${bankQuestion.title.slice(0, 30)}${bankQuestion.title.length > 30 ? "..." : ""}" to ${targetSection.name}`);
  }

  function handleBankReuseConfirm(selectedQuestions) {
    const { bankSection } = bankReuseModal;
    const newSec = {
      id: genId("sec"),
      name: bankSection.name,
      weight: 0,
      collapsed: false,
      isGrid: false,
      gridData: null,
      questions: selectedQuestions.map(q => ({
        id: genId("q"),
        title: q.title,
        answerType: q.answerType,
        required: q.required ?? false,
        critical: false, informational: false, instructions: "",
        typeConfig: {}, inBank: true, scoring: {}, media: {},
        action: { type: "none" }, escalation: { rules: [] },
        conditional: { operator: "AND", items: [] },
      })),
    };
    const next = [...sections, newSec];
    setSections(next); emit(next);
    setBankReuseModal(null);
    showToast(`Added section "${bankSection.name}" with ${selectedQuestions.length} question${selectedQuestions.length !== 1 ? "s" : ""}`);
  }

  // ── Grid handlers ────────────────────────────────────────────────────────────

  function handleToggleGrid(sectionId) {
    const sec = sections.find(s => s.id === sectionId);
    if (!sec) return;
    if (!sec.isGrid) {
      if (sec.questions.length > 0) {
        setGridConfirmModal({ sectionId, direction: "on" });
      } else {
        applyGridToggle(sectionId, true);
      }
    } else {
      setGridConfirmModal({ sectionId, direction: "off" });
    }
  }

  function applyGridToggle(sectionId, on) {
    const next = sections.map(s => s.id !== sectionId ? s : {
      ...s,
      isGrid: on,
      questions: on ? [] : s.questions,
      gridData: on ? {
        cellAnswerType: "Yes/No/NA",
        columns: [{ id: "c1", label: "Column 1" }, { id: "c2", label: "Column 2" }, { id: "c3", label: "Column 3" }],
        rows: [{ id: "r1", label: "Row 1" }, { id: "r2", label: "Row 2" }],
        cells: {}, scoring: {},
      } : null,
    });
    setSections(next); emit(next);
    setGridConfirmModal(null);
  }

  function handleUpdateGrid(sectionId, gridData) {
    const next = sections.map(s => s.id !== sectionId ? s : { ...s, gridData });
    setSections(next); emit(next);
  }

  // ── DnD ──────────────────────────────────────────────────────────────────────

  function handleDragStart({ active }) { setActiveId(active.id); }

  function handleDragOver({ active, over }) {
    if (!over || active.id === over.id) return;
    const aId = active.id;
    const oId = over.id;
    if (aId.startsWith("sec-")) return;

    const secs = sectionsRef.current;
    const fromContainer = findContainer(aId, secs);
    const toContainer = findContainer(oId, secs) ?? (oId.startsWith("sec-") ? oId : null);
    if (!fromContainer || !toContainer || fromContainer === toContainer) return;

    setSections(prev => {
      const from = prev.find(s => s.id === fromContainer);
      const to   = prev.find(s => s.id === toContainer);
      if (!from || !to) return prev;
      const movingQ = from.questions.find(q => q.id === aId);
      if (!movingQ) return prev;
      const overIdx = to.questions.findIndex(q => q.id === oId);
      const insertAt = overIdx >= 0 ? overIdx : to.questions.length;
      return prev.map(s => {
        if (s.id === fromContainer) return { ...s, questions: s.questions.filter(q => q.id !== aId) };
        if (s.id === toContainer) { const qs = [...s.questions]; qs.splice(insertAt, 0, movingQ); return { ...s, questions: qs }; }
        return s;
      });
    });
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const aId = active.id;
    const oId = over.id;

    if (aId.startsWith("sec-")) {
      setSections(prev => {
        const from = prev.findIndex(s => s.id === aId);
        const to   = prev.findIndex(s => s.id === oId);
        if (from === -1 || to === -1) return prev;
        const next = arrayMove(prev, from, to);
        emit(next); return next;
      });
    } else {
      setSections(prev => {
        const container = findContainer(aId, prev);
        if (!container) return prev;
        const next = prev.map(s => {
          if (s.id !== container) return s;
          const from = s.questions.findIndex(q => q.id === aId);
          const to   = s.questions.findIndex(q => q.id === oId);
          if (from === -1 || to === -1) return s;
          return { ...s, questions: arrayMove(s.questions, from, to) };
        });
        emit(next); return next;
      });
    }
  }

  const activeSection  = activeId?.startsWith("sec-") ? sections.find(s => s.id === activeId) : null;
  const activeQuestion = !activeId?.startsWith("sec-") ? sections.flatMap(s => s.questions).find(q => q.id === activeId) : null;

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: F, overflow: "hidden" }}>
      <BanksPanel
        open={railOpen}
        onToggle={() => setRailOpen(r => !r)}
        sections={sections}
        onAddSectionFromBank={handleAddSectionFromBank}
        onAddQuestionFromBank={handleAddQuestionFromBank}
        onToast={showToast}
      />

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px 80px" }}>

          {/* Intro card */}
          <div style={{ background: C.purpleLt, border: `1px solid ${C.purpleMd}`, borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.purpleMd, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.purple, fontFamily: F, marginBottom: 2 }}>Build your audit structure</div>
              <div style={{ fontSize: 12, color: "#5b21b6", fontFamily: F, lineHeight: "18px" }}>
                Add sections to group related questions, then add questions to each section. Drag to reorder. Click a question to edit it.
              </div>
            </div>
          </div>

          {/* Header controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {weightError && (
              <button onClick={() => setShowFixMath(true)}
                style={{ display: "flex", alignItems: "center", gap: 5, background: C.amberBg, border: "1px solid #fcd34d", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: C.amber, fontFamily: F, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fef3c7"}
                onMouseLeave={e => e.currentTarget.style.background = C.amberBg}
              ><IconWarn /> Fix Math ({totalWeight}%)</button>
            )}

            <div style={{ flex: 1 }} />

            {selectedQs.size > 0 && (
              <>
                <span style={{ fontSize: 12, color: C.g4, fontFamily: F }}>{selectedQs.size} selected</span>
                <button onClick={handleDeleteSelected}
                  style={{ fontSize: 12, fontWeight: 500, color: C.red, background: "none", border: "1px solid #fca5a5", borderRadius: 6, padding: "5px 10px", fontFamily: F, cursor: "pointer" }}
                >Delete selected</button>
                <button onClick={() => setSelectedQs(new Set())}
                  style={{ fontSize: 12, fontWeight: 500, color: C.g5, background: "none", border: `1px solid ${C.g3}`, borderRadius: 6, padding: "5px 10px", fontFamily: F, cursor: "pointer" }}
                >Clear</button>
              </>
            )}

            {featureFlags.aiTemplateSearch && (
              <button style={{ display: "flex", alignItems: "center", gap: 5, background: C.purpleLt, border: `1px solid ${C.purpleMd}`, borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: C.purple, fontFamily: F, cursor: "pointer" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>
                </svg>
                AI Generate
              </button>
            )}

            <div style={{ display: "flex", border: `1px solid ${C.g2}`, borderRadius: 7, overflow: "hidden" }}>
              {[["row", <IconRows key="r"/>], ["grid", <IconGrid key="g"/>]].map(([m, icon]) => (
                <button key={m} onClick={() => handleViewMode(m)}
                  style={{ background: viewMode === m ? C.navy : C.white, color: viewMode === m ? C.white : C.g4, border: "none", padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", transition: "background 0.1s" }}
                >{icon}</button>
              ))}
            </div>
          </div>

          {/* Section list */}
          {sections.length === 0 ? (
            <div style={{ background: C.white, border: `1px dashed ${C.g3}`, borderRadius: 12, padding: "56px 24px", textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.g5, marginBottom: 6, fontFamily: F }}>No sections yet</div>
              <div style={{ fontSize: 13, color: C.g4, fontFamily: F, marginBottom: 20 }}>Add your first section to start building questions.</div>
              {addingSection ? (
                <div style={{ maxWidth: 400, margin: "0 auto" }}>
                  <AddSectionInline value={newSectionName} onChange={setNewSectionName} onConfirm={handleAddSection} onCancel={() => { setAddingSection(false); setNewSectionName(""); }} />
                </div>
              ) : (
                <button onClick={() => setAddingSection(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.navy, color: C.white, border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.navy2}
                  onMouseLeave={e => e.currentTarget.style.background = C.navy}
                ><IconPlus /> Add section</button>
              )}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {sections.map(section => (
                  <SortableSectionCard
                    key={section.id}
                    section={section}
                    isWeighted={isWeighted}
                    selectedQs={selectedQs}
                    onSelectQ={handleSelectQ}
                    onEditQ={q => setEditingQ({ q, sectionId: section.id, isNew: false })}
                    onAddQ={sectionId => setEditingQ({ q: { title: "", answerType: "Yes/No/NA", required: false, critical: false, informational: false, instructions: "", typeConfig: {}, inBank: false, scoring: {}, media: {}, action: { type: "none" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } }, sectionId, isNew: true })}
                    viewMode={viewMode}
                    onToggleCollapse={() => handleToggleCollapse(section.id)}
                    onWeightChange={v => handleWeightChange(section.id, v)}
                    onRename={name => handleRename(section.id, name)}
                    onDuplicate={() => handleDuplicate(section.id)}
                    onDelete={() => handleDeleteSection(section.id)}
                    onToggleGrid={handleToggleGrid}
                    onUpdateGrid={handleUpdateGrid}
                    methodology={methodology}
                  />
                ))}
              </SortableContext>

              <DragOverlay>
                {activeSection && (
                  <div style={{ background: C.white, border: `1px solid ${C.navy}`, borderRadius: 10, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.14)" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: F }}>{activeSection.name}</span>
                  </div>
                )}
                {activeQuestion && (
                  <div style={{ background: C.white, border: `1px solid ${C.navy}`, borderRadius: 6, padding: "8px 12px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
                    <span style={{ fontSize: 13, color: C.g6, fontFamily: F }}>{activeQuestion.title}</span>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}

          {/* Add section button (non-empty state) */}
          {sections.length > 0 && (
            addingSection ? (
              <AddSectionInline value={newSectionName} onChange={setNewSectionName} onConfirm={handleAddSection} onCancel={() => { setAddingSection(false); setNewSectionName(""); }} />
            ) : (
              <button onClick={() => setAddingSection(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px dashed ${C.g3}`, borderRadius: 8, padding: "10px 16px", width: "100%", fontSize: 13, fontWeight: 500, color: C.g4, fontFamily: F, cursor: "pointer", transition: "color 0.1s, border-color 0.1s", marginTop: 4 }}
                onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
              ><IconPlus size={13} /> Add section</button>
            )
          )}

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32 }}>
            <button onClick={onBack}
              style={{ background: "none", border: "none", color: C.g5, fontSize: 13, fontWeight: 500, fontFamily: F, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: "8px 0" }}
              onMouseEnter={e => e.currentTarget.style.color = C.g6} onMouseLeave={e => e.currentTarget.style.color = C.g5}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back: Scoring
            </button>
            <button onClick={onNext}
              style={{ background: C.navy, color: C.white, border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              onMouseEnter={e => e.currentTarget.style.background = C.navy2} onMouseLeave={e => e.currentTarget.style.background = C.navy}
            >
              Next: Schedule
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {editingQ && (() => {
        const allQuestionsFlat = sections.flatMap(s => s.questions);
        const priorQuestions = editingQ.isNew
          ? allQuestionsFlat
          : allQuestionsFlat.slice(0, allQuestionsFlat.findIndex(q => q.id === editingQ.q.id));
        return (
          <QuestionEditor
            question={editingQ.q}
            isNew={editingQ.isNew}
            methodology={methodology}
            priorQuestions={priorQuestions}
            onSave={handleSaveQ}
            onClose={() => setEditingQ(null)}
          />
        );
      })()}
      {showFixMath && (
        <FixMathModal sections={sections} onAutoBalance={handleAutoBalance} onClose={() => setShowFixMath(false)} />
      )}
      {bankReuseModal && (
        <BankReuseModal
          bankSection={bankReuseModal.bankSection}
          onConfirm={handleBankReuseConfirm}
          onClose={() => setBankReuseModal(null)}
        />
      )}
      {gridConfirmModal && (
        <GridConfirmModal
          direction={gridConfirmModal.direction}
          qCount={sections.find(s => s.id === gridConfirmModal.sectionId)?.questions.length ?? 0}
          onConfirm={() => applyGridToggle(gridConfirmModal.sectionId, gridConfirmModal.direction === "on")}
          onCancel={() => setGridConfirmModal(null)}
        />
      )}
      {toastMsg && <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} />}
    </div>
  );
}
