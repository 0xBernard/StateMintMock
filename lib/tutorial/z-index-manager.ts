interface ZIndexOverride {
  selector: string
  zIndex: number
  createStackingContext?: boolean
  preserveOriginal?: boolean
  children?: ZIndexOverride[]
}

/**
 * Simplified Unified Z-Index Manager
 * Combines the best of AdvancedZIndexManager and EphemeralZIndexManager
 */
export class ZIndexManager {
  private overrides = new Map<string, {
    elements: WeakMap<HTMLElement, string>
    zIndex: number
  }>()
  
  private cleanupTimeout?: NodeJS.Timeout

  /**
   * Apply z-index override to elements matching selector
   */
  apply(selector: string, zIndex: number) {
    this.restore(selector) // Clean up any existing overrides
    
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

  /**
   * Elevate elements using ZIndexOverride interface (for compatibility)
   */
  elevate(override: ZIndexOverride) {
    this.apply(override.selector, override.zIndex)
    
    // Handle children if specified
    if (override.children) {
      override.children.forEach(childOverride => {
        this.elevate(childOverride)
      })
    }
  }

  /**
   * Restore original z-index for elements matching selector
   */
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

  /**
   * Restore all z-index overrides
   */
  restoreAll() {
    this.overrides.forEach((_, selector) => this.restore(selector))
    this.overrides.clear()
  }

  /**
   * Schedule automatic cleanup after tutorial ends
   */
  scheduleCleanup(delay = 1000) {
    this.cleanupTimeout = setTimeout(() => {
      this.restoreAll()
    }, delay)
  }

  /**
   * Cancel scheduled cleanup
   */
  cancelCleanup() {
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout)
    }
  }
}

// Export legacy names for backward compatibility during transition
export const AdvancedZIndexManager = ZIndexManager
export const EphemeralZIndexManager = ZIndexManager