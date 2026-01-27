import { useState, useCallback, useEffect, useRef } from 'react';

interface UseFullscreenOptions {
  onEnter?: () => void;
  onExit?: () => void;
}

interface UseFullscreenReturn {
  isFullscreen: boolean;
  isSupported: boolean;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useFullscreen(options?: UseFullscreenOptions): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if Fullscreen API is supported
  const isSupported = typeof document !== 'undefined' &&
    (document.fullscreenEnabled ||
     (document as any).webkitFullscreenEnabled ||
     (document as any).mozFullScreenEnabled ||
     (document as any).msFullscreenEnabled);

  // Handle fullscreen change events from browser API
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      const newIsFullscreen = !!fullscreenElement;
      setIsFullscreen(newIsFullscreen);

      if (newIsFullscreen) {
        options?.onEnter?.();
      } else {
        options?.onExit?.();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [options]);

  // Handle ESC key for CSS-based fullscreen fallback
  useEffect(() => {
    if (!isFullscreen || isSupported) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        options?.onExit?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isSupported, options]);

  const enterFullscreen = useCallback(async () => {
    const element = containerRef.current || document.documentElement;

    if (isSupported) {
      try {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
          await (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        }
      } catch {
        // Fallback to CSS-based fullscreen
        setIsFullscreen(true);
        options?.onEnter?.();
      }
    } else {
      // CSS-based fullscreen
      setIsFullscreen(true);
      options?.onEnter?.();
    }
  }, [isSupported, options]);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      } catch {
        setIsFullscreen(false);
        options?.onExit?.();
      }
    } else {
      setIsFullscreen(false);
      options?.onExit?.();
    }
  }, [options]);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen,
    isSupported,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    containerRef,
  };
}

export default useFullscreen;
