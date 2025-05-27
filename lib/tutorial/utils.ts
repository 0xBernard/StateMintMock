import { CSSProperties } from 'react';

/**
 * Tutorial utility functions
 */

/**
 * Creates props for a tutorial-targeted element.
 * Use this on any element you want to target in the tutorial.
 * 
 * @example
 * <button {...tutorialTarget('login-button')}>Login</button>
 * 
 * @param id The unique identifier for this element in the tutorial system
 * @returns Props object to spread on the target element
 */
export function tutorialTarget(id: string) {
  return {
    'data-tutorial-id': id,
  };
}

/**
 * Creates props for a tutorial interactive element.
 * Use this on elements that need special interactive handling during tutorials.
 * 
 * @example
 * <button {...tutorialInteractive('deposit-button')}>Deposit</button>
 * 
 * @param id The unique identifier for this element in the tutorial system
 * @returns Props object to spread on the target element
 */
export function tutorialInteractive(id: string) {
  return {
    'data-tutorial-id': id,
    'data-tutorial-interactive': 'true',
    style: {
      position: 'relative' as const,
      pointerEvents: 'auto' as const,
    } as CSSProperties
  };
}

/**
 * Helper to determine whether the tutorial is currently active on a specific step.
 * 
 * @example
 * const isLoginStep = isTutorialStep('login-prompt', currentStepId);
 * 
 * @param stepId The step ID to check against
 * @param currentStepId The current tutorial step ID
 * @returns Whether the current step matches the given step ID
 */
export function isTutorialStep(stepId: string, currentStepId: string): boolean {
  return currentStepId === stepId;
} 