'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTutorialStore } from '@/lib/tutorial/store';
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
    isTutorialActive, 
    activeStepConfig,
    nextStep,
    stopTutorial 
  } = useTutorialStore();

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

  // Find target element and interactive elements
  useEffect(() => {
    if (!isTutorialActive || !activeStepConfig) {
        setTargetElement(null);
        setTargetRect(null);
      setInteractiveElements([]);
      return;
    }

    // Add body data attribute for CSS targeting
    if (activeStepConfig.id === 'add-funds-dialog-opened') {
      document.body.setAttribute('data-tutorial-step', 'add-funds-dialog-opened');
    } else {
      document.body.removeAttribute('data-tutorial-step');
    }

    const findElements = () => {
      // Find target element
      let targetEl: HTMLElement | null = null;
      let targetR: DOMRect | null = null;

      if (activeStepConfig.targetElementSelector !== 'body') {
        const element = document.querySelector(activeStepConfig.targetElementSelector) as HTMLElement;
      if (element) {
          targetEl = element;
          targetR = element.getBoundingClientRect();
          element.classList.add('tutorial-target');
          
          // Debug logging
          console.log(`[Tutorial Debug] Found target element for step ${activeStepConfig.id}:`, {
            selector: activeStepConfig.targetElementSelector,
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
          console.warn(`[Tutorial Debug] Could not find target element for selector: ${activeStepConfig.targetElementSelector}`);
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
  }, [isTutorialActive, activeStepConfig?.id]);

  // Calculate prompt position
  useEffect(() => {
    if (!activeStepConfig) {
      setPromptPosition(null);
      return;
    }

    const placement = activeStepConfig.promptPlacement || 'bottom';
    const padding = activeStepConfig.highlightPadding || 10;
    const promptWidth = 400;
    const promptHeight = 200;

    let top = 0;
    let left = 0;

    // Use target element for positioning if available, otherwise center
    if (targetRect) {
      switch (placement) {
        case 'top':
          top = targetRect.top - promptHeight - padding;
          left = targetRect.left + (targetRect.width / 2) - (promptWidth / 2);
          break;
        case 'bottom':
          top = targetRect.bottom + padding;
          left = targetRect.left + (targetRect.width / 2) - (promptWidth / 2);
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (promptHeight / 2);
          left = targetRect.left - promptWidth - padding;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (promptHeight / 2);
          left = targetRect.right + padding;
          break;
        case 'bottom-end':
          top = targetRect.bottom + padding;
          left = targetRect.right - promptWidth;
          break;
        case 'center':
        default:
          top = window.innerHeight / 2 - promptHeight / 2;
          left = window.innerWidth / 2 - promptWidth / 2;
          break;
      }
    } else {
      // Center when no target
      top = window.innerHeight / 2 - promptHeight / 2;
      left = window.innerWidth / 2 - promptWidth / 2;
    }

    // Keep within viewport
    top = Math.max(20, Math.min(top, window.innerHeight - promptHeight - 20));
    left = Math.max(20, Math.min(left, window.innerWidth - promptWidth - 20));

    setPromptPosition({ top, left, placement });
  }, [targetRect, activeStepConfig?.promptPlacement, activeStepConfig?.highlightPadding]);

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

      {/* Target Highlight */}
      {targetRect && !isModalStyle && activeStepConfig.id !== 'login-completion' && (
        <div
          className="tutorial-highlight"
          style={{
            top: targetRect.top - (activeStepConfig.highlightPadding || 10),
            left: targetRect.left - (activeStepConfig.highlightPadding || 10),
            width: targetRect.width + (activeStepConfig.highlightPadding || 10) * 2,
            height: targetRect.height + (activeStepConfig.highlightPadding || 10) * 2,
          }}
          ref={(el) => {
            if (el) {
              console.log(`[Tutorial Debug] Highlight positioning for step ${activeStepConfig.id}:`, {
                targetRect: targetRect,
                padding: activeStepConfig.highlightPadding || 10,
                calculatedStyle: {
                  top: targetRect.top - (activeStepConfig.highlightPadding || 10),
                  left: targetRect.left - (activeStepConfig.highlightPadding || 10),
                  width: targetRect.width + (activeStepConfig.highlightPadding || 10) * 2,
                  height: targetRect.height + (activeStepConfig.highlightPadding || 10) * 2,
                },
                actualStyle: el.style
              });
            }
          }}
        />
      )}

      {/* Interactive Element Highlights */}
      {!activeStepConfig.useTransparentOverlay && activeStepConfig.id !== 'login-completion' && interactiveElements.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          className="tutorial-highlight tutorial-interactive-highlight"
          style={{
            top: item.rect.top - 6,
            left: item.rect.left - 6,
            width: item.rect.width + 12,
            height: item.rect.height + 12,
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}

      {/* Tutorial Prompt */}
      {promptPosition && (
        <div
          className="tutorial-prompt-container"
          style={{
            top: promptPosition.top,
            left: promptPosition.left,
            pointerEvents: 'auto'
          }}
        >
          <div className="tutorial-prompt">
            {activeStepConfig.title && (
              <h3 className="text-lg font-semibold mb-3 text-foreground">
                {activeStepConfig.title}
              </h3>
            )}
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {activeStepConfig.content}
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
  return (
      <div 
        className="tutorial-add-funds-full-overlay"
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

// Create overlay panels that avoid holes
function createOverlayPanels(holes: DOMRect[]) {
  const panels = [];
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (holes.length === 0) {
    return [{ top: 0, left: 0, width: viewportWidth, height: viewportHeight }];
  }

  // Sort holes by position to create efficient panels
  const sortedHoles = [...holes].sort((a, b) => a.top - b.top || a.left - b.left);
  
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