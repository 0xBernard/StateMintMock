'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CreditCard, Building2, QrCode, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { useFinancial } from '@/lib/context/financial-context';
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';
import { debug } from '@/lib/utils/debug';

interface AddFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFundsDialog({ open, onOpenChange }: AddFundsDialogProps) {
  const { deposit } = useFinancial();
  const { currentStep, dispatch } = useTutorial();
  
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'bank' | 'usdc' | null>(null);
  
  // Debug logging for dialog state changes
  useEffect(() => {
    debug.log('[AddFundsDialog] Dialog open state changed:', { 
      open, 
      currentStepId: currentStep?.id,
      isAddFundsButtonStep: currentStep?.id === 'add-funds-button'
    });
    
    // Handle tutorial advancement when dialog opens
    if (open && currentStep?.id === 'add-funds-button') {
      debug.log('[AddFundsDialog] Dialog opened during add-funds-button step - advancing to select-payment-method');
      
      // Single dispatch call to avoid conflicts with provider's processing guard
      dispatch({ type: 'NEXT_STEP' });
    } else if (open) {
      debug.log('[AddFundsDialog] Dialog opened but not during tutorial add-funds-button step. Current step:', currentStep?.id);
    }
  }, [open, currentStep?.id, dispatch]);
  
  const mockUSDCAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const quickAmounts = [100, 500, 1000, 5000];

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0 || !selectedMethod) return;
    
    setIsDepositing(true);
    // Simulate deposit processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    deposit(amount);
    setIsDepositing(false);

    // Advance tutorial if we're on the add-funds-dialog-opened step
    if (currentStep?.id === 'add-funds-dialog-opened') {
      debug.log('[AddFundsDialog] Deposit completed during tutorial - advancing step');
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 300);
    }

    // Brief delay to allow tutorial to process if needed
    await new Promise(resolve => setTimeout(resolve, 100));

    onOpenChange(false);
    setDepositAmount('');
    setSelectedMethod(null);
  };

  const handleDialogChange = (newOpen: boolean) => {
    debug.log('[AddFundsDialog] handleDialogChange called. Open:', newOpen, 'Current step:', currentStep?.id);

    // For preventing dialog closure during tutorial
    if (!newOpen && (currentStep?.id === 'add-funds-button' || currentStep?.id === 'select-payment-method' || currentStep?.id === 'add-funds-dialog-opened')) {
      debug.log(`[AddFundsDialog] Attempted to close Add Funds dialog during tutorial step ${currentStep.id}. Preventing.`);
      return;
    }
    
    // IMPORTANT: Always allow the dialog state to change first
    onOpenChange(newOpen);
  };

  const handlePaymentMethodSelect = (method: 'card' | 'bank' | 'usdc' | null) => {
    debug.log('[AddFundsDialog] handlePaymentMethodSelect called:', { 
      method, 
      currentStepId: currentStep?.id, 
      isSelectPaymentMethodStep: currentStep?.id === 'select-payment-method' 
    });
    
    setSelectedMethod(method);
    
    // Advance tutorial if we're on the select-payment-method step and a method was selected
    if (currentStep?.id === 'select-payment-method' && method !== null) {
      debug.log('[AddFundsDialog] Payment method selected during tutorial - advancing to add-funds-dialog-opened');
      
      // Single dispatch call to avoid conflicts with provider's processing guard
        dispatch({ type: 'NEXT_STEP' });
    } else if (method !== null) {
      debug.log('[AddFundsDialog] Payment method selected but not during tutorial step. Current step:', currentStep?.id);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(mockUSDCAddress);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent 
        className="w-[90vw] max-w-md max-h-[90vh] overflow-y-auto" 
        data-tutorial-id="add-funds-dialog"
        onPointerDownOutside={(e) => {
          // Prevent closing on outside click during tutorial
          const currentStepId = currentStep?.id;
          if (currentStepId === 'add-funds-button' || currentStepId === 'select-payment-method' || currentStepId === 'add-funds-dialog-opened') {
            e.preventDefault();
            debug.log(`[AddFundsDialog] Preventing dialog close on outside click during ${currentStepId}`);
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing on escape key during tutorial
          const currentStepId = currentStep?.id;
          if (currentStepId === 'add-funds-button' || currentStepId === 'select-payment-method' || currentStepId === 'add-funds-dialog-opened') {
            e.preventDefault();
            debug.log(`[AddFundsDialog] Preventing dialog close on escape key during ${currentStepId}`);
          }
        }}
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold text-amber-400">Add Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Payment Methods */}
          <div className="space-y-2" data-tutorial-id="payment-methods-section">
            <Label className="text-sm font-medium">Choose payment method</Label>
            <div className="grid gap-3">
              <Button
                variant={selectedMethod === 'card' ? 'default' : 'outline'}
                className={`justify-start p-4 h-auto ${selectedMethod === 'card' ? 'bg-amber-600/20 border-amber-600 text-amber-400' : ''}`}
                onClick={() => handlePaymentMethodSelect('card')}
                data-tutorial-id="payment-method-card"
              >
                <CreditCard className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Credit/Debit Card</div>
                  <div className="text-sm text-muted-foreground">Instant transfer</div>
                </div>
              </Button>
              
              <Button
                variant={selectedMethod === 'bank' ? 'default' : 'outline'}
                className={`justify-start p-4 h-auto ${selectedMethod === 'bank' ? 'bg-amber-600/20 border-amber-600 text-amber-400' : ''}`}
                onClick={() => handlePaymentMethodSelect('bank')}
                data-tutorial-id="payment-method-bank"
              >
                <Building2 className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Bank Transfer</div>
                  <div className="text-sm text-muted-foreground">1-3 business days</div>
                </div>
              </Button>
              
              <Button
                variant={selectedMethod === 'usdc' ? 'default' : 'outline'}
                className={`justify-start p-4 h-auto ${selectedMethod === 'usdc' ? 'bg-amber-600/20 border-amber-600 text-amber-400' : ''}`}
                onClick={() => handlePaymentMethodSelect('usdc')}
                data-tutorial-id="payment-method-usdc"
              >
                <QrCode className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">USDC Deposit</div>
                  <div className="text-sm text-muted-foreground">Crypto wallet transfer</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Amount Input for Card/Bank */}
          {(selectedMethod === 'card' || selectedMethod === 'bank') && (
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-sm font-medium">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="text-lg"
              />
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount(amount.toString())}
                    className="text-xs"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* USDC Instructions */}
          {selectedMethod === 'usdc' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Send USDC to this address</Label>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <code className="text-xs break-all">{mockUSDCAddress}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="ml-2 h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Only send USDC on Ethereum network. Funds will appear after network confirmation.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2" data-tutorial-id="action-buttons">
            <Button
              variant="outline"
              onClick={() => handleDialogChange(false)}
              className="flex-1"
              disabled={isDepositing}
            >
              Cancel
            </Button>
            
            {selectedMethod === 'usdc' ? (
              <Button
                onClick={() => handleDialogChange(false)}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-black"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Continue in Wallet
              </Button>
            ) : (
              <Button
                onClick={handleDeposit}
                disabled={!selectedMethod || !depositAmount || parseFloat(depositAmount) <= 0 || isDepositing}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-black disabled:opacity-50"
                data-tutorial-id="deposit-button"
              >
                {isDepositing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Deposit ${depositAmount ? `$${depositAmount}` : ''}`
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 