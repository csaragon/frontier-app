// Stub data for Audits list page and Audit record page

export const LOCATIONS_ALL = [
  { id:"L001", name:"New York Central",     city:"New York",     state:"NY", region:"Northeast" },
  { id:"L002", name:"Boston Newbury",       city:"Boston",       state:"MA", region:"Northeast" },
  { id:"L003", name:"Chicago Wacker",       city:"Chicago",      state:"IL", region:"Midwest"   },
  { id:"L004", name:"LA Westside",          city:"Los Angeles",  state:"CA", region:"West"      },
  { id:"L005", name:"Philadelphia Main",    city:"Philadelphia", state:"PA", region:"Northeast" },
  { id:"L006", name:"Atlanta Perimeter",    city:"Atlanta",      state:"GA", region:"Southeast" },
  { id:"L007", name:"Seattle Pike",         city:"Seattle",      state:"WA", region:"West"      },
  { id:"L008", name:"Dallas Galleria",      city:"Dallas",       state:"TX", region:"South"     },
  { id:"L009", name:"Denver 16th St",       city:"Denver",       state:"CO", region:"West"      },
  { id:"L010", name:"Miami Flagler",        city:"Miami",        state:"FL", region:"Southeast" },
  { id:"L011", name:"Hartford Downtown",    city:"Hartford",     state:"CT", region:"Northeast" },
  { id:"L012", name:"Nashville Green Hills",city:"Nashville",    state:"TN", region:"Southeast" },
];

export const AUDITORS_ALL = [
  { id:"E001", name:"Marcus King",     role:"District Manager",           initials:"MK", email:"m.king@thinklp.com" },
  { id:"E002", name:"Sarah Patel",     role:"Store Manager",              initials:"SP", email:"s.patel@thinklp.com" },
  { id:"E003", name:"Tom Wu",          role:"District Manager",           initials:"TW", email:"t.wu@thinklp.com" },
  { id:"E004", name:"Linda Chen",      role:"Regional Manager",           initials:"LC", email:"l.chen@thinklp.com" },
  { id:"E005", name:"James Rodriguez", role:"Store Manager",              initials:"JR", email:"j.rodriguez@thinklp.com" },
  { id:"E006", name:"Rachel Torres",   role:"Loss Prevention Specialist", initials:"RT", email:"r.torres@thinklp.com" },
];

export const PROGRAMS_ALL = [
  { id:"P001", name:"Fire Safety — National"         },
  { id:"P002", name:"LP Compliance — Northeast"      },
  { id:"P003", name:"Operations Standards — Midwest" },
  { id:"P004", name:"PPE Compliance — West Region"   },
  { id:"P005", name:"OSHA Compliance — All Regions"  },
  { id:"P006", name:"Shrink Prevention — Southeast"  },
];

export const TEMPLATES_ALL = [
  { id:"T001", name:"Fire Safety Audit",       version:"v3" },
  { id:"T002", name:"Slip Trip & Fall",         version:"v1" },
  { id:"T003", name:"PPE Compliance",           version:"v2" },
  { id:"T004", name:"OSHA Compliance",          version:"v2" },
  { id:"T005", name:"Retail Store Safety",      version:"v2" },
  { id:"T006", name:"LP Standard Compliance",   version:"v1" },
  { id:"T007", name:"Emergency Preparedness",   version:"v1" },
  { id:"T008", name:"Cash Handling Compliance", version:"v1" },
];

// ─── 50 Audit Records ────────────────────────────────────────────────────────
// status: "completed" | "in_progress" | "overdue" | "not_started"
// date: completed→completion date, in_progress→last updated, overdue→due date, not_started→scheduled date
// cf = criticalFails, ap = actionPlansCount

export const AUDITS_50 = [
  // ── Fire Safety Audit v3 (A001–A010) ──
  { id:"A001", name:"Fire Safety Audit v3 — NY Central",          tId:"T001", pId:"P001", lId:"L001", eId:"E001", status:"completed",   score:94, cf:0, ap:1, date:"Apr 22, 2026", schedule:"Recurring monthly", photos:3 },
  { id:"A002", name:"Fire Safety Audit v3 — Boston Newbury",      tId:"T001", pId:"P001", lId:"L002", eId:"E002", status:"completed",   score:78, cf:1, ap:2, date:"Apr 18, 2026", schedule:"Recurring monthly", photos:2 },
  { id:"A003", name:"Fire Safety Audit v3 — Chicago Wacker",      tId:"T001", pId:"P001", lId:"L003", eId:"E003", status:"completed",   score:88, cf:0, ap:1, date:"Apr 15, 2026", schedule:"Recurring monthly", photos:1 },
  { id:"A004", name:"Fire Safety Audit v3 — LA Westside",         tId:"T001", pId:"P001", lId:"L004", eId:"E004", status:"in_progress", score:null, cf:0, ap:0, date:"Apr 27, 2026", schedule:"Recurring monthly", photos:0 },
  { id:"A005", name:"Fire Safety Audit v3 — Philadelphia Main",   tId:"T001", pId:"P001", lId:"L005", eId:"E005", status:"overdue",     score:null, cf:0, ap:0, date:"Apr 10, 2026", schedule:"Recurring monthly", photos:0 },
  { id:"A006", name:"Fire Safety Audit v3 — Atlanta Perimeter",   tId:"T001", pId:"P001", lId:"L006", eId:"E006", status:"completed",   score:91, cf:0, ap:0, date:"Apr 5,  2026", schedule:"Recurring monthly", photos:2 },
  { id:"A007", name:"Fire Safety Audit v3 — Seattle Pike",        tId:"T001", pId:"P001", lId:"L007", eId:"E001", status:"completed",   score:63, cf:2, ap:4, date:"Apr 2,  2026", schedule:"Recurring monthly", photos:5 },
  { id:"A008", name:"Fire Safety Audit v3 — Dallas Galleria",     tId:"T001", pId:"P001", lId:"L008", eId:"E003", status:"not_started", score:null, cf:0, ap:0, date:"May 3,  2026", schedule:"Recurring monthly", photos:0 },
  { id:"A009", name:"Fire Safety Audit v3 — Denver 16th St",      tId:"T001", pId:"P001", lId:"L009", eId:"E002", status:"completed",   score:85, cf:0, ap:1, date:"Mar 28, 2026", schedule:"Recurring monthly", photos:1 },
  { id:"A010", name:"Fire Safety Audit v3 — Miami Flagler",       tId:"T001", pId:"P001", lId:"L010", eId:"E005", status:"overdue",     score:null, cf:0, ap:0, date:"Apr 8,  2026", schedule:"Recurring monthly", photos:0 },
  // ── PPE Compliance v2 (A011–A018) ──
  { id:"A011", name:"PPE Compliance v2 — Dallas Galleria",        tId:"T003", pId:"P004", lId:"L008", eId:"E004", status:"completed",   score:96, cf:0, ap:0, date:"Apr 24, 2026", schedule:"Recurring quarterly", photos:0 },
  { id:"A012", name:"PPE Compliance v2 — LA Westside",            tId:"T003", pId:"P004", lId:"L004", eId:"E006", status:"completed",   score:83, cf:0, ap:1, date:"Apr 20, 2026", schedule:"Recurring quarterly", photos:1 },
  { id:"A013", name:"PPE Compliance v2 — Seattle Pike",           tId:"T003", pId:"P004", lId:"L007", eId:"E001", status:"in_progress", score:null, cf:0, ap:0, date:"Apr 26, 2026", schedule:"Recurring quarterly", photos:0 },
  { id:"A014", name:"PPE Compliance v2 — Denver 16th St",         tId:"T003", pId:"P004", lId:"L009", eId:"E003", status:"completed",   score:65, cf:1, ap:2, date:"Apr 12, 2026", schedule:"Recurring quarterly", photos:2 },
  { id:"A015", name:"PPE Compliance v2 — Nashville Green Hills",  tId:"T003", pId:"P004", lId:"L012", eId:"E002", status:"overdue",     score:null, cf:0, ap:0, date:"Apr 7,  2026", schedule:"Recurring quarterly", photos:0 },
  { id:"A016", name:"PPE Compliance v2 — Hartford Downtown",      tId:"T003", pId:"P004", lId:"L011", eId:"E005", status:"completed",   score:89, cf:0, ap:1, date:"Apr 1,  2026", schedule:"Recurring quarterly", photos:1 },
  { id:"A017", name:"PPE Compliance v2 — Chicago Wacker",         tId:"T003", pId:"P004", lId:"L003", eId:"E004", status:"not_started", score:null, cf:0, ap:0, date:"May 5,  2026", schedule:"Recurring quarterly", photos:0 },
  { id:"A018", name:"PPE Compliance v2 — Boston Newbury",         tId:"T003", pId:"P004", lId:"L002", eId:"E006", status:"completed",   score:77, cf:1, ap:2, date:"Mar 25, 2026", schedule:"Recurring quarterly", photos:3 },
  // ── Slip Trip & Fall v1 (A019–A026) ──
  { id:"A019", name:"Slip Trip & Fall v1 — Chicago Wacker",       tId:"T002", pId:"P003", lId:"L003", eId:"E003", status:"completed",   score:92, cf:0, ap:0, date:"Apr 23, 2026", schedule:"Recurring weekly",   photos:1 },
  { id:"A020", name:"Slip Trip & Fall v1 — NY Central",           tId:"T002", pId:"P002", lId:"L001", eId:"E001", status:"completed",   score:81, cf:0, ap:1, date:"Apr 19, 2026", schedule:"Recurring weekly",   photos:0 },
  { id:"A021", name:"Slip Trip & Fall v1 — Atlanta Perimeter",    tId:"T002", pId:"P006", lId:"L006", eId:"E006", status:"in_progress", score:null, cf:0, ap:0, date:"Apr 27, 2026", schedule:"Recurring weekly",   photos:0 },
  { id:"A022", name:"Slip Trip & Fall v1 — Miami Flagler",        tId:"T002", pId:"P006", lId:"L010", eId:"E005", status:"completed",   score:58, cf:2, ap:3, date:"Apr 14, 2026", schedule:"Recurring weekly",   photos:4 },
  { id:"A023", name:"Slip Trip & Fall v1 — Seattle Pike",         tId:"T002", pId:"P004", lId:"L007", eId:"E002", status:"overdue",     score:null, cf:0, ap:0, date:"Apr 9,  2026", schedule:"Recurring weekly",   photos:0 },
  { id:"A024", name:"Slip Trip & Fall v1 — Philadelphia Main",    tId:"T002", pId:"P002", lId:"L005", eId:"E004", status:"completed",   score:87, cf:0, ap:1, date:"Apr 3,  2026", schedule:"Recurring weekly",   photos:1 },
  { id:"A025", name:"Slip Trip & Fall v1 — Hartford Downtown",    tId:"T002", pId:"P002", lId:"L011", eId:"E001", status:"not_started", score:null, cf:0, ap:0, date:"May 7,  2026", schedule:"Recurring weekly",   photos:0 },
  { id:"A026", name:"Slip Trip & Fall v1 — Nashville Green Hills",tId:"T002", pId:"P006", lId:"L012", eId:"E003", status:"completed",   score:73, cf:1, ap:2, date:"Mar 30, 2026", schedule:"Recurring weekly",   photos:2 },
  // ── OSHA Compliance v2 (A027–A032) ──
  { id:"A027", name:"OSHA Compliance v2 — NY Central",            tId:"T004", pId:"P005", lId:"L001", eId:"E004", status:"completed",   score:98, cf:0, ap:0, date:"Apr 21, 2026", schedule:"Recurring quarterly", photos:0 },
  { id:"A028", name:"OSHA Compliance v2 — Dallas Galleria",       tId:"T004", pId:"P005", lId:"L008", eId:"E005", status:"in_progress", score:null, cf:0, ap:0, date:"Apr 28, 2026", schedule:"Recurring quarterly", photos:0 },
  { id:"A029", name:"OSHA Compliance v2 — LA Westside",           tId:"T004", pId:"P005", lId:"L004", eId:"E006", status:"completed",   score:86, cf:0, ap:1, date:"Apr 16, 2026", schedule:"Recurring quarterly", photos:1 },
  { id:"A030", name:"OSHA Compliance v2 — Boston Newbury",        tId:"T004", pId:"P005", lId:"L002", eId:"E001", status:"overdue",     score:null, cf:0, ap:0, date:"Apr 6,  2026", schedule:"Recurring quarterly", photos:0 },
  { id:"A031", name:"OSHA Compliance v2 — Chicago Wacker",        tId:"T004", pId:"P005", lId:"L003", eId:"E002", status:"completed",   score:79, cf:1, ap:2, date:"Apr 11, 2026", schedule:"Recurring quarterly", photos:2 },
  { id:"A032", name:"OSHA Compliance v2 — Seattle Pike",          tId:"T004", pId:"P005", lId:"L007", eId:"E003", status:"completed",   score:93, cf:0, ap:0, date:"Mar 27, 2026", schedule:"Recurring quarterly", photos:0 },
  // ── Retail Store Safety v2 (A033–A037) ──
  { id:"A033", name:"Retail Store Safety v2 — Atlanta Perimeter", tId:"T005", pId:"P006", lId:"L006", eId:"E002", status:"completed",   score:88, cf:0, ap:1, date:"Apr 25, 2026", schedule:"One-time",            photos:1 },
  { id:"A034", name:"Retail Store Safety v2 — Miami Flagler",     tId:"T005", pId:"P006", lId:"L010", eId:"E004", status:"overdue",     score:null, cf:0, ap:0, date:"Apr 11, 2026", schedule:"One-time",            photos:0 },
  { id:"A035", name:"Retail Store Safety v2 — Nashville Green Hills",tId:"T005",pId:"P006",lId:"L012",eId:"E006", status:"completed",   score:75, cf:1, ap:2, date:"Apr 8,  2026", schedule:"One-time",            photos:2 },
  { id:"A036", name:"Retail Store Safety v2 — Dallas Galleria",   tId:"T005", pId:"P006", lId:"L008", eId:"E001", status:"in_progress", score:null, cf:0, ap:0, date:"Apr 26, 2026", schedule:"One-time",            photos:0 },
  { id:"A037", name:"Retail Store Safety v2 — Denver 16th St",    tId:"T005", pId:"P005", lId:"L009", eId:"E005", status:"completed",   score:91, cf:0, ap:0, date:"Apr 4,  2026", schedule:"One-time",            photos:1 },
  // ── LP Standard Compliance v1 (A038–A042) ──
  { id:"A038", name:"LP Standard Compliance v1 — NY Central",     tId:"T006", pId:"P002", lId:"L001", eId:"E006", status:"completed",   score:82, cf:0, ap:1, date:"Apr 17, 2026", schedule:"Recurring monthly",   photos:1 },
  { id:"A039", name:"LP Standard Compliance v1 — Boston Newbury", tId:"T006", pId:"P002", lId:"L002", eId:"E002", status:"completed",   score:95, cf:0, ap:0, date:"Apr 13, 2026", schedule:"Recurring monthly",   photos:0 },
  { id:"A040", name:"LP Standard Compliance v1 — Philadelphia Main",tId:"T006",pId:"P002",lId:"L005",eId:"E005",  status:"not_started", score:null, cf:0, ap:0, date:"May 2,  2026", schedule:"Recurring monthly",   photos:0 },
  { id:"A041", name:"LP Standard Compliance v1 — Hartford Downtown",tId:"T006",pId:"P002",lId:"L011",eId:"E001",  status:"completed",   score:69, cf:1, ap:2, date:"Apr 6,  2026", schedule:"Recurring monthly",   photos:2 },
  { id:"A042", name:"LP Standard Compliance v1 — Chicago Wacker", tId:"T006", pId:"P002", lId:"L003", eId:"E003", status:"overdue",     score:null, cf:0, ap:0, date:"Apr 12, 2026", schedule:"Recurring monthly",   photos:0 },
  // ── Emergency Preparedness v1 (A043–A046) ──
  { id:"A043", name:"Emergency Preparedness v1 — Denver 16th St", tId:"T007", pId:"P001", lId:"L009", eId:"E004", status:"completed",   score:90, cf:0, ap:0, date:"Apr 20, 2026", schedule:"Recurring quarterly", photos:0 },
  { id:"A044", name:"Emergency Preparedness v1 — LA Westside",    tId:"T007", pId:"P001", lId:"L004", eId:"E005", status:"in_progress", score:null, cf:0, ap:0, date:"Apr 27, 2026", schedule:"Recurring quarterly", photos:0 },
  { id:"A045", name:"Emergency Preparedness v1 — Nashville Green Hills",tId:"T007",pId:"P001",lId:"L012",eId:"E006",status:"completed",  score:84, cf:0, ap:1, date:"Apr 10, 2026", schedule:"Recurring quarterly", photos:1 },
  { id:"A046", name:"Emergency Preparedness v1 — Chicago Wacker", tId:"T007", pId:"P003", lId:"L003", eId:"E002", status:"not_started", score:null, cf:0, ap:0, date:"May 6,  2026", schedule:"Recurring quarterly", photos:0 },
  // ── Cash Handling Compliance v1 (A047–A050) ──
  { id:"A047", name:"Cash Handling Compliance v1 — Miami Flagler",   tId:"T008", pId:"P006", lId:"L010", eId:"E001", status:"completed",   score:97, cf:0, ap:0, date:"Apr 23, 2026", schedule:"Recurring monthly", photos:0 },
  { id:"A048", name:"Cash Handling Compliance v1 — Atlanta Perimeter",tId:"T008",pId:"P006", lId:"L006", eId:"E003", status:"overdue",     score:null, cf:0, ap:0, date:"Apr 9,  2026", schedule:"Recurring monthly", photos:0 },
  { id:"A049", name:"Cash Handling Compliance v1 — Philadelphia Main",tId:"T008",pId:"P002", lId:"L005", eId:"E004", status:"completed",   score:88, cf:0, ap:1, date:"Apr 16, 2026", schedule:"Recurring monthly", photos:1 },
  { id:"A050", name:"Cash Handling Compliance v1 — Boston Newbury",   tId:"T008", pId:"P002", lId:"L002", eId:"E006", status:"in_progress", score:null, cf:0, ap:0, date:"Apr 28, 2026", schedule:"Recurring monthly", photos:0 },
];

// ─── Section / Question Templates ────────────────────────────────────────────
// type: "Yes/No" | "Rating" | "Text" | "Date" | "Number"
// maxScore: 0 for unscored questions (Text, Date)

const SECTION_TEMPLATES = {
  T001: { // Fire Safety Audit v3
    methodology: "weighted",
    sections: [
      { id:"S1", name:"Emergency Exits & Egress", weight:25, questions:[
        { id:"Q1",  num:1,  title:"Are all emergency exits clearly marked and unobstructed?",                    type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q2",  num:2,  title:"Do emergency exit doors open freely without special knowledge or keys?",      type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q3",  num:3,  title:"Are exit signs illuminated and visible from all angles?",                     type:"Yes/No", maxScore:5,  isCritical:false },
        { id:"Q4",  num:4,  title:"Is egress path maintained at minimum 28-inch clear width?",                   type:"Yes/No", maxScore:5,  isCritical:false },
        { id:"Q5",  num:5,  title:"Describe any egress deficiencies observed.",                                  type:"Text",   maxScore:0,  isCritical:false },
      ]},
      { id:"S2", name:"Fire Suppression Systems", weight:30, questions:[
        { id:"Q6",  num:6,  title:"Is sprinkler system last inspection within 12 months?",                       type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q7",  num:7,  title:"Are all sprinkler heads free of obstructions (18-inch clearance)?",           type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q8",  num:8,  title:"Is fire suppression panel free of alarm or trouble indicators?",              type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q9",  num:9,  title:"Date of last fire drill",                                                     type:"Date",   maxScore:0,  isCritical:false },
      ]},
      { id:"S3", name:"Fire Extinguisher Compliance", weight:20, questions:[
        { id:"Q10", num:10, title:"Are all extinguishers mounted in accessible, visible locations?",             type:"Yes/No", maxScore:8,  isCritical:true  },
        { id:"Q11", num:11, title:"Are extinguisher inspection tags current within 12 months?",                  type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q12", num:12, title:"Is extinguisher count adequate for facility square footage?",                  type:"Yes/No", maxScore:5,  isCritical:false },
        { id:"Q13", num:13, title:"Overall extinguisher condition rating (1–5)",                                  type:"Rating", maxScore:10, isCritical:false },
      ]},
      { id:"S4", name:"Electrical Safety", weight:15, questions:[
        { id:"Q14", num:14, title:"Are electrical panels accessible and properly labeled?",                       type:"Yes/No", maxScore:5,  isCritical:false },
        { id:"Q15", num:15, title:"Are extension cords absent from use as permanent wiring?",                    type:"Yes/No", maxScore:5,  isCritical:false },
        { id:"Q16", num:16, title:"Is there at least 3-foot clearance in front of electrical panels?",           type:"Yes/No", maxScore:5,  isCritical:false },
        { id:"Q17", num:17, title:"Are all outlet covers in place throughout the facility?",                     type:"Yes/No", maxScore:5,  isCritical:false },
      ]},
      { id:"S5", name:"Employee Training", weight:10, questions:[
        { id:"Q18", num:18, title:"Have all employees completed fire safety training in the past year?",          type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q19", num:19, title:"Can staff demonstrate proper extinguisher use (PASS method)?",                type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q20", num:20, title:"Additional observations or recommendations.",                                  type:"Text",   maxScore:0,  isCritical:false },
      ]},
    ],
  },
  T002: { // Slip Trip & Fall v1
    methodology: "simple",
    sections: [
      { id:"S1", name:"Floor Conditions", weight:30, questions:[
        { id:"Q1",  num:1,  title:"Are all floor surfaces free of cracks, holes, or uneven seams?",              type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q2",  num:2,  title:"Are wet floor signs deployed whenever floors are wet or freshly mopped?",     type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q3",  num:3,  title:"Are spill kits stocked and accessible in high-risk zones?",                   type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q4",  num:4,  title:"Describe any floor hazards observed.",                                        type:"Text",   maxScore:0,  isCritical:false },
      ]},
      { id:"S2", name:"Lighting", weight:20, questions:[
        { id:"Q5",  num:5,  title:"Is lighting adequate in all work areas and walkways (min 50 foot-candles)?",  type:"Yes/No", maxScore:10, isCritical:false },
        { id:"Q6",  num:6,  title:"Are all light fixtures functional with no burned-out bulbs?",                 type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q7",  num:7,  title:"Are stairwells and ramps fully illuminated?",                                 type:"Yes/No", maxScore:7,  isCritical:false },
      ]},
      { id:"S3", name:"Signage & Warnings", weight:20, questions:[
        { id:"Q8",  num:8,  title:"Are warning signs posted at all known slip/trip hazard locations?",           type:"Yes/No", maxScore:10, isCritical:false },
        { id:"Q9",  num:9,  title:"Are ramp and step changes marked with high-visibility tape or paint?",        type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q10", num:10, title:"Is signage in compliance with OSHA 29 CFR 1910.145 requirements?",            type:"Yes/No", maxScore:7,  isCritical:false },
      ]},
      { id:"S4", name:"Mat & Runner Placement", weight:15, questions:[
        { id:"Q11", num:11, title:"Are anti-fatigue and anti-slip mats present at building entrances?",          type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q12", num:12, title:"Are all mats lying flat with no curled edges or trip hazards?",               type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q13", num:13, title:"Overall mat condition rating (1–5)",                                          type:"Rating", maxScore:9,  isCritical:false },
      ]},
      { id:"S5", name:"Reporting & Response", weight:15, questions:[
        { id:"Q14", num:14, title:"Is the incident reporting log current with no unreported near-misses?",       type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q15", num:15, title:"Are first-aid kits stocked and locations clearly posted?",                    type:"Yes/No", maxScore:7,  isCritical:false },
        { id:"Q16", num:16, title:"Additional notes on slip/trip hazards or observations.",                      type:"Text",   maxScore:0,  isCritical:false },
      ]},
    ],
  },
  T003: { // PPE Compliance v2
    methodology: "simple",
    sections: [
      { id:"S1", name:"PPE Availability", weight:30, questions:[
        { id:"Q1",  num:1,  title:"Are all required PPE types stocked and available for all job functions?",      type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q2",  num:2,  title:"Are PPE storage areas clearly labeled and easily accessible?",                type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q3",  num:3,  title:"Are all PPE sizes available to accommodate all employees?",                   type:"Yes/No", maxScore:7,  isCritical:false },
        { id:"Q4",  num:4,  title:"Number of PPE stations in this facility",                                     type:"Number", maxScore:0,  isCritical:false },
      ]},
      { id:"S2", name:"PPE Condition", weight:25, questions:[
        { id:"Q5",  num:5,  title:"Are all hard hats free of cracks, dents, or deformities?",                   type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q6",  num:6,  title:"Are safety gloves inspected and free of holes or tears?",                    type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q7",  num:7,  title:"Are high-visibility vests in good condition?",                               type:"Yes/No", maxScore:7,  isCritical:false },
        { id:"Q8",  num:8,  title:"Overall PPE condition rating (1–5)",                                         type:"Rating", maxScore:10, isCritical:false },
      ]},
      { id:"S3", name:"PPE Usage Compliance", weight:25, questions:[
        { id:"Q9",  num:9,  title:"Are all employees observed wearing required PPE in designated zones?",        type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q10", num:10, title:"Are PPE compliance reminders posted in work areas?",                         type:"Yes/No", maxScore:7,  isCritical:false },
        { id:"Q11", num:11, title:"Have any PPE violations been documented in the past 30 days?",               type:"Yes/No", maxScore:8,  isCritical:false },
      ]},
      { id:"S4", name:"Training & Documentation", weight:20, questions:[
        { id:"Q12", num:12, title:"Do all employees have documented PPE training within the past year?",        type:"Yes/No", maxScore:10, isCritical:false },
        { id:"Q13", num:13, title:"Is the PPE hazard assessment current and on file?",                          type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q14", num:14, title:"Additional observations on PPE compliance.",                                  type:"Text",   maxScore:0,  isCritical:false },
      ]},
    ],
  },
  T004: { // OSHA Compliance v2
    methodology: "weighted",
    sections: [
      { id:"S1", name:"Recordkeeping & Posting", weight:25, questions:[
        { id:"Q1",  num:1,  title:"Is OSHA 300 log current and available for inspection?",                       type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q2",  num:2,  title:"Is the OSHA 300A annual summary posted Feb 1 – Apr 30?",                     type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q3",  num:3,  title:"Is the OSHA Job Safety and Health poster displayed prominently?",             type:"Yes/No", maxScore:7,  isCritical:false },
      ]},
      { id:"S2", name:"Hazard Communication", weight:25, questions:[
        { id:"Q4",  num:4,  title:"Is a complete SDS binder available and accessible to all employees?",         type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q5",  num:5,  title:"Are all chemical containers properly labeled with GHS-compliant labels?",     type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q6",  num:6,  title:"Have employees received HazCom training within the past 12 months?",         type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q7",  num:7,  title:"Date of last HazCom training session",                                       type:"Date",   maxScore:0,  isCritical:false },
      ]},
      { id:"S3", name:"Emergency Preparedness", weight:25, questions:[
        { id:"Q8",  num:8,  title:"Is the written Emergency Action Plan current and accessible?",                type:"Yes/No", maxScore:10, isCritical:false },
        { id:"Q9",  num:9,  title:"Are emergency phone numbers posted at all phone stations?",                   type:"Yes/No", maxScore:7,  isCritical:false },
        { id:"Q10", num:10, title:"Have employees participated in an emergency drill in the past 12 months?",   type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q11", num:11, title:"Date of last emergency drill",                                               type:"Date",   maxScore:0,  isCritical:false },
      ]},
      { id:"S4", name:"General Workplace Conditions", weight:25, questions:[
        { id:"Q12", num:12, title:"Are all walking/working surfaces free of slip/trip hazards?",                type:"Yes/No", maxScore:10, isCritical:false },
        { id:"Q13", num:13, title:"Are machine guards in place on all equipment requiring guarding?",            type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q14", num:14, title:"Is lockout/tagout equipment available and training documented?",             type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q15", num:15, title:"Additional OSHA compliance observations.",                                    type:"Text",   maxScore:0,  isCritical:false },
      ]},
    ],
  },
  T005: { // Retail Store Safety v2
    methodology: "simple",
    sections: [
      { id:"S1", name:"Store Floor & Aisles", weight:30, questions:[
        { id:"Q1",  num:1,  title:"Are all aisle ways clear of merchandise, boxes, and obstructions?",          type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q2",  num:2,  title:"Are floor surfaces clean, dry, and free of slip hazards?",                   type:"Yes/No", maxScore:10, isCritical:false },
        { id:"Q3",  num:3,  title:"Are all shelving units stable, level, and properly anchored?",               type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q4",  num:4,  title:"Overall store floor condition rating (1–5)",                                  type:"Rating", maxScore:9,  isCritical:false },
      ]},
      { id:"S2", name:"Back-of-House Safety", weight:30, questions:[
        { id:"Q5",  num:5,  title:"Is the stockroom organized with proper weight limits posted on shelves?",     type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q6",  num:6,  title:"Are box cutters stored safely and accounted for?",                          type:"Yes/No", maxScore:8,  isCritical:true  },
        { id:"Q7",  num:7,  title:"Are ladders in good condition and used per manufacturer guidelines?",        type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q8",  num:8,  title:"Is the receiving area clear of trip hazards?",                              type:"Yes/No", maxScore:7,  isCritical:false },
      ]},
      { id:"S3", name:"Customer Safety", weight:25, questions:[
        { id:"Q9",  num:9,  title:"Are fitting rooms inspected and free of non-store items or sharp objects?",  type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q10", num:10, title:"Are heavy or tall items secured to prevent tipping?",                        type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q11", num:11, title:"Are security fixtures (pedestals, tags) intact and not creating hazards?",  type:"Yes/No", maxScore:7,  isCritical:false },
      ]},
      { id:"S4", name:"Safety Training & Compliance", weight:15, questions:[
        { id:"Q12", num:12, title:"Have all associates completed safety orientation within 30 days of hire?",   type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q13", num:13, title:"Is the incident log up-to-date with manager signature?",                     type:"Yes/No", maxScore:7,  isCritical:false },
        { id:"Q14", num:14, title:"Additional safety observations.",                                            type:"Text",   maxScore:0,  isCritical:false },
      ]},
    ],
  },
  T006: { // LP Standard Compliance v1
    methodology: "simple",
    sections: [
      { id:"S1", name:"Physical Security", weight:35, questions:[
        { id:"Q1",  num:1,  title:"Are all EAS pedestals functioning and free of damage?",                       type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q2",  num:2,  title:"Are all exterior cameras functioning with clear views of entry/exit?",        type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q3",  num:3,  title:"Are fitting room counts posted and enforced?",                               type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q4",  num:4,  title:"Overall camera coverage rating (1–5)",                                       type:"Rating", maxScore:9,  isCritical:false },
      ]},
      { id:"S2", name:"Cash & Transaction Controls", weight:30, questions:[
        { id:"Q5",  num:5,  title:"Are POS overrides documented and approved per policy?",                      type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q6",  num:6,  title:"Is cash counted by two associates at open/close?",                          type:"Yes/No", maxScore:10, isCritical:false },
        { id:"Q7",  num:7,  title:"Are void and refund transactions within acceptable thresholds?",            type:"Yes/No", maxScore:8,  isCritical:false },
      ]},
      { id:"S3", name:"Policy Compliance", weight:20, questions:[
        { id:"Q8",  num:8,  title:"Are LP policies posted in associate areas?",                                 type:"Yes/No", maxScore:7,  isCritical:false },
        { id:"Q9",  num:9,  title:"Have all associates completed LP training within the past 6 months?",       type:"Yes/No", maxScore:10, isCritical:false },
        { id:"Q10", num:10, title:"Date of last LP policy review",                                              type:"Date",   maxScore:0,  isCritical:false },
      ]},
      { id:"S4", name:"Incident Documentation", weight:15, questions:[
        { id:"Q11", num:11, title:"Are all incidents documented in the LP case management system?",             type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q12", num:12, title:"Are ban letters current and on file?",                                      type:"Yes/No", maxScore:7,  isCritical:false },
        { id:"Q13", num:13, title:"Additional LP observations.",                                               type:"Text",   maxScore:0,  isCritical:false },
      ]},
    ],
  },
  T007: { // Emergency Preparedness v1
    methodology: "simple",
    sections: [
      { id:"S1", name:"Emergency Plans & Communication", weight:40, questions:[
        { id:"Q1",  num:1,  title:"Is the Emergency Action Plan written, current, and accessible to all staff?", type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q2",  num:2,  title:"Are emergency roles (warden, first aid) assigned and documented?",            type:"Yes/No", maxScore:10, isCritical:false },
        { id:"Q3",  num:3,  title:"Are emergency contact numbers posted at all communication stations?",         type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q4",  num:4,  title:"Date of last emergency drill",                                               type:"Date",   maxScore:0,  isCritical:false },
      ]},
      { id:"S2", name:"Emergency Equipment", weight:35, questions:[
        { id:"Q5",  num:5,  title:"Are AEDs present, inspected, and accessible within 3 minutes of any point?", type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q6",  num:6,  title:"Are first aid kits stocked per ANSI Z308.1 minimums?",                      type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q7",  num:7,  title:"Are emergency flashlights in working condition with fresh batteries?",       type:"Yes/No", maxScore:7,  isCritical:false },
        { id:"Q8",  num:8,  title:"Overall emergency equipment readiness rating (1–5)",                         type:"Rating", maxScore:10, isCritical:false },
      ]},
      { id:"S3", name:"Training & Drills", weight:25, questions:[
        { id:"Q9",  num:9,  title:"Have all employees completed emergency preparedness training this year?",     type:"Yes/No", maxScore:10, isCritical:false },
        { id:"Q10", num:10, title:"Are CPR/first-aid-trained employees present on all shifts?",                 type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q11", num:11, title:"Have evacuation routes been reviewed with all staff in the past 6 months?", type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q12", num:12, title:"Additional emergency preparedness observations.",                            type:"Text",   maxScore:0,  isCritical:false },
      ]},
    ],
  },
  T008: { // Cash Handling Compliance v1
    methodology: "simple",
    sections: [
      { id:"S1", name:"Cashier Controls", weight:40, questions:[
        { id:"Q1",  num:1,  title:"Are cashiers using their own individual register codes (no sharing)?",        type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q2",  num:2,  title:"Are all cash drawers balanced within $1.00 tolerance at each count?",        type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q3",  num:3,  title:"Are cashier void/refund transactions at or below 2% threshold?",             type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q4",  num:4,  title:"Are all bills verified with counterfeit detection pen or UV light?",         type:"Yes/No", maxScore:7,  isCritical:false },
      ]},
      { id:"S2", name:"Safe & Deposit Procedures", weight:35, questions:[
        { id:"Q5",  num:5,  title:"Is the safe opened only by authorized managers with dual presence?",          type:"Yes/No", maxScore:10, isCritical:true  },
        { id:"Q6",  num:6,  title:"Are bank deposits made per schedule with armored car or manager escort?",    type:"Yes/No", maxScore:10, isCritical:false },
        { id:"Q7",  num:7,  title:"Are safe combinations changed per the 90-day policy and upon personnel changes?", type:"Yes/No", maxScore:8,  isCritical:false },
      ]},
      { id:"S3", name:"Documentation & Audit Trail", weight:25, questions:[
        { id:"Q8",  num:8,  title:"Are all cash handling exceptions logged in the register journal?",           type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q9",  num:9,  title:"Are end-of-day cash reports signed by manager and stored per retention policy?", type:"Yes/No", maxScore:7,  isCritical:false },
        { id:"Q10", num:10, title:"Have all cash handlers completed cash handling training within 6 months?",   type:"Yes/No", maxScore:8,  isCritical:false },
        { id:"Q11", num:11, title:"Date of last cash handling audit",                                           type:"Date",   maxScore:0,  isCritical:false },
        { id:"Q12", num:12, title:"Additional cash handling observations.",                                     type:"Text",   maxScore:0,  isCritical:false },
      ]},
    ],
  },
};

// ─── Detail Generator ─────────────────────────────────────────────────────────

function lcg(seed) {
  return ((seed * 9301 + 49297) % 233280) / 233280;
}

function pickFails(auditNum, questions, targetFailCount) {
  const scored = questions.filter(q => q.maxScore > 0);
  const failed = new Set();
  let seed = auditNum;
  for (let i = 0; i < Math.min(targetFailCount, scored.length); i++) {
    let attempts = 0;
    while (attempts < 50) {
      seed = Math.round(lcg(seed) * 10000);
      const candidate = scored[seed % scored.length];
      if (candidate && !failed.has(candidate.id)) {
        failed.add(candidate.id);
        break;
      }
      attempts++;
    }
  }
  return failed;
}

const TEXT_ANSWERS = [
  "No issues observed during inspection.",
  "Minor wear noted — no immediate action required.",
  "Area is in compliance. Recommend follow-up in 30 days.",
  "All items inspected and found to be in satisfactory condition.",
  "Observation logged. Corrective action recommended at next maintenance cycle.",
];

const PHOTO_STUBS = [
  "photo_extinguisher_station.jpg",
  "photo_exit_signage.jpg",
  "photo_floor_condition.jpg",
  "photo_ppe_station.jpg",
  "photo_electrical_panel.jpg",
];

function getTextAnswer(seed) {
  return TEXT_ANSWERS[Math.round(lcg(seed) * 10000) % TEXT_ANSWERS.length];
}

function generateSections(audit, secTemplate) {
  const auditNum = parseInt(audit.id.slice(1));
  const isComplete = audit.status === "completed";
  const isInProgress = audit.status === "in_progress";
  const score = audit.score || 0;
  const critFails = audit.cf || 0;

  const sections = secTemplate.sections;
  const allScoredQ = sections.flatMap(s => s.questions).filter(q => q.maxScore > 0);
  const totalMaxScore = allScoredQ.reduce((a, q) => a + q.maxScore, 0);

  // How many questions need to fail to achieve the target score
  let targetPassScore = Math.round((score / 100) * totalMaxScore);
  let failedIds = new Set();

  if (isComplete) {
    // Ensure critical fails come first
    const criticalQ = allScoredQ.filter(q => q.isCritical);
    let seed = auditNum * 13;
    for (let i = 0; i < Math.min(critFails, criticalQ.length); i++) {
      failedIds.add(criticalQ[i].id);
    }
    // Fill remaining fails from non-critical
    const nonCritical = allScoredQ.filter(q => !q.isCritical && !failedIds.has(q.id));
    const passScore = allScoredQ.filter(q => !failedIds.has(q.id)).reduce((a, q) => a + q.maxScore, 0);
    let extra = passScore - targetPassScore;
    for (const q of nonCritical) {
      if (extra <= 0) break;
      failedIds.add(q.id);
      extra -= q.maxScore;
    }
  }

  return sections.map((sec, sIdx) => {
    const sectionDone = isComplete || (isInProgress && sIdx < 2);
    let seed = auditNum * 100 + sIdx * 7;

    const qs = sec.questions.map(q => {
      seed = Math.round(lcg(seed) * 100000);
      if (!sectionDone) return { ...q, response: null, scoreEarned: 0, passed: null, photos: [], comments: [] };
      if (q.type === "Text") return { ...q, response: getTextAnswer(seed), scoreEarned: 0, passed: null, photos: [], comments: [] };
      if (q.type === "Date") return { ...q, response: "Mar 15, 2026", scoreEarned: 0, passed: null, photos: [], comments: [] };
      if (q.type === "Number") return { ...q, response: 4, scoreEarned: 0, passed: null, photos: [], comments: [] };
      const failed = failedIds.has(q.id);
      if (q.type === "Rating") {
        const rating = failed ? 2 : 4;
        return { ...q, response: rating, scoreEarned: Math.round((rating / 5) * q.maxScore), passed: rating >= 3, photos: [], comments: [] };
      }
      return {
        ...q,
        response: failed ? "No" : "Yes",
        scoreEarned: failed ? 0 : q.maxScore,
        passed: !failed,
        photos: (audit.photos > 0 && sIdx === 0 && !failed) ? [PHOTO_STUBS[seed % PHOTO_STUBS.length]] : [],
        comments: [],
      };
    });

    const sectionEarned = qs.reduce((a, q) => a + (q.scoreEarned || 0), 0);
    const sectionMax = sec.questions.reduce((a, q) => a + q.maxScore, 0);

    return {
      ...sec,
      score: sectionDone ? sectionEarned : null,
      maxScore: sectionMax,
      questions: qs,
    };
  });
}

const COMMENT_POOL = [
  { offset: 0, body: "Audit looks good overall. A couple of items flagged for follow-up but nothing critical." },
  { offset: 1, body: "Action plans have been assigned. Expect resolution before the end of the month." },
  { offset: 2, body: "Regional manager notified of critical finding. Escalation path confirmed." },
  { offset: 3, body: "Follow-up scheduled for 2 weeks out. Will update status at that point." },
];

function generateComments(auditNum, auditor, programOwner) {
  if (auditNum % 3 === 0) return [];
  const count = (auditNum % 2) + 1;
  return COMMENT_POOL.slice(0, count).map((c, i) => ({
    id: `CMT${auditNum}_${i}`,
    author: i === 0 ? auditor.name : programOwner,
    role: i === 0 ? auditor.role : "Program Owner",
    timestamp: `Apr ${(auditNum % 20) + 1}, 2026 at ${9 + i}:${String(i * 14).padStart(2,"0")} AM`,
    body: c.body,
  }));
}

function generateHistory(audit, auditor, aud) {
  const num = parseInt(audit.id.slice(1));
  const baseDate = `Apr ${(num % 22) + 1}, 2026`;
  const events = [
    { timestamp: `${baseDate} at 8:00 AM`,  event: `Audit assigned by Program Owner`,          actor: "Program Owner" },
    { timestamp: `${baseDate} at 9:14 AM`,  event: `Audit started by ${auditor.name}`,           actor: auditor.name },
  ];
  if (audit.status === "completed" || audit.status === "in_progress") {
    events.push({ timestamp: `${baseDate} at 10:05 AM`, event: "Section 1 completed",             actor: auditor.name });
    events.push({ timestamp: `${baseDate} at 10:48 AM`, event: "Section 2 completed",             actor: auditor.name });
  }
  if (audit.status === "completed") {
    events.push({ timestamp: `${baseDate} at 11:22 AM`, event: "Section 3 completed",             actor: auditor.name });
    events.push({ timestamp: `${baseDate} at 11:40 AM`, event: "Section 4 completed",             actor: auditor.name });
    events.push({ timestamp: `${baseDate} at 11:47 AM`, event: "Audit submitted",                 actor: auditor.name });
    if (audit.cf > 0) {
      events.push({ timestamp: `${baseDate} at 11:47 AM`, event: `${audit.cf} escalation(s) fired automatically`, actor: "System" });
    }
    if (audit.ap > 0) {
      events.push({ timestamp: `${baseDate} at 11:47 AM`, event: `${audit.ap} action plan(s) created`, actor: "System" });
    }
  }
  return events.reverse();
}

function generateActionPlans(sections, audit, auditor) {
  const plans = [];
  let idx = 1;
  sections.forEach(sec => {
    sec.questions.forEach(q => {
      if (q.passed === false) {
        plans.push({
          id: `AP${String(idx).padStart(3, "0")}`,
          title: q.title.slice(0, 60) + (q.title.length > 60 ? "…" : ""),
          questionId: q.id,
          questionTitle: q.title,
          sectionName: sec.name,
          assignedTo: auditor.name,
          dueDate: "May 15, 2026",
          status: idx % 3 === 0 ? "in_progress" : "open",
          priority: q.isCritical ? "high" : "medium",
        });
        idx++;
      }
    });
  });
  return plans;
}

function generateEscalations(sections, audit, auditor) {
  const escs = [];
  sections.forEach(sec => {
    sec.questions.forEach(q => {
      if (q.passed === false && q.isCritical) {
        escs.push({
          id: `ESC${escs.length + 1}`,
          trigger: `Critical question failed: ${q.title.slice(0, 70)}`,
          recipient: "Linda Chen",
          role: "Regional Manager",
          channel: "Email",
          sentAt: `Apr ${(parseInt(audit.id.slice(1)) % 22) + 1}, 2026 at 11:47 AM`,
          status: "Delivered",
        });
        if (escs.length < audit.cf) {
          escs.push({
            id: `ESC${escs.length + 1}`,
            trigger: "Template rule: any critical fail triggers SMS to District Manager",
            recipient: "Tom Wu",
            role: "District Manager",
            channel: "SMS",
            sentAt: `Apr ${(parseInt(audit.id.slice(1)) % 22) + 1}, 2026 at 11:48 AM`,
            status: "Delivered",
          });
        }
      }
    });
  });
  return escs;
}

export function getAuditDetail(auditId) {
  const audit = AUDITS_50.find(a => a.id === auditId);
  if (!audit) return null;

  const loc    = LOCATIONS_ALL.find(l => l.id === audit.lId);
  const auditor = AUDITORS_ALL.find(e => e.id === audit.eId);
  const prog   = PROGRAMS_ALL.find(p => p.id === audit.pId);
  const tmpl   = TEMPLATES_ALL.find(t => t.id === audit.tId);
  const secTmpl = SECTION_TEMPLATES[audit.tId] || SECTION_TEMPLATES.T001;

  const sections = generateSections(audit, secTmpl);
  const actionPlans = audit.status === "completed" ? generateActionPlans(sections, audit, auditor) : [];
  const escalations = audit.status === "completed" ? generateEscalations(sections, audit, auditor) : [];
  const auditNum = parseInt(auditId.slice(1));
  const comments = generateComments(auditNum, auditor, "Christina Aragon");
  const history = generateHistory(audit, auditor);

  const totalQuestions = sections.flatMap(s => s.questions).length;
  const scoredQuestions = sections.flatMap(s => s.questions).filter(q => q.maxScore > 0).length;
  const totalMaxScore = sections.flatMap(s => s.questions).reduce((a, q) => a + q.maxScore, 0);
  const totalEarned = sections.flatMap(s => s.questions).reduce((a, q) => a + (q.scoreEarned || 0), 0);

  const baseDate = `Apr ${(auditNum % 22) + 1}, 2026`;

  return {
    ...audit,
    locationFull: loc,
    auditorFull: auditor,
    programFull: prog,
    templateFull: { ...tmpl, methodology: secTmpl.methodology },
    sections,
    actionPlansDetail: actionPlans,
    escalationsDetail: escalations,
    commentsDetail: comments,
    historyDetail: history,
    meta: {
      startedAt:      `${baseDate} at 9:14 AM`,
      submittedAt:    audit.status === "completed" ? `${baseDate} at 11:47 AM` : null,
      timeToComplete: audit.status === "completed" ? "2h 33min" : null,
      schedule:       audit.schedule || "Recurring monthly",
      passFailThreshold: 75,
      totalQuestions,
      scoredQuestions,
      totalMaxScore,
      totalEarned,
    },
  };
}
