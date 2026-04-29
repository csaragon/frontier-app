import { useState, useMemo } from "react";
import AppSidebar from "../AppSidebar.jsx";
import { getEmployeeDetail, EMPLOYEES_25, AVATAR_COLORS } from "./employeeStubData.js";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy:"#001e76", navyDeep:"#16191d", textSec:"#555f6d", textMuted:"#8692a2",
  bgApp:"#f4f4f6", bgSurf:"#ffffff", border:"#e2e5e9", border2:"#c3c8d0",
  primary:"#2226f7", primaryBg:"#f0f2ff",
  success:"#15803d", successBg:"#f0fdf4",
  warning:"#a16207", warningBg:"#fef9c3",
  error:"#dc2626",   errorBg:"#fef2f2",
  info:"#0369a1",    infoBg:"#f0f9ff",
};

const AUDIT_STATUS_META = {
  completed:   { label:"Completed",   color:C.success, bg:C.successBg },
  in_progress: { label:"In Progress", color:C.warning, bg:C.warningBg },
  overdue:     { label:"Overdue",     color:C.error,   bg:C.errorBg   },
  not_started: { label:"Not Started", color:C.textMuted, bg:C.bgApp   },
};
const AP_STATUS_META = {
  open:        { label:"Open",        color:C.error,   bg:C.errorBg   },
  in_progress: { label:"In Progress", color:C.warning, bg:C.warningBg },
  completed:   { label:"Completed",   color:C.success, bg:C.successBg },
  overdue:     { label:"Overdue",     color:C.error,   bg:C.errorBg   },
};
const PRIORITY_COLOR = { high:C.error, medium:C.warning, low:C.success };

const VIEWER_ROLES = ["Program Owner","Regional Manager","District Manager","Store Manager","Employee"];

function Avatar({ emp, size = 40 }) {
  const col = AVATAR_COLORS[parseInt((emp.id || "E0").slice(1)) % AVATAR_COLORS.length];
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:col, flexShrink:0,
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:size*0.35, fontWeight:700, color:"white", fontFamily:F }}>{emp.initials}</span>
    </div>
  );
}

function Pill({ label, color, bg, sm }) {
  return (
    <span style={{ display:"inline-flex", padding: sm ? "2px 7px" : "3px 9px",
      borderRadius:999, background: bg, border:`1px solid ${color}30`,
      fontSize: sm ? 10 : 11, fontWeight:600, color, fontFamily:F, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <div style={{ background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"13px 20px", borderBottom:`1px solid ${C.border}` }}>
        <span style={{ fontSize:13, fontWeight:700, color:C.navyDeep, fontFamily:F }}>{title}</span>
        {action}
      </div>
      <div style={{ padding:20 }}>{children}</div>
    </div>
  );
}

// ── Inline edit field ──────────────────────────────────────────────────────────
function EditableField({ label, value, fieldKey, canEdit, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const [hovered, setHovered] = useState(false);

  function save() { onSave(fieldKey, draft); setEditing(false); }
  function cancel() { setDraft(value); setEditing(false); }

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase",
        letterSpacing:"0.04em", fontFamily:F, marginBottom:3 }}>{label}</div>
      {editing ? (
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <input value={draft} onChange={e => setDraft(e.target.value)} autoFocus
            style={{ padding:"4px 8px", borderRadius:5, border:`1.5px solid ${C.primary}`,
              fontSize:12, fontFamily:F, color:C.navyDeep, outline:"none", flex:1 }} />
          <button onClick={save}   style={{ padding:"3px 8px", borderRadius:4, border:"none", background:C.primary, color:"white", fontSize:11, fontFamily:F, cursor:"pointer" }}>Save</button>
          <button onClick={cancel} style={{ padding:"3px 8px", borderRadius:4, border:`1px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:11, fontFamily:F, cursor:"pointer" }}>✕</button>
        </div>
      ) : (
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:12, color: value ? C.navyDeep : C.textMuted, fontFamily:F, fontWeight:500 }}>
            {value || "—"}
          </span>
          {canEdit && hovered && (
            <button onClick={() => { setDraft(value || ""); setEditing(true); }}
              style={{ width:18, height:18, borderRadius:3, border:`1px solid ${C.border}`, background:C.bgApp,
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                color:C.textMuted, padding:0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Simple SVG line chart ──────────────────────────────────────────────────────
function TrendChart({ data, color = C.primary, target, label }) {
  if (!data || data.length < 2) return (
    <div style={{ height:80, display:"flex", alignItems:"center", justifyContent:"center", color:C.textMuted, fontSize:12, fontFamily:F }}>
      Not enough data to display trend.
    </div>
  );
  const W = 500, H = 80, pL = 28, pR = 8, pT = 8, pB = 20;
  const vals = data.map(d => d.v);
  const mn = Math.min(...vals, target ?? 999) - 5;
  const mx = Math.max(...vals, target ?? 0) + 5;
  const rng = mx - mn || 1;
  const cx = i => pL + (i / (data.length - 1)) * (W - pL - pR);
  const cy = v => pT + ((mx - v) / rng) * (H - pT - pB);
  const pts = data.map((d,i) => `${cx(i)},${cy(d.v)}`).join(" ");
  const tpts = target ? `${pL},${cy(target)} ${W-pR},${cy(target)}` : null;
  const [hov, setHov] = useState(null);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display:"block" }} onMouseLeave={() => setHov(null)}>
      {[mn+5, mn+15, mn+25].filter(v => v <= mx).map(v => (
        <g key={v}>
          <line x1={pL} y1={cy(v)} x2={W-pR} y2={cy(v)} stroke={C.border} strokeWidth="1" />
          <text x={pL-3} y={cy(v)+3} textAnchor="end" fontSize="8" fill={C.textMuted} fontFamily={F}>{v}%</text>
        </g>
      ))}
      {tpts && <polyline points={tpts} fill="none" stroke={C.textMuted} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d,i) => (
        <g key={i}>
          <circle cx={cx(i)} cy={cy(d.v)} r={hov===i?5:3} fill={hov===i?color:C.bgSurf} stroke={color} strokeWidth="2" />
          <rect x={cx(i)-16} y={pT} width={32} height={H-pT-pB} fill="transparent" onMouseEnter={() => setHov(i)} style={{ cursor:"crosshair" }} />
          {hov===i && (
            <g>
              <rect x={cx(i)-22} y={cy(d.v)-22} width={44} height={18} rx="4" fill="#0f172a" fillOpacity="0.9" />
              <text x={cx(i)} y={cy(d.v)-10} textAnchor="middle" fontSize="10" fontWeight="700" fill="white" fontFamily={F}>{d.v}%</text>
            </g>
          )}
        </g>
      ))}
      {data.map((d,i) => i % 2 === 0 && (
        <text key={`l${i}`} x={cx(i)} y={H-3} textAnchor="middle" fontSize="9" fill={C.textMuted} fontFamily={F}>{d.label}</text>
      ))}
    </svg>
  );
}

// ── Bar chart for AP resolution ────────────────────────────────────────────────
function ApBarChart({ data }) {
  const maxVal = Math.max(...data.flatMap(d => [d.completed, d.overdue]), 1);
  const BH = 80, BAR_W = 16, GAP = 40;
  const W = data.length * (BAR_W * 2 + GAP) + 20;
  return (
    <svg viewBox={`0 0 ${W} ${BH + 20}`} width="100%" height={BH + 20} style={{ display:"block" }}>
      {data.map((d, i) => {
        const x = 10 + i * (BAR_W * 2 + GAP);
        const ch = (v) => BH - Math.round((v / maxVal) * BH);
        return (
          <g key={i}>
            <rect x={x} y={ch(d.completed)} width={BAR_W} height={BH - ch(d.completed)} fill={C.success} opacity="0.8" rx="2" />
            <rect x={x + BAR_W + 2} y={ch(d.overdue)} width={BAR_W} height={BH - ch(d.overdue)} fill={C.error} opacity={d.overdue > 0 ? 0.8 : 0.2} rx="2" />
            <text x={x + BAR_W} y={BH + 14} textAnchor="middle" fontSize="9" fill={C.textMuted} fontFamily={F}>{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Score histogram ────────────────────────────────────────────────────────────
function ScoreHistogram({ data }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:80 }}>
      {data.map(d => (
        <div key={d.label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <div style={{ fontSize:10, fontWeight:600, color:C.textSec, fontFamily:F }}>{d.count || ""}</div>
          <div style={{ width:"100%", background: d.count > 0 ? C.primary : C.bgApp,
            borderRadius:"3px 3px 0 0", opacity: d.count > 0 ? 0.7 + (d.count/maxCount)*0.3 : 1,
            height: `${Math.max(4, (d.count / maxCount) * 60)}px` }} />
          <div style={{ fontSize:9, color:C.textMuted, fontFamily:F, textAlign:"center", lineHeight:1.2 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Timeline event icon ────────────────────────────────────────────────────────
function TimelineIcon({ type }) {
  const icons = {
    audit_assigned:      { icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, color:C.info, bg:C.infoBg },
    audit_started:       { icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>, color:C.warning, bg:C.warningBg },
    audit_completed:     { icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>, color:C.success, bg:C.successBg },
    action_plan_assigned:{ icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, color:C.primary, bg:C.primaryBg },
    action_plan_completed:{ icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>, color:C.success, bg:C.successBg },
    action_plan_overdue: { icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>, color:C.error, bg:C.errorBg },
    role_changed:        { icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, color:"#7c3aed", bg:"#f5f3ff" },
    hired:               { icon:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, color:C.success, bg:C.successBg },
  };
  const d = icons[type] || icons.hired;
  return (
    <div style={{ width:26, height:26, borderRadius:"50%", background:d.bg, flexShrink:0,
      display:"flex", alignItems:"center", justifyContent:"center", color:d.color }}>
      {d.icon}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function EmployeeRecordPage({ employeeId, onNav, fromList = true }) {
  const rawDetail = useMemo(() => getEmployeeDetail(employeeId), [employeeId]);
  const [tab,          setTab]          = useState("info");
  const [viewerRole,   setViewerRole]   = useState("Program Owner");
  const [tlFilter,     setTlFilter]     = useState("all");
  const [apFilter,     setApFilter]     = useState("all");
  const [auditFilter,  setAuditFilter]  = useState("all");
  const [selectedReport, setSelectedReport] = useState("trend");
  const [reportRange,  setReportRange]  = useState("Last quarter");
  const [trendMetric,  setTrendMetric]  = useState("completion");
  const [localEmp,     setLocalEmp]     = useState(null); // local overrides for inline edits
  const [kebabOpen,    setKebabOpen]    = useState(false);
  const [tlShowing,    setTlShowing]    = useState(15);

  if (!rawDetail) {
    return (
      <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp }}>
        <AppSidebar activeId="employees" onNav={onNav} />
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:C.textMuted, fontSize:14 }}>
          Employee not found.
        </div>
      </div>
    );
  }

  const detail = localEmp ? { ...rawDetail, ...localEmp } : rawDetail;
  const { locationFull, managerFull, directs, assignedAudits, actionPlans, timeline,
    perfTrend, apResolution, scoreDist, roleAvgCompletion, roleAvgScore } = detail;

  function handleSaveField(field, value) {
    setLocalEmp(prev => ({ ...(prev || {}), [field]: value }));
  }

  function canEdit(field) {
    if (viewerRole === "Program Owner") return true;
    if (viewerRole === "Regional Manager") return ["role","managerId","status"].includes(field);
    if (viewerRole === "District Manager") return ["managerId"].includes(field);
    if (viewerRole === "Employee") return field === "personalPhone";
    return false;
  }

  const isActive = detail.status === "active";

  // Timeline filter
  const filteredTl = timeline.filter(ev => {
    if (tlFilter === "audits")    return ev.type.startsWith("audit");
    if (tlFilter === "plans")     return ev.type.startsWith("action_plan");
    if (tlFilter === "other")     return !ev.type.startsWith("audit") && !ev.type.startsWith("action_plan");
    return true;
  });

  // AP filter
  const filteredAp = actionPlans.filter(ap => apFilter === "all" || ap.status === apFilter);
  // Audit filter
  const filteredAudits = assignedAudits.filter(a => auditFilter === "all" || a.status === auditFilter);

  // Perf chart data
  const chartData = perfTrend.map(d => ({
    label: d.label,
    v: trendMetric === "completion" ? d.completionRate : d.avgScore,
  })).filter(d => d.v > 0);

  const target = trendMetric === "completion" ? 85 : 80;

  const DEFAULT_REPORTS = [
    { id:"trend",      label:"Audit Performance Trend",    desc:"Completion rate & avg score over time" },
    { id:"action",     label:"Action Plan Resolution",     desc:"Completed vs. overdue by month" },
    { id:"peers",      label:"Comparison to Peers",        desc:"This employee vs. role average (anonymized)" },
    { id:"scores",     label:"Score Distribution",         desc:"Histogram of audit scores when auditor" },
  ];

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp, overflow:"hidden" }}>
      <AppSidebar activeId="employees" onNav={onNav} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        {/* ── Header ── */}
        <div style={{ background:C.bgSurf, borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
          {/* Nav row */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 24px 0",
            justifyContent:"space-between" }}>
            <button onClick={() => onNav("employees")}
              style={{ display:"flex", alignItems:"center", gap:4, color:C.primary, background:"none",
                border:"none", cursor:"pointer", fontSize:12, fontFamily:F }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              All Employees
            </button>
            {/* Viewer role */}
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 10px",
              background:C.primaryBg, borderRadius:6, border:`1px solid ${C.primary}30` }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <select value={viewerRole} onChange={e => setViewerRole(e.target.value)}
                style={{ border:"none", background:"transparent", color:C.primary, fontSize:11, fontFamily:F, fontWeight:600, cursor:"pointer", outline:"none" }}>
                {VIEWER_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Employee identity row */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:16, padding:"12px 24px 0" }}>
            <Avatar emp={detail} size={56} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ fontSize:22, fontWeight:800, color:C.navyDeep, fontFamily:F }}>{detail.name}</span>
                <Pill label={isActive ? "Active" : "Inactive"}
                  color={isActive ? C.success : C.textMuted}
                  bg={isActive ? C.successBg : C.bgApp} />
                {detail.isAuditor && (
                  <span style={{ fontSize:10, fontWeight:700, color:C.info, background:C.infoBg,
                    padding:"2px 7px", borderRadius:999, border:`1px solid ${C.info}30` }}>Auditor</span>
                )}
              </div>
              <div style={{ fontSize:13, color:C.textSec, fontFamily:F, marginTop:3 }}>
                {detail.role}
                {locationFull && (
                  <> · <button onClick={() => onNav("location_record", { locationId: detail.lId, locationName: locationFull.name })}
                    style={{ background:"none", border:"none", cursor:"pointer", color:C.primary, fontSize:13, fontFamily:F, padding:0 }}>
                    {locationFull.name}
                  </button></>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              {canEdit("role") && (
                <button style={{ padding:"7px 14px", borderRadius:7, border:`1px solid ${C.border}`,
                  background:C.bgSurf, color:C.navyDeep, fontSize:12, fontFamily:F, cursor:"pointer",
                  display:"flex", alignItems:"center", gap:5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
              )}
              <div style={{ position:"relative" }}>
                <button onClick={() => setKebabOpen(o => !o)}
                  style={{ width:32, height:32, borderRadius:7, border:`1px solid ${C.border}`, background:C.bgSurf,
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.textMuted }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                </button>
                {kebabOpen && (
                  <div style={{ position:"absolute", right:0, top:"calc(100%+4px)", zIndex:400, background:C.bgSurf,
                    border:`1px solid ${C.border}`, borderRadius:8, boxShadow:"0 4px 16px rgba(0,0,0,0.1)",
                    minWidth:160, overflow:"hidden", marginTop:4 }}>
                    {[
                      ["Send message (stub)", () => alert("Messaging coming soon.")],
                      ["Deactivate",          () => alert("Deactivate action stubbed.")],
                      ["Reset login (stub)",  () => alert("Reset login coming soon.")],
                    ].map(([label, fn]) => (
                      <button key={label} onClick={() => { fn(); setKebabOpen(false); }}
                        style={{ display:"block", width:"100%", padding:"8px 14px", textAlign:"left",
                          border:"none", background:"transparent", color: label.includes("Deactivate") ? C.error : C.navyDeep,
                          fontSize:12, fontFamily:F, cursor:"pointer" }}
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
          <div style={{ display:"flex", padding:"10px 24px 0", marginTop:4 }}>
            {[["info","Info Card"],["reports","Reports"]].map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)}
                style={{ padding:"8px 18px", border:"none", borderBottom:`2px solid ${tab===k ? C.primary : "transparent"}`,
                  background:"transparent", color: tab===k ? C.primary : C.textSec, fontSize:13, fontFamily:F,
                  fontWeight: tab===k ? 700 : 400, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                {label}
                {k === "reports" && (
                  <span style={{ fontSize:9, fontWeight:700, background:C.primary, color:"white", padding:"2px 5px", borderRadius:3 }}>Insights</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
          {tab === "info" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* ── Section 1: Profile Basics ── */}
              <SectionCard title="Profile">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
                  {/* Left: Contact */}
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase",
                      letterSpacing:"0.05em", fontFamily:F, marginBottom:12 }}>Contact</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      <EditableField label="Work email" value={detail.email} fieldKey="email" canEdit={canEdit("email")} onSave={handleSaveField} />
                      <EditableField label="Work phone" value={`${detail.phone}${detail.phoneExt ? " " + detail.phoneExt : ""}`} fieldKey="phone" canEdit={false} onSave={handleSaveField} />
                      <EditableField label="Personal phone" value={detail.personalPhone} fieldKey="personalPhone" canEdit={canEdit("personalPhone")} onSave={handleSaveField} />
                      {locationFull && (
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:3 }}>Office address</div>
                          <div style={{ fontSize:12, color:C.navyDeep, fontFamily:F, fontWeight:500 }}>
                            {locationFull.name}, {locationFull.city}, {locationFull.state}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Right: Employment */}
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase",
                      letterSpacing:"0.05em", fontFamily:F, marginBottom:12 }}>Employment</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:3 }}>Employee ID</div>
                        <div style={{ fontSize:12, color:C.navyDeep, fontFamily:F, fontWeight:500, fontVariantNumeric:"tabular-nums" }}>{detail.empId}</div>
                      </div>
                      <EditableField label="Role" value={detail.role} fieldKey="role" canEdit={canEdit("role")} onSave={handleSaveField} />
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:3 }}>Primary location</div>
                        <button onClick={() => onNav("location_record", { locationId: detail.lId, locationName: locationFull?.name })}
                          style={{ background:"none", border:"none", cursor:"pointer", color:C.primary, fontSize:12, fontFamily:F, fontWeight:500, padding:0 }}>
                          {locationFull?.name || "—"}
                        </button>
                      </div>
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:3 }}>Manager</div>
                        {managerFull ? (
                          <button onClick={() => onNav("employee_record", { employeeId: managerFull.id })}
                            style={{ background:"none", border:"none", cursor:"pointer", color:C.primary, fontSize:12, fontFamily:F, fontWeight:500, padding:0 }}>
                            {managerFull.name} · {managerFull.role}
                          </button>
                        ) : <span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>No manager assigned</span>}
                      </div>
                      {directs.length > 0 && (
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:5 }}>
                            Direct reports ({directs.length})
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            {directs.map(d => (
                              <button key={d.id} onClick={() => onNav("employee_record", { employeeId: d.id })}
                                style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none",
                                  cursor:"pointer", padding:0, textAlign:"left" }}>
                                <div style={{ width:20, height:20, borderRadius:"50%",
                                  background:AVATAR_COLORS[parseInt(d.id.slice(1)) % AVATAR_COLORS.length],
                                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                  <span style={{ fontSize:8, fontWeight:700, color:"white", fontFamily:F }}>{d.initials}</span>
                                </div>
                                <span style={{ fontSize:12, color:C.primary, fontFamily:F }}>{d.name}</span>
                                <span style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>{d.role}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:3 }}>Hire date</div>
                        <div style={{ fontSize:12, color:C.navyDeep, fontFamily:F, fontWeight:500 }}>{detail.hireDate}</div>
                      </div>
                      <EditableField label="Status" value={isActive ? "Active" : "Inactive"} fieldKey="status" canEdit={canEdit("status")} onSave={handleSaveField} />
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* ── Section 2: Performance Board ── */}
              <SectionCard title="Performance"
                action={
                  <select value={reportRange} onChange={e => setReportRange(e.target.value)}
                    style={{ padding:"4px 8px", borderRadius:5, border:`1px solid ${C.border}`,
                      fontSize:11, fontFamily:F, color:C.navyDeep, cursor:"pointer", outline:"none" }}>
                    {["Last 30 days","Last quarter","Last year"].map(o => <option key={o}>{o}</option>)}
                  </select>
                }>
                {/* KPI tiles */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
                  {[
                    { label:"Completion Rate", value: detail.perf.completionRate > 0 ? `${detail.perf.completionRate}%` : "—",
                      color: detail.perf.completionRate >= 80 ? C.success : detail.perf.completionRate >= 65 ? C.warning : detail.perf.completionRate > 0 ? C.error : C.textMuted },
                    { label:"Avg Audit Score", value: detail.isAuditor && detail.perf.avgScore > 0 ? `${detail.perf.avgScore}%` : "—",
                      color: detail.perf.avgScore >= 85 ? C.success : detail.perf.avgScore >= 70 ? C.warning : detail.perf.avgScore > 0 ? C.error : C.textMuted,
                      hidden: !detail.isAuditor },
                    { label:"AP Completed", value: detail.perf.apCompleted, subtext:`this period`,
                      color: C.success },
                    { label:"AP Overdue", value: detail.perf.apOverdue,
                      color: detail.perf.apOverdue > 0 ? C.error : C.success },
                  ].filter(t => !t.hidden).map(({ label, value, subtext, color }) => (
                    <div key={label} style={{ background:C.bgApp, borderRadius:8, padding:"12px 14px", textAlign:"center" }}>
                      <div style={{ fontSize:24, fontWeight:800, color, fontFamily:F, lineHeight:1, marginBottom:3 }}>{value}</div>
                      {subtext && <div style={{ fontSize:9, color:C.textMuted, fontFamily:F, marginBottom:2 }}>{subtext}</div>}
                      <div style={{ fontSize:10, fontWeight:600, color:C.textMuted, fontFamily:F,
                        textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Trend chart */}
                {chartData.length >= 2 ? (
                  <>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F }}>6-month trend</div>
                      {detail.isAuditor && (
                        <div style={{ display:"flex", gap:4 }}>
                          {[["completion","Completion rate"],["score","Avg score"]].map(([k,l]) => (
                            <button key={k} onClick={() => setTrendMetric(k)}
                              style={{ padding:"3px 9px", borderRadius:5, border:`1px solid ${trendMetric===k ? C.primary : C.border}`,
                                background: trendMetric===k ? C.primaryBg : "transparent",
                                color: trendMetric===k ? C.primary : C.textSec, fontSize:11, fontFamily:F,
                                fontWeight: trendMetric===k ? 600 : 400, cursor:"pointer" }}>
                              {l}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <TrendChart data={chartData} color={C.primary} target={target} />
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:6 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <svg width="20" height="4" viewBox="0 0 20 4"><line x1="0" y1="2" x2="20" y2="2" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round"/></svg>
                        <span style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>Actual</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <svg width="20" height="4" viewBox="0 0 20 4"><line x1="0" y1="2" x2="20" y2="2" stroke={C.textMuted} strokeWidth="1.5" strokeDasharray="4,3"/></svg>
                        <span style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>Target ({target}%)</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding:"20px 0", textAlign:"center", color:C.textMuted, fontSize:12, fontFamily:F }}>
                    Not enough data to display trend for this period.
                  </div>
                )}
              </SectionCard>

              {/* ── Section 3: Activity Timeline ── */}
              <SectionCard title="Activity Timeline"
                action={
                  <div style={{ display:"flex", gap:4 }}>
                    {[["all","All"],["audits","Audits"],["plans","Action Plans"],["other","Other"]].map(([k,l]) => (
                      <button key={k} onClick={() => setTlFilter(k)}
                        style={{ padding:"3px 9px", borderRadius:5, border:`1px solid ${tlFilter===k ? C.primary : C.border}`,
                          background: tlFilter===k ? C.primaryBg : "transparent",
                          color: tlFilter===k ? C.primary : C.textSec, fontSize:11, fontFamily:F,
                          fontWeight: tlFilter===k ? 600 : 400, cursor:"pointer" }}>
                        {l}
                      </button>
                    ))}
                  </div>
                }>
                <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                  {filteredTl.slice(0, tlShowing).map((ev, i) => (
                    <div key={i} style={{ display:"flex", gap:12, paddingBottom:14,
                      paddingTop: i > 0 ? 14 : 0, borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                      alignItems:"flex-start" }}>
                      <TimelineIcon type={ev.type} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                          <span style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F }}>{ev.title}</span>
                          {ev.entityId && (
                            <button onClick={() => onNav("audit_record", { auditId: ev.entityId })}
                              style={{ fontSize:11, color:C.primary, background:"none", border:"none", cursor:"pointer",
                                fontFamily:F, padding:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>
                              {ev.entity}
                            </button>
                          )}
                          {ev.entity && !ev.entityId && (
                            <span style={{ fontSize:11, color:C.textSec, fontFamily:F, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>{ev.entity}</span>
                          )}
                        </div>
                        <div style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>{ev.timestamp} · {ev.context}</div>
                      </div>
                    </div>
                  ))}

                  {filteredTl.length === 0 && (
                    <div style={{ textAlign:"center", padding:"24px 0", color:C.textMuted, fontSize:12, fontFamily:F }}>
                      No events for this filter.
                    </div>
                  )}

                  {filteredTl.length > tlShowing && (
                    <button onClick={() => setTlShowing(n => n + 15)}
                      style={{ marginTop:8, padding:"7px 16px", borderRadius:6, border:`1px solid ${C.border}`,
                        background:"transparent", color:C.primary, fontSize:12, fontFamily:F,
                        cursor:"pointer", fontWeight:600 }}>
                      Load more ({filteredTl.length - tlShowing} remaining)
                    </button>
                  )}
                </div>
              </SectionCard>

              {/* ── Section 4: Assigned Audits ── */}
              <SectionCard title={`Assigned Audits (${assignedAudits.length})`}
                action={
                  <div style={{ display:"flex", gap:4 }}>
                    {[["all","All"],["in_progress","In Progress"],["overdue","Overdue"],["completed","Completed"]].map(([k,l]) => (
                      <button key={k} onClick={() => setAuditFilter(k)}
                        style={{ padding:"3px 9px", borderRadius:5, border:`1px solid ${auditFilter===k ? C.primary : C.border}`,
                          background: auditFilter===k ? C.primaryBg : "transparent",
                          color: auditFilter===k ? C.primary : C.textSec, fontSize:11, fontFamily:F,
                          fontWeight: auditFilter===k ? 600 : 400, cursor:"pointer" }}>
                        {l}
                      </button>
                    ))}
                  </div>
                }>
                {filteredAudits.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"20px 0", color:C.textMuted, fontSize:12, fontFamily:F }}>
                    {assignedAudits.length === 0 ? "No audits assigned to this employee." : "No audits match this filter."}
                  </div>
                ) : (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 140px 100px 110px 70px", gap:8,
                      padding:"5px 0", borderBottom:`1px solid ${C.border}`,
                      fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase",
                      letterSpacing:"0.04em", fontFamily:F }}>
                      {["Audit","Location","Date","Status","Score"].map(h => <div key={h}>{h}</div>)}
                    </div>
                    {filteredAudits.map((a, i) => {
                      const sm = AUDIT_STATUS_META[a.status] || AUDIT_STATUS_META.not_started;
                      return (
                        <div key={a.id || i} style={{ display:"grid", gridTemplateColumns:"1fr 140px 100px 110px 70px",
                          gap:8, padding:"9px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
                          <button onClick={() => a.id && !a.id.startsWith("stub") && onNav("audit_record", { auditId: a.id })}
                            style={{ background:"none", border:"none", cursor: a.id?.startsWith("stub") ? "default" : "pointer",
                              color: a.id?.startsWith("stub") ? C.navyDeep : C.primary, fontSize:12, fontFamily:F,
                              fontWeight:600, textAlign:"left", padding:0,
                              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {a.name}
                          </button>
                          <div style={{ fontSize:11, color:C.textSec, fontFamily:F, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.locationName}</div>
                          <div style={{ fontSize:11, color: a.status==="overdue" ? C.error : C.textSec, fontFamily:F }}>{a.date}</div>
                          <Pill label={sm.label} color={sm.color} bg={sm.bg} sm />
                          <div style={{ fontSize:12, fontWeight:700, color: a.score ? (a.score>=85?C.success:a.score>=70?C.warning:C.error) : C.textMuted, fontFamily:F }}>
                            {a.score ? `${a.score}%` : "—"}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </SectionCard>

              {/* ── Section 5: Action Plans ── */}
              <SectionCard title={`Action Plans Owned (${actionPlans.length})`}
                action={
                  <div style={{ display:"flex", gap:4 }}>
                    {[["all","All"],["open","Open"],["in_progress","In Progress"],["completed","Completed"],["overdue","Overdue"]].map(([k,l]) => (
                      <button key={k} onClick={() => setApFilter(k)}
                        style={{ padding:"3px 9px", borderRadius:5, border:`1px solid ${apFilter===k ? C.primary : C.border}`,
                          background: apFilter===k ? C.primaryBg : "transparent",
                          color: apFilter===k ? C.primary : C.textSec, fontSize:11, fontFamily:F,
                          fontWeight: apFilter===k ? 600 : 400, cursor:"pointer" }}>
                        {l}
                      </button>
                    ))}
                  </div>
                }>
                {filteredAp.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"20px 0", color:C.textMuted, fontSize:12, fontFamily:F }}>
                    No action plans match this filter.
                  </div>
                ) : (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 120px 100px 100px 70px", gap:8,
                      padding:"5px 0", borderBottom:`1px solid ${C.border}`,
                      fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase",
                      letterSpacing:"0.04em", fontFamily:F }}>
                      {["Title","Location","Due Date","Status","Priority"].map(h => <div key={h}>{h}</div>)}
                    </div>
                    {filteredAp.map(ap => {
                      const sm = AP_STATUS_META[ap.status] || AP_STATUS_META.open;
                      return (
                        <div key={ap.id} style={{ display:"grid", gridTemplateColumns:"1fr 120px 100px 100px 70px",
                          gap:8, padding:"9px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
                          <div style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F,
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ap.title}</div>
                          <div style={{ fontSize:11, color:C.textSec, fontFamily:F, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ap.location}</div>
                          <div style={{ fontSize:11, color:C.textSec, fontFamily:F }}>{ap.dueDate}</div>
                          <Pill label={sm.label} color={sm.color} bg={sm.bg} sm />
                          <div style={{ fontSize:11, fontWeight:700, color:PRIORITY_COLOR[ap.priority]||C.textMuted, fontFamily:F, textTransform:"capitalize" }}>{ap.priority}</div>
                        </div>
                      );
                    })}
                  </>
                )}
              </SectionCard>
            </div>
          )}

          {/* ── Reports Tab ── */}
          {tab === "reports" && (
            <div style={{ display:"flex", gap:16, height:"100%", minHeight:500 }}>
              {/* Left: report list */}
              <div style={{ width:240, flexShrink:0, background:C.bgSurf, border:`1px solid ${C.border}`,
                borderRadius:10, overflow:"hidden", alignSelf:"flex-start" }}>
                <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase",
                    letterSpacing:"0.05em", fontFamily:F }}>Default Reports</div>
                </div>
                {DEFAULT_REPORTS.filter(r => {
                  // Role-based: Employee can only see trend + action
                  if (viewerRole === "Employee") return ["trend","action"].includes(r.id);
                  return true;
                }).map(r => (
                  <button key={r.id} onClick={() => setSelectedReport(r.id)}
                    style={{ width:"100%", padding:"10px 16px", textAlign:"left", border:"none",
                      borderBottom:`1px solid ${C.border}`,
                      background: selectedReport===r.id ? C.primaryBg : "transparent", cursor:"pointer" }}
                    onMouseEnter={e => { if (selectedReport!==r.id) e.currentTarget.style.background = C.bgApp; }}
                    onMouseLeave={e => { if (selectedReport!==r.id) e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ fontSize:12, fontWeight: selectedReport===r.id ? 700 : 500,
                      color: selectedReport===r.id ? C.primary : C.navyDeep, fontFamily:F, marginBottom:2 }}>{r.label}</div>
                    <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, lineHeight:1.4 }}>{r.desc}</div>
                  </button>
                ))}
                <div style={{ padding:"12px 16px" }}>
                  <button onClick={() => alert("Custom report builder coming in V2.")}
                    style={{ width:"100%", padding:"7px 0", borderRadius:6, border:`1px dashed ${C.border2}`,
                      background:"transparent", color:C.textMuted, fontSize:11, fontFamily:F, cursor:"pointer" }}>
                    + Build new report
                  </button>
                </div>
              </div>

              {/* Right: report content */}
              <div style={{ flex:1, background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
                {/* Insights badge */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"13px 20px", borderBottom:`1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.navyDeep, fontFamily:F }}>
                      {DEFAULT_REPORTS.find(r => r.id === selectedReport)?.label}
                    </div>
                    <div style={{ fontSize:11, color:C.textMuted, fontFamily:F, marginTop:2 }}>
                      {DEFAULT_REPORTS.find(r => r.id === selectedReport)?.desc}
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <select value={reportRange} onChange={e => setReportRange(e.target.value)}
                      style={{ padding:"4px 8px", borderRadius:5, border:`1px solid ${C.border}`,
                        fontSize:11, fontFamily:F, color:C.navyDeep, cursor:"pointer", outline:"none" }}>
                      {["Last 30 days","Last quarter","Last year"].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <div title="Reports are powered by Insights — Frontier's analytics product."
                      style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px",
                        background:"#f0f2ff", borderRadius:4, border:"1px solid #c7d0ff", cursor:"help" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span style={{ fontSize:9, fontWeight:700, color:C.primary, fontFamily:F }}>Insights</span>
                    </div>
                    <button onClick={() => alert("Export coming soon.")}
                      style={{ padding:"5px 10px", borderRadius:5, border:`1px solid ${C.border}`,
                        background:C.bgSurf, color:C.textSec, fontSize:11, fontFamily:F, cursor:"pointer" }}>
                      Export
                    </button>
                  </div>
                </div>

                <div style={{ padding:24 }}>
                  {selectedReport === "trend" && (
                    <>
                      {chartData.length >= 2 ? (
                        <>
                          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
                            <div style={{ display:"flex", gap:4 }}>
                              {[["completion","Completion rate"],["score","Avg score"]].filter(([k]) => k==="completion" || detail.isAuditor).map(([k,l]) => (
                                <button key={k} onClick={() => setTrendMetric(k)}
                                  style={{ padding:"4px 10px", borderRadius:5, border:`1px solid ${trendMetric===k?C.primary:C.border}`,
                                    background: trendMetric===k?C.primaryBg:"transparent",
                                    color: trendMetric===k?C.primary:C.textSec, fontSize:11, fontFamily:F,
                                    fontWeight: trendMetric===k?600:400, cursor:"pointer" }}>
                                  {l}
                                </button>
                              ))}
                            </div>
                          </div>
                          <TrendChart data={chartData} color={C.primary} target={target} />
                          <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                            {[
                              { label:"Current", value:`${chartData[chartData.length-1]?.v ?? 0}%`, color:C.primary },
                              { label:"Target", value:`${target}%`, color:C.textMuted },
                              { label:"6-mo avg", value:`${Math.round(chartData.reduce((a,d)=>a+d.v,0)/chartData.length)}%`, color:C.navyDeep },
                              { label:"Trend", value: chartData[chartData.length-1]?.v > chartData[0]?.v ? "↑ Improving" : "↓ Declining", color: chartData[chartData.length-1]?.v > chartData[0]?.v ? C.success : C.error },
                            ].map(({ label, value, color }) => (
                              <div key={label} style={{ background:C.bgApp, borderRadius:7, padding:"10px 14px" }}>
                                <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginBottom:3, textTransform:"uppercase", letterSpacing:"0.04em", fontWeight:700 }}>{label}</div>
                                <div style={{ fontSize:16, fontWeight:700, color, fontFamily:F }}>{value}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div style={{ padding:"40px 0", textAlign:"center", color:C.textMuted, fontSize:13, fontFamily:F }}>
                          No trend data available for this employee yet.
                        </div>
                      )}
                    </>
                  )}

                  {selectedReport === "action" && (
                    <>
                      <div style={{ display:"flex", gap:12, marginBottom:16 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <div style={{ width:10, height:10, borderRadius:2, background:C.success, opacity:0.8 }} />
                          <span style={{ fontSize:11, color:C.textSec, fontFamily:F }}>Completed</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <div style={{ width:10, height:10, borderRadius:2, background:C.error, opacity:0.8 }} />
                          <span style={{ fontSize:11, color:C.textSec, fontFamily:F }}>Overdue</span>
                        </div>
                      </div>
                      <ApBarChart data={apResolution} />
                      <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                        {[
                          { label:"Total completed", value: apResolution.reduce((a,d)=>a+d.completed,0), color:C.success },
                          { label:"Total overdue",   value: apResolution.reduce((a,d)=>a+d.overdue,0),   color: apResolution.reduce((a,d)=>a+d.overdue,0) > 0 ? C.error : C.success },
                          { label:"Avg per month",   value: (apResolution.reduce((a,d)=>a+d.completed,0)/apResolution.length).toFixed(1), color:C.primary },
                        ].map(({ label, value, color }) => (
                          <div key={label} style={{ background:C.bgApp, borderRadius:7, padding:"10px 14px" }}>
                            <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginBottom:3, textTransform:"uppercase", letterSpacing:"0.04em", fontWeight:700 }}>{label}</div>
                            <div style={{ fontSize:18, fontWeight:700, color, fontFamily:F }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {selectedReport === "peers" && (
                    <>
                      <div style={{ marginBottom:16, fontSize:12, color:C.textSec, fontFamily:F, lineHeight:1.6 }}>
                        Comparing <strong>{detail.name}</strong> to the role average for <strong>{detail.role}</strong> (anonymized peer data).
                      </div>
                      {[
                        { metric:"Completion Rate", mine: detail.perf.completionRate, peer: roleAvgCompletion },
                        ...(detail.isAuditor ? [{ metric:"Avg Audit Score", mine: detail.perf.avgScore, peer: roleAvgScore }] : []),
                        { metric:"AP Completed", mine: detail.perf.apCompleted, peer: 7, unit:"" },
                      ].map(({ metric, mine, peer, unit = "%" }) => (
                        <div key={metric} style={{ marginBottom:16 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                            <span style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F }}>{metric}</span>
                            <div style={{ display:"flex", gap:12 }}>
                              <span style={{ fontSize:12, fontWeight:700, color: mine >= peer ? C.success : C.error, fontFamily:F }}>{mine}{unit} (you)</span>
                              <span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>{peer}{unit} (avg)</span>
                            </div>
                          </div>
                          {[["You", mine, mine >= peer ? C.success : C.error], ["Role avg", peer, C.info]].map(([label, val, color]) => (
                            <div key={label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                              <div style={{ width:60, fontSize:10, color:C.textMuted, fontFamily:F }}>{label}</div>
                              <div style={{ flex:1, height:8, background:C.bgApp, borderRadius:4, overflow:"hidden" }}>
                                <div style={{ height:"100%", width:`${Math.min(100, val)}%`, background:color, borderRadius:4, opacity:0.8 }} />
                              </div>
                              <div style={{ width:35, fontSize:11, fontWeight:600, color, fontFamily:F, textAlign:"right" }}>{val}{unit}</div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </>
                  )}

                  {selectedReport === "scores" && (
                    detail.isAuditor && detail.perf.avgScore > 0 ? (
                      <>
                        <div style={{ marginBottom:16, fontSize:12, color:C.textSec, fontFamily:F }}>
                          Distribution of audit scores when {detail.name.split(" ")[0]} is the auditor.
                        </div>
                        <ScoreHistogram data={scoreDist} />
                        <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                          {[
                            { label:"Average score", value:`${detail.perf.avgScore}%`, color: detail.perf.avgScore>=85?C.success:detail.perf.avgScore>=70?C.warning:C.error },
                            { label:"High scores (90+)", value: scoreDist[4].count, color:C.success },
                            { label:"Low scores (<70)", value: scoreDist[0].count + scoreDist[1].count, color: (scoreDist[0].count + scoreDist[1].count) > 0 ? C.error : C.success },
                          ].map(({ label, value, color }) => (
                            <div key={label} style={{ background:C.bgApp, borderRadius:7, padding:"10px 14px" }}>
                              <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginBottom:3, textTransform:"uppercase", letterSpacing:"0.04em", fontWeight:700 }}>{label}</div>
                              <div style={{ fontSize:18, fontWeight:700, color, fontFamily:F }}>{value}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{ padding:"40px 0", textAlign:"center", color:C.textMuted, fontSize:13, fontFamily:F }}>
                        {!detail.isAuditor ? "This employee is not an auditor — no score data available." : "Not enough audit data yet."}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
