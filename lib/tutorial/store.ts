import { create } from 'zustand';
import { tutorialSteps } from './config';
import { TutorialStep } from './types';

interface TutorialState {
  isTutorialActive: boolean;
  currentStepIndex: number;
  activeStepConfig: TutorialStep | null;
  isTransitioning: boolean;
  stepHistory: string[];
  
  startTutorial: (startIndex?: number) => void;
  stopTutorial: () => void;
  nextStep: () => Promise<void>;
  previousStep: () => Promise<void>;
  goToStep: (stepId: string) => Promise<void>;
  
  _updateActiveConfig: (index: number) => TutorialStep | null;
  _lockTransition: (caller?: string) => void;
  _unlockTransition: (caller?: string) => void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  isTutorialActive: false,
  currentStepIndex: -1,
  activeStepConfig: null,
  isTransitioning: false,
  stepHistory: [],

  _updateActiveConfig: (index: number) => {
    if (index >= 0 && index < tutorialSteps.length) {
      const config = tutorialSteps[index];
      return config;
    }
    return null;
  },

  _lockTransition: (caller?: string) => {
    if (get().isTransitioning) {
      console.warn(`[Tutorial Store] Attempted to LOCK from ${caller || 'unknown'} but already locked. Current step: ${get().activeStepConfig?.id || 'N/A'}`);
      // It's often useful to see the stack trace in such cases during development
      // console.trace(); 
    }
    set({ isTransitioning: true });
    console.log(`[Tutorial Store] Transition LOCKED by ${caller || 'unknown'}`);
  },

  _unlockTransition: (caller?: string) => {
    if (!get().isTransitioning && get().isTutorialActive) { // Only warn if tutorial is active
      console.warn(`[Tutorial Store] Attempted to UNLOCK from ${caller || 'unknown'} but not locked. Current step: ${get().activeStepConfig?.id || 'N/A'}`);
      // console.trace();
    }
    set({ isTransitioning: false });
    console.log(`[Tutorial Store] Transition UNLOCKED by ${caller || 'unknown'}`);
  },

  startTutorial: (startIndex = 0) => {
    if (get().isTransitioning) {
      console.log(`[Tutorial Store] startTutorial called but already transitioning. Caller: startTutorial. Current step: ${get().activeStepConfig?.id}`);
      return;
    }
    
    const config = get()._updateActiveConfig(startIndex);
    set({
      isTutorialActive: true,
      currentStepIndex: startIndex,
      activeStepConfig: config,
      isTransitioning: false, // Explicitly set to false before potential onBeforeStep lock
      stepHistory: [],
    });
    
    console.log(`[Tutorial Store] Tutorial STARTED. Step: ${config?.id}`);
    
    if (config?.onBeforeStep) {
      get()._lockTransition(`startTutorial_onBeforeStep_${config.id}`);
      
      Promise.resolve(config.onBeforeStep())
        .then(() => {
          get()._unlockTransition(`startTutorial_onBeforeStep_${config.id}_then`);
        })
        .catch((error) => {
          console.error('Error during onBeforeStep in startTutorial:', error);
          get()._unlockTransition(`startTutorial_onBeforeStep_${config.id}_catch`);
        });
    }
  },

  stopTutorial: () => {
    if (get().isTransitioning) {
      console.log(`[Tutorial Store] stopTutorial called but already transitioning. Caller: stopTutorial. Current step: ${get().activeStepConfig?.id}`);
      // Allowing stopTutorial to proceed to try and clear state if possible, but with a warning.
      // return; 
    }
    
    get()._lockTransition('stopTutorial');
    
    const currentConfig = get().activeStepConfig;
    console.log(`[Tutorial Store] Tutorial STOPPING. Current step: ${currentConfig?.id}`);
    if (currentConfig?.onAfterStep && get().isTutorialActive) { // Ensure tutorial is still active
      Promise.resolve(currentConfig.onAfterStep())
        .then(() => {
          set({
            isTutorialActive: false,
            currentStepIndex: -1,
            activeStepConfig: null,
            isTransitioning: false, // Final unlock state
          });
          get()._unlockTransition('stopTutorial_onAfterStep_then'); // Unlock after state is fully cleared
        })
        .catch((error) => {
          console.error('Error during onAfterStep in stopTutorial:', error);
          set({
            isTutorialActive: false,
            currentStepIndex: -1,
            activeStepConfig: null,
            isTransitioning: false, // Final unlock state
          });
          get()._unlockTransition('stopTutorial_onAfterStep_catch'); // Unlock after state is fully cleared
        });
    } else {
    set({
      isTutorialActive: false,
      currentStepIndex: -1,
      activeStepConfig: null,
        isTransitioning: false, // Final unlock state
    });
      get()._unlockTransition('stopTutorial_else'); // Unlock after state is fully cleared
    }
  },

  nextStep: async () => {
    const currentStepId = get().activeStepConfig?.id || 'N/A';
    if (get().isTransitioning) {
      console.log(`[Tutorial Store] nextStep called but already transitioning. Caller: nextStep (attempting ${currentStepId} -> next). Current step: ${currentStepId}`);
      return;
    }
    
    const lockCaller = `nextStep_from_${currentStepId}`;
    try {
      get()._lockTransition(lockCaller);
      console.log(`[Tutorial Store] Moving to next tutorial step (from ${currentStepId})`);
      
    const currentConfig = get().activeStepConfig;
      const currentIndex = get().currentStepIndex;
      
    if (currentConfig?.onAfterStep) {
        console.log(`[Tutorial Store] Running onAfterStep for ${currentConfig.id}`);
      await currentConfig.onAfterStep();
    }

      const newIndex = currentIndex + 1;
      
    if (newIndex < tutorialSteps.length) {
      const newConfig = get()._updateActiveConfig(newIndex);
        console.log(`[Tutorial Store] New step will be: ${newConfig?.id}`);
        
        const updatedHistory = currentConfig 
          ? [...get().stepHistory, currentConfig.id] 
          : get().stepHistory;
          
        set({ 
          currentStepIndex: newIndex, 
          activeStepConfig: newConfig,
          stepHistory: updatedHistory
        });
        
      if (newConfig?.onBeforeStep) {
          console.log(`[Tutorial Store] Running onBeforeStep for new step ${newConfig.id}`);
          // Note: onBeforeStep might also lock/unlock if it's complex or async.
          // For simplicity here, we assume it's synchronous or handles its own async locking.
        await newConfig.onBeforeStep();
      }
        console.log(`[Tutorial Store] Successfully moved to step: ${newConfig?.id}`);
    } else {
        console.log(`[Tutorial Store] Tutorial completed (was on step ${currentConfig?.id}), stopping.`);
        // stopTutorial handles its own locking/unlocking
        // To prevent double unlock, we don't call _unlockTransition here before stopTutorial
        get().stopTutorial(); // stopTutorial will call _unlockTransition
        return; // Exit to avoid the finally block's unlock for this path
      }
    } catch (error) {
      console.error('[Tutorial Store] Error during tutorial next step:', error);
    } finally {
      // Only unlock if not transitioning due to stopTutorial() being called
      // and if still locked by *this* nextStep call.
      // This check is tricky because isTransitioning might be true due to stopTutorial's lock.
      // We rely on stopTutorial to manage the final unlock in that case.
      if (get().isTransitioning && get().activeStepConfig) { // activeStepConfig is null if stopTutorial completed
         // Check if the current step is NOT the one that would trigger stopTutorial (i.e., not the last step)
         // OR if stopTutorial was called, it would have nulled activeStepConfig or set isTutorialActive to false.
         const isLastStepScenario = (get().currentStepIndex + 1) >= tutorialSteps.length;
         if (!isLastStepScenario || get().isTutorialActive) {
            get()._unlockTransition(`${lockCaller}_finally`);
         } else {
            console.log(`[Tutorial Store] nextStep_finally: Unlock deferred to stopTutorial for step ${currentStepId}`);
         }
      } else if (!get().activeStepConfig && !get().isTutorialActive) {
         console.log(`[Tutorial Store] nextStep_finally: Tutorial seems stopped, ensuring unlock. Caller: ${lockCaller}_finally_stopped_state`);
         get()._unlockTransition(`${lockCaller}_finally_stopped_state`);
      }
    }
  },

  previousStep: async () => {
    // Implementation for previousStep would also need careful lock/unlock handling
    console.log("[Tutorial Store] previousStep called (currently a no-op)");
    return;
  },

  goToStep: async (stepId: string) => {
    const currentStepId = get().activeStepConfig?.id || 'N/A';
    if (get().isTransitioning) {
      console.log(`[Tutorial Store] goToStep(${stepId}) called but already transitioning. Caller: goToStep. Current step: ${currentStepId}`);
      return;
    }
    
    const lockCaller = `goToStep_to_${stepId}_from_${currentStepId}`;
    try {
      get()._lockTransition(lockCaller);
      console.log(`[Tutorial Store] Going to step: ${stepId} (from ${currentStepId})`);
      
      const stepIndex = tutorialSteps.findIndex((step) => step.id === stepId);
      
    if (stepIndex !== -1) {
        const currentConfig = get().activeStepConfig;
        
        if (currentConfig?.onAfterStep) {
          console.log(`[Tutorial Store] Running onAfterStep for current step ${currentConfig.id} before goToStep`);
          await currentConfig.onAfterStep();
        }
        
      const newConfig = get()._updateActiveConfig(stepIndex);
        
        set({ 
          currentStepIndex: stepIndex, 
          activeStepConfig: newConfig,
          // Consider if stepHistory needs adjustment here
        });
        
      if (newConfig?.onBeforeStep) {
          console.log(`[Tutorial Store] Running onBeforeStep for new step ${newConfig.id} after goToStep`);
        await newConfig.onBeforeStep();
      }
        console.log(`[Tutorial Store] Successfully went to step: ${newConfig?.id}`);
      } else {
        console.warn(`[Tutorial Store] goToStep: StepId ${stepId} not found.`);
      }
    } catch (error) {
      console.error('[Tutorial Store] Error during tutorial goToStep:', error);
    } finally {
      get()._unlockTransition(`${lockCaller}_finally`);
    }
  },
})); 