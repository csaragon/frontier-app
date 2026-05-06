import { useState, useRef, useEffect } from "react";
import { T, F } from "./aegis-tokens.js";

const ICONS = {
  waffle:      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="1" y="1" width="4" height="4" rx="1"/><rect x="7" y="1" width="4" height="4" rx="1"/><rect x="13" y="1" width="4" height="4" rx="1"/><rect x="1" y="7" width="4" height="4" rx="1"/><rect x="7" y="7" width="4" height="4" rx="1"/><rect x="13" y="7" width="4" height="4" rx="1"/><rect x="1" y="13" width="4" height="4" rx="1"/><rect x="7" y="13" width="4" height="4" rx="1"/><rect x="13" y="13" width="4" height="4" rx="1"/></svg>,
  chevronLeft: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevronRight:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  dashboard:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  programs:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="5" rx="1"/><rect x="3" y="17" width="18" height="4" rx="1"/></svg>,
  audits:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  escalations: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  action_plans:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  catalog:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  employees:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  locations:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  settings:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  //audit_builder: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="16" width="20" height="4" rx="1"/><rect x="2" y="10" width="20" height="4" rx="1"/><rect x="2" y="4"  width="20" height="4" rx="1"/><line x1="18" y1="4"  x2="18" y2="20" strokeWidth="1" stroke="currentColor" strokeDasharray="2 1.5"/></svg>,
  template_builder: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="5" rx="1"/><path d="M3 17h10"/><path d="M17 17l2 2 4-4"/></svg>,
};

const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",    icon: "dashboard"    },
  { id: "programs",     label: "Programs",     icon: "programs"     },
  { id: "audits",       label: "Audits",       icon: "audits"       },
  { id: "employees",    label: "Employees",    icon: "employees"    },
  { id: "locations",    label: "Locations",    icon: "locations"    },
  { id: "escalations",  label: "Escalations",  icon: "escalations"  },
  { id: "action_plans", label: "Action Plans", icon: "action_plans" },
];

const MANAGE_ITEMS = [
  //{ id: "audit_builder", label: "Audit Builder",    icon: "audit_builder"    },
  { id: "template_builder",    label: "Audit Builder", icon: "template_builder" },
  { id: "catalog",          label: "Catalog",          icon: "catalog"          },
  { id: "users",            label: "Users",            icon: "users"            },
];

const THINKLP_MODULES = [
  { id:"dashboard",      label:"Dashboard",     color:"#4f6bed" },
  { id:"cases",          label:"Cases",         color:"#5a7d9a" },
  { id:"investigations", label:"Investigations",color:"#7c6faa" },
  { id:"recovery",       label:"Recovery",      color:"#4a9e7e" },
  { id:"safety",         label:"Safety",        color:"#c97040" },
  { id:"audit",          label:"Audit",         color:"#5c8a5c", active: true },
  { id:"hr",             label:"HR",            color:"#8a7060" },
  { id:"insights",       label:"Insights",      color:T.actionContainer1 },
  { id:"crime-linking",  label:"Crime Linking", color:"#8b5e8b" },
  { id:"admin",          label:"Admin",         color:"#6b6b6b" },
];

function AppLauncher({ open, onClose }) {
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} style={{ position:"fixed", top:69, left:52, zIndex:200, width:300, background:T.onAction1, borderRadius:12, border:"1px solid #e2e5e9", padding:16, boxShadow:"0 8px 30px rgba(0,0,0,0.12)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:13, fontWeight:800, color:T.onSurface2, fontFamily:F, letterSpacing:"-0.5px" }}>think</span>
          <span style={{ background:T.actionContainer1, color:T.onAction1, fontSize:10, fontWeight:700, padding:"2px 4px", borderRadius:4 }}>LP</span>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:T.disabled1, display:"flex", padding:4, borderRadius:4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
        {THINKLP_MODULES.map(m => (
          <button key={m.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, padding:"10px 4px", borderRadius:8, border:`1px solid ${m.active ? m.color+"40" : T.border1}`, background: m.active ? m.color+"10" : T.onAction1, cursor:"pointer" }}>
            <div style={{ width:28, height:28, borderRadius:8, background: m.color, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:10, fontWeight:800, color:T.onAction1, fontFamily:F }}>{m.label.slice(0,2).toUpperCase()}</span>
            </div>
            <span style={{ fontSize:10, fontWeight: m.active ? 700 : 400, color: m.active ? m.color : T.onSurface1, fontFamily:F, textAlign:"center", lineHeight:"12px" }}>{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AppSidebar({ activeId = "dashboard", onNav }) {
  const [collapsed, setCollapsed] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [waffleH, setWaffleH] = useState(false);

  const NavBtn = ({ item }) => {
    const isActive = activeId === item.id;
    const icon = ICONS[item.icon];
    if (collapsed) {
      return (
        <button onClick={() => onNav?.(item.id)} title={item.label}
          style={{ width:"100%", height:36, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:6, border:"none", cursor:"pointer", background: isActive ? T.actionContainer1 : "transparent", color: isActive ? T.onAction1 : T.action1, transition:"all 0.12s" }}
          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.surface2; }}
          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
          <span style={{ display:"flex", width:16, height:16 }}>{icon}</span>
        </button>
      );
    }
    return (
      <button onClick={() => onNav?.(item.id)}
        style={{ width:"100%", height:40, display:"flex", alignItems:"center", gap:8, padding:"0 12px", borderRadius:6, border:"none", cursor:"pointer", background: isActive ? T.actionContainer1 : "transparent", color: isActive ? T.onAction1 : T.action1, fontSize:12, fontFamily:F, fontWeight: isActive ? 600 : 400, letterSpacing:"-0.13px", transition:"all 0.12s", textAlign:"left",
          boxShadow: isActive ? "0px 2px 8px rgba(34,38,247,0.18)" : "none" }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.surface2; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
        <span style={{ flexShrink:0, display:"flex", width:16, height:16 }}>{icon}</span>
        <span style={{ whiteSpace:"nowrap" }}>{item.label}</span>
      </button>
    );
  };

  return (
    <aside style={{
      width: collapsed ? 52 : 220, minWidth: collapsed ? 52 : 220,
      height:"100vh", background:T.onAction1, borderRight:"1px solid #e2e5e9",
      display:"flex", flexDirection:"column", position:"relative", zIndex:20,
      transition:"width 0.2s ease, min-width 0.2s ease", overflow:"hidden", flexShrink:0,
    }}>
      {/* Header */}
      <div style={{ height:52, display:"flex", alignItems:"center", gap: collapsed ? 0 : 8, padding: collapsed ? "0 8px" : "0 12px", borderBottom:"1px solid #e2e5e9", flexShrink:0, justifyContent: collapsed ? "center" : "flex-start" }}>
        {!collapsed && (
          <>
            <button
              onClick={() => setLauncherOpen(o => !o)}
              onMouseEnter={() => setWaffleH(true)}
              onMouseLeave={() => setWaffleH(false)}
              style={{ background: waffleH ? T.surface2 : "none", border:"none", cursor:"pointer", color:T.onSurface1, display:"flex", padding:5, borderRadius:6, flexShrink:0 }}>
              {ICONS.waffle}
            </button>
            <svg width="22" height="22" viewBox="0 0 100 100" fill="none" style={{ flexShrink:0 }}>
              <defs><linearGradient id="appSideGrad" x1="0" y1="100" x2="100" y2="0"><stop offset="0%" stopColor="#5c8a5c"/><stop offset="100%" stopColor={T.actionContainer1}/></linearGradient></defs>
              <circle cx="50" cy="50" r="44" stroke="url(#appSideGrad)" strokeWidth="7" fill="none"/>
              <circle cx="50" cy="50" r="28" stroke="url(#appSideGrad)" strokeWidth="5" fill="none"/>
              <circle cx="50" cy="38" r="8" fill="url(#appSideGrad)"/>
              <rect x="44" y="46" width="12" height="20" rx="4" fill="url(#appSideGrad)"/>
            </svg>
            <span style={{ fontWeight:700, fontSize:13, color:T.onSurface2, fontFamily:F, letterSpacing:"-0.3px", flex:1, whiteSpace:"nowrap" }}>Audit</span>
          </>
        )}
        <button
          onClick={() => { setCollapsed(c => !c); setLauncherOpen(false); }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ background:"none", border:"none", cursor:"pointer", color:T.disabled1, display:"flex", padding:5, borderRadius:6, flexShrink:0, marginLeft: collapsed ? 0 : "auto" }}
          onMouseEnter={e => e.currentTarget.style.background = T.border1}
          onMouseLeave={e => e.currentTarget.style.background = "none"}>
          {collapsed ? ICONS.chevronRight : ICONS.chevronLeft}
        </button>
      </div>

      <AppLauncher open={launcherOpen} onClose={() => setLauncherOpen(false)} />

      {/* Main nav */}
      <nav style={{ flex:1, padding: collapsed ? "10px 6px" : "10px 8px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
        {NAV_ITEMS.map(item => <NavBtn key={item.id} item={item} />)}

        {/* Manage section */}
        {!collapsed && (
          <div style={{ fontSize:10, fontWeight:700, color:T.disabled1, textTransform:"uppercase", letterSpacing:"0.06em", padding:"12px 12px 4px", fontFamily:F }}>
            Manage
          </div>
        )}
        {collapsed && <div style={{ height:1, background:T.border1, margin:"8px 4px" }} />}
        {MANAGE_ITEMS.map(item => <NavBtn key={item.id} item={item} />)}

        {/* Settings pinned to bottom */}
        <div style={{ flex:1 }} />
        {collapsed && <div style={{ height:1, background:T.border1, margin:"8px 4px" }} />}
        {!collapsed && (
          <div style={{ fontSize:10, fontWeight:700, color:T.disabled1, textTransform:"uppercase", letterSpacing:"0.06em", padding:"12px 12px 4px", fontFamily:F }}>
            Portal
          </div>
        )}
        <NavBtn item={{ id:"settings", label:"Settings", icon:"settings" }} />
      </nav>
    </aside>
  );
}
