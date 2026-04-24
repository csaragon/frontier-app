import { useState, createContext, useContext, useRef, useEffect } from "react";

// Insights App style guide — font + color tokens
const F = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const C = {
  // Text
  navy:"#001e76",   // primary text
  navy2:"#001356",  // hover/dark navy
  navy3:"#f0f2ff",  // brand tint (selected rows, avatar fills)
  // Brand interactive
  ocean:"#2226f7",  // brand blue
  ocean2:"#1316a8", // pressed brand blue
  ocean3:"#c7caff", // brand light (AI chip border, typing dots)
  // Surfaces & borders
  white:"#ffffff",
  g1:"#f4f4f6",     // page / canvas / table header bg
  g2:"#e2e5e9",     // default border
  g3:"#c3c8d0",     // input border / disabled
  g4:"#8692a2",     // muted text / captions
  g5:"#555f6d",     // secondary text
  g6:"#16191d",     // high contrast text
  hover:"#f7f8fa",  // dropdown / row hover
  nested:"#fafbfc", // nested sub-row
  ai:"#f8f8ff",     // AI / sparkle surface
  // Status — Resolved / passing
  teal:"#15803d", teal2:"#dcfce7", teal3:"#f0fdf4",
  // Status — Failing / refund
  red:"#dc2626",  red2:"#fef2f2",  red3:"#fee2e2",
  // Status — At risk / discount
  yel:"#a16207",  yel2:"#fef9c3",  yel3:"#fffbeb",
};

const AppContext = createContext();
const useApp = () => useContext(AppContext);

// Status helpers
const sc = s => s >= 80 ? C.teal : s >= 65 ? C.yel : C.red;
const scBg = s => s >= 80 ? C.teal3 : s >= 65 ? C.yel3 : C.red3;
const scLabel = s => s >= 80 ? "Passing" : s >= 65 ? "At Risk" : "Failing";

// Fail-rate helpers (higher = worse)
const fr = r => r >= 60 ? C.red : r >= 40 ? C.yel : C.g5;
const frBg = r => r >= 60 ? C.red3 : r >= 40 ? C.yel3 : C.g1;

// ── DATA (unchanged) ────────────────────────────────────────────────────────
const SCORECARD_DATA = {
  P001: {
    avgCompliance: 61, auditsCompleted: 34, openAPs: 4, overdue: 4, trend: "down",
    locations: [
      { name:"New York Central Store #1000", score:48, audits:4, lastAudit:"Mar 4, 2026", openAPs:4 },
      { name:"Chicago Wacker Store #1042",   score:60, audits:3, lastAudit:"Mar 11, 2026", openAPs:2 },
      { name:"Philadelphia Main Store #1018",score:65, audits:3, lastAudit:"Mar 18, 2026", openAPs:1 },
      { name:"Atlanta Peachtree Store #1031",score:68, audits:2, lastAudit:"Mar 22, 2026", openAPs:1 },
    ],
    recentAudits: [
      { id:"AUD-035209", location:"New York Central Store #1000", score:48, date:"Mar 4, 2026" },
      { id:"AUD-035314", location:"Chicago Wacker Store #1042",   score:60, date:"Mar 11, 2026" },
      { id:"AUD-035401", location:"Philadelphia Main Store #1018",score:65, date:"Mar 18, 2026" },
    ],
    overdueAPs: [
      { action:"Emergency exits clearly marked and unobstructed", location:"New York Central Store #1000", assignee:"M. King", due:"Mar 18, 2026", daysOver:27 },
      { action:"Fire extinguisher inspection log is current",     location:"New York Central Store #1000", assignee:"M. King", due:"Mar 18, 2026", daysOver:27 },
      { action:"Chemical storage log up to date",                 location:"Chicago Wacker Store #1042",   assignee:"S. Patel", due:"Mar 25, 2026", daysOver:20 },
      { action:"Slip/trip hazards documented and addressed",      location:"Chicago Wacker Store #1042",   assignee:"S. Patel", due:"Mar 25, 2026", daysOver:20 },
    ],
  },
  P002: {
    avgCompliance: 74, auditsCompleted: 28, openAPs: 2, overdue: 2, trend: "up",
    locations: [
      { name:"Miami Flagler Store #2011",    score:55, audits:3, lastAudit:"Mar 6, 2026",  openAPs:2 },
      { name:"Boston Newbury Store #2004",   score:68, audits:4, lastAudit:"Mar 12, 2026", openAPs:1 },
      { name:"Hartford Downtown Store #2019",score:71, audits:3, lastAudit:"Mar 19, 2026", openAPs:0 },
      { name:"Providence Mall Store #2022",  score:78, audits:2, lastAudit:"Mar 26, 2026", openAPs:0 },
    ],
    recentAudits: [
      { id:"AUD-035188", location:"Miami Flagler Store #2011",    score:55, date:"Mar 6, 2026" },
      { id:"AUD-035271", location:"Boston Newbury Store #2004",   score:68, date:"Mar 12, 2026" },
      { id:"AUD-035388", location:"Hartford Downtown Store #2019",score:71, date:"Mar 19, 2026" },
    ],
    overdueAPs: [
      { action:"Receipt checks performed for large transactions", location:"Miami Flagler Store #2011", assignee:"J. Rodriguez", due:"Mar 18, 2026", daysOver:27 },
      { action:"Break room free of concealed merchandise",        location:"Miami Flagler Store #2011", assignee:"J. Rodriguez", due:"Mar 18, 2026", daysOver:27 },
    ],
  },
  P003: {
    avgCompliance: 88, auditsCompleted: 26, openAPs: 0, overdue: 0, trend: "up",
    locations: [
      { name:"Columbus Easton Store #3007",     score:86, audits:3, lastAudit:"Mar 8, 2026",  openAPs:0 },
      { name:"Indianapolis Circle Store #3012", score:88, audits:3, lastAudit:"Mar 15, 2026", openAPs:0 },
      { name:"Detroit Midtown Store #3021",     score:89, audits:2, lastAudit:"Mar 22, 2026", openAPs:0 },
      { name:"Milwaukee Downtown Store #3029",  score:90, audits:2, lastAudit:"Mar 28, 2026", openAPs:0 },
    ],
    recentAudits: [
      { id:"AUD-035201", location:"Columbus Easton Store #3007",     score:86, date:"Mar 8, 2026" },
      { id:"AUD-035298", location:"Indianapolis Circle Store #3012", score:88, date:"Mar 15, 2026" },
      { id:"AUD-035374", location:"Detroit Midtown Store #3021",     score:89, date:"Mar 22, 2026" },
    ],
    overdueAPs: [],
  },
  P004: {
    avgCompliance: 70, auditsCompleted: 15, openAPs: 3, overdue: 3, trend: "down",
    locations: [
      { name:"Dallas Galleria Store #4003",     score:64, audits:2, lastAudit:"Mar 9, 2026",  openAPs:2 },
      { name:"LA Westside Store #4017",         score:69, audits:2, lastAudit:"Mar 16, 2026", openAPs:1 },
      { name:"Phoenix Desert Ridge Store #4024",score:73, audits:1, lastAudit:"Mar 23, 2026", openAPs:0 },
    ],
    recentAudits: [
      { id:"AUD-035212", location:"Dallas Galleria Store #4003",      score:64, date:"Mar 9, 2026" },
      { id:"AUD-035307", location:"LA Westside Store #4017",          score:69, date:"Mar 16, 2026" },
      { id:"AUD-035391", location:"Phoenix Desert Ridge Store #4024", score:73, date:"Mar 23, 2026" },
    ],
    overdueAPs: [
      { action:"PPE available and accessible at all stations", location:"Dallas Galleria Store #4003", assignee:"L. Chen", due:"Mar 18, 2026", daysOver:27 },
      { action:"Gloves stocked in all required sizes",         location:"Dallas Galleria Store #4003", assignee:"L. Chen", due:"Mar 18, 2026", daysOver:27 },
      { action:"PPE in good, undamaged condition",             location:"LA Westside Store #4017",     assignee:"T. Wu",    due:"Mar 25, 2026", daysOver:20 },
    ],
  },
  P005: {
    avgCompliance: 91, auditsCompleted: 58, openAPs: 0, overdue: 0, trend: "up",
    locations: [
      { name:"Seattle Pike Store #5001",   score:90, audits:5, lastAudit:"Mar 5, 2026",  openAPs:0 },
      { name:"Portland Lloyd Store #5009", score:91, audits:4, lastAudit:"Mar 12, 2026", openAPs:0 },
      { name:"Denver 16th St Store #5014", score:92, audits:4, lastAudit:"Mar 19, 2026", openAPs:0 },
      { name:"Salt Lake City Store #5022", score:92, audits:3, lastAudit:"Mar 26, 2026", openAPs:0 },
    ],
    recentAudits: [
      { id:"AUD-035177", location:"Seattle Pike Store #5001",   score:90, date:"Mar 5, 2026" },
      { id:"AUD-035264", location:"Portland Lloyd Store #5009", score:91, date:"Mar 12, 2026" },
      { id:"AUD-035352", location:"Denver 16th St Store #5014", score:92, date:"Mar 19, 2026" },
    ],
    overdueAPs: [],
  },
  P006: {
    avgCompliance: 66, auditsCompleted: 18, openAPs: 2, overdue: 2, trend: "down",
    locations: [
      { name:"Atlanta Perimeter Store #6005",     score:62, audits:3, lastAudit:"Mar 7, 2026",  openAPs:2 },
      { name:"Nashville Green Hills Store #6011", score:68, audits:2, lastAudit:"Mar 14, 2026", openAPs:1 },
      { name:"Charlotte SouthPark Store #6018",   score:70, audits:2, lastAudit:"Mar 21, 2026", openAPs:0 },
    ],
    recentAudits: [
      { id:"AUD-035196", location:"Atlanta Perimeter Store #6005",     score:62, date:"Mar 7, 2026" },
      { id:"AUD-035283", location:"Nashville Green Hills Store #6011", score:68, date:"Mar 14, 2026" },
      { id:"AUD-035369", location:"Charlotte SouthPark Store #6018",   score:70, date:"Mar 21, 2026" },
    ],
    overdueAPs: [
      { action:"Merchandise secured in all high-risk zones", location:"Atlanta Perimeter Store #6005", assignee:"M. King",      due:"Mar 18, 2026", daysOver:27 },
      { action:"EAS tags applied correctly on all items",    location:"Atlanta Perimeter Store #6005", assignee:"J. Rodriguez", due:"Mar 25, 2026", daysOver:20 },
    ],
  },
  P007: {
    avgCompliance: 78, auditsCompleted: 71, openAPs: 1, overdue: 1, trend: "flat",
    locations: [
      { name:"Seattle Pike Store #5001",      score:72, audits:6, lastAudit:"Mar 5, 2026",  openAPs:1 },
      { name:"Denver 16th St Store #5014",    score:75, audits:5, lastAudit:"Mar 12, 2026", openAPs:0 },
      { name:"Portland Lloyd Store #5009",    score:78, audits:5, lastAudit:"Mar 19, 2026", openAPs:0 },
      { name:"Boise Towne Square Store #5031",score:80, audits:4, lastAudit:"Mar 26, 2026", openAPs:0 },
    ],
    recentAudits: [
      { id:"AUD-035180", location:"Seattle Pike Store #5001",   score:72, date:"Mar 5, 2026" },
      { id:"AUD-035267", location:"Denver 16th St Store #5014", score:75, date:"Mar 12, 2026" },
      { id:"AUD-035355", location:"Portland Lloyd Store #5009", score:78, date:"Mar 19, 2026" },
    ],
    overdueAPs: [
      { action:"MSDS sheets accessible to all employees", location:"Seattle Pike Store #5001", assignee:"T. Wu", due:"Mar 18, 2026", daysOver:27 },
    ],
  },
};

const CRITICAL_LOCS = {
  P001: [
    { name:"New York Central",  region:"NE Region", district:"Manhattan District",    type:"Flagship", score:48, delta:-9, days:30 },
    { name:"Chicago Wacker",    region:"MW Region", district:"Chicago District",       type:"Standard", score:60, delta:-3, days:30 },
    { name:"Philadelphia Main", region:"NE Region", district:"Philadelphia District",  type:"Standard", score:65, delta:-1, days:30 },
  ],
  P002: [
    { name:"Miami Flagler",     region:"SE Region", district:"South FL District",      type:"Standard", score:55, delta:-6, days:30 },
    { name:"Boston Newbury",    region:"NE Region", district:"Boston District",        type:"Standard", score:68, delta:-2, days:30 },
  ],
  P004: [
    { name:"Dallas Galleria",   region:"SW Region", district:"DFW District",           type:"Flagship", score:64, delta: 2, days:30 },
    { name:"LA Westside",       region:"SW Region", district:"LA District",             type:"Standard", score:69, delta:-1, days:30 },
  ],
  P006: [
    { name:"Atlanta Perimeter", region:"SE Region", district:"Atlanta District",       type:"Standard", score:62, delta:-4, days:30 },
    { name:"Nashville Green Hills", region:"SE Region", district:"Nashville District", type:"Standard", score:68, delta:-1, days:30 },
  ],
  P007: [
    { name:"Seattle Pike",      region:"NW Region", district:"Seattle District",       type:"Standard", score:72, delta: 1, days:30 },
  ],
};

const BEHIND_PEOPLE = {
  P001: [
    { name:"Marcus King",     role:"DLPM",          location:"SE District 1",   ini:"MK", ov:3, tot:8 },
    { name:"Sarah Patel",     role:"DLPM",          location:"NE District 2",   ini:"SP", ov:2, tot:6 },
    { name:"James Rodriguez", role:"Store Mgr",     location:"Miami Flagler",    ini:"JR", ov:2, tot:4 },
    { name:"Linda Chen",      role:"AP Specialist", location:"West District 3", ini:"LC", ov:1, tot:5 },
  ],
  P002: [
    { name:"Sarah Patel",     role:"DLPM",       location:"NE District 2",  ini:"SP", ov:2, tot:6 },
    { name:"James Rodriguez", role:"Store Mgr",  location:"Miami Flagler",   ini:"JR", ov:2, tot:4 },
  ],
  P004: [
    { name:"Linda Chen", role:"AP Specialist", location:"West District 3",  ini:"LC", ov:3, tot:5 },
    { name:"Tom Wu",     role:"Ops Mgr",       location:"Chicago Wacker",   ini:"TW", ov:1, tot:3 },
  ],
  P006: [
    { name:"Marcus King",     role:"DLPM",      location:"SE District 1",    ini:"MK", ov:2, tot:8 },
    { name:"James Rodriguez", role:"Store Mgr", location:"Atlanta Perimeter",ini:"JR", ov:2, tot:4 },
  ],
  P007: [
    { name:"Tom Wu", role:"Ops Mgr", location:"Chicago Wacker", ini:"TW", ov:1, tot:3 },
  ],
};

const FAILING_DATA = {
  P001: {
    questions: [
      // Health & Safety
      { text:"Emergency exit signage verified and unobstructed",  failRate:78, locations:6, crit:true  },
      { text:"Fire extinguisher inspection log is current",        failRate:72, locations:5, crit:true  },
      { text:"Chemical storage log up to date and accessible",     failRate:65, locations:5, crit:true  },
      { text:"First aid kit fully stocked",                        failRate:58, locations:4, crit:false },
      { text:"PPE available at all required stations",             failRate:54, locations:4, crit:false },
      { text:"Slip/trip hazards documented and addressed",         failRate:51, locations:4, crit:false },
      { text:"Safety data sheets accessible to employees",         failRate:44, locations:3, crit:false },
      { text:"Incident log reviewed in last 30 days",              failRate:38, locations:3, crit:false },
      // Loss Prevention
      { text:"Cash drawer reconciliation performed at shift end",  failRate:62, locations:5, crit:true  },
      { text:"CCTV coverage active across all zones",              failRate:55, locations:4, crit:true  },
      { text:"EAS tag deactivation working at all exits",          failRate:47, locations:3, crit:false },
      { text:"Return desk controls and receipts validated",        failRate:41, locations:3, crit:false },
      // Operations
      { text:"Opening checklist signed off before doors open",     failRate:36, locations:3, crit:false },
      { text:"Daily task list completed and signed off",           failRate:29, locations:2, crit:false },
      { text:"Floor walk documented at opening and closing",       failRate:24, locations:2, crit:false },
    ],
  },
  P002: {
    questions: [
      { text:"CCTV coverage active across all zones",              failRate:65, locations:4, crit:true  },
      { text:"Cash handling procedures followed at POS",           failRate:61, locations:4, crit:true  },
      { text:"Cash counting performed with two employees present", failRate:55, locations:3, crit:true  },
      { text:"Access control logs reviewed this week",             failRate:44, locations:3, crit:false },
      { text:"Return desk controls and receipts validated",        failRate:36, locations:2, crit:false },
    ],
  },
  P004: {
    questions: [
      { text:"PPE available and accessible at all stations",       failRate:62, locations:3, crit:true  },
      { text:"Gloves stocked in all required sizes",               failRate:58, locations:3, crit:false },
      { text:"PPE is in good, undamaged condition",                failRate:54, locations:3, crit:false },
      { text:"PPE training records current for all staff",         failRate:41, locations:2, crit:false },
    ],
  },
  P006: {
    questions: [
      { text:"Merchandise secured in all high-risk zones",         failRate:68, locations:3, crit:true  },
      { text:"EAS tags applied correctly on all items",            failRate:55, locations:3, crit:false },
      { text:"Return desk controls followed consistently",         failRate:44, locations:2, crit:false },
      { text:"Inventory counts match shipping documents",          failRate:36, locations:2, crit:false },
    ],
  },
  P007: {
    questions: [
      { text:"MSDS sheets accessible to all employees",            failRate:61, locations:4, crit:true  },
      { text:"Lockout/tagout procedures posted at equipment",      failRate:52, locations:4, crit:true  },
      { text:"Employee right-to-know training current",            failRate:44, locations:3, crit:false },
      { text:"OSHA 300 log updated with all incidents",            failRate:33, locations:2, crit:false },
    ],
  },
};

const AVG_SCORES = {
  P001: [
    { text:"Emergency exit signage verified",                  score:50 },
    { text:"Employee right-to-know training current",          score:50 },
    { text:"Lockout/tagout procedures posted at equipment",    score:52 },
    { text:"Personal protective equipment condition checked",  score:55 },
    { text:"Hazardous materials labeled and stored correctly", score:58 },
    { text:"PPE available at all required stations",           score:62 },
    { text:"Chemical storage log up to date",                  score:65 },
    { text:"Incident log reviewed in last 30 days",            score:68 },
    { text:"Safety data sheets accessible to employees",       score:72 },
    { text:"First aid kit fully stocked and accessible",       score:76 },
    { text:"Slip/trip hazards documented and addressed",       score:79 },
    { text:"Fire extinguisher inspection log is current",      score:82 },
    { text:"Safety signage visible and up to date",            score:85 },
    { text:"PPE training records current for all staff",       score:88 },
    { text:"Incident reporting procedures communicated",       score:91 },
    { text:"Safety committee meeting minutes reviewed",        score:97 },
  ],
  P002: [
    { text:"Break room free of concealed merchandise",        score:55 },
    { text:"Receipt checks performed for large transactions", score:58 },
    { text:"Cash counting with two employees present",        score:63 },
    { text:"Cash handling procedures followed at POS",        score:68 },
    { text:"CCTV coverage active across all zones",           score:72 },
    { text:"Access control logs reviewed this week",          score:76 },
    { text:"EAS deactivation working at all exits",           score:79 },
    { text:"High-value merchandise secured in showcases",     score:82 },
    { text:"Return desk controls followed consistently",      score:84 },
    { text:"Fitting room checks conducted per policy",        score:88 },
    { text:"Blind spot mirrors in place and angled",          score:92 },
    { text:"Employee awareness training completed",           score:95 },
  ],
  P003: [
    { text:"End-of-day checklist completed",                  score:86 },
    { text:"Floor walk completed before opening",             score:88 },
    { text:"Restroom cleanliness meets standard",             score:88 },
    { text:"Daily task list completed and signed off",        score:89 },
    { text:"Team communication board updated",                score:90 },
    { text:"Display organization matches brand standards",    score:91 },
    { text:"Stock replenishment completed on schedule",       score:92 },
    { text:"Promotional signage accurate and current",        score:93 },
    { text:"Planogram compliance verified",                   score:95 },
    { text:"Customer service greeting standards met",         score:97 },
  ],
  P004: [
    { text:"PPE available and accessible at all stations",    score:62 },
    { text:"Gloves stocked in all required sizes",            score:66 },
    { text:"PPE is in good, undamaged condition",             score:70 },
    { text:"Slip/trip hazards documented",                    score:74 },
    { text:"First aid kit fully stocked",                     score:78 },
    { text:"Incident log reviewed in last 30 days",           score:82 },
    { text:"Safety signage visible and compliant",            score:86 },
    { text:"PPE training records current for all staff",      score:90 },
  ],
  P005: [
    { text:"Loss prevention metrics reviewed",                score:85 },
    { text:"Vendor check-in protocols followed",              score:86 },
    { text:"Compliance calendar up to date",                  score:87 },
    { text:"Store walk completed and documented",             score:88 },
    { text:"Action plan follow-up completed",                 score:89 },
    { text:"Audit findings reviewed with team",               score:90 },
    { text:"Training completion rate on track",               score:91 },
    { text:"Daily sales reconciliation completed",            score:92 },
    { text:"Opening checklist signed off",                    score:93 },
    { text:"Inventory accuracy check completed",              score:94 },
    { text:"Employee scheduling accuracy",                    score:95 },
    { text:"Customer satisfaction metrics reviewed",          score:97 },
  ],
  P006: [
    { text:"Merchandise secured in all high-risk zones",      score:58 },
    { text:"High-risk zones checked every two hours",         score:61 },
    { text:"EAS tags applied correctly on all items",         score:65 },
    { text:"Employee awareness training completed",           score:70 },
    { text:"Return desk controls followed consistently",      score:75 },
    { text:"Inventory counts match shipping documents",       score:80 },
    { text:"Deactivation pads functioning at exits",          score:84 },
    { text:"Fitting room capacity sign posted",               score:88 },
  ],
  P007: [
    { text:"Lockout/tagout procedures posted at equipment",   score:65 },
    { text:"MSDS sheets accessible to all employees",         score:68 },
    { text:"Employee right-to-know training current",         score:71 },
    { text:"OSHA 300 log updated with all incidents",         score:76 },
    { text:"Safety signage visible and current",              score:80 },
    { text:"First aid kit fully stocked",                     score:84 },
    { text:"Incident log reviewed in last 30 days",           score:88 },
    { text:"Safety committee meeting minutes reviewed",       score:92 },
  ],
};

const USER_SCORES = {
  P001: [
    { name:"Sarah Chen",      role:"AP Specialist", ini:"SC", audits:12, avgScore:58 },
    { name:"Marcus King",     role:"DLPM",          ini:"MK", audits: 8, avgScore:63 },
    { name:"James Rodriguez", role:"Store Mgr",     ini:"JR", audits: 6, avgScore:67 },
    { name:"Linda Chen",      role:"AP Specialist", ini:"LC", audits: 5, avgScore:71 },
    { name:"Sarah Patel",     role:"DLPM",          ini:"SP", audits: 3, avgScore:74 },
  ],
  P002: [
    { name:"James Rodriguez", role:"Store Mgr",     ini:"JR", audits: 9, avgScore:55 },
    { name:"Sarah Patel",     role:"DLPM",          ini:"SP", audits: 7, avgScore:68 },
    { name:"Tom Wu",          role:"Ops Mgr",       ini:"TW", audits: 6, avgScore:74 },
    { name:"Linda Chen",      role:"AP Specialist", ini:"LC", audits: 6, avgScore:81 },
  ],
  P003: [
    { name:"Tom Wu",          role:"Ops Mgr",       ini:"TW", audits: 9, avgScore:86 },
    { name:"Linda Chen",      role:"AP Specialist", ini:"LC", audits: 8, avgScore:88 },
    { name:"Sarah Chen",      role:"AP Specialist", ini:"SC", audits: 5, avgScore:90 },
    { name:"Sarah Patel",     role:"DLPM",          ini:"SP", audits: 4, avgScore:91 },
  ],
  P004: [
    { name:"Linda Chen",      role:"AP Specialist", ini:"LC", audits: 6, avgScore:64 },
    { name:"Tom Wu",          role:"Ops Mgr",       ini:"TW", audits: 5, avgScore:68 },
    { name:"Marcus King",     role:"DLPM",          ini:"MK", audits: 4, avgScore:73 },
  ],
  P005: [
    { name:"Sarah Chen",      role:"AP Specialist", ini:"SC", audits:16, avgScore:89 },
    { name:"Tom Wu",          role:"Ops Mgr",       ini:"TW", audits:14, avgScore:91 },
    { name:"Sarah Patel",     role:"DLPM",          ini:"SP", audits:14, avgScore:92 },
    { name:"Marcus King",     role:"DLPM",          ini:"MK", audits:14, avgScore:93 },
  ],
  P006: [
    { name:"Marcus King",     role:"DLPM",          ini:"MK", audits: 7, avgScore:62 },
    { name:"James Rodriguez", role:"Store Mgr",     ini:"JR", audits: 6, avgScore:66 },
    { name:"Sarah Patel",     role:"DLPM",          ini:"SP", audits: 5, avgScore:70 },
  ],
  P007: [
    { name:"Tom Wu",          role:"Ops Mgr",       ini:"TW", audits:20, avgScore:72 },
    { name:"Sarah Chen",      role:"AP Specialist", ini:"SC", audits:18, avgScore:76 },
    { name:"James Rodriguez", role:"Store Mgr",     ini:"JR", audits:17, avgScore:79 },
    { name:"Linda Chen",      role:"AP Specialist", ini:"LC", audits:16, avgScore:83 },
  ],
};

// Scheduled vs. completed — drives completion rate + missed audits
const SCHEDULED = {
  P001: { scheduled:44, completed:34, missed:[
    { name:"Brooklyn Heights Store #1055", district:"Manhattan District", daysLate:12 },
    { name:"Jersey City Store #1061",      district:"NJ District",         daysLate: 9 },
    { name:"Newark Penn Store #1072",      district:"NJ District",         daysLate: 7 },
    { name:"Stamford Main Store #1088",    district:"CT District",         daysLate: 4 },
  ]},
  P002: { scheduled:32, completed:28, missed:[
    { name:"Fort Lauderdale Store #2033",  district:"South FL District",   daysLate:10 },
    { name:"Tampa Bay Store #2040",        district:"West FL District",    daysLate: 5 },
  ]},
  P003: { scheduled:26, completed:26, missed:[] },
  P004: { scheduled:20, completed:15, missed:[
    { name:"Houston Galleria Store #4031", district:"Houston District",    daysLate:14 },
    { name:"Austin Barton Store #4040",    district:"Austin District",     daysLate: 8 },
    { name:"San Antonio RiverCenter #4047",district:"SA District",         daysLate: 3 },
  ]},
  P005: { scheduled:60, completed:58, missed:[
    { name:"Spokane Valley Store #5045",   district:"Inland NW District",  daysLate: 2 },
  ]},
  P006: { scheduled:24, completed:18, missed:[
    { name:"Birmingham Summit Store #6024",district:"Birmingham District", daysLate:11 },
    { name:"Memphis Wolfchase Store #6031",district:"Memphis District",    daysLate: 6 },
    { name:"Louisville Oxmoor Store #6038",district:"Louisville District", daysLate: 3 },
  ]},
  P007: { scheduled:72, completed:71, missed:[
    { name:"Anchorage Dimond Store #5055", district:"AK District",         daysLate: 4 },
  ]},
};

// Multi-line trend: compliance score over last 8 weeks, split by template
const WEEKS = ["W1","W2","W3","W4","W5","W6","W7","W8"];
const TREND_BY_TEMPLATE = {
  P001: [
    // Health & Safety
    { name:"Safety Compliance Full", color:"#dc2626", points:[72,68,65,63,58,55,52,50] },
    { name:"Fire Safety Checklist",  color:"#ef4444", points:[80,78,76,74,71,68,66,64] },
    { name:"Chemical Storage Audit", color:"#f97316", points:[78,74,70,66,63,62,60,58] },
    { name:"Emergency Preparedness", color:"#f59e0b", points:[70,68,65,62,58,55,54,52] },
    // Loss Prevention
    { name:"LP Floor Audit",         color:"#2226f7", points:[84,82,80,78,76,75,74,73] },
    { name:"Cash Handling Review",   color:"#6366f1", points:[78,76,74,72,70,69,68,67] },
    { name:"CCTV Compliance Check",  color:"#0891b2", points:[88,87,86,85,84,83,82,82] },
    // Operations
    { name:"Opening Checklist",      color:"#15803d", points:[90,90,91,91,92,92,93,93] },
    { name:"Daily Ops Checklist",    color:"#059669", points:[86,87,87,88,88,89,89,90] },
  ],
  P002: [
    // Loss Prevention
    { name:"LP Floor Audit",         color:"#2226f7", points:[82,80,78,75,74,73,72,72] },
    { name:"Cash Handling Review",   color:"#6366f1", points:[75,72,70,68,66,65,64,66] },
    { name:"CCTV Compliance Check",  color:"#0891b2", points:[80,78,76,74,72,71,70,70] },
    // Health & Safety
    { name:"Fire Safety Checklist",  color:"#ef4444", points:[84,83,82,81,80,80,79,79] },
    { name:"Emergency Preparedness", color:"#f59e0b", points:[82,81,81,80,80,79,79,79] },
    // Operations
    { name:"Opening Checklist",      color:"#15803d", points:[88,88,89,89,90,90,90,91] },
    { name:"Daily Ops Checklist",    color:"#059669", points:[85,86,86,87,87,88,88,89] },
  ],
  P003: [
    { name:"Ops Standards Full",      color:C.teal,  points:[85,86,86,87,88,89,90,91] },
    { name:"Opening Checklist",       color:C.ocean, points:[82,84,85,85,86,87,88,88] },
    { name:"Customer Experience",     color:C.yel,   points:[80,82,83,83,84,85,86,87] },
  ],
  P004: [
    { name:"PPE Compliance Full",     color:C.red,   points:[78,75,73,71,70,68,66,64] },
    { name:"PPE Condition Check",     color:C.yel,   points:[82,80,78,76,74,72,71,70] },
    { name:"Training Records Audit",  color:C.ocean, points:[84,83,82,81,80,79,78,78] },
  ],
  P005: [
    { name:"Store Ops Full",          color:C.teal,  points:[88,89,89,90,90,91,91,92] },
    { name:"Inventory Accuracy",      color:C.ocean, points:[85,86,87,88,89,90,90,91] },
    { name:"Daily Ops Checklist",     color:C.yel,   points:[86,87,87,88,89,90,90,90] },
  ],
  P006: [
    { name:"Shrink Prevention Full",  color:C.red,   points:[76,73,70,68,66,64,63,62] },
    { name:"EAS Compliance",          color:C.yel,   points:[78,76,73,70,68,67,65,64] },
    { name:"Returns & Exchanges",     color:C.ocean, points:[80,78,76,74,72,70,69,68] },
  ],
  P007: [
    { name:"OSHA Compliance Full",    color:C.ocean, points:[78,78,79,78,78,79,78,78] },
    { name:"Hazmat Handling Audit",   color:C.yel,   points:[75,74,73,73,72,72,72,72] },
    { name:"Recordkeeping Review",    color:C.teal,  points:[82,82,82,82,82,82,82,83] },
  ],
};

// Critical Focus — grouped by Section (topic area)
const FAILING_BY_SECTION = {
  P001: [
    { text:"Emergency Preparedness",   failRate:78, locations:6, crit:true  },
    { text:"Chemical Storage",         failRate:65, locations:5, crit:true  },
    { text:"Personal Protective Equip.",failRate:58, locations:4, crit:false },
    { text:"Slip, Trip & Fall",        failRate:51, locations:4, crit:false },
    { text:"Fire Safety Compliance",   failRate:44, locations:3, crit:true  },
    { text:"Incident Reporting",       failRate:38, locations:3, crit:false },
  ],
  P002: [
    { text:"Cash Handling Controls",   failRate:65, locations:4, crit:true  },
    { text:"CCTV & Surveillance",      failRate:58, locations:3, crit:true  },
    { text:"Access Control",           failRate:44, locations:3, crit:false },
    { text:"Returns & Refunds",        failRate:36, locations:2, crit:false },
  ],
  P004: [
    { text:"PPE Availability",         failRate:62, locations:3, crit:true  },
    { text:"PPE Condition & Quality",  failRate:54, locations:3, crit:false },
    { text:"PPE Training Records",     failRate:41, locations:2, crit:false },
  ],
  P006: [
    { text:"High-Risk Merchandise",    failRate:68, locations:3, crit:true  },
    { text:"EAS Tagging",              failRate:55, locations:3, crit:false },
    { text:"Returns & Exchanges",      failRate:44, locations:2, crit:false },
    { text:"Inventory Reconciliation", failRate:36, locations:2, crit:false },
  ],
  P007: [
    { text:"Hazardous Materials",      failRate:61, locations:4, crit:true  },
    { text:"Lockout/Tagout",           failRate:52, locations:4, crit:true  },
    { text:"Employee Right-to-Know",   failRate:44, locations:3, crit:false },
    { text:"Recordkeeping",            failRate:33, locations:2, crit:false },
  ],
};

// Per-question membership: which templates + sections each failing question belongs to
const QUESTION_META = {
  P001: {
    // Health & Safety
    "Emergency exit signage verified and unobstructed":   { templates:["Safety Compliance Full","Emergency Preparedness"], sections:["Emergency Preparedness","Fire Safety Compliance"] },
    "Fire extinguisher inspection log is current":         { templates:["Fire Safety Checklist","Safety Compliance Full"],   sections:["Fire Safety Compliance"] },
    "Chemical storage log up to date and accessible":      { templates:["Chemical Storage Audit","Safety Compliance Full"],  sections:["Chemical Storage"] },
    "First aid kit fully stocked":                         { templates:["Emergency Preparedness","Safety Compliance Full"], sections:["Emergency Preparedness","Incident Reporting"] },
    "PPE available at all required stations":              { templates:["Safety Compliance Full"],                           sections:["Personal Protective Equip."] },
    "Slip/trip hazards documented and addressed":          { templates:["Safety Compliance Full"],                           sections:["Slip, Trip & Fall"] },
    "Safety data sheets accessible to employees":          { templates:["Chemical Storage Audit","Safety Compliance Full"],  sections:["Chemical Storage"] },
    "Incident log reviewed in last 30 days":               { templates:["Safety Compliance Full"],                           sections:["Incident Reporting"] },
    // Loss Prevention
    "Cash drawer reconciliation performed at shift end":   { templates:["Cash Handling Review","LP Floor Audit"],            sections:["Cash Handling Controls"] },
    "CCTV coverage active across all zones":               { templates:["CCTV Compliance Check","LP Floor Audit"],           sections:["CCTV & Surveillance"] },
    "EAS tag deactivation working at all exits":           { templates:["LP Floor Audit"],                                    sections:["EAS Tagging"] },
    "Return desk controls and receipts validated":         { templates:["LP Floor Audit"],                                    sections:["Returns & Refunds"] },
    // Operations
    "Opening checklist signed off before doors open":      { templates:["Opening Checklist","Daily Ops Checklist"],          sections:["Daily Operations"] },
    "Daily task list completed and signed off":            { templates:["Daily Ops Checklist"],                               sections:["Daily Operations"] },
    "Floor walk documented at opening and closing":        { templates:["Opening Checklist","Daily Ops Checklist"],          sections:["Daily Operations"] },
  },
  P002: {
    "CCTV coverage active across all zones":               { templates:["LP Floor Audit","CCTV Compliance Check"], sections:["CCTV & Surveillance"] },
    "Cash handling procedures followed at POS":            { templates:["LP Floor Audit","Cash Handling Review"],   sections:["Cash Handling Controls"] },
    "Cash counting performed with two employees present":  { templates:["Cash Handling Review"],                     sections:["Cash Handling Controls"] },
    "Access control logs reviewed this week":              { templates:["LP Floor Audit"],                           sections:["Access Control"] },
    "Return desk controls and receipts validated":         { templates:["LP Floor Audit"],                           sections:["Returns & Refunds"] },
  },
  P004: {
    "PPE available and accessible at all stations":        { templates:["PPE Compliance Full"],                                     sections:["PPE Availability"] },
    "Gloves stocked in all required sizes":                { templates:["PPE Compliance Full","PPE Condition Check"],               sections:["PPE Availability"] },
    "PPE is in good, undamaged condition":                 { templates:["PPE Compliance Full","PPE Condition Check"],               sections:["PPE Condition & Quality"] },
    "PPE training records current for all staff":          { templates:["PPE Compliance Full","Training Records Audit"],            sections:["PPE Training Records"] },
  },
  P006: {
    "Merchandise secured in all high-risk zones":          { templates:["Shrink Prevention Full"],                         sections:["High-Risk Merchandise"] },
    "EAS tags applied correctly on all items":             { templates:["Shrink Prevention Full","EAS Compliance"],        sections:["EAS Tagging"] },
    "Return desk controls followed consistently":          { templates:["Shrink Prevention Full","Returns & Exchanges Audit"], sections:["Returns & Exchanges"] },
    "Inventory counts match shipping documents":           { templates:["Shrink Prevention Full"],                         sections:["Inventory Reconciliation"] },
  },
  P007: {
    "MSDS sheets accessible to all employees":             { templates:["OSHA Compliance Full","Hazmat Handling Audit"],    sections:["Hazardous Materials","Employee Right-to-Know"] },
    "Lockout/tagout procedures posted at equipment":       { templates:["OSHA Compliance Full","Hazmat Handling Audit"],    sections:["Lockout/Tagout"] },
    "Employee right-to-know training current":             { templates:["OSHA Compliance Full"],                             sections:["Employee Right-to-Know"] },
    "OSHA 300 log updated with all incidents":             { templates:["OSHA Compliance Full","Recordkeeping Review"],      sections:["Recordkeeping"] },
  },
};

// Critical Focus — grouped by Template
const FAILING_BY_TEMPLATE = {
  P001: [
    { text:"Safety Compliance Full",     failRate:72, locations:8, crit:true  },
    { text:"Fire Safety Checklist",       failRate:58, locations:5, crit:true  },
    { text:"Chemical Storage Audit",      failRate:52, locations:4, crit:false },
    { text:"Emergency Preparedness",      failRate:46, locations:3, crit:false },
  ],
  P002: [
    { text:"LP Floor Audit",              failRate:62, locations:6, crit:true  },
    { text:"Cash Handling Review",        failRate:55, locations:4, crit:true  },
    { text:"CCTV Compliance Check",       failRate:41, locations:3, crit:false },
  ],
  P004: [
    { text:"PPE Compliance Full",         failRate:64, locations:4, crit:true  },
    { text:"PPE Condition Check",         failRate:51, locations:3, crit:false },
    { text:"Training Records Audit",      failRate:38, locations:2, crit:false },
  ],
  P006: [
    { text:"Shrink Prevention Full",      failRate:66, locations:5, crit:true  },
    { text:"EAS Compliance",              failRate:54, locations:4, crit:false },
    { text:"Returns & Exchanges Audit",   failRate:42, locations:3, crit:false },
  ],
  P007: [
    { text:"OSHA Compliance Full",        failRate:58, locations:6, crit:true  },
    { text:"Hazmat Handling Audit",       failRate:49, locations:5, crit:false },
    { text:"Recordkeeping Review",        failRate:34, locations:3, crit:false },
  ],
};

// Critical Focus — grouped by Location
const FAILING_BY_LOCATION = {
  P001: [
    { text:"New York Central Store #1000",  failRate:72, locations:1, crit:true  },
    { text:"Chicago Wacker Store #1042",    failRate:58, locations:1, crit:true  },
    { text:"Philadelphia Main Store #1018", failRate:45, locations:1, crit:false },
    { text:"Atlanta Peachtree Store #1031", failRate:38, locations:1, crit:false },
  ],
  P002: [
    { text:"Miami Flagler Store #2011",     failRate:64, locations:1, crit:true  },
    { text:"Boston Newbury Store #2004",    failRate:48, locations:1, crit:false },
    { text:"Hartford Downtown Store #2019", failRate:39, locations:1, crit:false },
  ],
  P004: [
    { text:"Dallas Galleria Store #4003",   failRate:62, locations:1, crit:true  },
    { text:"LA Westside Store #4017",       failRate:48, locations:1, crit:false },
    { text:"Phoenix Desert Ridge #4024",    failRate:34, locations:1, crit:false },
  ],
  P006: [
    { text:"Atlanta Perimeter Store #6005", failRate:65, locations:1, crit:true  },
    { text:"Nashville Green Hills #6011",   failRate:52, locations:1, crit:false },
    { text:"Charlotte SouthPark Store #6018",failRate:40, locations:1, crit:false },
  ],
  P007: [
    { text:"Seattle Pike Store #5001",      failRate:58, locations:1, crit:true  },
    { text:"Denver 16th St Store #5014",    failRate:45, locations:1, crit:false },
    { text:"Portland Lloyd Store #5009",    failRate:36, locations:1, crit:false },
  ],
};

// Trend broken down by audit Section (topic area)
const TREND_BY_SECTION = {
  P001: [
    { name:"Emergency Preparedness", color:C.red,   points:[70,68,65,62,58,55,54,52] },
    { name:"Chemical Storage",        color:C.yel,   points:[75,72,70,66,63,62,60,58] },
    { name:"Fire Safety",             color:C.ocean, points:[80,78,76,74,71,68,66,64] },
    { name:"PPE",                     color:C.teal,  points:[82,80,78,76,74,72,71,70] },
  ],
  P002: [
    { name:"Cash Handling",           color:C.red,   points:[75,72,70,68,66,65,64,66] },
    { name:"CCTV & Surveillance",     color:C.yel,   points:[80,78,76,74,72,71,70,70] },
    { name:"Access Control",          color:C.ocean, points:[82,80,79,78,77,76,76,76] },
    { name:"Returns & Refunds",       color:C.teal,  points:[84,83,82,82,82,82,82,83] },
  ],
  P003: [
    { name:"Customer Experience",     color:C.teal,  points:[85,86,87,88,89,90,91,92] },
    { name:"Planogram Compliance",    color:C.ocean, points:[83,84,85,86,87,88,89,90] },
    { name:"Daily Operations",        color:C.yel,   points:[82,83,84,84,85,86,87,88] },
  ],
  P004: [
    { name:"PPE Availability",        color:C.red,   points:[76,73,71,69,67,65,64,62] },
    { name:"PPE Condition",           color:C.yel,   points:[82,80,78,76,74,72,71,70] },
    { name:"PPE Training",            color:C.ocean, points:[85,84,83,82,81,80,79,79] },
  ],
  P005: [
    { name:"Store Operations",        color:C.teal,  points:[88,89,89,90,90,91,91,92] },
    { name:"Inventory Accuracy",      color:C.ocean, points:[86,87,88,89,90,90,91,91] },
    { name:"Team Performance",        color:C.yel,   points:[85,86,87,88,89,90,90,91] },
  ],
  P006: [
    { name:"High-Risk Merch.",        color:C.red,   points:[74,71,68,66,64,62,61,60] },
    { name:"EAS Tagging",             color:C.yel,   points:[78,76,73,70,68,67,65,64] },
    { name:"Returns & Exchanges",     color:C.ocean, points:[80,78,76,74,72,70,69,68] },
  ],
  P007: [
    { name:"Hazardous Materials",     color:C.red,   points:[75,74,73,73,72,72,72,72] },
    { name:"Lockout/Tagout",          color:C.yel,   points:[78,77,77,76,76,75,75,75] },
    { name:"Recordkeeping",           color:C.teal,  points:[82,82,82,82,82,82,82,83] },
  ],
};

// Trend broken down by top Locations
const TREND_BY_LOCATION = {
  P001: [
    { name:"New York Central",    color:C.red,   points:[58,55,52,52,50,49,48,48] },
    { name:"Chicago Wacker",      color:C.yel,   points:[68,66,64,63,62,61,60,60] },
    { name:"Philadelphia Main",   color:C.ocean, points:[72,70,69,68,67,66,65,65] },
    { name:"Atlanta Peachtree",   color:C.teal,  points:[74,72,71,70,69,68,68,68] },
  ],
  P002: [
    { name:"Miami Flagler",       color:C.red,   points:[64,61,59,57,56,55,55,55] },
    { name:"Boston Newbury",      color:C.yel,   points:[72,71,70,69,68,68,68,68] },
    { name:"Hartford Downtown",   color:C.ocean, points:[75,74,73,72,72,71,71,71] },
    { name:"Providence Mall",     color:C.teal,  points:[80,79,79,78,78,78,78,78] },
  ],
  P003: [
    { name:"Columbus Easton",     color:C.ocean, points:[84,85,85,86,86,86,86,86] },
    { name:"Indianapolis Circle", color:C.teal,  points:[86,87,87,88,88,88,88,88] },
    { name:"Detroit Midtown",     color:C.yel,   points:[87,88,88,89,89,89,89,89] },
    { name:"Milwaukee Downtown",  color:C.red,   points:[88,89,89,90,90,90,90,90] },
  ],
  P004: [
    { name:"Dallas Galleria",     color:C.red,   points:[70,68,67,66,65,64,64,64] },
    { name:"LA Westside",         color:C.yel,   points:[74,72,71,70,70,69,69,69] },
    { name:"Phoenix Desert Ridge",color:C.ocean, points:[76,75,74,74,73,73,73,73] },
  ],
  P005: [
    { name:"Seattle Pike",        color:C.ocean, points:[88,89,89,90,90,90,90,90] },
    { name:"Portland Lloyd",      color:C.teal,  points:[89,90,90,91,91,91,91,91] },
    { name:"Denver 16th St",      color:C.yel,   points:[90,91,91,92,92,92,92,92] },
    { name:"Salt Lake City",      color:C.red,   points:[90,91,91,92,92,92,92,92] },
  ],
  P006: [
    { name:"Atlanta Perimeter",   color:C.red,   points:[70,67,65,64,63,62,62,62] },
    { name:"Nashville Green Hills",color:C.yel,  points:[72,71,70,69,68,68,68,68] },
    { name:"Charlotte SouthPark", color:C.ocean, points:[74,73,72,71,70,70,70,70] },
  ],
  P007: [
    { name:"Seattle Pike",        color:C.red,   points:[74,73,73,72,72,72,72,72] },
    { name:"Denver 16th St",      color:C.yel,   points:[77,76,76,75,75,75,75,75] },
    { name:"Portland Lloyd",      color:C.ocean, points:[79,78,78,78,78,78,78,78] },
    { name:"Boise Towne Square",  color:C.teal,  points:[81,81,80,80,80,80,80,80] },
  ],
};

// Repeat-fail tracking — items that have failed across multiple consecutive periods
const REPEAT_FAILS = {
  P001: {
    locations: [
      { name:"New York Central Store #1000", periods:4, trend:[58,54,50,48], issue:"Fire/Emergency" },
      { name:"Chicago Wacker Store #1042",   periods:3, trend:[68,64,60],    issue:"Chemical Storage" },
    ],
    questions: [
      { text:"Emergency exit signage verified", periods:4, trend:[58,54,52,50] },
      { text:"Fire extinguisher inspection log", periods:3, trend:[72,68,65] },
    ],
  },
  P002: {
    locations: [
      { name:"Miami Flagler Store #2011",    periods:3, trend:[63,58,55], issue:"CCTV/Cash Handling" },
    ],
    questions: [
      { text:"CCTV coverage active across zones", periods:3, trend:[72,68,65] },
      { text:"Cash handling procedures at POS",   periods:3, trend:[68,63,61] },
    ],
  },
  P003: { locations:[], questions:[] },
  P004: {
    locations: [
      { name:"Dallas Galleria Store #4003",  periods:3, trend:[70,67,64], issue:"PPE Availability" },
    ],
    questions: [
      { text:"PPE available at all stations", periods:3, trend:[70,66,62] },
    ],
  },
  P005: { locations:[], questions:[] },
  P006: {
    locations: [
      { name:"Atlanta Perimeter Store #6005",periods:3, trend:[68,65,62], issue:"High-Risk Merchandise" },
    ],
    questions: [
      { text:"Merchandise secured in high-risk zones", periods:3, trend:[66,62,58] },
    ],
  },
  P007: {
    locations: [
      { name:"Seattle Pike Store #5001",     periods:2, trend:[74,72],    issue:"Hazmat/MSDS" },
    ],
    questions: [
      { text:"MSDS sheets accessible to employees", periods:2, trend:[64,61] },
    ],
  },
};

// Template → Type/Category mapping. Templates are grouped under broader types
// (Health & Safety, Loss Prevention, Operations). Clicking a type filters the
// chart to only its templates.
const TEMPLATE_TYPES = {
  // Health & Safety
  "Safety Compliance Full":  "Health & Safety",
  "Fire Safety Checklist":   "Health & Safety",
  "Chemical Storage Audit":  "Health & Safety",
  "Emergency Preparedness":  "Health & Safety",
  "PPE Compliance Full":     "Health & Safety",
  "PPE Condition Check":     "Health & Safety",
  "Training Records Audit":  "Health & Safety",
  "OSHA Compliance Full":    "Health & Safety",
  "Hazmat Handling Audit":   "Health & Safety",
  "Recordkeeping Review":    "Health & Safety",
  // Loss Prevention
  "LP Floor Audit":          "Loss Prevention",
  "Cash Handling Review":    "Loss Prevention",
  "CCTV Compliance Check":   "Loss Prevention",
  "Shrink Prevention Full":  "Loss Prevention",
  "EAS Compliance":          "Loss Prevention",
  "Returns & Exchanges":     "Loss Prevention",
  // Operations
  "Ops Standards Full":      "Operations",
  "Opening Checklist":       "Operations",
  "Customer Experience":     "Operations",
  "Store Ops Full":          "Operations",
  "Inventory Accuracy":      "Operations",
  "Daily Ops Checklist":     "Operations",
};
const TYPE_COLOR = {
  "Health & Safety":  "#dc2626",
  "Loss Prevention":  "#2226f7",
  "Operations":       "#15803d",
};

const DEFAULT_DATA = {
  avgCompliance: 0, auditsCompleted: 0, openAPs: 0, overdue: 0, trend: "flat",
  locations: [], recentAudits: [], overdueAPs: [],
};
const DEFAULT_SCHEDULED = { scheduled:0, completed:0, missed:[] };
const DEFAULT_REPEAT = { locations:[], questions:[] };

// ── Shell icons ────────────────────────────────────────────────────────────
const I = {
  waffle:      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="1" y="1" width="4" height="4" rx="1"/><rect x="7" y="1" width="4" height="4" rx="1"/><rect x="13" y="1" width="4" height="4" rx="1"/><rect x="1" y="7" width="4" height="4" rx="1"/><rect x="7" y="7" width="4" height="4" rx="1"/><rect x="13" y="7" width="4" height="4" rx="1"/><rect x="1" y="13" width="4" height="4" rx="1"/><rect x="7" y="13" width="4" height="4" rx="1"/><rect x="13" y="13" width="4" height="4" rx="1"/></svg>,
  chevronLeft: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevronRight:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  chevronDown: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  check:       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  close:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  dashboard:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  programs:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="5" rx="1"/><rect x="3" y="17" width="18" height="4" rx="1"/></svg>,
  scorecard:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  actionPlan:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
};

const THINKLP_MODULES = [
  { id:"dashboard",     label:"Dashboard",    color:"#4f6bed" },
  { id:"cases",         label:"Cases",        color:"#5a7d9a" },
  { id:"investigations",label:"Investigations",color:"#7c6faa" },
  { id:"recovery",      label:"Recovery",     color:"#4a9e7e" },
  { id:"safety",        label:"Safety",       color:"#c97040" },
  { id:"audit",         label:"Audit",        color:"#5c8a5c", active:true },
  { id:"hr",            label:"HR",           color:"#8a7060" },
  { id:"insights",      label:"Insights",     color:"#2226f7" },
  { id:"crime-linking", label:"Crime Linking",color:"#8b5e8b" },
  { id:"admin",         label:"Admin",        color:"#6b6b6b" },
];

const AUDIT_NAV = [
  { id:"dashboard",    label:"Dashboard",    icon:"dashboard"  },
  { id:"programs",     label:"Programs",     icon:"programs"   },
  { id:"scorecard",    label:"Scorecard",    icon:"scorecard"  },
  { id:"action-plans", label:"Action Plans", icon:"actionPlan" },
];

// App launcher popup
const AppLauncher = ({ open, onClose }) => {
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} style={{ position:"fixed", top:69, left:52, zIndex:200, width:300, background:"#fff", borderRadius:10, border:"1px solid #e2e5e9", padding:16, boxShadow:"0 8px 30px rgba(0,0,0,0.12)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:13, fontWeight:800, color:"#16191d", fontFamily:"var(--f)", letterSpacing:"-0.5px" }}>think</span>
          <span style={{ background:"#2226f7", color:"#fff", fontSize:9, fontWeight:700, padding:"2px 4px", borderRadius:3 }}>LP</span>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#8692a2", display:"flex", padding:2 }}>{I.close}</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:6 }}>
        {THINKLP_MODULES.map(mod => (
          <button key={mod.id} onClick={onClose}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"12px 6px", borderRadius:8, border:"none", cursor:"pointer", background:mod.active ? "#f0f2ff" : "transparent" }}
            onMouseEnter={e => { if (!mod.active) e.currentTarget.style.background = "#f4f4f6"; }}
            onMouseLeave={e => { if (!mod.active) e.currentTarget.style.background = mod.active ? "#f0f2ff" : "transparent"; }}>
            <div style={{ width:36, height:36, borderRadius:8, background:mod.color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, fontWeight:700, fontFamily:"var(--f)" }}>{mod.label[0]}</div>
            <span style={{ fontSize:10, color:mod.active ? "#2226f7" : "#5c5c5c", fontWeight:mod.active ? 600 : 400, fontFamily:"var(--f)", textAlign:"center", lineHeight:"13px" }}>{mod.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Audit sidebar
const AuditSidebar = ({ activeNav, onNavClick }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [waffleH, setWaffleH] = useState(false);
  return (
    <aside style={{
      width: collapsed ? 52 : 231, minWidth: collapsed ? 52 : 231,
      height:"100vh", background:"#fff", borderRight:"1px solid #e2e5e9",
      display:"flex", flexDirection:"column", position:"relative", zIndex:20,
      transition:"width 0.2s ease, min-width 0.2s ease", overflow:"hidden", flexShrink:0,
    }}>
      {/* Sidebar header */}
      <div style={{ height:69, display:"flex", alignItems:"center", gap: collapsed ? 0 : 10, padding: collapsed ? "0 8px" : "0 12px", borderBottom:"0.81px solid #e2e5e9", flexShrink:0, justifyContent: collapsed ? "center" : "flex-start" }}>
        {!collapsed && (
          <>
            <button onClick={() => setLauncherOpen(!launcherOpen)}
              onMouseEnter={() => setWaffleH(true)} onMouseLeave={() => setWaffleH(false)}
              style={{ background: waffleH ? "#f0f0f0" : "none", border:"none", cursor:"pointer", color:"#555f6d", display:"flex", padding:5, borderRadius:6, flexShrink:0 }}>
              {I.waffle}
            </button>
            {/* ThinkLP logo mark */}
            <svg width="22" height="22" viewBox="0 0 100 100" fill="none" style={{ flexShrink:0 }}>
              <defs><linearGradient id="auditSideGrad" x1="0" y1="100" x2="100" y2="0"><stop offset="0%" stopColor="#5c8a5c"/><stop offset="100%" stopColor="#2226f7"/></linearGradient></defs>
              <circle cx="50" cy="50" r="44" stroke="url(#auditSideGrad)" strokeWidth="7" fill="none"/>
              <circle cx="50" cy="50" r="28" stroke="url(#auditSideGrad)" strokeWidth="5" fill="none"/>
              <circle cx="50" cy="38" r="8" fill="url(#auditSideGrad)"/>
              <rect x="44" y="46" width="12" height="20" rx="4" fill="url(#auditSideGrad)"/>
            </svg>
            <span style={{ fontWeight:700, fontSize:14, color:"#16191d", fontFamily:"var(--f)", letterSpacing:"-0.3px", flex:1, whiteSpace:"nowrap" }}>Audit</span>
          </>
        )}
        <button
          onClick={() => { setCollapsed(!collapsed); setLauncherOpen(false); }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ background:"none", border:"none", cursor:"pointer", color:"#8692a2", display:"flex", padding:5, borderRadius:6, flexShrink:0, marginLeft: collapsed ? 0 : "auto" }}
          onMouseEnter={e => e.currentTarget.style.background = "#e2e5e9"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          {collapsed ? I.chevronRight : I.chevronLeft}
        </button>
      </div>
      <AppLauncher open={launcherOpen} onClose={() => setLauncherOpen(false)} />
      {/* Nav */}
      <nav style={{ flex:1, padding: collapsed ? "10px 6px" : "10px 10px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
        {AUDIT_NAV.map(item => {
          const isActive = activeNav === item.id;
          const icon = I[item.icon];
          return collapsed ? (
            <button key={item.id} onClick={() => onNavClick(item.id)} title={item.label}
              style={{ width:"100%", height:36, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:6, border:"none", cursor:"pointer", background: isActive ? "#2226f7" : "transparent", color: isActive ? "#fff" : "#001e76", transition:"all 0.12s ease" }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f4f4f6"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ display:"flex", width:16, height:16 }}>{icon}</span>
            </button>
          ) : (
            <button key={item.id} onClick={() => onNavClick(item.id)}
              style={{ width:"100%", height:40, display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:4, border:"none", cursor:"pointer", background: isActive ? "#2226f7" : "transparent", color: isActive ? "#fff" : "#001e76", fontWeight:400, fontSize:12, letterSpacing:"-0.132px", boxShadow: isActive ? "0px -1px 1.7px rgba(0,0,0,0.03), 0px 5.7px 5.9px rgba(0,0,0,0.07), 0px 0px 5.9px rgba(0,0,0,0.07)" : "none", fontFamily:"var(--f)", transition:"all 0.12s ease", textAlign:"left" }}>
              <span style={{ flexShrink:0, display:"flex", width:16, height:16 }}>{icon}</span>
              <span style={{ whiteSpace:"nowrap" }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

// Audit top header
const AuditTopHeader = ({ prog, data, compTone }) => (
  <header style={{ height:69, background:"#fff", borderBottom:"1px solid #e2e5e9", padding:"0 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
    <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0, flex:1 }}>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:9, fontWeight:700, color:"#8692a2", textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:"var(--f)" }}>{prog.id} · Audit Scorecard</div>
        <div style={{ fontSize:14, fontWeight:700, color:"#16191d", fontFamily:"var(--f)", letterSpacing:"-0.3px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{prog.name}</div>
      </div>
    </div>
    <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
      <div style={{ width:320, background:"#f4f4f6", borderRadius:8, padding:"8px 12px", display:"flex", alignItems:"center", gap:6, cursor:"text", height:39, boxSizing:"border-box" }}>
        <svg width="16" height="16" viewBox="0 0 100 100" fill="none" style={{ flexShrink:0 }}>
          <path d="M50 4C56 4 62 8 67 12C72 8 79 6 84 10C89 14 89 22 87 28C93 31 98 37 98 44C98 51 93 56 88 59C91 65 92 72 88 78C84 84 77 85 71 84C68 89 63 94 56 96C49 98 43 95 39 90C34 94 27 96 21 92C15 88 14 80 16 74C10 70 5 64 5 57C5 50 10 44 16 41C13 35 12 28 16 22C20 16 27 15 33 17C36 11 42 5 50 4Z" fill="#2226f7"/>
          <rect x="33" y="38" width="10" height="18" rx="5" fill="white"/>
          <rect x="57" y="38" width="10" height="18" rx="5" fill="white"/>
          <path d="M38 66 Q50 74 62 66" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
        </svg>
        <span style={{ fontSize:13, color:"#8692a2", fontFamily:"var(--f)", fontWeight:400, userSelect:"none" }}>Search your data...</span>
      </div>
      <button style={{ width:38, height:38, background:"#001e76", borderRadius:8, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
        onMouseEnter={e => e.currentTarget.style.background = "#001356"}
        onMouseLeave={e => e.currentTarget.style.background = "#001e76"}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </button>
      <button style={{ display:"flex", alignItems:"center", gap:4, padding:"10px 14px", borderRadius:8, border:"none", background:"linear-gradient(135deg, #001e76 0%, #002aa9 50%, #0037dc 100%)", color:"#fff", fontSize:13, fontWeight:500, fontFamily:"var(--f)", cursor:"pointer", flexShrink:0, whiteSpace:"nowrap" }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="#fff"><path d="M8 0L9.4 5.2L14.6 3.4L10.8 7.2L16 8L10.8 8.8L14.6 12.6L9.4 10.8L8 16L6.6 10.8L1.4 12.6L5.2 8.8L0 8L5.2 7.2L1.4 3.4L6.6 5.2L8 0Z"/></svg>
        Explore
      </button>
      <div style={{ width:32, height:32, borderRadius:"50%", background:"#001e76", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700, fontFamily:"var(--f)", cursor:"pointer", flexShrink:0 }}>CA</div>
    </div>
  </header>
);

// ── Small UI primitives ─────────────────────────────────────────────────────
function Card({ children, pad = 16, style }) {
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.g2}`, borderRadius: 10,
      ...(pad !== 0 ? { padding: pad } : { overflow:"hidden" }), ...style,
    }}>{children}</div>
  );
}

function SectionHeader({ title, eyebrow, right }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom: 12 }}>
      <div>
        {eyebrow && <div style={{ fontSize:9, fontWeight:700, color:C.g4, letterSpacing:"0.05em", textTransform:"uppercase", fontFamily:F, marginBottom:2 }}>{eyebrow}</div>}
        <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

function Badge({ tone = "gray", children }) {
  const palette = {
    red:      { bg: C.red,   fg: C.white },
    yel:      { bg: C.yel,   fg: C.white },
    teal:     { bg: C.teal,  fg: C.white },
    softRed:  { bg: C.red2,  fg: C.red   },
    softYel:  { bg: C.yel2,  fg: C.yel   },
    softTeal: { bg: C.teal2, fg: C.teal  },
    gray:     { bg: C.g2,    fg: C.g5    },
  }[tone] || { bg: C.g2, fg: C.g5 };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", padding:"2px 7px", borderRadius:4,
      background: palette.bg, color: palette.fg,
      fontSize:10, fontWeight:600, fontFamily:F, whiteSpace:"nowrap",
    }}>{children}</span>
  );
}

function Bar({ value, max = 100, color, height = 6, bg = C.g1 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ width:"100%", height, background:bg, borderRadius:999, overflow:"hidden" }}>
      <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:999, transition:"width .3s" }} />
    </div>
  );
}

function Avatar({ initials, color = C.navy3, fg = C.ocean }) {
  return (
    <div style={{
      width:32, height:32, borderRadius:"50%", background:color, color:fg,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:11, fontWeight:700, fontFamily:F, flexShrink:0,
    }}>{initials}</div>
  );
}

// Mini sparkline — inline SVG showing a trend (small)
function Sparkline({ points, color = C.g4, width = 80, height = 22, showDots = false }) {
  if (!points || points.length === 0) return null;
  const min = Math.min(...points, 0);
  const max = Math.max(...points, 100);
  const range = max - min || 1;
  const stepX = width / (points.length - 1 || 1);
  const coords = points.map((v, i) => [i * stepX, height - ((v - min) / range) * height]);
  const d = coords.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  return (
    <svg width={width} height={height} style={{ display:"block" }}>
      <path d={d} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {showDots && coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill={color}/>
      ))}
    </svg>
  );
}

// Multi-line trend chart with legend + Y-axis gridlines. Lines are clickable — clicking
// a line (or legend pill) calls onSelect(name). Passing `selected` dims the non-selected lines.
function TrendChart({ series, labels, height = 180, selected = null, onSelect, showLegend = true }) {
  // Measure the container so the chart draws at its natural width (no horizontal stretch).
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const update = () => setWidth(Math.max(320, el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const padL = 32, padR = 12, padT = 12, padB = 24;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const yMin = 40, yMax = 100;
  const xAt = i => padL + (i / (labels.length - 1 || 1)) * chartW;
  const yAt = v => padT + ((yMax - v) / (yMax - yMin)) * chartH;
  const gridY = [40, 55, 65, 80, 100];
  const handleClick = (name) => onSelect && onSelect(selected === name ? null : name);

  return (
    <div>
      {/* Simple legend — same row of pills for the templates currently on the chart */}
      {showLegend && <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
        {series.map(s => {
          const last = s.points[s.points.length - 1];
          const first = s.points[0];
          const delta = last - first;
          const isSel = selected === s.name;
          const isDim = selected && !isSel;
          return (
            <button key={s.name}
              onClick={() => handleClick(s.name)}
              style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"4px 10px", borderRadius:999,
                border:`1px solid ${isSel ? s.color : C.g2}`,
                background: isSel ? C.white : C.g1,
                cursor:"pointer", fontFamily:F,
                opacity: isDim ? 0.45 : 1, transition:"opacity .15s",
              }}>
              <span style={{ width:10, height:2, background:s.color, borderRadius:2 }}/>
              <span style={{ fontSize:11, color: isSel ? s.color : C.g6, fontWeight: isSel ? 700 : 600 }}>{s.name}</span>
              <span style={{ fontSize:10, color: delta > 0 ? C.teal : delta < 0 ? C.red : C.g4, fontWeight:700 }}>
                {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {Math.abs(delta)}
              </span>
            </button>
          );
        })}
      </div>}
      <div ref={wrapRef} style={{ width:"100%", overflow:"hidden" }}>
        <svg width={width} height={height} style={{ display:"block" }}>
          {/* Gridlines + Y labels */}
          {gridY.map(g => (
            <g key={g}>
              <line x1={padL} y1={yAt(g)} x2={width - padR} y2={yAt(g)} stroke={C.g2} strokeWidth="1" strokeDasharray={g === 80 ? "" : "3 3"}/>
              <text x={padL - 6} y={yAt(g) + 3} fontSize="9" fill={C.g4} textAnchor="end" fontFamily={F}>{g}</text>
            </g>
          ))}
          {/* X labels */}
          {labels.map((l, i) => (
            <text key={l} x={xAt(i)} y={height - 6} fontSize="9" fill={C.g4} textAnchor="middle" fontFamily={F}>{l}</text>
          ))}
          {/* Series */}
          {series.map(s => {
            const d = s.points.map((v, i) => (i === 0 ? `M${xAt(i)},${yAt(v)}` : `L${xAt(i)},${yAt(v)}`)).join(" ");
            const isSel = selected === s.name;
            const isDim = selected && !isSel;
            return (
              <g key={s.name}
                onClick={() => handleClick(s.name)}
                style={{ cursor: onSelect ? "pointer" : "default", opacity: isDim ? 0.22 : 1, transition:"opacity .15s" }}>
                {/* wide invisible hit target */}
                <path d={d} stroke="transparent" strokeWidth="16" fill="none"/>
                <path d={d} stroke={s.color} strokeWidth={isSel ? 3 : 2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                {s.points.map((v, i) => (
                  <circle key={i} cx={xAt(i)} cy={yAt(v)} r={isSel ? 3.5 : 2.5} fill={s.color}/>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function KpiCard({ label, value, suffix, tone = "gray", sub, trend }) {
  const [h, setH] = useState(false);
  const borderColor = tone === "teal" ? C.teal : tone === "red" ? C.red : tone === "yel" ? C.yel : C.g3;
  const subColor    = tone === "teal" ? C.teal : tone === "red" ? C.red : tone === "yel" ? C.yel : C.g4;
  const trendIcon   = trend === "up"   ? { arrow:"▲", color:C.teal }
                    : trend === "down" ? { arrow:"▼", color:C.red  }
                    : trend === "flat" ? { arrow:"—", color:C.g4   }
                    : null;
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background:C.white, borderRadius:10,
        border:`1px solid ${C.g2}`, borderTop:`3px solid ${borderColor}`,
        padding:"13px 14px", minWidth:0,
        boxShadow: h ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
        transition:"box-shadow 0.15s",
      }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:9, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F }}>{label}</span>
        {trendIcon && <span style={{ fontSize:10, fontWeight:700, color:trendIcon.color, fontFamily:F }}>{trendIcon.arrow}</span>}
      </div>
      <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:5 }}>
        <span style={{ fontSize:24, fontWeight:700, color:C.g6, lineHeight:1, fontFamily:F }}>{value}</span>
        {suffix && <span style={{ fontSize:13, color:C.g4, fontFamily:F }}>{suffix}</span>}
      </div>
      {sub && <div style={{ fontSize:11, fontWeight:600, color:subColor, fontFamily:F }}>{sub}</div>}
    </div>
  );
}

// ── Dropdown used by FilterBar ─────────────────────────────────────────────
function Drop({ value, onChange, opts }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => setOpen(!open)}
        style={{
          display:"flex", alignItems:"center", gap:8, padding:"7px 10px",
          borderRadius:6, border:`1px solid ${open ? C.ocean : C.g3}`,
          background:C.white, color:C.g6, fontSize:12, fontWeight:500, fontFamily:F, cursor:"pointer",
          boxShadow: open ? `0 0 0 3px rgba(34,38,247,0.08)` : "none", minWidth:140,
        }}>
        <span style={{ flex:1, textAlign:"left" }}>{value}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:50, background:C.white, border:`1px solid ${C.g2}`, borderRadius:8, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", maxHeight:240, overflowY:"auto" }}>
          {opts.map(o => {
            const sel = o === value;
            return (
              <div key={o} onClick={() => { onChange(o); setOpen(false); }}
                style={{ padding:"8px 12px", fontSize:12, cursor:"pointer",
                  background: sel ? C.navy3 : "transparent",
                  color: sel ? C.ocean : C.g6, fontWeight: sel ? 500 : 400, fontFamily:F }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.background = C.hover; }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}>
                {o}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── MultiDrop (multi-select, matches Audit Dashboard pattern) ──────────────
function MultiDrop({ label, sel, onToggle, opts }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const n = sel.size;
  const display = n === 0 ? label : n === 1 ? ([...sel][0].length > 18 ? [...sel][0].slice(0,17) + "…" : [...sel][0]) : `${n} selected`;
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => setOpen(!open)}
        style={{
          display:"flex", alignItems:"center", gap:6, padding:"7px 12px",
          borderRadius:8, border:`1px solid ${n > 0 ? C.navy : C.g3}`,
          background: n > 0 ? C.navy3 : C.white, color: C.navy,
          fontSize:12, fontFamily:F, cursor:"pointer", minWidth:140,
          justifyContent:"space-between", fontWeight: n > 0 ? 600 : 400,
          boxShadow: open ? `0 0 0 3px rgba(34,38,247,0.08)` : "none",
        }}>
        <span>{display}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:400, background:C.white, border:`1px solid ${C.g2}`, borderRadius:8, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", minWidth:240, maxHeight:280, overflowY:"auto" }}>
          {opts.map(x => {
            const ck = sel.has(x);
            return (
              <button key={x} onClick={() => onToggle(x)}
                style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"8px 12px", background: ck ? C.ocean3 : "transparent", border:"none", color:C.navy, fontSize:12, fontFamily:F, cursor:"pointer", textAlign:"left" }}
                onMouseEnter={e => { if (!ck) e.currentTarget.style.background = C.hover; }}
                onMouseLeave={e => { if (!ck) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ width:14, height:14, borderRadius:3, border:`1.5px solid ${ck ? C.navy : C.g3}`, background: ck ? C.navy : C.white, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {ck && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{x}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Global FilterBar ───────────────────────────────────────────────────────
function FilterBar() {
  const [date, setDate] = useState("Last 30 days");
  const [templates, setTemplates] = useState(new Set());
  const [locations, setLocations] = useState(new Set());
  const TEMPLATE_OPTS = ["Safety Compliance Full","Fire Safety Checklist","Chemical Storage Audit","Emergency Preparedness","LP Floor Audit","Cash Handling Review","CCTV Compliance Check","Opening Checklist","Daily Ops Checklist"];
  const LOCATION_OPTS = ["NE Region","SE Region","MW Region","SW Region","NW Region","Flagship stores","Standard stores","New York Central #1000","Chicago Wacker #1042","Miami Flagler #2011","Dallas Galleria #4003","Atlanta Perimeter #6005","Seattle Pike #5001"];
  const toggleT = v => setTemplates(s => { const n = new Set(s); n.has(v) ? n.delete(v) : n.add(v); return n; });
  const toggleL = v => setLocations(s => { const n = new Set(s); n.has(v) ? n.delete(v) : n.add(v); return n; });
  const pills = [
    ...[...templates].map(v => ({ type:"template", val:v })),
    ...[...locations].map(v => ({ type:"location", val:v })),
  ];
  const clearOne = (type, val) => {
    if (type === "template") toggleT(val);
    else if (type === "location") toggleL(val);
  };
  const clearAll = () => { setDate("Last 30 days"); setTemplates(new Set()); setLocations(new Set()); };
  return (
    <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.g2}`, padding:"14px 16px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <span style={{ fontSize:13, fontWeight:700, color:C.navy, fontFamily:F }}>Filters</span>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {pills.length > 0 && (
            <button onClick={clearAll}
              style={{ fontSize:11, color:C.g4, background:"none", border:"none", cursor:"pointer", fontFamily:F }}>
              Clear all
            </button>
          )}
          <button style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, fontWeight:500, color:C.navy, background:"none", border:`1px solid ${C.g3}`, borderRadius:7, cursor:"pointer", fontFamily:F, padding:"5px 10px" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            Advanced filters
          </button>
        </div>
      </div>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        <div>
          <div style={{ fontSize:9, fontWeight:600, color:C.g4, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:4 }}>Date range</div>
          <Drop value={date} onChange={setDate} opts={["Last 7 days","Last 30 days","Last 90 days","This month","This quarter","Fiscal year"]} />
        </div>
        <div>
          <div style={{ fontSize:9, fontWeight:600, color:C.g4, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:4 }}>Template</div>
          <MultiDrop label="All templates" sel={templates} onToggle={toggleT} opts={TEMPLATE_OPTS} />
        </div>
        <div>
          <div style={{ fontSize:9, fontWeight:600, color:C.g4, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:4 }}>Location</div>
          <MultiDrop label="All locations" sel={locations} onToggle={toggleL} opts={LOCATION_OPTS} />
        </div>
      </div>
      {pills.length > 0 && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:12, paddingTop:12, borderTop:`1px solid ${C.g1}` }}>
          {pills.map((p, i) => (
            <div key={i} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 8px 4px 10px", borderRadius:999, background:C.navy3, border:`1px solid ${C.navy}`, fontSize:11, fontWeight:500, color:C.navy, fontFamily:F }}>
              <span style={{ maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.val}</span>
              <button onClick={() => clearOne(p.type, p.val)}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", width:14, height:14, borderRadius:"50%", background:C.navy, border:"none", cursor:"pointer", padding:0, flexShrink:0 }}>
                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Simple Table component (design-system aligned) ─────────────────────────
function Table({ columns, rows, empty = "No data." }) {
  if (!rows || rows.length === 0) {
    return <div style={{ padding:"24px 0", textAlign:"center", color:C.g4, fontSize:13, fontFamily:F }}>{empty}</div>;
  }
  const gridCols = columns.map(c => c.width || "1fr").join(" ");
  return (
    <div style={{ width:"100%" }}>
      <div style={{ display:"grid", gridTemplateColumns:gridCols, gap:8, padding:"10px 8px", background:C.g1, borderBottom:`1px solid ${C.g2}`, borderTopLeftRadius:10, borderTopRightRadius:10 }}>
        {columns.map((c, i) => (
          <div key={i} style={{
            fontSize:10, fontWeight:600, color:C.g4, textTransform:"uppercase",
            letterSpacing:"0.4px", fontFamily:F, textAlign:c.align || "left",
          }}>{c.header}</div>
        ))}
      </div>
      {rows.map((r, ri) => (
        <div key={ri}
          style={{ display:"grid", gridTemplateColumns:gridCols, gap:8, padding:"10px 8px", borderBottom: ri < rows.length - 1 ? `1px solid ${C.g2}` : "none", alignItems:"center", fontFamily:F }}
          onMouseEnter={e => e.currentTarget.style.background = C.g1}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          {columns.map((c, ci) => (
            <div key={ci} style={{
              fontSize:13, color:C.g6, textAlign:c.align || "left", minWidth:0,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            }}>{c.render ? c.render(r) : r[c.key]}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Helper: deterministic phone/email for a person ──────────────────────────
function contactFor(name) {
  const slug = name.toLowerCase().replace(/[^a-z]+/g, ".");
  const seed = [...name].reduce((a,c)=>a+c.charCodeAt(0),0);
  const p = String(2000000000 + (seed * 7919) % 7999999999).slice(0,10);
  const phone = `(${p.slice(0,3)}) ${p.slice(3,6)}-${p.slice(6,10)}`;
  return { email: `${slug}@thinklp.com`, phone };
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Scorecard({
  prog = { id: "P001", name: "Safety Compliance" },
  onBack = () => {},
}) {
  const data = SCORECARD_DATA[prog.id] || DEFAULT_DATA;
  const [tab, setTab] = useState("scorecard");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null); // text of the failing question
  const [failingPage, setFailingPage] = useState(0);
  const tabs = ["Scorecard", "Details", "Templates"];

  const allFailing = FAILING_DATA[prog.id]?.questions || [];
  const qMeta = QUESTION_META[prog.id] || {};
  const failing = selectedTemplate
    ? allFailing.filter(q => (qMeta[q.text]?.templates || []).includes(selectedTemplate))
    : allFailing;
  // Pagination — 5 per page
  const FAILING_PAGE_SIZE = 5;
  const failingPageCount = Math.max(1, Math.ceil(failing.length / FAILING_PAGE_SIZE));
  const safePage = Math.min(failingPage, failingPageCount - 1);
  const failingPaged = failing.slice(safePage * FAILING_PAGE_SIZE, (safePage + 1) * FAILING_PAGE_SIZE);
  // Reset to page 0 when the filter/selection changes
  useEffect(() => { setFailingPage(0); }, [selectedTemplate, selectedType, prog.id]);
  const critLocs = CRITICAL_LOCS[prog.id] || [];
  const behind   = BEHIND_PEOPLE[prog.id] || [];
  const auditors = USER_SCORES[prog.id] || [];
  const avgQ     = AVG_SCORES[prog.id] || [];
  const avgQSorted = [...avgQ].sort((a, b) => a.score - b.score); // worst first
  const sched    = SCHEDULED[prog.id] || DEFAULT_SCHEDULED;
  const allTrendSeries = TREND_BY_TEMPLATE[prog.id] || [];
  // Types available for this program (unique categories across its templates)
  const availableTypes = Array.from(new Set(
    allTrendSeries.map(s => TEMPLATE_TYPES[s.name] || "Other")
  ));
  // When NO type is selected: show one aggregated line per type (average of its templates).
  // When a type IS selected: drill into that type's templates.
  const trendSeries = selectedType
    ? allTrendSeries.filter(s => (TEMPLATE_TYPES[s.name] || "Other") === selectedType)
    : availableTypes.map(t => {
        const group = allTrendSeries.filter(s => (TEMPLATE_TYPES[s.name] || "Other") === t);
        if (group.length === 0) return null;
        const len = group[0].points.length;
        const avg = Array.from({ length: len }, (_, i) =>
          Math.round(group.reduce((sum, s) => sum + (s.points[i] || 0), 0) / group.length)
        );
        return { name: t, color: TYPE_COLOR[t] || C.ocean, points: avg };
      }).filter(Boolean);
  // If user deselected the currently-selected template because it's outside the chosen type, clear it
  useEffect(() => {
    if (selectedTemplate && !trendSeries.some(s => s.name === selectedTemplate)) {
      setSelectedTemplate(null);
    }
  }, [selectedType]);
  const repeat   = REPEAT_FAILS[prog.id] || DEFAULT_REPEAT;

  // Repeat-fail maps — used to annotate tables instead of a standalone card
  const repeatByQuestion = {};
  (repeat.questions || []).forEach(r => { repeatByQuestion[r.text.toLowerCase()] = r.periods; });
  const repeatByLocation = {};
  (repeat.locations || []).forEach(r => {
    const key = r.name.toLowerCase();
    repeatByLocation[key] = r.periods;
  });
  const isRepeatQuestion = (text) => {
    const k = (text || "").toLowerCase();
    // partial match: any repeat key contained in question
    for (const rk of Object.keys(repeatByQuestion)) {
      if (k.includes(rk) || rk.includes(k)) return repeatByQuestion[rk];
    }
    return 0;
  };
  const isRepeatLocation = (name) => {
    const k = (name || "").toLowerCase();
    for (const rk of Object.keys(repeatByLocation)) {
      if (k.includes(rk.split(" store")[0]) || rk.includes(k)) return repeatByLocation[rk];
    }
    return 0;
  };

  // Build merged locations table: all `data.locations` joined with critLocs metadata
  const critByName = {};
  critLocs.forEach(l => { critByName[l.name.split(" ").slice(0,2).join(" ").toLowerCase()] = l; });
  const mergedLocations = data.locations.map(l => {
    const key = l.name.split(" ").slice(0,2).join(" ").toLowerCase();
    const cmeta = critByName[key] || {};
    return {
      name: l.name,
      region: cmeta.region || "—",
      district: cmeta.district || "—",
      type: cmeta.type || "Standard",
      score: l.score,
      audits: l.audits,
      lastAudit: l.lastAudit,
      openAPs: l.openAPs,
      delta: cmeta.delta,
      repeat: isRepeatLocation(l.name),
    };
  }).sort((a,b) => a.score - b.score);

  // Assign deterministic auditor names for missed + recent audits
  const auditorPool = auditors.length ? auditors : [{ name:"—", role:"" }];
  const pickAuditor = (seedStr) => {
    const s = [...(seedStr||"")].reduce((a,c)=>a+c.charCodeAt(0),0);
    return auditorPool[s % auditorPool.length].name;
  };

  const completionRate = sched.scheduled > 0 ? Math.round((sched.completed / sched.scheduled) * 100) : 0;
  const missedCount = sched.missed.length;

  // KPI tones
  const compTone     = data.avgCompliance >= 80 ? "teal" : data.avgCompliance >= 65 ? "yel" : "red";
  const overdueTone  = data.overdue === 0 ? "teal" : data.overdue <= 2 ? "yel" : "red";
  const apsTone      = data.openAPs === 0 ? "teal" : data.openAPs <= 2 ? "yel" : "red";
  const complTone    = completionRate >= 95 ? "teal" : completionRate >= 80 ? "yel" : "red";
  const missedTone   = missedCount === 0 ? "teal" : missedCount <= 2 ? "yel" : "red";

  return (
    <div style={{ display:"flex", height:"100vh", "--f": F }}>
      <AuditSidebar activeNav="scorecard" onNavClick={(id) => { if (id === "dashboard") onBack(); }} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <AuditTopHeader prog={prog} data={data} compTone={compTone} />
        {/* ── Tab sub-header ─────────────────────────────────────────────── */}
        <div style={{ background:C.white, borderBottom:`1px solid ${C.g2}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", padding:"0 20px", gap:12 }}>
            <button onClick={onBack}
              style={{
                display:"flex", alignItems:"center", gap:6, padding:"6px 10px",
                background:C.white, border:`1px solid ${C.g2}`, borderRadius:6,
                color:C.ocean, fontSize:12, fontWeight:500, fontFamily:F, cursor:"pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.hover; e.currentTarget.style.borderColor = C.ocean; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.g2; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back to Dashboard
            </button>
            {tabs.map(t => {
              const active = tab === t.toLowerCase();
              return (
                <button key={t} onClick={() => setTab(t.toLowerCase())}
                  style={{
                    padding:"10px 14px", border:"none", background:"none", cursor:"pointer",
                    borderBottom: active ? `2px solid ${C.ocean}` : "2px solid transparent",
                    color: active ? C.ocean : C.g4, fontSize:12, fontWeight: active ? 600 : 500, fontFamily:F,
                  }}>{t}</button>
              );
            })}
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <main style={{ flex:1, overflowY:"auto", padding:"14px 18px", display:"flex", flexDirection:"column", gap:12 }}>

        {/* 0. GLOBAL FILTERS — applies to all cards on this page */}
        <FilterBar />

        {/* 1. KPI SUMMARY STRIP — matches Audit Dashboard metric tile pattern */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,minmax(0,1fr))", gap:10 }}>
          {[
            { lbl:"Avg compliance",    val:`${data.avgCompliance}%`, meta:`${scLabel(data.avgCompliance)} vs. 80% target`, up: data.trend==="up", dn: data.trend==="down", red: compTone === "red" },
            { lbl:"Completion rate",   val:`${completionRate}%`,     den:`/ ${sched.scheduled}`, meta:`${sched.completed} of ${sched.scheduled} scheduled`, red: complTone === "red" },
            { lbl:"Audits completed",  val:`${data.auditsCompleted}`, meta:"Last 30 days" },
            { lbl:"Missed audits",     val:`${missedCount}`, meta: missedCount === 0 ? "None outstanding" : `${missedCount} location${missedCount===1?"":"s"} behind`, dn: missedCount > 0, red: missedTone === "red" },
            { lbl:"Open action plans", val:`${data.openAPs}`, meta: data.openAPs === 0 ? "All resolved" : `${data.openAPs} awaiting closure`, red: apsTone === "red" },
            { lbl:"Overdue",           val:`${data.overdue}`, meta: data.overdue === 0 ? "On track" : `${data.overdue} past due date`, dn: data.overdue > 0, red: overdueTone === "red" },
          ].map((k, i) => (
            <div key={i}
              style={{ background:C.white, borderRadius:10, border:`1px solid ${C.g2}`, padding:"13px 14px", cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
              <div style={{ fontSize:9, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, marginBottom:5 }}>{k.lbl}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:4 }}>
                <span style={{ fontSize:22, fontWeight:700, color: k.red ? C.red : C.g6, lineHeight:1, fontFamily:F }}>{k.val}</span>
                {k.den && <span style={{ fontSize:13, color:C.g4, fontFamily:F }}>{k.den}</span>}
              </div>
              <div style={{ fontSize:10, fontWeight:600, color: k.up ? C.teal : k.dn ? C.red : C.g4, fontFamily:F }}>
                {k.up ? "▲ " : k.dn ? "▼ " : ""}{k.meta}
              </div>
            </div>
          ))}
        </div>

        {/* 2. TREND OVER TIME — drill: Type → Template → filters failing questions */}
        <Card>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:10, gap:12, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>
                {selectedType ? `Overall Compliance Score: ${selectedType}` : "Overall Compliance Score by Templates"}
              </div>
              <div style={{ fontSize:9, fontWeight:700, color:C.g4, letterSpacing:"0.05em", textTransform:"uppercase", fontFamily:F, marginTop:2 }}>8-Week Trend</div>
            </div>
            <span style={{ fontSize:11, color:C.g4, fontFamily:F }}>
              {!selectedType ? "Click a type to see its templates" : selectedTemplate ? "Click the line again to clear" : "Click a line to filter failing questions below"}
            </span>
          </div>

          {/* Type pills (drill-in) */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
            {selectedType && (
              <button onClick={() => setSelectedType(null)}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:999, border:`1px solid ${C.navy}`, background:C.navy3, cursor:"pointer", fontSize:11, fontWeight:600, color:C.navy, fontFamily:F }}>
                ← All types
              </button>
            )}
            {(selectedType ? [] : availableTypes).map(t => {
              const active = selectedType === t;
              const color = TYPE_COLOR[t] || C.ocean;
              const count = allTrendSeries.filter(s => (TEMPLATE_TYPES[s.name] || "Other") === t).length;
              return (
                <button key={t}
                  onClick={() => { setSelectedType(active ? null : t); setSelectedTemplate(null); }}
                  style={{
                    display:"flex", alignItems:"center", gap:6,
                    padding:"4px 10px", borderRadius:999,
                    border:`1px solid ${active ? color : C.g2}`,
                    background: active ? C.white : C.g1, cursor:"pointer", fontFamily:F,
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = C.g2; e.currentTarget.style.color = C.g6; } }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:color }} />
                  <span style={{ fontSize:11, fontWeight: active ? 700 : 600, color: active ? color : C.g6 }}>{t}</span>
                  <span style={{ fontSize:10, fontWeight:700, color: active ? color : C.g5, background: active ? C.navy3 : C.g2, padding:"1px 6px", borderRadius:999 }}>{count}</span>
                  {!active && <span style={{ fontSize:10, color: C.g4 }}>→</span>}
                </button>
              );
            })}
          </div>

          {trendSeries.length === 0 ? (
            <div style={{ padding:"32px 0", textAlign:"center", color:C.g4, fontSize:13 }}>Not enough historical data for this view.</div>
          ) : (
            <TrendChart
              series={trendSeries}
              labels={WEEKS}
              height={200}
              showLegend={!!selectedType}
              selected={selectedType ? selectedTemplate : null}
              onSelect={name => {
                if (!selectedType) {
                  // Aggregated view — clicking a type-line drills into that type
                  setSelectedType(name);
                  setSelectedTemplate(null);
                } else {
                  // Inside a type — select/deselect a template
                  setSelectedTemplate(name);
                }
              }}
            />
          )}

          {/* Affected locations — shown when a failing question is selected */}
          {selectedQuestion && (() => {
            const selQ = allFailing.find(q => q.text === selectedQuestion);
            if (!selQ) return null;
            // Take the N worst-scoring locations as an approximation of the sites where this question is failing
            const affected = [...mergedLocations].sort((a,b) => a.score - b.score).slice(0, selQ.locations);
            return (
              <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${C.g2}` }}>
                <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:10, gap:12, flexWrap:"wrap" }}>
                  <div>
                    <div style={{ fontSize:9, fontWeight:700, color:C.g4, letterSpacing:"0.4px", textTransform:"uppercase", fontFamily:F, marginBottom:2 }}>Affected Locations</div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>
                      {selQ.locations} location{selQ.locations === 1 ? "" : "s"} failing:
                      <span style={{ color:C.g5, fontWeight:500, marginLeft:6 }}>{selectedQuestion}</span>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedQuestion(null); }}
                    style={{ fontSize:11, color:C.g5, background:"none", border:"none", cursor:"pointer", fontFamily:F }}>
                    Clear selection
                  </button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {affected.map((loc, i) => (
                    <span key={i} style={{
                      display:"inline-flex", alignItems:"center", gap:6,
                      padding:"5px 10px", borderRadius:6,
                      background: C.g1,
                      border: `1px solid ${C.g2}`,
                      fontSize:12, fontWeight:500, fontFamily:F,
                      color: C.g6,
                    }}>
                      {loc.repeat > 0 && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-label="Repeat failure">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      )}
                      <span>{loc.name}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:C.g5 }}>{loc.score}%</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
        </Card>

        {/* 2 + 3. FAILING QUESTIONS (left) + AUDITORS (right) */}
        <div style={{ display:"grid", gridTemplateColumns:"minmax(0, 2fr) minmax(0, 1fr)", gap:12 }}>
          {/* Failing Questions — single view (no tabs); bar-graph style with % inside the bar */}
          <Card>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:12, flexWrap:"wrap" }}>
              <div>
                <div style={{ fontSize:9, fontWeight:700, color:C.g4, letterSpacing:"0.05em", textTransform:"uppercase", fontFamily:F, marginBottom:2 }}>Critical Focus</div>
                <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>Failing Questions</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                {selectedTemplate && (() => {
                  const color = (trendSeries.find(s => s.name === selectedTemplate)?.color) || C.ocean;
                  return (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"3px 8px 3px 10px", borderRadius:999, background:C.navy3, border:`1px solid ${color}`, fontSize:11, fontWeight:500, color:C.navy, fontFamily:F }}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background:color }}/>
                      {selectedTemplate}
                      <button onClick={() => setSelectedTemplate(null)}
                        style={{ display:"flex", alignItems:"center", justifyContent:"center", width:14, height:14, borderRadius:"50%", background:color, border:"none", cursor:"pointer", padding:0, flexShrink:0 }}>
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </span>
                  );
                })()}
                <span style={{ fontSize:12, fontWeight:600, color: failing.filter(q=>q.crit).length ? C.red : C.g5, fontFamily:F }}>
                  {failing.filter(q=>q.crit).length} critical
                </span>
              </div>
            </div>
            {failing.length === 0 ? (
              <div style={{ padding:"32px 0", textAlign:"center", color:C.g4, fontSize:13 }}>No failing questions — all items passing.</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {failingPaged.map((q, i) => {
                  const repeatN = isRepeatQuestion(q.text);
                  const pct = Math.max(0, Math.min(100, q.failRate));
                  const barColor = fr(q.failRate);
                  const qTemplates = qMeta[q.text]?.templates || [];
                  // Prefer a template we already have a trend line for
                  const matchTemplate = qTemplates.find(t => allTrendSeries.some(s => s.name === t)) || qTemplates[0];
                  const matchType = matchTemplate ? (TEMPLATE_TYPES[matchTemplate] || null) : null;
                  const isQSelected = matchTemplate && selectedTemplate === matchTemplate;
                  const isQActive = selectedQuestion === q.text;
                  const handleQClick = () => {
                    if (isQActive) {
                      setSelectedQuestion(null);
                      setSelectedTemplate(null);
                      setSelectedType(null);
                      return;
                    }
                    setSelectedQuestion(q.text);
                    if (matchTemplate) {
                      setSelectedType(matchType);
                      setSelectedTemplate(matchTemplate);
                    }
                  };
                  return (
                    <div key={i}
                      onClick={handleQClick}
                      style={{
                        display:"grid", gridTemplateColumns:"1fr 96px", gap:12, alignItems:"center",
                        padding:"6px 8px", borderRadius:6,
                        cursor:"pointer",
                        background: isQActive ? C.navy3 : "transparent",
                        transition:"background .15s",
                      }}
                      onMouseEnter={e => { if (!isQActive) e.currentTarget.style.background = C.hover; }}
                      onMouseLeave={e => { if (!isQActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{ minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                          {q.crit && <span style={{ fontSize:10, fontWeight:700, color:C.red, textTransform:"uppercase", letterSpacing:"0.4px", fontFamily:F }}>Critical</span>}
                          {repeatN > 0 && (
                            <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:10, fontWeight:600, color:C.yel, fontFamily:F, background:C.yel2, padding:"2px 7px", borderRadius:4 }}>
                              {repeatN}× repeat fail
                            </span>
                          )}
                          <span style={{ fontSize:13, fontWeight:500, color:C.g6, fontFamily:F }}>{q.text}</span>
                        </div>
                        {/* Bar graph with % label inside */}
                        <div style={{ position:"relative", width:"100%", height:22, background:C.g1, borderRadius:4, overflow:"hidden", border:`1px solid ${C.g2}` }}>
                          <div style={{ width:`${pct}%`, height:"100%", background:barColor, transition:"width .3s" }} />
                          <span style={{
                            position:"absolute", top:0, bottom:0, display:"flex", alignItems:"center",
                            left: pct > 18 ? 8 : `calc(${pct}% + 8px)`,
                            fontSize:11, fontWeight:700, fontFamily:F,
                            color: pct > 18 ? C.white : barColor,
                          }}>{q.failRate}% fail</span>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:10, fontWeight:600, color:C.g4, textTransform:"uppercase", letterSpacing:"0.4px", fontFamily:F }}>Locations</div>
                        <div style={{ fontSize:20, fontWeight:700, color:C.g6, lineHeight:1.2, fontFamily:F }}>{q.locations}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Pagination — 5 questions per page */}
            {failing.length > FAILING_PAGE_SIZE && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:14, paddingTop:12, borderTop:`1px solid ${C.g2}` }}>
                <div style={{ fontSize:11, color:C.g4, fontFamily:F }}>
                  Showing <span style={{ color:C.g6, fontWeight:600 }}>{safePage * FAILING_PAGE_SIZE + 1}–{Math.min((safePage + 1) * FAILING_PAGE_SIZE, failing.length)}</span> of <span style={{ color:C.g6, fontWeight:600 }}>{failing.length}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <button
                    onClick={() => setFailingPage(p => Math.max(0, p - 1))}
                    disabled={safePage === 0}
                    style={{
                      display:"flex", alignItems:"center", justifyContent:"center",
                      width:28, height:28, borderRadius:6,
                      border:`1px solid ${C.g2}`, background: safePage === 0 ? C.g1 : C.white,
                      color: safePage === 0 ? C.g3 : C.g5,
                      cursor: safePage === 0 ? "default" : "pointer", padding:0,
                    }}
                    onMouseEnter={e => { if (safePage !== 0) { e.currentTarget.style.borderColor = C.ocean; e.currentTarget.style.color = C.ocean; } }}
                    onMouseLeave={e => { if (safePage !== 0) { e.currentTarget.style.borderColor = C.g2; e.currentTarget.style.color = C.g5; } }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  {Array.from({ length: failingPageCount }).map((_, i) => {
                    const active = i === safePage;
                    return (
                      <button key={i} onClick={() => setFailingPage(i)}
                        style={{
                          minWidth:28, height:28, borderRadius:6,
                          border:`1px solid ${active ? C.ocean : C.g2}`,
                          background: active ? C.ocean : C.white,
                          color: active ? C.white : C.g5,
                          fontSize:12, fontWeight:600, fontFamily:F,
                          cursor:"pointer", padding:"0 8px",
                        }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = C.ocean; e.currentTarget.style.color = C.ocean; } }}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = C.g2; e.currentTarget.style.color = C.g5; } }}>
                        {i + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setFailingPage(p => Math.min(failingPageCount - 1, p + 1))}
                    disabled={safePage >= failingPageCount - 1}
                    style={{
                      display:"flex", alignItems:"center", justifyContent:"center",
                      width:28, height:28, borderRadius:6,
                      border:`1px solid ${C.g2}`, background: safePage >= failingPageCount - 1 ? C.g1 : C.white,
                      color: safePage >= failingPageCount - 1 ? C.g3 : C.g5,
                      cursor: safePage >= failingPageCount - 1 ? "default" : "pointer", padding:0,
                    }}
                    onMouseEnter={e => { if (safePage < failingPageCount - 1) { e.currentTarget.style.borderColor = C.ocean; e.currentTarget.style.color = C.ocean; } }}
                    onMouseLeave={e => { if (safePage < failingPageCount - 1) { e.currentTarget.style.borderColor = C.g2; e.currentTarget.style.color = C.g5; } }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Score by Auditor — single view (Locations moved into merged table below) */}
          <Card>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:9, fontWeight:700, color:C.g4, letterSpacing:"0.05em", textTransform:"uppercase", fontFamily:F, marginBottom:2 }}>Accountability</div>
              <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>Score by Auditor</div>
            </div>
            {auditors.length === 0 ? (
              <div style={{ padding:"32px 0", textAlign:"center", color:C.g4, fontSize:13 }}>No data.</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column" }}>
                {[...auditors].sort((a,b) => a.avgScore - b.avgScore).map((u, i, arr) => (
                  <div key={i}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.g2}` : "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.hover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Avatar initials={u.ini} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:C.g6, fontFamily:F, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</div>
                      <div style={{ fontSize:12, color:C.g5, marginTop:2, fontFamily:F, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.role} · {u.audits} audits</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:sc(u.avgScore), fontFamily:F }}>{u.avgScore}%</span>
                      <div style={{ fontSize:10, fontWeight:600, color:sc(u.avgScore), marginTop:1, fontFamily:F }}>{scLabel(u.avgScore)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* 4. AVG SCORE BY QUESTION (ranked worst→best) */}
        <Card pad={0}>
          <div style={{ padding:"13px 16px", borderBottom:`1px solid ${C.g2}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F, marginBottom:2 }}>Ranked</div>
              <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>Avg Score by Question</div>
            </div>
            <span style={{ fontSize:10, color:C.g4, fontFamily:F }}>Worst performers first</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"24px 1fr 160px 64px 76px", gap:8, padding:"0 16px", background:C.g1, borderBottom:`1px solid ${C.g2}`, alignItems:"center" }}>
            {["#","Question","Score","%","Status"].map((h, i) => (
              <span key={i} style={{ fontSize:9, fontWeight:700, color:C.navy, textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:F, padding:"7px 0", textAlign: i >= 3 ? "right" : "left" }}>{h}</span>
            ))}
          </div>
          {avgQSorted.length === 0 ? (
            <div style={{ padding:"32px 0", textAlign:"center", color:C.g4, fontSize:13 }}>No question-level scores.</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column" }}>
              {avgQSorted.map((q, i) => (
                <div key={i}
                  style={{ display:"grid", gridTemplateColumns:"24px 1fr 160px 64px 76px", gap:8, alignItems:"center", padding:"10px 16px", borderBottom: i < avgQSorted.length - 1 ? `1px solid ${C.g1}` : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.g1}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.g4, fontFamily:F }}>{i+1}</div>
                  <div style={{ fontSize:12, color:C.g6, fontWeight:500, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:F }}>{q.text}</div>
                  <Bar value={q.score} color={sc(q.score)} height={6} />
                  <div style={{ fontSize:12, fontWeight:700, color: sc(q.score), textAlign:"right", fontFamily:F }}>{q.score}%</div>
                  <div style={{ textAlign:"right" }}>
                    <Badge tone={q.score >= 80 ? "softTeal" : q.score >= 65 ? "softYel" : "softRed"}>{scLabel(q.score)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 5. LOCATIONS — merged table (Critical Locations + Score by Location) */}
        <Card pad={0}>
          <div style={{ padding:"13px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F, marginBottom:2 }}>Performance</div>
              <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>Locations</div>
            </div>
            <span style={{ fontSize:12, color:C.g5, fontFamily:F }}>
              {mergedLocations.filter(l => l.score < 70).length} site{mergedLocations.filter(l => l.score < 70).length === 1 ? "" : "s"} below 70%
            </span>
          </div>
          <Table
            columns={[
              { header:"Location", key:"name", width:"1.6fr", render: r => (
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:13, fontWeight:500, color:C.g6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</span>
                  {r.repeat > 0 && (
                    <span style={{ fontSize:10, fontWeight:600, color:C.yel, background:C.yel2, padding:"2px 7px", borderRadius:4, whiteSpace:"nowrap" }}>
                      {r.repeat}× repeat
                    </span>
                  )}
                </div>
              )},
              { header:"Region",   key:"region",   width:"0.9fr", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.region}</span> },
              { header:"District", key:"district", width:"1fr",   render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.district}</span> },
              { header:"Type",     key:"type",     width:"0.6fr", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.type}</span> },
              { header:"Audits",   key:"audits",   width:"64px",  align:"right", render: r => <span style={{ fontSize:13, color:C.g6, fontWeight:500 }}>{r.audits}</span> },
              { header:"Last Audit", key:"lastAudit", width:"110px", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.lastAudit}</span> },
              { header:"Open APs", key:"openAPs",  width:"72px", align:"right", render: r => <span style={{ fontSize:13, color: r.openAPs > 0 ? C.red : C.g5, fontWeight: r.openAPs > 0 ? 600 : 400 }}>{r.openAPs}</span> },
              { header:"Score", key:"score", width:"80px", align:"right", render: r => <span style={{ fontSize:13, fontWeight:700, color:sc(r.score) }}>{r.score}%</span> },
              { header:"Status", key:"status", width:"90px", align:"right", render: r => <span style={{ fontSize:12, fontWeight:600, color:sc(r.score) }}>{scLabel(r.score)}</span> },
            ]}
            rows={mergedLocations}
            empty="No location data."
          />
        </Card>

        {/* 6. RECENT AUDITS + MISSED AUDITS — table format */}
        <div style={{ display:"grid", gridTemplateColumns:"minmax(0, 1fr) minmax(0, 1fr)", gap:12 }}>
          <Card pad={0}>
            <div style={{ padding:"13px 16px" }}>
              <div style={{ fontSize:9, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F, marginBottom:2 }}>Latest Activity</div>
              <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>Recent Audits</div>
            </div>
            <Table
              columns={[
                { header:"Audit", key:"name", width:"1.3fr", render: r => <span style={{ fontSize:13, fontWeight:500, color:C.g6 }}>{r.name}</span> },
                { header:"Location", key:"location", width:"1.5fr", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.location}</span> },
                { header:"Auditor", key:"auditor", width:"1fr", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.auditor}</span> },
                { header:"Date", key:"date", width:"88px", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.date}</span> },
                { header:"Score", key:"score", width:"64px", align:"right", render: r => <span style={{ fontSize:13, fontWeight:700, color:sc(r.score) }}>{r.score}%</span> },
                { header:"Status", key:"status", width:"88px", align:"right", render: r => <span style={{ fontSize:12, fontWeight:600, color:sc(r.score) }}>{scLabel(r.score)}</span> },
              ]}
              rows={data.recentAudits.map(a => ({
                name: `${a.location.split(" Store")[0]} — ${a.id}`,
                location: a.location,
                auditor: pickAuditor(a.id),
                date: a.date,
                score: a.score,
              }))}
              empty="No recent audits."
            />
          </Card>

          <Card pad={0}>
            <div style={{ padding:"13px 16px" }}>
              <div style={{ fontSize:9, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F, marginBottom:2 }}>Outstanding</div>
              <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>Missed Audits</div>
            </div>
            <Table
              columns={[
                { header:"Audit", key:"audit", width:"1.3fr", render: r => <span style={{ fontSize:13, fontWeight:500, color:C.g6 }}>{r.audit}</span> },
                { header:"Location", key:"location", width:"1.5fr", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.location}</span> },
                { header:"Responsible", key:"auditor", width:"1fr", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.auditor}</span> },
                { header:"Days Late", key:"daysLate", width:"90px", align:"right", render: r => <span style={{ fontSize:13, fontWeight:600, color:C.red }}>{r.daysLate} days</span> },
              ]}
              rows={sched.missed.map(m => ({
                audit: `Scheduled Audit — ${m.name.split(" Store")[0]}`,
                location: m.name,
                auditor: pickAuditor(m.name),
                daysLate: m.daysLate,
              }))}
              empty="All scheduled audits completed."
            />
          </Card>
        </div>

        {/* 7. OVERDUE ACTION PLANS — table */}
        <Card pad={0}>
          <div style={{ padding:"13px 16px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F, marginBottom:2 }}>Past Due</div>
            <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>Overdue Action Plans</div>
          </div>
          <Table
            columns={[
              { header:"Action", key:"action", width:"2fr", render: r => <span style={{ fontSize:13, fontWeight:500, color:C.g6 }}>{r.action}</span> },
              { header:"Location", key:"location", width:"1.3fr", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.location}</span> },
              { header:"Owner", key:"assignee", width:"1fr", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.assignee}</span> },
              { header:"Due Date", key:"due", width:"110px", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.due}</span> },
              { header:"Days Overdue", key:"daysOver", width:"110px", align:"right", render: r => <span style={{ fontSize:13, fontWeight:600, color:C.red }}>{r.daysOver} days</span> },
            ]}
            rows={data.overdueAPs}
            empty="No overdue action plans."
          />
        </Card>

        {/* 8. BEHIND ON ASSIGNMENTS — table with phone + email */}
        <Card pad={0}>
          <div style={{ padding:"13px 16px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:C.g4, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F, marginBottom:2 }}>Team Workload</div>
            <div style={{ fontSize:13, fontWeight:700, color:C.g6, fontFamily:F }}>Behind on Assignments</div>
          </div>
          <Table
            columns={[
              { header:"Name", key:"name", width:"1.2fr", render: r => (
                <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                  <Avatar initials={r.ini} />
                  <span style={{ fontSize:13, fontWeight:500, color:C.g6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</span>
                </div>
              )},
              { header:"Role", key:"role", width:"0.9fr", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.role}</span> },
              { header:"Location", key:"location", width:"1.1fr", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.location}</span> },
              { header:"Phone", key:"phone", width:"130px", render: r => <span style={{ fontSize:13, color:C.g5 }}>{r.phone}</span> },
              { header:"Email", key:"email", width:"1.3fr", render: r => <a href={`mailto:${r.email}`} style={{ fontSize:13, color:C.ocean, textDecoration:"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{r.email}</a> },
              { header:"Overdue", key:"ov", width:"90px", align:"right", render: r => (
                <span style={{ fontSize:13, fontWeight:700, color: r.ov >= 3 ? C.red : r.ov >= 2 ? C.yel : C.g6 }}>
                  {r.ov} / {r.tot}
                </span>
              )},
            ]}
            rows={behind.map(p => ({ ...p, ...contactFor(p.name) }))}
            empty="Everyone is on track."
          />
        </Card>

        <div style={{ height:8 }} />
        </main>
      </div>
    </div>
  );
}
