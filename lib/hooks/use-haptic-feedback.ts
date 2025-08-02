'use client';

interface HapticOptions {
  type?: 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification';
  intensity?: number; // 0-1 for custom intensity
}

export function useHapticFeedback() {
  const triggerHaptic = (options: HapticOptions = {}) => {
    const { type = 'light', intensity = 0.5 } = options;

    // Check if device supports haptics
    if (typeof window === 'undefined') return;

    try {
      // Modern Vibration API for web
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30],
          selection: [5],
          impact: [15],
          notification: [10, 50, 10]
        };
        
        navigator.vibrate(patterns[type] || patterns.light);
      }

      // iOS haptic feedback (if available)
      if ('Taptic' in window) {
        // @ts-ignore - iOS specific API
        window.Taptic.impact({ style: type });
      }

      // Android haptic feedback (if available)
      if ('Android' in window && typeof (window as any).Android.hapticFeedback === 'function') {
        // @ts-ignore - Android specific API
        window.Android.hapticFeedback(type);
      }

      // Web Gamepad API haptic feedback (for supported gamepads)
      if ('getGamepads' in navigator) {
        const gamepads = navigator.getGamepads();
        for (const gamepad of gamepads) {
          if (gamepad && 'vibrationActuator' in gamepad && gamepad.vibrationActuator) {
            gamepad.vibrationActuator.playEffect('dual-rumble', {
              duration: 100,
              strongMagnitude: intensity,
              weakMagnitude: intensity * 0.5
            });
          }
        }
      }
    } catch (error) {
      // Silently fail if haptics aren't supported
      console.debug('Haptic feedback not supported:', error);
    }
  };

  return {
    triggerHaptic,
    // Convenience methods
    light: () => triggerHaptic({ type: 'light' }),
    medium: () => triggerHaptic({ type: 'medium' }),
    heavy: () => triggerHaptic({ type: 'heavy' }),
    selection: () => triggerHaptic({ type: 'selection' }),
    impact: () => triggerHaptic({ type: 'impact' }),
    notification: () => triggerHaptic({ type: 'notification' }),
    
    // Check if haptics are supported
    isSupported: () => {
      if (typeof window === 'undefined') return false;
      return 'vibrate' in navigator || 'Taptic' in window;
    }
  };
}