// Stub data for Locations list page and Location record page
import { AUDITS_50, TEMPLATES_ALL, PROGRAMS_ALL } from "./auditStubData.js";
import { EMPLOYEES_25 } from "./employeeStubData.js";

export const LOCATIONS_30 = [
  // ── Northeast ──────────────────────────────────────────────────────────────
  { id:"L001", name:"New York Central",      storeNum:"NYC-001", address:"1540 Broadway",            city:"New York",       state:"NY", zip:"10036", region:"Northeast", district:"NY Metro",     type:"Store", status:"active",             isCritical:false, complianceScore:92, openAPs:2, lastAuditDate:"Apr 22, 2026", lastAuditId:"A001", regionalMgrId:"E004", districtMgrId:"E001", storeMgrId:null,   employeeCount:18, programIds:["P001","P002","P005"], phone:"(212) 555-0100", hours:"Mon–Sun 8am–10pm" },
  { id:"L002", name:"Boston Newbury",        storeNum:"BOS-002", address:"234 Newbury Street",       city:"Boston",         state:"MA", zip:"02116", region:"Northeast", district:"New England",  type:"Store", status:"active",             isCritical:false, complianceScore:82, openAPs:3, lastAuditDate:"Apr 18, 2026", lastAuditId:"A002", regionalMgrId:"E004", districtMgrId:null,   storeMgrId:"E002", employeeCount:14, programIds:["P001","P002","P005"], phone:"(617) 555-0183", hours:"Mon–Sat 9am–9pm, Sun 11am–7pm" },
  { id:"L003", name:"Chicago Wacker",        storeNum:"CHI-003", address:"311 W Wacker Drive",       city:"Chicago",        state:"IL", zip:"60606", region:"Midwest",   district:"IL/IN",        type:"Store", status:"active",             isCritical:false, complianceScore:88, openAPs:1, lastAuditDate:"Apr 23, 2026", lastAuditId:"A019", regionalMgrId:null,   districtMgrId:"E003", storeMgrId:null,   employeeCount:22, programIds:["P001","P003","P005"], phone:"(312) 555-0291", hours:"Mon–Sat 8am–9pm, Sun 10am–6pm" },
  { id:"L004", name:"LA Westside",           storeNum:"LAX-004", address:"10250 Santa Monica Blvd", city:"Los Angeles",    state:"CA", zip:"90067", region:"West",      district:"CA/NV",        type:"Store", status:"active",             isCritical:false, complianceScore:85, openAPs:2, lastAuditDate:"Apr 20, 2026", lastAuditId:"A012", regionalMgrId:"E025", districtMgrId:"E019", storeMgrId:"E024", employeeCount:20, programIds:["P001","P004","P005"], phone:"(310) 555-0404", hours:"Mon–Sun 9am–9pm" },
  { id:"L005", name:"Philadelphia Main",     storeNum:"PHL-005", address:"1500 Market Street",       city:"Philadelphia",   state:"PA", zip:"19102", region:"Northeast", district:"Mid-Atlantic", type:"Store", status:"active",             isCritical:false, complianceScore:87, openAPs:2, lastAuditDate:"Apr 16, 2026", lastAuditId:"A049", regionalMgrId:"E004", districtMgrId:"E001", storeMgrId:"E005", employeeCount:16, programIds:["P001","P002","P005"], phone:"(215) 555-0500", hours:"Mon–Sat 8am–9pm, Sun 10am–7pm" },
  { id:"L006", name:"Atlanta Perimeter",     storeNum:"ATL-006", address:"4400 Ashford Dunwoody Rd", city:"Atlanta",        state:"GA", zip:"30346", region:"Southeast", district:"GA/TN",        type:"Store", status:"active",             isCritical:false, complianceScore:89, openAPs:1, lastAuditDate:"Apr 25, 2026", lastAuditId:"A033", regionalMgrId:null,   districtMgrId:null,   storeMgrId:"E020", employeeCount:17, programIds:["P001","P005","P006"], phone:"(404) 555-0600", hours:"Mon–Sat 9am–9pm, Sun 12pm–6pm" },
  { id:"L007", name:"Seattle Pike",          storeNum:"SEA-007", address:"1501 Pike Place",          city:"Seattle",        state:"WA", zip:"98101", region:"West",      district:"Pacific NW",   type:"Store", status:"active",             isCritical:true,  complianceScore:63, openAPs:6, lastAuditDate:"Apr 2,  2026", lastAuditId:"A007", regionalMgrId:"E025", districtMgrId:null,   storeMgrId:null,   employeeCount:13, programIds:["P001","P004","P005"], phone:"(206) 555-0700", hours:"Mon–Sun 7am–8pm" },
  { id:"L008", name:"Dallas Galleria",       storeNum:"DAL-008", address:"13350 Dallas Pkwy",        city:"Dallas",         state:"TX", zip:"75240", region:"South",     district:"TX Metro",     type:"Store", status:"active",             isCritical:false, complianceScore:96, openAPs:0, lastAuditDate:"Apr 24, 2026", lastAuditId:"A011", regionalMgrId:"E025", districtMgrId:null,   storeMgrId:null,   employeeCount:24, programIds:["P001","P004","P005","P006"], phone:"(214) 555-0800", hours:"Mon–Sat 8am–10pm, Sun 11am–8pm" },
  { id:"L009", name:"Denver 16th St",        storeNum:"DEN-009", address:"1600 16th Street Mall",    city:"Denver",         state:"CO", zip:"80202", region:"West",      district:"Mountain",     type:"Store", status:"active",             isCritical:false, complianceScore:88, openAPs:3, lastAuditDate:"Apr 20, 2026", lastAuditId:"A043", regionalMgrId:"E025", districtMgrId:null,   storeMgrId:null,   employeeCount:15, programIds:["P001","P004","P005"], phone:"(720) 555-0900", hours:"Mon–Sat 9am–9pm, Sun 11am–7pm" },
  { id:"L010", name:"Miami Flagler",         storeNum:"MIA-010", address:"8 W Flagler Street",       city:"Miami",          state:"FL", zip:"33130", region:"Southeast", district:"Florida",      type:"Store", status:"active",             isCritical:true,  complianceScore:74, openAPs:5, lastAuditDate:"Apr 23, 2026", lastAuditId:"A047", regionalMgrId:null,   districtMgrId:null,   storeMgrId:null,   employeeCount:16, programIds:["P001","P005","P006"], phone:"(305) 555-1000", hours:"Mon–Sat 9am–10pm, Sun 12pm–8pm" },
  { id:"L011", name:"Hartford Downtown",     storeNum:"HFD-011", address:"100 Constitution Plaza",   city:"Hartford",       state:"CT", zip:"06103", region:"Northeast", district:"New England",  type:"Store", status:"active",             isCritical:true,  complianceScore:69, openAPs:4, lastAuditDate:"Apr 6,  2026", lastAuditId:"A041", regionalMgrId:"E004", districtMgrId:null,   storeMgrId:null,   employeeCount:11, programIds:["P001","P002","P005"], phone:"(860) 555-1100", hours:"Mon–Fri 8am–8pm, Sat 9am–7pm" },
  { id:"L012", name:"Nashville Green Hills", storeNum:"NSH-012", address:"2126 Abbott Martin Rd",    city:"Nashville",      state:"TN", zip:"37215", region:"Southeast", district:"GA/TN",        type:"Store", status:"active",             isCritical:false, complianceScore:79, openAPs:2, lastAuditDate:"Apr 10, 2026", lastAuditId:"A045", regionalMgrId:null,   districtMgrId:null,   storeMgrId:null,   employeeCount:13, programIds:["P001","P005","P006"], phone:"(615) 555-1200", hours:"Mon–Sat 9am–9pm, Sun 12pm–6pm" },
  // ── Northeast new ──────────────────────────────────────────────────────────
  { id:"L013", name:"Newark Penn Plaza",     storeNum:"EWR-013", address:"1 Penn Plaza East",        city:"Newark",         state:"NJ", zip:"07105", region:"Northeast", district:"NY Metro",     type:"Store", status:"active",             isCritical:false, complianceScore:83, openAPs:2, lastAuditDate:"Apr 15, 2026", lastAuditId:null,   regionalMgrId:"E004", districtMgrId:"E001", storeMgrId:null,   employeeCount:14, programIds:["P001","P002","P005"], phone:"(973) 555-1300", hours:"Mon–Sat 8am–9pm, Sun 10am–7pm" },
  { id:"L014", name:"Providence Gateway",    storeNum:"PVD-014", address:"1 Kennedy Plaza",          city:"Providence",     state:"RI", zip:"02903", region:"Northeast", district:"New England",  type:"Store", status:"active",             isCritical:false, complianceScore:91, openAPs:1, lastAuditDate:"Apr 11, 2026", lastAuditId:null,   regionalMgrId:"E004", districtMgrId:null,   storeMgrId:null,   employeeCount:10, programIds:["P001","P002","P005"], phone:"(401) 555-1400", hours:"Mon–Sat 9am–8pm, Sun 11am–6pm" },
  { id:"L015", name:"Baltimore Harbor",      storeNum:"BWI-015", address:"201 E Pratt Street",       city:"Baltimore",      state:"MD", zip:"21202", region:"Northeast", district:"Mid-Atlantic", type:"Store", status:"active",             isCritical:false, complianceScore:77, openAPs:3, lastAuditDate:"Apr 9,  2026", lastAuditId:null,   regionalMgrId:"E004", districtMgrId:"E001", storeMgrId:null,   employeeCount:15, programIds:["P001","P002","P005"], phone:"(410) 555-1500", hours:"Mon–Sat 8am–9pm, Sun 11am–7pm" },
  // ── Southeast new ──────────────────────────────────────────────────────────
  { id:"L016", name:"Charlotte Uptown",      storeNum:"CLT-016", address:"100 N Tryon Street",       city:"Charlotte",      state:"NC", zip:"28202", region:"Southeast", district:"GA/TN",        type:"Store", status:"active",             isCritical:false, complianceScore:86, openAPs:2, lastAuditDate:"Apr 14, 2026", lastAuditId:null,   regionalMgrId:null,   districtMgrId:null,   storeMgrId:null,   employeeCount:16, programIds:["P001","P005","P006"], phone:"(704) 555-1600", hours:"Mon–Sat 9am–9pm, Sun 12pm–7pm" },
  { id:"L017", name:"Orlando International", storeNum:"MCO-017", address:"9350 International Dr",    city:"Orlando",        state:"FL", zip:"32819", region:"Southeast", district:"Florida",      type:"Store", status:"active",             isCritical:false, complianceScore:90, openAPs:1, lastAuditDate:"Apr 17, 2026", lastAuditId:null,   regionalMgrId:null,   districtMgrId:null,   storeMgrId:null,   employeeCount:21, programIds:["P001","P005","P006"], phone:"(407) 555-1700", hours:"Mon–Sun 9am–10pm" },
  { id:"L018", name:"Tampa Bay Plaza",       storeNum:"TPA-018", address:"2223 N Westshore Blvd",    city:"Tampa",          state:"FL", zip:"33607", region:"Southeast", district:"Florida",      type:"Store", status:"active",             isCritical:false, complianceScore:81, openAPs:3, lastAuditDate:"Apr 8,  2026", lastAuditId:null,   regionalMgrId:null,   districtMgrId:null,   storeMgrId:null,   employeeCount:18, programIds:["P001","P005","P006"], phone:"(813) 555-1800", hours:"Mon–Sat 9am–9pm, Sun 11am–7pm" },
  // ── Midwest new ────────────────────────────────────────────────────────────
  { id:"L019", name:"Chicago O'Hare DC",     storeNum:"CHI-019", address:"10000 W O'Hare Ave",       city:"Chicago",        state:"IL", zip:"60666", region:"Midwest",   district:"IL/IN",        type:"DC",    status:"active",             isCritical:false, complianceScore:94, openAPs:1, lastAuditDate:"Apr 19, 2026", lastAuditId:null,   regionalMgrId:null,   districtMgrId:"E003", storeMgrId:null,   employeeCount:35, programIds:["P001","P003","P005"], phone:"(773) 555-1900", hours:"24/7 operations" },
  { id:"L020", name:"Minneapolis Mall",      storeNum:"MSP-020", address:"60 E Broadway",            city:"Minneapolis",    state:"MN", zip:"55425", region:"Midwest",   district:"Upper Midwest", type:"Store", status:"active",             isCritical:false, complianceScore:87, openAPs:2, lastAuditDate:"Apr 13, 2026", lastAuditId:null,   regionalMgrId:null,   districtMgrId:null,   storeMgrId:null,   employeeCount:17, programIds:["P001","P003","P005"], phone:"(612) 555-2000", hours:"Mon–Sat 10am–9pm, Sun 11am–7pm" },
  { id:"L021", name:"Columbus Easton",       storeNum:"CMH-021", address:"3 Limited Pkwy",           city:"Columbus",       state:"OH", zip:"43230", region:"Midwest",   district:"Upper Midwest", type:"Store", status:"active",             isCritical:false, complianceScore:84, openAPs:2, lastAuditDate:"Apr 7,  2026", lastAuditId:null,   regionalMgrId:null,   districtMgrId:null,   storeMgrId:null,   employeeCount:14, programIds:["P001","P003","P005"], phone:"(614) 555-2100", hours:"Mon–Sat 9am–9pm, Sun 12pm–6pm" },
  { id:"L022", name:"Detroit Riverfront",    storeNum:"DTW-022", address:"400 Renaissance Ctr",      city:"Detroit",        state:"MI", zip:"48243", region:"Midwest",   district:"Upper Midwest", type:"Store", status:"active",             isCritical:true,  complianceScore:61, openAPs:7, lastAuditDate:"Apr 4,  2026", lastAuditId:null,   regionalMgrId:null,   districtMgrId:null,   storeMgrId:null,   employeeCount:12, programIds:["P001","P003","P005"], phone:"(313) 555-2200", hours:"Mon–Sat 9am–8pm, Sun 12pm–6pm" },
  // ── West new ───────────────────────────────────────────────────────────────
  { id:"L023", name:"Portland Pearl",        storeNum:"PDX-023", address:"1000 NW 23rd Ave",         city:"Portland",       state:"OR", zip:"97210", region:"West",      district:"Pacific NW",   type:"Store", status:"active",             isCritical:false, complianceScore:89, openAPs:1, lastAuditDate:"Apr 16, 2026", lastAuditId:null,   regionalMgrId:"E025", districtMgrId:null,   storeMgrId:null,   employeeCount:14, programIds:["P001","P004","P005"], phone:"(503) 555-2300", hours:"Mon–Sun 8am–9pm" },
  { id:"L024", name:"San Francisco Union Sq", storeNum:"SFO-024", address:"180 Post Street",         city:"San Francisco",  state:"CA", zip:"94108", region:"West",      district:"CA/NV",        type:"Store", status:"active",             isCritical:false, complianceScore:91, openAPs:1, lastAuditDate:"Apr 20, 2026", lastAuditId:null,   regionalMgrId:"E025", districtMgrId:"E019", storeMgrId:null,   employeeCount:22, programIds:["P001","P004","P005"], phone:"(415) 555-2400", hours:"Mon–Sat 9am–9pm, Sun 11am–8pm" },
  { id:"L025", name:"Las Vegas Strip",       storeNum:"LAS-025", address:"3200 S Las Vegas Blvd",    city:"Las Vegas",      state:"NV", zip:"89109", region:"West",      district:"CA/NV",        type:"Store", status:"active",             isCritical:false, complianceScore:78, openAPs:4, lastAuditDate:"Apr 12, 2026", lastAuditId:null,   regionalMgrId:"E025", districtMgrId:"E019", storeMgrId:null,   employeeCount:26, programIds:["P001","P004","P005"], phone:"(702) 555-2500", hours:"Mon–Sun 7am–11pm" },
  { id:"L026", name:"Salt Lake City Center", storeNum:"SLC-026", address:"50 S Main Street",         city:"Salt Lake City", state:"UT", zip:"84101", region:"West",      district:"Mountain",     type:"Store", status:"under_construction",  isCritical:false, complianceScore:null, openAPs:0, lastAuditDate:null,           lastAuditId:null,   regionalMgrId:"E025", districtMgrId:null,   storeMgrId:null,   employeeCount:0,  programIds:[],                     phone:"(801) 555-2600", hours:"Opening Q3 2026" },
  // ── South new ──────────────────────────────────────────────────────────────
  { id:"L027", name:"Houston Memorial",      storeNum:"HOU-027", address:"900 Town & Country Blvd",  city:"Houston",        state:"TX", zip:"77024", region:"South",     district:"TX Metro",     type:"Store", status:"active",             isCritical:false, complianceScore:82, openAPs:3, lastAuditDate:"Apr 14, 2026", lastAuditId:null,   regionalMgrId:"E025", districtMgrId:null,   storeMgrId:null,   employeeCount:19, programIds:["P001","P005","P006"], phone:"(713) 555-2700", hours:"Mon–Sat 9am–9pm, Sun 11am–7pm" },
  { id:"L028", name:"Austin Domain DC",      storeNum:"AUS-028", address:"11410 Century Oaks Ter",   city:"Austin",         state:"TX", zip:"78758", region:"South",     district:"TX Metro",     type:"DC",    status:"active",             isCritical:false, complianceScore:95, openAPs:0, lastAuditDate:"Apr 21, 2026", lastAuditId:null,   regionalMgrId:"E025", districtMgrId:null,   storeMgrId:null,   employeeCount:40, programIds:["P001","P004","P005"], phone:"(512) 555-2800", hours:"24/7 operations" },
  { id:"L029", name:"San Antonio Riverwalk", storeNum:"SAT-029", address:"849 E Commerce Street",    city:"San Antonio",    state:"TX", zip:"78205", region:"South",     district:"Gulf Coast",   type:"Store", status:"active",             isCritical:false, complianceScore:76, openAPs:4, lastAuditDate:"Apr 5,  2026", lastAuditId:null,   regionalMgrId:"E025", districtMgrId:null,   storeMgrId:null,   employeeCount:15, programIds:["P001","P005","P006"], phone:"(210) 555-2900", hours:"Mon–Sat 9am–9pm, Sun 12pm–7pm" },
  { id:"L030", name:"New Orleans Magazine",  storeNum:"MSY-030", address:"901 Magazine Street",      city:"New Orleans",    state:"LA", zip:"70130", region:"South",     district:"Gulf Coast",   type:"Store", status:"inactive",           isCritical:true,  complianceScore:68, openAPs:6, lastAuditDate:"Mar 15, 2026", lastAuditId:null,   regionalMgrId:"E025", districtMgrId:null,   storeMgrId:null,   employeeCount:0,  programIds:["P001","P005","P006"], phone:"(504) 555-3000", hours:"Temporarily closed" },
];

export function locById(id) { return LOCATIONS_30.find(l => l.id === id) || null; }

// ─── Detail Generator ─────────────────────────────────────────────────────────

const PROGRAM_META = {
  P001:{ type:"Safety",          cadence:"Monthly",   templateCount:2 },
  P002:{ type:"Loss Prevention", cadence:"Quarterly", templateCount:3 },
  P003:{ type:"Operations",      cadence:"Weekly",    templateCount:2 },
  P004:{ type:"Safety",          cadence:"Quarterly", templateCount:1 },
  P005:{ type:"Compliance",      cadence:"Quarterly", templateCount:2 },
  P006:{ type:"Loss Prevention", cadence:"Monthly",   templateCount:3 },
};

const REGION_STUB_MGRS = {
  "Midwest":   { id:"EXT-001", name:"Brendan Nakamura", initials:"BN", role:"Regional Manager" },
  "Southeast": { id:"EXT-002", name:"Rita Thompson",    initials:"RT", role:"Regional Manager" },
};

const AP_TITLES = [
  "Replace missing fire extinguisher tags",
  "Clear aisle obstruction near stockroom entrance",
  "Update SDS binder with new chemical entries",
  "Schedule PPE condition re-inspection",
  "Repair broken exit sign in section B",
  "Conduct follow-up employee HazCom training",
  "Install anti-slip mat at north entrance",
  "Document counterfeit detection procedure",
  "Resolve overdue lockout/tagout certification",
  "Post OSHA 300A summary in employee area",
  "Review and re-train on cash drawer tolerance policy",
  "Replace worn safety flooring near entry",
  "Update emergency evacuation floor plan",
  "Complete annual fire drill documentation",
  "Verify chemical storage labeling compliance",
];

const CRIT_QUESTIONS = [
  "Are all emergency exits clearly marked and unobstructed?",
  "Is sprinkler system last inspection within 12 months?",
  "Are all required PPE types stocked and available for all job functions?",
  "Are electrical panels accessible and properly labeled?",
  "Are extinguisher inspection tags current within 12 months?",
  "Are all hard hats free of cracks, dents, or deformities?",
  "Are sprinkler heads free of obstructions (18-inch clearance)?",
];

const MONTH_NUM = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
function parseDateStr(s) {
  if (!s) return 0;
  const p = s.trim().split(/\s+/);
  return new Date(parseInt(p[2]||"2026"), MONTH_NUM[p[0]]??0, parseInt(p[1])||1).getTime();
}

function makeLcg(seed) {
  let s = ((Math.abs(seed) * 1664525) + 1013904223) >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}

export function getLocationDetail(locationId) {
  const loc = LOCATIONS_30.find(l => l.id === locationId);
  if (!loc) return null;

  const locNum = parseInt(locationId.slice(1));
  const rng = makeLcg(locNum);

  // ── Resolve managers ──────────────────────────────────────────────────────
  function resolveMgr(id, fallbackRegion) {
    if (id) return EMPLOYEES_25.find(e => e.id === id) || null;
    return fallbackRegion ? (REGION_STUB_MGRS[fallbackRegion] || null) : null;
  }
  const regionalMgr = resolveMgr(loc.regionalMgrId, loc.region);
  const districtMgr = resolveMgr(loc.districtMgrId, null);
  const storeMgr    = resolveMgr(loc.storeMgrId, null);

  // ── Recent audits ─────────────────────────────────────────────────────────
  const realAudits = AUDITS_50
    .filter(a => a.lId === locationId)
    .map(a => {
      const tpl = TEMPLATES_ALL.find(t => t.id === a.tId) || {};
      const aud = EMPLOYEES_25.find(e => e.id === a.eId) || {};
      return { ...a, templateName:`${tpl.name||""} ${tpl.version||""}`.trim(),
        auditorName:aud.name||"—", auditorId:a.eId };
    });

  const syntheticAudits = [];
  if (realAudits.length === 0) {
    const base = loc.complianceScore || 75;
    [["T001","P001","Apr 18, 2026"],["T005","P005","Mar 25, 2026"],["T004","P005","Mar 10, 2026"]].forEach(([tId,pId,date], i) => {
      const tpl = TEMPLATES_ALL.find(t => t.id === tId) || {};
      const score = Math.max(50, Math.min(100, Math.round(base + (rng()*12-6))));
      syntheticAudits.push({
        id:`A${100+locNum*3+i}`, name:`${tpl.name} ${tpl.version} — ${loc.name}`,
        tId, pId, lId:locationId, eId:"E001", status:"completed",
        score, cf:score<70?Math.floor(rng()*3):0, ap:score<85?Math.floor(rng()*3)+1:0,
        date, templateName:`${tpl.name} ${tpl.version}`, auditorName:"Marcus King", auditorId:"E001",
      });
    });
  }

  const allAudits = [...realAudits, ...syntheticAudits]
    .sort((a,b) => parseDateStr(b.date) - parseDateStr(a.date));

  // ── Action plans ──────────────────────────────────────────────────────────
  const AP_STATUSES  = ["open","in_progress","overdue"];
  const AP_PRIORITIES = ["high","medium","low"];
  const AP_DUE = ["May 5, 2026","May 12, 2026","May 20, 2026","Jun 1, 2026","Jun 15, 2026"];
  const auditorPool = EMPLOYEES_25.filter(e => e.isAuditor);
  const totalAPs = Math.max(loc.openAPs + 2, 4);

  const actionPlans = Array.from({ length: totalAPs }, (_, i) => ({
    id:`LAP-${locationId}-${i}`,
    title: AP_TITLES[(locNum + i*3) % AP_TITLES.length],
    originAuditId:   allAudits[i % Math.max(allAudits.length,1)]?.id   || null,
    originAuditName: allAudits[i % Math.max(allAudits.length,1)]?.name || "—",
    assignedToId:    auditorPool[i % auditorPool.length]?.id   || "E001",
    assignedToName:  auditorPool[i % auditorPool.length]?.name || "Marcus King",
    dueDate:  AP_DUE[i % AP_DUE.length],
    status:   i < loc.openAPs ? AP_STATUSES[Math.floor(rng()*3)] : "completed",
    priority: AP_PRIORITIES[Math.floor(rng()*3)],
  }));

  // ── Employees on-site ─────────────────────────────────────────────────────
  const employees = EMPLOYEES_25.filter(e => e.lId === locationId);

  // ── Programs ──────────────────────────────────────────────────────────────
  const base = loc.complianceScore || 75;
  const programs = loc.programIds.map(pId => {
    const prog = PROGRAMS_ALL.find(p => p.id === pId) || { id:pId, name:"Unknown Program" };
    const meta = PROGRAM_META[pId] || { type:"Other", cadence:"Quarterly", templateCount:1 };
    return { ...prog, ...meta,
      locationScore: Math.max(50, Math.min(100, Math.round(base + (rng()*14-7)))),
      lastAuditDate: allAudits[0]?.date || "—" };
  });

  // ── Critical question patterns ────────────────────────────────────────────
  const patternCount = Math.min(6, Math.max(3, Math.floor(rng()*4)+3));
  const criticalPatterns = CRIT_QUESTIONS.slice(0, patternCount).map((q, i) => {
    const fails = Math.floor(rng()*4)+1;
    const total = fails + Math.floor(rng()*6)+2;
    return { question:q, failCount:fails, failRate:Math.round((fails/total)*100),
      lastFailDate: allAudits[i % Math.max(allAudits.length,1)]?.date || "Apr 2, 2026",
      lastFailAuditId: allAudits[i % Math.max(allAudits.length,1)]?.id || "A001",
      trend:["improving","worsening","stable"][Math.floor(rng()*3)] };
  });

  // ── Performance trend (6 months Nov→Apr) ─────────────────────────────────
  const perfTrend = Array.from({ length:6 }, (_, i) =>
    Math.max(50, Math.min(100, Math.round(base - 5 + (rng()*8) + i*0.8)))
  );

  // ── Comparison strip ──────────────────────────────────────────────────────
  const districtAvg  = Math.max(60, Math.min(99, Math.round(base + (rng()*14-7))));
  const regionAvg    = Math.max(60, Math.min(99, Math.round(base + (rng()*10-5))));
  const topPeerScore = Math.min(100, Math.round(Math.max(base,districtAvg) + Math.floor(rng()*10)+3));
  const topPeerName  = ["Dallas Galleria","Boston Newbury","Austin Domain DC","LA Westside","NY Central"][Math.floor(rng()*5)];

  // ── Report data ───────────────────────────────────────────────────────────
  const MONTHS_SHORT = ["Nov","Dec","Jan","Feb","Mar","Apr"];
  const scoreTrend    = perfTrend;
  const districtTrend = perfTrend.map(v => Math.max(60, Math.min(99, Math.round(v+(rng()*8-4)))));
  const regionTrend   = perfTrend.map(v => Math.max(60, Math.min(99, Math.round(v+(rng()*6-3)))));
  const volumeTrend   = MONTHS_SHORT.map(() => Math.floor(rng()*5)+2);
  const apResolution  = [
    { label:"0–7 days",  count: Math.floor(rng()*8)+2 },
    { label:"8–14 days", count: Math.floor(rng()*12)+4 },
    { label:"15–30 days",count: Math.floor(rng()*10)+3 },
    { label:"30+ days",  count: Math.floor(rng()*6)+1 },
  ];
  const missedQs = CRIT_QUESTIONS.slice(0,5).map((q,i) => ({
    question: q.length > 42 ? q.slice(0,42)+"…" : q,
    count: Math.floor(rng()*8) + (5 - i),
  })).sort((a,b) => b.count - a.count);
  const peers = [
    { name: loc.name, score: base, isThis: true },
    { name:"Dallas Galleria",  score: Math.round(base + (rng()*20-10)) },
    { name:"Boston Newbury",   score: Math.round(base + (rng()*20-10)) },
    { name:"Orlando Intl",     score: Math.round(base + (rng()*20-10)) },
    { name:"Denver 16th St",   score: Math.round(base + (rng()*20-10)) },
  ].map(p => ({ ...p, score: Math.max(50, Math.min(100, p.score)) }));

  return {
    loc: { ...loc, regionalMgr, districtMgr, storeMgr },
    recentAudits: allAudits,
    actionPlans,
    employees,
    programs,
    criticalPatterns,
    perfTrend,
    districtAvg, regionAvg, topPeerScore, topPeerName,
    reportData: { scoreTrend, districtTrend, regionTrend, volumeTrend, apResolution, missedQs, peers, MONTHS_SHORT },
  };
}
