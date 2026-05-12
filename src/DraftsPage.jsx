import { useState } from "react";
import { T, F } from "./aegis-tokens.js";

const C = {
  navy:  T.action1,
  ocean: T.actionContainer1,
  white: T.surface1,
  g1:    T.surface2,
  g2:    T.border1,
  g3:    T.border2,
  g4:    T.disabled1,
  g5:    T.onSurface1,
  g6:    T.onSurface2,
};

const MODULE_META = {
  "Fire Safety":     { color: "#b6143a", bg: "#fae5e6" },
  "Health & Safety": { color: "#854d0e", bg: "#fef9c3" },
  "Loss Prevention": { color: "#2226f7", bg: "#d4e2ff" },
  "PPE":             { color: "#115e59", bg: "#ccfbf1" },
  "OSHA":            { color: "#7c3aed", bg: "#faf5ff" },
  "Operations":      { color: "#001e76", bg: "#d4e2ff" },
};

const CATEGORIES = ["All categories", "Fire Safety", "Health & Safety", "Loss Prevention", "PPE", "OSHA", "Operations"];

function DraftRow({ t, onResume }) {
  const [hov, setHov] = useState(false);
  const mod = MODULE_META[t.cat] || { color: C.g4, bg: C.g1 };
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 16,
        background: C.white, border: `1px solid ${hov ? C.g3 : C.g2}`,
        borderRadius: 10, padding: "14px 20px",
        transition: "box-shadow 0.12s, border-color 0.12s",
        boxShadow: hov ? "0 2px 10px rgba(0,0,0,0.07)" : "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: mod.bg, border: `1.5px solid ${mod.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: mod.color, fontFamily: F, textAlign: "center", lineHeight: "12px" }}>
          {t.cat.split(" ").map(w => w[0]).join("").slice(0, 2)}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.g6, fontFamily: F, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {t.name}
        </div>
        <div style={{ fontSize: 12, color: C.g4, fontFamily: F, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span>{t.cat}</span>
          <span>{t.sections} section{t.sections !== 1 ? "s" : ""}</span>
          <span>{t.questions} question{t.questions !== 1 ? "s" : ""}</span>
          <span>Updated {t.updated}</span>
        </div>
      </div>

      <div style={{
        padding: "3px 9px", borderRadius: 999,
        background: "#fef9c3", border: "1px solid #854d0e30",
        fontSize: 10, fontWeight: 600, color: "#854d0e", fontFamily: F, flexShrink: 0,
      }}>
        Draft
      </div>

      <button
        onClick={() => onResume(t.id)}
        style={{
          padding: "6px 14px", borderRadius: 7,
          border: `1px solid ${C.ocean}`, background: "#d4e2ff",
          color: C.ocean, fontSize: 12, fontWeight: 600,
          fontFamily: F, cursor: "pointer", flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#dde4ff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#d4e2ff"; }}
      >
        Resume
      </button>
    </div>
  );
}

export default function DraftsPage({ templates = [], onResume, onBack }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");

  const allDrafts = templates.filter(t => t.state === "draft");

  const filtered = allDrafts.filter(t => {
    const matchSearch = !search.trim() || t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All categories" || t.cat === categoryFilter;
    return matchSearch && matchCat;
  }).sort((a, b) => new Date(b.updated) - new Date(a.updated));

  return (
    <div style={{ height: "100%", background: C.g1, display: "flex", flexDirection: "column", fontFamily: F }}>
      {/* Top bar */}
      <div style={{
        height: 52, background: C.white, borderBottom: `1px solid ${C.g2}`,
        display: "flex", alignItems: "center", padding: "0 20px", flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: C.g5, fontSize: 13, fontFamily: F,
            padding: "4px 8px", borderRadius: 6,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.g1; e.currentTarget.style.color = C.g6; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.g5; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: C.g6 }}>All drafts</h1>
          <p style={{ margin: 0, fontSize: 13, color: C.g4 }}>
            {allDrafts.length} draft{allDrafts.length !== 1 ? "s" : ""} in progress
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search drafts…"
              style={{
                width: "100%", boxSizing: "border-box", paddingLeft: 32, paddingRight: 12,
                paddingTop: 8, paddingBottom: 8, fontSize: 13, fontFamily: F,
                color: C.g6, background: C.white, border: `1px solid ${C.g2}`,
                borderRadius: 8, outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = C.navy}
              onBlur={e => e.target.style.borderColor = C.g2}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{
              padding: "8px 12px", fontSize: 13, fontFamily: F,
              border: `1px solid ${C.g2}`, borderRadius: 8,
              color: C.g5, background: C.white, cursor: "pointer", outline: "none",
            }}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.g4, fontSize: 14 }}>
            {allDrafts.length === 0 ? "No drafts yet." : "No drafts match your filters."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(t => (
              <DraftRow key={t.id} t={t} onResume={onResume} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
