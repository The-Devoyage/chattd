// src/hooks/useFullscreen.ts
import { useEffect, useState, useCallback } from "react";
import { getCurrentWindow} from "@tauri-apps/api/window";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const appWindow = getCurrentWindow(); // v2 way to get current window

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const fs = await appWindow.isFullscreen();
        if (mounted) setIsFullscreen(fs);
      } catch {
        // ignore errors (may be running in non-tauri context)
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      const current = await appWindow.isFullscreen();
      await appWindow.setFullscreen(!current);
      setIsFullscreen(!current);
    } catch (err) {
      console.error("toggleFullscreen error:", err);
    }
  }, []);

  const setFullscreen = useCallback(async (on: boolean) => {
    try {
      await appWindow.setFullscreen(on);
      setIsFullscreen(on);
    } catch (err) {
      console.error("setFullscreen error:", err);
    }
  }, []);

  return { isFullscreen, toggleFullscreen, setFullscreen };
}
