/**
 * Debug utility for conditional logging
 * Only logs in development environment
 */

const IS_DEV = process.env.NODE_ENV === 'development';
const IS_DEBUG = IS_DEV && process.env.NEXT_PUBLIC_DEBUG === 'true';

interface DebugLogger {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  group: (label?: string) => void;
  groupEnd: () => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
}

export const debug: DebugLogger = {
  log: (...args: any[]) => {
    if (IS_DEV) console.log(...args);
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    if (IS_DEV) console.warn(...args);
  },
  
  info: (...args: any[]) => {
    if (IS_DEBUG) console.info(...args);
  },
  
  group: (label?: string) => {
    if (IS_DEV) console.group(label);
  },
  
  groupEnd: () => {
    if (IS_DEV) console.groupEnd();
  },
  
  time: (label: string) => {
    if (IS_DEV) console.time(label);
  },
  
  timeEnd: (label: string) => {
    if (IS_DEV) console.timeEnd(label);
  }
};

// Performance monitoring helpers
export const perf = {
  mark: (name: string) => {
    if (IS_DEV && 'performance' in window) {
      performance.mark(name);
    }
  },
  
  measure: (name: string, startMark: string, endMark?: string) => {
    if (IS_DEV && 'performance' in window) {
      try {
        const measure = performance.measure(name, startMark, endMark);
        debug.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
        return measure;
      } catch (e) {
        debug.warn('Performance measurement failed:', e);
      }
    }
  },
  
  now: () => {
    return IS_DEV && 'performance' in window ? performance.now() : Date.now();
  }
};

// Component debugging helpers
export const componentDebug = {
  render: (componentName: string, props?: any) => {
    if (IS_DEBUG) {
      debug.log(`🎨 [${componentName}] Render`, props ? { props } : '');
    }
  },
  
  effect: (componentName: string, dependencies: any[]) => {
    if (IS_DEBUG) {
      debug.log(`🔄 [${componentName}] Effect triggered`, { dependencies });
    }
  },
  
  state: (componentName: string, stateName: string, value: any) => {
    if (IS_DEBUG) {
      debug.log(`📊 [${componentName}] State change: ${stateName}`, value);
    }
  }
};

export default debug;