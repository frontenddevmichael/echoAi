import { useCallback, useEffect, useState } from 'react';

/**
 * Refined haptic feedback hook
 * 
 * Design principles:
 * - Haptics should be rare, subtle, and intentional
 * - Only trigger on meaningful completions, not transitions
 * - Never use repetitive or noisy patterns
 */

type HapticPattern = 'light' | 'medium' | 'confirmation' | 'error' | 'success' | 'warning' | 'selection';

const vibrationPatterns: Record<HapticPattern, number[]> = {
  // Nearly imperceptible tap - for selections
  light: [8],
  // Gentle tap - for actions
  medium: [15],
  // Single subtle pulse - ONLY for AI generation complete
  confirmation: [10],
  // Slightly longer for errors
  error: [25],
  // Aliases for backward compatibility
  success: [10],
  warning: [15],
  selection: [8],
};

export function useHaptics() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('vibrate' in navigator);
    
    const stored = localStorage.getItem('echo-haptics-enabled');
    if (stored !== null) {
      setIsEnabled(stored === 'true');
    }
  }, []);

  const trigger = useCallback(
    (patternOrConfig: HapticPattern | { pattern: HapticPattern }) => {
      if (!isEnabled || !isSupported) return;

      const pattern = typeof patternOrConfig === 'string' 
        ? patternOrConfig 
        : patternOrConfig.pattern;
      
      const vibrationPattern = vibrationPatterns[pattern];
      
      try {
        navigator.vibrate(vibrationPattern);
      } catch (e) {
        // Silently fail - haptics are non-critical
      }
    },
    [isEnabled, isSupported]
  );

  // Core haptic triggers
  const triggerLight = useCallback(() => trigger('light'), [trigger]);
  const triggerMedium = useCallback(() => trigger('medium'), [trigger]);
  
  // Refined: Only for AI completion - subtle single pulse
  const triggerConfirmation = useCallback(() => trigger('confirmation'), [trigger]);
  
  const triggerError = useCallback(() => trigger('error'), [trigger]);

  // Legacy aliases (keep for backward compatibility, map to refined patterns)
  const triggerSuccess = triggerConfirmation;
  const triggerWarning = triggerMedium;
  const triggerSelection = triggerLight;
  const triggerHeavy = triggerMedium;

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
    triggerConfirmation,
    toggle,
    stop,
  };
}
