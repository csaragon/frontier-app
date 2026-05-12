import { useState, useEffect, useRef } from "react";
import Step1Details from "./Step1Details.jsx";
import QuestionList from "./QuestionList.jsx";
import Step3Scoring from "./Step3Scoring.jsx";
import Step4Translations from "./Step4Translations.jsx";
import Step5Schedule from "./Step5Schedule.jsx";
import Step6Escalation from "./Step6Escalation.jsx";
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
  { num: 1, label: "Details",      help: "Name, category, languages, and basic metadata for your template." },
  { num: 2, label: "Questions",    help: "Build your audit structure by adding sections and questions." },
  { num: 3, label: "Scoring", help: "Set scoring methodology and configure per-question scoring and escalation." },
  { num: 4, label: "Translations", help: "Add translations for each language configured on this template." },
  { num: 5, label: "Schedule",     help: "Set when audits run, where they happen, and who completes them." },
  { num: 6, label: "Audit Escalation", help: "Define automated actions triggered after an audit is submitted based on its outcome." },
];

function isStep1Complete(data) {
  if (!data) return false;
  return (
    (data.name || "").trim().length > 0 &&
    (data.category || "").length > 0 &&
    Array.isArray(data.languages) && data.languages.length > 0
  );
}

function isScoringComplete(data) {
  if (!data || !data.methodology) return false;
  return true; // methodology selected is sufficient
}

function isStepComplete(stepNum, formData) {
  if (stepNum === 1) return isStep1Complete(formData[1]);
  if (stepNum === 2) {
    const secs = formData[2]?.sections;
    return Array.isArray(secs) && secs.length > 0 && secs.some(s => (s.questions || []).length > 0);
  }
  if (stepNum === 3) return isScoringComplete(formData[3]);
  if (stepNum === 4) return true; // translations optional
  if (stepNum === 5) {
    const s5 = formData[5] || {};
    const a = s5.assignees || {};
    return !!s5.scheduleType
      && (s5.locations || []).length > 0
      && ((a.users||[]).length > 0 || (a.roles||[]).length > 0 || (a.groups||[]).length > 0);
  }
  if (stepNum === 6) return true; // escalation optional
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
    const secs = formData[2]?.sections || [];
    if (!secs.length) return "No sections added yet";
    if (!secs.some(s => (s.questions || []).length > 0)) return "At least one section needs a question";
    return null;
  }
  if (stepNum === 3) {
    if (!formData[3]?.methodology) return "Scoring methodology not selected";
    return null;
  }
  if (stepNum === 5) {
    const d = formData[5] || {};
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

const STATUS_ICONS = {
  check: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>,
  draft: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  pause: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/><circle cx="12" cy="12" r="10"/></svg>,
  lock:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
};

// Read-only tag (used for Draft)
function StatusTag({ label, color, icon = "dot" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color, fontFamily: F, whiteSpace: "nowrap" }}>
      {STATUS_ICONS[icon] ?? STATUS_ICONS.check}
      {label}
    </span>
  );
}

// Clickable tag — shows a single action in a small dropdown
function ClickableTag({ label, color, icon, action, disabled, disabledTip }) {
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (disabled) {
    return (
      <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
        onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color, fontFamily: F, whiteSpace: "nowrap", opacity: 0.5, cursor: "not-allowed" }}>
          {STATUS_ICONS[icon]}{label}
        </span>
        {tip && disabledTip && (
          <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#fff", fontSize: 11, fontWeight: 500, fontFamily: F, padding: "5px 9px", borderRadius: 6, whiteSpace: "nowrap", pointerEvents: "none", zIndex: 999 }}>
            {disabledTip}
          </div>
        )}
      </span>
    );
  }

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color, fontFamily: F, whiteSpace: "nowrap", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 4 }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}>
        {STATUS_ICONS[icon]}{label}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#fff", border: "1px solid #e2e5ea", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 999, minWidth: 150, overflow: "hidden" }}>
          <button onClick={() => { setOpen(false); action.onClick(); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: F, color: action.danger ? "#dc2626" : "#374151", textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.background = action.danger ? "#fef2f2" : "#f8f9fa"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}>
            {STATUS_ICONS[action.icon]}
            {action.label}
          </button>
        </div>
      )}
    </span>
  );
}

// Reusable confirmation modal for status changes
function StatusConfirmModal({ title, body, confirmLabel, cancelLabel = "Cancel", danger, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, fontFamily: F }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#16191d", marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 13, color: "#64748b", lineHeight: "20px" }}>{body}</div>
        </div>
        <div style={{ padding: "12px 24px 18px", display: "flex", gap: 8, justifyContent: "flex-end", borderTop: "1px solid #e2e5ea" }}>
          <button onClick={onCancel}
            style={{ background: "none", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, fontFamily: F, color: "#64748b", cursor: "pointer" }}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm}
            style={{ background: danger ? "#dc2626" : C.navy, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
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

function ProgressStepNode({ stepDef, status, onClick, warningTip, isFirst, isLast }) {
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
            width: 22,
            height: 22,
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
          ...(isFirst  ? { left: 0 } :
              isLast   ? { right: 0 } :
                         { left: "50%", transform: "translateX(-50%)" }),
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
      padding: "8px 32px",
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
              isFirst={i === 0}
              isLast={i === steps.length - 1}
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
        borderRadius: 7,
        padding: "6px 14px",
        fontSize: 12,
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
        borderRadius: 7,
        padding: "6px 16px",
        fontSize: 12,
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
        borderRadius: 7,
        padding: "6px 16px",
        fontSize: 12,
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

function seedFormData(templateId, templates) {
  const t = templates.find(x => x.id === templateId);
  if (!t) return { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} };
  return {
    1: { name: t.name, category: t.cat, languages: ["en"] },
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
  };
}

export default function WizardShell({
  routeOrigin = "scratch",
  templateId = null,
  entryPoint = "catalog",
  onBackToPick,
  onExit,
  categories = [],
  templates = [],
  extractionPending = false,
  onExtractionDone,
}) {
  const [step, setStep] = useState(1);
  // Tracks whether the user entered any field value on each step (during this visit to that step)
  const [stepHasInput, setStepHasInput] = useState({});
  // Marks a step as "visited" only after user entered data AND left the step
  const [visitedSteps, setVisitedSteps] = useState({});
  // Amber warning: visited step still has incomplete required fields
  const [stepIncomplete, setStepIncomplete] = useState({});
  const [formData, setFormData] = useState(() => seedFormData(templateId, templates));

  const tpl = templates.find(x => x.id === templateId);
  const initStatus = tpl
    ? (tpl.state === "deactivated" ? "inactive" : tpl.state === "draft" ? "draft" : "active")
    : "draft";
  const [templateStatus, setTemplateStatus] = useState(initStatus); // "draft" | "active" | "inactive"
  const [isPublished,    setIsPublished]    = useState(!!templateId);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [savedLabel, setSavedLabel] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [showDiscard, setShowDiscard] = useState(false);
  const [cantActivateModal, setCantActivateModal] = useState(null); // null | { issues }
  const [activateConfirmModal, setActivateConfirmModal] = useState(false);
  const [showActivatePreview, setShowActivatePreview] = useState(false);
  const [statusModal, setStatusModal] = useState(null); // null | "deactivate" | "reactivate" | "unpublish" | "publish"
  const [showUnconfirmedWarning, setShowUnconfirmedWarning] = useState(false);

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

  // When extraction finishes, navigate to Questions and show a toast
  const prevExtractionPendingRef = useRef(extractionPending);
  useEffect(() => {
    if (prevExtractionPendingRef.current && !extractionPending) {
      showToast("Questions extracted — review them here");
      navigateToStep(2);
    }
    prevExtractionPendingRef.current = extractionPending;
  // navigateToStep and showToast are defined below — safe to reference via closure
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractionPending]);

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
    // Show preview first, then validate + confirm on proceed
    setShowActivatePreview(true);
  }

  function handleActivateAfterPreview() {
    setShowActivatePreview(false);
    const issues = [];
    const s1 = formData[1]; const s2 = formData[2]; const s3 = formData[3]; const s5 = formData[5];
    if (!isStep1Complete(s1)) issues.push({ step: 1, label: "Details", reason: "Template name, category, and at least one language are required." });
    const secs = s2?.sections;
    if (!Array.isArray(secs) || secs.length === 0 || !secs.some(s => (s.questions || []).length > 0))
      issues.push({ step: 2, label: "Questions", reason: "At least one section with at least one question is required." });
    if (!isScoringComplete(s3)) issues.push({ step: 3, label: "Scoring", reason: "Scoring methodology must be selected." });
    const a = s5?.assignees || {};
    if (!s5?.scheduleType) issues.push({ step: 5, label: "Schedule", reason: "Schedule type is required." });
    else if (!(s5.locations || []).length) issues.push({ step: 5, label: "Schedule", reason: "At least one location must be selected." });
    else if (!((a.users||[]).length || (a.roles||[]).length || (a.groups||[]).length)) issues.push({ step: 5, label: "Schedule", reason: "At least one assignee is required." });

    if (issues.length > 0) { setCantActivateModal({ issues }); }
    else { setActivateConfirmModal(true); }
  }

  function handleConfirmActivate(andPublish = false) {
    setActivateConfirmModal(false);
    setTemplateStatus("active");
    if (andPublish) setIsPublished(true);
    doSave();
    const msg = REQUIRE_APPROVAL
      ? `${templateName} submitted for approval`
      : andPublish ? `${templateName} activated & published` : `${templateName} activated`;
    showToast(msg);
    setTimeout(() => onExit(), 1800);
  }

  function handleStatusModalConfirm() {
    const action = statusModal;
    setStatusModal(null);
    if (action === "deactivate") {
      setTemplateStatus("inactive");
      doSave();
      showToast(`${templateName} deactivated`);
    } else if (action === "reactivate") {
      setTemplateStatus("active");
      doSave();
      showToast(`${templateName} reactivated`);
    } else if (action === "unpublish") {
      setIsPublished(false);
      doSave();
      showToast(`${templateName} unpublished`);
    } else if (action === "publish") {
      setIsPublished(true);
      doSave();
      showToast(`${templateName} published`);
    }
  }

  function handleSaveDraft() {
    doSave();
    showToast("Draft saved");
    setTimeout(() => onExit(), 1500);
  }

  function buildActivationSummary() {
    const s5 = formData[5] || {};
    const s6 = formData[6] || {};
    const schedType = s5.scheduleType === "one_time" ? "one-time" : s5.scheduleType === "recurring" ? "recurring" : s5.scheduleType === "event" ? "event-based" : s5.scheduleType || "scheduled";
    const locCount = (s5.locations || []).length;
    const a = s5.assignees || {};
    const assigneeParts = [];
    if ((a.roles||[]).length) assigneeParts.push(a.roles.join(", "));
    if ((a.users||[]).length) assigneeParts.push(`${a.users.length} specific user${a.users.length !== 1 ? "s" : ""}`);
    if ((a.groups||[]).length) assigneeParts.push(`${a.groups.length} group${a.groups.length !== 1 ? "s" : ""}`);
    const ruleCount = (s6.rules || []).length;
    const programs = (s5.programs || []);
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
        height: 46,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
      }}>

        {/* Center: Audit Template Builder label + template name */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: C.g5, fontFamily: F, letterSpacing: "-0.1px" }}>
            Audit Builder
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
          {templateStatus === "draft" && (
            <>
              <StatusTag label="Draft" color="#b45309" icon="draft" />
              <span style={{ color: C.g3, fontSize: 11 }}>·</span>
            </>
          )}
          {templateStatus === "active" && (
            <>
              <ClickableTag
                label="Active" color={C.teal} icon="check"
                action={{ label: "Deactivate", icon: "pause", onClick: () => setStatusModal("deactivate"), danger: false }}
              />
              <span style={{ color: C.g3, fontSize: 11 }}>·</span>
            </>
          )}
          {templateStatus === "inactive" && (
            <>
              <ClickableTag
                label="Inactive" color={C.g5} icon="pause"
                action={{ label: "Reactivate", icon: "check", onClick: () => setStatusModal("reactivate") }}
              />
              <span style={{ color: C.g3, fontSize: 11 }}>·</span>
            </>
          )}
          {isPublished ? (
            <ClickableTag
              label="Published" color={C.ocean} icon="check"
              action={{ label: "Unpublish", icon: "lock", onClick: () => setStatusModal("unpublish"), danger: true }}
            />
          ) : (
            <ClickableTag
              label="Unpublished" color={C.g5} icon="lock"
              action={{ label: "Publish", icon: "check", onClick: () => setStatusModal("publish") }}
              disabled={templateStatus !== "active"}
              disabledTip="Activate template first"
            />
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <ProgressBar
        steps={STEPS}
        getStatus={getStepStatus}
        onStepClick={navigateToStep}
        getWarningTip={(num) => getStepWarningTip(num, formData)}
      />

      {/* ── Extraction in progress banner ── */}
      {extractionPending && (
        <div style={{
          background: "#eef1ff",
          borderBottom: `1px solid #c7cff7`,
          padding: "9px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
          fontFamily: F,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, animation: "spin 1.2s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>
            Extracting questions from your file…
          </span>
          <span style={{ fontSize: 12, color: C.g5 }}>
            Fill in the details below while we work. You'll be taken to the Questions step automatically when it's ready.
          </span>
        </div>
      )}

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
          <QuestionList
            formData={formData[2]}
            onChange={(patch) => handleStepDataChange(2, patch)}
            methodology={formData[3]?.methodology}
            onNext={() => navigateToStep(3)}
            onBack={() => navigateToStep(1)}
          />
        )}
        {step === 3 && (
          <Step3Scoring
            formData={formData[3]}
            onChange={(patch) => handleStepDataChange(3, patch)}
            questionsData={formData[2]}
            onQuestionsChange={(patch) => handleStepDataChange(2, patch)}
          />
        )}
        {step === 4 && (
          <Step4Translations
            formData={formData[4]}
            onChange={(patch) => handleStepDataChange(4, patch)}
            languages={formData[1]?.languages}
            sections={formData[2]?.sections}
          />
        )}
        {step === 5 && (
          <Step5Schedule
            formData={formData[5]}
            onChange={(patch) => handleStepDataChange(5, patch)}
            onNext={() => navigateToStep(6)}
            onBack={() => navigateToStep(4)}
          />
        )}
        {step === 6 && (
          <Step6Escalation
            formData={formData[6]}
            onChange={(patch) => handleStepDataChange(6, patch)}
          />
        )}
      </div>

      {/* ── Fixed footer ── */}
      <div style={{
        background: C.white,
        borderTop: `1px solid ${C.g2}`,
        padding: "8px 16px",
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
          {step < 6 ? (
            <BtnFooterNext
              onClick={() => {
                if (step === 4 && formData[4]?.hasUnconfirmed) {
                  setShowUnconfirmedWarning(true);
                } else {
                  navigateToStep(step + 1);
                }
              }}
              label={
                step === 1 ? "Next: Questions"
                : step === 2 ? "Next: Scoring"
                : step === 3 ? "Next: Translations"
                : step === 4 ? "Next: Schedule"
                : step === 5 ? "Next: Escalation"
                : "Next"
              }
            />
          ) : (
            <BtnFooterActivate onClick={handleActivateClick} />
          )}
        </div>
      </div>

      {/* ── Activate preview modal ── */}
      {showActivatePreview && (() => {
        const secs = formData[2]?.sections ?? [];
        const totalQs = secs.reduce((n, s) => n + (s.questions || []).length, 0);
        return (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, fontFamily:F }}
            onClick={e => { if (e.target === e.currentTarget) setShowActivatePreview(false); }}>
            <div style={{ background:C.white, borderRadius:14, width:560, maxHeight:"82vh", display:"flex", flexDirection:"column", boxShadow:"0 8px 40px rgba(0,0,0,0.20)" }}>
              <div style={{ padding:"18px 24px 14px", borderBottom:`1px solid ${C.g2}`, flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:C.navy, textTransform:"uppercase", letterSpacing:"0.07em" }}>Template Preview</span>
                  <button onClick={() => setShowActivatePreview(false)} style={{ background:"none", border:"none", cursor:"pointer", color:C.g4, padding:4, display:"flex" }}
                    onMouseEnter={e => e.currentTarget.style.color = C.g6} onMouseLeave={e => e.currentTarget.style.color = C.g4}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div style={{ fontSize:16, fontWeight:700, color:C.g6 }}>{templateName}</div>
                <div style={{ fontSize:12, color:C.g4, marginTop:4 }}>
                  {secs.length} section{secs.length !== 1 ? "s" : ""} · {totalQs} question{totalQs !== 1 ? "s" : ""}
                </div>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"14px 24px" }}>
                {secs.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"40px 0", color:C.g4 }}>No questions added yet.</div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {secs.map((sec, si) => (
                      <div key={sec.id} style={{ border:`1px solid ${C.g2}`, borderRadius:8, overflow:"hidden" }}>
                        <div style={{ padding:"9px 14px", background:C.g1, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <span style={{ fontSize:13, fontWeight:600, color:C.g6 }}>{sec.name || `Section ${si + 1}`}</span>
                          <span style={{ fontSize:12, color:C.g4 }}>{(sec.questions||[]).length} questions</span>
                        </div>
                        <div style={{ padding:"4px 0" }}>
                          {(sec.questions||[]).map((q, qi) => (
                            <div key={q.id} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"7px 14px", borderTop: qi > 0 ? `1px solid ${C.g1}` : "none" }}>
                              <span style={{ fontSize:11, color:C.g4, fontWeight:600, flexShrink:0, minWidth:16 }}>{qi+1}</span>
                              <span style={{ fontSize:12, color:C.g6, lineHeight:"17px", flex:1 }}>{q.title}</span>
                              <span style={{ fontSize:10, fontWeight:600, color:"#2b4b94", background:"#d9e5f5", borderRadius:4, padding:"2px 6px", whiteSpace:"nowrap", flexShrink:0 }}>{q.answerType}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ padding:"14px 24px", borderTop:`1px solid ${C.g2}`, display:"flex", gap:10, alignItems:"center", flexShrink:0 }}>
                <button onClick={handleActivateAfterPreview}
                  style={{ background:C.navy, color:C.white, border:"none", borderRadius:8, padding:"9px 22px", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.navy2}
                  onMouseLeave={e => e.currentTarget.style.background = C.navy}>
                  Continue to activate
                </button>
                <button onClick={() => setShowActivatePreview(false)}
                  style={{ background:"none", border:`1px solid ${C.g3}`, borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:500, fontFamily:F, color:C.g5, cursor:"pointer" }}>
                  Keep editing
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
        const startDate = formData[5]?.startDate;
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
              <div style={{ padding:"12px 24px 20px", display:"flex", gap:8, justifyContent:"space-between", alignItems:"center", borderTop:`1px solid ${C.g2}`, marginTop:4 }}>
                <button onClick={() => setActivateConfirmModal(false)}
                  style={{ background:"none", border:`1px solid ${C.g3}`, borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:500, fontFamily:F, color:C.g5, cursor:"pointer" }}>
                  Cancel
                </button>
                {!REQUIRE_APPROVAL && (
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => handleConfirmActivate(false)}
                      style={{ background:"none", border:`1px solid ${C.navy}`, borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:600, fontFamily:F, color:C.navy, cursor:"pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#eef1ff"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      Activate only
                    </button>
                    <button onClick={() => handleConfirmActivate(true)}
                      style={{ background:C.navy, color:C.white, border:"none", borderRadius:8, padding:"9px 22px", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = C.navy2}
                      onMouseLeave={e => e.currentTarget.style.background = C.navy}>
                      Activate &amp; Publish
                    </button>
                  </div>
                )}
                {REQUIRE_APPROVAL && (
                  <button onClick={() => handleConfirmActivate(false)}
                    style={{ background:C.navy, color:C.white, border:"none", borderRadius:8, padding:"9px 22px", fontSize:13, fontWeight:700, fontFamily:F, cursor:"pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.navy2}
                    onMouseLeave={e => e.currentTarget.style.background = C.navy}>
                    Submit for approval
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Status change modals ── */}
      {statusModal === "deactivate" && (
        <StatusConfirmModal
          title="Deactivate this template?"
          body="Audits already in progress won't be affected, but no new audits can be created from this template until it's reactivated."
          confirmLabel="Deactivate"
          onConfirm={handleStatusModalConfirm}
          onCancel={() => setStatusModal(null)}
        />
      )}
      {statusModal === "reactivate" && (
        <StatusConfirmModal
          title="Reactivate this template?"
          body="This template will become available again and new audits can be created from it."
          confirmLabel="Reactivate"
          onConfirm={handleStatusModalConfirm}
          onCancel={() => setStatusModal(null)}
        />
      )}
      {statusModal === "unpublish" && (
        <StatusConfirmModal
          title="Unpublish this template?"
          body="This template will be removed from the marketplace catalog. It will remain in your template library and can be republished at any time."
          confirmLabel="Unpublish"
          danger
          onConfirm={handleStatusModalConfirm}
          onCancel={() => setStatusModal(null)}
        />
      )}
      {statusModal === "publish" && (
        <StatusConfirmModal
          title="Publish this template?"
          body="This template will be added to the marketplace catalog and visible to other users in your organization."
          confirmLabel="Publish"
          onConfirm={handleStatusModalConfirm}
          onCancel={() => setStatusModal(null)}
        />
      )}

      {/* ── Unconfirmed translations warning ── */}
      {showUnconfirmedWarning && (
        <StatusConfirmModal
          title="Some translations are unconfirmed"
          body="You have translations that haven't been confirmed yet. You can still proceed — just come back to review them before activating."
          confirmLabel="Proceed anyway"
          cancelLabel="Review now"
          onConfirm={() => { setShowUnconfirmedWarning(false); navigateToStep(step + 1); }}
          onCancel={() => setShowUnconfirmedWarning(false)}
        />
      )}

      {/* ── Toast notification ── */}
      {toastMsg && <Toast message={toastMsg} />}
    </div>
  );
}
