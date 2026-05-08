import { useState } from "react";
import { T, F } from "../aegis-tokens.js";

const C = {
  navy:  T.action1,
  navy2: T.action2,
  white: T.surface1,
  g1:    T.surface2,
  g2:    T.border1,
  g3:    T.border2,
  g4:    T.disabled1,
  g5:    T.onSurface1,
  g6:    T.onSurface2,
};

const LANG_LABELS = {
  en:    "English",
  es:    "Spanish",
  fr:    "French",
  pt:    "Portuguese",
  de:    "German",
  zh:    "Chinese (Simplified)",
  ja:    "Japanese",
  ko:    "Korean",
  ar:    "Arabic",
  hi:    "Hindi",
};

export default function Step4Translations({ formData, onChange, languages = ["en"] }) {
  const nonPrimary = (languages ?? ["en"]).filter(l => l !== "en");
  const [activeLocale, setActiveLocale] = useState(nonPrimary[0] ?? null);

  if (nonPrimary.length === 0) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 14px", display: "block" }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
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

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: F }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 80px", width: "100%" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.g6, marginBottom: 6 }}>Translations</div>
          <div style={{ fontSize: 13, color: C.g5 }}>
            Provide translated content for each language configured on this template.
          </div>
        </div>

        {/* Language tab switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {nonPrimary.map(lang => (
            <button
              key={lang}
              onClick={() => setActiveLocale(lang)}
              style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: F,
                border: `1.5px solid ${activeLocale === lang ? C.navy : C.g2}`,
                background: activeLocale === lang ? "#eef1ff" : C.white,
                color: activeLocale === lang ? C.navy : C.g5,
                cursor: "pointer",
              }}
            >
              {LANG_LABELS[lang] ?? lang.toUpperCase()}
            </button>
          ))}
        </div>

        {activeLocale && (
          <div style={{
            border: `1px solid ${C.g2}`, borderRadius: 12, padding: "20px 22px", background: C.white,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.g6, marginBottom: 14 }}>
              {LANG_LABELS[activeLocale] ?? activeLocale.toUpperCase()} translations
            </div>
            <div style={{
              background: C.g1, border: `1px dashed ${C.g3}`, borderRadius: 8,
              padding: "36px 24px", textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: C.g4 }}>
                Translation editor coming soon. Question-by-question translation will appear here.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
