import { useState, useEffect, useRef } from "react";
import { STUB_TEMPLATES, CAT_COLORS, ALL_LANGUAGES, SORT_OPTS } from "./shared.js";
import { PreviewModal, MissingLangModal, SwitchRouteModal } from "./modals.jsx";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy:    "#001e76",
  navy2:   "#001356",
  navy3:   "#e8ecf8",
  ocean:   "#2226f7",
  ocean3:  "#d4e2ff",
  white:   "#ffffff",
  g1:      "#f4f4f6",
  g2:      "#e2e5e9",
  g3:      "#c3c8d0",
  g4:      "#8692a2",
  g5:      "#555f6d",
  g6:      "#16191d",
  teal:    "#0f766e",
  teal2:   "#ccfbf1",
  amber:   "#b45309",
  amberBg: "#fffbeb",
  green:   "#059669",
  greenBg: "#ecfdf5",
};

function CategoryPill({ cat }) {
  const style = CAT_COLORS[cat] || { color: C.g5, bg: C.g2 };
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      color: style.color,
      background: style.bg,
      borderRadius: 4,
      padding: "2px 7px",
      whiteSpace: "nowrap",
      fontFamily: F,
      flexShrink: 0,
    }}>
      {cat}
    </span>
  );
}

function LangIndicator({ template, userLangs }) {
  const missingLangs = userLangs.filter((l) => !template.langs.includes(l));
  if (missingLangs.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span style={{ fontSize: 10, color: C.green, fontFamily: F }}>Supported</span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span style={{ fontSize: 10, color: C.amber, fontFamily: F }}>Missing: {missingLangs.join(", ")}</span>
    </div>
  );
}

function TemplateCardGrid({ template, userLangs, onPreview }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => onPreview(template)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: C.white,
        borderRadius: 10,
        border: `1px solid ${hover ? C.navy : C.g2}`,
        padding: 18,
        cursor: "pointer",
        transition: "all 0.15s",
        position: "relative",
        boxShadow: hover ? "0 4px 16px rgba(0,0,0,0.09)" : "none",
        fontFamily: F,
      }}
    >
      {hover && (
        <button
          onClick={(e) => { e.stopPropagation(); onPreview(template); }}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: C.navy,
            color: C.white,
            border: "none",
            borderRadius: "0 0 0 10px",
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: F,
          }}
        >
          Preview
        </button>
      )}
      <CategoryPill cat={template.cat} />
      <div style={{ fontSize: 14, fontWeight: 600, color: C.g6, marginTop: 8, marginBottom: 6 }}>
        {template.name}
      </div>
      <div style={{
        fontSize: 11,
        color: C.g5,
        lineHeight: "16px",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        marginBottom: 10,
      }}>
        {template.description}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: C.g4 }}>{template.sections} sections</span>
        <span style={{ fontSize: 10, color: C.g3 }}>·</span>
        <span style={{ fontSize: 10, color: C.g4 }}>{template.questions} questions</span>
        <span style={{ fontSize: 10, color: C.g3 }}>·</span>
        <span style={{ fontSize: 10, color: C.g4 }}>
          Updated {template.updatedDays === 1 ? "1 day" : `${template.updatedDays} days`} ago
        </span>
      </div>
      <LangIndicator template={template} userLangs={userLangs} />
    </div>
  );
}

function TemplateCardList({ template, userLangs, onPreview }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => onPreview(template)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: C.white,
        borderRadius: 8,
        border: `1px solid ${hover ? C.navy : C.g2}`,
        padding: "12px 16px",
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: F,
      }}
    >
      <CategoryPill cat={template.cat} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.g6 }}>{template.name}</div>
        <div style={{
          fontSize: 11,
          color: C.g5,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {template.description}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: C.g4, whiteSpace: "nowrap" }}>
          {template.sections}s · {template.questions}q
        </span>
        <LangIndicator template={template} userLangs={userLangs} />
        <button
          onClick={(e) => { e.stopPropagation(); onPreview(template); }}
          style={{
            background: C.navy3,
            color: C.navy,
            border: "none",
            borderRadius: 6,
            padding: "5px 12px",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: F,
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = C.white; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = C.navy3; e.currentTarget.style.color = C.navy; }}
        >
          Preview
        </button>
      </div>
    </div>
  );
}

function CheckboxRow({ label, checked, onChange }) {
  return (
    <label style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
      padding: "4px 0",
      fontFamily: F,
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ width: 14, height: 14, cursor: "pointer", accentColor: C.navy }}
      />
      <span style={{ fontSize: 12, color: C.g6 }}>{label}</span>
    </label>
  );
}

function sortTemplates(templates, sort) {
  const t = [...templates];
  if (sort === "Alphabetical") t.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "Recently updated") t.sort((a, b) => a.updatedDays - b.updatedDays);
  else if (sort === "Most popular") t.sort((a, b) => b.questions - a.questions);
  // "Recently used" — keep original order
  return t;
}

export default function RouteA({ onUseTemplate, onBack, onCancel, hasData = false, userLangs = [] }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState(new Set());
  const [langFilter, setLangFilter] = useState(new Set());
  // TODO: [assumption-4] Default sort = Alphabetical
  const [sort, setSort] = useState("Alphabetical");
  const [viewMode, setViewMode] = useState("grid");
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [missingLangTemplate, setMissingLangTemplate] = useState(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const debounceRef = useRef(null);

  // Debounce search input 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  const anyFilterActive = catFilter.size > 0 || langFilter.size > 0 || search.trim() !== "";

  const filtered = sortTemplates(
    STUB_TEMPLATES.filter((t) => {
      if (catFilter.size > 0 && !catFilter.has(t.cat)) return false;
      if (langFilter.size > 0 && !t.langs.some((l) => langFilter.has(l))) return false;
      if (search.trim() !== "" && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    sort
  );

  const handleClearAll = () => {
    setCatFilter(new Set());
    setLangFilter(new Set());
    setSearchInput("");
    setSearch("");
    setSort("Alphabetical");
  };

  const handleBackBtn = () => {
    if (hasData) {
      setShowSwitchModal(true);
    } else {
      onBack();
    }
  };

  const handlePreviewUse = (template) => {
    const missingLangs = userLangs.filter((l) => !template.langs.includes(l));
    if (missingLangs.length > 0) {
      setPreviewTemplate(null);
      setMissingLangTemplate(template);
    } else {
      onUseTemplate(template.id);
    }
  };

  const toggleCat = (cat) => {
    setCatFilter((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const toggleLang = (lang) => {
    setLangFilter((prev) => {
      const next = new Set(prev);
      next.has(lang) ? next.delete(lang) : next.add(lang);
      return next;
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.g1, flexDirection: "column", fontFamily: F }}>
      {/* Top bar */}
      <div style={{
        height: 52,
        background: C.white,
        borderBottom: `1px solid ${C.g2}`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
        flexShrink: 0,
      }}>
        <button
          onClick={handleBackBtn}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.g5,
            fontSize: 13,
            fontFamily: F,
            padding: "4px 8px",
            borderRadius: 6,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.g1; e.currentTarget.style.color = C.g6; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.g5; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.g6 }}>Start from a template</span>
        <div style={{ flex: 1 }} />
        {/* View toggle */}
        <div style={{ display: "flex", border: `1px solid ${C.g3}`, borderRadius: 7, overflow: "hidden" }}>
          {["grid", "list"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                background: viewMode === mode ? C.navy3 : C.white,
                color: viewMode === mode ? C.navy : C.g5,
                border: "none",
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: viewMode === mode ? 600 : 400,
                cursor: "pointer",
                fontFamily: F,
                borderRight: mode === "grid" ? `1px solid ${C.g3}` : "none",
              }}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        {/* Search */}
        <div style={{ position: "relative", width: 220 }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.g4, display: "flex" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search templates..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "6px 10px 6px 30px",
              borderRadius: 8,
              border: `1px solid ${C.g3}`,
              fontSize: 12,
              fontFamily: F,
              color: C.g6,
              background: C.white,
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left sidebar */}
        <aside style={{
          width: 240,
          minWidth: 240,
          background: C.white,
          borderRight: `1px solid ${C.g2}`,
          padding: 16,
          overflowY: "auto",
          flexShrink: 0,
          fontFamily: F,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Filters
            </span>
            {anyFilterActive && (
              <button
                onClick={handleClearAll}
                style={{
                  background: "none",
                  border: "none",
                  color: C.ocean,
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: F,
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Category filter */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.g5, marginBottom: 8 }}>Category</div>
            {Object.keys(CAT_COLORS).map((cat) => (
              <CheckboxRow
                key={cat}
                label={cat}
                checked={catFilter.has(cat)}
                onChange={() => toggleCat(cat)}
              />
            ))}
          </div>

          {/* Language filter */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.g5, marginBottom: 8 }}>Language</div>
            {ALL_LANGUAGES.map((lang) => (
              <CheckboxRow
                key={lang}
                label={lang}
                checked={langFilter.has(lang)}
                onChange={() => toggleLang(lang)}
              />
            ))}
          </div>

          {/* Sort */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.g5, marginBottom: 8 }}>Sort by</div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: 8,
                border: `1px solid ${C.g3}`,
                fontSize: 12,
                fontFamily: F,
                color: C.g6,
                background: C.white,
                cursor: "pointer",
              }}
            >
              {SORT_OPTS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <div style={{ fontSize: 11, color: C.g4, marginBottom: 16, fontFamily: F }}>
            {anyFilterActive
              ? `${filtered.length} template${filtered.length !== 1 ? "s" : ""} matching filters`
              : `${filtered.length} template${filtered.length !== 1 ? "s" : ""}`}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", fontFamily: F }}>
              <div style={{ fontSize: 14, color: C.g5, marginBottom: 8 }}>No templates match your filters.</div>
              <button
                onClick={handleClearAll}
                style={{ background: "none", border: "none", color: C.ocean, fontSize: 13, cursor: "pointer", fontFamily: F, textDecoration: "underline" }}
              >
                Clear filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 14,
            }}>
              {filtered.map((t) => (
                <TemplateCardGrid key={t.id} template={t} userLangs={userLangs} onPreview={setPreviewTemplate} />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((t) => (
                <TemplateCardList key={t.id} template={t} userLangs={userLangs} onPreview={setPreviewTemplate} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* PreviewModal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          userLangs={userLangs}
          onUse={() => handlePreviewUse(previewTemplate)}
          onFullPreview={() => console.log("Full preview:", previewTemplate.id)}
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      {/* MissingLangModal */}
      {missingLangTemplate && (
        <MissingLangModal
          template={missingLangTemplate}
          missingLangs={userLangs.filter((l) => !missingLangTemplate.langs.includes(l))}
          onAutoTranslate={() => {
            console.log("Auto-translate:", missingLangTemplate.id);
            onUseTemplate(missingLangTemplate.id);
          }}
          onContinueWithout={() => {
            console.log("Continue without:", missingLangTemplate.id);
            onUseTemplate(missingLangTemplate.id);
          }}
          onClose={() => setMissingLangTemplate(null)}
        />
      )}

      {/* SwitchRouteModal */}
      {showSwitchModal && (
        <SwitchRouteModal
          onSave={() => { console.log("Draft saved before switch"); setShowSwitchModal(false); onBack(); }}
          onDiscard={() => { setShowSwitchModal(false); onBack(); }}
          onCancel={() => setShowSwitchModal(false)}
        />
      )}
    </div>
  );
}
