// Core components and providers
export { TutorialProvider, useTutorial, useIsTutorialStep } from './ephemeral-provider';
export { TutorialLayer } from './tutorial-layer';

// Enhanced configuration
export { enhancedTutorialSteps, getTutorialSteps } from './enhanced-config';

// Z-Index management
export { AdvancedZIndexManager, EphemeralZIndexManager } from './z-index-manager';

// Performance hooks
export { 
  useElementTracking, 
  useZIndexOverride, 
  useTutorialHighlight,
  useTutorialCleanup,
  useFlipAnimation,
  useDebouncedCallback,
  useThrottledCallback,
  generateSessionId
} from './hooks';

// Types
export type {
  TutorialStep,
  TutorialState,
  TutorialAction,
  TutorialContextValue,
  TutorialProviderProps,
  ZIndexOverride,
  ElementTrackingState,
  TutorialOverlayProps
} from './types';

// Components
export { TutorialButton } from '../../components/tutorial/tutorial-button-enhanced';

// Legacy exports for backward compatibility
export { tutorialSteps } from './config';
export type { TutorialProps, TutorialPromptProps } from './types'; 