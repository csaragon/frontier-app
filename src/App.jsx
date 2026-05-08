// Implements: TLP-221 (deactivate/archive lifecycle, blocking rules, data integrity)
import { useState } from "react";
import Dashboard from "./Dashboard.jsx";
import Scorecard from "./Scorecard.jsx";
import Catalog, { TEMPLATES, CAT_COLORS } from "./Catalog.jsx";
import ProgramList from "./ProgramList.jsx";
import AuditList from "./AuditList.jsx";
import AuditsListPage from "./records/AuditsListPage.jsx";
import AuditRecordPage from "./records/AuditRecordPage.jsx";
import LocationsListPage from "./records/LocationsListPage.jsx";
import LocationRecordPage from "./records/LocationRecordPage.jsx";
import EmployeesListPage from "./records/EmployeesListPage.jsx";
import EmployeeRecordPage from "./records/EmployeeRecordPage.jsx";
import Settings from "./Settings.jsx";
//import AuditBuilderHome from "./AuditBuilderHome.jsx";
import TemplateBuilderFlow from "./TemplateBuilderFlow/index.jsx";

const seedTemplates   = () => TEMPLATES.map(t => ({ ...t }));
const seedCategories  = () => Object.entries(CAT_COLORS).map(([name, style], i) => ({
  id: `builtin-${i}`, name, color: style.color, bg: style.bg, builtIn: true,
}));

export default function App() {
  const [view, setView]                     = useState("dashboard");
  const [selectedProg, setSelectedProg]     = useState(null);
  const [selectedAuditId, setSelectedAuditId]   = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [selectedLocationName, setSelectedLocationName] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState(null);
  const [recordFromAudit, setRecordFromAudit]   = useState(null);
  const [templates, setTemplates]           = useState(seedTemplates);
  const [isAdmin, setIsAdmin]               = useState(true);
  const [density, setDensity]               = useState("condensed");
  const [categories, setCategories]         = useState(seedCategories);
  const [templateBuilderEntryPoint, setTemplateBuilderEntryPoint] = useState("catalog");
  const [templateBuilderId, setTemplateBuilderId] = useState(null);

  const handleNav = (key, payload) => {
    if (key === "template_builder") {
      setTemplateBuilderEntryPoint(payload?.entryPoint ?? "catalog");
      setTemplateBuilderId(payload?.templateId ?? null);
    } else if (key === "audit_record") {
      setSelectedAuditId(payload?.auditId ?? null);
    } else if (key === "location_record") {
      setSelectedLocationId(payload?.locationId ?? null);
      setSelectedLocationName(payload?.locationName ?? null);
      setRecordFromAudit(payload?.fromAudit ?? null);
    } else if (key === "employee_record") {
      setSelectedEmployeeId(payload?.employeeId ?? null);
      setSelectedEmployeeName(payload?.employeeName ?? null);
      setRecordFromAudit(payload?.fromAudit ?? null);
    } else {
      setSelectedProg(null);
    }
    setView(key);
  };

  // Central lifecycle handler for catalog template actions
  const handleTemplateAction = (action, templateId) => {
    setTemplates(prev => {
      switch (action) {
        case "deactivate":
          return prev.map(t => t.id === templateId ? { ...t, state: "deactivated" } : t);
        case "reactivate":
        case "restore":
          return prev.map(t => t.id === templateId ? { ...t, state: "active" } : t);
        case "archive":
          return prev.map(t => t.id === templateId ? { ...t, state: "archived" } : t);
        case "delete":
          return prev.filter(t => t.id !== templateId);
        default:
          return prev;
      }
    });
  };

  if (view === "scorecard" && selectedProg) {
    return (
      <Scorecard
        prog={selectedProg}
        onBack={() => { setView("programs"); }}
        onNav={(key, payload) => handleNav(key, payload)}
      />
    );
  }

  if (view === "audits") {
    return <AuditsListPage onNav={handleNav} density={density} />;
  }

  if (view === "audit_record" && selectedAuditId) {
    return <AuditRecordPage auditId={selectedAuditId} onNav={handleNav} density={density} />;
  }

  if (view === "locations") {
    return <LocationsListPage onNav={handleNav} density={density} />;
  }

  if (view === "location_record") {
    return <LocationRecordPage locationId={selectedLocationId} onNav={handleNav} />;
  }

  if (view === "employees") {
    return <EmployeesListPage onNav={handleNav} density={density} />;
  }

  if (view === "employee_record") {
    return <EmployeeRecordPage employeeId={selectedEmployeeId} onNav={handleNav} />;
  }

  if (view === "settings") {
    return <Settings onNav={handleNav} density={density} onDensityChange={setDensity} categories={categories} onCategoriesChange={setCategories} />;
  }

  if (view === "programs") {
    return (
      <ProgramList
        onNav={handleNav}
        density={density}
        onSelectProgram={(prog) => { setSelectedProg(prog); setView("scorecard"); }}
      />
    );
  }

  if (view === "template_builder") {
    return (
      <TemplateBuilderFlow
        entryPoint={templateBuilderEntryPoint}
        initialTemplateId={templateBuilderId}
        onExit={() => handleNav(templateBuilderEntryPoint || "catalog")}
        onNav={handleNav}
        templates={templates}
        categories={categories}
      />
    );
  }
/*
  if (view === "audit_builder") {
    return (
      <AuditBuilderHome
        onNav={(key, payload) => handleNav(key, { ...payload, origin: "audit_builder" })}
        templates={templates}
      />
    );
  }
*/

  if (view === "catalog") {
    return (
      <Catalog
        onNav={handleNav}
        templates={templates}
        onTemplateAction={handleTemplateAction}
        isAdmin={isAdmin}
        onToggleRole={setIsAdmin}
      />
    );
  }

  return (
    <Dashboard
      onViewScorecard={(prog) => { setSelectedProg(prog); setView("scorecard"); }}
      onNav={handleNav}
    />
  );
}
