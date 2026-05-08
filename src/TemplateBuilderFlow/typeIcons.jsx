import { useState } from "react";

export function AnsTypeIcon({ type, size = 16 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (type) {
    case "Yes/No/NA":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="8 12 11 15 16 9" />
        </svg>
      );
    case "Yes/No":
      return (
        <svg {...common}>
          <polyline points="5 12 10 17 19 7" />
        </svg>
      );
    case "Pass/Fail":
      return (
        <svg {...common}>
          <polyline points="3 12 7 16 11 10" />
          <line x1="14" y1="9" x2="20" y2="15" />
          <line x1="20" y1="9" x2="14" y2="15" />
        </svg>
      );
    case "Rating Scale":
      return (
        <svg {...common}>
          <polygon points="12 3 14.5 9 21 9.5 16 13.7 17.5 20 12 16.7 6.5 20 8 13.7 3 9.5 9.5 9" />
        </svg>
      );
    case "Free Text":
      return (
        <svg {...common}>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="16" y2="12" />
          <line x1="4" y1="18" x2="13" y2="18" />
        </svg>
      );
    case "Number":
      return (
        <svg {...common}>
          <line x1="9" y1="3" x2="7" y2="21" />
          <line x1="17" y1="3" x2="15" y2="21" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
        </svg>
      );
    case "Multiple Choice":
      return (
        <svg {...common}>
          <circle cx="6" cy="7" r="1.5" />
          <circle cx="6" cy="12" r="1.5" />
          <circle cx="6" cy="17" r="1.5" />
          <line x1="11" y1="7" x2="20" y2="7" />
          <line x1="11" y1="12" x2="20" y2="12" />
          <line x1="11" y1="17" x2="20" y2="17" />
        </svg>
      );
    case "Grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "Asset":
      return (
        <svg {...common}>
          <path d="M20 7l-8-4-8 4 8 4 8-4z" />
          <path d="M4 7v10l8 4 8-4V7" />
          <line x1="12" y1="11" x2="12" y2="21" />
        </svg>
      );
    case "Photo Required":
      return (
        <svg {...common}>
          <path d="M3 7h4l2-3h6l2 3h4v12H3z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <line x1="6" y1="12" x2="18" y2="12" />
        </svg>
      );
  }
}

// Small feature indicator icons — matches QuestionList's QuestionIndicatorIcons
// but as standalone SVG components for use in catalog previews.

export function IconAction({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function IconConditional({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

export function IconEscalation({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
    </svg>
  );
}

export function IconPhoto({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

// Per-feature color tokens (kept consistent across the app)
export const FEATURE_COLORS = {
  action:      { color: "#854d0e", bg: "#fef3c7" },
  conditional: { color: "#7c3aed", bg: "#ede9fe" },
  escalation:  { color: "#b6143a", bg: "#ffe4e6" },
  photo:       { color: "#1e40af", bg: "#dbeafe" },
};

// Tooltip wrapper used by LogicIcons
export function LogicIconTip({ children, label, count }) {
  const [show, setShow] = useState(false);
  const tip = count != null && count > 1 ? `${label} · ${count}` : label;
  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 5px)", left: "50%",
          transform: "translateX(-50%)",
          background: "#1e293b", color: "#f8fafc",
          fontSize: 11, fontWeight: 500,
          padding: "3px 7px", borderRadius: 5,
          whiteSpace: "nowrap", pointerEvents: "none", zIndex: 700,
          boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
        }}>
          {tip}
        </div>
      )}
    </span>
  );
}

// Icon chip — used inline when a dedicated Logic column isn't available
function LogicChip({ icon, label, count, feature }) {
  const { color, bg } = FEATURE_COLORS[feature];
  return (
    <LogicIconTip label={label} count={count}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 20, height: 20, borderRadius: 5,
        background: bg, color,
      }}>
        {icon}
      </span>
    </LogicIconTip>
  );
}

// Normalises both data shapes:
//   • BanksPanel: { hasAction, hasEscalation, hasConditional, hasPhoto }
//   • Sections/Scoring: { action, escalation, conditional, media }
export function LogicIcons({ question, size = 12 }) {
  const hasAction   = question.action?.type ? question.action.type !== "none" : !!question.hasAction;
  const escCount    = question.escalation?.rules?.length ?? (question.hasEscalation ? 1 : 0);
  const condCount   = question.conditional?.items?.length ?? (question.hasConditional ? 1 : 0);
  const hasPhoto    = question.media?.requireOnFail ?? !!question.hasPhoto;

  if (!hasAction && escCount === 0 && condCount === 0 && !hasPhoto) return null;

  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {hasAction && (
        <LogicChip feature="action" label="Action" icon={<IconAction size={size} />} />
      )}
      {condCount > 0 && (
        <LogicChip feature="conditional" label="Conditional" count={condCount} icon={<IconConditional size={size} />} />
      )}
      {escCount > 0 && (
        <LogicChip feature="escalation" label="Escalation" count={escCount} icon={<IconEscalation size={size} />} />
      )}
      {hasPhoto && (
        <LogicChip feature="photo" label="Photo Required" icon={<IconPhoto size={size} />} />
      )}
    </div>
  );
}
