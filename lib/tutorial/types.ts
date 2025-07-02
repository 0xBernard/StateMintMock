import { type Route } from 'next';
import { ReactNode } from 'react';

// Z-Index configuration for tutorial steps
export interface ZIndexOverride {
  selector: string
  zIndex: number
  createStackingContext?: boolean
  preserveOriginal?: boolean
  children?: ZIndexOverride[]
}

// Enhanced tutorial step interface
export interface TutorialStep {
  id: string;
  title?: string;
  content: string | ReactNode;
  targetElementSelector: string;
  highlightPadding?: number;
  promptPlacement?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  isModal?: boolean;
  useTransparentOverlay?: boolean;
  
  // Enhanced overlay configuration
  overlayType?: 'dark' | 'transparent' | 'spotlight';
  spotlightPadding?: number;
  
  // Mobile-specific overrides
  mobilePromptPlacement?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  mobileContent?: string | ReactNode;
  mobileSpotlightPadding?: number;
  mobileTargetSelector?: string;
  
  // Z-index management
  zIndexOverrides?: ZIndexOverride[];
  
  action?: {
    type: 'click' | 'input' | 'navigation' | 'custom' | 'delay' | 'observe';
    selector?: string;
    expectedValue?: any;
    navigationPath?: Route;
    autoAdvance?: boolean;
    delayMs?: number;
    preventBubbling?: boolean;
    event?: 'domchange';
    condition?: (element: HTMLElement | null) => boolean;
  };
  
  showSkipButton?: boolean;
  showNextButton?: boolean;
  showPreviousButton?: boolean;
  
  // Lifecycle hooks with better typing
  onBeforeShow?: () => void | Promise<void>;
  onAfterShow?: () => void | Promise<void>;
  onBeforeStep?: () => void | Promise<void>;
  onAfterStep?: () => void | Promise<void>;
  onStepTimeout?: () => void | Promise<void>;
  
  waitForElement?: boolean;
  timeoutMs?: number;
}

// Simplified state management for ephemeral tutorials
export interface TutorialState {
  isActive: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  sessionId: string; // Unique per page load
  startedAt?: number;
  context: Record<string, any>; // Runtime context only
}

// Action types for state management
export type TutorialAction =
  | { type: 'START_TUTORIAL'; payload?: { stepIndex?: number } }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SKIP_TUTORIAL' }
  | { type: 'RESTART_TUTORIAL' }
  | { type: 'GO_TO_STEP'; payload: { stepId: string } }
  | { type: 'UPDATE_CONTEXT'; payload: Record<string, any> };

// Tutorial context interface
export interface TutorialContextValue {
  state: TutorialState;
  dispatch: (action: TutorialAction) => void;
  isStepVisible: (stepId: string) => boolean;
  reset: () => void;
  currentStep: TutorialStep | null;
}

// Legacy interfaces for compatibility
export interface TutorialProps {
  isActive: boolean;
  steps: TutorialStep[];
  currentStepId: string;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export interface TutorialPromptProps {
  step: TutorialStep;
  targetRect: DOMRect | null;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

// Performance-focused interfaces
export interface ElementTrackingState {
  isVisible: boolean;
  bounds: DOMRect | null;
  intersection: IntersectionObserverEntry | null;
}

export interface TutorialOverlayProps {
  type: 'dark' | 'transparent' | 'spotlight';
  target?: string;
  spotlightPadding?: number;
  zIndex?: number;
}

// Provider configuration
export interface TutorialProviderProps {
  children: ReactNode;
  steps: TutorialStep[];
  autoStart?: boolean;
  debugMode?: boolean;
}
