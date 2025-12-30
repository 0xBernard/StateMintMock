'use client';

// This store only exists in memory and will be cleared when the tab is closed
const memoryStore = new Map<string, any>();

// Track if we've already initialized to prevent repeated clears
let isInitialized = false;

// Function to clear all storage
function clearAllStorage() {
  // Clear memory store
  memoryStore.clear();
  
  // Only clear browser storage in client environment
  if (typeof window !== 'undefined') {
    try {
      // Clear session storage
      sessionStorage.clear();
      // Clear local storage
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing browser storage:', error);
    }
  }
}

// Initialize storage only once per session
function initializeStorage() {
  if (isInitialized) return;
  isInitialized = true;
  
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  // Check if this is a fresh session (no marker in sessionStorage)
  const sessionMarker = '__statemint_session__';
  try {
    if (!sessionStorage.getItem(sessionMarker)) {
      // Fresh session - clear everything
      clearAllStorage();
      sessionStorage.setItem(sessionMarker, 'true');
    }
    // Add unload handler to clear on tab close
    window.addEventListener('unload', clearAllStorage);
  } catch (error) {
    // Storage might be disabled - that's fine, just use memory store
  }
}

// Initialize on module load (runs once due to flag)
initializeStorage();

export function getMemoryItem<T>(key: string): T | null {
  return memoryStore.get(key) || null;
}

export function setMemoryItem<T>(key: string, value: T): void {
  memoryStore.set(key, value);
}

export function removeMemoryItem(key: string): void {
  memoryStore.delete(key);
}

export function clearMemoryStore(): void {
  clearAllStorage();
} 