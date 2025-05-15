'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Mode = 'demo' | 'tutorial';

interface LastAction {
  type: 'buy' | 'sell';
  timestamp: number;
  details: any;
}

interface TutorialState {
  mode: Mode;
  setMode: (mode: Mode) => void;
  interactions: {
    buys: number;
    sells: number;
    lastAction?: LastAction;
  };
  recordInteraction: (type: 'buy' | 'sell', details: any) => void;
  resetInteractions: () => void;
}

const TutorialContext = createContext<TutorialState | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>('demo');
  const [interactions, setInteractions] = useState<TutorialState['interactions']>({
    buys: 0,
    sells: 0,
    lastAction: undefined,
  });

  // Load mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('statemint-mode') as Mode;
    if (savedMode) {
      setModeState(savedMode);
    }
  }, []);

  // Save mode to localStorage when it changes
  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem('statemint-mode', newMode);
  };

  const recordInteraction = (type: 'buy' | 'sell', details: any) => {
    setInteractions(prev => ({
      ...prev,
      [type === 'buy' ? 'buys' : 'sells']: prev[type === 'buy' ? 'buys' : 'sells'] + 1,
      lastAction: {
        type,
        timestamp: Date.now(),
        details,
      },
    }));
  };

  const resetInteractions = () => {
    setInteractions({
      buys: 0,
      sells: 0,
      lastAction: undefined,
    });
  };

  return (
    <TutorialContext.Provider
      value={{
        mode,
        setMode,
        interactions,
        recordInteraction,
        resetInteractions,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
} 