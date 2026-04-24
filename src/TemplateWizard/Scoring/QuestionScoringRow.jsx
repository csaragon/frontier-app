// Implements: TLP-87 (scoring per question type x scoring model)
import { TYPE_META } from "../../Catalog.jsx";

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
  error:        "#dc2626",
  errorBg:      "#fef2f2",
};
const FOCUS_RING = "0 0 0 2px #fff, 0 0 0 4px #2226f7";

// Prototype-level sample choices for types that require defined answer lists
const SAMPLE_CHOICES = {
  "Multiple Choice": ["Option A", "Option B", "Option C", "Option D"],
  "Multi-Select":    ["Compliant", "Non-compliant", "N/A", "Pending review"],
  "Dropdown":        ["Choice 1", "Choice 2", "Choice 3"],
};
const RATING_VALS = [1, 2, 3, 4, 5];
const NUM_OPS     = ["=", "!=", ">", ">=", "<", "<="];

// ── Default scoring state per question × model ────────────────────────────────

export function defaultScoringForQuestion(q, model) {
  if (model === "informational") return {};

  const choices = SAMPLE_CHOICES[q.type] || [];
  const choicePoints = Object.fromEntries(choices.map(c => [c, 0]));

  if (model === "weighted" || model === "passfail") {
    const base = model === "weighted" ? { weight: 0 } : {};
    if (q.type === "Pass/Fail")       return { ...base, passingValue: "Pass" };
    if (q.type === "Yes/No")          return { ...base, passingValue: "Yes" };
    if (q.type === "Rating")          return { ...base, passingValues: [4, 5] };
    if (q.type === "Text")            return { ...base, passingValues: [4, 5] };
    if (q.type === "Number")          return { ...base, conditions: [{ op: ">=", value: "" }] };
    if (q.type === "Multiple Choice") return { ...base, passingValues: [] };
    if (q.type === "Dropdown")        return { ...base, passingValues: [] };
    if (q.type === "Multi-Select")    return { ...base, logic: "ALL", conditions: [] };
    return base;
  }

  if (model === "points") {
    const base = { maxPoints: 5 };
    if (q.type === "Pass/Fail")       return { ...base, receivesPoints: "Pass" };
    if (q.type === "Yes/No")          return { ...base, receivesPoints: "Yes" };
    if (q.type === "Rating")          return { ...base, ratingPoints: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 } };
    if (q.type === "Text")            return { ...base, ratingPoints: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 } };
    if (q.type === "Number")          return { ...base, conditions: [{ op: ">=", value: "", points: 0 }] };
    if (q.type === "Multiple Choice" || q.type === "Dropdown" || q.type === "Multi-Select")
      return { ...base, choicePoints };
    return base;
  }

  return {};
}

// ── Tiny shared primitives ────────────────────────────────────────────────────

function FieldGroup({ label, help, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div>
        <span style={{ fontSize: 10, fontWeight: 600, color: C.textSec, fontFamily: F }}>{label}</span>
        {help && <span style={{ fontSize: 10, color: C.textMuted, fontFamily: F, marginLeft: 5 }}>({help})</span>}
      </div>
      {children}
    </label>
  );
}

function SmSel({ value, options, onChange, width, "aria-label": ariaLabel }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={ariaLabel}
      style={{ padding: "5px 8px", borderRadius: 6, border: `1px solid ${C.borderDef}`, fontSize: 11, fontFamily: F, color: C.navyDeep, background: C.bgSurface, cursor: "pointer", outline: "none", width: width || "auto" }}
      onFocus={e => (e.target.style.borderColor = C.primary)}
      onBlur={e => (e.target.style.borderColor = C.borderDef)}
    >
      {options.map(o => {
        const v = o.value !== undefined ? o.value : o;
        const l = o.label !== undefined ? o.label : String(o);
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  );
}

function SmInput({ value, onChange, type = "number", placeholder, width, hasError, "aria-label": ariaLabel }) {
  return (
    <input
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
      aria-label={ariaLabel}
      style={{ padding: "5px 8px", borderRadius: 6, border: `1px solid ${hasError ? C.error : C.borderDef}`, fontSize: 11, fontFamily: F, color: C.navyDeep, background: C.bgSurface, outline: "none", width: width || 72, boxSizing: "border-box" }}
      onFocus={e => { if (!hasError) e.target.style.borderColor = C.primary; }}
      onBlur={e => { if (!hasError) e.target.style.borderColor = C.borderDef; }}
    />
  );
}

function MultiChip({ values, options, onChange }) {
  const toggle = v => onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v]);
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {options.map(o => {
        const key = String(o);
        const sel = values.includes(o);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(o)}
            aria-pressed={sel}
            style={{ padding: "3px 9px", borderRadius: 999, border: `1px solid ${sel ? C.primary : C.borderDef}`, background: sel ? C.primaryBg : C.bgSurface, color: sel ? C.primaryHover : C.navyDeep, fontSize: 11, fontFamily: F, cursor: "pointer", outline: "none", fontWeight: sel ? 600 : 400 }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}

function ConditionBuilder({ conditions, onChange, withPoints, maxPoints }) {
  const update = (i, u) => onChange(conditions.map((c, idx) => idx === i ? { ...c, ...u } : c));
  const remove = i => onChange(conditions.filter((_, idx) => idx !== i));
  const add    = () => onChange([...conditions, { op: ">=", value: "", ...(withPoints ? { points: 0 } : {}) }]);

  return (
    <div>
      {conditions.map((c, i) => {
        const ptsExceed = withPoints && maxPoints != null && parseFloat(c.points) > parseFloat(maxPoints);
        return (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
            <SmSel value={c.op} options={NUM_OPS} onChange={v => update(i, { op: v })} width={56} />
            <SmInput value={c.value} onChange={v => update(i, { value: v })} placeholder="value" width={72} />
            {withPoints && (
              <>
                <span style={{ fontSize: 10, color: C.textMuted, fontFamily: F }}>&#8594;</span>
                <SmInput value={c.points ?? 0} onChange={v => update(i, { points: v })} placeholder="pts" width={56} hasError={ptsExceed} />
                <span style={{ fontSize: 10, color: ptsExceed ? C.error : C.textMuted, fontFamily: F }}>pts{ptsExceed ? " (exceeds max)" : ""}</span>
              </>
            )}
            <button
              onClick={() => remove(i)}
              disabled={conditions.length === 1}
              aria-label="Remove condition"
              style={{ background: "none", border: "none", cursor: conditions.length === 1 ? "not-allowed" : "pointer", color: C.error, fontSize: 16, padding: "0 2px", lineHeight: 1, opacity: conditions.length === 1 ? 0.3 : 1 }}
            >
              &times;
            </button>
          </div>
        );
      })}
      <button
        onClick={add}
        style={{ fontSize: 11, color: C.primary, background: "none", border: "none", cursor: "pointer", padding: "3px 0", fontFamily: F }}
        onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
        onBlur={e => (e.currentTarget.style.boxShadow = "none")}
      >
        + Add condition
      </button>
    </div>
  );
}

// ── Weighted / Pass-Fail renderers (weight field rendered by parent) ───────────

function WF_PassFail({ sc, upd }) {
  return (
    <FieldGroup label="Passing value" help="Response must match to count as passed">
      <SmSel value={sc.passingValue || "Pass"} options={["Pass", "Fail"]} onChange={v => upd({ passingValue: v })} />
    </FieldGroup>
  );
}

function WF_YesNo({ sc, upd }) {
  return (
    <FieldGroup label="Passing value">
      <SmSel value={sc.passingValue || "Yes"} options={["Yes", "No"]} onChange={v => upd({ passingValue: v })} />
    </FieldGroup>
  );
}

function WF_Rating({ sc, upd, isText }) {
  return (
    <FieldGroup label="Passing value/s" help="Values not included will be marked failed">
      <MultiChip values={sc.passingValues || []} options={RATING_VALS} onChange={v => upd({ passingValues: v })} />
      {isText && <em style={{ fontSize: 10, color: C.textMuted, fontFamily: F }}>Text entries will be rated on this scale.</em>}
    </FieldGroup>
  );
}

function WF_Number({ sc, upd }) {
  return (
    <FieldGroup label="Passing value/s" help="Values not included in this set will be marked as failed on your question">
      <ConditionBuilder conditions={sc.conditions || [{ op: ">=", value: "" }]} onChange={v => upd({ conditions: v })} withPoints={false} />
    </FieldGroup>
  );
}

function WF_Choice({ sc, upd, type }) {
  const choices = SAMPLE_CHOICES[type] || [];
  return (
    <FieldGroup label="Passing value/s" help="Values not included will be marked failed">
      <MultiChip values={sc.passingValues || []} options={choices} onChange={v => upd({ passingValues: v })} />
    </FieldGroup>
  );
}

function WF_MultiSelect({ sc, upd }) {
  const choices = SAMPLE_CHOICES["Multi-Select"];
  const logic = sc.logic || "ALL";
  const conditions = sc.conditions || [];
  return (
    <FieldGroup label="Passing value/s">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: C.textSec, fontFamily: F }}>Pass if</span>
        <SmSel value={logic} options={[{ value: "ALL", label: "ALL of" }, { value: "ANY", label: "ANY of" }]} onChange={v => upd({ logic: v })} />
        <span style={{ fontSize: 11, color: C.textSec, fontFamily: F }}>these are selected:</span>
      </div>
      <MultiChip values={conditions} options={choices} onChange={v => upd({ conditions: v })} />
    </FieldGroup>
  );
}

// ── Points-Based renderers ────────────────────────────────────────────────────

function PB_PassFail({ sc, upd }) {
  const maxPts = sc.maxPoints ?? 5;
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <FieldGroup label="Max points">
        <SmInput value={maxPts} onChange={v => upd({ maxPoints: parseFloat(v) || 0 })} width={64} />
      </FieldGroup>
      <FieldGroup label="Receives points when">
        <SmSel value={sc.receivesPoints || "Pass"} options={["Pass", "Fail"]} onChange={v => upd({ receivesPoints: v })} />
      </FieldGroup>
    </div>
  );
}

function PB_YesNo({ sc, upd }) {
  const maxPts = sc.maxPoints ?? 5;
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <FieldGroup label="Max points">
        <SmInput value={maxPts} onChange={v => upd({ maxPoints: parseFloat(v) || 0 })} width={64} />
      </FieldGroup>
      <FieldGroup label="Receives points when">
        <SmSel value={sc.receivesPoints || "Yes"} options={["Yes", "No"]} onChange={v => upd({ receivesPoints: v })} />
      </FieldGroup>
    </div>
  );
}

function PB_Rating({ sc, upd, isText }) {
  const maxPts = parseFloat(sc.maxPoints ?? 5);
  const rp = sc.ratingPoints || { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <FieldGroup label="Max points">
        <SmInput value={sc.maxPoints ?? 5} onChange={v => upd({ maxPoints: parseFloat(v) || 0 })} width={64} />
      </FieldGroup>
      <FieldGroup label="Points per rating value" help="no value may exceed max points">
        <div style={{ display: "flex", gap: 8 }}>
          {RATING_VALS.map(v => {
            const pts = parseFloat(rp[v] ?? 0);
            const over = pts > maxPts;
            return (
              <div key={v} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 10, color: C.textMuted, fontFamily: F }}>{v}</span>
                <SmInput value={rp[v] ?? 0} onChange={val => upd({ ratingPoints: { ...rp, [v]: parseFloat(val) || 0 } })} width={48} hasError={over} />
              </div>
            );
          })}
        </div>
      </FieldGroup>
      {isText && <em style={{ fontSize: 10, color: C.textMuted, fontFamily: F }}>Text entries will be rated on this scale.</em>}
    </div>
  );
}

function PB_Number({ sc, upd }) {
  const maxPts = parseFloat(sc.maxPoints ?? 5);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <FieldGroup label="Max points">
        <SmInput value={sc.maxPoints ?? 5} onChange={v => upd({ maxPoints: parseFloat(v) || 0 })} width={64} />
      </FieldGroup>
      <FieldGroup label="Points per condition" help="conditions may not overlap; no condition may exceed max points">
        <ConditionBuilder
          conditions={sc.conditions || [{ op: ">=", value: "", points: 0 }]}
          onChange={v => upd({ conditions: v })}
          withPoints
          maxPoints={maxPts}
        />
      </FieldGroup>
    </div>
  );
}

function PB_Choice({ sc, upd, type }) {
  const maxPts = parseFloat(sc.maxPoints ?? 5);
  const choices = SAMPLE_CHOICES[type] || [];
  const cp = sc.choicePoints || Object.fromEntries(choices.map(c => [c, 0]));
  const isMulti = type === "Multi-Select";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <FieldGroup label="Max points">
        <SmInput value={sc.maxPoints ?? 5} onChange={v => upd({ maxPoints: parseFloat(v) || 0 })} width={64} />
      </FieldGroup>
      <FieldGroup label="Points per choice">
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {choices.map(ch => {
            const pts = parseFloat(cp[ch] ?? 0);
            const over = pts > maxPts;
            return (
              <div key={ch} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: C.navyDeep, fontFamily: F, minWidth: 110 }}>{ch}</span>
                <SmInput value={cp[ch] ?? 0} onChange={v => upd({ choicePoints: { ...cp, [ch]: parseFloat(v) || 0 } })} width={56} hasError={over} />
                <span style={{ fontSize: 10, color: over ? C.error : C.textMuted, fontFamily: F }}>{over ? "exceeds max" : "pts"}</span>
              </div>
            );
          })}
          {isMulti && <em style={{ fontSize: 10, color: C.textMuted, fontFamily: F, marginTop: 2 }}>Validate that no combination of simultaneously-selected choices exceeds max points.</em>}
        </div>
      </FieldGroup>
    </div>
  );
}

// ── Main row component ────────────────────────────────────────────────────────

export default function QuestionScoringRow({ q, model, scoring, onChange, sectionWeightError }) {
  const tm = TYPE_META[q.type] || { color: C.textSec, bg: C.bgApp };
  const isConditional = !!q.isConditional;
  const sc = scoring;
  const upd = updates => onChange({ ...sc, ...updates });

  function renderTypeFields() {
    if (model === "informational" || isConditional) return null;

    const wf = model === "weighted" || model === "passfail";
    const pb = model === "points";

    if (wf) {
      if (q.type === "Pass/Fail")       return <WF_PassFail sc={sc} upd={upd} />;
      if (q.type === "Yes/No")          return <WF_YesNo    sc={sc} upd={upd} />;
      if (q.type === "Rating")          return <WF_Rating   sc={sc} upd={upd} isText={false} />;
      if (q.type === "Text")            return <WF_Rating   sc={sc} upd={upd} isText />;
      if (q.type === "Number")          return <WF_Number   sc={sc} upd={upd} />;
      if (q.type === "Multiple Choice" || q.type === "Dropdown") return <WF_Choice sc={sc} upd={upd} type={q.type} />;
      if (q.type === "Multi-Select")    return <WF_MultiSelect sc={sc} upd={upd} />;
    }

    if (pb) {
      if (q.type === "Pass/Fail")       return <PB_PassFail sc={sc} upd={upd} />;
      if (q.type === "Yes/No")          return <PB_YesNo    sc={sc} upd={upd} />;
      if (q.type === "Rating")          return <PB_Rating   sc={sc} upd={upd} isText={false} />;
      if (q.type === "Text")            return <PB_Rating   sc={sc} upd={upd} isText />;
      if (q.type === "Number")          return <PB_Number   sc={sc} upd={upd} />;
      if (q.type === "Multiple Choice" || q.type === "Dropdown" || q.type === "Multi-Select")
        return <PB_Choice sc={sc} upd={upd} type={q.type} />;
    }

    return null;
  }

  return (
    <div
      id={`q-score-${q.id}`}
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) auto",
        gap: 16,
        padding: "13px 16px",
        borderBottom: `1px solid ${C.borderSubtle}`,
        alignItems: "flex-start",
        background: "transparent",
      }}
    >
      {/* Left — question identity */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 500, color: C.navyDeep, fontFamily: F, lineHeight: "15px", marginBottom: 5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {q.text}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 600, fontFamily: F, background: tm.bg, color: tm.color }}>{q.type}</span>
          {isConditional && <em style={{ fontSize: 9, color: C.textMuted, fontFamily: F }}>Conditional — excluded from scoring</em>}
        </div>
      </div>

      {/* Right — scoring fields */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap", justifyContent: "flex-end", minWidth: 220 }}>

        {/* Weight (Weighted model only, hidden for conditionals) */}
        {model === "weighted" && !isConditional && (
          <FieldGroup label="Weight %" help="must total 100% in section">
            <SmInput
              value={sc.weight ?? 0}
              onChange={v => upd({ weight: parseFloat(v) || 0 })}
              width={64}
              hasError={sectionWeightError}
            />
          </FieldGroup>
        )}

        {/* Type-specific fields */}
        {renderTypeFields()}

        {/* Conditional — excluded from scoring */}
        {isConditional && model !== "informational" && (
          <em title="Conditional questions are excluded from scoring in V1" style={{ fontSize: 11, color: C.textMuted, fontFamily: F, alignSelf: "center", cursor: "help" }}>
            Excluded from scoring
          </em>
        )}

        {/* Informational note */}
        {model === "informational" && (
          <em style={{ fontSize: 11, color: C.textMuted, fontFamily: F, alignSelf: "center" }}>Data collection only</em>
        )}
      </div>
    </div>
  );
}
