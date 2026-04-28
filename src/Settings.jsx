import { useState } from "react";
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
  primary:   "#2226f7",
  primaryBg: "#f0f2ff",
};

const COLOR_PALETTE = [
  { color:"#2226f7", bg:"#f0f2ff" },
  { color:"#059669", bg:"#ecfdf5" },
  { color:"#dc2626", bg:"#fef2f2" },
  { color:"#b45309", bg:"#fffbeb" },
  { color:"#7c3aed", bg:"#faf5ff" },
  { color:"#0369a1", bg:"#f0f9ff" },
  { color:"#c2410c", bg:"#fff7ed" },
  { color:"#0f766e", bg:"#ecfdf5" },
  { color:"#6d28d9", bg:"#ede9fe" },
  { color:"#be185d", bg:"#fdf2f8" },
];

function uid() { return `cat-${Date.now()}-${Math.floor(Math.random() * 9999)}`; }

function CategoryRow({ cat, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(cat.name);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== cat.name) onRename(cat.id, trimmed);
    setEditing(false);
  };

  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:8 }}>
      {/* Color swatch */}
      <div style={{ width:28, height:28, borderRadius:6, background:cat.bg, border:`1.5px solid ${cat.color}40`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:cat.color }} />
      </div>

      {/* Name */}
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(cat.name); setEditing(false); } }}
          style={{ flex:1, fontSize:12, fontWeight:500, fontFamily:F, color:C.navyDeep, border:`1px solid ${C.primary}`, borderRadius:5, padding:"3px 7px", outline:"none", background:C.bgSurf }}
        />
      ) : (
        <span style={{ flex:1, fontSize:12, fontWeight:500, color:C.navyDeep, fontFamily:F }}>{cat.name}</span>
      )}

      {/* Built-in badge */}
      {cat.builtIn && (
        <span style={{ fontSize:9, fontWeight:700, color:C.textMuted, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.05em", padding:"2px 6px", borderRadius:4, background:C.bgApp, border:`1px solid ${C.border}`, flexShrink:0 }}>
          System
        </span>
      )}

      {/* Actions for custom */}
      {!cat.builtIn && !editing && (
        <div style={{ display:"flex", gap:4, flexShrink:0 }}>
          <button onClick={() => { setDraft(cat.name); setEditing(true); }}
            style={{ padding:"3px 8px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:11, fontFamily:F, cursor:"pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = C.bgApp)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Rename
          </button>
          <button onClick={() => onDelete(cat.id)}
            style={{ padding:"3px 8px", borderRadius:5, border:"1px solid #fca5a5", background:"transparent", color:"#dc2626", fontSize:11, fontFamily:F, cursor:"pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function CategoriesSection({ categories, onCategoriesChange }) {
  const [adding,     setAdding]     = useState(false);
  const [newName,    setNewName]    = useState("");
  const [newColor,   setNewColor]   = useState(0); // index into COLOR_PALETTE

  const add = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const palette = COLOR_PALETTE[newColor];
    onCategoriesChange(prev => [...prev, { id:uid(), name:trimmed, color:palette.color, bg:palette.bg, builtIn:false }]);
    setNewName("");
    setNewColor(0);
    setAdding(false);
  };

  const rename = (id, name) => onCategoriesChange(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  const remove = (id)        => onCategoriesChange(prev => prev.filter(c => c.id !== id));

  return (
    <div>
      <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:F, marginBottom:4 }}>Template Categories</div>
      <div style={{ fontSize:13, color:C.textSec, fontFamily:F, marginBottom:16 }}>
        Organize audit templates into groups. System categories cannot be deleted.
      </div>

      {/* Category list */}
      <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:12 }}>
        {categories.map(cat => (
          <CategoryRow key={cat.id} cat={cat} onRename={rename} onDelete={remove} />
        ))}
      </div>

      {/* Add new */}
      {adding ? (
        <div style={{ padding:"14px", borderRadius:8, border:`1.5px solid ${C.primary}`, background:C.primaryBg }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.primary, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>New category</div>
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") add(); if (e.key === "Escape") { setAdding(false); setNewName(""); } }}
            placeholder="Category name…"
            style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:`1px solid ${C.border}`, fontSize:12, fontFamily:F, color:C.navyDeep, outline:"none", background:"#fff", boxSizing:"border-box", marginBottom:12 }}
            onFocus={e => (e.target.style.borderColor = C.primary)}
            onBlur={e => (e.target.style.borderColor = C.border)}
          />
          {/* Color swatches */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
            {COLOR_PALETTE.map((p, i) => (
              <button key={i} onClick={() => setNewColor(i)}
                style={{ width:24, height:24, borderRadius:5, background:p.bg, border:`2px solid ${newColor === i ? p.color : p.color + "50"}`, cursor:"pointer", position:"relative", flexShrink:0 }}
              >
                <div style={{ width:10, height:10, borderRadius:"50%", background:p.color, position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }} />
                {newColor === i && (
                  <div style={{ position:"absolute", inset:-3, borderRadius:7, border:`2px solid ${p.color}`, pointerEvents:"none" }} />
                )}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => { setAdding(false); setNewName(""); }}
              style={{ padding:"6px 12px", borderRadius:6, border:`1px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:11, fontFamily:F, cursor:"pointer" }}>
              Cancel
            </button>
            <button onClick={add} disabled={!newName.trim()}
              style={{ padding:"6px 14px", borderRadius:6, border:"none", background:newName.trim() ? C.primary : C.border, color:"#fff", fontSize:11, fontWeight:600, fontFamily:F, cursor:newName.trim() ? "pointer" : "not-allowed" }}>
              Add category
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:7, border:`1px dashed ${C.border}`, background:"transparent", color:C.textSec, fontSize:12, fontFamily:F, cursor:"pointer", width:"100%" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSec; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add category
        </button>
      )}
    </div>
  );
}

function DensityOption({ id, label, description, preview, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(id)}
      style={{
        display: "flex", flexDirection: "column", gap: 12,
        padding: 16, borderRadius: 10, border: `2px solid ${selected ? C.primary : C.border}`,
        background: selected ? C.primaryBg : C.bgSurf,
        cursor: "pointer", textAlign: "left", width: "100%",
        transition: "border-color 0.12s, background 0.12s",
      }}
    >
      {/* Preview mockup */}
      <div style={{ borderRadius: 7, border: `1px solid ${C.border}`, overflow: "hidden", background: C.bgApp }}>
        {preview}
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* Radio dot */}
        <div style={{
          width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 1,
          border: `2px solid ${selected ? C.primary : C.border}`,
          background: selected ? C.primary : C.bgSurf,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {selected && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.navyDeep, fontFamily: F, marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: F, lineHeight: "16px" }}>{description}</div>
        </div>
      </div>
    </button>
  );
}

function CondensedPreview() {
  const rows = [
    { name: "LP Standard Compliance Check", loc: "Boston Newbury", status: "In Progress", statusColor: "#a16207", statusBg: "#fef9c3" },
    { name: "Retail Store Safety Walkthrough", loc: "New York Central", status: "Overdue", statusColor: "#dc2626", statusBg: "#fef2f2" },
    { name: "Ops Standards Verification", loc: "Chicago Wacker", status: "Complete", statusColor: "#15803d", statusBg: "#f0fdf4" },
    { name: "PPE Station Inspection", loc: "LA Westside", status: "Scheduled", statusColor: "#0369a1", statusBg: "#f0f9ff" },
  ];
  return (
    <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #e2e5e9", borderRadius: 5, padding: "5px 8px" }}>
          <div style={{ width: 24, height: 24, borderRadius: 5, background: r.statusBg, border: `1px solid ${r.statusColor}30`, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#16191d", fontFamily: F, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
            <div style={{ fontSize: 8, color: "#8692a2", fontFamily: F }}>{r.loc}</div>
          </div>
          <div style={{ padding: "2px 6px", borderRadius: 999, background: r.statusBg, fontSize: 7, fontWeight: 600, color: r.statusColor, fontFamily: F, flexShrink: 0 }}>{r.status}</div>
        </div>
      ))}
    </div>
  );
}

function ComfortPreview() {
  const rows = [
    { name: "LP Standard Compliance Check", loc: "Boston Newbury", status: "In Progress", statusColor: "#a16207", statusBg: "#fef9c3" },
    { name: "Retail Store Safety Walkthrough", loc: "New York Central", status: "Overdue", statusColor: "#dc2626", statusBg: "#fef2f2" },
    { name: "Ops Standards Verification", loc: "Chicago Wacker", status: "Complete", statusColor: "#15803d", statusBg: "#f0fdf4" },
  ];
  return (
    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #e2e5e9", borderRadius: 7, padding: "9px 12px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: r.statusBg, border: `1px solid ${r.statusColor}30`, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#16191d", fontFamily: F, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{r.name}</div>
            <div style={{ fontSize: 9, color: "#8692a2", fontFamily: F }}>{r.loc}</div>
          </div>
          <div style={{ padding: "3px 8px", borderRadius: 999, background: r.statusBg, fontSize: 8, fontWeight: 600, color: r.statusColor, fontFamily: F, flexShrink: 0 }}>{r.status}</div>
        </div>
      ))}
    </div>
  );
}

export default function Settings({ onNav, density, onDensityChange, categories = [], onCategoriesChange }) {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: F, background: C.bgApp, overflow: "hidden" }}>
      <AppSidebar activeId="settings" onNav={onNav} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ height: 52, background: C.bgSurf, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 24px", flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.navyDeep, fontFamily: F }}>Portal Settings</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          <div style={{ maxWidth: 680 }}>

            {/* Display section */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F, marginBottom: 4 }}>Display</div>
              <div style={{ fontSize: 13, color: C.textSec, fontFamily: F, marginBottom: 16 }}>
                Choose how list views are displayed across the portal.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <DensityOption
                  id="condensed"
                  label="Condensed"
                  description="Tighter rows and smaller spacing. Fits more data on screen at once — ideal for power users."
                  preview={<CondensedPreview />}
                  selected={density === "condensed"}
                  onSelect={onDensityChange}
                />
                <DensityOption
                  id="comfort"
                  label="Comfort"
                  description="More generous spacing and larger touch targets. Easier to scan and read at a glance."
                  preview={<ComfortPreview />}
                  selected={density === "comfort"}
                  onSelect={onDensityChange}
                />
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: C.border, marginBottom: 32 }} />

            {/* Categories */}
            <div style={{ marginBottom: 32 }}>
              <CategoriesSection categories={categories} onCategoriesChange={onCategoriesChange} />
            </div>

            <div style={{ height: 1, background: C.border, marginBottom: 32 }} />

            {/* Placeholder sections */}
            {[
              { label: "Notifications", desc: "Control how and when you receive alerts and reminders." },
              { label: "Accessibility", desc: "Adjust contrast, motion, and other accessibility preferences." },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: C.textSec, fontFamily: F, marginBottom: 12 }}>{s.desc}</div>
                <div style={{ padding: "14px 16px", borderRadius: 8, border: `1px dashed ${C.border}`, background: C.bgSurf }}>
                  <span style={{ fontSize: 12, color: C.textMuted, fontFamily: F, fontStyle: "italic" }}>Coming soon</span>
                </div>
                <div style={{ height: 1, background: C.border, marginTop: 32 }} />
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
