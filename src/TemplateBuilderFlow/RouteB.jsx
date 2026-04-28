import { useState, useRef, useEffect, useCallback } from "react";
import { CancelProcessingModal, SwitchRouteModal } from "./modals.jsx";

const F = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const C = {
  navy:    "#001e76",
  navy2:   "#001356",
  navy3:   "#e8ecf8",
  ocean:   "#2226f7",
  white:   "#ffffff",
  g1:      "#f4f4f6",
  g2:      "#e2e5e9",
  g3:      "#c3c8d0",
  g4:      "#8692a2",
  g5:      "#555f6d",
  g6:      "#16191d",
  teal:    "#0f766e",
  teal2:   "#ccfbf1",
  red:     "#b6143a",
  red2:    "#fae5e6",
  green:   "#059669",
  greenBg: "#ecfdf5",
};

// TODO: [assumption-1] File size limit: 25MB
const MAX_FILE_SIZE = 26_214_400;
const ALLOWED_EXTS = [".docx", ".pdf", ".xlsx"];

// TODO: [assumption-2] AI processing simulation: 5 steps × 2s intervals
const PROCESSING_STEPS = [
  "Reading document",
  "Extracting questions",
  "Building sections",
  "Applying scoring",
  "Suggesting actions",
];

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file) {
  const name = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTS.some((ext) => name.endsWith(ext));
  if (!hasValidExt) return "unsupported-format";
  if (file.size > MAX_FILE_SIZE) return "file-too-large";
  return null;
}

function ErrorBanner({ errorType, onRetry, onBack }) {
  const messages = {
    "file-too-large": "File exceeds 25MB. Try a smaller file or split it.",
    "unsupported-format": "We support .docx, .pdf, and .xlsx.",
    "extraction-failed": "We couldn't read this document well enough to extract questions. Try Build from scratch, or upload a clearer version.",
    "network-error": "Upload failed. Try again.",
  };
  return (
    <div style={{
      background: C.red2,
      border: "1px solid #fca5a5",
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 16,
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      fontFamily: F,
      maxWidth: 520,
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 12, color: C.red }}>{messages[errorType] || "An error occurred."}</span>
        {errorType === "extraction-failed" && (
          <button
            onClick={onBack}
            style={{ display: "block", marginTop: 6, background: "none", border: "none", color: C.red, fontSize: 12, cursor: "pointer", fontFamily: F, textDecoration: "underline", padding: 0 }}
          >
            Build from scratch instead
          </button>
        )}
        {errorType === "network-error" && (
          <button
            onClick={onRetry}
            style={{ display: "block", marginTop: 6, background: "none", border: "none", color: C.red, fontSize: 12, cursor: "pointer", fontFamily: F, textDecoration: "underline", padding: 0 }}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export default function RouteB({ onComplete, onBack, onCancel }) {
  const [uploadState, setUploadState] = useState("idle"); // idle | uploading | processing | success | error
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [errorType, setErrorType] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const fileInputRef = useRef(null);
  const uploadIntervalRef = useRef(null);
  const processingIntervalRef = useRef(null);
  const successTimeoutRef = useRef(null);
  const autoAdvanceRef = useRef(null);

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
      if (processingIntervalRef.current) clearInterval(processingIntervalRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, []);

  const startUploadSimulation = useCallback((selectedFile) => {
    setFile(selectedFile);
    setUploadProgress(0);
    setUploadState("uploading");
    setHasInteracted(true);

    let progress = 0;
    uploadIntervalRef.current = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(uploadIntervalRef.current);
        uploadIntervalRef.current = null;
        setUploadState("processing");
        setProcessingStep(0);
        startProcessingSimulation();
      }
    }, 200);
  }, []);

  const startProcessingSimulation = useCallback(() => {
    let step = 0;
    processingIntervalRef.current = setInterval(() => {
      step += 1;
      setProcessingStep(step);
      if (step >= PROCESSING_STEPS.length) {
        clearInterval(processingIntervalRef.current);
        processingIntervalRef.current = null;
        autoAdvanceRef.current = setTimeout(() => {
          setUploadState("success");
        }, 400);
      }
    }, 2000);
  }, []);

  // Auto-advance from success after 1500ms
  useEffect(() => {
    if (uploadState === "success") {
      successTimeoutRef.current = setTimeout(() => {
        onComplete({ routeOrigin: "upload", sectionsFound: 4, questionsFound: 23 });
      }, 1500);
      return () => { if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current); };
    }
  }, [uploadState, onComplete]);

  const handleFileSelect = (selectedFile) => {
    const err = validateFile(selectedFile);
    if (err) {
      setErrorType(err);
      setUploadState("error");
      return;
    }
    setErrorType(null);
    setUploadState("idle");
    startUploadSimulation(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragCounter(0);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragCounter((c) => c + 1);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragCounter((c) => c - 1);
  };

  const isDragOver = dragCounter > 0;

  const handleCancelUpload = () => {
    if (uploadIntervalRef.current) { clearInterval(uploadIntervalRef.current); uploadIntervalRef.current = null; }
    setUploadState("idle");
    setFile(null);
    setUploadProgress(0);
    setHasInteracted(false);
  };

  const handleCancelProcessingConfirm = () => {
    if (processingIntervalRef.current) { clearInterval(processingIntervalRef.current); processingIntervalRef.current = null; }
    if (autoAdvanceRef.current) { clearTimeout(autoAdvanceRef.current); autoAdvanceRef.current = null; }
    setShowCancelModal(false);
    setUploadState("idle");
    setFile(null);
    setUploadProgress(0);
    setProcessingStep(0);
    setHasInteracted(false);
  };

  const handleBackBtn = () => {
    if (hasInteracted || uploadState !== "idle") {
      setShowSwitchModal(true);
    } else {
      onBack();
    }
  };

  const handleRetry = () => {
    setErrorType(null);
    setUploadState("idle");
    setFile(null);
  };

  const isErrorState = uploadState === "error";

  return (
    <>
      {/* Pulse keyframe animation */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
      `}</style>

      <div style={{ height: "100%", background: C.g1, display: "flex", flexDirection: "column", fontFamily: F }}>
        {/* Top bar */}
        <div style={{
          height: 52,
          background: C.white,
          borderBottom: `1px solid ${C.g2}`,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          flexShrink: 0,
        }}>
          <button
            onClick={handleBackBtn}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.g5,
              fontSize: 13,
              fontFamily: F,
              padding: "4px 8px",
              borderRadius: 6,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.g1; e.currentTarget.style.color = C.g6; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.g5; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>

          {/* ── Idle / Error state ── */}
          {(uploadState === "idle" || isErrorState) && (
            <>
              <h1 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: C.g6 }}>
                Upload a document
              </h1>
              <p style={{ margin: "0 0 32px", fontSize: 13, color: C.g4, textAlign: "center" }}>
                We'll extract sections, questions, and scoring automatically.
              </p>

              {isErrorState && errorType && (
                <ErrorBanner errorType={errorType} onRetry={handleRetry} onBack={onBack} />
              )}

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "100%",
                  maxWidth: 520,
                  height: 320,
                  border: `2px dashed ${isDragOver ? C.navy : C.g3}`,
                  borderRadius: 12,
                  background: isDragOver ? C.navy3 : C.white,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.g4} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.g6 }}>
                  Drop your file here
                </div>
                <div style={{ fontSize: 13, color: C.g4 }}>
                  or{" "}
                  <span
                    style={{ color: C.ocean, textDecoration: "underline", cursor: "pointer" }}
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    browse
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pdf,.xlsx"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                    e.target.value = "";
                  }}
                />
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: C.g4 }}>
                Supports .docx, .pdf, .xlsx · Max 25MB
              </div>
            </>
          )}

          {/* ── Uploading state ── */}
          {uploadState === "uploading" && file && (
            <div style={{ width: "100%", maxWidth: 480 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.g6 }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: C.g4 }}>{formatFileSize(file.size)}</div>
                </div>
                <span style={{ fontSize: 12, color: C.g5 }}>Uploading... {uploadProgress}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: C.g2, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  borderRadius: 3,
                  background: C.ocean,
                  width: `${uploadProgress}%`,
                  transition: "width 0.2s",
                }} />
              </div>
              <div style={{ marginTop: 14, textAlign: "center" }}>
                <button
                  onClick={handleCancelUpload}
                  style={{ background: "none", border: "none", color: C.g4, fontSize: 12, cursor: "pointer", fontFamily: F, textDecoration: "underline" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Processing state ── */}
          {uploadState === "processing" && (
            <div style={{ width: "100%", maxWidth: 420 }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: C.g6, textAlign: "center" }}>
                Processing your document
              </h2>
              <p style={{ margin: "0 0 28px", fontSize: 11, color: C.g4, textAlign: "center" }}>
                This usually takes 30–60 seconds.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {PROCESSING_STEPS.map((step, i) => {
                  const isDone = processingStep > i;
                  const isActive = processingStep === i;
                  const isPending = processingStep < i;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Step icon */}
                      {isDone && (
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                      {isActive && (
                        <div style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: C.navy,
                          flexShrink: 0,
                          animation: "pulse-ring 1.4s ease-in-out infinite",
                        }} />
                      )}
                      {isPending && (
                        <div style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          border: `2px solid ${C.g3}`,
                          flexShrink: 0,
                        }} />
                      )}
                      <span style={{
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: isDone ? C.teal : isActive ? C.navy : C.g4,
                        fontFamily: F,
                      }}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 28, textAlign: "center" }}>
                <button
                  onClick={() => setShowCancelModal(true)}
                  style={{ background: "none", border: "none", color: C.g4, fontSize: 12, cursor: "pointer", fontFamily: F, textDecoration: "underline" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Success state ── */}
          {uploadState === "success" && (
            <div style={{ textAlign: "center", fontFamily: F }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: C.greenBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: C.g6 }}>
                Your template is ready
              </h2>
              <p style={{ margin: "0 0 24px", fontSize: 13, color: C.g5 }}>
                We extracted 4 sections and 23 questions.
              </p>
              <button
                onClick={() => {
                  if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
                  onComplete({ routeOrigin: "upload", sectionsFound: 4, questionsFound: 23 });
                }}
                style={{
                  background: C.navy,
                  color: C.white,
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 24px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: F,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.navy2; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = C.navy; }}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CancelProcessingModal */}
      {showCancelModal && (
        <CancelProcessingModal
          onConfirm={handleCancelProcessingConfirm}
          onCancel={() => setShowCancelModal(false)}
        />
      )}

      {/* SwitchRouteModal */}
      {showSwitchModal && (
        <SwitchRouteModal
          onSave={() => { console.log("Draft saved before switch"); setShowSwitchModal(false); onBack(); }}
          onDiscard={() => { setShowSwitchModal(false); onBack(); }}
          onCancel={() => setShowSwitchModal(false)}
        />
      )}
    </>
  );
}
