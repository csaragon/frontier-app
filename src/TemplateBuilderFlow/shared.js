// TODO: [assumption-7] AI search feature-flagged off by default
export const featureFlags = {
  aiTemplateSearch: false,
};

// TODO: [assumption-3] User required languages stubbed; easy to swap
export const USER_PREFS = {
  requiredLanguages: ["English", "Spanish"],
};

export const CAT_COLORS = {
  "Health & Safety":  { color: "#dc2626", bg: "#fef2f2" },
  "Loss Prevention":  { color: "#2226f7", bg: "#f0f2ff" },
  "Operations":       { color: "#0f766e", bg: "#ecfdf5" },
  "PPE Compliance":   { color: "#c2410c", bg: "#fff7ed" },
  "Fire Safety":      { color: "#7c3aed", bg: "#faf5ff" },
};

// TODO: [assumption-8] Empty catalog disables "Start from a template" card
// TODO: [assumption-4] Default sort = Alphabetical
export const SORT_OPTS = ["Alphabetical", "Recently used", "Recently updated", "Most popular"];

export const ALL_LANGUAGES = ["English", "Spanish", "French", "Portuguese", "Mandarin"];

export const STUB_TEMPLATES = [
  { id: "T01", name: "Fire Safety Audit",            cat: "Fire Safety",     sections: 5, questions: 32, langs: ["English", "Spanish", "French"], description: "Comprehensive fire safety inspection covering egress routes, suppression systems, and staff readiness.", updatedDays: 5  },
  { id: "T02", name: "Slip, Trip & Fall Inspection",  cat: "Health & Safety", sections: 4, questions: 24, langs: ["English"],                      description: "Identifies slip, trip and fall hazards across all store zones including stockrooms and customer aisles.", updatedDays: 12 },
  { id: "T03", name: "PPE Compliance Check",          cat: "PPE Compliance",  sections: 3, questions: 18, langs: ["English", "Spanish"],            description: "Verifies PPE availability, condition, and correct usage for all required roles.", updatedDays: 20 },
  { id: "T04", name: "LP Standard Audit",             cat: "Loss Prevention", sections: 6, questions: 38, langs: ["English", "Spanish"],            description: "Full LP compliance review covering CCTV, access control, cash handling, and shrink controls.", updatedDays: 3  },
  { id: "T05", name: "Cash Handling Review",          cat: "Loss Prevention", sections: 3, questions: 15, langs: ["English"],                       description: "Validates cash handling procedures at point-of-sale and back-office against LP standards.", updatedDays: 45 },
  { id: "T06", name: "Operations Standards",          cat: "Operations",      sections: 5, questions: 29, langs: ["English", "Spanish"],            description: "Store ops readiness covering staffing boards, planogram compliance, and department handoffs.", updatedDays: 18 },
  { id: "T07", name: "OSHA Compliance",               cat: "Health & Safety", sections: 4, questions: 22, langs: ["English"],                       description: "OSHA-aligned inspection covering lockout/tagout, MSDS access, and employee right-to-know training.", updatedDays: 60 },
  { id: "T08", name: "Shrink Prevention",             cat: "Loss Prevention", sections: 4, questions: 26, langs: ["English", "Spanish", "French"],  description: "Targeted shrink audit covering EAS compliance, merchandise security zones, and return desk controls.", updatedDays: 7  },
  { id: "T09", name: "Emergency Preparedness",        cat: "Health & Safety", sections: 5, questions: 30, langs: ["English", "Spanish"],            description: "Assesses staff readiness for emergencies including evacuation procedures and communication protocols.", updatedDays: 30 },
  { id: "T10", name: "Seasonal Safety",               cat: "Health & Safety", sections: 3, questions: 12, langs: ["English"],                       description: "Seasonal hazard review for high-traffic periods covering crowd management and temporary fixture safety.", updatedDays: 90 },
  { id: "T11", name: "Floor Ownership Audit",         cat: "Operations",      sections: 4, questions: 20, langs: ["English", "Spanish"],            description: "Evaluates associate floor ownership, zone coverage adherence, and department accountability.", updatedDays: 14 },
  { id: "T12", name: "Truck Survey",                  cat: "Operations",      sections: 3, questions: 15, langs: ["English"],                       description: "Receiving dock compliance audit covering documentation, vendor check-in, and inventory verification.", updatedDays: 22 },
];
