import { useState } from "react";
import { T, F } from "../aegis-tokens.js";

const C = {
  navy:  T.action1,
  navy2: T.action2,
  ocean: T.actionContainer1,
  white: T.surface1,
  g1:    T.surface2,
  g2:    T.border1,
  g3:    T.border2,
  g4:    T.disabled1,
  g5:    T.onSurface1,
  g6:    T.onSurface2,
  red:   T.onError1,
  redBg: T.errorContainer1,
};

// Fallback used only when no categories are provided via props (e.g. standalone preview).
// In the live app, categories come from Settings → Categories via App.jsx state.
const DEFAULT_CATEGORIES = [
  { name: "Health & Safety",  color: "#b6143a", bg: "#fae5e6" },
  { name: "Loss Prevention",  color: "#2226f7", bg: "#d4e2ff" },
  { name: "Operations",       color: "#0f766e", bg: "#ccfbf1" },
  { name: "Fire Safety",      color: "#7c3aed", bg: "#faf5ff" },
  { name: "PPE Compliance",   color: "#c2410c", bg: "#fff7ed" },
  { name: "OSHA Compliance",  color: "#001e76", bg: "#e0f2fe" },
  { name: "Cash Handling",    color: "#a16207", bg: "#fefce8" },
  { name: "Asset Protection", color: "#166534", bg: "#f0fdf4" },
];

function makeGetCatStyle(categories) {
  return function getCatStyle(catName) {
    return categories.find((c) => c.name === catName) || { color: C.g5, bg: C.g1 };
  };
}

// Autocomplete pool — in production would come from previously used tags API
const TAG_POOL = [
  "retail", "safety", "compliance", "monthly", "weekly", "annual",
  "critical", "cash", "equipment", "training", "inspection", "procedure",
  "storage", "electrical", "temperature", "hazmat", "ppe", "lockout",
];

const ALL_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese (Brazilian)" },
  { code: "de", label: "German" },
  { code: "zh", label: "Mandarin" },
];

// Stub existing template names for duplicate detection
// In production, this would be a debounced API call
const EXISTING_NAMES_LOWER = [
  "fire safety audit", "slip, trip & fall inspection", "ppe compliance check",
  "lp standard audit", "cash handling review", "operations standards",
  "osha compliance", "shrink prevention", "emergency preparedness",
  "seasonal safety", "floor ownership audit", "truck survey",
];

// ── Small shared primitives ───────────────────────────────────────────────────

function FieldLabel({ required, children }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.g6, marginBottom: 6, fontFamily: F }}>
      {children}
      {required && <span style={{ color: C.red, marginLeft: 2 }}>*</span>}
    </label>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p style={{ margin: "5px 0 0", fontSize: 12, color: C.red, fontFamily: F, lineHeight: "16px" }}>{msg}</p>;
}

function HelperText({ children }) {
  return <p style={{ margin: "5px 0 0", fontSize: 12, color: C.g4, fontFamily: F, lineHeight: "16px" }}>{children}</p>;
}

function inputStyle(focused, hasError) {
  return {
    width: "100%",
    padding: "9px 12px",
    fontSize: 13,
    fontFamily: F,
    color: C.g6,
    border: `1px solid ${hasError ? C.red : focused ? C.ocean : C.g3}`,
    borderRadius: 8,
    outline: "none",
    background: C.white,
    boxSizing: "border-box",
    boxShadow: focused && !hasError ? "0 0 0 2px rgba(34,38,247,0.12)" : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };
}

// ── Tags Input (chip-style with autocomplete) ─────────────────────────────────

function TagsInput({ tags, catName, onChange, getCatStyle }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const catStyle = getCatStyle(catName);

  function addTag(raw) {
    const tag = raw.trim().toLowerCase();
    if (!tag || tags.includes(tag)) {
      setInput("");
      setSuggestions([]);
      return;
    }
    onChange([...tags, tag]);
    setInput("");
    setSuggestions([]);
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleInputChange(e) {
    const val = e.target.value;
    if (val.endsWith(",")) {
      addTag(val.slice(0, -1));
      return;
    }
    setInput(val);
    if (val.trim().length > 0) {
      setSuggestions(
        TAG_POOL.filter((t) => t.includes(val.toLowerCase()) && !tags.includes(t)).slice(0, 5)
      );
    } else {
      setSuggestions([]);
    }
  }

  function handleKeyDown(e) {
    if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  const chipColor = catName ? catStyle.color : C.g5;
  const chipBg = catName ? catStyle.bg : C.g1;
  const chipBorder = catName ? catStyle.color + "30" : C.g2;

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          padding: "7px 10px",
          border: `1px solid ${focused ? C.ocean : C.g3}`,
          borderRadius: 8,
          minHeight: 44,
          background: C.white,
          cursor: "text",
          boxShadow: focused ? "0 0 0 2px rgba(34,38,247,0.12)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxSizing: "border-box",
        }}
        onClick={(e) => {
          // Focus the input when clicking anywhere in the chip container
          const input = e.currentTarget.querySelector("input");
          if (input) input.focus();
        }}
      >
        {tags.map((tag) => (
          <span key={tag} style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: chipBg,
            color: chipColor,
            border: `1px solid ${chipBorder}`,
            borderRadius: 999,
            padding: "2px 8px 2px 10px",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: F,
            userSelect: "none",
          }}>
            {tag}
            <button
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: chipColor, lineHeight: 1 }}
              aria-label={`Remove tag ${tag}`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setTimeout(() => setSuggestions([]), 150); }}
          placeholder={tags.length === 0 ? "Type a tag and press Enter or comma..." : ""}
          style={{
            border: "none",
            outline: "none",
            flex: "1 1 120px",
            minWidth: 120,
            fontSize: 13,
            fontFamily: F,
            color: C.g6,
            background: "transparent",
            padding: "2px 0",
          }}
        />
      </div>

      {/* Autocomplete dropdown */}
      {suggestions.length > 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          background: C.white,
          border: `1px solid ${C.g2}`,
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          overflow: "hidden",
          zIndex: 200,
        }}>
          {suggestions.map((s) => (
            <button
              key={s}
              onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "9px 14px", fontSize: 13, fontFamily: F, color: C.g6, cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.g1; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Languages Multi-select ────────────────────────────────────────────────────

function LanguagesSelect({ languages, primaryLanguage, onLanguagesChange, onPrimaryChange }) {
  function toggleLang(code) {
    if (languages.includes(code)) {
      const next = languages.filter((l) => l !== code);
      const newPrimary = primaryLanguage === code ? (next[0] || null) : primaryLanguage;
      onLanguagesChange(next, newPrimary);
    } else {
      const next = [...languages, code];
      const newPrimary = primaryLanguage || code;
      onLanguagesChange(next, newPrimary);
    }
  }

  return (
    <div>
      <div style={{ border: `1px solid ${C.g2}`, borderRadius: 8, overflow: "hidden" }}>
        {ALL_LANGUAGES.map((lang, i) => {
          const isSelected = languages.includes(lang.code);
          const isPrimary = primaryLanguage === lang.code;
          return (
            <div
              key={lang.code}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 14px",
                background: isSelected ? "#f0f4ff" : C.white,
                borderTop: i > 0 ? `1px solid ${C.g2}` : "none",
                gap: 12,
                transition: "background 0.1s",
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleLang(lang.code)}
                  style={{ width: 15, height: 15, cursor: "pointer", accentColor: C.ocean, flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, color: isSelected ? C.g6 : C.g5, fontWeight: isSelected ? 500 : 400, fontFamily: F }}>
                  {lang.label}
                </span>
              </label>

              {/* Primary radio — only shown when language is selected */}
              {isSelected && (
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
                  <input
                    type="radio"
                    name="primaryLang"
                    checked={isPrimary}
                    onChange={() => onPrimaryChange(lang.code)}
                    style={{ width: 14, height: 14, cursor: "pointer", accentColor: C.ocean }}
                  />
                  <span style={{ fontSize: 12, color: isPrimary ? C.ocean : C.g4, fontWeight: isPrimary ? 600 : 400, fontFamily: F }}>
                    Primary
                  </span>
                </label>
              )}
            </div>
          );
        })}
      </div>
      {languages.length > 1 && (
        <HelperText>
          Translation for additional languages happens in the Translation Wizard after the template is built.
        </HelperText>
      )}
    </div>
  );
}

// ── Step 1: Details ───────────────────────────────────────────────────────────

export default function Step1Details({ formData, onChange, onNext, onBackToPick, categories }) {
  const d = formData || {};
  // Use categories from Settings if provided; fall back to built-in list otherwise.
  const CATEGORIES = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;
  const getCatStyle = makeGetCatStyle(CATEGORIES);
  const [focused, setFocused] = useState(null); // which field is currently focused
  const [touched, setTouched] = useState({});   // which fields the user has left
  const [nameError, setNameError] = useState(null);

  function touch(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleNameChange(e) {
    const val = e.target.value;
    onChange({ name: val });
    const normalized = val.trim().toLowerCase();
    if (normalized.length > 0 && EXISTING_NAMES_LOWER.includes(normalized)) {
      setNameError("A template with this name already exists. Try a different name.");
    } else {
      setNameError(null);
    }
  }

  function handleLanguagesChange(languages, primaryLanguage) {
    onChange({ languages, primaryLanguage });
    touch("languages");
  }

  function handlePrimaryChange(code) {
    onChange({ primaryLanguage: code });
  }

  function handleNext() {
    // Mark all required fields as touched so errors show
    setTouched({ name: true, category: true, languages: true });
    onNext();
  }

  // Derived error visibility (only shown after field is touched)
  const showNameRequired = touched.name && !(d.name || "").trim().length && !nameError;
  const showCatError = touched.category && !(d.category || "").length;
  const showLangError = touched.languages && !(d.languages || []).length;

  return (
    <div style={{ padding: "40px 24px 80px", display: "flex", justifyContent: "center", fontFamily: F }}>
      <div style={{ width: "100%", maxWidth: 720 }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ margin: "0 0 5px", fontSize: 20, fontWeight: 700, color: C.g6, fontFamily: F }}>Audit Template Details</h2>
          <p style={{ margin: 0, fontSize: 13, color: C.g5, fontFamily: F }}>Name, category, languages, and basic metadata for your template.</p>
        </div>

        {/* ── Form card ── */}
        <div style={{
          background: C.white,
          borderRadius: 12,
          border: `1px solid ${C.g2}`,
          padding: "32px 36px",
          marginBottom: 24,
        }}>
          {/* Name */}
          <div style={{ marginBottom: 24 }}>
            <FieldLabel required>Template name</FieldLabel>
            <input
              type="text"
              value={d.name || ""}
              onChange={handleNameChange}
              onFocus={() => setFocused("name")}
              onBlur={() => { setFocused(null); touch("name"); }}
              placeholder="e.g., Fire Safety Quarterly Inspection"
              style={inputStyle(focused === "name", !!nameError || showNameRequired)}
            />
            {nameError && <FieldError msg={nameError} />}
            {showNameRequired && !nameError && <FieldError msg="Template name is required." />}
          </div>

          {/* Description (optional) */}
          <div style={{ marginBottom: 24 }}>
            <FieldLabel>Description</FieldLabel>
            <textarea
              value={d.description || ""}
              onChange={(e) => onChange({ description: e.target.value })}
              onFocus={() => setFocused("description")}
              onBlur={() => setFocused(null)}
              placeholder="Describe what this template covers and when it should be used."
              rows={4}
              style={{
                ...inputStyle(focused === "description", false),
                resize: "vertical",
                lineHeight: "20px",
              }}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: 24 }}>
            <FieldLabel required>Category</FieldLabel>
            {/* Categories come from Settings → Categories; falls back to built-in list */}
            <div style={{ position: "relative" }}>
              <select
                value={d.category || ""}
                onChange={(e) => onChange({ category: e.target.value })}
                onFocus={() => setFocused("category")}
                onBlur={() => { setFocused(null); touch("category"); }}
                style={{
                  ...inputStyle(focused === "category", showCatError),
                  appearance: "none",
                  WebkitAppearance: "none",
                  paddingRight: 32,
                  cursor: "pointer",
                  color: d.category ? C.g6 : C.g4,
                }}
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {d.category && (() => {
              const s = getCatStyle(d.category);
              return (
                <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 4, padding: "2px 8px", fontFamily: F }}>
                    {d.category}
                  </span>
                  <span style={{ fontSize: 12, color: C.g4, fontFamily: F }}>Tag colors will match this category</span>
                </div>
              );
            })()}
            {showCatError && <FieldError msg="Category is required." />}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: 24 }}>
            <FieldLabel>Tags</FieldLabel>
            {/* Tag colors are admin-configurable in settings — auto-assigned by category for V1 */}
            <TagsInput
              tags={d.tags || []}
              catName={d.category || ""}
              onChange={(tags) => { onChange({ tags }); touch("tags"); }}
              getCatStyle={getCatStyle}
            />
          </div>

          {/* Languages */}
          <div>
            <FieldLabel required>Languages</FieldLabel>
            <LanguagesSelect
              languages={d.languages || []}
              primaryLanguage={d.primaryLanguage || null}
              onLanguagesChange={handleLanguagesChange}
              onPrimaryChange={handlePrimaryChange}
            />
            {showLangError && <FieldError msg="At least one language is required." />}
          </div>
        </div>
      </div>
    </div>
  );
}
