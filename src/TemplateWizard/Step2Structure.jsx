// Implements: TLP-18 + TLP-82 (section/question banks), TLP-119 (drag-and-drop)
// TLP-8: Keyboard DnD — Space to pick up, ArrowUp/Down to move, Space to drop, Escape to cancel
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
  success:      "#059669",
  successBg:    "#ecfdf5",
  error:        "#dc2626",
  errorBg:      "#fef2f2",
  warning:      "#b45309",
  warningBg:    "#fffbeb",
};
const FOCUS_RING = "0 0 0 2px #fff, 0 0 0 4px #2226f7";

const MODULES = ["Loss Prevention","Health & Safety","Fire Safety","Operations","OSHA","PPE"];

function uid() { return `i-${Date.now()}-${Math.floor(Math.random() * 9999)}`; }

function sectionFromBank(s) {
  return {
    id: uid(),
    name: s.name,
    category: s.cat,
    collapsed: false,
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
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 6px", borderRadius: 4,
      fontSize: 9, fontWeight: 600, fontFamily: F,
      background: bg, color, whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

// ── Drop-zone visual strip ────────────────────────────────────────────────────

function SectionGap({ insertAt, dragRef, dropZone, setDropZone, onDropSection }) {
  const dtype = dragRef.current?.type;
  const accepts = dtype === "panel-section" || dtype === "canvas-section";
  const isActive = dropZone?.kind === "section-gap" && dropZone?.at === insertAt;

  return (
    <div
      onDragOver={e => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = accepts ? "move" : "none";
        setDropZone({ kind: "section-gap", at: insertAt, valid: accepts });
      }}
      onDragLeave={() => setDropZone(null)}
      onDrop={e => {
        e.preventDefault();
        e.stopPropagation();
        if (accepts) onDropSection(insertAt);
        setDropZone(null);
      }}
      style={{
        height: isActive ? 36 : 8,
        margin: "0 0",
        borderRadius: 6,
        border: isActive ? `2px dashed ${isActive && dropZone.valid ? C.primary : C.error}` : "2px dashed transparent",
        background: isActive ? (dropZone.valid ? C.primaryBg : C.errorBg) : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "height 0.12s, border-color 0.12s",
        flexShrink: 0,
      }}
    >
      {isActive && dropZone.valid && (
        <span style={{ fontSize: 10, color: C.primary, fontFamily: F, fontWeight: 600 }}>
          Drop section here
        </span>
      )}
    </div>
  );
}

function QuestionGap({ sectionIdx, insertAt, dragRef, dropZone, setDropZone, onDropQuestion }) {
  const dtype = dragRef.current?.type;
  const accepts = dtype === "panel-question" || dtype === "canvas-question";
  const isActive = dropZone?.kind === "question-gap" && dropZone?.sectionIdx === sectionIdx && dropZone?.at === insertAt;

  return (
    <div
      onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDropZone({ kind: "question-gap", sectionIdx, at: insertAt, valid: accepts }); }}
      onDragLeave={() => setDropZone(null)}
      onDrop={e => { e.preventDefault(); e.stopPropagation(); if (accepts) onDropQuestion(sectionIdx, insertAt); setDropZone(null); }}
      style={{
        height: isActive ? 28 : 4,
        borderRadius: 4,
        border: isActive ? `2px dashed ${dropZone.valid ? C.primary : C.error}` : "2px dashed transparent",
        background: isActive ? (dropZone.valid ? C.primaryBg : C.errorBg) : "transparent",
        transition: "height 0.1s",
        flexShrink: 0,
      }}
    />
  );
}

// ── Question row in canvas ────────────────────────────────────────────────────

function QuestionRow({ q, sectionIdx, qIdx, dragRef, onRemove, isConditional, onKbPickup }) {
  const tm = TYPE_META[q.type] || { color: C.textSec, bg: C.bgApp };
  const [hov, setHov] = useState(false);

  return (
    <div
      draggable
      onDragStart={() => {
        dragRef.current = { type: "canvas-question", sectionIdx, questionIdx: qIdx, data: q };
      }}
      onDragEnd={() => { dragRef.current = null; }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 10px", borderRadius: 6,
        background: hov ? C.primaryBg : "transparent",
        transition: "background 0.1s",
      }}
    >
      {/* Grip button — keyboard DnD entry point */}
      <button
        aria-label={`Reorder question: ${q.text}. Press Space to pick up.`}
        onClick={() => onKbPickup?.({ type: "question", sectionIdx, qIdx })}
        style={{ background: "none", border: "none", cursor: "grab", padding: 2, borderRadius: 3, flexShrink: 0, display: "flex", alignItems: "center", outline: "none" }}
        onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
        onBlur={e => (e.currentTarget.style.boxShadow = "none")}
      >
        <svg aria-hidden="true" width="10" height="14" viewBox="0 0 10 14" fill={C.textMuted}>
          <circle cx="3" cy="2.5" r="1.2"/><circle cx="7" cy="2.5" r="1.2"/>
          <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
          <circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
        </svg>
      </button>
      <div style={{ flex: 1, fontSize: 11, color: C.navyDeep, fontFamily: F, lineHeight: "15px",
        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {q.text}
      </div>
      <Badge label={q.type} color={tm.color} bg={tm.bg} />
      {isConditional && (
        <span style={{ padding: "1px 5px", borderRadius: 3, background: "#fffbeb", border: "1px solid #fde68a", fontSize: 9, fontWeight: 700, color: "#b45309", fontFamily: F, letterSpacing: "0.04em", textTransform: "uppercase", flexShrink: 0 }}>
          Conditional
        </span>
      )}
      <button
        onClick={() => onRemove(sectionIdx, qIdx)}
        aria-label={`Remove question: ${q.text}`}
        style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 3, borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center" }}
        onMouseEnter={e => (e.currentTarget.style.color = C.error)}
        onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
        onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
        onBlur={e => (e.currentTarget.style.boxShadow = "none")}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}

// ── Section card in canvas ────────────────────────────────────────────────────

function SectionCard({ section, idx, dragRef, dropZone, setDropZone, onDropQuestion, onUpdate, onRemove, onDuplicate, addQuestionMenu, setAddQuestionMenu, onKbPickupSection, onKbPickupQuestion }) {
  const [editingName, setEditingName] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const catStyle = CAT_COLORS[section.category] || { color: C.textSec, bg: C.bgApp };
  const enterRef = useRef(0);

  return (
    <div
      draggable
      onDragStart={e => {
        dragRef.current = { type: "canvas-section", sectionIdx: idx, data: section };
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={() => { dragRef.current = null; }}
      style={{
        background: C.bgSurface, borderRadius: 10,
        border: `1px solid ${C.borderSubtle}`,
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: C.bgApp, borderBottom: section.collapsed ? "none" : `1px solid ${C.borderSubtle}` }}>
        {/* Grip button — keyboard DnD entry point */}
        <button
          aria-label={`Reorder section: ${section.name}. Press Space to pick up.`}
          onClick={() => onKbPickupSection?.(idx)}
          style={{ background: "none", border: "none", cursor: "grab", padding: 2, borderRadius: 3, flexShrink: 0, display: "flex", alignItems: "center", outline: "none" }}
          onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
          onBlur={e => (e.currentTarget.style.boxShadow = "none")}
        >
          <svg aria-hidden="true" width="10" height="14" viewBox="0 0 10 14" fill={C.textMuted}>
            <circle cx="3" cy="2.5" r="1.2"/><circle cx="7" cy="2.5" r="1.2"/>
            <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
            <circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
          </svg>
        </button>

        {editingName ? (
          <input
            autoFocus
            value={section.name}
            onChange={e => onUpdate(idx, { name: e.target.value })}
            onBlur={() => setEditingName(false)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditingName(false); }}
            aria-label="Section name"
            style={{ flex: 1, fontSize: 12, fontWeight: 600, fontFamily: F, color: C.navyDeep, border: `1px solid ${C.primary}`, borderRadius: 5, padding: "3px 7px", outline: "none", boxShadow: FOCUS_RING, background: C.bgSurface }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            aria-label={`Section name: ${section.name}. Click to edit.`}
            style={{ flex: 1, textAlign: "left", fontSize: 12, fontWeight: 600, fontFamily: F, color: C.navy, background: "none", border: "1px solid transparent", borderRadius: 5, padding: "3px 7px", cursor: "text", outline: "none" }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          >
            {section.name}
          </button>
        )}

        <Badge label={section.category} color={catStyle.color} bg={catStyle.bg} />
        <span style={{ fontSize: 10, color: C.textMuted, fontFamily: F, whiteSpace: "nowrap" }}>
          {section.questions.length}q
        </span>

        {/* Collapse */}
        <button
          onClick={() => onUpdate(idx, { collapsed: !section.collapsed })}
          aria-label={section.collapsed ? "Expand section" : "Collapse section"}
          aria-expanded={!section.collapsed}
          style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 3, display: "flex", alignItems: "center", borderRadius: 4 }}
          onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
          onBlur={e => (e.currentTarget.style.boxShadow = "none")}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: section.collapsed ? "rotate(-90deg)" : "none", transition: "transform 0.15s" }}><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        {/* Kebab */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Section options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 3, display: "flex", alignItems: "center", borderRadius: 4 }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={C.textMuted}><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              role="menu"
              onKeyDown={e => {
                if (e.key === "Escape") { e.stopPropagation(); setMenuOpen(false); }
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const items = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') || []);
                  const ci = items.indexOf(document.activeElement);
                  const next = e.key === "ArrowDown" ? (ci + 1) % items.length : (ci - 1 + items.length) % items.length;
                  items[next]?.focus();
                }
              }}
              style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 500, background: C.bgSurface, border: `1px solid ${C.borderSubtle}`, borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 130, overflow: "hidden" }}
            >
              {[
                { label: "Rename", action: () => { setEditingName(true); setMenuOpen(false); } },
                { label: "Duplicate", action: () => { onDuplicate(idx); setMenuOpen(false); } },
                { label: "Delete", action: () => { onRemove(idx); setMenuOpen(false); }, danger: true },
              ].map(item => (
                <button
                  key={item.label}
                  role="menuitem"
                  onClick={item.action}
                  style={{ display: "block", width: "100%", padding: "9px 14px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontFamily: F, color: item.danger ? C.error : C.navyDeep, outline: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = item.danger ? C.errorBg : C.bgApp)}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                  onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      {!section.collapsed && (
        <div
          onDragEnter={e => {
            e.preventDefault();
            e.stopPropagation();
            enterRef.current++;
            const dt = dragRef.current?.type;
            const accepts = dt === "panel-question" || dt === "canvas-question";
            if (!dropZone || dropZone.kind !== "question-gap") {
              setDropZone({ kind: "section-body", sectionIdx: idx, valid: accepts });
            }
          }}
          onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
          onDragLeave={e => {
            e.stopPropagation();
            enterRef.current--;
            if (enterRef.current <= 0) { enterRef.current = 0; if (dropZone?.kind === "section-body") setDropZone(null); }
          }}
          onDrop={e => {
            e.preventDefault();
            e.stopPropagation();
            enterRef.current = 0;
            const dt = dragRef.current?.type;
            if (dt === "panel-question" || dt === "canvas-question") {
              onDropQuestion(idx, section.questions.length);
            }
            setDropZone(null);
          }}
          style={{
            padding: "6px 8px",
            background: dropZone?.kind === "section-body" && dropZone?.sectionIdx === idx
              ? (dropZone.valid ? C.primaryBg : C.errorBg)
              : "transparent",
            minHeight: 40,
            transition: "background 0.1s",
          }}
        >
          {section.questions.length === 0 && !(dropZone?.kind === "section-body" && dropZone?.sectionIdx === idx) && (
            <div style={{ padding: "12px 0", textAlign: "center", fontSize: 11, color: C.textMuted, fontFamily: F }}>
              Drag questions here from the bank →
            </div>
          )}
          {section.questions.map((q, qIdx) => (
            <div key={q.id}>
              <QuestionGap
                sectionIdx={idx} insertAt={qIdx}
                dragRef={dragRef} dropZone={dropZone} setDropZone={setDropZone}
                onDropQuestion={onDropQuestion}
              />
              <QuestionRow
                q={q} sectionIdx={idx} qIdx={qIdx}
                dragRef={dragRef}
                isConditional={conditionalIds.has(q.id)}
                onKbPickup={onKbPickupQuestion}
                onRemove={(sIdx, qI) => {
                  const qs = section.questions.filter((_, i) => i !== qI);
                  onUpdate(sIdx, { questions: qs });
                }}
              />
            </div>
          ))}
          <QuestionGap
            sectionIdx={idx} insertAt={section.questions.length}
            dragRef={dragRef} dropZone={dropZone} setDropZone={setDropZone}
            onDropQuestion={onDropQuestion}
          />

          {/* + Add question */}
          <div style={{ position: "relative", marginTop: 4 }}>
            <button
              onClick={() => setAddQuestionMenu(addQuestionMenu === idx ? null : idx)}
              aria-label="Add question to section"
              aria-haspopup="menu"
              aria-expanded={addQuestionMenu === idx}
              style={{
                width: "100%", padding: "6px 0", borderRadius: 6,
                border: `1px dashed ${C.borderDef}`,
                background: "transparent", color: C.textSec,
                fontSize: 11, fontFamily: F, cursor: "pointer", outline: "none",
              }}
              onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
              onBlur={e => (e.currentTarget.style.boxShadow = "none")}
            >
              + Add question
            </button>
            {addQuestionMenu === idx && (
              <div role="menu" style={{ position: "absolute", bottom: "calc(100% + 4px)", left: 0, zIndex: 500, background: C.bgSurface, border: `1px solid ${C.borderSubtle}`, borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 200, overflow: "hidden" }}>
                {[
                  { label: "Pick from question bank", sub: "Browse and add existing questions" },
                  { label: "Create new question", sub: "Write a custom question from scratch" },
                ].map(opt => (
                  <button
                    key={opt.label}
                    role="menuitem"
                    onClick={() => setAddQuestionMenu(null)}
                    style={{ display: "block", width: "100%", padding: "10px 14px", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.bgApp)}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                    onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                  >
                    <div style={{ fontSize: 12, color: C.navyDeep, fontFamily: F, fontWeight: 500 }}>{opt.label}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, fontFamily: F, marginTop: 2 }}>{opt.sub}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Panel cards ───────────────────────────────────────────────────────────────

function PanelSectionCard({ section, dragRef }) {
  const catStyle = CAT_COLORS[section.cat] || { color: C.textSec, bg: C.bgApp };
  return (
    <div
      draggable
      onDragStart={e => { dragRef.current = { type: "panel-section", data: section }; e.dataTransfer.effectAllowed = "copy"; }}
      onDragEnd={() => { dragRef.current = null; }}
      style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.borderSubtle}`, background: C.bgSurface, cursor: "grab", marginBottom: 6 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg aria-hidden="true" width="10" height="14" viewBox="0 0 10 14" fill={C.textMuted} style={{ flexShrink: 0 }}>
          <circle cx="3" cy="2.5" r="1.2"/><circle cx="7" cy="2.5" r="1.2"/>
          <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
          <circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, fontFamily: F }}>{section.name}</div>
          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: F, marginTop: 1 }}>{section.qCount} questions</div>
        </div>
        <Badge label={section.cat} color={catStyle.color} bg={catStyle.bg} />
      </div>
    </div>
  );
}

function PanelQuestionCard({ question, dragRef }) {
  const tm = TYPE_META[question.type] || { color: C.textSec, bg: C.bgApp };
  const catStyle = CAT_COLORS[question.category] || { color: C.textSec, bg: C.bgApp };
  return (
    <div
      draggable
      onDragStart={e => { dragRef.current = { type: "panel-question", data: question }; e.dataTransfer.effectAllowed = "copy"; }}
      onDragEnd={() => { dragRef.current = null; }}
      style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.borderSubtle}`, background: C.bgSurface, cursor: "grab", marginBottom: 6 }}
    >
      <div style={{ fontSize: 11, color: C.navyDeep, fontFamily: F, lineHeight: "15px", marginBottom: 6,
        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {question.text}
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        <Badge label={question.type} color={tm.color} bg={tm.bg} />
        <Badge label={question.category} color={catStyle.color} bg={catStyle.bg} />
      </div>
    </div>
  );
}

// ── Main Step2Structure component ─────────────────────────────────────────────

export default function Step2Structure({ sections, dispatch, conditionalIds = new Set() }) {
  const dragRef = useRef(null);
  const [dropZone, setDropZone] = useState(null);
  const [panelTab, setPanelTab] = useState("sections");
  const [search, setSearch] = useState("");
  const [modFilter, setModFilter] = useState("All");
  const [addSectionMenu, setAddSectionMenu] = useState(false);
  const [addQuestionMenu, setAddQuestionMenu] = useState(null);

  // Keyboard DnD state: null | { type:"section", sectionIdx } | { type:"question", sectionIdx, qIdx }
  const [kbDrag, setKbDrag] = useState(null);
  const [dndAnnounce, setDndAnnounce] = useState("");

  const handleKbPickupSection = useCallback((sectionIdx) => {
    setKbDrag({ type: "section", sectionIdx });
    setDndAnnounce(`Picked up section "${sections[sectionIdx]?.name}". Use arrow keys to move, Space to drop, Escape to cancel.`);
  }, [sections]);

  const handleKbPickupQuestion = useCallback(({ sectionIdx, qIdx }) => {
    setKbDrag({ type: "question", sectionIdx, qIdx });
    const q = sections[sectionIdx]?.questions[qIdx];
    setDndAnnounce(`Picked up question "${q?.text}". Use arrow keys to move, Space to drop, Escape to cancel.`);
  }, [sections]);

  const handleKbKeyDown = useCallback((e) => {
    if (!kbDrag) return;
    if (e.key === "Escape") {
      setKbDrag(null);
      setDndAnnounce("Drag cancelled.");
      return;
    }
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setKbDrag(null);
      setDndAnnounce("Item dropped.");
      return;
    }
    if (kbDrag.type === "section") {
      if (e.key === "ArrowUp" && kbDrag.sectionIdx > 0) {
        e.preventDefault();
        const from = kbDrag.sectionIdx;
        const to = from - 1;
        dispatch({ type: "STRUCTURE_REORDER_SECTIONS", fromIdx: from, toIdx: to });
        setKbDrag({ ...kbDrag, sectionIdx: to });
        setDndAnnounce(`Section moved to position ${to + 1} of ${sections.length}.`);
      } else if (e.key === "ArrowDown" && kbDrag.sectionIdx < sections.length - 1) {
        e.preventDefault();
        const from = kbDrag.sectionIdx;
        const to = from + 1;
        dispatch({ type: "STRUCTURE_REORDER_SECTIONS", fromIdx: from, toIdx: to });
        setKbDrag({ ...kbDrag, sectionIdx: to });
        setDndAnnounce(`Section moved to position ${to + 1} of ${sections.length}.`);
      }
    } else if (kbDrag.type === "question") {
      const { sectionIdx, qIdx } = kbDrag;
      const qCount = sections[sectionIdx]?.questions.length || 0;
      if (e.key === "ArrowUp" && qIdx > 0) {
        e.preventDefault();
        dispatch({ type: "STRUCTURE_REORDER_QUESTION", fromSectionIdx: sectionIdx, fromQIdx: qIdx, toSectionIdx: sectionIdx, toQIdx: qIdx - 1 });
        setKbDrag({ ...kbDrag, qIdx: qIdx - 1 });
        setDndAnnounce(`Question moved to position ${qIdx} of ${qCount}.`);
      } else if (e.key === "ArrowDown" && qIdx < qCount - 1) {
        e.preventDefault();
        dispatch({ type: "STRUCTURE_REORDER_QUESTION", fromSectionIdx: sectionIdx, fromQIdx: qIdx, toSectionIdx: sectionIdx, toQIdx: qIdx + 1 });
        setKbDrag({ ...kbDrag, qIdx: qIdx + 1 });
        setDndAnnounce(`Question moved to position ${qIdx + 2} of ${qCount}.`);
      }
    }
  }, [kbDrag, dispatch, sections]);

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

  // ── Filtered panel data ─────────────────────────────────────────────────────
  const panelSections = SECTIONS.filter(s => {
    const matchMod = modFilter === "All" || s.cat === modFilter;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchMod && matchSearch;
  });
  const panelQuestions = QUESTIONS.filter(q => {
    const matchMod = modFilter === "All" || q.category === modFilter;
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase()) || q.category.toLowerCase().includes(search.toLowerCase());
    return matchMod && matchSearch;
  });

  // ── Canvas mutations ────────────────────────────────────────────────────────
  const addSection = useCallback((section, at) => {
    dispatch({ type: "STRUCTURE_ADD_SECTION", section, at });
  }, [dispatch]);

  const removeSection = useCallback((idx) => {
    dispatch({ type: "STRUCTURE_REMOVE_SECTION", idx });
  }, [dispatch]);

  const updateSection = useCallback((idx, updates) => {
    dispatch({ type: "STRUCTURE_UPDATE_SECTION", idx, updates });
  }, [dispatch]);

  const duplicateSection = useCallback((idx) => {
    const s = sections[idx];
    dispatch({ type: "STRUCTURE_ADD_SECTION", section: { ...s, id: uid(), name: `${s.name} (copy)`, questions: s.questions.map(q => ({ ...q, id: uid() })) }, at: idx + 1 });
  }, [dispatch, sections]);

  // ── Drop handlers ───────────────────────────────────────────────────────────
  const handleDropSection = useCallback((insertAt) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.type === "panel-section") {
      addSection(sectionFromBank(drag.data), insertAt);
    } else if (drag.type === "canvas-section") {
      const from = drag.sectionIdx;
      if (from === insertAt || from === insertAt - 1) return;
      dispatch({ type: "STRUCTURE_REORDER_SECTIONS", fromIdx: from, toIdx: insertAt > from ? insertAt - 1 : insertAt });
    }
    dragRef.current = null;
  }, [addSection, dispatch]);

  const handleDropQuestion = useCallback((toSectionIdx, toQIdx) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.type === "panel-question") {
      dispatch({ type: "STRUCTURE_ADD_QUESTION", sectionIdx: toSectionIdx, question: questionFromBank(drag.data), at: toQIdx });
    } else if (drag.type === "canvas-question") {
      dispatch({ type: "STRUCTURE_REORDER_QUESTION", fromSectionIdx: drag.sectionIdx, fromQIdx: drag.questionIdx, toSectionIdx, toQIdx });
    }
    dragRef.current = null;
  }, [dispatch]);

  return (
    <div style={{ display: "flex", gap: 0, height: "100%", overflow: "hidden" }} onKeyDown={handleKbKeyDown}>
      {/* DnD announcements for screen readers */}
      <div role="status" aria-live="assertive" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
        {dndAnnounce}
      </div>

      {/* ── Left canvas */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px 0" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.navyDeep, fontFamily: F }}>Template structure</div>
          <span style={{ fontSize: 11, color: C.textMuted, fontFamily: F }}>
            {sections.length} section{sections.length !== 1 ? "s" : ""} · {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Empty state */}
        {sections.length === 0 && (
          <div style={{ textAlign: "center", padding: "56px 24px", color: C.textMuted, fontFamily: F }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>No sections yet</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>
              Drag a section from the library on the right, pick from the bank, or start blank.
            </div>
          </div>
        )}

        {/* Section list with gap zones */}
        <SectionGap insertAt={0} dragRef={dragRef} dropZone={dropZone} setDropZone={setDropZone} onDropSection={handleDropSection} />

        {sections.map((section, idx) => (
          <div key={section.id}>
            <SectionCard
              section={section}
              idx={idx}
              dragRef={dragRef}
              dropZone={dropZone}
              setDropZone={setDropZone}
              onDropQuestion={handleDropQuestion}
              onUpdate={updateSection}
              onRemove={removeSection}
              onDuplicate={duplicateSection}
              addQuestionMenu={addQuestionMenu}
              setAddQuestionMenu={setAddQuestionMenu}
              onKbPickupSection={handleKbPickupSection}
              onKbPickupQuestion={handleKbPickupQuestion}
            />
            <SectionGap insertAt={idx + 1} dragRef={dragRef} dropZone={dropZone} setDropZone={setDropZone} onDropSection={handleDropSection} />
          </div>
        ))}

        {/* + Add section */}
        <div style={{ position: "relative", marginTop: 8 }}>
          <button
            onClick={() => setAddSectionMenu(o => !o)}
            aria-label="Add section"
            aria-haspopup="menu"
            aria-expanded={addSectionMenu}
            style={{
              width: "100%", padding: "10px 0", borderRadius: 8,
              border: `2px dashed ${C.borderDef}`,
              background: "transparent", color: C.primary,
              fontSize: 12, fontFamily: F, fontWeight: 600, cursor: "pointer", outline: "none",
            }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.primary)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.borderDef)}
          >
            + Add section
          </button>
          {addSectionMenu && (
            <div role="menu" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 500, background: C.bgSurface, border: `1px solid ${C.borderSubtle}`, borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 220, overflow: "hidden" }}>
              <button
                role="menuitem"
                onClick={() => { addSection({ id: uid(), name: "New section", category: "Operations", collapsed: false, questions: [] }, sections.length); setAddSectionMenu(false); }}
                style={{ display: "block", width: "100%", padding: "10px 16px", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.bgApp)}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
                onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                onBlur={e => (e.currentTarget.style.boxShadow = "none")}
              >
                <div style={{ fontSize: 12, color: C.navyDeep, fontFamily: F, fontWeight: 500 }}>Blank section</div>
                <div style={{ fontSize: 10, color: C.textMuted, fontFamily: F, marginTop: 2 }}>Start with an empty section</div>
              </button>
              <div style={{ borderTop: `1px solid ${C.borderSubtle}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", padding: "8px 16px 4px", fontFamily: F }}>From section bank</div>
                {SECTIONS.slice(0, 5).map(s => (
                  <button
                    key={s.id}
                    role="menuitem"
                    onClick={() => { addSection(sectionFromBank(s), sections.length); setAddSectionMenu(false); }}
                    style={{ display: "block", width: "100%", padding: "8px 16px", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.bgApp)}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                    onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                  >
                    <div style={{ fontSize: 12, color: C.navyDeep, fontFamily: F }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, fontFamily: F }}>{s.qCount} questions</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel */}
      <div style={{ width: 320, borderLeft: `1px solid ${C.borderSubtle}`, display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0, background: C.bgSurface }}>
        {/* Tabs */}
        <div role="tablist" aria-label="Library" style={{ display: "flex", borderBottom: `1px solid ${C.borderSubtle}`, flexShrink: 0 }}>
          {[{ key: "sections", label: "Sections", count: panelSections.length }, { key: "questions", label: "Questions", count: panelQuestions.length }].map(t => {
            const active = panelTab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => setPanelTab(t.key)}
                style={{
                  flex: 1, padding: "10px 0", border: "none",
                  borderBottom: active ? `2px solid ${C.primary}` : "2px solid transparent",
                  background: "transparent", color: active ? C.primary : C.textSec,
                  fontSize: 12, fontWeight: active ? 600 : 400, fontFamily: F, cursor: "pointer", outline: "none",
                }}
                onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                onBlur={e => (e.currentTarget.style.boxShadow = "none")}
              >
                {t.label}
                <span style={{ marginLeft: 6, padding: "1px 6px", borderRadius: 999, background: active ? C.primaryLight : C.bgApp, color: active ? C.primaryHover : C.textMuted, fontSize: 10, fontWeight: 600 }}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderSubtle}`, flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={panelTab === "sections" ? "Search sections…" : "Search questions…"}
              aria-label={panelTab === "sections" ? "Search sections" : "Search questions"}
              style={{ width: "100%", padding: "6px 8px 6px 28px", borderRadius: 7, border: `1px solid ${C.borderDef}`, fontSize: 11, fontFamily: F, color: C.navyDeep, background: C.bgSurface, outline: "none", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = C.primary)}
              onBlur={e => (e.target.style.borderColor = C.borderDef)}
            />
          </div>
          {/* Module filter chips */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
            {["All", ...MODULES].map(m => (
              <button
                key={m}
                onClick={() => setModFilter(m)}
                aria-pressed={modFilter === m}
                style={{
                  padding: "3px 9px", borderRadius: 999, fontSize: 10,
                  border: `1px solid ${modFilter === m ? C.primary : C.borderDef}`,
                  background: modFilter === m ? C.primaryLight : C.bgSurface,
                  color: modFilter === m ? C.primaryHover : C.textSec,
                  fontWeight: modFilter === m ? 600 : 400, fontFamily: F, cursor: "pointer", outline: "none",
                }}
                onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                onBlur={e => (e.currentTarget.style.boxShadow = "none")}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          {panelTab === "sections" && (
            <>
              {panelSections.length === 0
                ? <div style={{ textAlign: "center", padding: "32px 0", fontSize: 12, color: C.textMuted, fontFamily: F }}>No sections match.</div>
                : panelSections.map(s => <PanelSectionCard key={s.id} section={s} dragRef={dragRef} />)
              }
            </>
          )}
          {panelTab === "questions" && (
            <>
              {panelQuestions.length === 0
                ? <div style={{ textAlign: "center", padding: "32px 0", fontSize: 12, color: C.textMuted, fontFamily: F }}>No questions match.</div>
                : panelQuestions.map(q => <PanelQuestionCard key={q.id} question={q} dragRef={dragRef} />)
              }
            </>
          )}
          <div style={{ padding: "12px 0 4px", borderTop: `1px solid ${C.borderSubtle}`, fontSize: 10, color: C.textMuted, fontFamily: F, textAlign: "center", marginTop: 8 }}>
            Drag items onto the template canvas to add them.
          </div>
        </div>
      </div>
    </div>
  );
}
