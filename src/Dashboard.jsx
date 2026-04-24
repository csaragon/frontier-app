import { useState } from "react";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy:"#001e76", navy2:"#001356", navy3:"#e8ecf8",
  ocean:"#2226f7", ocean2:"#1316a8", ocean3:"#d4e2ff",
  white:"#ffffff", g1:"#f4f4f6", g2:"#e2e5e9", g3:"#c3c8d0",
  g4:"#8692a2", g5:"#555f6d", g6:"#16191d",
  teal:"#0f766e", teal2:"#ccfbf1",
  red:"#b6143a", red2:"#fae5e6",
  yel:"#854d0e", yel2:"#fef9c3",
};

const sc = s => s >= 80 ? C.teal : s >= 65 ? C.yel : C.red;

function Score({ v, sz = 12 }) {
  if (!v) return <span style={{ fontSize: sz - 1, color: C.g4, fontFamily: F }}>—</span>;
  return <span style={{ fontSize: sz, fontWeight: 600, color: sc(v), fontFamily: F }}>{v}%</span>;
}

function Pill({ type = "base", label, sm }) {
  const m = { base: [C.g2, C.g5], info: [C.ocean3, C.ocean2], warn: [C.yel2, C.yel], err: [C.red2, C.red], ok: [C.teal2, C.teal] };
  const [bg, fg] = m[type] || m.base;
  return <span style={{ display: "inline-flex", alignItems: "center", padding: sm ? "2px 6px" : "4px 8px", borderRadius: 4, fontSize: sm ? 9 : 10, fontWeight: 500, fontFamily: F, background: bg, color: fg, whiteSpace: "nowrap" }}>{label}</span>;
}

function Btn({ label, primary, onClick }) {
  const [h, setH] = useState(false);
  return <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8, border: primary ? "none" : `1px solid ${C.g3}`, background: primary ? (h ? C.navy2 : C.navy) : h ? C.g1 : "transparent", color: primary ? C.white : C.navy, fontSize: 12, fontWeight: 500, fontFamily: F, cursor: "pointer", whiteSpace: "nowrap" }}>{label}</button>;
}

function Drop({ value, onChange, opts }) {
  const [o, setO] = useState(false);
  return <div style={{ position: "relative" }}>
    <button onClick={() => setO(!o)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: `1px solid ${C.g3}`, background: C.white, color: C.navy, fontSize: 12, fontFamily: F, cursor: "pointer", minWidth: 130, justifyContent: "space-between" }}>
      <span>{value}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
    </button>
    {o && <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 400, background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: 160, overflow: "hidden" }}>
      {opts.map(x => <button key={x} onClick={() => { onChange(x); setO(false); }}
        style={{ display: "block", width: "100%", padding: "8px 12px", textAlign: "left", background: value === x ? C.ocean3 : "transparent", border: "none", color: value === x ? C.ocean2 : C.navy, fontSize: 12, fontFamily: F, cursor: "pointer" }}
        onMouseEnter={e => { if (value !== x) e.currentTarget.style.background = C.g1; }}
        onMouseLeave={e => { if (value !== x) e.currentTarget.style.background = "transparent"; }}>{x}</button>)}
    </div>}
  </div>;
}

function MultiDrop({ label, sel, onToggle, opts }) {
  const [o, setO] = useState(false);
  const n = sel.size;
  const display = n === 0 ? label : n === 1 ? ([...sel][0].length > 18 ? [...sel][0].slice(0, 17) + "…" : [...sel][0]) : `${n} selected`;
  return <div style={{ position: "relative" }}>
    <button onClick={() => setO(!o)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: `1px solid ${n > 0 ? C.navy : C.g3}`, background: n > 0 ? C.navy3 : C.white, color: C.navy, fontSize: 12, fontFamily: F, cursor: "pointer", minWidth: 130, justifyContent: "space-between", fontWeight: n > 0 ? 600 : 400 }}>
      <span>{display}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
    </button>
    {o && <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 400, background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: 220, overflow: "hidden" }}>
      {opts.map(x => {
        const ck = sel.has(x);
        return <button key={x} onClick={() => onToggle(x)}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 12px", background: ck ? C.ocean3 : "transparent", border: "none", color: C.navy, fontSize: 12, fontFamily: F, cursor: "pointer" }}
          onMouseEnter={e => { if (!ck) e.currentTarget.style.background = C.g1; }}
          onMouseLeave={e => { if (!ck) e.currentTarget.style.background = "transparent"; }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${ck ? C.navy : C.g3}`, background: ck ? C.navy : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {ck && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
          </div>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x}</span>
        </button>;
      })}
    </div>}
  </div>;
}

function GridHead({ cols, headers, aligns = [], gap = 8, px = 16 }) {
  return <div style={{ display: "grid", gridTemplateColumns: cols, gap, padding: `0 ${px}px`, background: C.g1, borderBottom: `1px solid ${C.g2}`, alignItems: "center" }}>
    {headers.map((h, i) => <span key={i} style={{ fontSize: 9, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: F, padding: "7px 0", textAlign: aligns[i] || "left" }}>{h}</span>)}
  </div>;
}

function Pages({ page, total, per, onPage }) {
  const tp = Math.max(1, Math.ceil(total / per));
  const ps = Array.from({ length: Math.min(tp, 5) }, (_, i) => i + 1);
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: `1px solid ${C.g2}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 12, color: C.g5, fontFamily: F }}>Show</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", border: `1px solid ${C.g3}`, borderRadius: 6, background: C.white, fontSize: 12, color: C.navy, fontFamily: F }}>{per} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></div>
      <span style={{ fontSize: 12, color: C.g5, fontFamily: F }}>rows of {total}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "none", background: "transparent", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.35 : 1 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      {ps.map(p => <button key={p} onClick={() => onPage(p)} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: page === p ? C.navy : "transparent", color: page === p ? C.white : C.navy, fontSize: 13, fontWeight: page === p ? 700 : 400, fontFamily: F, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        onMouseEnter={e => { if (page !== p) e.currentTarget.style.background = C.navy3; }}
        onMouseLeave={e => { if (page !== p) e.currentTarget.style.background = "transparent"; }}>{p}</button>)}
      <button onClick={() => onPage(Math.min(tp, page + 1))} disabled={page === tp} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "none", background: "transparent", cursor: page === tp ? "not-allowed" : "pointer", opacity: page === tp ? 0.35 : 1 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
    <span style={{ fontSize: 12, color: C.g5, fontFamily: F }}>{page} of {tp} pages</span>
  </div>;
}

function Chart({ series, hl, onClick }) {
  const [hov, setHov] = useState(null);
  const VW = 700, VH = 180, pL = 34, pR = 10, pT = 12, pB = 28, cW = VW - pL - pR, cH = VH - pT - pB;
  const all = series.flatMap(s => s.data);
  if (!all.length) return null;
  const mn = Math.min(...all) - 4, mx = Math.max(...all) + 4, rng = mx - mn || 1;
  const n = series[0]?.data.length || 0;
  const px = i => pL + (i / Math.max(n - 1, 1)) * cW;
  const py = v => pT + ((mx - v) / rng) * cH;
  const grids = [50, 60, 70, 80, 90, 100].filter(v => v >= mn && v <= mx);
  const hx = hov != null ? px(hov) : null;
  const dim = s => hl != null && hl !== s.key;
  const ttR = hov != null ? [...series].map(s => ({ label: s.label, val: s.data[hov], color: s.color, d: dim(s) })).sort((a, b) => b.val - a.val) : [];
  const ttW = 190, rH = 13, ttH = ttR.length * rH + 18;
  const ttX = hx != null ? (hx > VW - ttW - 10 ? hx - ttW - 10 : hx + 10) : 0;
  return <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="190" style={{ display: "block", overflow: "visible" }} preserveAspectRatio="xMidYMid meet" onMouseLeave={() => setHov(null)}>
    {grids.map(v => <g key={v}><line x1={pL} y1={py(v)} x2={pL + cW} y2={py(v)} stroke={C.g2} strokeWidth="1" /><text x={pL - 4} y={py(v) + 3} textAnchor="end" fontSize="9" fill={C.g4} fontFamily={F}>{v}%</text></g>)}
    {series.map(s => {
      const pts = s.data.map((v, i) => `${px(i)},${py(v)}`).join(" ");
      const d = dim(s);
      return <g key={s.key} style={{ cursor: "pointer" }} onClick={() => onClick && onClick(s.key)}>
        <polyline points={pts} fill="none" stroke="transparent" strokeWidth="12" />
        <polyline points={pts} fill="none" stroke={s.color} strokeWidth={d ? 1.5 : 2.8} strokeLinecap="round" strokeLinejoin="round" opacity={d ? 0.18 : 1} />
      </g>;
    })}
    {Array.from({ length: n }).map((_, i) => <rect key={i} x={px(i) - 12} y={pT} width={24} height={cH} fill="transparent" onMouseEnter={() => setHov(i)} style={{ cursor: "crosshair" }} />)}
    {hov != null && <line x1={hx} y1={pT} x2={hx} y2={pT + cH} stroke={C.g4} strokeWidth="1" strokeDasharray="3,2" opacity="0.6" />}
    {hov != null && series.map(s => <circle key={s.key} cx={hx} cy={py(s.data[hov])} r={dim(s) ? 3 : 4} fill={C.white} stroke={s.color} strokeWidth="2" opacity={dim(s) ? 0.35 : 1} />)}
    {hov != null && <g>
      <rect x={ttX} y={pT + 4} width={ttW} height={ttH} rx="6" fill="#0f172a" fillOpacity="0.96" />
      <text x={ttX + 10} y={pT + 17} fontSize="9" fontWeight="700" fill={C.white} fontFamily={F}>WEEK {hov + 1}</text>
      {ttR.map((r, i) => <g key={i} opacity={r.d ? 0.4 : 1}>
        <circle cx={ttX + 14} cy={pT + 29 + i * rH} r="3" fill={r.color} />
        <text x={ttX + 22} y={pT + 32 + i * rH} fontSize="10" fill={C.white} fontFamily={F}>{r.label.length > 22 ? r.label.slice(0, 21) + "…" : r.label}</text>
        <text x={ttX + ttW - 10} y={pT + 32 + i * rH} fontSize="10" fontWeight="700" fill={C.white} fontFamily={F} textAnchor="end">{r.val}%</text>
      </g>)}
    </g>}
    {Array.from({ length: n }).map((_, i) => i % 4 === 0 && <text key={i} x={px(i)} y={VH - 8} textAnchor="middle" fontSize="9" fill={C.g4} fontFamily={F}>W{i + 1}</text>)}
  </svg>;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const TD = {
  hs:   [68,65,63,61,60,58,60,59,61,60,61,61,62,60,61,62],
  lp:   [76,75,74,73,75,74,73,74,74,75,74,74,75,76,74,75],
  ops:  [84,85,86,87,87,88,87,88,88,88,88,88,89,88,89,90],
  fire: [89,90,90,91,90,91,91,91,92,91,91,91,92,92,91,92],
};
const CATS = [
  { key:"hs",   label:"Health & Safety", color:"#b6143a", data:TD.hs },
  { key:"lp",   label:"Loss Prevention", color:"#001e76", data:TD.lp },
  { key:"ops",  label:"Operations",      color:"#0f766e", data:TD.ops },
  { key:"fire", label:"Fire Safety",     color:"#7c3aed", data:TD.fire },
];
const PTRENDS = [
  { key:"P001", label:"Retail Safety — SE",  cat:"hs",   color:"#dc2626", data:[62,60,59,57,56,55,58,57,59,58,59,58,60,58,59,60] },
  { key:"P004", label:"PPE Compliance",      cat:"hs",   color:"#f59e0b", data:[72,71,70,70,71,69,70,70,70,70,70,70,71,70,71,71] },
  { key:"P007", label:"OSHA Compliance",     cat:"hs",   color:"#ec4899", data:[79,78,78,77,78,78,77,78,79,78,78,79,78,79,78,78] },
  { key:"P002", label:"LP Compliance — NE",  cat:"lp",   color:"#1e3a8a", data:[72,73,74,73,74,75,74,74,75,74,73,74,74,74,74,75] },
  { key:"P006", label:"Shrink Prevention",   cat:"lp",   color:"#2563eb", data:[68,67,66,65,66,65,64,65,66,67,66,65,66,65,66,66] },
  { key:"P003", label:"Ops Standards — MW",  cat:"ops",  color:"#0d9488", data:[85,86,87,88,87,88,89,88,88,89,88,89,88,88,89,90] },
  { key:"P005", label:"Fire Safety — Natl",  cat:"fire", color:"#7c3aed", data:[88,89,90,91,90,91,92,91,91,92,91,92,91,91,92,92] },
];
const PROGS = [
  { id:"P001", name:"Retail Store Safety — Southeast",   type:"Health & Safety", score:61, done:34, total:48, ov:4, tk:"hs" },
  { id:"P002", name:"LP Compliance Program — Northeast", type:"Loss Prevention",  score:74, done:28, total:32, ov:2, tk:"lp" },
  { id:"P003", name:"Operations Standards — Midwest",    type:"Operations",       score:88, done:26, total:26, ov:0, tk:"ops" },
  { id:"P004", name:"PPE Compliance — West Region",      type:"Safety",           score:70, done:15, total:19, ov:3, tk:"hs" },
  { id:"P005", name:"Fire Safety — National",            type:"H&S",              score:91, done:58, total:60, ov:0, tk:"fire" },
  { id:"P006", name:"Shrink Prevention — Southeast",     type:"Loss Prevention",  score:66, done:18, total:24, ov:2, tk:"lp" },
  { id:"P007", name:"OSHA Compliance — All Regions",     type:"H&S",              score:78, done:71, total:88, ov:1, tk:"hs" },
  { id:"P008", name:"Q2 Store Standards Review",         type:"Operations",       score:0,  done:0,  total:15, ov:0, tk:"ops" },
  { id:"P009", name:"Emergency Preparedness — West",     type:"Health & Safety",  score:72, done:19, total:28, ov:2, tk:"hs" },
  { id:"P010", name:"Cash Handling Compliance — South",  type:"Loss Prevention",  score:63, done:22, total:30, ov:3, tk:"lp" },
  { id:"P011", name:"Flagship Store Ops — Northeast",    type:"Operations",       score:85, done:12, total:12, ov:0, tk:"ops" },
  { id:"P012", name:"Seasonal Safety — All Regions",     type:"Health & Safety",  score:57, done:41, total:64, ov:6, tk:"hs" },
];

const DRILL = {
  P001: { missedQ:8, missedS:4, critLocs:3,
    topQ:[{q:"Emergency exit signage verified",pct:78,crit:true},{q:"Fire extinguisher inspection current",pct:55,crit:true},{q:"Chemical storage log up to date",pct:42}],
    topL:[{name:"New York Central",score:48,delta:-9},{name:"Chicago Wacker",score:60,delta:-3},{name:"Philadelphia Main",score:65,delta:-1}] },
  P002: { missedQ:5, missedS:3, critLocs:2,
    topQ:[{q:"CCTV coverage — all zones active",pct:65,crit:true},{q:"Cash handling procedures followed",pct:39,crit:true},{q:"Access control logs reviewed",pct:28}],
    topL:[{name:"Miami Flagler",score:55,delta:-6},{name:"Boston Newbury",score:68,delta:-2},{name:"Hartford Downtown",score:71,delta:1}] },
  P004: { missedQ:4, missedS:2, critLocs:2,
    topQ:[{q:"PPE available and accessible",pct:47,crit:true},{q:"PPE in good condition",pct:38},{q:"Gloves stocked — all sizes",pct:29}],
    topL:[{name:"Dallas Galleria",score:64,delta:2},{name:"LA Westside",score:69,delta:-1}] },
  P006: { missedQ:6, missedS:3, critLocs:2,
    topQ:[{q:"Merchandise secured — high-risk zones",pct:58,crit:true},{q:"EAS tags applied correctly",pct:44},{q:"Return desk controls followed",pct:36}],
    topL:[{name:"Atlanta Perimeter",score:62,delta:-4},{name:"Nashville Green Hills",score:68,delta:-1}] },
  P007: { missedQ:5, missedS:3, critLocs:2,
    topQ:[{q:"MSDS sheets accessible",pct:52,crit:true},{q:"Lockout/tagout procedures posted",pct:41},{q:"Employee right-to-know training current",pct:33}],
    topL:[{name:"Seattle Pike",score:72,delta:1},{name:"Denver 16th St",score:75,delta:2}] },
};
const TMPL_BY_PROG = {
  "Retail Store Safety — Southeast":   ["Fire Safety Audit v3","Slip Trip & Fall v1","PPE Compliance v2"],
  "LP Compliance Program — Northeast": ["LP Standard Audit v4","Cash Handling Review v1"],
  "Operations Standards — Midwest":    ["Ops Standards v2"],
  "PPE Compliance — West Region":      ["PPE Compliance Check v2"],
  "Fire Safety — National":            ["Fire Safety National v1"],
  "Shrink Prevention — Southeast":     ["LP Shrinkage v2"],
  "OSHA Compliance — All Regions":     ["OSHA Standard v2"],
};
const ACTIONS = [
  { title:"Fix emergency exit signage",  loc:"NY Central",     due:"Apr 10", ov:true,  pri:"high",   st:"open" },
  { title:"Update chemical storage log", loc:"Chicago Wacker", due:"Apr 14", ov:true,  pri:"high",   st:"open" },
  { title:"Restock PPE station",         loc:"Dallas Galleria",due:"Apr 18", ov:false, pri:"medium", st:"in_progress" },
  { title:"CCTV zone 3 coverage review", loc:"Miami Flagler",  due:"Apr 22", ov:false, pri:"high",   st:"in_progress" },
  { title:"Cash handling retraining",    loc:"NE District",    due:"Apr 30", ov:false, pri:"medium", st:"open" },
];
const BEHIND = [
  { name:"Marcus King",     role:"DLPM",         dist:"SE District 1",  ov:3, tot:8, ini:"MK" },
  { name:"Sarah Patel",     role:"DLPM",         dist:"NE District 2",  ov:2, tot:6, ini:"SP" },
  { name:"James Rodriguez", role:"Store Mgr",    dist:"Miami Flagler",  ov:2, tot:4, ini:"JR" },
  { name:"Linda Chen",      role:"AP Specialist",dist:"West District 3",ov:1, tot:5, ini:"LC" },
  { name:"Tom Wu",          role:"Ops Mgr",      dist:"Chicago Wacker", ov:1, tot:3, ini:"TW" },
];

// ── Shared sub-components ─────────────────────────────────────────────────────
function CollapseBtn({ onClick }) {
  const [h, setH] = useState(false);
  return <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    style={{ background:h?C.g1:C.white, border:`1px solid ${C.g2}`, borderRadius:6, cursor:"pointer", padding:"3px 5px", display:"flex", alignItems:"center", justifyContent:"center", color:C.g4 }}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
  </button>;
}

function DrillPanel({ prog, onCollapse, onViewScorecard }) {
  const d = DRILL[prog.id];

  // No-data fallback (from Analytics standalone)
  if (!d) return (
    <div style={{ background:"#F6F7F8", borderBottom:`1px solid ${C.g2}`, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <span style={{ fontSize:11, color:C.g4, fontFamily:F }}>No drill-down data available for this program.</span>
      <CollapseBtn onClick={onCollapse} />
    </div>
  );

  return (
    <div style={{ background:"#F6F7F8", borderBottom:`1px solid ${C.g2}` }}>
      {/* Drill header */}
      <div style={{ padding:"10px 16px", borderBottom:`1px solid ${C.g2}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:11, fontWeight:600, color:C.navy, fontFamily:F }}>{prog.name.split("—")[0].trim()}</span>
          <span style={{ fontSize:10, color:C.g4, fontFamily:F }}>— snapshot</span>
        </div>
        <CollapseBtn onClick={onCollapse} />
      </div>
      {/* 3 KPI mini-cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, padding:"10px 16px" }}>
        {[
          { label:"Missed questions",  value:d.missedQ, color:C.red, sub:"across all templates" },
          { label:"Missed sections",   value:d.missedS, color:C.yel, sub:"with failures" },
          { label:"Critical locations",value:d.critLocs,color:C.red, sub:"below 65% score" },
        ].map((k,i) => (
          <div key={i} style={{ background:C.white, borderRadius:8, border:`1px solid ${C.g2}`, padding:"10px 12px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:4 }}>{k.label}</div>
            <div style={{ fontSize:22, fontWeight:700, color:k.color, lineHeight:1, fontFamily:F, marginBottom:3 }}>{k.value}</div>
            <div style={{ fontSize:9, color:C.g4, fontFamily:F }}>{k.sub}</div>
          </div>
        ))}
      </div>
      {/* Missed Qs + Critical Locs */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, margin:"0 16px 10px", borderRadius:8, border:`1px solid ${C.g2}`, overflow:"hidden", background:C.white }}>
        <div style={{ borderRight:`1px solid ${C.g2}` }}>
          <div style={{ padding:"8px 12px", borderBottom:`1px solid ${C.g2}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:9, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F }}>Top missed questions</span>
            <span style={{ fontSize:9, color:C.g4, fontFamily:F }}>{d.missedQ} total</span>
          </div>
          {d.topQ.map((q,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 12px", borderBottom:i<d.topQ.length-1?`1px solid ${C.g1}`:"none" }}>
              <span style={{ fontSize:9, fontWeight:700, color:C.g3, fontFamily:F, flexShrink:0, width:12 }}>{i+1}</span>
              <div style={{ flex:1, minWidth:0, display:"flex", alignItems:"center", gap:4 }}>
                {q.crit && <span style={{ fontSize:7, fontWeight:700, color:C.red, background:C.red2, padding:"1px 3px", borderRadius:2, textTransform:"uppercase", letterSpacing:"0.04em", flexShrink:0 }}>Crit</span>}
                <span style={{ fontSize:11, color:C.g6, fontFamily:F, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:500 }}>{q.q}</span>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:C.red, fontFamily:F, flexShrink:0 }}>{q.pct}%</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ padding:"8px 12px", borderBottom:`1px solid ${C.g2}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:9, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F }}>Critical locations</span>
            <span style={{ fontSize:9, color:C.g4, fontFamily:F }}>{d.critLocs} total</span>
          </div>
          {d.topL.map((loc,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 12px", borderBottom:i<d.topL.length-1?`1px solid ${C.g1}`:"none" }}>
              <span style={{ fontSize:9, fontWeight:700, color:C.g3, fontFamily:F, flexShrink:0, width:12 }}>{i+1}</span>
              <span style={{ fontSize:11, color:C.g6, fontFamily:F, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:500 }}>{loc.name}</span>
              <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                <Score v={loc.score} sz={11} />
                <span style={{ fontSize:9, fontWeight:600, color:loc.delta<0?C.red:C.teal, fontFamily:F }}>{loc.delta<0?"▼":"▲"}{Math.abs(loc.delta)}pp</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* View full scorecard CTA */}
      <div style={{ padding:"10px 16px", display:"flex", justifyContent:"flex-end" }}>
        <button onClick={() => onViewScorecard && onViewScorecard(prog)}
          style={{ fontSize:11, fontWeight:600, color:C.ocean, background:C.ocean3, border:`1px solid ${C.ocean3}`, borderRadius:7, cursor:"pointer", fontFamily:F, padding:"6px 14px" }}
          onMouseEnter={e => e.currentTarget.style.background = C.navy3}
          onMouseLeave={e => e.currentTarget.style.background = C.ocean3}>
          View full scorecard →
        </button>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ onNav }) {
  const navItems = ["Dashboard","Programs","Audits","Escalations","Action Plans"];
  const manageItems = ["Catalog","Users"];
  return <aside style={{ width:192, minWidth:192, background:C.white, borderRight:`1px solid ${C.g2}`, display:"flex", flexDirection:"column", height:"100vh", flexShrink:0 }}>
    <div style={{ height:52, display:"flex", alignItems:"center", gap:8, padding:"0 12px", borderBottom:`1px solid ${C.g2}`, flexShrink:0 }}>
      <div style={{ width:24, height:24, borderRadius:6, background:C.navy, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>Frontier</span>
    </div>
    <nav style={{ flex:1, padding:"6px 8px", display:"flex", flexDirection:"column", gap:1 }}>
      {navItems.map((l,i) => <button key={l} onClick={() => onNav && onNav(l.toLowerCase().replace(/ /g,"_"))} style={{ width:"100%", height:34, display:"flex", alignItems:"center", gap:8, padding:"0 10px", borderRadius:4, border:"none", cursor:"pointer", background:i===0?C.ocean:"transparent", color:i===0?C.white:C.navy, fontSize:12, fontFamily:F, textAlign:"left" }}>{l}</button>)}
      <div style={{ fontSize:9, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.06em", padding:"10px 10px 3px", fontFamily:F }}>Manage</div>
      {manageItems.map(l => <button key={l} onClick={() => onNav && onNav(l.toLowerCase())} style={{ width:"100%", height:34, display:"flex", alignItems:"center", gap:8, padding:"0 10px", borderRadius:4, border:"none", cursor:"pointer", background:"transparent", color:C.navy, fontSize:12, fontFamily:F }}>{l}</button>)}
    </nav>
  </aside>;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard({ onViewScorecard, onNav }) {
  const [date, setDate] = useState("Last 30 days");
  const [progs, setProgs] = useState(new Set());
  const [tmpls, setTmpls] = useState(new Set());
  const [region, setRegion] = useState("All regions");
  const [tcat, setTcat] = useState("all");
  const [tprog, setTprog] = useState(null);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [kpi, setKpi] = useState(null);

  const PER = 8;

  const toggleP = n => { const s = new Set(progs); s.has(n) ? s.delete(n) : s.add(n); setProgs(s); setTmpls(new Set()); };
  const toggleT = n => { const s = new Set(tmpls); s.has(n) ? s.delete(n) : s.add(n); setTmpls(s); };
  const clear = (type, val) => {
    if (type === "d") setDate("Last 30 days");
    if (type === "p") { const s = new Set(progs); s.delete(val); setProgs(s); }
    if (type === "t") { const s = new Set(tmpls); s.delete(val); setTmpls(s); }
    if (type === "r") setRegion("All regions");
  };

  const avTmpls = progs.size > 0
    ? [...progs].flatMap(p => TMPL_BY_PROG[p] || [])
    : Object.values(TMPL_BY_PROG).flat();

  const pills = [
    ...(date !== "Last 30 days" ? [{ type:"d", val:date }] : []),
    ...[...progs].map(v => ({ type:"p", val:v })),
    ...[...tmpls].map(v => ({ type:"t", val:v })),
    ...(region !== "All regions" ? [{ type:"r", val:region }] : []),
  ];

  const filtP = progs.size > 0 ? PROGS.filter(p => progs.has(p.name)) : PROGS;
  const pageP = filtP.slice((page - 1) * PER, page * PER);
  const cSeries = tcat === "all" ? CATS : PTRENDS.filter(p => p.cat === tcat);

  return <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.g1, overflow:"hidden" }}>
    <Sidebar onNav={onNav} />

    {/* KPI side panel */}
    {kpi && <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"stretch", justifyContent:"flex-end", pointerEvents:"none" }}>
      <div onClick={() => setKpi(null)} style={{ flex:1, pointerEvents:"auto", background:"rgba(0,0,0,0.18)" }} />
      <div style={{ width:440, background:C.white, borderLeft:`1px solid ${C.g2}`, display:"flex", flexDirection:"column", pointerEvents:"auto", boxShadow:"-8px 0 32px rgba(0,0,0,0.1)" }}>
        <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.g2}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>{kpi==="completed"?"Completed audits":kpi==="compliance"?"Avg compliance":kpi==="actions"?"Open action plans":"Overdue audits"}</div>
          <button onClick={() => setKpi(null)} style={{ background:"none", border:"none", cursor:"pointer", color:C.g4, padding:4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ flex:1, overflowY:"auto" }}>
          {kpi === "compliance" && [...PROGS].filter(p => p.score > 0).sort((a,b) => a.score - b.score).map((p,i) =>
            <div key={i} style={{ padding:"10px 18px", borderBottom:`1px solid ${C.g1}`, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:500, color:C.g6, fontFamily:F }}>{p.name}</div><div style={{ fontSize:10, color:C.g4, fontFamily:F }}>{p.type}</div></div>
              <Score v={p.score} sz={13} />
            </div>)}
          {kpi === "actions" && ACTIONS.map((a,i) =>
            <div key={i} style={{ padding:"10px 18px", borderBottom:`1px solid ${C.g1}`, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:500, color:C.g6, fontFamily:F }}>{a.title}</div><div style={{ fontSize:10, color:C.g4, fontFamily:F }}>{a.loc} · Due {a.due}</div></div>
              <Pill type={a.ov?"err":a.st==="in_progress"?"info":"base"} label={a.ov?"Overdue":a.st==="in_progress"?"In progress":"Open"} sm />
            </div>)}
        </div>
      </div>
    </div>}

    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
      <header style={{ height:69, background:C.white, borderBottom:`1px solid ${C.g2}`, padding:12, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        {/* Search bar + Search button + Explore */}
        <div style={{ display:"flex", gap:8, alignItems:"center", flex:1 }}>
          <div style={{ flex:1, maxWidth:653, background:C.g1, borderRadius:8, padding:"8px 12px", display:"flex", alignItems:"center", gap:6, cursor:"text", height:39, boxSizing:"border-box" }}>
            <svg width="16" height="16" viewBox="0 0 100 100" fill="none" style={{ flexShrink:0 }}>
              <path d="M50 4C56 4 62 8 67 12C72 8 79 6 84 10C89 14 89 22 87 28C93 31 98 37 98 44C98 51 93 56 88 59C91 65 92 72 88 78C84 84 77 85 71 84C68 89 63 94 56 96C49 98 43 95 39 90C34 94 27 96 21 92C15 88 14 80 16 74C10 70 5 64 5 57C5 50 10 44 16 41C13 35 12 28 16 22C20 16 27 15 33 17C36 11 42 5 50 4Z" fill={C.ocean}/>
              <rect x="33" y="38" width="10" height="18" rx="5" fill="white"/>
              <rect x="57" y="38" width="10" height="18" rx="5" fill="white"/>
              <path d="M38 66 Q50 74 62 66" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
            </svg>
            <span style={{ fontSize:13, color:C.g4, fontFamily:F, fontWeight:400, userSelect:"none" }}>Search your data...</span>
          </div>
          <button style={{ width:38, height:38, background:C.navy, borderRadius:8, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", padding:8, flexShrink:0 }}
            onMouseEnter={e => e.currentTarget.style.background = C.navy2}
            onMouseLeave={e => e.currentTarget.style.background = C.navy}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button style={{ display:"flex", alignItems:"center", gap:4, padding:"10px 16px", borderRadius:8, border:"none", background:"linear-gradient(135deg, #001e76 0%, #002aa9 50%, #0037dc 100%)", color:"#fff", fontSize:13, fontWeight:500, fontFamily:F, cursor:"pointer", flexShrink:0, whiteSpace:"nowrap" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            <span style={{ width:19, height:19, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="#fff"><path d="M8 0L9.4 5.2L14.6 3.4L10.8 7.2L16 8L10.8 8.8L14.6 12.6L9.4 10.8L8 16L6.6 10.8L1.4 12.6L5.2 8.8L0 8L5.2 7.2L1.4 3.4L6.6 5.2L8 0Z"/></svg>
            </span>
            <span>Explore</span>
          </button>
        </div>
        {/* Avatar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", width:104, flexShrink:0 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:600, fontFamily:F, cursor:"pointer" }}>G</div>
        </div>
      </header>

      <main style={{ flex:1, overflowY:"auto", padding:"14px 18px", display:"flex", flexDirection:"column", gap:12 }}>

        {/* Context bar */}
        <div style={{ display:"flex", alignItems:"center", padding:"10px 14px", background:C.navy3, border:`1px solid ${C.ocean3}`, borderRadius:10, gap:10 }}>
          <div style={{ width:22, height:22, background:C.navy, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <span style={{ fontSize:9, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:F }}>Viewing</span>
          <span style={{ fontSize:13, fontWeight:600, color:C.navy, fontFamily:F }}>Southeast Region</span>
          <span style={{ fontSize:11, color:C.g5, fontFamily:F }}>· 48 locations · 6 districts · 12 programs</span>
        </div>

        {/* Filters */}
        <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.g2}`, padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <span style={{ fontSize:13, fontWeight:700, color:C.navy, fontFamily:F }}>Filters</span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {pills.length > 0 && <button onClick={() => { setDate("Last 30 days"); setProgs(new Set()); setTmpls(new Set()); setRegion("All regions"); }} style={{ fontSize:11, color:C.g4, background:"none", border:"none", cursor:"pointer", fontFamily:F }}>Clear all</button>}
              <button style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, fontWeight:500, color:C.navy, background:"none", border:`1px solid ${C.g3}`, borderRadius:7, cursor:"pointer", fontFamily:F, padding:"5px 10px" }}
                onMouseEnter={e=>{e.currentTarget.style.background=C.g1;e.currentTarget.style.borderColor=C.navy;}}
                onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.borderColor=C.g3;}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Advanced filters
              </button>
            </div>
          </div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:9, fontWeight:600, color:C.g4, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:4 }}>Date range</div>
              <Drop value={date} onChange={setDate} opts={["Last 7 days","Last 30 days","Last 90 days","This month","This quarter","Fiscal year"]} />
            </div>
            <div>
              <div style={{ fontSize:9, fontWeight:600, color:C.g4, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:4 }}>Program</div>
              <MultiDrop label="All programs" sel={progs} onToggle={toggleP} opts={PROGS.map(p => p.name)} />
            </div>
            <div>
              <div style={{ fontSize:9, fontWeight:600, color:C.g4, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:4 }}>Template</div>
              <MultiDrop label="All templates" sel={tmpls} onToggle={toggleT} opts={avTmpls} />
            </div>
            <div>
              <div style={{ fontSize:9, fontWeight:600, color:C.g4, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:4 }}>Region</div>
              <Drop value={region} onChange={setRegion} opts={["All regions","Southeast","Northeast","Midwest","West"]} />
            </div>
          </div>
          {pills.length > 0 && <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:12, paddingTop:12, borderTop:`1px solid ${C.g1}` }}>
            {pills.map((p, i) => <div key={i} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 8px 4px 10px", borderRadius:999, background:C.navy3, border:`1px solid ${C.navy}`, fontSize:11, fontWeight:500, color:C.navy, fontFamily:F }}>
              <span style={{ maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.val}</span>
              <button onClick={() => clear(p.type, p.val)} style={{ display:"flex", alignItems:"center", justifyContent:"center", width:14, height:14, borderRadius:"50%", background:C.navy, border:"none", cursor:"pointer", padding:0, flexShrink:0 }}>
                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>)}
          </div>}
        </div>

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:10 }}>
          {[
            { id:"completed", lbl:"Audits completed", val:"284", den:"/ 340", meta:"+18 vs prior", up:true },
            { id:"compliance", lbl:"Avg compliance",  val:"73%", meta:"−4pp vs prior", dn:true },
            { id:"actions",   lbl:"Open action plans",val:"41",  meta:"12 locations" },
            { id:"overdue",   lbl:"Overdue audits",   val:"9",   meta:"+3 vs prior", dn:true, red:true },
          ].map((k, i) => {
            const act = kpi === k.id;
            return <div key={i} onClick={() => setKpi(act ? null : k.id)}
              style={{ background:C.white, borderRadius:10, border:`1px solid ${act?C.ocean:C.g2}`, padding:"13px 14px", cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
              <div style={{ fontSize:9, fontWeight:700, color:act?C.ocean:C.g4, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:5 }}>{k.lbl}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:4 }}>
                <span style={{ fontSize:22, fontWeight:700, color:k.red?C.red:C.g6, lineHeight:1, fontFamily:F }}>{k.val}</span>
                {k.den && <span style={{ fontSize:13, color:C.g4, fontFamily:F }}>{k.den}</span>}
              </div>
              <div style={{ fontSize:10, fontWeight:600, color:k.up?C.teal:k.dn?C.red:C.g4, fontFamily:F }}>{k.up?"▲ ":k.dn?"▼ ":""}{k.meta}</div>
            </div>;
          })}
        </div>

        {/* Compliance trend */}
        <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.g2}`, padding:"13px 8px" }}>
          <div style={{ padding:"0 8px", marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.g6, marginBottom:2, fontFamily:F }}>
              {tcat==="all" ? "Compliance trend by category" : `${CATS.find(c=>c.key===tcat)?.label||""} — programs`}
            </div>
            <div style={{ fontSize:10, color:C.g4, fontFamily:F }}>
              {tcat==="all" ? "Click a category line to drill into its programs" : "Click a program pill to isolate its line"}
            </div>
          </div>
          <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap", alignItems:"center", padding:"0 8px" }}>
            {tcat !== "all" && <button onClick={() => { setTcat("all"); setTprog(null); }}
              style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:999, border:`1px solid ${C.navy}`, background:C.navy3, cursor:"pointer", fontSize:10, fontWeight:600, color:C.navy, fontFamily:F }}>
              ← All categories
            </button>}
            {tcat === "all" ? CATS.map(cat => <button key={cat.key} onClick={() => { setTcat(cat.key); setTprog(null); }}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:999, border:`1px solid ${C.g2}`, background:C.g1, cursor:"pointer", fontSize:10, fontWeight:500, color:C.g5, fontFamily:F }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=cat.color; e.currentTarget.style.color=cat.color; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=C.g2; e.currentTarget.style.color=C.g5; }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:cat.color, display:"inline-block" }} />{cat.label} →
            </button>) : PTRENDS.filter(p=>p.cat===tcat).map(p => {
              const act=tprog===p.key, dim=tprog!=null&&!act;
              return <button key={p.key} onClick={() => setTprog(act?null:p.key)}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:999, border:`1px solid ${act?p.color:C.g2}`, background:act?C.white:C.g1, cursor:"pointer", fontSize:10, fontWeight:act?600:500, color:act?p.color:C.g6, fontFamily:F, opacity:dim?0.45:1 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:p.color, display:"inline-block" }} />{p.label}
              </button>;
            })}
          </div>
          <Chart series={cSeries} hl={tcat!=="all"?tprog:null}
            onClick={key => { if(tcat==="all"){setTcat(key);setTprog(null);}else{setTprog(tprog===key?null:key);} }} />
        </div>

        {/* ── Audit Analytics ── */}
        <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.g2}` }}>
          <div style={{ padding:"13px 16px", borderBottom:`1px solid ${C.g2}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>Audit Analytics</div>
              <div style={{ fontSize:10, color:C.g4, marginTop:2, fontFamily:F }}>
                {pills.length > 0 ? `Filtered · ${filtP.length} program${filtP.length!==1?"s":""}` : "Click a row to see a snapshot · View full scorecard to drill in"}
              </div>
            </div>
            <Pill type="base" label={`${filtP.length} programs`} />
          </div>

          {/* Program rows */}
          <GridHead
            cols="1fr 60px 60px 48px 72px 116px"
            headers={["Program","Score","Done","Due","Δ 12wk",""]}
            aligns={["left","center","center","center","center","right"]}
            gap={8} px={16}
          />

          {pageP.map(p => {
            const td = TD[p.tk] || [];
            const d = td.length > 1 ? td[td.length-1] - td[0] : 0;
            const isExp = expanded === p.id;
            const hasDrill = !!DRILL[p.id];
            return <div key={p.id}>
              <div onClick={() => hasDrill && setExpanded(isExp ? null : p.id)}
                style={{ display:"grid", gridTemplateColumns:"1fr 60px 60px 48px 72px 116px", gap:8, padding:"11px 16px", alignItems:"center", background:isExp?"#F6F7F8":"transparent", borderBottom:`1px solid ${isExp?C.g2:C.g1}`, cursor:hasDrill?"pointer":"default", transition:"background 0.1s" }}
                onMouseEnter={e => { if(!isExp) e.currentTarget.style.background=C.g1; }}
                onMouseLeave={e => { if(!isExp) e.currentTarget.style.background="transparent"; }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                  {hasDrill
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, transition:"transform 0.2s", transform:isExp?"rotate(180deg)":"rotate(0deg)" }}><polyline points="6 9 12 15 18 9"/></svg>
                    : <span style={{ width:12, flexShrink:0 }} />
                  }
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:C.ocean, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:F }}>{p.name}</div>
                    <div style={{ fontSize:9, color:C.g4, marginTop:1, fontFamily:F }}>{p.type}</div>
                  </div>
                </div>
                <div style={{ textAlign:"center" }}><Score v={p.score} /></div>
                <div style={{ fontSize:11, color:C.g5, fontFamily:F, textAlign:"center" }}>{p.done}/{p.total}</div>
                <div style={{ fontSize:12, fontWeight:600, color:p.ov>0?C.red:C.g4, fontFamily:F, textAlign:"center" }}>{p.ov}</div>
                <div style={{ fontSize:12, fontWeight:700, color:d>=0?C.teal:C.red, fontFamily:F, textAlign:"center" }}>{d>=0?"▲":"▼"} {Math.abs(d).toFixed(0)}pp</div>
                <div style={{ display:"flex", justifyContent:"flex-end" }} onClick={e=>e.stopPropagation()}>
                  <button onClick={() => onViewScorecard && onViewScorecard(p)}
                    style={{ fontSize:10, fontWeight:600, color:C.ocean, background:"none", border:`1px solid ${C.ocean3}`, borderRadius:6, cursor:"pointer", fontFamily:F, padding:"5px 11px", whiteSpace:"nowrap" }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.ocean3}
                    onMouseLeave={e=>e.currentTarget.style.background="none"}>
                    View scorecard →
                  </button>
                </div>
              </div>
              {isExp && <DrillPanel prog={p} onCollapse={() => setExpanded(null)} onViewScorecard={onViewScorecard} />}
            </div>;
          })}

          <Pages page={page} total={filtP.length} per={PER} onPage={setPage} />
        </div>

        {/* Open action plans + Behind on actions */}
        <div style={{ display:"grid", gridTemplateColumns:"minmax(0,2fr) minmax(0,3fr)", gap:12, marginBottom:8 }}>

          <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.g2}`, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"11px 16px", borderBottom:`1px solid ${C.g1}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <span style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>Open action plans</span>
              <span style={{ fontSize:11, fontWeight:600, color:C.red, fontFamily:F }}>2 overdue</span>
            </div>
            <GridHead cols="1fr 88px 64px" headers={["Action plan","Status","Priority"]} aligns={["left","center","left"]} />
            {ACTIONS.map((a, i) => {
              const [h, setH] = useState(false);
              return <div key={i} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                style={{ display:"grid", gridTemplateColumns:"1fr 88px 64px", gap:8, padding:"9px 16px", alignItems:"center", background:h?C.ocean3:"transparent", borderBottom:`1px solid ${C.g1}` }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:500, color:C.g6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:F }}>{a.title}</div>
                  <div style={{ fontSize:9, color:C.g4, marginTop:2, fontFamily:F }}>{a.loc} · Due {a.due}</div>
                </div>
                <div style={{ display:"flex", justifyContent:"center" }}>
                  <Pill type={a.ov?"err":a.st==="in_progress"?"info":"base"} label={a.ov?"Overdue":a.st==="in_progress"?"In progress":"Open"} sm />
                </div>
                <span style={{ fontSize:11, fontFamily:F, color:a.pri==="high"?C.red:a.pri==="medium"?C.yel:C.g5, fontWeight:500 }}>
                  {a.pri.charAt(0).toUpperCase()+a.pri.slice(1)}
                </span>
              </div>;
            })}
            <div style={{ padding:"10px 16px", borderTop:`1px solid ${C.g2}`, display:"flex", justifyContent:"center" }}>
              <button style={{ fontSize:11, color:C.ocean, background:"none", border:"none", cursor:"pointer", fontFamily:F, fontWeight:500 }}>View all {ACTIONS.length} action plans</button>
            </div>
          </div>

          <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.g2}`, overflow:"hidden" }}>
            <div style={{ padding:"11px 16px", borderBottom:`1px solid ${C.g1}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>Behind on actions</div>
                <div style={{ fontSize:10, color:C.g4, marginTop:2, fontFamily:F }}>{BEHIND.length} people with overdue audits · ordered by severity</div>
              </div>
              <button style={{ fontSize:11, fontWeight:500, color:C.ocean, background:"none", border:"none", cursor:"pointer", fontFamily:F }}>View full report →</button>
            </div>
            {BEHIND.map((u, i) => {
              const sev = u.ov>=3?C.red:u.ov>=2?C.yel:C.g5;
              return <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 16px", borderBottom:i<BEHIND.length-1?`1px solid ${C.g1}`:"none" }}
                onMouseEnter={e => e.currentTarget.style.background=C.g1}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:sev, color:C.white, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, fontFamily:F, flexShrink:0 }}>{u.ini}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.g6, fontFamily:F }}>{u.name}</div>
                  <div style={{ fontSize:10, color:C.g4, marginTop:2, fontFamily:F }}>{u.role} · {u.dist}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <span style={{ fontSize:13, fontWeight:700, color:sev, fontFamily:F }}>{u.ov} overdue</span>
                  <div style={{ fontSize:10, color:C.g4, marginTop:1, fontFamily:F }}>of {u.tot} assigned</div>
                </div>
              </div>;
            })}
          </div>

        </div>

      </main>
    </div>
  </div>;
}
