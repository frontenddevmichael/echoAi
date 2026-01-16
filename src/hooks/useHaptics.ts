import { useCallback, useEffect, useState } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection' | 'thinking';

interface HapticOptions {
  pattern: HapticPattern;
  duration?: number;
}

const vibrationPatterns: Record<HapticPattern, number[]> = {
  light: [10],
  medium: [20],
  heavy: [40],
  success: [10, 50, 20],
  error: [50, 30, 50],
  warning: [30, 20, 30],
  selection: [5],
  thinking: [10, 100, 10, 100, 10],
};

export function useHaptics() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('vibrate' in navigator);
    
    // Load preference from localStorage
    const stored = localStorage.getItem('echo-haptics-enabled');
    if (stored !== null) {
      setIsEnabled(stored === 'true');
    }
  }, []);

  const trigger = useCallback(
    ({ pattern, duration }: HapticOptions) => {
      if (!isEnabled || !isSupported) return;

      const vibrationPattern = vibrationPatterns[pattern];
      
      try {
        if (duration && pattern === 'thinking') {
          // Repeat pattern for duration
          const repeatCount = Math.ceil(duration / 300);
          const repeatedPattern = Array(repeatCount)
            .fill(vibrationPattern)
            .flat();
          navigator.vibrate(repeatedPattern);
        } else {
          navigator.vibrate(vibrationPattern);
        }
      } catch (e) {
        console.warn('Haptic feedback failed:', e);
      }
    },
    [isEnabled, isSupported]
  );

  const triggerLight = useCallback(() => trigger({ pattern: 'light' }), [trigger]);
  const triggerMedium = useCallback(() => trigger({ pattern: 'medium' }), [trigger]);
  const triggerHeavy = useCallback(() => trigger({ pattern: 'heavy' }), [trigger]);
  const triggerSuccess = useCallback(() => trigger({ pattern: 'success' }), [trigger]);
  const triggerError = useCallback(() => trigger({ pattern: 'error' }), [trigger]);
  const triggerWarning = useCallback(() => trigger({ pattern: 'warning' }), [trigger]);
  const triggerSelection = useCallback(() => trigger({ pattern: 'selection' }), [trigger]);
  const triggerThinking = useCallback((duration: number = 2000) => trigger({ pattern: 'thinking', duration }), [trigger]);

  const toggle = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    localStorage.setItem('echo-haptics-enabled', String(enabled));
  }, []);

  const stop = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(0);
    }
  }, [isSupported]);

  return {
    isEnabled,
    isSupported,
    trigger,
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerError,
    triggerWarning,
    triggerSelection,
    triggerThinking,
    toggle,
    stop,
  };
}
