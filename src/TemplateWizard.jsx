// Implements: TLP-8 (shell, step indicator, draft state, back-navigation), TLP-19 (Seymour overlay), TLP-80/81 (Translate tab)
import { useReducer, useState, useRef, useMemo, useEffect } from "react";
import AppSidebar from "./AppSidebar.jsx";
import { useFocusTrap } from "./TemplateWizard/a11yUtils.js";
import Step1Basics from "./TemplateWizard/Step1Basics.jsx";
import SeymourUpload from "./TemplateWizard/SeymourUpload.jsx";
import TranslateTab from "./TemplateWizard/TranslateTab.jsx";
import Step2Structure from "./TemplateWizard/Step2Structure.jsx";
import Step3Scoring from "./TemplateWizard/Step3Scoring.jsx";
import Step4Logic from "./TemplateWizard/Step4Logic.jsx";
import Step5Activation from "./TemplateWizard/Step5Activation.jsx";

import { T, F } from "./aegis-tokens.js";

const C = {
  primary:      T.actionContainer1,
  primaryHover: T.actionContainer2,
  primaryBg:    T.actionContainer3,
  primaryLight: T.actionContainer3,
  navy:         T.action1,
  navyDeep:     T.onSurface2,
  textSec:      T.onSurface1,
  textMuted:    T.disabled1,
  bgApp:        T.surface2,
  bgSurface:    T.surface1,
  borderSubtle: T.border1,
  borderDef:    T.border2,
  success:      T.success1,
  successBg:    T.successContainer1,
  warning:      T.warning1,
  warningBg:    T.warningContainer1,
};

const FOCUS_RING = "0 0 0 2px #fff, 0 0 0 4px #2226f7";

const STEPS = [
  { n: 1, label: "Basics" },
  { n: 2, label: "Structure" },
  { n: 3, label: "Scoring" },
  { n: 4, label: "Conditional Logic" },
  { n: 5, label: "Activation" },
];

const NEXT_PROMPT = {
  2: "Prompt 2",
  3: "Prompt 3",
  4: "Prompt 4",
  5: "Prompt 5",
};

// ── Reducer ───────────────────────────────────────────────────────────────────

function init(templateId) {
  return {
    id:           templateId || null,
    name:         "Untitled template",
    status:       "draft",
    currentStep:  1,
    furthestStep: 1,
    fields: {
      basics:        { name: "", auditType: null, module: "", description: "", frequency: "" },
      structure:     { sections: [] },
      scoring:       { model: "weighted", perQuestion: {}, perSection: {} },
      logic:         { rules: [] },
      translations:  {},
      seymourOrigin: null,
    },
    savedSnapshot: null,
  };
}

// Helper: immutably update fields.structure.sections
function withSections(state, fn) {
  const sections = fn([...(state.fields.structure?.sections || [])]);
  return { ...state, fields: { ...state.fields, structure: { ...state.fields.structure, sections } } };
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.value };
    case "SET_STATUS":
      return { ...state, status: action.value };
    case "GO_STEP": {
      const n = action.step;
      if (n < 1 || n > 5) return state;
      if (n > state.furthestStep + 1) return state; // can't skip ahead
      const furthest = Math.max(state.furthestStep, n);
      return { ...state, currentStep: n, furthestStep: furthest };
    }
    case "NEXT": {
      const next = Math.min(state.currentStep + 1, 5);
      return { ...state, currentStep: next, furthestStep: Math.max(state.furthestStep, next) };
    }
    case "BACK": {
      const prev = Math.max(state.currentStep - 1, 1);
      return { ...state, currentStep: prev };
    }
    case "SAVE_DRAFT":
      return { ...state, savedSnapshot: JSON.stringify({ name: state.name, fields: state.fields }) };

    case "SET_BASICS_FIELD":
      return { ...state, fields: { ...state.fields, basics: { ...state.fields.basics, [action.field]: action.value } } };

    case "STRUCTURE_ADD_SECTION":
      return withSections(state, sects => {
        const at = action.at ?? sects.length;
        const next = [...sects];
        next.splice(at, 0, action.section);
        return next;
      });

    case "STRUCTURE_REMOVE_SECTION":
      return withSections(state, sects => sects.filter((_, i) => i !== action.idx));

    case "STRUCTURE_UPDATE_SECTION":
      return withSections(state, sects => sects.map((s, i) => i === action.idx ? { ...s, ...action.updates } : s));

    case "STRUCTURE_REORDER_SECTIONS":
      return withSections(state, sects => {
        const next = [...sects];
        const [moved] = next.splice(action.fromIdx, 1);
        next.splice(action.toIdx, 0, moved);
        return next;
      });

    case "STRUCTURE_ADD_QUESTION":
      return withSections(state, sects => sects.map((s, i) => {
        if (i !== action.sectionIdx) return s;
        const qs = [...s.questions];
        const at = action.at ?? qs.length;
        qs.splice(at, 0, action.question);
        return { ...s, questions: qs };
      }));

    case "STRUCTURE_REMOVE_QUESTION":
      return withSections(state, sects => sects.map((s, i) => {
        if (i !== action.sectionIdx) return s;
        return { ...s, questions: s.questions.filter((_, qi) => qi !== action.questionIdx) };
      }));

    case "SET_SCORING_MODEL":
      // Clear per-question config when model changes so defaults regenerate cleanly
      return { ...state, fields: { ...state.fields, scoring: { model: action.model, perQuestion: {}, perSection: {} } } };

    case "SET_QUESTION_SCORING":
      return { ...state, fields: { ...state.fields, scoring: { ...state.fields.scoring, perQuestion: { ...state.fields.scoring.perQuestion, [action.id]: action.updates } } } };

    case "SET_SECTION_SCORING":
      return { ...state, fields: { ...state.fields, scoring: { ...state.fields.scoring, perSection: { ...state.fields.scoring.perSection, [action.id]: { ...(state.fields.scoring.perSection[action.id] || {}), ...action.updates } } } } };

    case "ADD_LOGIC_RULE":
      return { ...state, fields: { ...state.fields, logic: { rules: [...state.fields.logic.rules, action.rule] } } };

    case "UPDATE_LOGIC_RULE":
      return { ...state, fields: { ...state.fields, logic: { rules: state.fields.logic.rules.map(r => r.id === action.id ? { ...r, ...action.updates } : r) } } };

    case "DELETE_LOGIC_RULE":
      return { ...state, fields: { ...state.fields, logic: { rules: state.fields.logic.rules.filter(r => r.id !== action.id) } } };

    case "STRUCTURE_UPDATE_QUESTION":
      return withSections(state, sects =>
        sects.map(s => ({
          ...s,
          questions: s.questions.map(q => q.id === action.id ? { ...q, ...action.updates } : q),
        }))
      );

    case "STRUCTURE_MOVE_QUESTION_TO_SECTION": {
      let movedQ = null;
      const withRemoved = withSections(state, sects =>
        sects.map(s => {
          const idx = s.questions.findIndex(q => q.id === action.questionId);
          if (idx === -1) return s;
          movedQ = s.questions[idx];
          return { ...s, questions: s.questions.filter((_, i) => i !== idx) };
        })
      );
      if (!movedQ) return state;
      return withSections(withRemoved, sects =>
        sects.map(s => s.id === action.targetSectionId ? { ...s, questions: [...s.questions, movedQ] } : s)
      );
    }

    case "SET_TRANSLATION": {
      const { locale: tLocale, stringId, value: tVal } = action;
      return {
        ...state,
        fields: {
          ...state.fields,
          translations: {
            ...state.fields.translations,
            [tLocale]: {
              ...(state.fields.translations?.[tLocale] || {}),
              [stringId]: tVal,
            },
          },
        },
      };
    }

    case "BULK_SET_TRANSLATIONS": {
      const { locale: bLocale, updates } = action;
      return {
        ...state,
        fields: {
          ...state.fields,
          translations: {
            ...state.fields.translations,
            [bLocale]: {
              ...(state.fields.translations?.[bLocale] || {}),
              ...updates,
            },
          },
        },
      };
    }

    case "STRUCTURE_DELETE_QUESTIONS":
      return withSections(state, sects =>
        sects.map(s => ({ ...s, questions: s.questions.filter(q => !action.ids.has(q.id)) }))
      );

    case "APPLY_SEYMOUR": {
      // action.result = { templateName, sections, rules, mappings, flaggedCount }
      const { templateName, sections: smSections, rules: smRules, mappings } = action.result;
      return {
        ...state,
        name: templateName,
        currentStep: 2,
        furthestStep: Math.max(state.furthestStep, 2),
        fields: {
          ...state.fields,
          basics:       { ...state.fields.basics, name: templateName },
          structure:    { sections: smSections },
          logic:        { rules: smRules },
          seymourOrigin: { mappings, flaggedCount: action.result.flaggedCount, templateName },
        },
      };
    }

    case "STRUCTURE_REORDER_QUESTION": {
      const { fromSectionIdx: fsi, fromQIdx: fqi, toSectionIdx: tsi, toQIdx: tqi } = action;
      return withSections(state, sects => {
        const next = sects.map(s => ({ ...s, questions: [...s.questions] }));
        const [moved] = next[fsi].questions.splice(fqi, 1);
        const adjustedTo = fsi === tsi && tqi > fqi ? tqi - 1 : tqi;
        next[tsi].questions.splice(adjustedTo, 0, moved);
        return next;
      });
    }

    default:
      return state;
  }
}

function hasUnsavedChanges(state) {
  const current = JSON.stringify({ name: state.name, fields: state.fields });
  // If never saved, any name change from default counts
  if (state.savedSnapshot === null) {
    return state.name !== "Untitled template" || Object.keys(state.fields).length > 0;
  }
  return current !== state.savedSnapshot;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const opts = ["draft", "active", "deactivated", "archived"];
  const styles = {
    draft:       { color: C.warning,   bg: C.warningBg },
    active:      { color: C.success,   bg: C.successBg },
    deactivated: { color: C.textMuted, bg: C.bgApp      },
    archived:    { color: C.textMuted, bg: C.bgApp      },
  };
  const s = styles[status] || styles.draft;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Template status: ${status}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 9px", borderRadius: 999,
          border: `1px solid ${s.color}20`,
          background: s.bg, color: s.color,
          fontSize: 12, fontWeight: 600, fontFamily: F,
          cursor: "pointer",
        }}
        onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
        onBlur={e => (e.currentTarget.style.boxShadow = "none")}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Select status"
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 600,
            background: C.bgSurface, border: `1px solid ${C.borderSubtle}`,
            borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            minWidth: 120, overflow: "hidden",
          }}
        >
          {opts.map(o => {
            const os = styles[o];
            return (
              <button
                key={o}
                role="option"
                aria-selected={o === status}
                onClick={() => { onChange(o); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  width: "100%", padding: "8px 12px", border: "none",
                  background: o === status ? C.primaryBg : "transparent",
                  color: C.navyDeep, fontSize: 12, fontFamily: F,
                  cursor: "pointer", textAlign: "left",
                }}
                onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                onMouseEnter={e => { if (o !== status) e.currentTarget.style.background = C.bgApp; }}
                onMouseLeave={e => { if (o !== status) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: os.color }} />
                {o.charAt(0).toUpperCase() + o.slice(1)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepRail({ currentStep, furthestStep, onGoStep }) {
  return (
    <nav
      aria-label="Wizard steps"
      style={{
        background: C.bgSurface,
        borderBottom: `1px solid ${C.borderSubtle}`,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        gap: 0,
        flexShrink: 0,
        height: 52,
        overflowX: "auto",
      }}
    >
      {STEPS.map((step, idx) => {
        const isActive    = step.n === currentStep;
        const isComplete  = step.n < currentStep;
        const isReachable = step.n <= furthestStep;
        const isClickable = isReachable || step.n === furthestStep + 1;
        // Can only jump back (or to furthestStep if not yet visited)
        const canClick    = step.n <= furthestStep;

        const circleColor    = isComplete ? C.success : isActive ? C.primary : C.textMuted;
        const circleBg       = isComplete ? C.successBg : isActive ? C.primaryBg : C.bgApp;
        const circleBorder   = isComplete ? C.success : isActive ? C.primary : C.borderDef;
        const labelColor     = isActive ? C.primary : isComplete ? C.navyDeep : C.textMuted;
        const labelWeight    = isActive ? 600 : isComplete ? 500 : 400;

        return (
          <div key={step.n} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <button
              onClick={() => canClick && onGoStep(step.n)}
              disabled={!canClick}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Step ${step.n}: ${step.label}${isComplete ? ", completed" : isActive ? ", current" : ""}`}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 10px", border: "none",
                background: "transparent",
                cursor: canClick ? "pointer" : "default",
                borderRadius: 6,
                outline: "none",
              }}
              onFocus={e => { if (canClick) e.currentTarget.style.boxShadow = FOCUS_RING; }}
              onBlur={e => (e.currentTarget.style.boxShadow = "none")}
            >
              {/* Circle */}
              <span style={{
                width: 24, height: 24, borderRadius: "50%",
                border: `2px solid ${circleBorder}`,
                background: circleBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s",
              }}>
                {isComplete ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: F, color: circleColor, lineHeight: 1 }}>
                    {step.n}
                  </span>
                )}
              </span>
              {/* Label */}
              <span style={{ fontSize: 12, fontWeight: labelWeight, fontFamily: F, color: labelColor, whiteSpace: "nowrap" }}>
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div style={{
                width: 24, height: 2,
                background: step.n < currentStep ? C.success : C.borderSubtle,
                flexShrink: 0,
                transition: "background 0.15s",
              }} />
            )}
          </div>
        );
      })}
    </nav>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  useFocusTrap(dialogRef, onCancel);
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 900,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
      }}
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        style={{
          background: C.bgSurface, borderRadius: 12, padding: 24,
          width: 400, boxShadow: "0 16px 48px rgba(0,0,0,0.22)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div id="confirm-dialog-title" style={{ fontSize: 16, fontWeight: 700, color: C.navyDeep, fontFamily: F, marginBottom: 8 }}>
          Unsaved changes
        </div>
        <div style={{ fontSize: 13, color: C.textSec, fontFamily: F, marginBottom: 20, lineHeight: "19px" }}>
          {message}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.borderDef}`,
              background: C.bgSurface, color: C.textSec,
              fontSize: 12, fontFamily: F, cursor: "pointer", fontWeight: 500, outline: "none",
            }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          >
            Keep editing
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "7px 14px", borderRadius: 8, border: "none",
              background: C.primary, color: "#fff",
              fontSize: 12, fontFamily: F, cursor: "pointer", fontWeight: 600, outline: "none",
            }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          >
            Discard and leave
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TemplateWizard({ templateId, onBack, onPublish, seymourMode = false }) {
  const [state, dispatch] = useReducer(reducer, templateId, init);
  const [nameEditing, setNameEditing] = useState(false);
  const [confirmExit, setConfirmExit] = useState(null);
  const [toast, setToast] = useState(null);
  const [step3GridMode, setStep3GridMode] = useState(false);
  const [showSeymour, setShowSeymour]   = useState(seymourMode);
  const [reviewOrigin, setReviewOrigin] = useState(null);
  const [activeTab, setActiveTab]       = useState("build");

  const step1Complete = !!(state.fields.basics.name?.trim() && state.fields.basics.auditType && state.fields.basics.module);
  const step1Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);
  const h1Ref    = useRef(null);
  const [stepAnnounce, setStepAnnounce] = useState("");

  // Focus H1 and announce step on step change
  useEffect(() => {
    if (activeTab !== "build") return;
    const step = STEPS.find(s => s.n === state.currentStep);
    if (!step) return;
    setStepAnnounce(`Step ${step.n} of 5: ${step.label}`);
    // Defer to let render complete
    const t = setTimeout(() => h1Ref.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [state.currentStep, activeTab]);

  const conditionalIds = useMemo(() => {
    const ids = new Set();
    state.fields.logic.rules.forEach(r => r.showIds.forEach(id => ids.add(id)));
    return ids;
  }, [state.fields.logic.rules]);

  const dirty = hasUnsavedChanges(state);

  const attemptLeave = (reason) => {
    if (dirty) {
      setConfirmExit(reason);
    } else {
      onBack();
    }
  };

  const handleSeymourApply = (result) => {
    dispatch({ type: "APPLY_SEYMOUR", result });
    setShowSeymour(false);
  };

  const handleSaveDraft = () => { dispatch({ type: "SAVE_DRAFT" }); };

  const handlePublish = () => {
    dispatch({ type: "SET_STATUS", value: "active" });
    dispatch({ type: "SAVE_DRAFT" });
    setToast("Template published");
    if (onPublish) {
      onPublish({
        id:       state.id || ("W-" + Date.now()),
        name:     state.name,
        sections: state.fields.structure.sections.length,
        questions:state.fields.structure.sections.reduce((s, sec) => s + sec.questions.length, 0),
        cat:      state.fields.basics.module || "Operations",
        ootb:     false,
        author:   "Current User",
        updated:  new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
        auditCount:0, actionPlanCount:0, linkedPrograms:0, inProgressAudits:0,
      });
    }
    setTimeout(() => { setToast(null); onBack(); }, 1800);
  };

  const handleNext = () => {
    if (state.currentStep === 1 && step1Ref.current) {
      if (!step1Ref.current.validate()) return;
    }
    if (state.currentStep === 3 && step3Ref.current) {
      if (!step3Ref.current.validate()) return;
    }
    if (state.currentStep === 4 && step4Ref.current) {
      if (!step4Ref.current.validate()) return;
    }
    dispatch({ type: "NEXT" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh", background: C.bgApp, fontFamily: F, overflow: "hidden" }}>
      <AppSidebar activeId="audit_builder" onNav={onBack} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minWidth: 0 }}>

      {/* ── Skip link */}
      <a
        href="#wizard-main"
        style={{
          position: "absolute", top: -999, left: 8, zIndex: 9999,
          background: C.primary, color: "#fff",
          padding: "8px 14px", borderRadius: 6,
          fontSize: 13, fontFamily: F, fontWeight: 600,
          textDecoration: "none",
        }}
        onFocus={e => (e.currentTarget.style.top = "8px")}
        onBlur={e => (e.currentTarget.style.top = "-999px")}
      >
        Skip to main content
      </a>

      {/* ── Step live region (polite) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
      >
        {stepAnnounce}
      </div>

      {/* ── Header strip */}
      <header style={{
        height: 52, background: C.bgSurface,
        borderBottom: `1px solid ${C.borderSubtle}`,
        display: "flex", alignItems: "center",
        padding: "0 20px", gap: 12, flexShrink: 0,
      }}>
        {/* Back link */}
        <button
          onClick={() => attemptLeave("back")}
          aria-label="Back to Catalog"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "none", border: "none", cursor: "pointer",
            color: C.textSec, fontSize: 12, fontFamily: F, fontWeight: 500,
            padding: "4px 6px", borderRadius: 4, flexShrink: 0,
          }}
          onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
          onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
          onMouseLeave={e => (e.currentTarget.style.color = C.textSec)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Catalog
        </button>

        <div style={{ width: 1, height: 20, background: C.borderSubtle, flexShrink: 0 }} />

        {/* Inline name editor */}
        {nameEditing ? (
          <input
            autoFocus
            value={state.name}
            onChange={e => dispatch({ type: "SET_NAME", value: e.target.value })}
            onBlur={() => setNameEditing(false)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setNameEditing(false); }}
            aria-label="Template name"
            style={{
              flex: 1, maxWidth: 360,
              fontSize: 14, fontWeight: 600, fontFamily: F, color: C.navyDeep,
              border: `1px solid ${C.primary}`,
              borderRadius: 6, padding: "4px 8px",
              outline: "none", boxShadow: FOCUS_RING,
              background: C.bgSurface,
            }}
          />
        ) : (
          <button
            onClick={() => setNameEditing(true)}
            aria-label={`Template name: ${state.name}. Click to edit.`}
            style={{
              flex: 1, maxWidth: 360, textAlign: "left",
              fontSize: 14, fontWeight: 600, fontFamily: F, color: C.navyDeep,
              background: "none", border: "1px solid transparent",
              borderRadius: 6, padding: "4px 8px",
              cursor: "text", outline: "none",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.borderDef)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
          >
            {state.name}
          </button>
        )}

        {/* Status badge */}
        <StatusBadge
          status={state.status}
          onChange={v => dispatch({ type: "SET_STATUS", value: v })}
        />

        {/* Seymour origin badge */}
        {state.fields.seymourOrigin && (
          <button
            onClick={() => setReviewOrigin(state.fields.seymourOrigin)}
            title="View original Excel mapping"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 9px", borderRadius: 999,
              border: "1px solid #d97706",
              background: "#fef9c3", color: "#854d0e",
              fontSize: 12, fontWeight: 600, fontFamily: F,
              cursor: "pointer", flexShrink: 0,
            }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Generated from Excel
          </button>
        )}

        {dirty && (
          <span style={{ fontSize: 10, color: C.textMuted, fontFamily: F, flexShrink: 0 }}>
            Unsaved changes
          </span>
        )}

        <div style={{ flex: 1 }} />

        {/* Save as draft */}
        <button
          onClick={handleSaveDraft}
          aria-label="Save as draft"
          style={{
            padding: "6px 14px", borderRadius: 8,
            border: `1px solid ${C.borderDef}`,
            background: C.bgSurface, color: C.textSec,
            fontSize: 12, fontFamily: F, cursor: "pointer", fontWeight: 500,
            outline: "none",
          }}
          onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
          onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          onMouseEnter={e => (e.currentTarget.style.background = C.bgApp)}
          onMouseLeave={e => (e.currentTarget.style.background = C.bgSurface)}
        >
          Save as draft
        </button>

        {/* Exit */}
        <button
          onClick={() => attemptLeave("exit")}
          aria-label="Exit wizard"
          style={{
            padding: "6px 14px", borderRadius: 8,
            border: `1px solid ${C.borderSubtle}`,
            background: "transparent", color: C.primary,
            fontSize: 12, fontFamily: F, cursor: "pointer", fontWeight: 500,
            outline: "none",
          }}
          onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
          onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          onMouseEnter={e => (e.currentTarget.style.background = C.primaryBg)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          Exit
        </button>
      </header>

      {/* ── Secondary tab row: Build | Translate */}
      <div style={{
        background: C.bgSurface,
        borderBottom: `1px solid ${C.borderSubtle}`,
        display: "flex", alignItems: "center",
        padding: "0 24px", gap: 0, flexShrink: 0, height: 40,
      }}>
        {[
          { key: "build",     label: "Build"     },
          { key: "translate", label: "Translate", disabled: !step1Complete },
        ].map(tab => {
          const isActive   = activeTab === tab.key;
          const isDisabled = tab.disabled;
          return (
            <button
              key={tab.key}
              onClick={() => { if (!isDisabled) setActiveTab(tab.key); }}
              disabled={isDisabled}
              aria-selected={isActive}
              role="tab"
              title={isDisabled ? "Complete Step 1 (name, audit type, module) to enable translations" : undefined}
              style={{
                padding: "0 16px", height: "100%", border: "none",
                background: "transparent",
                borderBottom: isActive ? `2px solid ${C.primary}` : "2px solid transparent",
                color: isActive ? C.primary : isDisabled ? C.textMuted : C.textSec,
                fontSize: 12, fontWeight: isActive ? 700 : 500, fontFamily: F,
                cursor: isDisabled ? "not-allowed" : "pointer",
                transition: "color 0.1s, border-color 0.1s",
                outline: "none",
                marginBottom: -1,
              }}
              onFocus={e => { if (!isDisabled) e.currentTarget.style.boxShadow = FOCUS_RING; }}
              onBlur={e => (e.currentTarget.style.boxShadow = "none")}
            >
              {tab.label}
              {tab.key === "translate" && isDisabled && (
                <svg style={{ marginLeft: 5, verticalAlign: "middle" }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Step rail (Build tab only) */}
      {activeTab === "build" && (
        <StepRail
          currentStep={state.currentStep}
          furthestStep={state.furthestStep}
          onGoStep={n => dispatch({ type: "GO_STEP", step: n })}
        />
      )}

      {/* ── Translate surface */}
      {activeTab === "translate" && (
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 24px 32px" }}>
          <TranslateTab state={state} dispatch={dispatch} />
        </main>
      )}

      {/* ── Build content */}
      {activeTab === "build" && <main id="wizard-main" style={{
        flex: 1,
        overflowY: (state.currentStep === 2 || (state.currentStep === 3 && step3GridMode)) ? "hidden" : "auto",
        display: "flex", flexDirection: "column",
        padding: (state.currentStep === 2 || (state.currentStep === 3 && step3GridMode)) ? "20px 24px 0" : "28px 24px 32px",
      }}>
        {/* Per-step H1 — visually hidden but focused on step change for screen reader announcement */}
        <h1
          ref={h1Ref}
          tabIndex={-1}
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", outline: "none" }}
        >
          {STEPS.find(s => s.n === state.currentStep)?.label}
        </h1>
        {state.currentStep === 1 && (
          <Step1Basics
            ref={step1Ref}
            basics={state.fields.basics}
            onChange={(field, value) => dispatch({ type: "SET_BASICS_FIELD", field, value })}
            onSeymourApply={handleSeymourApply}
            scoring={state.fields.scoring}
            dispatch={dispatch}
          />
        )}
        {state.currentStep === 2 && (
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Step2Structure
              sections={state.fields.structure.sections}
              dispatch={dispatch}
              conditionalIds={conditionalIds}
            />
          </div>
        )}
        {state.currentStep === 3 && (
          <Step3Scoring
            ref={step3Ref}
            structure={state.fields.structure}
            scoring={state.fields.scoring}
            dispatch={dispatch}
            conditionalIds={conditionalIds}
            onViewChange={isGrid => setStep3GridMode(isGrid)}
          />
        )}
        {state.currentStep === 4 && (
          <Step4Logic
            ref={step4Ref}
            structure={state.fields.structure}
            logic={state.fields.logic}
            dispatch={dispatch}
          />
        )}
        {state.currentStep === 5 && (
          <Step5Activation
            fields={state.fields}
            status={state.status}
            conditionalIds={conditionalIds}
            onGoStep={n => dispatch({ type: "GO_STEP", step: n })}
            dispatch={dispatch}
            onPublish={handlePublish}
          />
        )}
      </main>}

      {/* ── Footer strip (Build tab only) */}
      {activeTab === "build" && <footer style={{
        height: 56, background: C.bgSurface,
        borderTop: `1px solid ${C.borderSubtle}`,
        display: "flex", alignItems: "center",
        padding: "0 24px", gap: 12, flexShrink: 0,
      }}>
        {/* Back */}
        <button
          onClick={() => dispatch({ type: "BACK" })}
          disabled={state.currentStep === 1}
          aria-label="Go to previous step"
          style={{
            padding: "8px 20px", borderRadius: 8,
            border: `1px solid ${state.currentStep === 1 ? C.borderSubtle : C.borderDef}`,
            background: C.bgSurface,
            color: state.currentStep === 1 ? C.textMuted : C.textSec,
            fontSize: 13, fontFamily: F, fontWeight: 500,
            cursor: state.currentStep === 1 ? "not-allowed" : "pointer",
            outline: "none",
          }}
          onFocus={e => { if (state.currentStep !== 1) e.currentTarget.style.boxShadow = FOCUS_RING; }}
          onBlur={e => (e.currentTarget.style.boxShadow = "none")}
        >
          Back
        </button>

        {/* Step counter */}
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: C.textMuted, fontFamily: F }}>
          Step {state.currentStep} of 5
        </div>

        {/* Step 5: Save as draft | (Publish lives in the checklist) */}
        {state.currentStep === 5 ? (
          <button
            onClick={() => { handleSaveDraft(); onBack(); }}
            aria-label="Save as draft and return to Catalog"
            style={{
              padding: "8px 20px", borderRadius: 8,
              border: `1px solid ${C.borderDef}`,
              background: C.bgSurface, color: C.textSec,
              fontSize: 13, fontFamily: F, fontWeight: 500,
              cursor: "pointer", outline: "none",
            }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
            onMouseEnter={e => (e.currentTarget.style.background = C.bgApp)}
            onMouseLeave={e => (e.currentTarget.style.background = C.bgSurface)}
          >
            Save as draft
          </button>
        ) : (
          <button
            onClick={handleNext}
            aria-label="Go to next step"
            style={{
              padding: "8px 20px", borderRadius: 8,
              border: "none",
              background: C.primary, color: "#fff",
              fontSize: 13, fontFamily: F, fontWeight: 600,
              cursor: "pointer", outline: "none",
            }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
            onMouseEnter={e => (e.currentTarget.style.background = C.primaryHover)}
            onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
          >
            Next
          </button>
        )}
      </footer>}

      {/* ── Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
            background: C.navyDeep, color: "#fff",
            padding: "10px 22px", borderRadius: 8,
            fontSize: 13, fontFamily: F, fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            zIndex: 1000,
            display: "flex", alignItems: "center", gap: 10,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}

      {/* ── Confirm dialog */}
      {confirmExit && (
        <ConfirmDialog
          message="You have unsaved changes. If you leave now, they'll be lost."
          onConfirm={() => { setConfirmExit(null); onBack(); }}
          onCancel={() => setConfirmExit(null)}
        />
      )}

      {/* ── Seymour upload overlay (entry via Catalog dropdown) */}
      {showSeymour && (
        <SeymourUpload
          onApply={handleSeymourApply}
          onCancel={() => setShowSeymour(false)}
        />
      )}

      {/* ── Seymour review overlay (re-opened from badge) */}
      {reviewOrigin && (
        <SeymourUpload
          initialResult={reviewOrigin}
          onApply={(result) => { dispatch({ type: "APPLY_SEYMOUR", result }); setReviewOrigin(null); }}
          onCancel={() => setReviewOrigin(null)}
        />
      )}
      </div>
    </div>
  );
}
