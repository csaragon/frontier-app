import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { AnsTypeIcon } from "./typeIcons.jsx";
import { QUESTION_BANK } from "./BanksPanel.jsx";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy: "#001e76", navy2: "#001356",
  ocean: "#2226f7",
  white: "#ffffff",
  g1: "#f4f4f6", g2: "#e2e5e9", g3: "#c3c8d0", g4: "#8692a2", g5: "#555f6d", g6: "#16191d",
  amber: "#854d0e", amberBg: "#fef9c3",
  red: "#b6143a",
  teal: "#0f766e",
  purple: "#7c3aed",
};

const ANSWER_TYPES = [
  { value: "Yes/No/NA",       bg: "#dbeafe", color: "#1e40af" },
  { value: "Yes/No",          bg: "#dbeafe", color: "#1e40af" },
  { value: "Pass/Fail",       bg: "#dbeafe", color: "#1e40af" },
  { value: "Rating Scale",    bg: "#dbeafe", color: "#1e40af" },
  { value: "Free Text",       bg: "#f3f4f6", color: "#4b5563" },
  { value: "Number",          bg: "#f3f4f6", color: "#4b5563" },
  { value: "Multiple Choice", bg: "#f3f4f6", color: "#4b5563" },
  { value: "Grid",            bg: "#f3f4f6", color: "#4b5563" },
  { value: "Asset",           bg: "#f3f4f6", color: "#4b5563" },
  { value: "Photo Required",  bg: "#ede9fe", color: "#5b21b6" },
];

// Neutral fallback metadata used when no question type is selected yet.
const ANS_TYPE_EMPTY = { value: "", bg: "#f4f4f6", color: "#8692a2" };

function ansTypeMeta(v) {
  if (!v) return ANS_TYPE_EMPTY;
  return ANSWER_TYPES.find(t => t.value === v) ?? ANSWER_TYPES[4];
}

// AnsTypeIcon is now imported from ./typeIcons.jsx

let _uid = 0;
function genId(prefix) { return `${prefix}-${Date.now()}-${++_uid}`; }

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconCaret({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <polyline points="6 9 12 15 18 9"/>
        : <polyline points="9 18 15 12 9 6"/>
      }
    </svg>
  );
}
function IconClose() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IconPlus({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IconTrash() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function IconEdit() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function IconBank() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
}

// ── Shared atoms ──────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <div
      onClick={disabled ? undefined : onChange}
      style={{
        width: 32, height: 18, borderRadius: 9, flexShrink: 0,
        background: checked ? C.navy : C.g3,
        position: "relative", cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s", opacity: disabled ? 0.45 : 1,
      }}
    >
      <div style={{
        position: "absolute", top: 2, left: checked ? 16 : 2,
        width: 14, height: 14, borderRadius: "50%", background: C.white,
        transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
      }}/>
    </div>
  );
}

function Checkbox({ checked, onChange, disabled = false }) {
  return (
    <div
      onClick={disabled ? undefined : onChange}
      style={{
        width: 15, height: 15, borderRadius: 4, flexShrink: 0,
        border: `1.5px solid ${checked ? C.navy : C.g3}`,
        background: checked ? C.navy : C.white,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.1s, border-color 0.1s",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      }}
    >
      {checked && <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
    </div>
  );
}

function AnswerTypeBadge({ value }) {
  const m = ansTypeMeta(value);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: m.bg, color: m.color,
      fontSize: 12, fontWeight: 600, fontFamily: F,
      borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap",
    }}>
      {value}
    </span>
  );
}

function inputStyle(focused) {
  return {
    width: "100%", fontFamily: F, fontSize: 13, color: C.g6,
    background: C.white, border: `1px solid ${focused ? C.navy : C.g2}`,
    borderRadius: 8, padding: "7px 10px", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };
}

function selectStyle() {
  return {
    width: "100%", fontFamily: F, fontSize: 13, color: C.g6,
    background: C.white, border: `1px solid ${C.g2}`,
    borderRadius: 8, padding: "7px 10px", outline: "none", cursor: "pointer",
    boxSizing: "border-box",
  };
}

function FocusInput({ value, onChange, placeholder, type = "text", style: extraStyle = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...inputStyle(focused), ...extraStyle }}
    />
  );
}

function FocusTextarea({ value, onChange, placeholder, rows = 3, style: extraStyle = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...inputStyle(focused), resize: "vertical", ...extraStyle }}
    />
  );
}

function Label({ children, helper }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.g6, fontFamily: F }}>{children}</div>
      {helper && <div style={{ fontSize: 12, color: C.g4, fontFamily: F, marginTop: 2, lineHeight: "15px" }}>{helper}</div>}
    </div>
  );
}

// ── Panel shell ───────────────────────────────────────────────────────────────

function Section({ title, children, action }) {
  return (
    <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.g2}`, padding: "24px 28px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.g6, fontFamily: F }}>{title}</h3>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

// ── Panel 1: Type-specific config ─────────────────────────────────────────────

function RatingConfig({ config, onChange }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
      <div style={{ flex: 1, minWidth: 120 }}>
        <Label>Low label</Label>
        <FocusInput value={config.lowLabel ?? ""} onChange={e => onChange({ ...config, lowLabel: e.target.value })} placeholder="e.g. Poor" />
      </div>
      <div style={{ flex: 1, minWidth: 120 }}>
        <Label>High label</Label>
        <FocusInput value={config.highLabel ?? ""} onChange={e => onChange({ ...config, highLabel: e.target.value })} placeholder="e.g. Excellent" />
      </div>
      <div style={{ width: 100 }}>
        <Label>Steps</Label>
        <FocusInput type="number" value={config.steps ?? 5} onChange={e => onChange({ ...config, steps: Number(e.target.value) })} />
      </div>
    </div>
  );
}

function FreeTextConfig({ config, onChange }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
      <div style={{ flex: 1, minWidth: 160 }}>
        <Label>Max length (optional)</Label>
        <FocusInput type="number" value={config.maxLength ?? ""} onChange={e => onChange({ ...config, maxLength: e.target.value })} placeholder="No limit" />
      </div>
      <div style={{ flex: 2, minWidth: 200 }}>
        <Label>Placeholder text</Label>
        <FocusInput value={config.placeholder ?? ""} onChange={e => onChange({ ...config, placeholder: e.target.value })} placeholder="Optional hint for auditors…" />
      </div>
    </div>
  );
}

function NumberConfig({ config, onChange }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
      <div style={{ flex: 1, minWidth: 120 }}>
        <Label>Min (optional)</Label>
        <FocusInput type="number" value={config.min ?? ""} onChange={e => onChange({ ...config, min: e.target.value })} placeholder="No min" />
      </div>
      <div style={{ flex: 1, minWidth: 120 }}>
        <Label>Max (optional)</Label>
        <FocusInput type="number" value={config.max ?? ""} onChange={e => onChange({ ...config, max: e.target.value })} placeholder="No max" />
      </div>
    </div>
  );
}

function MultipleChoiceConfig({ config, onChange }) {
  const options = config.options ?? [""];
  const multiSelect = config.multiSelect ?? false;

  function updateOption(idx, val) {
    const next = [...options]; next[idx] = val; onChange({ ...config, options: next });
  }
  function addOption() { onChange({ ...config, options: [...options, ""] }); }
  function removeOption(idx) {
    if (options.length <= 1) return;
    const next = options.filter((_, i) => i !== idx);
    onChange({ ...config, options: next });
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <Label>Selection mode</Label>
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          {["Single", "Multi"].map(m => (
            <button key={m}
              onClick={() => onChange({ ...config, multiSelect: m === "Multi" })}
              style={{
                padding: "4px 12px", fontSize: 12, fontWeight: 600, fontFamily: F,
                borderRadius: 6, border: `1px solid ${C.g2}`, cursor: "pointer",
                background: (m === "Multi") === multiSelect ? C.navy : C.white,
                color: (m === "Multi") === multiSelect ? C.white : C.g5,
              }}
            >{m} select</button>
          ))}
        </div>
      </div>
      <Label>Options</Label>
      {options.map((opt, idx) => (
        <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <FocusInput
            value={opt}
            onChange={e => updateOption(idx, e.target.value)}
            placeholder={`Option ${idx + 1}`}
          />
          <button
            onClick={() => removeOption(idx)}
            disabled={options.length <= 1}
            style={{
              background: "none", border: `1px solid ${C.g2}`, borderRadius: 6,
              padding: "4px 8px", cursor: options.length > 1 ? "pointer" : "not-allowed",
              color: options.length > 1 ? C.red : C.g3, display: "flex", alignItems: "center", flexShrink: 0,
            }}
          ><IconTrash /></button>
        </div>
      ))}
      <button
        onClick={addOption}
        style={{
          display: "flex", alignItems: "center", gap: 5, background: "none",
          border: `1px dashed ${C.g3}`, borderRadius: 6, padding: "5px 12px",
          fontSize: 12, color: C.g4, fontFamily: F, cursor: "pointer", width: "100%",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
        onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
      ><IconPlus size={12} /> Add option</button>
    </div>
  );
}

const GRID_COL_TYPES = ["Number", "Text", "Yes/No", "Pass/Fail"];

function gridCellPlaceholder(type) {
  switch (type) {
    case "Number":     return "0";
    case "Yes/No":     return "Yes / No";
    case "Pass/Fail":  return "Pass / Fail";
    default:           return "—";
  }
}

function gridCellStyle(type) {
  switch (type) {
    case "Number":    return { color: "#4b5563", bg: "#f3f4f6" };
    case "Yes/No":    return { color: "#1e40af", bg: "#dbeafe" };
    case "Pass/Fail": return { color: "#1e40af", bg: "#dbeafe" };
    default:          return { color: C.g4,      bg: C.g1      };
  }
}

function GridConfig({ config, onChange }) {
  const groupLabel = config.groupLabel ?? "Merchandise";
  const rowLabel   = config.rowLabel   ?? "Item";
  const columns    = config.columns ?? [
    { id: "gc-default-1", name: "Register #",     type: "Text",   scored: false },
    { id: "gc-default-2", name: "Cases reviewed", type: "Number", scored: false },
    { id: "gc-default-3", name: "Unsecured",      type: "Number", scored: true  },
  ];

  function set(patch) { onChange({ ...config, ...patch }); }
  function updateCol(id, patch) { set({ columns: columns.map(c => c.id === id ? { ...c, ...patch } : c) }); }
  function addCol() { set({ columns: [...columns, { id: genId("gc"), name: "", type: "Number", scored: false }] }); }
  function removeCol(id) { if (columns.length <= 1) return; set({ columns: columns.filter(c => c.id !== id) }); }

  const dottedBtn = {
    display: "flex", alignItems: "center", gap: 5, background: "none",
    border: `1px dashed ${C.g3}`, borderRadius: 6, padding: "5px 10px",
    fontSize: 12, color: C.g4, fontFamily: F, cursor: "pointer", width: "100%",
  };

  function GridDivider({ title }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.navy, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: C.g2 }} />
      </div>
    );
  }

  const thCell = {
    fontSize: 11, fontWeight: 700, color: C.g5, fontFamily: F,
    padding: "7px 10px", textAlign: "left", background: C.g1,
    borderBottom: `2px solid ${C.g2}`, whiteSpace: "nowrap",
  };
  const rowLabelCell = {
    fontSize: 12, fontWeight: 600, color: C.navy, fontFamily: F,
    padding: "8px 10px", background: C.white,
    borderBottom: `1px solid ${C.g2}`, borderRight: `1px solid ${C.g2}`,
    whiteSpace: "nowrap",
  };

  const STUB_ROWS = 2;

  return (
    <div style={{
      marginTop: 10, display: "flex", flexDirection: "column", gap: 14,
    }}>

      <GridDivider title="Labels" />

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Label helper="What auditors call each group they add (e.g. Merchandise, Location, Department)">Group label</Label>
          <FocusInput value={groupLabel} onChange={e => set({ groupLabel: e.target.value })} placeholder="e.g. Merchandise" />
        </div>
        <div style={{ flex: 1 }}>
          <Label helper="What each row within a group is called (e.g. Item, Register, Unit)">Row label</Label>
          <FocusInput value={rowLabel} onChange={e => set({ rowLabel: e.target.value })} placeholder="e.g. Item" />
        </div>
      </div>

      <GridDivider title="Columns" />

      {/* Columns */}
      <div>
        <div style={{ fontSize: 12, color: C.g4, fontFamily: F, marginBottom: 8 }}>
          Columns are fixed — auditors fill these in for every row they add.
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 110px 80px 28px",
          gap: 6, marginBottom: 5, padding: "0 2px",
        }}>
          {["Column name", "Type", "Scored", ""].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: C.g4, fontFamily: F }}>{h}</span>
          ))}
        </div>
        {columns.map(col => (
          <div key={col.id} style={{
            display: "grid", gridTemplateColumns: "1fr 110px 80px 28px",
            gap: 6, marginBottom: 6, alignItems: "center",
          }}>
            <FocusInput
              value={col.name}
              onChange={e => updateCol(col.id, { name: e.target.value })}
              placeholder="Column name"
            />
            <select
              value={col.type ?? "Number"}
              onChange={e => updateCol(col.id, { type: e.target.value })}
              style={{ ...selectStyle(), fontSize: 12, padding: "7px 6px" }}
            >
              {GRID_COL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Toggle checked={!!col.scored} onChange={() => updateCol(col.id, { scored: !col.scored })} />
              <span style={{ fontSize: 11, color: col.scored ? C.navy : C.g4, fontFamily: F, fontWeight: 600 }}>
                {col.scored ? "Yes" : "No"}
              </span>
            </div>
            <button
              onClick={() => removeCol(col.id)}
              disabled={columns.length <= 1}
              style={{
                background: "none", border: "none", padding: 3, cursor: columns.length > 1 ? "pointer" : "not-allowed",
                color: columns.length > 1 ? C.red : C.g3, display: "flex", alignItems: "center",
              }}
            >
              <IconTrash />
            </button>
          </div>
        ))}
        <button
          onClick={addCol}
          style={dottedBtn}
          onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
        >
          <IconPlus size={11} /> Add column
        </button>
      </div>

      <GridDivider title="Table preview" />

      {/* Live table preview */}
      <div style={{ fontSize: 11, color: C.g4, fontFamily: F, marginTop: -6 }}>
        How this grid will look to auditors. Cells show placeholder values based on column type.
      </div>
      <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${C.g2}` }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: F, tableLayout: "auto" }}>
          <thead>
            <tr>
              <th style={{ ...thCell, borderRight: `1px solid ${C.g2}`, minWidth: 100 }}>
                {rowLabel || "Item"}
              </th>
              {columns.map(col => (
                <th key={col.id} style={{ ...thCell, borderRight: `1px solid ${C.g2}`, minWidth: 90 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {col.name || <span style={{ color: C.g3, fontStyle: "italic", fontWeight: 400 }}>Unnamed</span>}
                    {col.scored && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: C.navy, background: "#eef1ff", borderRadius: 3, padding: "1px 4px", flexShrink: 0 }}>Scored</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: STUB_ROWS }, (_, i) => (
              <tr key={i}>
                <td style={rowLabelCell}>{rowLabel || "Item"} {i + 1}</td>
                {columns.map(col => {
                  const cs = gridCellStyle(col.type);
                  return (
                    <td key={col.id} style={{
                      padding: "8px 10px", textAlign: "center",
                      background: cs.bg, color: cs.color,
                      borderBottom: `1px solid ${C.g2}`, borderRight: `1px solid ${C.g2}`,
                      fontSize: 11, fontWeight: 500, fontFamily: F,
                    }}>
                      {gridCellPlaceholder(col.type)}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td colSpan={columns.length + 1} style={{ padding: "7px 10px", background: C.white, borderTop: `1px solid ${C.g2}` }}>
                <span style={{ fontSize: 11, color: C.g3, fontFamily: F, fontStyle: "italic" }}>
                  + Auditors can add more {(rowLabel || "item").toLowerCase()}s here
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}

function AssetConfig({ config, onChange }) {
  const multi = config.multiAsset ?? false;
  return (
    <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 180 }}>
        <Label>Asset category</Label>
        <select value={config.category ?? ""} onChange={e => onChange({ ...config, category: e.target.value })} style={selectStyle()}>
          <option value="" disabled>— Select asset category —</option>
          {["General", "Equipment", "Vehicle", "Property", "IT Asset"].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, paddingBottom: 2 }}>
        {["Single", "Multiple"].map(m => (
          <button key={m}
            onClick={() => onChange({ ...config, multiAsset: m === "Multiple" })}
            style={{
              padding: "7px 12px", fontSize: 12, fontWeight: 600, fontFamily: F,
              borderRadius: 6, border: `1px solid ${C.g2}`, cursor: "pointer",
              background: (m === "Multiple") === multi ? C.navy : C.white,
              color: (m === "Multiple") === multi ? C.white : C.g5,
            }}
          >{m}</button>
        ))}
      </div>
    </div>
  );
}

function PhotoConfig({ config, onChange }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
      <div style={{ flex: 1, minWidth: 120 }}>
        <Label>Photos required</Label>
        <FocusInput type="number" value={config.minPhotos ?? 1} onChange={e => onChange({ ...config, minPhotos: Number(e.target.value) })} />
      </div>
      <div style={{ flex: 1, minWidth: 120 }}>
        <Label>Max photos</Label>
        <FocusInput type="number" value={config.maxPhotos ?? 5} onChange={e => onChange({ ...config, maxPhotos: Number(e.target.value) })} />
      </div>
    </div>
  );
}

function InstructionsEditor({ value, onChange }) {
  return (
    <FocusTextarea
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      placeholder="Optional. Shown to auditors below the question."
      rows={3}
    />
  );
}

// ── Type-specific config dispatcher ──────────────────────────────────────────

function TypeConfig({ answerType, config, onChange }) {
  switch (answerType) {
    case "Rating Scale":    return <RatingConfig config={config} onChange={onChange} />;
    case "Free Text":       return <FreeTextConfig config={config} onChange={onChange} />;
    case "Number":          return <NumberConfig config={config} onChange={onChange} />;
    case "Multiple Choice": return <MultipleChoiceConfig config={config} onChange={onChange} />;
    case "Grid":            return <GridConfig config={config} onChange={onChange} />;
    case "Asset":           return <AssetConfig config={config} onChange={onChange} />;
    case "Photo Required":  return <PhotoConfig config={config} onChange={onChange} />;
    default:                return null;
  }
}

// ── Panel 1 body ──────────────────────────────────────────────────────────────

function Panel1Body({ state, onChange }) {
  const { answerType, required, critical, informational, allowAttachment, instructions, typeConfig } = state;

  function setField(field, val) { onChange({ ...state, [field]: val }); }

  function handleInformational() {
    const next = !informational;
    // Informational and critical are mutually exclusive
    onChange({ ...state, informational: next, critical: next ? false : critical });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Label>Answer type <span style={{ color: C.red }}>*</span></Label>
        <select value={answerType} onChange={e => onChange({ ...state, answerType: e.target.value, typeConfig: {} })} style={selectStyle()}>
          <option value="" disabled>— Select question type —</option>
          {ANSWER_TYPES.map(t => <option key={t.value} value={t.value}>{t.value}</option>)}
        </select>
        <TypeConfig answerType={answerType} config={typeConfig ?? {}} onChange={tc => setField("typeConfig", tc)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
          <Checkbox checked={required} onChange={() => setField("required", !required)} />
          Required
        </label>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
            <Checkbox checked={!!critical} onChange={() => setField("critical", !critical)} disabled={!!informational} />
            Critical
          </label>
          <div style={{ fontSize: 12, color: C.g4, fontFamily: F, marginTop: 3, marginLeft: 23, lineHeight: "15px" }}>
            Configured on the Scoring tab — critical questions can fail the entire audit.
          </div>
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
            <Checkbox checked={!!informational} onChange={handleInformational} />
            Informational only
          </label>
          <div style={{ fontSize: 12, color: C.g4, fontFamily: F, marginTop: 3, marginLeft: 23, lineHeight: "15px" }}>
            Excluded from all scoring calculations.
          </div>
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
            <Checkbox checked={!!allowAttachment} onChange={() => setField("allowAttachment", !allowAttachment)} />
            Allow photo / media attachment
          </label>
          <div style={{ fontSize: 12, color: C.g4, fontFamily: F, marginTop: 3, marginLeft: 23, lineHeight: "15px" }}>
            Auditors can attach evidence. To require it on a specific answer, add a Require media trigger in Logic.
          </div>
        </div>
      </div>

      <div>
        <Label helper="Optional. Shown to auditors below the question.">Instructions / help text</Label>
        <InstructionsEditor value={instructions ?? ""} onChange={v => setField("instructions", v)} />
      </div>
    </div>
  );
}

// ── Panel 2: Scoring ──────────────────────────────────────────────────────────

function Panel2Body({ scoring, methodology, answerType, onChange }) {
  const m = methodology ?? "points";

  function setField(f, v) { onChange({ ...scoring, [f]: v }); }

  const hideScoreToggle = answerType === "Grid" && (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
      <Toggle checked={scoring?.hideScoreFromAuditor ?? false} onChange={() => setField("hideScoreFromAuditor", !(scoring?.hideScoreFromAuditor))} />
      Hide score from auditor
      <span style={{ fontSize: 12, color: C.g4, fontFamily: F, fontWeight: 400 }}>(back-end only)</span>
    </label>
  );

  const helperText = {
    weighted: "Enter the weight (0–100%) this question contributes within its section.",
    points:   "Enter the point value awarded for a correct / passing answer.",
    passfail: "Enter the score applied when this question passes or fails.",
  }[m] ?? "Enter the point value for a correct answer.";

  if (m === "weighted") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <Label helper={helperText}>Weight %</Label>
          <FocusInput type="number" value={scoring?.value ?? ""} onChange={e => setField("value", e.target.value)} placeholder="0" style={{ width: 120 }} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
          <Toggle checked={scoring?.locked ?? false} onChange={() => setField("locked", !(scoring?.locked))} />
          Lock from Fix Math
        </label>
        {hideScoreToggle}
      </div>
    );
  }
  if (m === "passfail") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <Label>Pass value</Label>
            <FocusInput type="number" value={scoring?.passValue ?? 10} onChange={e => setField("passValue", e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <Label>Fail value</Label>
            <FocusInput type="number" value={scoring?.failValue ?? 0} onChange={e => setField("failValue", e.target.value)} />
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
          <Toggle checked={scoring?.locked ?? false} onChange={() => setField("locked", !(scoring?.locked))} />
          Lock from Fix Math
        </label>
        {hideScoreToggle}
      </div>
    );
  }
  // points or default
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label helper={helperText}>Point value</Label>
        <FocusInput type="number" value={scoring?.value ?? ""} onChange={e => setField("value", e.target.value)} placeholder="0" style={{ width: 120 }} />
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
        <Toggle checked={scoring?.locked ?? false} onChange={() => setField("locked", !(scoring?.locked))} />
        Lock from Fix Math
      </label>
      {hideScoreToggle}
    </div>
  );
}

function scoringStatus(scoring, methodology) {
  const m = methodology ?? "points";
  if (m === "passfail") {
    const pv = scoring?.passValue, fv = scoring?.failValue;
    if (pv !== undefined && pv !== "") return `${pv} / ${fv ?? 0} pts`;
    return "Not configured";
  }
  if (m === "weighted") {
    if (scoring?.value !== undefined && scoring?.value !== "") return `${scoring.value}%`;
    return "Not configured";
  }
  if (scoring?.value !== undefined && scoring?.value !== "") return `${scoring.value} pts`;
  return "Not configured";
}

// ── Logic panel ───────────────────────────────────────────────────────────────
// One rule = one "if answer X" condition + one or more typed triggers (additive).
// Replaces the old separate Actions (Panel 4) and Escalation (Panel 5) panels.

const ASSIGNEE_ROLES = ["Store Manager", "Department Lead", "Operations Manager", "Asset Protection Lead", "District Manager"];
const STUB_USERS  = [{ id: "u1", name: "Alex Chen" }, { id: "u2", name: "Maria Rodriguez" }, { id: "u3", name: "James Okafor" }, { id: "u4", name: "Sarah Kim" }, { id: "u5", name: "David Patel" }];
const ROLE_OPTIONS  = ["Store Manager", "Asset Protection Lead", "Operations Manager", "Department Lead", "District Manager"];
const GROUP_OPTIONS = ["All Store Managers — Southeast", "Regional LP Team", "Q1 Audit Crew"];

const BANK_QUESTION_LOGIC = {
  "bq-1": { rules: [{ id: "rbl1", operator: "not_equals", value: "Yes", triggers: [
    { id: "tbl1", type: "notify", recipientType: "role", recipientValue: "Store Manager", channels: { email: true, inApp: true }, message: "", selectedUsers: [] },
    { id: "tbl2", type: "require_media" },
  ]}]},
  "bq-3": { rules: [{ id: "rbl2", operator: "equals", value: "Fail", triggers: [
    { id: "tbl3", type: "require_action", actionTitle: "PPE compliance review", description: "Ensure all employees have required PPE.", assigneeRole: "Store Manager", dueDays: 1 },
  ]}]},
  "bq-7": { rules: [{ id: "rbl3", operator: "equals", value: "No", triggers: [
    { id: "tbl4", type: "notify", recipientType: "role", recipientValue: "Asset Protection Lead", channels: { email: true, inApp: true }, message: "Safe found unsecured.", selectedUsers: [] },
    { id: "tbl5", type: "require_note" },
  ]}]},
};

const TRIGGER_MENU = [
  { type: "ask_questions",  label: "Ask questions",  group: "flow" },
  { type: "notify",         label: "Notify",          group: "flow" },
  { type: "require_action", label: "Require action",  group: "flow" },
  { type: "require_note",   label: "Require note",    group: "require" },
  { type: "require_media",  label: "Require media",   group: "require" },
];

function ruleConditionOps(answerType) {
  if (answerType === "Rating Scale" || answerType === "Number") {
    return [
      { v: "equals",     l: "is"            },
      { v: "not_equals", l: "isn't"         },
      { v: "lt",         l: "is less than"  },
      { v: "gt",         l: "is more than"  },
      { v: "lte",        l: "is at most"    },
      { v: "gte",        l: "is at least"   },
    ];
  }
  if (answerType === "Free Text") {
    return [
      { v: "contains",     l: "contains"        },
      { v: "not_contains", l: "doesn't contain" },
    ];
  }
  return [
    { v: "equals",     l: "is"    },
    { v: "not_equals", l: "isn't" },
  ];
}

function ruleConditionValues(answerType) {
  switch (answerType) {
    case "Yes/No":    return ["Yes", "No"];
    case "Yes/No/NA": return ["Yes", "No", "N/A"];
    case "Pass/Fail": return ["Pass", "Fail"];
    default:          return null;
  }
}

function emptyCondition(answerType) {
  const ops  = ruleConditionOps(answerType);
  const vals = ruleConditionValues(answerType);
  return { id: genId("cond"), operator: ops[0]?.v ?? "equals", value: vals ? vals[0] : "" };
}

function emptyLogicRule(answerType, kind = "else_if") {
  return {
    id: genId("rl"), kind,
    conditionOperator: "and",
    conditions: [emptyCondition(answerType)],
    triggers: [],
  };
}

// Migrate old single-condition rules ({ operator, value }) to new multi-condition format.
function normalizeRule(rule, answerType) {
  if (rule.conditions) return rule;
  const ops  = ruleConditionOps(answerType);
  const vals = ruleConditionValues(answerType);
  const op   = rule.operator ?? (ops[0]?.v ?? "equals");
  const val  = rule.value    ?? (vals ? vals[0] : "");
  return { ...rule, conditionOperator: "and", conditions: [{ id: genId("cond"), operator: op, value: val }] };
}

// ── Logic help modal ──────────────────────────────────────────────────────────

function LogicHelpModal({ onClose }) {
  const SECTIONS = [
    {
      label: "AND — All conditions must match",
      color: "#1d4ed8",
      bg: "#eff6ff",
      border: "#bfdbfe",
      desc: "The rule fires only when every condition in the list is true at the same time.",
      example: "\"Answer is 'Fail' AND score is less than 3\" — both must be true before any triggers run.",
      when: "Use AND when you need to be precise about a combination of circumstances.",
    },
    {
      label: "OR — Any condition can match",
      color: "#065f46",
      bg: "#ccfbf1",
      border: "#6ee7b7",
      desc: "The rule fires as soon as at least one condition is true.",
      example: "\"Answer is 'No' OR answer is 'N/A'\" — either answer will trigger the rule.",
      when: "Use OR when several different answers should all lead to the same action.",
    },
    {
      label: "NONE — No condition may match",
      color: "#9a3412",
      bg: "#fff7ed",
      border: "#fdba74",
      desc: "The rule fires only when every condition in the list is false (the logical NOT of OR).",
      example: "\"None of: answer is 'Yes', answer is 'Pass'\" — triggers only if the answer is something other than Yes or Pass.",
      when: "Use NONE when you want to catch any answer that isn't on your approved list.",
    },
  ];

  const tips = [
    "Start simple — one condition per rule is often enough.",
    "Use the + Otherwise tab to define a catch-all action when none of your rules match.",
    "Add multiple rules (tabs) to handle different answer scenarios independently.",
    "Triggers within a rule always run together — add multiple triggers to take several actions at once.",
    "A 'Require media' trigger asks the auditor to attach a photo or file before they can move on.",
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 20000,
      background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: C.white, borderRadius: 14, width: 540, maxWidth: "calc(100vw - 40px)",
        maxHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.g2}`, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.g6, fontFamily: F, marginBottom: 4 }}>How Question Logic Works</div>
            <div style={{ fontSize: 12, color: C.g4, fontFamily: F, lineHeight: 1.5 }}>
              Question logic lets you trigger actions automatically — like sending a notification or requiring a follow-up — based on how an auditor answers this question.
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.g3, padding: 4, display: "flex", borderRadius: 6, flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = C.g6} onMouseLeave={e => e.currentTarget.style.color = C.g3}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ overflow: "auto", padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Operator cards */}
          <div style={{ fontSize: 12, fontWeight: 700, color: C.g5, fontFamily: F, letterSpacing: "0.04em", marginBottom: 2 }}>LOGICAL OPERATORS</div>
          {SECTIONS.map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: F, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: C.g6, fontFamily: F, lineHeight: 1.55, marginBottom: 6 }}>{s.desc}</div>
              <div style={{ fontSize: 11, color: C.g5, fontFamily: F, fontStyle: "italic", lineHeight: 1.5, marginBottom: 4 }}>
                Example: {s.example}
              </div>
              <div style={{ fontSize: 11, color: s.color, fontFamily: F, fontWeight: 600 }}>{s.when}</div>
            </div>
          ))}

          {/* Tips */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.g5, fontFamily: F, letterSpacing: "0.04em", marginBottom: 10 }}>TIPS</div>
            <ul style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 6 }}>
              {tips.map((t, i) => (
                <li key={i} style={{ fontSize: 12, color: C.g5, fontFamily: F, lineHeight: 1.5 }}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function emptyTrigger(type) {
  const base = { id: genId("trg"), type };
  switch (type) {
    case "ask_questions":  return { ...base, questions: [] };
    case "notify":         return { ...base, recipientType: "role", recipientValue: ROLE_OPTIONS[0], channels: { email: true, inApp: true }, message: "", selectedUsers: [] };
    case "require_action": return { ...base, actionTitle: "", description: "", assigneeRole: "", dueDays: 7 };
    default:               return base;
  }
}

function triggerSummary(trigger) {
  switch (trigger.type) {
    case "ask_questions": {
      const n = trigger.questions?.length ?? 0;
      return n === 0 ? "none selected" : `${n} question${n !== 1 ? "s" : ""}`;
    }
    case "notify": {
      const r = trigger.recipientType === "user"
        ? `${trigger.selectedUsers?.length ?? 0} user(s)`
        : trigger.recipientValue || "—";
      return `→ ${r}`;
    }
    case "require_action": return trigger.actionTitle ? `— ${trigger.actionTitle.slice(0, 22)}` : "";
    default: return "";
  }
}

// ── Trigger type icon ─────────────────────────────────────────────────────────

function TriggerIcon({ type, size = 13 }) {
  const s = { width: size, height: size, flexShrink: 0 };
  if (type === "ask_questions") return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
  if (type === "notify")        return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
  if (type === "require_action")return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
  if (type === "require_note")  return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
  if (type === "require_media") return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
  return null;
}

// ── Per-trigger inline editors ────────────────────────────────────────────────

function BankPickerModal({ selected, onChange, onClose }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const selectedIds = new Set(selected.map(q => q.id));

  const allTypes = [...new Set(QUESTION_BANK.map(bq => bq.answerType))].sort();

  const filtered = QUESTION_BANK.filter(bq => {
    const matchSearch = search === "" ||
      bq.title.toLowerCase().includes(search.toLowerCase()) ||
      (bq.tags ?? []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === "" || bq.answerType === typeFilter;
    return matchSearch && matchType;
  });

  const allFilteredSelected = filtered.length > 0 && filtered.every(bq => selectedIds.has(bq.id));

  function toggleAll() {
    if (allFilteredSelected) {
      const filteredIds = new Set(filtered.map(bq => bq.id));
      onChange(selected.filter(q => !filteredIds.has(q.id)));
    } else {
      const toAdd = filtered.filter(bq => !selectedIds.has(bq.id)).map(bq => ({
        id: bq.id, source: "bank", title: bq.title, answerType: bq.answerType,
        logic: BANK_QUESTION_LOGIC[bq.id] ?? { rules: [] },
      }));
      onChange([...selected, ...toAdd]);
    }
  }

  function toggleOne(bq) {
    if (selectedIds.has(bq.id)) {
      onChange(selected.filter(q => q.id !== bq.id));
    } else {
      onChange([...selected, { id: bq.id, source: "bank", title: bq.title, answerType: bq.answerType, logic: BANK_QUESTION_LOGIC[bq.id] ?? { rules: [] } }]);
    }
  }

  function getLogicTypes(bqId) {
    const logic = BANK_QUESTION_LOGIC[bqId];
    if (!logic) return [];
    const types = new Set();
    for (const rule of logic.rules) {
      for (const trigger of rule.triggers) types.add(trigger.type);
    }
    return [...types];
  }

  const TRIGGER_LABELS = {
    ask_questions: "Conditional questions",
    notify: "Notification",
    require_action: "Required action",
    require_note: "Required note",
    require_media: "Required media",
  };

  const ansTypeMeta2 = v => ANSWER_TYPES.find(t => t.value === v) ?? { bg: C.g1, color: C.g5 };

  const COL = "32px 1fr 120px 90px";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, fontFamily: F }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.white, borderRadius: 12, width: 720, maxHeight: "82vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.22)" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${C.g2}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: C.g6, fontFamily: F }}>Question bank</span>
          {selectedIds.size > 0 && (
            <span style={{ fontSize: 12, color: C.navy, fontFamily: F, fontWeight: 600 }}>{selectedIds.size} selected</span>
          )}
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, display: "flex", padding: 4, borderRadius: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = C.g6} onMouseLeave={e => e.currentTarget.style.color = C.g4}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Search + type filter toolbar */}
        <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.g2}`, display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.g4, pointerEvents: "none" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions…"
              style={{ width: "100%", boxSizing: "border-box", paddingLeft: 30, paddingRight: 8, paddingTop: 6, paddingBottom: 6, fontSize: 12, fontFamily: F, border: `1px solid ${C.g2}`, borderRadius: 6, outline: "none", color: C.g6, background: C.white }} />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: "6px 8px", fontSize: 12, fontFamily: F, border: `1px solid ${C.g2}`, borderRadius: 6, color: typeFilter ? C.g6 : C.g4, background: C.white, cursor: "pointer", outline: "none" }}>
            <option value="">All types</option>
            {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: COL, padding: "6px 20px", background: C.g1, borderBottom: `1px solid ${C.g2}`, flexShrink: 0, alignItems: "center", gap: 8 }}>
          <Checkbox checked={allFilteredSelected} onChange={toggleAll} />
          {["Question", "Type", "Logic"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: F }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, fontSize: 13, color: C.g4, fontFamily: F, textAlign: "center" }}>No matches</div>
          ) : filtered.map(bq => {
            const checked = selectedIds.has(bq.id);
            const logicTypes = getLogicTypes(bq.id);
            const meta = ansTypeMeta2(bq.answerType);
            return (
              <div key={bq.id}
                style={{ display: "grid", gridTemplateColumns: COL, padding: "9px 20px", borderBottom: `1px solid ${C.g1}`, alignItems: "center", gap: 8, cursor: "pointer", background: checked ? "#f0f4ff" : "transparent" }}
                onClick={() => toggleOne(bq)}
                onMouseEnter={e => { if (!checked) e.currentTarget.style.background = C.g1; }}
                onMouseLeave={e => { e.currentTarget.style.background = checked ? "#f0f4ff" : "transparent"; }}>
                <Checkbox checked={checked} onChange={() => toggleOne(bq)} />
                <span style={{ fontSize: 13, color: C.g6, fontFamily: F, lineHeight: "18px", paddingRight: 8 }}>{bq.title}</span>
                <span style={{ fontSize: 11, fontWeight: 600, fontFamily: F, padding: "2px 7px", borderRadius: 4, background: meta.bg, color: meta.color, display: "inline-block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 110 }}>{bq.answerType}</span>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }} onClick={e => e.stopPropagation()}>
                  {logicTypes.length === 0
                    ? <span style={{ fontSize: 12, color: C.g3, fontFamily: F }}>—</span>
                    : logicTypes.map(type => (
                        <span key={type} title={TRIGGER_LABELS[type] ?? type} style={{ color: C.g4, display: "flex", cursor: "default" }}>
                          <TriggerIcon type={type} size={14} />
                        </span>
                      ))
                  }
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.g2}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: C.g4, fontFamily: F }}>
            {filtered.length} question{filtered.length !== 1 ? "s" : ""}
            {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
          </span>
          <button onClick={onClose}
            style={{ background: C.navy, color: C.white, border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = C.navy2} onMouseLeave={e => e.currentTarget.style.background = C.navy}>
            Preview and Add
          </button>
        </div>
      </div>
    </div>
  );
}

function AskQuestionsEditor({ trigger, onChange }) {
  const [manualTitle, setManualTitle] = useState("");
  const [manualType, setManualType] = useState("Yes/No");
  const [dupMatch, setDupMatch] = useState(null);
  const [bankOpen, setBankOpen] = useState(false);

  const selected = trigger.questions ?? [];
  const selectedIds = new Set(selected.map(q => q.id));

  function handleBankChange(newQuestions) {
    onChange({ ...trigger, questions: newQuestions });
  }

  function removeQuestion(id) {
    onChange({ ...trigger, questions: selected.filter(q => q.id !== id) });
  }

  function addManual() {
    if (!manualTitle.trim()) return;
    if (dupMatch && !selectedIds.has(dupMatch.id)) {
      handleBankChange([...selected, { id: dupMatch.id, source: "bank", title: dupMatch.title, answerType: dupMatch.answerType, logic: BANK_QUESTION_LOGIC[dupMatch.id] ?? { rules: [] } }]);
      setManualTitle(""); setDupMatch(null);
      return;
    }
    onChange({ ...trigger, questions: [...selected, {
      id: genId("mq"), source: "manual", title: manualTitle.trim(),
      answerType: manualType, logic: { rules: [] },
    }]});
    setManualTitle("");
  }

  useEffect(() => {
    if (!manualTitle.trim()) { setDupMatch(null); return; }
    const lower = manualTitle.toLowerCase();
    setDupMatch(QUESTION_BANK.find(bq => bq.title.toLowerCase().includes(lower) || lower.includes(bq.title.toLowerCase().slice(0, 20))) ?? null);
  }, [manualTitle]);

  const bankCount = selected.filter(q => q.source === "bank").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Manual entry — primary */}
      <div>
        <Label>Add question</Label>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <FocusInput value={manualTitle} onChange={e => setManualTitle(e.target.value)} placeholder="Question text…" style={{ flex: "2 1 180px" }}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addManual(); } }}
          />
          <select value={manualType} onChange={e => setManualType(e.target.value)} style={{ ...selectStyle(), flex: "1 1 120px" }}>
            {ANSWER_TYPES.filter(t => t.value).map(t => <option key={t.value} value={t.value}>{t.value}</option>)}
          </select>
          <button onClick={addManual}
            style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: C.navy, color: C.white, fontSize: 12, fontWeight: 600, fontFamily: F, cursor: "pointer", flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = C.navy2} onMouseLeave={e => e.currentTarget.style.background = C.navy}>
            Add
          </button>
        </div>
        {dupMatch && !selectedIds.has(dupMatch.id) && (
          <div style={{ marginTop: 6, fontSize: 11, color: C.amber, fontFamily: F, lineHeight: "15px" }}>
            Matches "{dupMatch.title.slice(0, 50)}{dupMatch.title.length > 50 ? "…" : ""}" in the bank — clicking Add will use the bank version with pre-configured logic.
          </div>
        )}
      </div>

      {/* Browse bank button */}
      <button onClick={() => setBankOpen(true)}
        style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 7, border: `1px solid ${C.g2}`, background: C.g1, color: C.g5, fontSize: 12, fontWeight: 500, fontFamily: F, cursor: "pointer", width: "100%", textAlign: "left" }}
        onMouseEnter={e => { e.currentTarget.style.background = C.g2; e.currentTarget.style.color = C.g6; }}
        onMouseLeave={e => { e.currentTarget.style.background = C.g1; e.currentTarget.style.color = C.g5; }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        Browse question bank
        {bankCount > 0 && (
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, background: C.navy, color: C.white, borderRadius: 10, padding: "1px 7px" }}>{bankCount}</span>
        )}
      </button>

      {/* Selected questions */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {selected.map(q => {
            const hasLogic = q.source === "bank" && BANK_QUESTION_LOGIC[q.id];
            return (
              <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", background: C.white, border: `1px solid ${C.g2}`, borderRadius: 6 }}>
                <span style={{ flex: 1, fontSize: 12, color: C.g6, fontFamily: F, lineHeight: "16px" }}>{q.title}</span>
                {hasLogic && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "#d4e2ff", color: C.navy, fontFamily: F, flexShrink: 0 }}>Logic included</span>
                )}
                <button onClick={() => removeQuestion(q.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g3, display: "flex", padding: 2, borderRadius: 3, flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = C.g3}
                ><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
            );
          })}
        </div>
      )}

      {bankOpen && <BankPickerModal selected={selected} onChange={handleBankChange} onClose={() => setBankOpen(false)} />}
    </div>
  );
}

function NotifyEditor({ trigger, onChange }) {
  function set(f, v) { onChange({ ...trigger, [f]: v }); }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <Label>Recipient</Label>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {[["Specific user", "user"], ["Role", "role"], ["Group", "group"]].map(([lbl, val]) => (
            <button key={val} onClick={() => set("recipientType", val)}
              style={{ padding: "4px 10px", fontSize: 12, fontWeight: 600, fontFamily: F, borderRadius: 6, border: `1px solid ${C.g2}`, cursor: "pointer", background: trigger.recipientType === val ? C.navy : C.white, color: trigger.recipientType === val ? C.white : C.g5 }}
            >{lbl}</button>
          ))}
        </div>
        {trigger.recipientType === "user" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {STUB_USERS.map(u => (
              <label key={u.id} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 12, color: C.g5, fontFamily: F }}>
                <Checkbox checked={(trigger.selectedUsers ?? []).includes(u.id)} onChange={() => {
                  const sel = trigger.selectedUsers ?? [];
                  set("selectedUsers", sel.includes(u.id) ? sel.filter(x => x !== u.id) : [...sel, u.id]);
                }} />
                {u.name}
              </label>
            ))}
          </div>
        )}
        {trigger.recipientType === "role" && (
          <select value={trigger.recipientValue ?? ""} onChange={e => set("recipientValue", e.target.value)} style={selectStyle()}>
            <option value="" disabled>— Select role —</option>
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
        {trigger.recipientType === "group" && (
          <select value={trigger.recipientValue ?? ""} onChange={e => set("recipientValue", e.target.value)} style={selectStyle()}>
            <option value="" disabled>— Select group —</option>
            {GROUP_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        )}
      </div>
      <div>
        <Label>Channels</Label>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12, color: C.g5, fontFamily: F }}>
            <Checkbox checked={trigger.channels?.email ?? true} onChange={() => set("channels", { ...trigger.channels, email: !(trigger.channels?.email ?? true) })} />
            Email
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12, color: C.g5, fontFamily: F }}>
            <Checkbox checked={trigger.channels?.inApp ?? true} onChange={() => set("channels", { ...trigger.channels, inApp: !(trigger.channels?.inApp ?? true) })} />
            In-app
          </label>
        </div>
      </div>
      <div>
        <Label>Custom message (optional)</Label>
        <FocusTextarea value={trigger.message ?? ""} onChange={e => set("message", e.target.value)} placeholder="Leave blank for the default notification message…" rows={2} />
      </div>
    </div>
  );
}

function RequireActionEditor({ trigger, onChange }) {
  function set(f, v) { onChange({ ...trigger, [f]: v }); }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <Label>Action title <span style={{ color: C.red }}>*</span></Label>
        <FocusInput value={trigger.actionTitle ?? ""} onChange={e => set("actionTitle", e.target.value)} placeholder="e.g. Fix fire extinguisher mounting" />
      </div>
      <div>
        <Label>Description</Label>
        <FocusTextarea value={trigger.description ?? ""} onChange={e => set("description", e.target.value)} placeholder="Describe what the assignee should do…" rows={2} />
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <Label>Default assignee role</Label>
          <select value={trigger.assigneeRole ?? ""} onChange={e => set("assigneeRole", e.target.value)} style={selectStyle()}>
            <option value="">— Select role —</option>
            {ASSIGNEE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ width: 130 }}>
          <Label>Due (days from audit)</Label>
          <FocusInput type="number" value={trigger.dueDays ?? 7} onChange={e => set("dueDays", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// ── Add-trigger dropdown menu ─────────────────────────────────────────────────

function AddTriggerMenu({ onSelect, existingTypes }) {
  const [open, setOpen] = useState(false);
  const menuRef  = useRef(null);
  const btnRef   = useRef(null);

  useEffect(() => {
    if (!open) return;
    function outside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          btnRef.current  && !btnRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [open]);

  const singleUse = ["require_note", "require_media"];

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button ref={btnRef} onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 5, background: "none",
          border: `1px dashed ${C.g3}`, borderRadius: 6, padding: "4px 10px",
          fontSize: 12, color: C.g4, fontFamily: F, cursor: "pointer",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
        onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
      >
        <IconPlus size={11} /> trigger
      </button>

      {open && (
        <div ref={menuRef} style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 300,
          background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8,
          boxShadow: "0 6px 20px rgba(0,0,0,0.12)", minWidth: 190, overflow: "hidden",
        }}>
          {TRIGGER_MENU.map((item, i) => {
            const disabled = singleUse.includes(item.type) && existingTypes.includes(item.type);
            const showDiv  = i > 0 && item.group !== TRIGGER_MENU[i - 1].group;
            return (
              <div key={item.type}>
                {showDiv && <div style={{ height: 1, background: C.g2, margin: "3px 0" }} />}
                <button
                  onClick={() => { if (!disabled) { onSelect(item.type); setOpen(false); } }}
                  disabled={disabled}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, width: "100%",
                    padding: "9px 14px", background: "none", border: "none",
                    fontSize: 13, fontFamily: F, color: disabled ? C.g3 : C.g6,
                    cursor: disabled ? "default" : "pointer", textAlign: "left",
                  }}
                  onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = C.g1; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                >
                  <TriggerIcon type={item.type} />
                  {item.label}
                  {disabled && <span style={{ fontSize: 11, color: C.g3, marginLeft: "auto" }}>added</span>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Single logic rule card ────────────────────────────────────────────────────

const TRIGGER_COLORS = {
  ask_questions:  { bg: "#d4e2ff", color: "#001e76", border: "#c7ccff" },
  notify:         { bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
  require_action: { bg: "#ccfbf1", color: "#115e59", border: "#99f6e4" },
  require_note:   { bg: C.g1,     color: C.g5,      border: C.g2      },
  require_media:  { bg: C.g1,     color: C.g5,      border: C.g2      },
};

const COND_OP_OPTS = [
  { v: "and",  l: "AND",  title: "All conditions must match",       color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  { v: "or",   l: "OR",   title: "Any condition can match",         color: "#065f46", bg: "#ccfbf1", border: "#6ee7b7" },
  { v: "none", l: "NONE", title: "No condition may match (NOT)",    color: "#9a3412", bg: "#fff7ed", border: "#fdba74" },
];

function CondOpChip({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {COND_OP_OPTS.map(o => {
        const active = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} title={o.title}
            style={{
              padding: "2px 9px", fontSize: 10, fontWeight: 700, fontFamily: F, letterSpacing: "0.05em",
              borderRadius: 5, cursor: "pointer",
              background: active ? o.bg : "transparent",
              border: active ? `1.5px solid ${o.border}` : `1.5px solid ${C.g2}`,
              color: active ? o.color : C.g4,
            }}
          >{o.l}</button>
        );
      })}
    </div>
  );
}

function LogicRule({ rule: rawRule, answerType, onChange, onDelete, isFirst }) {
  const [expandedTrigger, setExpandedTrigger] = useState(null);
  // Normalize to multi-condition format on first render.
  const rule   = normalizeRule(rawRule, answerType);
  const kind   = rule.kind ?? (isFirst ? "if" : "else_if");
  const isElse = kind === "else";

  const ops   = ruleConditionOps(answerType);
  const vals  = ruleConditionValues(answerType);
  const isNum = answerType === "Rating Scale" || answerType === "Number";
  const existingTypes = rule.triggers.map(t => t.type);

  function set(f, v) { onChange({ ...rule, [f]: v }); }

  function setCondOp(v) { onChange({ ...rule, conditionOperator: v }); }

  function updateCond(id, patch) {
    onChange({ ...rule, conditions: rule.conditions.map(c => c.id === id ? { ...c, ...patch } : c) });
  }

  function addCond() {
    onChange({ ...rule, conditions: [...rule.conditions, emptyCondition(answerType)] });
  }

  function deleteCond(id) {
    if (rule.conditions.length <= 1) return;
    onChange({ ...rule, conditions: rule.conditions.filter(c => c.id !== id) });
  }

  function addTrigger(type) {
    const t = emptyTrigger(type);
    onChange({ ...rule, triggers: [...rule.triggers, t] });
    const hasEditor = type !== "require_note" && type !== "require_media";
    if (hasEditor) setExpandedTrigger(t.id);
  }

  function updateTrigger(id, patch) {
    onChange({ ...rule, triggers: rule.triggers.map(t => t.id === id ? { ...t, ...patch } : t) });
  }

  function deleteTrigger(id) {
    onChange({ ...rule, triggers: rule.triggers.filter(t => t.id !== id) });
    if (expandedTrigger === id) setExpandedTrigger(null);
  }

  const condOp     = rule.conditionOperator ?? "and";
  const conditions = rule.conditions ?? [];
  const condOpMeta = COND_OP_OPTS.find(o => o.v === condOp) ?? COND_OP_OPTS[0];

  return (
    <div style={{ background: C.g1, border: `1px solid ${C.g2}`, borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>

      {/* Condition area */}
      {isElse ? (
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: C.g4, fontFamily: F, fontStyle: "italic", flex: 1 }}>For anything else</span>
          <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: C.g3, display: "flex", padding: 4, borderRadius: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = C.g3}
          ><IconTrash /></button>
        </div>
      ) : (
        <div style={{ marginBottom: 10 }}>
          {/* Header row: operator chips + delete rule */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: C.g4, fontFamily: F, fontWeight: 600, letterSpacing: "0.03em" }}>
              {isFirst ? "WHEN" : "AND WHEN"}
            </span>
            {conditions.length > 1 && (
              <CondOpChip value={condOp} onChange={setCondOp} />
            )}
            <span style={{ fontSize: 11, color: C.g4, fontFamily: F }}>of these conditions match:</span>
            <button onClick={onDelete} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: C.g3, display: "flex", padding: 4, borderRadius: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = C.g3}
            ><IconTrash /></button>
          </div>

          {/* Condition rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {conditions.map((cond, ci) => (
              <div key={cond.id} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                {/* Connector label between rows */}
                {ci > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, fontFamily: F, letterSpacing: "0.05em",
                    padding: "1px 6px", borderRadius: 4,
                    background: condOpMeta.bg, color: condOpMeta.color, border: `1px solid ${condOpMeta.border}`,
                    flexShrink: 0,
                  }}>{condOpMeta.l}</span>
                )}
                <span style={{ fontSize: 12, color: C.g5, fontFamily: F, flexShrink: 0 }}>
                  {ci === 0 ? "Answer" : "answer"}
                </span>
                <select value={cond.operator} onChange={e => updateCond(cond.id, { operator: e.target.value })} style={{ ...selectStyle(), width: "auto" }}>
                  {ops.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                {vals ? (
                  <select value={cond.value ?? ""} onChange={e => updateCond(cond.id, { value: e.target.value })} style={{ ...selectStyle(), width: "auto" }}>
                    {vals.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                ) : (
                  <FocusInput value={cond.value ?? ""} onChange={e => updateCond(cond.id, { value: e.target.value })}
                    type={isNum ? "number" : "text"} placeholder="value…" style={{ width: 110 }} />
                )}
                {conditions.length > 1 && (
                  <button onClick={() => deleteCond(cond.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g3, display: "flex", padding: 2, borderRadius: 4 }}
                    onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = C.g3}
                  ><IconTrash /></button>
                )}
              </div>
            ))}
          </div>

          {/* Add condition + operator selector (shown after first condition) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <button onClick={addCond}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: `1px dashed ${C.g3}`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600, fontFamily: F, color: C.g4, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
            ><IconPlus size={10} /> Add condition</button>
            {conditions.length > 1 && (
              <span style={{ fontSize: 11, color: C.g3, fontFamily: F }}>matching operator: <strong style={{ color: condOpMeta.color }}>{condOpMeta.l}</strong></span>
            )}
          </div>
        </div>
      )}

      {/* Triggers */}
      {rule.triggers.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10, paddingLeft: 2 }}>
          {rule.triggers.map(trigger => {
            const col = TRIGGER_COLORS[trigger.type] ?? { bg: C.g1, color: C.g5, border: C.g2 };
            const isExpanded = expandedTrigger === trigger.id;
            const hasEditor  = trigger.type !== "require_note" && trigger.type !== "require_media";
            const summary    = triggerSummary(trigger);
            return (
              <div key={trigger.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    onClick={() => hasEditor && setExpandedTrigger(isExpanded ? null : trigger.id)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "4px 10px", borderRadius: 6,
                      background: col.bg, border: `1px solid ${col.border}`,
                      color: col.color, fontSize: 12, fontFamily: F, fontWeight: 500,
                      cursor: hasEditor ? "pointer" : "default",
                    }}
                  >
                    <TriggerIcon type={trigger.type} size={12} />
                    {TRIGGER_MENU.find(m => m.type === trigger.type)?.label}
                    {summary && <span style={{ opacity: 0.7 }}>{summary}</span>}
                    {hasEditor && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {isExpanded ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                      </svg>
                    )}
                  </button>
                  <button onClick={() => deleteTrigger(trigger.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: C.g3, display: "flex", padding: 2, borderRadius: 4 }}
                    onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = C.g3}
                  ><IconTrash /></button>
                </div>

                {isExpanded && hasEditor && (
                  <div style={{ marginTop: 6, marginLeft: 8, padding: "12px 14px", background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8 }}>
                    {trigger.type === "ask_questions"  && <AskQuestionsEditor  trigger={trigger} onChange={p => updateTrigger(trigger.id, p)} />}
                    {trigger.type === "notify"          && <NotifyEditor        trigger={trigger} onChange={p => updateTrigger(trigger.id, p)} />}
                    {trigger.type === "require_action"  && <RequireActionEditor trigger={trigger} onChange={p => updateTrigger(trigger.id, p)} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddTriggerMenu onSelect={addTrigger} existingTypes={existingTypes} />
    </div>
  );
}

// ── Logic panel (tab per rule) ────────────────────────────────────────────────

function ruleTabLabel(rule, idx, answerType) {
  const kind = rule.kind ?? (idx === 0 ? "if" : "else_if");
  if (kind === "else") return "Otherwise";
  const ops    = ruleConditionOps(answerType);
  // Support both old (operator/value) and new (conditions[]) formats.
  const firstCond = rule.conditions?.[0] ?? { operator: rule.operator, value: rule.value };
  const op     = ops.find(o => o.v === firstCond.operator);
  const val    = firstCond.value ? ` ${firstCond.value}` : "";
  const prefix = idx === 0 ? "When" : "Or when";
  const extra  = (rule.conditions?.length ?? 1) > 1 ? ` +${rule.conditions.length - 1}` : "";
  return `${prefix} ${op?.l ?? "answer"}${val}${extra}`;
}

function LogicPanel({ logic, answerType, onChange }) {
  const rules = logic?.rules ?? [];
  const [activeIdx, setActiveIdx] = useState(0);
  const hasElse = rules.some(r => (r.kind ?? "else_if") === "else");

  function addRule() {
    const newRule = emptyLogicRule(answerType, "else_if");
    const elseIdx = rules.findIndex(existing => (existing.kind ?? "else_if") === "else");
    const newRules = elseIdx >= 0
      ? [...rules.slice(0, elseIdx), newRule, ...rules.slice(elseIdx)]
      : [...rules, newRule];
    onChange({ ...logic, rules: newRules });
    setActiveIdx(elseIdx >= 0 ? elseIdx : rules.length);
  }

  function addElse() {
    onChange({ ...logic, rules: [...rules, emptyLogicRule(answerType, "else")] });
    setActiveIdx(rules.length);
  }

  function updateRule(idx, patch) {
    onChange({ ...logic, rules: rules.map((r, i) => i === idx ? { ...r, ...patch } : r) });
  }

  function deleteRule(idx) {
    let next = rules.filter((_, i) => i !== idx);
    if (idx === 0 && next.length > 0) {
      next = [{ ...next[0], kind: "if" }, ...next.slice(1)];
    }
    onChange({ ...logic, rules: next });
    setActiveIdx(i => Math.min(i, Math.max(next.length - 1, 0)));
  }

  if (rules.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "28px 0" }}>
        <div style={{ fontSize: 12, color: C.g4, fontFamily: F, marginBottom: 12 }}>
          No logic configured. Add a rule to trigger actions based on this question's answer.
        </div>
        <button
          onClick={() => onChange({ ...logic, rules: [emptyLogicRule(answerType, "if")] })}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.navy, color: C.white, border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 600, fontFamily: F, cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = C.navy2} onMouseLeave={e => e.currentTarget.style.background = C.navy}
        ><IconPlus size={12} /> Add rule</button>
      </div>
    );
  }

  const active = Math.min(activeIdx, rules.length - 1);

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${C.g2}`, marginBottom: 14, overflowX: "auto" }}>
        {rules.map((rule, idx) => (
          <button key={rule.id} onClick={() => setActiveIdx(idx)}
            style={{
              padding: "7px 13px", fontSize: 12, fontFamily: F, fontWeight: idx === active ? 600 : 400,
              background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap",
              color: idx === active ? C.navy : C.g4,
              borderBottom: idx === active ? `2px solid ${C.navy}` : "2px solid transparent",
              marginBottom: -1, flexShrink: 0,
            }}
          >{ruleTabLabel(rule, idx, answerType)}</button>
        ))}
        <button onClick={addRule} title="Add another rule"
          style={{ padding: "7px 10px", color: C.g4, background: "none", border: "none", cursor: "pointer", marginBottom: -1, display: "flex", alignItems: "center", flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = C.navy} onMouseLeave={e => e.currentTarget.style.color = C.g4}
        ><IconPlus size={11} /></button>
        {!hasElse && (
          <button onClick={addElse} title="Handle any answer not already covered"
            style={{
              padding: "4px 9px", marginLeft: 2, marginBottom: -1,
              fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", fontFamily: F,
              color: C.g4, background: "none",
              border: `1px dashed ${C.g3}`, borderBottom: "none",
              borderRadius: "4px 4px 0 0", cursor: "pointer", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.g6; e.currentTarget.style.borderColor = C.g4; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
          >+ Otherwise</button>
        )}
      </div>

      {/* Active rule */}
      <LogicRule
        key={rules[active].id}
        rule={rules[active]}
        answerType={answerType}
        isFirst={active === 0}
        onChange={patch => updateRule(active, patch)}
        onDelete={() => deleteRule(active)}
      />
    </div>
  );
}

// ── Main QuestionEditor ───────────────────────────────────────────────────────

export default function QuestionEditor({ question, isNew, methodology, sectionName, onSave, onClose }) {
  // Panel 1 state (merged). New questions start with empty answer type so the
  // dropdown shows a placeholder rather than a pre-selected default.
  const [panel1, setPanel1] = useState({
    answerType:      question.answerType             ?? "",
    required:        question.required               ?? false,
    critical:        question.critical               ?? false,
    informational:   question.informational          ?? false,
    allowAttachment: question.media?.allowAttachment ?? false,
    instructions:    question.instructions           ?? "",
    typeConfig:      question.typeConfig             ?? {},
  });

  const [title, setTitle]   = useState(question.title ?? "");
  const [inBank, setInBank] = useState(question.inBank ?? false);
  const [logic, setLogic]   = useState(question.logic ?? { rules: [] });

  const [titleError, setTitleError] = useState(false);
  const [isDirty, setIsDirty]       = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [helpOpen, setHelpOpen]     = useState(false);
  const [logicHelpOpen, setLogicHelpOpen] = useState(false);
  const helpRef = useRef(null);

  const titleRef = useRef(null);

  useEffect(() => {
    if (isNew && titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  // Close the help popover on click outside.
  useEffect(() => {
    if (!helpOpen) return;
    function handleOutside(e) {
      if (helpRef.current && !helpRef.current.contains(e.target)) {
        setHelpOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [helpOpen]);

  // Auto-resize the title textarea height so wrapped lines stay visible.
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [title]);

  // Mark dirty on any change
  function markDirty() { setIsDirty(true); }

  function handleSave() {
    if (!title.trim()) { setTitleError(true); titleRef.current?.focus(); return; }
    if (!panel1.answerType) { return; }
    const patch = {
      title: title.trim(),
      answerType:    panel1.answerType,
      required:      panel1.required,
      instructions:  panel1.instructions,
      typeConfig:    panel1.typeConfig,
      inBank,
      media: { allowAttachment: panel1.allowAttachment },
      logic,
      critical:      panel1.critical,
      informational: panel1.informational,
      scoring: question.scoring,
    };
    onSave(patch);
  }

  function handleCancelClick() {
    if (isDirty) {
      setShowDiscard(true);
    } else {
      onClose();
    }
  }

  const canSave = title.trim().length > 0 && !!panel1.answerType;
  const ansTypeMeta_ = ansTypeMeta(panel1.answerType);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", fontFamily: F, background: C.white }}>

      {/* Sticky header */}
      <div style={{ borderBottom: `1px solid ${C.g2}`, background: C.white, position: "sticky", top: 0, zIndex: 10 }}>

        {/* Nav + page title row */}
        <div style={{ padding: "12px 24px 10px", display: "flex", alignItems: "center" }}>
          {/* Left: back + section name */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleCancelClick}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.g2}`, background: C.white, cursor: "pointer", color: C.g5, flexShrink: 0, transition: "background 0.1s, border-color 0.1s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.g1; e.currentTarget.style.borderColor = C.g3; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.g2; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span style={{ fontSize: 13, color: C.g5, fontFamily: F, fontWeight: 500 }}>{sectionName || "Questions"}</span>
          </div>

          {/* Center: page title */}
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: C.g4, fontFamily: F }}>
            {isNew ? "New Question" : "Edit Question"}
          </span>

          {/* Right: help button (balances left side visually) */}
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <div ref={helpRef} style={{ position: "relative" }}>
              <button
                onClick={() => setHelpOpen(o => !o)}
                title="What is this?"
                style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: helpOpen ? "#eef1ff" : "none", color: helpOpen ? C.navy : C.g4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.12s, color 0.12s" }}
                onMouseEnter={e => { if (!helpOpen) { e.currentTarget.style.background = C.g1; e.currentTarget.style.color = C.g6; } }}
                onMouseLeave={e => { if (!helpOpen) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.g4; } }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </button>
              {helpOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50, width: 320, background: C.white, border: `1px solid ${C.g2}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "12px 14px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: F, marginBottom: 4 }}>Configure this question</div>
                  <div style={{ fontSize: 12, color: C.g5, fontFamily: F, lineHeight: "17px" }}>Set the answer type, whether it&rsquo;s required, and add instructions for auditors. Use the Logic panel to trigger follow-up questions, notifications, actions, or required media based on this question&rsquo;s answer.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Question title row */}
        <div style={{ padding: "0 24px 14px", display: "flex", alignItems: "flex-start", gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 5 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <textarea
            ref={titleRef}
            value={title}
            onChange={e => { setTitle(e.target.value); setTitleError(false); markDirty(); }}
            onKeyDown={e => { if (e.key === "Enter") e.preventDefault(); }}
            placeholder="Question text…"
            rows={1}
            style={{
              flex: 1,
              fontFamily: F,
              fontSize: 18,
              fontWeight: 600,
              color: C.g6,
              background: "transparent",
              border: "none",
              outline: "none",
              borderBottom: titleError ? `2px solid ${C.red}` : `2px solid transparent`,
              padding: "2px 0",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
              resize: "none",
              overflow: "hidden",
              lineHeight: "26px",
              display: "block",
              minWidth: 0,
            }}
            onFocus={e => { if (!titleError) e.currentTarget.style.borderBottomColor = C.navy; }}
            onBlur={e => { if (!titleError) e.currentTarget.style.borderBottomColor = "transparent"; }}
          />
          <button
            onClick={() => titleRef.current?.focus()}
            tabIndex={-1}
            style={{ background: "none", border: "none", cursor: "text", color: C.g3, padding: "5px 2px", flexShrink: 0, display: "flex", alignItems: "center" }}
            onMouseEnter={e => e.currentTarget.style.color = C.g5}
            onMouseLeave={e => e.currentTarget.style.color = C.g3}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          {titleError && (
            <div style={{ fontSize: 12, color: C.red, fontFamily: F, marginTop: 30 }}>Question text is required.</div>
          )}
        </div>

        {/* Discard confirmation row */}
        {showDiscard && (
          <div style={{ margin: "0 24px 12px", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: "#fae5e6", borderRadius: 8, border: `1px solid #fca5a5` }}>
              <span style={{ flex: 1, fontSize: 13, color: C.red, fontFamily: F }}>Discard changes?</span>
              <button onClick={onClose}
                style={{ background: C.red, color: C.white, border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, fontFamily: F, cursor: "pointer" }}
              >Discard</button>
              <button onClick={() => setShowDiscard(false)}
                style={{ background: "none", border: `1px solid ${C.g3}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer" }}
              >Keep editing</button>
          </div>
        )}

      </div>{/* /header */}

      {/* Panel body */}
      <div style={{ flex: 1, background: C.g1 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 32px 40px" }}>

          <Section title="Question Configuration">
            <Panel1Body
              state={panel1}
              onChange={s => { setPanel1(s); markDirty(); }}
            />
          </Section>

          <Section title="Question Logic" action={
            <button onClick={() => setLogicHelpOpen(true)}
              title="How does question logic work?"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${C.g2}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, fontFamily: F, color: C.g4, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g2; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              How logic works
            </button>
          }>
            <LogicPanel
              logic={logic}
              answerType={panel1.answerType}
              onChange={l => { setLogic(l); markDirty(); }}
            />
          </Section>

          {logicHelpOpen && <LogicHelpModal onClose={() => setLogicHelpOpen(false)} />}
        </div>
      </div>{/* /body */}

      {/* Sticky footer */}
      <div style={{
          padding: "12px 24px",
          borderTop: `1px solid ${C.g2}`,
          background: C.white,
          display: "flex",
          alignItems: "center",
          gap: 10,
          position: "sticky",
          bottom: 0,
          zIndex: 10,
        }}>
          {/* Add to Catalog toggle (left) */}
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <span style={{ display: "flex", color: inBank ? C.navy : C.g4 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </span>
            <Toggle checked={inBank} onChange={() => { setInBank(b => !b); markDirty(); }} />
            <span style={{ fontSize: 13, color: C.g5, fontFamily: F, whiteSpace: "nowrap" }}>Add to Catalog</span>
          </label>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Cancel + Save (right) */}
          <button
            onClick={handleCancelClick}
            style={{
              background: "none",
              border: `1px solid ${C.g3}`,
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: F,
              color: C.g5,
              cursor: "pointer",
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.g1}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >Cancel</button>

          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              background: canSave ? C.navy : C.g2,
              color: canSave ? C.white : C.g4,
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: F,
              cursor: canSave ? "pointer" : "not-allowed",
              flexShrink: 0,
            }}
            onMouseEnter={e => { if (canSave) e.currentTarget.style.background = C.navy2; }}
            onMouseLeave={e => { if (canSave) e.currentTarget.style.background = C.navy; }}
          >{isNew ? "Add question" : "Save changes"}</button>
      </div>{/* /footer */}
    </div>
  );
}
