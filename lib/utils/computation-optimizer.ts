import { useRef, useMemo, useCallback } from 'react';
import { debug, perf } from './debug';

/**
 * Hook for debouncing expensive computations
 */
export function useDebouncedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  delay: number = 300
): T | undefined {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const resultRef = useRef<T>();
  const depsRef = useRef<React.DependencyList>();

  // Check if dependencies have actually changed
  const depsChanged = useMemo(() => {
    if (!depsRef.current) return true;
    if (depsRef.current.length !== deps.length) return true;
    return deps.some((dep, index) => dep !== depsRef.current![index]);
  }, deps);

  const compute = useCallback(() => {
    const startTime = perf.now();
    perf.mark('computation-start');
    
    try {
      resultRef.current = factory();
      depsRef.current = deps;
      
      perf.mark('computation-end');
      perf.measure('debounced-computation', 'computation-start', 'computation-end');
      
      debug.log('Debounced computation completed in', perf.now() - startTime, 'ms');
    } catch (error) {
      debug.error('Computation failed:', error);
    }
  }, [factory, ...deps]);

  // Schedule computation when dependencies change
  if (depsChanged) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(compute, delay);
  }

  return resultRef.current;
}

/**
 * Hook for memoizing computations with deep equality check
 */
export function useDeepMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const prevDepsRef = useRef<React.DependencyList>();
  const resultRef = useRef<T>();

  const depsChanged = useMemo(() => {
    if (!prevDepsRef.current) return true;
    return !deepEqual(prevDepsRef.current, deps);
  }, deps);

  if (depsChanged || resultRef.current === undefined) {
    perf.mark('deep-memo-start');
    resultRef.current = factory();
    prevDepsRef.current = deps;
    perf.mark('deep-memo-end');
    perf.measure('deep-memo-computation', 'deep-memo-start', 'deep-memo-end');
  }

  return resultRef.current;
}

/**
 * Deep equality check for dependency arrays
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      return a.every((item, index) => deepEqual(item, b[index]));
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => deepEqual(a[key], b[key]));
  }
  
  return false;
}

/**
 * Hook for expensive computations that should only run when truly necessary
 */
export function useExpensiveComputation<T>(
  computation: () => T,
  deps: React.DependencyList,
  options: {
    debounceMs?: number;
    maxAge?: number; // Cache duration in ms
    enableProfiling?: boolean;
  } = {}
): { result: T | undefined; isComputing: boolean; error: Error | null } {
  const { debounceMs = 300, maxAge = 60000, enableProfiling = false } = options;
  
  const computeRef = useRef<{
    result: T;
    timestamp: number;
    deps: React.DependencyList;
  }>();
  
  const errorRef = useRef<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isComputingRef = useRef(false);

  const shouldRecompute = useMemo(() => {
    if (!computeRef.current) return true;
    
    // Check cache age
    if (Date.now() - computeRef.current.timestamp > maxAge) {
      debug.log('Cache expired, recomputing');
      return true;
    }
    
    // Check deps
    if (!deepEqual(computeRef.current.deps, deps)) {
      debug.log('Dependencies changed, recomputing');
      return true;
    }
    
    return false;
  }, deps);

  const performComputation = useCallback(() => {
    if (isComputingRef.current) return;
    
    isComputingRef.current = true;
    errorRef.current = null;
    
    try {
      if (enableProfiling) {
        perf.mark('expensive-computation-start');
      }
      
      const result = computation();
      
      computeRef.current = {
        result,
        timestamp: Date.now(),
        deps: [...deps]
      };
      
      if (enableProfiling) {
        perf.mark('expensive-computation-end');
        perf.measure('expensive-computation', 'expensive-computation-start', 'expensive-computation-end');
      }
      
      debug.log('Expensive computation completed');
    } catch (error) {
      errorRef.current = error as Error;
      debug.error('Expensive computation failed:', error);
    } finally {
      isComputingRef.current = false;
    }
  }, [computation, enableProfiling, ...deps]);

  // Schedule computation
  if (shouldRecompute) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (debounceMs > 0) {
      timeoutRef.current = setTimeout(performComputation, debounceMs);
    } else {
      performComputation();
    }
  }

  return {
    result: computeRef.current?.result,
    isComputing: isComputingRef.current,
    error: errorRef.current
  };
}

/**
 * Worker-based computation for heavy calculations
 */
export function useWorkerComputation<TInput, TOutput>(
  workerScript: string,
  input: TInput,
  deps: React.DependencyList
): { result: TOutput | undefined; isLoading: boolean; error: Error | null } {
  const workerRef = useRef<Worker>();
  const resultRef = useRef<TOutput>();
  const errorRef = useRef<Error | null>(null);
  const isLoadingRef = useRef(false);

  const compute = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Clean up previous worker
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    
    isLoadingRef.current = true;
    errorRef.current = null;
    
    try {
      workerRef.current = new Worker(workerScript);
      
      workerRef.current.onmessage = (event) => {
        resultRef.current = event.data;
        isLoadingRef.current = false;
        debug.log('Worker computation completed');
      };
      
      workerRef.current.onerror = (error) => {
        errorRef.current = new Error(`Worker error: ${error.message}`);
        isLoadingRef.current = false;
        debug.error('Worker computation failed:', error);
      };
      
      workerRef.current.postMessage(input);
    } catch (error) {
      errorRef.current = error as Error;
      isLoadingRef.current = false;
      debug.error('Failed to create worker:', error);
    }
  }, [workerScript, input, ...deps]);

  // Run computation when dependencies change
  useMemo(compute, deps);

  // Cleanup on unmount
  useMemo(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  return {
    result: resultRef.current,
    isLoading: isLoadingRef.current,
    error: errorRef.current
  };
}