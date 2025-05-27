'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TutorialState, TutorialAction, TutorialContextValue, TutorialStep, TutorialProviderProps } from './types';
import { generateSessionId } from './hooks';

// Create the tutorial context
const TutorialContext = createContext<TutorialContextValue | null>(null);

// Custom hook to use tutorial context
export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};

// Hook for checking if specific step is visible
export const useIsTutorialStep = (stepId: string) => {
  const { state } = useTutorial();
  
  return useMemo(() => {
    if (!state.isActive) return false;
    return state.steps[state.currentStepIndex]?.id === stepId;
  }, [state.isActive, state.currentStepIndex, state.steps, stepId]);
};

// Calculate next step index (could include logic for conditional steps)
function calculateNextStep(state: TutorialState): number {
  // Simple linear progression for now
  // This could be enhanced with conditional logic based on context
  return state.currentStepIndex + 1;
}

// Create tutorial root portal container
function createTutorialRoot(): HTMLElement {
  let container = document.getElementById('tutorial-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'tutorial-root';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9998';
    document.body.appendChild(container);
  }
  return container;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ 
  children, 
  steps, 
  autoStart = false
}) => {
  const [isClient, setIsClient] = useState(false);
  const [TutorialLayer, setTutorialLayer] = useState<React.ComponentType<any> | null>(null);
  const isProcessingRef = useRef(false);
  
  // Initialize state with a stable server-side value
  const [state, setState] = useState<TutorialState>(() => ({
    isActive: false, // Never auto-start during SSR
    currentStepIndex: 0,
    steps,
    sessionId: 'ssr-placeholder', // Stable placeholder for SSR
    startedAt: undefined,
    context: {}
  }));

  // Set client-side session ID after hydration and load TutorialLayer
  useEffect(() => {
    setIsClient(true);
    setState(prev => ({
      ...prev,
      sessionId: generateSessionId(),
      isActive: autoStart // Only auto-start after hydration
    }));

    // Use async import to load TutorialLayer after hydration
    const loadTutorialLayer = async () => {
      try {
        // @ts-ignore - Dynamic import works at runtime despite TypeScript linter warning
        const { TutorialLayer: LayerComponent } = await import('./tutorial-layer');
        setTutorialLayer(() => LayerComponent);
      } catch (error) {
        console.error('Failed to load TutorialLayer:', error);
      }
    };

    loadTutorialLayer();
  }, [autoStart]);

  const dispatch = useCallback((action: TutorialAction) => {
    // Don't process actions during SSR
    if (!isClient) return;
    
    setState(prev => {
      switch (action.type) {
        case 'START_TUTORIAL': {
          const startIndex = action.payload?.stepIndex || 0;
          return {
            ...prev,
            isActive: true,
            currentStepIndex: startIndex,
            startedAt: Date.now(),
            context: {} // Fresh context each time
          };
        }

        case 'NEXT_STEP': {
          console.log('🔄 NEXT_STEP dispatch called');
          
          // Guard against rapid successive calls
          if (isProcessingRef.current) {
            console.log('⚠️ Already processing step advancement, ignoring duplicate dispatch');
            return prev;
          }
          
          isProcessingRef.current = true;
          
          // Reset the processing flag after a short delay
          setTimeout(() => {
            isProcessingRef.current = false;
          }, 200);
          
          console.log('Current state:', prev);
          console.log('Current step index:', prev.currentStepIndex);
          console.log('Total steps:', prev.steps.length);
          
          const nextIndex = calculateNextStep(prev);
          console.log('Calculated next index:', nextIndex);
          
          if (nextIndex >= prev.steps.length) {
            console.log('❌ Tutorial complete - deactivating');
            return { ...prev, isActive: false };
          }
          
          console.log('✅ Advancing to step index:', nextIndex);
          console.log('Next step will be:', prev.steps[nextIndex]?.id);
          
          return { ...prev, currentStepIndex: nextIndex };
        }

        case 'PREVIOUS_STEP': {
          const prevIndex = Math.max(0, prev.currentStepIndex - 1);
          return { ...prev, currentStepIndex: prevIndex };
        }

        case 'SKIP_TUTORIAL':
          return { ...prev, isActive: false };

        case 'RESTART_TUTORIAL':
          return {
            ...prev,
            isActive: true,
            currentStepIndex: 0,
            startedAt: Date.now(),
            context: {},
            sessionId: generateSessionId() // New session
          };

        case 'GO_TO_STEP': {
          const stepIndex = prev.steps.findIndex(step => step.id === action.payload.stepId);
          if (stepIndex !== -1) {
            return { ...prev, currentStepIndex: stepIndex };
          }
          return prev;
        }

        case 'UPDATE_CONTEXT':
          return {
            ...prev,
            context: { ...prev.context, ...action.payload }
          };

        default:
          return prev;
      }
    });
  }, [isClient]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESTART_TUTORIAL' });
  }, [dispatch]);

  const isStepVisible = useCallback((stepId: string) => {
    if (!state.isActive) return false;
    return state.steps[state.currentStepIndex]?.id === stepId;
  }, [state.isActive, state.currentStepIndex, state.steps]);

  // Get current step
  const currentStep = useMemo(() => {
    if (!state.isActive || state.currentStepIndex >= state.steps.length) {
      return null;
    }
    return state.steps[state.currentStepIndex];
  }, [state.isActive, state.currentStepIndex, state.steps]);

  const contextValue: TutorialContextValue = useMemo(() => ({
    state,
    dispatch,
    isStepVisible,
    reset,
    currentStep
  }), [state, dispatch, isStepVisible, reset, currentStep]);

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
      {isClient && state.isActive && currentStep && TutorialLayer && createPortal(
        <TutorialLayer 
          step={currentStep}
          onNext={() => dispatch({ type: 'NEXT_STEP' })}
          onPrevious={() => dispatch({ type: 'PREVIOUS_STEP' })}
          onSkip={() => dispatch({ type: 'SKIP_TUTORIAL' })}
        />,
        createTutorialRoot()
      )}
    </TutorialContext.Provider>
  );
}; 