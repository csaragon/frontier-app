const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy: "#001e76",
  white: "#ffffff",
  g1: "#f4f4f6", g2: "#e2e5e9", g3: "#c3c8d0", g4: "#8692a2", g5: "#555f6d", g6: "#16191d",
};

export default function Step4ScheduleStub({ onBack }) {
  return (
    <div style={{ padding: "40px 24px 80px", display: "flex", justifyContent: "center", fontFamily: F }}>
      <div style={{ width: "100%", maxWidth: 720 }}>

        {/* Placeholder card */}
        <div style={{
          background: C.white,
          borderRadius: 12,
          border: `1px dashed ${C.g3}`,
          padding: "56px 36px",
          textAlign: "center",
          marginBottom: 24,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: C.g1, display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: C.g6, fontFamily: F }}>
            Step 4 — Schedule &amp; Assign
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: C.g4, fontFamily: F, lineHeight: "20px" }}>
            Set audit frequency, assign teams, and configure notifications.<br />
            This step will be built in the next phase.
          </p>
        </div>

        {/* Footer — no Next button on last step */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={onBack}
            style={{ background: "none", border: "none", color: C.g5, fontSize: 13, fontWeight: 500, fontFamily: F, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: "8px 0" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C.g6; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.g5; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back: Questions
          </button>
        </div>
      </div>
    </div>
  );
}
