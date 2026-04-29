// Stub data for Employees list page and Employee record page
import { AUDITS_50, LOCATIONS_ALL, TEMPLATES_ALL } from "./auditStubData.js";

export const AVATAR_COLORS = [
  "#2226f7","#0f766e","#7c3aed","#b6143a","#a16207",
  "#0369a1","#5c8a5c","#8b5e8b","#c2410c","#0891b2",
];

export function avatarColor(id) {
  return AVATAR_COLORS[parseInt(id.slice(1)) % AVATAR_COLORS.length];
}

// ─── 25 Employees ─────────────────────────────────────────────────────────────
// perf.trend = last 6 months completion rate (Nov→Apr)
// perf.scoreTrend = last 6 months avg score (null if not auditor)

export const EMPLOYEES_25 = [
  { id:"E001", name:"Marcus King",       initials:"MK", email:"m.king@thinklp.com",       phone:"(212) 555-0147", phoneExt:"x4521", personalPhone:null,             role:"District Manager",     lId:"L001", managerId:"E004", status:"active",   hireDate:"Mar 14, 2019", empId:"EMP-0142", isAuditor:true,  auditsQ:8,  lastActivity:"Apr 26, 2026", newThisMonth:false, perf:{ completionRate:75, avgScore:80, apCompleted:8,  apOverdue:1, trend:[70,72,73,74,76,80], scoreTrend:[78,79,80,80,81,80] } },
  { id:"E002", name:"Sarah Patel",       initials:"SP", email:"s.patel@thinklp.com",       phone:"(617) 555-0183", phoneExt:null,   personalPhone:"(617) 555-9021",  role:"Store Manager",        lId:"L002", managerId:"E001", status:"active",   hireDate:"Jun 22, 2021", empId:"EMP-0287", isAuditor:true,  auditsQ:5,  lastActivity:"Apr 24, 2026", newThisMonth:false, perf:{ completionRate:82, avgScore:82, apCompleted:6,  apOverdue:2, trend:[76,78,80,81,82,82], scoreTrend:[80,81,82,82,82,82] } },
  { id:"E003", name:"Tom Wu",            initials:"TW", email:"t.wu@thinklp.com",           phone:"(312) 555-0291", phoneExt:"x2114", personalPhone:null,            role:"District Manager",     lId:"L003", managerId:"E004", status:"active",   hireDate:"Jan 9,  2018", empId:"EMP-0098", isAuditor:true,  auditsQ:10, lastActivity:"Apr 28, 2026", newThisMonth:false, perf:{ completionRate:90, avgScore:90, apCompleted:10, apOverdue:0, trend:[85,86,87,88,90,90], scoreTrend:[87,88,89,90,90,90] } },
  { id:"E004", name:"Linda Chen",        initials:"LC", email:"l.chen@thinklp.com",         phone:"(212) 555-0054", phoneExt:"x1001", personalPhone:null,            role:"Regional Manager",     lId:"L001", managerId:null,   status:"active",   hireDate:"Aug 3,  2016", empId:"EMP-0031", isAuditor:true,  auditsQ:12, lastActivity:"Apr 28, 2026", newThisMonth:false, perf:{ completionRate:95, avgScore:94, apCompleted:14, apOverdue:0, trend:[91,92,93,94,95,95], scoreTrend:[91,92,93,93,94,94] } },
  { id:"E005", name:"James Rodriguez",   initials:"JR", email:"j.rodriguez@thinklp.com",   phone:"(215) 555-0372", phoneExt:null,   personalPhone:"(215) 555-8847",  role:"Store Manager",        lId:"L005", managerId:"E001", status:"active",   hireDate:"Oct 17, 2022", empId:"EMP-0391", isAuditor:true,  auditsQ:3,  lastActivity:"Apr 20, 2026", newThisMonth:false, perf:{ completionRate:58, avgScore:65, apCompleted:3,  apOverdue:5, trend:[52,54,55,57,58,65], scoreTrend:[60,62,63,65,63,65] } },
  { id:"E006", name:"Rachel Torres",     initials:"RT", email:"r.torres@thinklp.com",       phone:"(206) 555-0218", phoneExt:"x3302", personalPhone:null,            role:"AP Specialist",        lId:"L007", managerId:"E019", status:"active",   hireDate:"Feb 11, 2020", empId:"EMP-0201", isAuditor:true,  auditsQ:7,  lastActivity:"Apr 27, 2026", newThisMonth:false, perf:{ completionRate:84, avgScore:83, apCompleted:9,  apOverdue:1, trend:[78,80,81,82,83,84], scoreTrend:[80,81,82,82,83,83] } },
  { id:"E007", name:"Priya Sharma",      initials:"PS", email:"p.sharma@thinklp.com",       phone:"(617) 555-0447", phoneExt:null,   personalPhone:"(617) 555-2918",  role:"Store Manager",        lId:"L002", managerId:"E003", status:"active",   hireDate:"Apr 5,  2021", empId:"EMP-0276", isAuditor:true,  auditsQ:6,  lastActivity:"Apr 25, 2026", newThisMonth:false, perf:{ completionRate:90, avgScore:88, apCompleted:7,  apOverdue:0, trend:[83,85,87,88,89,90], scoreTrend:[85,86,87,88,88,88] } },
  { id:"E008", name:"David Kim",         initials:"DK", email:"d.kim@thinklp.com",           phone:"(212) 555-0563", phoneExt:"x2284", personalPhone:null,            role:"AP Investigator",      lId:"L001", managerId:"E004", status:"active",   hireDate:"Sep 28, 2022", empId:"EMP-0388", isAuditor:false, auditsQ:0,  lastActivity:"Apr 22, 2026", newThisMonth:false, perf:{ completionRate:74, avgScore:0,  apCompleted:5,  apOverdue:2, trend:[],              scoreTrend:[] } },
  { id:"E009", name:"Maria Gonzalez",    initials:"MG", email:"m.gonzalez@thinklp.com",    phone:"(404) 555-0184", phoneExt:null,   personalPhone:"(404) 555-7723",  role:"Department Lead",      lId:"L006", managerId:"E020", status:"active",   hireDate:"Jul 19, 2020", empId:"EMP-0235", isAuditor:true,  auditsQ:9,  lastActivity:"Apr 28, 2026", newThisMonth:false, perf:{ completionRate:97, avgScore:93, apCompleted:11, apOverdue:0, trend:[91,92,93,94,96,97], scoreTrend:[90,91,92,93,93,93] } },
  { id:"E010", name:"Jordan Williams",   initials:"JW", email:"j.williams@thinklp.com",   phone:"(312) 555-0729", phoneExt:"x3156", personalPhone:null,            role:"Operations Lead",      lId:"L003", managerId:"E003", status:"active",   hireDate:"Mar 3,  2021", empId:"EMP-0271", isAuditor:false, auditsQ:0,  lastActivity:"Apr 18, 2026", newThisMonth:false, perf:{ completionRate:81, avgScore:0,  apCompleted:8,  apOverdue:1, trend:[],              scoreTrend:[] } },
  { id:"E011", name:"Emma Thompson",     initials:"ET", email:"e.thompson@thinklp.com",   phone:"(206) 555-0316", phoneExt:null,   personalPhone:null,             role:"AP Specialist",        lId:"L007", managerId:"E006", status:"active",   hireDate:"Nov 14, 2021", empId:"EMP-0329", isAuditor:true,  auditsQ:5,  lastActivity:"Apr 23, 2026", newThisMonth:false, perf:{ completionRate:88, avgScore:86, apCompleted:6,  apOverdue:0, trend:[82,83,84,85,86,88], scoreTrend:[83,84,85,86,86,86] } },
  { id:"E012", name:"Amir Hassan",       initials:"AH", email:"a.hassan@thinklp.com",      phone:"(214) 555-0482", phoneExt:null,   personalPhone:"(214) 555-3391",  role:"Store Manager",        lId:"L008", managerId:"E001", status:"inactive", hireDate:"Jan 21, 2023", empId:"EMP-0425", isAuditor:true,  auditsQ:2,  lastActivity:"Mar 15, 2026", newThisMonth:false, perf:{ completionRate:62, avgScore:68, apCompleted:3,  apOverdue:4, trend:[58,60,62,62,65,62], scoreTrend:[64,66,68,68,68,68] } },
  { id:"E013", name:"Natasha Brown",     initials:"NB", email:"n.brown@thinklp.com",       phone:"(305) 555-0597", phoneExt:"x4471", personalPhone:null,            role:"Department Lead",      lId:"L010", managerId:"E020", status:"active",   hireDate:"May 6,  2022", empId:"EMP-0347", isAuditor:false, auditsQ:0,  lastActivity:"Apr 20, 2026", newThisMonth:false, perf:{ completionRate:76, avgScore:0,  apCompleted:7,  apOverdue:2, trend:[],              scoreTrend:[] } },
  { id:"E014", name:"Carlos Rivera",     initials:"CR", email:"c.rivera@thinklp.com",      phone:"(213) 555-0641", phoneExt:null,   personalPhone:"(213) 555-8812",  role:"AP Investigator",      lId:"L004", managerId:"E006", status:"active",   hireDate:"Aug 30, 2020", empId:"EMP-0242", isAuditor:true,  auditsQ:8,  lastActivity:"Apr 27, 2026", newThisMonth:false, perf:{ completionRate:92, avgScore:90, apCompleted:9,  apOverdue:0, trend:[87,88,89,90,91,92], scoreTrend:[87,88,89,90,90,90] } },
  { id:"E015", name:"Sophie Chen",       initials:"SC", email:"s.chen@thinklp.com",         phone:"(720) 555-0173", phoneExt:"x1889", personalPhone:null,            role:"Operations Lead",      lId:"L009", managerId:"E019", status:"active",   hireDate:"Dec 12, 2021", empId:"EMP-0338", isAuditor:false, auditsQ:0,  lastActivity:"Apr 21, 2026", newThisMonth:false, perf:{ completionRate:84, avgScore:0,  apCompleted:8,  apOverdue:1, trend:[],              scoreTrend:[] } },
  { id:"E016", name:"Michael O'Brien",   initials:"MO", email:"m.obrien@thinklp.com",     phone:"(215) 555-0784", phoneExt:null,   personalPhone:"(215) 555-6634",  role:"Store Manager",        lId:"L005", managerId:"E003", status:"active",   hireDate:"Sep 8,  2020", empId:"EMP-0256", isAuditor:true,  auditsQ:4,  lastActivity:"Apr 16, 2026", newThisMonth:false, perf:{ completionRate:70, avgScore:72, apCompleted:5,  apOverdue:3, trend:[63,65,67,68,70,72], scoreTrend:[69,70,71,72,72,72] } },
  { id:"E017", name:"Nia Johnson",       initials:"NJ", email:"n.johnson@thinklp.com",     phone:"(615) 555-0825", phoneExt:null,   personalPhone:null,             role:"Department Lead",      lId:"L012", managerId:"E016", status:"active",   hireDate:"Feb 27, 2022", empId:"EMP-0312", isAuditor:true,  auditsQ:7,  lastActivity:"Apr 24, 2026", newThisMonth:false, perf:{ completionRate:93, avgScore:89, apCompleted:10, apOverdue:0, trend:[87,88,89,90,92,93], scoreTrend:[86,87,88,89,89,89] } },
  { id:"E018", name:"Raj Patel",         initials:"RP", email:"r.patel@thinklp.com",        phone:"(860) 555-0938", phoneExt:"x2207", personalPhone:null,            role:"AP Specialist",        lId:"L011", managerId:"E006", status:"active",   hireDate:"Jun 17, 2021", empId:"EMP-0281", isAuditor:true,  auditsQ:5,  lastActivity:"Apr 22, 2026", newThisMonth:false, perf:{ completionRate:87, avgScore:85, apCompleted:6,  apOverdue:0, trend:[80,81,83,84,85,87], scoreTrend:[82,83,84,85,85,85] } },
  { id:"E019", name:"Lisa Park",         initials:"LP", email:"l.park@thinklp.com",         phone:"(213) 555-0061", phoneExt:"x1102", personalPhone:null,            role:"District Manager",     lId:"L004", managerId:"E025", status:"active",   hireDate:"Nov 4,  2018", empId:"EMP-0127", isAuditor:true,  auditsQ:9,  lastActivity:"Apr 28, 2026", newThisMonth:false, perf:{ completionRate:91, avgScore:88, apCompleted:11, apOverdue:0, trend:[86,87,88,89,90,91], scoreTrend:[85,86,87,88,88,88] } },
  { id:"E020", name:"Derek Washington",  initials:"DW", email:"d.washington@thinklp.com", phone:"(404) 555-0147", phoneExt:null,   personalPhone:"(404) 555-2281",  role:"Store Manager",        lId:"L006", managerId:"E001", status:"active",   hireDate:"Jul 14, 2022", empId:"EMP-0359", isAuditor:true,  auditsQ:4,  lastActivity:"Apr 17, 2026", newThisMonth:false, perf:{ completionRate:65, avgScore:70, apCompleted:4,  apOverdue:4, trend:[59,61,62,63,65,70], scoreTrend:[66,67,68,69,70,70] } },
  { id:"E021", name:"Fatima Al-Rashid",  initials:"FA", email:"f.alrashid@thinklp.com",  phone:"(212) 555-0273", phoneExt:"x3019", personalPhone:null,            role:"Operations Lead",      lId:"L001", managerId:"E002", status:"active",   hireDate:"Oct 3,  2020", empId:"EMP-0259", isAuditor:false, auditsQ:0,  lastActivity:"Apr 26, 2026", newThisMonth:false, perf:{ completionRate:96, avgScore:0,  apCompleted:13, apOverdue:0, trend:[],              scoreTrend:[] } },
  { id:"E022", name:"Tyler Brooks",      initials:"TB", email:"t.brooks@thinklp.com",      phone:"(206) 555-0389", phoneExt:null,   personalPhone:null,             role:"Department Lead",      lId:"L007", managerId:"E007", status:"inactive", hireDate:"Mar 19, 2023", empId:"EMP-0441", isAuditor:false, auditsQ:0,  lastActivity:"Mar 28, 2026", newThisMonth:false, perf:{ completionRate:79, avgScore:0,  apCompleted:6,  apOverdue:2, trend:[],              scoreTrend:[] } },
  { id:"E023", name:"Keiko Tanaka",      initials:"KT", email:"k.tanaka@thinklp.com",      phone:"(305) 555-0512", phoneExt:null,   personalPhone:"(305) 555-4490",  role:"AP Investigator",      lId:"L010", managerId:"E006", status:"active",   hireDate:"Apr 7,  2026", empId:"EMP-0501", isAuditor:false, auditsQ:0,  lastActivity:"Apr 10, 2026", newThisMonth:true,  perf:{ completionRate:0,  avgScore:0,  apCompleted:0,  apOverdue:0, trend:[],              scoreTrend:[] } },
  { id:"E024", name:"Xavier Morales",    initials:"XM", email:"x.morales@thinklp.com",    phone:"(213) 555-0624", phoneExt:null,   personalPhone:null,             role:"Store Manager",        lId:"L004", managerId:"E019", status:"active",   hireDate:"Apr 14, 2026", empId:"EMP-0498", isAuditor:false, auditsQ:0,  lastActivity:"Apr 17, 2026", newThisMonth:true,  perf:{ completionRate:0,  avgScore:0,  apCompleted:0,  apOverdue:0, trend:[],              scoreTrend:[] } },
  { id:"E025", name:"Ingrid Larsen",     initials:"IL", email:"i.larsen@thinklp.com",      phone:"(214) 555-0739", phoneExt:"x1003", personalPhone:null,            role:"Regional Manager",     lId:"L008", managerId:null,   status:"active",   hireDate:"May 22, 2017", empId:"EMP-0044", isAuditor:true,  auditsQ:11, lastActivity:"Apr 28, 2026", newThisMonth:false, perf:{ completionRate:94, avgScore:90, apCompleted:9,  apOverdue:0, trend:[88,89,90,91,93,94], scoreTrend:[87,88,89,90,90,90] } },
];

// ─── Quick lookups ────────────────────────────────────────────────────────────
export function empById(id) { return EMPLOYEES_25.find(e => e.id === id) || null; }

// ─── Detail Generator ─────────────────────────────────────────────────────────
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
  "Replace worn safety gloves in PPE station 2",
  "Verify sprinkler clearance after shelf reconfiguration",
  "Submit near-miss incident report to regional office",
];

const EVENT_ICONS = {
  audit_assigned:     "📋",
  audit_started:      "▶",
  audit_completed:    "✓",
  action_plan_assigned: "📌",
  action_plan_completed:"✓",
  action_plan_overdue:  "⚠",
  escalation_received:  "🔔",
  role_changed:         "👤",
  location_changed:     "📍",
  hired:               "🎉",
};

function seedRng(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function generateActionPlans(emp, rng) {
  const count = 3 + Math.floor(rng() * 4); // 3-6 plans
  const statuses = ["open","open","in_progress","completed","completed","overdue"];
  const priorities = ["high","medium","medium","low"];
  const plans = [];
  for (let i = 0; i < count; i++) {
    const titleIdx = Math.floor(rng() * AP_TITLES.length);
    const statusIdx = Math.floor(rng() * statuses.length);
    const prioIdx   = Math.floor(rng() * priorities.length);
    const auditIdx  = Math.floor(rng() * 10);
    const auditNum  = String(auditIdx + 1).padStart(3, "0");
    plans.push({
      id: `AP_${emp.id}_${i}`,
      title: AP_TITLES[titleIdx],
      auditId: `A0${auditIdx + 1}`,
      auditName: `Audit #A0${auditNum}`,
      location: LOCATIONS_ALL[Math.floor(rng() * LOCATIONS_ALL.length)]?.name || "—",
      dueDate: i % 3 === 0 ? "Apr 30, 2026" : i % 3 === 1 ? "May 15, 2026" : "May 30, 2026",
      status: statuses[statusIdx],
      priority: priorities[prioIdx],
    });
  }
  return plans;
}

function generateTimeline(emp, empAudits, rng) {
  const events = [];

  // Hired event
  events.push({
    type: "hired", icon: "hired",
    title: "Employee added to system",
    entity: null, entityId: null,
    timestamp: `${emp.hireDate} at 9:00 AM`,
    context: `Welcome to the team, ${emp.name.split(" ")[0]}!`,
  });

  // Role change (stub for some)
  if (parseInt(emp.id.slice(1)) % 4 === 1) {
    events.push({
      type: "role_changed", icon: "role_changed",
      title: "Role updated",
      entity: null, entityId: null,
      timestamp: "Jan 15, 2025 at 11:30 AM",
      context: `Role changed to ${emp.role} from previous assignment`,
    });
  }

  // Audit events
  empAudits.forEach(a => {
    const tmpl = TEMPLATES_ALL.find(t => t.id === a.tId);
    const loc  = LOCATIONS_ALL.find(l => l.id === a.lId);
    const auditLabel = `${tmpl?.name || "Audit"} — ${loc?.name || ""}`;

    events.push({
      type: "audit_assigned", icon: "audit_assigned",
      title: "Audit assigned",
      entity: auditLabel, entityId: a.id,
      timestamp: `${a.date.trim()} at 8:00 AM`,
      context: `Assigned by Program Owner`,
    });
    if (a.status === "in_progress" || a.status === "completed") {
      events.push({
        type: "audit_started", icon: "audit_started",
        title: "Audit started",
        entity: auditLabel, entityId: a.id,
        timestamp: `${a.date.trim()} at 9:14 AM`,
        context: "Audit opened on mobile device",
      });
    }
    if (a.status === "completed") {
      events.push({
        type: "audit_completed", icon: "audit_completed",
        title: `Audit completed${a.score ? ` · Score: ${a.score}%` : ""}`,
        entity: auditLabel, entityId: a.id,
        timestamp: `${a.date.trim()} at 11:47 AM`,
        context: a.cf > 0 ? `${a.cf} critical fail(s) — escalation fired` : "No critical findings",
      });
    }
    if (a.status === "overdue") {
      events.push({
        type: "action_plan_overdue", icon: "action_plan_overdue",
        title: "Audit overdue",
        entity: auditLabel, entityId: a.id,
        timestamp: `${a.date.trim()} at 12:00 AM`,
        context: "Deadline passed without completion",
      });
    }
  });

  // Action plan events
  const apCount = 1 + Math.floor(rng() * 3);
  for (let i = 0; i < apCount; i++) {
    events.push({
      type: "action_plan_assigned", icon: "action_plan_assigned",
      title: "Action plan assigned",
      entity: AP_TITLES[Math.floor(rng() * AP_TITLES.length)],
      entityId: null,
      timestamp: "Apr 8, 2026 at 2:30 PM",
      context: "Created from audit finding",
    });
    if (i === 0) {
      events.push({
        type: "action_plan_completed", icon: "action_plan_completed",
        title: "Action plan completed",
        entity: AP_TITLES[Math.floor(rng() * AP_TITLES.length)],
        entityId: null,
        timestamp: "Apr 15, 2026 at 4:18 PM",
        context: "Marked complete by employee",
      });
    }
  }

  // Sort newest first
  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getEmployeeDetail(employeeId) {
  const emp = EMPLOYEES_25.find(e => e.id === employeeId);
  if (!emp) return null;

  const rng = seedRng(parseInt(employeeId.slice(1)) * 137);

  const loc     = LOCATIONS_ALL.find(l => l.id === emp.lId);
  const manager = EMPLOYEES_25.find(e => e.id === emp.managerId) || null;
  const directs = EMPLOYEES_25.filter(e => e.managerId === emp.id);

  // Audits from AUDITS_50 where eId matches
  const empAudits = AUDITS_50.filter(a => a.eId === emp.id).map(a => {
    const tmpl = TEMPLATES_ALL.find(t => t.id === a.tId);
    const aloc = LOCATIONS_ALL.find(l => l.id === a.lId);
    return {
      ...a,
      template: tmpl?.name || "—",
      version: tmpl?.version || "",
      locationName: aloc?.name || "—",
    };
  });

  // For employees with no audits in AUDITS_50, generate stub assigned audits
  const assignedAudits = empAudits.length > 0 ? empAudits : (emp.isAuditor ? [
    { id:"stub1", name:`${emp.name.split(" ")[0]}'s Audit — ${loc?.name}`, template:"Store Safety", version:"v1", locationName: loc?.name, status:"not_started", score:null, cf:0, ap:0, date:"May 10, 2026" },
    { id:"stub2", name:`PPE Check — ${loc?.name}`, template:"PPE Compliance", version:"v2", locationName: loc?.name, status:"not_started", score:null, cf:0, ap:0, date:"May 17, 2026" },
  ] : []);

  const actionPlans = generateActionPlans(emp, rng);
  const timeline    = generateTimeline(emp, empAudits, rng);

  // Report trend data (6 months for charts)
  const months = ["Nov","Dec","Jan","Feb","Mar","Apr"];
  const perfTrend = months.map((m, i) => ({
    label: m,
    completionRate: emp.perf.trend[i] ?? 0,
    avgScore: emp.perf.scoreTrend[i] ?? 0,
  }));

  // Peer comparison (role-average stub)
  const roleAvgCompletion = 80;
  const roleAvgScore = 81;

  // Action plan resolution monthly data (last 6 months)
  const apResolution = months.map((m, i) => ({
    label: m,
    completed: Math.round(1 + rng() * 4),
    overdue:   Math.round(rng() * 2),
  }));

  // Score distribution (buckets: 50-60, 60-70, 70-80, 80-90, 90-100)
  const scoreDist = [
    { label:"50-60", count: emp.perf.avgScore < 65 ? 2 : 0 },
    { label:"60-70", count: emp.perf.avgScore < 75 ? 3 : 1 },
    { label:"70-80", count: emp.perf.avgScore < 85 ? 4 : 2 },
    { label:"80-90", count: emp.perf.avgScore >= 80 ? 5 : 2 },
    { label:"90-100",count: emp.perf.avgScore >= 90 ? 4 : emp.perf.avgScore >= 80 ? 2 : 0 },
  ];

  return {
    ...emp,
    locationFull: loc,
    managerFull: manager,
    directs,
    assignedAudits,
    actionPlans,
    timeline,
    perfTrend,
    apResolution,
    scoreDist,
    roleAvgCompletion,
    roleAvgScore,
  };
}
