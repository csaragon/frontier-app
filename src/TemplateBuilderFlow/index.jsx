import { useState, useEffect, useRef } from "react";
import { USER_PREFS } from "./shared.js";
import PickAPath from "./PickAPath.jsx";
import RouteA from "./RouteA.jsx";
import RouteB from "./RouteB.jsx";
import WizardShell from "./WizardShell.jsx";
import { DiscardModal } from "./modals.jsx";
import AppSidebar from "../AppSidebar.jsx";

function formatRelativeTime(date) {
  if (!date) return null;
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return "Saved just now";
  if (diffSec < 60) return `Saved ${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  return `Saved ${diffMin}m ago`;
}

export default function TemplateBuilderFlow({ entryPoint = "catalog", initialTemplateId = null, onExit, onNav }) {
  const [screen, setScreen] = useState("pick"); // 'pick' | 'routeA' | 'routeB' | 'wizard'
  const [routeOrigin, setRouteOrigin] = useState(null); // 'template' | 'upload' | 'scratch' | null
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId);
  const [hasRouteData, setHasRouteData] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Auto-save state
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [savedLabel, setSavedLabel] = useState(null);

  const autoSaveRef = useRef(null);
  const labelIntervalRef = useRef(null);

  // Auto-save simulation: every 30s, if dirty, save
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      setIsDirty((dirty) => {
        if (dirty) {
          setLastSaved(new Date());
          return false;
        }
        return dirty;
      });
    }, 30000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, []);

  // Update saved label every 5s
  useEffect(() => {
    labelIntervalRef.current = setInterval(() => {
      setSavedLabel((prev) => {
        // Access lastSaved via closure — use a ref trick
        return prev;
      });
    }, 5000);
    return () => { if (labelIntervalRef.current) clearInterval(labelIntervalRef.current); };
  }, []);

  // Recompute label when lastSaved changes
  useEffect(() => {
    if (lastSaved) {
      setSavedLabel(formatRelativeTime(lastSaved));
      // Update label over time
      if (labelIntervalRef.current) clearInterval(labelIntervalRef.current);
      labelIntervalRef.current = setInterval(() => {
        setSavedLabel(formatRelativeTime(lastSaved));
      }, 5000);
    }
    return () => { if (labelIntervalRef.current) clearInterval(labelIntervalRef.current); };
  }, [lastSaved]);

  const handlePickRoute = (route) => {
    if (route === "template") {
      setScreen("routeA");
      setRouteOrigin("template");
    } else if (route === "upload") {
      setScreen("routeB");
      setRouteOrigin("upload");
    } else if (route === "scratch") {
      setScreen("wizard");
      setRouteOrigin("scratch");
      setIsDirty(true);
    }
  };

  const handleUseTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    setScreen("wizard");
    setIsDirty(true);
  };

  const handleUploadComplete = (data) => {
    setRouteOrigin("upload");
    setScreen("wizard");
    setIsDirty(true);
  };

  const handleBackToPick = () => {
    setScreen("pick");
    setHasRouteData(false);
  };

  const handleSaveAndExit = () => {
    console.log("Draft saved");
    onExit();
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <AppSidebar activeId="template_builder" onNav={onNav} />
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {screen === "pick" && (
          <PickAPath
            onPickRoute={handlePickRoute}
            onCancel={onExit}
            entryPoint={entryPoint}
          />
        )}
        {screen === "routeA" && (
          <RouteA
            onUseTemplate={handleUseTemplate}
            onBack={handleBackToPick}
            onCancel={onExit}
            hasData={hasRouteData}
            userLangs={USER_PREFS.requiredLanguages}
          />
        )}
        {screen === "routeB" && (
          <RouteB
            onComplete={handleUploadComplete}
            onBack={handleBackToPick}
            onCancel={onExit}
          />
        )}
        {screen === "wizard" && (
          <WizardShell
            routeOrigin={routeOrigin}
            templateId={selectedTemplateId}
            entryPoint={entryPoint}
            onBackToPick={() => setScreen("pick")}
            onExit={onExit}
          />
        )}
        {showDiscardModal && (
          <DiscardModal
            onSaveAndExit={handleSaveAndExit}
            onExitWithout={onExit}
            onCancel={() => setShowDiscardModal(false)}
          />
        )}
      </div>
    </div>
  );
}
