// Implements: TLP-80 (foundation + UI shell), TLP-81 (per-locale flow, auto-translate, save/submit)
import { useMemo, useState, useCallback } from "react";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  primary:      "#2226f7",
  primaryHover: "#1316a8",
  primaryBg:    "#f0f2ff",
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
  info:         "#0369a1",
  infoBg:       "#f0f9ff",
  warning:      "#b45309",
};
const FOCUS_RING = "0 0 0 2px #fff, 0 0 0 4px #2226f7";

export const LOCALES = [
  { key: "en-US", label: "English (US)", base: true,  rtl: false, prefix: ""    },
  { key: "es-MX", label: "Spanish (MX)", base: false, rtl: false, prefix: "[ES]" },
  { key: "fr-CA", label: "French (CA)",  base: false, rtl: false, prefix: "[FR]" },
  { key: "de-DE", label: "German (DE)",  base: false, rtl: false, prefix: "[DE]" },
  { key: "pt-BR", label: "Portuguese (BR)", base: false, rtl: false, prefix: "[PT]" },
  { key: "ja-JP", label: "Japanese (JP)", base: false, rtl: false, prefix: "[JP]" },
];

// ── String extraction ─────────────────────────────────────────────────────────

function extractStrings(state) {
  const strings = [];
  strings.push({
    id: "template.name",
    context: "Template name",
    base: state.name || "",
    type: "name",
  });
  (state.fields.structure.sections || []).forEach((section, sIdx) => {
    strings.push({
      id: `section.${section.id}.name`,
      context: `Section ${sIdx + 1} name`,
      base: section.name || "",
      type: "section",
      sectionIdx: sIdx,
    });
    (section.questions || []).forEach((q, qIdx) => {
      strings.push({
        id: `question.${q.id}.text`,
        context: `${section.name || `Section ${sIdx + 1}`} › Q${qIdx + 1}`,
        base: q.text || "",
        type: "question",
        questionId: q.id,
      });
      if (Array.isArray(q.options)) {
        q.options.forEach((opt, oIdx) => {
          strings.push({
            id: `question.${q.id}.option.${oIdx}`,
            context: `${section.name || `Section ${sIdx + 1}`} › Q${qIdx + 1} › Option ${oIdx + 1}`,
            base: opt || "",
            type: "option",
            questionId: q.id,
            optionIdx: oIdx,
          });
        });
      }
    });
  });
  return strings;
}

function dispatchBaseEdit(str, value, dispatch) {
  if (str.type === "name") {
    dispatch({ type: "SET_NAME", value });
  } else if (str.type === "section") {
    dispatch({ type: "STRUCTURE_UPDATE_SECTION", idx: str.sectionIdx, updates: { name: value } });
  } else if (str.type === "question") {
    dispatch({ type: "STRUCTURE_UPDATE_QUESTION", id: str.questionId, updates: { text: value } });
  }
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ done, total }) {
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);
  const color = pct === 100 ? C.success : pct > 50 ? C.primary : C.warning;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.borderSubtle, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.25s" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, fontFamily: F, color, flexShrink: 0, minWidth: 90, textAlign: "right" }}>
        {done} of {total} strings
      </span>
    </div>
  );
}

// ── Base locale editor ────────────────────────────────────────────────────────

function BaseEditor({ strings, dispatch }) {
  return (
    <div>
      <div style={{
        background: C.infoBg, border: "1px solid #bae6fd", borderRadius: 8,
        padding: "10px 14px", marginBottom: 20,
        fontSize: 12, color: C.info, fontFamily: F, lineHeight: "17px",
      }}>
        <strong>Base language (English US).</strong> Edits here update the template directly and become the source for all translations. Switch to another locale to add translations.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {strings.map(str => (
          <div
            key={str.id}
            style={{ background: C.bgSurface, border: `1px solid ${C.borderSubtle}`, borderRadius: 8, padding: "10px 14px" }}
          >
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: F, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {str.context}
            </div>
            <input
              value={str.base}
              onChange={e => dispatchBaseEdit(str, e.target.value, dispatch)}
              placeholder="(empty)"
              aria-label={str.context}
              style={{
                width: "100%", padding: "7px 10px", borderRadius: 7,
                border: `1px solid ${C.borderDef}`, fontSize: 13, fontFamily: F,
                color: C.navyDeep, background: C.bgSurface, outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={e => (e.target.style.borderColor = C.primary)}
              onBlur={e => (e.target.style.borderColor = C.borderDef)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Translation row (two-column) ──────────────────────────────────────────────

function TranslationRow({ str, value, locale, hasError, onChange }) {
  const isRtl = locale.rtl;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
      background: C.bgSurface,
      border: `1px solid ${hasError ? C.error : C.borderSubtle}`,
      borderRadius: 8, padding: "10px 14px",
      transition: "border-color 0.1s",
    }}>
      {/* Base (left) */}
      <div>
        <div style={{ fontSize: 10, color: C.textMuted, fontFamily: F, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {str.context} &mdash; Base
        </div>
        <div style={{ fontSize: 13, color: str.base ? C.textSec : C.textMuted, fontFamily: F, lineHeight: "18px", wordBreak: "break-word", fontStyle: str.base ? "normal" : "italic" }}>
          {str.base || "(empty base)"}
        </div>
      </div>
      {/* Translation (right) */}
      <div>
        <div style={{ fontSize: 10, color: C.textMuted, fontFamily: F, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {locale.label}
          {hasError && <span style={{ color: C.error, marginLeft: 6 }}>Required</span>}
        </div>
        <input
          value={value}
          onChange={e => onChange(str.id, e.target.value)}
          placeholder={hasError ? "Required before submitting" : "Enter translation…"}
          dir={isRtl ? "rtl" : "ltr"}
          aria-label={`${locale.label} translation for: ${str.context}`}
          aria-invalid={hasError}
          style={{
            width: "100%", padding: "7px 10px", borderRadius: 7,
            border: `1px solid ${hasError ? C.error : C.borderDef}`,
            fontSize: 13, fontFamily: F, color: C.navyDeep,
            background: hasError ? C.errorBg : C.bgSurface,
            outline: "none", boxSizing: "border-box",
            textAlign: isRtl ? "right" : "left",
            transition: "border-color 0.1s, background 0.1s",
          }}
          onFocus={e => { e.target.style.borderColor = hasError ? C.error : C.primary; }}
          onBlur={e => { e.target.style.borderColor = hasError ? C.error : C.borderDef; }}
        />
      </div>
    </div>
  );
}

// ── Locale chip strip ─────────────────────────────────────────────────────────

function LocaleChips({ locales, selected, allTranslations, strings, submittedLocales, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {locales.filter(l => !l.base).map(l => {
        const lt    = allTranslations[l.key] || {};
        const ldone = strings.filter(s => lt[s.id]?.trim()).length;
        const pct   = strings.length === 0 ? 0 : Math.round((ldone / strings.length) * 100);
        const isSelected   = l.key === selected;
        const isSubmitted  = submittedLocales.has(l.key);
        const dotColor     = isSubmitted ? C.success : pct === 100 ? C.success : pct > 0 ? C.primary : C.borderDef;
        return (
          <button
            key={l.key}
            onClick={() => onSelect(l.key)}
            style={{
              padding: "4px 12px", borderRadius: 999, fontSize: 11, fontFamily: F, fontWeight: 600,
              border: `1px solid ${isSelected ? C.primary : C.borderSubtle}`,
              background: isSelected ? C.primaryBg : C.bgSurface,
              color: isSelected ? C.primary : C.textSec,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            }}
            onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
            onBlur={e => (e.currentTarget.style.boxShadow = "none")}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
            {l.label.split(" ").slice(0, 1).join("")}
            {" "}
            {isSubmitted ? "✓" : `${pct}%`}
          </button>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TranslateTab({ state, dispatch }) {
  const [selectedLocale, setSelectedLocale]   = useState("es-MX");
  const [submitErrors, setSubmitErrors]       = useState(new Set());
  const [submittedLocales, setSubmittedLocales] = useState(new Set());
  const [toast, setToast]                     = useState(null);

  const strings          = useMemo(() => extractStrings(state), [state]);
  const locale           = LOCALES.find(l => l.key === selectedLocale) || LOCALES[1];
  const isBase           = locale.base;
  const allTranslations  = state.fields.translations || {};
  const localeTranslations = allTranslations[selectedLocale] || {};
  const done             = strings.filter(s => localeTranslations[s.id]?.trim()).length;
  const isSubmitted      = submittedLocales.has(selectedLocale);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const switchLocale = key => {
    setSelectedLocale(key);
    setSubmitErrors(new Set());
  };

  const handleChange = useCallback((stringId, value) => {
    dispatch({ type: "SET_TRANSLATION", locale: selectedLocale, stringId, value });
    setSubmitErrors(prev => {
      if (!prev.has(stringId)) return prev;
      const n = new Set(prev); n.delete(stringId); return n;
    });
  }, [dispatch, selectedLocale]);

  const handleAutoTranslate = () => {
    const updates = {};
    strings.forEach(s => {
      if (!localeTranslations[s.id]?.trim() && s.base.trim()) {
        updates[s.id] = `${locale.prefix} ${s.base}`.trim();
      }
    });
    if (Object.keys(updates).length === 0) {
      showToast("All strings already have a translation.");
      return;
    }
    dispatch({ type: "BULK_SET_TRANSLATIONS", locale: selectedLocale, updates });
    setSubmitErrors(new Set());
    const n = Object.keys(updates).length;
    showToast(`Auto-translated ${n} string${n !== 1 ? "s" : ""}.`);
  };

  const handleSaveDraft = () => {
    dispatch({ type: "SAVE_DRAFT" });
    showToast("Translation draft saved.");
  };

  const handleSubmit = () => {
    const missing = new Set(strings.filter(s => !localeTranslations[s.id]?.trim()).map(s => s.id));
    if (missing.size > 0) {
      setSubmitErrors(missing);
      // Scroll to first error
      const firstId = strings.find(s => missing.has(s.id))?.id;
      if (firstId) {
        document.getElementById(`tr-row-${firstId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setSubmitErrors(new Set());
    setSubmittedLocales(prev => new Set([...prev, selectedLocale]));
    showToast(`${locale.label} translation submitted.`);
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 40 }}>

      {/* Page title */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.navyDeep, fontFamily: F }}>Translate</div>
        <div style={{ fontSize: 12, color: C.textMuted, fontFamily: F, marginTop: 3 }}>
          Manage translations for each supported locale. Select a locale to begin.
        </div>
      </div>

      {/* Locale selector + chips */}
      <div style={{
        background: C.bgSurface, border: `1px solid ${C.borderSubtle}`,
        borderRadius: 10, padding: "14px 18px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec, fontFamily: F, flexShrink: 0 }}>
            Locale
          </label>
          <select
            value={selectedLocale}
            onChange={e => switchLocale(e.target.value)}
            aria-label="Select locale"
            style={{
              padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.borderDef}`,
              fontSize: 12, fontFamily: F, color: C.navyDeep, background: C.bgSurface,
              cursor: "pointer", outline: "none", minWidth: 190,
            }}
            onFocus={e => (e.target.style.borderColor = C.primary)}
            onBlur={e => (e.target.style.borderColor = C.borderDef)}
          >
            {LOCALES.map(l => (
              <option key={l.key} value={l.key}>
                {l.base ? `${l.label} (Base)` : l.label}
              </option>
            ))}
          </select>
        </div>
        <LocaleChips
          locales={LOCALES}
          selected={selectedLocale}
          allTranslations={allTranslations}
          strings={strings}
          submittedLocales={submittedLocales}
          onSelect={switchLocale}
        />
      </div>

      {/* Empty state */}
      {strings.length === 0 && (
        <div style={{ textAlign: "center", padding: "56px 24px", color: C.textMuted, fontFamily: F }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>No translatable content yet</div>
          <div style={{ fontSize: 12 }}>Add sections and questions in the Build tab first.</div>
        </div>
      )}

      {/* Base editor */}
      {strings.length > 0 && isBase && (
        <BaseEditor strings={strings} dispatch={dispatch} />
      )}

      {/* Per-locale editor */}
      {strings.length > 0 && !isBase && (
        <>
          {/* Progress + action bar */}
          <div style={{
            background: C.bgSurface, border: `1px solid ${C.borderSubtle}`,
            borderRadius: 10, padding: "14px 18px", marginBottom: 16,
          }}>
            <div style={{ marginBottom: 12 }}>
              <ProgressBar done={done} total={strings.length} />
            </div>
            {submitErrors.size > 0 && (
              <div role="alert" style={{
                background: C.errorBg, border: "1px solid #fca5a5", borderRadius: 7,
                padding: "8px 12px", marginBottom: 12,
                fontSize: 11, color: C.error, fontFamily: F,
              }}>
                {submitErrors.size} string{submitErrors.size !== 1 ? "s" : ""} missing translation — fill all rows before submitting.
              </div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {isSubmitted && (
                <span style={{ fontSize: 11, fontWeight: 600, color: C.success, fontFamily: F, display: "flex", alignItems: "center", gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Submitted
                </span>
              )}
              <div style={{ flex: 1 }} />
              <button
                onClick={handleAutoTranslate}
                aria-label="Auto-translate missing strings"
                style={{
                  padding: "6px 14px", borderRadius: 7,
                  border: `1px solid ${C.borderDef}`,
                  background: C.bgSurface, color: C.textSec,
                  fontSize: 12, fontFamily: F, fontWeight: 500, cursor: "pointer",
                }}
                onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                onMouseEnter={e => (e.currentTarget.style.background = C.bgApp)}
                onMouseLeave={e => (e.currentTarget.style.background = C.bgSurface)}
              >
                Translate automatically
              </button>
              <button
                onClick={handleSaveDraft}
                aria-label="Save translation draft"
                style={{
                  padding: "6px 14px", borderRadius: 7,
                  border: `1px solid ${C.borderDef}`,
                  background: C.bgSurface, color: C.textSec,
                  fontSize: 12, fontFamily: F, fontWeight: 500, cursor: "pointer",
                }}
                onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                onMouseEnter={e => (e.currentTarget.style.background = C.bgApp)}
                onMouseLeave={e => (e.currentTarget.style.background = C.bgSurface)}
              >
                Save draft
              </button>
              <button
                onClick={handleSubmit}
                aria-label="Submit translation"
                title={done < strings.length ? `${strings.length - done} string${strings.length - done !== 1 ? "s" : ""} still empty` : "Submit this locale's translation"}
                style={{
                  padding: "6px 14px", borderRadius: 7, border: "none",
                  background: C.primary, color: "#fff",
                  fontSize: 12, fontFamily: F, fontWeight: 600, cursor: "pointer",
                }}
                onFocus={e => (e.currentTarget.style.boxShadow = FOCUS_RING)}
                onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                onMouseEnter={e => (e.currentTarget.style.background = C.primaryHover)}
                onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
              >
                Submit translation
              </button>
            </div>
          </div>

          {/* Translation rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {strings.map(str => (
              <div key={str.id} id={`tr-row-${str.id}`}>
                <TranslationRow
                  str={str}
                  value={localeTranslations[str.id] || ""}
                  locale={locale}
                  hasError={submitErrors.has(str.id)}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
            background: C.navyDeep, color: "#fff",
            padding: "10px 22px", borderRadius: 8,
            fontSize: 13, fontFamily: F, fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 1100,
            display: "flex", alignItems: "center", gap: 10,
            whiteSpace: "nowrap",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
