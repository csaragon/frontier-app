import { useState, useMemo } from "react";
import AppSidebar from "../AppSidebar.jsx";
import { getLocationDetail } from "./locationStubData.js";
import { AVATAR_COLORS } from "./employeeStubData.js";
import { T, F } from "../aegis-tokens.js";

const C = {
  navy:      T.action1,
  navyDeep:  T.onSurface2,
  textSec:   T.onSurface1,
  textMuted: T.disabled1,
  bgApp:     T.surface2,
  bgSurf:    T.surface1,
  border:    T.border1,
  primary:   T.actionContainer1,
  primaryBg: T.actionContainer3,
  success:   T.success1, successBg: T.successContainer1,
  warning:   T.warning1, warningBg: T.warningContainer1,
  error:     T.onError1, errorBg:   T.errorContainer1,
};

const STATUS_META = {
  active:             { label:"Active",            color:C.success, bg:C.successBg },
  inactive:           { label:"Inactive",          color:C.textMuted, bg:C.bgApp   },
  under_construction: { label:"Under Construction",color:C.warning, bg:C.warningBg },
};
const AP_STATUS_META = {
  open:        { label:"Open",        color:C.error,   bg:C.errorBg   },
  in_progress: { label:"In Progress", color:C.warning, bg:C.warningBg },
  overdue:     { label:"Overdue",     color:C.error,   bg:C.errorBg   },
  completed:   { label:"Completed",   color:C.success, bg:C.successBg },
};
const AUDIT_STATUS_META = {
  completed:   { label:"Completed",   color:C.success, bg:C.successBg },
  in_progress: { label:"In Progress", color:C.warning, bg:C.warningBg },
  overdue:     { label:"Overdue",     color:C.error,   bg:C.errorBg   },
  not_started: { label:"Not Started", color:C.textMuted, bg:C.bgApp   },
};
const PRIORITY_COLOR = { high:C.error, medium:C.warning, low:C.success };

const VIEWER_ROLES = ["Program Owner","Regional Manager","District Manager","Store Manager"];
const DATE_RANGES  = ["This Month","This Quarter","YTD","Last Year"];
const DEFAULT_REPORTS = [
  { id:"trend",      label:"Compliance Score Trend"   },
  { id:"volume",     label:"Audit Volume by Template" },
  { id:"apresol",    label:"AP Resolution Time"       },
  { id:"missed",     label:"Top Missed Questions"     },
  { id:"peers",      label:"Compliance vs Peers"      },
];

function scoreColor(s) { return s==null?C.textMuted:s>=85?C.success:s>=70?C.warning:C.error; }
function scoreBg(s)    { return s==null?C.bgApp:s>=85?C.successBg:s>=70?C.warningBg:C.errorBg; }

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Avatar({ emp, size=36 }) {
  const col = AVATAR_COLORS[parseInt((emp.id||"E0").replace(/\D/g,"0")) % AVATAR_COLORS.length] || C.primary;
  return (
    <div style={{ width:size,height:size,borderRadius:"50%",background:col,flexShrink:0,
      display:"flex",alignItems:"center",justifyContent:"center" }}>
      <span style={{ fontSize:size*0.35,fontWeight:700,color:"white",fontFamily:F }}>{emp.initials||"?"}</span>
    </div>
  );
}

function Pill({ label, color, bg, sm }) {
  return (
    <span style={{ display:"inline-flex", padding:sm?"2px 7px":"3px 9px", borderRadius:999,
      background:bg, border:`1px solid ${color}30`,
      fontSize:sm?10:11, fontWeight:600, color, fontFamily:F, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function SectionCard({ title, action, helper, children, collapsible, defaultOpen=true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background:C.bgSurf,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:12 }}>
      <div onClick={collapsible?()=>setOpen(o=>!o):undefined}
        style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"13px 20px",borderBottom:open?`1px solid ${C.border}`:"none",
          cursor:collapsible?"pointer":"default" }}>
        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
          {collapsible && (
            <span style={{ fontSize:10,color:C.textMuted,lineHeight:1,flexShrink:0 }}>{open?"▾":"▸"}</span>
          )}
          <span style={{ fontSize:13,fontWeight:700,color:C.navyDeep,fontFamily:F }}>{title}</span>
          {helper && <div style={{ fontSize:12,color:C.textMuted,fontFamily:F,marginTop:2 }}>{helper}</div>}
        </div>
        {!collapsible && action}
        {collapsible && <div onClick={e=>e.stopPropagation()}>{action}</div>}
      </div>
      {open && <div style={{ padding:20 }}>{children}</div>}
    </div>
  );
}

function EditableField({ label, value, fieldKey, canEdit, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const [hov,     setHov]     = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ marginBottom:12 }}>
      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",
        letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>{label}</div>
      {editing ? (
        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
          <input value={draft} onChange={e=>setDraft(e.target.value)} autoFocus
            style={{ padding:"4px 8px",borderRadius:4,border:`1.5px solid ${C.primary}`,
              fontSize:12,fontFamily:F,color:C.navyDeep,outline:"none",flex:1 }} />
          <button onClick={()=>{onSave(fieldKey,draft);setEditing(false);}}
            style={{ padding:"3px 8px",borderRadius:4,border:"none",background:C.primary,
              color:"white",fontSize:12,fontFamily:F,cursor:"pointer" }}>Save</button>
          <button onClick={()=>{setDraft(value);setEditing(false);}}
            style={{ padding:"3px 8px",borderRadius:4,border:`1px solid ${C.border}`,
              background:"transparent",color:C.textSec,fontSize:12,fontFamily:F,cursor:"pointer" }}>✕</button>
        </div>
      ) : (
        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
          <span style={{ fontSize:12,color:value?C.navyDeep:C.textMuted,fontFamily:F,fontWeight:500 }}>
            {value||"—"}
          </span>
          {canEdit && hov && (
            <button onClick={()=>{setDraft(value||"");setEditing(true);}}
              style={{ width:18,height:18,borderRadius:4,border:`1px solid ${C.border}`,background:C.bgApp,
                cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                color:C.textMuted,padding:0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── SVG Charts ────────────────────────────────────────────────────────────────
function TrendChart({ data, target=85, height=140 }) {
  if (!data||data.length<2) return null;
  const W=460,H=height,pad=28;
  const min=Math.max(0,Math.min(...data)-10);
  const max=Math.min(100,Math.max(...data)+10);
  const x=i=>pad+(i/(data.length-1))*(W-pad*2);
  const y=v=>H-pad-((v-min)/(max-min||1))*(H-pad*2);
  const pts=data.map((v,i)=>`${x(i)},${y(v)}`).join(" ");
  const tgt=y(target);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      {[0,.25,.5,.75,1].map(t=>(
        <line key={t} x1={pad} x2={W-pad} y1={pad+t*(H-pad*2)} y2={pad+t*(H-pad*2)} stroke="#e2e5e9" strokeWidth="1"/>
      ))}
      <line x1={pad} x2={W-pad} y1={tgt} y2={tgt} stroke="#8692a2" strokeWidth="1.5" strokeDasharray="4 3"/>
      <polyline points={pts} fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((v,i)=>(
        <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill={C.primary} stroke="white" strokeWidth="1.5"/>
      ))}
    </svg>
  );
}

function MultiLineChart({ scoreTrend, districtTrend, regionTrend, labels }) {
  const W=540,H=150,pL=32,pB=24,pT=10,pR=10;
  const all=[...scoreTrend,...districtTrend,...regionTrend];
  const mn=Math.max(0,Math.min(...all)-8), mx=Math.min(100,Math.max(...all)+8);
  const xp=i=>pL+(i/(labels.length-1))*(W-pL-pR);
  const yp=v=>pT+(1-(v-mn)/(mx-mn||1))*(H-pT-pB);
  const line=(arr,col)=>{
    const pts=arr.map((v,i)=>`${xp(i)},${yp(v)}`).join(" ");
    return <polyline key={col} points={pts} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>;
  };
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {[0,.5,1].map(t=>(
        <line key={t} x1={pL} x2={W-pR} y1={pT+t*(H-pT-pB)} y2={pT+t*(H-pT-pB)} stroke="#e2e5e9" strokeWidth="1"/>
      ))}
      <line x1={pL} x2={W-pR} y1={yp(85)} y2={yp(85)} stroke="#8692a2" strokeWidth="1" strokeDasharray="3 3"/>
      {line(scoreTrend, C.primary)}
      {line(districtTrend, "#0f766e")}
      {line(regionTrend, "#8692a2")}
      {labels.map((lbl,i)=>(
        <text key={i} x={xp(i)} y={H-4} textAnchor="middle" fontSize="9" fill="#8692a2" fontFamily="Inter,sans-serif">{lbl}</text>
      ))}
    </svg>
  );
}

function VolumeBars({ data, labels }) {
  const max=Math.max(...data,1);
  const W=540,H=120,pL=20,pB=24,pT=10,pR=10;
  const bW=(W-pL-pR)/data.length*0.6;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {data.map((v,i)=>{
        const bH=((v/max)*(H-pT-pB));
        const bx=pL+((W-pL-pR)/data.length)*i+(W-pL-pR)/data.length*0.2;
        return (
          <g key={i}>
            <rect x={bx} y={H-pB-bH} width={bW} height={bH} fill={C.primary} rx="2"/>
            <text x={bx+bW/2} y={H-4} textAnchor="middle" fontSize="9" fill="#8692a2" fontFamily="Inter,sans-serif">{labels[i]}</text>
            <text x={bx+bW/2} y={H-pB-bH-3} textAnchor="middle" fontSize="9" fill={C.navyDeep} fontFamily="Inter,sans-serif">{v}</text>
          </g>
        );
      })}
    </svg>
  );
}

function HBarChart({ items, barColor }) {
  const max=Math.max(...items.map(i=>i.count),1);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {items.map(item=>(
        <div key={item.label} style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:12,color:C.textSec,fontFamily:F,width:80,flexShrink:0,textAlign:"right"}}>{item.label}</div>
          <div style={{flex:1,height:16,background:C.bgApp,borderRadius:4,overflow:"hidden"}}>
            <div style={{width:`${(item.count/max)*100}%`,height:"100%",background:barColor||C.primary,borderRadius:4}}/>
          </div>
          <div style={{fontSize:12,fontWeight:600,color:C.navyDeep,fontFamily:F,width:24,flexShrink:0}}>{item.count}</div>
        </div>
      ))}
    </div>
  );
}

function PeerBars({ peers }) {
  const max=Math.max(...peers.map(p=>p.score),1);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {peers.map(p=>(
        <div key={p.name} style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:12,color:p.isThis?C.primary:C.textSec,fontFamily:F,fontWeight:p.isThis?700:400,width:160,flexShrink:0}}>{p.name}{p.isThis?" (this location)":""}</div>
          <div style={{flex:1,height:20,background:C.bgApp,borderRadius:4,overflow:"hidden"}}>
            <div style={{width:`${(p.score/max)*100}%`,height:"100%",
              background:p.isThis?C.primary:scoreColor(p.score),borderRadius:4}}/>
          </div>
          <div style={{fontSize:12,fontWeight:700,color:scoreColor(p.score),fontFamily:F,width:28,flexShrink:0}}>{p.score}</div>
        </div>
      ))}
    </div>
  );
}

// ── Map modal stub ─────────────────────────────────────────────────────────────
function MapModal({ loc, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,
      display:"flex",alignItems:"center",justifyContent:"center" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.bgSurf,borderRadius:12,padding:32,
        width:480,boxShadow:"0 12px 40px rgba(0,0,0,0.2)" }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{fontSize:14,fontWeight:700,color:C.navyDeep,fontFamily:F}}>Map View</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.textMuted,display:"flex",padding:4}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{background:C.bgApp,borderRadius:8,height:200,display:"flex",alignItems:"center",
          justifyContent:"center",border:`1px solid ${C.border}`,marginBottom:16}}>
          <div style={{textAlign:"center"}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <div style={{fontSize:12,color:C.textMuted,fontFamily:F,marginTop:8}}>Map view coming in V2</div>
          </div>
        </div>
        <div style={{fontSize:12,color:C.textSec,fontFamily:F}}>
          <strong>{loc.name}</strong><br/>{loc.address}<br/>{loc.city}, {loc.state} {loc.zip}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LocationRecordPage({ locationId, onNav }) {
  const [viewerRole, setViewerRole] = useState("Program Owner");
  const [activeTab,  setActiveTab]  = useState("scorecard");
  const [dateRange,  setDateRange]  = useState("This Quarter");
  const [showMap,    setShowMap]    = useState(false);
  const [edits,      setEdits]      = useState({});
  const [apFilter,   setApFilter]   = useState("all");
  const [auditFilter,setAuditFilter]= useState("all");
  const [empFilter,  setEmpFilter]  = useState("all");
  const [auditPage,  setAuditPage]  = useState(1);
  const [trendMetric,setTrendMetric]= useState("compliance");
  const [selectedReport, setSelectedReport] = useState("trend");

  const canEdit = (field) => {
    if (viewerRole === "Program Owner")    return ["address","storeNum","type","phone","hours"].includes(field);
    if (viewerRole === "Regional Manager") return ["storeMgrId","districtMgrId"].includes(field);
    return false;
  };

  const detail = useMemo(() => getLocationDetail(locationId), [locationId]);
  if (!detail) return (
    <div style={{display:"flex",height:"100vh",fontFamily:F,background:C.bgApp}}>
      <AppSidebar activeId="locations" onNav={onNav}/>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{color:C.textMuted,fontSize:14,fontFamily:F}}>Location not found.</span>
      </div>
    </div>
  );

  const { loc: rawLoc, recentAudits, actionPlans, employees, programs,
          criticalPatterns, perfTrend, districtAvg, regionAvg, topPeerScore, topPeerName, reportData,
          openDate, division, locationTypes, squareFootage, hasSelfCheckout,
          alarm, cctv, guard, keyHolders, shrink, shippingAddress } = detail;
  const loc = { ...rawLoc, ...edits };

  function handleSave(field, val) { setEdits(e => ({ ...e, [field]: val })); }

  const statusMeta = STATUS_META[loc.status] || STATUS_META.active;
  const completedAudits = recentAudits.filter(a => a.status === "completed");
  const critFails = recentAudits.reduce((s,a) => s + (a.cf||0), 0);
  const scoreDelta = perfTrend.length >= 2 ? perfTrend[perfTrend.length-1] - perfTrend[perfTrend.length-2] : 0;

  // ── Audit filter for Section 4 ──────────────────────────────────────────────
  const filteredAudits = useMemo(() => {
    if (auditFilter === "all")      return recentAudits;
    if (auditFilter === "critical") return recentAudits.filter(a => a.cf > 0);
    return recentAudits;
  }, [recentAudits, auditFilter]);
  const AUDIT_PER_PAGE = 20;
  const auditPages = Math.ceil(filteredAudits.length / AUDIT_PER_PAGE);
  const visibleAudits = filteredAudits.slice((auditPage-1)*AUDIT_PER_PAGE, auditPage*AUDIT_PER_PAGE);

  // ── Action plan filter for Section 5 ───────────────────────────────────────
  const openAPs = useMemo(() => {
    const open = actionPlans.filter(ap => ap.status !== "completed");
    if (apFilter === "all")         return open;
    if (apFilter === "overdue")     return open.filter(ap => ap.status === "overdue");
    if (apFilter === "in_progress") return open.filter(ap => ap.status === "in_progress");
    if (apFilter === "open")        return open.filter(ap => ap.status === "open");
    return open;
  }, [actionPlans, apFilter]);

  // ── Employee filter for Section 7 ──────────────────────────────────────────
  const filteredEmps = useMemo(() => {
    if (empFilter === "auditors") return employees.filter(e => e.isAuditor);
    if (empFilter === "recent")   return employees.filter(e => e.lastActivity?.includes("Apr"));
    return employees;
  }, [employees, empFilter]);

  // ── Reports access ─────────────────────────────────────────────────────────
  const allowedReports = (viewerRole === "Store Manager")
    ? ["trend","apresol"]
    : DEFAULT_REPORTS.map(r => r.id);

  function MgrLink({ mgr, label }) {
    if (!mgr) return <span style={{fontSize:12,color:C.textMuted,fontFamily:F}}>—</span>;
    const clickable = !mgr.id?.startsWith("EXT");
    return (
      <span onClick={() => clickable && onNav("employee_record",{ employeeId:mgr.id, employeeName:mgr.name })}
        style={{ fontSize:12, fontWeight:500, color: clickable ? C.primary : C.navyDeep,
          fontFamily:F, cursor: clickable ? "pointer" : "default",
          textDecoration: clickable ? "underline" : "none" }}>
        {mgr.name}
      </span>
    );
  }

  function FilterPills({ options, selected, onSelect }) {
    return (
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {options.map(([val,label]) => (
          <button key={val} onClick={()=>onSelect(val)}
            style={{ padding:"3px 10px",borderRadius:999,border:`1px solid ${selected===val?C.primary:C.border}`,
              background:selected===val?C.primaryBg:C.bgSurf,
              color:selected===val?C.primary:C.textSec,
              fontSize:12,fontFamily:F,cursor:"pointer",fontWeight:selected===val?600:400 }}>
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp }}>
      <AppSidebar activeId="locations" onNav={onNav} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ background:C.bgSurf, borderBottom:`1px solid ${C.border}`, padding:"0 24px", flexShrink:0 }}>
          {/* Top bar: back + role */}
          <div style={{ height:44, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <button onClick={() => onNav("locations")}
              style={{ display:"flex",alignItems:"center",gap:4,color:C.primary,background:"none",
                border:"none",cursor:"pointer",fontSize:12,fontFamily:F }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              All Locations
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>Viewing as:</span>
              <select value={viewerRole} onChange={e => setViewerRole(e.target.value)}
                style={{ padding:"4px 8px", borderRadius:4, border:`1px solid ${C.border}`, fontSize:12, fontFamily:F, background:C.bgSurf }}>
                {VIEWER_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {/* Identity row */}
          <div style={{ paddingBottom:14, display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
            <div>
              {/* Breadcrumb */}
              <div style={{ fontSize:12, color:C.textMuted, fontFamily:F, marginBottom:4 }}>
                {loc.region}
                <span style={{ margin:"0 5px", color:C.border }}>→</span>
                {loc.district}
                <span style={{ margin:"0 5px", color:C.border }}>→</span>
                {loc.storeNum}
              </div>
              {/* Name + badges */}
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ fontSize:22, fontWeight:800, color:C.navyDeep, fontFamily:F }}>{loc.name}</span>
                <Pill label={statusMeta.label} color={statusMeta.color} bg={statusMeta.bg} />
                {loc.isCritical && (
                  <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:999,
                    background:C.errorBg,border:`1px solid ${C.error}30` }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.error} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <span style={{ fontSize:12,fontWeight:700,color:C.error,fontFamily:F }}>Critical</span>
                  </span>
                )}
              </div>
              <div style={{ fontSize:12, color:C.textSec, fontFamily:F, marginTop:4 }}>
                {loc.city}, {loc.state} {loc.zip}
              </div>
            </div>
            {/* Actions */}
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0, paddingTop:4 }}>
              {loc.complianceScore != null && (
                <div style={{ textAlign:"center", background:scoreBg(loc.complianceScore), borderRadius:12,
                  padding:"8px 16px", border:`1px solid ${scoreColor(loc.complianceScore)}30` }}>
                  <div style={{ fontSize:28,fontWeight:800,color:scoreColor(loc.complianceScore),fontFamily:F,lineHeight:1 }}>
                    {loc.complianceScore}
                  </div>
                  <div style={{ fontSize:10,color:C.textMuted,fontFamily:F,marginTop:2 }}>Compliance Score</div>
                </div>
              )}
              {canEdit("address") && (
                <button style={{ padding:"7px 14px",borderRadius:8,border:`1px solid ${C.border}`,
                  background:C.bgSurf,color:C.navy,fontSize:12,fontFamily:F,cursor:"pointer",fontWeight:600 }}>
                  Edit
                </button>
              )}
              {/* Kebab */}
              <div style={{ position:"relative" }}>
                <button onClick={() => {}} title="More"
                  style={{ width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,background:C.bgSurf,
                    cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.textMuted }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Tab nav */}
          <div style={{ display:"flex", gap:0, overflowX:"auto" }}>
            {[
              ["scorecard","Scorecard"],
              ["details",  "Details"],
              ["related",  "Related"],
              ["employees","Employees"],
              ["assets",   "Assets"],
              ["activity", "Activity"],
              ["reports",  "Reports"],
            ].map(([id,label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ padding:"8px 18px", border:"none", background:"none", cursor:"pointer",
                  fontSize:13, fontFamily:F, fontWeight:activeTab===id?700:400,
                  color:activeTab===id?C.primary:C.textSec,
                  borderBottom: activeTab===id?`2px solid ${C.primary}`:"2px solid transparent",
                  display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap" }}>
                {label}
                {id==="reports" && (
                  <span style={{ fontSize:10,fontWeight:700,color:"#fff",background:C.primary,
                    padding:"1px 5px",borderRadius:4,letterSpacing:"0.02em" }}>INSIGHTS</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {showMap && <MapModal loc={loc} onClose={()=>setShowMap(false)} />}

          {/* ════════════════════ SCORECARD TAB ════════════════════════════ */}
          {activeTab === "scorecard" && (
            <div style={{ maxWidth:920, margin:"0 auto", padding:"20px 24px" }}>

              {/* ── Section 1: Location Basics ──────────────────────────── */}
              <SectionCard title="Location Basics">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
                  {/* Left: Identity & Address */}
                  <div>
                    <div style={{ fontSize:28,fontWeight:900,color:C.navy,fontFamily:F,marginBottom:16,letterSpacing:"-0.5px" }}>
                      {loc.storeNum}
                    </div>
                    <EditableField label="Street Address" value={loc.address} fieldKey="address" canEdit={canEdit("address")} onSave={handleSave}/>
                    <div style={{ fontSize:12,color:C.textSec,fontFamily:F,marginBottom:12 }}>
                      {loc.city}, {loc.state} {loc.zip}
                      <button onClick={()=>setShowMap(true)}
                        style={{ marginLeft:8,padding:"2px 8px",borderRadius:4,border:`1px solid ${C.border}`,
                          background:"none",fontSize:10,color:C.primary,cursor:"pointer",fontFamily:F }}>
                        View map
                      </button>
                    </div>
                    <EditableField label="Phone" value={loc.phone} fieldKey="phone" canEdit={canEdit("phone")} onSave={handleSave}/>
                    <EditableField label="Hours" value={loc.hours} fieldKey="hours" canEdit={canEdit("hours")} onSave={handleSave}/>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Type</div>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{loc.type}</span>
                      </div>
                    </div>
                  </div>
                  {/* Right: Hierarchy & Management */}
                  <div>
                    {[
                      ["Region",           <span style={{fontSize:12,fontFamily:F,color:C.primary,cursor:"pointer"}} onClick={()=>alert("Region view coming in V2.")}>{loc.region}</span>],
                      ["District",         <span style={{fontSize:12,fontFamily:F,color:C.primary,cursor:"pointer"}} onClick={()=>alert("District view coming in V2.")}>{loc.district}</span>],
                      ["Regional Manager", <MgrLink mgr={rawLoc.regionalMgr}/>],
                      ["District Manager", <MgrLink mgr={rawLoc.districtMgr}/>],
                      ["Store Manager",    <MgrLink mgr={rawLoc.storeMgr}/>],
                      ["Employees on-site",<span style={{fontSize:12,fontFamily:F,fontWeight:600,color:C.navyDeep}}>{loc.employeeCount}</span>],
                    ].map(([label,el]) => (
                      <div key={label} style={{ marginBottom:12 }}>
                        <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>{label}</div>
                        {el}
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* ── Section 2: Performance Board ────────────────────────── */}
              <SectionCard title="Performance"
                action={
                  <div style={{display:"flex",gap:6}}>
                    {DATE_RANGES.map(r=>(
                      <button key={r} onClick={()=>setDateRange(r)}
                        style={{padding:"3px 10px",borderRadius:999,border:`1px solid ${dateRange===r?C.primary:C.border}`,
                          background:dateRange===r?C.primaryBg:C.bgSurf,
                          color:dateRange===r?C.primary:C.textSec,
                          fontSize:12,fontFamily:F,cursor:"pointer",fontWeight:dateRange===r?600:400}}>
                        {r}
                      </button>
                    ))}
                  </div>
                }>
                {/* KPI tiles */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
                  {[
                    { label:"Compliance Score", value: loc.complianceScore??<span style={{color:C.textMuted}}>—</span>,
                      delta: scoreDelta, showDelta:true, color: scoreColor(loc.complianceScore) },
                    { label:"Audits Completed", value: completedAudits.length, delta:null, color:C.navy },
                    { label:"Open Action Plans", value: loc.openAPs, delta:null,
                      color: loc.openAPs > 5 ? C.warning : C.navy },
                    { label:"Critical Q Failures", value: critFails, delta:null,
                      color: critFails > 0 ? C.error : C.navy },
                  ].map(tile => (
                    <div key={tile.label} style={{ background:C.bgApp, borderRadius:8, padding:"12px 14px" }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:4 }}>{tile.label}</div>
                      <div style={{ display:"flex",alignItems:"baseline",gap:6 }}>
                        <span style={{ fontSize:24,fontWeight:800,color:tile.color,fontFamily:F,lineHeight:1 }}>{tile.value}</span>
                        {tile.showDelta && tile.delta !== 0 && (
                          <span style={{ fontSize:12,fontWeight:600,color:tile.delta>0?C.success:C.error,fontFamily:F }}>
                            {tile.delta>0?"+":""}{tile.delta}
                          </span>
                        )}
                      </div>
                      {tile.showDelta && <div style={{fontSize:10,color:C.textMuted,fontFamily:F,marginTop:2}}>vs prev period</div>}
                    </div>
                  ))}
                </div>
                {/* Trend metric toggle */}
                <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
                  <span style={{fontSize:12,color:C.textMuted,fontFamily:F}}>Show:</span>
                  {[["compliance","Compliance Score"],["volume","Audit Volume"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setTrendMetric(v)}
                      style={{padding:"3px 10px",borderRadius:999,border:`1px solid ${trendMetric===v?C.primary:C.border}`,
                        background:trendMetric===v?C.primaryBg:C.bgSurf,
                        color:trendMetric===v?C.primary:C.textSec,
                        fontSize:12,fontFamily:F,cursor:"pointer",fontWeight:trendMetric===v?600:400}}>
                      {l}
                    </button>
                  ))}
                  <span style={{marginLeft:"auto",fontSize:10,color:C.textMuted,fontFamily:F}}>
                    ·····  85% target
                  </span>
                </div>
                {trendMetric === "compliance"
                  ? <TrendChart data={perfTrend} target={85}/>
                  : <VolumeBars data={reportData.volumeTrend} labels={reportData.MONTHS_SHORT}/>
                }
                {/* Comparison strip */}
                <div style={{display:"flex",gap:16,marginTop:16,flexWrap:"wrap"}}>
                  {[
                    { label:"vs. District avg", val:districtAvg },
                    { label:"vs. Region avg", val:regionAvg },
                    { label:`vs. Top in district (${topPeerName})`, val:topPeerScore },
                  ].map(c=>(
                    <div key={c.label} style={{fontSize:12,fontFamily:F,color:C.textSec}}>
                      <span>{c.label}: </span>
                      <span style={{fontWeight:700,color:scoreColor(c.val)}}>{c.val}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* ── Section 3: Active Programs ───────────────────────────── */}
              <SectionCard title="Active Programs">
                {programs.length === 0 ? (
                  <div style={{textAlign:"center",padding:"24px 0",color:C.textMuted,fontSize:12,fontFamily:F}}>
                    No programs assigned to this location yet.
                  </div>
                ) : (
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
                    {programs.map(prog=>(
                      <div key={prog.id} style={{background:C.bgApp,borderRadius:8,padding:14,border:`1px solid ${C.border}`}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.navyDeep,fontFamily:F,marginBottom:6}}>{prog.name}</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                          {[["Type",prog.type],["Templates",`${prog.templateCount}`],["Cadence",prog.cadence],["Last Audit",prog.lastAuditDate]].map(([k,v])=>(
                            <div key={k}>
                              <div style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F}}>{k}</div>
                              <div style={{fontSize:12,color:C.textSec,fontFamily:F}}>{v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{marginTop:10,display:"flex",alignItems:"center",gap:6}}>
                          <div style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F}}>Location Score</div>
                          <div style={{fontSize:13,fontWeight:700,color:scoreColor(prog.locationScore),fontFamily:F}}>
                            {prog.locationScore}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* ── Section 4: Recent Audits ─────────────────────────────── */}
              <SectionCard title="Recent Audits">
                <FilterPills
                  options={[["all","All"],["critical","Critical-fail only"]]}
                  selected={auditFilter} onSelect={v=>{setAuditFilter(v);setAuditPage(1);}} />
                <div style={{ overflowX:"auto" }}>
                  <div style={{ minWidth:640 }}>
                    {/* header */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 160px 120px 100px 56px 40px 80px",
                      gap:0,borderBottom:`1px solid ${C.border}`,paddingBottom:6,marginBottom:2}}>
                      {["Audit","Template","Auditor","Date","Score","CF","APs"].map(h=>(
                        <div key={h} style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",
                          letterSpacing:"0.05em",fontFamily:F,paddingRight:8}}>{h}</div>
                      ))}
                    </div>
                    {visibleAudits.length === 0 && (
                      <div style={{padding:"24px 0",textAlign:"center",color:C.textMuted,fontSize:12,fontFamily:F}}>No audits match.</div>
                    )}
                    {visibleAudits.map((a,i)=>{
                      const sc = a.score;
                      const sm = AUDIT_STATUS_META[a.status]||{};
                      return (
                        <div key={a.id} style={{display:"grid",gridTemplateColumns:"1fr 160px 120px 100px 56px 40px 80px",
                          gap:0,padding:"9px 0",borderBottom:i<visibleAudits.length-1?`1px solid ${C.border}`:"none",
                          alignItems:"center"}}>
                          <div>
                            <span onClick={()=>onNav("audit_record",{auditId:a.id})}
                              style={{fontSize:12,fontWeight:600,color:C.primary,cursor:"pointer",fontFamily:F}}>
                              {a.name?.split(" — ")[0]||a.name}
                            </span>
                            <div style={{fontSize:10,color:C.textMuted,fontFamily:F}}>{sm.label}</div>
                          </div>
                          <div style={{fontSize:12,color:C.textSec,fontFamily:F,paddingRight:8}}>{a.templateName}</div>
                          <div>
                            <span onClick={()=>onNav("employee_record",{employeeId:a.auditorId,employeeName:a.auditorName})}
                              style={{fontSize:12,color:C.primary,cursor:"pointer",fontFamily:F}}>
                              {a.auditorName}
                            </span>
                          </div>
                          <div style={{fontSize:12,color:C.textSec,fontFamily:F}}>{a.date}</div>
                          <div style={{fontSize:12,fontWeight:700,color:sc!=null?scoreColor(sc):C.textMuted,fontFamily:F}}>
                            {sc!=null?sc:"—"}
                          </div>
                          <div style={{fontSize:12,fontWeight:600,color:a.cf>0?C.error:C.textMuted,fontFamily:F}}>{a.cf||0}</div>
                          <div style={{fontSize:12,color:C.textSec,fontFamily:F}}>{a.ap||0}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {auditPages > 1 && (
                  <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"center",marginTop:14}}>
                    <button onClick={()=>setAuditPage(p=>Math.max(1,p-1))} disabled={auditPage===1}
                      style={{padding:"4px 10px",borderRadius:4,border:`1px solid ${C.border}`,
                        background:C.bgSurf,color:auditPage===1?C.textMuted:C.navyDeep,cursor:auditPage===1?"default":"pointer",fontSize:12,fontFamily:F}}>
                      ← Prev
                    </button>
                    <span style={{fontSize:12,color:C.textSec,fontFamily:F}}>{auditPage} / {auditPages}</span>
                    <button onClick={()=>setAuditPage(p=>Math.min(auditPages,p+1))} disabled={auditPage===auditPages}
                      style={{padding:"4px 10px",borderRadius:4,border:`1px solid ${C.border}`,
                        background:C.bgSurf,color:auditPage===auditPages?C.textMuted:C.navyDeep,cursor:auditPage===auditPages?"default":"pointer",fontSize:12,fontFamily:F}}>
                      Next →
                    </button>
                  </div>
                )}
              </SectionCard>

              {/* ── Section 5: Open Action Plans ─────────────────────────── */}
              <SectionCard title="Open Action Plans">
                <FilterPills
                  options={[["all","All"],["open","Open"],["in_progress","In Progress"],["overdue","Overdue"]]}
                  selected={apFilter} onSelect={setApFilter}/>
                {openAPs.length === 0 ? (
                  <div style={{textAlign:"center",padding:"20px 0",color:C.textMuted,fontSize:12,fontFamily:F}}>
                    No open action plans.
                  </div>
                ) : (
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 180px 120px 100px 90px 70px",
                      gap:0,borderBottom:`1px solid ${C.border}`,paddingBottom:6,marginBottom:2}}>
                      {["Title","Originating Audit","Assigned To","Due Date","Status","Priority"].map(h=>(
                        <div key={h} style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",
                          letterSpacing:"0.05em",fontFamily:F,paddingRight:8}}>{h}</div>
                      ))}
                    </div>
                    {openAPs.map((ap,i)=>{
                      const sm=AP_STATUS_META[ap.status]||{};
                      return (
                        <div key={ap.id} style={{display:"grid",gridTemplateColumns:"1fr 180px 120px 100px 90px 70px",
                          gap:0,padding:"9px 0",borderBottom:i<openAPs.length-1?`1px solid ${C.border}`:"none",alignItems:"center"}}>
                          <div style={{fontSize:12,fontWeight:600,color:C.navyDeep,fontFamily:F,paddingRight:8}}>{ap.title}</div>
                          <div>
                            {ap.originAuditId && (
                              <span onClick={()=>onNav("audit_record",{auditId:ap.originAuditId})}
                                style={{fontSize:12,color:C.primary,cursor:"pointer",fontFamily:F}}>
                                {ap.originAuditName?.split(" — ")[0]||ap.originAuditName}
                              </span>
                            )}
                          </div>
                          <div>
                            <span onClick={()=>onNav("employee_record",{employeeId:ap.assignedToId,employeeName:ap.assignedToName})}
                              style={{fontSize:12,color:C.primary,cursor:"pointer",fontFamily:F}}>
                              {ap.assignedToName}
                            </span>
                          </div>
                          <div style={{fontSize:12,color:C.textSec,fontFamily:F}}>{ap.dueDate}</div>
                          <div><Pill label={sm.label} color={sm.color} bg={sm.bg} sm/></div>
                          <div style={{fontSize:12,fontWeight:600,color:PRIORITY_COLOR[ap.priority]||C.textSec,fontFamily:F,textTransform:"capitalize"}}>{ap.priority}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              {/* ── Section 6: Critical Question Failure Patterns ──────────── */}
              <SectionCard title="Critical Question Failure Patterns"
                helper="Patterns surface questions that fail repeatedly — useful for targeted training or process changes.">
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 70px 80px 160px 80px",
                    gap:0,borderBottom:`1px solid ${C.border}`,paddingBottom:6,marginBottom:2}}>
                    {["Question","# Failed","Fail Rate","Most Recent Fail","Trend"].map(h=>(
                      <div key={h} style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",
                        letterSpacing:"0.05em",fontFamily:F,paddingRight:8}}>{h}</div>
                    ))}
                  </div>
                  {criticalPatterns.map((p,i)=>{
                    const trendIcon = p.trend==="improving"?"↑":p.trend==="worsening"?"↓":"→";
                    const trendCol  = p.trend==="improving"?C.success:p.trend==="worsening"?C.error:C.textMuted;
                    return (
                      <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 70px 80px 160px 80px",
                        gap:0,padding:"9px 0",borderBottom:i<criticalPatterns.length-1?`1px solid ${C.border}`:"none",alignItems:"center"}}>
                        <div style={{fontSize:12,color:C.navyDeep,fontFamily:F,paddingRight:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {p.question}
                        </div>
                        <div style={{fontSize:12,fontWeight:700,color:p.failCount>=3?C.error:C.navyDeep,fontFamily:F}}>{p.failCount}</div>
                        <div style={{fontSize:12,color:C.textSec,fontFamily:F}}>{p.failRate}%</div>
                        <div>
                          <span onClick={()=>p.lastFailAuditId&&onNav("audit_record",{auditId:p.lastFailAuditId})}
                            style={{fontSize:12,color:C.primary,cursor:"pointer",fontFamily:F}}>
                            {p.lastFailDate}
                          </span>
                        </div>
                        <div style={{fontSize:16,color:trendCol,fontWeight:700}}>{trendIcon}
                          <span style={{fontSize:10,color:C.textMuted,fontFamily:F,marginLeft:4}}>{p.trend}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              {/* ── Section 7: Employees On-site ─────────────────────────── */}
              <SectionCard title="Employees On-site">
                <FilterPills
                  options={[["all","All"],["auditors","Auditors only"],["recent","Recently active"]]}
                  selected={empFilter} onSelect={setEmpFilter}/>
                {filteredEmps.length === 0 ? (
                  <div style={{textAlign:"center",padding:"20px 0",color:C.textMuted,fontSize:12,fontFamily:F}}>
                    No employees on record for this location.
                  </div>
                ) : (
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 130px 80px 80px 140px",
                      gap:0,borderBottom:`1px solid ${C.border}`,paddingBottom:6,marginBottom:2}}>
                      {["Name","Role","Status","Audits Q","Last Activity"].map(h=>(
                        <div key={h} style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",
                          letterSpacing:"0.05em",fontFamily:F,paddingRight:8}}>{h}</div>
                      ))}
                    </div>
                    {filteredEmps.map((emp,i)=>{
                      const col = AVATAR_COLORS[parseInt(emp.id.slice(1)) % AVATAR_COLORS.length];
                      return (
                        <div key={emp.id} style={{display:"grid",gridTemplateColumns:"1fr 130px 80px 80px 140px",
                          gap:0,padding:"9px 0",borderBottom:i<filteredEmps.length-1?`1px solid ${C.border}`:"none",alignItems:"center"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:26,height:26,borderRadius:"50%",background:col,flexShrink:0,
                              display:"flex",alignItems:"center",justifyContent:"center"}}>
                              <span style={{fontSize:10,fontWeight:700,color:"white",fontFamily:F}}>{emp.initials}</span>
                            </div>
                            <span onClick={()=>onNav("employee_record",{employeeId:emp.id,employeeName:emp.name})}
                              style={{fontSize:12,fontWeight:600,color:C.primary,cursor:"pointer",fontFamily:F}}>
                              {emp.name}
                            </span>
                          </div>
                          <div style={{fontSize:12,color:C.textSec,fontFamily:F,paddingRight:8}}>{emp.role}</div>
                          <div>
                            <Pill label={emp.status==="active"?"Active":"Inactive"}
                              color={emp.status==="active"?C.success:C.textMuted}
                              bg={emp.status==="active"?C.successBg:C.bgApp} sm/>
                          </div>
                          <div style={{fontSize:12,fontWeight:600,color:C.navyDeep,fontFamily:F}}>{emp.auditsQ||0}</div>
                          <div style={{fontSize:12,color:C.textSec,fontFamily:F}}>{emp.lastActivity}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ════════════════════ DETAILS TAB ══════════════════════════════ */}
          {activeTab === "details" && (
            <div style={{ maxWidth:920, margin:"0 auto", padding:"20px 24px" }}>

              {/* 1. Location Information */}
              <SectionCard title="Location Information" collapsible defaultOpen={true}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
                  <div>
                    <EditableField label="Location Name"   value={loc.name}       fieldKey="name"       canEdit={canEdit("address")} onSave={handleSave}/>
                    <EditableField label="Location Number" value={loc.storeNum}   fieldKey="storeNum"   canEdit={canEdit("address")} onSave={handleSave}/>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Region</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.primary,cursor:"pointer" }} onClick={()=>alert("Region view coming in V2.")}>{loc.region}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>District</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.primary,cursor:"pointer" }} onClick={()=>alert("District view coming in V2.")}>{loc.district}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Division</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{division||"—"}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Location Record Type</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{loc.type||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Active</div>
                      {loc.status==="active"
                        ? <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:600 }}>Yes</span>
                        : <span style={{ fontSize:12,fontFamily:F,color:C.textMuted }}>No</span>}
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Open Date</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{openDate||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Location Types</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{locationTypes?.join(", ")||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Phone</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.primary }}>{loc.phone||"—"}</span>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* 2. Store-Specific Attributes */}
              <SectionCard title="Store-Specific Attributes" collapsible defaultOpen={true}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
                  <div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Square Footage</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500,fontVariantNumeric:"tabular-nums" }}>{squareFootage?.toLocaleString()||"—"}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Has Self-Checkout</div>
                      {hasSelfCheckout
                        ? <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:600 }}>Yes</span>
                        : <span style={{ fontSize:12,fontFamily:F,color:C.textMuted }}>No</span>}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* 3. Alarm Details */}
              <SectionCard title="Alarm Details" collapsible defaultOpen={false}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
                  <div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Alarm Authorized People</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500,whiteSpace:"pre-line" }}>{alarm?.authorizedPeople||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Alarm Contract Date</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{alarm?.contractDate||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Alarm Monthly Fee</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500,fontVariantNumeric:"tabular-nums" }}>${alarm?.monthlyFee||"—"}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Alarm Contact Phone</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.primary }}>{alarm?.contactPhone||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Alarm Contract Expiration</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{alarm?.contractExpiration||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Alarm Vendor</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{alarm?.vendor||"—"}</span>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* 4. CCTV Details */}
              <SectionCard title="CCTV Details" collapsible defaultOpen={false}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
                  <div>
                    {[["CCTV Recorder Type",cctv?.recorderType],["CCTV Recorder Brand",cctv?.recorderBrand],
                      ["CCTV Recorder Serial Number",cctv?.recorderSerialNumber],["CCTV Number of Cameras",cctv?.numberOfCameras]
                    ].map(([lbl,val])=>(
                      <div key={lbl} style={{ marginBottom:12 }}>
                        <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>{lbl}</div>
                        <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{val||"—"}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    {[["CCTV Install Date",cctv?.installDate],["CCTV Date of Last Update",cctv?.dateOfLastUpdate],
                      ["CCTV License Date",cctv?.licenseDate],["CCTV License Expiration",cctv?.licenseExpiration]
                    ].map(([lbl,val])=>(
                      <div key={lbl} style={{ marginBottom:12 }}>
                        <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>{lbl}</div>
                        <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{val||"—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* 5. Guard Details */}
              <SectionCard title="Guard Details" collapsible defaultOpen={false}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
                  <div>
                    {[["Vendor",guard?.vendor],["Industry",guard?.industry],["Guard Vendor",guard?.vendorName]].map(([lbl,val])=>(
                      <div key={lbl} style={{ marginBottom:12 }}>
                        <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>{lbl}</div>
                        <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{val||"—"}</span>
                      </div>
                    ))}
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Guard Vendor Contact Phone</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.primary }}>{guard?.vendorContactPhone||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Guard Vendor Supervisor Name</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{guard?.vendorSupervisorName||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Guard Vendor Supervisor Phone</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.primary }}>{guard?.vendorSupervisorPhone||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Guard Schedule</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{guard?.schedule||"—"}</span>
                    </div>
                  </div>
                  <div>
                    {[["Type",guard?.type],["Contract Type",guard?.contractType],
                      ["Guard Contract Date",guard?.contractDate],["Guard Contract Expiration",guard?.contractExpiration]
                    ].map(([lbl,val])=>(
                      <div key={lbl} style={{ marginBottom:12 }}>
                        <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>{lbl}</div>
                        <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{val||"—"}</span>
                      </div>
                    ))}
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Guard – Number of Guards</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{guard?.numberOfGuards||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Guard Hourly Rate</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500,fontVariantNumeric:"tabular-nums" }}>${guard?.hourlyRate||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Guard Hours per Week</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{guard?.hoursPerWeek||"—"}</span>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* 6. Key Holder List */}
              <SectionCard title="Key Holder List" collapsible defaultOpen={false}>
                <div style={{ whiteSpace:"pre-line",fontSize:12,color:C.navyDeep,fontFamily:F,marginBottom:8 }}>
                  {keyHolders?.list||"—"}
                </div>
                <div style={{ fontSize:11,color:C.textMuted,fontFamily:F }}>
                  Last reviewed: {keyHolders?.lastReviewedDate||"—"} · Reviewed by: {keyHolders?.lastReviewedBy||"—"}
                </div>
              </SectionCard>

              {/* 7. Shrink Details */}
              <SectionCard title="Shrink Details" collapsible defaultOpen={false}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
                  <div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Shrink Dollars</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500,fontVariantNumeric:"tabular-nums" }}>${shrink?.shrinkDollars||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Annual Revenue</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500,fontVariantNumeric:"tabular-nums" }}>${shrink?.annualRevenue||"—"}</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Risk Tolerance</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{shrink?.riskTolerance||"—"}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Shrink Percent</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500,fontVariantNumeric:"tabular-nums" }}>{shrink?.shrinkPercent||"—"}%</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Shrink Icon Color</div>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500 }}>{shrink?.iconColor||"—"}</span>
                        {shrink?.iconColor && (
                          <div style={{ width:12,height:12,borderRadius:3,background:shrink.iconColor,flexShrink:0,border:`1px solid ${C.border}` }}/>
                        )}
                      </div>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:3 }}>Inv Period Sales</div>
                      <span style={{ fontSize:12,fontFamily:F,color:C.navyDeep,fontWeight:500,fontVariantNumeric:"tabular-nums" }}>${shrink?.invPeriodSales||"—"}</span>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* 8. Address Details */}
              <SectionCard title="Address Details" collapsible defaultOpen={true}>
                <div style={{ marginBottom:6 }}>
                  <div style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.04em",fontFamily:F,marginBottom:6 }}>Shipping Address</div>
                  <div onClick={()=>setShowMap(true)} style={{ cursor:"pointer" }}>
                    <div style={{ fontSize:12,fontFamily:F,color:C.primary,lineHeight:1.8 }}>
                      {shippingAddress?.street}<br/>
                      {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.zip}<br/>
                      {shippingAddress?.country}
                    </div>
                  </div>
                  <button onClick={()=>setShowMap(true)}
                    style={{ marginTop:8,padding:"2px 8px",borderRadius:4,border:`1px solid ${C.border}`,
                      background:"none",fontSize:10,color:C.primary,cursor:"pointer",fontFamily:F }}>
                    View map
                  </button>
                </div>
              </SectionCard>

            </div>
          )}

          {/* ════════════════════ RELATED TAB ══════════════════════════════ */}
          {activeTab === "related" && (
            <div style={{ maxWidth:920, margin:"0 auto", padding:"20px 24px" }}>
              <SectionCard title="Related Records">
                <div style={{ padding:"24px 0",textAlign:"center",color:C.textMuted,fontSize:12,fontFamily:F }}>
                  Related records — programs, templates, parent/child locations, vendors — coming soon.
                </div>
              </SectionCard>
            </div>
          )}

          {/* ════════════════════ EMPLOYEES TAB ════════════════════════════ */}
          {activeTab === "employees" && (
            <div style={{ maxWidth:920, margin:"0 auto", padding:"20px 24px" }}>
              <SectionCard title="Employee Roster">
                <div style={{ padding:"24px 0",textAlign:"center",color:C.textMuted,fontSize:12,fontFamily:F }}>
                  Full employee roster with roles, audit counts, and activity feed — coming soon.
                </div>
              </SectionCard>
            </div>
          )}

          {/* ════════════════════ ASSETS TAB ═══════════════════════════════ */}
          {activeTab === "assets" && (
            <div style={{ maxWidth:920, margin:"0 auto", padding:"20px 24px" }}>
              <SectionCard title="Asset Inventory">
                <div style={{ padding:"24px 0",textAlign:"center",color:C.textMuted,fontSize:12,fontFamily:F }}>
                  Equipment, fixtures, and safety device inventory with inspection due dates — coming soon.
                </div>
              </SectionCard>
            </div>
          )}

          {/* ════════════════════ ACTIVITY TAB ═════════════════════════════ */}
          {activeTab === "activity" && (
            <div style={{ maxWidth:920, margin:"0 auto", padding:"20px 24px" }}>
              <SectionCard title="Activity Feed">
                <div style={{ padding:"24px 0",textAlign:"center",color:C.textMuted,fontSize:12,fontFamily:F }}>
                  Chronological feed of audits, action plans, comments, and escalations — coming soon.
                </div>
              </SectionCard>
            </div>
          )}

          {/* ════════════════════ REPORTS TAB ══════════════════════════════ */}
          {activeTab === "reports" && (
            <div style={{ display:"flex", height:"100%", overflow:"hidden" }}>
              {/* Sidebar */}
              <div style={{ width:240,borderRight:`1px solid ${C.border}`,background:C.bgSurf,
                display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto",padding:"16px 0" }}>
                <div style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",
                  letterSpacing:"0.06em",padding:"0 16px 8px",fontFamily:F}}>Reports</div>
                {DEFAULT_REPORTS.map(r=>{
                  const locked = !allowedReports.includes(r.id);
                  return (
                    <button key={r.id} onClick={()=>!locked&&setSelectedReport(r.id)}
                      style={{width:"100%",textAlign:"left",padding:"8px 16px",border:"none",
                        background: selectedReport===r.id ? C.primaryBg : "transparent",
                        color: locked ? C.textMuted : selectedReport===r.id ? C.primary : C.textSec,
                        fontSize:12,fontFamily:F,cursor:locked?"not-allowed":"pointer",
                        fontWeight:selectedReport===r.id?600:400,
                        display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      {r.label}
                      {locked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                    </button>
                  );
                })}
                <div style={{borderTop:`1px solid ${C.border}`,margin:"12px 0",paddingTop:12}}>
                  <button onClick={()=>alert("Custom report builder coming in Insights V2.")}
                    style={{width:"100%",textAlign:"left",padding:"8px 16px",border:"none",
                      background:"transparent",color:C.primary,fontSize:12,fontFamily:F,cursor:"pointer",fontWeight:600}}>
                    + Build new report
                  </button>
                </div>
              </div>

              {/* Report content */}
              <div style={{ flex:1, overflowY:"auto", padding:"20px 28px" }}>
                {/* Insights header */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:14,fontWeight:700,color:C.navyDeep,fontFamily:F}}>
                      {DEFAULT_REPORTS.find(r=>r.id===selectedReport)?.label}
                    </span>
                    <span style={{fontSize:10,fontWeight:700,color:"#fff",background:C.primary,
                      padding:"2px 6px",borderRadius:4,letterSpacing:"0.02em"}}>INSIGHTS</span>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    {DATE_RANGES.map(r=>(
                      <button key={r} onClick={()=>setDateRange(r)}
                        style={{padding:"3px 10px",borderRadius:999,border:`1px solid ${dateRange===r?C.primary:C.border}`,
                          background:dateRange===r?C.primaryBg:C.bgSurf,
                          color:dateRange===r?C.primary:C.textSec,
                          fontSize:12,fontFamily:F,cursor:"pointer",fontWeight:dateRange===r?600:400}}>
                        {r}
                      </button>
                    ))}
                    <button onClick={()=>alert("Export coming in Insights V2.")}
                      style={{padding:"3px 12px",borderRadius:999,border:`1px solid ${C.border}`,
                        background:C.bgSurf,color:C.textSec,fontSize:12,fontFamily:F,cursor:"pointer"}}>
                      Export
                    </button>
                  </div>
                </div>

                {/* Report 1: Compliance Score Trend */}
                {selectedReport === "trend" && (
                  <div style={{background:C.bgSurf,border:`1px solid ${C.border}`,borderRadius:12,padding:20}}>
                    <div style={{fontSize:12,color:C.textSec,fontFamily:F,marginBottom:16}}>
                      {loc.name}'s compliance score trend vs. district and region averages.
                    </div>
                    <div style={{display:"flex",gap:16,marginBottom:12}}>
                      {[{label:"This location",color:C.primary},{label:"District avg",color:"#0f766e"},{label:"Region avg",color:"#8692a2"}].map(s=>(
                        <div key={s.label} style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:20,height:2.5,background:s.color,borderRadius:2}}/>
                          <span style={{fontSize:10,color:C.textSec,fontFamily:F}}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                    <MultiLineChart
                      scoreTrend={reportData.scoreTrend}
                      districtTrend={reportData.districtTrend}
                      regionTrend={reportData.regionTrend}
                      labels={reportData.MONTHS_SHORT}/>
                  </div>
                )}

                {/* Report 2: Audit Volume by Template */}
                {selectedReport === "volume" && (
                  <div style={{background:C.bgSurf,border:`1px solid ${C.border}`,borderRadius:12,padding:20}}>
                    <div style={{fontSize:12,color:C.textSec,fontFamily:F,marginBottom:16}}>
                      Number of audits completed per month at this location.
                    </div>
                    <VolumeBars data={reportData.volumeTrend} labels={reportData.MONTHS_SHORT}/>
                  </div>
                )}

                {/* Report 3: AP Resolution Time */}
                {selectedReport === "apresol" && (
                  <div style={{background:C.bgSurf,border:`1px solid ${C.border}`,borderRadius:12,padding:20}}>
                    <div style={{fontSize:12,color:C.textSec,fontFamily:F,marginBottom:16}}>
                      Distribution of time to close action plans at this location.
                    </div>
                    <HBarChart items={reportData.apResolution} barColor="#0f766e"/>
                  </div>
                )}

                {/* Report 4: Top Missed Questions */}
                {selectedReport === "missed" && (
                  <div style={{background:C.bgSurf,border:`1px solid ${C.border}`,borderRadius:12,padding:20}}>
                    <div style={{fontSize:12,color:C.textSec,fontFamily:F,marginBottom:16}}>
                      Questions most frequently failed at this location across all audits.
                    </div>
                    <HBarChart items={reportData.missedQs.map(q=>({label:q.question,count:q.count}))} barColor={C.error}/>
                  </div>
                )}

                {/* Report 5: Compliance vs Peers */}
                {selectedReport === "peers" && (
                  <div style={{background:C.bgSurf,border:`1px solid ${C.border}`,borderRadius:12,padding:20}}>
                    <div style={{fontSize:12,color:C.textSec,fontFamily:F,marginBottom:16}}>
                      Compliance score comparison with similar locations (same type, same region).
                    </div>
                    <PeerBars peers={reportData.peers}/>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
