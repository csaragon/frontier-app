// Implements: TLP-8 (Step 1 basics, inline validation), TLP-21 (template metadata), TLP-19 (Seymour card)
import { useState, forwardRef, useImperativeHandle } from "react";
import { SeymourCard } from "./SeymourUpload.jsx";
import { TEMPLATES } from "../Catalog.jsx";

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
  error:        "#dc2626",
  errorBg:      "#fef2f2",
  info:         "#0369a1",
  infoBg:       "#f0f9ff",
  warning:      "#b45309",
  warningBg:    "#fffbeb",
};
const FOCUS_RING = "0 0 0 2px #fff, 0 0 0 4px #2226f7";

const MODULES    = ["Loss Prevention","Health & Safety","Fire Safety","Operations","OSHA","PPE"];
const AUDIT_TYPES = ["Location","Asset","Case"];
const FREQUENCIES = ["Daily","Weekly","Monthly","Quarterly","Ad-hoc"];
const AUDIT_TYPE_HELP = {
  Location: "Used for store walk-throughs and site inspections.",
  Asset:    "Targets a specific piece of equipment or inventory.",
  Case:     "Attached to an investigation or incident record.",
};

const CAT_TO_AUDIT_TYPE = {
  "Fire Safety":     "Location",
  "Health & Safety": "Location",
  "PPE":             "Location",
  "Loss Prevention": "Location",
  "OSHA":            "Location",
  "Operations":      "Location",
};

const OOTB = TEMPLATES.filter(t => t.ootb);

// ── Small helpers ─────────────────────────────────────────────────────────────

function InfoTooltip({ tip }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: 5 }}>
      <button
        type="button"
        aria-label={`More info: ${tip}`}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: C.textMuted, outline: "none" }}
        onFocusCapture={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
        onBlurCapture={e => (e.currentTarget.style.boxShadow = "none")}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><circle cx="12" cy="8" r="0.5" fill="currentColor"/></svg>
      </button>
      {show && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
          zIndex: 700, background: C.navyDeep, color: "#fff", fontSize: 11, fontFamily: F,
          padding: "6px 10px", borderRadius: 6, whiteSpace: "nowrap", maxWidth: 240,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)", pointerEvents: "none", lineHeight: "15px",
        }}>
          {tip}
        </span>
      )}
    </span>
  );
}

function FieldLabel({ label, help, tooltip }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.textSec, fontFamily: F }}>{label}</label>
        {tooltip && <InfoTooltip tip={tooltip} />}
      </div>
      {help && <div style={{ fontSize: 10, color: C.textMuted, fontFamily: F, marginTop: 1 }}>{help}</div>}
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div role="alert" style={{ fontSize: 11, color: C.error, fontFamily: F, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>
      {msg}
    </div>
  );
}

function inputStyle(hasError) {
  return {
    width: "100%", padding: "8px 10px", borderRadius: 8,
    border: `1px solid ${hasError ? C.error : C.borderDef}`,
    fontSize: 12, fontFamily: F, color: C.navyDeep,
    background: C.bgSurface, outline: "none", boxSizing: "border-box",
  };
}

// ── Step 1 component ──────────────────────────────────────────────────────────

const Step1Basics = forwardRef(function Step1Basics({ basics, onChange, onSeymourApply }, ref) {
  const [errors, setErrors] = useState({});

  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};
      if (!basics.name?.trim())  e.name      = "Template name is required.";
      if (!basics.auditType)     e.auditType  = "Select an audit type.";
      if (!basics.module)        e.module     = "Select a module.";
      setErrors(e);
      return Object.keys(e).length === 0;
    },
  }));

  const set = (field, value) => {
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    onChange(field, value);
  };

  const handlePrefill = (templateId) => {
    if (!templateId) return;
    const t = OOTB.find(x => x.id === templateId);
    if (!t) return;
    onChange("auditType",    CAT_TO_AUDIT_TYPE[t.cat] || "Location");
    onChange("module",       t.cat);
    onChange("description",  `Based on ${t.name}. Customize this description to explain the purpose and scope of this audit.`);
    if (errors.auditType || errors.module) setErrors(prev => { const n = { ...prev }; delete n.auditType; delete n.module; return n; });
  };

  const descLen = (basics.description || "").length;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.navyDeep, fontFamily: F }}>Basics</div>
        <div style={{ fontSize: 12, color: C.textMuted, fontFamily: F, marginTop: 3 }}>
          Define what this template is for. These settings control how it appears in the catalog and which programs it can be assigned to.
        </div>
      </div>

      {/* 2-col grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px" }}>

        {/* Template name */}
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel
            label="Template name *"
            help="Appears in the catalog and on generated audit reports."
            tooltip='Example: "Northeast LP Audit - Q3 2025"'
          />
          <input
            value={basics.name || ""}
            onChange={e => set("name", e.target.value)}
            placeholder="e.g. Fire Safety Walkthrough - Stores"
            aria-label="Template name"
            aria-required="true"
            aria-describedby={errors.name ? "name-err" : undefined}
            style={{ ...inputStyle(!!errors.name), borderColor: errors.name ? C.error : basics.name ? C.borderDef : C.borderDef }}
            onFocus={e => { if (!errors.name) e.target.style.borderColor = C.primary; }}
            onBlur={e => { if (!errors.name) e.target.style.borderColor = C.borderDef; }}
          />
          <span id="name-err"><FieldError msg={errors.name} /></span>
        </div>

        {/* Audit type */}
        <div>
          <FieldLabel
            label="Audit type *"
            help="Determines how the audit is initiated and which records it can attach to."
            tooltip="Location audits run against a store or site. Asset audits target specific equipment. Case audits link to an open investigation."
          />
          <div role="radiogroup" aria-label="Audit type" style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
            {AUDIT_TYPES.map(t => (
              <label
                key={t}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
                  padding: "8px 12px", borderRadius: 8,
                  border: `1px solid ${basics.auditType === t ? C.primary : C.borderSubtle}`,
                  background: basics.auditType === t ? C.primaryBg : C.bgSurface,
                  transition: "all 0.1s",
                }}
              >
                <input
                  type="radio"
                  name="auditType"
                  value={t}
                  checked={basics.auditType === t}
                  onChange={() => set("auditType", t)}
                  aria-describedby={errors.auditType ? "audittype-err" : undefined}
                  style={{ marginTop: 1, accentColor: C.primary, flexShrink: 0 }}
                  onFocus={e => (e.currentTarget.closest("label").style.boxShadow = FOCUS_RING)}
                  onBlur={e => (e.currentTarget.closest("label").style.boxShadow = "none")}
                />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navyDeep, fontFamily: F }}>{t}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, fontFamily: F, marginTop: 1 }}>{AUDIT_TYPE_HELP[t]}</div>
                </div>
              </label>
            ))}
          </div>
          <span id="audittype-err"><FieldError msg={errors.auditType} /></span>
        </div>

        {/* Module + Frequency (right column stacked) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Module */}
          <div>
            <FieldLabel
              label="Module *"
              help="Controls which program types this template is available to."
              tooltip='Example: selecting "Loss Prevention" makes this template available only to LP programs.'
            />
            <select
              value={basics.module || ""}
              onChange={e => set("module", e.target.value)}
              aria-label="Module"
              aria-required="true"
              aria-describedby={errors.module ? "module-err" : undefined}
              style={{ ...inputStyle(!!errors.module), cursor: "pointer" }}
              onFocus={e => { if (!errors.module) e.target.style.borderColor = C.primary; }}
              onBlur={e => { if (!errors.module) e.target.style.borderColor = errors.module ? C.error : C.borderDef; }}
            >
              <option value="">Select a module…</option>
              {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span id="module-err"><FieldError msg={errors.module} /></span>
          </div>

          {/* Frequency */}
          <div>
            <FieldLabel
              label="Intended frequency"
              help="Informs scheduling recommendations. Does not enforce cadence automatically."
              tooltip='Example: "Monthly" suggests this audit should run once per month per location.'
            />
            <select
              value={basics.frequency || ""}
              onChange={e => onChange("frequency", e.target.value)}
              aria-label="Intended frequency"
              style={{ ...inputStyle(false), cursor: "pointer" }}
              onFocus={e => (e.target.style.borderColor = C.primary)}
              onBlur={e => (e.target.style.borderColor = C.borderDef)}
            >
              <option value="">No preference</option>
              {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel
            label="Description"
            help="Shown to auditors before they start. Explain the purpose and what to focus on."
            tooltip='Example: "Complete this checklist during every monthly store walk. Focus on fire egress and suppression equipment."'
          />
          <textarea
            value={basics.description || ""}
            onChange={e => onChange("description", e.target.value.slice(0, 500))}
            rows={3}
            placeholder="Describe the purpose and scope of this audit…"
            aria-label="Description"
            style={{ ...inputStyle(false), resize: "vertical" }}
            onFocus={e => (e.target.style.borderColor = C.primary)}
            onBlur={e => (e.target.style.borderColor = C.borderDef)}
          />
          <div style={{ textAlign: "right", fontSize: 10, color: descLen > 450 ? C.warning : C.textMuted, fontFamily: F, marginTop: 3 }}>
            {descLen} / 500
          </div>
        </div>
      </div>

      {/* Seymour card — Start from Excel */}
      {onSeymourApply && (
        <SeymourCard onApply={onSeymourApply} onCancel={() => {}} />
      )}

      {/* OOTB prefill callout */}
      <div style={{
        marginTop: 28, padding: "14px 16px", borderRadius: 10,
        border: `1px solid #bae6fd`, background: C.infoBg,
        display: "flex", alignItems: "flex-start", gap: 12,
      }}>
        <svg style={{ flexShrink: 0, marginTop: 1 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.info} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill={C.info}/></svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.info, fontFamily: F, marginBottom: 2 }}>
            Start from OOTB defaults
          </div>
          <div style={{ fontSize: 11, color: C.textSec, fontFamily: F, marginBottom: 10 }}>
            Prefill sensible defaults from a starter template. You can override any field after applying.
          </div>
          <select
            aria-label="Select an OOTB template to prefill from"
            defaultValue=""
            onChange={e => { handlePrefill(e.target.value); e.target.value = ""; }}
            style={{
              padding: "7px 10px", borderRadius: 8,
              border: `1px solid #bae6fd`,
              background: C.bgSurface, fontSize: 12, fontFamily: F,
              color: C.navyDeep, cursor: "pointer", outline: "none",
              minWidth: 260,
            }}
            onFocus={e => (e.target.style.borderColor = C.primary)}
            onBlur={e => (e.target.style.borderColor = "#bae6fd")}
          >
            <option value="">Choose a starter template…</option>
            {OOTB.map(t => <option key={t.id} value={t.id}>{t.name} ({t.cat})</option>)}
          </select>
        </div>
      </div>
    </div>
  );
});

export default Step1Basics;
