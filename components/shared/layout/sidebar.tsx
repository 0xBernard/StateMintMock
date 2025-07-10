'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useFinancial } from '@/lib/context/financial-context';
import { useAddFunds } from '@/lib/context/add-funds-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const { availableBalance } = useFinancial();
  const { openAddFundsDialog } = useAddFunds();
  const pathname = usePathname();

  const portfolioValue = getPortfolioValue();
  const unrealizedPL = getUnrealizedPL();
  const percentageReturn = calculatePercentageChange(
    portfolioValue,
    portfolioValue - unrealizedPL
  );



  const handleNavClick = (e: React.MouseEvent, enabled: boolean) => {
    if (!enabled) {
      e.preventDefault();
    }
  };

  return (
    <aside className="w-64 bg-card fixed left-0 top-16 h-[calc(100vh-4rem)] p-6 border-r border-border hidden lg:block z-[var(--z-sidebar)]">
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
              onClick={() => {
                console.log('[Sidebar] Add Funds button clicked');
                openAddFundsDialog();
              }}
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