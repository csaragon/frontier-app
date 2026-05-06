import { useState, useRef, useEffect } from "react";
import { T, F } from "../aegis-tokens.js";

const C = {
  navy:     T.action1,
  navy2:    T.action2,
  white:    T.surface1,
  g1:       T.surface2,
  g2:       T.border1,
  g3:       T.border2,
  g4:       T.disabled1,
  g5:       T.onSurface1,
  g6:       T.onSurface2,
  red:      T.onError1,
  redBg:    T.errorContainer1,
  amber:    T.warning1,
  amberBg:  T.warningContainer1,
  teal:     "#0f766e",
  purple:   "#7c3aed",
  purpleLt: "#f5f3ff",
  purpleMd: "#ede9fe",
};

const TRIGGER_TYPES = [
  { value: "audit_fails",       label: "Audit fails overall",               configType: null,    configLabel: null,                   helper: "Fires when the audit's final result is a failure based on your scoring rules." },
  { value: "score_below",       label: "Overall score below threshold",      configType: "score", configLabel: "Threshold (%)",        helper: "Escalate when the final score is below this percentage." },
  { value: "critical_fails",    label: "Number of critical questions failed", configType: "count", configLabel: "Number of critical fails", helper: "Escalate when this many critical questions fail in one audit." },
  { value: "audit_overdue",     label: "Audit overdue",                      configType: "days",  configLabel: "Days past due",        helper: "Escalate when an audit hasn't been completed by N days past its due date." },
  { value: "audit_not_started", label: "Audit not started",                  configType: "days",  configLabel: "Days since assigned",  helper: "Escalate when an assigned audit hasn't been started." },
];

const RECIPIENT_TYPES = [
  { value: "user",    label: "Specific user" },
  { value: "role",    label: "Role" },
  { value: "group",   label: "Group" },
  { value: "manager", label: "Auditor's manager" },
];

const STUB_ROLES = ["Store Manager", "Asset Protection Lead", "Operations Manager", "Department Lead", "District Manager", "Regional Manager"];
const STUB_GROUPS = ["Store Managers", "District Managers", "Regional Managers", "Asset Protection", "Operations Team"];
const STUB_USERS = [
  { id: "u1", name: "Alex Chen",       email: "alex.chen@thinklp.com" },
  { id: "u2", name: "Maria Rodriguez", email: "m.rodriguez@thinklp.com" },
  { id: "u3", name: "James Okafor",    email: "j.okafor@thinklp.com" },
  { id: "u4", name: "Sarah Kim",       email: "s.kim@thinklp.com" },
  { id: "u5", name: "David Patel",     email: "d.patel@thinklp.com" },
  { id: "u6", name: "Emily Torres",    email: "e.torres@thinklp.com" },
  { id: "u7", name: "Marcus Webb",     email: "m.webb@thinklp.com" },
  { id: "u8", name: "Lisa Nakamura",   email: "l.nakamura@thinklp.com" },
];

let _uid = 0;
function genId(p) { return `${p}-${Date.now()}-${++_uid}`; }

function triggerSummary(rule) {
  const t = TRIGGER_TYPES.find(x => x.value === rule.triggerType);
  if (!t) return "Unknown trigger";
  if (t.configType === null) return "Audit fails overall";
  const v = rule.triggerConfig?.value;
  if (t.value === "score_below")       return v != null ? `Score below ${v}%`           : t.label;
  if (t.value === "critical_fails")    return v != null ? `${v}+ critical questions fail` : t.label;
  if (t.value === "audit_overdue")     return v != null ? `Overdue by ${v} days`          : t.label;
  if (t.value === "audit_not_started") return v != null ? `Not started after ${v} days`   : t.label;
  return t.label;
}

function recipientSummary(rule) {
  if (rule.recipientType === "manager") return "Notify auditor's manager";
  if (rule.recipientType === "role")    return rule.recipientValue ? `Notify ${rule.recipientValue}` : "Select role";
  if (rule.recipientType === "user") {
    const arr = Array.isArray(rule.recipientValue) ? rule.recipientValue : [];
    return arr.length > 0 ? `Email ${arr.length} user${arr.length !== 1 ? "s" : ""}` : "Select users";
  }
  if (rule.recipientType === "group") {
    const arr = Array.isArray(rule.recipientValue) ? rule.recipientValue : [];
    return arr.length > 0 ? `Email ${arr.join(", ")}` : "Select groups";
  }
  return "";
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconClose() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IconChevDown() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function IconChevRight() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function IconEdit() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function IconTrash() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function IconEmail() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2 4 12 13 22 4"/></svg>;
}
function IconBell() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function IconInfo() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function IconPlus() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IconShield() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

// ── Shared atoms ──────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <div onClick={disabled ? undefined : onChange}
      style={{ width:32, height:18, borderRadius:9, flexShrink:0, background: checked ? C.navy : C.g3, position:"relative", cursor: disabled ? "not-allowed" : "pointer", transition:"background 0.15s", opacity: disabled ? 0.5 : 1 }}>
      <div style={{ position:"absolute", top:2, left: checked ? 16 : 2, width:14, height:14, borderRadius:"50%", background:C.white, transition:"left 0.15s", boxShadow:"0 1px 3px rgba(0,0,0,0.25)" }}/>
    </div>
  );
}

function InfoTip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position:"relative", display:"inline-flex", color:C.g4, cursor:"help" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <IconInfo />
      {show && (
        <div style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)", background:C.g6, color:C.white, fontSize:12, fontFamily:F, lineHeight:"16px", padding:"7px 10px", borderRadius:6, whiteSpace:"pre-line", width:240, zIndex:500, boxShadow:"0 4px 12px rgba(0,0,0,0.2)", pointerEvents:"none" }}>
          {text}
        </div>
      )}
    </span>
  );
}

function SectionHeader({ title, tipText }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
      <span style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>{title}</span>
      {tipText && <InfoTip text={tipText} />}
    </div>
  );
}

// ── Recipient Picker ──────────────────────────────────────────────────────────

function RecipientPicker({ recipientType, recipientValue, onTypeChange, onValueChange, inline = false }) {
  const [search, setSearch] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    function h(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const selectedUsers = Array.isArray(recipientValue) ? recipientValue : [];
  const filteredUsers = search
    ? STUB_USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : STUB_USERS;

  function toggleUser(user) {
    const has = selectedUsers.find(u => u.id === user.id);
    onValueChange(has ? selectedUsers.filter(u => u.id !== user.id) : [...selectedUsers, user]);
  }

  const sel = { fontSize:13, fontFamily:F, color:C.g6, border:`1px solid ${C.g3}`, borderRadius:8, padding:"8px 12px", outline:"none", background:C.white, width:"100%", boxSizing:"border-box" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <select value={recipientType} onChange={e => { onTypeChange(e.target.value); onValueChange(null); }} style={sel}>
        {RECIPIENT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>

      {recipientType === "role" && (
        <select value={recipientValue ?? ""} onChange={e => onValueChange(e.target.value)} style={sel}>
          <option value="">Select a role…</option>
          {STUB_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      )}

      {recipientType === "group" && (
        <div>
          {STUB_GROUPS.map(g => {
            const arr = Array.isArray(recipientValue) ? recipientValue : [];
            const checked = arr.includes(g);
            return (
              <label key={g} onClick={() => onValueChange(checked ? arr.filter(x => x !== g) : [...arr, g])}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", cursor:"pointer" }}>
                <div style={{ width:15, height:15, borderRadius:4, border:`1.5px solid ${checked ? C.navy : C.g3}`, background: checked ? C.navy : C.white, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {checked && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
                </div>
                <span style={{ fontSize:13, color:C.g6, fontFamily:F }}>{g}</span>
              </label>
            );
          })}
        </div>
      )}

      {recipientType === "user" && (
        <div ref={dropRef} style={{ position:"relative" }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4, border:`1px solid ${dropOpen ? C.navy : C.g3}`, borderRadius:8, padding:"6px 10px", minHeight:38, cursor:"text", background:C.white }}
            onClick={() => setDropOpen(true)}>
            {selectedUsers.map(u => (
              <span key={u.id} style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.g1, borderRadius:4, padding:"2px 7px", fontSize:12, fontFamily:F, color:C.g6 }}>
                {u.name}
                <span onClick={e => { e.stopPropagation(); toggleUser(u); }} style={{ cursor:"pointer", color:C.g4, display:"flex" }}><IconClose /></span>
              </span>
            ))}
            <input value={search} onChange={e => { setSearch(e.target.value); setDropOpen(true); }}
              placeholder={selectedUsers.length === 0 ? "Search by name or email…" : ""}
              style={{ border:"none", outline:"none", fontFamily:F, fontSize:13, color:C.g6, flex:1, minWidth:120, background:"transparent" }} />
          </div>
          {dropOpen && (
            <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:400, background:C.white, border:`1px solid ${C.g2}`, borderRadius:8, boxShadow:"0 4px 16px rgba(0,0,0,0.12)", maxHeight:180, overflowY:"auto", marginTop:2 }}>
              {filteredUsers.map(u => {
                const sel2 = !!selectedUsers.find(x => x.id === u.id);
                return (
                  <button key={u.id} onClick={() => toggleUser(u)}
                    style={{ display:"flex", alignItems:"center", gap:8, width:"100%", textAlign:"left", background: sel2 ? C.g1 : "none", border:"none", padding:"8px 12px", cursor:"pointer", borderBottom:`1px solid ${C.g1}` }}
                    onMouseEnter={e => { if (!sel2) e.currentTarget.style.background = C.g1; }}
                    onMouseLeave={e => { if (!sel2) e.currentTarget.style.background = "none"; }}>
                    {sel2 && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={C.navy} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
                    <div>
                      <div style={{ fontSize:13, color:C.g6, fontFamily:F }}>{u.name}</div>
                      <div style={{ fontSize:12, color:C.g4, fontFamily:F }}>{u.email}</div>
                    </div>
                  </button>
                );
              })}
              {filteredUsers.length === 0 && <div style={{ padding:"12px", fontSize:12, color:C.g4, fontFamily:F }}>No matches</div>}
            </div>
          )}
        </div>
      )}

      {recipientType === "manager" && (
        <div style={{ fontSize:12, color:C.g4, fontFamily:F, lineHeight:"17px", padding:"6px 0" }}>
          We'll resolve the auditor's manager from your org hierarchy at runtime.
        </div>
      )}
    </div>
  );
}

// ── Channel Picker ────────────────────────────────────────────────────────────

function ChannelPicker({ channels, onChange, error }) {
  function toggle(key) { onChange({ ...channels, [key]: !channels[key] }); }
  const ch = [
    { key:"email", label:"Email", icon:<IconEmail />, disabled:false },
    { key:"inApp", label:"In-app", icon:<IconBell />, disabled:false },
    { key:"sms",   label:"SMS",   icon:null,          disabled:true, helper:"Coming soon — currently disabled" },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <div style={{ display:"flex", gap:8 }}>
        {ch.map(({ key, label, icon, disabled, helper }) => {
          const on = channels[key] && !disabled;
          return (
            <button key={key} onClick={() => !disabled && toggle(key)} disabled={disabled}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", borderRadius:8, border:`1.5px solid ${on ? C.navy : C.g3}`, background: on ? "#eef1ff" : disabled ? C.g1 : C.white, fontSize:12, fontWeight:600, fontFamily:F, color: disabled ? C.g4 : on ? C.navy : C.g5, cursor: disabled ? "not-allowed" : "pointer" }}
              title={helper}>
              {icon && <span style={{ color: on ? C.navy : C.g4 }}>{icon}</span>}
              {label}
              {disabled && <span style={{ fontSize:10, color:C.g4, fontWeight:400 }}>Soon</span>}
            </button>
          );
        })}
      </div>
      {error && <div style={{ fontSize:12, color:C.red, fontFamily:F, marginTop:2 }}>{error}</div>}
    </div>
  );
}

// ── Rule Modal ────────────────────────────────────────────────────────────────

const DEFAULT_RULE = {
  id: null,
  triggerType: "",
  triggerConfig: { value: "" },
  recipientType: "role",
  recipientValue: null,
  channels: { email: true, inApp: true, sms: false },
  useDefaultMessage: true,
  customMessage: "",
};

function RuleModal({ rule, onSave, onClose }) {
  const [draft, setDraft] = useState(() => ({ ...DEFAULT_RULE, ...rule }));
  const [openPanels, setOpenPanels] = useState(new Set(["trigger", "recipient", "channel"]));
  const [submitted, setSubmitted] = useState(false);

  function patch(field, value) { setDraft(prev => ({ ...prev, [field]: value })); }
  function patchConfig(value) { setDraft(prev => ({ ...prev, triggerConfig: { ...prev.triggerConfig, value } })); }
  function togglePanel(p) { setOpenPanels(prev => { const n = new Set(prev); n.has(p) ? n.delete(p) : n.add(p); return n; }); }

  const triggerDef = TRIGGER_TYPES.find(t => t.value === draft.triggerType);

  const errors = {
    trigger: !draft.triggerType ? "Select a trigger type" : (triggerDef?.configType && !draft.triggerConfig?.value) ? `Enter ${triggerDef.configLabel}` : null,
    recipient: !draft.recipientType ? "Select a recipient type"
      : draft.recipientType === "manager" ? null
      : !draft.recipientValue || (Array.isArray(draft.recipientValue) && draft.recipientValue.length === 0) ? "Select a recipient" : null,
    channel: !draft.channels?.email && !draft.channels?.inApp ? "At least one channel is required" : null,
  };
  const isValid = !errors.trigger && !errors.recipient && !errors.channel;

  function handleSave() {
    setSubmitted(true);
    if (!isValid) return;
    onSave({ ...draft, id: draft.id || genId("esc") });
  }

  const inp = { fontFamily:F, fontSize:13, color:C.g6, border:`1px solid ${C.g3}`, borderRadius:8, padding:"8px 12px", outline:"none", background:C.white };

  function Panel({ id, title, status, children }) {
    const open = openPanels.has(id);
    return (
      <div style={{ border:`1px solid ${C.g2}`, borderRadius:8, overflow:"hidden", marginBottom:8 }}>
        <button onClick={() => togglePanel(id)}
          style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"11px 16px", background:C.g1, border:"none", cursor:"pointer", textAlign:"left" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {submitted && errors[id] ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ) : null}
            <span style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>{title}</span>
            {status && !open && <span style={{ fontSize:12, color:C.g4, fontFamily:F }}>{status}</span>}
          </div>
          <span style={{ color:C.g4 }}>{open ? <IconChevDown /> : <IconChevRight />}</span>
        </button>
        {open && <div style={{ padding:"14px 16px" }}>{children}</div>}
      </div>
    );
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, fontFamily:F }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:C.white, borderRadius:14, width:560, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 8px 40px rgba(0,0,0,0.20)" }}>
        {/* Header */}
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.g2}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <span style={{ fontSize:16, fontWeight:700, color:C.g6 }}>{rule?.id ? "Edit escalation rule" : "Add escalation rule"}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.g4, padding:4, display:"flex" }}><IconClose /></button>
        </div>

        {/* Panels */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 24px" }}>
          {/* Panel 1: Trigger */}
          <Panel id="trigger" title="Trigger" status={draft.triggerType ? triggerSummary(draft) : "Not set"}>
            <select value={draft.triggerType} onChange={e => { patch("triggerType", e.target.value); patch("triggerConfig", { value: "" }); }}
              style={{ ...inp, width:"100%", boxSizing:"border-box", marginBottom:10 }}>
              <option value="">Select a trigger…</option>
              {TRIGGER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            {triggerDef?.configType && (
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.g5, fontFamily:F, display:"block", marginBottom:5 }}>{triggerDef.configLabel}</label>
                <input type="number" min="0" max={triggerDef.configType === "score" ? 100 : undefined}
                  value={draft.triggerConfig?.value ?? ""}
                  onChange={e => patchConfig(e.target.value)}
                  style={{ ...inp, width:120 }} />
              </div>
            )}

            {triggerDef && (
              <div style={{ fontSize:12, color:C.g4, fontFamily:F, lineHeight:"17px" }}>{triggerDef.helper}</div>
            )}
            {submitted && errors.trigger && <div style={{ fontSize:12, color:C.red, fontFamily:F, marginTop:6 }}>{errors.trigger}</div>}
          </Panel>

          {/* Panel 2: Recipient */}
          <Panel id="recipient" title="Recipient" status={draft.recipientType ? recipientSummary(draft) : "Not set"}>
            <RecipientPicker
              recipientType={draft.recipientType}
              recipientValue={draft.recipientValue}
              onTypeChange={v => patch("recipientType", v)}
              onValueChange={v => patch("recipientValue", v)}
            />
            {submitted && errors.recipient && <div style={{ fontSize:12, color:C.red, fontFamily:F, marginTop:8 }}>{errors.recipient}</div>}
          </Panel>

          {/* Panel 3: Channel */}
          <Panel id="channel" title="Channel" status={[draft.channels?.email && "Email", draft.channels?.inApp && "In-app"].filter(Boolean).join(" + ") || "None"}>
            <ChannelPicker channels={draft.channels} onChange={v => patch("channels", v)} error={submitted ? errors.channel : null} />
          </Panel>

          {/* Panel 4: Message */}
          <Panel id="message" title="Message" status={draft.useDefaultMessage ? "Default message" : "Custom message"}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <Toggle checked={draft.useDefaultMessage} onChange={() => patch("useDefaultMessage", !draft.useDefaultMessage)} />
              <span style={{ fontSize:13, color:C.g6, fontFamily:F }}>Use default message</span>
            </div>
            {draft.useDefaultMessage ? (
              <div style={{ fontSize:12, color:C.g4, fontFamily:F, lineHeight:"17px" }}>
                Default uses your organization's standard escalation template, configured in Admin Settings.
              </div>
            ) : (
              <div>
                <textarea
                  value={draft.customMessage}
                  onChange={e => patch("customMessage", e.target.value)}
                  rows={5}
                  placeholder={"Enter a custom message for this rule.\n\nVariables you can use:\n{audit_name}, {location}, {auditor}, {score}, {due_date}, {trigger_reason}"}
                  style={{ ...inp, width:"100%", boxSizing:"border-box", resize:"vertical", lineHeight:"19px" }}
                  onFocus={e => e.currentTarget.style.borderColor = C.navy}
                  onBlur={e => e.currentTarget.style.borderColor = C.g3}
                />
                {/* Available message variables to be finalized with backend team — flagged in assumptions */}
                <div style={{ fontSize:12, color:C.g4, fontFamily:F, marginTop:4 }}>Available variables subject to change — confirm with backend team.</div>
              </div>
            )}
          </Panel>
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 24px", borderTop:`1px solid ${C.g2}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:C.g5, fontFamily:F, fontWeight:500 }}>Cancel</button>
          <button onClick={handleSave}
            style={{ background: isValid || !submitted ? C.navy : C.g3, color: isValid || !submitted ? C.white : C.g4, border:"none", borderRadius:8, padding:"9px 22px", fontSize:13, fontWeight:600, fontFamily:F, cursor:"pointer" }}
            onMouseEnter={e => { if (isValid || !submitted) e.currentTarget.style.background = C.navy2; }}
            onMouseLeave={e => { if (isValid || !submitted) e.currentTarget.style.background = C.navy; }}>
            Save rule
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Rule Card ─────────────────────────────────────────────────────────────────

function RuleCard({ rule, onEdit, onDelete }) {
  const tSummary = triggerSummary(rule);
  const rSummary = recipientSummary(rule);
  const hasEmail = rule.channels?.email;
  const hasInApp = rule.channels?.inApp;

  return (
    <div style={{ background:C.white, border:`1px solid ${C.g2}`, borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:8 }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.g6, fontFamily:F, marginBottom:3 }}>When: {tSummary}</div>
        <div style={{ fontSize:12, color:C.g4, fontFamily:F }}>{rSummary}</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        <div style={{ display:"flex", gap:5, color:C.g4 }}>
          {hasEmail && <span title="Email"><IconEmail /></span>}
          {hasInApp && <span title="In-app"><IconBell /></span>}
        </div>
        <button onClick={onEdit}
          style={{ background:"none", border:"none", cursor:"pointer", color:C.g4, padding:4, display:"flex", borderRadius:4 }}
          onMouseEnter={e => { e.currentTarget.style.background = C.g1; e.currentTarget.style.color = C.g6; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.g4; }}>
          <IconEdit />
        </button>
        <button onClick={onDelete}
          style={{ background:"none", border:"none", cursor:"pointer", color:C.g4, padding:4, display:"flex", borderRadius:4 }}
          onMouseEnter={e => { e.currentTarget.style.background = C.redBg; e.currentTarget.style.color = C.red; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.g4; }}>
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

// ── Step 5 Main ───────────────────────────────────────────────────────────────

export default function Step5Escalation({ formData, onChange, onBack, onActivate, onSaveDraft, onNavigateToStep }) {
  const rules = formData?.rules ?? [];
  const fallback = formData?.fallback ?? { enabled: false, recipientType: "role", recipientValue: null, channels: { email: true, inApp: true, sms: false } };

  function emit(patch) { onChange({ rules, fallback, ...patch }); }
  function emitRules(r) { emit({ rules: r }); }
  function emitFallback(f) { emit({ fallback: f }); }

  const [ruleModal, setRuleModal] = useState(null); // null | { rule } | { rule: null (new) }

  function handleSaveRule(savedRule) {
    const exists = rules.find(r => r.id === savedRule.id);
    const next = exists ? rules.map(r => r.id === savedRule.id ? savedRule : r) : [...rules, savedRule];
    emitRules(next);
    setRuleModal(null);
  }

  function handleDeleteRule(id) {
    emitRules(rules.filter(r => r.id !== id));
  }

  return (
    <div style={{ overflowY:"auto", height:"100%", fontFamily:F }}>
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"28px 24px 100px" }}>

        {/* Page title */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin:"0 0 5px", fontSize:20, fontWeight:700, color:C.g6, fontFamily:F }}>Escalation Rules</h2>
          <p style={{ margin:0, fontSize:13, color:C.g5, fontFamily:F }}>Set what happens after an audit is submitted. Per-question escalations live on individual questions — these rules cover audit-wide outcomes.</p>
        </div>

        {/* How escalations work (info card) */}
        <div style={{ background:C.g1, border:`1px solid ${C.g2}`, borderRadius:12, padding:"14px 18px", marginBottom:24 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.g6, marginBottom:8 }}>Two types of escalation</div>
          <p style={{ margin:"0 0 10px", fontSize:12, color:C.g5, lineHeight:"18px" }}>
            <strong>Per-question escalations</strong> fire immediately during the audit when an auditor answers a problematic question. Set these on individual questions in the Sections &amp; Questions step.
          </p>
          <p style={{ margin:"0 0 10px", fontSize:12, color:C.g5, lineHeight:"18px" }}>
            <strong>Template-level escalations</strong> fire after the audit is submitted, based on the audit's overall result. Configure them below.
          </p>
          <div style={{ fontSize:12, color:C.g4, fontFamily:F, lineHeight:"16px", borderTop:`1px solid ${C.g2}`, paddingTop:8 }}>
            Both can fire for the same audit. They serve different purposes — urgent fixes mid-audit vs. compliance reporting after.&nbsp;
            <button onClick={() => onNavigateToStep(3)}
              style={{ background:"none", border:"none", cursor:"pointer", color:C.navy, fontSize:12, fontFamily:F, fontWeight:600, padding:0, textDecoration:"underline" }}>
              Configure per-question escalations →
            </button>
          </div>
        </div>

        {/* Section 2: Escalation rules */}
        <div style={{ marginBottom:24 }}>
          <SectionHeader title="Escalation rules" tipText={"Each rule fires independently when its trigger condition is met.\nMultiple rules can fire on the same audit."} />
          <div style={{ fontSize:12, color:C.g4, fontFamily:F, marginBottom:14 }}>
            Add rules that trigger when the audit hits certain outcomes. Each rule has its own trigger and recipient.
          </div>

          {rules.length === 0 ? (
            <div style={{ background:C.white, border:`1px dashed ${C.g3}`, borderRadius:12, padding:"44px 24px", textAlign:"center" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:C.g1, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", color:C.g4 }}>
                <IconShield />
              </div>
              <div style={{ fontSize:14, fontWeight:600, color:C.g5, fontFamily:F, marginBottom:5 }}>No escalation rules yet.</div>
              <div style={{ fontSize:12, color:C.g4, fontFamily:F, marginBottom:18 }}>Add a rule to notify someone when audits fail or score poorly.</div>
              <button onClick={() => setRuleModal({ rule: null })}
                style={{ display:"inline-flex", alignItems:"center", gap:5, background:C.navy, color:C.white, border:"none", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:600, fontFamily:F, cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.navy2}
                onMouseLeave={e => e.currentTarget.style.background = C.navy}>
                <IconPlus /> Add escalation rule
              </button>
            </div>
          ) : (
            <>
              {rules.map(r => (
                <RuleCard key={r.id} rule={r}
                  onEdit={() => setRuleModal({ rule: r })}
                  onDelete={() => handleDeleteRule(r.id)}
                />
              ))}
              <button onClick={() => setRuleModal({ rule: null })}
                style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:`1px dashed ${C.g3}`, borderRadius:8, padding:"9px 16px", width:"100%", fontSize:13, fontWeight:500, color:C.g4, fontFamily:F, cursor:"pointer", marginTop:6 }}
                onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}>
                <IconPlus /> Add escalation rule
              </button>
            </>
          )}
        </div>

        {/* Section 3: Default fallback */}
        <div style={{ background:"#fafbff", border:`1px solid #e0e5f5`, borderRadius:12, padding:"16px 18px", marginBottom:32 }}>
          <SectionHeader title="Default fallback escalation" tipText={"If no specific rule applies but something is off, this fallback catches it.\nOptional but recommended for compliance-heavy templates."} />
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: fallback.enabled ? 16 : 0 }}>
            <Toggle checked={fallback.enabled} onChange={() => emitFallback({ ...fallback, enabled: !fallback.enabled })} />
            <span style={{ fontSize:13, color:C.g6, fontFamily:F }}>Escalate any unhandled audit issue to…</span>
          </div>

          {fallback.enabled && (
            <div style={{ paddingTop:4 }}>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.g5, fontFamily:F, marginBottom:6 }}>Recipient</div>
                <RecipientPicker
                  recipientType={fallback.recipientType}
                  recipientValue={fallback.recipientValue}
                  onTypeChange={v => emitFallback({ ...fallback, recipientType: v, recipientValue: null })}
                  onValueChange={v => emitFallback({ ...fallback, recipientValue: v })}
                />
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:C.g5, fontFamily:F, marginBottom:6 }}>Channels</div>
                <ChannelPicker channels={fallback.channels} onChange={v => emitFallback({ ...fallback, channels: v })} />
              </div>
              <div style={{ fontSize:12, color:C.g4, fontFamily:F, marginTop:10, lineHeight:"17px" }}>
                Catches anything not covered by the rules above. Useful as a safety net for compliance-heavy audits.
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Rule modal */}
      {ruleModal && (
        <RuleModal rule={ruleModal.rule} onSave={handleSaveRule} onClose={() => setRuleModal(null)} />
      )}
    </div>
  );
}
