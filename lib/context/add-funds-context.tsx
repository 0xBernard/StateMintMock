'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { debug } from '@/lib/utils/debug';

interface AddFundsContextType {
  showFundsDialog: boolean;
  setShowFundsDialog: (show: boolean) => void;
  openAddFundsDialog: () => void;
  closeAddFundsDialog: () => void;
}

const AddFundsContext = createContext<AddFundsContextType | undefined>(undefined);

export function AddFundsProvider({ children }: { children: React.ReactNode }) {
  const [showFundsDialog, setShowFundsDialog] = useState(false);

  const openAddFundsDialog = () => {
    debug.log('[AddFundsContext] Opening Add Funds dialog - current state:', showFundsDialog);
    debug.log('[AddFundsContext] Call stack:', new Error().stack);
    setShowFundsDialog(true);
  };

  const closeAddFundsDialog = () => {
    debug.log('[AddFundsContext] Closing Add Funds dialog - current state:', showFundsDialog);
    setShowFundsDialog(false);
  };

  // Debug state changes
  useEffect(() => {
    debug.log('[AddFundsContext] Dialog state changed to:', showFundsDialog);
  }, [showFundsDialog]);

  return (
    <AddFundsContext.Provider
      value={{
        showFundsDialog,
        setShowFundsDialog,
        openAddFundsDialog,
        closeAddFundsDialog,
      }}
    >
      {children}
    </AddFundsContext.Provider>
  );
}

export function useAddFunds() {
  const context = useContext(AddFundsContext);
  if (context === undefined) {
    throw new Error('useAddFunds must be used within an AddFundsProvider');
  }
  return context;
} 