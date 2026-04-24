// Implements: TLP-87 (scoring per question type x scoring model)
import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import QuestionScoringRow, { defaultScoringForQuestion } from "./Scoring/QuestionScoringRow.jsx";
import ScoringGrid from "./Scoring/ScoringGrid.jsx";

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
  info:         "#0369a1",
  infoBg:       "#f0f9ff",
};
const FOCUS_RING = "0 0 0 2px #fff, 0 0 0 4px #2226f7";

const SCORING_MODELS = [
  {
    key:   "informational",
    label: "Informational",
    help:  "Questions collect data only. No pass/fail determination is made — results are not scored.",
  },
  {
    key:   "weighted",
    label: "Weighted",
    help:  "Each question carries a weight (must total 100% per section). A weighted passing score is calculated.",
  },
  {
    key:   "passfail",
    label: "Pass/Fail",
    help:  "Each question is assessed as pass or fail individually. All critical questions must pass.",
  },
  {
    key:   "points",
    label: "Points-Based",
    help:  "Each answer earns a defined number of points. The audit passes if section totals meet the threshold.",
  },
];

// ── Validation ────────────────────────────────────────────────────────────────

function computeErrors(sections, scoring) {
  const errors = [];
  const model = scoring.model;
  const getSc = q => scoring.perQuestion[q.id] || defaultScoringForQuestion(q, model);

  if (model === "weighted") {
    sections.forEach(section => {
      const countable = section.questions.filter(q => !q.isConditional);
      if (!countable.length) return;
      const total = countable.reduce((sum, q) => sum + (parseFloat(getSc(q).weight) || 0), 0);
      if (Math.abs(total - 100) > 0.01) {
        errors.push({
          key:       `w-${section.id}`,
          sectionId: section.id,
          msg:       `Section "${section.name}": weights total ${Math.round(total * 100) / 100}% — must equal 100%.`,
        });
      }
    });
  }

  if (model === "points") {
    sections.forEach(section =>
      section.questions.forEach(q => {
        const sc = getSc(q);
        const max = parseFloat(sc.maxPoints) || 0;

        if ((q.type === "Rating" || q.type === "Text") && sc.ratingPoints) {
          const over = Object.entries(sc.ratingPoints).find(([, p]) => parseFloat(p) > max);
          if (over) errors.push({ key: `p-rat-${q.id}`, questionId: q.id, msg: `"${q.text.slice(0, 50)}": rating value ${over[0]} exceeds max points (${max}).` });
        }
        if (q.type === "Number" && sc.conditions) {
          const over = sc.conditions.find(c => parseFloat(c.points) > max);
          if (over) errors.push({ key: `p-num-${q.id}`, questionId: q.id, msg: `"${q.text.slice(0, 50)}": a condition awards more than max points (${max}).` });
        }
        const choiceTypes = ["Multiple Choice", "Multi-Select", "Dropdown"];
        if (choiceTypes.includes(q.type) && sc.choicePoints) {
          const over = Object.values(sc.choicePoints).find(p => parseFloat(p) > max);
          if (over) errors.push({ key: `p-ch-${q.id}`, questionId: q.id, msg: `"${q.text.slice(0, 50)}": a choice exceeds max points (${max}).` });
        }
      })
    );
  }

  return errors;
}

// ── Section summary row (Points-Based) ───────────────────────────────────────

function SectionPointsSummary({ section, scoring, dispatch }) {
  const maxAvail = section.questions.reduce((sum, q) => {
    const sc = scoring.perQuestion[q.id] || defaultScoringForQuestion(q, "points");
    return sum + (parseFloat(sc.maxPoints) || 0);
  }, 0);
  const ssc = scoring.perSection[section.id] || {};
  const pointsToPass = ssc.pointsToPass ?? Math.ceil(maxAvail * 0.7);

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center", padding: "9px 16px", background: C.primaryBg, borderBottom: `1px solid ${C.borderSubtle}` }}>
      <span style={{ fontSize: 11, color: C.textSec, fontFamily: F }}>
        Max points available: <strong style={{ color: C.navyDeep }}>{maxAvail}</strong>
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <label htmlFor={`ptp-${section.id}`} style={{ fontSize: 11, color: C.textSec, fontFamily: F }}>
          Points to pass:
        </label>
        <input
          id={`ptp-${section.id}`}
          type="number"
          min={0}
          max={maxAvail}
          value={pointsToPass}
          onChange={e => dispatch({ type: "SET_SECTION_SCORING", id: section.id, updates: { pointsToPass: parseFloat(e.target.value) || 0 } })}
          style={{ width: 64, padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.borderDef}`, fontSize: 11, fontFamily: F, outline: "none", color: C.navyDeep }}
          onFocus={e => (e.target.style.borderColor = C.primary)}
          onBlur={e => (e.target.style.borderColor = C.borderDef)}
        />
        <span style={{ fontSize: 10, color: C.textMuted, fontFamily: F }}>of {maxAvail}</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const Step3Scoring = forwardRef(function Step3Scoring({ structure, scoring, dispatch, conditionalIds = new Set(), onViewChange }, ref) {
  const sections = structure.sections;
  const model    = scoring.model;
  const [view, setView]       = useState("list");
  const showGridToggle = typeof window !== "undefined" && window.innerWidth >= 1024;

  const switchView = v => { setView(v); onViewChange?.(v === "grid"); };

  const errors = useMemo(() => computeErrors(sections, scoring), [sections, scoring]);

  useImperativeHandle(ref, () => ({
    validate:   () => errors.length === 0,
    isGridView: () => view === "grid",
  }));

  const weightErrorSections = useMemo(() => {
    if (model !== "weighted") return new Set();
    return new Set(errors.filter(e => e.sectionId).map(e => e.sectionId));
  }, [model, errors]);

  const handleChange = (q, updates) => {
    const current = scoring.perQuestion[q.id] || defaultScoringForQuestion(q, model);
    dispatch({ type: "SET_QUESTION_SCORING", id: q.id, updates: { ...current, ...updates } });
  };

  return (
    <div style={view === "grid" ? { display:"flex", flexDirection:"column", flex:1, minHeight:0 } : { maxWidth: 900, margin: "0 auto" }}>

      {/* Page title + view toggle */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, maxWidth: view === "grid" ? "none" : undefined }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.navyDeep, fontFamily: F }}>Scoring</div>
          <div style={{ fontSize: 12, color: C.textMuted, fontFamily: F, marginTop: 3 }}>
            Configure how each question contributes to the audit result.
          </div>
        </div>
        {showGridToggle && (
          <div
            role="group"
            aria-label="View toggle"
            style={{ display: "flex", borderRadius: 8, border: `1px solid ${C.borderDef}`, overflow: "hidden" }}
          >
            {[{ key: "list", label: "List view" }, { key: "grid", label: "Grid view" }].map(v => (
              <button
                key={v.key}
                onClick={() => switchView(v.key)}
                aria-pressed={view === v.key}
                style={{ padding: "7px 16px", border: "none", background: view === v.key ? C.primary : C.bgSurface, color: view === v.key ? "#fff" : C.textSec, fontSize: 12, fontFamily: F, cursor: "pointer", outline: "none" }}
                onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                onBlur={e => (e.currentTarget.style.boxShadow = "none")}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Scoring model selector — ABOVE question setup per TLP-87 */}
      <div style={{ background: C.bgSurface, borderRadius: 10, border: `1px solid ${C.borderSubtle}`, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.navyDeep, fontFamily: F, marginBottom: 14 }}>Scoring model</div>
        <div
          role="radiogroup"
          aria-label="Scoring model"
          style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}
        >
          {SCORING_MODELS.map(m => (
            <label
              key={m.key}
              style={{
                display: "flex", gap: 10, padding: "10px 14px", borderRadius: 8,
                border: `1px solid ${model === m.key ? C.primary : C.borderSubtle}`,
                background: model === m.key ? C.primaryBg : C.bgSurface,
                cursor: "pointer", transition: "all 0.1s",
              }}
            >
              <input
                type="radio"
                name="scoringModel"
                value={m.key}
                checked={model === m.key}
                onChange={() => dispatch({ type: "SET_SCORING_MODEL", model: m.key })}
                style={{ marginTop: 2, accentColor: C.primary, flexShrink: 0 }}
                onFocus={e => (e.currentTarget.closest("label").style.boxShadow = FOCUS_RING)}
                onBlur={e => (e.currentTarget.closest("label").style.boxShadow = "none")}
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.navyDeep, fontFamily: F }}>{m.label}</div>
                <div style={{ fontSize: 11, color: C.textSec, fontFamily: F, marginTop: 2, lineHeight: "15px" }}>{m.help}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Validation banner */}
      {errors.length > 0 && (
        <div
          role="alert"
          style={{ background: C.errorBg, border: `1px solid #fca5a5`, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: C.error, fontFamily: F, marginBottom: 8 }}>
            {errors.length} scoring {errors.length === 1 ? "issue" : "issues"} — resolve before publishing
          </div>
          <ul style={{ margin: 0, padding: "0 0 0 16px", listStyleType: "disc" }}>
            {errors.map(err => (
              <li key={err.key} style={{ fontSize: 11, color: C.error, fontFamily: F, marginBottom: 3 }}>
                {err.questionId
                  ? <a href={`#q-score-${err.questionId}`} style={{ color: C.error, fontFamily: F }}>{err.msg}</a>
                  : err.msg
                }
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {sections.length === 0 && (
        <div style={{ textAlign: "center", padding: "56px 24px", color: C.textMuted, fontFamily: F }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>No questions in this template</div>
          <div style={{ fontSize: 12 }}>Go back to Step 2 to add sections and questions first.</div>
        </div>
      )}

      {/* Informational notice */}
      {model === "informational" && sections.length > 0 && (
        <div style={{ background: C.infoBg, border: `1px solid #bae6fd`, borderRadius: 10, padding: "14px 18px", color: C.info, fontSize: 12, fontFamily: F, lineHeight: "18px" }}>
          <strong>Informational mode active.</strong> No scoring configuration is needed — all questions collect data only. Switch the scoring model above to enable scoring.
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && model !== "informational" && sections.length > 0 && (
        <ScoringGrid
          sections={sections}
          scoring={scoring}
          dispatch={dispatch}
          model={model}
          conditionalIds={conditionalIds}
        />
      )}

      {/* List view */}
      {view === "list" && model !== "informational" && sections.map(section => {
        const hasWeightErr = weightErrorSections.has(section.id);

        const weightTotal = model === "weighted"
          ? section.questions.filter(q => !q.isConditional)
              .reduce((sum, q) => sum + (parseFloat((scoring.perQuestion[q.id] || defaultScoringForQuestion(q, model)).weight) || 0), 0)
          : null;

        return (
          <div
            key={section.id}
            style={{
              background: C.bgSurface, borderRadius: 10,
              border: `1px solid ${hasWeightErr ? C.error : C.borderSubtle}`,
              marginBottom: 16, overflow: "hidden",
            }}
          >
            {/* Section header */}
            <div style={{ padding: "11px 16px", background: C.bgApp, borderBottom: `1px solid ${C.borderSubtle}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: F }}>{section.name}</span>
                <span style={{ fontSize: 11, color: C.textMuted, fontFamily: F, marginLeft: 8 }}>
                  {section.questions.length} question{section.questions.length !== 1 ? "s" : ""}
                </span>
              </div>
              {model === "weighted" && weightTotal !== null && (
                <span style={{ fontSize: 11, fontWeight: 600, fontFamily: F, color: hasWeightErr ? C.error : C.success }}>
                  {Math.round(weightTotal * 100) / 100}% / 100%{hasWeightErr ? " — must equal 100%" : " ✓"}
                </span>
              )}
            </div>

            {/* Points-based section controls */}
            {model === "points" && (
              <SectionPointsSummary section={section} scoring={scoring} dispatch={dispatch} />
            )}

            {/* Column headers */}
            {section.questions.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 16, padding: "7px 16px", background: C.bgApp, borderBottom: `1px solid ${C.borderSubtle}` }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: F }}>Question</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: F, textAlign: "right" }}>Scoring config</span>
              </div>
            )}

            {section.questions.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 12, color: C.textMuted, fontFamily: F }}>
                No questions in this section.
              </div>
            ) : (
              section.questions.map(q => {
                const sc = scoring.perQuestion[q.id] || defaultScoringForQuestion(q, model);
                const augQ = conditionalIds.has(q.id) ? { ...q, isConditional: true } : q;
                return (
                  <QuestionScoringRow
                    key={q.id}
                    q={augQ}
                    model={model}
                    scoring={sc}
                    onChange={updates => handleChange(q, updates)}
                    sectionWeightError={hasWeightErr}
                  />
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
});

export default Step3Scoring;
