const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy: "#001e76", white: "#ffffff",
  g1: "#f4f4f6", g2: "#e2e5e9", g3: "#c3c8d0", g4: "#8692a2", g5: "#555f6d", g6: "#16191d",
};

export default function Step5EscalationStub({ onBack }) {
  return (
    <div style={{ padding:"40px 24px 80px", display:"flex", justifyContent:"center", fontFamily:F }}>
      <div style={{ width:"100%", maxWidth:1080 }}>

        <div style={{ background:C.white, borderRadius:12, border:`1px dashed ${C.g3}`, padding:"56px 36px", textAlign:"center", marginBottom:24 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:C.g1, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h2 style={{ margin:"0 0 8px", fontSize:16, fontWeight:700, color:C.g6, fontFamily:F }}>
            Step 5 — Escalation
          </h2>
          <p style={{ margin:0, fontSize:13, color:C.g4, fontFamily:F, lineHeight:"20px" }}>
            Configure escalation rules, thresholds, and notification routing.<br />
            This step will be built in the next phase.
          </p>
        </div>

        <div style={{ display:"flex", alignItems:"center" }}>
          <button onClick={onBack}
            style={{ background:"none", border:"none", color:C.g5, fontSize:13, fontWeight:500, fontFamily:F, cursor:"pointer", display:"flex", alignItems:"center", gap:5, padding:"8px 0" }}
            onMouseEnter={e => { e.currentTarget.style.color = C.g6; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.g5; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back: Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
