'use client';

// This store only exists in memory and will be cleared when the tab is closed
const memoryStore = new Map<string, any>();

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

// Clear storage on module initialization
clearAllStorage();

// Clear storage on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('unload', clearAllStorage);
}

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