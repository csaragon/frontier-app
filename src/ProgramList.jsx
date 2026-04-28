import { useState } from "react";
import AppSidebar from "./AppSidebar.jsx";
import { PROGS } from "./Dashboard.jsx";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy:    "#001e76",
  navyDeep:"#16191d",
  textSec: "#555f6d",
  textMuted:"#8692a2",
  bgApp:   "#f4f4f6",
  bgSurf:  "#ffffff",
  border:  "#e2e5e9",
  primary: "#2226f7",
  primaryBg:"#f0f2ff",
  success: "#15803d", successBg:"#f0fdf4",
  warning: "#a16207", warningBg:"#fef9c3",
  error:   "#dc2626", errorBg:  "#fef2f2",
};

const sc    = s => s >= 80 ? C.success : s >= 65 ? C.warning : s === 0 ? C.textMuted : C.error;
const scBg  = s => s >= 80 ? C.successBg : s >= 65 ? C.warningBg : s === 0 ? C.bgApp : C.errorBg;
const label = s => s >= 80 ? "Passing" : s >= 65 ? "At Risk" : s === 0 ? "Not started" : "Failing";

export default function ProgramList({ onNav, onSelectProgram, density = "condensed" }) {
  const [search, setSearch] = useState("");

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
    barW:    compact ? 100 : 120,
    barH:    compact ? 4   : 5,
    barMb:   compact ? 3   : 4,
    pillPad: compact ? "3px 8px"  : "4px 10px",
    pillFs:  compact ? 10  : 11,
    pillW:   compact ? 72  : 80,
    rowGap:  compact ? 4   : 8,
  };

  const filtered = PROGS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp, overflow:"hidden" }}>
      <AppSidebar activeId="programs" onNav={onNav} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Page header */}
        <div style={{ height:52, background:C.bgSurf, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"0 24px", gap:16, flexShrink:0 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.navyDeep, fontFamily:F }}>Programs</div>
          <div style={{ marginLeft:"auto", position:"relative" }}>
            <svg style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search programs…"
              style={{ padding:"6px 10px 6px 30px", borderRadius:7, border:`1px solid ${C.border}`, fontSize:12, fontFamily:F, color:C.navyDeep, outline:"none", width:220, background:C.bgSurf }}
              onFocus={e => (e.target.style.borderColor = C.primary)}
              onBlur={e => (e.target.style.borderColor = C.border)}
            />
          </div>
        </div>

        {/* Program list */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:ROW.rowGap }}>
            {filtered.map(p => {
              const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
              const scoreColor = sc(p.score);
              const scoreBg    = scBg(p.score);
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectProgram(p)}
                  style={{
                    display:"flex", alignItems:"center", gap:ROW.gap,
                    background:C.bgSurf, border:`1px solid ${C.border}`,
                    borderRadius:ROW.radius, padding:ROW.padding,
                    cursor:"pointer", textAlign:"left", width:"100%",
                    transition:"box-shadow 0.12s, border-color 0.12s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"; e.currentTarget.style.borderColor = "#c3c8d0"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}
                >
                  {/* Score badge */}
                  <div style={{ width:ROW.badge, height:ROW.badge, borderRadius:ROW.badgeR, background:scoreBg, border:`1.5px solid ${scoreColor}30`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:ROW.scoreFs, fontWeight:800, color:scoreColor, lineHeight:1, fontFamily:F }}>{p.score > 0 ? p.score : "—"}</span>
                    {p.score > 0 && <span style={{ fontSize:ROW.scorePc, fontWeight:600, color:scoreColor, fontFamily:F, marginTop:1 }}>%</span>}
                  </div>

                  {/* Name + type */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:ROW.nameFs, fontWeight:600, color:C.navyDeep, fontFamily:F, marginBottom:ROW.nameMb, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize:ROW.subFs, color:C.textMuted, fontFamily:F }}>{p.type}</div>
                  </div>

                  {/* Completion bar */}
                  <div style={{ width:ROW.barW, flexShrink:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:ROW.barMb }}>
                      <span style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>Completion</span>
                      <span style={{ fontSize:10, fontWeight:600, color:C.navyDeep, fontFamily:F }}>{p.done}/{p.total}</span>
                    </div>
                    <div style={{ height:ROW.barH, borderRadius:999, background:C.border }}>
                      <div style={{ height:"100%", borderRadius:999, background: pct === 100 ? C.success : C.primary, width:`${pct}%`, transition:"width 0.2s" }} />
                    </div>
                  </div>

                  {/* Status pill */}
                  <div style={{ padding:ROW.pillPad, borderRadius:999, background:scoreBg, border:`1px solid ${scoreColor}30`, fontSize:ROW.pillFs, fontWeight:600, color:scoreColor, fontFamily:F, flexShrink:0, minWidth:ROW.pillW, textAlign:"center" }}>
                    {label(p.score)}
                  </div>

                  {/* Overdue */}
                  {p.ov > 0 && (
                    <div style={{ fontSize:ROW.subFs, color:C.error, fontFamily:F, fontWeight:600, flexShrink:0 }}>
                      {p.ov} overdue
                    </div>
                  )}

                  {/* Chevron */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 0", color:C.textMuted, fontFamily:F, fontSize:13 }}>
                No programs match "{search}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
