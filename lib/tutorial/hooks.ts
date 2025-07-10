'use client';

import { useEffect, useState, useRef, useMemo, useContext } from 'react';
import { TutorialContextValue, ElementTrackingState } from './types';
import { EphemeralZIndexManager } from './z-index-manager';

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
  const managerRef = useRef<EphemeralZIndexManager | undefined>(undefined)
  
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

/**
 * Optimized element tracking with Intersection Observer
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
    // Guard against empty or invalid selectors
    if (!selector || selector.trim() === '') {
      return
    }
    
    let currentElement: Element | null = null
    let frameId: number | undefined
    let observer: IntersectionObserver | null = null
    let resizeObserver: ResizeObserver | null = null
    let mutationObserver: MutationObserver | null = null
    
    const updateBounds = () => {
      if (frameId !== undefined) cancelAnimationFrame(frameId)
      
      frameId = requestAnimationFrame(() => {
        if (currentElement) {
        setState(prev => ({
          ...prev,
            bounds: currentElement!.getBoundingClientRect()
        }))
        }
      })
    }
    
    const setupObservers = (element: Element) => {
      currentElement = element
    
    // Intersection Observer for visibility
      observer = new IntersectionObserver(
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
      resizeObserver = new ResizeObserver(() => {
      if (!state.isVisible) return
      
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateBounds, options.debounceMs || 100)
    })
    
    resizeObserver.observe(element)
      
      // Initial bounds update
      updateBounds()
    }
    
    const cleanupObservers = () => {
      if (observer) {
        observer.disconnect()
        observer = null
      }
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId)
        frameId = undefined
      }
      currentElement = null
    }
    
    const checkForElement = () => {
      const element = document.querySelector(selector)
      
      if (element && element !== currentElement) {
        console.log('[ElementTracking] Found new element for selector:', selector)
        cleanupObservers()
        setupObservers(element)
      } else if (!element && currentElement) {
        console.log('[ElementTracking] Element disappeared for selector:', selector)
        cleanupObservers()
        setState({
          isVisible: false,
          bounds: null,
          intersection: null
        })
      }
    }
    
    // Initial check
    checkForElement()
    
    // Set up mutation observer to watch for DOM changes
    mutationObserver = new MutationObserver(() => {
      checkForElement()
    })
    
    // Watch for changes in the entire document
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    })
    
    // Scroll listener: when the element is visible, update bounds on scroll for accurate highlight positioning
    const handleScroll = () => {
      if (!state.isVisible || !currentElement) return;
      updateBounds();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      cleanupObservers()
      if (mutationObserver) {
        mutationObserver.disconnect()
      }
      window.removeEventListener('scroll', handleScroll)
    }
  }, [selector, options.rootMargin, options.threshold, options.debounceMs])
  
  return state
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