import { useState, useEffect, useRef } from "react";
import Step1Details from "./Step1Details.jsx";
import Step2Scoring from "./Step2Scoring.jsx";
import Step3Sections from "./Step3Sections.jsx";
import Step4Schedule from "./Step4Schedule.jsx";
import Step5Escalation from "./Step5Escalation.jsx";
import { DiscardModal } from "./modals.jsx";
import { T, F } from "../aegis-tokens.js";

const C = {
  navy:      T.action1,
  navy2:     T.action2,
  ocean:     T.actionContainer1,
  oceanBg:   T.actionContainer3,
  white:     T.surface1,
  g1:        T.surface2,
  g2:        T.border1,
  g3:        T.border2,
  g4:        T.disabled1,
  g5:        T.onSurface1,
  g6:        T.onSurface2,
  teal:      "#0f766e",
  tealBg:    T.successContainer1,
  amber:     T.warning1,
  amberBg:   T.warningContainer1,
  red:       T.onError1,
  redBg:     T.errorContainer1,
};

const STEPS = [
  { num: 1, label: "Details",    help: "Name, category, languages, and basic metadata for your template." },
  { num: 2, label: "Scoring",    help: "Define how audits are scored — methodology, display format, and score visibility." },
  { num: 3, label: "Questions",  help: "Build your audit structure by adding sections and questions." },
  { num: 4, label: "Schedule",   help: "Set when audits run, where they happen, and who completes them." },
  { num: 5, label: "Escalation", help: "Define automated actions triggered after an audit is submitted based on its outcome." },
];

function isStep1Complete(data) {
  if (!data) return false;
  return (
    (data.name || "").trim().length > 0 &&
    (data.category || "").length > 0 &&
    Array.isArray(data.languages) && data.languages.length > 0
  );
}

function isStep2Complete(data) {
  if (!data || !data.methodology) return false;
  if (data.methodology === "informational") return true;
  if (!data.displayFormat) return false;
  if (data.methodology === "weighted") {
    // undefined weights means defaults (4×25=100) — treat as balanced
    if (data.sectionWeights !== undefined) {
      const total = Object.values(data.sectionWeights).reduce((s, v) => s + Number(v ?? 0), 0);
      if (Math.round(total) !== 100) return false;
    }
  }
  if (data.displayFormat === "lettergrade") {
    // undefined thresholds means defaults — treat as valid
    if (data.gradeThresholds !== undefined) {
      const t = data.gradeThresholds;
      const A = Number(t.A ?? 90), B = Number(t.B ?? 80), C = Number(t.C ?? 70), D = Number(t.D ?? 60);
      if (!(A > B && B > C && C > D && D >= 0)) return false;
    }
  }
  return true;
}

function isStepComplete(stepNum, formData) {
  if (stepNum === 1) return isStep1Complete(formData[1]);
  if (stepNum === 2) return isStep2Complete(formData[2]);
  if (stepNum === 3) {
    const secs = formData[3]?.sections;
    return Array.isArray(secs) && secs.length > 0 && secs.some(s => s.questions.length > 0);
  }
  if (stepNum === 4) {
    const s4 = formData[4] || {};
    const a = s4.assignees || {};
    return !!s4.scheduleType
      && (s4.locations || []).length > 0
      && ((a.users||[]).length > 0 || (a.roles||[]).length > 0 || (a.groups||[]).length > 0);
  }
  return false;
}

function getStepWarningTip(stepNum, formData) {
  if (stepNum === 1) {
    const d = formData[1] || {};
    const missing = [];
    if (!(d.name || "").trim()) missing.push("template name");
    if (!d.category) missing.push("category");
    if (!Array.isArray(d.languages) || !d.languages.length) missing.push("at least one language");
    return missing.length ? `Missing: ${missing.join(", ")}` : null;
  }
  if (stepNum === 2) {
    const d = formData[2] || {};
    if (!d.methodology) return "Scoring methodology not selected";
    if (d.methodology !== "informational" && !d.displayFormat) return "Display format not selected";
    if (d.methodology === "weighted" && d.sectionWeights) {
      const total = Object.values(d.sectionWeights).reduce((s, v) => s + Number(v ?? 0), 0);
      if (Math.round(total) !== 100) return `Section weights total ${Math.round(total)}% — must equal 100%`;
    }
    if (d.displayFormat === "lettergrade" && d.gradeThresholds) {
      const t = d.gradeThresholds;
      const A = Number(t.A ?? 90), B = Number(t.B ?? 80), Cv = Number(t.C ?? 70), D = Number(t.D ?? 60);
      if (!(A > B && B > Cv && Cv > D && D >= 0)) return "Grade thresholds must be in descending order";
    }
    return null;
  }
  if (stepNum === 3) {
    const secs = formData[3]?.sections || [];
    if (!secs.length) return "No sections added yet";
    if (!secs.some(s => (s.questions || []).length > 0)) return "At least one section needs a question";
    return null;
  }
  if (stepNum === 4) {
    const d = formData[4] || {};
    if (!d.scheduleType) return "Schedule type not selected";
    if (!(d.locations || []).length) return "No locations selected";
    const a = d.assignees || {};
    if (!((a.users||[]).length || (a.roles||[]).length || (a.groups||[]).length)) return "No assignees selected";
    return null;
  }
  return null;
}

function formatRelativeTime(date) {
  if (!date) return null;
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 10) return "Saved just now";
  if (diffSec < 60) return `Saved ${diffSec}s ago`;
  return `Saved ${Math.floor(diffSec / 60)}m ago`;
}

// ── Status tags ───────────────────────────────────────────────────────────────

function StatusTag({ label, color, icon = "dot" }) {
  const icons = {
    check: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>,
    draft: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    pause: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/><circle cx="12" cy="12" r="10"/></svg>,
    lock:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color, fontFamily: F, whiteSpace: "nowrap" }}>
      {icons[icon] ?? icons.check}
      {label}
    </span>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconCheckCircle({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconWarn({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconCloud() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      <polyline points="9 16 11 18 15 14" />
    </svg>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────

function StepHelpTip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: 3 }}>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={e => e.stopPropagation()}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", color: C.g3, lineHeight: 1 }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </button>
      {show && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
          background: C.g6, color: C.white, padding: "7px 11px", borderRadius: 6,
          fontSize: 11, fontFamily: F, lineHeight: "16px", width: 200, zIndex: 9999,
          boxShadow: "0 4px 14px rgba(0,0,0,0.22)", whiteSpace: "normal", pointerEvents: "none",
        }}>
          {text}
        </div>
      )}
    </span>
  );
}

function ProgressStepNode({ stepDef, status, onClick, warningTip }) {
  const [hover, setHover] = useState(false);
  const isCurrent = status === "current";
  const isComplete = status === "complete";
  const isWarning = status === "warning";
  const isFuture = status === "future";

  // Circle styling
  const circleBg = isCurrent ? C.navy
                 : isComplete ? C.navy
                 : isWarning ? "#fef3c7"
                 : C.white;
  const circleBorder = isCurrent ? C.navy
                     : isComplete ? C.navy
                     : isWarning ? "#fcd34d"
                     : (hover ? C.g4 : C.g3);
  const circleColor = isCurrent ? C.white
                    : isComplete ? C.white
                    : isWarning ? C.amber
                    : C.g4;

  const labelColor = isCurrent ? C.navy
                   : isFuture ? C.g4
                   : C.g6;

  return (
    <div style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: "none",
          border: "none",
          padding: "4px 8px",
          fontFamily: F,
          cursor: "pointer",
        }}
      >
        {/* Circle + label row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: circleBg,
            border: `2px solid ${circleBorder}`,
            color: circleColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: F,
            transition: "all 0.15s",
            flexShrink: 0,
          }}>
            {isComplete ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : isWarning ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/><circle cx="12" cy="12" r="9"/></svg>
            ) : (
              stepDef.num
            )}
          </div>
          <span style={{
            fontSize: 12,
            fontWeight: isCurrent ? 700 : 500,
            color: labelColor,
            whiteSpace: "nowrap",
            transition: "color 0.1s",
          }}>
            {stepDef.label}
          </span>
        </div>
      </button>
      {isWarning && warningTip && hover && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#fef3c7",
          border: "1px solid #fcd34d",
          color: "#92400e",
          padding: "7px 11px",
          borderRadius: 7,
          fontSize: 12,
          fontFamily: F,
          lineHeight: "17px",
          whiteSpace: "nowrap",
          zIndex: 9999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          pointerEvents: "none",
        }}>
          ⚠ {warningTip}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ steps, getStatus, onStepClick, getWarningTip }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 0,
      padding: "14px 32px",
      background: C.white,
      borderBottom: `1px solid ${C.g2}`,
      flexShrink: 0,
    }}>
      {steps.map((s, i) => {
        const status = getStatus(s.num);
        const nextStatus = i < steps.length - 1 ? getStatus(steps[i + 1].num) : null;
        const connectorComplete =
          status === "complete" &&
          nextStatus !== "future";
        return (
          <div key={s.num} style={{ display: "flex", alignItems: "center", flex: i === steps.length - 1 ? "0 0 auto" : "1 1 auto", minWidth: 0 }}>
            <ProgressStepNode
              stepDef={s}
              status={status}
              onClick={() => onStepClick(s.num)}
              warningTip={status === "warning" ? getWarningTip(s.num) : null}
            />
            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: connectorComplete ? C.navy : C.g2,
                margin: "0 8px",
                minWidth: 16,
                transition: "background 0.15s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message }) {
  return (
    <div style={{
      position: "fixed",
      bottom: 28,
      left: "50%",
      transform: "translateX(-50%)",
      background: C.g6,
      color: C.white,
      padding: "10px 22px",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 500,
      fontFamily: F,
      zIndex: 9999,
      boxShadow: "0 4px 16px rgba(0,0,0,0.20)",
      pointerEvents: "none",
    }}>
      {message}
    </div>
  );
}

// ── Header Buttons ────────────────────────────────────────────────────────────

function BtnOutline({ onClick, children }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? C.g1 : C.white,
        color: C.g6,
        border: `1px solid ${C.g3}`,
        borderRadius: 8,
        padding: "5px 14px",
        fontSize: 12,
        fontWeight: 500,
        fontFamily: F,
        cursor: "pointer",
        transition: "background 0.1s",
      }}
    >
      {children}
    </button>
  );
}

function BtnNavy({ onClick, children }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? C.navy2 : C.navy,
        color: C.white,
        border: "none",
        borderRadius: 8,
        padding: "5px 14px",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: F,
        cursor: "pointer",
        transition: "background 0.1s",
      }}
    >
      {children}
    </button>
  );
}

function BackBtn({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 8,
        border: `1px solid ${hover ? C.g3 : C.g2}`,
        background: hover ? C.g1 : C.white,
        color: C.g5,
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.1s, border-color 0.1s",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
  );
}

function BtnDiscard({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? C.g1 : C.white,
        color: hover ? C.g5 : C.g4,
        border: `1px solid ${C.g2}`,
        borderRadius: 8,
        padding: "5px 14px",
        fontSize: 12,
        fontWeight: 500,
        fontFamily: F,
        cursor: "pointer",
        transition: "background 0.1s, color 0.1s",
        flexShrink: 0,
      }}
    >
      Discard
    </button>
  );
}

// ── Footer Buttons ────────────────────────────────────────────────────────────

function BtnFooterPrev({ onClick, disabled }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: disabled ? C.g1 : (hover ? C.g1 : C.white),
        color: disabled ? C.g3 : C.g6,
        border: `1px solid ${C.g3}`,
        borderRadius: 8,
        padding: "9px 18px",
        fontSize: 13,
        fontWeight: 500,
        fontFamily: F,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "background 0.1s",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      Previous
    </button>
  );
}

function BtnFooterNext({ onClick, label = "Next" }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? C.navy2 : C.navy,
        color: C.white,
        border: "none",
        borderRadius: 8,
        padding: "9px 22px",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: F,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "background 0.1s",
      }}
    >
      {label}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  );
}

function BtnFooterActivate({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? C.navy2 : C.navy,
        color: C.white,
        border: "none",
        borderRadius: 8,
        padding: "9px 22px",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: F,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "background 0.1s",
      }}
    >
      Activate Template
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </button>
  );
}

// ── Wizard Shell ──────────────────────────────────────────────────────────────

export default function WizardShell({
  routeOrigin = "scratch",
  templateId = null,
  entryPoint = "catalog",
  onBackToPick,
  onExit,
  categories = [],
}) {
  const [step, setStep] = useState(1);
  // Tracks whether the user entered any field value on each step (during this visit to that step)
  const [stepHasInput, setStepHasInput] = useState({});
  // Marks a step as "visited" only after user entered data AND left the step
  const [visitedSteps, setVisitedSteps] = useState({});
  // Amber warning: visited step still has incomplete required fields
  const [stepIncomplete, setStepIncomplete] = useState({});
  const [formData, setFormData] = useState({ 1: {}, 2: {}, 3: {}, 4: {}, 5: {} });

  const [isActive,    setIsActive]    = useState(!!templateId);
  const [isPublished, setIsPublished] = useState(!!templateId);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [savedLabel, setSavedLabel] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [showDiscard, setShowDiscard] = useState(false);
  const [cantActivateModal, setCantActivateModal] = useState(null); // null | { issues }
  const [activateConfirmModal, setActivateConfirmModal] = useState(false);

  // Approval required stub — set to true to demo the approval flow
  const REQUIRE_APPROVAL = false;

  const toastTimer = useRef(null);
  const autoSaveTimer = useRef(null);
  const labelTimer = useRef(null);

  // Auto-save every 30s when dirty
  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      setIsDirty((dirty) => {
        if (dirty) {
          const now = new Date();
          setLastSaved(now);
          return false;
        }
        return dirty;
      });
    }, 30000);
    return () => clearInterval(autoSaveTimer.current);
  }, []);

  // Keep saved-label fresh ("Saved 12s ago" ticks up)
  useEffect(() => {
    if (!lastSaved) return;
    setSavedLabel(formatRelativeTime(lastSaved));
    labelTimer.current = setInterval(
      () => setSavedLabel(formatRelativeTime(lastSaved)),
      5000
    );
    return () => clearInterval(labelTimer.current);
  }, [lastSaved]);

  function doSave() {
    const now = new Date();
    setLastSaved(now);
    setSavedLabel(formatRelativeTime(now));
    setIsDirty(false);
  }

  function showToast(msg) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
  }

  function handleManualSave() {
    doSave();
    showToast("Draft saved");
  }

  function handleSaveAndClose() {
    doSave();
    onExit();
  }

  function handleDiscardClick() {
    setShowDiscard(true);
  }

  function handleActivateClick() {
    const issues = [];
    const s1 = formData[1]; const s2 = formData[2]; const s3 = formData[3]; const s4 = formData[4];
    if (!isStep1Complete(s1)) issues.push({ step: 1, label: "Details", reason: "Template name, category, and at least one language are required." });
    if (!isStep2Complete(s2)) issues.push({ step: 2, label: "Scoring", reason: "Scoring methodology must be selected and fully configured." });
    const secs = s3?.sections;
    if (!Array.isArray(secs) || secs.length === 0 || !secs.some(s => s.questions.length > 0))
      issues.push({ step: 3, label: "Sections & Questions", reason: "At least one section with at least one question is required." });
    const a = s4?.assignees || {};
    if (!s4?.scheduleType) issues.push({ step: 4, label: "Schedule", reason: "Schedule type is required." });
    else if (!(s4.locations || []).length) issues.push({ step: 4, label: "Schedule", reason: "At least one location must be selected." });
    else if (!((a.users||[]).length || (a.roles||[]).length || (a.groups||[]).length)) issues.push({ step: 4, label: "Schedule", reason: "At least one assignee is required." });

    if (issues.length > 0) { setCantActivateModal({ issues }); }
    else { setActivateConfirmModal(true); }
  }

  function handleConfirmActivate() {
    setActivateConfirmModal(false);
    doSave();
    const msg = REQUIRE_APPROVAL ? `${templateName} submitted for approval` : `${templateName} activated`;
    showToast(msg);
    setTimeout(() => onExit(), 1800);
  }

  function handleSaveDraft() {
    doSave();
    showToast("Draft saved");
    setTimeout(() => onExit(), 1500);
  }

  function buildActivationSummary() {
    const s4 = formData[4] || {};
    const s5 = formData[5] || {};
    const schedType = s4.scheduleType === "one_time" ? "one-time" : s4.scheduleType === "recurring" ? "recurring" : s4.scheduleType === "event" ? "event-based" : s4.scheduleType || "scheduled";
    const locCount = (s4.locations || []).length;
    const a = s4.assignees || {};
    const assigneeParts = [];
    if ((a.roles||[]).length) assigneeParts.push(a.roles.join(", "));
    if ((a.users||[]).length) assigneeParts.push(`${a.users.length} specific user${a.users.length !== 1 ? "s" : ""}`);
    if ((a.groups||[]).length) assigneeParts.push(`${a.groups.length} group${a.groups.length !== 1 ? "s" : ""}`);
    const ruleCount = (s5.rules || []).length;
    const programs = (s4.programs || []);
    return { schedType, locCount, assigneeSummary: assigneeParts.join(", ") || "assignees", ruleCount, programs };
  }

  function handleStepDataChange(stepNum, patch) {
    setFormData((prev) => ({ ...prev, [stepNum]: { ...prev[stepNum], ...patch } }));
    setIsDirty(true);
    setStepHasInput((prev) => ({ ...prev, [stepNum]: true }));
  }

  // Navigate between steps; record visited + completeness for the step being left
  function navigateToStep(targetStep) {
    if (stepHasInput[step]) {
      setVisitedSteps((prev) => ({ ...prev, [step]: true }));
      const complete = isStepComplete(step, formData);
      setStepIncomplete((prev) => ({ ...prev, [step]: !complete }));
    }
    setStep(targetStep);
  }

  function getStepStatus(stepNum) {
    if (stepNum === step) return "current";
    if (visitedSteps[stepNum] && stepIncomplete[stepNum]) return "warning";
    if (visitedSteps[stepNum]) return "complete";
    return "future";
  }

  const templateName = (formData[1]?.name || "").trim() || "Untitled template";
  const isEditing = !!templateId;
  const nameIsPlaceholder = templateName === "Untitled template";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: F, background: C.g1 }}>

      {/* ── Header ── */}
      <div style={{
        position: "relative",
        background: C.white,
        borderBottom: `1px solid ${C.g2}`,
        height: 60,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
      }}>


        {/* Center: Audit Template Builder label + template name */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
          <span style={{ fontSize: 20, fontWeight: 300, color: C.g6, fontFamily: F }}>
            Audit Template Builder
          </span>
        </div>

        {/* Far left: back button */}
        <BackBtn onClick={handleDiscardClick} />

        {/* Left: template name */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexShrink: 0, minWidth: 0, maxWidth: 280, marginLeft: 10 }}>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: nameIsPlaceholder ? C.g4 : C.g6,
            fontFamily: F,
            lineHeight: "18px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {templateName}
          </span>
          {isEditing && (
            <span style={{ fontSize: 10, color: C.g4, fontFamily: F, marginTop: 2 }}>v1 → v2</span>
          )}
        </div>

        {/* Right: status tags */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <StatusTag label="Draft" color="#b45309" icon="draft" />
          <span style={{ color: C.g3, fontSize: 11 }}>·</span>
          <StatusTag
            label={isActive ? "Active" : "Inactive"}
            color={isActive ? C.teal : C.g5}
            icon={isActive ? "check" : "pause"}
          />
          <span style={{ color: C.g3, fontSize: 11 }}>·</span>
          <StatusTag
            label={isPublished ? "Published" : "Unpublished"}
            color={isPublished ? C.ocean : C.g5}
            icon={isPublished ? "check" : "lock"}
          />
        </div>
      </div>

      {/* ── Progress bar ── */}
      <ProgressBar
        steps={STEPS}
        getStatus={getStepStatus}
        onStepClick={navigateToStep}
        getWarningTip={(num) => getStepWarningTip(num, formData)}
      />

      {/* ── Step content ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {step === 1 && (
          <Step1Details
            formData={formData[1]}
            onChange={(patch) => handleStepDataChange(1, patch)}
            onNext={() => navigateToStep(2)}
            onBackToPick={onBackToPick}
            categories={categories}
          />
        )}
        {step === 2 && (
          <Step2Scoring
            formData={formData[2]}
            onChange={(patch) => handleStepDataChange(2, patch)}
            onNext={() => navigateToStep(3)}
            onBack={() => navigateToStep(1)}
            hasQuestions={
              (formData[3]?.sections || []).some(s => s.questions?.length > 0)
            }
          />
        )}
        {step === 3 && (
          <Step3Sections
            formData={formData[3]}
            onChange={(patch) => handleStepDataChange(3, patch)}
            methodology={formData[2]?.methodology}
            onNext={() => navigateToStep(4)}
            onBack={() => navigateToStep(2)}
          />
        )}
        {step === 4 && (
          <Step4Schedule
            formData={formData[4]}
            onChange={(patch) => handleStepDataChange(4, patch)}
            onNext={() => navigateToStep(5)}
            onBack={() => navigateToStep(3)}
          />
        )}
        {step === 5 && (
          <Step5Escalation
            formData={formData[5]}
            onChange={(patch) => handleStepDataChange(5, patch)}
            onBack={() => navigateToStep(4)}
            onActivate={handleActivateClick}
            onSaveDraft={handleSaveDraft}
            onNavigateToStep={navigateToStep}
          />
        )}
      </div>

      {/* ── Fixed footer ── */}
      <div style={{
        background: C.white,
        borderTop: `1px solid ${C.g2}`,
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        boxShadow: "0 -1px 4px rgba(0,0,0,0.04)",
      }}>
        {/* Left: save actions + saved label */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BtnDiscard onClick={handleDiscardClick} />
          <BtnOutline onClick={handleManualSave}>Save</BtnOutline>
          <BtnNavy onClick={handleSaveAndClose}>Save &amp; Close</BtnNavy>
          {savedLabel && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 4 }}>
              <IconCloud />
              <span style={{ fontSize: 12, color: C.teal, fontFamily: F, whiteSpace: "nowrap" }}>
                {savedLabel}
              </span>
            </div>
          )}
        </div>

        {/* Right: navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BtnFooterPrev
            onClick={step === 1 ? onBackToPick : () => navigateToStep(step - 1)}
            disabled={false}
          />
          {step < 5 ? (
            <BtnFooterNext
              onClick={() => navigateToStep(step + 1)}
              label={
                step === 1 ? "Next: Scoring"
                : step === 2 ? "Next: Questions"
                : step === 3 ? "Next: Schedule"
                : step === 4 ? "Next: Escalation"
                : "Next"
              }
            />
          ) : (
            <BtnFooterActivate onClick={handleActivateClick} />
          )}
        </div>
      </div>

      {/* ── Discard confirmation modal ── */}
      {showDiscard && (
        <DiscardModal
          onSaveAndExit={() => { doSave(); onExit(); }}
          onExitWithout={onExit}
          onCancel={() => setShowDiscard(false)}
        />
      )}

      {/* ── Can't activate modal ── */}
      {cantActivateModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, fontFamily:F }}
          onClick={e => { if (e.target === e.currentTarget) setCantActivateModal(null); }}>
          <div style={{ background:C.white, borderRadius:14, width:480, maxHeight:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 8px 40px rgba(0,0,0,0.20)" }}>
            <div style={{ padding:"18px 24px 0", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span style={{ fontSize:16, fontWeight:700, color:C.g6, fontFamily:F }}>Can't activate yet</span>
              </div>
              <p style={{ margin:"0 0 14px", fontSize:13, color:C.g5, lineHeight:"19px" }}>Some required fields are missing. Fix these to activate:</p>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"0 24px" }}>
              {cantActivateModal.issues.map((issue, i) => (
                <button key={i}
                  onClick={() => { setCantActivateModal(null); navigateToStep(issue.step); }}
                  style={{ display:"flex", alignItems:"flex-start", gap:10, width:"100%", textAlign:"left", background:"none", border:"none", padding:"10px 0", borderBottom:`1px solid ${C.g1}`, cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.g1}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:C.amberBg, border:`1px solid #fcd34d`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:C.amber, fontFamily:F }}>{issue.step}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:C.g6, fontFamily:F }}>Step {issue.step}: {issue.label}</div>
                    <div style={{ fontSize:12, color:C.g5, fontFamily:F, marginTop:2 }}>{issue.reason}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ padding:"14px 24px", borderTop:`1px solid ${C.g2}`, display:"flex", gap:8, justifyContent:"space-between", alignItems:"center", flexShrink:0, marginTop:12 }}>
              <button onClick={() => setCantActivateModal(null)}
                style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:C.g5, fontFamily:F, fontWeight:500 }}>Cancel</button>
              <button onClick={() => { const first = cantActivateModal.issues[0]; setCantActivateModal(null); navigateToStep(first.step); }}
                style={{ background:C.navy, color:C.white, border:"none", borderRadius:8, padding:"9px 22px", fontSize:13, fontWeight:600, fontFamily:F, cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.navy2}
                onMouseLeave={e => e.currentTarget.style.background = C.navy}>
                Go fix it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Activate confirmation modal ── */}
      {activateConfirmModal && (() => {
        const { schedType, locCount, assigneeSummary, ruleCount, programs } = buildActivationSummary();
        const startDate = formData[4]?.startDate;
        return (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, fontFamily:F }}
            onClick={e => { if (e.target === e.currentTarget) setActivateConfirmModal(false); }}>
            <div style={{ background:C.white, borderRadius:14, width:500, boxShadow:"0 8px 40px rgba(0,0,0,0.20)" }}>
              <div style={{ padding:"20px 24px 0" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 12 11 14 15 10"/><circle cx="12" cy="12" r="10"/></svg>
                  <span style={{ fontSize:16, fontWeight:700, color:C.g6, fontFamily:F }}>
                    {REQUIRE_APPROVAL ? "Submit for approval?" : "Activate this template?"}
                  </span>
                </div>
                <div style={{ fontSize:13, color:C.g5, lineHeight:"21px", marginBottom:14 }}>
                  This template will run on a <strong>{schedType}</strong> schedule
                  {startDate ? <> starting <strong>{startDate}</strong></> : null},
                  applied to <strong>{locCount} location{locCount !== 1 ? "s" : ""}</strong>.
                  Audits will be assigned to <strong>{assigneeSummary}</strong>.
                  {programs.length > 0 && <><br />It will be added to <strong>{programs.length} program{programs.length !== 1 ? "s" : ""}</strong>: {programs.join(", ")}.</>}
                  {ruleCount > 0 && <><br /><strong>{ruleCount} escalation rule{ruleCount !== 1 ? "s" : ""}</strong> configured to fire on audit outcomes.</>}
                </div>
                {REQUIRE_APPROVAL && (
                  <div style={{ background:C.amberBg, border:"1px solid #fcd34d", borderRadius:8, padding:"10px 14px", fontSize:12, color:C.amber, lineHeight:"17px", marginBottom:14 }}>
                    This template will be sent for approval before going live. You'll be notified when it's reviewed.
                  </div>
                )}
              </div>
              <div style={{ padding:"12px 24px 20px", display:"flex", gap:8, justifyContent:"flex-end", borderTop:`1px solid ${C.g2}`, marginTop:4 }}>
                <button onClick={() => setActivateConfirmModal(false)}
                  style={{ background:"none", border:`1px solid ${C.g3}`, borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:500, fontFamily:F, color:C.g5, cursor:"pointer" }}>Cancel</button>
                <button onClick={handleConfirmActivate}
                  style={{ background:C.navy, color:C.white, border:"none", borderRadius:8, padding:"9px 22px", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.navy2}
                  onMouseLeave={e => e.currentTarget.style.background = C.navy}>
                  {REQUIRE_APPROVAL ? "Submit for approval" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Toast notification ── */}
      {toastMsg && <Toast message={toastMsg} />}
    </div>
  );
}
