// Shared accessibility utilities for Template Wizard
import { useEffect } from "react";

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab/Shift+Tab within `ref`, focuses first focusable child on mount,
 * and calls `onEscape` when Escape is pressed.
 */
export function useFocusTrap(ref, onEscape) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Focus first focusable element
    const focusable = Array.from(el.querySelectorAll(FOCUSABLE)).filter(
      n => !n.disabled && n.offsetParent !== null
    );
    if (focusable.length) focusable[0].focus();

    const onKeyDown = e => {
      if (e.key === "Escape") { onEscape?.(); return; }
      if (e.key !== "Tab") return;
      if (focusable.length === 0) { e.preventDefault(); return; }
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || !el.contains(document.activeElement)) {
          e.preventDefault(); last.focus();
        }
      } else {
        if (document.activeElement === last || !el.contains(document.activeElement)) {
          e.preventDefault(); first.focus();
        }
      }
    };

    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  });
}
