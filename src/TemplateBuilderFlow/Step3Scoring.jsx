import { useState } from "react";
import { T, F } from "../aegis-tokens.js";
import ScoringMethodology from "./ScoringMethodology.jsx";
import { LogicIcons } from "./typeIcons.jsx";

const C = {
  navy:     T.action1,
  navy2:    T.action2,
  navyBg:   "#eef1ff",
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
  tealBg:   "#f0fdf4",
};

const METHODOLOGIES = [
  { key: "points",        label: "Points-Based",      desc: "Questions earn points toward a total" },
  { key: "weighted",      label: "Weighted %",         desc: "Questions sum to 100% within each section" },
  { key: "passfail",      label: "Pass / Fail",        desc: "Binary pass or fail outcome" },
  { key: "informational", label: "Informational Only", desc: "No scoring — responses collected for review" },
];

const ANSWER_TYPE_COLORS = [
  { value: "Yes/No/NA",       bg: "#d9e5f5", color: "#2b4b94" },
  { value: "Yes/No",          bg: "#d9e5f5", color: "#2b4b94" },
  { value: "Pass/Fail",       bg: "#e0dcf8", color: "#4030a6" },
  { value: "Rating Scale",    bg: "#e8d8f5", color: "#5c2c98" },
  { value: "Free Text",       bg: "#ccfbf1", color: "#0f766e" },
  { value: "Number",          bg: "#d6dff0", color: "#2e3e72" },
  { value: "Multiple Choice", bg: "#e6e9ed", color: "#48535f" },
  { value: "Grid",            bg: "#e6e9ed", color: "#48535f" },
  { value: "Asset",           bg: "#d8e4f2", color: "#30527a" },
  { value: "Photo Required",  bg: "#e0dcf8", color: "#4030a6" },
];
function ansTypeMeta(v) {
  return ANSWER_TYPE_COLORS.find(t => t.value === v) ?? { bg: "#e6e9ed", color: "#48535f" };
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconTrash() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function IconEqual() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="9" x2="19" y2="9"/><line x1="5" y1="15" x2="19" y2="15"/></svg>;
}
function IconWand() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8L19 13"/><path d="M15 9h0"/><path d="M17.8 6.2L19 5"/><path d="M3 21l9-9"/><path d="M12.2 6.2L11 5"/></svg>;
}

// ── Shared atoms ──────────────────────────────────────────────────────────────

function Checkbox({ checked, onChange, disabled = false }) {
  return (
    <div
      onClick={disabled ? undefined : onChange}
      style={{
        width: 15, height: 15, borderRadius: 4, flexShrink: 0,
        background: checked ? C.navy : C.white,
        border: `1.5px solid ${checked ? C.navy : C.g3}`,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: disabled ? 0.5 : 1, transition: "all 0.1s",
      }}
    >
      {checked && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
    </div>
  );
}

function WholeNumberInput({ value, onChange, disabled = false, width = 60 }) {
  const [raw, setRaw] = useState(String(value ?? 0));

  function handleChange(e) {
    const v = e.target.value;
    setRaw(v);
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= 0) onChange(n);
  }

  function handleBlur() {
    const n = parseInt(raw, 10);
    const clamped = isNaN(n) ? 0 : Math.max(0, n);
    setRaw(String(clamped));
    onChange(clamped);
  }

  return (
    <input
      type="number"
      min="0"
      step="1"
      value={raw}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      style={{
        width, border: `1px solid ${C.g2}`, borderRadius: 6, padding: "4px 6px",
        fontSize: 12, fontFamily: F, textAlign: "center", background: disabled ? C.g1 : C.white,
        color: disabled ? C.g4 : C.g6, outline: "none",
      }}
    />
  );
}

function SmallBtn({ onClick, children, title }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "4px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: F,
        border: `1px solid ${hover ? C.navy : C.g3}`,
        background: hover ? C.navyBg : C.white,
        color: hover ? C.navy : C.g5,
        cursor: "pointer", transition: "all 0.1s", whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

// ── Answer scoring cell (per question type) ───────────────────────────────────

function AnswerScoringCell({ question, scoring, methodology, onUpdate }) {
  const { answerType, typeConfig = {}, informational } = question;
  const isInfo = !!informational;

  if (isInfo || methodology === "informational" || methodology === "passfail") {
    return <span style={{ color: C.g3, fontSize: 12, fontFamily: F }}>—</span>;
  }

  if (answerType === "Yes/No/NA" || answerType === "Yes/No" || answerType === "Pass/Fail") {
    const opts = answerType === "Yes/No/NA" ? ["Yes","No","N/A"]
               : answerType === "Yes/No"    ? ["Yes","No"]
               :                              ["Pass","Fail"];
    return (
      <div style={{ display:"flex", gap:5, alignItems:"center", justifyContent:"center", flexWrap:"wrap" }}>
        {opts.map(opt => (
          <div key={opt} style={{ display:"flex", alignItems:"center", gap:3 }}>
            <span style={{ fontSize:11, color:C.g5, fontFamily:F, whiteSpace:"nowrap" }}>{opt}</span>
            <WholeNumberInput
              value={scoring?.answerValues?.[opt] ?? (opt==="Yes"||opt==="Pass" ? (scoring?.value ?? 1) : 0)}
              onChange={v => onUpdate({ scoring:{ ...scoring, answerValues:{ ...(scoring?.answerValues??{}), [opt]:v } } })}
              width={40}
            />
          </div>
        ))}
      </div>
    );
  }

  if (answerType === "Multiple Choice") {
    const opts = (typeConfig.options ?? []).filter(Boolean);
    const isMulti = typeConfig.multiSelect ?? false;
    if (!opts.length) return <span style={{ color:C.g3, fontSize:12, fontFamily:F }}>No options</span>;
    return (
      <div>
        <div style={{ display:"flex", gap:5, alignItems:"center", justifyContent:"center", flexWrap:"wrap" }}>
          {opts.map(opt => (
            <div key={opt} style={{ display:"flex", alignItems:"center", gap:3 }}>
              <span style={{ fontSize:11, color:C.g5, fontFamily:F, whiteSpace:"nowrap", maxWidth:68, overflow:"hidden", textOverflow:"ellipsis" }} title={opt}>{opt}</span>
              <WholeNumberInput
                value={scoring?.answerValues?.[opt] ?? 0}
                onChange={v => onUpdate({ scoring:{ ...scoring, answerValues:{ ...(scoring?.answerValues??{}), [opt]:v } } })}
                width={40}
              />
            </div>
          ))}
        </div>
        {isMulti && <div style={{ fontSize:10, color:C.g4, fontFamily:F, textAlign:"center", marginTop:3 }}>Each selection adds its value</div>}
      </div>
    );
  }

  if (answerType === "Rating Scale") {
    const steps = typeConfig.steps ?? 5;
    return (
      <div style={{ display:"flex", gap:5, alignItems:"center", justifyContent:"center", flexWrap:"wrap" }}>
        {Array.from({ length: steps }, (_, i) => String(i+1)).map(step => (
          <div key={step} style={{ display:"flex", alignItems:"center", gap:3 }}>
            <span style={{ fontSize:11, color:C.g5, fontFamily:F }}>★{step}</span>
            <WholeNumberInput
              value={scoring?.stepValues?.[step] ?? 0}
              onChange={v => onUpdate({ scoring:{ ...scoring, stepValues:{ ...(scoring?.stepValues??{}), [step]:v } } })}
              width={38}
            />
          </div>
        ))}
      </div>
    );
  }

  if (answerType === "Number") {
    const brackets = scoring?.brackets ?? [];
    const updateBracket = (idx, field, val) => {
      const next = brackets.map((b, i) => i === idx ? { ...b, [field]: val } : b);
      onUpdate({ scoring: { ...scoring, brackets: next } });
    };
    const addBracket = () => {
      const lastMax = brackets.length ? (brackets[brackets.length-1].max ?? 0) : -1;
      onUpdate({ scoring: { ...scoring, brackets: [...brackets, { min: lastMax+1, max: lastMax+10, pts: 0 }] } });
    };
    const removeBracket = idx => {
      onUpdate({ scoring: { ...scoring, brackets: brackets.filter((_,i) => i !== idx) } });
    };
    const numInput = (val, cb) => (
      <input
        type="number"
        value={val}
        onChange={e => cb(Number(e.target.value))}
        style={{ width:40, border:`1px solid ${C.g2}`, borderRadius:5, padding:"3px 4px", fontSize:11, fontFamily:F, textAlign:"center", background:C.white, color:C.g6, outline:"none" }}
      />
    );
    return (
      <div style={{ minWidth:160 }}>
        {!brackets.length && <div style={{ fontSize:11, color:C.g4, fontFamily:F, textAlign:"center", marginBottom:4 }}>No ranges</div>}
        {brackets.map((b, idx) => (
          <div key={idx} style={{ display:"flex", gap:3, alignItems:"center", marginBottom:3, justifyContent:"center" }}>
            {numInput(b.min??0, v => updateBracket(idx,"min",v))}
            <span style={{ fontSize:10, color:C.g4, fontFamily:F }}>–</span>
            {numInput(b.max??0, v => updateBracket(idx,"max",v))}
            <span style={{ fontSize:10, color:C.g4, fontFamily:F }}>→</span>
            {numInput(b.pts??0, v => updateBracket(idx,"pts",v))}
            <span style={{ fontSize:10, color:C.g4, fontFamily:F }}>pts</span>
            <button
              onClick={() => removeBracket(idx)}
              style={{ background:"none", border:"none", cursor:"pointer", color:C.g3, display:"flex", padding:"1px 2px", borderRadius:3 }}
              onMouseEnter={e => e.currentTarget.style.color = C.red}
              onMouseLeave={e => e.currentTarget.style.color = C.g3}
            ><IconTrash /></button>
          </div>
        ))}
        <button
          onClick={addBracket}
          style={{ fontSize:10, color:C.navy, background:"none", border:`1px dashed ${C.g3}`, borderRadius:4, padding:"2px 8px", cursor:"pointer", fontFamily:F, display:"block", margin:"2px auto 0" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.navy; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.g3; }}
        >+ Add range</button>
      </div>
    );
  }

  return <span style={{ color:C.g3, fontSize:12, fontFamily:F }}>—</span>;
}

// ── Distribute helpers ────────────────────────────────────────────────────────

function distributeEqually(questions) {
  if (!questions.length) return questions;
  const n = questions.length;
  const base = Math.floor(100 / n);
  const remainder = 100 - base * n;
  return questions.map((q, i) => ({
    ...q,
    scoring: { ...(q.scoring ?? {}), value: i < remainder ? base + 1 : base },
  }));
}

function autoAdjust(questions) {
  // Scale so sum = 100, maintaining relative proportions, whole numbers
  const total = questions.reduce((s, q) => s + (Number(q.scoring?.value) || 0), 0);
  if (total === 0) return distributeEqually(questions);
  const target = 100;
  let remaining = target;
  return questions.map((q, i) => {
    const raw = Number(q.scoring?.value) || 0;
    const scaled = Math.round((raw / total) * target);
    const v = i === questions.length - 1 ? remaining : Math.min(scaled, remaining);
    remaining -= v;
    return { ...q, scoring: { ...(q.scoring ?? {}), value: Math.max(0, v) } };
  });
}

// ── Question row ──────────────────────────────────────────────────────────────

function QuestionRow({ num, question, methodology, onUpdate, onDelete }) {
  const { title, answerType, informational, critical, scoring = {} } = question;
  const isInfo = !!informational;
  const typeMeta = ansTypeMeta(answerType);

  return (
    <tr style={{ borderBottom: `1px solid ${C.g1}` }}>
      {/* Question (with inline number) */}
      <td style={{ padding: "8px 12px", fontSize: 13, fontFamily: F }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 11, color: C.g4, flexShrink: 0, minWidth: 16, textAlign: "right" }}>{num}</span>
          <span style={{ color: isInfo ? C.g4 : C.g6 }}>
            {title.length > 80 ? title.slice(0, 80) + "…" : title}
          </span>
        </div>
      </td>

      {/* Type */}
      <td style={{ padding: "8px 12px", textAlign: "center" }}>
        <span style={{
          display: "inline-block", fontSize: 11, fontWeight: 600, fontFamily: F,
          background: isInfo ? C.g1 : typeMeta.bg,
          color: isInfo ? C.g4 : typeMeta.color,
          padding: "2px 7px", borderRadius: 5, whiteSpace: "nowrap",
          opacity: isInfo ? 0.7 : 1,
        }}>
          {answerType || "—"}{isInfo ? " · Info" : ""}
        </span>
      </td>

      {/* Scoring column(s) — adapt per methodology */}
      {methodology === "passfail" ? (
        <>
          {/* Pass pts */}
          <td style={{ padding: "8px 12px", textAlign: "center" }}>
            {isInfo ? (
              <span style={{ color: C.g3, fontSize: 12, fontFamily: F }}>—</span>
            ) : (
              <WholeNumberInput value={scoring.passValue ?? 1} onChange={v => onUpdate({ scoring: { ...scoring, passValue: v } })} width={50} />
            )}
          </td>
          {/* Fail pts */}
          <td style={{ padding: "8px 12px", textAlign: "center" }}>
            {isInfo ? (
              <span style={{ color: C.g3, fontSize: 12, fontFamily: F }}>—</span>
            ) : (
              <WholeNumberInput value={scoring.failValue ?? 0} onChange={v => onUpdate({ scoring: { ...scoring, failValue: v } })} width={50} />
            )}
          </td>
        </>
      ) : (
        <td style={{ padding: "8px 12px", textAlign: "center" }}>
          {methodology === "informational" || isInfo ? (
            <span style={{ color: C.g3, fontSize: 12, fontFamily: F }}>—</span>
          ) : methodology === "weighted" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
              <WholeNumberInput
                value={scoring.value ?? 0}
                onChange={v => onUpdate({ scoring: { ...scoring, value: v } })}
                width={52}
              />
              <span style={{ fontSize: 11, color: C.g4, fontFamily: F }}>%</span>
            </div>
          ) : (
            <WholeNumberInput
              value={scoring.value ?? 1}
              onChange={v => onUpdate({ scoring: { ...scoring, value: v } })}
              width={60}
            />
          )}
        </td>
      )}

      {/* Answers / point values */}
      <td style={{ padding: "8px 12px", textAlign: "center" }}>
        <AnswerScoringCell question={question} scoring={scoring} methodology={methodology} onUpdate={onUpdate} />
      </td>

      {/* Logic */}
      <td style={{ padding: "8px 12px", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
          <LogicIcons question={question} size={12} />
        </div>
      </td>

      {/* Fail Action */}
      <td style={{ padding: "8px 12px", textAlign: "center" }}>
        {isInfo ? (
          <span style={{ color: C.g3, fontSize: 12, fontFamily: F }}>—</span>
        ) : (() => {
          const val = critical === "section" ? "section" : critical === "audit" ? "audit" : (critical === true ? "audit" : "none");
          const color = val === "audit" ? C.red : val === "section" ? C.amber : C.g5;
          const weight = val !== "none" ? 600 : 400;
          return (
            <select
              value={val}
              onChange={e => onUpdate({ critical: e.target.value === "none" ? null : e.target.value })}
              style={{
                border: `1px solid ${val !== "none" ? color : C.g2}`,
                borderRadius: 6, padding: "3px 6px",
                fontSize: 12, fontFamily: F,
                background: val === "audit" ? C.redBg : val === "section" ? C.amberBg : C.white,
                color, fontWeight: weight,
              }}
            >
              <option value="none">—</option>
              <option value="section">Fails section</option>
              <option value="audit">Fails audit</option>
            </select>
          );
        })()}
      </td>

      {/* Delete */}
      <td style={{ padding: "8px 8px", textAlign: "center" }}>
        <button
          onClick={onDelete}
          style={{ background: "none", border: "none", cursor: "pointer", color: C.g3, display: "flex", padding: 4, borderRadius: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = C.red}
          onMouseLeave={e => e.currentTarget.style.color = C.g3}
        >
          <IconTrash />
        </button>
      </td>
    </tr>
  );
}

// ── Section table ─────────────────────────────────────────────────────────────

function SectionTable({ section, methodology, onUpdateQuestion, onDeleteQuestion, onWeightEqually, onAutoAdjust, isFirst }) {
  const { name, description, questions = [] } = section;
  const showPts = methodology !== "informational";
  const sectionTotal = questions.reduce((s, q) => s + (Number(q.scoring?.value) || 0), 0);

  return (
    <>
      {/* Section divider row */}
      <tr style={{ borderTop: isFirst ? "none" : `2px solid ${C.g2}` }}>
        <td colSpan={99} style={{
          padding: "10px 16px", background: "#f8f9ff",
          borderBottom: `1px solid ${C.g2}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.g6, fontFamily: F }}>{name || "Untitled section"}</span>
              {description && <span style={{ fontSize: 11, color: C.g4, fontFamily: F, marginLeft: 8 }}>{description}</span>}
            </div>
            {showPts && questions.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: C.g4, fontFamily: F }}>
                  {methodology === "weighted" ? `${sectionTotal}%` : `${sectionTotal} pts`}
                </span>
                <SmallBtn onClick={onAutoAdjust} title="Auto-adjust to 100%">
                  <IconWand /> Auto Adjust
                </SmallBtn>
                <SmallBtn onClick={onWeightEqually} title="Distribute equally across questions">
                  <IconEqual /> Equally
                </SmallBtn>
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* Column headers */}
      <tr style={{ background: "#fafbff", borderBottom: `1px solid ${C.g2}` }}>
        <th style={{ ...thStyle(), textAlign: "left", paddingLeft: 12 }}>Question</th>
        <th style={thStyle(130)}>Type</th>
        {methodology === "passfail" && (
          <>
            <th style={thStyle(80)}>Pass pts</th>
            <th style={thStyle(80)}>Fail pts</th>
          </>
        )}
        {methodology === "weighted"      && <th style={thStyle(100)}>Weight %</th>}
        {methodology === "points"        && <th style={thStyle(100)}>Max pts</th>}
        {methodology !== "informational" && <th style={thStyle(220)}>Answer pts</th>}
        <th style={thStyle(80)}>Logic</th>
        <th style={thStyle(110)}>Fail Action</th>
        <th style={thStyle(36)}></th>
      </tr>

      {questions.length === 0 ? (
        <tr>
          <td colSpan={99} style={{ padding: "18px 16px", textAlign: "center", color: C.g4, fontSize: 12, fontFamily: F }}>
            No questions in this section
          </td>
        </tr>
      ) : (
        questions.map((q, idx) => (
          <QuestionRow
            key={q.id}
            num={idx + 1}
            question={q}
            methodology={methodology}
            onUpdate={patch => onUpdateQuestion(q.id, patch)}
            onDelete={() => onDeleteQuestion(q.id)}
          />
        ))
      )}
    </>
  );
}

function thStyle(width) {
  return {
    width: width ?? "auto",
    padding: "7px 12px",
    fontSize: 11,
    fontWeight: 600,
    fontFamily: F,
    color: C.g4,
    textAlign: "center",
    userSelect: "none",
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function Step3Scoring({
  formData,          // { methodology, displayFormat, ... } — scoring metadata
  onChange,          // updates formData (scoring metadata)
  questionsData,     // formData[2] — sections + questions
  onQuestionsChange, // updates formData[2]
}) {
  const [activeTab, setActiveTab] = useState(formData?.methodology ? "scoring" : "setup");

  const methodology = formData?.methodology ?? "points";
  const sections = questionsData?.sections ?? [];

  function updateQuestion(secId, qId, patch) {
    const updated = sections.map(sec =>
      sec.id !== secId ? sec : {
        ...sec,
        questions: (sec.questions ?? []).map(q =>
          q.id !== qId ? q : { ...q, ...patch }
        ),
      }
    );
    onQuestionsChange({ ...(questionsData ?? {}), sections: updated });
  }

  function deleteQuestion(secId, qId) {
    const updated = sections.map(sec =>
      sec.id !== secId ? sec : {
        ...sec,
        questions: (sec.questions ?? []).filter(q => q.id !== qId),
      }
    );
    onQuestionsChange({ ...(questionsData ?? {}), sections: updated });
  }

  function weightEquallyAll() {
    const updated = sections.map(sec => ({
      ...sec,
      questions: distributeEqually(sec.questions ?? []),
    }));
    onQuestionsChange({ ...(questionsData ?? {}), sections: updated });
  }

  function autoAdjustAll() {
    const updated = sections.map(sec => ({
      ...sec,
      questions: autoAdjust(sec.questions ?? []),
    }));
    onQuestionsChange({ ...(questionsData ?? {}), sections: updated });
  }

  function weightEquallySection(secId) {
    const updated = sections.map(sec =>
      sec.id !== secId ? sec : { ...sec, questions: distributeEqually(sec.questions ?? []) }
    );
    onQuestionsChange({ ...(questionsData ?? {}), sections: updated });
  }

  function autoAdjustSection(secId) {
    const updated = sections.map(sec =>
      sec.id !== secId ? sec : { ...sec, questions: autoAdjust(sec.questions ?? []) }
    );
    onQuestionsChange({ ...(questionsData ?? {}), sections: updated });
  }

  const allQuestions = sections.flatMap(s => s.questions ?? []);
  const totalPoints = allQuestions.reduce((s, q) => s + (Number(q.scoring?.value) || 0), 0);

  const TABS = [
    { id: "setup",   label: "Scoring Methodology" },
    { id: "scoring", label: "Question Scoring" },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>

      {/* Sub-tab bar */}
      <div style={{
        display: "flex", background: C.white, borderBottom: `1px solid ${C.g2}`,
        padding: "0 24px", flexShrink: 0,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "11px 16px", fontSize: 13, fontFamily: F, background: "none", border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${C.navy}` : "2px solid transparent",
              color: activeTab === tab.id ? C.navy : C.g5,
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: "pointer", marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Scoring Setup sub-tab ── */}
        {activeTab === "setup" && (
          <ScoringMethodology
            formData={formData}
            onChange={onChange}
            hasQuestions={sections.length > 0}
          />
        )}

        {/* ── Question Scoring sub-tab ── */}
        {activeTab === "scoring" && (
          allQuestions.length === 0 ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, padding: "80px 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 400 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 14px", display: "block" }}>
                  <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.g5, marginBottom: 8, fontFamily: F }}>No questions yet</div>
                <div style={{ fontSize: 13, color: C.g4, lineHeight: "20px", fontFamily: F }}>
                  Add sections and questions in <strong>Step 2</strong>, then come back here to configure scoring.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 80px" }}>

              {/* Page title */}
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: "0 0 5px", fontSize: 20, fontWeight: 700, color: C.g6, fontFamily: F }}>Question Scoring</h2>
                <p style={{ margin: 0, fontSize: 13, color: C.g5, fontFamily: F }}>Set point values and answer weights for each question. Mark critical questions and configure scoring logic.</p>
              </div>

              {/* Unified section table */}
              <div style={{ border: `1px solid ${C.g2}`, borderRadius: 12, overflow: "hidden", background: C.white }}>

                {/* Table-level score + bulk adjust header */}
                {methodology !== "informational" && (
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 16px", background: C.g1, borderBottom: `1px solid ${C.g2}`,
                  }}>
                    <span style={{ fontSize: 12, color: C.g5, fontFamily: F }}>
                      Score{methodology === "weighted" ? " (%)" : methodology === "passfail" ? " (pass/fail)" : " (pts)"}:&nbsp;
                      <strong style={{ color: C.g6 }}>
                        {methodology === "weighted" ? `${totalPoints}%` : `${totalPoints} pts`}
                      </strong>
                      &nbsp;across {allQuestions.length} question{allQuestions.length !== 1 ? "s" : ""}
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <SmallBtn onClick={autoAdjustAll} title="Scale all questions proportionally to 100%">
                        <IconWand /> Auto Adjust All
                      </SmallBtn>
                      <SmallBtn onClick={weightEquallyAll} title="Set all questions to equal weight">
                        <IconEqual /> Weight All Equally
                      </SmallBtn>
                    </div>
                  </div>
                )}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {sections.map((sec, i) => (
                      <SectionTable
                        key={sec.id}
                        section={sec}
                        isFirst={i === 0}
                        methodology={methodology}
                        onUpdateQuestion={(qId, patch) => updateQuestion(sec.id, qId, patch)}
                        onDeleteQuestion={qId => deleteQuestion(sec.id, qId)}
                        onWeightEqually={() => weightEquallySection(sec.id)}
                        onAutoAdjust={() => autoAdjustSection(sec.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
}
