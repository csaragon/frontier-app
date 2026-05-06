// Implements: TLP-8 (conditional logic step, validation, visual rule builder)
import { useState } from "react";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  primary:      "#2226f7",
  primaryHover: "#1316a8",
  primaryBg:    "#d4e2ff",
  primaryLight: "#d4e2ff",
  navy:         "#001e76",
  navyDeep:     "#16191d",
  textSec:      "#555f6d",
  textMuted:    "#8692a2",
  bgApp:        "#f4f4f6",
  bgSurface:    "#ffffff",
  borderSubtle: "#e2e5e9",
  borderDef:    "#c3c8d0",
  success:      "#115e59",
  successBg:    "#ccfbf1",
  error:        "#b6143a",
  errorBg:      "#fae5e6",
  warning:      "#854d0e",
  warningBg:    "#fef9c3",
  info:         "#001e76",
  infoBg:       "#d4e2ff",
};
const FOCUS_RING = "0 0 0 2px #fff, 0 0 0 4px #2226f7";

export const OPERATORS_BY_TYPE = {
  "Pass/Fail":        ["equals", "not equals"],
  "Yes/No":           ["equals", "not equals"],
  "Multiple Choice":  ["equals", "not equals"],
  "Dropdown":         ["equals", "not equals"],
  "Rating":           ["equals", "not equals", "greater than", "less than", ">=", "<=", "between"],
  "Number":           ["equals", "not equals", "greater than", "less than", ">=", "<=", "between"],
  "Text":             ["contains", "does not contain"],
  "Multi-Select":     ["contains", "does not contain"],
};

const SAMPLE_CHOICES = {
  "Multiple Choice": ["Option A", "Option B", "Option C", "Option D"],
  "Dropdown":        ["Choice 1", "Choice 2", "Choice 3"],
  "Multi-Select":    ["Compliant", "Non-compliant", "N/A", "Pending review"],
};

function getOptions(q) {
  if (!q) return null;
  if (q.type === "Pass/Fail")    return ["Pass", "Fail"];
  if (q.type === "Yes/No")       return ["Yes", "No"];
  if (q.type === "Rating")       return ["1", "2", "3", "4", "5"];
  if (SAMPLE_CHOICES[q.type])    return SAMPLE_CHOICES[q.type];
  return null; // free-text or number input
}

// Evaluate all clauses for preview
export function evalRule(rule, answers) {
  if (!rule.clauses.length) return false;
  const ans = String(answers[rule.driverQuestionId] ?? "");

  function evalClause(c) {
    const v = String(c.value ?? "");
    switch (c.operator) {
      case "equals":           return ans === v;
      case "not equals":       return ans !== v;
      case "greater than":     return parseFloat(ans) > parseFloat(v);
      case "less than":        return parseFloat(ans) < parseFloat(v);
      case ">=":               return parseFloat(ans) >= parseFloat(v);
      case "<=":               return parseFloat(ans) <= parseFloat(v);
      case "between":          return parseFloat(ans) >= parseFloat(v) && parseFloat(ans) <= parseFloat(c.value2 ?? v);
      case "contains":         return ans.toLowerCase().includes(v.toLowerCase());
      case "does not contain":  return !ans.toLowerCase().includes(v.toLowerCase());
      default: return false;
    }
  }

  let result = evalClause(rule.clauses[0]);
  for (let i = 1; i < rule.clauses.length; i++) {
    const cr = evalClause(rule.clauses[i]);
    result = rule.clauses[i].joiner === "OR" ? result || cr : result && cr;
  }
  return result;
}

// ── Clause row ────────────────────────────────────────────────────────────────

function ClauseRow({ clause, isFirst, driverQ, onChange, onRemove, canRemove }) {
  const ops = OPERATORS_BY_TYPE[driverQ?.type] || ["equals", "not equals"];
  const opts = getOptions(driverQ);
  const isBetween = clause.operator === "between";
  const isNumeric = !opts && (driverQ?.type === "Number" || driverQ?.type === "Rating");

  const iStyle = {
    padding: "5px 8px", borderRadius: 6, border: `1px solid ${C.borderDef}`,
    fontSize: 12, fontFamily: F, color: C.navyDeep, background: C.bgSurface, outline: "none",
  };
  const focusBlur = { onFocus: e => (e.target.style.borderColor = C.primary), onBlur: e => (e.target.style.borderColor = C.borderDef) };

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      {/* Joiner toggle (not on first clause) */}
      {!isFirst ? (
        <button
          type="button"
          onClick={() => onChange({ joiner: clause.joiner === "OR" ? "AND" : "OR" })}
          aria-label={`Joiner: ${clause.joiner}. Click to toggle.`}
          style={{ padding: "3px 10px", borderRadius: 999, border: `1px solid ${C.primary}`, background: C.primaryBg, color: C.primary, fontSize: 12, fontWeight: 700, fontFamily: F, cursor: "pointer", outline: "none", minWidth: 40 }}
          onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
          onBlur={e => (e.currentTarget.style.boxShadow = "none")}
        >
          {clause.joiner || "AND"}
        </button>
      ) : (
        <span style={{ fontSize: 12, color: C.textMuted, fontFamily: F, fontStyle: "italic", minWidth: 14 }}>if</span>
      )}

      {/* Operator */}
      <select value={clause.operator || ops[0]} onChange={e => onChange({ operator: e.target.value, value: "", value2: "" })}
        style={{ ...iStyle, cursor: "pointer" }} {...focusBlur}
        aria-label="Condition operator"
      >
        {ops.map(op => <option key={op} value={op}>{op}</option>)}
      </select>

      {/* Value(s) */}
      {opts ? (
        <select value={clause.value ?? ""} onChange={e => onChange({ value: e.target.value })}
          style={{ ...iStyle, cursor: "pointer", minWidth: 90 }} {...focusBlur}
          aria-label="Condition value"
        >
          <option value="">Select…</option>
          {opts.map(o => <option key={o} value={String(o)}>{String(o)}</option>)}
        </select>
      ) : isBetween ? (
        <>
          <input value={clause.value ?? ""} onChange={e => onChange({ value: e.target.value })}
            type="number" placeholder="from" style={{ ...iStyle, width: 72 }} {...focusBlur} aria-label="From value" />
          <span style={{ fontSize: 12, color: C.textMuted, fontFamily: F }}>and</span>
          <input value={clause.value2 ?? ""} onChange={e => onChange({ value2: e.target.value })}
            type="number" placeholder="to" style={{ ...iStyle, width: 72 }} {...focusBlur} aria-label="To value" />
        </>
      ) : (
        <input value={clause.value ?? ""} onChange={e => onChange({ value: e.target.value })}
          type={isNumeric ? "number" : "text"} placeholder="value"
          style={{ ...iStyle, width: 100 }} {...focusBlur} aria-label="Condition value" />
      )}

      {/* Remove */}
      {canRemove && (
        <button type="button" onClick={onRemove} aria-label="Remove clause"
          style={{ background: "none", border: "none", cursor: "pointer", color: C.error, fontSize: 16, padding: "0 3px", lineHeight: 1, outline: "none" }}
          onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
          onBlur={e => (e.currentTarget.style.boxShadow = "none")}
        >
          &times;
        </button>
      )}
    </div>
  );
}

// ── Show-questions multi-select ───────────────────────────────────────────────

function ShowQsSelector({ showIds, onChange, allQuestions, driverQuestionId }) {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const available = allQuestions.filter(q => q.id !== driverQuestionId);
  const toggle = id => onChange(showIds.includes(id) ? showIds.filter(x => x !== id) : [...showIds, id]);
  const selectedQs = allQuestions.filter(q => showIds.includes(q.id));

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", minHeight: 28 }}>
        {selectedQs.length === 0 && (
          <em style={{ fontSize: 12, color: C.textMuted, fontFamily: F }}>No questions selected</em>
        )}
        {selectedQs.map(q => (
          <span key={q.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, background: C.primaryBg, border: `1px solid ${C.primaryLight}`, fontSize: 10, color: C.navy, fontFamily: F }}>
            {q.text.length > 28 ? q.text.slice(0, 28) + "…" : q.text}
            <button type="button" onClick={() => toggle(q.id)} aria-label={`Remove ${q.text}`}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 13, padding: 0, lineHeight: 1, display: "flex" }}>
              &times;
            </button>
          </span>
        ))}
        <button type="button" onClick={() => setOpen(o => !o)}
          aria-haspopup="listbox" aria-expanded={open}
          style={{ padding: "3px 10px", borderRadius: 6, border: `1px dashed ${C.primary}`, background: "transparent", color: C.primary, fontSize: 12, fontFamily: F, cursor: "pointer", outline: "none" }}
          onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
          onBlur={e => (e.currentTarget.style.boxShadow = "none")}
        >
          + Select questions
        </button>
      </div>

      {open && (
        <div
          role="listbox"
          aria-label="Select follow-up questions"
          aria-multiselectable="true"
          tabIndex={-1}
          onKeyDown={e => {
            if (e.key === "Escape") { e.stopPropagation(); setOpen(false); return; }
            if (e.key === "ArrowDown") { e.preventDefault(); setFocusIdx(i => Math.min(i + 1, available.length - 1)); }
            if (e.key === "ArrowUp")   { e.preventDefault(); setFocusIdx(i => Math.max(i - 1, 0)); }
            if ((e.key === "Enter" || e.key === " ") && focusIdx >= 0) { e.preventDefault(); toggle(available[focusIdx].id); }
          }}
          style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 700, background: C.bgSurface, border: `1px solid ${C.borderSubtle}`, borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.14)", width: 360, maxHeight: 220, overflowY: "auto" }}
        >
          {available.length === 0 ? (
            <div style={{ padding: "16px", fontSize: 12, color: C.textMuted, fontFamily: F, textAlign: "center" }}>No other questions in template</div>
          ) : (
            available.map((q, qi) => {
              const sel = showIds.includes(q.id);
              const isFocused = qi === focusIdx;
              return (
                <div
                  key={q.id}
                  role="option"
                  aria-selected={sel}
                  tabIndex={0}
                  onClick={() => toggle(q.id)}
                  onFocus={() => setFocusIdx(qi)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", background: isFocused ? C.bgApp : sel ? C.primaryBg : "transparent", outline: "none" }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = C.bgApp; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = sel ? C.primaryBg : "transparent"; }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? C.primary : C.borderDef}`, background: sel ? C.primary : C.bgSurface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.1s" }}>
                    {sel && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: C.navyDeep, fontFamily: F, lineHeight: "15px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{q.text}</div>
                    {q.sectionName && <div style={{ fontSize: 10, color: C.textMuted, fontFamily: F, marginTop: 1 }}>{q.sectionName}</div>}
                  </div>
                </div>
              );
            })
          )}
          <div style={{ borderTop: `1px solid ${C.borderSubtle}`, padding: "8px 14px" }}>
            <button type="button" onClick={() => setOpen(false)} style={{ fontSize: 12, color: C.textSec, background: "none", border: "none", cursor: "pointer", fontFamily: F }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Preview panel ─────────────────────────────────────────────────────────────

function PreviewPanel({ rule, driverQ, allQuestions }) {
  const [answer, setAnswer] = useState("");
  const opts = getOptions(driverQ);
  const fires = answer !== "" && evalRule(rule, { [rule.driverQuestionId]: answer });
  const iStyle = { padding: "5px 8px", borderRadius: 6, border: `1px solid ${C.borderDef}`, fontSize: 12, fontFamily: F, color: C.navyDeep, background: C.bgSurface, outline: "none" };

  return (
    <div style={{ marginTop: 12, padding: "12px 14px", background: C.bgApp, borderRadius: 8, border: `1px solid ${C.borderSubtle}` }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, fontFamily: F, marginBottom: 8 }}>Preview — set a mock answer</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: C.textSec, fontFamily: F }}>Mock answer:</span>
        {opts ? (
          <select value={answer} onChange={e => setAnswer(e.target.value)} style={{ ...iStyle, cursor: "pointer" }}
            onFocus={e => (e.target.style.borderColor = C.primary)} onBlur={e => (e.target.style.borderColor = C.borderDef)}>
            <option value="">-- choose --</option>
            {opts.map(o => <option key={o} value={String(o)}>{String(o)}</option>)}
          </select>
        ) : (
          <input value={answer} onChange={e => setAnswer(e.target.value)}
            type={driverQ?.type === "Number" || driverQ?.type === "Rating" ? "number" : "text"}
            placeholder="type a mock answer"
            style={{ ...iStyle, minWidth: 130 }}
            onFocus={e => (e.target.style.borderColor = C.primary)} onBlur={e => (e.target.style.borderColor = C.borderDef)} />
        )}
      </div>
      {answer !== "" && (
        <div style={{ fontSize: 12, fontFamily: F, lineHeight: "18px" }}>
          {fires ? (
            <>
              <span style={{ color: C.success, fontWeight: 600 }}>Rule fires. </span>
              <span style={{ color: C.textSec }}>Follow-up questions shown: </span>
              {rule.showIds.length === 0
                ? <em style={{ color: C.textMuted }}>none selected yet</em>
                : allQuestions.filter(q => rule.showIds.includes(q.id)).map(q => (
                    <span key={q.id} style={{ display: "inline-flex", marginRight: 5, padding: "1px 7px", borderRadius: 4, background: C.successBg, color: C.success, fontSize: 10, fontWeight: 600 }}>
                      {q.text.length > 24 ? q.text.slice(0, 24) + "…" : q.text}
                    </span>
                  ))
              }
            </>
          ) : (
            <span style={{ color: C.textMuted }}>Rule does not fire — no follow-up questions shown.</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── RuleCard ──────────────────────────────────────────────────────────────────

export default function RuleCard({ rule, driverQ, allQuestions, onUpdate, onDelete, errors, warnings }) {
  const [showPreview, setShowPreview] = useState(false);
  const hasErrors   = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  const updateClause = (i, updates) =>
    onUpdate({ clauses: rule.clauses.map((c, idx) => idx === i ? { ...c, ...updates } : c) });
  const removeClause = i =>
    onUpdate({ clauses: rule.clauses.filter((_, idx) => idx !== i) });
  const addClause = () => {
    const ops = OPERATORS_BY_TYPE[driverQ?.type] || ["equals"];
    onUpdate({ clauses: [...rule.clauses, { operator: ops[0], value: "", joiner: "AND" }] });
  };

  return (
    <div style={{
      background: hasErrors ? C.errorBg : C.bgSurface,
      border: `1px solid ${hasErrors ? "#fca5a5" : hasWarnings ? "#fde68a" : C.borderSubtle}`,
      borderRadius: 8, padding: "12px 14px", marginBottom: 8,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy, fontFamily: F }}>
          If this question…
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" onClick={() => setShowPreview(p => !p)}
            aria-pressed={showPreview}
            style={{ padding: "3px 10px", borderRadius: 6, border: `1px solid ${C.borderDef}`, background: showPreview ? C.primaryBg : C.bgSurface, color: showPreview ? C.primary : C.textSec, fontSize: 12, fontFamily: F, cursor: "pointer", outline: "none" }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          >
            Preview
          </button>
          <button type="button" onClick={onDelete} aria-label="Delete rule"
            style={{ padding: "3px 10px", borderRadius: 6, border: `1px solid ${C.borderSubtle}`, background: "transparent", color: C.error, fontSize: 12, fontFamily: F, cursor: "pointer", outline: "none" }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Clauses */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
        {rule.clauses.map((c, i) => (
          <ClauseRow key={i} clause={c} isFirst={i === 0} driverQ={driverQ}
            onChange={u => updateClause(i, u)}
            onRemove={() => removeClause(i)}
            canRemove={rule.clauses.length > 1}
          />
        ))}
        <button type="button" onClick={addClause}
          style={{ alignSelf: "flex-start", fontSize: 12, color: C.primary, background: "none", border: "none", cursor: "pointer", padding: "3px 0", fontFamily: F }}
          onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
          onBlur={e => (e.currentTarget.style.boxShadow = "none")}
        >
          + Add clause
        </button>
      </div>

      {/* Then show */}
      <div style={{ borderTop: `1px solid ${C.borderSubtle}`, paddingTop: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textSec, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
          …then show these questions
        </div>
        <ShowQsSelector
          showIds={rule.showIds}
          onChange={ids => onUpdate({ showIds: ids })}
          allQuestions={allQuestions}
          driverQuestionId={rule.driverQuestionId}
        />
      </div>

      {/* Validation messages */}
      {(hasErrors || hasWarnings) && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {errors.map((e, i) => (
            <div key={`e${i}`} role="alert" style={{ fontSize: 12, color: C.error, fontFamily: F, display: "flex", alignItems: "flex-start", gap: 5 }}>
              <svg style={{ flexShrink: 0, marginTop: 1 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>
              {e}
            </div>
          ))}
          {warnings.map((w, i) => (
            <div key={`w${i}`} role="alert" style={{ fontSize: 12, color: C.warning, fontFamily: F, display: "flex", alignItems: "flex-start", gap: 5 }}>
              <svg style={{ flexShrink: 0, marginTop: 1 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {showPreview && <PreviewPanel rule={rule} driverQ={driverQ} allQuestions={allQuestions} />}
    </div>
  );
}
