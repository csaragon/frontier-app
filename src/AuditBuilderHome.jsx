import React from "react";
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
  borderMid: "#c3c8d0",
  primary:   "#2226f7",
  primaryHov:"#1316a8",
  primaryBg: "#f0f2ff",
  success:   "#059669", successBg: "#ecfdf5",
  warning:   "#b45309", warningBg: "#fffbeb",
  error:     "#dc2626", errorBg:   "#fef2f2",
  purple:    "#7c3aed", purpleBg:  "#faf5ff",
};

const STATE_META = {
  active:      { label:"Active",      color:C.success, bg:C.successBg },
  draft:       { label:"Draft",       color:C.warning, bg:C.warningBg },
  deactivated: { label:"Inactive",    color:C.textMuted, bg:C.bgApp   },
  archived:    { label:"Archived",    color:C.error,   bg:C.errorBg   },
};

const MODULE_META = {
  "Fire Safety":    { color:C.error,   bg:C.errorBg   },
  "Health & Safety":{ color:C.warning, bg:C.warningBg },
  "Loss Prevention":{ color:C.primary, bg:C.primaryBg },
  "PPE":            { color:C.success, bg:C.successBg },
  "OSHA":           { color:C.purple,  bg:C.purpleBg  },
  "Operations":     { color:C.navy,    bg:C.primaryBg },
};

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:10, padding:"16px 20px", flex:1 }}>
      <div style={{ fontSize:24, fontWeight:800, color: accent || C.navyDeep, fontFamily:F, lineHeight:1, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F, marginBottom:2 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>{sub}</div>}
    </div>
  );
}

function TemplateRow({ t, onResume, onEdit }) {
  const sm  = STATE_META[t.state] || STATE_META.draft;
  const mod = MODULE_META[t.cat]  || { color:C.textMuted, bg:C.bgApp };
  const [hov, setHov] = React.useState(false);

  return (
    <div
      style={{ display:"flex", alignItems:"center", gap:14, background:C.bgSurf, border:`1px solid ${hov ? C.borderMid : C.border}`, borderRadius:8, padding:"11px 16px", transition:"border-color 0.12s, box-shadow 0.12s", boxShadow: hov ? "0 2px 10px rgba(0,0,0,0.06)" : "none" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Module dot */}
      <div style={{ width:36, height:36, borderRadius:8, background:mod.bg, border:`1.5px solid ${mod.color}30`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ fontSize:9, fontWeight:800, color:mod.color, fontFamily:F, textAlign:"center", lineHeight:"11px" }}>
          {t.cat.split(" ").map(w => w[0]).join("").slice(0,2)}
        </span>
      </div>

      {/* Name + meta */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</div>
        <div style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>
          {t.sections} section{t.sections !== 1 ? "s" : ""} · {t.questions} question{t.questions !== 1 ? "s" : ""} · Updated {t.updated}
        </div>
      </div>

      {/* Author */}
      <div style={{ flexShrink:0, minWidth:110, display:"none" }} className="author">
        <div style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>{t.author}</div>
      </div>

      {/* Status pill */}
      <div style={{ padding:"3px 8px", borderRadius:999, background:sm.bg, border:`1px solid ${sm.color}30`, fontSize:10, fontWeight:600, color:sm.color, fontFamily:F, flexShrink:0 }}>
        {sm.label}
      </div>

      {/* Action */}
      <button
        onClick={() => t.state === "draft" ? onResume(t.id) : onEdit(t.id)}
        style={{ padding:"5px 12px", borderRadius:6, border:`1px solid ${t.state === "draft" ? C.primary : C.border}`, background: t.state === "draft" ? C.primaryBg : "transparent", color: t.state === "draft" ? C.primary : C.textSec, fontSize:11, fontWeight:600, fontFamily:F, cursor:"pointer", flexShrink:0, whiteSpace:"nowrap" }}
        onMouseEnter={e => { e.currentTarget.style.background = t.state === "draft" ? "#dde4ff" : C.bgApp; }}
        onMouseLeave={e => { e.currentTarget.style.background = t.state === "draft" ? C.primaryBg : "transparent"; }}
      >
        {t.state === "draft" ? "Resume" : "Edit"}
      </button>
    </div>
  );
}

export default function AuditBuilderHome({ onNav, templates }) {
  const drafts  = templates.filter(t => t.state === "draft");
  const active  = templates.filter(t => t.state === "active");
  const recent  = [...templates]
    .filter(t => t.state !== "archived")
    .sort((a, b) => new Date(b.updated) - new Date(a.updated))
    .slice(0, 6);

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp, overflow:"hidden" }}>
      <AppSidebar activeId="audit_builder" onNav={onNav} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ height:52, background:C.bgSurf, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"0 24px", gap:12, flexShrink:0 }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.navyDeep, fontFamily:F }}>Audit Builder</div>
          <div style={{ marginLeft:"auto" }}>
            <button
              onClick={() => onNav("template_wizard")}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:7, border:"none", background:C.primary, color:"#fff", fontSize:12, fontWeight:600, fontFamily:F, cursor:"pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = C.primaryHov)}
              onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Template
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>

          {/* Stats row */}
          <div style={{ display:"flex", gap:12, marginBottom:28 }}>
            <StatCard label="Total Templates" value={templates.length} sub="across all categories" />
            <StatCard label="Active"   value={active.length}  sub="in use by programs" accent={C.success} />
            <StatCard label="Drafts"   value={drafts.length}  sub="awaiting publish"   accent={C.warning} />
            <StatCard label="Archived" value={templates.filter(t => t.state === "archived").length} sub="no longer in use" accent={C.textMuted} />
          </div>

          {/* Drafts section */}
          {drafts.length > 0 && (
            <div style={{ marginBottom:28 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.navyDeep, fontFamily:F }}>Continue where you left off</div>
                  <div style={{ fontSize:11, color:C.textMuted, fontFamily:F, marginTop:2 }}>Draft templates waiting to be published</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {drafts.map(t => (
                  <TemplateRow
                    key={t.id}
                    t={t}
                    onResume={id => onNav("template_wizard", { templateId: id })}
                    onEdit={id => onNav("template_wizard", { templateId: id })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {drafts.length > 0 && <div style={{ height:1, background:C.border, marginBottom:28 }} />}

          {/* Recent templates */}
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.navyDeep, fontFamily:F }}>Recent templates</div>
                <div style={{ fontSize:11, color:C.textMuted, fontFamily:F, marginTop:2 }}>Most recently updated — click Edit to open in the wizard</div>
              </div>
              <button
                onClick={() => onNav("catalog")}
                style={{ fontSize:11, color:C.primary, fontFamily:F, fontWeight:600, background:"none", border:"none", cursor:"pointer", padding:"4px 0" }}
              >
                View all in Catalog →
              </button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {recent.map(t => (
                <TemplateRow
                  key={t.id}
                  t={t}
                  onResume={id => onNav("template_wizard", { templateId: id })}
                  onEdit={id => onNav("template_wizard", { templateId: id })}
                />
              ))}
            </div>
          </div>

          {/* Empty state */}
          {templates.length === 0 && (
            <div style={{ textAlign:"center", padding:"80px 0" }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.navyDeep, fontFamily:F, marginBottom:6 }}>No templates yet</div>
              <div style={{ fontSize:12, color:C.textMuted, fontFamily:F, marginBottom:20 }}>Create your first audit template to get started.</div>
              <button
                onClick={() => onNav("template_wizard")}
                style={{ padding:"8px 18px", borderRadius:7, border:"none", background:C.primary, color:"#fff", fontSize:12, fontWeight:600, fontFamily:F, cursor:"pointer" }}
              >
                New Template
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
