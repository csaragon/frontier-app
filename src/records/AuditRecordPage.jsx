import { useState, useMemo } from "react";
import AppSidebar from "../AppSidebar.jsx";
import { getAuditDetail } from "./auditStubData.js";
import { T, F } from "../aegis-tokens.js";

const C = {
  navy:      T.action1,
  navyDeep:  T.onSurface2,
  textSec:   T.onSurface1,
  textMuted: T.disabled1,
  bgApp:     T.surface2,
  bgSurf:    T.surface1,
  border:    T.border1,
  border2:   T.border2,
  primary:   T.actionContainer1,
  primaryBg: T.actionContainer3,
  success:   "#15803d", successBg: "#f0fdf4",
  warning:   T.warning1, warningBg: T.warningContainer1,
  error:     T.onError1, errorBg:   T.errorContainer1,
  info:      T.onInfo1,  infoBg:    T.infoContainer1,
};

const STATUS_META = {
  completed:   { label:"Completed",   color:C.success, bg:C.successBg },
  in_progress: { label:"In Progress", color:C.warning, bg:C.warningBg },
  overdue:     { label:"Overdue",     color:C.error,   bg:C.errorBg   },
  not_started: { label:"Not Started", color:C.textMuted, bg:C.bgApp   },
};
const AP_STATUS = {
  open:        { label:"Open",        color:C.error,   bg:C.errorBg   },
  in_progress: { label:"In Progress", color:C.warning, bg:C.warningBg },
  completed:   { label:"Completed",   color:C.success, bg:C.successBg },
};
const PRIORITY_COLOR = { high:"#b6143a", medium:"#a16207", low:"#15803d" };

function scoreColor(s) {
  if (s == null) return C.textMuted;
  if (s >= 85) return C.success;
  if (s >= 70) return C.warning;
  return C.error;
}

function Pill({ label, color, bg, sm }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center",
      padding: sm ? "2px 7px" : "3px 9px",
      borderRadius:999, background: bg, border:`1px solid ${color}30`,
      fontSize: sm ? 10 : 11, fontWeight:600, color, fontFamily:F, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <div style={{ background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 20px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.navyDeep, fontFamily:F }}>{title}</div>
        {action}
      </div>
      <div style={{ padding:20 }}>{children}</div>
    </div>
  );
}

function TypeIcon({ type }) {
  const icons = {
    "Yes/No": <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
    "Rating": <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    "Text":   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>,
    "Date":   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    "Number": <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  };
  return <span style={{ color:C.textMuted, display:"flex" }}>{icons[type] || icons["Text"]}</span>;
}

function ResponseDisplay({ q }) {
  if (q.response == null) return <span style={{ fontSize:12, color:C.textMuted, fontFamily:F, fontStyle:"italic" }}>Not answered</span>;
  if (q.type === "Yes/No") {
    const pass = q.response === "Yes";
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:4,
        padding:"2px 8px", borderRadius:4,
        background: pass ? C.successBg : C.errorBg,
        color: pass ? C.success : C.error, fontSize:12, fontWeight:600, fontFamily:F }}>
        {pass
          ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
        {q.response}
      </span>
    );
  }
  if (q.type === "Rating") {
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:2 }}>
        {[1,2,3,4,5].map(i => (
          <svg key={i} width="13" height="13" viewBox="0 0 24 24"
            fill={i <= q.response ? "#f59e0b" : "none"}
            stroke={i <= q.response ? "#f59e0b" : C.border2} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
        <span style={{ fontSize:12, color:C.textSec, fontFamily:F, marginLeft:4 }}>{q.response}/5</span>
      </span>
    );
  }
  return <span style={{ fontSize:12, color:C.textSec, fontFamily:F }}>{q.response}</span>;
}

// ── Reports Charts ─────────────────────────────────────────────────────────────
function HBar({ label, value, max = 100, color, secondary }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:12, color:C.navyDeep, fontFamily:F }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:600, color, fontFamily:F }}>{value}{secondary ? "" : "%"}</span>
      </div>
      <div style={{ height:8, background:C.bgApp, borderRadius:4, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${Math.min(100, (value / max) * 100)}%`, background:color, borderRadius:4, transition:"width 0.3s" }} />
      </div>
    </div>
  );
}

function SimpleLineChart({ points, highlight, color = C.primary }) {
  if (!points.length) return null;
  const W = 400, H = 100, pL = 8, pR = 8, pT = 8, pB = 20;
  const min = Math.min(...points.map(p => p.v)) - 5;
  const max = Math.max(...points.map(p => p.v)) + 5;
  const rng = max - min || 1;
  const cx = (i) => pL + (i / (points.length - 1)) * (W - pL - pR);
  const cy = (v) => pT + ((max - v) / rng) * (H - pT - pB);
  const pts = points.map((p, i) => `${cx(i)},${cy(p.v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display:"block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={cx(i)} cy={cy(p.v)} r={p.highlight ? 5 : 3}
            fill={p.highlight ? color : C.bgSurf} stroke={color}
            strokeWidth={p.highlight ? 2.5 : 1.5} />
          <text x={cx(i)} y={H - 4} textAnchor="middle" fontSize="9" fill={C.textMuted} fontFamily={F}>{p.label}</text>
        </g>
      ))}
      {points.map((p, i) => p.highlight && (
        <text key={`l${i}`} x={cx(i)} y={cy(p.v) - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill={color} fontFamily={F}>{p.v}%</text>
      ))}
    </svg>
  );
}

// ── Reopen Modal ───────────────────────────────────────────────────────────────
function ReopenModal({ onClose, onConfirm }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:C.bgSurf, borderRadius:12, padding:28, width:400, boxShadow:"0 16px 48px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize:16, fontWeight:700, color:C.navyDeep, fontFamily:F, marginBottom:10 }}>Reopen Audit?</div>
        <div style={{ fontSize:13, color:C.textSec, fontFamily:F, lineHeight:1.6, marginBottom:20 }}>
          Reopening will allow the audit to be edited. This action is logged in the audit history and cannot be undone automatically. Continue?
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:12, fontFamily:F, cursor:"pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding:"8px 16px", borderRadius:8, border:"none", background:C.error, color:"white", fontSize:12, fontFamily:F, fontWeight:600, cursor:"pointer" }}>Reopen Audit</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AuditRecordPage({ auditId, onNav, density = "condensed" }) {
  const detail = useMemo(() => getAuditDetail(auditId), [auditId]);
  const [tab,          setTab]          = useState("info");
  const [qFilter,      setQFilter]      = useState("all");
  const [expandedSecs, setExpandedSecs] = useState(new Set(detail?.sections?.map(s => s.id) || []));
  const [newComment,   setNewComment]   = useState("");
  const [comments,     setComments]     = useState(detail?.commentsDetail || []);
  const [showReopen,   setShowReopen]   = useState(false);
  const [kebabOpen,    setKebabOpen]    = useState(false);

  if (!detail) {
    return (
      <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp }}>
        <AppSidebar activeId="audits" onNav={onNav} />
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:C.textMuted, fontSize:14 }}>
          Audit not found.
        </div>
      </div>
    );
  }

  const sm = STATUS_META[detail.status];
  const { sections, actionPlansDetail, escalationsDetail, historyDetail, meta, locationFull, auditorFull, templateFull } = detail;

  const allQuestions = sections.flatMap(s =>
    s.questions.map(q => ({ ...q, sectionName: s.name, sectionId: s.id }))
  );

  const filteredQuestions = allQuestions.filter(q => {
    if (qFilter === "failed")   return q.passed === false;
    if (qFilter === "critical") return q.isCritical;
    if (qFilter === "action")   return actionPlansDetail.some(ap => ap.questionId === q.id);
    if (qFilter === "photos")   return q.photos?.length > 0;
    if (qFilter === "comments") return q.comments?.length > 0;
    return true;
  });

  function toggleSection(id) {
    setExpandedSecs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function submitComment() {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, {
      id: `CMT_new_${Date.now()}`,
      author: "Christina Aragon",
      role: "Program Owner",
      timestamp: "Just now",
      body: newComment.trim(),
    }]);
    setNewComment("");
  }

  const totalEarned = sections.flatMap(s => s.questions).reduce((a, q) => a + (q.scoreEarned || 0), 0);
  const totalMax    = sections.flatMap(s => s.questions).reduce((a, q) => a + q.maxScore, 0);
  const questionCount = allQuestions.length;
  const scoredCount   = allQuestions.filter(q => q.maxScore > 0).length;

  // Stub peer comparison data for Reports tab
  const templateAvg = detail.score ? Math.max(60, detail.score - 8 + Math.round(Math.sin(parseInt(auditId.slice(1))) * 6)) : null;
  const locationHistory = detail.score ? [
    { label:"Nov", v: Math.max(55, detail.score - 18) },
    { label:"Dec", v: Math.max(55, detail.score - 14) },
    { label:"Jan", v: Math.max(55, detail.score - 9)  },
    { label:"Feb", v: Math.max(55, detail.score - 5)  },
    { label:"Mar", v: Math.max(55, detail.score - 2)  },
    { label:"Apr", v: detail.score, highlight: true    },
  ] : [];
  const avgTime = 145; // minutes, stub

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp, overflow:"hidden" }}>
      <AppSidebar activeId="audits" onNav={onNav} />

      {showReopen && (
        <ReopenModal
          onClose={() => setShowReopen(false)}
          onConfirm={() => { alert("Audit reopened. (Stub — no editing flow in prototype.)"); setShowReopen(false); }} />
      )}

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        {/* ── Header ── */}
        <div style={{ background:C.bgSurf, borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
          {/* Back + title row */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 24px 0" }}>
            <button onClick={() => onNav("audits")}
              style={{ display:"flex", alignItems:"center", gap:4, color:C.primary, background:"none", border:"none",
                cursor:"pointer", fontSize:12, fontFamily:F, padding:"4px 0" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              All Audits
            </button>
          </div>

          <div style={{ padding:"8px 24px 0", display:"flex", alignItems:"flex-start", gap:16 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:20, fontWeight:800, color:C.navyDeep, fontFamily:F, marginBottom:2,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{detail.name}</div>
              <div style={{ fontSize:12, color:C.textMuted, fontFamily:F, marginBottom:8 }}>
                {detail.templateFull?.name} · {detail.templateFull?.version}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <button onClick={() => onNav("location_record", { locationId: detail.lId, locationName: detail.location, fromAudit: detail.id })}
                  style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", color:C.primary, fontSize:12, fontFamily:F, padding:0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {detail.location}
                </button>
                <span style={{ color:C.border2, fontSize:12 }}>·</span>
                <button onClick={() => onNav("employee_record", { employeeId: detail.eId, employeeName: detail.auditor, fromAudit: detail.id })}
                  style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", color:C.primary, fontSize:12, fontFamily:F, padding:0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {detail.auditor}
                </button>
                {detail.status === "completed" && (
                  <>
                    <span style={{ color:C.border2, fontSize:12 }}>·</span>
                    <span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>{meta.submittedAt}</span>
                  </>
                )}
              </div>
            </div>

            {/* Score + status + actions */}
            <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
              {detail.score != null && (
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:32, fontWeight:900, color:scoreColor(detail.score), fontFamily:F, lineHeight:1 }}>
                    {detail.score}%
                  </div>
                  <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginTop:2 }}>Score</div>
                </div>
              )}
              {detail.cf > 0 && (
                <div style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px",
                  background:C.errorBg, borderRadius:6, border:`1px solid ${C.error}30` }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.error} strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span style={{ fontSize:12, fontWeight:700, color:C.error, fontFamily:F }}>{detail.cf} critical fail{detail.cf > 1 ? "s" : ""}</span>
                </div>
              )}
              <Pill label={sm.label} color={sm.color} bg={sm.bg} />
              <button onClick={() => alert("PDF export coming soon.")}
                style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${C.border}`, background:C.bgSurf,
                  color:C.navyDeep, fontSize:12, fontFamily:F, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export PDF
              </button>
              <div style={{ position:"relative" }}>
                <button onClick={() => setKebabOpen(o => !o)}
                  style={{ width:32, height:32, borderRadius:8, border:`1px solid ${C.border}`, background:C.bgSurf,
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.textMuted }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                </button>
                {kebabOpen && (
                  <div style={{ position:"absolute", right:0, top:"calc(100% + 4px)", zIndex:400, background:C.bgSurf,
                    border:`1px solid ${C.border}`, borderRadius:8, boxShadow:"0 4px 16px rgba(0,0,0,0.1)", minWidth:160, overflow:"hidden" }}>
                    {[["Reopen Audit", () => { setShowReopen(true); setKebabOpen(false); }],
                      ["Add Comment", () => { setKebabOpen(false); document.getElementById("comment-input")?.focus(); }],
                    ].map(([label, fn]) => (
                      <button key={label} onClick={fn}
                        style={{ display:"block", width:"100%", padding:"8px 14px", textAlign:"left",
                          border:"none", background:"transparent", color:C.navyDeep, fontSize:12, fontFamily:F, cursor:"pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = C.bgApp}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab nav */}
          <div style={{ display:"flex", gap:0, padding:"12px 24px 0", marginTop:4 }}>
            {[["info","Info Card"], ["reports","Reports"]].map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)}
                style={{ padding:"8px 18px", border:"none", borderBottom:`2px solid ${tab === k ? C.primary : "transparent"}`,
                  background:"transparent", color: tab === k ? C.primary : C.textSec, fontSize:13, fontFamily:F,
                  fontWeight: tab === k ? 700 : 400, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                {label}
                {k === "reports" && (
                  <span style={{ fontSize:10, fontWeight:700, background:C.primary, color:"white", padding:"2px 5px", borderRadius:4 }}>Insights</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
          {tab === "info" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* ── Section 1: Audit Summary ── */}
              <SectionCard title="Audit Summary">
                {/* KPI row */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12, marginBottom:20 }}>
                  {[
                    { label:"Score", value: detail.score != null ? `${detail.score}%` : "—", color: scoreColor(detail.score) },
                    { label:"Pass/Fail", value: detail.score != null ? (detail.score >= (meta.passFailThreshold || 75) ? "PASS" : "FAIL") : "—",
                      color: detail.score != null ? (detail.score >= 75 ? C.success : C.error) : C.textMuted },
                    { label:"Sections", value: sections.length },
                    { label:"Questions", value: questionCount },
                    { label:"Critical Fails", value: detail.cf, color: detail.cf > 0 ? C.error : C.success },
                    { label:"Action Plans", value: actionPlansDetail.length, color: actionPlansDetail.length > 0 ? C.warning : C.textSec },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background:C.bgApp, borderRadius:8, padding:"12px 14px", textAlign:"center" }}>
                      <div style={{ fontSize:22, fontWeight:800, color: color || C.navyDeep, fontFamily:F, lineHeight:1, marginBottom:4 }}>{value}</div>
                      <div style={{ fontSize:10, fontWeight:600, color:C.textMuted, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Metadata grid */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
                  {[
                    { label:"Template", value:`${detail.templateFull?.name} ${detail.templateFull?.version}` },
                    { label:"Program",  value: detail.program },
                    { label:"Location", value: detail.location },
                    { label:"Auditor",  value: detail.auditor  },
                    { label:"Started",  value: meta.startedAt  },
                    { label:"Submitted",value: meta.submittedAt || "In progress" },
                    { label:"Duration", value: meta.timeToComplete || "—" },
                    { label:"Schedule", value: detail.schedule  },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:3 }}>{label}</div>
                      <div style={{ fontSize:12, color:C.navyDeep, fontFamily:F, fontWeight:500 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* ── Section 2: Score Breakdown ── */}
              <SectionCard title="Score Breakdown by Section">
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {sections.map(sec => {
                    const pct = sec.maxScore > 0 && sec.score != null ? Math.round((sec.score / sec.maxScore) * 100) : null;
                    const col = pct != null ? scoreColor(pct) : C.textMuted;
                    return (
                      <div key={sec.id}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                              <span style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F }}>{sec.name}</span>
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                {sec.weight && (
                                  <span style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>Weight: {sec.weight}%</span>
                                )}
                                <span style={{ fontSize:13, fontWeight:700, color: col, fontFamily:F }}>
                                  {pct != null ? `${sec.score}/${sec.maxScore} pts (${pct}%)` : "Not completed"}
                                </span>
                              </div>
                            </div>
                            <div style={{ height:8, background:C.bgApp, borderRadius:4, overflow:"hidden" }}>
                              <div style={{ height:"100%", width: pct != null ? `${pct}%` : "0%",
                                background: col, borderRadius:4, transition:"width 0.4s" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {detail.score != null && (
                    <div style={{ paddingTop:12, borderTop:`1px solid ${C.border}`,
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F }}>Overall Score</span>
                      <span style={{ fontSize:14, fontWeight:800, color:scoreColor(detail.score), fontFamily:F }}>
                        {detail.score}% ({totalEarned}/{totalMax} pts)
                      </span>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* ── Section 3: Question Responses ── */}
              <div style={{ background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"14px 20px", borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.navyDeep, fontFamily:F }}>Question Responses</div>
                  <div style={{ display:"flex", gap:4 }}>
                    {[["all","All"], ["failed","Failed"], ["critical","Critical"], ["action","Has Action"], ["photos","Has Photos"]].map(([k, label]) => (
                      <button key={k} onClick={() => setQFilter(k)}
                        style={{ padding:"4px 10px", borderRadius:4, border:`1px solid ${qFilter === k ? C.primary : C.border}`,
                          background: qFilter === k ? C.primaryBg : "transparent", color: qFilter === k ? C.primary : C.textSec,
                          fontSize:12, fontFamily:F, fontWeight: qFilter === k ? 600 : 400, cursor:"pointer" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  {sections.map(sec => {
                    const secQs = filteredQuestions.filter(q => q.sectionId === sec.id);
                    if (secQs.length === 0 && qFilter !== "all") return null;
                    const expanded = expandedSecs.has(sec.id);
                    return (
                      <div key={sec.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                        {/* Section header row */}
                        <button onClick={() => toggleSection(sec.id)}
                          style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"10px 20px",
                            background: expanded ? C.bgApp : "transparent", border:"none", cursor:"pointer", textAlign:"left" }}
                          onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = "#fafafa"; }}
                          onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = "transparent"; }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2.5"
                            style={{ transform: expanded ? "rotate(90deg)" : "rotate(0)", transition:"transform 0.15s" }}>
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                          <span style={{ fontSize:12, fontWeight:700, color:C.navyDeep, fontFamily:F, flex:1 }}>{sec.name}</span>
                          <span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>
                            {sec.questions.length} question{sec.questions.length > 1 ? "s" : ""}
                            {sec.score != null && ` · ${Math.round((sec.score / sec.maxScore) * 100)}%`}
                          </span>
                        </button>

                        {expanded && (
                          <div style={{ padding:"0 20px 12px" }}>
                            {(qFilter === "all" ? sec.questions : secQs).map((q, qi) => {
                              const hasAP = actionPlansDetail.some(ap => ap.questionId === q.id);
                              const hasEsc = escalationsDetail.length > 0 && q.isCritical && q.passed === false;
                              return (
                                <div key={q.id} style={{ padding:"10px 0", borderTop: qi > 0 ? `1px solid ${C.border}` : "none",
                                  display:"flex", gap:12, alignItems:"flex-start" }}>
                                  {/* Q number + type */}
                                  <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:4, paddingTop:2 }}>
                                    <div style={{ width:22, height:22, borderRadius:"50%", background:C.bgApp,
                                      display:"flex", alignItems:"center", justifyContent:"center",
                                      fontSize:10, fontWeight:700, color:C.textMuted, fontFamily:F }}>{q.num}</div>
                                    <TypeIcon type={q.type} />
                                  </div>

                                  {/* Question content */}
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:5 }}>
                                      <span style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F }}>{q.title}</span>
                                      {q.isCritical && (
                                        <span style={{ fontSize:10, fontWeight:700, color:C.error, background:C.errorBg,
                                          padding:"1px 5px", borderRadius:4, border:`1px solid ${C.error}30` }}>CRITICAL</span>
                                      )}
                                    </div>

                                    <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                                      <ResponseDisplay q={q} />
                                      {q.maxScore > 0 && q.scoreEarned != null && (
                                        <span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>
                                          {q.scoreEarned}/{q.maxScore} pts
                                        </span>
                                      )}
                                      {hasAP && (
                                        <span style={{ fontSize:10, fontWeight:600, color:C.warning, background:C.warningBg,
                                          padding:"2px 6px", borderRadius:4, display:"flex", alignItems:"center", gap:3 }}>
                                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                                          Action plan
                                        </span>
                                      )}
                                      {hasEsc && (
                                        <span style={{ fontSize:10, fontWeight:600, color:C.error, background:C.errorBg,
                                          padding:"2px 6px", borderRadius:4, display:"flex", alignItems:"center", gap:3 }}>
                                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                                          Escalation
                                        </span>
                                      )}
                                      {q.photos?.length > 0 && (
                                        <span style={{ fontSize:10, color:C.info, fontFamily:F, display:"flex", alignItems:"center", gap:3 }}>
                                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                          {q.photos.length} photo
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Section 4: Action Plans ── */}
              <SectionCard title={`Action Plans Generated (${actionPlansDetail.length})`}>
                {actionPlansDetail.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"20px 0", color:C.textMuted, fontSize:13, fontFamily:F }}>
                    No action plans generated for this audit.
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                    {/* Header */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 130px 120px 90px 70px",
                      gap:10, padding:"6px 0", borderBottom:`1px solid ${C.border}`,
                      fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase",
                      letterSpacing:"0.04em", fontFamily:F }}>
                      {["Title / Question", "Assigned To", "Due Date", "Status", "Priority"].map(h => <div key={h}>{h}</div>)}
                    </div>
                    {actionPlansDetail.map(ap => (
                      <div key={ap.id} style={{ display:"grid", gridTemplateColumns:"1fr 130px 120px 90px 70px",
                        gap:10, padding:"10px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F, marginBottom:2 }}>{ap.title}</div>
                          <div style={{ fontSize:12, color:C.textMuted, fontFamily:F, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            From: {ap.sectionName}
                          </div>
                        </div>
                        <div style={{ fontSize:12, color:C.navyDeep, fontFamily:F }}>{ap.assignedTo}</div>
                        <div style={{ fontSize:12, color:C.textSec, fontFamily:F }}>{ap.dueDate}</div>
                        <div>
                          <Pill label={AP_STATUS[ap.status]?.label || ap.status} color={AP_STATUS[ap.status]?.color || C.textMuted} bg={AP_STATUS[ap.status]?.bg || C.bgApp} sm />
                        </div>
                        <div style={{ fontSize:12, fontWeight:700, color:PRIORITY_COLOR[ap.priority] || C.textMuted, fontFamily:F, textTransform:"capitalize" }}>
                          {ap.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* ── Section 5: Escalations ── */}
              <SectionCard title={`Escalations Fired (${escalationsDetail.length})`}>
                {escalationsDetail.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"20px 0", color:C.textMuted, fontSize:13, fontFamily:F }}>
                    No escalations fired for this audit.
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {escalationsDetail.map(esc => (
                      <div key={esc.id} style={{ padding:12, background:C.bgApp, borderRadius:8, display:"flex", gap:12, alignItems:"flex-start" }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:C.errorBg,
                          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.error} strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F, marginBottom:3 }}>{esc.trigger}</div>
                          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                            {[["To", `${esc.recipient} (${esc.role})`], ["Via", esc.channel], ["Sent", esc.sentAt]].map(([k, v]) => (
                              <span key={k} style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>
                                <span style={{ fontWeight:600, color:C.textSec }}>{k}:</span> {v}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Pill label={esc.status} color={C.success} bg={C.successBg} sm />
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* ── Section 6: Comments ── */}
              <SectionCard title="Comments">
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {comments.map(c => (
                    <div key={c.id} style={{ display:"flex", gap:10 }}>
                      <div style={{ width:30, height:30, borderRadius:"50%", background:C.primary,
                        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:"white", fontFamily:F }}>
                          {c.author.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </span>
                      </div>
                      <div style={{ flex:1, background:C.bgApp, borderRadius:8, padding:"10px 12px" }}>
                        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                          <span style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F }}>{c.author}</span>
                          <span style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>{c.role}</span>
                          <span style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginLeft:"auto" }}>{c.timestamp}</span>
                        </div>
                        <div style={{ fontSize:12, color:C.textSec, fontFamily:F, lineHeight:1.5 }}>{c.body}</div>
                      </div>
                    </div>
                  ))}

                  {/* New comment input */}
                  <div style={{ display:"flex", gap:10 }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:"#e8ecf8",
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:C.navy, fontFamily:F }}>CA</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <textarea id="comment-input" value={newComment} onChange={e => setNewComment(e.target.value)}
                        placeholder="Add a comment…"
                        rows={2}
                        style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:`1px solid ${C.border}`,
                          fontSize:12, fontFamily:F, color:C.navyDeep, resize:"none", outline:"none",
                          boxSizing:"border-box" }}
                        onFocus={e => e.target.style.borderColor = C.primary}
                        onBlur={e => e.target.style.borderColor = C.border} />
                      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:6 }}>
                        <button onClick={submitComment}
                          style={{ padding:"6px 14px", borderRadius:6, border:"none", background:C.primary,
                            color:"white", fontSize:12, fontFamily:F, fontWeight:600, cursor:"pointer" }}>
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* ── Section 7: Audit History ── */}
              <SectionCard title="Audit History">
                <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                  {historyDetail.map((ev, i) => (
                    <div key={i} style={{ display:"flex", gap:12, paddingBottom:12,
                      paddingTop: i > 0 ? 12 : 0, borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:C.border2, marginTop:5, flexShrink:0 }} />
                      <div>
                        <div style={{ fontSize:12, color:C.navyDeep, fontFamily:F, fontWeight:500, marginBottom:2 }}>{ev.event}</div>
                        <div style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>
                          {ev.timestamp} · {ev.actor}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {tab === "reports" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {detail.score == null ? (
                <div style={{ background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:12,
                  padding:48, textAlign:"center" }}>
                  <div style={{ fontSize:14, color:C.textMuted, fontFamily:F }}>
                    Reports are available once the audit is completed.
                  </div>
                </div>
              ) : (
                <>
                  {/* Score vs Template Average */}
                  <SectionCard title="Score vs. Template Average">
                    <div style={{ marginBottom:8 }}>
                      <HBar label={`This audit (${detail.name.slice(0, 40)}…)`} value={detail.score} color={scoreColor(detail.score)} />
                      <HBar label={`Template average (${detail.templateFull?.name} ${detail.templateFull?.version})`} value={templateAvg} color={C.info} />
                    </div>
                    <div style={{ fontSize:12, color:C.textMuted, fontFamily:F, marginTop:8 }}>
                      This audit scored {detail.score > templateAvg ? `${detail.score - templateAvg}% above` : `${templateAvg - detail.score}% below`} the template average across all locations.
                    </div>
                  </SectionCard>

                  {/* Score vs Location History */}
                  <SectionCard title="Score vs. Location History">
                    <div style={{ marginBottom:8 }}>
                      <SimpleLineChart points={locationHistory} color={C.primary} />
                    </div>
                    <div style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>
                      Score trend at {detail.location} for {detail.templateFull?.name} over the past 6 audit cycles.
                    </div>
                  </SectionCard>

                  {/* Question Pass Rate Comparison */}
                  <SectionCard title="Question Pass Rate vs. Peer Audits">
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      {allQuestions.filter(q => q.maxScore > 0).slice(0, 8).map(q => {
                        const peerRate = 70 + Math.round(Math.abs(Math.sin(q.id.charCodeAt(1))) * 25);
                        const thisResult = q.passed === true ? 100 : q.passed === false ? 0 : null;
                        return (
                          <div key={q.id} style={{ marginBottom:8 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                              <span style={{ fontSize:12, color:C.navyDeep, fontFamily:F, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"70%" }}>
                                Q{q.num}: {q.title.slice(0, 55)}{q.title.length > 55 ? "…" : ""}
                              </span>
                              <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
                                {thisResult != null && (
                                  <span style={{ fontSize:10, fontWeight:700, color: thisResult === 100 ? C.success : C.error, fontFamily:F }}>
                                    {thisResult === 100 ? "✓ Pass" : "✗ Fail"}
                                  </span>
                                )}
                                <span style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>{peerRate}% peer pass rate</span>
                              </div>
                            </div>
                            <div style={{ display:"flex", gap:4 }}>
                              <div style={{ flex:1, height:5, background:C.bgApp, borderRadius:4, overflow:"hidden" }}>
                                <div style={{ height:"100%", width:`${peerRate}%`, background:C.info, opacity:0.5, borderRadius:4 }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize:12, color:C.textMuted, fontFamily:F, marginTop:4 }}>
                      Comparison based on {detail.templateFull?.name} audits across all locations in the past 90 days.
                    </div>
                  </SectionCard>

                  {/* Time to Complete vs Average */}
                  <SectionCard title="Time to Complete vs. Average">
                    <div style={{ display:"flex", gap:24, alignItems:"flex-end", marginBottom:12 }}>
                      {[
                        { label:"This audit", minutes: meta.timeToComplete ? parseInt(meta.timeToComplete) || 153 : 153, color:C.primary },
                        { label:"Template average", minutes: avgTime, color:C.info },
                      ].map(({ label, minutes, color }) => {
                        const hrs = Math.floor(minutes / 60);
                        const mins = minutes % 60;
                        const pct = Math.min(100, (minutes / (avgTime * 1.5)) * 100);
                        return (
                          <div key={label} style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:700, color, fontFamily:F, marginBottom:4 }}>
                              {hrs > 0 ? `${hrs}h ` : ""}{mins}min
                            </div>
                            <div style={{ fontSize:12, color:C.textMuted, fontFamily:F, marginBottom:6 }}>{label}</div>
                            <div style={{ height:10, background:C.bgApp, borderRadius:4, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:4 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>
                      This audit {(meta.timeToComplete ? parseInt(meta.timeToComplete) || 153 : 153) > avgTime ? `took ${(meta.timeToComplete ? parseInt(meta.timeToComplete) || 153 : 153) - avgTime} minutes longer` : `was completed ${avgTime - (meta.timeToComplete ? parseInt(meta.timeToComplete) || 153 : 153)} minutes faster`} than the template average.
                    </div>
                  </SectionCard>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
