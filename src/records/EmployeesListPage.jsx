import { useState, useMemo } from "react";
import AppSidebar from "../AppSidebar.jsx";
import { EMPLOYEES_25, AVATAR_COLORS, avatarColor } from "./employeeStubData.js";
import { LOCATIONS_ALL } from "./auditStubData.js";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy:"#001e76", navyDeep:"#16191d", textSec:"#555f6d", textMuted:"#8692a2",
  bgApp:"#f4f4f6", bgSurf:"#ffffff", border:"#e2e5e9", border2:"#c3c8d0",
  primary:"#2226f7", primaryBg:"#f0f2ff",
  success:"#15803d", successBg:"#f0fdf4",
  warning:"#a16207", warningBg:"#fef9c3",
  error:"#dc2626",   errorBg:"#fef2f2",
};

// Enrich employee with location name and manager name
function enrich(e) {
  const loc = LOCATIONS_ALL.find(l => l.id === e.lId) || {};
  const mgr = EMPLOYEES_25.find(m => m.id === e.managerId) || null;
  return { ...e, locationName: loc.name || "—", region: loc.region || "—",
    managerName: mgr?.name || "—", managerId: mgr?.id || null,
    avatarColor: AVATAR_COLORS[parseInt(e.id.slice(1)) % AVATAR_COLORS.length] };
}

const ALL_EMP = EMPLOYEES_25.map(enrich);

const ALL_ROLES     = [...new Set(ALL_EMP.map(e => e.role))].sort();
const ALL_LOCATIONS = [...new Set(ALL_EMP.map(e => e.locationName))].sort();

const ROLES_DEMO = ["Program Owner","Regional Manager","District Manager","Store Manager","Employee"];

// Role-based scoping: which location IDs the viewer can see employees from
const VIEWER_LOCATION_SCOPE = {
  "Program Owner":    null,
  "Regional Manager": new Set(["L001","L002","L005","L011"]),
  "District Manager": new Set(["L001","L005"]),
  "Store Manager":    new Set(["L001"]),
  "Employee":         "self", // redirected to own record
};

function Pill({ label, color, bg, sm }) {
  return (
    <span style={{ display:"inline-flex", padding: sm ? "2px 7px" : "3px 9px",
      borderRadius:999, background: bg, border:`1px solid ${color}30`,
      fontSize: sm ? 10 : 11, fontWeight:600, color, fontFamily:F, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function Avatar({ emp, size = 32 }) {
  const col = emp.avatarColor || C.primary;
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:col, flexShrink:0,
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize: size * 0.34, fontWeight:700, color:"white", fontFamily:F }}>
        {emp.initials}
      </span>
    </div>
  );
}

function MultiDrop({ label, selected, onToggle, opts }) {
  const [open, setOpen] = useState(false);
  const n = selected.size;
  const active = n > 0;
  const display = n === 0 ? label : n === 1 ? [...selected][0] : `${n} selected`;
  return (
    <div style={{ position:"relative" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:6,
          border:`1px solid ${active ? C.primary : C.border}`,
          background: active ? C.primaryBg : C.bgSurf, color: active ? C.primary : C.textSec,
          fontSize:12, fontFamily:F, cursor:"pointer", fontWeight: active ? 600 : 400,
          maxWidth:150, whiteSpace:"nowrap" }}>
        <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>{display}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100%+4px)", left:0, zIndex:400, background:C.bgSurf,
          border:`1px solid ${C.border}`, borderRadius:8, boxShadow:"0 4px 16px rgba(0,0,0,0.1)",
          minWidth:180, maxHeight:220, overflowY:"auto", marginTop:4 }}>
          {opts.map(opt => {
            const ck = selected.has(opt);
            return (
              <button key={opt} onClick={() => onToggle(opt)}
                style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 12px",
                  background: ck ? C.primaryBg : "transparent", border:"none", color:C.navyDeep,
                  fontSize:12, fontFamily:F, cursor:"pointer" }}
                onMouseEnter={e => { if (!ck) e.currentTarget.style.background = C.bgApp; }}
                onMouseLeave={e => { if (!ck) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ width:13, height:13, borderRadius:3,
                  border:`1.5px solid ${ck ? C.primary : C.border2}`,
                  background: ck ? C.primary : "white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {ck && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{opt}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmployeeCard({ emp, onClick }) {
  return (
    <div onClick={onClick}
      style={{ background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:10, padding:16, cursor:"pointer" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; e.currentTarget.style.borderColor = C.border2; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}>
      <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
        <Avatar emp={emp} size={40} />
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.navyDeep, fontFamily:F, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{emp.name}</div>
          <div style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>{emp.role}</div>
        </div>
        <div style={{ marginLeft:"auto" }}>
          <Pill label={emp.status === "active" ? "Active" : "Inactive"}
            color={emp.status === "active" ? C.success : C.textMuted}
            bg={emp.status === "active" ? C.successBg : C.bgApp} sm />
        </div>
      </div>
      {[["Location", emp.locationName], ["Audits Q2", emp.auditsQ > 0 ? emp.auditsQ : "—"], ["Last active", emp.lastActivity]].map(([k,v]) => (
        <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:11, fontFamily:F, marginBottom:3 }}>
          <span style={{ color:C.textMuted }}>{k}</span>
          <span style={{ color:C.navyDeep, fontWeight:500 }}>{v}</span>
        </div>
      ))}
      {emp.perf.completionRate > 0 && (
        <div style={{ marginTop:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.textMuted, fontFamily:F, marginBottom:3 }}>
            <span>Completion rate</span>
            <span style={{ fontWeight:600, color: emp.perf.completionRate >= 80 ? C.success : emp.perf.completionRate >= 65 ? C.warning : C.error }}>
              {emp.perf.completionRate}%
            </span>
          </div>
          <div style={{ height:4, background:C.bgApp, borderRadius:2 }}>
            <div style={{ height:"100%", width:`${emp.perf.completionRate}%`,
              background: emp.perf.completionRate >= 80 ? C.success : emp.perf.completionRate >= 65 ? C.warning : C.error,
              borderRadius:2 }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployeesListPage({ onNav, density = "condensed" }) {
  const [search,      setSearch]      = useState("");
  const [roleSel,     setRoleSel]     = useState(new Set());
  const [locSel,      setLocSel]      = useState(new Set());
  const [statusF,     setStatusF]     = useState("All");
  const [auditorOnly, setAuditorOnly] = useState(false);
  const [sortKey,     setSortKey]     = useState("name");
  const [sortDir,     setSortDir]     = useState("asc");
  const [viewMode,    setViewMode]    = useState("row");
  const [viewerRole,  setViewerRole]  = useState("Program Owner");
  const [page,        setPage]        = useState(1);
  const PER = 20;

  // If viewer is an employee, show self-redirect notice
  if (viewerRole === "Employee") {
    return (
      <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp }}>
        <AppSidebar activeId="employees" onNav={onNav} />
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:12, padding:40, width:420, textAlign:"center" }}>
            <Avatar emp={ALL_EMP.find(e => e.id === "E002") || { initials:"?", avatarColor:C.primary }} size={52} />
            <div style={{ fontSize:18, fontWeight:700, color:C.navyDeep, fontFamily:F, marginTop:14, marginBottom:6 }}>
              You're viewing as Employee
            </div>
            <div style={{ fontSize:13, color:C.textSec, fontFamily:F, lineHeight:1.6, marginBottom:20 }}>
              Employees are routed directly to their own record rather than the full directory.
            </div>
            <button onClick={() => onNav("employee_record", { employeeId:"E002" })}
              style={{ padding:"9px 20px", borderRadius:7, border:"none", background:C.primary,
                color:"white", fontSize:13, fontFamily:F, fontWeight:600, cursor:"pointer" }}>
              View My Record →
            </button>
            <div style={{ marginTop:12 }}>
              <select value={viewerRole} onChange={e => setViewerRole(e.target.value)}
                style={{ fontSize:11, color:C.textMuted, border:"none", background:"transparent", cursor:"pointer", fontFamily:F }}>
                {ROLES_DEMO.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Role-scoped base
  const scopedBase = useMemo(() => {
    const scope = VIEWER_LOCATION_SCOPE[viewerRole];
    if (!scope) return ALL_EMP;
    return ALL_EMP.filter(e => scope.has(e.lId));
  }, [viewerRole]);

  const filtered = useMemo(() => {
    let arr = scopedBase;
    if (statusF !== "All") arr = arr.filter(e => (statusF === "Active" ? e.status === "active" : e.status === "inactive"));
    if (roleSel.size > 0)  arr = arr.filter(e => roleSel.has(e.role));
    if (locSel.size > 0)   arr = arr.filter(e => locSel.has(e.locationName));
    if (auditorOnly)       arr = arr.filter(e => e.isAuditor);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.empId.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q)
      );
    }
    return arr;
  }, [scopedBase, statusF, roleSel, locSel, auditorOnly, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "auditsQ") { av = a.auditsQ; bv = b.auditsQ; }
      if (sortKey === "lastActivity") { av = a.lastActivity; bv = b.lastActivity; }
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const paginated = sorted.slice((page - 1) * PER, page * PER);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER));

  const hasFilters = statusF !== "All" || roleSel.size > 0 || locSel.size > 0 || auditorOnly || search.trim();

  function toggleSet(setter, val) { setter(prev => { const n = new Set(prev); n.has(val) ? n.delete(val) : n.add(val); return n; }); setPage(1); }
  function toggleSort(k) { if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir("asc"); } }
  function clearFilters() { setStatusF("All"); setRoleSel(new Set()); setLocSel(new Set()); setAuditorOnly(false); setSearch(""); setPage(1); }

  // Stats
  const activeCount    = ALL_EMP.filter(e => e.status === "active").length;
  const auditorCount   = ALL_EMP.filter(e => e.isAuditor).length;
  const newThisMonth   = ALL_EMP.filter(e => e.newThisMonth).length;
  const inactiveCount  = ALL_EMP.filter(e => e.status === "inactive").length;

  function SortIcon({ k }) {
    if (sortKey !== k) return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 5 19 12"/></svg>;
    return sortDir === "asc"
      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
      : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;
  }

  const compact = density === "condensed";
  const rowH = compact ? 48 : 56;

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp, overflow:"hidden" }}>
      <AppSidebar activeId="employees" onNav={onNav} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        {/* ── Header ── */}
        <div style={{ height:52, background:C.bgSurf, borderBottom:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", padding:"0 24px", gap:12, flexShrink:0 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.navyDeep }}>Employees</div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
            {/* Viewer role selector */}
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px",
              background:C.primaryBg, borderRadius:6, border:`1px solid ${C.primary}30` }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <select value={viewerRole} onChange={e => { setViewerRole(e.target.value); setPage(1); }}
                style={{ border:"none", background:"transparent", color:C.primary, fontSize:11, fontFamily:F, fontWeight:600, cursor:"pointer", outline:"none" }}>
                {ROLES_DEMO.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            {/* Export CSV stub */}
            <button onClick={() => alert("CSV export coming soon.")}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:6,
                border:`1px solid ${C.border}`, background:C.bgSurf, color:C.navyDeep,
                fontSize:12, fontFamily:F, cursor:"pointer" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
            {/* Search */}
            <div style={{ position:"relative" }}>
              <svg style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search employees…"
                style={{ padding:"6px 10px 6px 28px", borderRadius:7, border:`1px solid ${C.border}`,
                  fontSize:12, fontFamily:F, color:C.navyDeep, outline:"none", width:200, background:C.bgSurf }}
                onFocus={e => e.target.style.borderColor = C.primary}
                onBlur={e => e.target.style.borderColor = C.border} />
            </div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div style={{ background:C.bgSurf, borderBottom:`1px solid ${C.border}`, padding:"10px 24px",
          display:"flex", gap:24, flexShrink:0 }}>
          {[
            { label:`${activeCount} active employees`, color:C.primary },
            { label:`${auditorCount} auditors`,         color:C.success },
            { label:`${newThisMonth} new this month`,   color:C.info    },
            { label:`${inactiveCount} inactive`,        color:C.textMuted },
          ].map(({ label, color }) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:999, background:color }} />
              <span style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Filter bar ── */}
        <div style={{ background:C.bgSurf, borderBottom:`1px solid ${C.border}`, padding:"8px 24px",
          display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", flexShrink:0 }}>
          <MultiDrop label="Role" selected={roleSel} onToggle={v => toggleSet(setRoleSel, v)} opts={ALL_ROLES} />
          <MultiDrop label="Location" selected={locSel} onToggle={v => toggleSet(setLocSel, v)} opts={ALL_LOCATIONS} />
          {/* Status dropdown */}
          {["All","Active","Inactive"].map(opt => (
            <button key={opt} onClick={() => { setStatusF(opt); setPage(1); }}
              style={{ padding:"5px 10px", borderRadius:6,
                border:`1px solid ${statusF === opt && opt !== "All" ? C.primary : C.border}`,
                background: statusF === opt && opt !== "All" ? C.primaryBg : "transparent",
                color: statusF === opt && opt !== "All" ? C.primary : C.textSec,
                fontSize:12, fontFamily:F, cursor:"pointer", fontWeight: statusF === opt && opt !== "All" ? 600 : 400 }}>
              {opt}
            </button>
          ))}
          {/* Auditor-only toggle */}
          <button onClick={() => { setAuditorOnly(o => !o); setPage(1); }}
            style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:6,
              border:`1px solid ${auditorOnly ? C.primary : C.border}`,
              background: auditorOnly ? C.primaryBg : "transparent",
              color: auditorOnly ? C.primary : C.textSec, fontSize:12, fontFamily:F, cursor:"pointer",
              fontWeight: auditorOnly ? 600 : 400 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Auditors only
          </button>
          {hasFilters && (
            <button onClick={clearFilters}
              style={{ padding:"5px 10px", borderRadius:6, border:"none", background:"transparent",
                color:C.textMuted, fontSize:12, fontFamily:F, cursor:"pointer", textDecoration:"underline" }}>
              Clear all
            </button>
          )}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>{sorted.length} employees</span>
            {["row","grid"].map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                style={{ width:28, height:28, borderRadius:5,
                  border:`1px solid ${viewMode === v ? C.primary : C.border}`,
                  background: viewMode === v ? C.primaryBg : C.bgSurf, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color: viewMode === v ? C.primary : C.textMuted }}>
                {v === "row"
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {viewMode === "grid" ? (
            <div style={{ padding:"16px 24px", display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:12 }}>
              {paginated.map(e => (
                <EmployeeCard key={e.id} emp={e} onClick={() => onNav("employee_record", { employeeId: e.id })} />
              ))}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div style={{ background:C.bgSurf, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:10 }}>
                <div style={{ display:"grid",
                  gridTemplateColumns:"28px 220px 90px 140px 150px 150px 90px 80px 120px 36px",
                  gap:8, padding:"0 16px", height:34, alignItems:"center" }}>
                  <div />
                  {[
                    { k:"name",         label:"Name"              },
                    { k:"empId",        label:"ID"                },
                    { k:"role",         label:"Role"              },
                    { k:"locationName", label:"Location"          },
                    { k:null,           label:"Manager"           },
                    { k:null,           label:"Status"            },
                    { k:"auditsQ",      label:"Audits Q2"         },
                    { k:"lastActivity", label:"Last Active"       },
                    { k:null,           label:""                  },
                  ].map(({ k, label }) => (
                    <div key={label} onClick={() => k && toggleSort(k)}
                      style={{ display:"flex", alignItems:"center", gap:3,
                        cursor: k ? "pointer" : "default",
                        fontSize:10, fontWeight:700,
                        color: k && sortKey === k ? C.primary : C.textMuted,
                        textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, userSelect:"none" }}>
                      {label}{k && <SortIcon k={k} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              {paginated.map(e => (
                <div key={e.id}
                  onClick={() => onNav("employee_record", { employeeId: e.id })}
                  style={{ display:"grid",
                    gridTemplateColumns:"28px 220px 90px 140px 150px 150px 90px 80px 120px 36px",
                    gap:8, padding:"0 16px", height:rowH, alignItems:"center",
                    background:C.bgSurf, borderBottom:`1px solid ${C.border}`, cursor:"pointer" }}
                  onMouseEnter={ev => ev.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={ev => ev.currentTarget.style.background = C.bgSurf}>

                  <div onClick={ev => ev.stopPropagation()}
                    style={{ width:15, height:15, borderRadius:3, border:`1.5px solid ${C.border2}`, background:"white" }} />

                  {/* Name + email */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                    <Avatar emp={e} size={28} />
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F,
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.name}</div>
                      <div style={{ fontSize:10, color:C.textMuted, fontFamily:F,
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.email}</div>
                    </div>
                  </div>

                  <div style={{ fontSize:11, color:C.textSec, fontFamily:F }}>{e.empId}</div>
                  <div style={{ fontSize:11, color:C.navyDeep, fontFamily:F, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.role}</div>
                  <div style={{ fontSize:11, color:C.navyDeep, fontFamily:F, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.locationName}</div>

                  {/* Manager (clickable) */}
                  <div style={{ fontSize:11, color: e.managerId ? C.primary : C.textMuted, fontFamily:F,
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                    cursor: e.managerId ? "pointer" : "default" }}
                    onClick={ev => { if (e.managerId) { ev.stopPropagation(); onNav("employee_record", { employeeId: e.managerId }); } }}>
                    {e.managerName}
                  </div>

                  <div>
                    <Pill label={e.status === "active" ? "Active" : "Inactive"}
                      color={e.status === "active" ? C.success : C.textMuted}
                      bg={e.status === "active" ? C.successBg : C.bgApp} sm />
                  </div>

                  <div style={{ fontSize:12, color: e.auditsQ > 0 ? C.navyDeep : C.textMuted,
                    fontWeight: e.auditsQ > 0 ? 600 : 400, fontFamily:F }}>
                    {e.auditsQ > 0 ? e.auditsQ : "—"}
                  </div>

                  <div style={{ fontSize:11, color:C.textSec, fontFamily:F,
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {e.lastActivity}
                  </div>

                  {/* Kebab */}
                  <div onClick={ev => ev.stopPropagation()}>
                    <button
                      style={{ width:28, height:28, borderRadius:5, border:"none", background:"transparent",
                        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.textMuted }}
                      onMouseEnter={ev => ev.currentTarget.style.background = C.bgApp}
                      onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}
                      onClick={() => onNav("employee_record", { employeeId: e.id })}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                    </button>
                  </div>
                </div>
              ))}

              {paginated.length === 0 && (
                <div style={{ textAlign:"center", padding:"80px 0", color:C.textMuted, fontFamily:F }}>
                  {hasFilters
                    ? <><div style={{ fontSize:14, marginBottom:8 }}>No employees match your filters.</div>
                        <button onClick={clearFilters} style={{ fontSize:12, color:C.primary, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", fontFamily:F }}>Clear filters</button></>
                    : <div style={{ fontSize:14 }}>No employees yet.</div>}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {sorted.length > PER && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"12px 24px", background:C.bgSurf, borderTop:`1px solid ${C.border}` }}>
              <span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>
                Showing {(page-1)*PER+1}–{Math.min(page*PER, sorted.length)} of {sorted.length}
              </span>
              <div style={{ display:"flex", gap:4 }}>
                {[...Array(totalPages)].map((_,i) => (
                  <button key={i} onClick={() => setPage(i+1)}
                    style={{ width:30, height:30, borderRadius:"50%", border:"none",
                      background: page===i+1 ? C.navy : "transparent",
                      color: page===i+1 ? "white" : C.navy,
                      fontSize:12, fontFamily:F, cursor:"pointer", fontWeight: page===i+1 ? 700 : 400 }}>
                    {i+1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
