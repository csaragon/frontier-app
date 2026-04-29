import { useState, useMemo } from "react";
import AppSidebar from "../AppSidebar.jsx";
import { LOCATIONS_30 } from "./locationStubData.js";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy:"#001e76", navyDeep:"#16191d", textSec:"#555f6d", textMuted:"#8692a2",
  bgApp:"#f4f4f6", bgSurf:"#ffffff", border:"#e2e5e9",
  primary:"#2226f7", primaryBg:"#f0f2ff",
  success:"#15803d", successBg:"#f0fdf4",
  warning:"#a16207", warningBg:"#fef9c3",
  error:"#dc2626",   errorBg:"#fef2f2",
};

const STATUS_META = {
  active:             { label:"Active",            color:C.success, bg:C.successBg },
  inactive:           { label:"Inactive",          color:C.textMuted, bg:C.bgApp   },
  under_construction: { label:"Under Construction",color:C.warning, bg:C.warningBg },
};

const VIEWER_ROLES = ["Program Owner","Regional Manager","District Manager","Store Manager","Employee"];

// Which location IDs each role can see
const VIEWER_SCOPE = {
  "Program Owner":    null,
  "Regional Manager": new Set(["L001","L002","L005","L011","L013","L014","L015"]),
  "District Manager": new Set(["L001","L005","L013"]),
  "Store Manager":    "own",
  "Employee":         "none",
};

const ALL_REGIONS   = [...new Set(LOCATIONS_30.map(l => l.region))].sort();
const ALL_DISTRICTS = [...new Set(LOCATIONS_30.map(l => l.district))].sort();
const ALL_TYPES     = [...new Set(LOCATIONS_30.map(l => l.type))].sort();
const ALL_STATUSES  = ["active","inactive","under_construction"];

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

function Pill({ label, color, bg, sm }) {
  return (
    <span style={{ display:"inline-flex", padding: sm ? "2px 7px" : "3px 9px",
      borderRadius:999, background:bg, border:`1px solid ${color}30`,
      fontSize: sm ? 10 : 11, fontWeight:600, color, fontFamily:F, whiteSpace:"nowrap" }}>
      {label}
    </span>
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
          maxWidth:170, whiteSpace:"nowrap" }}>
        <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>{display}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:400, background:C.bgSurf,
          border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 0", minWidth:160, boxShadow:"0 4px 16px rgba(0,0,0,0.1)" }}>
          {opts.map(o => (
            <label key={o} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px",
              cursor:"pointer", fontSize:12, fontFamily:F, color:C.navyDeep }}
              onMouseEnter={e => e.currentTarget.style.background = C.bgApp}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <input type="checkbox" checked={selected.has(o)} onChange={() => onToggle(o)}
                style={{ accentColor:C.primary, cursor:"pointer" }} />
              {o}
            </label>
          ))}
          {selected.size > 0 && (
            <button onClick={() => opts.forEach(o => selected.has(o) && onToggle(o))}
              style={{ display:"block", width:"100%", textAlign:"left", padding:"6px 12px",
                background:"none", border:"none", borderTop:`1px solid ${C.border}`, marginTop:4,
                fontSize:11, color:C.primary, cursor:"pointer", fontFamily:F }}>
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function KebabMenu({ loc, onNav }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{ width:28, height:28, borderRadius:6, border:`1px solid ${C.border}`, background:C.bgSurf,
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.textMuted }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
      </button>
      {open && (
        <div onClick={e => e.stopPropagation()} style={{ position:"absolute", right:0, top:"calc(100%+4px)", zIndex:500,
          background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:8, padding:"4px 0", minWidth:140,
          boxShadow:"0 4px 16px rgba(0,0,0,0.1)" }}>
          {[
            ["View Record", () => onNav("location_record",{ locationId:loc.id, locationName:loc.name })],
            ["Generate Report", () => alert("Report generation coming in Insights R2.")],
            ["Deactivate", () => alert("Deactivate: available in full release.")],
          ].map(([label, fn]) => (
            <button key={label} onClick={() => { fn(); setOpen(false); }}
              style={{ display:"block", width:"100%", textAlign:"left", padding:"7px 14px",
                background:"none", border:"none", fontSize:12, fontFamily:F, color:C.navyDeep, cursor:"pointer" }}
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

function LocationCard({ loc, onNav }) {
  const sm = STATUS_META[loc.status] || STATUS_META.active;
  const sc = loc.complianceScore;
  return (
    <div onClick={() => onNav("location_record",{ locationId:loc.id, locationName:loc.name })}
      style={{ background:C.bgSurf, border:`1px solid ${loc.isCritical ? C.error+"60" : C.border}`,
        borderRadius:10, padding:16, cursor:"pointer", transition:"box-shadow 0.12s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow="none"}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, fontFamily:F, marginBottom:2 }}>{loc.storeNum}</div>
          <div style={{ fontSize:13, fontWeight:700, color:C.navyDeep, fontFamily:F }}>{loc.name}</div>
          <div style={{ fontSize:11, color:C.textSec, fontFamily:F }}>{loc.city}, {loc.state}</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
          <Pill label={sm.label} color={sm.color} bg={sm.bg} sm />
          {loc.isCritical && <Pill label="Critical" color={C.error} bg={C.errorBg} sm />}
        </div>
      </div>
      <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginBottom:10 }}>
        {loc.region} → {loc.district}
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <div style={{ flex:1, background: sc != null ? scoreBg(sc) : C.bgApp, borderRadius:6, padding:"6px 10px", textAlign:"center" }}>
          <div style={{ fontSize:18, fontWeight:800, color: sc != null ? scoreColor(sc) : C.textMuted, fontFamily:F, lineHeight:1 }}>
            {sc != null ? sc : "—"}
          </div>
          <div style={{ fontSize:9, color:C.textMuted, fontFamily:F, marginTop:2 }}>Compliance</div>
        </div>
        <div style={{ flex:1, background:C.bgApp, borderRadius:6, padding:"6px 10px", textAlign:"center" }}>
          <div style={{ fontSize:18, fontWeight:800, color: loc.openAPs > 5 ? C.warning : C.navyDeep, fontFamily:F, lineHeight:1 }}>
            {loc.openAPs}
          </div>
          <div style={{ fontSize:9, color:C.textMuted, fontFamily:F, marginTop:2 }}>Open APs</div>
        </div>
      </div>
      {loc.lastAuditDate && (
        <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginTop:8 }}>
          Last audit: {loc.lastAuditDate}
        </div>
      )}
    </div>
  );
}

export default function LocationsListPage({ onNav, density }) {
  const [viewerRole, setViewerRole] = useState("Program Owner");
  const [viewMode,   setViewMode]   = useState("row");
  const [search,     setSearch]     = useState("");
  const [selRegions,   setSelRegions]   = useState(new Set());
  const [selDistricts, setSelDistricts] = useState(new Set());
  const [selTypes,     setSelTypes]     = useState(new Set());
  const [selStatuses,  setSelStatuses]  = useState(new Set());
  const [critOnly,     setCritOnly]     = useState(false);
  const [sortKey,  setSortKey]  = useState("complianceScore");
  const [sortDir,  setSortDir]  = useState("asc");
  const [page,     setPage]     = useState(1);
  const PER_PAGE = 20;

  const scope = VIEWER_SCOPE[viewerRole];

  // Store Manager → redirect notice
  if (scope === "own") {
    return (
      <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp }}>
        <AppSidebar activeId="locations" onNav={onNav} />
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ height:52, background:C.bgSurf, borderBottom:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px" }}>
            <span style={{ fontWeight:700, fontSize:16, color:C.navyDeep, fontFamily:F }}>Locations</span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>Viewing as:</span>
              <select value={viewerRole} onChange={e => setViewerRole(e.target.value)}
                style={{ padding:"4px 8px", borderRadius:5, border:`1px solid ${C.border}`, fontSize:12, fontFamily:F, background:C.bgSurf }}>
                {VIEWER_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:12, padding:40, width:440, textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.navyDeep, fontFamily:F, marginBottom:8 }}>
                Your Location
              </div>
              <div style={{ fontSize:12, color:C.textSec, fontFamily:F, marginBottom:20, lineHeight:1.6 }}>
                As a Store Manager you have access to your assigned location's record directly.
              </div>
              <button onClick={() => onNav("location_record",{ locationId:"L001", locationName:"New York Central" })}
                style={{ padding:"9px 24px", borderRadius:7, border:"none", background:C.primary, color:"#fff",
                  fontSize:13, fontFamily:F, cursor:"pointer", fontWeight:600 }}>
                View My Location
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Employee → not accessible
  if (scope === "none") {
    return (
      <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp }}>
        <AppSidebar activeId="locations" onNav={onNav} />
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ height:52, background:C.bgSurf, borderBottom:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px" }}>
            <span style={{ fontWeight:700, fontSize:16, color:C.navyDeep, fontFamily:F }}>Locations</span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>Viewing as:</span>
              <select value={viewerRole} onChange={e => setViewerRole(e.target.value)}
                style={{ padding:"4px 8px", borderRadius:5, border:`1px solid ${C.border}`, fontSize:12, fontFamily:F, background:C.bgSurf }}>
                {VIEWER_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:12, padding:40, width:400, textAlign:"center" }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.navyDeep, fontFamily:F, marginBottom:8 }}>Not Accessible</div>
              <div style={{ fontSize:12, color:C.textSec, fontFamily:F, lineHeight:1.6 }}>
                The Locations directory is not available for your role. Contact your manager for location-specific information.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter districts by selected regions
  const availDistricts = useMemo(() => {
    const base = scope ? LOCATIONS_30.filter(l => scope.has(l.id)) : LOCATIONS_30;
    const regionSet = selRegions.size > 0 ? selRegions : null;
    const filtered = regionSet ? base.filter(l => regionSet.has(l.region)) : base;
    return [...new Set(filtered.map(l => l.district))].sort();
  }, [scope, selRegions]);

  const filtered = useMemo(() => {
    let list = scope ? LOCATIONS_30.filter(l => scope.has(l.id)) : [...LOCATIONS_30];

    if (selRegions.size)   list = list.filter(l => selRegions.has(l.region));
    if (selDistricts.size) list = list.filter(l => selDistricts.has(l.district));
    if (selTypes.size)     list = list.filter(l => selTypes.has(l.type));
    if (selStatuses.size)  list = list.filter(l => selStatuses.has(l.status));
    if (critOnly)          list = list.filter(l => l.isCritical);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) || l.storeNum.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q)  || l.state.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (av == null) av = sortDir === "asc" ? Infinity : -Infinity;
      if (bv == null) bv = sortDir === "asc" ? Infinity : -Infinity;
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

    return list;
  }, [scope, selRegions, selDistricts, selTypes, selStatuses, critOnly, search, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const allLocs   = scope ? LOCATIONS_30.filter(l => scope.has(l.id)) : LOCATIONS_30;
  const activeCount  = allLocs.filter(l => l.status === "active").length;
  const critCount    = allLocs.filter(l => l.isCritical).length;
  const regionCount  = new Set(allLocs.map(l => l.region)).size;
  const distCount    = new Set(allLocs.map(l => l.district)).size;

  const hasFilters = selRegions.size || selDistricts.size || selTypes.size || selStatuses.size || critOnly || search;
  function clearAll() {
    setSelRegions(new Set()); setSelDistricts(new Set()); setSelTypes(new Set());
    setSelStatuses(new Set()); setCritOnly(false); setSearch(""); setPage(1);
  }

  function Th({ label, k, style }) {
    const active = sortKey === k;
    return (
      <div onClick={() => k && toggleSort(k)}
        style={{ fontSize:10, fontWeight:700, color: active ? C.primary : C.textMuted,
          textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F,
          cursor: k ? "pointer" : "default", userSelect:"none",
          display:"flex", alignItems:"center", gap:3, ...style }}>
        {label}
        {k && active && <span style={{ fontSize:9 }}>{sortDir==="asc"?"▲":"▼"}</span>}
      </div>
    );
  }

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp }}>
      <AppSidebar activeId="locations" onNav={onNav} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ height:52, background:C.bgSurf, borderBottom:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", flexShrink:0 }}>
          <span style={{ fontWeight:700, fontSize:16, color:C.navyDeep, fontFamily:F }}>Locations</span>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={() => alert("Exporting CSV…")}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:6,
                border:`1px solid ${C.border}`, background:C.bgSurf, color:C.textSec,
                fontSize:12, fontFamily:F, cursor:"pointer" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
            {/* View toggle */}
            <div style={{ display:"flex", border:`1px solid ${C.border}`, borderRadius:6, overflow:"hidden" }}>
              {[["row","☰"],["grid","⊞"]].map(([m,icon]) => (
                <button key={m} onClick={() => setViewMode(m)}
                  style={{ padding:"5px 10px", border:"none", background: viewMode===m ? C.primary : C.bgSurf,
                    color: viewMode===m ? "#fff" : C.textSec, cursor:"pointer", fontSize:13 }}>
                  {icon}
                </button>
              ))}
            </div>
            <span style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>Viewing as:</span>
            <select value={viewerRole} onChange={e => { setViewerRole(e.target.value); setPage(1); }}
              style={{ padding:"4px 8px", borderRadius:5, border:`1px solid ${C.border}`, fontSize:12, fontFamily:F, background:C.bgSurf }}>
              {VIEWER_ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>

          {/* Stats bar */}
          <div style={{ display:"flex", gap:12, marginBottom:16 }}>
            {[
              { label:`${activeCount} active locations`, color:C.navyDeep, bg:C.bgSurf },
              { label:`${regionCount} regions / ${distCount} districts`, color:C.navyDeep, bg:C.bgSurf },
              { label:`${critCount} critical`, color: critCount > 0 ? C.error : C.textMuted,
                bg: critCount > 0 ? C.errorBg : C.bgSurf },
            ].map(s => (
              <div key={s.label} style={{ background:s.bg, border:`1px solid ${C.border}`, borderRadius:8,
                padding:"10px 16px", fontSize:13, fontWeight:600, color:s.color, fontFamily:F }}>
                {s.label}
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:8,
            padding:"10px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <MultiDrop label="Region"   selected={selRegions}   onToggle={v => { const s=new Set(selRegions);   s.has(v)?s.delete(v):s.add(v); setSelRegions(s);   setPage(1); }} opts={ALL_REGIONS} />
            <MultiDrop label="District" selected={selDistricts} onToggle={v => { const s=new Set(selDistricts); s.has(v)?s.delete(v):s.add(v); setSelDistricts(s); setPage(1); }} opts={availDistricts} />
            <MultiDrop label="Type"     selected={selTypes}     onToggle={v => { const s=new Set(selTypes);     s.has(v)?s.delete(v):s.add(v); setSelTypes(s);     setPage(1); }} opts={ALL_TYPES} />
            <MultiDrop label="Status"   selected={selStatuses}  onToggle={v => { const s=new Set(selStatuses);  s.has(v)?s.delete(v):s.add(v); setSelStatuses(s);  setPage(1); }} opts={ALL_STATUSES} />
            <button onClick={() => { setCritOnly(o => !o); setPage(1); }}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:6,
                border:`1px solid ${critOnly ? C.error : C.border}`,
                background: critOnly ? C.errorBg : C.bgSurf, color: critOnly ? C.error : C.textSec,
                fontSize:12, fontFamily:F, cursor:"pointer", fontWeight: critOnly ? 600 : 400 }}>
              ⚠ Critical only
            </button>
            <div style={{ flex:1, minWidth:180, display:"flex", alignItems:"center", gap:6,
              border:`1px solid ${C.border}`, borderRadius:6, padding:"5px 10px", background:C.bgSurf }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search name, store #, city…"
                style={{ border:"none", outline:"none", fontSize:12, fontFamily:F, color:C.navyDeep, width:"100%", background:"transparent" }} />
            </div>
            {hasFilters && (
              <button onClick={clearAll}
                style={{ padding:"5px 10px", borderRadius:6, border:`1px solid ${C.border}`,
                  background:"none", color:C.primary, fontSize:12, fontFamily:F, cursor:"pointer" }}>
                Clear all
              </button>
            )}
          </div>

          {/* Results count */}
          <div style={{ fontSize:12, color:C.textMuted, fontFamily:F, marginBottom:10 }}>
            {filtered.length} location{filtered.length!==1?"s":""}
            {hasFilters ? " match filters" : ""}
          </div>

          {/* Table or Grid */}
          {viewMode === "grid" ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
              {visible.map(loc => <LocationCard key={loc.id} loc={loc} onNav={onNav} />)}
            </div>
          ) : (
            <div style={{ background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
              {/* Table header */}
              <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 90px 180px 70px 110px 72px 72px 1fr 36px",
                gap:0, borderBottom:`1px solid ${C.border}`, padding:"0 12px", alignItems:"center",
                background:C.bgApp, height:36 }}>
                <div />
                <Th label="Name" k="name" />
                <Th label="Store #" k="storeNum" />
                <Th label="Region → District" k="region" />
                <Th label="Type" k="type" />
                <Th label="Status" k="status" />
                <Th label="Score" k="complianceScore" />
                <Th label="Open APs" k="openAPs" />
                <Th label="Last Audit" k="lastAuditDate" />
                <div />
              </div>

              {visible.length === 0 && (
                <div style={{ padding:"40px 24px", textAlign:"center", fontSize:13, color:C.textMuted, fontFamily:F }}>
                  {hasFilters ? <>No locations match. <button onClick={clearAll} style={{ color:C.primary, background:"none", border:"none", cursor:"pointer", fontSize:13, fontFamily:F }}>Clear filters</button></> : "No locations yet."}
                </div>
              )}

              {visible.map((loc, i) => {
                const sm = STATUS_META[loc.status] || STATUS_META.active;
                const sc = loc.complianceScore;
                return (
                  <div key={loc.id} onClick={() => onNav("location_record",{ locationId:loc.id, locationName:loc.name })}
                    style={{ display:"grid", gridTemplateColumns:"28px 1fr 90px 180px 70px 110px 72px 72px 1fr 36px",
                      gap:0, borderBottom: i < visible.length-1 ? `1px solid ${C.border}` : "none",
                      padding:"0 12px", alignItems:"center", height:46, cursor:"pointer",
                      background: loc.isCritical ? "#fff8f8" : C.bgSurf }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bgApp}
                    onMouseLeave={e => e.currentTarget.style.background = loc.isCritical ? "#fff8f8" : C.bgSurf}>

                    {/* Checkbox stub */}
                    <div onClick={e => e.stopPropagation()}>
                      <input type="checkbox" style={{ accentColor:C.primary, cursor:"pointer" }} />
                    </div>

                    {/* Name */}
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:C.primary, fontFamily:F }}>{loc.name}</span>
                        {loc.isCritical && <span style={{ fontSize:9, fontWeight:700, color:C.error, background:C.errorBg, padding:"1px 5px", borderRadius:999, border:`1px solid ${C.error}30` }}>CRITICAL</span>}
                      </div>
                      <div style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>{loc.city}, {loc.state}</div>
                    </div>

                    {/* Store # */}
                    <div style={{ fontSize:11, color:C.textSec, fontFamily:F }}>{loc.storeNum}</div>

                    {/* Region → District */}
                    <div style={{ fontSize:11, color:C.textSec, fontFamily:F }}>
                      <span style={{ fontWeight:600, color:C.navy }}>{loc.region}</span>
                      <span style={{ color:C.textMuted }}> → </span>
                      <span>{loc.district}</span>
                    </div>

                    {/* Type */}
                    <div style={{ fontSize:11, color:C.textSec, fontFamily:F }}>{loc.type}</div>

                    {/* Status */}
                    <div><Pill label={sm.label} color={sm.color} bg={sm.bg} sm /></div>

                    {/* Score */}
                    <div style={{ fontSize:12, fontWeight:700, color: sc != null ? scoreColor(sc) : C.textMuted, fontFamily:F }}>
                      {sc != null ? sc : "—"}
                    </div>

                    {/* Open APs */}
                    <div style={{ fontSize:12, fontWeight:600,
                      color: loc.openAPs > 5 ? C.warning : loc.openAPs > 0 ? C.textSec : C.textMuted, fontFamily:F }}>
                      {loc.openAPs}
                    </div>

                    {/* Last Audit */}
                    <div style={{ fontSize:11, color:C.textSec, fontFamily:F }}>
                      {loc.lastAuditDate ? (
                        <span
                          onClick={e => { e.stopPropagation(); if (loc.lastAuditId) onNav("audit_record",{ auditId:loc.lastAuditId }); }}
                          style={{ color: loc.lastAuditId ? C.primary : C.textSec, cursor: loc.lastAuditId ? "pointer" : "default",
                            textDecoration: loc.lastAuditId ? "underline" : "none" }}>
                          {loc.lastAuditDate}
                        </span>
                      ) : (
                        <span style={{ color:C.textMuted }}>—</span>
                      )}
                    </div>

                    {/* Kebab */}
                    <div onClick={e => e.stopPropagation()}>
                      <KebabMenu loc={loc} onNav={onNav} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:8, marginTop:16 }}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                style={{ padding:"5px 12px", borderRadius:6, border:`1px solid ${C.border}`,
                  background:C.bgSurf, color: page===1 ? C.textMuted : C.navyDeep, cursor: page===1?"default":"pointer", fontSize:12, fontFamily:F }}>
                ← Prev
              </button>
              <span style={{ fontSize:12, color:C.textSec, fontFamily:F }}>{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                style={{ padding:"5px 12px", borderRadius:6, border:`1px solid ${C.border}`,
                  background:C.bgSurf, color: page===totalPages ? C.textMuted : C.navyDeep, cursor: page===totalPages?"default":"pointer", fontSize:12, fontFamily:F }}>
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
