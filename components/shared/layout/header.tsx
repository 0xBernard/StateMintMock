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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Menu, User, Wallet, Home, ShoppingBag, Folder } from 'lucide-react';
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
  const { availableBalance } = useFinancial();
  const { getPortfolioValue } = usePortfolio();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
                <SheetContent side="left" className="w-80 bg-zinc-900 border-amber-600/30 p-0">
                  <div className="flex flex-col h-full">
                    <SheetHeader className="p-6 border-b border-amber-600/30">
                      <SheetTitle className="flex items-center text-2xl font-bold">
                        <span className="text-white">State</span>
                        <span className="text-amber-400">Mint</span>
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto">
                      {/* User Profile Section */}
                      {isAuthenticated && user && (
                        <div className="p-6 border-b border-amber-600/30">
                          <div className="flex items-center space-x-3 mb-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback className="bg-amber-600 text-black">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-amber-400 font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          
                          {/* Balance Information */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Available Balance</span>
                              <span className="text-amber-400 font-medium">
                                {formatCurrency(availableBalance)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
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
                    <div className="p-6 border-t border-amber-600/30 mt-auto">
                      {isAuthenticated ? (
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
    </>
  );
} 