'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { TutorialStep } from '@/lib/tutorial/types';
import { tutorialSteps } from '@/lib/tutorial/config';
import { TutorialActionHandler } from './tutorial-action-handler';
import { TutorialOverlay } from './tutorial-overlay';
import { useTutorialStore } from '@/lib/tutorial/store';
import { useMobileDetection, getMobileAdaptedStep } from '@/lib/tutorial/mobile-utils';

interface TutorialContextProps {
  isActive: boolean;
  currentStepId: string;
  isMobile: boolean;
  currentStep: TutorialStep | null;
  startTutorial: (stepId?: string) => void;
  stopTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStepById: (stepId: string) => void;
}

const TutorialContext = createContext<TutorialContextProps>({
  isActive: false,
  currentStepId: '',
  isMobile: false,
  currentStep: null,
  startTutorial: () => {},
  stopTutorial: () => {},
  nextStep: () => {},
  previousStep: () => {},
  goToStepById: () => {},
});

export const useTutorial = () => useContext(TutorialContext);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const {
    isTutorialActive,
    activeStepConfig,
    startTutorial: storeStartTutorial,
    stopTutorial: storeStopTutorial,
    nextStep: storeNextStep,
    previousStep: storePreviousStep,
    goToStep: storeGoToStep
  } = useTutorialStore();

  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const isMobile = useMobileDetection();

  // Get current step info with mobile adaptation
  const currentStepId = isTutorialActive ? (activeStepConfig?.id || '') : '';
  const currentStep = activeStepConfig ? getMobileAdaptedStep(activeStepConfig) : null;
  
  // Debug log
  useEffect(() => {
    if (isTutorialActive) {
      console.log("Tutorial active:", { 
        currentStepId,
        pathname,
        isMobile,
        mobileAdapted: currentStep !== activeStepConfig
      });
    }
  }, [isTutorialActive, currentStepId, pathname, isMobile, currentStep, activeStepConfig]);

  // Set isClient to true after mounting
  useEffect(() => {
    setIsClient(true);
    console.log("TutorialProvider mounted, isClient set to true");
  }, []);

  // Add tutorial class to body when active
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isTutorialActive) {
        document.body.classList.add('tutorial-active');
      } else {
        document.body.classList.remove('tutorial-active');
      }
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('tutorial-active');
      }
    };
  }, [isTutorialActive]);

  const contextValue: TutorialContextProps = {
    isActive: isTutorialActive,
    currentStepId,
    isMobile,
    currentStep,
    startTutorial: (stepId?: string) => {
      console.log("Starting tutorial via context", { stepId, isMobile });
      if (stepId) {
        const stepIndex = tutorialSteps.findIndex(step => step.id === stepId);
        if (stepIndex !== -1) {
          storeStartTutorial(stepIndex);
        } else {
          storeStartTutorial(0);
        }
      } else {
        storeStartTutorial(0);
      }
    },
    stopTutorial: () => {
      console.log("Stopping tutorial via context");
      storeStopTutorial();
    },
    nextStep: () => {
      console.log("Next step via context");
      storeNextStep();
    },
    previousStep: () => {
      console.log("Previous step via context");
      storePreviousStep();
    },
    goToStepById: (stepId: string) => {
      console.log("Go to step by ID via context", { stepId });
      storeGoToStep(stepId);
    },
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
      {isClient && isTutorialActive && <TutorialActionHandler />}
      {isClient && isTutorialActive && <TutorialOverlay />}
    </TutorialContext.Provider>
  );
} 