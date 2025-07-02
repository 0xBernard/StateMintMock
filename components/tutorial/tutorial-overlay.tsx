'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTutorialStore } from '@/lib/tutorial/store';
import { useTutorial } from './tutorial-provider';
import { Button } from '@/components/ui/button';

interface PromptPosition {
  top: number;
  left: number;
  placement: string;
}

interface InteractiveElement {
  element: HTMLElement;
  rect: DOMRect;
  id: string;
}

export function TutorialOverlay(): React.JSX.Element | null {
  const { 
    nextStep,
    stopTutorial 
  } = useTutorialStore();
  
  const { isActive: isTutorialActive, currentStep: activeStepConfig, isMobile } = useTutorial();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [interactiveElements, setInteractiveElements] = useState<InteractiveElement[]>([]);
  const [promptPosition, setPromptPosition] = useState<PromptPosition | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Create portal container
  useEffect(() => {
    if (!isTutorialActive) return;

    let container = document.getElementById('tutorial-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tutorial-root';
      document.body.appendChild(container);
    }
    setPortalContainer(container);

    return () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, [isTutorialActive]);

  // Add scroll event listener to update positioning
  useEffect(() => {
    if (!isTutorialActive || !activeStepConfig) return;

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      // Debounce scroll updates for performance
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Update target rect when scrolling
        if (targetElement) {
          const newRect = targetElement.getBoundingClientRect();
          setTargetRect(newRect);
        }
        
        // Update interactive element rects
        const updatedInteractives = interactiveElements.map(item => ({
          ...item,
          rect: item.element.getBoundingClientRect()
        }));
        setInteractiveElements(updatedInteractives);
      }, 16); // ~60fps update rate
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isTutorialActive, activeStepConfig, targetElement, interactiveElements]);

  // Recalculate positions on window resize
  useEffect(() => {
    if (!isTutorialActive) return;

    const handleResize = () => {
      if (targetElement) {
        setTargetRect(targetElement.getBoundingClientRect());
      }
      // Update interactive elements rects
      setInteractiveElements(prev => prev.map(item => ({
        ...item,
        rect: item.element.getBoundingClientRect()
      })));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isTutorialActive, targetElement]);

  // Find target element and interactive elements
  useEffect(() => {
    if (!isTutorialActive || !activeStepConfig) {
        setTargetElement(null);
        setTargetRect(null);
      setInteractiveElements([]);
      return;
    }

    // Add body data attribute for CSS targeting
    if (activeStepConfig.id) {
      document.body.setAttribute('data-tutorial-step', activeStepConfig.id);
    } else {
      document.body.removeAttribute('data-tutorial-step');
    }

    const findElements = () => {
      // Find target element
      let targetEl: HTMLElement | null = null;
      let targetR: DOMRect | null = null;

      if (activeStepConfig.targetElementSelector !== 'body') {
        // First try mobile selector if on mobile
        let selector = activeStepConfig.targetElementSelector;
        if (isMobile && activeStepConfig.mobileTargetSelector) {
          selector = activeStepConfig.mobileTargetSelector;
          console.log(`[Tutorial Debug] Using mobile selector for step ${activeStepConfig.id}: ${selector}`);
        }
        
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          targetEl = element;
          targetR = element.getBoundingClientRect();
          element.classList.add('tutorial-target');
          
          // Debug logging
          console.log(`[Tutorial Debug] Found target element for step ${activeStepConfig.id}:`, {
            selector: selector,
            isMobile: isMobile,
            mobileSelector: activeStepConfig.mobileTargetSelector,
            element: element,
            rect: targetR,
            elementOffset: {
              offsetTop: element.offsetTop,
              offsetLeft: element.offsetLeft,
              scrollTop: element.scrollTop,
              scrollLeft: element.scrollLeft
            },
            windowScroll: {
              scrollX: window.scrollX,
              scrollY: window.scrollY
            }
          });
        } else {
          console.warn(`[Tutorial Debug] Could not find target element for selector: ${selector} (mobile: ${isMobile})`);
        }
      }

      // Find all interactive elements for this step
      const interactives: InteractiveElement[] = [];
      
      // Get interactive elements from the step configuration
      const interactiveSelectors = getInteractiveSelectors(activeStepConfig);
      
      interactiveSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            el.classList.add('tutorial-interactive');
            interactives.push({
              element: el,
              rect,
              id: el.getAttribute('data-tutorial-id') || selector
            });
          }
        });
      });

      setTargetElement(targetEl);
      setTargetRect(targetR);
      setInteractiveElements(interactives);

      // Debug logging for interactive elements
      if (activeStepConfig.id === 'portfolio-overview') {
        console.log(`[Tutorial Debug] Interactive elements found for ${activeStepConfig.id}:`, {
          count: interactives.length,
          elements: interactives.map(item => ({
            id: item.id,
            element: item.element,
            rect: item.rect,
            selector: item.element.getAttribute('data-tutorial-id') || 'no-tutorial-id'
          })),
          selectors: getInteractiveSelectors(activeStepConfig)
        });
      }

      return targetEl || interactives.length > 0;
    };

    // Try to find immediately
    if (!findElements() && activeStepConfig.waitForElement) {
      // Retry mechanism for elements that might load later
      const retries = 10;
      let attempt = 0;
      
      const retry = () => {
        attempt++;
        if (findElements() || attempt >= retries) {
          return;
        }
        setTimeout(retry, 300);
      };
      
      setTimeout(retry, 100);
    }

    // Cleanup
    return () => {
      // Remove tutorial classes
      document.querySelectorAll('.tutorial-target').forEach(el => {
        el.classList.remove('tutorial-target');
      });
      document.querySelectorAll('.tutorial-interactive').forEach(el => {
        el.classList.remove('tutorial-interactive');
      });
    };
  }, [isTutorialActive, activeStepConfig?.id, isMobile]);

  // Calculate prompt position with scroll compensation
  useEffect(() => {
    if (!activeStepConfig) {
      setPromptPosition(null);
      return;
    }

    const placement = (isMobile && activeStepConfig.mobilePromptPlacement) 
      ? activeStepConfig.mobilePromptPlacement 
      : activeStepConfig.promptPlacement || 'bottom';
    const padding = (isMobile && activeStepConfig.mobileSpotlightPadding)
      ? activeStepConfig.mobileSpotlightPadding
      : activeStepConfig.spotlightPadding || activeStepConfig.highlightPadding || 10;
    
    // Responsive prompt sizing - more conservative on mobile
    const promptWidth = (isMobile && window.innerWidth < 1024) ? Math.min(340, window.innerWidth - 40) : 400;
    const promptHeight = 200;
    
    // No scroll compensation needed for fixed-position elements – they are already
    // relative to the viewport. Capture scroll positions only for debug logging.
    const scrollX = 0;
    const scrollY = 0;
    
    const isNarrowMobile = isMobile && window.innerWidth < 640;

    console.log('[Tutorial Debug] Positioning calculation started:', {
      isMobile,
      isNarrowMobile,
      windowWidth: window.innerWidth,
      promptWidth,
      promptHeight,
      stepId: activeStepConfig.id,
      scroll: { x: scrollX, y: scrollY },
      targetRect: targetRect
    });

    let top = 0;
    let left = 0;

    // Use target element for positioning if available, otherwise center
    if (targetRect) {
      // Use viewport coordinates directly (position: fixed is viewport-relative)
      const documentTop = targetRect.top;
      const documentLeft = targetRect.left;
      const documentRight = targetRect.right;
      const documentBottom = targetRect.bottom;
      
      switch (placement) {
        case 'top':
          top = documentTop - promptHeight - padding;
          if (isMobile) {
            left = (window.innerWidth - promptWidth) / 2;
          } else {
            left = documentLeft + (targetRect.width / 2) - (promptWidth / 2);
          }
          break;
        case 'bottom':
          top = documentBottom + padding;
          if (isMobile) {
            left = (window.innerWidth - promptWidth) / 2;
          } else {
            left = documentLeft + (targetRect.width / 2) - (promptWidth / 2);
          }
          break;
        case 'left':
          top = documentTop + (targetRect.height / 2) - (promptHeight / 2);
          left = documentLeft - promptWidth - padding;
          break;
        case 'right':
          top = documentTop + (targetRect.height / 2) - (promptHeight / 2);
          left = documentRight + padding;
          break;
        case 'bottom-end':
          top = documentBottom + padding;
          left = documentRight - promptWidth;
          break;
        case 'center':
        default:
          // Center in current viewport (no scroll compensation needed for center)
          top = Math.max(20, (window.innerHeight / 2) - (promptHeight / 2));
          left = Math.max(20, (window.innerWidth / 2) - (promptWidth / 2));
          break;
      }
      
      // Apply viewport bounds relative to current scroll position
      if (placement !== 'center' && !(isMobile && (placement === 'top' || placement === 'bottom'))) {
        const margin = isMobile && window.innerWidth < 640 ? 8 : 20;
        const minLeft = margin;
        const maxLeft = window.innerWidth - promptWidth - margin;
        const minTop = margin;
        const maxTop = window.innerHeight - promptHeight - margin;
        
        left = Math.max(minLeft, Math.min(left, maxLeft));
        top = Math.max(minTop, Math.min(top, maxTop));
      }
    } else {
      // Center when no target - position in current viewport
      top = Math.max(20, (window.innerHeight / 2) - (promptHeight / 2));
      left = Math.max(20, (window.innerWidth / 2) - (promptWidth / 2));
    }

    console.log(`[Tutorial Debug] Final prompt positioning for step ${activeStepConfig.id}:`, {
      placement,
      scroll: { x: scrollX, y: scrollY },
      finalPosition: { top, left },
      promptDimensions: { width: promptWidth, height: promptHeight },
      targetRect: targetRect,
      documentCoords: targetRect ? {
        top: targetRect.top,
        left: targetRect.left,
        bottom: targetRect.bottom,
        right: targetRect.right
      } : null
    });

    setPromptPosition({ top, left, placement });
  }, [targetRect, activeStepConfig?.promptPlacement, activeStepConfig?.highlightPadding, activeStepConfig?.id]);

  if (!isTutorialActive || !activeStepConfig || !portalContainer) {
    return null;
  }

  const showBackdrop = !activeStepConfig.useTransparentOverlay;
  const isModalStyle = activeStepConfig.isModal || activeStepConfig.targetElementSelector === 'body';

  // Debug logging
  console.log('[Tutorial Debug] TutorialOverlay render:', {
    stepId: activeStepConfig.id,
    showBackdrop,
    useTransparentOverlay: activeStepConfig.useTransparentOverlay,
    targetRect,
    interactiveElements: interactiveElements.length
  });

  return createPortal(
    <>
      {/* Backdrop with holes */}
      {showBackdrop && <BackdropWithHoles interactiveElements={interactiveElements} targetRect={targetRect} activeStepConfig={activeStepConfig} />}

      {/* Target Highlight with scroll compensation */}
      {targetRect && !isModalStyle && activeStepConfig.id !== 'login-completion' && (
        <div
          className="tutorial-highlight"
          style={{
            position: 'fixed',
            top: (() => {
              const padding = (isMobile && activeStepConfig.mobileSpotlightPadding) ? activeStepConfig.mobileSpotlightPadding : activeStepConfig.spotlightPadding || activeStepConfig.highlightPadding || 10;
              return Math.max(0, targetRect.top - padding);
            })(),
            left: (() => {
              const padding = (isMobile && activeStepConfig.mobileSpotlightPadding) ? activeStepConfig.mobileSpotlightPadding : activeStepConfig.spotlightPadding || activeStepConfig.highlightPadding || 10;
              const calculatedLeft = targetRect.left - padding;
              const isNarrowMobile = isMobile && window.innerWidth < 640;
              if (!isNarrowMobile) return Math.max(0, calculatedLeft);

              // For very narrow screens ensure some left gutter & keep highlight centred around target
              const minGutter = 8;
              if (calculatedLeft >= minGutter) return calculatedLeft;

              // Reduce left-padding so highlight fits
              const availableLeft = Math.max(minGutter, targetRect.left);
              return availableLeft - Math.min(availableLeft - minGutter, padding);
            })(),
            width: (() => {
              const padding = (isMobile && activeStepConfig.mobileSpotlightPadding) ? activeStepConfig.mobileSpotlightPadding : activeStepConfig.spotlightPadding || activeStepConfig.highlightPadding || 10;
              const rawLeft = targetRect.left - padding;
              let effectiveLeft = rawLeft;
              if (isMobile && rawLeft < 8) {
                effectiveLeft = 8;
              } else if (rawLeft < 0) {
                effectiveLeft = 0;
              }
              return Math.min(targetRect.width + padding * 2, window.innerWidth - effectiveLeft);
            })(),
            height: targetRect.height + ((isMobile && activeStepConfig.mobileSpotlightPadding) ? activeStepConfig.mobileSpotlightPadding : activeStepConfig.spotlightPadding || activeStepConfig.highlightPadding || 10) * 2,
          }}
          ref={(el) => {
            if (el) {
              const padding = (isMobile && activeStepConfig.mobileSpotlightPadding) ? activeStepConfig.mobileSpotlightPadding : activeStepConfig.spotlightPadding || activeStepConfig.highlightPadding || 10;
              const calculatedLeft = targetRect.left - padding;
              const boundedLeft = Math.max(0, calculatedLeft);
              
              console.log(`[Tutorial Debug] Highlight positioning for step ${activeStepConfig.id}:`, {
                targetRect: targetRect,
                scroll: { x: window.scrollX || window.pageXOffset || 0, y: window.scrollY || window.pageYOffset || 0 },
                padding: padding,
                positioning: {
                  calculatedLeft: calculatedLeft,
                  boundedLeft: boundedLeft,
                  documentTop: targetRect.top - padding,
                  documentLeft: boundedLeft
                },
                finalStyle: {
                  top: targetRect.top - padding,
                  left: boundedLeft,
                  width: targetRect.width + padding * 2,
                  height: targetRect.height + padding * 2,
                }
              });
            }
          }}
        />
      )}

      {/* Interactive Element Highlights with scroll compensation */}
      {!activeStepConfig.useTransparentOverlay && activeStepConfig.id !== 'login-completion' && interactiveElements.map((item, index) => {
        return (
          <div
            key={`${item.id}-${index}`}
            className="tutorial-highlight tutorial-interactive-highlight"
            style={{
              position: 'fixed',
              top: (() => {
                if (!isMobile) return Math.max(0, item.rect.top - 6);
                return Math.max(0, item.rect.top - 6);
              })(),
              left: (() => {
                if (!isMobile) return Math.max(0, item.rect.left - 6);
                return Math.max(8, item.rect.left - 6);
              })(),
              width: item.rect.width + 12,
              height: item.rect.height + 12,
              animationDelay: `${index * 0.1}s`,
            }}
          />
        );
      })}

      {/* Tutorial Prompt */}
      {promptPosition && (
        <div
          className="tutorial-prompt-container"
          style={{
            position: 'fixed',
            top: promptPosition.top,
            left: promptPosition.left,
            pointerEvents: 'auto',
            zIndex: 'var(--tutorial-prompt-z)'
          }}
        >
          <div
            className="tutorial-prompt"
            style={{ 
              width: isMobile ? 'min(340px, calc(100vw - 40px))' : 400,
              minWidth: isMobile ? '280px' : '400px'
            }}
          >
            {activeStepConfig.title && (
              <h3 className="text-lg font-semibold mb-3 text-foreground">
                {activeStepConfig.title}
              </h3>
            )}
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {isMobile && activeStepConfig.mobileContent ? activeStepConfig.mobileContent : activeStepConfig.content}
            </p>
            <div className="flex justify-end gap-2">
              {activeStepConfig.showNextButton !== false && (
                <Button
                  size="sm"
                  onClick={nextStep}
                  data-tutorial-id="prompt-next-button"
                  className="tutorial-interactive bg-amber-600 hover:bg-amber-500 text-black"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>,
    portalContainer
  );
}

// Component to create backdrop with holes for interactive elements
function BackdropWithHoles({ 
  interactiveElements, 
  targetRect,
  activeStepConfig
}: { 
  interactiveElements: InteractiveElement[]; 
  targetRect: DOMRect | null;
  activeStepConfig: any;
}) {
  // For portfolio-overview, don't create holes for the target element to prevent clicking on coins
  const shouldBlockTargetClicks = activeStepConfig?.id === 'portfolio-overview';
  
  // For add-funds-button, create hole for visibility but we'll block clicks with CSS
  const shouldShowButBlockTarget = activeStepConfig?.id === 'add-funds-button';
  
  // For add-funds-dialog-opened, create full overlay with no holes to block portfolio access
  const shouldCreateFullOverlay = activeStepConfig?.id === 'add-funds-dialog-opened';
  
  if (shouldCreateFullOverlay) {
    // Full dark overlay with no holes for add-funds-dialog-opened step
    console.log('[Tutorial Debug] Creating full overlay for add-funds-dialog-opened');
    const scrollX = 0;
    const scrollY = 0;
    return (
      <div 
        className="tutorial-backdrop tutorial-add-funds-full-overlay"
        style={{
          position: 'fixed',
          top: scrollY,
          left: scrollX,
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 'var(--tutorial-backdrop-color)',
          zIndex: 'calc(var(--tutorial-overlay-z) - 1)'
        }}
        onClick={() => console.log('[Tutorial Debug] Backdrop clicked')}
      />
    );
  }
  
  // Combine holes (interactive elements + target based on step logic)
  const allHoles = [
    ...interactiveElements.map(item => item.rect),
    // Add target rect hole based on step requirements
    ...(targetRect && !shouldBlockTargetClicks ? [targetRect] : [])
  ].filter(Boolean);

  return (
    <>
      {/* Main backdrop panels */}
      {allHoles.length === 0 ? (
        <div className="tutorial-backdrop" />
      ) : (
        createOverlayPanels(allHoles).map((panel, index) => (
          <div 
            key={index}
            className="tutorial-backdrop"
            style={{
              position: 'fixed',
              top: panel.top,
              left: panel.left,
              width: panel.width,
              height: panel.height,
              background: 'var(--tutorial-backdrop-color)',
              zIndex: 'calc(var(--tutorial-overlay-z) - 1)'
            }}
          />
        ))
      )}
      
      {/* Special overlay for add-funds-button to block clicks while keeping it visible */}
      {shouldShowButBlockTarget && targetRect && (
        <div
        style={{
            position: 'fixed',
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
            backgroundColor: 'transparent',
            zIndex: 'var(--z-tutorial-interactive)',
            pointerEvents: 'auto',
            cursor: 'not-allowed'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      )}
    </>
  );
}

// Create overlay panels that avoid holes with scroll compensation
function createOverlayPanels(holes: DOMRect[]) {
  const panels = [];
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (holes.length === 0) {
    return [{ top: 0, left: 0, width: viewportWidth, height: viewportHeight }];
  }

  // Convert holes to document coordinates
  const documentHoles = holes.map(hole => ({
    top: hole.top,
    left: hole.left,
    right: hole.right,
    bottom: hole.bottom,
    width: hole.width,
    height: hole.height
  }));

  // Sort holes by position to create efficient panels
  const sortedHoles = [...documentHoles].sort((a, b) => a.top - b.top || a.left - b.left);
  
  // Create panels around holes
  // Top panel (above all holes)
  const topMostHole = sortedHoles[0];
  if (topMostHole.top > 0) {
    panels.push({ top: 0, left: 0, width: viewportWidth, height: topMostHole.top });
  }

  // Bottom panel (below all holes)
  const bottomMostHole = sortedHoles.reduce((bottom, hole) => 
    hole.bottom > bottom.bottom ? hole : bottom, sortedHoles[0]);
  if (bottomMostHole.bottom < viewportHeight) {
    panels.push({ 
      top: bottomMostHole.bottom, 
      left: 0, 
      width: viewportWidth, 
      height: viewportHeight - bottomMostHole.bottom 
    });
  }

  // Left and right panels for each hole
  sortedHoles.forEach(hole => {
    // Left panel
    if (hole.left > 0) {
      panels.push({
        top: hole.top,
        left: 0,
        width: hole.left,
        height: hole.height
      });
    }

    // Right panel
    if (hole.right < viewportWidth) {
      panels.push({
        top: hole.top,
        left: hole.right,
        width: viewportWidth - hole.right,
        height: hole.height
      });
    }
  });

  return panels;
}

// Get interactive selectors for the current step
function getInteractiveSelectors(stepConfig: any): string[] {
  const selectors = [];

  // Only include prompt buttons for steps that need them (exclude portfolio-overview and add-funds-button)
  if (stepConfig.id !== 'portfolio-overview' && stepConfig.id !== 'add-funds-button') {
    selectors.push('[data-tutorial-id="prompt-next-button"]');
  }

  // Add selectors based on step configuration (exclude portfolio-overview and add-funds-button)
  if (stepConfig.action?.selector && stepConfig.id !== 'portfolio-overview' && stepConfig.id !== 'add-funds-button') {
    selectors.push(stepConfig.action.selector);
  }

  // Add common interactive elements based on step ID
  const stepSpecificSelectors = getStepSpecificSelectors(stepConfig.id);
  selectors.push(...stepSpecificSelectors);

  // Remove duplicates
  return [...new Set(selectors)];
}

// Get step-specific interactive selectors
function getStepSpecificSelectors(stepId: string): string[] {
  const selectorMap: Record<string, string[]> = {
    'login-prompt': [
      '[data-tutorial-id="header-login-button"]',
      '[data-tutorial-id="login-dialog"]',
      '[data-tutorial-id="google-oauth-button"]',
      'button[aria-label="Continue with Google"]',
      '.google-auth-button',
      '[role="dialog"] button',
      '[data-testid="google-auth-button"]'
    ],
    'portfolio-navigation': ['[data-tutorial-id="portfolio-link"]'],
    'add-funds-button': ['[data-tutorial-id="add-funds-button"]'],
    'add-funds-dialog-opened': [
      '[data-tutorial-id="confirm-deposit"]',
      '[data-tutorial-id="add-funds-dialog"] input',
      '[data-tutorial-id="add-funds-dialog"] button'
    ],
    'post-deposit-marketplace-prompt': ['[data-tutorial-id="marketplace-link"]'],
    'marketplace-pick-coin': [
      '.coin-card', 
      '[data-tutorial-id="marketplace-coin-list-container"] .coin-card',
      '[data-tutorial-id="marketplace-coin-list-container"] > *'
    ],
    'coin-detail-overview': ['[data-tutorial-id="order-book-tab-button"]'],
    'coin-detail-order-book-explanation': ['[data-tutorial-id="details-tab-button"]'],
    'coin-detail-details-explanation': ['[data-tutorial-id="history-tab-button"]'],
    'coin-detail-sale-history-explanation': ['[data-tutorial-id="buy-widget-container"]'],
    'purchase-prompt': [
      '[data-tutorial-id="confirm-purchase-button"]',
      '[data-tutorial-id="buy-widget-container"] input',
      '[data-tutorial-id="buy-widget-container"] form'
    ],
    // Add more step-specific selectors as needed
  };

  return selectorMap[stepId] || [];
} 