import AppSidebar from "../AppSidebar.jsx";
import { LOCATIONS_ALL } from "./auditStubData.js";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = { navy:"#001e76", navyDeep:"#16191d", textSec:"#555f6d", textMuted:"#8692a2",
  bgApp:"#f4f4f6", bgSurf:"#ffffff", border:"#e2e5e9", primary:"#2226f7", primaryBg:"#d4e2ff" };

export default function LocationRecordStub({ locationId, locationName, fromAudit, onNav }) {
  const loc = LOCATIONS_ALL.find(l => l.id === locationId) || { name: locationName || "Location", city:"—", state:"—", region:"—" };

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:F, background:C.bgApp }}>
      <AppSidebar activeId="audits" onNav={onNav} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ height:52, background:C.bgSurf, borderBottom:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", padding:"0 24px", gap:12 }}>
          <button onClick={() => fromAudit ? onNav("audit_record", { auditId: fromAudit }) : onNav("audits")}
            style={{ display:"flex", alignItems:"center", gap:4, color:C.primary, background:"none", border:"none",
              cursor:"pointer", fontSize:12, fontFamily:F }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            {fromAudit ? "Back to Audit" : "All Audits"}
          </button>
        </div>

        <div style={{ flex:1, display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:60 }}>
          <div style={{ background:C.bgSurf, border:`1px solid ${C.border}`, borderRadius:12, padding:40, width:500, textAlign:"center" }}>
            <div style={{ width:56, height:56, borderRadius:14, background:C.primaryBg,
              display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div style={{ fontSize:22, fontWeight:800, color:C.navyDeep, fontFamily:F, marginBottom:4 }}>{loc.name}</div>
            <div style={{ fontSize:14, color:C.textMuted, fontFamily:F, marginBottom:4 }}>
              {loc.city}, {loc.state} · {loc.region} Region
            </div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px",
              background:"#fef9c3", borderRadius:20, marginTop:16, marginBottom:20 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a16207" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize:12, fontWeight:600, color:"#a16207", fontFamily:F }}>Location Record · Full view available in R1</span>
            </div>
            <div style={{ fontSize:12, color:C.textSec, fontFamily:F, lineHeight:1.7 }}>
              The Location Record page (R1) will include audit history, open action plans, compliance trends, team roster, and facility details for this location.
            </div>
            {fromAudit && (
              <button onClick={() => onNav("audit_record", { auditId: fromAudit })}
                style={{ marginTop:24, padding:"8px 20px", borderRadius:8, border:`1px solid ${C.border}`,
                  background:C.bgSurf, color:C.navy, fontSize:12, fontFamily:F, cursor:"pointer", fontWeight:600 }}>
                ← Back to Audit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
