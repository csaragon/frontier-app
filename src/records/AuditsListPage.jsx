import { useState, useMemo } from "react";
import AppSidebar from "../AppSidebar.jsx";
import { AUDITS_50, LOCATIONS_ALL, AUDITORS_ALL, PROGRAMS_ALL, TEMPLATES_ALL } from "./auditStubData.js";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy:"#001e76", navyDeep:"#16191d", textSec:"#555f6d", textMuted:"#8692a2",
  bgApp:"#f4f4f6", bgSurf:"#ffffff", border:"#e2e5e9", border2:"#c3c8d0",
  primary:"#2226f7", primaryBg:"#f0f2ff",
  success:"#15803d", successBg:"#f0fdf4",
  warning:"#a16207", warningBg:"#fef9c3",
  error:"#dc2626",   errorBg:"#fef2f2",
  info:"#0369a1",    infoBg:"#f0f9ff",
  purple:"#7c3aed",  purpleBg:"#f5f3ff",
};

const STATUS_META = {
  completed:   { label:"Completed",   color:C.success, bg:C.successBg },
  in_progress: { label:"In Progress", color:C.warning, bg:C.warningBg },
  overdue:     { label:"Overdue",     color:C.error,   bg:C.errorBg   },
  not_started: { label:"Not Started", color:C.textMuted, bg:C.bgApp   },
};

function scoreColor(s) {
  if (s == null) return C.textMuted;
  if (s >= 85) return C.success;
  if (s >= 70) return C.warning;
  return C.error;
}

function scoreBg(s) {
  if (s == null) return C.bgApp;
  if (s >= 85) return C.successBg;
  if (s >= 70) return C.warningBg;
  return C.errorBg;
}

// Enrich audit records with lookup data
function enrich(a) {
  const loc  = LOCATIONS_ALL.find(l => l.id === a.lId) || {};
  const aud  = AUDITORS_ALL.find(e => e.id === a.eId) || {};
  const prog = PROGRAMS_ALL.find(p => p.id === a.pId) || {};
  const tmpl = TEMPLATES_ALL.find(t => t.id === a.tId) || {};
  return { ...a, location: loc.name || "—", locationId: loc.id, region: loc.region,
    auditor: aud.name || "—", auditorId: aud.id,
    program: prog.name || "—", programId: prog.id,
    template: tmpl.name || "—", version: tmpl.version || "", templateId: tmpl.id };
}

const ALL_AUDITS = AUDITS_50.map(enrich);
const APRIL_2026_IDS = new Set(ALL_AUDITS.filter(a => a.date.includes("Apr")).map(a => a.id));

// ── Role definitions ───────────────────────────────────────────────────────────
const ROLES = ["Program Owner", "Regional Manager", "District Manager", "Store Manager", "Employee"];
const ROLE_SCOPE = {
  "Program Owner":    null, // all
  "Regional Manager": new Set(["L001","L002","L005","L011"]), // Northeast
  "District Manager": new Set(["L001","L005"]),
  "Store Manager":    new Set(["L001"]),
  "Employee":         new Set(["A001","A009","A020","A025"]), // only audits they did
};

// ── Small UI components ────────────────────────────────────────────────────────
function Pill({ label, color, bg }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 9px", borderRadius:999,
      background: bg, border:`1px solid ${color}30`, fontSize:11, fontWeight:600,
      color, fontFamily:F, whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function FilterDrop({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const active = value !== "All" && value !== options[0];
  return (
    <div style={{ position:"relative" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:6,
          border:`1px solid ${active ? C.primary : C.border}`,
          background: active ? C.primaryBg : C.bgSurf, color: active ? C.primary : C.textSec,
          fontSize:12, fontFamily:F, cursor:"pointer", fontWeight: active ? 600 : 400 }}>
        {value}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:400, background:C.bgSurf,
          border:`1px solid ${C.border}`, borderRadius:8, boxShadow:"0 4px 16px rgba(0,0,0,0.1)",
          minWidth:160, overflow:"hidden" }}>
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              style={{ display:"block", width:"100%", padding:"8px 12px", textAlign:"left",
                background: value === opt ? C.primaryBg : "transparent", border:"none",
                color: value === opt ? C.primary : C.navyDeep, fontSize:12, fontFamily:F, cursor:"pointer" }}
              onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = C.bgApp; }}
              onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = "transparent"; }}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MultiFilterDrop({ label, selected, onToggle, options }) {
  const [open, setOpen] = useState(false);
  const n = selected.size;
  const display = n === 0 ? label : n === 1 ? [...selected][0] : `${n} selected`;
  const active = n > 0;
  return (
    <div style={{ position:"relative" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:6,
          border:`1px solid ${active ? C.primary : C.border}`,
          background: active ? C.primaryBg : C.bgSurf, color: active ? C.primary : C.textSec,
          fontSize:12, fontFamily:F, cursor:"pointer", fontWeight: active ? 600 : 400,
          maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:120 }}>{display}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink:0 }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:400, background:C.bgSurf,
          border:`1px solid ${C.border}`, borderRadius:8, boxShadow:"0 4px 16px rgba(0,0,0,0.1)",
          minWidth:200, maxHeight:240, overflowY:"auto" }}>
          {options.map(opt => {
            const ck = selected.has(opt);
            return (
              <button key={opt} onClick={() => onToggle(opt)}
                style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 12px",
                  background: ck ? C.primaryBg : "transparent", border:"none", color:C.navyDeep,
                  fontSize:12, fontFamily:F, cursor:"pointer" }}
                onMouseEnter={e => { if (!ck) e.currentTarget.style.background = C.bgApp; }}
                onMouseLeave={e => { if (!ck) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ width:13, height:13, borderRadius:3, border:`1.5px solid ${ck ? C.primary : C.border2}`,
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

function KebabMenu({ audit, onView, onNav }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{ width:28, height:28, borderRadius:5, border:"none", background:"transparent",
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.textMuted }}
        onMouseEnter={e => e.currentTarget.style.background = C.bgApp}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
      </button>
      {open && (
        <div onClick={e => e.stopPropagation()} style={{ position:"absolute", right:0, top:"calc(100% + 4px)", zIndex:500,
          background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:8,
          boxShadow:"0 4px 16px rgba(0,0,0,0.1)", minWidth:160, overflow:"hidden" }}>
          {[
            ["View", () => { onView(); setOpen(false); }],
            ["Export PDF", () => { alert("PDF export coming soon."); setOpen(false); }],
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
  );
}

// ── Card for grid view ─────────────────────────────────────────────────────────
function AuditCard({ audit, onClick }) {
  const sm = STATUS_META[audit.status];
  const sc = audit.score;
  return (
    <div onClick={onClick}
      style={{ background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:10, padding:16,
        cursor:"pointer", transition:"box-shadow 0.12s, border-color 0.12s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = C.border2; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}>
      {/* Score circle */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div style={{ width:56, height:56, borderRadius:12, background: sc ? scoreBg(sc) : C.bgApp,
          border:`2px solid ${sc ? scoreColor(sc) + "40" : C.border}`,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          {sc ? (
            <>
              <span style={{ fontSize:18, fontWeight:800, color:scoreColor(sc), lineHeight:1, fontFamily:F }}>{sc}</span>
              <span style={{ fontSize:9, fontWeight:600, color:scoreColor(sc), fontFamily:F }}>%</span>
            </>
          ) : <span style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>—</span>}
        </div>
        <Pill label={sm.label} color={sm.color} bg={sm.bg} />
      </div>
      <div style={{ fontSize:13, fontWeight:600, color:C.navyDeep, fontFamily:F, marginBottom:4,
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{audit.name}</div>
      <div style={{ fontSize:11, color:C.textMuted, fontFamily:F, marginBottom:10,
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {audit.template} {audit.version}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
        {[["Location", audit.location], ["Auditor", audit.auditor], ["Date", audit.date]].map(([k, v]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:11, fontFamily:F }}>
            <span style={{ color:C.textMuted }}>{k}</span>
            <span style={{ color:C.navyDeep, fontWeight:500, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v}</span>
          </div>
        ))}
      </div>
      {audit.cf > 0 && (
        <div style={{ marginTop:10, padding:"4px 8px", background:C.errorBg, borderRadius:5, display:"inline-flex", alignItems:"center", gap:4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.error} strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style={{ fontSize:10, fontWeight:700, color:C.error, fontFamily:F }}>{audit.cf} critical fail{audit.cf > 1 ? "s" : ""}</span>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AuditsListPage({ onNav, density = "condensed" }) {
  const [search,     setSearch]     = useState("");
  const [statusF,    setStatusF]    = useState("All");
  const [dateF,      setDateF]      = useState("All time");
  const [templateSel,setTemplateSel]= useState(new Set());
  const [programSel, setProgramSel] = useState(new Set());
  const [locationSel,setLocationSel]= useState(new Set());
  const [auditorSel, setAuditorSel] = useState(new Set());
  const [critOnly,   setCritOnly]   = useState(false);
  const [sortKey,    setSortKey]    = useState("date");
  const [sortDir,    setSortDir]    = useState("desc");
  const [viewMode,   setViewMode]   = useState("row");
  const [role,       setRole]       = useState("Program Owner");
  const [page,       setPage]       = useState(1);
  const PER = 20;

  // Role-based base set
  const roleBase = useMemo(() => {
    const scope = ROLE_SCOPE[role];
    if (!scope) return ALL_AUDITS;
    if (role === "Employee") return ALL_AUDITS.filter(a => scope.has(a.id));
    return ALL_AUDITS.filter(a => scope.has(a.lId));
  }, [role]);

  // Filter + search
  const filtered = useMemo(() => {
    let arr = roleBase;
    if (statusF !== "All") arr = arr.filter(a => STATUS_META[a.status]?.label === statusF);
    if (dateF === "Last 7 days")   arr = arr.filter(a => a.date.includes("Apr 2") || a.date.includes("Apr 1"));
    if (dateF === "Last 30 days")  arr = arr.filter(a => APRIL_2026_IDS.has(a.id) || a.date.includes("Mar"));
    if (templateSel.size > 0) arr = arr.filter(a => templateSel.has(a.template));
    if (programSel.size > 0)  arr = arr.filter(a => programSel.has(a.program));
    if (locationSel.size > 0) arr = arr.filter(a => locationSel.has(a.location));
    if (auditorSel.size > 0)  arr = arr.filter(a => auditorSel.has(a.auditor));
    if (critOnly) arr = arr.filter(a => a.cf > 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.auditor.toLowerCase().includes(q) ||
        a.template.toLowerCase().includes(q)
      );
    }
    return arr;
  }, [roleBase, statusF, dateF, templateSel, programSel, locationSel, auditorSel, critOnly, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "score") { av = av ?? -1; bv = bv ?? -1; }
      if (sortKey === "cf")   { av = av ?? 0;  bv = bv ?? 0;  }
      if (sortKey === "date") { av = a.date; bv = b.date; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const paginated = sorted.slice((page - 1) * PER, page * PER);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER));

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  }

  function toggleSet(setter, val) {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val); else next.add(val);
      return next;
    });
    setPage(1);
  }

  function clearFilters() {
    setStatusF("All"); setDateF("All time"); setTemplateSel(new Set());
    setProgramSel(new Set()); setLocationSel(new Set()); setAuditorSel(new Set());
    setCritOnly(false); setSearch(""); setPage(1);
  }

  const hasFilters = statusF !== "All" || dateF !== "All time" || templateSel.size > 0 ||
    programSel.size > 0 || locationSel.size > 0 || auditorSel.size > 0 || critOnly || search.trim();

  // Quick stats
  const completedThisMonth = ALL_AUDITS.filter(a => a.status === "completed" && APRIL_2026_IDS.has(a.id)).length;
  const inProgress = ALL_AUDITS.filter(a => a.status === "in_progress").length;
  const overdue = ALL_AUDITS.filter(a => a.status === "overdue").length;
  const completedWithScore = ALL_AUDITS.filter(a => a.score != null);
  const avgScore = completedWithScore.length
    ? Math.round(completedWithScore.reduce((acc, a) => acc + a.score, 0) / completedWithScore.length)
    : 0;

  // SortIcon
  function SortIcon({ k }) {
    if (sortKey !== k) return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 5 19 12"/></svg>;
    return sortDir === "asc"
      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
      : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;
  }

  const compact = density === "condensed";
  const rowH = compact ? 44 : 52;

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp, overflow:"hidden" }}>
      <AppSidebar activeId="audits" onNav={onNav} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        {/* ── Top header ── */}
        <div style={{ height:52, background:C.bgSurf, borderBottom:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", padding:"0 24px", gap:12, flexShrink:0 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.navyDeep, fontFamily:F }}>Audits</div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
            {/* Role selector for demo */}
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px",
              background:C.primaryBg, borderRadius:6, border:`1px solid ${C.primary}30` }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
                style={{ border:"none", background:"transparent", color:C.primary, fontSize:11, fontFamily:F, fontWeight:600, cursor:"pointer", outline:"none" }}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            {/* Search */}
            <div style={{ position:"relative" }}>
              <svg style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search audits…"
                style={{ padding:"6px 10px 6px 28px", borderRadius:7, border:`1px solid ${C.border}`,
                  fontSize:12, fontFamily:F, color:C.navyDeep, outline:"none", width:200, background:C.bgSurf }}
                onFocus={e => (e.target.style.borderColor = C.primary)}
                onBlur={e => (e.target.style.borderColor = C.border)} />
            </div>
          </div>
        </div>

        {/* ── Quick stats bar ── */}
        <div style={{ background:C.bgSurf, borderBottom:`1px solid ${C.border}`, padding:"10px 24px",
          display:"flex", gap:24, flexShrink:0 }}>
          {[
            { label:`${completedThisMonth} this month`,      color:C.primary },
            { label:`${inProgress} in progress`,             color:C.warning },
            { label:`${overdue} overdue`,                    color:C.error   },
            { label:`Avg compliance score: ${avgScore}%`,    color:C.success },
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
          <FilterDrop label="Status" value={statusF} onChange={v => { setStatusF(v); setPage(1); }}
            options={["All", "Completed", "In Progress", "Overdue", "Not Started"]} />
          <FilterDrop label="Date range" value={dateF} onChange={v => { setDateF(v); setPage(1); }}
            options={["All time", "Last 7 days", "Last 30 days", "This quarter"]} />
          <MultiFilterDrop label="Template" selected={templateSel} onToggle={v => toggleSet(setTemplateSel, v)}
            options={[...new Set(ALL_AUDITS.map(a => a.template))].sort()} />
          <MultiFilterDrop label="Program" selected={programSel} onToggle={v => toggleSet(setProgramSel, v)}
            options={[...new Set(ALL_AUDITS.map(a => a.program))].sort()} />
          <MultiFilterDrop label="Location" selected={locationSel} onToggle={v => toggleSet(setLocationSel, v)}
            options={[...new Set(ALL_AUDITS.map(a => a.location))].sort()} />
          <MultiFilterDrop label="Auditor" selected={auditorSel} onToggle={v => toggleSet(setAuditorSel, v)}
            options={[...new Set(ALL_AUDITS.map(a => a.auditor))].sort()} />
          {/* Critical fails toggle */}
          <button onClick={() => { setCritOnly(o => !o); setPage(1); }}
            style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:6,
              border:`1px solid ${critOnly ? C.error : C.border}`,
              background: critOnly ? C.errorBg : C.bgSurf, color: critOnly ? C.error : C.textSec,
              fontSize:12, fontFamily:F, cursor:"pointer", fontWeight: critOnly ? 600 : 400 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            Critical fails only
          </button>
          {hasFilters && (
            <button onClick={clearFilters}
              style={{ padding:"5px 10px", borderRadius:6, border:"none", background:"transparent",
                color:C.textMuted, fontSize:12, fontFamily:F, cursor:"pointer", textDecoration:"underline" }}>
              Clear all
            </button>
          )}

          {/* View toggle + sort — pushed right */}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>{sorted.length} audits</span>
            {["row","grid"].map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                style={{ width:28, height:28, borderRadius:5, border:`1px solid ${viewMode === v ? C.primary : C.border}`,
                  background: viewMode === v ? C.primaryBg : C.bgSurf, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", color: viewMode === v ? C.primary : C.textMuted }}>
                {v === "row"
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {viewMode === "grid" ? (
            <div style={{ padding:"16px 24px", display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:12 }}>
              {paginated.map(a => (
                <AuditCard key={a.id} audit={a} onClick={() => onNav("audit_record", { auditId: a.id })} />
              ))}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div style={{ background:C.bgSurf, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:10 }}>
                <div style={{ display:"grid",
                  gridTemplateColumns:"28px 1fr 150px 130px 105px 72px 70px 100px 70px 36px",
                  gap:8, padding:`0 16px`, alignItems:"center", height:34 }}>
                  {/* checkbox placeholder */}
                  <div />
                  {[
                    { k:"name",  label:"Audit / Template"  },
                    { k:null,    label:"Location"           },
                    { k:null,    label:"Auditor"            },
                    { k:"status",label:"Status"             },
                    { k:"score", label:"Score"              },
                    { k:"cf",    label:"Crit. Fails"        },
                    { k:"date",  label:"Date"               },
                    { k:"ap",    label:"Action Plans"       },
                    { k:null,    label:""                   },
                  ].map(({ k, label }) => (
                    <div key={label} onClick={() => k && toggleSort(k)}
                      style={{ display:"flex", alignItems:"center", gap:3, cursor: k ? "pointer" : "default",
                        fontSize:10, fontWeight:700, color: k && sortKey === k ? C.primary : C.textMuted,
                        textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F,
                        userSelect:"none" }}>
                      {label}
                      {k && <SortIcon k={k} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div style={{ display:"flex", flexDirection:"column" }}>
                {paginated.map(a => {
                  const sm = STATUS_META[a.status];
                  return (
                    <div key={a.id}
                      onClick={() => onNav("audit_record", { auditId: a.id })}
                      style={{ display:"grid",
                        gridTemplateColumns:"28px 1fr 150px 130px 105px 72px 70px 100px 70px 36px",
                        gap:8, padding:`0 16px`, alignItems:"center", height:rowH,
                        background:C.bgSurf, borderBottom:`1px solid ${C.border}`, cursor:"pointer",
                        transition:"background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                      onMouseLeave={e => e.currentTarget.style.background = C.bgSurf}>
                      {/* checkbox */}
                      <div onClick={e => e.stopPropagation()}
                        style={{ width:15, height:15, borderRadius:3, border:`1.5px solid ${C.border2}`, background:"white" }} />

                      {/* Name + template */}
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.name}</div>
                        <div style={{ fontSize:11, color:C.textMuted, fontFamily:F, marginTop:1,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {a.template} · {a.version}
                        </div>
                      </div>

                      {/* Location */}
                      <div style={{ fontSize:12, color:C.primary, fontFamily:F, cursor:"pointer",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                        textDecoration:"none" }}
                        onClick={e => { e.stopPropagation(); onNav("location_record", { locationId: a.lId, locationName: a.location, fromAudit: a.id }); }}>
                        {a.location}
                      </div>

                      {/* Auditor */}
                      <div style={{ fontSize:12, color:C.primary, fontFamily:F, cursor:"pointer",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
                        onClick={e => { e.stopPropagation(); onNav("employee_record", { employeeId: a.eId, employeeName: a.auditor, fromAudit: a.id }); }}>
                        {a.auditor}
                      </div>

                      {/* Status */}
                      <div><Pill label={sm.label} color={sm.color} bg={sm.bg} /></div>

                      {/* Score */}
                      <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                        {a.score != null ? (
                          <span style={{ fontSize:13, fontWeight:700, color:scoreColor(a.score), fontFamily:F }}>
                            {a.score}%
                          </span>
                        ) : <span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>—</span>}
                      </div>

                      {/* Critical fails */}
                      <div>
                        {a.cf > 0 ? (
                          <span style={{ fontSize:12, fontWeight:700, color:C.error, fontFamily:F,
                            display:"flex", alignItems:"center", gap:3 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.error} strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            {a.cf}
                          </span>
                        ) : <span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>0</span>}
                      </div>

                      {/* Date */}
                      <div style={{ fontSize:11, color: a.status === "overdue" ? C.error : C.textSec,
                        fontWeight: a.status === "overdue" ? 600 : 400, fontFamily:F,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {a.date}
                      </div>

                      {/* Action plans */}
                      <div style={{ fontSize:12, color: a.ap > 0 ? C.warning : C.textMuted, fontWeight: a.ap > 0 ? 600 : 400, fontFamily:F }}>
                        {a.ap > 0 ? a.ap : "—"}
                      </div>

                      {/* Kebab */}
                      <div onClick={e => e.stopPropagation()}>
                        <KebabMenu audit={a} onView={() => onNav("audit_record", { auditId: a.id })} onNav={onNav} />
                      </div>
                    </div>
                  );
                })}

                {paginated.length === 0 && (
                  <div style={{ textAlign:"center", padding:"80px 0", color:C.textMuted, fontFamily:F }}>
                    {hasFilters
                      ? <><div style={{ fontSize:14, marginBottom:8 }}>No audits match your filters.</div>
                          <button onClick={clearFilters} style={{ fontSize:12, color:C.primary, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", fontFamily:F }}>Clear filters</button></>
                      : <div style={{ fontSize:14 }}>No audits yet. Audits will appear here as they're scheduled and completed.</div>}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Pagination */}
          {sorted.length > PER && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"12px 24px", background:C.bgSurf, borderTop:`1px solid ${C.border}` }}>
              <span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>
                Showing {(page - 1) * PER + 1}–{Math.min(page * PER, sorted.length)} of {sorted.length}
              </span>
              <div style={{ display:"flex", gap:4 }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    style={{ width:30, height:30, borderRadius:"50%", border:"none",
                      background: page === i + 1 ? C.navy : "transparent",
                      color: page === i + 1 ? "white" : C.navy,
                      fontSize:12, fontFamily:F, cursor:"pointer", fontWeight: page === i + 1 ? 700 : 400 }}>
                    {i + 1}
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
