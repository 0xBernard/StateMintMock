'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useSwipeGestures, useEdgeSwipe } from '@/lib/hooks/use-swipe-gestures';
import { useHapticFeedback } from '@/lib/hooks/use-haptic-feedback';
import { cn } from '@/lib/utils';

interface EnhancedMobileMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function EnhancedMobileMenu({ 
  isOpen, 
  onOpenChange, 
  children, 
  className 
}: EnhancedMobileMenuProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { selection, light, medium } = useHapticFeedback();

  // Edge swipe to open menu from left edge
  useEdgeSwipe('left', () => {
    if (!isOpen) {
      light(); // Haptic feedback for menu opening
      onOpenChange(true);
    }
  }, {
    edgeThreshold: 20,
    swipeThreshold: 80,
    velocity: 0.2
  });

  // Swipe gestures for the menu content
  useSwipeGestures(contentRef, {
    onSwipeStart: () => {
      selection(); // Light haptic for swipe start
      setIsDragging(true);
      setIsClosing(false);
    },
    onSwipeMove: (currentX, currentY, deltaX) => {
      // Only allow leftward swipes to close
      if (deltaX < 0 && isOpen) {
        const clampedOffset = Math.max(-300, deltaX);
        setDragOffset(clampedOffset);
      }
    },
    onSwipeLeft: (distance, velocity) => {
      // Close menu if swipe was significant enough
      if ((distance > 100 || velocity > 0.5) && !isClosing) {
        medium(); // Stronger haptic for successful close
        setIsClosing(true);
        // Delay actual close to allow animation to play
        setTimeout(() => {
          onOpenChange(false);
        }, 300); // Match animation duration
      } else {
        light(); // Light haptic for snap back
        // Snap back to open position
        setDragOffset(0);
      }
      setIsDragging(false);
    },
    onSwipeEnd: () => {
      if (isDragging && Math.abs(dragOffset) < 100) {
        light(); // Light haptic for snap back
        // Snap back to open if drag wasn't far enough
        setDragOffset(0);
      }
      setIsDragging(false);
    }
  }, {
    threshold: 20,
    direction: 'horizontal',
    preventScroll: true
  });



  // Reset states when menu closes
  useEffect(() => {
    if (!isOpen) {
      setDragOffset(0);
      setIsDragging(false);
      setTimeout(() => setIsClosing(false), 300); // Match animation duration
    }
  }, [isOpen]);

  const menuStyle = {
    transform: isDragging ? `translateX(${dragOffset}px)` : undefined,
    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
  };

  // Enhanced close handling with haptic feedback and animation
  const handleCloseWithFeedback = (value: boolean) => {
    if (!value && isOpen && !isClosing) {
      // Start closing animation
      light(); // Haptic feedback for close
      setIsClosing(true);
      // Delay actual close to allow animation to play
      setTimeout(() => {
        onOpenChange(false);
      }, 300); // Match animation duration
      return; // Prevent immediate close
    }
    // Allow opening immediately
    if (value && !isOpen) {
      onOpenChange(value);
    }
  };

  // Handle outside tap with animation
  const handleOutsideInteraction = () => {
    if (isOpen && !isDragging && !isClosing) {
      light(); // Haptic feedback for outside touch
      setIsClosing(true);
      // Delay actual close to allow animation to play
      setTimeout(() => {
        onOpenChange(false);
      }, 300); // Match animation duration
    }
  };

  return (
    <>
      {/* Enhanced Sheet with Custom Overlay */}
      <Sheet open={isOpen} onOpenChange={handleCloseWithFeedback}>
        <SheetContent 
          side="left" 
          className={cn(
            "w-80 sm:max-w-sm p-0 border-r border-amber-600/30",
            "bg-gradient-to-b from-zinc-900 to-black",
            "shadow-2xl shadow-black/50",
            "mobile-menu-enhanced mobile-menu-transition",
            isClosing && "mobile-menu-closing",
            className
          )}
          style={menuStyle}
          ref={contentRef}
          // Allow outside interactions to close menu with animation
          onPointerDownOutside={handleOutsideInteraction}
        >
          {children}
        </SheetContent>
      </Sheet>

      {/* Swipe indicator for discovery */}
      {!isOpen && (
        <div className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-[98] pointer-events-none">
          <div className="w-1 h-16 bg-gradient-to-b from-transparent via-amber-400/30 to-transparent rounded-r-full swipe-indicator" />
        </div>
      )}
    </>
  );
}

// Enhanced Sheet components for better mobile experience
export function MobileMenuHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <SheetHeader className={cn(
      "p-6 border-b border-amber-600/30 bg-gradient-to-r from-amber-900/10 to-transparent",
      className
    )}>
      {children}
    </SheetHeader>
  );
}

export function MobileMenuTitle({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <SheetTitle className={cn(
      "flex items-center text-2xl font-bold",
      className
    )}>
      {children}
    </SheetTitle>
  );
}

export function MobileMenuContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "flex-1 overflow-y-auto mobile-menu-scrollbar mobile-menu-content",
      className
    )}>
      {children}
    </div>
  );
}

export function MobileMenuFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "p-6 border-t border-amber-600/30 mt-auto space-y-3 bg-gradient-to-t from-amber-900/10 to-transparent",
      className
    )}>
      {children}
    </div>
  );
}