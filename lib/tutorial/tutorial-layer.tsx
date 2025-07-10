'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TutorialStep } from './types';
import { useElementTracking, useTutorialCleanup } from './hooks';
import { AdvancedZIndexManager } from './z-index-manager';

interface TutorialLayerProps {
  step: TutorialStep;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

// Enhanced overlay component with SVG spotlight
const TutorialOverlay: React.FC<{
  type: 'dark' | 'transparent' | 'spotlight';
  target?: string;
  spotlightPadding?: number;
}> = React.memo(({ type, target, spotlightPadding = 8 }) => {
  const { bounds, isVisible } = useElementTracking(target || '', {
    debounceMs: 50
  });
  
  const [forcedBounds, setForcedBounds] = React.useState<DOMRect | null>(null);
  
  // Force bounds calculation for tab content
  React.useEffect(() => {
    if (!target) return;
    
    const checkElementBounds = () => {
      const element = document.querySelector(target);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setForcedBounds(rect);
          console.log('[TutorialOverlay] Forced bounds for', target, rect);
        }
      }
    };
    
    checkElementBounds();
    const interval = setInterval(checkElementBounds, 200); // Reduced frequency
    return () => clearInterval(interval);
  }, [target]);
  
  // Use forced bounds if available, fallback to tracked bounds
  const actualBounds = forcedBounds || bounds;

  // Memoize expensive calculations
  const overlayStyle = useMemo(() => {
    if (type === 'transparent') {
      return { opacity: 0 };
    }
    
    if (type !== 'spotlight' || !actualBounds) {
      return { 
        background: 'rgba(0, 0, 0, 0.7)',
        position: 'fixed' as const,
        inset: 0,
        zIndex: 1000, // --z-tutorial-backdrop
        pointerEvents: 'auto' as const // Block interactions for non-spotlight overlays
      };
    }

    return {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 1000, // --z-tutorial-backdrop
      background: 'transparent',
      pointerEvents: 'auto' as const // We'll handle pointer events in the SVG
    };
  }, [type, actualBounds]);

  // Create click handler to block interactions outside spotlight
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (type === 'spotlight' && target) {
      e.preventDefault();
      e.stopPropagation();
      // Add a subtle shake animation to indicate blocked interaction
      const targetElement = document.querySelector(target);
      if (targetElement) {
        targetElement.classList.add('tutorial-highlight-pulse');
        setTimeout(() => {
          targetElement.classList.remove('tutorial-highlight-pulse');
        }, 600);
      }
    }
  }, [type, target]);

  if (!isVisible && target && !forcedBounds) return null;

  // For spotlight, use SVG mask approach with interaction blocking
  if (type === 'spotlight' && actualBounds) {
    console.log('[TutorialOverlay] Rendering spotlight for', target, { actualBounds, usingForcedBounds: !!forcedBounds });
    
    return (
      <>
        {/* Visual overlay with SVG mask - no pointer events */}
        <div style={{ ...overlayStyle, pointerEvents: 'none' }}>
          <svg 
            style={{ position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: 'none' }} // --z-tutorial-backdrop
            width="100%" 
            height="100%"
          >
            <defs>
              <mask id={`spotlight-mask-${target?.replace(/[^a-zA-Z0-9]/g, '')}`}>
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={actualBounds.x - spotlightPadding}
                  y={actualBounds.y - spotlightPadding}
                  width={actualBounds.width + spotlightPadding * 2}
                  height={actualBounds.height + spotlightPadding * 2}
                  rx={4}
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.7)"
              mask={`url(#spotlight-mask-${target?.replace(/[^a-zA-Z0-9]/g, '')})`}
            />
          </svg>
        </div>
        
        {/* Click blocking areas - four rectangles around the spotlight */}
        {/* Top area */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: actualBounds.y - spotlightPadding,
            zIndex: 1000, // --z-tutorial-backdrop
            pointerEvents: 'auto',
            background: 'transparent'
          }}
          onClick={handleOverlayClick}
          onMouseDown={handleOverlayClick}
        />
        
        {/* Bottom area */}
        <div
          style={{
            position: 'fixed',
            top: actualBounds.y + actualBounds.height + spotlightPadding,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000, // --z-tutorial-backdrop
            pointerEvents: 'auto',
            background: 'transparent'
          }}
          onClick={handleOverlayClick}
          onMouseDown={handleOverlayClick}
        />
        
        {/* Left area */}
        <div
          style={{
            position: 'fixed',
            top: actualBounds.y - spotlightPadding,
            left: 0,
            width: actualBounds.x - spotlightPadding,
            height: actualBounds.height + spotlightPadding * 2,
            zIndex: 1000, // --z-tutorial-backdrop
            pointerEvents: 'auto',
            background: 'transparent'
          }}
          onClick={handleOverlayClick}
          onMouseDown={handleOverlayClick}
        />
        
        {/* Right area */}
        <div
          style={{
            position: 'fixed',
            top: actualBounds.y - spotlightPadding,
            left: actualBounds.x + actualBounds.width + spotlightPadding,
            right: 0,
            height: actualBounds.height + spotlightPadding * 2,
            zIndex: 1000, // --z-tutorial-backdrop
            pointerEvents: 'auto',
            background: 'transparent'
          }}
          onClick={handleOverlayClick}
          onMouseDown={handleOverlayClick}
        />
      </>
    );
  }

  return (
    <div style={overlayStyle} />
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.type === nextProps.type &&
    prevProps.target === nextProps.target &&
    prevProps.spotlightPadding === nextProps.spotlightPadding
  );
});

TutorialOverlay.displayName = 'TutorialOverlay';

// Tutorial highlight component for golden border
const TutorialHighlight: React.FC<{
  target: string;
  padding?: number;
}> = React.memo(({ target, padding = 8 }) => {
  const { bounds, isVisible } = useElementTracking(target, {
    debounceMs: 50
  });

  // For tab content, we need to check if the element exists even if not visible
  const [elementExists, setElementExists] = React.useState(false);
  const [forcedBounds, setForcedBounds] = React.useState<DOMRect | null>(null);
  
  React.useEffect(() => {
    const checkElement = () => {
      const element = document.querySelector(target);
      const exists = !!element;
      setElementExists(exists);
      
      // For tab content, force bounds calculation
      if (exists && element) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setForcedBounds(rect);
          console.log('[TutorialHighlight] Forced bounds for', target, rect);
        }
      }
    };
    
    checkElement();
    const interval = setInterval(checkElement, 200); // Reduced frequency
    return () => clearInterval(interval);
  }, [target]);

  // Don't render if element doesn't exist
  if (!elementExists) {
    console.log('[TutorialHighlight] Element does not exist:', target);
    return null;
  }

  // Use forced bounds if available, fallback to tracked bounds
  const actualBounds = forcedBounds || bounds;

  // For tab content, be more aggressive about showing highlights
  if (!actualBounds) {
    console.log('[TutorialHighlight] No bounds available for:', target, { bounds, forcedBounds, isVisible });
    return null;
  }

  console.log('[TutorialHighlight] Rendering highlight for:', target, { 
    actualBounds, 
    isVisible, 
    elementExists,
    usingForcedBounds: !!forcedBounds 
  });

  // Mobile-only clamp (<= 640px) so highlight never starts off-screen
  const isNarrowMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const gutter = 8;
  let left = actualBounds.x - padding;
  let top = actualBounds.y - padding;
  let width = actualBounds.width + padding * 2;
  let height = actualBounds.height + padding * 2;

  if (isNarrowMobile) {
    // Ensure a small left gutter
    if (left < gutter) {
      width -= gutter - left;
      left = gutter;
    }
    // Prevent overflow on right side
    if (left + width > window.innerWidth - gutter) {
      width = window.innerWidth - gutter - left;
    }
    // Similar protection on top / bottom is rarely needed; add if desired
  }

  return (
    <div
      className="tutorial-highlight-border"
      style={{
        position: 'fixed',
        top,
        left,
        width,
        height,
        border: '3px solid #f2b418',
        borderRadius: '8px',
        boxShadow: '0 0 20px rgba(242, 180, 24, 0.5), inset 0 0 20px rgba(242, 180, 24, 0.1)',
        pointerEvents: 'none',
        zIndex: 3001, // --z-tutorial-prompts + 1 for highlights
        animation: 'tutorial-highlight-pulse 2s ease-in-out infinite',
        transition: 'all 0.3s ease-in-out'
      }}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.target === nextProps.target &&
    prevProps.padding === nextProps.padding
  );
});

TutorialHighlight.displayName = 'TutorialHighlight';

// Tutorial prompt component
const TutorialPrompt: React.FC<{
  step: TutorialStep;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}> = ({ step, onNext, onPrevious, onSkip }) => {
  const router = useRouter();
  const { bounds } = useElementTracking(step.targetElementSelector);
  const [forcedBounds, setForcedBounds] = React.useState<DOMRect | null>(null);
  
  // Force bounds calculation for tab content
  React.useEffect(() => {
    const checkElementBounds = () => {
      const element = document.querySelector(step.targetElementSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setForcedBounds(rect);
          console.log('[TutorialPrompt] Forced bounds for', step.targetElementSelector, rect);
        }
      }
    };
    
    checkElementBounds();
    const interval = setInterval(checkElementBounds, 200); // Reduced frequency
    return () => clearInterval(interval);
  }, [step.targetElementSelector]);
  
  // Use forced bounds if available, fallback to tracked bounds
  const actualBounds = forcedBounds || bounds;
  
  // Calculate prompt position
  const promptStyle = useMemo(() => {
    if (step.isModal || !actualBounds) {
      console.log('[TutorialPrompt] Using modal positioning for:', step.id, { 
        isModal: step.isModal, 
        hasActualBounds: !!actualBounds,
        bounds,
        forcedBounds 
      });
      // Center modal
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 3002, // --z-tutorial-prompts + 2 for prompts (highest)
        pointerEvents: 'auto' as const
      };
    }

    console.log('[TutorialPrompt] Using relative positioning for:', step.id, { 
      actualBounds, 
      placement: step.promptPlacement,
      usingForcedBounds: !!forcedBounds 
    });

    // Position relative to target element
    const isNarrowMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const placement = isNarrowMobile
      ? step.mobilePromptPlacement || step.promptPlacement || 'bottom'
      : step.promptPlacement || 'bottom';
    const padding = 16;
    const viewportWidth = window.innerWidth;
    // Match the CSS constraint: min(28rem, calc(100vw - 2rem))
    const promptWidth = Math.min(448, viewportWidth - 32); // 28rem = 448px, 2rem = 32px
    const promptHeight = 260; // better estimate to avoid clipping on mobile
    
    let top = 0;
    let left = 0;
    let transform = '';

    // Get viewport dimensions
    const viewportHeight = window.innerHeight;

    switch (placement) {
      case 'top':
        top = actualBounds.top - padding;
        left = actualBounds.left + actualBounds.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = actualBounds.bottom + padding;
        left = actualBounds.left + actualBounds.width / 2;
        transform = 'translate(-50%, 0)';
        break;
      case 'bottom-end':
        top = actualBounds.bottom + padding;
        left = actualBounds.right;
        transform = 'translate(-100%, 0)';
        break;
      case 'bottom-start':
        top = actualBounds.bottom + padding;
        left = actualBounds.left;
        transform = 'translate(0, 0)';
        break;
      case 'top-end':
        top = actualBounds.top - padding;
        left = actualBounds.right;
        transform = 'translate(-100%, -100%)';
        break;
      case 'top-start':
        top = actualBounds.top - padding;
        left = actualBounds.left;
        transform = 'translate(0, -100%)';
        break;
      case 'left':
        top = actualBounds.top + actualBounds.height / 2;
        left = actualBounds.left - padding;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        top = actualBounds.top + actualBounds.height / 2;
        left = actualBounds.right + padding;
        transform = 'translate(0, -50%)';
        break;
      case 'center':
      default:
        top = actualBounds.top + actualBounds.height / 2;
        left = actualBounds.left + actualBounds.width / 2;
        transform = 'translate(-50%, -50%)';
        break;
    }

    // Simple viewport boundary checks to prevent offscreen positioning
    const minPadding = 16;
    
    // Check horizontal bounds
    if (left < minPadding) {
      left = minPadding;
      transform = transform.replace(/-?\d+%/, '0');
    } else if (left + promptWidth > viewportWidth - minPadding) {
      left = viewportWidth - promptWidth - minPadding;
      transform = transform.replace(/-?\d+%/, '0');
    }
    
    // Check vertical bounds
    if (top < minPadding) {
      top = minPadding;
      transform = transform.replace(/,\s*-?\d+%/, ', 0');
    } else if (top + promptHeight > viewportHeight - minPadding) {
      top = viewportHeight - promptHeight - minPadding;
      transform = transform.replace(/,\s*-?\d+%/, ', 0');
    }

    return {
      position: 'fixed' as const,
      top,
      left,
      transform,
      zIndex: 3002, // --z-tutorial-prompts + 2 for prompts (highest)
      pointerEvents: 'auto' as const
    };
  }, [actualBounds, step.isModal, step.promptPlacement, step.mobilePromptPlacement, bounds, forcedBounds]);

  return (
    <div 
      style={promptStyle}
      className="tutorial-prompt bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-6 max-w-md transition-all duration-300 ease-in-out"
    >
      {step.title && (
        <h3 className="text-lg font-semibold mb-2 text-white">{step.title}</h3>
      )}
      <div className="mb-4">
        {typeof step.content === 'string' ? (
          <p className="text-white">{step.content}</p>
        ) : (
          step.content
        )}
      </div>
      <div className="flex gap-2 justify-end">
        {step.showPreviousButton && (
          <button
            onClick={onPrevious}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
          >
            Previous
          </button>
        )}
        {step.showSkipButton && (
          <button
            onClick={onSkip}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            {step.id === 'tutorial-complete' ? 'Exit' : 'Skip'}
          </button>
        )}
        {step.showNextButton !== false && (
          <button
            onClick={() => {
              // Special handling for marketplace-navigation step
              if (step.id === 'marketplace-navigation') {
                console.log('[Tutorial Layer] Marketplace navigation - navigating to /marketplace and advancing tutorial');
                // Use Next.js router for client-side navigation to maintain state
                router.push('/marketplace');
                // Advance tutorial after navigation
                setTimeout(() => {
                  onNext();
                }, 100);
              } else {
                // Regular next behavior
                onNext();
              }
            }}
            data-tutorial-id="prompt-next-button"
            className="px-4 py-2 bg-[#f2b418] hover:bg-[#d99f15] text-black rounded transition-colors font-medium"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export const TutorialLayer: React.FC<TutorialLayerProps> = ({ 
  step, 
  onNext, 
  onPrevious, 
  onSkip 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const zIndexManagerRef = useRef<AdvancedZIndexManager | undefined>(undefined);
  const { registerCleanup } = useTutorialCleanup();
  const prevStepIdRef = useRef<string | null>(null);

  // Initialize z-index manager
  useEffect(() => {
    if (!zIndexManagerRef.current) {
      zIndexManagerRef.current = new AdvancedZIndexManager();
    }
  }, []);

  // Handle step transitions with animation
  useEffect(() => {
    const currentStepId = step.id;
    const prevStepId = prevStepIdRef.current;

    // If this is a step change (not initial load), add transition
    if (prevStepId && prevStepId !== currentStepId) {
      setIsTransitioning(true);
      setIsVisible(false);

      // Wait for fade out, then fade in
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setIsVisible(true);
      }, 150);

      prevStepIdRef.current = currentStepId;
      return () => clearTimeout(timer);
    } else {
      // Initial load or same step
      prevStepIdRef.current = currentStepId;
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [step.id]);

  // Handle z-index overrides
  useEffect(() => {
    if (!step.zIndexOverrides || !zIndexManagerRef.current) return;

    // Apply z-index overrides
    step.zIndexOverrides.forEach(override => {
      zIndexManagerRef.current!.elevate(override);
    });

    // Register cleanup
    registerCleanup(() => {
      step.zIndexOverrides?.forEach(override => {
        zIndexManagerRef.current?.restore(override.selector);
      });
    });

    return () => {
      // Cleanup on step change
      step.zIndexOverrides?.forEach(override => {
        zIndexManagerRef.current?.restore(override.selector);
      });
    };
  }, [step.zIndexOverrides, registerCleanup]);

  // Lifecycle hooks
  useEffect(() => {
    // Execute onBeforeShow
    if (step.onBeforeShow) {
      Promise.resolve(step.onBeforeShow()).catch(console.error);
    }

    return () => {
      // Execute onAfterShow
      if (step.onAfterShow) {
        Promise.resolve(step.onAfterShow()).catch(console.error);
      }
    };
  }, [step.id, step.onBeforeShow, step.onAfterShow]);

  // Determine overlay type
  const overlayType = step.overlayType || 
    (step.useTransparentOverlay ? 'transparent' : 
     (step.targetElementSelector !== 'body' ? 'spotlight' : 'dark'));

  return (
    <div className={`tutorial-layer ${isVisible && !isTransitioning ? 'visible' : ''}`}>
      <TutorialOverlay
        type={overlayType}
        target={step.targetElementSelector !== 'body' ? step.targetElementSelector : undefined}
        spotlightPadding={step.spotlightPadding || step.highlightPadding}
      />
      {/* Add golden border highlight for non-modal steps */}
      {step.targetElementSelector !== 'body' && !step.isModal && (
        <TutorialHighlight
          target={step.targetElementSelector}
          padding={step.spotlightPadding || step.highlightPadding || 8}
        />
      )}
      <TutorialPrompt
        step={step}
        onNext={onNext}
        onPrevious={onPrevious}
        onSkip={onSkip}
      />
    </div>
  );
}; 