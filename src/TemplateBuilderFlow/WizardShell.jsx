import { useState, useEffect, useRef } from "react";
import Step1Details from "./Step1Details.jsx";
import Step2Scoring from "./Step2Scoring.jsx";
import Step3Sections from "./Step3Sections.jsx";
import Step4ScheduleStub from "./Step4ScheduleStub.jsx";
import { DiscardModal } from "./modals.jsx";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy: "#001e76", navy2: "#001356",
  ocean: "#2226f7",
  white: "#ffffff",
  g1: "#f4f4f6", g2: "#e2e5e9", g3: "#c3c8d0", g4: "#8692a2", g5: "#555f6d", g6: "#16191d",
  teal: "#0f766e",
  amber: "#b45309",
  red: "#b6143a",
};

const STEPS = [
  { num: 1, label: "Details" },
  { num: 2, label: "Scoring" },
  { num: 3, label: "Questions" },
  { num: 4, label: "Schedule & Assign" },
];

function isStep1Complete(data) {
  if (!data) return false;
  return (
    (data.name || "").trim().length > 0 &&
    (data.category || "").length > 0 &&
    Array.isArray(data.tags) && data.tags.length > 0 &&
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
  return false; // step 4 still stubbed
}

function formatRelativeTime(date) {
  if (!date) return null;
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 10) return "Saved just now";
  if (diffSec < 60) return `Saved ${diffSec}s ago`;
  return `Saved ${Math.floor(diffSec / 60)}m ago`;
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

// ── Nav Step Button ───────────────────────────────────────────────────────────

function NavStep({ stepDef, status, onClick }) {
  const [hover, setHover] = useState(false);
  const isCurrent = status === "current";
  const isComplete = status === "complete";
  const isWarning = status === "warning";

  const textColor = isCurrent
    ? C.navy
    : isComplete || isWarning ? C.g6
    : C.g4;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        background: "none",
        border: "none",
        borderBottom: isCurrent ? `2px solid ${C.navy}` : "2px solid transparent",
        padding: "0 16px",
        height: "100%",
        fontSize: 12,
        fontWeight: isCurrent ? 700 : 500,
        color: hover && !isCurrent ? C.g6 : textColor,
        fontFamily: F,
        cursor: "pointer",
        transition: "color 0.1s",
        whiteSpace: "nowrap",
      }}
    >
      {isComplete && !isCurrent && <IconCheckCircle />}
      {isWarning && !isCurrent && <IconWarn />}
      {stepDef.label}
    </button>
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
        borderRadius: 7,
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
        borderRadius: 7,
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

function BtnDiscard({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "none",
        border: "none",
        color: hover ? "#8b0022" : C.red,
        fontSize: 12,
        fontWeight: 500,
        fontFamily: F,
        cursor: "pointer",
        padding: "5px 8px",
        textDecoration: hover ? "underline" : "none",
        transition: "color 0.1s",
      }}
    >
      Discard
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
}) {
  const [step, setStep] = useState(1);
  // Tracks whether the user entered any field value on each step (during this visit to that step)
  const [stepHasInput, setStepHasInput] = useState({});
  // Marks a step as "visited" only after user entered data AND left the step
  const [visitedSteps, setVisitedSteps] = useState({});
  // Amber warning: visited step still has incomplete required fields
  const [stepIncomplete, setStepIncomplete] = useState({});
  const [formData, setFormData] = useState({ 1: {}, 2: {}, 3: {}, 4: {} });

  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [savedLabel, setSavedLabel] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [showDiscard, setShowDiscard] = useState(false);

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
    if (isDirty) {
      setShowDiscard(true);
    } else {
      onExit();
    }
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: F, background: C.g1 }}>

      {/* ── Header ── */}
      <div style={{
        background: C.white,
        borderBottom: `1px solid ${C.g2}`,
        height: 60,
        flexShrink: 0,
        display: "flex",
        alignItems: "stretch",
        padding: "0 20px",
        position: "relative",
      }}>

        {/* Left: template name + version (when editing existing) */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexShrink: 0, zIndex: 1, minWidth: 140 }}>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: nameIsPlaceholder ? C.g4 : C.g6,
            fontFamily: F,
            lineHeight: "19px",
          }}>
            {templateName}
          </span>
          {isEditing && (
            // TODO: resolve actual version numbers from template service
            <span style={{ fontSize: 10, color: C.g4, fontFamily: F, lineHeight: "15px", marginTop: 1 }}>
              v1 → v2 (draft)
            </span>
          )}
        </div>

        {/* Center: progress nav — absolutely positioned for true centering */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
          pointerEvents: "none",
        }}>
          <div style={{ display: "flex", alignItems: "stretch", pointerEvents: "all" }}>
            {STEPS.map((s) => (
              <NavStep
                key={s.num}
                stepDef={s}
                status={getStepStatus(s.num)}
                onClick={() => navigateToStep(s.num)}
              />
            ))}
          </div>
        </div>

        {/* Right: save controls */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, zIndex: 1 }}>
          {savedLabel && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginRight: 4 }}>
              <IconCloud />
              <span style={{ fontSize: 11, color: C.teal, fontFamily: F, whiteSpace: "nowrap" }}>
                {savedLabel}
              </span>
            </div>
          )}
          <BtnOutline onClick={handleManualSave}>Save</BtnOutline>
          <BtnNavy onClick={handleSaveAndClose}>Save &amp; Close</BtnNavy>
          <BtnDiscard onClick={handleDiscardClick} />
        </div>
      </div>

      {/* ── Step content ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {step === 1 && (
          <Step1Details
            formData={formData[1]}
            onChange={(patch) => handleStepDataChange(1, patch)}
            onNext={() => navigateToStep(2)}
            onBackToPick={onBackToPick}
          />
        )}
        {step === 2 && (
          <Step2Scoring
            formData={formData[2]}
            onChange={(patch) => handleStepDataChange(2, patch)}
            onNext={() => navigateToStep(3)}
            onBack={() => navigateToStep(1)}
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
          <Step4ScheduleStub
            onBack={() => navigateToStep(3)}
          />
        )}
      </div>

      {/* ── Discard confirmation modal ── */}
      {showDiscard && (
        <DiscardModal
          onSaveAndExit={() => { doSave(); onExit(); }}
          onExitWithout={onExit}
          onCancel={() => setShowDiscard(false)}
        />
      )}

      {/* ── Toast notification ── */}
      {toastMsg && <Toast message={toastMsg} />}
    </div>
  );
}
