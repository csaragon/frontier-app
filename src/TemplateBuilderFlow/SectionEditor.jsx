import { useState, useEffect, useRef } from "react";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy: "#001e76", navy2: "#001356",
  ocean: "#2226f7",
  white: "#ffffff",
  g1: "#f4f4f6", g2: "#e2e5e9", g3: "#c3c8d0", g4: "#8692a2", g5: "#555f6d", g6: "#16191d",
  teal: "#0f766e", tealBg: "#ecfdf5",
  amber: "#b45309", amberBg: "#fffbeb",
  red: "#b6143a", redBg: "#fef2f2",
};

// Stub list of locations for V1 — would come from the locations API.
const STUB_LOCATIONS = [
  { id: "loc-1", name: "Boston Newbury",     tags: ["northeast", "flagship"] },
  { id: "loc-2", name: "New York Central",   tags: ["northeast", "flagship"] },
  { id: "loc-3", name: "Chicago Wacker",     tags: ["midwest"] },
  { id: "loc-4", name: "Los Angeles Westside", tags: ["west"] },
  { id: "loc-5", name: "Seattle Pike Place",   tags: ["west"] },
  { id: "loc-6", name: "Miami Brickell",     tags: ["southeast"] },
  { id: "loc-7", name: "Dallas Uptown",      tags: ["south", "flagship"] },
  { id: "loc-8", name: "Atlanta Midtown",    tags: ["southeast"] },
];

// ── Tab strip ────────────────────────────────────────────────────────────────

function TabStrip({ tabs, activeTab, onTabChange }) {
  return (
    <div style={{
      display: "flex",
      borderBottom: `1px solid ${C.g2}`,
      padding: "0 18px",
      flexShrink: 0,
      background: C.white,
      overflowX: "auto",
    }}>
      {tabs.map(t => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              padding: "10px 14px",
              fontFamily: F,
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? C.navy : C.g5,
              background: "none",
              border: "none",
              borderBottom: isActive ? `2px solid ${C.navy}` : "2px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: -1,
              whiteSpace: "nowrap",
              transition: "color 0.1s",
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = C.g6; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = C.g5; }}
          >
            {t.label}
            {t.indicator && (
              typeof t.indicator === "string" ? (
                <span style={{ fontSize: 11, color: isActive ? C.navy : C.g4, fontWeight: 500 }}>{t.indicator}</span>
              ) : (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? C.navy : C.g4 }} />
              )
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Field primitives ────────────────────────────────────────────────────────

function Label({ children, helper }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.g5, fontFamily: F }}>{children}</div>
      {helper && <div style={{ fontSize: 12, color: C.g4, fontFamily: F, marginTop: 2, lineHeight: "16px" }}>{helper}</div>}
    </div>
  );
}

function FocusInput({ value, onChange, type = "text", placeholder, style = {}, ...rest }) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: "100%",
        fontFamily: F,
        fontSize: 13,
        color: C.g6,
        border: `1px solid ${focus ? C.navy : C.g3}`,
        borderRadius: 7,
        padding: "7px 10px",
        outline: "none",
        background: C.white,
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    />
  );
}

function FocusTextarea({ value, onChange, placeholder, rows = 3, style = {} }) {
  const [focus, setFocus] = useState(false);
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: "100%",
        fontFamily: F,
        fontSize: 13,
        color: C.g6,
        border: `1px solid ${focus ? C.navy : C.g3}`,
        borderRadius: 7,
        padding: "7px 10px",
        outline: "none",
        background: C.white,
        resize: "vertical",
        lineHeight: "18px",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}

function Checkbox({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 16, height: 16, borderRadius: 4,
        border: `1.5px solid ${checked ? C.navy : C.g3}`,
        background: checked ? C.navy : C.white,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0,
      }}
    >
      {checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
    </div>
  );
}

// ── Weight Feedback Panel ────────────────────────────────────────────────────

function WeightFeedbackPanel({ allSections, currentId, currentWeight, onApplyRebalance }) {
  // Compute pretend totals: replace the editing section's weight with the live edit value.
  const projected = allSections.map(s =>
    s.id === currentId ? { ...s, weight: Number(currentWeight) || 0 } : s
  );
  const total = projected.reduce((sum, s) => sum + (Number(s.weight) || 0), 0);
  const totalRounded = Math.round(total * 10) / 10;
  const balanced = Math.round(totalRounded) === 100;
  const delta = totalRounded - 100;

  // Compute proportional rebalance for non-locked OTHER sections.
  function buildRebalanceSuggestion() {
    const others = projected.filter(s => s.id !== currentId && !s.locked);
    const otherTotal = others.reduce((sum, s) => sum + (Number(s.weight) || 0), 0);
    const remainingTarget = Math.max(0, 100 - (Number(currentWeight) || 0));
    if (otherTotal <= 0) return null;
    const factor = remainingTarget / otherTotal;
    return projected.map(s => {
      if (s.id === currentId) return { ...s, afterWeight: Number(currentWeight) || 0 };
      if (s.locked) return { ...s, afterWeight: Number(s.weight) || 0 };
      return { ...s, afterWeight: Math.round(((Number(s.weight) || 0) * factor) * 10) / 10 };
    });
  }

  const showRebalance = !balanced && projected.length > 1;
  const suggestion = showRebalance ? buildRebalanceSuggestion() : null;

  return (
    <div style={{
      background: C.g1,
      border: `1px solid ${C.g2}`,
      borderRadius: 10,
      padding: "12px 14px",
      marginTop: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.g6, fontFamily: F, flex: 1 }}>
          Section weights
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, fontFamily: F,
          color: balanced ? C.teal : C.amber,
          background: balanced ? C.tealBg : C.amberBg,
          border: `1px solid ${balanced ? "#a7f3d0" : "#fcd34d"}`,
          borderRadius: 6, padding: "2px 8px",
        }}>
          {balanced ? "✓ 100%" : `${totalRounded}% — ${delta > 0 ? "over" : "under"} 100%`}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {projected.map(s => {
          const isCurrent = s.id === currentId;
          const w = Number(s.weight) || 0;
          return (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 12, fontFamily: F,
              color: isCurrent ? C.navy : C.g5,
              fontWeight: isCurrent ? 700 : 500,
              padding: "3px 0",
            }}>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.name || "Untitled section"}
                {isCurrent && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, color: C.navy, background: "#eef1ff", padding: "1px 6px", borderRadius: 999 }}>editing</span>}
              </span>
              <span style={{ width: 56, textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                {w}%
              </span>
            </div>
          );
        })}
      </div>

      {showRebalance && suggestion && onApplyRebalance && (
        <div style={{
          marginTop: 12,
          padding: "10px 12px",
          background: C.amberBg,
          border: "1px solid #fcd34d",
          borderRadius: 8,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M3 12a9 9 0 1 0 9-9"/>
              <polyline points="3 4 3 12 11 12"/>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.amber, fontFamily: F, marginBottom: 4 }}>
                Auto-rebalance other sections?
              </div>
              <div style={{ fontSize: 11, color: C.amber, fontFamily: F, lineHeight: "16px", marginBottom: 8 }}>
                Distribute the remaining {Math.max(0, 100 - (Number(currentWeight) || 0))}% proportionally across the other sections.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 8 }}>
                {suggestion.filter(s => s.id !== currentId).map(s => {
                  const before = Number(s.weight) || 0;
                  const after = Number(s.afterWeight) || 0;
                  const changed = Math.abs(before - after) > 0.05;
                  return (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: F, color: C.amber }}>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name || "Untitled section"}</span>
                      <span style={{ fontVariantNumeric: "tabular-nums", opacity: 0.6, textDecoration: changed ? "line-through" : "none" }}>{before}%</span>
                      {changed && (
                        <>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                          <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{after}%</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => onApplyRebalance(suggestion)}
                style={{
                  background: C.amber, color: C.white, border: "none",
                  borderRadius: 6, padding: "5px 12px",
                  fontSize: 11, fontWeight: 700, fontFamily: F, cursor: "pointer",
                }}
              >
                Apply rebalance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Location Rules ──────────────────────────────────────────────────────────

function LocationRulesBody({ rules, onChange }) {
  const ruleType = rules?.type || "all_locations";
  const selectedIds = rules?.locationIds || [];
  const selectedTags = rules?.tags || [];

  const allTags = Array.from(new Set(STUB_LOCATIONS.flatMap(l => l.tags))).sort();

  function setType(type) {
    onChange({ type, locationIds: [], tags: [] });
  }
  function toggleLocation(id) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    onChange({ ...rules, type: "specific_locations", locationIds: next });
  }
  function toggleTag(tag) {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter(x => x !== tag)
      : [...selectedTags, tag];
    onChange({ ...rules, type: "by_tag", tags: next });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <Label helper="When to include this section in an audit. Defaults to every location.">Visibility</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { id: "all_locations", label: "Show at every location", helper: "Default. Every audit using this template includes this section." },
            { id: "specific_locations", label: "Only specific locations", helper: "Pick the locations where this section should appear." },
            { id: "by_tag", label: "By location tag", helper: "Show this section at locations matching one or more tags." },
          ].map(opt => {
            const active = ruleType === opt.id;
            return (
              <label key={opt.id} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                border: `1.5px solid ${active ? C.navy : C.g2}`,
                background: active ? "#eef1ff" : C.white,
                cursor: "pointer",
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                  border: `2px solid ${active ? C.navy : C.g3}`,
                  background: active ? C.navy : C.white,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {active && <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.white }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: active ? C.navy : C.g6, fontFamily: F }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: active ? C.navy : C.g4, fontFamily: F, marginTop: 2, lineHeight: "16px" }}>{opt.helper}</div>
                </div>
                <input type="radio" checked={active} onChange={() => setType(opt.id)} style={{ display: "none" }} />
              </label>
            );
          })}
        </div>
      </div>

      {ruleType === "specific_locations" && (
        <div>
          <Label>Locations ({selectedIds.length} selected)</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 240, overflowY: "auto", border: `1px solid ${C.g2}`, borderRadius: 8, padding: 8 }}>
            {STUB_LOCATIONS.map(loc => {
              const checked = selectedIds.includes(loc.id);
              return (
                <label key={loc.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, cursor: "pointer", background: checked ? "#eef1ff" : "transparent" }}>
                  <Checkbox checked={checked} onChange={() => toggleLocation(loc.id)} />
                  <span style={{ flex: 1, fontSize: 13, color: C.g6, fontFamily: F }}>{loc.name}</span>
                  <span style={{ fontSize: 10, color: C.g4, fontFamily: F }}>{loc.tags.join(" · ")}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {ruleType === "by_tag" && (
        <div>
          <Label helper="The section will appear at any location matching at least one selected tag.">Tags</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {allTags.map(tag => {
              const active = selectedTags.includes(tag);
              return (
                <button key={tag} onClick={() => toggleTag(tag)}
                  style={{
                    fontSize: 12, fontWeight: 500, fontFamily: F, borderRadius: 999, padding: "4px 10px",
                    border: `1px solid ${active ? C.navy : C.g3}`,
                    background: active ? "#eef1ff" : C.g1,
                    color: active ? C.navy : C.g5,
                    cursor: "pointer",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          {selectedTags.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: C.g4, fontFamily: F }}>
              Will apply to {STUB_LOCATIONS.filter(l => l.tags.some(t => selectedTags.includes(t))).length} location(s).
            </div>
          )}
        </div>
      )}

      <div style={{
        background: C.g1, border: `1px solid ${C.g2}`, borderRadius: 8,
        padding: "10px 12px", fontSize: 12, color: C.g4, fontFamily: F, lineHeight: "17px",
      }}>
        Section-level location rules ship in V1. Question-level rules will be available in a future release.
      </div>
    </div>
  );
}

// ── Main Section Editor ─────────────────────────────────────────────────────

export default function SectionEditor({
  section,
  allSections = [],
  methodology,
  onSave,
  onSaveAndNext,
  hasNext,
  onClose,
}) {
  const [name, setName]                     = useState(section.name ?? "");
  const [weight, setWeight]                 = useState(String(section.weight ?? 0));
  const [description, setDescription]       = useState(section.description ?? "");
  const [locationRules, setLocationRules]   = useState(section.locationRules ?? { type: "all_locations" });
  const [activeTab, setActiveTab]           = useState("setup");
  const [nameError, setNameError]           = useState(false);
  const [isDirty, setIsDirty]               = useState(false);
  const [showDiscard, setShowDiscard]       = useState(false);

  const nameRef = useRef(null);
  const isWeighted = methodology === "weighted";

  useEffect(() => {
    if (nameRef.current) nameRef.current.focus();
  }, []);

  function markDirty() { setIsDirty(true); }

  function buildPatch() {
    return {
      name: name.trim(),
      weight: Number(weight) || 0,
      description: description.trim(),
      locationRules,
    };
  }

  function handleSave() {
    if (!name.trim()) { setNameError(true); nameRef.current?.focus(); return; }
    onSave(buildPatch());
  }

  function handleSaveAndNext() {
    if (!name.trim()) { setNameError(true); nameRef.current?.focus(); return; }
    if (onSaveAndNext) onSaveAndNext(buildPatch());
    else onSave(buildPatch());
  }

  function handleCancelClick() {
    if (isDirty) setShowDiscard(true);
    else onClose();
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) handleCancelClick();
  }

  function handleApplyRebalance(suggestion) {
    // Hand back the full rebalance shape so the parent can update everyone at once.
    if (onSave) onSave({ ...buildPatch(), _rebalance: suggestion });
  }

  const canSave = name.trim().length > 0;
  const locationRulesIndicator = (locationRules?.type && locationRules.type !== "all_locations") ? true : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.white, fontFamily: F }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* Sticky header */}
        <div style={{ padding: "16px 22px 14px", borderBottom: `1px solid ${C.g2}`, flexShrink: 0, background: C.white }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: "#eef1ff", color: C.navy,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="5" rx="1"/>
                <rect x="3" y="10" width="18" height="5" rx="1"/>
                <rect x="3" y="17" width="18" height="4" rx="1"/>
              </svg>
            </span>

            <div style={{ flex: 1, position: "relative" }}>
              <input
                ref={nameRef}
                value={name}
                onChange={e => { setName(e.target.value); setNameError(false); markDirty(); }}
                placeholder="Section name…"
                style={{
                  width: "100%", fontFamily: F, fontSize: 16, fontWeight: 600, color: C.g6,
                  background: "transparent", border: "none", outline: "none",
                  borderBottom: nameError ? `2px solid ${C.red}` : "2px solid transparent",
                  padding: "2px 0",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => { if (!nameError) e.currentTarget.style.borderBottomColor = C.navy; }}
                onBlur={e => { if (!nameError) e.currentTarget.style.borderBottomColor = "transparent"; }}
              />
              {nameError && (
                <div style={{ fontSize: 12, color: C.red, fontFamily: F, marginTop: 2 }}>Section name is required.</div>
              )}
            </div>

            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                onClick={handleSave}
                disabled={!canSave}
                style={{
                  background: canSave ? C.navy : C.g2, color: canSave ? C.white : C.g4,
                  border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, fontFamily: F,
                  cursor: canSave ? "pointer" : "not-allowed",
                }}
                onMouseEnter={e => { if (canSave) e.currentTarget.style.background = C.navy2; }}
                onMouseLeave={e => { if (canSave) e.currentTarget.style.background = C.navy; }}
              >Save</button>

              {hasNext && (
                <button
                  onClick={handleSaveAndNext}
                  disabled={!canSave}
                  title="Save and move to the next section"
                  style={{
                    background: C.white,
                    color: canSave ? C.navy : C.g4,
                    border: `1px solid ${canSave ? C.navy : C.g3}`,
                    borderRadius: 8, padding: "7px 12px", fontSize: 13, fontWeight: 600, fontFamily: F,
                    cursor: canSave ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", gap: 5,
                  }}
                  onMouseEnter={e => { if (canSave) e.currentTarget.style.background = "#eef1ff"; }}
                  onMouseLeave={e => { if (canSave) e.currentTarget.style.background = C.white; }}
                >
                  Save &amp; Next
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              )}
            </div>

            <button
              onClick={handleCancelClick}
              style={{ background: "none", border: `1px solid ${C.g3}`, borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 500, fontFamily: F, color: C.g5, cursor: "pointer", flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = C.g1}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >Cancel</button>
          </div>

          {showDiscard && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, padding: "8px 10px", background: "#fae5e6", borderRadius: 8, border: `1px solid #fca5a5` }}>
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

        {/* Tabs */}
        <TabStrip
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: "setup", label: "Setup" },
            { id: "location", label: "Location Rules", indicator: locationRulesIndicator },
            { id: "translation", label: "Translation", indicator: "(0/2)" },
          ]}
        />

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 28px" }}>
          {activeTab === "setup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <Label helper="Optional. Shown to auditors below the section header.">Description</Label>
                <FocusTextarea
                  value={description}
                  onChange={e => { setDescription(e.target.value); markDirty(); }}
                  placeholder="Brief description of what this section covers…"
                />
              </div>

              {isWeighted && (
                <div>
                  <Label helper="Percent of the template's score this section contributes (0–100).">Weight</Label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FocusInput
                      type="number"
                      value={weight}
                      onChange={e => { setWeight(e.target.value); markDirty(); }}
                      style={{ width: 120 }}
                      min={0}
                      max={100}
                    />
                    <span style={{ fontSize: 13, color: C.g4, fontFamily: F }}>%</span>
                  </div>
                  <WeightFeedbackPanel
                    allSections={allSections}
                    currentId={section.id}
                    currentWeight={weight}
                    onApplyRebalance={handleApplyRebalance}
                  />
                </div>
              )}

              {!isWeighted && (
                <div style={{
                  background: C.g1, border: `1px solid ${C.g2}`, borderRadius: 8,
                  padding: "10px 12px", fontSize: 12, color: C.g4, fontFamily: F, lineHeight: "17px",
                }}>
                  Weight controls appear when the template uses weighted scoring. Switch the methodology in the Scoring step to enable.
                </div>
              )}
            </div>
          )}

          {activeTab === "location" && (
            <LocationRulesBody
              rules={locationRules}
              onChange={r => { setLocationRules(r); markDirty(); }}
            />
          )}

          {activeTab === "translation" && (
            <div style={{ padding: "32px 16px", textAlign: "center", color: C.g4, fontFamily: F }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.g5, marginBottom: 6 }}>Translation editor</div>
              <div style={{ fontSize: 12, lineHeight: "18px" }}>
                Side-by-side translation for each enabled language will appear here.
                <br />
                Progress: 0 of 2 languages translated.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
