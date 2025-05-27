interface ZIndexOverride {
  selector: string
  zIndex: number
  createStackingContext?: boolean
  preserveOriginal?: boolean
  children?: ZIndexOverride[]
}

export class AdvancedZIndexManager {
  private originalStyles = new Map<HTMLElement, {
    zIndex: string
    position: string
    transform?: string
    opacity?: string
    filter?: string
    willChange?: string
    isolation?: string
  }>()
  
  private mutationObserver: MutationObserver
  private activeSelectors = new Set<string>()
  private activeOverrides = new Map<string, ZIndexOverride>()
  
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
        const computed = getComputedStyle(htmlEl)
        this.originalStyles.set(htmlEl, {
          zIndex: htmlEl.style.zIndex || computed.zIndex,
          position: htmlEl.style.position || computed.position,
          transform: htmlEl.style.transform,
          opacity: htmlEl.style.opacity,
          filter: htmlEl.style.filter,
          willChange: htmlEl.style.willChange,
          isolation: htmlEl.style.isolation
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
    this.activeOverrides.set(override.selector, override)
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
          if (value !== undefined && value !== '' && value !== 'auto') {
            (htmlEl.style as any)[prop] = value
          } else {
            htmlEl.style.removeProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase())
          }
        })
        
        this.originalStyles.delete(htmlEl)
      }
    })
    
    this.activeSelectors.delete(selector)
    this.activeOverrides.delete(selector)
    
    if (this.activeSelectors.size === 0) {
      this.stopObserving()
    }
  }

  /**
   * Handle dynamic content
   */
  private reapplyOverrides() {
    this.activeOverrides.forEach((override, selector) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        const htmlEl = el as HTMLElement
        if (!this.originalStyles.has(htmlEl)) {
          // New element appeared, apply override
          this.elevate(override)
        }
      })
    })
  }

  private startObserving() {
    if (this.activeSelectors.size > 0) {
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      })
    }
  }

  private stopObserving() {
    this.mutationObserver.disconnect()
  }

  /**
   * Restore all overrides and cleanup
   */
  restoreAll() {
    this.activeSelectors.forEach(selector => this.restore(selector))
    this.activeSelectors.clear()
    this.activeOverrides.clear()
  }

  /**
   * Debug helper to visualize stacking contexts
   */
  debugStackingContexts() {
    const style = document.createElement('style')
    style.id = 'tutorial-debug-styles'
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
        pointer-events: none !important;
      }
    `
    document.head.appendChild(style)
    
    this.originalStyles.forEach((_, element) => {
      element.setAttribute('data-tutorial-elevated', 'true')
      element.setAttribute('data-tutorial-z-index', element.style.zIndex)
    })
    
    return () => {
      const debugStyle = document.getElementById('tutorial-debug-styles')
      if (debugStyle) debugStyle.remove()
      
      this.originalStyles.forEach((_, element) => {
        element.removeAttribute('data-tutorial-elevated')
        element.removeAttribute('data-tutorial-z-index')
      })
    }
  }
}

/**
 * Ephemeral Z-Index Manager for demo sites
 */
export class EphemeralZIndexManager {
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