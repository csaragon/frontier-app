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
import QuestionBuilder from "./QuestionBuilder.jsx";
import SectionEditor from "./SectionEditor.jsx";
import BanksPanel from "./BanksPanel.jsx";
import GridSection from "./GridSection.jsx";

import { T, F } from "../aegis-tokens.js";
import { LogicIcons } from "./typeIcons.jsx";

const C = {
  navy:     T.action1,
  navy2:    T.action2,
  white:    T.surface1,
  g1:       T.surface2,
  g2:       T.border1,
  g3:       T.border2,
  g4:       T.disabled1,
  g5:       T.onSurface1,
  g6:       T.onSurface2,
  amber:    T.warning1,
  amberBg:  T.warningContainer1,
  red:      T.onError1,
  teal:     "#0f766e",
  purple:   "#7c3aed",
  purpleLt: "#f5f3ff",
  purpleMd: "#ede9fe",
};

const ANSWER_TYPES = [
  { value: "Yes/No/NA",       bg: "#d9e5f5", color: "#2b4b94" },  // slate blue
  { value: "Yes/No",          bg: "#d9e5f5", color: "#2b4b94" },  // slate blue
  { value: "Pass/Fail",       bg: "#e0dcf8", color: "#4030a6" },  // indigo
  { value: "Rating Scale",    bg: "#e8d8f5", color: "#5c2c98" },  // violet
  { value: "Free Text",       bg: "#d6ecf5", color: "#1e5f80" },  // powder blue
  { value: "Number",          bg: "#d6dff0", color: "#2e3e72" },  // navy slate
  { value: "Multiple Choice", bg: "#e6e9ed", color: "#48535f" },  // cool gray
  { value: "Grid",            bg: "#e6e9ed", color: "#48535f" },  // cool gray
  { value: "Asset",           bg: "#d8e4f2", color: "#30527a" },  // blue-gray
  { value: "Photo Required",  bg: "#e0dcf8", color: "#4030a6" },  // indigo
];

const Q = (id, title, answerType, opts = {}) => ({
  id, title, answerType,
  required: opts.required ?? false,
  informational: opts.info ?? false,
  critical: opts.critical ?? false,
  typeConfig: {}, inBank: false,
  scoring: opts.scoring ?? {},
  media: opts.photo ? { requireOnFail: true } : {},
  action: { type: opts.action ?? "none" },
  escalation: { rules: opts.esc ? [{ id: `e-${id}`, condition: "fail", notify: "manager" }] : [] },
  conditional: { operator: "AND", items: opts.cond ? [{ type: "condition", questionId: opts.cond, operator: "eq", value: "No" }] : [] },
});

const DEFAULT_SECTIONS = [
  {
    id: "sec-1", name: "Fire Safety", weight: 40, collapsed: false, isGrid: false, gridData: null,
    questions: [
      Q("q-1",  "Are all fire extinguishers properly mounted and accessible?",     "Yes/No/NA",    { required: true,  scoring: { value: 10, answerValues: { Yes: 10, No: 0, "N/A": 0 } }, action: "corrective", esc: true }),
      Q("q-2",  "Are sprinkler heads free of obstructions?",                       "Yes/No",       { required: true,  scoring: { value: 8,  answerValues: { Yes: 8, No: 0 } }, esc: true, critical: true }),
      Q("q-3",  "Do emergency exit doors open outward without obstruction?",       "Pass/Fail",    { required: true,  scoring: { passValue: 10, failValue: 0 }, photo: true }),
      Q("q-4",  "Rate the overall fire safety compliance of this area.",           "Rating Scale", { scoring: { value: 10 }, cond: "q-1" }),
      Q("q-5",  "How many exits are marked with illuminated signage?",             "Number",       { required: true,  scoring: { value: 5 }, esc: true }),
      Q("q-6",  "Select all fire hazards observed during this visit.",             "Multiple Choice", { scoring: { value: 5 } }),
      Q("q-7",  "When was the last fire drill conducted?",                         "Free Text",    { info: true }),
      Q("q-8",  "Describe any fire safety concerns observed during this visit.",   "Free Text",    { scoring: { value: 2 } }),
      Q("q-9",  "Upload photo of fire extinguisher inspection tags.",              "Photo Required", { required: true, photo: true, scoring: { value: 5 } }),
    ],
  },
  {
    id: "sec-2", name: "Chemical & PPE", weight: 35, collapsed: false, isGrid: false, gridData: null,
    questions: [
      Q("q-10", "Are all chemicals stored in approved containers with proper labeling?", "Yes/No/NA", { required: true, scoring: { value: 10, answerValues: { Yes: 10, No: 0, "N/A": 5 } }, action: "corrective", esc: true }),
      Q("q-11", "Is the MSDS / SDS binder current and accessible to all employees?",    "Yes/No",    { required: true, scoring: { value: 8, answerValues: { Yes: 8, No: 0 } }, photo: true, cond: "q-10" }),
      Q("q-12", "PPE station is fully stocked and items are in good condition.",         "Pass/Fail", { required: true, scoring: { passValue: 10, failValue: 0 }, action: "corrective" }),
      Q("q-13", "Rate the overall PPE compliance for this area.",                        "Rating Scale", { scoring: { value: 8 } }),
      Q("q-14", "How many PPE violations were observed?",                                "Number",    { scoring: { value: 4 }, esc: true }),
      Q("q-15", "Select all PPE types inspected today.",                                 "Multiple Choice", { info: true }),
      Q("q-16", "Note any chemical storage concerns for follow-up.",                     "Free Text", { info: true }),
      Q("q-17", "Scan or identify the asset tag for the PPE storage cabinet.",          "Asset",     { scoring: { value: 3 } }),
    ],
  },
  {
    id: "sec-3", name: "Facility Condition", weight: 25, collapsed: false, isGrid: false, gridData: null,
    questions: [
      Q("q-18", "Are all aisles and walkways free of trip hazards?",               "Yes/No/NA",    { required: true, scoring: { value: 10, answerValues: { Yes: 10, No: 0, "N/A": 0 } }, esc: true }),
      Q("q-19", "Are emergency lighting fixtures operational?",                    "Yes/No",       { required: true, scoring: { value: 8, answerValues: { Yes: 8, No: 0 } }, action: "corrective" }),
      Q("q-20", "Inspect floor condition — pass only if no cracks or pooling.",   "Pass/Fail",    { scoring: { passValue: 5, failValue: 0 }, photo: true }),
      Q("q-21", "Rate the cleanliness and general upkeep of the facility.",       "Rating Scale", { scoring: { value: 5 }, cond: "q-18" }),
      Q("q-22", "How many maintenance issues were logged today?",                  "Number",       { scoring: { value: 4 }, esc: true }),
      Q("q-23", "Select all areas included in today's facility walkthrough.",      "Multiple Choice", { info: true }),
      Q("q-24", "Scan the facility asset tag to confirm the correct location.",   "Asset",        { required: true, scoring: { value: 3 } }),
      Q("q-25", "Upload a photo of any observed structural damage.",              "Photo Required", { photo: true, scoring: { value: 5 }, cond: "q-20" }),
      Q("q-26", "Additional notes on facility condition.",                         "Free Text",    { info: true }),
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

function collectConditionalQIds(conditional) {
  const ids = new Set();
  if (!conditional?.items) return ids;
  function walk(items) {
    for (const item of items) {
      if (item.type === "condition" && item.questionId) ids.add(item.questionId);
      if (item.type === "group" && item.items) walk(item.items);
    }
  }
  walk(conditional.items);
  return ids;
}

function findDependents(targetQIds, sections) {
  const targetSet = new Set(targetQIds);
  const deps = [];
  for (const sec of sections) {
    for (const q of sec.questions) {
      if (targetSet.has(q.id)) continue;
      const refs = collectConditionalQIds(q.conditional);
      if ([...refs].some(id => targetSet.has(id))) {
        deps.push({ affectedQId: q.id, affectedQTitle: q.title, sectionName: sec.name, sectionId: sec.id });
      }
    }
  }
  return deps;
}

function computeSectionRebalance(sections) {
  const total = sections.reduce((s, sec) => s + Number(sec.weight ?? 0), 0);
  if (sections.length === 0) return { preview: [], wasRounded: false };
  if (total === 0) {
    const base = Math.floor(100 / sections.length);
    const rem = 100 - base * sections.length;
    return { preview: sections.map((s, i) => ({ ...s, afterWeight: base + (i < rem ? 1 : 0) })), wasRounded: false };
  }
  let sumSoFar = 0; let wasRounded = false;
  const preview = sections.map((s, i) => {
    if (i < sections.length - 1) {
      const raw = (Number(s.weight ?? 0) / total) * 100;
      const rounded = Math.round(raw * 10) / 10;
      if (rounded !== raw) wasRounded = true;
      sumSoFar += rounded;
      return { ...s, afterWeight: rounded };
    }
    return { ...s, afterWeight: Math.round((100 - sumSoFar) * 10) / 10 };
  });
  return { preview, wasRounded };
}

function purgeConditionalRefs(conditional, deletedIds) {
  if (!conditional?.items) return conditional;
  const deletedSet = new Set(deletedIds);
  function filterItems(items) {
    return items.map(item => {
      if (item.type === "condition") return deletedSet.has(item.questionId) ? null : item;
      if (item.type === "group") { const ni = filterItems(item.items); return ni.length === 0 ? null : { ...item, items: ni }; }
      return item;
    }).filter(Boolean);
  }
  return { ...conditional, items: filterItems(conditional.items) };
}

function generateFakeAIResult(option, prompt, targetSectionId, sections) {
  const topic = prompt.slice(0, 30) || "this area";
  if (option === "section") {
    return { type: "section", sectionName: `${prompt.slice(0, 40) || "New"} Inspection`,
      questions: [
        { id: genId("ai"), title: `Is the ${topic} area in compliance with current standards?`, answerType: "Yes/No/NA", score: 10, actionSummary: "Create corrective action" },
        { id: genId("ai"), title: `Are all ${topic}-related items properly labeled and stored?`, answerType: "Yes/No/NA", score: 10, actionSummary: "Notify supervisor" },
        { id: genId("ai"), title: `Rate the overall condition of ${topic}`, answerType: "Rating Scale", score: 20, actionSummary: "None" },
        { id: genId("ai"), title: `Additional ${topic} concerns observed?`, answerType: "Free Text", score: 0, actionSummary: "None" },
      ] };
  }
  if (option === "questions") {
    const sec = sections.find(s => s.id === targetSectionId);
    return { type: "questions", sectionId: targetSectionId, sectionName: sec?.name ?? "Section",
      questions: [
        { id: genId("ai"), title: `${topic} — is documentation current and accessible?`, answerType: "Yes/No/NA", score: 5 },
        { id: genId("ai"), title: `${topic} — photographic evidence collected?`, answerType: "Photo Required", score: 5 },
        { id: genId("ai"), title: `Follow-up actions noted for ${topic}?`, answerType: "Free Text", score: 0 },
      ] };
  }
  if (option === "scoring") {
    const allQs = sections.flatMap(s => s.questions.map(q => ({ ...q, sectionName: s.name })));
    return { type: "scoring", suggestions: allQs.slice(0, 8).map(q => ({
      qId: q.id, qTitle: q.title, sectionName: q.sectionName,
      currentScore: q.scoring?.points ?? 0,
      proposedScore: q.critical ? 20 : q.required ? 10 : 5,
    })) };
  }
}

const AI_LOADING_STEPS = ["Reading your prompt","Understanding template context","Generating content","Applying scoring","Wiring up actions"];

const APPLY_FIELDS = [
  { key:"scoring",     label:"Scoring",          desc:"Point value / weight / lock state" },
  { key:"media",       label:"Media",            desc:"Allow attachment + require on fail" },
  { key:"actions",     label:"Actions",          desc:"Action type + predefined config + trigger" },
  { key:"escalation",  label:"Escalation rules", desc:"All escalation rules" },
  { key:"conditional", label:"Conditional logic", desc:"The entire rule chain" },
];

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
    <span style={{ display: "inline-flex", alignItems: "center", background: m.bg, color: m.color, fontSize: 12, fontWeight: 600, fontFamily: F, borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap" }}>
      {value}
    </span>
  );
}

function SmallBadge({ label, bg, color }) {
  return <span style={{ fontSize: 12, fontWeight: 600, fontFamily: F, background: bg, color, borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap" }}>{label}</span>;
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

// QuestionEditorModal replaced by QuestionBuilder imported from ./QuestionBuilder.jsx

// ── Fix Math Modal ────────────────────────────────────────────────────────────

function FixMathModal({ sections, onClose, onApply }) {
  const { preview, wasRounded } = computeSectionRebalance(sections);
  const total = sections.reduce((s, sec) => s + Number(sec.weight ?? 0), 0);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, fontFamily:F }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:C.white, borderRadius:12, width:480, maxHeight:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ padding:"16px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <span style={{ fontSize:16, fontWeight:700, color:C.g6 }}>Rebalance weights proportionally?</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.g4, padding:4, display:"flex" }}><IconClose /></button>
        </div>
        <div style={{ padding:"12px 20px 0", flexShrink:0 }}>
          <p style={{ margin:"0 0 4px", fontSize:13, color:C.g5, lineHeight:"19px" }}>
            Current total: <strong style={{ color: Math.round(total) === 100 ? C.teal : C.amber }}>{total}%</strong> of 100%. Fix Math will rebalance all weights proportionally to reach 100%.
          </p>
          <p style={{ margin:"0 0 12px", fontSize:12, color:C.g4, lineHeight:"17px" }}>All section weights adjust proportionally.{wasRounded && " Some weights may be rounded to 0.1%."}</p>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"0 20px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto", borderRadius:8, overflow:"hidden", border:`1px solid ${C.g2}` }}>
            <div style={{ padding:"7px 12px", background:C.g1, fontSize:12, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.04em" }}>Section</div>
            <div style={{ padding:"7px 12px", background:C.g1, fontSize:12, fontWeight:700, color:C.g4, textTransform:"uppercase", textAlign:"center" }}>Before</div>
            <div style={{ padding:"7px 12px", background:C.g1, fontSize:12, fontWeight:700, color:C.navy, textTransform:"uppercase", textAlign:"center" }}>After</div>
            {preview.map((s, i) => {
              const changed = s.afterWeight !== Number(s.weight ?? 0);
              return [
                <div key={`n${i}`} style={{ padding:"9px 12px", fontSize:13, color:C.g6, borderTop:`1px solid ${C.g2}` }}>{s.name}</div>,
                <div key={`b${i}`} style={{ padding:"9px 12px", fontSize:13, color:C.g5, borderTop:`1px solid ${C.g2}`, textAlign:"center", fontFamily:"monospace" }}>{s.weight ?? 0}%</div>,
                <div key={`a${i}`} style={{ padding:"9px 12px", fontSize:13, fontWeight:600, color: changed ? C.navy : C.g4, borderTop:`1px solid ${C.g2}`, textAlign:"center", fontFamily:"monospace" }}>
                  {changed ? `${s.afterWeight}%` : <span style={{ fontWeight:400, color:C.g4, fontFamily:F }}>No change</span>}
                </div>,
              ];
            })}
          </div>
        </div>
        <div style={{ padding:"14px 20px", borderTop:`1px solid ${C.g2}`, display:"flex", gap:8, justifyContent:"flex-end", alignItems:"center", flexShrink:0, marginTop:12 }}>
          {wasRounded && <span style={{ fontSize:12, color:C.g4, fontFamily:F, flex:1 }}>Some weights rounded to 0.1%</span>}
          <button onClick={onClose} style={{ background:"none", border:`1px solid ${C.g3}`, borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:500, fontFamily:F, color:C.g5, cursor:"pointer" }}>Cancel</button>
          <button onClick={() => onApply(preview)} style={{ background:C.navy, color:C.white, border:"none", borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:600, fontFamily:F, cursor:"pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = C.navy2} onMouseLeave={e => e.currentTarget.style.background = C.navy}>
            Apply rebalance
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bulk Actions Menu ─────────────────────────────────────────────────────────

function BulkActionsMenu({ selectedQIds, allSections, onDelete, onDuplicate, onMove, onMark, onApplyConfig, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);
  const selQs = allSections.flatMap(s => s.questions.filter(q => selectedQIds.has(q.id)));
  const req  = { some: selQs.some(q => q.required),      all: selQs.every(q => q.required) };
  const crit = { some: selQs.some(q => q.critical),      all: selQs.every(q => q.critical) };
  const info = { some: selQs.some(q => q.informational), all: selQs.every(q => q.informational) };
  function mi(label, onClick, danger = false) {
    return <button key={label} onClick={() => { onClick(); onClose(); }}
      style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", padding:"7px 14px", fontSize:13, fontWeight:500, fontFamily:F, color: danger ? C.red : C.g6, cursor:"pointer" }}
      onMouseEnter={e => e.currentTarget.style.background = C.g1}
      onMouseLeave={e => e.currentTarget.style.background = "none"}>{label}</button>;
  }
  const div = <div style={{ height:1, background:C.g2, margin:"2px 0" }} />;
  return (
    <div ref={ref} style={{ position:"absolute", top:"100%", right:0, zIndex:300, background:C.white, borderRadius:8, boxShadow:"0 4px 20px rgba(0,0,0,0.16)", border:`1px solid ${C.g2}`, minWidth:230, overflow:"hidden", marginTop:4 }}>
      {mi("Duplicate", onDuplicate)}
      {mi("Move to section…", onMove)}
      {div}
      {!req.all  && mi("Mark as required",        () => onMark("required",      true))}
      {req.some  && mi("Mark as not required",     () => onMark("required",      false))}
      {!crit.all && mi("Mark as critical",         () => onMark("critical",      true))}
      {crit.some && mi("Mark as not critical",     () => onMark("critical",      false))}
      {!info.all && mi("Mark as informational",    () => onMark("informational", true))}
      {info.some && mi("Mark as not informational",() => onMark("informational", false))}
      {div}
      {mi("Apply config to selected", onApplyConfig)}
      {div}
      {mi("Delete", onDelete, true)}
    </div>
  );
}

function BulkDeleteConfirmModal({ count, onConfirm, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, fontFamily:F }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:C.white, borderRadius:12, width:380, boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ padding:"18px 20px 14px" }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.g6 }}>Delete {count} question{count !== 1 ? "s" : ""}?</div>
          <div style={{ fontSize:13, color:C.g5, marginTop:8 }}>This can't be undone.</div>
        </div>
        <div style={{ padding:"12px 20px", borderTop:`1px solid ${C.g2}`, display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ background:"none", border:`1px solid ${C.g3}`, borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:500, fontFamily:F, color:C.g5, cursor:"pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ background:C.red, color:C.white, border:"none", borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:600, fontFamily:F, cursor:"pointer" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function BulkMoveModal({ sections, onMove, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, fontFamily:F }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:C.white, borderRadius:12, width:360, maxHeight:"60vh", display:"flex", flexDirection:"column", boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ padding:"16px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.g6 }}>Move to section</div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.g4, padding:4, display:"flex" }}><IconClose /></button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => { onMove(s.id); onClose(); }}
              style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", padding:"11px 20px", fontSize:13, color:C.g6, fontFamily:F, cursor:"pointer", borderBottom:`1px solid ${C.g1}` }}
              onMouseEnter={e => e.currentTarget.style.background = C.g1}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              {s.name}<span style={{ fontSize:12, color:C.g4, marginLeft:8 }}>{s.questions.length} questions</span>
            </button>
          ))}
          {sections.length === 0 && <div style={{ padding:"20px", fontSize:13, color:C.g4, textAlign:"center" }}>No sections available.</div>}
        </div>
      </div>
    </div>
  );
}

function DeleteDepsModal({ qIds, deps, onConfirm, onClose }) {
  const isBulk = qIds.size > 1;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, fontFamily:F }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:C.white, borderRadius:12, width:440, maxHeight:"70vh", display:"flex", flexDirection:"column", boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ padding:"18px 20px 0", flexShrink:0 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.g6 }}>
            {isBulk ? "Some of these questions are referenced elsewhere" : "This question is referenced elsewhere"}
          </div>
          <div style={{ fontSize:13, color:C.g5, marginTop:8, lineHeight:"19px" }}>
            {isBulk ? `Deleting will affect conditional logic for ${deps.length} question${deps.length !== 1 ? "s" : ""}:` : `Used in conditional logic for ${deps.length} question${deps.length !== 1 ? "s" : ""}:`}
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"12px 20px" }}>
          {deps.map((d, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 0", borderBottom:`1px solid ${C.g1}`, fontSize:13 }}>
              <span style={{ color:C.g4 }}>{d.sectionName}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              <span style={{ color:C.g6, flex:1 }}>{d.affectedQTitle}</span>
            </div>
          ))}
        </div>
        <div style={{ padding:"10px 20px 14px", flexShrink:0 }}>
          <p style={{ margin:"0 0 12px", fontSize:12, color:C.g4, lineHeight:"17px" }}>Deleting will remove these conditions automatically. Affected questions will become unconditional.</p>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={onClose} style={{ background:"none", border:`1px solid ${C.g3}`, borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:500, fontFamily:F, color:C.g5, cursor:"pointer" }}>Cancel</button>
            <button onClick={onConfirm} style={{ background:"none", border:`1px solid ${C.red}`, borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:600, fontFamily:F, color:C.red, cursor:"pointer" }}>Delete anyway</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplyConfigPanel({ selectedQIds, allSections, onApplyRequest, onClose }) {
  const [sourceSearch, setSourceSearch] = useState("");
  const [sourceQ, setSourceQ] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState(new Set(["scoring","media","actions","escalation","conditional"]));
  const dropRef = useRef(null);
  useEffect(() => {
    function h(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const allQs = allSections.flatMap(s => s.questions.map(q => ({ ...q, sectionName: s.name })));
  const eligible = allQs.filter(q => !selectedQIds.has(q.id));
  const filtered = sourceSearch ? eligible.filter(q => q.title.toLowerCase().includes(sourceSearch.toLowerCase()) || q.sectionName.toLowerCase().includes(sourceSearch.toLowerCase())) : eligible;
  const targetQs = allQs.filter(q => selectedQIds.has(q.id));
  const mismatchCount = sourceQ ? targetQs.filter(q => q.answerType !== sourceQ.answerType).length : 0;
  function toggleField(key) { setSelectedFields(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; }); }
  const canApply = sourceQ !== null && selectedFields.size > 0;
  return (
    <div style={{ position:"fixed", top:0, right:0, bottom:0, width:380, background:C.white, borderLeft:`1px solid ${C.g2}`, boxShadow:"-4px 0 20px rgba(0,0,0,0.12)", display:"flex", flexDirection:"column", zIndex:400, fontFamily:F }}>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.g2}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:C.g6 }}>Apply config to {selectedQIds.size} question{selectedQIds.size !== 1 ? "s" : ""}</div>
            <div style={{ fontSize:12, color:C.g4, marginTop:2 }}>Pick a source question and which fields to copy.</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.g4, padding:4, display:"flex", flexShrink:0 }}><IconClose /></button>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.g5, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>1 — Source question</div>
          <div ref={dropRef} style={{ position:"relative" }}>
            <input value={sourceSearch}
              onChange={e => { setSourceSearch(e.target.value); setDropdownOpen(true); if (sourceQ) setSourceQ(null); }}
              onFocus={() => setDropdownOpen(true)}
              placeholder={sourceQ ? sourceQ.title.slice(0,45) + (sourceQ.title.length > 45 ? "…" : "") : "Search questions…"}
              style={{ width:"100%", boxSizing:"border-box", fontFamily:F, fontSize:13, color:C.g6, border:`1px solid ${dropdownOpen ? C.navy : C.g3}`, borderRadius:8, padding:"8px 12px", outline:"none" }}
            />
            {dropdownOpen && (
              <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:500, background:C.white, border:`1px solid ${C.g2}`, borderRadius:8, boxShadow:"0 4px 16px rgba(0,0,0,0.12)", maxHeight:200, overflowY:"auto", marginTop:2 }}>
                {filtered.map(q => (
                  <button key={q.id} onClick={() => { setSourceQ(q); setSourceSearch(""); setDropdownOpen(false); }}
                    style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", padding:"9px 12px", cursor:"pointer", borderBottom:`1px solid ${C.g1}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.g1}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <div style={{ fontSize:12, color:C.g6, fontFamily:F }}>{q.title}</div>
                    <div style={{ fontSize:12, color:C.g4, fontFamily:F, marginTop:2 }}>{q.sectionName} · {q.answerType}</div>
                  </button>
                ))}
                {filtered.length === 0 && <div style={{ padding:"12px", fontSize:12, color:C.g4, fontFamily:F }}>{eligible.length === 0 ? "No other questions available." : "No matches."}</div>}
              </div>
            )}
          </div>
          {sourceQ && (
            <div style={{ marginTop:8, background:C.g1, borderRadius:8, padding:"10px 12px", display:"flex", gap:8, alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.g6, fontFamily:F }}>{sourceQ.title}</div>
                <div style={{ fontSize:12, color:C.g4, fontFamily:F, marginTop:3 }}>{sourceQ.sectionName}</div>
              </div>
              <button onClick={() => { setSourceQ(null); setSourceSearch(""); }} style={{ background:"none", border:"none", cursor:"pointer", color:C.g4, padding:2, display:"flex", flexShrink:0 }}><IconClose /></button>
            </div>
          )}
          {mismatchCount > 0 && (
            <div style={{ marginTop:6, background:"#fef9c3", border:"1px solid #fde68a", borderRadius:6, padding:"8px 10px", display:"flex", gap:6, alignItems:"flex-start" }}>
              <span style={{ flexShrink:0, color:C.amber, display:"flex" }}><IconWarn /></span>
              <span style={{ fontSize:12, color:C.amber, fontFamily:F, lineHeight:"16px" }}>{mismatchCount} of {selectedQIds.size} selected questions have a different answer type. Some fields may not transfer cleanly.</span>
            </div>
          )}
        </div>
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.g5, textTransform:"uppercase", letterSpacing:"0.05em" }}>2 — Fields to copy</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setSelectedFields(new Set(["scoring","media","actions","escalation","conditional"]))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:C.navy, fontFamily:F, fontWeight:500, padding:0 }}>Select all</button>
              <button onClick={() => setSelectedFields(new Set())} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:C.g4, fontFamily:F, fontWeight:500, padding:0 }}>Deselect all</button>
            </div>
          </div>
          {APPLY_FIELDS.map(f => {
            const checked = selectedFields.has(f.key);
            return (
              <label key={f.key} onClick={() => toggleField(f.key)} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"9px 0", borderBottom:`1px solid ${C.g1}`, cursor:"pointer" }}>
                <div style={{ width:15, height:15, borderRadius:4, flexShrink:0, marginTop:2, border:`1.5px solid ${checked ? C.navy : C.g3}`, background: checked ? C.navy : C.white, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {checked && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:C.g6, fontFamily:F }}>{f.label}</div>
                  <div style={{ fontSize:12, color:C.g4, fontFamily:F, marginTop:1 }}>{f.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
      <div style={{ padding:"12px 20px", borderTop:`1px solid ${C.g2}`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.g5, fontSize:13, fontFamily:F, fontWeight:500, cursor:"pointer" }}>Cancel</button>
        <button disabled={!canApply} onClick={() => canApply && onApplyRequest({ qIds: selectedQIds, sourceQ, fields: selectedFields })}
          style={{ background: canApply ? C.navy : C.g2, color: canApply ? C.white : C.g4, border:"none", borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:600, fontFamily:F, cursor: canApply ? "pointer" : "not-allowed" }}
          onMouseEnter={e => { if (canApply) e.currentTarget.style.background = C.navy2; }}
          onMouseLeave={e => { if (canApply) e.currentTarget.style.background = C.navy; }}>
          Apply to {selectedQIds.size} question{selectedQIds.size !== 1 ? "s" : ""}
        </button>
      </div>
    </div>
  );
}

function AIGenerateModal({ sections, onInsert, onClose }) {
  const [step, setStep] = useState(1);
  const [option, setOption] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [targetSectionId, setTargetSectionId] = useState(sections[0]?.id ?? null);
  const [progressStep, setProgressStep] = useState(0);
  const [result, setResult] = useState(null);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const timerRef = useRef(null);

  function startGeneration() {
    setStep(3); setProgressStep(0); let cur = 0;
    timerRef.current = setInterval(() => {
      cur++;
      setProgressStep(cur);
      if (cur >= AI_LOADING_STEPS.length - 1) {
        clearInterval(timerRef.current);
        const r = generateFakeAIResult(option, prompt, targetSectionId, sections);
        setResult(r);
        setTimeout(() => setStep(4), 700);
      }
    }, 1500);
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  function handleClose() { if (step === 4) setDiscardConfirm(true); else onClose(); }

  const W = 560;
  const overlay = (children, clickClose = handleClose) => (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, fontFamily:F }}
      onClick={e => { if (e.target === e.currentTarget) clickClose(); }}>
      {children}
    </div>
  );

  if (step === 1) return overlay(
    <div style={{ background:C.white, borderRadius:14, width:W, boxShadow:"0 8px 40px rgba(0,0,0,0.20)" }}>
      <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.g2}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"#eef1ff", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2" strokeLinecap="round"><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/></svg>
          </div>
          <span style={{ fontSize:16, fontWeight:700, color:C.g6 }}>What would you like to generate?</span>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.g4, padding:4, display:"flex" }}><IconClose /></button>
      </div>
      <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:10 }}>
        {[
          { id:"section",   title:"Generate a full section",              desc:"Create a new section with questions, scoring, and actions all configured.", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="17" width="18" height="4" rx="1"/></svg> },
          { id:"questions", title:"Add questions to an existing section", desc:"Generate more questions for a section you've already started.",            icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
          { id:"scoring",   title:"Suggest scoring for current questions",desc:"Review your existing questions and recommend scoring values.",              icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg> },
        ].map(opt => (
          <button key={opt.id} onClick={() => { setOption(opt.id); setStep(2); }}
            style={{ display:"flex", alignItems:"flex-start", gap:14, background:"#eef1ff", border:`1.5px solid #c7cff7`, borderRadius:12, padding:"14px 16px", cursor:"pointer", textAlign:"left", width:"100%" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#dde4ff"; e.currentTarget.style.borderColor = "#c7cff7"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#eef1ff"; e.currentTarget.style.borderColor = "#c7cff7"; }}>
            <div style={{ flexShrink:0, marginTop:1 }}>{opt.icon}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F, marginBottom:3 }}>{opt.title}</div>
              <div style={{ fontSize:12, color:C.g5, fontFamily:F, lineHeight:"17px" }}>{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>, onClose
  );

  if (step === 2) {
    const placeholders = { section:"Describe the section to generate (e.g., 'Fire safety covering extinguishers, exits, and alarms')", questions:`What questions should be added to ${sections.find(s=>s.id===targetSectionId)?.name ?? "this section"}?`, scoring:"Any specific scoring rules or weights to follow?" };
    return overlay(
      <div style={{ background:C.white, borderRadius:14, width:W, boxShadow:"0 8px 40px rgba(0,0,0,0.20)" }}>
        <div style={{ padding:"16px 24px", borderBottom:`1px solid ${C.g2}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={() => { setStep(1); setPrompt(""); }} style={{ background:"none", border:"none", cursor:"pointer", color:C.g4, fontSize:13, fontFamily:F, display:"flex", alignItems:"center", gap:5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>Back
          </button>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.g4, padding:4, display:"flex" }}><IconClose /></button>
        </div>
        <div style={{ padding:"20px 24px" }}>
          {option === "questions" && sections.length > 0 && (
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.g5, fontFamily:F, display:"block", marginBottom:6 }}>Target section</label>
              <select value={targetSectionId ?? ""} onChange={e => setTargetSectionId(e.target.value)}
                style={{ width:"100%", fontFamily:F, fontSize:13, color:C.g6, border:`1px solid ${C.g3}`, borderRadius:8, padding:"8px 12px", outline:"none" }}>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
            placeholder={placeholders[option] ?? "Describe what you want…"}
            style={{ width:"100%", boxSizing:"border-box", fontFamily:F, fontSize:13, color:C.g6, border:`1px solid ${C.g3}`, borderRadius:8, padding:"10px 14px", outline:"none", resize:"vertical", lineHeight:"20px" }}
            onFocus={e => e.currentTarget.style.borderColor = C.navy}
            onBlur={e => e.currentTarget.style.borderColor = C.g3}
          />
          <p style={{ margin:"6px 0 0", fontSize:12, color:C.g4, lineHeight:"16px" }}>AI uses your template structure and audit best practices to generate content.</p>
        </div>
        <div style={{ padding:"0 24px 20px", display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button onClick={startGeneration} disabled={!prompt.trim()}
            style={{ background: prompt.trim() ? C.navy : C.g2, color: prompt.trim() ? C.white : C.g4, border:"none", borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:600, fontFamily:F, cursor: prompt.trim() ? "pointer" : "not-allowed" }}
            onMouseEnter={e => { if (prompt.trim()) e.currentTarget.style.background = C.navy2; }}
            onMouseLeave={e => { if (prompt.trim()) e.currentTarget.style.background = C.navy; }}>
            Generate
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, fontFamily:F }}>
      <div style={{ background:C.white, borderRadius:14, width:W, padding:"32px 36px", boxShadow:"0 8px 40px rgba(0,0,0,0.20)" }}>
        <div style={{ marginBottom:24, fontSize:16, fontWeight:700, color:C.g6 }}>Generating…</div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {AI_LOADING_STEPS.map((label, i) => {
            const done = i < progressStep; const active = i === progressStep;
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, background: done ? C.teal : active ? "#eef1ff" : C.g1, border: active ? `2px solid ${C.navy}` : "2px solid transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {done ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>
                       : active ? <div style={{ width:8, height:8, borderRadius:"50%", background:C.navy }} /> : null}
                </div>
                <span style={{ fontSize:13, color: done ? C.teal : active ? C.navy : C.g4, fontFamily:F, fontWeight: active ? 600 : 400 }}>{label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop:24, display:"flex", justifyContent:"flex-end" }}>
          <button onClick={() => { clearInterval(timerRef.current); setStep(2); setProgressStep(0); }}
            style={{ background:"none", border:`1px solid ${C.g3}`, borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:500, fontFamily:F, color:C.g5, cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  if (step === 4 && result) return overlay(
    <div style={{ background:C.white, borderRadius:14, width:W, maxHeight:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 8px 40px rgba(0,0,0,0.20)" }}>
      <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.g2}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <span style={{ fontSize:16, fontWeight:700, color:C.g6 }}>
          {result.type==="section" ? `Section: "${result.sectionName}"` : result.type==="questions" ? `Questions for ${result.sectionName}` : "Scoring suggestions"}
        </span>
        <button onClick={handleClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.g4, padding:4, display:"flex" }}><IconClose /></button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"16px 24px" }}>
        {(result.type==="section"||result.type==="questions") && result.questions.map((q,i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"9px 0", borderBottom:`1px solid ${C.g1}` }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:C.g6, fontFamily:F, lineHeight:"18px" }}>{q.title}</div>
              <div style={{ display:"flex", gap:6, marginTop:4, alignItems:"center" }}>
                <AnswerBadge value={q.answerType} />
                {q.score > 0 && <span style={{ fontSize:12, color:C.g4, fontFamily:F }}>{q.score} pts</span>}
                {q.actionSummary && q.actionSummary!=="None" && <span style={{ fontSize:12, color:C.g4, fontFamily:F }}>· {q.actionSummary}</span>}
              </div>
            </div>
          </div>
        ))}
        {result.type==="scoring" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto", borderRadius:8, overflow:"hidden", border:`1px solid ${C.g2}` }}>
            <div style={{ padding:"7px 12px", background:C.g1, fontSize:12, fontWeight:700, color:C.g4, textTransform:"uppercase" }}>Question</div>
            <div style={{ padding:"7px 12px", background:C.g1, fontSize:12, fontWeight:700, color:C.g4, textTransform:"uppercase", textAlign:"center" }}>Current</div>
            <div style={{ padding:"7px 12px", background:C.g1, fontSize:12, fontWeight:700, color:C.navy, textTransform:"uppercase", textAlign:"center" }}>Proposed</div>
            {result.suggestions.map((sg,i) => [
              <div key={`n${i}`} style={{ padding:"8px 12px", fontSize:12, color:C.g6, borderTop:`1px solid ${C.g2}` }}>{sg.qTitle.slice(0,50)}{sg.qTitle.length>50?"…":""}</div>,
              <div key={`c${i}`} style={{ padding:"8px 12px", fontSize:12, color:C.g5, borderTop:`1px solid ${C.g2}`, textAlign:"center", fontFamily:"monospace" }}>{sg.currentScore} pts</div>,
              <div key={`p${i}`} style={{ padding:"8px 12px", fontSize:12, fontWeight:600, color:C.navy, borderTop:`1px solid ${C.g2}`, textAlign:"center", fontFamily:"monospace" }}>{sg.proposedScore} pts</div>,
            ])}
          </div>
        )}
      </div>
      <div style={{ padding:"14px 24px", borderTop:`1px solid ${C.g2}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", gap:16 }}>
          <button onClick={() => { setStep(2); setResult(null); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:C.g5, fontFamily:F, fontWeight:500, padding:0 }}>Try again</button>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:C.g5, fontFamily:F, fontWeight:500, padding:0 }}>Discard</button>
        </div>
        <button onClick={() => { onInsert(result); onClose(); }}
          style={{ background:C.navy, color:C.white, border:"none", borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:600, fontFamily:F, cursor:"pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = C.navy2}
          onMouseLeave={e => e.currentTarget.style.background = C.navy}>
          Insert
        </button>
      </div>
      {discardConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000 }}>
          <div style={{ background:C.white, borderRadius:12, width:340, padding:"20px", boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.g6, marginBottom:8 }}>Discard generated content?</div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:16 }}>
              <button onClick={() => setDiscardConfirm(false)} style={{ background:"none", border:`1px solid ${C.g3}`, borderRadius:8, padding:"7px 16px", fontSize:13, fontFamily:F, color:C.g5, cursor:"pointer" }}>Keep</button>
              <button onClick={onClose} style={{ background:C.red, color:C.white, border:"none", borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:600, fontFamily:F, cursor:"pointer" }}>Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return null;
}

// ── Question Kebab Menu ───────────────────────────────────────────────────────

function QuestionKebabMenu({ onEdit, onDuplicate, onDelete, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);
  function mi(label, onClick, danger = false) {
    return <button key={label} onClick={() => { onClick(); onClose(); }}
      style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", padding:"7px 14px", fontSize:13, fontWeight:500, fontFamily:F, color: danger ? C.red : C.g6, cursor:"pointer" }}
      onMouseEnter={e => e.currentTarget.style.background = C.g1}
      onMouseLeave={e => e.currentTarget.style.background = "none"}>{label}</button>;
  }
  return (
    <div ref={ref} style={{ position:"absolute", top:"100%", right:0, zIndex:200, background:C.white, borderRadius:8, boxShadow:"0 4px 16px rgba(0,0,0,0.14)", border:`1px solid ${C.g2}`, minWidth:140, overflow:"hidden", marginTop:4 }}>
      {mi("Edit", onEdit)}
      {mi("Duplicate", onDuplicate)}
      <div style={{ height:1, background:C.g2 }} />
      {mi("Delete", onDelete, true)}
    </div>
  );
}

// ── Kebab Menu ────────────────────────────────────────────────────────────────

function KebabMenu({ onRename, onEditDetails, onDuplicate, onDelete, onClose }) {
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
    <div ref={ref} style={{ position: "absolute", top: "100%", right: 0, zIndex: 200, background: C.white, borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.14)", border: `1px solid ${C.g2}`, minWidth: 160, overflow: "hidden", marginTop: 4 }}>
      {onEditDetails && item("Edit details…", onEditDetails)}
      {item("Rename", onRename)}
      {item("Duplicate section", onDuplicate)}
      <div style={{ height: 1, background: C.g2 }}/>
      {item("Delete", onDelete, true)}
    </div>
  );
}

// ── Question Row ──────────────────────────────────────────────────────────────

function SortableQuestionRow({ question, isSelected, onSelect, onClick, onDelete, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }}>
      <QuestionRow question={question} isSelected={isSelected} onSelect={onSelect} onClick={onClick} onDelete={onDelete} onDuplicate={onDuplicate} dragProps={{ ...attributes, ...listeners }} />
    </div>
  );
}


const Q_COL = "18px 22px 1fr 130px 80px 44px 28px";

function QuestionRow({ question, isSelected, onSelect, onClick, onDelete, onDuplicate, dragProps = {} }) {
  const [hover, setHover] = useState(false);
  const [showKebab, setShowKebab] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "grid", gridTemplateColumns: Q_COL, gap: 6, padding: "7px 12px", alignItems: "center", background: isSelected ? "#eef1ff" : hover ? "#f8f9fb" : C.white, borderBottom: `1px solid ${C.g1}`, transition: "background 0.1s" }}
    >
      <div {...dragProps} style={{ color: hover ? C.g4 : C.g3, cursor: "grab", display: "flex", alignItems: "center", touchAction: "none" }}>
        <IconGrip />
      </div>
      <div onClick={e => { e.stopPropagation(); onSelect(); }} style={{ cursor: "pointer", display: "flex" }}>
        <Checkbox checked={isSelected} />
      </div>
      <span onClick={onClick} style={{ fontSize: 13, color: C.g6, fontFamily: F, lineHeight: "18px", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {question.title}
      </span>
      <div><AnswerBadge value={question.answerType} /></div>
      <div style={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "nowrap" }}>
        {question.required      && <SmallBadge label="Req"  bg="#fae5e6" color={C.red} />}
        {question.informational && <SmallBadge label="Info" bg="#d4e2ff" color="#001e76" />}
      </div>
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        <LogicIcons question={question} size={12} />
      </div>
      <div style={{ position: "relative" }}>
        <button onClick={e => { e.stopPropagation(); setShowKebab(k => !k); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: hover ? C.g4 : "transparent", padding: "2px 4px", display: "flex", alignItems: "center", borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.background = C.g1}
          onMouseLeave={e => e.currentTarget.style.background = "none"}>
          <IconDots />
        </button>
        {showKebab && <QuestionKebabMenu onEdit={onClick} onDuplicate={() => onDuplicate(question.id)} onDelete={() => onDelete(question.id)} onClose={() => setShowKebab(false)} />}
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
// SortableSectionCard passes all props including onDeleteQ and onDuplicateQ via spread

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

function SectionCard({ section, isWeighted, selectedQs, onSelectQ, onBulkSelectQ, onEditQ, onAddQ, onDeleteQ, onDuplicateQ, onToggleCollapse, onWeightChange, onRename, onEditDetails, onDuplicate, onDelete, onToggleGrid, onUpdateGrid, methodology, dragProps = {} }) {
  const [showKebab, setShowKebab]       = useState(false);
  const [editingName, setEditingName]   = useState(false);
  const [nameVal, setNameVal]           = useState(section.name);
  const [weightVal, setWeightVal]       = useState(String(section.weight ?? 0));
  const [search, setSearch]             = useState("");
  const [typeFilter, setTypeFilter]     = useState("");

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
    <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 12, marginBottom: 10, overflow: "visible" }}>
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
            autoFocus style={{ flex: 1, fontSize: 14, fontWeight: 700, color: C.g6, fontFamily: F, border: `1px solid ${C.navy}`, borderRadius: 4, padding: "3px 7px", outline: "none", background: C.white }}
          />
        ) : (
          <span onClick={() => setEditingName(true)} title="Click to rename"
            style={{ fontSize: 14, fontWeight: 700, color: C.g6, fontFamily: F, flex: 1, cursor: "text" }}
          >{section.name}</span>
        )}

        {/* Question count badge */}
        <span style={{ fontSize: 12, fontWeight: 600, color: C.g4, fontFamily: F, background: C.g1, borderRadius: 12, padding: "2px 8px", flexShrink: 0 }}>
          {qLabel}
        </span>

        {/* Grid badge when active */}
        {section.isGrid && (
          <span style={{ fontSize: 10, fontWeight: 700, fontFamily: F, color: "#1e40af", background: "#d4e2ff", borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>
            Grid
          </span>
        )}

        {/* Grid toggle button */}
        <button
          onClick={() => onToggleGrid(section.id)}
          title={section.isGrid ? "Switch to question list" : "Switch to grid section"}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 12, fontWeight: 600, fontFamily: F,
            color: section.isGrid ? C.navy : C.g4,
            background: section.isGrid ? "#eef1ff" : "none",
            border: section.isGrid ? `1px solid #c7cff7` : `1px dashed ${C.g3}`,
            borderRadius: 4, padding: "2px 8px", cursor: "pointer", flexShrink: 0,
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
              style={{ width: 50, textAlign: "center", fontSize: 13, fontFamily: F, color: C.g6, border: `1px solid ${C.g3}`, borderRadius: 4, padding: "3px 6px", outline: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = C.navy}
              onBlur2={e => e.currentTarget.style.borderColor = C.g3}
            />
            <span style={{ fontSize: 12, color: C.g4, fontFamily: F }}>%</span>
          </div>
        )}

        <div style={{ position: "relative", flexShrink: 0 }}>
          <button onClick={() => setShowKebab(k => !k)}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, display: "flex", alignItems: "center", padding: 4, borderRadius: 4 }}
            onMouseEnter={e => { e.currentTarget.style.background = C.g1; e.currentTarget.style.color = C.g6; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.g4; }}
          ><IconDots /></button>
          {showKebab && (
            <KebabMenu
              onRename={() => setEditingName(true)}
              onEditDetails={onEditDetails}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onClose={() => setShowKebab(false)}
            />
          )}
        </div>
      </div>

      {/* Body */}
      {!section.collapsed && (
        <div>
          {section.isGrid ? (
            <div style={{ padding: "8px 12px" }}>
              <GridSection
                section={section}
                methodology={methodology}
                onUpdate={(gridData) => onUpdateGrid(section.id, gridData)}
                onToggleOff={() => onToggleGrid(section.id)}
              />
            </div>
          ) : (
            <>
              {/* Search + type filter toolbar */}
              <div style={{ display: "flex", gap: 8, padding: "8px 12px", borderBottom: `1px solid ${C.g2}`, alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <svg style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: C.g4, pointerEvents: "none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions…"
                    style={{ width: "100%", boxSizing: "border-box", paddingLeft: 26, paddingRight: 8, paddingTop: 5, paddingBottom: 5, fontSize: 12, fontFamily: F, border: `1px solid ${C.g2}`, borderRadius: 6, outline: "none", color: C.g6, background: C.white }} />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  style={{ padding: "5px 8px", fontSize: 12, fontFamily: F, border: `1px solid ${C.g2}`, borderRadius: 6, color: typeFilter ? C.g6 : C.g4, background: C.white, cursor: "pointer", outline: "none" }}>
                  <option value="">All types</option>
                  {[...new Set(section.questions.map(q => q.answerType))].sort().map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Column headers */}
              {section.questions.length > 0 && (() => {
                const filteredQs = section.questions.filter(q =>
                  (!search || q.title.toLowerCase().includes(search.toLowerCase())) &&
                  (!typeFilter || q.answerType === typeFilter)
                );
                const allSel = filteredQs.length > 0 && filteredQs.every(q => selectedQs.has(q.id));
                return (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: Q_COL, gap: 6, padding: "5px 12px", background: C.g1, borderBottom: `1px solid ${C.g2}`, alignItems: "center" }}>
                      <div />
                      <div onClick={() => onBulkSelectQ(filteredQs.map(q => q.id), !allSel)} style={{ cursor: "pointer", display: "flex" }}>
                        <Checkbox checked={allSel} />
                      </div>
                      {["Question", "Type", "Status", "Logic", ""].map((h, i) => (
                        <span key={i} style={{ fontSize: 11, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: F }}>{h}</span>
                      ))}
                    </div>

                    <SortableContext items={filteredQs.map(q => q.id)} strategy={verticalListSortingStrategy}>
                      <div>
                        {filteredQs.map(q => (
                          <SortableQuestionRow key={q.id} question={q} isSelected={selectedQs.has(q.id)} onSelect={() => onSelectQ(q.id)} onClick={() => onEditQ(q)} onDelete={onDeleteQ} onDuplicate={onDuplicateQ} />
                        ))}
                        {filteredQs.length === 0 && (
                          <div style={{ padding: "12px", fontSize: 12, color: C.g4, fontFamily: F, textAlign: "center" }}>No matching questions</div>
                        )}
                      </div>
                    </SortableContext>
                  </>
                );
              })()}

              <div style={{ padding: "8px 12px" }}>
                <button onClick={() => onAddQ(section.id)}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px dashed ${C.g3}`, borderRadius: 6, padding: "6px 12px", width: "100%", fontSize: 12, fontWeight: 500, color: C.g4, fontFamily: F, cursor: "pointer", transition: "color 0.1s, border-color 0.1s", boxSizing: "border-box" }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
                  onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
                ><IconPlus size={12} /> Add question</button>
              </div>
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
        style={{ flex: 1, fontFamily: F, fontSize: 13, color: C.g6, border: `1px solid ${C.navy}`, borderRadius: 8, padding: "8px 12px", outline: "none", background: C.white }}
      />
      <button onClick={onConfirm} disabled={!value.trim()}
        style={{ background: value.trim() ? C.navy : C.g2, color: value.trim() ? C.white : C.g4, border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: value.trim() ? "pointer" : "not-allowed" }}
      >Add</button>
      <button onClick={onCancel}
        style={{ background: "none", border: `1px solid ${C.g3}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer" }}
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
          <span style={{ fontSize: 16, fontWeight: 700, color: C.g6 }}>
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
            style={{ background: "none", border: `1px solid ${C.g3}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer" }}
          >Cancel</button>
          <button onClick={onConfirm}
            style={{ background: C.navy, color: C.white, border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = C.navy2}
            onMouseLeave={e => e.currentTarget.style.background = C.navy}
          >{isOn ? "Switch to Grid" : "Switch to Questions"}</button>
        </div>
      </div>
    </div>
  );
}

export default function QuestionList({ formData, onChange, onNext, onBack, methodology }) {
  const isWeighted = methodology === "weighted";

  const [sections, setSections]       = useState(() => formData?.sections ?? DEFAULT_SECTIONS);
  const [selectedQs, setSelectedQs]   = useState(new Set());
  const [editingQ, setEditingQ]       = useState(null); // { q, sectionId, isNew }
  const [editingSection, setEditingSection] = useState(null); // section.id | null
  const [showFixMath, setShowFixMath] = useState(false);
  const [activeId, setActiveId]       = useState(null);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [toastMsg, setToastMsg]       = useState(null);
  const [gridConfirmModal, setGridConfirmModal] = useState(null);
  const [bulkMenuOpen, setBulkMenuOpen]         = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(null);
  const [bulkMoveModal, setBulkMoveModal]       = useState(false);
  const [deleteDepsModal, setDeleteDepsModal]   = useState(null);
  const [applyConfigPanel, setApplyConfigPanel] = useState(null);
  const [applyConfigConfirm, setApplyConfigConfirm] = useState(null);
  const [aiModal, setAiModal]                   = useState(false);
  const [globalSearch, setGlobalSearch]         = useState("");
  const [globalTypeFilter, setGlobalTypeFilter] = useState("");

  const sectionsRef = useRef(sections);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const totalWeight = sections.reduce((s, sec) => s + Number(sec.weight ?? 0), 0);
  const weightError = isWeighted && Math.round(totalWeight) !== 100;

  function emit(secs) {
    onChange({ sections: secs });
  }

  function showToast(msg) { setToastMsg(msg); }

  function handleSelectQ(id) {
    setSelectedQs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handleBulkSelectQ(ids, forceAdd) {
    setSelectedQs(prev => {
      const n = new Set(prev);
      ids.forEach(id => forceAdd ? n.add(id) : n.delete(id));
      return n;
    });
  }

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

  // Save section details from SectionEditor modal. Patch may include _rebalance
  // (an array of { id, afterWeight }) when the user accepted the auto-rebalance.
  function handleSaveSection(patch) {
    if (!editingSection) return;
    const { _rebalance, ...fields } = patch || {};
    let next = sections.map(s => {
      if (s.id !== editingSection) return s;
      return { ...s, ...fields };
    });
    if (_rebalance && Array.isArray(_rebalance)) {
      const map = Object.fromEntries(_rebalance.map(r => [r.id, r.afterWeight]));
      next = next.map(s => map[s.id] !== undefined ? { ...s, weight: map[s.id] } : s);
    }
    setSections(next); emit(next); setEditingSection(null);
  }

  // Save current section, then open the next one in the list.
  function handleSaveAndNextSection(patch) {
    if (!editingSection) return;
    const { _rebalance, ...fields } = patch || {};
    let next = sections.map(s => {
      if (s.id !== editingSection) return s;
      return { ...s, ...fields };
    });
    if (_rebalance && Array.isArray(_rebalance)) {
      const map = Object.fromEntries(_rebalance.map(r => [r.id, r.afterWeight]));
      next = next.map(s => map[s.id] !== undefined ? { ...s, weight: map[s.id] } : s);
    }
    setSections(next); emit(next);

    const idx = next.findIndex(s => s.id === editingSection);
    const nextSec = idx >= 0 ? next[idx + 1] : null;
    if (nextSec) {
      setEditingSection(nextSec.id);
    } else {
      setEditingSection(null);
      showToast("Saved — last section in this template.");
    }
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

  function handleAutoBalance(preview) {
    const next = sections.map((s, i) => ({ ...s, weight: preview[i].afterWeight }));
    setSections(next); emit(next); setShowFixMath(false);
    showToast("Weights rebalanced");
  }

  function doDeleteQuestions(qIds) {
    const deletedIds = [...qIds];
    const updatedCount = sections.flatMap(s => s.questions).filter(q => {
      if (qIds.has(q.id)) return false;
      const refs = collectConditionalQIds(q.conditional);
      return [...refs].some(id => qIds.has(id));
    }).length;
    const next = sections.map(s => ({
      ...s,
      questions: s.questions
        .filter(q => !qIds.has(q.id))
        .map(q => ({ ...q, conditional: purgeConditionalRefs(q.conditional, deletedIds) })),
    }));
    setSections(next); emit(next);
    setSelectedQs(prev => { const n = new Set(prev); deletedIds.forEach(id => n.delete(id)); return n; });
    setDeleteDepsModal(null); setBulkDeleteConfirm(null);
    const base = qIds.size === 1 ? "Question deleted" : `${qIds.size} questions deleted`;
    showToast(updatedCount > 0 ? `${base}. ${updatedCount} conditional rule(s) updated.` : base);
  }

  function handleDeleteQuestion(qId) {
    const deps = findDependents([qId], sections);
    if (deps.length > 0) setDeleteDepsModal({ qIds: new Set([qId]), deps });
    else doDeleteQuestions(new Set([qId]));
  }

  function handleDuplicateQuestion(qId) {
    const src = sections.flatMap(s => s.questions).find(q => q.id === qId);
    if (!src) return;
    const copy = { ...src, id: genId("q"), title: src.title + " (copy)" };
    const next = sections.map(s => {
      const idx = s.questions.findIndex(q => q.id === qId);
      if (idx === -1) return s;
      const qs = [...s.questions]; qs.splice(idx + 1, 0, copy);
      return { ...s, questions: qs };
    });
    setSections(next); emit(next);
  }

  function handleBulkDelete() {
    setBulkMenuOpen(false);
    const deps = findDependents([...selectedQs], sections);
    if (deps.length > 0) setDeleteDepsModal({ qIds: selectedQs, deps });
    else setBulkDeleteConfirm({ count: selectedQs.size });
  }

  function handleBulkDuplicate() {
    setBulkMenuOpen(false);
    const next = sections.map(s => {
      const qs = [];
      for (const q of s.questions) {
        qs.push(q);
        if (selectedQs.has(q.id)) qs.push({ ...q, id: genId("q"), title: q.title + " (copy)" });
      }
      return { ...s, questions: qs };
    });
    setSections(next); emit(next);
    showToast(`Duplicated ${selectedQs.size} question${selectedQs.size !== 1 ? "s" : ""}`);
  }

  function handleBulkMove(targetSectionId) {
    const movers = [];
    const next = sections
      .map(s => ({ ...s, questions: s.questions.filter(q => { if (selectedQs.has(q.id)) { movers.push(q); return false; } return true; }) }))
      .map(s => s.id === targetSectionId ? { ...s, questions: [...s.questions, ...movers] } : s);
    setSections(next); emit(next);
    setSelectedQs(new Set()); setBulkMoveModal(false);
    showToast(`Moved ${movers.length} question${movers.length !== 1 ? "s" : ""}`);
  }

  function handleBulkMark(field, value) {
    const next = sections.map(s => ({ ...s, questions: s.questions.map(q => !selectedQs.has(q.id) ? q : { ...q, [field]: value }) }));
    setSections(next); emit(next);
    showToast(`${selectedQs.size} question${selectedQs.size !== 1 ? "s" : ""} updated`);
  }

  function handleApplyConfig() {
    const { qIds, sourceQ, fields } = applyConfigConfirm;
    const next = sections.map(s => ({
      ...s, questions: s.questions.map(q => {
        if (!qIds.has(q.id)) return q;
        const u = {};
        if (fields.has("scoring"))     u.scoring    = { ...sourceQ.scoring };
        if (fields.has("media"))       u.media      = { ...sourceQ.media };
        if (fields.has("actions"))     u.action     = { ...sourceQ.action };
        if (fields.has("escalation"))  u.escalation = { ...sourceQ.escalation };
        if (fields.has("conditional")) u.conditional= { ...sourceQ.conditional };
        return { ...q, ...u };
      }),
    }));
    setSections(next); emit(next);
    setApplyConfigConfirm(null); setApplyConfigPanel(null); setSelectedQs(new Set());
    showToast(`Applied config to ${qIds.size} question${qIds.size !== 1 ? "s" : ""}`);
  }

  function handleAIInsert(result) {
    let next = sections;
    if (result.type === "section") {
      const newSec = {
        id: genId("sec"), name: result.sectionName, weight: 0, collapsed: false, isGrid: false, gridData: null,
        questions: result.questions.map(q => ({ id: genId("q"), title: q.title, answerType: q.answerType, required: false, critical: false, informational: false, instructions: "", typeConfig: {}, inBank: false, scoring: q.score ? { points: q.score } : {}, media: {}, action: { type: "none" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } })),
      };
      next = [...sections, newSec];
    } else if (result.type === "questions") {
      next = sections.map(s => s.id !== result.sectionId ? s : { ...s, questions: [...s.questions, ...result.questions.map(q => ({ id: genId("q"), title: q.title, answerType: q.answerType, required: false, critical: false, informational: false, instructions: "", typeConfig: {}, inBank: false, scoring: q.score ? { points: q.score } : {}, media: {}, action: { type: "none" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } }))] });
    } else if (result.type === "scoring") {
      next = sections.map(s => ({ ...s, questions: s.questions.map(q => { const sg = result.suggestions.find(x => x.qId === q.id); return sg ? { ...q, scoring: { ...q.scoring, points: sg.proposedScore } } : q; }) }));
    }
    setSections(next); emit(next);
    showToast("AI content inserted");
  }

  // ── Bank handlers ────────────────────────────────────────────────────────────

  function handleAddSectionFromBank(bankSection) {
    const newSec = {
      id: genId("sec"),
      name: bankSection.name,
      weight: 0,
      collapsed: false,
      isGrid: false,
      gridData: null,
      questions: (bankSection.questions || []).map(q => ({
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
    showToast(`Added section "${bankSection.name}" with ${newSec.questions.length} question${newSec.questions.length !== 1 ? "s" : ""}`);
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

  // Multi-add: append all selected sections at once (skips per-section question-pick modal)
  function handleAddManySectionsFromBank(bankSections) {
    if (!bankSections || bankSections.length === 0) return;
    const newSections = bankSections.map(bs => ({
      id: genId("sec"),
      name: bs.name,
      weight: 0,
      collapsed: false,
      isGrid: false,
      gridData: null,
      questions: (bs.questions || []).map(bq => ({
        id: genId("q"),
        title: bq.title,
        answerType: bq.answerType,
        required: bq.required ?? false,
        critical: false, informational: false, instructions: "",
        typeConfig: {}, inBank: true, scoring: {}, media: {},
        action: { type: "none" }, escalation: { rules: [] },
        conditional: { operator: "AND", items: [] },
      })),
    }));
    const next = [...sections, ...newSections];
    setSections(next); emit(next);
    showToast(`Added ${bankSections.length} section${bankSections.length === 1 ? "" : "s"}`);
  }

  // Cherry-pick add: create a new section named after the catalog section,
  // populated with only the questions the user picked from its preview.
  function handleAddPickedAsSection(bankSection, pickedQuestions) {
    if (!pickedQuestions || pickedQuestions.length === 0) return;
    const newSec = {
      id: genId("sec"),
      name: bankSection.name,
      weight: 0,
      collapsed: false,
      isGrid: false,
      gridData: null,
      questions: pickedQuestions.map(bq => ({
        id: genId("q"),
        title: bq.title,
        answerType: bq.answerType,
        required: bq.required ?? false,
        critical: false, informational: false, instructions: "",
        typeConfig: {}, inBank: true, scoring: {}, media: {},
        action: { type: "none" }, escalation: { rules: [] },
        conditional: { operator: "AND", items: [] },
      })),
    };
    const next = [...sections, newSec];
    setSections(next); emit(next);
    showToast(
      pickedQuestions.length === 1
        ? `Added 1 question as new section "${bankSection.name}"`
        : `Added ${pickedQuestions.length} questions as new section "${bankSection.name}"`
    );
  }

  // Multi-add: append all selected questions to the last section
  function handleAddManyQuestionsFromBank(bankQuestions) {
    if (!bankQuestions || bankQuestions.length === 0) return;
    if (sections.length === 0) {
      showToast("Add a section first, then use question bank items.");
      return;
    }
    const targetSection = sections[sections.length - 1];
    const newQuestions = bankQuestions.map(bq => ({
      id: genId("q"),
      title: bq.title,
      answerType: bq.answerType,
      required: bq.required ?? false,
      critical: false, informational: false, instructions: "",
      typeConfig: {}, inBank: true, scoring: {}, media: {},
      action: { type: "none" }, escalation: { rules: [] },
      conditional: { operator: "AND", items: [] },
    }));
    const next = sections.map(s => s.id === targetSection.id ? { ...s, questions: [...s.questions, ...newQuestions] } : s);
    setSections(next); emit(next);
    showToast(`Added ${bankQuestions.length} question${bankQuestions.length === 1 ? "" : "s"} to ${targetSection.name}`);
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
      <div style={{ flex: 1, overflowY: "auto" }}>
        {editingQ && (() => {
          const allQuestionsFlat = sections.flatMap(s => s.questions);
          const currentIdx = allQuestionsFlat.findIndex(q => q.id === editingQ.q.id);
          const priorQuestions = editingQ.isNew ? allQuestionsFlat : allQuestionsFlat.slice(0, currentIdx);
          const followQuestions = editingQ.isNew ? [] : allQuestionsFlat.slice(currentIdx + 1);
          const sectionName = sections.find(s => s.id === editingQ.sectionId)?.name ?? "";
          return (
            <QuestionBuilder
              question={editingQ.q}
              isNew={editingQ.isNew}
              methodology={methodology}
              sectionName={sectionName}
              priorQuestions={priorQuestions}
              followQuestions={followQuestions}
              onSave={handleSaveQ}
              onClose={() => setEditingQ(null)}
            />
          );
        })()}
        {!editingQ && <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px 80px" }}>

          {/* Page title */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 5px", fontSize: 20, fontWeight: 700, color: C.g6, fontFamily: F }}>Sections &amp; Questions</h2>
            <p style={{ margin: 0, fontSize: 13, color: C.g5, fontFamily: F }}>Add sections to group related questions, then add questions to each section. Drag to reorder.</p>
          </div>

          {/* Global search + type filter */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                placeholder="Search sections and questions…"
                style={{ width: "100%", boxSizing: "border-box", paddingLeft: 32, paddingRight: globalSearch ? 30 : 12, paddingTop: 8, paddingBottom: 8,
                  fontSize: 13, fontFamily: F, color: C.g6, background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, outline: "none" }}
                onFocus={e => e.target.style.borderColor = C.navy}
                onBlur={e => e.target.style.borderColor = C.g2}
              />
              {globalSearch && (
                <button onClick={() => setGlobalSearch("")}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.g4, display: "flex", padding: 2 }}>
                  <IconClose />
                </button>
              )}
            </div>
            <select value={globalTypeFilter} onChange={e => setGlobalTypeFilter(e.target.value)}
              style={{ padding: "8px 10px", fontSize: 13, fontFamily: F, border: `1px solid ${C.g2}`, borderRadius: 8, color: globalTypeFilter ? C.g6 : C.g4, background: C.white, cursor: "pointer", outline: "none", flexShrink: 0 }}>
              <option value="">All types</option>
              {[...new Set(sections.flatMap(s => s.questions.map(q => q.answerType)))].sort().map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Header controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {isWeighted && (
              weightError
                ? (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <button onClick={() => setShowFixMath(true)}
                      style={{ display:"flex", alignItems:"center", gap:5, background:C.amberBg, border:"1px solid #fcd34d", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:600, color:C.amber, fontFamily:F, cursor:"pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fef3c7"}
                      onMouseLeave={e => e.currentTarget.style.background = C.amberBg}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background:C.red, display:"inline-block", flexShrink:0 }} />
                      Fix Math
                    </button>
                    <span style={{ fontSize:12, color:C.amber, fontFamily:F }}>Weights total {totalWeight}% — Fix to 100%</span>
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:C.teal, fontFamily:F, fontWeight:500 }}>
                    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke={C.teal} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>
                    Math balanced
                  </div>
                )
            )}

            <div style={{ flex: 1 }} />

            {selectedQs.size > 0 && (
              <div style={{ position:"relative" }}>
                <button onClick={() => setBulkMenuOpen(o => !o)}
                  style={{ display:"flex", alignItems:"center", gap:5, background:C.navy, color:C.white, border:"none", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:600, fontFamily:F, cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.navy2}
                  onMouseLeave={e => e.currentTarget.style.background = C.navy}>
                  Bulk actions ({selectedQs.size})
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {bulkMenuOpen && (
                  <BulkActionsMenu
                    selectedQIds={selectedQs}
                    allSections={sections}
                    onDelete={handleBulkDelete}
                    onDuplicate={handleBulkDuplicate}
                    onMove={() => { setBulkMenuOpen(false); setBulkMoveModal(true); }}
                    onMark={(field, val) => handleBulkMark(field, val)}
                    onApplyConfig={() => { setBulkMenuOpen(false); setApplyConfigPanel({ qIds: selectedQs }); }}
                    onClose={() => setBulkMenuOpen(false)}
                  />
                )}
              </div>
            )}
            {selectedQs.size > 0 && (
              <button onClick={() => setSelectedQs(new Set())}
                style={{ fontSize:12, fontWeight:500, color:C.g5, background:"none", border:`1px solid ${C.g3}`, borderRadius:6, padding:"5px 10px", fontFamily:F, cursor:"pointer" }}>
                Clear
              </button>
            )}

            {featureFlags.aiTemplateSearch && (
              <button onClick={() => setAiModal(true)}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "#eef1ff", border: `1px solid #c7cff7`, borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: C.navy, fontFamily: F, cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#dde4ff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#eef1ff"; }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>
                </svg>
                AI Generate
              </button>
            )}

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
          ) : (globalSearch.trim() || globalTypeFilter) ? (() => {
            const q = globalSearch.trim().toLowerCase();
            const filteredSections = sections.reduce((acc, sec) => {
              const secMatch = q && sec.name.toLowerCase().includes(q) && !globalTypeFilter;
              const matchingQs = sec.questions.filter(question =>
                (!q || question.title.toLowerCase().includes(q)) &&
                (!globalTypeFilter || question.answerType === globalTypeFilter)
              );
              if (!secMatch && matchingQs.length === 0) return acc;
              acc.push(secMatch ? sec : { ...sec, questions: matchingQs, collapsed: false });
              return acc;
            }, []);
            const totalQs = filteredSections.reduce((n, s) => n + s.questions.length, 0);
            return (
              <>
                <div style={{ fontSize: 12, color: C.g4, fontFamily: F, marginBottom: 10 }}>
                  {filteredSections.length} section{filteredSections.length !== 1 ? "s" : ""}, {totalQs} question{totalQs !== 1 ? "s" : ""}
                </div>
                {filteredSections.length === 0 ? (
                  <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.g5, fontFamily: F }}>
                    No results{globalSearch ? ` for "${globalSearch}"` : ""}{globalTypeFilter ? ` · ${globalTypeFilter}` : ""}
                  </div>
                  </div>
                ) : filteredSections.map(section => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    isWeighted={isWeighted}
                    selectedQs={selectedQs}
                    onSelectQ={handleSelectQ}
                    onBulkSelectQ={handleBulkSelectQ}
                    onEditQ={q => setEditingQ({ q, sectionId: section.id, isNew: false })}
                    onAddQ={sectionId => setEditingQ({ q: { title: "", answerType: "", required: false, critical: false, informational: false, instructions: "", typeConfig: {}, inBank: false, scoring: {}, media: {}, action: { type: "" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } }, sectionId, isNew: true })}
                    onDeleteQ={handleDeleteQuestion}
                    onDuplicateQ={handleDuplicateQuestion}
                    onToggleCollapse={() => handleToggleCollapse(section.id)}
                    onWeightChange={v => handleWeightChange(section.id, v)}
                    onRename={name => handleRename(section.id, name)}
                    onEditDetails={() => setEditingSection(section.id)}
                    onDuplicate={() => handleDuplicate(section.id)}
                    onDelete={() => handleDeleteSection(section.id)}
                    onToggleGrid={handleToggleGrid}
                    onUpdateGrid={handleUpdateGrid}
                    methodology={methodology}
                  />
                ))}
              </>
            );
          })() : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {sections.map(section => (
                  <SortableSectionCard
                    key={section.id}
                    section={section}
                    isWeighted={isWeighted}
                    selectedQs={selectedQs}
                    onSelectQ={handleSelectQ}
                    onBulkSelectQ={handleBulkSelectQ}
                    onEditQ={q => setEditingQ({ q, sectionId: section.id, isNew: false })}
                    onAddQ={sectionId => setEditingQ({ q: { title: "", answerType: "", required: false, critical: false, informational: false, instructions: "", typeConfig: {}, inBank: false, scoring: {}, media: {}, action: { type: "" }, escalation: { rules: [] }, conditional: { operator: "AND", items: [] } }, sectionId, isNew: true })}
                    onDeleteQ={handleDeleteQuestion}
                    onDuplicateQ={handleDuplicateQuestion}
                    onToggleCollapse={() => handleToggleCollapse(section.id)}
                    onWeightChange={v => handleWeightChange(section.id, v)}
                    onRename={name => handleRename(section.id, name)}
                    onEditDetails={() => setEditingSection(section.id)}
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
                  <div style={{ background: C.white, border: `1px solid ${C.navy}`, borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.14)" }}>
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

        </div>}</div>

      <BanksPanel
        sections={sections}
        onAddSectionFromBank={handleAddSectionFromBank}
        onAddQuestionFromBank={handleAddQuestionFromBank}
        onAddManySectionsFromBank={handleAddManySectionsFromBank}
        onAddManyQuestionsFromBank={handleAddManyQuestionsFromBank}
        onAddPickedAsSection={handleAddPickedAsSection}
        onToast={showToast}
      />

      {editingSection && (() => {
        const sec = sections.find(s => s.id === editingSection);
        if (!sec) return null;
        const idx = sections.findIndex(s => s.id === editingSection);
        const hasNextSec = idx >= 0 && idx < sections.length - 1;
        return (
          <SectionEditor
            section={sec}
            allSections={sections}
            methodology={methodology}
            onSave={handleSaveSection}
            onSaveAndNext={handleSaveAndNextSection}
            hasNext={hasNextSec}
            onClose={() => setEditingSection(null)}
          />
        );
      })()}
      {showFixMath && (
        <FixMathModal sections={sections} onApply={handleAutoBalance} onClose={() => setShowFixMath(false)} />
      )}
      {bulkDeleteConfirm && (
        <BulkDeleteConfirmModal count={bulkDeleteConfirm.count} onConfirm={() => doDeleteQuestions(selectedQs)} onClose={() => setBulkDeleteConfirm(null)} />
      )}
      {bulkMoveModal && (
        <BulkMoveModal sections={sections} onMove={handleBulkMove} onClose={() => setBulkMoveModal(false)} />
      )}
      {deleteDepsModal && (
        <DeleteDepsModal qIds={deleteDepsModal.qIds} deps={deleteDepsModal.deps} onConfirm={() => doDeleteQuestions(deleteDepsModal.qIds)} onClose={() => setDeleteDepsModal(null)} />
      )}
      {applyConfigConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:450, fontFamily:F }}>
          <div style={{ background:C.white, borderRadius:12, width:420, boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ padding:"18px 20px 0" }}>
              <div style={{ fontSize:16, fontWeight:700, color:C.g6 }}>Apply config?</div>
              <div style={{ fontSize:13, color:C.g5, marginTop:8, lineHeight:"19px" }}>
                This will overwrite <strong>{[...applyConfigConfirm.fields].map(k => APPLY_FIELDS.find(f => f.key===k)?.label ?? k).join(", ")}</strong> on <strong>{applyConfigConfirm.qIds.size} question{applyConfigConfirm.qIds.size !== 1 ? "s" : ""}</strong>. Other settings stay unchanged.
              </div>
            </div>
            <div style={{ padding:"16px 20px", display:"flex", gap:8, justifyContent:"flex-end", borderTop:`1px solid ${C.g2}`, marginTop:16 }}>
              <button onClick={() => setApplyConfigConfirm(null)} style={{ background:"none", border:`1px solid ${C.g3}`, borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:500, fontFamily:F, color:C.g5, cursor:"pointer" }}>Cancel</button>
              <button onClick={handleApplyConfig} style={{ background:C.navy, color:C.white, border:"none", borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:600, fontFamily:F, cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.navy2}
                onMouseLeave={e => e.currentTarget.style.background = C.navy}>Apply</button>
            </div>
          </div>
        </div>
      )}
      {applyConfigPanel && (
        <ApplyConfigPanel selectedQIds={applyConfigPanel.qIds} allSections={sections} onApplyRequest={req => setApplyConfigConfirm(req)} onClose={() => setApplyConfigPanel(null)} />
      )}
      {aiModal && (
        <AIGenerateModal sections={sections} onInsert={handleAIInsert} onClose={() => setAiModal(false)} />
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
