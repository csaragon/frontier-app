import { useState, useEffect, useRef } from "react";
import Step1Details from "./Step1Details.jsx";
import Step2Scoring from "./Step2Scoring.jsx";
import Step3Sections from "./Step3Sections.jsx";
import Step4Schedule from "./Step4Schedule.jsx";
import Step5Escalation from "./Step5Escalation.jsx";
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
  { num: 4, label: "Schedule" },
  { num: 5, label: "Escalation" },
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
  if (stepNum === 4) {
    const s4 = formData[4] || {};
    const a = s4.assignees || {};
    return !!s4.scheduleType
      && (s4.locations || []).length > 0
      && ((a.users||[]).length > 0 || (a.roles||[]).length > 0 || (a.groups||[]).length > 0);
  }
  return false;
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
  const [formData, setFormData] = useState({ 1: {}, 2: {}, 3: {}, 4: {}, 5: {} });

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
    if (isDirty) {
      setShowDiscard(true);
    } else {
      onExit();
    }
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
