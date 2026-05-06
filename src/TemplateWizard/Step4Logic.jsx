// Implements: TLP-8 (conditional logic step, visual rule builder, circular/contradictory validation)
import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import RuleCard from "./Logic/RuleCard.jsx";

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

function uid() {
  return "r-" + Date.now() + "-" + Math.floor(Math.random() * 9999);
}

// Flatten all questions from structure sections into a single list with sectionName attached
function flatQuestions(sections) {
  return sections.flatMap(s =>
    s.questions.map(q => ({ ...q, sectionName: s.name, sectionId: s.id }))
  );
}

// ── Validation ────────────────────────────────────────────────────────────────

function computeRuleIssues(rules, allQuestions) {
  const qMap = Object.fromEntries(allQuestions.map(q => [q.id, q]));
  const errors   = {};  // ruleId -> string[]
  const warnings = {};  // ruleId -> string[]
  const addErr  = (id, msg) => { errors[id]   = [...(errors[id]   || []), msg]; };
  const addWarn = (id, msg) => { warnings[id] = [...(warnings[id] || []), msg]; };

  // Build a map: questionId -> set of showIds it triggers
  const triggersMap = {};
  rules.forEach(r => { triggersMap[r.driverQuestionId] = new Set(r.showIds); });

  rules.forEach(rule => {
    const dq = qMap[rule.driverQuestionId];

    // Incomplete: no clauses or empty clause values
    if (rule.clauses.length === 0) {
      addErr(rule.id, "Rule has no clauses.");
    } else {
      rule.clauses.forEach((c, i) => {
        if (!c.value && c.value !== 0) addErr(rule.id, `Clause ${i + 1}: value is empty.`);
      });
    }

    // No follow-up questions selected
    if (rule.showIds.length === 0) {
      addErr(rule.id, "No follow-up questions selected.");
    }

    // Circular: a showId question also drives a rule that shows the driver
    rule.showIds.forEach(sid => {
      const downstream = triggersMap[sid];
      if (downstream && downstream.has(rule.driverQuestionId)) {
        addWarn(rule.id, `Potential circular dependency: "${(qMap[sid]?.text || sid).slice(0, 40)}" also shows "${(dq?.text || rule.driverQuestionId).slice(0, 40)}".`);
      }
    });

    // Self-reference guard
    if (rule.showIds.includes(rule.driverQuestionId)) {
      addErr(rule.id, "A question cannot show itself as a follow-up.");
    }
  });

  return { errors, warnings };
}

// ── Conditional badge ─────────────────────────────────────────────────────────

function ConditionalBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      padding: "1px 6px", borderRadius: 4,
      background: "#fef9c3", border: "1px solid #fde68a",
      fontSize: 10, fontWeight: 700, color: C.warning, fontFamily: F,
      letterSpacing: "0.04em", textTransform: "uppercase", flexShrink: 0,
    }}>
      Conditional
    </span>
  );
}

// ── Question row (inside section card) ───────────────────────────────────────

function QuestionRow({ q, rules, allQuestions, isConditional, onAddRule, dispatch }) {
  const qRules = rules.filter(r => r.driverQuestionId === q.id);
  const { errors, warnings } = computeRuleIssues(qRules, allQuestions);

  return (
    <div style={{ borderBottom: `1px solid ${C.borderSubtle}`, padding: "12px 16px" }}>
      {/* Question header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: qRules.length ? 10 : 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: C.navyDeep, fontFamily: F, lineHeight: "17px" }}>{q.text}</span>
            <span style={{ fontSize: 10, color: C.textMuted, background: C.bgApp, border: `1px solid ${C.borderSubtle}`, borderRadius: 4, padding: "1px 5px", fontFamily: F, fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase" }}>{q.type}</span>
            {isConditional && <ConditionalBadge />}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onAddRule(q.id)}
          style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.borderDef}`, background: C.bgSurface, color: C.primary, fontSize: 12, fontFamily: F, cursor: "pointer", outline: "none", flexShrink: 0, fontWeight: 500 }}
          onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
          onBlur={e => (e.currentTarget.style.boxShadow = "none")}
        >
          + Add condition
        </button>
      </div>

      {/* Rule cards */}
      {qRules.length > 0 && (
        <div style={{ paddingLeft: 16 }}>
          {qRules.map(rule => (
            <RuleCard
              key={rule.id}
              rule={rule}
              driverQ={q}
              allQuestions={allQuestions}
              onUpdate={updates => dispatch({ type: "UPDATE_LOGIC_RULE", id: rule.id, updates })}
              onDelete={() => dispatch({ type: "DELETE_LOGIC_RULE", id: rule.id })}
              errors={errors[rule.id] || []}
              warnings={warnings[rule.id] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Error panel ───────────────────────────────────────────────────────────────

function ErrorPanel({ allIssues, totalRules }) {
  const errorCount   = allIssues.filter(i => i.type === "error").length;
  const warningCount = allIssues.filter(i => i.type === "warning").length;

  return (
    <div style={{
      width: 240, flexShrink: 0,
      background: C.bgSurface, borderRadius: 12,
      border: `1px solid ${C.borderSubtle}`,
      alignSelf: "flex-start", position: "sticky", top: 0,
    }}>
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderSubtle}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.navyDeep, fontFamily: F }}>Validation</div>
      </div>

      {/* Stats */}
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.textSec, fontFamily: F }}>Total rules</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.navyDeep, fontFamily: F }}>{totalRules}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.error, fontFamily: F }}>Errors</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.error, fontFamily: F }}>{errorCount}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.warning, fontFamily: F }}>Warnings</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.warning, fontFamily: F }}>{warningCount}</span>
        </div>
      </div>

      {/* Issue list */}
      {allIssues.length > 0 && (
        <div style={{ borderTop: `1px solid ${C.borderSubtle}`, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          {allIssues.map((issue, i) => (
            <div key={i} style={{ fontSize: 10, color: issue.type === "error" ? C.error : C.warning, fontFamily: F, lineHeight: "14px" }}>
              <div style={{ fontWeight: 600, marginBottom: 1 }}>{issue.questionText.slice(0, 32)}{issue.questionText.length > 32 ? "..." : ""}</div>
              {issue.msg}
            </div>
          ))}
        </div>
      )}

      {allIssues.length === 0 && totalRules > 0 && (
        <div style={{ padding: "12px 14px", fontSize: 12, color: C.success, fontFamily: F, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          All rules valid
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const Step4Logic = forwardRef(function Step4Logic({ structure, logic, dispatch }, ref) {
  const sections = structure.sections;
  const rules    = logic.rules;
  const [filter, setFilter] = useState("all"); // "all" | "with" | "without"

  const allQuestions = useMemo(() => flatQuestions(sections), [sections]);

  const conditionalIds = useMemo(() => {
    const ids = new Set();
    rules.forEach(r => r.showIds.forEach(id => ids.add(id)));
    return ids;
  }, [rules]);

  // Collect all issues for error panel
  const { errors: allErrors, warnings: allWarnings } = useMemo(
    () => computeRuleIssues(rules, allQuestions),
    [rules, allQuestions]
  );

  const allIssues = useMemo(() => {
    const out = [];
    const qMap = Object.fromEntries(allQuestions.map(q => [q.id, q]));
    rules.forEach(rule => {
      const qt = qMap[rule.driverQuestionId]?.text || rule.driverQuestionId;
      (allErrors[rule.id] || []).forEach(msg => out.push({ type: "error", questionText: qt, msg }));
      (allWarnings[rule.id] || []).forEach(msg => out.push({ type: "warning", questionText: qt, msg }));
    });
    return out;
  }, [rules, allErrors, allWarnings, allQuestions]);

  useImperativeHandle(ref, () => ({
    validate: () => allIssues.filter(i => i.type === "error").length === 0,
  }));

  const handleAddRule = (driverQuestionId) => {
    dispatch({
      type: "ADD_LOGIC_RULE",
      rule: {
        id: uid(),
        driverQuestionId,
        clauses: [{ operator: "equals", value: "", joiner: "AND" }],
        showIds: [],
      },
    });
  };

  // Filtered sections/questions for the list
  const filteredSections = useMemo(() => {
    if (filter === "all") return sections;
    return sections.map(s => ({
      ...s,
      questions: s.questions.filter(q => {
        const hasRule = rules.some(r => r.driverQuestionId === q.id);
        return filter === "with" ? hasRule : !hasRule;
      }),
    })).filter(s => s.questions.length > 0);
  }, [sections, rules, filter]);

  const totalQuestions = allQuestions.length;
  const withLogic = allQuestions.filter(q => rules.some(r => r.driverQuestionId === q.id)).length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 20, alignItems: "flex-start" }}>

      {/* ── Left: main panel */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Page title + filter bar */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.navyDeep, fontFamily: F }}>Conditional Logic</div>
            <div style={{ fontSize: 12, color: C.textMuted, fontFamily: F, marginTop: 3 }}>
              Show follow-up questions based on answers to other questions.
            </div>
          </div>
          {totalQuestions > 0 && (
            <div style={{ fontSize: 12, color: C.textMuted, fontFamily: F, textAlign: "right", marginTop: 4 }}>
              {withLogic} of {totalQuestions} questions have logic
            </div>
          )}
        </div>

        {/* Filter chips */}
        {totalQuestions > 0 && (
          <div role="group" aria-label="Filter questions" style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[
              { key: "all", label: "All questions" },
              { key: "with", label: "With logic" },
              { key: "without", label: "Without logic" },
            ].map(f => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                style={{
                  padding: "5px 12px", borderRadius: 999,
                  border: `1px solid ${filter === f.key ? C.primary : C.borderDef}`,
                  background: filter === f.key ? C.primaryBg : C.bgSurface,
                  color: filter === f.key ? C.primary : C.textSec,
                  fontSize: 12, fontFamily: F, cursor: "pointer", outline: "none", fontWeight: filter === f.key ? 600 : 400,
                }}
                onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                onBlur={e => (e.currentTarget.style.boxShadow = "none")}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {sections.length === 0 && (
          <div style={{ textAlign: "center", padding: "56px 24px", background: C.bgSurface, borderRadius: 12, border: `1px solid ${C.borderSubtle}` }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textSec, fontFamily: F, marginBottom: 6 }}>No questions in this template</div>
            <div style={{ fontSize: 12, color: C.textMuted, fontFamily: F }}>Go back to Step 2 to add sections and questions first.</div>
          </div>
        )}

        {/* Section cards */}
        {filteredSections.map(section => (
          <div
            key={section.id}
            style={{ background: C.bgSurface, borderRadius: 12, border: `1px solid ${C.borderSubtle}`, marginBottom: 16, overflow: "hidden" }}
          >
            <div style={{ padding: "10px 16px", background: C.bgApp, borderBottom: `1px solid ${C.borderSubtle}`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: F }}>{section.name}</span>
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: F }}>{section.questions.length} question{section.questions.length !== 1 ? "s" : ""}</span>
            </div>
            {section.questions.length === 0 ? (
              <div style={{ padding: "20px 16px", textAlign: "center", fontSize: 12, color: C.textMuted, fontFamily: F }}>
                No questions match the current filter.
              </div>
            ) : (
              section.questions.map(q => (
                <QuestionRow
                  key={q.id}
                  q={q}
                  rules={rules}
                  allQuestions={allQuestions}
                  isConditional={conditionalIds.has(q.id)}
                  onAddRule={handleAddRule}
                  dispatch={dispatch}
                />
              ))
            )}
          </div>
        ))}
      </div>

      {/* ── Right: error panel */}
      {sections.length > 0 && (
        <ErrorPanel allIssues={allIssues} totalRules={rules.length} />
      )}
    </div>
  );
});

export default Step4Logic;
