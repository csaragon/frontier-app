import { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import { T, F } from "../aegis-tokens.js";

const C = {
  navy:    T.action1,
  navy2:   T.action2,
  white:   T.surface1,
  g1:      T.surface2,
  g2:      T.border1,
  g3:      T.border2,
  g4:      T.disabled1,
  g5:      T.onSurface1,
  g6:      T.onSurface2,
  amber:   T.warning1,
  amberBg: T.warningContainer1,
  teal:    "#0f766e",
  yellow:  "#a16207",
  yellowBg: "#fefce8",
  yellowBadge: "#eab308",
  green:   "#16a34a",
  greenBg: "#f0fdf4",
};

const LANG_META = {
  en: { label: "English",              locale: "en-US", code: "EN" },
  es: { label: "Spanish (Mexico)",     locale: "es-MX", code: "ES" },
  fr: { label: "French (Canada)",      locale: "fr-CA", code: "FR" },
  pt: { label: "Portuguese (Brazil)",  locale: "pt-BR", code: "PT" },
  de: { label: "German (Germany)",     locale: "de-DE", code: "DE" },
  zh: { label: "Chinese (Simplified)", locale: "zh-CN", code: "ZH" },
  ja: { label: "Japanese",             locale: "ja-JP", code: "JA" },
  ko: { label: "Korean",               locale: "ko-KR", code: "KO" },
  ar: { label: "Arabic",               locale: "ar-SA", code: "AR" },
  hi: { label: "Hindi",                locale: "hi-IN", code: "HI" },
};

function buildStrings(sections) {
  const out = [];
  for (const sec of sections) {
    out.push({ id: `title-${sec.id}`, type: "section_title", sectionId: sec.id, text: sec.name });
    for (const q of sec.questions) {
      out.push({ id: q.id, type: "question", sectionId: sec.id, text: q.title });
    }
  }
  return out;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconDownload() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function IconUpload() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}
function IconSparkle() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/></svg>;
}
function IconCheck() {
  return <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>;
}
function IconChevLeft() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function IconChevRight() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
}

function ConfirmButton({ confirmed, hasText, onClick }) {
  const [hover, setHover] = useState(false);
  if (!hasText) return <div style={{ width: 28, height: 28 }} />;
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={confirmed ? "Unconfirm" : "Confirm translation"}
      style={{
        width: 28, height: 28, borderRadius: "50%",
        border: `2px solid ${confirmed ? C.green : (hover ? C.navy : C.g3)}`,
        background: confirmed ? C.green : "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.15s", padding: 0,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
        stroke={confirmed ? "#fff" : (hover ? C.navy : C.g4)}
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2 6 5 9 10 3"/>
      </svg>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Step4Translations({ formData, onChange, languages = ["en"], sections: sectionsProp }) {
  const sections = useMemo(() => {
    if (Array.isArray(sectionsProp) && sectionsProp.length > 0) return sectionsProp;
    return [];
  }, [sectionsProp]);

  const allStrings = useMemo(() => buildStrings(sections), [sections]);

  const allLangs   = languages ?? ["en"];
  const nonPrimary = allLangs.filter(l => l !== "en");

  const translations = formData?.translations ?? {};
  const confirmed    = formData?.confirmed    ?? {};

  const [activeLocale,    setActiveLocale]    = useState(nonPrimary[0] ?? null);
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? null);
  const [editingId,       setEditingId]       = useState(null);
  const [editVal,         setEditVal]         = useState("");
  const [aiLoading,       setAiLoading]       = useState(false);
  const [aiAllLoading,    setAiAllLoading]    = useState(false);
  const [loadingIds,      setLoadingIds]      = useState(new Set());
  const [importWarning,   setImportWarning]   = useState(null);
  const fileInputRef = useRef(null);

  function update(nextTx, nextConf) {
    const hasUnconfirmed = nonPrimary.some(lang =>
      allStrings.some(s => {
        const text = nextTx[lang]?.[s.id] ?? "";
        return text.length > 0 && !(nextConf[lang]?.[s.id]);
      })
    );
    onChange({ translations: nextTx, confirmed: nextConf, hasUnconfirmed });
  }

  function getTx(locale, id)  { return translations[locale]?.[id] ?? ""; }
  function isConf(locale, id) { return !!(confirmed[locale]?.[id]); }

  function setTx(locale, id, val) {
    update({ ...translations, [locale]: { ...(translations[locale] ?? {}), [id]: val } }, confirmed);
  }

  function toggleConfirm(locale, id) {
    update(translations, { ...confirmed, [locale]: { ...(confirmed[locale] ?? {}), [id]: !isConf(locale, id) } });
  }

  function confirmSection(secId, locale, value) {
    const ids = allStrings.filter(s => s.sectionId === secId && getTx(locale, s.id)).map(s => s.id);
    const nextLoc = { ...(confirmed[locale] ?? {}) };
    ids.forEach(id => { nextLoc[id] = value; });
    update(translations, { ...confirmed, [locale]: nextLoc });
  }

  function confirmAllLanguage(locale) {
    const nextLoc = { ...(confirmed[locale] ?? {}) };
    allStrings.forEach(s => { if (getTx(locale, s.id)) nextLoc[s.id] = true; });
    update(translations, { ...confirmed, [locale]: nextLoc });
  }

  function getMissing(locale)     { return allStrings.filter(s => !getTx(locale, s.id)).length; }
  function getUnconfirmed(locale) { return allStrings.filter(s => getTx(locale, s.id) && !isConf(locale, s.id)).length; }
  function getConfirmedCount(locale) { return allStrings.filter(s => isConf(locale, s.id)).length; }
  function getSectionMissing(secId, loc) { return allStrings.filter(s => s.sectionId === secId && !getTx(loc, s.id)).length; }

  function getLangStatus(lang) {
    const missing = getMissing(lang);
    const unconf  = getUnconfirmed(lang);
    if (missing === 0 && unconf === 0) return { label: "complete",             color: C.green  };
    if (missing === 0)                 return { label: `${unconf} unconfirmed`, color: C.yellow };
    return                                    { label: `${missing} missing`,    color: C.yellow };
  }

  const validSectionId  = sections.find(s => s.id === activeSectionId)?.id ?? sections[0]?.id ?? null;
  const activeMeta      = activeLocale ? (LANG_META[activeLocale] ?? { label: activeLocale, locale: activeLocale.toUpperCase(), code: activeLocale.toUpperCase().slice(0, 2) }) : null;
  const activeSection   = sections.find(s => s.id === validSectionId);
  const sectionStrings  = allStrings.filter(s => s.sectionId === validSectionId);
  const sectionIdx      = sections.findIndex(s => s.id === validSectionId);

  const totalStrings       = allStrings.length;
  const confirmedCount     = activeLocale ? getConfirmedCount(activeLocale) : 0;
  const textCount          = activeLocale ? allStrings.filter(s => !!getTx(activeLocale, s.id)).length : 0;
  const missingCount       = totalStrings - textCount;
  const unconfirmedTxCount = textCount - confirmedCount;
  const progressPct        = totalStrings > 0 ? Math.round((confirmedCount / totalStrings) * 100) : 0;
  const sectionMissing     = activeLocale ? getSectionMissing(validSectionId, activeLocale) : 0;

  const sectionStringsWithText = activeLocale ? sectionStrings.filter(s => getTx(activeLocale, s.id)) : [];
  const sectionAllConfirmed    = sectionStringsWithText.length > 0 && sectionStringsWithText.every(s => isConf(activeLocale, s.id));
  const langAllConfirmed       = activeLocale ? (getMissing(activeLocale) === 0 && getUnconfirmed(activeLocale) === 0) : false;

  const totalNeedingTranslation = useMemo(() => {
    const ids = new Set();
    for (const lang of nonPrimary) {
      for (const s of allStrings) { if (!getTx(lang, s.id)) ids.add(`${lang}:${s.id}`); }
    }
    return ids.size;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonPrimary, allStrings, translations]);

  function commitEdit() {
    if (editingId && activeLocale) setTx(activeLocale, editingId, editVal.trim());
    setEditingId(null);
  }

  function startEdit(id, current) {
    commitEdit();
    setEditingId(id);
    setEditVal(current);
  }

  // Async AI translate — swap the body for a real POST when the endpoint is ready
  async function aiTranslate(strings, locale) {
    // TODO: POST /api/translate { texts: [{id, text}], targetLocale: locale }
    //       response: { translations: [{id, text}] }
    await new Promise(r => setTimeout(r, 900));
    const pfx = locale.toUpperCase().slice(0, 2) + ": ";
    return Object.fromEntries(strings.map(s => [s.id, pfx + s.text]));
  }

  async function handleAiTranslateSection() {
    if (!activeLocale || aiLoading) return;
    const toTranslate = sectionStrings.filter(s => !getTx(activeLocale, s.id));
    if (!toTranslate.length) return;
    setAiLoading(true);
    setLoadingIds(new Set(toTranslate.map(s => s.id)));
    try {
      const result = await aiTranslate(toTranslate, activeLocale);
      update({ ...translations, [activeLocale]: { ...(translations[activeLocale] ?? {}), ...result } }, confirmed);
    } finally {
      setAiLoading(false);
      setLoadingIds(new Set());
    }
  }

  async function handleAiTranslateAll() {
    if (aiAllLoading) return;
    setAiAllLoading(true);
    try {
      const nextTx = { ...translations };
      for (const lang of nonPrimary) {
        const toTranslate = allStrings.filter(s => !(nextTx[lang]?.[s.id]));
        if (!toTranslate.length) continue;
        const result = await aiTranslate(toTranslate, lang);
        nextTx[lang] = { ...(nextTx[lang] ?? {}), ...result };
      }
      update(nextTx, confirmed);
    } finally {
      setAiAllLoading(false);
    }
  }

  function handleExport(locale) {
    const meta = LANG_META[locale] ?? { label: locale };
    const rows = [["English (Base)", meta.label]];
    allStrings.forEach(s => rows.push([s.text, getTx(locale, s.id)]));
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, meta.label.slice(0, 31));
    XLSX.writeFile(wb, `translations-${locale}.xlsx`);
  }

  function handleImportFile(locale, file) {
    if (!file) return;
    setImportWarning(null);
    const reader = new FileReader();
    reader.onload = e => {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const lookup = Object.fromEntries(allStrings.map(s => [s.text, s.id]));
      const nextLoc = { ...(translations[locale] ?? {}) };
      let unmatched = 0;
      for (let i = 1; i < rows.length; i++) {
        const [eng, tx] = rows[i];
        if (!eng || !tx) continue;
        const id = lookup[String(eng).trim()];
        if (id) { nextLoc[id] = String(tx); }
        else    { unmatched++; }
      }
      update({ ...translations, [locale]: nextLoc }, confirmed);
      if (unmatched > 0) setImportWarning(`${unmatched} row${unmatched !== 1 ? "s" : ""} couldn't be matched and were skipped`);
    };
    reader.readAsArrayBuffer(file);
  }

  // ── Empty state: no languages ──────────────────────────────────────────────
  if (nonPrimary.length === 0) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 14px", display: "block" }}>
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.g5, marginBottom: 8 }}>No additional languages</div>
          <div style={{ fontSize: 13, color: C.g4, lineHeight: "20px" }}>
            Go to <strong>Details</strong> and add languages to this template to configure translations here.
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state: no sections ───────────────────────────────────────────────
  if (sections.length === 0) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 14px", display: "block" }}>
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.g5, marginBottom: 8 }}>No sections yet</div>
          <div style={{ fontSize: 13, color: C.g4, lineHeight: "20px" }}>
            Add sections and questions in <strong>Step 2</strong> before translating.
          </div>
        </div>
      </div>
    );
  }

  // ── Main layout ──────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: F, background: C.g1, minHeight: "100%" }}>
      <div style={{ padding: "28px 24px 0" }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: "0 0 5px", fontSize: 20, fontWeight: 700, color: C.g6, fontFamily: F }}>Translations</h2>
            <p style={{ margin: 0, fontSize: 13, color: C.g5, fontFamily: F }}>
              {nonPrimary.length} target language{nonPrimary.length !== 1 ? "s" : ""}
              {totalNeedingTranslation > 0 && <> · <span style={{ color: C.yellow, fontWeight: 500 }}>{totalNeedingTranslation} strings need translation</span></>}
              {totalNeedingTranslation === 0 && <> · <span style={{ color: C.green, fontWeight: 500 }}>all translations complete</span></>}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={() => activeLocale && handleExport(activeLocale)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, padding: "7px 13px", fontSize: 12, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = C.g1} onMouseLeave={e => e.currentTarget.style.background = C.white}>
              <IconDownload /> Export .xlsx
            </button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
              onChange={e => { if (activeLocale) handleImportFile(activeLocale, e.target.files[0]); e.target.value = ""; }} />
            <button onClick={() => fileInputRef.current?.click()}
              style={{ display: "flex", alignItems: "center", gap: 6, background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, padding: "7px 13px", fontSize: 12, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = C.g1} onMouseLeave={e => e.currentTarget.style.background = C.white}>
              <IconUpload /> Import .xlsx
            </button>
            <button onClick={handleAiTranslateAll} disabled={aiAllLoading}
              style={{ display: "flex", alignItems: "center", gap: 6, background: aiAllLoading ? C.g3 : C.navy, border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, fontFamily: F, color: C.white, cursor: aiAllLoading ? "not-allowed" : "pointer" }}
              onMouseEnter={e => { if (!aiAllLoading) e.currentTarget.style.background = C.navy2; }}
              onMouseLeave={e => { if (!aiAllLoading) e.currentTarget.style.background = C.navy; }}>
              <IconSparkle /> {aiAllLoading ? "Translating…" : "Translate all with AI"}
            </button>
          </div>
        </div>

        {/* Import warning banner */}
        {importWarning && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.amberBg, border: `1px solid ${C.amber}`, borderRadius: 8, padding: "9px 14px", marginBottom: 14, fontSize: 12, color: C.amber, fontFamily: F }}>
            <span>⚠ {importWarning}</span>
            <button onClick={() => setImportWarning(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.amber, fontSize: 16, lineHeight: 1, padding: "0 2px" }}>×</button>
          </div>
        )}

        {/* Language tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: `1px solid ${C.g2}`, overflowX: "auto" }}>
          {nonPrimary.map(lang => {
            const meta   = LANG_META[lang] ?? { label: lang, locale: lang.toUpperCase(), code: lang.toUpperCase().slice(0, 2) };
            const status = getLangStatus(lang);
            const active = activeLocale === lang;
            return (
              <button key={lang} onClick={() => setActiveLocale(lang)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 16px", cursor: "pointer",
                background: "none", border: "none",
                borderBottom: `2px solid ${active ? C.navy : "transparent"}`,
                marginBottom: -1,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? C.navy : C.g5, fontFamily: F }}>
                  {meta.label}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, fontFamily: F,
                  color: status.color === C.green ? C.green : C.yellow,
                  background: status.color === C.green ? C.greenBg : C.yellowBg,
                  borderRadius: 999, padding: "2px 6px",
                }}>
                  {status.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main card */}
      {activeLocale && activeMeta && (
        <div style={{ margin: "0 24px 40px", background: C.white, border: `1px solid ${C.g2}`, borderRadius: 12, overflow: "hidden" }}>

          {/* Editing bar */}
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.g2}`, background: C.g1, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: C.g5, fontFamily: F, flexShrink: 0 }}>
              Editing <strong style={{ color: C.g6 }}>{activeMeta.locale}</strong>
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 200px", minWidth: 0 }}>
              <span style={{ fontSize: 12, color: C.g4, fontFamily: F, whiteSpace: "nowrap" }}>
                {confirmedCount} confirmed
                {unconfirmedTxCount > 0 && <> · {unconfirmedTxCount} translated</>}
                {missingCount > 0 && <> · <span style={{ color: C.yellow }}>{missingCount} remaining</span></>}
              </span>
              <div style={{ flex: 1, height: 4, background: C.g2, borderRadius: 2, maxWidth: 180 }}>
                <div style={{ width: `${progressPct}%`, height: "100%", background: progressPct === 100 ? C.green : C.navy, borderRadius: 2, transition: "width 0.25s" }} />
              </div>
              {progressPct === 100 && <span style={{ fontSize: 12, fontFamily: F, color: C.green, whiteSpace: "nowrap" }}>Complete!</span>}
            </div>
            <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexShrink: 0 }}>
              <button onClick={() => handleExport(activeLocale)}
                style={{ display: "flex", alignItems: "center", gap: 5, background: C.white, border: `1px solid ${C.g2}`, borderRadius: 7, padding: "5px 11px", fontSize: 12, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.g1} onMouseLeave={e => e.currentTarget.style.background = C.white}>
                <IconDownload /> Export .xlsx
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                style={{ display: "flex", alignItems: "center", gap: 5, background: C.white, border: `1px solid ${C.g2}`, borderRadius: 7, padding: "5px 11px", fontSize: 12, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.g1} onMouseLeave={e => e.currentTarget.style.background = C.white}>
                <IconUpload /> Import .xlsx
              </button>
              <button onClick={handleAiTranslateSection} disabled={aiLoading}
                style={{ display: "flex", alignItems: "center", gap: 5, background: aiLoading ? C.g3 : "#eef1ff", border: `1px solid ${aiLoading ? C.g3 : "#c7cff7"}`, borderRadius: 7, padding: "5px 11px", fontSize: 12, fontWeight: 600, fontFamily: F, color: aiLoading ? C.g4 : C.navy, cursor: aiLoading ? "not-allowed" : "pointer" }}
                onMouseEnter={e => { if (!aiLoading) e.currentTarget.style.background = "#dde4ff"; }}
                onMouseLeave={e => { if (!aiLoading) e.currentTarget.style.background = "#eef1ff"; }}>
                <IconSparkle /> {aiLoading ? "Translating…" : "AI translate"}
              </button>
              <button
                onClick={() => !langAllConfirmed && confirmAllLanguage(activeLocale)}
                disabled={langAllConfirmed}
                style={{ display: "flex", alignItems: "center", gap: 5, background: langAllConfirmed ? C.g1 : C.white, border: `1px solid ${langAllConfirmed ? C.g2 : C.green}`, borderRadius: 7, padding: "5px 11px", fontSize: 12, fontWeight: 600, fontFamily: F, color: langAllConfirmed ? C.g4 : C.green, cursor: langAllConfirmed ? "default" : "pointer" }}
                onMouseEnter={e => { if (!langAllConfirmed) e.currentTarget.style.background = C.greenBg; }}
                onMouseLeave={e => { if (!langAllConfirmed) e.currentTarget.style.background = langAllConfirmed ? C.g1 : C.white; }}>
                {langAllConfirmed ? <><IconCheck /> All confirmed</> : "Confirm all"}
              </button>
            </div>
          </div>

          {/* Split: sidebar + table */}
          <div style={{ display: "flex" }}>

            {/* Sections sidebar */}
            <div style={{ width: 220, borderRight: `1px solid ${C.g2}`, flexShrink: 0 }}>
              <div style={{ padding: "12px 16px 6px", fontSize: 10, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: F }}>
                Sections
              </div>
              {sections.map(sec => {
                const missing = getSectionMissing(sec.id, activeLocale);
                const unconf  = allStrings.filter(s => s.sectionId === sec.id && getTx(activeLocale, s.id) && !isConf(activeLocale, s.id)).length;
                const active  = sec.id === validSectionId;
                const badge   = missing > 0 ? missing : unconf > 0 ? unconf : null;
                return (
                  <button key={sec.id} onClick={() => setActiveSectionId(sec.id)} style={{
                    width: "100%", textAlign: "left", background: active ? "#eef1ff" : "none",
                    border: "none", borderLeft: `3px solid ${active ? C.navy : "transparent"}`,
                    padding: "10px 16px 10px 13px", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "space-between", gap: 8,
                    borderBottom: `1px solid ${C.g1}`,
                  }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.g1; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "none"; }}>
                    <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? C.navy : C.g6, fontFamily: F, lineHeight: "18px" }}>
                      {sec.name}
                    </span>
                    {badge
                      ? <span style={{ fontSize: 11, fontWeight: 700, color: "#713f12", background: C.yellowBg, border: `1px solid ${C.yellowBadge}`, borderRadius: 10, padding: "1px 7px", flexShrink: 0 }}>{badge}</span>
                      : <span style={{ flexShrink: 0, color: C.green }}><IconCheck /></span>}
                  </button>
                );
              })}
            </div>

            {/* Table area */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Section header */}
              <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.g2}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.g6, fontFamily: F }}>{activeSection?.name}</span>
                  <span style={{ fontSize: 12, color: C.g4, fontFamily: F, marginLeft: 10 }}>
                    {sectionStrings.length} items
                    {sectionMissing > 0
                      ? <> · <span style={{ color: C.yellow }}>{sectionMissing} missing in {activeMeta.locale}</span></>
                      : <> · <span style={{ color: C.green }}>translated</span></>}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
                  {sectionStringsWithText.length > 0 && (
                    <button
                      onClick={() => confirmSection(validSectionId, activeLocale, !sectionAllConfirmed)}
                      style={{ fontSize: 12, fontWeight: 600, fontFamily: F, color: sectionAllConfirmed ? C.g4 : C.green, background: "none", border: `1px solid ${sectionAllConfirmed ? C.g2 : C.green}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = sectionAllConfirmed ? C.g1 : C.greenBg}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      {sectionAllConfirmed ? "Unconfirm all" : "Confirm all"}
                    </button>
                  )}
                  <button onClick={() => sectionIdx > 0 && setActiveSectionId(sections[sectionIdx - 1].id)}
                    disabled={sectionIdx === 0}
                    style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: sectionIdx > 0 ? "pointer" : "not-allowed", color: sectionIdx > 0 ? C.g5 : C.g3, fontSize: 12, fontWeight: 500, fontFamily: F, padding: "4px 8px", borderRadius: 6 }}
                    onMouseEnter={e => { if (sectionIdx > 0) e.currentTarget.style.background = C.g1; }}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <IconChevLeft /> Previous
                  </button>
                  <button onClick={() => sectionIdx < sections.length - 1 && setActiveSectionId(sections[sectionIdx + 1].id)}
                    disabled={sectionIdx === sections.length - 1}
                    style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: sectionIdx < sections.length - 1 ? "pointer" : "not-allowed", color: sectionIdx < sections.length - 1 ? C.g5 : C.g3, fontSize: 12, fontWeight: 500, fontFamily: F, padding: "4px 8px", borderRadius: 6 }}
                    onMouseEnter={e => { if (sectionIdx < sections.length - 1) e.currentTarget.style.background = C.g1; }}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    Next section <IconChevRight />
                  </button>
                </div>
              </div>

              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr 44px", padding: "7px 20px", background: C.g1, borderBottom: `1px solid ${C.g2}`, gap: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F }}>#</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F }}>English (Base)</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.g4, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F }}>{activeMeta.locale}</span>
                <span />
              </div>

              {/* Rows */}
              {sectionStrings.map((s, i) => {
                const val            = getTx(activeLocale, s.id);
                const conf           = isConf(activeLocale, s.id);
                const isEditing      = editingId === s.id;
                const isLoading      = loadingIds.has(s.id);
                const isSectionTitle = s.type === "section_title";
                const rowNum         = isSectionTitle ? null : i;

                return (
                  <div key={s.id} style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr 44px", padding: "0 20px", borderBottom: `1px solid ${C.g1}`, gap: 16, background: isSectionTitle ? C.g1 : C.white }}>
                    {/* # */}
                    <div style={{ display: "flex", alignItems: "center", paddingTop: 14, paddingBottom: 14 }}>
                      {isSectionTitle
                        ? <div style={{ width: 7, height: 7, borderRadius: "50%", background: conf ? C.green : (val ? C.navy : C.g3) }} />
                        : <span style={{ fontSize: 11, fontWeight: 600, color: C.g4, fontFamily: F }}>{rowNum}</span>}
                    </div>

                    {/* English base */}
                    <div style={{ paddingTop: 14, paddingBottom: 14 }}>
                      <div style={{ fontSize: 13, color: C.g6, lineHeight: "19px", fontFamily: F }}>{s.text}</div>
                      <span style={{
                        display: "inline-block", marginTop: 5,
                        fontSize: 10, fontWeight: 600, fontFamily: F,
                        color: isSectionTitle ? "#5c2c98" : C.g4,
                        background: isSectionTitle ? "#e8d8f5" : C.g1,
                        borderRadius: 4, padding: "1px 6px",
                      }}>
                        {isSectionTitle ? "section title" : "question"}
                      </span>
                    </div>

                    {/* Translation cell */}
                    <div style={{ paddingTop: 14, paddingBottom: 14, display: "flex", alignItems: "flex-start" }}
                      onClick={() => !isEditing && !isLoading && startEdit(s.id, val)}>
                      {isLoading ? (
                        <span style={{ fontSize: 13, color: C.g4, fontStyle: "italic", fontFamily: F }}>Translating…</span>
                      ) : isEditing ? (
                        <textarea
                          autoFocus
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={e => {
                            if (e.key === "Escape") { setEditingId(null); }
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit(); }
                          }}
                          style={{ width: "100%", fontFamily: F, fontSize: 13, color: C.g6, border: `1.5px solid ${C.navy}`, borderRadius: 6, padding: "7px 10px", outline: "none", resize: "none", lineHeight: "19px" }}
                          rows={2}
                        />
                      ) : val ? (
                        <span style={{ fontSize: 13, color: conf ? C.g5 : C.g6, fontFamily: F, lineHeight: "19px", cursor: "text" }}>{val}</span>
                      ) : (
                        <span style={{ fontSize: 13, color: C.g3, fontStyle: "italic", fontFamily: F, cursor: "text" }}>Not yet translated</span>
                      )}
                    </div>

                    {/* Confirm button */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 10 }}>
                      <ConfirmButton
                        confirmed={conf}
                        hasText={!!val && !isLoading}
                        onClick={() => toggleConfirm(activeLocale, s.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
