import { useState } from "react";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy: "#001e76", navy2: "#001356", navyBg: "#eef1ff",
  ocean: "#2226f7",
  white: "#ffffff",
  g1: "#f4f4f6", g2: "#e2e5e9", g3: "#c3c8d0", g4: "#8692a2", g5: "#555f6d", g6: "#16191d",
  red: "#b6143a", redBg: "#fae5e6",
  green: "#115e59", greenBg: "#f0fdf4",
  amber: "#854d0e",
  purpleBg: "#f5f3ff", purpleBorder: "#ddd6fe",
};

// Stub sections — in production these come from Step 3 question data.
// Sections typed "informational" are excluded from weighted scoring per Linear story:
// only sections containing at least one scored question get a weight input.
const STUB_SECTIONS = [
  { id: "s1", name: "General Compliance",        type: "scored" },
  { id: "s2", name: "Health & Safety Procedures", type: "scored" },
  { id: "s3", name: "Equipment Inspection",       type: "scored" },
  { id: "s4", name: "Documentation Review",       type: "scored" },
  { id: "s5", name: "Auditor Notes",              type: "informational" },
];
const SCORED_SECTIONS = STUB_SECTIONS.filter((s) => s.type === "scored");
const DEFAULT_WEIGHTS = Object.fromEntries(SCORED_SECTIONS.map((s) => [s.id, 25]));
const DEFAULT_THRESHOLDS = { A: 90, B: 80, C: 70, D: 60 };

const METHODOLOGIES = [
  { key: "weighted",      label: "Weighted",          desc: "Section weights combine into an overall percentage" },
  { key: "points",        label: "Points-Based",       desc: "Raw points earned out of total available" },
  { key: "passfail",      label: "Pass / Fail",        desc: "Binary pass or fail outcome" },
  { key: "informational", label: "Informational Only", desc: "No scoring — responses are collected for review only" },
];

const DISPLAY_FORMATS = [
  { key: "percentage",  label: "Percentage",  example: "87%" },
  { key: "rawscore",    label: "Raw Score",   example: "87/100 pts" },
  { key: "lettergrade", label: "Letter Grade", example: "A / B / C / D / F" },
  { key: "passfail",    label: "Pass / Fail",  example: "PASS or FAIL" },
  { key: "colorstatus", label: "Color Status", example: "Green / Yellow / Red" },
];

const TOOLTIPS = {
  methodology:      "Sets how the score is calculated. Changing this after questions are configured will reset some settings.",
  displayFormat:    "Controls how the final score is shown. You can use any display format with any methodology.",
  gradeThresholds:  "Set the % cutoffs for each letter grade. Each grade must be lower than the one above it.",
  sectionWeights:   "Weights determine how much each section contributes to the overall score. Total must equal 100%. Sections with only informational questions are excluded.",
  showRunningScore: "When auditors see their score live, they can self-correct as they go. Off keeps it private until submit.",
  showScoringMath:  "When math is visible, auditors understand exactly why their score is what it is.",
  showFinalScore:   "Some teams prefer manager review before the auditor sees their score.",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function sumWeights(weights) {
  return SCORED_SECTIONS.reduce((s, sec) => s + Number(weights?.[sec.id] ?? 0), 0);
}

function thresholdError(grade, val, t) {
  const num = Number(val);
  if (val === "" || isNaN(num)) return "Required.";
  if (num < 0 || num > 100) return "Must be 0–100.";
  if (grade === "A" && num <= Number(t.B ?? 80)) return "Grade A must be higher than Grade B.";
  if (grade === "B") {
    if (num >= Number(t.A ?? 90)) return "Grade B must be lower than Grade A.";
    if (num <= Number(t.C ?? 70)) return "Grade B must be higher than Grade C.";
  }
  if (grade === "C") {
    if (num >= Number(t.B ?? 80)) return "Grade C must be lower than Grade B.";
    if (num <= Number(t.D ?? 60)) return "Grade C must be higher than Grade D.";
  }
  if (grade === "D" && num >= Number(t.C ?? 70)) return "Grade D must be lower than Grade C.";
  return null;
}

function getAffectedItems(from, to) {
  // Stub — in production inspects Step 3 question data for affected settings
  const items = [];
  if (from === "weighted") items.push("section weights");
  if (to === "informational") items.push("display format and score visibility settings");
  if (!items.length) items.push("scoring configuration");
  return items;
}

const GRADE_COLORS = {
  A: { color: "#115e59", bg: "#dcfce7" },
  B: { color: "#0891b2", bg: "#e0f2fe" },
  C: { color: "#d97706", bg: "#fef3c7" },
  D: { color: "#854d0e", bg: "#fff7ed" },
  F: { color: "#b6143a", bg: "#fee2e2" },
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconPercent({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function IconAward({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function IconCheck({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconClipboard({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function IconInfo({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function IconCheckSmall({ color = C.green }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        aria-label="More information"
        style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, display: "flex", padding: 2, borderRadius: 4, lineHeight: 1 }}
      >
        <IconInfo />
      </button>
      {show && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 6px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: C.g6,
          color: C.white,
          padding: "8px 12px",
          borderRadius: 6,
          fontSize: 12,
          lineHeight: "16px",
          fontFamily: F,
          width: 250,
          whiteSpace: "normal",
          zIndex: 400,
          pointerEvents: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

function SectionHead({ title, helper, tooltip }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: helper ? 4 : 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.g6, fontFamily: F }}>{title}</span>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      {helper && (
        <p style={{ margin: 0, fontSize: 12, color: C.g4, fontFamily: F, lineHeight: "17px" }}>{helper}</p>
      )}
    </div>
  );
}

function SectionCard({ title, helper, tooltip, extra, children }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 12, marginBottom: 20, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${C.g2}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.g6, fontFamily: F }}>{title}</span>
          {tooltip && <InfoTooltip text={tooltip} />}
          {extra}
        </div>
        {helper && <p style={{ margin: "3px 0 0", fontSize: 12, color: C.g4, fontFamily: F, lineHeight: "17px" }}>{helper}</p>}
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

const SCORING_MATH = {
  weighted:      "Each section contributes proportionally based on its weight. Final score = Σ(section score × section weight). Section weights must total 100%.",
  points:        "Final score = earned points ÷ total available points × 100. Each question is assigned a point value; auditors earn those points for correct answers.",
  passfail:      "The audit passes or fails based on critical questions and thresholds you configure. There is no numeric score — the outcome is binary.",
  informational: "No score is calculated. Responses are recorded as-is for review and reporting. Useful for intake forms or observation checklists.",
};

function ScoringMathBox({ methodology }) {
  const [show, setShow] = useState(false);
  const body = SCORING_MATH[methodology];
  if (!body) return null;
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: 6 }}>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", color: C.g4, lineHeight: 1 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </button>
      {show && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          background: C.g6, color: C.white, padding: "9px 13px", borderRadius: 7,
          fontSize: 12, fontFamily: F, lineHeight: "18px", width: 260, zIndex: 999,
          boxShadow: "0 4px 14px rgba(0,0,0,0.22)", whiteSpace: "normal", pointerEvents: "none",
        }}>
          {body}
        </div>
      )}
    </span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: C.g2 }} />;
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 20,
        background: checked ? C.navy : C.g3,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.18s",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 2,
        left: checked ? 18 : 2,
        width: 16, height: 16,
        background: C.white,
        borderRadius: "50%",
        transition: "left 0.18s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        display: "block",
      }} />
    </button>
  );
}

function ToggleRow({ checked, onChange, label, helper, tooltip }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <Toggle checked={checked} onChange={onChange} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.g6, fontFamily: F }}>{label}</span>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: C.g4, fontFamily: F, lineHeight: "16px" }}>{helper}</p>
      </div>
    </div>
  );
}

function CheckboxRow({ checked, onChange, label, helper, tooltip }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 16, height: 16, marginTop: 1, cursor: "pointer", accentColor: C.navy, flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.g6, fontFamily: F }}>{label}</span>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: C.g4, fontFamily: F, lineHeight: "16px" }}>{helper}</p>
      </div>
    </label>
  );
}

// ── Methodology Card ──────────────────────────────────────────────────────────

function MethodCard({ method, selected, onClick }) {
  const [hover, setHover] = useState(false);
  const active = selected === method.key;
  const iconColor = active ? C.navy : C.g4;

  return (
    <div
      onClick={() => onClick(method.key)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: "1 1 180px",
        padding: "20px 18px",
        border: `2px solid ${active ? C.navy : hover ? C.g3 : C.g2}`,
        borderRadius: 12,
        cursor: "pointer",
        background: active ? C.navyBg : C.white,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "border-color 0.15s, background 0.15s",
        userSelect: "none",
      }}
    >
      <div>
        {method.key === "weighted"      && <IconPercent color={iconColor} />}
        {method.key === "points"        && <IconAward color={iconColor} />}
        {method.key === "passfail"      && <IconCheck color={iconColor} />}
        {method.key === "informational" && <IconClipboard color={iconColor} />}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: active ? C.navy : C.g6, fontFamily: F, marginBottom: 4 }}>
          {method.label}
        </div>
        <div style={{ fontSize: 12, color: C.g5, fontFamily: F, lineHeight: "16px" }}>
          {method.desc}
        </div>
      </div>
    </div>
  );
}

// ── Display Format Card ───────────────────────────────────────────────────────

function FormatCard({ format, selected, onClick }) {
  const [hover, setHover] = useState(false);
  const active = selected === format.key;

  return (
    <div
      onClick={() => onClick(format.key)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: "1 1 130px",
        padding: "16px 12px",
        border: `2px solid ${active ? C.navy : hover ? C.g3 : C.g2}`,
        borderRadius: 12,
        cursor: "pointer",
        background: active ? C.navyBg : C.white,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        transition: "border-color 0.15s, background 0.15s",
        userSelect: "none",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: active ? C.navy : C.g6, fontFamily: F }}>
        {format.label}
      </div>
      <div style={{
        fontSize: 13, fontWeight: 700,
        color: active ? C.navy : C.g4,
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        letterSpacing: -0.3,
      }}>
        {format.example}
      </div>
    </div>
  );
}

// ── Letter Grade Thresholds ───────────────────────────────────────────────────

function GradeThresholdsCard({ thresholds, onChange }) {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const grades = ["A", "B", "C", "D"];

  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.g2}`,
      borderRadius: 12,
      padding: "20px 24px",
      marginTop: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.g6, fontFamily: F }}>Letter Grade Thresholds</span>
        <InfoTooltip text={TOOLTIPS.gradeThresholds} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {grades.map((grade) => {
          const val = t[grade];
          const err = thresholdError(grade, val, t);
          const gc = GRADE_COLORS[grade];
          return (
            <div key={grade} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: gc.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: gc.color, fontFamily: F }}>{grade}</span>
              </div>
              <span style={{ fontSize: 12, color: C.g4, width: 14, fontFamily: F }}>≥</span>
              <input
                type="number"
                min="0"
                max="100"
                value={val}
                onChange={(e) => onChange({ ...t, [grade]: e.target.value === "" ? "" : Number(e.target.value) })}
                style={{
                  width: 68,
                  padding: "5px 8px",
                  border: `1px solid ${err ? C.red : C.g3}`,
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: F,
                  textAlign: "right",
                  outline: "none",
                }}
                onFocus={(e) => { if (!err) e.target.style.borderColor = C.ocean; }}
                onBlur={(e) => { e.target.style.borderColor = err ? C.red : C.g3; }}
              />
              <span style={{ fontSize: 12, color: C.g5, fontFamily: F }}>% → {grade}</span>
              {err && (
                <span style={{ fontSize: 12, color: C.red, fontFamily: F }}>{err}</span>
              )}
            </div>
          );
        })}
        {/* Grade F — derived, read-only */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: GRADE_COLORS.F.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: GRADE_COLORS.F.color, fontFamily: F }}>F</span>
          </div>
          <span style={{ fontSize: 12, color: C.g4, fontFamily: F }}>
            Below D — &lt; {t.D}% → F
          </span>
          <span style={{ fontSize: 12, color: C.g4, fontFamily: F, fontStyle: "italic" }}>
            (derived from Grade D threshold)
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Section Weights Table ─────────────────────────────────────────────────────

function SectionWeightsTable({ weights, onChange }) {
  const total = sumWeights(weights);
  const balanced = Math.round(total) === 100;

  return (
    <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 12, overflow: "hidden" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 20px", background: C.g1, borderBottom: `1px solid ${C.g2}` }}>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: F }}>Section</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: F, width: 90, textAlign: "right" }}>Weight</span>
      </div>

      {/* Section rows */}
      {SCORED_SECTIONS.map((sec) => {
        const val = weights?.[sec.id] ?? 25;
        return (
          <div key={sec.id} style={{ display: "flex", alignItems: "center", padding: "12px 20px", borderBottom: `1px solid ${C.g2}` }}>
            <span style={{ flex: 1, fontSize: 13, color: C.g6, fontFamily: F }}>{sec.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="number"
                min="0"
                max="100"
                value={val}
                onChange={(e) => onChange({ ...weights, [sec.id]: e.target.value === "" ? "" : Number(e.target.value) })}
                style={{
                  width: 64, padding: "5px 8px",
                  border: `1px solid ${C.g3}`,
                  borderRadius: 6,
                  fontSize: 13, fontFamily: F,
                  textAlign: "right", outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = C.ocean; }}
                onBlur={(e) => { e.target.style.borderColor = C.g3; }}
              />
              <span style={{ fontSize: 13, color: C.g5, fontFamily: F, width: 14 }}>%</span>
            </div>
          </div>
        );
      })}

      {/* Informational-only notice */}
      <div style={{ padding: "8px 20px", borderBottom: `1px solid ${C.g2}`, background: C.g1, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: C.g4, fontFamily: F, fontStyle: "italic" }}>
          "Auditor Notes" excluded — informational-only sections don't contribute to scoring
        </span>
      </div>

      {/* Total row */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "12px 20px",
        background: balanced ? C.greenBg : C.redBg,
      }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
          {balanced && <IconCheckSmall />}
          <span style={{ fontSize: 12, fontWeight: 600, color: balanced ? C.green : C.red, fontFamily: F }}>
            {balanced
              ? "Weights balanced"
              : "Weights must sum to 100% before this template can be activated"}
          </span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: balanced ? C.green : C.red, fontFamily: F }}>
          {total}%
        </span>
      </div>
    </div>
  );
}

// ── Methodology Change Modal ──────────────────────────────────────────────────

function MethodologyModal({ currentMethod, pendingMethod, onConfirm, onCancel }) {
  const pendingLabel = METHODOLOGIES.find((m) => m.key === pendingMethod)?.label || pendingMethod;
  const affected = getAffectedItems(currentMethod, pendingMethod);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.48)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ background: C.white, borderRadius: 12, width: 440, maxWidth: "calc(100vw - 32px)", padding: "28px 28px 24px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: F }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: C.g6 }}>
          Change scoring methodology?
        </h3>
        <p style={{ margin: "0 0 8px", fontSize: 13, color: C.g5, lineHeight: "20px" }}>
          Changing to <strong>{pendingLabel}</strong> will reset:
        </p>
        <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>
          {affected.map((item, i) => (
            <li key={i} style={{ fontSize: 13, color: C.g5, lineHeight: "22px" }}>{item}</li>
          ))}
        </ul>
        <p style={{ margin: "0 0 22px", fontSize: 12, color: C.g4 }}>This can't be undone.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onConfirm}
            style={{ background: C.navy, color: C.white, border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.navy2; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.navy; }}
          >
            Change methodology
          </button>
          <button
            onClick={onCancel}
            style={{ background: C.white, color: C.g6, border: `1px solid ${C.g3}`, borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 500, fontFamily: F, cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.g1; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.white; }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScoringMethodology({ formData, onChange, onNext, onBack, hasQuestions = false }) {
  // Merge user data over defaults — defaults do not trigger onChange on mount
  const d = {
    methodology:      null,
    displayFormat:    null,
    gradeThresholds:  DEFAULT_THRESHOLDS,
    sectionWeights:   DEFAULT_WEIGHTS,
    showRunningScore: true,
    showScoringMath:  false,
    showFinalScore:   true,
    ...(formData || {}),
  };

  const [pendingMethodology, setPendingMethodology] = useState(null);

  const isInfoOnly     = d.methodology === "informational";
  const showWeights    = d.methodology === "weighted";
  const showGradeTiers = d.displayFormat === "lettergrade";

  function handleMethodologyClick(key) {
    if (key === d.methodology) return;
    if (d.methodology !== null && hasQuestions) {
      setPendingMethodology(key);
    } else {
      onChange({ methodology: key });
    }
  }

  function confirmMethodologyChange() {
    // Stub: update methodology only. In production: reset affected per-question
    // and section data in Step 3, and clear display format if switching to informational.
    onChange({ methodology: pendingMethodology });
    setPendingMethodology(null);
  }

  return (
    <div style={{ padding: "40px 24px 80px", display: "flex", justifyContent: "center", fontFamily: F }}>
      <div style={{ width: "100%", maxWidth: 1080 }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ margin: "0 0 5px", fontSize: 20, fontWeight: 700, color: C.g6, fontFamily: F }}>Scoring</h2>
          <p style={{ margin: 0, fontSize: 13, color: C.g5, fontFamily: F }}>Define how audits are scored — methodology, display format, and score visibility.</p>
        </div>

        {/* ── Section 1: Methodology ── */}
        <SectionCard
          title="Scoring Methodology"
          helper="How the final score is calculated from individual question responses"
          tooltip={TOOLTIPS.methodology}
          extra={<ScoringMathBox key={d.methodology} methodology={d.methodology} />}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {METHODOLOGIES.map((m) => (
              <MethodCard key={m.key} method={m} selected={d.methodology} onClick={handleMethodologyClick} />
            ))}
          </div>
        </SectionCard>

        {/* ── Section 2: Display format (hidden for informational) ── */}
        {!isInfoOnly && (
          <SectionCard
            title="Display format"
            helper="How the final score is presented to auditors and reviewers"
            tooltip={TOOLTIPS.displayFormat}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {DISPLAY_FORMATS.map((fmt) => (
                <FormatCard
                  key={fmt.key}
                  format={fmt}
                  selected={d.displayFormat}
                  onClick={(key) => onChange({ displayFormat: key })}
                />
              ))}
            </div>

            {/* 2a: Grade thresholds — only when letter grade selected */}
            {showGradeTiers && (
              <GradeThresholdsCard
                thresholds={d.gradeThresholds}
                onChange={(updated) => onChange({ gradeThresholds: updated })}
              />
            )}
          </SectionCard>
        )}

        {/* ── Section 3: Section weights (weighted only) ── */}
        {showWeights && (
          <SectionCard
            title="Section weights"
            helper="Set how much each section contributes to the overall score. Weights must total exactly 100%."
            tooltip={TOOLTIPS.sectionWeights}
          >
            <SectionWeightsTable
              weights={d.sectionWeights}
              onChange={(updated) => onChange({ sectionWeights: updated })}
            />
          </SectionCard>
        )}

        {/* ── Score visibility (hidden for informational) ── */}
        {!isInfoOnly && (
          <SectionCard title="Score visibility" helper="Control what auditors see during and after completing the audit">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <CheckboxRow
                checked={d.showRunningScore}
                onChange={(val) => onChange({ showRunningScore: val })}
                label="Show running score"
                helper="Let auditors see their score update live while completing the audit."
                tooltip={TOOLTIPS.showRunningScore}
              />
              <Divider />
              <ToggleRow
                checked={d.showFinalScore}
                onChange={(val) => onChange({ showFinalScore: val })}
                label="Show final score at submit"
                helper="If off, the auditor completes the audit but doesn't see the resulting score. Useful for blind audits."
                tooltip={TOOLTIPS.showFinalScore}
              />
            </div>
          </SectionCard>
        )}

      </div>

      {/* Methodology change confirmation modal */}
      {pendingMethodology && (
        <MethodologyModal
          currentMethod={d.methodology}
          pendingMethod={pendingMethodology}
          onConfirm={confirmMethodologyChange}
          onCancel={() => setPendingMethodology(null)}
        />
      )}
    </div>
  );
}
