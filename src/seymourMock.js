// Implements: TLP-19 (Excel pre-fill via Seymour, mocked)

let _counter = 8000;
const uid = () => "sm" + (_counter++);

function q(text, type, conf = "High", flag = null) {
  return { id: uid(), text, type, category: "General", required: false, _conf: conf, _flag: flag };
}

// Mapping metadata generated alongside questions — kept separate so wizard state stays clean
function mapping(qId, col, row, sheet, type, conf, flag) {
  return {
    questionId: qId,
    excelRef:   `${sheet} · Column ${col} · Row ${row}`,
    inferredType: type,
    confidence:   conf,   // "High" | "Medium" | "Low"
    flag,                 // null or string
  };
}

// ── Mock 1 — Fire Safety & Compliance ────────────────────────────────────────

function fireSafetyMock() {
  const q1  = q("Are all fire exits clearly marked and unobstructed?",               "Pass/Fail");
  const q2  = q("Date of last fire drill conducted",                                  "Text",    "Medium", "Uncertain: could be Date or Text — review required");
  const q3  = q("Were all staff present for the most recent fire drill?",             "Yes/No");
  const q4  = q("Number of staff who require fire safety re-training",               "Number",  "Medium", "Uncertain: could be Rating or Number — review required");
  const q5  = q("Smoke detectors tested and operational in all zones?",               "Pass/Fail");
  const q6  = q("Heat detectors in kitchen areas are functional?",                    "Pass/Fail");
  const q7  = q("Fire alarm panel shows no active faults",                           "Yes/No");
  const q8  = q("Suppression system last inspection date (within 12 months?)",       "Pass/Fail");
  const q9  = q("Suppression agent pressure gauge reading",                          "Rating",  "Low",    "Low confidence: numeric value in free-text cell — verify type");
  const q10 = q("Sprinkler heads are free from obstruction and paint",               "Pass/Fail");
  const q11 = q("Primary egress route is clear and accessible?",                     "Pass/Fail");
  const q12 = q("Secondary egress route is clear and accessible?",                   "Pass/Fail");
  const q13 = q("Emergency lighting tested within last 30 days?",                    "Yes/No");
  const q14 = q("Most recent fire safety certificate (certificate on file?)",        "Pass/Fail", "Medium", "Flagged: binary yes/no detected but header suggests document check");
  const q15 = q("Any open non-conformances from previous fire inspection?",          "Yes/No");

  const sections = [
    { id: uid(), name: "General Fire Safety",       collapsed: false, questions: [q1,  q2,  q3,  q4]  },
    { id: uid(), name: "Fire Detection & Alarms",   collapsed: false, questions: [q5,  q6,  q7]       },
    { id: uid(), name: "Suppression Systems",       collapsed: false, questions: [q8,  q9,  q10]      },
    { id: uid(), name: "Emergency Egress",          collapsed: false, questions: [q11, q12, q13]      },
    { id: uid(), name: "Documentation & Training",  collapsed: false, questions: [q14, q15]           },
  ];

  const ruleId = uid();
  const rules = [
    {
      id: ruleId,
      driverQuestionId: q15.id,
      clauses: [{ operator: "equals", value: "Yes", joiner: "AND" }],
      showIds: [q4.id],
    },
  ];

  const mappings = [
    mapping(q1.id,  "B", 4,  "Sheet1", "Pass/Fail", "High",   null),
    mapping(q2.id,  "C", 4,  "Sheet1", "Text",      "Medium", "Uncertain: could be Date or Text — review required"),
    mapping(q3.id,  "D", 4,  "Sheet1", "Yes/No",    "High",   null),
    mapping(q4.id,  "E", 4,  "Sheet1", "Number",    "Medium", "Uncertain: could be Rating or Number — review required"),
    mapping(q5.id,  "B", 8,  "Sheet1", "Pass/Fail", "High",   null),
    mapping(q6.id,  "B", 9,  "Sheet1", "Pass/Fail", "High",   null),
    mapping(q7.id,  "B", 10, "Sheet1", "Yes/No",    "High",   null),
    mapping(q8.id,  "B", 14, "Sheet1", "Pass/Fail", "High",   null),
    mapping(q9.id,  "C", 14, "Sheet1", "Rating",    "Low",    "Low confidence: numeric value in free-text cell — verify type"),
    mapping(q10.id, "D", 14, "Sheet1", "Pass/Fail", "High",   null),
    mapping(q11.id, "B", 18, "Sheet2", "Pass/Fail", "High",   null),
    mapping(q12.id, "B", 19, "Sheet2", "Pass/Fail", "High",   null),
    mapping(q13.id, "C", 19, "Sheet2", "Yes/No",    "High",   null),
    mapping(q14.id, "B", 23, "Sheet2", "Pass/Fail", "Medium", "Flagged: binary yes/no detected but header suggests document check"),
    mapping(q15.id, "B", 24, "Sheet2", "Yes/No",    "High",   null),
  ];

  return {
    templateName: "Fire Safety & Compliance Audit",
    sections,
    rules,
    mappings,
    flaggedCount: mappings.filter(m => m.flag).length,
  };
}

// ── Mock 2 — LP Standard Walkthrough ─────────────────────────────────────────

function lpMock() {
  const q1  = q("All entry/exit doors are secured and alarmed when store is closed?", "Pass/Fail");
  const q2  = q("Loading dock security protocols followed?",                          "Yes/No");
  const q3  = q("Perimeter lighting operational — all zones",                        "Pass/Fail");
  const q4  = q("Number of cash register tills counted at shift open",               "Number",  "Medium", "Uncertain: could be Rating or Number — verify with LP team");
  const q5  = q("Cash variances logged and signed off by manager?",                  "Pass/Fail");
  const q6  = q("Safe combination changed within the last 90 days?",                 "Yes/No");
  const q7  = q("CCTV system is fully operational with no blind spots",              "Pass/Fail");
  const q8  = q("CCTV footage retention period (days)",                              "Number",  "Low",    "Low confidence: column appears numeric but unit unclear");
  const q9  = q("All camera angles reviewed and adequate",                           "Yes/No");
  const q10 = q("Refund procedures followed for all transactions over $50?",         "Pass/Fail");
  const q11 = q("Exception reports reviewed by LP lead within 24 hours?",           "Yes/No");
  const q12 = q("Any active investigations open at this location?",                  "Yes/No");
  const q13 = q("Number of active investigations",                                   "Number",  "Medium", "Flagged: conditional on previous row answer — verify logic");
  const q14 = q("Next scheduled LP review date confirmed?",                          "Pass/Fail");

  const sections = [
    { id: uid(), name: "Store Perimeter",      collapsed: false, questions: [q1, q2, q3]        },
    { id: uid(), name: "Cash Handling",        collapsed: false, questions: [q4, q5, q6]        },
    { id: uid(), name: "CCTV Systems",         collapsed: false, questions: [q7, q8, q9]        },
    { id: uid(), name: "Staff Procedures",     collapsed: false, questions: [q10, q11]          },
    { id: uid(), name: "Exception Reporting",  collapsed: false, questions: [q12, q13, q14]     },
  ];

  const r1 = uid(), r2 = uid();
  const rules = [
    {
      id: r1,
      driverQuestionId: q12.id,
      clauses: [{ operator: "equals", value: "Yes", joiner: "AND" }],
      showIds: [q13.id],
    },
    {
      id: r2,
      driverQuestionId: q5.id,
      clauses: [{ operator: "equals", value: "Fail", joiner: "AND" }],
      showIds: [q4.id],
    },
  ];

  const mappings = [
    mapping(q1.id,  "B", 3,  "Walkthrough", "Pass/Fail", "High",   null),
    mapping(q2.id,  "B", 4,  "Walkthrough", "Yes/No",    "High",   null),
    mapping(q3.id,  "B", 5,  "Walkthrough", "Pass/Fail", "High",   null),
    mapping(q4.id,  "B", 9,  "Walkthrough", "Number",    "Medium", "Uncertain: could be Rating or Number — verify with LP team"),
    mapping(q5.id,  "B", 10, "Walkthrough", "Pass/Fail", "High",   null),
    mapping(q6.id,  "B", 11, "Walkthrough", "Yes/No",    "High",   null),
    mapping(q7.id,  "B", 15, "Sheet2",      "Pass/Fail", "High",   null),
    mapping(q8.id,  "C", 15, "Sheet2",      "Number",    "Low",    "Low confidence: column appears numeric but unit unclear"),
    mapping(q9.id,  "B", 16, "Sheet2",      "Yes/No",    "High",   null),
    mapping(q10.id, "B", 20, "Sheet2",      "Pass/Fail", "High",   null),
    mapping(q11.id, "B", 21, "Sheet2",      "Yes/No",    "High",   null),
    mapping(q12.id, "B", 25, "Sheet3",      "Yes/No",    "High",   null),
    mapping(q13.id, "C", 25, "Sheet3",      "Number",    "Medium", "Flagged: conditional on previous row answer — verify logic"),
    mapping(q14.id, "B", 26, "Sheet3",      "Pass/Fail", "High",   null),
  ];

  return {
    templateName: "LP Standard Walkthrough",
    sections,
    rules,
    mappings,
    flaggedCount: mappings.filter(m => m.flag).length,
  };
}

// ── Mock 3 — Operations Standards ────────────────────────────────────────────

function opsMock() {
  const q1  = q("Store opening checklist completed and signed?",                    "Pass/Fail");
  const q2  = q("Planogram compliance — is the floor set to current planogram?",   "Yes/No");
  const q3  = q("Overall store cleanliness rating",                                "Rating",  "Medium", "Uncertain: 1-5 numeric scale detected but header unclear");
  const q4  = q("Temperature log completed for all refrigerated units?",           "Pass/Fail");
  const q5  = q("Waste log completed and signed by manager?",                      "Yes/No");
  const q6  = q("All promotional signage is current and correctly placed?",        "Pass/Fail");
  const q7  = q("Backroom is organized and free of fire hazards?",                 "Pass/Fail");
  const q8  = q("Current staff headcount on floor",                               "Number",  "Low",    "Low confidence: numeric detected but scope unclear — integer or FTE?");
  const q9  = q("Daily stand-up / briefing conducted?",                           "Yes/No");
  const q10 = q("Uniform compliance — all staff in correct uniform?",             "Pass/Fail");
  const q11 = q("Most recent customer satisfaction score (%)",                    "Number",  "Medium", "Uncertain: could be Rating (1-5) or percentage Number");
  const q12 = q("Any open maintenance tickets? (count)",                          "Number");
  const q13 = q("All compliance training current for staff on shift?",            "Pass/Fail");
  const q14 = q("Previous action items from last ops review resolved?",           "Yes/No");
  const q15 = q("Outstanding action items description",                           "Text",    "Medium", "Flagged: free text only when previous answer is No — verify conditional");

  const sections = [
    { id: uid(), name: "Opening Procedures",    collapsed: false, questions: [q1,  q2,  q3]       },
    { id: uid(), name: "Compliance & Merch",    collapsed: false, questions: [q4,  q5,  q6]       },
    { id: uid(), name: "Backroom & Safety",     collapsed: false, questions: [q7,  q8]            },
    { id: uid(), name: "People & Training",     collapsed: false, questions: [q9,  q10, q11, q13] },
    { id: uid(), name: "Action Items",          collapsed: false, questions: [q12, q14, q15]      },
  ];

  const r1 = uid();
  const rules = [
    {
      id: r1,
      driverQuestionId: q14.id,
      clauses: [{ operator: "equals", value: "No", joiner: "AND" }],
      showIds: [q15.id],
    },
  ];

  const mappings = [
    mapping(q1.id,  "B", 3,  "Ops",    "Pass/Fail", "High",   null),
    mapping(q2.id,  "B", 4,  "Ops",    "Yes/No",    "High",   null),
    mapping(q3.id,  "C", 4,  "Ops",    "Rating",    "Medium", "Uncertain: 1-5 numeric scale detected but header unclear"),
    mapping(q4.id,  "B", 8,  "Ops",    "Pass/Fail", "High",   null),
    mapping(q5.id,  "B", 9,  "Ops",    "Yes/No",    "High",   null),
    mapping(q6.id,  "B", 10, "Ops",    "Pass/Fail", "High",   null),
    mapping(q7.id,  "B", 14, "Sheet2", "Pass/Fail", "High",   null),
    mapping(q8.id,  "C", 14, "Sheet2", "Number",    "Low",    "Low confidence: numeric detected but scope unclear — integer or FTE?"),
    mapping(q9.id,  "B", 18, "Sheet2", "Yes/No",    "High",   null),
    mapping(q10.id, "B", 19, "Sheet2", "Pass/Fail", "High",   null),
    mapping(q11.id, "C", 19, "Sheet2", "Number",    "Medium", "Uncertain: could be Rating (1-5) or percentage Number"),
    mapping(q12.id, "B", 23, "Sheet3", "Number",    "High",   null),
    mapping(q13.id, "B", 24, "Sheet3", "Pass/Fail", "High",   null),
    mapping(q14.id, "B", 25, "Sheet3", "Yes/No",    "High",   null),
    mapping(q15.id, "C", 25, "Sheet3", "Text",      "Medium", "Flagged: free text only when previous answer is No — verify conditional"),
  ];

  return {
    templateName: "Operations Standards Review",
    sections,
    rules,
    mappings,
    flaggedCount: mappings.filter(m => m.flag).length,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateFromExcel(filename = "") {
  const name = filename.toLowerCase();
  if (name.includes("lp") || name.includes("loss"))    return lpMock();
  if (name.includes("ops") || name.includes("oper"))   return opsMock();
  return fireSafetyMock();
}
