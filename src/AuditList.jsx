import { useState } from "react";
import AppSidebar from "./AppSidebar.jsx";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy:      "#001e76",
  navyDeep:  "#16191d",
  textSec:   "#555f6d",
  textMuted: "#8692a2",
  bgApp:     "#f4f4f6",
  bgSurf:    "#ffffff",
  border:    "#e2e5e9",
  primary:   "#2226f7",
  primaryBg: "#f0f2ff",
  success:   "#15803d", successBg: "#f0fdf4",
  warning:   "#a16207", warningBg: "#fef9c3",
  error:     "#dc2626", errorBg:   "#fef2f2",
  info:      "#0369a1", infoBg:    "#f0f9ff",
};

export const AUDITS = [
  { id:"A001", name:"Retail Store Safety Walkthrough",   program:"Retail Store Safety — Southeast",   location:"New York Central",     auditor:"Marcus King",     status:"overdue",     score:61, due:"Apr 10" },
  { id:"A002", name:"LP Standard Compliance Check",      program:"LP Compliance Program — Northeast", location:"Boston Newbury",       auditor:"Sarah Patel",     status:"in_progress", score:null, due:"Apr 28" },
  { id:"A003", name:"Ops Standards Verification",        program:"Operations Standards — Midwest",    location:"Chicago Wacker",       auditor:"Tom Wu",          status:"complete",    score:88, due:"Apr 5"  },
  { id:"A004", name:"PPE Station Inspection",            program:"PPE Compliance — West Region",      location:"LA Westside",          auditor:"Linda Chen",      status:"scheduled",   score:null, due:"May 3"  },
  { id:"A005", name:"Fire Safety Walk — Northeast",      program:"Fire Safety — National",            location:"Philadelphia Main",    auditor:"James Rodriguez", status:"complete",    score:91, due:"Mar 30" },
  { id:"A006", name:"Shrink Prevention Audit",           program:"Shrink Prevention — Southeast",     location:"Atlanta Perimeter",    auditor:"Marcus King",     status:"overdue",     score:null, due:"Apr 12" },
  { id:"A007", name:"OSHA Compliance Review",            program:"OSHA Compliance — All Regions",     location:"Seattle Pike",         auditor:"Linda Chen",      status:"in_progress", score:null, due:"Apr 30" },
  { id:"A008", name:"Q2 Store Standards Opening Audit",  program:"Q2 Store Standards Review",         location:"Dallas Galleria",      auditor:"Tom Wu",          status:"scheduled",   score:null, due:"May 8"  },
  { id:"A009", name:"Emergency Preparedness Check",      program:"Emergency Preparedness — West",     location:"Denver 16th St",       auditor:"Sarah Patel",     status:"complete",    score:72, due:"Apr 3"  },
  { id:"A010", name:"Cash Handling Procedures Review",   program:"Cash Handling Compliance — South",  location:"Miami Flagler",        auditor:"James Rodriguez", status:"overdue",     score:null, due:"Apr 8"  },
  { id:"A011", name:"Flagship Ops Standards Audit",      program:"Flagship Store Ops — Northeast",    location:"Hartford Downtown",    auditor:"Marcus King",     status:"complete",    score:85, due:"Apr 1"  },
  { id:"A012", name:"Seasonal Safety Walkthrough",       program:"Seasonal Safety — All Regions",     location:"Nashville Green Hills", auditor:"Sarah Patel",    status:"scheduled",   score:null, due:"May 15" },
];

const STATUS_META = {
  scheduled:   { label:"Scheduled",   color:C.info,    bg:C.infoBg    },
  in_progress: { label:"In Progress", color:C.warning, bg:C.warningBg },
  complete:    { label:"Complete",    color:C.success, bg:C.successBg },
  overdue:     { label:"Overdue",     color:C.error,   bg:C.errorBg   },
};

const FILTER_OPTS = ["All", "Scheduled", "In Progress", "Complete", "Overdue"];

export default function AuditList({ onNav, density = "condensed" }) {
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("All");

  const compact = density === "condensed";
  const ROW = {
    gap:     compact ? 14  : 16,
    padding: compact ? "9px 16px"  : "14px 18px",
    radius:  compact ? 8   : 10,
    badge:   compact ? 38  : 52,
    badgeR:  compact ? 8   : 12,
    scoreFs: compact ? 13  : 16,
    scorePc: compact ? 7   : 8,
    nameFs:  compact ? 12  : 13,
    nameMb:  compact ? 1   : 3,
    subFs:   compact ? 11  : 11,
    labelMb: compact ? 1   : 2,
    valFs:   compact ? 11  : 12,
    locW:    compact ? 130 : 140,
    audW:    compact ? 110 : 120,
    dueW:    compact ? 64  : 70,
    pillPad: compact ? "3px 8px"  : "4px 10px",
    pillFs:  compact ? 10  : 11,
    pillW:   compact ? 82  : 90,
    rowGap:  compact ? 4   : 8,
  };

  const filtered = AUDITS.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.program.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase()) ||
      a.auditor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || STATUS_META[a.status].label === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp, overflow:"hidden" }}>
      <AppSidebar activeId="audits" onNav={onNav} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ height:52, background:C.bgSurf, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"0 24px", gap:12, flexShrink:0 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.navyDeep, fontFamily:F }}>Audits</div>
          <div style={{ display:"flex", gap:4, marginLeft:16 }}>
            {FILTER_OPTS.map(opt => {
              const active = filter === opt;
              return (
                <button key={opt} onClick={() => setFilter(opt)}
                  style={{ padding:"4px 10px", borderRadius:6, border:`1px solid ${active ? C.primary : C.border}`, background: active ? C.primaryBg : "transparent", color: active ? C.primary : C.textSec, fontSize:11, fontWeight: active ? 600 : 400, fontFamily:F, cursor:"pointer" }}>
                  {opt}
                </button>
              );
            })}
          </div>
          <div style={{ marginLeft:"auto", position:"relative" }}>
            <svg style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search audits…"
              style={{ padding:"6px 10px 6px 30px", borderRadius:7, border:`1px solid ${C.border}`, fontSize:12, fontFamily:F, color:C.navyDeep, outline:"none", width:220, background:C.bgSurf }}
              onFocus={e => (e.target.style.borderColor = C.primary)}
              onBlur={e => (e.target.style.borderColor = C.border)}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:ROW.rowGap }}>
            {filtered.map(a => {
              const sm = STATUS_META[a.status];
              return (
                <div key={a.id}
                  style={{ display:"flex", alignItems:"center", gap:ROW.gap, background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:ROW.radius, padding:ROW.padding, transition:"box-shadow 0.12s, border-color 0.12s", cursor:"default" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"; e.currentTarget.style.borderColor = "#c3c8d0"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}
                >
                  {/* Score badge */}
                  <div style={{ width:ROW.badge, height:ROW.badge, borderRadius:ROW.badgeR, background: a.score ? sm.bg : C.bgApp, border:`1.5px solid ${a.score ? sm.color + "30" : C.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {a.score ? (
                      <>
                        <span style={{ fontSize:ROW.scoreFs, fontWeight:800, color:sm.color, lineHeight:1, fontFamily:F }}>{a.score}</span>
                        <span style={{ fontSize:ROW.scorePc, fontWeight:600, color:sm.color, fontFamily:F, marginTop:1 }}>%</span>
                      </>
                    ) : (
                      <span style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>—</span>
                    )}
                  </div>

                  {/* Name + program */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:ROW.nameFs, fontWeight:600, color:C.navyDeep, fontFamily:F, marginBottom:ROW.nameMb, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {a.name}
                    </div>
                    <div style={{ fontSize:ROW.subFs, color:C.textMuted, fontFamily:F, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {a.program}
                    </div>
                  </div>

                  {/* Location */}
                  <div style={{ flexShrink:0, minWidth:ROW.locW }}>
                    <div style={{ fontSize:9, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F, marginBottom:ROW.labelMb }}>Location</div>
                    <div style={{ fontSize:ROW.valFs, color:C.navyDeep, fontFamily:F }}>{a.location}</div>
                  </div>

                  {/* Auditor */}
                  <div style={{ flexShrink:0, minWidth:ROW.audW }}>
                    <div style={{ fontSize:9, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F, marginBottom:ROW.labelMb }}>Auditor</div>
                    <div style={{ fontSize:ROW.valFs, color:C.navyDeep, fontFamily:F }}>{a.auditor}</div>
                  </div>

                  {/* Due */}
                  <div style={{ flexShrink:0, minWidth:ROW.dueW }}>
                    <div style={{ fontSize:9, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F, marginBottom:ROW.labelMb }}>Due</div>
                    <div style={{ fontSize:ROW.valFs, color: a.status === "overdue" ? C.error : C.navyDeep, fontWeight: a.status === "overdue" ? 600 : 400, fontFamily:F }}>{a.due}</div>
                  </div>

                  {/* Status pill */}
                  <div style={{ padding:ROW.pillPad, borderRadius:999, background:sm.bg, border:`1px solid ${sm.color}30`, fontSize:ROW.pillFs, fontWeight:600, color:sm.color, fontFamily:F, flexShrink:0, minWidth:ROW.pillW, textAlign:"center" }}>
                    {sm.label}
                  </div>

                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 0", color:C.textMuted, fontFamily:F, fontSize:13 }}>
                {search ? `No audits match "${search}"` : "No audits in this category"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
