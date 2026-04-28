// Implements: TLP-221 (deactivate/archive lifecycle, blocking rules, data integrity)
import { useState } from "react";
import Dashboard from "./Dashboard.jsx";
import Scorecard from "./Scorecard.jsx";
import Catalog, { TEMPLATES, CAT_COLORS } from "./Catalog.jsx";
import TemplateWizard from "./TemplateWizard.jsx";
import ProgramList from "./ProgramList.jsx";
import AuditList from "./AuditList.jsx";
import Settings from "./Settings.jsx";
import AuditBuilderHome from "./AuditBuilderHome.jsx";
import TemplateBuilderFlow from "./TemplateBuilderFlow/index.jsx";

const seedTemplates   = () => TEMPLATES.map(t => ({ ...t }));
const seedCategories  = () => Object.entries(CAT_COLORS).map(([name, style], i) => ({
  id: `builtin-${i}`, name, color: style.color, bg: style.bg, builtIn: true,
}));

export default function App() {
  const [view, setView]                     = useState("dashboard");
  const [selectedProg, setSelectedProg]     = useState(null);
  const [wizardTemplateId, setWizardTemplateId]   = useState(null);
  const [wizardSeymourMode, setWizardSeymourMode] = useState(false);
  const [wizardOrigin, setWizardOrigin]           = useState("catalog");
  const [templates, setTemplates]           = useState(seedTemplates);
  const [isAdmin, setIsAdmin]               = useState(true);
  const [density, setDensity]               = useState("condensed");
  const [categories, setCategories]         = useState(seedCategories);
  const [templateBuilderEntryPoint, setTemplateBuilderEntryPoint] = useState("catalog");

  const handleNav = (key, payload) => {
    if (key === "template_wizard") {
      setWizardTemplateId(payload?.templateId ?? null);
      setWizardSeymourMode(payload?.seymourMode ?? false);
      setWizardOrigin(payload?.origin ?? view);
    } else if (key === "template_builder") {
      setTemplateBuilderEntryPoint(payload?.entryPoint ?? "catalog");
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

  if (view === "template_wizard") {
    return (
      <TemplateWizard
        templateId={wizardTemplateId}
        seymourMode={wizardSeymourMode}
        onBack={() => handleNav(wizardOrigin)}
        onPublish={(publishedData) => {
          // Add or update template in the catalog list on publish
          setTemplates(prev => {
            const exists = prev.find(t => t.id === publishedData.id);
            if (exists) {
              return prev.map(t => t.id === publishedData.id ? { ...t, ...publishedData, state: "active" } : t);
            }
            return [...prev, { ...publishedData, state: "active" }];
          });
        }}
      />
    );
  }

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
    return <AuditList onNav={handleNav} density={density} />;
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
        onExit={() => handleNav(templateBuilderEntryPoint || "catalog")}
        onNav={handleNav}
      />
    );
  }

  if (view === "audit_builder") {
    return (
      <AuditBuilderHome
        onNav={(key, payload) => handleNav(key, { ...payload, origin: "audit_builder" })}
        templates={templates}
      />
    );
  }

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
