'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Menu, User, Wallet, Home, ShoppingBag, Folder, Plus, CreditCard, Building2, QrCode, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { LoginDialog } from '@/components/auth/login-dialog';
import { useFinancial } from '@/lib/context/financial-context';
import { usePortfolio } from '@/lib/context/portfolio-context';

const navigation = [
  { name: 'Marketplace', href: '/marketplace', enabled: true, icon: ShoppingBag },
  { name: 'Portfolio', href: '/portfolio', enabled: true, icon: Folder },
  { name: 'Explore', href: '/explore', enabled: false },
  { name: 'Learn', href: '/learn', enabled: false },
  { name: 'Community', href: '/community', enabled: false },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function Header() {
  const { isAuthenticated, user, logout, setShowLoginDialog } = useAuth();
  const { availableBalance, deposit } = useFinancial();
  const { getPortfolioValue } = usePortfolio();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  // Add Funds dialog state
  const [showFundsDialog, setShowFundsDialog] = React.useState(false);
  const [isDepositing, setIsDepositing] = React.useState(false);
  const [depositAmount, setDepositAmount] = React.useState('');
  const [selectedMethod, setSelectedMethod] = React.useState<'card' | 'bank' | 'usdc' | null>(null);
  const mockUSDCAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  const portfolioValue = getPortfolioValue();

  const handleNavClick = (e: React.MouseEvent, enabled: boolean, href: string) => {
    if (!enabled) {
      e.preventDefault();
      return;
    }
    
    // If portfolio is clicked and user is not authenticated, show login dialog
    if (href === '/portfolio' && !isAuthenticated) {
      e.preventDefault();
      setShowLoginDialog(true);
    }
    
    // Close mobile menu when navigating
    setIsMobileMenuOpen(false);
  };

  // Add Funds handlers
  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0 || !selectedMethod) return;
    
    setIsDepositing(true);
    // Simulate deposit processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    deposit(amount);
    setIsDepositing(false);

    setShowFundsDialog(false);
    setDepositAmount('');
    setSelectedMethod(null);
    setIsMobileMenuOpen(false); // Close mobile menu after deposit
  };

  const handleDialogChange = (open: boolean) => {
    setShowFundsDialog(open);
  };

  const handlePaymentMethodSelect = (method: 'card' | 'bank' | 'usdc' | null) => {
    setSelectedMethod(method);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(mockUSDCAddress);
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[var(--z-header)] bg-black border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="lg:hidden mr-2 h-10 w-10 p-0"
                    aria-label="Open menu"
                  >
                    <Menu className="h-6 w-6 text-amber-400" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-zinc-900 border-amber-600/30 p-0 overflow-hidden">
                  <div className="flex flex-col h-full overflow-hidden">
                    <SheetHeader className="p-6 border-b border-amber-600/30">
                      <SheetTitle className="flex items-center text-2xl font-bold">
                        <span className="text-white">State</span>
                        <span className="text-amber-400">Mint</span>
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto">
                      {/* User Profile Section */}
                      {isAuthenticated && user && (
                        <div className="p-6 border-b border-amber-600/30 relative z-10">
                          <div className="flex items-center space-x-3 mb-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback className="bg-amber-600 text-black">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-amber-400 font-medium truncate">{user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                          
                          {/* Balance Information */}
                          <div className="space-y-2 portfolio-balance-section">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Available Balance</span>
                              <span className="text-amber-400 font-medium">
                                {formatCurrency(availableBalance)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Portfolio Value</span>
                              <span className="text-amber-400 font-medium">
                                {formatCurrency(portfolioValue)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Navigation Links */}
                      <nav className="p-6 space-y-2">
                        <Link
                          href="/"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 w-full p-3 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-950/20 transition-colors"
                        >
                          <Home className="h-5 w-5" />
                          <span>Home</span>
                        </Link>
                        
                        {navigation.map((item) => {
                          const isActive = pathname === item.href || (item.href === '/marketplace' && pathname.startsWith('/coin/'));
                          const Icon = item.icon;
                          
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={(e) => handleNavClick(e, item.enabled, item.href)}
                              className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
                                isActive
                                  ? 'text-amber-400 bg-amber-950/30'
                                  : item.enabled
                                  ? 'text-muted-foreground hover:text-amber-400 hover:bg-amber-950/20'
                                  : 'text-muted-foreground/50 cursor-not-allowed'
                              }`}
                            >
                              {Icon && <Icon className="h-5 w-5" />}
                              <span>{item.name}</span>
                              {!item.enabled && (
                                <span className="ml-auto text-xs bg-amber-600/20 text-amber-400 px-2 py-1 rounded">
                                  Soon
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </nav>
                    </div>
                    
                    {/* Bottom Actions */}
                    <div className="p-6 border-t border-amber-600/30 mt-auto space-y-3">
                      {isAuthenticated ? (
                        <>
                          <Button
                            onClick={() => {
                              setShowFundsDialog(true);
                              // Don't close mobile menu yet - let dialog handle it
                            }}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-black font-semibold"
                            data-tutorial-id="mobile-menu-add-funds-button"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Funds
                          </Button>
                          <Button
                            onClick={() => {
                              logout();
                              setIsMobileMenuOpen(false);
                            }}
                            variant="outline"
                            className="w-full border-amber-600/30 text-amber-400 hover:bg-amber-950/50"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => {
                            setShowLoginDialog(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full bg-amber-600 hover:bg-amber-500 text-black font-semibold"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Log in
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold">
                  <span className="text-white">State</span>
                  <span className="text-amber-400">Mint</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href === '/marketplace' && pathname.startsWith('/coin/'));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.enabled, item.href)}
                    className={`text-sm font-medium ${
                      isActive
                        ? 'text-amber-400 border-b-2 border-amber-400'
                        : 'text-muted-foreground hover:text-amber-400'
                    } ${!item.enabled && 'cursor-default opacity-50'}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Search and User Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Hide search on mobile to save space */}
              <div className="hidden lg:block relative">
                <input
                  type="text"
                  placeholder="Search collectibles..."
                  className="w-64 px-4 py-2 text-sm bg-zinc-900 text-amber-400/50 rounded-full border border-amber-600/30 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder:text-amber-400/50 cursor-not-allowed"
                  disabled
                />
              </div>

              {/* Desktop User Menu */}
              <div className="hidden lg:block">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-8 w-8 rounded-full"
                      data-tutorial-id="user-profile"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                        <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 border border-amber-600/30">
                    <DropdownMenuLabel className="text-amber-400">{user?.name}</DropdownMenuLabel>
                    <DropdownMenuItem className="text-muted-foreground">
                      {user?.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={logout}
                      className="text-amber-400 focus:bg-amber-950/50 focus:text-amber-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setShowLoginDialog(true)}
                  className="bg-amber-600 hover:bg-amber-500 text-black font-semibold tutorial-interactive"
                  data-tutorial-id="header-login-button"
                >
                  Log in
                </Button>
              )}
              </div>

              {/* Mobile User Action - show wallet icon or user icon */}
              <div className="lg:hidden">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-amber-400 font-medium">
                      {formatCurrency(availableBalance)}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                      <AvatarFallback className="bg-amber-600 text-black text-xs">
                        {user?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowLoginDialog(true)}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <LoginDialog />
      
      {/* Mobile Add Funds Dialog */}
      <Dialog open={showFundsDialog} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw] mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-400">Add Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Payment Methods */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Choose payment method</Label>
              <div className="grid gap-3">
                <Button
                  variant={selectedMethod === 'card' ? 'default' : 'outline'}
                  className={`justify-start p-4 h-auto ${selectedMethod === 'card' ? 'bg-amber-600/20 border-amber-600 text-amber-400' : ''}`}
                  onClick={() => handlePaymentMethodSelect('card')}
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
                <Label className="text-sm font-medium">USDC Deposit Address</Label>
                <div className="bg-zinc-900/50 p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ethereum Network</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="text-sm font-mono bg-black/50 p-2 rounded text-center break-all">
                    {mockUSDCAddress}
                  </div>
                </div>
                <div className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-lg">
                  ⚠️ Only send USDC on Ethereum network to this address. Other tokens or networks may result in permanent loss.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  handleDialogChange(false);
                  setIsMobileMenuOpen(false); // Close mobile menu when canceling
                }}
                className="flex-1"
                disabled={isDepositing}
              >
                Cancel
              </Button>
              
              {selectedMethod === 'usdc' ? (
                <Button
                  onClick={() => {
                    handleDialogChange(false);
                    setIsMobileMenuOpen(false); // Close mobile menu
                  }}
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
    </>
  );
} 