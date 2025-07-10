'use client';

import { AddFundsDialog } from './add-funds-dialog';
import { useAddFunds } from '@/lib/context/add-funds-context';

export function AddFundsDialogWrapper() {
  const { showFundsDialog, setShowFundsDialog } = useAddFunds();

  return (
    <AddFundsDialog 
      open={showFundsDialog} 
      onOpenChange={setShowFundsDialog} 
    />
  );
} 