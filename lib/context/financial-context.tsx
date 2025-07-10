'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMemoryItem, setMemoryItem } from '@/lib/store/memory-store';

interface Transaction {
  type: 'deposit' | 'withdrawal' | 'purchase' | 'sale';
  amount: number;
  details: string;
  timestamp: number;
}

interface FinancialContextType {
  availableBalance: number;
  transactions: Transaction[];
  deposit: (amount: number) => void;
  withdraw: (amount: number) => boolean;
  addTransaction: (transaction: Omit<Transaction, 'timestamp'>) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const INITIAL_BALANCE = 100000.00; // Starting balance for demo

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [availableBalance, setAvailableBalance] = useState<number>(() => {
    const stored = getMemoryItem<number>('availableBalance');
    return stored ?? INITIAL_BALANCE;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = getMemoryItem<Transaction[]>('transactions');
    return stored ?? [];
  });

  // Save state to memory store whenever it changes
  useEffect(() => {
    setMemoryItem('availableBalance', availableBalance);
  }, [availableBalance]);

  useEffect(() => {
    setMemoryItem('transactions', transactions);
  }, [transactions]);

  const deposit = (amount: number) => {
    if (amount <= 0) return;
    setAvailableBalance(prev => prev + amount);
    addTransaction({
      type: 'deposit',
      amount,
      details: 'Funds added'
    });
  };

  const withdraw = (amount: number): boolean => {
    if (amount <= 0 || amount > availableBalance) return false;
    setAvailableBalance(prev => prev - amount);
    addTransaction({
      type: 'withdrawal',
      amount,
      details: 'Funds withdrawn'
    });
    return true;
  };

  const addTransaction = (transaction: Omit<Transaction, 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      timestamp: Date.now()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  return (
    <FinancialContext.Provider value={{
      availableBalance,
      transactions,
      deposit,
      withdraw,
      addTransaction
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
} 