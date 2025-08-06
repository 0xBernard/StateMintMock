'use client';

import { useEffect, useState, useRef, useMemo, useContext } from 'react';
import { TutorialContextValue, ElementTrackingState } from './types';
import { ZIndexManager } from './z-index-manager';

// Utility function to generate session IDs
export function generateSessionId(): string {
  return `tutorial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Throttle helper for performance
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}

/**
 * Hook for tutorial-aware z-index management
 */
export const useZIndexOverride = (
  selector: string | undefined, 
  zIndex: number,
  enabled: boolean
) => {
  const managerRef = useRef<ZIndexManager | undefined>(undefined)
  
  useEffect(() => {
    if (!enabled || !selector) return
    
    if (!managerRef.current) {
      managerRef.current = new ZIndexManager()
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

// Performance monitoring for tutorial system improvements
class TutorialPerformanceMonitor {
  private static instance: TutorialPerformanceMonitor
  private metrics = {
    domQueries: 0,
    renderCount: 0,
    observerCount: 0,
    startTime: Date.now()
  }

  static getInstance(): TutorialPerformanceMonitor {
    if (!TutorialPerformanceMonitor.instance) {
      TutorialPerformanceMonitor.instance = new TutorialPerformanceMonitor()
    }
    return TutorialPerformanceMonitor.instance
  }

  trackDOMQuery() {
    this.metrics.domQueries++
  }

  trackRender() {
    this.metrics.renderCount++
  }

  trackObserver(action: 'add' | 'remove') {
    this.metrics.observerCount += action === 'add' ? 1 : -1
  }

  getMetrics() {
    const runtime = Date.now() - this.metrics.startTime
    return {
      ...this.metrics,
      runtime,
      domQueriesPerSecond: (this.metrics.domQueries / runtime) * 1000,
      rendersPerSecond: (this.metrics.renderCount / runtime) * 1000
    }
  }

  logMetrics() {
    const metrics = this.getMetrics()
    console.group('🚀 Tutorial Performance Metrics')
    console.log(`📊 DOM Queries: ${metrics.domQueries} (${metrics.domQueriesPerSecond.toFixed(2)}/sec)`)
    console.log(`🎨 React Renders: ${metrics.renderCount} (${metrics.rendersPerSecond.toFixed(2)}/sec)`)
    console.log(`👀 Active Observers: ${metrics.observerCount}`)
    console.log(`⏱️ Runtime: ${(metrics.runtime / 1000).toFixed(2)}s`)
    console.groupEnd()
  }

  reset() {
    this.metrics = {
      domQueries: 0,
      renderCount: 0,
      observerCount: 0,
      startTime: Date.now()
    }
  }
}

// Shared observer instances to reduce total observers across the app
class SharedElementTracker {
  private static instance: SharedElementTracker
  private intersectionObserver: IntersectionObserver
  private resizeObserver: ResizeObserver
  private mutationObserver: MutationObserver
  private trackedElements = new Map<Element, Set<string>>()
  private callbacks = new Map<string, (bounds: DOMRect | null, isVisible: boolean) => void>()
  private frameId: number | undefined
  private handleScroll: () => void

  private constructor() {
    const monitor = TutorialPerformanceMonitor.getInstance()
    
    // Single intersection observer for all elements
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          monitor.trackDOMQuery() // Track getBoundingClientRect call
          const selectors = this.trackedElements.get(entry.target)
          if (selectors) {
            const bounds = entry.isIntersecting ? entry.target.getBoundingClientRect() : null
            selectors.forEach(selector => {
              this.callbacks.get(selector)?.(bounds, entry.isIntersecting)
            })
          }
        })
      },
      { rootMargin: '200px', threshold: [0, 0.1, 1.0] }
    )
    monitor.trackObserver('add')

    // Single resize observer for all elements  
    this.resizeObserver = new ResizeObserver(
      throttle((entries) => {
        if (this.frameId) cancelAnimationFrame(this.frameId)
        this.frameId = requestAnimationFrame(() => {
          entries.forEach(entry => {
            monitor.trackDOMQuery() // Track getBoundingClientRect call
            const selectors = this.trackedElements.get(entry.target)
            if (selectors) {
              const bounds = entry.target.getBoundingClientRect()
              selectors.forEach(selector => {
                this.callbacks.get(selector)?.(bounds, true)
              })
            }
          })
        })
      }, 16) // ~60fps max
    )
    monitor.trackObserver('add')

    // Single mutation observer for DOM changes
    this.mutationObserver = new MutationObserver(
      throttle(() => this.recheckElements(), 100)
    )
    monitor.trackObserver('add')
    
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    })

    // Enhanced mobile scroll detection with Brave browser support
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth < 1024;
    const isBrave = !!(navigator as any).brave && !!(navigator as any).brave.isBrave;
    const isAndroid = /Android/i.test(navigator.userAgent);

    // Add scroll event handling to update positions when scrolling
    this.handleScroll = throttle(() => {
      if (this.frameId) cancelAnimationFrame(this.frameId)
      this.frameId = requestAnimationFrame(() => {
        // Update bounds for all tracked elements when scrolling
        this.trackedElements.forEach((selectors, element) => {
          monitor.trackDOMQuery() // Track getBoundingClientRect call
          const bounds = element.getBoundingClientRect()
          const isVisible = bounds.width > 0 && bounds.height > 0 && 
                           bounds.top < window.innerHeight && bounds.bottom > 0 &&
                           bounds.left < window.innerWidth && bounds.right > 0
          selectors.forEach(selector => {
            this.callbacks.get(selector)?.(bounds, isVisible)
          })
        })
      })
    }, isBrave && isAndroid ? 8 : 16) // More aggressive throttling for Brave on Android

    // Listen to scroll events on window and scroll containers
    window.addEventListener('scroll', this.handleScroll, { passive: true })
    document.addEventListener('scroll', this.handleScroll, { passive: true })
    
    // For mobile devices, also listen to touchmove and orientation changes
    if (isMobile) {
      window.addEventListener('touchmove', this.handleScroll, { passive: true })
      window.addEventListener('orientationchange', () => {
        // Delay to allow orientation change to complete
        setTimeout(this.handleScroll, 150)
      })
      // iOS momentum scrolling events
      window.addEventListener('gesturestart', this.handleScroll, { passive: true })
      window.addEventListener('gesturechange', this.handleScroll, { passive: true })
      window.addEventListener('gestureend', this.handleScroll, { passive: true })
      
      // Android/Brave specific optimizations
      if (isAndroid || isBrave) {
        // Brave browser on Android has issues with scroll momentum
        window.addEventListener('touchstart', this.handleScroll, { passive: true })
        window.addEventListener('touchend', this.handleScroll, { passive: true })
        // Android Chrome and Brave need these for proper scroll tracking
        document.addEventListener('touchmove', this.handleScroll, { passive: true })
        document.addEventListener('touchstart', this.handleScroll, { passive: true })
        document.addEventListener('touchend', this.handleScroll, { passive: true })
      }
    }
  }

  static getInstance(): SharedElementTracker {
    if (!SharedElementTracker.instance) {
      SharedElementTracker.instance = new SharedElementTracker()
    }
    return SharedElementTracker.instance
  }

  track(selector: string, callback: (bounds: DOMRect | null, isVisible: boolean) => void) {
    this.callbacks.set(selector, callback)
    this.updateElementTracking(selector)
  }

  untrack(selector: string) {
    this.callbacks.delete(selector)
    
    // Find and remove from tracked elements
    this.trackedElements.forEach((selectors, element) => {
      if (selectors.has(selector)) {
        selectors.delete(selector)
        if (selectors.size === 0) {
          this.intersectionObserver.unobserve(element)
          this.resizeObserver.unobserve(element)
          this.trackedElements.delete(element)
        }
      }
    })
  }

  private updateElementTracking(selector: string) {
    const monitor = TutorialPerformanceMonitor.getInstance()
    monitor.trackDOMQuery() // Track querySelector call
    
    const element = document.querySelector(selector)
    
    if (element) {
      let selectors = this.trackedElements.get(element)
      if (!selectors) {
        selectors = new Set()
        this.trackedElements.set(element, selectors)
        this.intersectionObserver.observe(element)
        this.resizeObserver.observe(element)
      }
      selectors.add(selector)
      
      // Immediate bounds check for tab content and hidden elements
      monitor.trackDOMQuery() // Track getBoundingClientRect call
      const bounds = element.getBoundingClientRect()
      const hasVisibleBounds = bounds.width > 0 && bounds.height > 0
      
      // For elements that exist but are hidden, we should still track them
      // and provide the bounds even if they're currently hidden - the tutorial
      // system can decide how to handle this case
      this.callbacks.get(selector)?.(bounds, hasVisibleBounds)
    } else {
      // Element not found, notify callback
      this.callbacks.get(selector)?.(null, false)
    }
  }

  private recheckElements() {
    this.callbacks.forEach((_, selector) => {
      this.updateElementTracking(selector)
    })
  }

  // Clean up all observers and event listeners
  destroy() {
    this.intersectionObserver.disconnect()
    this.resizeObserver.disconnect()
    this.mutationObserver.disconnect()
    window.removeEventListener('scroll', this.handleScroll)
    document.removeEventListener('scroll', this.handleScroll)
    
    // Remove mobile-specific event listeners
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth < 1024;
    const isBrave = !!(navigator as any).brave && !!(navigator as any).brave.isBrave;
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.removeEventListener('touchmove', this.handleScroll)
      window.removeEventListener('gesturestart', this.handleScroll)
      window.removeEventListener('gesturechange', this.handleScroll)
      window.removeEventListener('gestureend', this.handleScroll)
      
      // Remove Android/Brave specific listeners
      if (isAndroid || isBrave) {
        window.removeEventListener('touchstart', this.handleScroll)
        window.removeEventListener('touchend', this.handleScroll)
        document.removeEventListener('touchmove', this.handleScroll)
        document.removeEventListener('touchstart', this.handleScroll)
        document.removeEventListener('touchend', this.handleScroll)
      }
    }
    
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
    }
    this.trackedElements.clear()
    this.callbacks.clear()
    SharedElementTracker.instance = null as any
  }
}

/**
 * Highly optimized element tracking with shared observers
 */
export const useElementTracking = (selector: string, options: {
  rootMargin?: string
  threshold?: number | number[]
  debounceMs?: number
} = {}): ElementTrackingState => {
  const [state, setState] = useState<ElementTrackingState>({
    isVisible: false,
    bounds: null,
    intersection: null
  })
  
  useEffect(() => {
    if (!selector || selector.trim() === '') {
      return
    }

    const tracker = SharedElementTracker.getInstance()
    const monitor = TutorialPerformanceMonitor.getInstance()
    
    const handleUpdate = (bounds: DOMRect | null, isVisible: boolean) => {
      monitor.trackRender() // Track React state update
      setState({
        isVisible,
        bounds,
        intersection: null // Simplified - we don't need full intersection data
      })
    }

    tracker.track(selector, handleUpdate)
    
    return () => {
      tracker.untrack(selector)
    }
  }, [selector])
  
  return state
}

// Export performance monitor for debugging
export const useTutorialPerformanceMonitor = () => {
  return TutorialPerformanceMonitor.getInstance()
}

/**
 * Hook for tutorial-aware components with automatic highlighting
 */
export const useTutorialHighlight = (stepId: string, options?: {
  zIndex?: number
  spotlight?: boolean
  selector?: string
}) => {
  const elementRef = useRef<HTMLElement>(null)
  
  // This will be connected to the tutorial context when available
  // For now, we'll make it work without context to avoid dependency issues
  const isActive = false // Will be updated when context is integrated
  
  // Apply z-index override when active
  useZIndexOverride(
    isActive && elementRef.current ? options?.selector || `#${elementRef.current.id}` : undefined,
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

/**
 * Hook for cleanup registration to prevent memory leaks
 */
export const useTutorialCleanup = () => {
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

/**
 * FLIP animation hook for smooth transitions
 */
export const useFlipAnimation = () => {
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
 * Debounced callback hook
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  return useMemo(() => {
    return ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    }) as T
  }, [callback, delay])
}

/**
 * Hook for throttled callbacks
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T => {
  return useMemo(() => throttle(callback, limit), [callback, limit])
} 