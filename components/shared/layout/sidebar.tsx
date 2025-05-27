'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useFinancial } from '@/lib/context/financial-context';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Loader2, CreditCard, Building2, ChevronRight, Wallet, QrCode, Copy, ExternalLink } from 'lucide-react';
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';
import { useEffect } from 'react';

type MenuItem = {
  name: string;
  href: string;
  icon?: string;
  enabled: boolean;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menuItems: MenuSection[] = [
  {
    title: 'Menu',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: 'grid', enabled: false },
      { name: 'Marketplace', href: '/marketplace', icon: 'shopping-bag', enabled: true },
      { name: 'My Portfolio', href: '/portfolio', icon: 'folder', enabled: true },
      { name: 'Trending', href: '/trending', icon: 'trending-up', enabled: false },
      { name: 'Verification', href: '/verification', icon: 'check-circle', enabled: false },
    ],
  },
  {
    title: 'Categories',
    items: [
      { name: 'U.S. Coins', href: '/category/us-coins', enabled: false },
      { name: 'World Coins', href: '/category/world-coins', enabled: false },
      { name: 'Ancient Coins', href: '/category/ancient-coins', enabled: false },
      { name: 'Commemorative', href: '/category/commemorative', enabled: false },
      { name: 'Gold & Silver', href: '/category/gold-silver', enabled: false },
    ],
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function calculatePercentageChange(current: number, original: number) {
  return ((current - original) / original) * 100;
}

export function Sidebar() {
  const { user } = useAuth();
  const { getPortfolioValue, getUnrealizedPL } = usePortfolio();
  const { availableBalance, deposit } = useFinancial();
  const { state, dispatch, currentStep } = useTutorial();
  const pathname = usePathname();
  const [showFundsDialog, setShowFundsDialog] = React.useState(false);
  const [isDepositing, setIsDepositing] = React.useState(false);
  const [depositAmount, setDepositAmount] = React.useState('');
  const [selectedMethod, setSelectedMethod] = React.useState<'card' | 'bank' | 'usdc' | null>(null);
  const mockUSDCAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  const portfolioValue = getPortfolioValue();
  const unrealizedPL = getUnrealizedPL();
  const percentageReturn = calculatePercentageChange(
    portfolioValue,
    portfolioValue - unrealizedPL
  );

  // Add debugging and auto-advancement for tutorial steps
  useEffect(() => {
    console.log('[Sidebar] Tutorial state changed:', {
      isActive: state.isActive,
      currentStepId: currentStep?.id,
      showFundsDialog,
      selectedMethod
    });

    // Auto-advance if dialog is open but tutorial is still on add-funds-button
    if (state.isActive && currentStep?.id === 'add-funds-button' && showFundsDialog) {
      console.log('[Sidebar] Dialog is open but tutorial stuck on add-funds-button - auto-advancing');
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 500);
    }

    // Auto-advance if payment method is selected but tutorial is still on select-payment-method
    if (state.isActive && currentStep?.id === 'select-payment-method' && selectedMethod && showFundsDialog) {
      console.log('[Sidebar] Payment method selected but tutorial stuck on select-payment-method - auto-advancing');
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 500);
    }
  }, [state.isActive, currentStep?.id, showFundsDialog, selectedMethod, dispatch]);

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
      console.log('[Sidebar] Deposit completed during tutorial - advancing step');
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 500); // Small delay to let the UI update
    }

    // Delay closing the dialog to allow tutorial to advance if needed
    await new Promise(resolve => setTimeout(resolve, 250));

    setShowFundsDialog(false);
    setDepositAmount('');
    setSelectedMethod(null);
  };

  // Update the dialog change handler to advance when dialog opens
  const handleDialogChange = (open: boolean) => {
    console.log('[Sidebar] handleDialogChange called. Open:', open, 'Current step:', currentStep?.id);

    // For preventing dialog closure during tutorial
    if (!open && (currentStep?.id === 'select-payment-method' || currentStep?.id === 'add-funds-dialog-opened')) {
      console.log(`[Sidebar] Attempted to close Add Funds dialog during tutorial step ${currentStep.id}. Preventing.`);
      return;
    }
    
    setShowFundsDialog(open);
    
    // Advance tutorial when dialog opens if we're on the add-funds-button step
    if (open && currentStep?.id === 'add-funds-button') {
      console.log('[Sidebar] Dialog opened during add-funds-button step - advancing to select-payment-method');
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 300);
    }
  };

  // Add handler for when payment method is selected
  const handlePaymentMethodSelect = (method: 'card' | 'bank' | 'usdc' | null) => {
    setSelectedMethod(method);
    
    // Advance tutorial if we're on the select-payment-method step and a method was selected
    if (currentStep?.id === 'select-payment-method' && method !== null) {
      console.log('[Sidebar] Payment method selected during tutorial - advancing to add-funds-dialog-opened');
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 500); // Slightly longer delay to let the UI update
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(mockUSDCAddress);
    // In a real app, we'd show a toast notification here
  };

  const quickAmounts = [100, 500, 1000, 5000];

  const handleNavClick = (e: React.MouseEvent, enabled: boolean) => {
    if (!enabled) {
      e.preventDefault();
    }
  };

  return (
    <aside className="w-64 bg-card fixed left-0 top-16 h-[calc(100vh-4rem)] p-6 border-r border-border hidden lg:block">
      {menuItems.map((section) => (
        <div key={section.title} className="mb-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {section.title}
          </h3>
          <nav className="space-y-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.enabled)}
                  data-tutorial-id={
                    item.name === 'My Portfolio' 
                      ? 'portfolio-link' 
                      : item.name === 'Marketplace'
                        ? 'marketplace-link'
                        : undefined
                  }
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-secondary text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-white',
                    !item.enabled && 'cursor-default opacity-50'
                  )}
                >
                  {item.icon && (
                    <span className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      <IconComponent name={item.icon} />
                    </span>
                  )}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      {user && (
        <div className="absolute bottom-8 left-6 right-6 space-y-4">
          {/* Account Balance Section */}
          <div className="bg-black/20 rounded-lg p-4 border border-primary/20">
            <div className="flex items-baseline justify-between mb-1">
              <div className="text-2xl font-bold text-white">{formatCurrency(availableBalance)}</div>
            </div>
            <div className="text-sm text-muted-foreground mb-3">Available Balance</div>
            <Button 
              className="w-full bg-amber-600 hover:bg-amber-500 text-black font-semibold"
              onClick={() => setShowFundsDialog(true)}
              data-tutorial-id="add-funds-button"
            >
              Add Funds
            </Button>
          </div>

          {/* Portfolio Value Section */}
          <div className="bg-black/20 rounded-lg p-4 border border-primary/20">
            <div className="flex items-baseline justify-between mb-1">
              <div className="text-2xl font-bold text-white">{formatCurrency(portfolioValue)}</div>
              <div className={`text-sm ${percentageReturn >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                {percentageReturn >= 0 ? '↑' : '↓'} {Math.abs(percentageReturn).toFixed(1)}%
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Portfolio Value</div>
          </div>
        </div>
      )}

      {/* Add Funds Dialog */}
      <Dialog 
        open={showFundsDialog} 
        onOpenChange={handleDialogChange}
      >
        <DialogContent 
          className="fixed z-[1000000] left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] sm:max-w-md w-[90vw] bg-black border border-border" 
          data-tutorial-id="add-funds-dialog"
          onPointerDownOutside={(e) => {
            // Prevent closing on outside click during tutorial
            const currentStepId = currentStep?.id;
            if (currentStepId === 'add-funds-dialog' || currentStepId === 'add-funds-dialog-opened') {
              e.preventDefault();
              console.log(`[Sidebar] Preventing dialog close on outside click during ${currentStepId}`);
            }
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing on escape key during tutorial
            const currentStepId = currentStep?.id;
            if (currentStepId === 'add-funds-dialog' || currentStepId === 'add-funds-dialog-opened') {
              e.preventDefault();
              console.log(`[Sidebar] Preventing dialog close on escape key during ${currentStepId}`);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Add Funds to StateMint</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {!selectedMethod ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Choose a payment method to add funds to your account
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-4 px-4"
                  onClick={() => handlePaymentMethodSelect('card')}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Credit or Debit Card</div>
                      <div className="text-sm text-muted-foreground">Instant deposit, 2.49% fee</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-4 px-4"
                  onClick={() => handlePaymentMethodSelect('bank')}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Bank Account (ACH)</div>
                      <div className="text-sm text-muted-foreground">3-5 business days, no fee</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-4 px-4"
                  onClick={() => handlePaymentMethodSelect('usdc')}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Transfer USDC</div>
                      <div className="text-sm text-muted-foreground">Instant deposit after confirmation, no fee</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            ) : selectedMethod === 'usdc' ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="bg-black/20 p-4 rounded-lg inline-block mb-4">
                    <QrCode className="h-48 w-48" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Scan to transfer USDC
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>USDC Deposit Address (Ethereum)</Label>
                  <div className="flex items-center gap-2 bg-secondary/50 p-3 rounded-lg">
                    <code className="text-xs flex-1 break-all">{mockUSDCAddress}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCopyAddress}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2 text-amber-500">
                    <div className="shrink-0 mt-0.5">⚠️</div>
                    <div className="text-sm">
                      Only send USDC on Ethereum mainnet to this address. Sending other tokens or using other networks may result in permanent loss of funds.
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://app.uniswap.org', '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Get USDC on Uniswap
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handlePaymentMethodSelect(null)}
                  >
                    Back to Payment Methods
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <Label htmlFor="amount">Amount to Deposit</Label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-muted-foreground sm:text-sm">$</span>
                    </div>
                    <Input
                      type="number"
                      id="amount"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepositAmount(e.target.value)}
                      className="pl-7"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <Label className="mb-2 block">Quick Add</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        className="w-full"
                        onClick={() => setDepositAmount(amount.toString())}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <div className="flex items-center gap-2">
                      {selectedMethod === 'card' ? (
                        <>
                          <CreditCard className="h-4 w-4" />
                          <span className="font-medium">•••• 4242</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">US Bank •••• 1234</span>
                        </>
                      )}
                    </div>
                  </div>
                  {selectedMethod === 'card' && parseFloat(depositAmount) > 0 && (
                    <div className="text-sm text-amber-400 mt-2">
                      Fee: {formatCurrency(parseFloat(depositAmount) * 0.0249)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-500 text-black font-semibold tutorial-interactive-element"
                    onClick={handleDeposit}
                    disabled={isDepositing || !depositAmount || parseFloat(depositAmount) <= 0}
                    data-tutorial-id="confirm-deposit"
                  >
                    {isDepositing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Deposit ${depositAmount ? formatCurrency(parseFloat(depositAmount)) : '$0.00'}`
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handlePaymentMethodSelect(null)}
                    disabled={isDepositing}
                  >
                    Back to Payment Methods
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

// Simple icon component - we can replace this with a proper icon library later
function IconComponent({ name }: { name: string }) {
  // Basic SVG icons - we'll replace these with proper icons later
  const icons: Record<string, React.ReactNode> = {
    'grid': <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    'shopping-bag': <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
    'folder': <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
    'trending-up': <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    'check-circle': <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };

  return <div className="w-5 h-5">{icons[name]}</div>;
} 