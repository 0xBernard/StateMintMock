'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface BalanceContextType {
  availableBalance: number;
  setAvailableBalance: (balance: number) => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [availableBalance, setAvailableBalance] = useState(127.00);

  return (
    <BalanceContext.Provider value={{ availableBalance, setAvailableBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
} 