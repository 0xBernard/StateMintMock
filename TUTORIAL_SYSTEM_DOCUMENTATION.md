# StateMint Tutorial System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tutorial Step Configuration](#tutorial-step-configuration)
4. [Components](#components)
5. [Mobile Adaptation](#mobile-adaptation)
6. [State Management](#state-management)
7. [Styling and CSS](#styling-and-css)
8. [Integration Guide](#integration-guide)
9. [Debugging and Troubleshooting](#debugging-and-troubleshooting)
10. [Best Practices](#best-practices)

## Overview

The StateMint tutorial system is a comprehensive, mobile-responsive guided tour implementation that overlays interactive elements on the application to guide users through key features. The system supports complex workflows including authentication, navigation, dialog interactions, and purchase flows.

### Key Features
- **Ephemeral Provider Architecture**: Modern React context-based tutorial management
- **Mobile-First Design**: Responsive overlays and adaptive positioning with 1024px breakpoint
- **Portal-Based Rendering**: Isolated rendering layer for tutorial elements
- **State Management**: Context-powered state with lifecycle hooks
- **Element Targeting**: Flexible CSS selector-based element targeting with mobile overrides
- **Action Handling**: Automatic progression based on user interactions
- **Z-Index Management**: Dynamic elevation of interactive elements

## Architecture

The tutorial system follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        Application Layer                     │
├─────────────────────────────────────────────────────────────┤
│    EphemeralProvider    │       TutorialLayer              │
├─────────────────────────┼─────────────────────────────────┤
│   Tutorial Configuration │     Mobile Utilities           │
├─────────────────────────────────────────────────────────────┤
│                      CSS Layer & Portal                     │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

The tutorial system is organized across several directories:

```
lib/tutorial/
├── types.ts                 # TypeScript interfaces and types
├── config.ts               # Tutorial step definitions
├── enhanced-config.ts      # Enhanced step configurations for demo mode
├── mobile-utils.ts         # Mobile detection and adaptation
├── utils.ts                # Utility functions
├── hooks.ts                # React hooks
├── tutorial-layer.tsx      # Main rendering layer
├── ephemeral-provider.tsx  # Context provider implementation
└── z-index-manager.ts      # Z-index management utilities

components/tutorial/
├── client-tutorial-wrapper.tsx # Client-side tutorial wrapper
└── index.ts                     # Component exports

app/
├── globals.css            # Main tutorial CSS styles
├── tutorial.css           # Legacy tutorial styles
└── tutorial-enhanced.css  # Enhanced tutorial styles
```

### Core Components

1. **EphemeralProvider**: React context provider that manages tutorial state and renders child components
2. **TutorialLayer**: Main rendering component for prompts, highlights, and backdrops
3. **ClientTutorialWrapper**: Client-side wrapper that initializes the tutorial system
4. **Tutorial Configuration**: Step definitions and mobile adaptations
5. **Mobile Utilities**: Mobile detection and responsive adaptations

## Tutorial Step Configuration

### Basic Step Structure

```typescript
interface TutorialStep {
  // Core properties
  id: string;                           // Unique step identifier
  title?: string;                       // Optional step title
  content: string | ReactNode;          // Step content/instructions
  targetElementSelector: string;        // CSS selector for target element
  
  // Layout and positioning
  promptPlacement?: PromptPlacement;    // Where to show the prompt
  isModal?: boolean;                    // Center modal vs positioned prompt
  highlightPadding?: number;            // Padding around highlighted elements
  
  // Overlay configuration
  overlayType?: 'dark' | 'transparent' | 'spotlight';
  spotlightPadding?: number;
  useTransparentOverlay?: boolean;      // Legacy property
  
  // Mobile-specific overrides
  mobilePromptPlacement?: PromptPlacement;
  mobileContent?: string | ReactNode;
  mobileSpotlightPadding?: number;
  mobileTargetSelector?: string;
  
  // Interaction handling
  action?: TutorialAction;              // How the step progresses
  showNextButton?: boolean;             // Show/hide next button
  showPreviousButton?: boolean;         // Show/hide previous button
  showSkipButton?: boolean;             // Show/hide skip button
  
  // Lifecycle hooks
  onBeforeShow?: () => void | Promise<void>;
  onAfterShow?: () => void | Promise<void>;
  onBeforeStep?: () => void | Promise<void>;
  onAfterStep?: () => void | Promise<void>;
  
  // Behavior modifiers
  waitForElement?: boolean;             // Wait for element before showing
  timeoutMs?: number;                   // Step timeout
  zIndexOverrides?: ZIndexOverride[];   // Custom z-index management
}
```

### Prompt Placement Options

The tutorial system supports comprehensive prompt positioning:

```typescript
type PromptPlacement = 
  | 'top' | 'bottom' | 'left' | 'right' | 'center'
  | 'top-start' | 'top-end' 
  | 'bottom-start' | 'bottom-end'
  | 'left-start' | 'left-end' 
  | 'right-start' | 'right-end';
```

### Action Types

Steps can progress automatically based on different triggers:

```typescript
interface TutorialAction {
  type: 'click' | 'input' | 'navigation' | 'custom' | 'delay' | 'observe';
  selector?: string;                    // Target element selector
  expectedValue?: any;                  // Expected input value
  navigationPath?: Route;               // Navigation target
  autoAdvance?: boolean;                // Auto-advance on action
  delayMs?: number;                     // Delay duration
  preventBubbling?: boolean;            // Prevent event bubbling
  condition?: (element: HTMLElement | null) => boolean;
}
```

### Example Step Configuration (Actual from config.ts)

```typescript
{
  id: 'login-prompt',
  title: 'Login Required',
  content: "Click the 'Login' button in the header to open the login dialog.",
  targetElementSelector: '[data-tutorial-id="header-login-button"]',
  promptPlacement: 'bottom-end',
  isModal: true,
  highlightPadding: 12,
  showNextButton: false,
  showPreviousButton: false,
  waitForElement: true,
  action: {
    type: 'click',
    autoAdvance: true,
    preventBubbling: false,
  },
  onBeforeStep: async () => {
    console.log('Setting up login step');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return new Promise(resolve => {
      const checkElement = () => {
        const loginButton = document.querySelector('[data-tutorial-id="header-login-button"]');
        if (loginButton) {
          console.log('Login button found, proceeding with tutorial');
          resolve();
        } else {
          console.log('Login button not found, waiting...');
          setTimeout(checkElement, 300);
        }
      };
      checkElement();
    });
  },
  onAfterStep: async () => {
    console.log('Login step completed');
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}
```

### Current Tutorial Flow

The tutorial system currently implements this flow:

1. **welcome-on-marketplace**: Welcome modal with center placement
2. **login-prompt**: Login button highlighting with auto-advance on click
3. **login-completion**: Success message after login
4. **portfolio-navigation**: Navigate to portfolio page
5. **portfolio-overview**: Portfolio explanation with left-side prompt
6. **portfolio-stats-summary-highlight**: Portfolio stats explanation
7. **add-funds-button**: Add funds preparation step
8. **add-funds-dialog-opened**: Add funds dialog interaction
9. **deposit-confirmation**: Deposit success confirmation
10. **return-to-marketplace**: Navigate back to marketplace
11. **coin-selection-prompt**: Select a coin to purchase
12. **coin-detail-purchase**: Purchase explanation on coin detail page
13. **purchase-button-highlight**: Purchase button highlighting
14. **purchase-success**: Purchase completion celebration

## Components

### EphemeralProvider

The main context provider that orchestrates the tutorial system:

**Location**: `lib/tutorial/ephemeral-provider.tsx`

**Key Responsibilities**:
- Manages tutorial state and context with React hooks
- Handles mobile detection and adaptation
- Dynamically loads and renders TutorialLayer
- Provides tutorial control methods
- Manages step lifecycle and transitions

**Usage**:
```typescript
// In your app root or layout
<TutorialProvider steps={tutorialSteps} autoStart={false}>
  <YourAppContent />
</TutorialProvider>
```

**Context Methods**:
```typescript
interface TutorialContextValue {
  state: TutorialState;
  dispatch: (action: TutorialAction) => void;
  isStepVisible: (stepId: string) => boolean;
  reset: () => void;
  currentStep: TutorialStep | null; // Mobile-adapted step
}
```

### TutorialLayer

The main rendering component that creates the visual tutorial interface:

**Location**: `lib/tutorial/tutorial-layer.tsx`

**Key Responsibilities**:
- Renders tutorial prompts with positioning
- Creates backdrop overlays with holes for interactive elements
- Manages highlight boxes around target elements
- Handles scroll compensation and mobile adaptations
- Creates portal containers for isolated rendering

**Rendering Layers**:
1. **Backdrop Layer**: Dark overlay with holes for interactive elements
2. **Highlight Layer**: Golden borders around target elements
3. **Interactive Highlights**: Separate highlights for clickable elements
4. **Prompt Layer**: Positioned tutorial prompts with content

### ClientTutorialWrapper

Client-side wrapper that initializes the tutorial system:

**Location**: `components/tutorial/client-tutorial-wrapper.tsx`

**Key Responsibilities**:
- Provides client-side tutorial initialization
- Manages tutorial mode (full vs demo)
- Wraps the ephemeral provider with configuration

**Usage**:
```typescript
<ClientTutorialWrapper mode="full">
  <App />
</ClientTutorialWrapper>
```

## Mobile Adaptation

The tutorial system includes comprehensive mobile support through adaptive configurations and responsive positioning.

### Mobile Detection

**Location**: `lib/tutorial/mobile-utils.ts`

```typescript
// Mobile breakpoint (1024px - same as Tailwind's lg breakpoint)
const MOBILE_BREAKPOINT = 1024;

export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function useMobileDetection(): boolean {
  // React hook for mobile detection with SSR safety and resize listener
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });
  
  React.useEffect(() => {
    function handleResize() {
      const newIsMobile = isMobileViewport();
      setIsMobile(newIsMobile);
    }
    
    // Initial check on mount
    setIsMobile(isMobileViewport());
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
}
```

### Mobile Step Adaptation

Steps are automatically adapted for mobile using `getMobileAdaptedStep()`:

```typescript
export function getMobileAdaptedStep(step: TutorialStep): TutorialStep {
  if (!isMobileViewport()) return step;
  
  return {
    ...step,
    // Use mobile overrides if available
    promptPlacement: step.mobilePromptPlacement || getMobileFriendlyPlacement(step.promptPlacement),
    content: step.mobileContent || step.content,
    spotlightPadding: step.mobileSpotlightPadding || getMobileSpotlightPadding(step.spotlightPadding),
    targetElementSelector: step.mobileTargetSelector || step.targetElementSelector,
  };
}
```

### Mobile-Specific Features

1. **Adaptive Positioning**: Prompts are repositioned for mobile viewports
2. **Touch-Friendly Targets**: Increased padding and touch targets
3. **Mobile Content**: Alternative content optimized for mobile screens
4. **Responsive Sizing**: Prompts adapt to screen width
5. **Mobile Selectors**: Different elements can be targeted on mobile

### Mobile Navigation Handling

The tutorial system handles mobile navigation patterns:

```typescript
// Example: Portfolio navigation on mobile
{
  id: 'portfolio-navigation',
  targetElementSelector: '[data-tutorial-id="portfolio-link"]',     // Desktop: sidebar link
  mobileTargetSelector: '[data-tutorial-id="mobile-portfolio-widget"]', // Mobile: different element
  promptPlacement: 'right',                                        // Desktop positioning
  mobilePromptPlacement: 'bottom',                                  // Mobile positioning
  content: "Click 'My Portfolio' in the sidebar.",
  mobileContent: "Tap your portfolio card below to view investments."
}
```

## State Management

### Context-Based State Management

The tutorial system uses React Context with useReducer for predictable state management:

```typescript
interface TutorialState {
  isActive: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  sessionId: string;
  startedAt?: number;
  context: Record<string, any>;
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
```

### Tutorial Context Interface

```typescript
interface TutorialContextValue {
  state: TutorialState;
  dispatch: (action: TutorialAction) => void;
  isStepVisible: (stepId: string) => boolean;
  reset: () => void;
  currentStep: TutorialStep | null;
}
```

### Step Transition Management

The provider handles step transitions with proper lifecycle management:

```typescript
// Mobile-adapted current step
const currentStep = useMemo(() => {
  if (!state.isActive || state.currentStepIndex >= state.steps.length) {
    return null;
  }
  const rawStep = state.steps[state.currentStepIndex];
  const adaptedStep = getMobileAdaptedStep(rawStep);
  
  return adaptedStep;
}, [state.isActive, state.currentStepIndex, state.steps, isMobile]);
```

### Lifecycle Hook Execution

Steps can define lifecycle hooks that are executed during transitions:

```typescript
// Example lifecycle hooks
onBeforeStep: async () => {
  console.log('Setting up login step');
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Wait for elements to be available
},
onAfterStep: async () => {
  console.log('Login step completed');
  return new Promise(resolve => setTimeout(resolve, 300));
}
```

## Styling and CSS

The tutorial system uses a comprehensive CSS architecture for consistent visual presentation.

### CSS Variables

**Location**: `app/globals.css` and `app/tutorial-enhanced.css`

```css
:root {
  /* Tutorial color scheme */
  --tutorial-backdrop-color: rgba(0, 0, 0, 0.75);
  --tutorial-highlight-color: rgba(242, 180, 24, 0.2); /* globals.css */
  --tutorial-border-color: rgb(242, 180, 24);
  
  /* Z-index hierarchy - globals.css */
  --z-tutorial-backdrop: 2000;
  --z-tutorial-highlight: 2001;
  --z-tutorial-prompt: 1000001;
  
  /* Alternative Z-index in tutorial-enhanced.css */
  --tutorial-prompt-z: 9999;
}
```

### Component Classes

**Backdrop Overlay**:
```css
.tutorial-backdrop {
  position: fixed !important;
  background-color: var(--tutorial-backdrop-color) !important;
  z-index: var(--z-tutorial-backdrop) !important;
  pointer-events: auto !important;
}
```

**Target Highlighting**:
```css
.tutorial-highlight {
  position: fixed !important;
  border: 4px solid var(--tutorial-border-color) !important;
  border-radius: 8px !important;
  background-color: var(--tutorial-highlight-color) !important;
  z-index: var(--z-tutorial-highlight) !important;
  pointer-events: none !important;
  animation: tutorial-highlight-pulse 2s infinite !important;
  box-shadow: 0 0 20px rgba(242, 180, 24, 0.5) !important;
}
```

**Interactive Elements**:
```css
.tutorial-interactive {
  position: relative !important;
  z-index: var(--z-tutorial-interactive) !important;
  pointer-events: auto !important;
  cursor: pointer !important;
}
```

**Tutorial Prompts**:
```css
.tutorial-prompt-container {
  position: fixed !important;
  z-index: var(--z-tutorial-prompt) !important;
  pointer-events: auto !important;
}

.tutorial-prompt {
  background-color: var(--card) !important;
  border: 1px solid var(--border) !important;
  border-radius: 12px !important;
  padding: 24px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
  max-width: 400px !important;
  pointer-events: auto !important;
  z-index: var(--z-tutorial-prompt) !important;
}
```

### Animations

The tutorial system includes smooth animations for visual feedback:

```css
@keyframes tutorial-highlight-pulse {
  0% { 
    border-color: var(--tutorial-border-color);
    box-shadow: 0 0 10px rgba(242, 180, 24, 0.3);
    transform: scale(1);
  }
  50% { 
    border-color: var(--tutorial-border-color);
    box-shadow: 0 0 20px rgba(242, 180, 24, 0.6);
    transform: scale(1.02);
  }
  100% { 
    border-color: var(--tutorial-border-color);
    box-shadow: 0 0 10px rgba(242, 180, 24, 0.3);
    transform: scale(1);
  }
}

/* Applied via .tutorial-highlight-pulse class */
.tutorial-highlight-pulse {
  animation: tutorial-highlight-pulse 2s infinite;
}
```

### Step-Specific Styling

CSS can target specific tutorial steps using data attributes:

```css
/* Step-specific styling - actual implementation */
[data-tutorial-step="login-prompt"] .tutorial-prompt {
  position: fixed !important;
  top: calc(64px + 1rem + 20px) !important; /* Below header with spacing */
  left: 50% !important;
  transform: translateX(-50%) !important;
  z-index: var(--z-tutorial-prompt) !important;
}

/* Additional step-specific classes available */
.tutorial-active[data-tutorial-step="portfolio-overview"] .tutorial-prompt,
.tutorial-active[data-tutorial-step="portfolio-stats-summary-highlight"] .tutorial-prompt {
  background: var(--card);
  border: 1px solid var(--border);
}
```

### Mobile Responsive Styles

```css
@media (max-width: 640px) {
  .tutorial-prompt {
    max-width: calc(100vw - 2rem) !important;
    min-width: calc(100vw - 4rem) !important;
    margin: 0 auto !important;
  }
  
  .tutorial-highlight {
    border-width: 3px !important; /* Thicker on mobile for visibility */
  }
}
```

## Integration Guide

### Element Targeting

To make elements targetable by the tutorial system, add `data-tutorial-id` attributes:

```tsx
// Standard targeting
<Button data-tutorial-id="login-button">
  Login
</Button>

// Mobile-specific targeting
<div data-tutorial-id="mobile-portfolio-widget" className="md:hidden">
  {/* Mobile-only element */}
</div>

<aside data-tutorial-id="portfolio-link" className="hidden md:block">
  {/* Desktop-only element */}
</aside>
```

### Helper Functions

**Location**: `lib/tutorial/utils.ts`

```typescript
// Add tutorial targeting to elements
export function tutorialTarget(id: string) {
  return { 'data-tutorial-id': id };
}

// Add interactive tutorial properties
export function tutorialInteractive(id: string) {
  return { 
    'data-tutorial-id': id,
    className: 'tutorial-interactive'
  };
}

// Usage in components
<Button {...tutorialTarget('add-funds-button')}>
  Add Funds
</Button>
```

### Starting Tutorials

```typescript
// From a component
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';

function MyComponent() {
  const { dispatch } = useTutorial();
  
  return (
    <Button onClick={() => dispatch({ type: 'START_TUTORIAL' })}>
      Start Tutorial
    </Button>
  );
}

// Start from specific step
dispatch({ type: 'GO_TO_STEP', payload: { stepId: 'portfolio-overview' } });

// From page navigation
useEffect(() => {
  if (shouldStartTutorial) {
    dispatch({ type: 'START_TUTORIAL' });
  }
}, []);
```

### Configuration Files

**Primary Configuration**: `lib/tutorial/config.ts`
- Main tutorial step definitions
- Used by the standard tutorial provider

**Enhanced Configuration**: `lib/tutorial/enhanced-config.ts`
- Advanced tutorial steps with additional features
- Used by the ephemeral provider for demo modes

**Example Integration**:
```typescript
// In your layout or app root
import { TutorialProvider } from '@/components/tutorial/tutorial-provider';

export default function Layout({ children }) {
  return (
    <TutorialProvider>
      {children}
    </TutorialProvider>
  );
}
```

### Provider Setup

The tutorial system currently uses a single provider implementation:

**Current Implementation**:
```typescript
// app/layout.tsx
import { ClientTutorialWrapper } from '@/components/tutorial/client-tutorial-wrapper';

export default function RootLayout({ children }) {
  const tutorialMode = process.env.NODE_ENV === 'development' ? 'full' : 'demo';

  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>
          <FinancialProvider>
            <MarketProvider>
              <ClientTutorialWrapper mode={tutorialMode}>
                {children}
              </ClientTutorialWrapper>
            </MarketProvider>
          </FinancialProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Debugging and Troubleshooting

### Debug Logging

The tutorial system includes comprehensive debug logging:

```typescript
// Provider logging
console.log('[Tutorial Provider] Step adaptation:', {
  stepId: rawStep.id,
  isMobile,
  originalPlacement: rawStep.promptPlacement,
  adaptedPlacement: adaptedStep.promptPlacement,
  changed: rawStep.promptPlacement !== adaptedStep.promptPlacement
});

// Mobile detection logging
console.log('[Mobile Detection] Resize detected:', {
  width: window.innerWidth,
  isMobile: newIsMobile,
  breakpoint: MOBILE_BREAKPOINT
});
```

### Common Issues and Solutions

**1. Elements Not Found**
```typescript
// Problem: Tutorial can't find target elements
// Solution: Ensure elements have correct data-tutorial-id attributes
// Add waitForElement: true to step configuration

{
  id: 'my-step',
  targetElementSelector: '[data-tutorial-id="my-element"]',
  waitForElement: true, // Wait for element to appear
  timeoutMs: 5000 // Set timeout for waiting
}
```

**2. Mobile Layout Issues**
```typescript
// Problem: Prompts positioned incorrectly on mobile
// Solution: Add mobile-specific configurations

{
  id: 'mobile-step',
  promptPlacement: 'right',           // Desktop
  mobilePromptPlacement: 'bottom',    // Mobile override
  spotlightPadding: 8,                // Desktop padding
  mobileSpotlightPadding: 16          // Mobile padding
}
```

**3. Z-Index Conflicts**
```typescript
// Problem: Tutorial elements appearing behind other UI
// Solution: Use z-index overrides

{
  id: 'dialog-step',
  zIndexOverrides: [
    {
      selector: '[role="dialog"]',
      zIndex: 10001,
      createStackingContext: true
    }
  ]
}
```

**4. Step Transition Issues**
```typescript
// Problem: Steps not advancing properly
// Solution: Check transition locks and async operations

// Ensure onAfterStep completes before next step
onAfterStep: async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Ensure UI updates complete before transition
}
```

### Development Tools

**Console Debugging**:
Look for messages prefixed with:
- `[Tutorial Provider]` - Provider state and adaptation
- `[Mobile Detection]` - Mobile viewport changes
- `[Tutorial Debug]` - General debugging information

**Element Discovery**:
```typescript
// Find all tutorial-targetable elements
const tutorialElements = document.querySelectorAll('[data-tutorial-id]');
console.table(Array.from(tutorialElements).map(el => ({
  id: el.getAttribute('data-tutorial-id'),
  tag: el.tagName,
  visible: el.getBoundingClientRect().width > 0,
  rect: el.getBoundingClientRect()
})));

// Check current tutorial state
document.body.classList.contains('tutorial-active'); // true if tutorial running
document.body.getAttribute('data-tutorial-step'); // current step ID if set
```

## Best Practices

### Step Design

**1. Clear Targeting**
```typescript
// Good: Specific, semantic targeting
targetElementSelector: '[data-tutorial-id="add-funds-button"]'

// Avoid: Generic selectors that might match multiple elements
targetElementSelector: 'button' // Too generic
```

**2. Mobile-First Design**
```typescript
// Always consider mobile experience
{
  id: 'my-step',
  content: "Click the sidebar link to continue.",
  mobileContent: "Tap the menu button, then select the option.",
  targetElementSelector: '[data-tutorial-id="sidebar-link"]',
  mobileTargetSelector: '[data-tutorial-id="mobile-menu-button"]'
}
```

**3. Graceful Fallbacks**
```typescript
// Handle missing elements gracefully
onBeforeStep: async () => {
  const element = document.querySelector('[data-tutorial-id="target"]');
  if (!element) {
    console.warn('Tutorial target not found, skipping step');
    // Skip to next step or show alternative content
  }
}
```

### Performance Optimization

**1. Lazy Loading**
```typescript
// Load tutorial components only when needed
const TutorialProvider = lazy(() => import('@/components/tutorial/tutorial-provider'));

// Use in app
<Suspense fallback={<div>Loading...</div>}>
  <TutorialProvider>
    <App />
  </TutorialProvider>
</Suspense>
```

**2. Efficient Selectors**
```typescript
// Good: Specific ID selectors
'[data-tutorial-id="specific-button"]'

// Avoid: Complex descendant selectors
'.complex .nested .selector button:nth-child(2)'
```

**3. Cleanup Management**
```typescript
// Ensure proper cleanup in lifecycle hooks
onAfterStep: async () => {
  // Clean up any event listeners
  document.removeEventListener('customEvent', handler);
  
  // Clear any timeouts
  clearTimeout(timeoutId);
}
```

### Content Guidelines

**1. Concise Instructions**
```typescript
// Good: Clear, actionable instructions
content: "Click the 'Add Funds' button to deposit money."

// Avoid: Verbose explanations
content: "Now that you're logged in, you might want to add some funds to your account. To do this, you need to find the Add Funds button and click on it."
```

**2. Context-Aware Content**
```typescript
// Adapt content based on state
content: user.hasBalance 
  ? "You have funds available. Let's make a purchase!"
  : "First, let's add some funds to your account.",
```

**3. Mobile Optimization**
```typescript
// Shorter content for mobile
content: "Click 'My Portfolio' in the sidebar to view your investments.",
mobileContent: "Tap your portfolio card to view investments."
```

### Testing Strategies

**1. Cross-Device Testing**
```typescript
// Test on multiple viewport sizes
const testViewports = [
  { width: 375, height: 667 },   // iPhone SE
  { width: 768, height: 1024 },  // iPad
  { width: 1920, height: 1080 }  // Desktop
];

testViewports.forEach(viewport => {
  // Test tutorial on each viewport
});
```

**2. Step Validation**
```typescript
// Validate each step configuration
const validateStep = (step: TutorialStep) => {
  const element = document.querySelector(step.targetElementSelector);
  if (!element) {
    console.error(`Step ${step.id}: Target element not found`);
  }
  
  if (step.mobileTargetSelector) {
    const mobileElement = document.querySelector(step.mobileTargetSelector);
    if (!mobileElement) {
      console.error(`Step ${step.id}: Mobile target element not found`);
    }
  }
};
```

**3. Integration Testing**
```typescript
// Test complete tutorial flows
const testTutorialFlow = async () => {
  startTutorial();
  
  for (const step of tutorialSteps) {
    await waitForStep(step.id);
    await simulateStepCompletion(step);
    assertStepProgression();
  }
  
  assertTutorialCompletion();
};
```

---

This documentation provides a comprehensive guide to understanding, implementing, and maintaining the StateMint tutorial system. The system uses modern React patterns with context-based state management and comprehensive mobile adaptation for a seamless user experience across all devices. 