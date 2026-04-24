// Implements: TLP-221 (deactivate/archive lifecycle, blocking rules, data integrity)
import { useState } from "react";
import Dashboard from "./Dashboard.jsx";
import Scorecard from "./Scorecard.jsx";
import Catalog, { TEMPLATES } from "./Catalog.jsx";
import TemplateWizard from "./TemplateWizard.jsx";

// Seed with a deep copy so mutations never touch the const fixture
const seedTemplates = () => TEMPLATES.map(t => ({ ...t }));

export default function App() {
  const [view, setView]                     = useState("dashboard");
  const [selectedProg, setSelectedProg]     = useState(null);
  const [wizardTemplateId, setWizardTemplateId] = useState(null);
  const [wizardSeymourMode, setWizardSeymourMode] = useState(false);
  const [templates, setTemplates]           = useState(seedTemplates);
  const [isAdmin, setIsAdmin]               = useState(true);

  const handleNav = (key, payload) => {
    if (key === "template_wizard") {
      setWizardTemplateId(payload?.templateId ?? null);
      setWizardSeymourMode(payload?.seymourMode ?? false);
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
        onBack={() => handleNav("catalog")}
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
        onBack={() => { setView("dashboard"); setSelectedProg(null); }}
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
