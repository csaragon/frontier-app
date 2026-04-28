import { useState, useRef, useEffect, useCallback } from "react";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy: "#001e76", navy2: "#001356",
  ocean: "#2226f7",
  white: "#ffffff",
  g1: "#f4f4f6", g2: "#e2e5e9", g3: "#c3c8d0", g4: "#8692a2", g5: "#555f6d", g6: "#16191d",
  amber: "#b45309", amberBg: "#fffbeb",
  red: "#b6143a",
  teal: "#0f766e",
  purple: "#7c3aed",
};

const ANSWER_TYPES = [
  { value: "Yes/No/NA",       bg: "#ecfdf5", color: "#065f46" },
  { value: "Yes/No",          bg: "#eff6ff", color: "#1d4ed8" },
  { value: "Pass/Fail",       bg: "#fff7ed", color: "#9a3412" },
  { value: "Rating Scale",    bg: "#faf5ff", color: "#6d28d9" },
  { value: "Free Text",       bg: "#f9fafb", color: "#374151" },
  { value: "Number",          bg: "#f0fdfa", color: "#0f766e" },
  { value: "Multiple Choice", bg: "#fefce8", color: "#92400e" },
  { value: "Grid",            bg: "#f0f2ff", color: "#1e40af" },
  { value: "Asset",           bg: "#fff1f2", color: "#9f1239" },
  { value: "Photo Required",  bg: "#ecfeff", color: "#0e7490" },
];

function ansTypeMeta(v) {
  return ANSWER_TYPES.find(t => t.value === v) ?? ANSWER_TYPES[4];
}

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
      fontSize: 11, fontWeight: 600, fontFamily: F,
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
    borderRadius: 7, padding: "7px 10px", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };
}

function selectStyle() {
  return {
    width: "100%", fontFamily: F, fontSize: 13, color: C.g6,
    background: C.white, border: `1px solid ${C.g2}`,
    borderRadius: 7, padding: "7px 10px", outline: "none", cursor: "pointer",
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
    <div style={{ marginBottom: 5 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.g5, fontFamily: F }}>{children}</div>
      {helper && <div style={{ fontSize: 11, color: C.g4, fontFamily: F, marginTop: 2, lineHeight: "15px" }}>{helper}</div>}
    </div>
  );
}

// ── Panel shell ───────────────────────────────────────────────────────────────

function Panel({ title, statusText, open, onToggle, children }) {
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(open ? "auto" : "0px");
  const [overflow, setOverflow] = useState(open ? "visible" : "hidden");

  useEffect(() => {
    if (open) {
      if (bodyRef.current) {
        setHeight(bodyRef.current.scrollHeight + "px");
        setOverflow("hidden");
        const t = setTimeout(() => { setHeight("auto"); setOverflow("visible"); }, 220);
        return () => clearTimeout(t);
      }
    } else {
      if (bodyRef.current) {
        setHeight(bodyRef.current.scrollHeight + "px");
        setOverflow("hidden");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => { setHeight("0px"); });
        });
      }
    }
  }, [open]);

  return (
    <div style={{ border: `1px solid ${C.g2}`, borderRadius: 10, marginBottom: 12, overflow: "visible" }}>
      <button
        onClick={onToggle}
        style={{
          display: "flex", width: "100%", alignItems: "center", gap: 8,
          background: open ? C.white : C.g1, border: "none", cursor: "pointer",
          padding: "11px 14px", borderRadius: open ? "10px 10px 0 0" : 10,
          textAlign: "left", transition: "background 0.15s",
        }}
      >
        <span style={{ color: C.g4, display: "flex", alignItems: "center", flexShrink: 0 }}>
          <IconCaret open={open} />
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.g6, fontFamily: F, flex: 1 }}>{title}</span>
        {!open && statusText && (
          <span style={{ fontSize: 11, color: C.g4, fontFamily: F, fontWeight: 500 }}>{statusText}</span>
        )}
      </button>
      <div
        ref={bodyRef}
        style={{
          height, overflow,
          transition: "height 0.2s ease",
        }}
      >
        {open && (
          <div style={{ padding: "14px 16px 16px", borderTop: `1px solid ${C.g2}` }}>
            {children}
          </div>
        )}
      </div>
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

function GridConfig({ config, onChange }) {
  const rows = config.rows ?? ["Row 1"];
  const cols = config.cols ?? ["Col 1"];
  const cellType = config.cellType ?? "Yes/No";

  function updateRow(idx, val) { const n = [...rows]; n[idx] = val; onChange({ ...config, rows: n }); }
  function addRow() { onChange({ ...config, rows: [...rows, `Row ${rows.length + 1}`] }); }
  function removeRow(idx) { if (rows.length <= 1) return; onChange({ ...config, rows: rows.filter((_, i) => i !== idx) }); }

  function updateCol(idx, val) { const n = [...cols]; n[idx] = val; onChange({ ...config, cols: n }); }
  function addCol() { onChange({ ...config, cols: [...cols, `Col ${cols.length + 1}`] }); }
  function removeCol(idx) { if (cols.length <= 1) return; onChange({ ...config, cols: cols.filter((_, i) => i !== idx) }); }

  return (
    <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <Label>Row labels</Label>
        {rows.map((r, idx) => (
          <div key={idx} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
            <FocusInput value={r} onChange={e => updateRow(idx, e.target.value)} placeholder={`Row ${idx + 1}`} />
            <button onClick={() => removeRow(idx)} disabled={rows.length <= 1}
              style={{ background: "none", border: `1px solid ${C.g2}`, borderRadius: 5, padding: "3px 7px", cursor: rows.length > 1 ? "pointer" : "not-allowed", color: rows.length > 1 ? C.red : C.g3, flexShrink: 0, display: "flex", alignItems: "center" }}>
              <IconTrash />
            </button>
          </div>
        ))}
        <button onClick={addRow}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px dashed ${C.g3}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.g4, fontFamily: F, cursor: "pointer", width: "100%" }}
          onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
        ><IconPlus size={11} /> Add row</button>
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <Label>Column labels</Label>
        {cols.map((c, idx) => (
          <div key={idx} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
            <FocusInput value={c} onChange={e => updateCol(idx, e.target.value)} placeholder={`Col ${idx + 1}`} />
            <button onClick={() => removeCol(idx)} disabled={cols.length <= 1}
              style={{ background: "none", border: `1px solid ${C.g2}`, borderRadius: 5, padding: "3px 7px", cursor: cols.length > 1 ? "pointer" : "not-allowed", color: cols.length > 1 ? C.red : C.g3, flexShrink: 0, display: "flex", alignItems: "center" }}>
              <IconTrash />
            </button>
          </div>
        ))}
        <button onClick={addCol}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px dashed ${C.g3}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: C.g4, fontFamily: F, cursor: "pointer", width: "100%" }}
          onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
        ><IconPlus size={11} /> Add column</button>
      </div>
      <div style={{ width: "100%" }}>
        <Label>Cell answer type</Label>
        <select value={cellType} onChange={e => onChange({ ...config, cellType: e.target.value })} style={selectStyle()}>
          <option value="Yes/No">Yes / No</option>
          <option value="Pass/Fail">Pass / Fail</option>
          <option value="Rating Scale">Rating</option>
        </select>
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
        <select value={config.category ?? "General"} onChange={e => onChange({ ...config, category: e.target.value })} style={selectStyle()}>
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

// Simple rich-text instructions editor using execCommand
function InstructionsEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = value ?? "";
      initialized.current = true;
    }
  }, []);

  function exec(cmd) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, null);
  }

  function handleInput() {
    onChange(editorRef.current?.innerHTML ?? "");
  }

  const toolBtn = (cmd, label) => (
    <button
      key={cmd}
      onMouseDown={e => { e.preventDefault(); exec(cmd); }}
      title={cmd}
      style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "3px 7px", borderRadius: 4, fontSize: 12, fontFamily: F,
        color: C.g5, fontWeight: cmd === "bold" ? 700 : cmd === "italic" ? 600 : 500,
        fontStyle: cmd === "italic" ? "italic" : "normal",
        textDecoration: cmd === "underline" ? "underline" : "none",
      }}
      onMouseEnter={e => e.currentTarget.style.background = C.g2}
      onMouseLeave={e => e.currentTarget.style.background = "none"}
    >{label}</button>
  );

  return (
    <div>
      <div style={{
        border: `1px solid ${focused ? C.navy : C.g2}`, borderRadius: 7, overflow: "hidden",
        transition: "border-color 0.15s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "4px 8px", borderBottom: `1px solid ${C.g2}`, background: C.g1 }}>
          {toolBtn("bold", "B")}
          {toolBtn("italic", "I")}
          {toolBtn("underline", "U")}
          <button
            onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }}
            title="Bullet list"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 7px", borderRadius: 4, fontSize: 12, fontFamily: F, color: C.g5 }}
            onMouseEnter={e => e.currentTarget.style.background = C.g2}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >• List</button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            minHeight: 70, padding: "8px 10px", fontSize: 13, fontFamily: F, color: C.g6,
            outline: "none", lineHeight: "19px",
          }}
          data-placeholder="Optional. Shown to auditors below the question."
        />
      </div>
      <style>{`[contenteditable]:empty:before { content: attr(data-placeholder); color: ${C.g4}; pointer-events: none; }`}</style>
    </div>
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
  const { answerType, required, critical, informational, instructions, typeConfig } = state;

  function setField(field, val) { onChange({ ...state, [field]: val }); }

  function handleRequired() {
    const next = !required;
    onChange({ ...state, required: next, informational: next ? false : informational });
  }
  function handleInformational() {
    const next = !informational;
    onChange({ ...state, informational: next, required: next ? false : required });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Label>Answer type <span style={{ color: C.red }}>*</span></Label>
        <select value={answerType} onChange={e => onChange({ ...state, answerType: e.target.value, typeConfig: {} })} style={selectStyle()}>
          {ANSWER_TYPES.map(t => <option key={t.value} value={t.value}>{t.value}</option>)}
        </select>
        <TypeConfig answerType={answerType} config={typeConfig ?? {}} onChange={tc => setField("typeConfig", tc)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
          <Checkbox checked={required} onChange={handleRequired} />
          Required
        </label>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
            <Checkbox checked={critical} onChange={() => setField("critical", !critical)} />
            Critical
          </label>
          <div style={{ fontSize: 11, color: C.g4, fontFamily: F, marginTop: 3, marginLeft: 23, lineHeight: "15px" }}>
            Critical questions can fail the entire audit if configured on the Scoring step.
          </div>
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
            <Checkbox checked={informational} onChange={handleInformational} />
            Informational only
          </label>
          <div style={{ fontSize: 11, color: C.g4, fontFamily: F, marginTop: 3, marginLeft: 23, lineHeight: "15px" }}>
            When checked, this question is excluded from all scoring calculations.
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

function Panel2Body({ scoring, methodology, onChange }) {
  const m = methodology ?? "points";

  function setField(f, v) { onChange({ ...scoring, [f]: v }); }

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

// ── Panel 3: Media ────────────────────────────────────────────────────────────

function Panel3Body({ media, onChange }) {
  const allow = media?.allowAttachment ?? false;
  const requireOnFail = media?.requireOnFail ?? false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
        <Toggle checked={allow} onChange={() => onChange({ ...media, allowAttachment: !allow, requireOnFail: !allow ? requireOnFail : false })} />
        Allow photo / media attachment
      </label>
      <div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: allow ? "pointer" : "default", fontSize: 13, color: allow ? C.g5 : C.g3, fontFamily: F, opacity: allow ? 1 : 0.5 }}>
          <Toggle checked={requireOnFail} onChange={allow ? () => onChange({ ...media, requireOnFail: !requireOnFail }) : undefined} disabled={!allow} />
          Require photo on fail
        </label>
        <div style={{ fontSize: 11, color: C.g4, fontFamily: F, marginTop: 3, marginLeft: 40, lineHeight: "15px" }}>
          When required on fail, auditors must attach evidence before submitting a failing answer.
        </div>
      </div>
    </div>
  );
}

function mediaStatus(media) {
  if (!media?.allowAttachment) return "Not allowed";
  if (media?.requireOnFail) return "Required on fail";
  return "Optional";
}

// ── Panel 4: Actions ──────────────────────────────────────────────────────────

const ASSIGNEE_ROLES = ["Store Manager", "Department Lead", "Operations Manager", "Asset Protection Lead", "District Manager"];

function triggerOptions(answerType) {
  switch (answerType) {
    case "Yes/No/NA":       return [{ v: "no", l: "No" }, { v: "na", l: "NA" }, { v: "non-yes", l: "Any non-Yes" }];
    case "Yes/No":          return [{ v: "no", l: "No" }];
    case "Pass/Fail":       return [{ v: "fail", l: "Fails" }];
    case "Rating Scale":    return [{ v: "below3", l: "Below 3" }, { v: "below2", l: "Below 2" }, { v: "eq1", l: "Equals 1" }, { v: "custom", l: "Below threshold (custom)" }];
    case "Free Text":       return [{ v: "any", l: "Any answer" }, { v: "keyword", l: "Contains keyword (custom)" }];
    case "Multiple Choice": return [{ v: "specific", l: "Specific option selected (custom)" }];
    default:                return [{ v: "fail", l: "Failed answer" }];
  }
}

function Panel4Body({ action, answerType, onChange }) {
  const type = action?.type ?? "none";
  const showAuto = type === "auto" || type === "both";
  const showFreeform = type === "freeform" || type === "both";
  const triggerOpts = triggerOptions(answerType);
  const trigger = action?.trigger ?? triggerOpts[0]?.v ?? "fail";
  const needsCustom = trigger === "custom" || trigger === "keyword" || trigger === "specific";

  function setField(f, v) { onChange({ ...action, [f]: v }); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Label>Action type</Label>
        <select value={type} onChange={e => setField("type", e.target.value)} style={selectStyle()}>
          <option value="none">None</option>
          <option value="auto">Auto-create action plan</option>
          <option value="freeform">Free-form action prompt</option>
          <option value="both">Both</option>
        </select>
      </div>

      {(showAuto || showFreeform) && (
        <div>
          <Label>Trigger condition — if answer is…</Label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select value={trigger} onChange={e => setField("trigger", e.target.value)} style={{ ...selectStyle(), flex: 1 }}>
              {triggerOpts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            {needsCustom && (
              <FocusInput
                value={action?.triggerCustomValue ?? ""}
                onChange={e => setField("triggerCustomValue", e.target.value)}
                placeholder={trigger === "keyword" ? "Keyword…" : trigger === "specific" ? "Option text…" : "Threshold value…"}
                style={{ flex: 1 }}
              />
            )}
          </div>
        </div>
      )}

      {showAuto && (
        <>
          <div>
            <Label>Predefined action title <span style={{ color: C.red }}>*</span></Label>
            <FocusInput value={action?.actionTitle ?? ""} onChange={e => setField("actionTitle", e.target.value)} placeholder="e.g. Fix fire extinguisher mounting" />
          </div>
          <div>
            <Label>Description</Label>
            <FocusTextarea value={action?.description ?? ""} onChange={e => setField("description", e.target.value)} placeholder="Describe what the assignee should do…" rows={3} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Label>Default assignee role</Label>
              <select value={action?.assigneeRole ?? ""} onChange={e => setField("assigneeRole", e.target.value)} style={selectStyle()}>
                <option value="">— Select role —</option>
                {ASSIGNEE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ width: 140 }}>
              <Label>Due (days from audit)</Label>
              <FocusInput type="number" value={action?.dueDays ?? 7} onChange={e => setField("dueDays", e.target.value)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function actionStatus(action) {
  const t = action?.type;
  if (!t || t === "none") return "None";
  if (t === "auto") return `Auto · ${(action?.actionTitle ?? "").slice(0, 20) || "—"}`;
  if (t === "freeform") return "Free-form";
  return "Auto + free-form";
}

// ── Panel 5: Escalation ───────────────────────────────────────────────────────

const STUB_USERS = [
  { id: "u1", name: "Alex Chen" },
  { id: "u2", name: "Maria Rodriguez" },
  { id: "u3", name: "James Okafor" },
  { id: "u4", name: "Sarah Kim" },
  { id: "u5", name: "David Patel" },
];

const ROLE_OPTIONS    = ["Store Manager", "Asset Protection Lead", "Operations Manager", "Department Lead", "District Manager"];
const GROUP_OPTIONS   = ["All Store Managers — Southeast", "Regional LP Team", "Q1 Audit Crew"];
const ESC_TRIGGERS    = [
  { v: "fail",     l: "Failed answer" },
  { v: "critical", l: "Critical question failure" },
  { v: "specific", l: "Specific answer match" },
  { v: "score",    l: "Score below threshold" },
];

function emptyRule() {
  return {
    id: genId("rule"),
    trigger: "fail",
    triggerValue: "",
    recipientType: "role",
    recipientValue: ROLE_OPTIONS[0],
    channels: { email: true, inApp: true },
    message: "",
    selectedUsers: [],
  };
}

function EscalationRuleEditor({ rule, isCritical, onSave, onCancel }) {
  const [r, setR] = useState({ ...rule });

  function setField(f, v) { setR(prev => ({ ...prev, [f]: v })); }

  const needsTriggerVal = r.trigger === "specific" || r.trigger === "score";

  return (
    <div style={{ background: C.g1, border: `1px solid ${C.g2}`, borderRadius: 8, padding: 14, marginTop: 8, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Trigger */}
      <div>
        <Label>Trigger</Label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={r.trigger} onChange={e => setField("trigger", e.target.value)} style={{ ...selectStyle(), flex: 1 }}>
            {ESC_TRIGGERS.map(t => (
              <option key={t.v} value={t.v} disabled={t.v === "critical" && !isCritical}>
                {t.l}{t.v === "critical" && !isCritical ? " (mark question as Critical first)" : ""}
              </option>
            ))}
          </select>
          {needsTriggerVal && (
            <FocusInput
              value={r.triggerValue}
              onChange={e => setField("triggerValue", e.target.value)}
              placeholder={r.trigger === "score" ? "e.g. 3" : "Match value…"}
              style={{ flex: 1 }}
            />
          )}
        </div>
      </div>

      {/* Recipient */}
      <div>
        <Label>Recipient</Label>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          {["Specific user", "Role", "Group"].map(rt => (
            <button key={rt}
              onClick={() => setField("recipientType", rt === "Specific user" ? "user" : rt.toLowerCase())}
              style={{
                padding: "5px 12px", fontSize: 12, fontWeight: 600, fontFamily: F,
                borderRadius: 6, border: `1px solid ${C.g2}`, cursor: "pointer",
                background: r.recipientType === (rt === "Specific user" ? "user" : rt.toLowerCase()) ? C.navy : C.white,
                color: r.recipientType === (rt === "Specific user" ? "user" : rt.toLowerCase()) ? C.white : C.g5,
              }}
            >{rt}</button>
          ))}
        </div>
        {r.recipientType === "user" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {STUB_USERS.map(u => (
              <label key={u.id} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
                <Checkbox
                  checked={(r.selectedUsers ?? []).includes(u.id)}
                  onChange={() => {
                    const sel = r.selectedUsers ?? [];
                    setField("selectedUsers", sel.includes(u.id) ? sel.filter(x => x !== u.id) : [...sel, u.id]);
                  }}
                />
                {u.name}
              </label>
            ))}
          </div>
        )}
        {r.recipientType === "role" && (
          <select value={r.recipientValue} onChange={e => setField("recipientValue", e.target.value)} style={selectStyle()}>
            {ROLE_OPTIONS.map(ro => <option key={ro} value={ro}>{ro}</option>)}
          </select>
        )}
        {r.recipientType === "group" && (
          <select value={r.recipientValue} onChange={e => setField("recipientValue", e.target.value)} style={selectStyle()}>
            {GROUP_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        )}
      </div>

      {/* Channels */}
      <div>
        <Label>Channels</Label>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
            <Checkbox checked={r.channels?.email ?? true} onChange={() => setField("channels", { ...r.channels, email: !(r.channels?.email ?? true) })} />
            Email
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: C.g5, fontFamily: F }}>
            <Checkbox checked={r.channels?.inApp ?? true} onChange={() => setField("channels", { ...r.channels, inApp: !(r.channels?.inApp ?? true) })} />
            In-app
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "not-allowed", fontSize: 13, color: C.g3, fontFamily: F }}>
            <Checkbox checked={false} disabled />
            SMS <span style={{ fontSize: 11, marginLeft: 4, color: C.g4 }}>Coming soon</span>
          </label>
        </div>
      </div>

      {/* Custom message */}
      <div>
        <Label>Custom message (optional)</Label>
        <FocusTextarea value={r.message} onChange={e => setField("message", e.target.value)} placeholder="Leave blank to use the default notification message…" rows={2} />
      </div>

      {/* Footer */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onCancel}
          style={{ background: "none", border: `1px solid ${C.g3}`, borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = C.g1} onMouseLeave={e => e.currentTarget.style.background = "none"}
        >Cancel</button>
        <button onClick={() => onSave(r)}
          style={{ background: C.navy, color: C.white, border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, fontFamily: F, cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = C.navy2} onMouseLeave={e => e.currentTarget.style.background = C.navy}
        >Save rule</button>
      </div>
    </div>
  );
}

function ruleLabel(rule) {
  const trigger = ESC_TRIGGERS.find(t => t.v === rule.trigger)?.l ?? rule.trigger;
  const recip = rule.recipientType === "user"
    ? `${(rule.selectedUsers?.length ?? 0)} user(s)`
    : rule.recipientValue ?? "—";
  return `${trigger} → ${recip}`;
}

function Panel5Body({ escalation, isCritical, onChange }) {
  const rules = escalation?.rules ?? [];
  const [editingIdx, setEditingIdx] = useState(null); // null = not editing; -1 = new
  const [editingRule, setEditingRule] = useState(null);

  function startAdd() { setEditingIdx(-1); setEditingRule(emptyRule()); }
  function startEdit(idx) { setEditingIdx(idx); setEditingRule({ ...rules[idx] }); }
  function cancelEdit() { setEditingIdx(null); setEditingRule(null); }

  function saveRule(r) {
    let nextRules;
    if (editingIdx === -1) {
      nextRules = [...rules, r];
    } else {
      nextRules = rules.map((rule, i) => i === editingIdx ? r : rule);
    }
    onChange({ ...escalation, rules: nextRules });
    setEditingIdx(null); setEditingRule(null);
  }

  function deleteRule(idx) {
    onChange({ ...escalation, rules: rules.filter((_, i) => i !== idx) });
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: C.g4, fontFamily: F, marginBottom: 12, lineHeight: "17px" }}>
        Per-question escalations fire immediately during the audit. For escalations on overall audit results, see the Escalation step.
      </div>

      {rules.map((rule, idx) => (
        <div key={rule.id ?? idx}>
          {editingIdx === idx ? (
            <EscalationRuleEditor rule={editingRule} isCritical={isCritical} onSave={saveRule} onCancel={cancelEdit} />
          ) : (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              border: `1px solid ${C.g2}`, borderRadius: 7, marginBottom: 6, background: C.white,
            }}>
              <span style={{ flex: 1, fontSize: 13, color: C.g6, fontFamily: F }}>{ruleLabel(rule)}</span>
              <button onClick={() => startEdit(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, display: "flex", padding: 4, borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = C.navy} onMouseLeave={e => e.currentTarget.style.color = C.g4}
              ><IconEdit /></button>
              <button onClick={() => deleteRule(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, display: "flex", padding: 4, borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = C.g4}
              ><IconTrash /></button>
            </div>
          )}
        </div>
      ))}

      {editingIdx === -1 && (
        <EscalationRuleEditor rule={editingRule} isCritical={isCritical} onSave={saveRule} onCancel={cancelEdit} />
      )}

      {editingIdx === null && (
        <button onClick={startAdd}
          style={{
            display: "flex", alignItems: "center", gap: 5, background: "none",
            border: `1px dashed ${C.g3}`, borderRadius: 6, padding: "6px 12px",
            width: "100%", fontSize: 12, fontWeight: 500, color: C.g4, fontFamily: F, cursor: "pointer", marginTop: 4,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
        ><IconPlus size={12} /> Add escalation rule</button>
      )}
    </div>
  );
}

function escalationStatus(escalation) {
  const n = escalation?.rules?.length ?? 0;
  return n > 0 ? `${n} rule${n > 1 ? "s" : ""}` : "Not configured";
}

// ── Panel 6: Conditional Logic ────────────────────────────────────────────────

function operatorOptions(answerType) {
  switch (answerType) {
    case "Yes/No/NA":       return [{ v: "is", l: "is" }];
    case "Yes/No":          return [{ v: "is", l: "is" }];
    case "Pass/Fail":       return [{ v: "is", l: "is" }];
    case "Rating Scale":    return [{ v: "eq", l: "equals" }, { v: "lt", l: "is less than" }, { v: "gt", l: "is greater than" }];
    case "Number":          return [{ v: "eq", l: "equals" }, { v: "lt", l: "is less than" }, { v: "gt", l: "is greater than" }];
    default:                return [{ v: "contains", l: "contains" }, { v: "eq", l: "equals" }];
  }
}

function valueOptions(answerType) {
  switch (answerType) {
    case "Yes/No/NA": return ["Yes", "No", "N/A"];
    case "Yes/No":    return ["Yes", "No"];
    case "Pass/Fail": return ["Pass", "Fail"];
    default:          return null; // text input
  }
}

function ConditionRow({ condition, priorQuestions, onUpdate, onDelete, depth = 0 }) {
  const selQ = priorQuestions.find(q => q.id === condition.questionId);
  const opOpts = selQ ? operatorOptions(selQ.answerType) : [{ v: "is", l: "is" }];
  const valOpts = selQ ? valueOptions(selQ.answerType) : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
      <select
        value={condition.questionId ?? ""}
        onChange={e => onUpdate({ ...condition, questionId: e.target.value, operator: "is", value: "" })}
        style={{ ...selectStyle(), flex: "2 1 160px" }}
      >
        <option value="">— Select prior question —</option>
        {priorQuestions.map(q => (
          <option key={q.id} value={q.id}>{q.title.slice(0, 60)}{q.title.length > 60 ? "…" : ""}</option>
        ))}
      </select>

      <select
        value={condition.operator ?? "is"}
        onChange={e => onUpdate({ ...condition, operator: e.target.value })}
        style={{ ...selectStyle(), flex: "1 1 100px", width: "auto" }}
      >
        {opOpts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>

      {valOpts ? (
        <select
          value={condition.value ?? ""}
          onChange={e => onUpdate({ ...condition, value: e.target.value })}
          style={{ ...selectStyle(), flex: "1 1 100px", width: "auto" }}
        >
          <option value="">— Select —</option>
          {valOpts.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      ) : (
        <FocusInput
          value={condition.value ?? ""}
          onChange={e => onUpdate({ ...condition, value: e.target.value })}
          placeholder="Value…"
          style={{ flex: "1 1 100px" }}
        />
      )}

      <button onClick={onDelete}
        style={{ background: "none", border: "none", cursor: "pointer", color: C.g4, padding: "4px 6px", borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center" }}
        onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = C.g4}
      >×</button>
    </div>
  );
}

function ConditionGroup({ group, priorQuestions, onUpdate, onDelete, depth = 0 }) {
  function toggleOp() { onUpdate({ ...group, operator: group.operator === "AND" ? "OR" : "AND" }); }

  function updateItem(idx, val) {
    const items = group.items.map((it, i) => i === idx ? val : it);
    onUpdate({ ...group, items });
  }
  function deleteItem(idx) {
    const items = group.items.filter((_, i) => i !== idx);
    onUpdate({ ...group, items });
  }
  function addCondition() {
    const newCond = { id: genId("cond"), type: "condition", questionId: "", operator: "is", value: "" };
    onUpdate({ ...group, items: [...(group.items ?? []), newCond] });
  }
  function addGroup() {
    if (depth >= 1) return; // max 1 level of nesting
    const newGroup = { id: genId("grp"), type: "group", operator: "AND", items: [] };
    onUpdate({ ...group, items: [...(group.items ?? []), newGroup] });
  }

  const borderColor = depth === 0 ? C.navy : "#4b5ecc";

  return (
    <div style={{
      borderLeft: `3px solid ${borderColor}`,
      paddingLeft: 12, marginLeft: depth * 10, marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <button
          onClick={toggleOp}
          style={{
            padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: F, letterSpacing: "0.04em",
            borderRadius: 5, border: `1.5px solid ${C.navy}`, cursor: "pointer",
            background: C.navy, color: C.white,
          }}
        >{group.operator ?? "AND"}</button>
        <span style={{ fontSize: 12, color: C.g4, fontFamily: F }}>
          {group.operator === "OR" ? "Match any condition below" : "Match all conditions below"}
        </span>
        {onDelete && (
          <button onClick={onDelete}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: C.g4, fontSize: 11, fontFamily: F, display: "flex", alignItems: "center", gap: 4, padding: "2px 6px", borderRadius: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = C.red} onMouseLeave={e => e.currentTarget.style.color = C.g4}
          ><IconTrash /> Delete group</button>
        )}
      </div>

      {(group.items ?? []).map((item, idx) => (
        item.type === "group"
          ? <ConditionGroup key={item.id} group={item} priorQuestions={priorQuestions}
              onUpdate={val => updateItem(idx, val)} onDelete={() => deleteItem(idx)} depth={depth + 1} />
          : <ConditionRow key={item.id} condition={item} priorQuestions={priorQuestions}
              onUpdate={val => updateItem(idx, val)} onDelete={() => deleteItem(idx)} depth={depth} />
      ))}

      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <button onClick={addCondition}
          style={{
            display: "flex", alignItems: "center", gap: 4, background: "none",
            border: `1px dashed ${C.g3}`, borderRadius: 5, padding: "4px 10px",
            fontSize: 12, color: C.g4, fontFamily: F, cursor: "pointer",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
        ><IconPlus size={11} /> Add condition</button>
        {depth < 1 && (
          <button onClick={addGroup}
            style={{
              display: "flex", alignItems: "center", gap: 4, background: "none",
              border: `1px dashed ${C.g3}`, borderRadius: 5, padding: "4px 10px",
              fontSize: 12, color: C.g4, fontFamily: F, cursor: "pointer",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.purple; e.currentTarget.style.borderColor = C.purple; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
          ><IconPlus size={11} /> Add group</button>
        )}
      </div>
    </div>
  );
}

function countConditions(items) {
  if (!items) return 0;
  return items.reduce((sum, item) => {
    if (item.type === "condition") return sum + 1;
    if (item.type === "group") return sum + countConditions(item.items);
    return sum;
  }, 0);
}

function validateConditions(items) {
  if (!items || items.length === 0) return null;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type === "condition") {
      if (!item.questionId) return `Condition ${i + 1} is missing a question.`;
      if (!item.value && item.value !== 0) return `Condition ${i + 1} is missing a value.`;
    }
    if (item.type === "group") {
      if (!item.items || item.items.length === 0) return `Group ${i + 1} has no conditions.`;
      const inner = validateConditions(item.items);
      if (inner) return inner;
    }
  }
  return null;
}

function buildPreviewText(items, operator, priorQuestions, depth = 0) {
  if (!items || items.length === 0) return "";
  const parts = items.map((item, idx) => {
    if (item.type === "condition") {
      const q = priorQuestions.find(q => q.id === item.questionId);
      const qLabel = q ? `"${q.title.slice(0, 30)}${q.title.length > 30 ? "…" : ""}"` : "(unknown question)";
      return `${qLabel} ${item.operator ?? "is"} ${item.value || "(no value)"}`;
    }
    if (item.type === "group") {
      const inner = buildPreviewText(item.items, item.operator, priorQuestions, depth + 1);
      return `(${inner})`;
    }
    return "";
  });
  return parts.join(` ${operator} `);
}

function Panel6Body({ conditional, priorQuestions, onChange, onValidationChange }) {
  const operator = conditional?.operator ?? "AND";
  const items = conditional?.items ?? [];

  function updateTop(newConditional) {
    onChange(newConditional);
  }

  function addTopCondition() {
    const newCond = { id: genId("cond"), type: "condition", questionId: "", operator: "is", value: "" };
    updateTop({ ...conditional, items: [...items, newCond] });
  }

  function addTopGroup() {
    const newGroup = { id: genId("grp"), type: "group", operator: "AND", items: [] };
    updateTop({ ...conditional, items: [...items, newGroup] });
  }

  function updateItem(idx, val) {
    const next = items.map((it, i) => i === idx ? val : it);
    updateTop({ ...conditional, items: next });
  }

  function deleteItem(idx) {
    updateTop({ ...conditional, items: items.filter((_, i) => i !== idx) });
  }

  function toggleOperator() {
    updateTop({ ...conditional, operator: operator === "AND" ? "OR" : "AND" });
  }

  const validationError = validateConditions(items);
  const previewText = items.length > 0 ? buildPreviewText(items, operator, priorQuestions) : null;

  useEffect(() => {
    onValidationChange(validationError);
  }, [validationError]);

  return (
    <div>
      {items.length === 0 ? (
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: C.g4, fontFamily: F, marginBottom: 12, lineHeight: "18px" }}>
            This question always shows. Add a rule to make it conditional on prior answers.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button onClick={addTopCondition}
              style={{
                display: "flex", alignItems: "center", gap: 5, background: C.navy, color: C.white,
                border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600, fontFamily: F, cursor: "pointer",
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.navy2}
              onMouseLeave={e => e.currentTarget.style.background = C.navy}
            ><IconPlus size={12} /> Add condition</button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: C.g5, fontFamily: F }}>Show this question only when:</span>
            {items.length > 1 && (
              <button onClick={toggleOperator}
                style={{
                  padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: F,
                  borderRadius: 5, border: `1.5px solid ${C.navy}`, cursor: "pointer",
                  background: C.navy, color: C.white,
                }}
              >{operator}</button>
            )}
          </div>

          {items.map((item, idx) => (
            item.type === "group"
              ? <ConditionGroup key={item.id} group={item} priorQuestions={priorQuestions}
                  onUpdate={val => updateItem(idx, val)} onDelete={() => deleteItem(idx)} depth={0} />
              : <ConditionRow key={item.id} condition={item} priorQuestions={priorQuestions}
                  onUpdate={val => updateItem(idx, val)} onDelete={() => deleteItem(idx)} depth={0} />
          ))}

          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button onClick={addTopCondition}
              style={{
                display: "flex", alignItems: "center", gap: 4, background: "none",
                border: `1px dashed ${C.g3}`, borderRadius: 5, padding: "4px 10px",
                fontSize: 12, color: C.g4, fontFamily: F, cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.navy; e.currentTarget.style.borderColor = C.navy; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
            ><IconPlus size={11} /> Add condition</button>
            <button onClick={addTopGroup}
              style={{
                display: "flex", alignItems: "center", gap: 4, background: "none",
                border: `1px dashed ${C.g3}`, borderRadius: 5, padding: "4px 10px",
                fontSize: 12, color: C.g4, fontFamily: F, cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.purple; e.currentTarget.style.borderColor = C.purple; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.g4; e.currentTarget.style.borderColor = C.g3; }}
            ><IconPlus size={11} /> Add group</button>
          </div>

          {/* Plain-English preview */}
          <div style={{
            marginTop: 14, padding: "10px 12px", borderRadius: 7,
            background: validationError ? "#fef2f2" : "#f0f2ff",
            border: `1px solid ${validationError ? "#fca5a5" : "#c7ccff"}`,
            fontSize: 12, fontFamily: F, color: validationError ? C.red : C.navy, lineHeight: "17px",
          }}>
            {validationError
              ? <><span style={{ fontWeight: 700 }}>⚠ This rule has an issue: </span>{validationError}</>
              : <><span style={{ fontWeight: 600 }}>This question will appear when: </span>{previewText}</>
            }
          </div>
        </div>
      )}
    </div>
  );
}

function conditionalStatus(conditional) {
  const count = countConditions(conditional?.items);
  return count > 0 ? `${count} condition${count > 1 ? "s" : ""}` : "Not configured";
}

// ── Main QuestionEditor ───────────────────────────────────────────────────────

export default function QuestionEditor({ question, isNew, methodology, priorQuestions, onSave, onClose }) {
  // Panel 1 state (merged)
  const [panel1, setPanel1] = useState({
    answerType:    question.answerType    ?? "Yes/No/NA",
    required:      question.required      ?? false,
    critical:      question.critical      ?? false,
    informational: question.informational ?? false,
    instructions:  question.instructions  ?? "",
    typeConfig:    question.typeConfig    ?? {},
  });

  const [title, setTitle]             = useState(question.title ?? "");
  const [inBank, setInBank]           = useState(question.inBank ?? false);
  const [scoring, setScoring]         = useState(question.scoring ?? {});
  const [media, setMedia]             = useState(question.media ?? {});
  const [action, setAction]           = useState(question.action ?? { type: "none" });
  const [escalation, setEscalation]   = useState(question.escalation ?? { rules: [] });
  const [conditional, setConditional] = useState(question.conditional ?? { operator: "AND", items: [] });

  const [openPanels, setOpenPanels] = useState({ p1: true, p2: false, p3: false, p4: false, p5: false, p6: false });
  const [titleError, setTitleError] = useState(false);
  const [isDirty, setIsDirty]       = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [condError, setCondError]   = useState(null);

  const titleRef = useRef(null);

  useEffect(() => {
    if (isNew && titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  // Mark dirty on any change
  function markDirty() { setIsDirty(true); }

  function togglePanel(key) {
    setOpenPanels(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const showScoring = !panel1.informational && methodology !== "informational";

  function handleSave() {
    if (!title.trim()) { setTitleError(true); titleRef.current?.focus(); return; }
    if (condError) return;
    const patch = {
      title: title.trim(),
      answerType:    panel1.answerType,
      required:      panel1.required,
      critical:      panel1.critical,
      informational: panel1.informational,
      instructions:  panel1.instructions,
      typeConfig:    panel1.typeConfig,
      inBank,
      scoring,
      media,
      action,
      escalation,
      conditional,
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

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) handleCancelClick();
  }

  const canSave = title.trim().length > 0 && !condError;
  const ansTypeMeta_ = ansTypeMeta(panel1.answerType);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, fontFamily: F }}
      onClick={handleBackdropClick}
    >
      <div style={{ background: C.white, borderRadius: 12, width: 720, maxWidth: "calc(100vw - 32px)", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>

        {/* Sticky header */}
        <div style={{ padding: "14px 18px 12px", borderBottom: `1px solid ${C.g2}`, flexShrink: 0, background: C.white }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Answer type icon badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: ansTypeMeta_.bg, color: ansTypeMeta_.color, fontSize: 10, fontWeight: 700,
            }}>
              {panel1.answerType.slice(0, 2)}
            </span>

            {/* Title input */}
            <div style={{ flex: 1, position: "relative" }}>
              <input
                ref={titleRef}
                value={title}
                onChange={e => { setTitle(e.target.value); setTitleError(false); markDirty(); }}
                placeholder="Question text…"
                style={{
                  width: "100%", fontFamily: F, fontSize: 16, fontWeight: 600, color: C.g6,
                  background: "transparent", border: "none", outline: "none",
                  borderBottom: titleError ? `2px solid ${C.red}` : `2px solid transparent`,
                  padding: "2px 0", boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => { if (!titleError) e.currentTarget.style.borderBottomColor = C.navy; }}
                onBlur={e => { if (!titleError) e.currentTarget.style.borderBottomColor = "transparent"; }}
              />
              {titleError && (
                <div style={{ fontSize: 11, color: C.red, fontFamily: F, marginTop: 2 }}>Question text is required.</div>
              )}
            </div>

            {/* Add to Bank toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", flexShrink: 0 }}>
              <span style={{ display: "flex", color: inBank ? C.navy : C.g4 }}><IconBank /></span>
              <Toggle checked={inBank} onChange={() => { setInBank(b => !b); markDirty(); }} />
              <span style={{ fontSize: 11, color: C.g5, fontFamily: F, whiteSpace: "nowrap" }}>Add to Bank</span>
            </label>

            {/* Save + Cancel */}
            <button
              onClick={handleSave}
              disabled={!canSave}
              style={{
                background: canSave ? C.navy : C.g2, color: canSave ? C.white : C.g4,
                border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 600, fontFamily: F,
                cursor: canSave ? "pointer" : "not-allowed", flexShrink: 0,
              }}
              onMouseEnter={e => { if (canSave) e.currentTarget.style.background = C.navy2; }}
              onMouseLeave={e => { if (canSave) e.currentTarget.style.background = C.navy; }}
            >{isNew ? "Add question" : "Save changes"}</button>

            <button
              onClick={handleCancelClick}
              style={{ background: "none", border: `1px solid ${C.g3}`, borderRadius: 7, padding: "7px 14px", fontSize: 13, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer", flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = C.g1} onMouseLeave={e => e.currentTarget.style.background = "none"}
            >Cancel</button>
          </div>

          {/* Discard confirmation row */}
          {showDiscard && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, padding: "8px 10px", background: "#fef2f2", borderRadius: 7, border: `1px solid #fca5a5` }}>
              <span style={{ flex: 1, fontSize: 13, color: C.red, fontFamily: F }}>Discard changes?</span>
              <button onClick={onClose}
                style={{ background: C.red, color: C.white, border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, fontFamily: F, cursor: "pointer" }}
              >Discard</button>
              <button onClick={() => setShowDiscard(false)}
                style={{ background: "none", border: `1px solid ${C.g3}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer" }}
              >Keep editing</button>
            </div>
          )}
        </div>

        {/* Scrollable panel body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 20px" }}>

          {/* Panel 1 — Question Configuration */}
          <Panel
            title="Question Configuration"
            statusText={panel1.answerType}
            open={openPanels.p1}
            onToggle={() => togglePanel("p1")}
          >
            <Panel1Body
              state={panel1}
              onChange={s => { setPanel1(s); markDirty(); }}
            />
          </Panel>

          {/* Panel 2 — Scoring (hidden when informational) */}
          {showScoring && (
            <Panel
              title="Scoring"
              statusText={scoringStatus(scoring, methodology)}
              open={openPanels.p2}
              onToggle={() => togglePanel("p2")}
            >
              <Panel2Body scoring={scoring} methodology={methodology} onChange={s => { setScoring(s); markDirty(); }} />
            </Panel>
          )}

          {/* Panel 3 — Media */}
          <Panel
            title="Media"
            statusText={mediaStatus(media)}
            open={openPanels.p3}
            onToggle={() => togglePanel("p3")}
          >
            <Panel3Body media={media} onChange={m => { setMedia(m); markDirty(); }} />
          </Panel>

          {/* Panel 4 — Actions */}
          <Panel
            title="Actions"
            statusText={actionStatus(action)}
            open={openPanels.p4}
            onToggle={() => togglePanel("p4")}
          >
            <Panel4Body action={action} answerType={panel1.answerType} onChange={a => { setAction(a); markDirty(); }} />
          </Panel>

          {/* Panel 5 — Escalation */}
          <Panel
            title="Escalation"
            statusText={escalationStatus(escalation)}
            open={openPanels.p5}
            onToggle={() => togglePanel("p5")}
          >
            <Panel5Body escalation={escalation} isCritical={panel1.critical} onChange={e => { setEscalation(e); markDirty(); }} />
          </Panel>

          {/* Panel 6 — Conditional Logic */}
          <Panel
            title="Conditional Logic"
            statusText={conditionalStatus(conditional)}
            open={openPanels.p6}
            onToggle={() => togglePanel("p6")}
          >
            <Panel6Body
              conditional={conditional}
              priorQuestions={priorQuestions ?? []}
              onChange={c => { setConditional(c); markDirty(); }}
              onValidationChange={setCondError}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}
