// Implements: TLP-8 (activation step, pre-publish checklist, summary view)
import { useMemo } from "react";
import { defaultScoringForQuestion } from "./Scoring/QuestionScoringRow.jsx";

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
  warning:      "#b45309",
  warningBg:    "#fffbeb",
  info:         "#0369a1",
  infoBg:       "#f0f9ff",
};
const FOCUS_RING = "0 0 0 2px #fff, 0 0 0 4px #2226f7";

// ── Scoring validation (mirrors Step3Scoring logic) ───────────────────────────

function scoringErrors(sections, scoring, conditionalIds) {
  const errors = [];
  const model  = scoring.model;
  const getSc  = q => scoring.perQuestion[q.id] || defaultScoringForQuestion(q, model);

  if (model === "weighted") {
    sections.forEach(section => {
      const countable = section.questions.filter(q => !conditionalIds.has(q.id));
      if (!countable.length) return;
      const total = countable.reduce((sum, q) => sum + (parseFloat(getSc(q).weight) || 0), 0);
      if (Math.abs(total - 100) > 0.01)
        errors.push(`Section "${section.name}": weights total ${Math.round(total * 100) / 100}% (must equal 100%).`);
    });
  }

  if (model === "points") {
    sections.forEach(section =>
      section.questions.forEach(q => {
        const sc  = getSc(q);
        const max = parseFloat(sc.maxPoints) || 0;
        if ((q.type === "Rating" || q.type === "Text") && sc.ratingPoints) {
          const over = Object.entries(sc.ratingPoints).find(([, p]) => parseFloat(p) > max);
          if (over) errors.push(`"${q.text.slice(0, 40)}": rating ${over[0]} exceeds max points.`);
        }
        if (q.type === "Number" && sc.conditions) {
          if (sc.conditions.find(c => parseFloat(c.points) > max))
            errors.push(`"${q.text.slice(0, 40)}": a condition exceeds max points.`);
        }
        const choiceTypes = ["Multiple Choice", "Multi-Select", "Dropdown"];
        if (choiceTypes.includes(q.type) && sc.choicePoints) {
          if (Object.values(sc.choicePoints).find(p => parseFloat(p) > max))
            errors.push(`"${q.text.slice(0, 40)}": a choice exceeds max points.`);
        }
      })
    );
  }

  return errors;
}

// ── Logic validation (mirrors Step4Logic logic) ───────────────────────────────

function logicErrors(rules, allQuestions) {
  const qMap = Object.fromEntries(allQuestions.map(q => [q.id, q]));
  const triggersMap = {};
  rules.forEach(r => { triggersMap[r.driverQuestionId] = new Set(r.showIds); });
  const errs = [];

  rules.forEach(rule => {
    if (rule.clauses.length === 0) { errs.push("A rule has no clauses."); return; }
    rule.clauses.forEach((c, i) => {
      if (!c.value && c.value !== 0) errs.push(`Rule clause ${i + 1}: value is empty.`);
    });
    if (rule.showIds.length === 0) errs.push("A rule has no follow-up questions selected.");
    if (rule.showIds.includes(rule.driverQuestionId)) errs.push("A question cannot show itself.");
    rule.showIds.forEach(sid => {
      const downstream = triggersMap[sid];
      if (downstream && downstream.has(rule.driverQuestionId)) {
        const qt = (qMap[sid]?.text || sid).slice(0, 30);
        errs.push(`Circular dependency detected involving "${qt}".`);
      }
    });
  });

  return [...new Set(errs)]; // dedupe
}

// ── Check computation ─────────────────────────────────────────────────────────

function computeChecks(fields, conditionalIds) {
  const { basics, structure, scoring, logic } = fields;
  const sections = structure.sections;
  const allQs    = sections.flatMap(s => s.questions);
  const totalQs  = allQs.length;
  const rules    = logic.rules;

  // Hard check 1 — at least one section with one question
  const hasContent = sections.some(s => s.questions.length > 0);

  // Hard check 2 — Step 1 required fields
  const basicsOk = !!(basics.name?.trim() && basics.auditType && basics.module);

  // Hard check 3 — scoring
  const scoringErrs = scoringErrors(sections, scoring, conditionalIds);
  const scoringOk   = scoringErrs.length === 0;

  // Hard check 4 — logic
  const logicErrs = logicErrors(rules, allQs);
  const logicOk   = logicErrs.length === 0;

  // Soft check 1 — few questions
  const fewQuestions = totalQs > 0 && totalQs < 3;

  // Soft check 2 — no help text (prototype: questions have no helpText field yet, always warn)
  const noHelpText = totalQs > 0 && allQs.every(q => !q.helpText);

  // Soft check 3 — no programs linked (prototype always true)
  const noPrograms = true;

  const hard = [
    {
      id:    "content",
      label: "At least one section with one question",
      pass:  hasContent,
      detail: hasContent ? null : "Go to Step 2 to add sections and questions.",
      goStep: 2,
    },
    {
      id:    "basics",
      label: "All required fields complete (name, audit type, module)",
      pass:  basicsOk,
      detail: basicsOk ? null : "Template name, audit type, and module are required.",
      goStep: 1,
    },
    {
      id:    "scoring",
      label: "Scoring configuration valid",
      pass:  scoringOk,
      detail: scoringOk ? null : scoringErrs[0],
      extraDetails: scoringErrs.slice(1),
      goStep: 3,
    },
    {
      id:    "logic",
      label: "All conditional logic rules complete",
      pass:  logicOk,
      detail: logicOk ? null : logicErrs[0],
      extraDetails: logicErrs.slice(1),
      goStep: 4,
    },
  ];

  const soft = [
    {
      id:    "few-qs",
      show:  fewQuestions,
      label: "Template has very few questions",
      detail: "Templates with very few questions may not provide meaningful audit data.",
      goStep: 2,
    },
    {
      id:    "no-help",
      show:  noHelpText,
      label: "No help text on questions",
      detail: "Consider adding help text to guide auditors through each question.",
      goStep: 2,
    },
    {
      id:    "no-programs",
      show:  noPrograms,
      label: "No programs linked",
      detail: "You can publish, but no programs will surface this template yet.",
      goStep: null,
    },
  ].filter(s => s.show);

  const canPublish = hard.every(h => h.pass);

  return { hard, soft, canPublish };
}

// ── Summary helpers ───────────────────────────────────────────────────────────

function maxAchievablePoints(sections, scoring) {
  return sections.reduce((sum, s) =>
    sum + s.questions.reduce((qs, q) => {
      const sc = scoring.perQuestion[q.id] || defaultScoringForQuestion(q, "points");
      return qs + (parseFloat(sc.maxPoints) || 0);
    }, 0),
  0);
}

function questionTypeBreakdown(sections) {
  const counts = {};
  sections.forEach(s => s.questions.forEach(q => { counts[q.type] = (counts[q.type] || 0) + 1; }));
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CheckIcon({ pass }) {
  if (pass) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill={C.successBg} stroke={C.success}/>
      <polyline points="8 12 11 15 16 9"/>
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill={C.errorBg} stroke={C.error}/>
      <line x1="15" y1="9" x2="9" y2="15" stroke={C.error}/>
      <line x1="9" y1="9" x2="15" y2="15" stroke={C.error}/>
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill={C.warningBg} stroke={C.warning}/>
      <line x1="12" y1="9" x2="12" y2="13" stroke={C.warning}/>
      <line x1="12" y1="17" x2="12.01" y2="17" stroke={C.warning}/>
    </svg>
  );
}

function SummarySection({ title, children, onEdit, step }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            style={{ fontSize: 11, color: C.primary, background: "none", border: "none", cursor: "pointer", padding: "1px 0", fontFamily: F }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          >
            Edit (Step {step})
          </button>
        )}
      </div>
      <div style={{ background: C.bgApp, borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
        {children}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, muted }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "flex-start" }}>
      <span style={{ fontSize: 11, color: C.textSec, fontFamily: F, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, color: muted ? C.textMuted : C.navyDeep, fontFamily: F, textAlign: "right", fontStyle: muted ? "italic" : "normal" }}>
        {value || <em style={{ color: C.textMuted }}>—</em>}
      </span>
    </div>
  );
}

// ── Lifecycle controls ────────────────────────────────────────────────────────

function LifecycleControls({ status, canPublish, onDispatch, onPublish }) {
  if (status === "draft") return null; // draft publish handled by Publish button above

  const btn = (label, onClick, style) => (
    <button
      type="button"
      onClick={onClick}
      style={{ padding: "7px 16px", borderRadius: 7, fontSize: 12, fontFamily: F, cursor: "pointer", fontWeight: 500, outline: "none", ...style }}
      onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
      onBlur={e => (e.currentTarget.style.boxShadow = "none")}
    >{label}</button>
  );

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.borderSubtle}` }}>
      <div style={{ fontSize: 11, color: C.textMuted, fontFamily: F, width: "100%", marginBottom: 4 }}>Lifecycle actions</div>
      {status === "active"      && btn("Deactivate", () => onDispatch({ type: "SET_STATUS", value: "deactivated" }), { border: `1px solid ${C.borderDef}`, background: C.bgSurface, color: C.textSec })}
      {status === "deactivated" && btn("Reactivate", () => onDispatch({ type: "SET_STATUS", value: "active" }),      { border: "none", background: C.primary, color: "#fff", fontWeight: 600 })}
      {status === "active" || status === "deactivated"
        ? btn("Archive", () => onDispatch({ type: "SET_STATUS", value: "archived" }), { border: `1px solid ${C.borderSubtle}`, background: "transparent", color: C.textMuted })
        : null}
      {status === "archived"    && btn("Restore to Active", () => onDispatch({ type: "SET_STATUS", value: "active" }), { border: `1px solid ${C.borderDef}`, background: C.bgSurface, color: C.textSec })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Step5Activation({ fields, status, conditionalIds, onGoStep, dispatch, onPublish }) {
  const { basics, structure, scoring, logic } = fields;
  const sections  = structure.sections;
  const allQs     = useMemo(() => sections.flatMap(s => s.questions), [sections]);
  const typeBreak = useMemo(() => questionTypeBreakdown(sections), [sections]);
  const maxPts    = useMemo(() => scoring.model === "points" ? maxAchievablePoints(sections, scoring) : null, [sections, scoring]);

  const { hard, soft, canPublish } = useMemo(
    () => computeChecks(fields, conditionalIds),
    [fields, conditionalIds]
  );

  const SCORING_LABEL = {
    informational: "Informational",
    weighted:      "Weighted",
    passfail:      "Pass / Fail",
    points:        "Points-Based",
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "flex-start" }}>

      {/* ── Left: checklist */}
      <div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.navyDeep, fontFamily: F }}>Activation</div>
          <div style={{ fontSize: 12, color: C.textMuted, fontFamily: F, marginTop: 3 }}>
            Review all checks before publishing your template.
          </div>
        </div>

        {/* Hard checks */}
        <div style={{ background: C.bgSurface, borderRadius: 10, border: `1px solid ${C.borderSubtle}`, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "10px 16px", background: C.bgApp, borderBottom: `1px solid ${C.borderSubtle}` }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.navyDeep, fontFamily: F }}>Required checks</span>
          </div>
          {hard.map(check => (
            <div key={check.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.borderSubtle}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <CheckIcon pass={check.pass} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: check.pass ? C.navyDeep : C.error, fontFamily: F }}>{check.label}</div>
                {!check.pass && check.detail && (
                  <div style={{ fontSize: 11, color: C.error, fontFamily: F, marginTop: 3 }}>
                    {check.detail}
                    {check.goStep && (
                      <button
                        type="button"
                        onClick={() => onGoStep(check.goStep)}
                        style={{ marginLeft: 6, fontSize: 11, color: C.primary, background: "none", border: "none", cursor: "pointer", fontFamily: F, padding: 0, textDecoration: "underline" }}
                        onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                        onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                      >
                        Go to Step {check.goStep}
                      </button>
                    )}
                  </div>
                )}
                {!check.pass && check.extraDetails?.map((d, i) => (
                  <div key={i} style={{ fontSize: 11, color: C.error, fontFamily: F, marginTop: 2 }}>{d}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Soft checks / warnings */}
        {soft.length > 0 && (
          <div style={{ background: C.bgSurface, borderRadius: 10, border: `1px solid ${C.borderSubtle}`, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "10px 16px", background: C.bgApp, borderBottom: `1px solid ${C.borderSubtle}` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.navyDeep, fontFamily: F }}>Recommendations</span>
            </div>
            {soft.map(check => (
              <div key={check.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.borderSubtle}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <WarnIcon />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.warning, fontFamily: F }}>{check.label}</div>
                  <div style={{ fontSize: 11, color: C.textSec, fontFamily: F, marginTop: 3 }}>
                    {check.detail}
                    {check.goStep && (
                      <button
                        type="button"
                        onClick={() => onGoStep(check.goStep)}
                        style={{ marginLeft: 6, fontSize: 11, color: C.primary, background: "none", border: "none", cursor: "pointer", fontFamily: F, padding: 0, textDecoration: "underline" }}
                        onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                        onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                      >
                        Go to Step {check.goStep}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All-pass banner */}
        {canPublish && (
          <div style={{ background: C.successBg, border: `1px solid #6ee7b7`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" fill={C.successBg}/>
              <polyline points="8 12 11 15 16 9"/>
            </svg>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.success, fontFamily: F }}>All required checks pass</div>
              <div style={{ fontSize: 11, color: C.textSec, fontFamily: F, marginTop: 2 }}>This template is ready to publish.</div>
            </div>
          </div>
        )}

        {/* Publish button */}
        <button
          type="button"
          disabled={!canPublish}
          onClick={canPublish ? onPublish : undefined}
          aria-disabled={!canPublish}
          style={{
            width: "100%", padding: "11px 0", borderRadius: 8, border: "none",
            background: canPublish ? C.primary : C.borderDef,
            color: canPublish ? "#fff" : C.textMuted,
            fontSize: 14, fontFamily: F, fontWeight: 700,
            cursor: canPublish ? "pointer" : "not-allowed",
            outline: "none", transition: "background 0.15s",
          }}
          onFocus={e => { if (canPublish) e.currentTarget.style.boxShadow = FOCUS_RING; }}
          onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          onMouseEnter={e => { if (canPublish) e.currentTarget.style.background = C.primaryHover; }}
          onMouseLeave={e => { if (canPublish) e.currentTarget.style.background = C.primary; }}
        >
          Publish template
        </button>
        {!canPublish && (
          <p style={{ textAlign: "center", fontSize: 11, color: C.textMuted, fontFamily: F, marginTop: 8 }}>
            Resolve all required checks above to enable publishing.
          </p>
        )}

        {/* Lifecycle controls (non-draft states) */}
        <LifecycleControls
          status={status}
          canPublish={canPublish}
          onDispatch={dispatch}
          onPublish={onPublish}
        />
      </div>

      {/* ── Right: summary card */}
      <div style={{ background: C.bgSurface, borderRadius: 10, border: `1px solid ${C.borderSubtle}`, padding: "16px 18px", overflowY: "auto", maxHeight: "calc(100vh - 220px)", position: "sticky", top: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.navyDeep, fontFamily: F, marginBottom: 16 }}>Template summary</div>

        {/* Basics */}
        <SummarySection title="Basics" step={1} onEdit={() => onGoStep(1)}>
          <SummaryRow label="Name"       value={basics.name || null} />
          <SummaryRow label="Audit type" value={basics.auditType} />
          <SummaryRow label="Module"     value={basics.module} />
          <SummaryRow label="Frequency"  value={basics.frequency || null} muted={!basics.frequency} />
          {basics.description && (
            <SummaryRow label="Description" value={basics.description.length > 60 ? basics.description.slice(0, 60) + "..." : basics.description} />
          )}
        </SummarySection>

        {/* Structure */}
        <SummarySection title="Structure" step={2} onEdit={() => onGoStep(2)}>
          <SummaryRow label="Sections"  value={sections.length || "0"} />
          <SummaryRow label="Questions" value={allQs.length || "0"} />
          {typeBreak.length > 0 && typeBreak.map(([type, count]) => (
            <SummaryRow key={type} label={type} value={`${count} question${count !== 1 ? "s" : ""}`} muted />
          ))}
        </SummarySection>

        {/* Scoring */}
        <SummarySection title="Scoring" step={3} onEdit={() => onGoStep(3)}>
          <SummaryRow label="Model" value={SCORING_LABEL[scoring.model] || scoring.model} />
          {scoring.model === "points" && maxPts !== null && (
            <SummaryRow label="Max achievable" value={`${maxPts} points`} />
          )}
          {scoring.model === "weighted" && sections.length > 0 && (
            <SummaryRow
              label="Weight coverage"
              value={`${sections.filter(s => {
                const t = s.questions.filter(q => !conditionalIds.has(q.id))
                  .reduce((sum, q) => sum + (parseFloat((scoring.perQuestion[q.id] || defaultScoringForQuestion(q, "weighted")).weight) || 0), 0);
                return Math.abs(t - 100) < 0.01;
              }).length} / ${sections.length} sections at 100%`}
            />
          )}
        </SummarySection>

        {/* Conditional logic */}
        <SummarySection title="Conditional logic" step={4} onEdit={() => onGoStep(4)}>
          <SummaryRow label="Rules"              value={logic.rules.length || "0"} />
          <SummaryRow label="Conditional questions" value={conditionalIds.size || "0"} />
        </SummarySection>

        {/* Status */}
        <div style={{ marginTop: 4, paddingTop: 12, borderTop: `1px solid ${C.borderSubtle}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: C.textSec, fontFamily: F }}>Status</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "2px 9px", borderRadius: 999,
              background: status === "active" ? C.successBg : status === "archived" || status === "deactivated" ? C.bgApp : C.warningBg,
              color: status === "active" ? C.success : status === "archived" || status === "deactivated" ? C.textMuted : C.warning,
              fontSize: 11, fontWeight: 600, fontFamily: F,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
