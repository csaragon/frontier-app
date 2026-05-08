import { useState, useRef, useEffect } from "react";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy: "#001e76", navy2: "#001356",
  ocean: "#2226f7",
  white: "#ffffff",
  g1: "#f4f4f6", g2: "#e2e5e9", g3: "#c3c8d0", g4: "#8692a2", g5: "#555f6d", g6: "#16191d",
  red: "#b6143a",
  purpleBg: "#f5f3ff", purpleBorder: "#ddd6fe",
};

// ── Stub data ─────────────────────────────────────────────────────────────────

const LOCATION_TREE = [
  { id:"r1", name:"Northeast", districts:[
    { id:"d1", name:"New England", locations:[
      {id:"l1",name:"Boston Newbury"},{id:"l2",name:"Providence Main"},
      {id:"l3",name:"Hartford Center"},{id:"l4",name:"Springfield Metro"},{id:"l5",name:"Manchester Central"},
    ]},
    { id:"d2", name:"Mid-Atlantic", locations:[
      {id:"l6",name:"NYC Broadway"},{id:"l7",name:"Philadelphia Market"},
      {id:"l8",name:"Newark Penn"},{id:"l9",name:"Brooklyn Atlantic"},{id:"l10",name:"Baltimore Harbor"},
    ]},
    { id:"d3", name:"Greater NY", locations:[
      {id:"l11",name:"Long Island Garden"},{id:"l12",name:"Westchester Central"},
      {id:"l13",name:"Stamford Town"},{id:"l14",name:"Albany Empire"},{id:"l15",name:"Syracuse Clinton"},
    ]},
  ]},
  { id:"r2", name:"Southeast", districts:[
    { id:"d4", name:"Florida", locations:[
      {id:"l16",name:"Miami Flagler"},{id:"l17",name:"Orlando International"},
      {id:"l18",name:"Tampa Bayshore"},{id:"l19",name:"Jacksonville Main"},{id:"l20",name:"Fort Lauderdale"},
    ]},
    { id:"d5", name:"Carolinas", locations:[
      {id:"l21",name:"Charlotte Uptown"},{id:"l22",name:"Raleigh Fayetteville"},
      {id:"l23",name:"Charleston King"},{id:"l24",name:"Durham Main"},{id:"l25",name:"Greensboro Center"},
    ]},
    { id:"d6", name:"Gulf Coast", locations:[
      {id:"l26",name:"Atlanta Peachtree"},{id:"l27",name:"Nashville Broadway"},
      {id:"l28",name:"Memphis Poplar"},{id:"l29",name:"New Orleans Canal"},{id:"l30",name:"Birmingham 20th"},
    ]},
  ]},
  { id:"r3", name:"Midwest", districts:[
    { id:"d7", name:"Great Lakes", locations:[
      {id:"l31",name:"Chicago Michigan"},{id:"l32",name:"Cleveland Euclid"},
      {id:"l33",name:"Detroit Woodward"},{id:"l34",name:"Columbus High"},{id:"l35",name:"Indianapolis Meridian"},
    ]},
    { id:"d8", name:"Plains", locations:[
      {id:"l36",name:"Minneapolis Nicollet"},{id:"l37",name:"Milwaukee Wisconsin"},
      {id:"l38",name:"St. Louis Olive"},{id:"l39",name:"Cincinnati Madison"},{id:"l40",name:"Kansas City Main"},
    ]},
    { id:"d9", name:"Heartland", locations:[
      {id:"l41",name:"Omaha Dodge"},{id:"l42",name:"Des Moines Ingersoll"},
      {id:"l43",name:"Wichita Douglas"},{id:"l44",name:"Louisville Broadway"},{id:"l45",name:"St. Paul Grand"},
    ]},
  ]},
  { id:"r4", name:"West", districts:[
    { id:"d10", name:"Pacific Northwest", locations:[
      {id:"l46",name:"Seattle Pike"},{id:"l47",name:"Portland Morrison"},
      {id:"l48",name:"Spokane Monroe"},{id:"l49",name:"Tacoma Pacific"},{id:"l50",name:"Bellevue Main"},
    ]},
    { id:"d11", name:"California", locations:[
      {id:"l51",name:"LA Wilshire"},{id:"l52",name:"San Francisco Market"},
      {id:"l53",name:"San Diego Harbor"},{id:"l54",name:"Sacramento J St"},{id:"l55",name:"Fresno Fulton"},
    ]},
    { id:"d12", name:"Southwest", locations:[
      {id:"l56",name:"Phoenix Camelback"},{id:"l57",name:"Las Vegas Strip"},
      {id:"l58",name:"Denver 16th St"},{id:"l59",name:"Salt Lake City Main"},{id:"l60",name:"Albuquerque Central"},
    ]},
  ]},
];

const STUB_USERS = [
  {id:"u1", name:"Alex Chen",       email:"alex.chen@thinklp.com"},
  {id:"u2", name:"Maria Rodriguez", email:"m.rodriguez@thinklp.com"},
  {id:"u3", name:"James Okafor",    email:"j.okafor@thinklp.com"},
  {id:"u4", name:"Sarah Kim",       email:"s.kim@thinklp.com"},
  {id:"u5", name:"David Patel",     email:"d.patel@thinklp.com"},
  {id:"u6", name:"Emily Torres",    email:"e.torres@thinklp.com"},
  {id:"u7", name:"Michael Johnson", email:"m.johnson@thinklp.com"},
  {id:"u8", name:"Priya Sharma",    email:"p.sharma@thinklp.com"},
  {id:"u9", name:"Carlos Mendez",   email:"c.mendez@thinklp.com"},
  {id:"u10",name:"Lisa Wang",       email:"l.wang@thinklp.com"},
  {id:"u11",name:"Robert Taylor",   email:"r.taylor@thinklp.com"},
  {id:"u12",name:"Aisha Williams",  email:"a.williams@thinklp.com"},
  {id:"u13",name:"Kevin Murphy",    email:"k.murphy@thinklp.com"},
  {id:"u14",name:"Yuki Nakamura",   email:"y.nakamura@thinklp.com"},
  {id:"u15",name:"Natasha Brown",   email:"n.brown@thinklp.com"},
  {id:"u16",name:"Omar Hassan",     email:"o.hassan@thinklp.com"},
  {id:"u17",name:"Jennifer Park",   email:"j.park@thinklp.com"},
  {id:"u18",name:"Daniel Cooper",   email:"d.cooper@thinklp.com"},
  {id:"u19",name:"Fatima Ali",      email:"f.ali@thinklp.com"},
  {id:"u20",name:"Marcus Lee",      email:"m.lee@thinklp.com"},
];

const STUB_ROLES = [
  "Store Manager","Asset Protection Lead","Operations Manager",
  "Department Lead","District Manager","Regional Manager",
];

const STUB_GROUPS = [
  {id:"g1",name:"All Store Managers — Southeast"},
  {id:"g2",name:"Regional LP Team"},
  {id:"g3",name:"Q1 Audit Crew"},
  {id:"g4",name:"District Operations Leads"},
  {id:"g5",name:"National Safety Committee"},
];

const STUB_PROGRAMS = [
  {id:"p1",name:"Health & Safety — Southeast"},
  {id:"p2",name:"LP Compliance Program — Northeast"},
  {id:"p3",name:"PPE Compliance — West Region"},
  {id:"p4",name:"Fire Safety — National"},
  {id:"p5",name:"Operations Standards — Midwest"},
  {id:"p6",name:"Shrink Prevention — Southeast"},
  {id:"p7",name:"OSHA Compliance — All Regions"},
];

const TIMEZONES = [
  {id:"America/New_York",   label:"Eastern Time (ET)"},
  {id:"America/Chicago",    label:"Central Time (CT)"},
  {id:"America/Denver",     label:"Mountain Time (MT)"},
  {id:"America/Los_Angeles",label:"Pacific Time (PT)"},
  {id:"America/Anchorage",  label:"Alaska Time (AKT)"},
  {id:"Pacific/Honolulu",   label:"Hawaii Time (HT)"},
  {id:"America/Phoenix",    label:"Arizona Time (MST, no DST)"},
];

const SCHEDULE_TYPES = [
  {
    key:"one-time", label:"One-time", desc:"Run once on a specific date.",
    icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="16" cy="16" r="3"/><line x1="16" y1="14.8" x2="16" y2="16"/><line x1="16" y1="16" x2="17.2" y2="16"/></svg>,
  },
  {
    key:"recurring", label:"Recurring", desc:"Run on a regular cadence — daily, weekly, monthly, or quarterly.",
    icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  },
  {
    key:"event-triggered", label:"Event-triggered", desc:"Run when a specific event happens, like an incident or new location.",
    icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  },
];

const DAYS_OF_WEEK = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const TOOLTIPS = {
  scheduleType:     "How often this template generates audits. Recurring is the most common — set a cadence and it'll run automatically.",
  scheduleDetails:  "The specific timing for this template. Audits are generated based on this schedule.",
  futureActivation: "Useful for rolling out a template later. The template stays inactive until the date you set.",
  locations:        "Pick where this template runs. Selecting a region auto-includes all stores under it.",
  assignees:        "Choose who completes the audits. You can assign specific people, by role, or by group — combine all three if needed.",
  programs:         "Add this template to existing programs to keep your reporting organized. Leave blank if it's standalone.",
};

function getLocalTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "America/New_York"; }
}

// ── Primitives ────────────────────────────────────────────────────────────────

function FieldLabel({ required, children }) {
  return (
    <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.g6, marginBottom:6, fontFamily:F }}>
      {children}{required && <span style={{ color:C.red, marginLeft:2 }}>*</span>}
    </label>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p style={{ margin:"6px 0 0", fontSize:12, color:C.red, fontFamily:F }}>{msg}</p>;
}

function HelperText({ children }) {
  return <p style={{ margin:"6px 0 0", fontSize:12, color:C.g4, fontFamily:F, lineHeight:"16px" }}>{children}</p>;
}

function inputCss() {
  return { width:"100%", padding:"9px 12px", fontSize:13, fontFamily:F, color:C.g6, border:`1px solid ${C.g3}`, borderRadius:8, outline:"none", background:C.white, boxSizing:"border-box" };
}

function selectCss() {
  return { ...inputCss(), appearance:"none", WebkitAppearance:"none", paddingRight:32, cursor:"pointer" };
}

function SelectArrow({ value, onChange, children, maxWidth }) {
  return (
    <div style={{ position:"relative", maxWidth: maxWidth || "100%" }}>
      <select value={value} onChange={onChange} style={selectCss()}>{children}</select>
      <svg style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
        width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  );
}

function Toggle({ checked, onChange, label, helper }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
      <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        style={{ flexShrink:0, width:36, height:20, borderRadius:999, border:"none", cursor:"pointer",
          background: checked ? C.ocean : C.g3, position:"relative", transition:"background 0.15s", marginTop:2 }}>
        <span style={{ position:"absolute", top:3, left: checked ? 19 : 3, width:14, height:14,
          borderRadius:"50%", background:C.white, transition:"left 0.15s" }} />
      </button>
      <div>
        <div style={{ fontSize:13, fontWeight:500, color:C.g6, fontFamily:F }}>{label}</div>
        {helper && <p style={{ margin:"2px 0 0", fontSize:12, color:C.g4, fontFamily:F, lineHeight:"16px" }}>{helper}</p>}
      </div>
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5,
      background:"#eef1ff", color:C.navy, border:"1px solid #c7cff7",
      borderRadius:999, padding:"3px 10px 3px 12px", fontSize:12, fontWeight:500, fontFamily:F }}>
      {label}
      <button onClick={onRemove} style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", color:C.navy, lineHeight:1 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </span>
  );
}

// Tooltip info icon
function InfoTip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position:"relative", display:"inline-flex", alignItems:"center", marginLeft:5 }}>
      <button onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
        style={{ background:"none", border:"none", padding:0, cursor:"pointer", display:"flex", color:C.g4, lineHeight:1 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </button>
      {show && (
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)",
          background:C.g6, color:C.white, padding:"8px 12px", borderRadius:6, fontSize:12,
          fontFamily:F, lineHeight:"16px", width:240, zIndex:999, boxShadow:"0 4px 14px rgba(0,0,0,0.2)",
          whiteSpace:"normal" }}>
          {text}
        </div>
      )}
    </span>
  );
}

// Section card with header
function SectionCard({ title, helper, tooltip, error, children }) {
  return (
    <div style={{ background:C.white, borderRadius:12, border:`1px solid ${error ? C.red : C.g2}`, padding:"24px 28px", marginBottom:20 }}>
      <div style={{ marginBottom:18 }}>
        <div style={{ display:"flex", alignItems:"center" }}>
          <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:C.g6, fontFamily:F }}>{title}</h3>
          {tooltip && <InfoTip text={tooltip} />}
        </div>
        {helper && <p style={{ margin:"4px 0 0", fontSize:12, color:C.g4, fontFamily:F, lineHeight:"18px" }}>{helper}</p>}
      </div>
      {children}
      {error && <FieldError msg={error} />}
    </div>
  );
}

// ── Multi-select dropdown ─────────────────────────────────────────────────────

function MultiPicker({ options, selected, onToggle, placeholder, getId, getLabel, getSubLabel }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const filtered = options.filter(o => {
    if (!query) return true;
    const q = query.toLowerCase();
    return getLabel(o).toLowerCase().includes(q) || (getSubLabel && getSubLabel(o).toLowerCase().includes(q));
  });

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display:"flex", alignItems:"center", padding:"8px 12px",
        border:`1px solid ${open ? C.ocean : C.g3}`, borderRadius:8, background:C.white, cursor:"pointer", minHeight:40,
        boxShadow: open ? "0 0 0 2px rgba(34,38,247,0.12)" : "none", transition:"border-color 0.15s" }}>
        <span style={{ fontSize:13, color:C.g4, fontFamily:F, flex:1 }}>{placeholder}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:300,
          background:C.white, border:`1px solid ${C.g2}`, borderRadius:8,
          boxShadow:"0 8px 24px rgba(0,0,0,0.12)", overflow:"hidden" }}>
          <div style={{ padding:"8px 10px", borderBottom:`1px solid ${C.g2}` }}>
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..."
              style={{ ...inputCss(), padding:"6px 10px", fontSize:12 }} />
          </div>
          <div style={{ maxHeight:240, overflowY:"auto" }}>
            {filtered.length === 0 && <div style={{ padding:"12px 14px", fontSize:13, color:C.g4, fontFamily:F }}>No results</div>}
            {filtered.map(o => {
              const id = getId(o);
              const isSel = selected.includes(id);
              return (
                <div key={id} onClick={() => onToggle(id)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", cursor:"pointer",
                    background: isSel ? "#f0f4ff" : C.white }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = C.g1; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isSel ? "#f0f4ff" : C.white; }}>
                  <input type="checkbox" readOnly checked={isSel} style={{ width:14, height:14, accentColor:C.ocean }} />
                  <div>
                    <div style={{ fontSize:13, color:C.g6, fontFamily:F, fontWeight: isSel ? 500 : 400 }}>{getLabel(o)}</div>
                    {getSubLabel && <div style={{ fontSize:12, color:C.g4, fontFamily:F }}>{getSubLabel(o)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Location tree ─────────────────────────────────────────────────────────────

function IndetermCheckbox({ checked, indeterminate, onChange }) {
  const ref = useRef();
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange}
    style={{ width:14, height:14, cursor:"pointer", accentColor:C.ocean, flexShrink:0 }} />;
}

function LocationTree({ selected, onChange }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState({});

  const q = query.toLowerCase();

  function locCount(locations) { return locations.filter(l => selected.includes(l.id)).length; }

  function distState(d) {
    const sel = locCount(d.locations);
    if (sel === 0) return "none";
    if (sel === d.locations.length) return "all";
    return "some";
  }
  function regState(r) {
    const states = r.districts.map(distState);
    if (states.every(s => s === "all")) return "all";
    if (states.every(s => s === "none")) return "none";
    return "some";
  }

  function toggleRegion(r) {
    const all = r.districts.flatMap(d => d.locations.map(l => l.id));
    onChange(regState(r) === "all"
      ? selected.filter(id => !all.includes(id))
      : [...new Set([...selected, ...all])]);
  }
  function toggleDistrict(d) {
    const all = d.locations.map(l => l.id);
    onChange(distState(d) === "all"
      ? selected.filter(id => !all.includes(id))
      : [...new Set([...selected, ...all])]);
  }
  function toggleLoc(id) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  }

  function matchLoc(l) { return !q || l.name.toLowerCase().includes(q); }
  function matchDist(d) { return !q || d.name.toLowerCase().includes(q) || d.locations.some(matchLoc); }
  function matchReg(r) { return !q || r.name.toLowerCase().includes(q) || r.districts.some(matchDist); }

  function toggle(id) { setExpanded(e => ({ ...e, [id]: !e[id] })); }
  function expandAll() {
    const all = {};
    LOCATION_TREE.forEach(r => { all[r.id] = true; r.districts.forEach(d => { all[d.id] = true; }); });
    setExpanded(all);
  }
  function collapseAll() { setExpanded({}); }

  const totalSel = selected.length;
  const distWithSel = LOCATION_TREE.flatMap(r => r.districts).filter(d => d.locations.some(l => selected.includes(l.id)));
  const regWithSel  = LOCATION_TREE.filter(r => r.districts.some(d => d.locations.some(l => selected.includes(l.id))));

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:10, alignItems:"center" }}>
        <div style={{ position:"relative", flex:1 }}>
          <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search regions, districts, or locations..."
            style={{ ...inputCss(), paddingLeft:32, fontSize:12 }} />
        </div>
        <button onClick={expandAll}  style={{ fontSize:12, color:C.g5, background:"none", border:"none", cursor:"pointer", padding:"4px 8px", fontFamily:F, whiteSpace:"nowrap" }}>Expand all</button>
        <button onClick={collapseAll} style={{ fontSize:12, color:C.g5, background:"none", border:"none", cursor:"pointer", padding:"4px 8px", fontFamily:F, whiteSpace:"nowrap" }}>Collapse all</button>
      </div>

      <div style={{ fontSize:12, color:C.navy, fontWeight:500, fontFamily:F, marginBottom:10, padding:"6px 10px", background:"#eef1ff", borderRadius:6 }}>
        Selected: {totalSel} location{totalSel !== 1 ? "s" : ""} across {distWithSel.length} district{distWithSel.length !== 1 ? "s" : ""} in {regWithSel.length} region{regWithSel.length !== 1 ? "s" : ""}
      </div>

      <div style={{ border:`1px solid ${C.g2}`, borderRadius:8, overflow:"hidden" }}>
        {LOCATION_TREE.filter(matchReg).map((region, ri) => {
          const rSt = regState(region);
          const rExp = !!expanded[region.id] || !!q;
          return (
            <div key={region.id} style={{ borderTop: ri > 0 ? `1px solid ${C.g2}` : "none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:C.g1, cursor:"pointer" }}
                onClick={() => toggle(region.id)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: rExp ? "rotate(90deg)" : "none", transition:"transform 0.15s", flexShrink:0 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
                <span onClick={e => e.stopPropagation()}>
                  <IndetermCheckbox checked={rSt === "all"} indeterminate={rSt === "some"} onChange={() => toggleRegion(region)} />
                </span>
                <span style={{ fontSize:13, fontWeight:600, color:C.g6, fontFamily:F }}>{region.name}</span>
                <span style={{ fontSize:12, color:C.g4, fontFamily:F, marginLeft:"auto" }}>
                  {region.districts.flatMap(d => d.locations).filter(l => selected.includes(l.id)).length} / {region.districts.flatMap(d => d.locations).length}
                </span>
              </div>

              {rExp && region.districts.filter(matchDist).map((district) => {
                const dSt = distState(district);
                const dExp = !!expanded[district.id] || !!q;
                return (
                  <div key={district.id} style={{ borderTop:`1px solid ${C.g2}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 14px 9px 34px", background:C.white, cursor:"pointer" }}
                      onClick={() => toggle(district.id)}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: dExp ? "rotate(90deg)" : "none", transition:"transform 0.15s", flexShrink:0 }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      <span onClick={e => e.stopPropagation()}>
                        <IndetermCheckbox checked={dSt === "all"} indeterminate={dSt === "some"} onChange={() => toggleDistrict(district)} />
                      </span>
                      <span style={{ fontSize:12, fontWeight:500, color:C.g6, fontFamily:F }}>{region.name} → {district.name}</span>
                      <span style={{ fontSize:12, color:C.g4, fontFamily:F, marginLeft:"auto" }}>
                        {locCount(district.locations)} / {district.locations.length}
                      </span>
                    </div>
                    {dExp && district.locations.filter(matchLoc).map(loc => (
                      <div key={loc.id} onClick={() => toggleLoc(loc.id)}
                        style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px 8px 56px",
                          borderTop:`1px solid ${C.g2}`, background: selected.includes(loc.id) ? "#f5f7ff" : C.white, cursor:"pointer" }}>
                        <input type="checkbox" checked={selected.includes(loc.id)} onChange={() => toggleLoc(loc.id)}
                          onClick={e => e.stopPropagation()}
                          style={{ width:13, height:13, cursor:"pointer", accentColor:C.ocean }} />
                        <span style={{ fontSize:12, color:C.g6, fontFamily:F }}>{loc.name}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Timezone picker ───────────────────────────────────────────────────────────

function TzPicker({ value, onChange }) {
  const val = value || getLocalTimezone();
  return (
    <SelectArrow value={val} onChange={e => onChange(e.target.value)}>
      {TIMEZONES.map(tz => <option key={tz.id} value={tz.id}>{tz.label}</option>)}
    </SelectArrow>
  );
}

// ── Schedule detail panels ────────────────────────────────────────────────────

function OneTimeDetails({ det, onChange }) {
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:6 }}>
        <div>
          <FieldLabel required>Date</FieldLabel>
          <input type="date" value={det.date||""} onChange={e => onChange({date:e.target.value})} style={inputCss()} />
        </div>
        <div>
          <FieldLabel required>Time</FieldLabel>
          <input type="time" value={det.time||""} onChange={e => onChange({time:e.target.value})} style={inputCss()} />
        </div>
        <div>
          <FieldLabel required>Time zone</FieldLabel>
          <TzPicker value={det.timezone} onChange={tz => onChange({timezone:tz})} />
        </div>
      </div>
      <HelperText>Audits will be generated and assigned at this date and time.</HelperText>
    </div>
  );
}

function RecurringDetails({ det, onChange }) {
  const cadence = det.cadence || "";
  const runForever = det.runIndefinitely !== false;
  const cc = det.cadenceConfig || {};

  function patchCc(patch) { onChange({ cadenceConfig:{ ...cc, ...patch } }); }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <FieldLabel required>Cadence</FieldLabel>
        <SelectArrow value={cadence} onChange={e => onChange({cadence:e.target.value, cadenceConfig:{}})} maxWidth={260}>
          <option value="" disabled>Select cadence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </SelectArrow>
      </div>

      {cadence === "daily" && (
        <div style={{ maxWidth:200 }}>
          <FieldLabel required>Time</FieldLabel>
          <input type="time" value={cc.time||""} onChange={e => patchCc({time:e.target.value})} style={inputCss()} />
        </div>
      )}

      {cadence === "weekly" && (
        <div>
          <FieldLabel required>Day(s) of week</FieldLabel>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
            {DAYS_OF_WEEK.map(day => {
              const sel = (cc.days||[]).includes(day);
              return (
                <button key={day} onClick={() => patchCc({ days: sel ? (cc.days||[]).filter(d=>d!==day) : [...(cc.days||[]),day] })}
                  style={{ padding:"5px 12px", borderRadius:6, border:`1px solid ${sel ? C.ocean : C.g3}`,
                    background: sel ? "#eef1ff" : C.white, color: sel ? C.ocean : C.g5,
                    fontSize:12, fontWeight: sel ? 600 : 400, fontFamily:F, cursor:"pointer" }}>
                  {day}
                </button>
              );
            })}
          </div>
          <div style={{ maxWidth:200 }}>
            <FieldLabel required>Time</FieldLabel>
            <input type="time" value={cc.time||""} onChange={e => patchCc({time:e.target.value})} style={inputCss()} />
          </div>
        </div>
      )}

      {cadence === "monthly" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:440 }}>
          <div>
            <FieldLabel required>Day of month</FieldLabel>
            <SelectArrow value={cc.dayOfMonth||""} onChange={e => patchCc({dayOfMonth:e.target.value})}>
              <option value="" disabled>Select day</option>
              {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}</option>)}
              <option value="last">Last day of month</option>
            </SelectArrow>
          </div>
          <div>
            <FieldLabel required>Time</FieldLabel>
            <input type="time" value={cc.time||""} onChange={e => patchCc({time:e.target.value})} style={inputCss()} />
          </div>
        </div>
      )}

      {cadence === "quarterly" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
          <div>
            <FieldLabel required>Month within quarter</FieldLabel>
            <SelectArrow value={cc.quarterMonth||""} onChange={e => patchCc({quarterMonth:e.target.value})}>
              <option value="" disabled>Select</option>
              <option value="first">First month</option>
              <option value="second">Second month</option>
              <option value="third">Third month</option>
            </SelectArrow>
          </div>
          <div>
            <FieldLabel required>Day of month</FieldLabel>
            <SelectArrow value={cc.dayOfMonth||""} onChange={e => patchCc({dayOfMonth:e.target.value})}>
              <option value="" disabled>Select day</option>
              {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}</option>)}
              <option value="last">Last day of month</option>
            </SelectArrow>
          </div>
          <div>
            <FieldLabel required>Time</FieldLabel>
            <input type="time" value={cc.time||""} onChange={e => patchCc({time:e.target.value})} style={inputCss()} />
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:440 }}>
        <div>
          <FieldLabel required>Start date</FieldLabel>
          <input type="date" value={det.startDate||""} onChange={e => onChange({startDate:e.target.value})} style={inputCss()} />
        </div>
        <div>
          <FieldLabel required>Time zone</FieldLabel>
          <TzPicker value={det.timezone} onChange={tz => onChange({timezone:tz})} />
        </div>
      </div>

      <div>
        <Toggle
          checked={runForever}
          onChange={val => onChange({ runIndefinitely:val, endDate: val ? undefined : det.endDate })}
          label="Run indefinitely"
          helper="Turn off to set an end date for this schedule."
        />
        {!runForever && (
          <div style={{ marginTop:14, maxWidth:220 }}>
            <FieldLabel required>End date</FieldLabel>
            <input type="date" value={det.endDate||""} onChange={e => onChange({endDate:e.target.value})} style={inputCss()} />
          </div>
        )}
      </div>

      <HelperText>Audits will be auto-generated and assigned on this cadence.</HelperText>
    </div>
  );
}

function EventDetails({ det, onChange }) {
  // Event-triggered options to be finalized per Linear stories — stub list for prototype.
  return (
    <div>
      <div style={{ maxWidth:340 }}>
        <FieldLabel required>Trigger event</FieldLabel>
        <SelectArrow value={det.triggerEvent||""} onChange={e => onChange({triggerEvent:e.target.value})}>
          <option value="" disabled>Select trigger</option>
          <option value="incident_logged">Incident logged</option>
          <option value="new_location">New location added</option>
          <option value="audit_failure">Audit failure (cascading audit)</option>
          <option value="manual">Manual trigger only</option>
        </SelectArrow>
      </div>
      <HelperText>Audits will be generated when this event happens.</HelperText>
    </div>
  );
}

// ── Schedule type change confirmation modal ───────────────────────────────────

function TypeChangeModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.4)" }} onClick={onCancel} />
      <div style={{ position:"relative", background:C.white, borderRadius:12, padding:"28px 32px", width:420, boxShadow:"0 20px 60px rgba(0,0,0,0.20)" }}>
        <h3 style={{ margin:"0 0 10px", fontSize:16, fontWeight:700, color:C.g6, fontFamily:F }}>Change schedule type?</h3>
        <p style={{ margin:"0 0 24px", fontSize:13, color:C.g5, fontFamily:F, lineHeight:"20px" }}>
          Changing the schedule type will reset the timing details. Continue?
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{ background:C.white, border:`1px solid ${C.g3}`, borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:500, fontFamily:F, cursor:"pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ background:C.navy, color:C.white, border:"none", borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:600, fontFamily:F, cursor:"pointer" }}>
            Change type
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Step5Schedule({ formData, onChange, onNext, onBack }) {
  const d = formData || {};
  const [pendingType, setPendingType] = useState(null);
  const [touched, setTouched] = useState({});

  function touch(k) { setTouched(p => ({ ...p, [k]:true })); }

  function handleTypeSelect(type) {
    if (type === d.scheduleType) return;
    const hasDetails = d.scheduleDetails && Object.keys(d.scheduleDetails).length > 0;
    if (hasDetails) {
      setPendingType(type);
    } else {
      onChange({ scheduleType:type, scheduleDetails:{} });
    }
  }

  function updateDetails(patch) {
    onChange({ scheduleDetails:{ ...(d.scheduleDetails||{}), ...patch } });
  }

  const selectedLocs = d.locations || [];
  const locError = touched.locations && selectedLocs.length === 0;

  const asgn = d.assignees || {};
  const hasAssignee = (asgn.users||[]).length > 0 || (asgn.roles||[]).length > 0 || (asgn.groups||[]).length > 0;
  const asgnError = touched.assignees && !hasAssignee;

  function updateAssignees(patch) { onChange({ assignees:{ ...(d.assignees||{}), ...patch } }); }

  const selPrograms = d.programs || [];
  const activateLater = !!d.activateLater;

  function handleNext() {
    setTouched({ locations:true, assignees:true });
    onNext();
  }

  return (
    <div style={{ padding:"40px 24px 80px", display:"flex", justifyContent:"center", fontFamily:F, overflowY:"auto", flex:1 }}>
      <div style={{ width:"100%", maxWidth:1080 }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ margin:"0 0 6px", fontSize:24, fontWeight:700, color:"#16191d", fontFamily:F }}>Schedule &amp; Assignment</h2>
          <p style={{ margin:0, fontSize:13, color:"#16191d", fontFamily:F }}>Set when audits run, where they happen, and who completes them.</p>
        </div>

        {/* ── Section 1: Schedule type ── */}
        <SectionCard title="Schedule type" helper="How often should this template generate audits?" tooltip={TOOLTIPS.scheduleType}>
          <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
            {SCHEDULE_TYPES.map(st => {
              const sel = d.scheduleType === st.key;
              return (
                <button key={st.key} onClick={() => handleTypeSelect(st.key)}
                  style={{ flex:"1 1 190px", minWidth:170, display:"flex", flexDirection:"column", alignItems:"flex-start",
                    gap:10, padding:"18px 20px", borderRadius:12, cursor:"pointer", textAlign:"left",
                    border:`2px solid ${sel ? C.navy : C.g2}`, background: sel ? "#eef1ff" : C.white,
                    transition:"border-color 0.15s, background 0.15s",
                    boxShadow: sel ? "0 2px 10px rgba(0,30,118,0.10)" : "none" }}
                  onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = C.g3; e.currentTarget.style.background = C.g1; }}}
                  onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = C.g2; e.currentTarget.style.background = C.white; }}}>
                  <span style={{ color: sel ? C.navy : C.g4 }}>{st.icon}</span>
                  <span style={{ fontSize:13, fontWeight:600, color: sel ? C.navy : C.g6, fontFamily:F }}>{st.label}</span>
                  <span style={{ fontSize:12, color:C.g4, fontFamily:F, lineHeight:"17px" }}>{st.desc}</span>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* ── Section 2: Schedule details (conditional) ── */}
        {d.scheduleType && (
          <SectionCard title="Schedule details" tooltip={TOOLTIPS.scheduleDetails}>
            {d.scheduleType === "one-time"       && <OneTimeDetails  det={d.scheduleDetails||{}} onChange={updateDetails} />}
            {d.scheduleType === "recurring"       && <RecurringDetails det={d.scheduleDetails||{}} onChange={updateDetails} />}
            {d.scheduleType === "event-triggered" && <EventDetails    det={d.scheduleDetails||{}} onChange={updateDetails} />}
          </SectionCard>
        )}

        {/* ── Section 3: Future-dated activation ── */}
        <SectionCard title="Future-dated activation" tooltip={TOOLTIPS.futureActivation}>
          <Toggle
            checked={activateLater}
            onChange={val => onChange({ activateLater:val })}
            label="Activate at a future date"
            helper="Template will be saved but won't generate audits until the activation date."
          />
          {activateLater && (
            <div style={{ marginTop:18, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
              <div>
                <FieldLabel required>Date</FieldLabel>
                <input type="date" value={d.activationDate||""} onChange={e => onChange({activationDate:e.target.value})} style={inputCss()} />
              </div>
              <div>
                <FieldLabel required>Time</FieldLabel>
                <input type="time" value={d.activationTime||""} onChange={e => onChange({activationTime:e.target.value})} style={inputCss()} />
              </div>
              <div>
                <FieldLabel required>Time zone</FieldLabel>
                <TzPicker value={d.activationTz} onChange={tz => onChange({activationTz:tz})} />
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── Section 4: Locations ── */}
        <SectionCard title="Locations" helper="Where should this template be used?" tooltip={TOOLTIPS.locations}
          error={locError ? "Pick at least one location for this template." : null}>
          <LocationTree
            selected={selectedLocs}
            onChange={locs => { onChange({locations:locs}); touch("locations"); }}
          />
        </SectionCard>

        {/* ── Section 5: Assignees ── */}
        <SectionCard title="Assignees" helper="Who should complete the audit at each location?" tooltip={TOOLTIPS.assignees}
          error={asgnError ? "Pick at least one way to assign this audit." : null}>

          {/* Specific users */}
          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.g6, fontFamily:F, marginBottom:6 }}>Specific user(s)</div>
            <MultiPicker
              options={STUB_USERS} selected={asgn.users||[]}
              onToggle={id => { const c=asgn.users||[]; updateAssignees({users: c.includes(id)?c.filter(x=>x!==id):[...c,id]}); touch("assignees"); }}
              placeholder="Search and select users..."
              getId={u=>u.id} getLabel={u=>u.name} getSubLabel={u=>u.email}
            />
            {(asgn.users||[]).length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
                {(asgn.users||[]).map(uid => { const u=STUB_USERS.find(x=>x.id===uid); return u ? <Chip key={uid} label={u.name} onRemove={() => updateAssignees({users:(asgn.users||[]).filter(x=>x!==uid)})} /> : null; })}
              </div>
            )}
            <HelperText>These specific people will be assigned the audit at every selected location.</HelperText>
          </div>

          <div style={{ height:1, background:C.g2, margin:"0 0 20px" }} />

          {/* Role */}
          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.g6, fontFamily:F, marginBottom:6 }}>Role at each location</div>
            <MultiPicker
              options={STUB_ROLES.map(r=>({id:r,name:r}))} selected={asgn.roles||[]}
              onToggle={id => { const c=asgn.roles||[]; updateAssignees({roles: c.includes(id)?c.filter(x=>x!==id):[...c,id]}); touch("assignees"); }}
              placeholder="Select roles..."
              getId={r=>r.id} getLabel={r=>r.name}
            />
            {(asgn.roles||[]).length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
                {(asgn.roles||[]).map(role => <Chip key={role} label={role} onRemove={() => updateAssignees({roles:(asgn.roles||[]).filter(x=>x!==role)})} />)}
              </div>
            )}
            <HelperText>Whoever holds this role at each location will be assigned automatically.</HelperText>
          </div>

          <div style={{ height:1, background:C.g2, margin:"0 0 20px" }} />

          {/* Groups */}
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:C.g6, fontFamily:F, marginBottom:6 }}>User group</div>
            <MultiPicker
              options={STUB_GROUPS} selected={asgn.groups||[]}
              onToggle={id => { const c=asgn.groups||[]; updateAssignees({groups: c.includes(id)?c.filter(x=>x!==id):[...c,id]}); touch("assignees"); }}
              placeholder="Select groups..."
              getId={g=>g.id} getLabel={g=>g.name}
            />
            {(asgn.groups||[]).length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
                {(asgn.groups||[]).map(gid => { const g=STUB_GROUPS.find(x=>x.id===gid); return g ? <Chip key={gid} label={g.name} onRemove={() => updateAssignees({groups:(asgn.groups||[]).filter(x=>x!==gid)})} /> : null; })}
              </div>
            )}
            <HelperText>Everyone in this group will be assigned, regardless of location.</HelperText>
          </div>
        </SectionCard>

        {/* ── Section 6: Programs (optional) ── */}
        <SectionCard title="Apply to existing programs" helper="Add this template to one or more existing programs, or leave blank to make it standalone." tooltip={TOOLTIPS.programs}>
          <MultiPicker
            options={STUB_PROGRAMS} selected={selPrograms}
            onToggle={id => { const c=d.programs||[]; onChange({programs: c.includes(id)?c.filter(x=>x!==id):[...c,id]}); }}
            placeholder="Select programs..."
            getId={p=>p.id} getLabel={p=>p.name}
          />
          {selPrograms.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>
              {selPrograms.map(pid => { const p=STUB_PROGRAMS.find(x=>x.id===pid); return p ? <Chip key={pid} label={p.name} onRemove={() => onChange({programs:selPrograms.filter(x=>x!==pid)})} /> : null; })}
            </div>
          )}
        </SectionCard>

      </div>

      {pendingType && (
        <TypeChangeModal
          onConfirm={() => { onChange({scheduleType:pendingType, scheduleDetails:{}}); setPendingType(null); }}
          onCancel={() => setPendingType(null)}
        />
      )}
    </div>
  );
}
