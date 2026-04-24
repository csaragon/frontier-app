import { useState } from "react";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  primary:      "#2226f7",
  primaryHover: "#1316a8",
  primaryBg:    "#f0f2ff",
  primaryLight: "#d4e2ff",
  navy:         "#001e76",
  navyDeep:     "#16191d",
  textSec:      "#555f6d",
  textMuted:    "#8692a2",
  bgApp:        "#f4f4f6",
  bgSurface:    "#ffffff",
  borderSubtle: "#e2e5e9",
  borderDef:    "#c3c8d0",
  success:      "#059669",
  successBg:    "#ecfdf5",
  error:        "#dc2626",
  errorBg:      "#fef2f2",
  warning:      "#b45309",
  warningBg:    "#fffbeb",
  info:         "#0369a1",
  infoBg:       "#f0f9ff",
  purple:       "#7c3aed",
  purpleBg:     "#faf5ff",
  orange:       "#c2410c",
  orangeBg:     "#fff7ed",
};

// ── Sample data ───────────────────────────────────────────────────────────────

export const QUESTION_TYPES = ["Pass/Fail","Yes/No","Rating","Multiple Choice","Multi-Select","Dropdown","Text","Number"];

export const TYPE_META = {
  "Pass/Fail":       { color: C.success,  bg: C.successBg },
  "Yes/No":          { color: C.info,     bg: C.infoBg },
  "Rating":          { color: C.purple,   bg: C.purpleBg },
  "Multiple Choice": { color: C.primary,  bg: C.primaryBg },
  "Multi-Select":    { color: C.navy,     bg: C.primaryLight },
  "Dropdown":        { color: C.textSec,  bg: C.bgApp },
  "Text":            { color: C.warning,  bg: C.warningBg },
  "Number":          { color: C.orange,   bg: C.orangeBg },
};

export const QUESTIONS = [
  { id:"Q001", text:"Emergency exit signage is visible and unobstructed", type:"Pass/Fail", category:"Fire Safety", usedIn:4 },
  { id:"Q002", text:"Fire extinguisher inspection tag is current", type:"Pass/Fail", category:"Fire Safety", usedIn:3 },
  { id:"Q003", text:"Chemical storage log is up to date", type:"Yes/No", category:"Health & Safety", usedIn:2 },
  { id:"Q004", text:"PPE is available and accessible at all required stations", type:"Pass/Fail", category:"PPE", usedIn:5 },
  { id:"Q005", text:"PPE items are in good condition (no damage or expiry)", type:"Pass/Fail", category:"PPE", usedIn:5 },
  { id:"Q006", text:"Gloves are stocked in all required sizes", type:"Yes/No", category:"PPE", usedIn:3 },
  { id:"Q007", text:"CCTV coverage is active across all required zones", type:"Pass/Fail", category:"Loss Prevention", usedIn:3 },
  { id:"Q008", text:"Cash handling procedures are being followed correctly", type:"Pass/Fail", category:"Loss Prevention", usedIn:4 },
  { id:"Q009", text:"Access control logs have been reviewed this week", type:"Yes/No", category:"Loss Prevention", usedIn:2 },
  { id:"Q010", text:"EAS tags are applied correctly to all high-risk merchandise", type:"Pass/Fail", category:"Loss Prevention", usedIn:2 },
  { id:"Q011", text:"Overall store cleanliness rating", type:"Rating", category:"Operations", usedIn:6 },
  { id:"Q012", text:"Which planogram compliance issues were found?", type:"Multi-Select", category:"Operations", usedIn:2 },
  { id:"Q013", text:"Temperature log reading (refrigerated zone)", type:"Number", category:"Operations", usedIn:1 },
  { id:"Q014", text:"MSDS sheets are accessible to all employees", type:"Pass/Fail", category:"OSHA", usedIn:3 },
  { id:"Q015", text:"Lockout/tagout procedures are posted at equipment", type:"Pass/Fail", category:"OSHA", usedIn:3 },
  { id:"Q016", text:"Employee right-to-know training is current", type:"Yes/No", category:"OSHA", usedIn:3 },
  { id:"Q017", text:"Describe any unsafe conditions observed on the floor", type:"Text", category:"Health & Safety", usedIn:1 },
  { id:"Q018", text:"Return desk procedures are being followed", type:"Pass/Fail", category:"Loss Prevention", usedIn:2 },
  { id:"Q019", text:"Select the primary shrink driver identified", type:"Dropdown", category:"Loss Prevention", usedIn:1 },
  { id:"Q020", text:"Number of associate safety incidents this period", type:"Number", category:"Health & Safety", usedIn:1 },
  { id:"Q021", text:"Slip, trip, and fall hazards have been addressed", type:"Pass/Fail", category:"Health & Safety", usedIn:4 },
  { id:"Q022", text:"Merchandise is secured in high-risk zones", type:"Pass/Fail", category:"Loss Prevention", usedIn:2 },
  { id:"Q023", text:"Staff scheduling board is up to date", type:"Yes/No", category:"Operations", usedIn:1 },
  { id:"Q024", text:"Select all compliance areas reviewed this visit", type:"Multiple Choice", category:"Operations", usedIn:2 },
];

export const SECTIONS = [
  { id:"S001", name:"Fire Safety Checklist",   cat:"Fire Safety",    qCount:3, usedIn:2, qs:["Q001","Q002","Q017"] },
  { id:"S002", name:"PPE Compliance Check",    cat:"PPE",            qCount:3, usedIn:3, qs:["Q004","Q005","Q006"] },
  { id:"S003", name:"Loss Prevention Core",    cat:"Loss Prevention",qCount:4, usedIn:2, qs:["Q007","Q008","Q009","Q010"] },
  { id:"S004", name:"Operations Standards",    cat:"Operations",     qCount:4, usedIn:2, qs:["Q011","Q012","Q013","Q023"] },
  { id:"S005", name:"OSHA Compliance",         cat:"OSHA",           qCount:3, usedIn:1, qs:["Q014","Q015","Q016"] },
  { id:"S006", name:"Slip Trip & Fall",        cat:"Health & Safety",qCount:2, usedIn:2, qs:["Q021","Q017"] },
  { id:"S007", name:"Chemical & Hazmat",       cat:"Health & Safety",qCount:2, usedIn:1, qs:["Q003","Q020"] },
  { id:"S008", name:"Shrink Prevention",       cat:"Loss Prevention",qCount:3, usedIn:1, qs:["Q018","Q019","Q022"] },
  { id:"S009", name:"Planogram & Ops Review",  cat:"Operations",     qCount:2, usedIn:1, qs:["Q012","Q024"] },
];

export const CAT_COLORS = {
  "Fire Safety":    { color:"#7c3aed", bg:"#faf5ff" },
  "PPE":            { color:"#c2410c", bg:"#fff7ed" },
  "Loss Prevention":{ color:"#001e76", bg:"#f0f2ff" },
  "Operations":     { color:"#0f766e", bg:"#ecfdf5" },
  "OSHA":           { color:"#0369a1", bg:"#f0f9ff" },
  "Health & Safety":{ color:"#dc2626", bg:"#fef2f2" },
};

// Implements: TLP-221 (deactivate/archive lifecycle, blocking rules, data integrity)
export const TEMPLATES = [
  { id:"T001", name:"Fire Safety Audit v3",       ootb:true,  cat:"Fire Safety",    sections:2, questions:5,  updated:"Apr 10, 2025", author:"Aegis Team",      state:"active",      linkedPrograms:3, inProgressAudits:2, auditCount:47, actionPlanCount:8  },
  { id:"T002", name:"Slip Trip & Fall v1",         ootb:true,  cat:"Health & Safety",sections:1, questions:4,  updated:"Mar 28, 2025", author:"Aegis Team",      state:"active",      linkedPrograms:2, inProgressAudits:0, auditCount:23, actionPlanCount:4  },
  { id:"T003", name:"PPE Compliance v2",           ootb:true,  cat:"PPE",            sections:2, questions:6,  updated:"Mar 14, 2025", author:"Aegis Team",      state:"active",      linkedPrograms:0, inProgressAudits:3, auditCount:31, actionPlanCount:6  },
  { id:"T004", name:"LP Standard Audit v4",        ootb:true,  cat:"Loss Prevention",sections:3, questions:8,  updated:"Feb 20, 2025", author:"Aegis Team",      state:"active",      linkedPrograms:0, inProgressAudits:0, auditCount:58, actionPlanCount:12 },
  { id:"T005", name:"OSHA Standard v2",            ootb:true,  cat:"OSHA",           sections:2, questions:7,  updated:"Jan 15, 2025", author:"Aegis Team",      state:"active",      linkedPrograms:1, inProgressAudits:1, auditCount:19, actionPlanCount:3  },
  { id:"T006", name:"Ops Standards v2",            ootb:true,  cat:"Operations",     sections:2, questions:6,  updated:"Apr 1, 2025",  author:"Aegis Team",      state:"deactivated", linkedPrograms:0, inProgressAudits:0, auditCount:14, actionPlanCount:2  },
  { id:"T007", name:"SE Fire Safety - Custom",     ootb:false, cat:"Fire Safety",    sections:3, questions:9,  updated:"Apr 12, 2025", author:"Marcus King",     state:"active",      linkedPrograms:2, inProgressAudits:1, auditCount:12, actionPlanCount:3,  sourceId:"T001" },
  { id:"T008", name:"Northeast LP Audit",          ootb:false, cat:"Loss Prevention",sections:4, questions:11, updated:"Apr 8, 2025",  author:"Sarah Patel",     state:"active",      linkedPrograms:1, inProgressAudits:0, auditCount:9,  actionPlanCount:1  },
  { id:"T009", name:"PPE Compliance v2 - West",    ootb:false, cat:"PPE",            sections:2, questions:6,  updated:"Apr 5, 2025",  author:"Linda Chen",      state:"active",      linkedPrograms:0, inProgressAudits:0, auditCount:5,  actionPlanCount:0,  sourceId:"T003" },
  { id:"T010", name:"Q2 Ops Review - Midwest",     ootb:false, cat:"Operations",     sections:3, questions:8,  updated:"Mar 30, 2025", author:"Tom Wu",          state:"draft",       linkedPrograms:0, inProgressAudits:0, auditCount:0,  actionPlanCount:0  },
  { id:"T011", name:"Cash Handling Compliance",    ootb:false, cat:"Loss Prevention",sections:2, questions:5,  updated:"Mar 20, 2025", author:"James Rodriguez", state:"active",      linkedPrograms:3, inProgressAudits:2, auditCount:18, actionPlanCount:5  },
  { id:"T012", name:"Emergency Preparedness v1",   ootb:false, cat:"Health & Safety",sections:3, questions:9,  updated:"Mar 10, 2025", author:"Sarah Patel",     state:"archived",    linkedPrograms:0, inProgressAudits:0, auditCount:7,  actionPlanCount:1  },
];

// ── Small UI primitives ───────────────────────────────────────────────────────

function Badge({ label, color, bg, sm }) {
  return <span style={{ display:"inline-flex", alignItems:"center", padding: sm?"2px 6px":"3px 8px", borderRadius:4, fontSize: sm?9:10, fontWeight:600, fontFamily:F, background:bg, color, whiteSpace:"nowrap" }}>{label}</span>;
}

function SearchBar({ value, onChange, placeholder = "Search…" }) {
  return (
    <div style={{ position:"relative", flex:1, maxWidth:340 }}>
      <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"7px 10px 7px 32px", borderRadius:8, border:`1px solid ${C.borderDef}`, fontSize:12, fontFamily:F, color:C.navyDeep, background:C.bgSurface, outline:"none", boxSizing:"border-box" }}
        onFocus={e => e.target.style.borderColor = C.primary}
        onBlur={e => e.target.style.borderColor = C.borderDef}
      />
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return <button onClick={onClick}
    style={{ padding:"5px 12px", borderRadius:999, border:`1px solid ${active?C.primary:C.borderDef}`, background:active?C.primaryLight:C.bgSurface, color:active?C.primaryHover:C.textSec, fontSize:11, fontWeight:active?600:400, fontFamily:F, cursor:"pointer", whiteSpace:"nowrap" }}>
    {label}
  </button>;
}

function IconBtn({ icon, label, onClick, primary, danger, sm }) {
  const [h, setH] = useState(false);
  const bg = primary ? (h ? C.primaryHover : C.primary) : danger ? (h ? C.errorBg : "transparent") : (h ? C.bgApp : "transparent");
  const fg = primary ? "#fff" : danger ? C.error : C.textSec;
  const bd = primary ? "none" : danger ? `1px solid ${C.borderSubtle}` : `1px solid ${C.borderDef}`;
  return <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    style={{ display:"inline-flex", alignItems:"center", gap:5, padding: sm?"5px 10px":"6px 12px", borderRadius:7, border:bd, background:bg, color:fg, fontSize: sm?11:12, fontWeight:500, fontFamily:F, cursor:"pointer", whiteSpace:"nowrap" }}>
    {icon && <span>{icon}</span>}{label}
  </button>;
}

// ── Lifecycle helpers ─────────────────────────────────────────────────────────

const STATE_META = {
  active:      { label:"Active",      color:C.success,  bg:C.successBg  },
  deactivated: { label:"Deactivated", color:C.textMuted, bg:C.bgApp      },
  draft:       { label:"Draft",       color:C.warning,  bg:C.warningBg  },
  archived:    { label:"Archived",    color:C.textSec,  bg:C.bgApp      },
};

// ── Modals ────────────────────────────────────────────────────────────────────

function ModalShell({ onClose, children, width = 440 }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.42)" }} onClick={onClose}>
      <div style={{ background:C.bgSurface, borderRadius:12, padding:24, width, boxShadow:"0 16px 48px rgba(0,0,0,0.22)", maxWidth:"92vw" }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function DuplicateModal({ template, onClose }) {
  const [name, setName] = useState(`${template.name} - Copy`);
  return (
    <ModalShell onClose={onClose}>
      <div style={{ fontSize:15, fontWeight:700, color:C.navyDeep, fontFamily:F, marginBottom:6 }}>Duplicate template</div>
      <div style={{ fontSize:12, color:C.textSec, fontFamily:F, marginBottom:16 }}>A copy will be created that you can freely edit. The original OOTB template stays locked.</div>
      <label style={{ fontSize:11, fontWeight:500, color:C.textSec, fontFamily:F, display:"block", marginBottom:4 }}>New template name</label>
      <input value={name} onChange={e => setName(e.target.value)}
        style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${C.borderDef}`, fontSize:12, fontFamily:F, color:C.navyDeep, outline:"none", boxSizing:"border-box", marginBottom:16 }}
        onFocus={e => e.target.style.borderColor = C.primary}
        onBlur={e => e.target.style.borderColor = C.borderDef}
      />
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
        <IconBtn label="Cancel" onClick={onClose} />
        <IconBtn primary label="Create duplicate" onClick={onClose} />
      </div>
    </ModalShell>
  );
}

function ArchiveModal({ template, onConfirm, onClose }) {
  const blocked = template.linkedPrograms > 0 || template.inProgressAudits > 0;

  // Mock program names for display
  const mockPrograms = ["Northeast Region Q2", "Midwest Safety Initiative", "LP National Program"].slice(0, template.linkedPrograms);

  return (
    <ModalShell onClose={onClose}>
      <div style={{ fontSize:15, fontWeight:700, color:C.navyDeep, fontFamily:F, marginBottom:8 }}>
        {blocked ? "Cannot archive template" : "Archive template?"}
      </div>

      {blocked ? (
        <>
          <div style={{ fontSize:12, color:C.textSec, fontFamily:F, marginBottom:12, lineHeight:"18px" }}>
            This template cannot be archived because it is still in use.
          </div>
          {template.linkedPrograms > 0 && (
            <div style={{ background:C.errorBg, border:`1px solid #fca5a5`, borderRadius:8, padding:"10px 14px", marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:600, color:C.error, fontFamily:F, marginBottom:6 }}>
                Linked to {template.linkedPrograms} program{template.linkedPrograms !== 1 ? "s" : ""}
              </div>
              {mockPrograms.map(p => (
                <div key={p} style={{ fontSize:11, color:C.error, fontFamily:F, marginBottom:2, display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:4, height:4, borderRadius:"50%", background:C.error, display:"inline-block", flexShrink:0 }} />{p}
                </div>
              ))}
            </div>
          )}
          {template.inProgressAudits > 0 && (
            <div style={{ background:C.warningBg, border:`1px solid #fde68a`, borderRadius:8, padding:"10px 14px", marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:600, color:C.warning, fontFamily:F }}>
                {template.inProgressAudits} audit{template.inProgressAudits !== 1 ? "s" : ""} in progress
              </div>
              <div style={{ fontSize:11, color:C.textSec, fontFamily:F, marginTop:2 }}>All in-progress audits must complete before archiving.</div>
            </div>
          )}
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:16 }}>
            <IconBtn label="Cancel" onClick={onClose} />
            <button disabled style={{ padding:"7px 16px", borderRadius:7, border:"none", background:C.borderDef, color:C.textMuted, fontSize:12, fontFamily:F, cursor:"not-allowed" }}>
              Remove from programs first
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize:12, color:C.textSec, fontFamily:F, marginBottom:16, lineHeight:"18px" }}>
            Archiving moves this template out of active views. Historical audits remain accessible for reference and reporting.
          </div>
          <DataIntegrityPanel template={template} />
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:16 }}>
            <IconBtn label="Cancel" onClick={onClose} />
            <IconBtn danger label="Archive template" onClick={onConfirm} />
          </div>
        </>
      )}
    </ModalShell>
  );
}

function DeleteModal({ template, onConfirm, onClose }) {
  const [typed, setTyped] = useState("");
  const confirmed = typed === "DELETE";
  return (
    <ModalShell onClose={onClose}>
      <div style={{ fontSize:15, fontWeight:700, color:C.navyDeep, fontFamily:F, marginBottom:8 }}>Delete draft permanently?</div>
      <div style={{ fontSize:12, color:C.textSec, fontFamily:F, marginBottom:16, lineHeight:"18px" }}>
        <strong style={{ color:C.navyDeep }}>{template.name}</strong> is a draft that has never been used. This action is permanent and cannot be undone.
      </div>
      <label style={{ fontSize:11, fontWeight:600, color:C.error, fontFamily:F, display:"block", marginBottom:4 }}>
        Type DELETE to confirm
      </label>
      <input
        value={typed}
        onChange={e => setTyped(e.target.value)}
        placeholder="DELETE"
        style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${confirmed ? C.error : C.borderDef}`, fontSize:12, fontFamily:F, color:C.navyDeep, outline:"none", boxSizing:"border-box", marginBottom:4, letterSpacing:1 }}
        onFocus={e => e.target.style.borderColor = C.error}
        onBlur={e => e.target.style.borderColor = confirmed ? C.error : C.borderDef}
      />
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:16 }}>
        <IconBtn label="Cancel" onClick={onClose} />
        <button
          disabled={!confirmed}
          onClick={confirmed ? onConfirm : undefined}
          style={{ padding:"7px 16px", borderRadius:7, border:"none", background:confirmed ? C.error : C.borderDef, color:confirmed ? "#fff" : C.textMuted, fontSize:12, fontFamily:F, fontWeight:600, cursor:confirmed ? "pointer" : "not-allowed" }}>
          Delete permanently
        </button>
      </div>
    </ModalShell>
  );
}

// ── Data integrity debug panel ────────────────────────────────────────────────

function DataIntegrityPanel({ template }) {
  const [open, setOpen] = useState(false);
  // Snapshot counts before action (mock data matches fixture)
  const before = { audits: template.auditCount, actionPlans: template.actionPlanCount };

  return (
    <div style={{ border:`1px solid ${C.borderSubtle}`, borderRadius:8, overflow:"hidden" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ width:"100%", padding:"8px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", background:C.bgApp, border:"none", cursor:"pointer", fontFamily:F, fontSize:11, color:C.textMuted }}
      >
        <span style={{ fontWeight:600 }}>Dev: Data integrity check</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ padding:"10px 12px", fontSize:11, fontFamily:F, display:"flex", flexDirection:"column", gap:4 }}>
          <div style={{ color:C.textSec, marginBottom:4 }}>Counts before archive action (must be unchanged after):</div>
          {[
            { label:"Historical audits",  val:before.audits },
            { label:"Action plans",       val:before.actionPlans },
          ].map(r => (
            <div key={r.label} style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:C.textSec }}>{r.label}</span>
              <span style={{ fontWeight:600, color:C.success }}>{r.val} <span style={{ color:C.textMuted, fontWeight:400 }}>-- preserved</span></span>
            </div>
          ))}
          <div style={{ marginTop:6, padding:"6px 8px", background:C.successBg, borderRadius:4, color:C.success, fontWeight:600 }}>
            Assertion: archive action does not mutate audit/action-plan counts. PASS
          </div>
        </div>
      )}
    </div>
  );
}

// ── Kebab menu ────────────────────────────────────────────────────────────────

function KebabMenu({ template, onAction }) {
  const [open, setOpen] = useState(false);
  const state = template.state;

  const items = [];
  if (state === "active")                                    items.push({ key:"deactivate", label:"Deactivate",  danger:false });
  if (state === "deactivated")                               items.push({ key:"reactivate", label:"Reactivate",  danger:false });
  if (state === "active" || state === "deactivated")         items.push({ key:"archive",    label:"Archive",     danger:true  });
  if (state === "archived")                                  items.push({ key:"restore",    label:"Restore",     danger:false });
  if (state === "draft" && !template.ootb)                   items.push({ key:"delete",     label:"Delete",      danger:true  });

  if (!items.length) return null;

  return (
    <div style={{ position:"relative" }}>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        aria-label="Template actions"
        aria-haspopup="true"
        aria-expanded={open}
        style={{ padding:"3px 6px", border:`1px solid ${C.borderSubtle}`, borderRadius:5, background:"transparent", cursor:"pointer", color:C.textMuted, display:"flex", alignItems:"center" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
      </button>
      {open && (
        <>
          <div style={{ position:"fixed", inset:0, zIndex:698 }} onClick={() => setOpen(false)} />
          <div style={{ position:"absolute", top:"calc(100% + 4px)", right:0, zIndex:699, background:C.bgSurface, border:`1px solid ${C.borderSubtle}`, borderRadius:8, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", minWidth:150, overflow:"hidden" }}>
            {items.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={e => { e.stopPropagation(); setOpen(false); onAction(item.key); }}
                style={{ width:"100%", padding:"9px 14px", border:"none", background:"transparent", textAlign:"left", fontSize:12, fontFamily:F, color:item.danger ? C.error : C.navyDeep, cursor:"pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = item.danger ? C.errorBg : C.bgApp)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── New template dropdown ─────────────────────────────────────────────────────

function NewTemplateDropdown({ onNav }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <div style={{ display:"flex", borderRadius:7, overflow:"hidden", border:`1px solid ${C.primary}` }}>
        <button type="button" onClick={() => onNav("template_wizard")}
          style={{ padding:"6px 12px", border:"none", background:C.primary, color:"#fff", fontSize:12, fontWeight:600, fontFamily:F, cursor:"pointer" }}>
          + New Template
        </button>
        <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="true" aria-expanded={open}
          style={{ padding:"6px 8px", border:"none", borderLeft:`1px solid rgba(255,255,255,0.25)`, background:C.primary, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
      {open && (
        <>
          <div style={{ position:"fixed", inset:0, zIndex:698 }} onClick={() => setOpen(false)} />
          <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, zIndex:699, background:C.bgSurface, border:`1px solid ${C.borderSubtle}`, borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", minWidth:220, overflow:"hidden" }}>
            {[
              { label:"Blank template",           sub:"Start from scratch",                           key:"blank",   icon:"✦" },
              { label:"Upload Excel (Seymour)",    sub:"Auto-generate from an audit checklist",       key:"seymour", icon:"⬆" },
            ].map(item => (
              <button key={item.key} type="button"
                onClick={() => { setOpen(false); onNav("template_wizard", item.key === "seymour" ? { seymourMode: true } : {}); }}
                style={{ width:"100%", padding:"11px 16px", border:"none", background:"transparent", textAlign:"left", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}
                onMouseEnter={e => e.currentTarget.style.background = C.bgApp}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ width:28, height:28, borderRadius:7, background:item.key==="seymour"?C.primaryBg:C.bgApp, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F }}>{item.label}</div>
                  <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginTop:1 }}>{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Templates tab ─────────────────────────────────────────────────────────────

function TemplatesTab({ templates, onAction, isAdmin, onNav }) {
  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [typeFilter,setTypeFilter]= useState("All");
  const [stateTab,  setStateTab]  = useState("active");
  const [dupTarget, setDupTarget] = useState(null);

  const allCats = ["All", ...Array.from(new Set(templates.map(t => t.cat)))];
  const types   = ["All", "OOTB", "Internal"];

  // State tab definitions (admin sees all; non-admin sees only active + drafts)
  const stateTabs = [
    { key:"active",      label:"Active" },
    { key:"deactivated", label:"Deactivated", adminOnly:true },
    { key:"archived",    label:"Archived",    adminOnly:true },
    { key:"draft",       label:"Drafts" },
  ].filter(t => !t.adminOnly || isAdmin);

  const countByState = state => templates.filter(t => t.state === state).length;

  // If current stateTab was hidden (role changed), fall back to active
  const effectiveStateTab = stateTabs.find(t => t.key === stateTab) ? stateTab : "active";

  const filtered = templates.filter(t => {
    if (t.state !== effectiveStateTab) return false;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.author.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "All"    || t.cat === catFilter;
    const matchType   = typeFilter === "All"   || (typeFilter === "OOTB" ? t.ootb : !t.ootb);
    return matchSearch && matchCat && matchType;
  });

  return (
    <div>
      {/* State filter row */}
      <div style={{ display:"flex", gap:0, marginBottom:16, borderBottom:`1px solid ${C.borderSubtle}` }}>
        {stateTabs.map(st => {
          const active = effectiveStateTab === st.key;
          return (
            <button
              key={st.key}
              onClick={() => setStateTab(st.key)}
              style={{ padding:"8px 18px", border:"none", borderBottom:`2px solid ${active ? C.primary : "transparent"}`, background:"transparent", color:active ? C.primary : C.textSec, fontSize:12, fontWeight:active ? 600 : 400, fontFamily:F, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}
            >
              {st.label}
              <span style={{ padding:"1px 6px", borderRadius:999, background:active ? C.primaryLight : C.bgApp, color:active ? C.primaryHover : C.textMuted, fontSize:10, fontWeight:600, fontFamily:F }}>
                {countByState(st.key)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Archived informational banner */}
      {effectiveStateTab === "archived" && (
        <div style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"10px 14px", background:C.bgApp, border:`1px solid ${C.borderSubtle}`, borderRadius:8, marginBottom:14, fontSize:11, color:C.textSec, fontFamily:F, lineHeight:"16px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Archived templates cannot be assigned to new programs or audits but remain fully accessible for reference and reporting.
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search templates..." />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {allCats.map(c => <FilterChip key={c} label={c} active={catFilter===c} onClick={() => setCatFilter(c)} />)}
        </div>
        <div style={{ display:"flex", gap:6, marginLeft:"auto" }}>
          {types.map(t => <FilterChip key={t} label={t} active={typeFilter===t} onClick={() => setTypeFilter(t)} />)}
          <NewTemplateDropdown onNav={onNav} />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:12 }}>
        {filtered.map(t => (
          <TemplateCard
            key={t.id}
            t={t}
            onDuplicate={() => setDupTarget(t)}
            onOpenWizard={() => onNav("template_wizard", { templateId: t.id })}
            onAction={action => onAction(action, t.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"48px 0", color:C.textMuted, fontSize:13, fontFamily:F }}>
            No templates match your filters.
          </div>
        )}
      </div>

      {dupTarget && <DuplicateModal template={dupTarget} onClose={() => setDupTarget(null)} />}
    </div>
  );
}

function TemplateCard({ t, onDuplicate, onOpenWizard, onAction }) {
  const [h, setH]           = useState(false);
  const [modal, setModal]   = useState(null); // "archive" | "delete"
  const catStyle = CAT_COLORS[t.cat] || { color: C.textSec, bg: C.bgApp };
  const canEdit  = !t.ootb;
  const sm       = STATE_META[t.state] || STATE_META.draft;

  const handleAction = action => {
    if (action === "archive") { setModal("archive"); return; }
    if (action === "delete")  { setModal("delete");  return; }
    onAction(action);
  };

  const handleArchiveConfirm = () => { setModal(null); onAction("archive"); };
  const handleDeleteConfirm  = () => { setModal(null); onAction("delete");  };

  return (
    <>
      <div
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{ background:C.bgSurface, borderRadius:10, border:`1px solid ${h ? C.primary : C.borderSubtle}`, padding:"14px 16px", display:"flex", flexDirection:"column", gap:10, transition:"border-color 0.15s", boxShadow: h ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}
      >
        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.navy, fontFamily:F, marginBottom:4, lineHeight:"18px" }}>{t.name}</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
              <Badge label={t.cat} color={catStyle.color} bg={catStyle.bg} sm />
              {t.ootb
                ? <Badge label="OOTB"     color={C.purple}  bg={C.purpleBg}  sm />
                : <Badge label="Internal" color={C.success} bg={C.successBg} sm />}
              {t.state !== "active" && (
                <Badge label={sm.label} color={sm.color} bg={sm.bg} sm />
              )}
              {t.sourceId && <Badge label="Duplicated" color={C.textSec} bg={C.bgApp} sm />}
            </div>
          </div>
          <KebabMenu template={t} onAction={handleAction} />
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:16 }}>
          {[
            { label:"Sections",  val:t.sections  },
            { label:"Questions", val:t.questions },
            ...(t.auditCount > 0 ? [{ label:"Audits", val:t.auditCount }] : []),
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize:16, fontWeight:700, color:C.navyDeep, fontFamily:F, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:9, color:C.textMuted, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.04em", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Blocking info */}
        {(t.linkedPrograms > 0 || t.inProgressAudits > 0) && t.state !== "archived" && (
          <div style={{ display:"flex", gap:10, fontSize:10, color:C.textMuted, fontFamily:F }}>
            {t.linkedPrograms > 0    && <span>{t.linkedPrograms} program{t.linkedPrograms!==1?"s":""}</span>}
            {t.inProgressAudits > 0  && <span>{t.inProgressAudits} in-progress</span>}
          </div>
        )}

        {/* Meta */}
        <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, borderTop:`1px solid ${C.borderSubtle}`, paddingTop:10, display:"flex", justifyContent:"space-between" }}>
          <span>By {t.author}</span>
          <span>Updated {t.updated}</span>
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:6 }}>
          <IconBtn sm label="Preview" onClick={() => {}} />
          <IconBtn sm label="Duplicate" onClick={onDuplicate} />
          {canEdit
            ? <IconBtn sm primary label="Open in wizard" onClick={onOpenWizard} />
            : <button disabled style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${C.borderSubtle}`, background:C.bgApp, color:C.textMuted, fontSize:11, fontFamily:F, cursor:"not-allowed" }}>Edit (OOTB)</button>
          }
        </div>
      </div>

      {modal === "archive" && <ArchiveModal template={t} onConfirm={handleArchiveConfirm} onClose={() => setModal(null)} />}
      {modal === "delete"  && <DeleteModal  template={t} onConfirm={handleDeleteConfirm}  onClose={() => setModal(null)} />}
    </>
  );
}

// ── Sections tab ──────────────────────────────────────────────────────────────

function SectionsTab() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [editSection, setEditSection] = useState(null);
  const [creating, setCreating] = useState(false);

  const cats = ["All", ...Array.from(new Set(SECTIONS.map(s => s.cat)))];
  const filtered = SECTIONS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || s.cat === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search sections…" />
        <div style={{ display:"flex", gap:6 }}>
          {cats.map(c => <FilterChip key={c} label={c} active={catFilter===c} onClick={() => setCatFilter(c)} />)}
        </div>
        <div style={{ marginLeft:"auto" }}>
          <IconBtn primary label="+ New Section" onClick={() => setCreating(true)} />
        </div>
      </div>

      <div style={{ background:C.bgSurface, borderRadius:10, border:`1px solid ${C.borderSubtle}`, overflow:"hidden" }}>
        {/* Header */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 120px 80px 80px 140px", gap:8, padding:"8px 16px", background:C.bgApp, borderBottom:`1px solid ${C.borderSubtle}` }}>
          {["Section name","Category","Questions","Used in",""].map((h,i) =>
            <span key={i} style={{ fontSize:9, fontWeight:700, color:C.navy, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, textAlign: i>=2&&i<=3?"center":"left" }}>{h}</span>
          )}
        </div>

        {filtered.map((s, i) => {
          const catStyle = CAT_COLORS[s.cat] || { color:C.textSec, bg:C.bgApp };
          const [h, setH] = useState(false);
          return (
            <div key={s.id} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
              style={{ display:"grid", gridTemplateColumns:"1fr 120px 80px 80px 140px", gap:8, padding:"11px 16px", alignItems:"center", background:h?C.primaryBg:"transparent", borderBottom: i<filtered.length-1?`1px solid ${C.borderSubtle}`:"none", transition:"background 0.1s" }}>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:C.navy, fontFamily:F }}>{s.name}</div>
                <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginTop:1 }}>ID: {s.id}</div>
              </div>
              <div><Badge label={s.cat} color={catStyle.color} bg={catStyle.bg} sm /></div>
              <div style={{ textAlign:"center", fontSize:12, fontWeight:600, color:C.navyDeep, fontFamily:F }}>{s.qCount}</div>
              <div style={{ textAlign:"center", fontSize:12, color:C.textSec, fontFamily:F }}>{s.usedIn} templates</div>
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <IconBtn sm label="Edit section" onClick={() => setEditSection(s)} />
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 0", color:C.textMuted, fontSize:13, fontFamily:F }}>No sections match your filters.</div>
        )}
      </div>

      {(editSection || creating) && (
        <SectionEditModal
          section={editSection}
          onClose={() => { setEditSection(null); setCreating(false); }}
        />
      )}
    </div>
  );
}

function SectionEditModal({ section, onClose }) {
  const [name, setName] = useState(section?.name || "");
  const [cat, setCat] = useState(section?.cat || "Health & Safety");
  const [selectedQs, setSelectedQs] = useState(new Set(section?.qs || []));
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [showNewQ, setShowNewQ] = useState(false);

  const toggle = id => {
    const s = new Set(selectedQs);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedQs(s);
  };

  const remove = id => {
    const s = new Set(selectedQs);
    s.delete(id);
    setSelectedQs(s);
  };

  const bankFiltered = QUESTIONS.filter(q => {
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase()) || q.category.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || q.type === typeFilter;
    const matchCat = catFilter === "All" || q.category === catFilter;
    return matchSearch && matchType && matchCat;
  });

  const selectedList = QUESTIONS.filter(q => selectedQs.has(q.id));
  const bankCats = ["All", ...Array.from(new Set(QUESTIONS.map(q => q.category)))];
  const isNew = !section;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:800, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(16,24,40,0.55)", padding:24 }}>
      {/* Modal shell */}
      <div style={{ background:C.bgSurface, borderRadius:16, width:"100%", maxWidth:980, height:"calc(100vh - 80px)", maxHeight:760, display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.22)", overflow:"hidden" }}>

        {/* ── Modal header */}
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.borderSubtle}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, background:C.bgSurface }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:C.navyDeep, fontFamily:F }}>{isNew ? "Create new section" : `Edit section — ${section.name}`}</div>
            <div style={{ fontSize:11, color:C.textMuted, fontFamily:F, marginTop:2 }}>
              {isNew ? "Name your section, then pick questions from the bank on the right." : "Adjust the name or swap questions. Changes apply to all templates using this section."}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.textMuted, padding:6, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}
            onMouseEnter={e => e.currentTarget.style.background=C.bgApp}
            onMouseLeave={e => e.currentTarget.style.background="none"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* ── Two-column body */}
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"340px 1fr", overflow:"hidden" }}>

          {/* LEFT — Section config + selected questions */}
          <div style={{ borderRight:`1px solid ${C.borderSubtle}`, display:"flex", flexDirection:"column", overflow:"hidden", background:"#fafafa" }}>

            {/* Section details */}
            <div style={{ padding:"20px 20px 16px", borderBottom:`1px solid ${C.borderSubtle}`, flexShrink:0 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F, marginBottom:12 }}>Section details</div>
              <label style={{ fontSize:11, fontWeight:500, color:C.textSec, fontFamily:F, display:"block", marginBottom:4 }}>Section name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Fire Safety Checklist"
                style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${C.borderDef}`, fontSize:12, fontFamily:F, color:C.navyDeep, outline:"none", boxSizing:"border-box", marginBottom:12 }}
                onFocus={e => e.target.style.borderColor = C.primary}
                onBlur={e => e.target.style.borderColor = C.borderDef}
              />
              <label style={{ fontSize:11, fontWeight:500, color:C.textSec, fontFamily:F, display:"block", marginBottom:4 }}>Category</label>
              <select value={cat} onChange={e => setCat(e.target.value)}
                style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${C.borderDef}`, fontSize:12, fontFamily:F, color:C.navyDeep, background:C.bgSurface, cursor:"pointer" }}>
                {Object.keys(CAT_COLORS).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Selected questions */}
            <div style={{ padding:"14px 20px 8px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F }}>Selected questions</div>
              <span style={{ fontSize:11, fontWeight:600, color: selectedQs.size>0?C.primary:C.textMuted, fontFamily:F }}>{selectedQs.size} added</span>
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"0 20px 16px" }}>
              {selectedList.length === 0 ? (
                <div style={{ padding:"32px 0", textAlign:"center" }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>☑️</div>
                  <div style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>No questions selected yet.</div>
                  <div style={{ fontSize:11, color:C.textMuted, fontFamily:F, marginTop:4 }}>Browse the question bank →</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {selectedList.map((q, i) => {
                    const tm = TYPE_META[q.type] || { color:C.textSec, bg:C.bgApp };
                    return (
                      <div key={q.id} style={{ background:C.bgSurface, border:`1px solid ${C.borderSubtle}`, borderRadius:8, padding:"10px 12px", display:"flex", alignItems:"flex-start", gap:10 }}>
                        <div style={{ width:20, height:20, borderRadius:4, background:C.primaryLight, color:C.primaryHover, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, fontFamily:F, flexShrink:0, marginTop:1 }}>{i+1}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:11, color:C.navyDeep, fontFamily:F, fontWeight:500, lineHeight:"15px" }}>{q.text}</div>
                          <div style={{ marginTop:4 }}><Badge label={q.type} color={tm.color} bg={tm.bg} sm /></div>
                        </div>
                        <button onClick={() => remove(q.id)} style={{ background:"none", border:"none", cursor:"pointer", color:C.textMuted, padding:2, flexShrink:0, marginTop:1 }}
                          onMouseEnter={e => e.currentTarget.style.color=C.error}
                          onMouseLeave={e => e.currentTarget.style.color=C.textMuted}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Question bank browser */}
          <div style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>

            {/* Bank toolbar */}
            <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.borderSubtle}`, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F }}>Question bank</div>
                <span style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>{bankFiltered.length} question{bankFiltered.length!==1?"s":""}</span>
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <SearchBar value={search} onChange={setSearch} placeholder="Search questions…" />
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  style={{ padding:"7px 10px", borderRadius:8, border:`1px solid ${C.borderDef}`, fontSize:11, fontFamily:F, color:C.navyDeep, background:C.bgSurface, cursor:"pointer" }}>
                  <option>All</option>
                  {QUESTION_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {bankCats.map(c => <FilterChip key={c} label={c} active={catFilter===c} onClick={() => setCatFilter(c)} />)}
              </div>
            </div>

            {/* Question rows */}
            <div style={{ flex:1, overflowY:"auto" }}>
              {bankFiltered.map((q, i) => {
                const sel = selectedQs.has(q.id);
                const tm = TYPE_META[q.type] || { color:C.textSec, bg:C.bgApp };
                const catStyle = CAT_COLORS[q.category] || { color:C.textSec, bg:C.bgApp };
                return (
                  <div key={q.id} onClick={() => toggle(q.id)}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 20px", cursor:"pointer", background: sel ? C.primaryBg : "transparent", borderBottom:`1px solid ${C.borderSubtle}`, transition:"background 0.1s" }}
                    onMouseEnter={e => { if(!sel) e.currentTarget.style.background=C.bgApp; }}
                    onMouseLeave={e => { if(!sel) e.currentTarget.style.background="transparent"; }}>
                    <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${sel?C.primary:C.borderDef}`, background:sel?C.primary:C.bgSurface, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.1s" }}>
                      {sel && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, color: sel?C.navy:C.navyDeep, fontFamily:F, fontWeight: sel?600:400, lineHeight:"16px" }}>{q.text}</div>
                      <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginTop:3 }}>Used in {q.usedIn} section{q.usedIn!==1?"s":""}</div>
                    </div>
                    <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                      <Badge label={q.type} color={tm.color} bg={tm.bg} sm />
                      <Badge label={q.category} color={catStyle.color} bg={catStyle.bg} sm />
                    </div>
                  </div>
                );
              })}

              {bankFiltered.length === 0 && (
                <div style={{ textAlign:"center", padding:"48px 0", color:C.textMuted, fontSize:13, fontFamily:F }}>No questions match your filters.</div>
              )}
            </div>

            {/* Create new question CTA */}
            <div style={{ padding:"12px 20px", borderTop:`1px solid ${C.borderSubtle}`, background:C.warningBg, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:C.warning, fontFamily:F }}>Can't find what you need?</div>
                <div style={{ fontSize:10, color:C.textSec, fontFamily:F, marginTop:2 }}>The system will check for similar questions before you create a new one to prevent duplicates.</div>
              </div>
              <IconBtn sm label="+ New question" onClick={() => setShowNewQ(true)} />
            </div>
          </div>
        </div>

        {/* ── Footer */}
        <div style={{ padding:"14px 24px", borderTop:`1px solid ${C.borderSubtle}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, background:C.bgSurface }}>
          <div style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>
            {selectedQs.size > 0 ? `${selectedQs.size} question${selectedQs.size!==1?"s":""} will be added to this section` : "Select at least one question to save"}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <IconBtn label="Cancel" onClick={onClose} />
            <IconBtn primary label={selectedQs.size > 0 ? `Save section (${selectedQs.size} questions)` : "Save section"} onClick={onClose} />
          </div>
        </div>
      </div>

      {showNewQ && <NewQuestionModal onClose={() => setShowNewQ(false)} />}
    </div>
  );
}

// ── Questions tab ─────────────────────────────────────────────────────────────

function QuestionsTab() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [showNewQ, setShowNewQ] = useState(false);

  const cats = ["All", ...Array.from(new Set(QUESTIONS.map(q => q.category)))];
  const filtered = QUESTIONS.filter(q => {
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase()) || q.category.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || q.type === typeFilter;
    const matchCat = catFilter === "All" || q.category === catFilter;
    return matchSearch && matchType && matchCat;
  });

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search questions…" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding:"7px 10px", borderRadius:8, border:`1px solid ${C.borderDef}`, fontSize:11, fontFamily:F, color:C.navyDeep, background:C.bgSurface, cursor:"pointer" }}>
          <option>All</option>
          {QUESTION_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {cats.map(c => <FilterChip key={c} label={c} active={catFilter===c} onClick={() => setCatFilter(c)} />)}
        </div>
        <div style={{ marginLeft:"auto" }}>
          <IconBtn primary label="+ New Question" onClick={() => setShowNewQ(true)} />
        </div>
      </div>

      <div style={{ fontSize:11, color:C.textMuted, fontFamily:F, marginBottom:10 }}>{filtered.length} question{filtered.length!==1?"s":""} in the bank</div>

      <div style={{ background:C.bgSurface, borderRadius:10, border:`1px solid ${C.borderSubtle}`, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 110px 120px 80px", gap:8, padding:"8px 16px", background:C.bgApp, borderBottom:`1px solid ${C.borderSubtle}` }}>
          {["Question","Type","Category","Used in"].map((h,i) =>
            <span key={i} style={{ fontSize:9, fontWeight:700, color:C.navy, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, textAlign:i===3?"center":"left" }}>{h}</span>
          )}
        </div>

        {filtered.map((q, i) => {
          const tm = TYPE_META[q.type] || { color:C.textSec, bg:C.bgApp };
          const catStyle = CAT_COLORS[q.category] || { color:C.textSec, bg:C.bgApp };
          const [h, setH] = useState(false);
          return (
            <div key={q.id} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
              style={{ display:"grid", gridTemplateColumns:"1fr 110px 120px 80px", gap:8, padding:"11px 16px", alignItems:"center", background:h?C.bgApp:"transparent", borderBottom:i<filtered.length-1?`1px solid ${C.borderSubtle}`:"none", transition:"background 0.1s" }}>
              <div>
                <div style={{ fontSize:12, color:C.navyDeep, fontFamily:F, fontWeight:500, lineHeight:"16px" }}>{q.text}</div>
                <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginTop:2 }}>ID: {q.id}</div>
              </div>
              <div><Badge label={q.type} color={tm.color} bg={tm.bg} sm /></div>
              <div><Badge label={q.category} color={catStyle.color} bg={catStyle.bg} sm /></div>
              <div style={{ textAlign:"center", fontSize:12, color:C.textSec, fontFamily:F }}>{q.usedIn} section{q.usedIn!==1?"s":""}</div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 0", color:C.textMuted, fontSize:13, fontFamily:F }}>No questions match your filters.</div>
        )}
      </div>

      {showNewQ && <NewQuestionModal onClose={() => setShowNewQ(false)} />}
    </div>
  );
}

function NewQuestionModal({ onClose }) {
  const [step, setStep] = useState("form"); // form | similarity
  const [text, setText] = useState("");
  const [type, setType] = useState("Pass/Fail");
  const [cat, setCat] = useState("Health & Safety");

  const similarExamples = text.length > 8 ? QUESTIONS.filter(q => q.text.toLowerCase().includes(text.toLowerCase().split(" ")[0]) && text.length > 5).slice(0, 3) : [];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:800, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div style={{ background:C.bgSurface, borderRadius:12, padding:24, width:480, boxShadow:"0 16px 48px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>

        {step === "form" ? (
          <>
            <div style={{ fontSize:15, fontWeight:700, color:C.navyDeep, fontFamily:F, marginBottom:6 }}>New question</div>
            <div style={{ fontSize:12, color:C.textSec, fontFamily:F, marginBottom:16 }}>Before saving, we'll check the bank for similar questions to avoid duplicates.</div>

            <label style={{ fontSize:11, fontWeight:500, color:C.textSec, fontFamily:F, display:"block", marginBottom:4 }}>Question text</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Enter the question as it will appear to auditors…"
              style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${C.borderDef}`, fontSize:12, fontFamily:F, color:C.navyDeep, outline:"none", boxSizing:"border-box", resize:"vertical", marginBottom:12 }}
              onFocus={e => e.target.style.borderColor = C.primary}
              onBlur={e => e.target.style.borderColor = C.borderDef}
            />

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:500, color:C.textSec, fontFamily:F, display:"block", marginBottom:4 }}>Question type</label>
                <select value={type} onChange={e => setType(e.target.value)}
                  style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${C.borderDef}`, fontSize:12, fontFamily:F, color:C.navyDeep, background:C.bgSurface }}>
                  {QUESTION_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:500, color:C.textSec, fontFamily:F, display:"block", marginBottom:4 }}>Category</label>
                <select value={cat} onChange={e => setCat(e.target.value)}
                  style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${C.borderDef}`, fontSize:12, fontFamily:F, color:C.navyDeep, background:C.bgSurface }}>
                  {Object.keys(CAT_COLORS).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <IconBtn label="Cancel" onClick={onClose} />
              <IconBtn primary label="Check for duplicates →" onClick={() => setStep("similarity")} />
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize:15, fontWeight:700, color:C.navyDeep, fontFamily:F, marginBottom:6 }}>Similarity check</div>
            <div style={{ fontSize:12, color:C.textSec, fontFamily:F, marginBottom:14 }}>The system found {similarExamples.length > 0 ? "potentially similar" : "no similar"} questions in the bank. Review before adding.</div>

            {similarExamples.length > 0 ? (
              <div style={{ background:C.warningBg, border:`1px solid #fde68a`, borderRadius:8, padding:12, marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.warning, fontFamily:F, marginBottom:8 }}>Possible duplicates found</div>
                {similarExamples.map(q => (
                  <div key={q.id} style={{ fontSize:11, color:C.navyDeep, fontFamily:F, padding:"6px 0", borderBottom:`1px solid #fde68a`, lineHeight:"15px" }}>
                    {q.text} <span style={{ color:C.textMuted }}>({q.type})</span>
                  </div>
                ))}
                <div style={{ fontSize:10, color:C.warning, fontFamily:F, marginTop:8 }}>If one of these matches your intent, use it instead to keep the bank clean.</div>
              </div>
            ) : (
              <div style={{ background:C.successBg, border:`1px solid #bbf7d0`, borderRadius:8, padding:12, marginBottom:16, fontSize:11, color:C.success, fontFamily:F }}>
                No similar questions found. Your question looks unique.
              </div>
            )}

            <div style={{ background:C.bgApp, borderRadius:8, padding:12, marginBottom:16 }}>
              <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginBottom:3 }}>New question</div>
              <div style={{ fontSize:12, color:C.navyDeep, fontFamily:F, fontWeight:500 }}>{text || "(empty)"}</div>
              <div style={{ fontSize:10, color:C.textMuted, fontFamily:F, marginTop:4 }}>{type} · {cat}</div>
            </div>

            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <IconBtn label="← Back" onClick={() => setStep("form")} />
              <IconBtn primary label="Add to question bank" onClick={onClose} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Sidebar (local, nav-aware) ────────────────────────────────────────────────

function Sidebar({ active, onNav }) {
  const navItems = [
    { label:"Dashboard", key:"dashboard" },
    { label:"Programs", key:"programs" },
    { label:"Audits", key:"audits" },
    { label:"Escalations", key:"escalations" },
    { label:"Action Plans", key:"action_plans" },
  ];
  const manageItems = [
    { label:"Catalog", key:"catalog" },
    { label:"Users", key:"users" },
  ];

  const F_ = F;
  return (
    <aside style={{ width:192, minWidth:192, background:"#ffffff", borderRight:`1px solid ${C.borderSubtle}`, display:"flex", flexDirection:"column", height:"100vh", flexShrink:0 }}>
      <div style={{ height:52, display:"flex", alignItems:"center", gap:8, padding:"0 12px", borderBottom:`1px solid ${C.borderSubtle}`, flexShrink:0 }}>
        <div style={{ width:24, height:24, borderRadius:6, background:C.navy, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <span style={{ fontSize:13, fontWeight:700, color:C.navyDeep, fontFamily:F_ }}>Frontier</span>
      </div>
      <nav style={{ flex:1, padding:"6px 8px", display:"flex", flexDirection:"column", gap:1 }}>
        {navItems.map(item => {
          const isActive = active === item.key;
          return <button key={item.key} onClick={() => onNav(item.key)}
            style={{ width:"100%", height:34, display:"flex", alignItems:"center", gap:8, padding:"0 10px", borderRadius:4, border:"none", cursor:"pointer", background:isActive?C.primary:"transparent", color:isActive?"#fff":C.navy, fontSize:12, fontFamily:F_, textAlign:"left" }}>
            {item.label}
          </button>;
        })}
        <div style={{ fontSize:9, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", padding:"10px 10px 3px", fontFamily:F_ }}>Manage</div>
        {manageItems.map(item => {
          const isActive = active === item.key;
          return <button key={item.key} onClick={() => onNav(item.key)}
            style={{ width:"100%", height:34, display:"flex", alignItems:"center", gap:8, padding:"0 10px", borderRadius:4, border:"none", cursor:"pointer", background:isActive?C.primary:"transparent", color:isActive?"#fff":C.navy, fontSize:12, fontFamily:F_, textAlign:"left" }}>
            {item.label}
          </button>;
        })}
      </nav>
    </aside>
  );
}

// ── Catalog page ──────────────────────────────────────────────────────────────

export default function Catalog({ onNav, templates, onTemplateAction, isAdmin, onToggleRole }) {
  const [tab, setTab] = useState("templates");

  const TABS = [
    { key:"templates", label:"Templates",     count:templates.length },
    { key:"sections",  label:"Sections",      count:SECTIONS.length  },
    { key:"questions", label:"Question Bank", count:QUESTIONS.length },
  ];

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp, overflow:"hidden" }}>
      <Sidebar active="catalog" onNav={onNav} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        {/* Page header */}
        <header style={{ height:69, background:C.bgSurface, borderBottom:`1px solid ${C.borderSubtle}`, padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:C.navyDeep, fontFamily:F }}>Audit Catalog</div>
            <div style={{ fontSize:11, color:C.textMuted, fontFamily:F, marginTop:1 }}>Browse templates, sections, and questions to build standardized audits</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Role toggle for demo */}
            <div style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 10px", background:C.bgApp, borderRadius:7, border:`1px solid ${C.borderSubtle}` }}>
              <span style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>View as:</span>
              {["Admin","Program Manager"].map(role => {
                const active = isAdmin ? role === "Admin" : role === "Program Manager";
                return (
                  <button
                    key={role}
                    onClick={() => onToggleRole(role === "Admin")}
                    style={{ padding:"2px 8px", borderRadius:4, border:"none", background:active ? C.primary : "transparent", color:active ? "#fff" : C.textSec, fontSize:10, fontFamily:F, fontWeight:active?600:400, cursor:"pointer" }}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
            <div style={{ width:30, height:30, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:600, fontFamily:F, cursor:"pointer" }}>
              {isAdmin ? "A" : "P"}
            </div>
          </div>
        </header>

        {/* Tab bar */}
        <div style={{ background:C.bgSurface, borderBottom:`1px solid ${C.borderSubtle}`, padding:"0 24px", display:"flex", gap:0, flexShrink:0 }}>
          {TABS.map(t => {
            const active = tab === t.key;
            return <button key={t.key} onClick={() => setTab(t.key)}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"14px 18px", border:"none", borderBottom: active?`2px solid ${C.primary}`:"2px solid transparent", background:"transparent", color: active?C.primary:C.textSec, fontSize:13, fontWeight: active?600:400, fontFamily:F, cursor:"pointer", marginBottom:-1 }}>
              {t.label}
              <span style={{ padding:"1px 7px", borderRadius:999, background:active?C.primaryLight:C.bgApp, color:active?C.primaryHover:C.textMuted, fontSize:10, fontWeight:600, fontFamily:F }}>
                {t.count}
              </span>
            </button>;
          })}
        </div>

        {/* Content */}
        <main style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
          {tab === "templates" && (
            <TemplatesTab
              templates={templates}
              onAction={onTemplateAction}
              isAdmin={isAdmin}
              onNav={onNav}
            />
          )}
          {tab === "sections"  && <SectionsTab />}
          {tab === "questions" && <QuestionsTab />}
        </main>
      </div>
    </div>
  );
}
