// src/components/FullscreenButton.tsx
import React, { useEffect } from "react";
import { useFullscreen } from "../../../../hooks/useFullscreen";
import { Expand, Shrink } from "lucide-react";

/**
 * FullscreenButton - shows a toggle button and listens for F11.
 * Note: some Linux desktop environments intercept F11. If the listener doesn't fire,
 * use a native menu accelerator (Rust) or a different key binding.
 */
export const FullscreenButton: React.FC = () => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      // Use code or key to be more robust; some browsers/DEs differ.
      if (e.key === "F11" || e.code === "F11") {
        // Prevent browser / DE default behavior where applicable
        e.preventDefault();
        e.stopPropagation();
        try {
          await toggleFullscreen();
        } catch (err) {
          console.error("Failed to toggle fullscreen via keyboard:", err);
        }
      }
    };

    // Attach to window so it behaves across the app; use capture to try to catch earlier
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [toggleFullscreen]);

  return (
    <button
      onClick={toggleFullscreen}
      aria-pressed={isFullscreen}
      title={isFullscreen ? "Exit fullscreen (F11)" : "Enter fullscreen (F11)"}
      className="text-slate-600 hover:text-slate-200 transition-all cursor-pointer"
    >
      {isFullscreen ? <Shrink className="h-4" /> : <Expand className="h-4" />}
    </button>
  );
};
