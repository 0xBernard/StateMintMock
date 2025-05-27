'use client';

import React, { useEffect, useRef } from 'react';
import { useTutorialStore } from '@/lib/tutorial/store';
import { tutorialSteps } from '@/lib/tutorial/config';
import { usePathname } from 'next/navigation';

export function TutorialActionHandler(): null {
  const { 
    activeStepConfig, 
    nextStep, 
    previousStep,
    _lockTransition, 
    _unlockTransition,
    isTutorialActive,
    currentStepIndex
  } = useTutorialStore();
  
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  
  // Handle path changes for navigation
  useEffect(() => {
    if (!isTutorialActive || !activeStepConfig) return;
    
    const isPathChanged = prevPathRef.current !== pathname;
    
    // For debugging
    if (isPathChanged) {
      console.log('Path changed:', pathname, 'Previous path:', prevPathRef.current);
      console.log('Current step:', activeStepConfig.id);
    }
    
    prevPathRef.current = pathname;
    
    // Handle automated navigation detection
    const timeoutIds: NodeJS.Timeout[] = [];
    
    // Handle standard navigation steps
    if (activeStepConfig.action?.type === 'navigation') {
      const expectedPath = activeStepConfig.action.navigationPath;
      let isNavigationMatch = false;
      
      if (expectedPath) {
        // Remove query parameters from pathname for comparison
        const cleanPathname = pathname.split('?')[0];
        
        if (expectedPath === cleanPathname) {
          isNavigationMatch = true;
        } else if (expectedPath.endsWith('/') && cleanPathname.startsWith(expectedPath)) {
          // Handle partial path matching (e.g., '/coin/' matches '/coin/123')
          isNavigationMatch = true;
        }
      }
      
      if (isNavigationMatch) {
        console.log(`Detected navigation to ${pathname} for step ${activeStepConfig.id}`);
        const timeoutId = setTimeout(async () => {
          console.log('Navigation completed, advancing step');
          await nextStep();
        }, 600);
        timeoutIds.push(timeoutId);
      }
    }
    
    // Special case for portfolio navigation
    if (activeStepConfig.id === 'portfolio-navigation' && pathname === '/portfolio') {
      console.log('Detected portfolio navigation');
      const timeoutId = setTimeout(async () => {
        console.log('Portfolio page fully loaded, advancing to next step');
        await nextStep();
      }, 600);
      timeoutIds.push(timeoutId);
    }
    
    // Special case for marketplace return after deposit flow
    if (pathname === '/marketplace' && 
        (activeStepConfig.id === 'return-to-marketplace' || 
         activeStepConfig.id === 'deposit-confirmation')) {
      console.log('Detected marketplace navigation after funds flow');
      const timeoutId = setTimeout(async () => {
        console.log('Advancing to next step after marketplace navigation');
        await nextStep();
      }, 800);
      timeoutIds.push(timeoutId);
    }
    
    // Special case for coin detail page navigation after coin selection
    if (activeStepConfig.id === 'coin-selection-prompt' && pathname.startsWith('/coin/')) {
      console.log('Detected navigation to coin detail page');
      const timeoutId = setTimeout(async () => {
        console.log('Coin detail page loaded, advancing to next step');
        await nextStep();
      }, 800);
      timeoutIds.push(timeoutId);
    }
    
    // Handle back navigation (user pressed browser back button)
    if (isPathChanged) {
      const expectedPath = getExpectedPathForStep(activeStepConfig.id);
      if (expectedPath && pathname !== expectedPath) {
        console.log('Detected navigation away from expected path');
        
        // Check if this is a backward navigation in the tutorial flow
        const previousStepIndex = getPreviousStepWithPath(currentStepIndex, pathname);
        if (previousStepIndex >= 0) {
          console.log('Detected backward navigation in tutorial flow, going to previous step');
          const timeoutId = setTimeout(async () => {
            await previousStep();
          }, 300);
          timeoutIds.push(timeoutId);
        }
      }
    }
    
    // Clean up all timeouts
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [pathname, activeStepConfig, isTutorialActive, nextStep, previousStep, currentStepIndex]);

  // Handle DOM content change observation (for login state changes, etc.)
  useEffect(() => {
    if (!isTutorialActive || !activeStepConfig?.action) return;
    
    if (activeStepConfig.action.type === 'observe' && activeStepConfig.action.event === 'domchange') {
      console.log(`Setting up mutation observer for ${activeStepConfig.id}`);
      
      const targetSelector = activeStepConfig.targetElementSelector;
      const condition = activeStepConfig.action.condition;
      
      // Clean up any existing observer
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
        mutationObserverRef.current = null;
      }
      
      const checkForChanges = () => {
        const targetElement = document.querySelector(targetSelector);
        if (condition && condition(targetElement as HTMLElement)) {
          console.log(`DOM change condition met for ${activeStepConfig.id}`);
          setTimeout(() => {
            nextStep();
          }, 500);
        }
      };
      
      // Create a mutation observer to watch for DOM changes
      const observer = new MutationObserver((mutations) => {
        console.log(`DOM mutation detected for ${activeStepConfig.id}`, mutations.length);
        checkForChanges();
      });
      
      // Configure and start the observer
      const observeTarget = document.body;
      observer.observe(observeTarget, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });
      
      mutationObserverRef.current = observer;
      
      // Also check immediately in case the condition is already met
      checkForChanges();
      
      return () => {
        if (mutationObserverRef.current) {
          mutationObserverRef.current.disconnect();
          mutationObserverRef.current = null;
        }
      };
    }
  }, [activeStepConfig, isTutorialActive, nextStep]);

  // Handle all other action types
  useEffect(() => {
    if (!isTutorialActive || !activeStepConfig?.action) return;
    
    const action = activeStepConfig.action;
    let timeoutId: NodeJS.Timeout | undefined;
    
    // Function to handle advancing to next step
    const handleNextStep = async () => {
      const callerInfo = `tutorial-action-handler_handleNextStep_for_step_${activeStepConfig.id}_action_${action.type}`;
      
      if (action.autoAdvance === true) {
        console.log(`[Tutorial Action Handler] Auto-advancing for ${activeStepConfig.id}. Running onAfterStep then nextStep.`);
        if (activeStepConfig.onAfterStep) {
          console.log(`[Tutorial Action Handler] Running onAfterStep for ${activeStepConfig.id} before auto-advancing.`);
          await activeStepConfig.onAfterStep();
        }
        await nextStep(); // store's nextStep handles its own locking
      } else {
        _lockTransition(callerInfo);
      if (activeStepConfig.onAfterStep) {
          console.log(`[Tutorial Action Handler] Running onAfterStep for ${activeStepConfig.id} (no auto-advance).`);
        await activeStepConfig.onAfterStep();
      }
        // If not auto-advancing, we still need to unlock if we locked.
        // Also, log that we are not auto-advancing.
        console.log(`[Tutorial Action Handler] Not auto-advancing for ${activeStepConfig.id} (autoAdvance is ${action.autoAdvance}).`);
        _unlockTransition(callerInfo);
      }
    };
    
    // Skip handling for navigation-type actions (handled by pathname effect)
    if (action.type === 'navigation' || action.type === 'observe') {
      return;
    }
    
    // Handle delay actions
    if (action.type === 'delay') {
      console.log(`Setting up delay action for ${activeStepConfig.id}`);
      
      timeoutId = setTimeout(() => {
        console.log(`Delay complete for ${activeStepConfig.id}`);
        handleNextStep();
      }, action.delayMs || 1000);
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
    
    // Handle click actions with fallback and interaction pass-through
    if (action.type === 'click') {
      // Determine which element to target
      const selector = action.selector || activeStepConfig.targetElementSelector;
      const element = document.querySelector<HTMLElement>(selector);
      
      console.log(`Setting up click handler for ${activeStepConfig.id} on ${selector}`);
      
      // Special handling for login button step
      if (activeStepConfig.id === 'login-prompt') {
        console.log('Setting up special handling for login button');
        
        if (element) {
          element.classList.add('tutorial-interactive-element');
          
          // For login button, we don't immediately advance the step
          // We'll let the login process complete first, then the navigation or DOM observe handler will take over
          const handleLoginClick = (e: MouseEvent) => {
            console.log('Login button clicked, waiting for login completion');
            // Don't prevent default or stop propagation to allow normal login flow
            
            // Special handling: don't advance step or unlock transition
            // This prevents the tutorial overlay from disappearing during login
            
            // Look for login success indicators instead
            const loginObserver = new MutationObserver(() => {
              // Check for changes indicating successful login (e.g., user menu appearing)
              const userMenuElement = document.querySelector('[data-tutorial-id="user-menu"]');
              if (userMenuElement) {
                console.log('Login detected, preparing to advance');
                loginObserver.disconnect();
                
                // Give time for login UI changes to complete
                setTimeout(() => {
                  handleNextStep();
                }, 800);
              }
            });
            
            // Start observing the document for login changes
            loginObserver.observe(document.body, {
              childList: true,
              subtree: true
            });
            
            // Set a fallback timer in case mutation observer doesn't catch the login
            setTimeout(() => {
              loginObserver.disconnect();
            }, 5000);
          };
          
          element.addEventListener('click', handleLoginClick);
          
          return () => {
            element.removeEventListener('click', handleLoginClick);
            element.classList.remove('tutorial-interactive-element');
          };
        }
      }
      
      // Special handling for add-funds-dialog step
      if (activeStepConfig.id === 'add-funds-dialog') {
        console.log('Setting up special handling for add funds dialog');
        // Use MutationObserver to detect when the deposit button is clicked
        const depositObserver = new MutationObserver((mutations) => {
          // Check if we're in the processing state (button text changes)
          const depositButton = document.querySelector('[data-tutorial-id="confirm-deposit"]');
          if (depositButton && depositButton.textContent?.includes('Processing')) {
            console.log('Deposit processing detected, preparing to advance');
            // Wait a bit for the deposit to complete
            setTimeout(() => {
              console.log('Advancing after deposit completion');
              handleNextStep();
            }, 2000);
            
            depositObserver.disconnect();
          }
        });
        
        // Start observing the document for changes
        depositObserver.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true
        });
        
        return () => {
          depositObserver.disconnect();
        };
      }
      
      // Special handling for coin-selection-prompt step
      if (activeStepConfig.id === 'coin-selection-prompt') {
        console.log('Setting up special handling for coin selection');
        
        // Listen for clicks on any coin card
        const handleCoinCardClick = (e: Event) => {
          const clickedElement = e.target as HTMLElement;
          const coinCard = clickedElement.closest('.coin-card');
          
          if (coinCard) {
            console.log('Coin card clicked, preparing to advance tutorial');
            // Don't prevent the navigation, let it happen naturally
            // The tutorial will advance when we detect the navigation to the coin detail page
            
            // Set up a timeout to advance the step after navigation
            setTimeout(() => {
              console.log('Advancing tutorial after coin card click');
              handleNextStep();
            }, 800);
          }
        };
        
        // Add event listener to the marketplace container
        const marketplaceContainer = document.querySelector('[data-tutorial-id="marketplace-coin-list-container"]');
        if (marketplaceContainer) {
          marketplaceContainer.addEventListener('click', handleCoinCardClick);
          
          return () => {
            marketplaceContainer.removeEventListener('click', handleCoinCardClick);
          };
        } else {
          // Fallback: listen at document level
          document.addEventListener('click', handleCoinCardClick);
          
          return () => {
            document.removeEventListener('click', handleCoinCardClick);
          };
        }
      }
      
      // Special handling for purchase-widget-highlight step
      if (activeStepConfig.id === 'purchase-widget-highlight') {
        console.log('Setting up special handling for purchase completion');
        
        // Listen for successful purchase by watching for the purchase button click and subsequent success
        const handlePurchaseCompletion = () => {
          // Look for success indicators (toast, balance change, etc.)
          const purchaseObserver = new MutationObserver((mutations) => {
            // Check for success toast or other indicators
            const successToast = document.querySelector('[data-sonner-toast]');
            if (successToast && successToast.textContent?.includes('successful')) {
              console.log('Purchase success detected, preparing to advance');
              purchaseObserver.disconnect();
              
              setTimeout(() => {
                console.log('Advancing after purchase completion');
                handleNextStep();
              }, 1500);
            }
          });
          
          // Start observing for purchase completion
          purchaseObserver.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
          });
          
          // Set a cleanup timeout
          setTimeout(() => {
            purchaseObserver.disconnect();
          }, 10000);
        };
        
        // Listen for clicks on the purchase button
        const purchaseButton = document.querySelector('[data-tutorial-id="confirm-purchase-button"]');
        if (purchaseButton) {
          purchaseButton.addEventListener('click', handlePurchaseCompletion);
          
          return () => {
            purchaseButton.removeEventListener('click', handlePurchaseCompletion);
          };
        }
      }
      
      if (element) {
        console.log(`Found element for click handler: ${selector}`);
        
        // Mark element as interactive for tutorial
        element.classList.add('tutorial-interactive-element');
        
        // Set up click event handler
        const handleClick = (e: MouseEvent) => {
          const stepIdWhenClicked = activeStepConfig.id; // Capture step ID at time of click setup
          console.log(`Click detected on ${selector} for step ${stepIdWhenClicked}`);
          
          // Only prevent bubbling if specifically requested
          if (action.preventBubbling) {
            e.stopPropagation();
          }
          
          // Use a small timeout to let any UI updates complete
          setTimeout(() => {
            // Check if the step is still the same before calling handleNextStep
            if (useTutorialStore.getState().activeStepConfig?.id === stepIdWhenClicked) {
              console.log(`[Tutorial Action Handler] Proceeding with handleNextStep for ${stepIdWhenClicked} after timeout`);
            handleNextStep();
            } else {
              console.log(`[Tutorial Action Handler] Aborting handleNextStep for ${stepIdWhenClicked} after timeout, step changed to ${useTutorialStore.getState().activeStepConfig?.id}`);
            }
          }, 300);
        };
        
        // Add event listener and ensure element is interactive
        element.addEventListener('click', handleClick);
        
        // Return cleanup function
        return () => {
          element.removeEventListener('click', handleClick);
          element.classList.remove('tutorial-interactive-element');
        };
      } else {
        console.log(`Could not find element for click handler: ${selector}`);
        
        // Fallback: listen to clicks at the document level
        // This helps when elements are dynamically rendered
        const handleDocumentClick = (e: MouseEvent) => {
          const clickedElement = e.target as HTMLElement;
          const matchesSelector = clickedElement.closest(selector);
          
          if (matchesSelector) {
            const stepIdWhenClicked = activeStepConfig.id; // Capture step ID at time of click setup
            console.log(`Click detected via document for ${stepIdWhenClicked}`);
            
            if (action.preventBubbling) {
              e.stopPropagation();
            }
            
            setTimeout(() => {
              // Check if the step is still the same before calling handleNextStep
              if (useTutorialStore.getState().activeStepConfig?.id === stepIdWhenClicked) {
                console.log(`[Tutorial Action Handler] Proceeding with handleNextStep (document click) for ${stepIdWhenClicked} after timeout`);
              handleNextStep();
              } else {
                console.log(`[Tutorial Action Handler] Aborting handleNextStep (document click) for ${stepIdWhenClicked} after timeout, step changed to ${useTutorialStore.getState().activeStepConfig?.id}`);
              }
            }, 300);
          }
        };
        
        document.addEventListener('click', handleDocumentClick, true);
        
        // Also set up a retry mechanism to find the element
        const retryId = setInterval(() => {
          const retryElement = document.querySelector<HTMLElement>(selector);
          if (retryElement) {
            console.log(`Found element on retry for ${activeStepConfig.id}`);
            clearInterval(retryId);
            
            retryElement.classList.add('tutorial-interactive-element');
            
            const handleClickOnRetry = () => { // Renamed to avoid conflict
              const stepIdWhenClicked = activeStepConfig.id; // Capture step ID at time of click setup
              console.log(`Click detected on retry for ${stepIdWhenClicked}`);
              setTimeout(() => {
                // Check if the step is still the same before calling handleNextStep
                if (useTutorialStore.getState().activeStepConfig?.id === stepIdWhenClicked) {
                  console.log(`[Tutorial Action Handler] Proceeding with handleNextStep (retry click) for ${stepIdWhenClicked} after timeout`);
                handleNextStep();
                } else {
                  console.log(`[Tutorial Action Handler] Aborting handleNextStep (retry click) for ${stepIdWhenClicked} after timeout, step changed to ${useTutorialStore.getState().activeStepConfig?.id}`);
                }
              }, 300);
            };
            
            retryElement.addEventListener('click', handleClickOnRetry);
            document.removeEventListener('click', handleDocumentClick, true);
          }
        }, 500);
        
        return () => {
          clearInterval(retryId);
          document.removeEventListener('click', handleDocumentClick, true);
        };
      }
    }
    
    // Handle input actions
    if (action.type === 'input') {
      const selector = action.selector || activeStepConfig.targetElementSelector;
      const element = document.querySelector<HTMLInputElement>(selector);
      
      if (element) {
        console.log(`Found input element for ${activeStepConfig.id}`);
        
        const handleInput = () => {
          const value = element.value;
          let isValid = false;
          
          if (typeof action.expectedValue === 'function') {
            isValid = action.expectedValue(value);
          } else if (action.expectedValue) {
            isValid = value === action.expectedValue;
          } else {
            isValid = value.length > 0;
          }
          
          if (isValid) {
            handleNextStep();
          }
        };
        
        element.addEventListener('input', handleInput);
        
        return () => {
          element.removeEventListener('input', handleInput);
        };
      } else {
        console.log(`Could not find input element for ${activeStepConfig.id}`);
      }
    }
    
    return undefined;
  }, [activeStepConfig, isTutorialActive, nextStep, _lockTransition, _unlockTransition]);
  
  return null;
}

// Helper function to get the expected path for a step
function getExpectedPathForStep(stepId: string): string | null {
  // Map steps to their expected paths
  const stepPathMap: Record<string, string> = {
    'welcome-on-marketplace': '/marketplace',
    'login-prompt': '/marketplace',
    'portfolio-navigation': '/portfolio',
    'portfolio-overview': '/portfolio',
    'add-funds-button': '/portfolio',
    'add-funds-dialog': '/portfolio',
    'deposit-confirmation': '/portfolio',
    'return-to-marketplace': '/marketplace',
    'select-coin': '/marketplace',
    'coin-overview': '/coins',
    'orderbook-explanation': '/coins',
    'buy-shares': '/coins',
    'purchase-confirmation': '/coins',
  };
  
  return stepPathMap[stepId] || null;
}

// Helper function to find previous step with matching path
function getPreviousStepWithPath(currentIndex: number, path: string): number {
  for (let i = currentIndex - 1; i >= 0; i--) {
    const expectedPath = getExpectedPathForStep(tutorialSteps[i].id);
    if (expectedPath === path) {
      return i;
    }
  }
  
  return -1;
} 