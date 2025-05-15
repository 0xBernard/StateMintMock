'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { LoginDialog } from '@/components/auth/login-dialog';

const navigation = [
  { name: 'Marketplace', href: '/marketplace', current: true, enabled: true },
  { name: 'Portfolio', href: '/portfolio', current: false, enabled: true },
  { name: 'Explore', href: '/explore', current: false, enabled: false },
  { name: 'Learn', href: '/learn', current: false, enabled: false },
  { name: 'Community', href: '/community', current: false, enabled: false },
];

export function Header() {
  const { isAuthenticated, user, logout, setShowLoginDialog } = useAuth();

  const handleNavClick = (e: React.MouseEvent, enabled: boolean) => {
    if (!enabled) {
      e.preventDefault();
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold">
                  <span className="text-white">State</span>
                  <span className="text-amber-400">Mint</span>
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.enabled)}
                  className={`text-sm font-medium ${
                    item.current
                      ? 'text-amber-400 border-b-2 border-amber-400'
                      : 'text-muted-foreground hover:text-amber-400'
                  } ${!item.enabled && 'cursor-default opacity-50'}`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search collectibles..."
                  className="w-64 px-4 py-2 text-sm bg-zinc-900 text-amber-400/50 rounded-full border border-amber-600/30 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder:text-amber-400/50 cursor-not-allowed"
                  disabled
                />
              </div>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                  className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
                >
                  Log in
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      <LoginDialog />
    </>
  );
} 