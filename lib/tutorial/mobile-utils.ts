/**
 * Mobile detection and responsive utilities for tutorial system
 */

// Mobile breakpoint (1024px - same as Tailwind's lg breakpoint)
const MOBILE_BREAKPOINT = 1024;

/**
 * Check if the current viewport is mobile-sized
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * Hook to detect mobile viewport with reactive updates
 */
export function useMobileDetection() {
  const [isMobile, setIsMobile] = React.useState(() => {
    // More conservative initial state for SSR
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });
  
  React.useEffect(() => {
    function handleResize() {
      const newIsMobile = isMobileViewport();
      console.log('[Mobile Detection] Resize detected:', {
        width: window.innerWidth,
        isMobile: newIsMobile,
        breakpoint: MOBILE_BREAKPOINT
      });
      setIsMobile(newIsMobile);
    }

    // Initial check on mount
    const initialIsMobile = isMobileViewport();
    console.log('[Mobile Detection] Initial mount:', {
      width: window.innerWidth,
      isMobile: initialIsMobile,
      breakpoint: MOBILE_BREAKPOINT
    });
    setIsMobile(initialIsMobile);

    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
}

/**
 * Get mobile-optimized tutorial step properties
 */
export function getMobileAdaptedStep(step: import('./types').TutorialStep): import('./types').TutorialStep {
  if (!isMobileViewport()) return step;
  
  return {
    ...step,
    // Use mobile overrides if available
    promptPlacement: step.mobilePromptPlacement || getMobileFriendlyPlacement(step.promptPlacement),
    content: step.mobileContent || step.content,
    spotlightPadding: step.mobileSpotlightPadding || getMobileSpotlightPadding(step.spotlightPadding),
    targetElementSelector: step.mobileTargetSelector || step.targetElementSelector,
  };
}

/**
 * Convert desktop prompt placements to mobile-friendly alternatives
 */
function getMobileFriendlyPlacement(placement?: string): 'top' | 'bottom' | 'left' | 'right' | 'center' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end' {
  if (!placement) return 'center';
  
  const mobilePlacementMap: Record<string, 'top' | 'bottom' | 'left' | 'right' | 'center' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'> = {
    'left': 'bottom',
    'right': 'bottom', 
    'left-start': 'bottom',
    'left-end': 'bottom',
    'right-start': 'bottom',
    'right-end': 'bottom',
    'bottom-end': 'bottom',
    'top-end': 'top',
    // Keep these as-is for mobile
    'top': 'top',
    'bottom': 'bottom',
    'center': 'center',
    'top-start': 'top',
    'bottom-start': 'bottom',
  };
  
  return mobilePlacementMap[placement] || 'bottom';
}

/**
 * Get mobile-optimized spotlight padding
 */
function getMobileSpotlightPadding(desktopPadding?: number): number {
  const defaultMobilePadding = 16; // Larger touch targets
  
  if (!desktopPadding) return defaultMobilePadding;
  
  // Increase padding by 4px for better touch targets
  return Math.max(desktopPadding + 4, defaultMobilePadding);
}

/**
 * Check if an element is likely a mobile menu/hamburger button
 */
export function isMobileMenuButton(element: Element): boolean {
  const mobileMenuSelectors = [
    '[data-tutorial-id*="mobile-menu"]',
    '[data-tutorial-id*="hamburger"]',
    'button[aria-label*="menu"]',
    'button[aria-label*="Menu"]',
    '.mobile-menu-button',
    '.hamburger-button'
  ];
  
  return mobileMenuSelectors.some(selector => element.matches(selector));
}

/**
 * Wait for mobile navigation elements to be ready
 */
export async function waitForMobileNavigation(): Promise<void> {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 20;
    
    const checkNavigation = () => {
      attempts++;
      
      // Look for mobile menu or hamburger button
      const mobileMenuButton = document.querySelector('[data-tutorial-id*="mobile-menu"], [data-tutorial-id*="hamburger"], button[aria-label*="menu" i]');
      
      if (mobileMenuButton || attempts >= maxAttempts) {
        resolve();
      } else {
        setTimeout(checkNavigation, 100);
      }
    };
    
    checkNavigation();
  });
}

// Re-export React for the hook
import React from 'react'; 