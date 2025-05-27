## Deep Dive: Z-Index Management, State Management, and Performance Optimizations

### 1. Advanced Z-Index Management

The z-index manager needs to handle complex scenarios where elements have different stacking contexts, CSS-in-JS styles, and dynamic rendering:

```typescript
interface ZIndexOverride {
  selector: string
  zIndex: number
  createStackingContext?: boolean
  preserveOriginal?: boolean
  children?: ZIndexOverride[]
}

class AdvancedZIndexManager {
  private originalStyles = new Map<HTMLElement, {
    zIndex: string
    position: string
    transform?: string
    opacity?: string
    filter?: string
    willChange?: string
  }>()
  
  private mutationObserver: MutationObserver
  private activeSelectors = new Set<string>()
  
  constructor() {
    // Watch for DOM changes that might affect our overrides
    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.reapplyOverrides()
        }
      })
    })
  }

  /**
   * Elevate elements with intelligent stacking context creation
   */
  elevate(override: ZIndexOverride) {
    const elements = document.querySelectorAll(override.selector)
    
    elements.forEach(el => {
      const htmlEl = el as HTMLElement
      
      // Store original styles
      if (!this.originalStyles.has(htmlEl)) {
        this.originalStyles.set(htmlEl, {
          zIndex: htmlEl.style.zIndex || getComputedStyle(htmlEl).zIndex,
          position: htmlEl.style.position || getComputedStyle(htmlEl).position,
          transform: htmlEl.style.transform,
          opacity: htmlEl.style.opacity,
          filter: htmlEl.style.filter,
          willChange: htmlEl.style.willChange
        })
      }
      
      // Apply z-index
      htmlEl.style.zIndex = String(override.zIndex)
      
      // Ensure z-index works by creating stacking context
      if (override.createStackingContext !== false) {
        const computed = getComputedStyle(htmlEl)
        
        // If element doesn't already create a stacking context, create one
        if (computed.position === 'static') {
          htmlEl.style.position = 'relative'
        }
        
        // For extra reliability, can force a stacking context
        if (override.createStackingContext === true) {
          htmlEl.style.isolation = 'isolate'
        }
      }
      
      // Handle children if specified
      if (override.children) {
        override.children.forEach(childOverride => {
          this.elevate(childOverride)
        })
      }
    })
    
    this.activeSelectors.add(override.selector)
    this.startObserving()
  }

  /**
   * Batch operations for performance
   */
  batchElevate(overrides: ZIndexOverride[]) {
    // Sort by z-index to avoid conflicts
    const sorted = [...overrides].sort((a, b) => a.zIndex - b.zIndex)
    
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      sorted.forEach(override => this.elevate(override))
    })
  }

  /**
   * Smart restoration that handles dynamic elements
   */
  restore(selector: string) {
    const elements = document.querySelectorAll(selector)
    
    elements.forEach(el => {
      const htmlEl = el as HTMLElement
      const original = this.originalStyles.get(htmlEl)
      
      if (original) {
        // Restore all properties
        Object.entries(original).forEach(([prop, value]) => {
          if (value !== undefined && value !== '') {
            (htmlEl.style as any)[prop] = value
          } else {
            htmlEl.style.removeProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase())
          }
        })
        
        // Remove forced stacking context
        htmlEl.style.removeProperty('isolation')
        
        this.originalStyles.delete(htmlEl)
      }
    })
    
    this.activeSelectors.delete(selector)
    
    if (this.activeSelectors.size === 0) {
      this.stopObserving()
    }
  }

  /**
   * Handle dynamic content
   */
  private reapplyOverrides() {
    this.activeSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        const htmlEl = el as HTMLElement
        if (!this.originalStyles.has(htmlEl)) {
          // New element appeared, apply override
          const existing = Array.from(this.activeSelectors).find(s => 
            htmlEl.matches(s)
          )
          if (existing) {
            // Re-apply the override to new element
            const currentZ = htmlEl.style.zIndex
            if (currentZ) {
              this.elevate({ selector: existing, zIndex: parseInt(currentZ) })
            }
          }
        }
      })
    })
  }

  private startObserving() {
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  private stopObserving() {
    this.mutationObserver.disconnect()
  }

  /**
   * Debug helper to visualize stacking contexts
   */
  debugStackingContexts() {
    const style = document.createElement('style')
    style.textContent = `
      [data-tutorial-elevated] {
        outline: 2px solid red !important;
        outline-offset: -2px !important;
      }
      [data-tutorial-elevated]::after {
        content: attr(data-tutorial-z-index) !important;
        position: absolute !important;
        top: 0 !important;
        right: 0 !important;
        background: red !important;
        color: white !important;
        padding: 2px 6px !important;
        font-size: 12px !important;
        z-index: 999999 !important;
      }
    `
    document.head.appendChild(style)
    
    this.originalStyles.forEach((_, element) => {
      element.setAttribute('data-tutorial-elevated', 'true')
      element.setAttribute('data-tutorial-z-index', element.style.zIndex)
    })
    
    return () => {
      style.remove()
      this.originalStyles.forEach((_, element) => {
        element.removeAttribute('data-tutorial-elevated')
        element.removeAttribute('data-tutorial-z-index')
      })
    }
  }
}
```

Ah, that's a crucial detail! Since this is a repeatable demo/mock site, let's refactor the state management to be entirely session-based with no persistence:

## Ephemeral State Management for Demo Tutorials

### 1. Simplified State Management (No Persistence)

```typescript
// Core types remain similar but simpler
interface TutorialState {
  isActive: boolean
  currentStepIndex: number
  steps: TutorialStep[]
  sessionId: string // Unique per page load
  startedAt?: number
  context: Record<string, any> // Runtime context only
}

// Simpler action types without persistence concerns
type TutorialAction =
  | { type: 'START_TUTORIAL' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SKIP_TUTORIAL' }
  | { type: 'RESTART_TUTORIAL' }
  | { type: 'UPDATE_CONTEXT'; payload: Record<string, any> }

// Lightweight state manager using React context
const TutorialContext = createContext<{
  state: TutorialState
  dispatch: (action: TutorialAction) => void
  isStepVisible: (stepId: string) => boolean
  reset: () => void
} | null>(null)

export const TutorialProvider: React.FC<{ 
  children: ReactNode
  steps: TutorialStep[]
  autoStart?: boolean
}> = ({ children, steps, autoStart = false }) => {
  const [state, setState] = useState<TutorialState>(() => ({
    isActive: autoStart,
    currentStepIndex: 0,
    steps,
    sessionId: generateSessionId(),
    startedAt: autoStart ? Date.now() : undefined,
    context: {}
  }))

  const dispatch = useCallback((action: TutorialAction) => {
    setState(prev => {
      switch (action.type) {
        case 'START_TUTORIAL':
          return {
            ...prev,
            isActive: true,
            currentStepIndex: 0,
            startedAt: Date.now(),
            context: {} // Fresh context each time
          }

        case 'NEXT_STEP': {
          const nextIndex = calculateNextStep(prev)
          if (nextIndex >= prev.steps.length) {
            // Tutorial complete - just deactivate
            return { ...prev, isActive: false }
          }
          return { ...prev, currentStepIndex: nextIndex }
        }

        case 'SKIP_TUTORIAL':
          return { ...prev, isActive: false }

        case 'RESTART_TUTORIAL':
          return {
            ...prev,
            isActive: true,
            currentStepIndex: 0,
            startedAt: Date.now(),
            context: {},
            sessionId: generateSessionId() // New session
          }

        case 'UPDATE_CONTEXT':
          return {
            ...prev,
            context: { ...prev.context, ...action.payload }
          }

        default:
          return prev
      }
    })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESTART_TUTORIAL' })
  }, [dispatch])

  const isStepVisible = useCallback((stepId: string) => {
    if (!state.isActive) return false
    return state.steps[state.currentStepIndex]?.id === stepId
  }, [state.isActive, state.currentStepIndex, state.steps])

  return (
    <TutorialContext.Provider value={{ state, dispatch, isStepVisible, reset }}>
      {children}
      {state.isActive && createPortal(
        <TutorialLayer 
          step={state.steps[state.currentStepIndex]}
          onNext={() => dispatch({ type: 'NEXT_STEP' })}
          onSkip={() => dispatch({ type: 'SKIP_TUTORIAL' })}
        />,
        document.getElementById('tutorial-root')!
      )}
    </TutorialContext.Provider>
  )
}
```

### 2. Memory-Only Z-Index Management

Since we don't persist, we can simplify z-index management:

```typescript
class EphemeralZIndexManager {
  private overrides = new Map<string, {
    elements: WeakMap<HTMLElement, string>
    zIndex: number
  }>()
  
  private cleanupTimeout?: NodeJS.Timeout

  apply(selector: string, zIndex: number) {
    // Clean up any existing overrides for this selector
    this.restore(selector)
    
    const elements = document.querySelectorAll(selector)
    const elementMap = new WeakMap<HTMLElement, string>()
    
    elements.forEach(el => {
      const htmlEl = el as HTMLElement
      const original = htmlEl.style.zIndex
      elementMap.set(htmlEl, original)
      
      // Apply in next frame for better performance
      requestAnimationFrame(() => {
        htmlEl.style.zIndex = String(zIndex)
        if (getComputedStyle(htmlEl).position === 'static') {
          htmlEl.style.position = 'relative'
        }
      })
    })
    
    this.overrides.set(selector, { elements: elementMap, zIndex })
  }

  restore(selector: string) {
    const override = this.overrides.get(selector)
    if (!override) return
    
    document.querySelectorAll(selector).forEach(el => {
      const htmlEl = el as HTMLElement
      const original = override.elements.get(htmlEl)
      
      if (original !== undefined) {
        htmlEl.style.zIndex = original
        if (original === '' && htmlEl.style.position === 'relative') {
          htmlEl.style.position = ''
        }
      }
    })
    
    this.overrides.delete(selector)
  }

  restoreAll() {
    this.overrides.forEach((_, selector) => this.restore(selector))
    this.overrides.clear()
  }

  // Auto-cleanup after tutorial ends
  scheduleCleanup(delay = 1000) {
    this.cleanupTimeout = setTimeout(() => {
      this.restoreAll()
    }, delay)
  }

  cancelCleanup() {
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout)
    }
  }
}

// Hook for components
const useZIndexOverride = (
  selector: string | undefined, 
  zIndex: number,
  enabled: boolean
) => {
  const managerRef = useRef<EphemeralZIndexManager>()
  
  useEffect(() => {
    if (!enabled || !selector) return
    
    if (!managerRef.current) {
      managerRef.current = new EphemeralZIndexManager()
    }
    
    managerRef.current.apply(selector, zIndex)
    
    return () => {
      managerRef.current?.restore(selector)
    }
  }, [selector, zIndex, enabled])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      managerRef.current?.restoreAll()
    }
  }, [])
}
```

### 3. Performance-Focused Hook System

Since we're not persisting, we can optimize for runtime performance:

```typescript
// Centralized tutorial hooks
export const useTutorial = () => {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider')
  }
  return context
}

// Optimized visibility checking
export const useIsTutorialStep = (stepId: string) => {
  const { state } = useTutorial()
  
  return useMemo(() => {
    if (!state.isActive) return false
    return state.steps[state.currentStepIndex]?.id === stepId
  }, [state.isActive, state.currentStepIndex, state.steps, stepId])
}

// Hook for tutorial-aware components
export const useTutorialHighlight = (stepId: string, options?: {
  zIndex?: number
  spotlight?: boolean
}) => {
  const isActive = useIsTutorialStep(stepId)
  const elementRef = useRef<HTMLElement>(null)
  
  // Apply z-index override when active
  useZIndexOverride(
    isActive && elementRef.current ? `#${elementRef.current.id}` : undefined,
    options?.zIndex || 9999,
    isActive
  )
  
  // Add tutorial-specific classes
  useEffect(() => {
    if (!elementRef.current) return
    
    if (isActive) {
      elementRef.current.classList.add('tutorial-highlight')
      if (options?.spotlight) {
        elementRef.current.classList.add('tutorial-spotlight-target')
      }
    } else {
      elementRef.current.classList.remove('tutorial-highlight', 'tutorial-spotlight-target')
    }
  }, [isActive, options?.spotlight])
  
  return {
    ref: elementRef,
    isHighlighted: isActive
  }
}

// Performance-optimized step renderer
const TutorialStep = React.memo(({ 
  step, 
  onNext, 
  onSkip 
}: {
  step: TutorialStep
  onNext: () => void
  onSkip: () => void
}) => {
  const [isVisible, setIsVisible] = useState(false)
  
  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [step.id]) // Re-run when step changes
  
  return (
    <div className={`tutorial-step ${isVisible ? 'visible' : ''}`}>
      {step.overlay && <TutorialOverlay {...step.overlay} />}
      <TutorialPrompt 
        step={step}
        onNext={onNext}
        onSkip={onSkip}
      />
    </div>
  )
}, (prev, next) => prev.step.id === next.step.id)
```



This approach gives you:
- **No persistence** - Fresh start every time
- **Lightweight state** - Minimal memory footprint
- **Demo-friendly features** - Easy restart, debug panel, auto-restart option
- **Performance focused** - No storage operations, minimal re-renders
- **Clean separation** - Tutorial logic doesn't pollute your demo components

### 3. Performance Optimizations

Critical optimizations for smooth 60fps performance:

```typescript
/**
 * Virtual scrolling for long tutorial lists
 */
const VirtualizedTutorialList = ({ steps, itemHeight = 80 }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 })
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const handleScroll = throttle(() => {
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      
      const start = Math.floor(scrollTop / itemHeight)
      const end = Math.ceil((scrollTop + containerHeight) / itemHeight)
      
      setVisibleRange({ 
        start: Math.max(0, start - 2), // Buffer
        end: Math.min(steps.length, end + 2)
      })
    }, 16)
    
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [steps.length, itemHeight])
  
  const visibleSteps = steps.slice(visibleRange.start, visibleRange.end)
  const offsetY = visibleRange.start * itemHeight
  
  return (
    <div ref={containerRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: steps.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleSteps.map((step, i) => (
            <TutorialStepPreview
              key={step.id}
              step={step}
              index={visibleRange.start + i}
              height={itemHeight}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Optimized element tracking with Intersection Observer
 */
const useElementTracking = (selector: string, options: {
  rootMargin?: string
  threshold?: number | number[]
  debounceMs?: number
} = {}) => {
  const [state, setState] = useState<{
    isVisible: boolean
    bounds: DOMRect | null
    intersection: IntersectionObserverEntry | null
  }>({
    isVisible: false,
    bounds: null,
    intersection: null
  })
  
  useEffect(() => {
    const element = document.querySelector(selector)
    if (!element) return
    
    let frameId: number
    const updateBounds = () => {
      if (frameId) cancelAnimationFrame(frameId)
      
      frameId = requestAnimationFrame(() => {
        setState(prev => ({
          ...prev,
          bounds: element.getBoundingClientRect()
        }))
      })
    }
    
    // Intersection Observer for visibility
    const observer = new IntersectionObserver(
      ([entry]) => {
        setState(prev => ({
          ...prev,
          isVisible: entry.isIntersecting,
          intersection: entry
        }))
        
        // Only track bounds when visible
        if (entry.isIntersecting) {
          updateBounds()
        }
      },
      {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0
      }
    )
    
    observer.observe(element)
    
    // Resize Observer with debouncing
    let resizeTimeout: NodeJS.Timeout
    const resizeObserver = new ResizeObserver(() => {
      if (!state.isVisible) return
      
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateBounds, options.debounceMs || 100)
    })
    
    resizeObserver.observe(element)
    
    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
      if (frameId) cancelAnimationFrame(frameId)
      clearTimeout(resizeTimeout)
    }
  }, [selector, options.rootMargin, options.threshold, options.debounceMs])
  
  return state
}

/**
 * Render optimization with React.memo and careful prop design
 */
const TutorialOverlay = React.memo(({ 
  type, 
  target,
  spotlightPadding 
}: {
  type: 'dark' | 'transparent' | 'spotlight'
  target?: string
  spotlightPadding?: number
}) => {
  // Use primitive props to avoid unnecessary re-renders
  const { bounds, isVisible } = useElementTracking(target || '', {
    debounceMs: 50
  })
  
  // Memoize expensive calculations
  const overlayStyle = useMemo(() => {
    if (type !== 'spotlight' || !bounds) {
      return { opacity: type === 'dark' ? 0.7 : 0 }
    }
    
    return {
      clipPath: `polygon(
        0 0,
        0 100%,
        ${bounds.left - spotlightPadding}px 100%,
        ${bounds.left - spotlightPadding}px ${bounds.top - spotlightPadding}px,
        ${bounds.right + spotlightPadding}px ${bounds.top - spotlightPadding}px,
        ${bounds.right + spotlightPadding}px ${bounds.bottom + spotlightPadding}px,
        ${bounds.left - spotlightPadding}px ${bounds.bottom + spotlightPadding}px,
        ${bounds.left - spotlightPadding}px 100%,
        100% 100%,
        100% 0
      )`
    }
  }, [type, bounds, spotlightPadding])
  
  if (!isVisible && target) return null
  
  return (
    <div 
      className="tutorial-overlay"
      style={overlayStyle}
    />
  )
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.type === nextProps.type &&
    prevProps.target === nextProps.target &&
    prevProps.spotlightPadding === nextProps.spotlightPadding
  )
})

/**
 * Animation optimization with FLIP technique
 */
const useFlipAnimation = () => {
  const previousBounds = useRef<Map<string, DOMRect>>(new Map())
  
  const animate = (elementId: string, element: HTMLElement) => {
    const prevBounds = previousBounds.current.get(elementId)
    const currentBounds = element.getBoundingClientRect()
    
    if (!prevBounds) {
      previousBounds.current.set(elementId, currentBounds)
      return
    }
    
    // Calculate deltas
    const deltaX = prevBounds.left - currentBounds.left
    const deltaY = prevBounds.top - currentBounds.top
    const deltaW = prevBounds.width / currentBounds.width
    const deltaH = prevBounds.height / currentBounds.height
    
    // Apply inverse transform
    element.style.transform = `
      translate(${deltaX}px, ${deltaY}px)
      scale(${deltaW}, ${deltaH})
    `
    element.style.transformOrigin = 'top left'
    
    // Force reflow
    element.offsetHeight
    
    // Animate to identity
    element.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
    element.style.transform = ''
    
    // Cleanup
    element.addEventListener('transitionend', () => {
      element.style.transition = ''
      element.style.transformOrigin = ''
      previousBounds.current.set(elementId, currentBounds)
    }, { once: true })
  }
  
  return { animate }
}

/**
 * Memory leak prevention
 */
const useTutorialCleanup = () => {
  const cleanupFns = useRef<Array<() => void>>([])
  
  const registerCleanup = (fn: () => void) => {
    cleanupFns.current.push(fn)
  }
  
  useEffect(() => {
    return () => {
      // Clean up all registered functions
      cleanupFns.current.forEach(fn => fn())
      cleanupFns.current = []
    }
  }, [])
  
  return { registerCleanup }
}
```

### Key Performance Principles Applied:

1. **Minimize Re-renders**: Use React.memo, primitive props, and careful state structure
2. **Virtualization**: Only render visible elements in long lists
3. **Debouncing/Throttling**: Control frequency of expensive operations
4. **RAF Scheduling**: Use requestAnimationFrame for visual updates
5. **Intersection Observer**: Track visibility efficiently without scroll handlers
6. **FLIP Animations**: Smooth 60fps animations with minimal reflow
7. **Memory Management**: Proper cleanup of observers, timers, and event listeners
8. **Lazy Computation**: Only calculate what's needed when it's visible

These optimizations ensure your tutorial system remains performant even with complex interactions and many active elements.