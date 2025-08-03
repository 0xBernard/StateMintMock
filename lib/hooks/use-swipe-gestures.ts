'use client';

import { useEffect, useRef, useCallback } from 'react';

interface SwipeConfig {
  threshold?: number;
  velocity?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
  preventScroll?: boolean;
}

interface SwipeCallbacks {
  onSwipeLeft?: (distance: number, velocity: number) => void;
  onSwipeRight?: (distance: number, velocity: number) => void;
  onSwipeUp?: (distance: number, velocity: number) => void;
  onSwipeDown?: (distance: number, velocity: number) => void;
  onSwipeStart?: (startX: number, startY: number) => void;
  onSwipeMove?: (currentX: number, currentY: number, deltaX: number, deltaY: number) => void;
  onSwipeEnd?: () => void;
}

export function useSwipeGestures<T extends HTMLElement>(
  elementRef: React.RefObject<T | null>,
  callbacks: SwipeCallbacks,
  config: SwipeConfig = {}
) {
  const {
    threshold = 50,
    velocity = 0.3,
    direction = 'both',
    preventScroll = false
  } = config;

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchCurrent = useRef<{ x: number; y: number } | null>(null);
  const isTracking = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    touchCurrent.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    isTracking.current = true;
    
    callbacks.onSwipeStart?.(touch.clientX, touch.clientY);
  }, [callbacks]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current || !isTracking.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;

    touchCurrent.current = {
      x: touch.clientX,
      y: touch.clientY
    };

    // Prevent scroll if configured and we're in the right direction
    if (preventScroll) {
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      if (
        (direction === 'horizontal' && isHorizontalSwipe) ||
        (direction === 'vertical' && !isHorizontalSwipe) ||
        direction === 'both'
      ) {
        e.preventDefault();
      }
    }

    callbacks.onSwipeMove?.(touch.clientX, touch.clientY, deltaX, deltaY);
  }, [callbacks, direction, preventScroll]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current || !touchCurrent.current || !isTracking.current) return;

    const deltaX = touchCurrent.current.x - touchStart.current.x;
    const deltaY = touchCurrent.current.y - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Calculate velocity (pixels per millisecond)
    const velocityX = absX / deltaTime;
    const velocityY = absY / deltaTime;

    // Determine if this was a swipe
    const isHorizontalSwipe = absX > absY && absX > threshold && velocityX > velocity;
    const isVerticalSwipe = absY > absX && absY > threshold && velocityY > velocity;

    if (direction === 'horizontal' || direction === 'both') {
      if (isHorizontalSwipe) {
        if (deltaX > 0) {
          callbacks.onSwipeRight?.(absX, velocityX);
        } else {
          callbacks.onSwipeLeft?.(absX, velocityX);
        }
      }
    }

    if (direction === 'vertical' || direction === 'both') {
      if (isVerticalSwipe) {
        if (deltaY > 0) {
          callbacks.onSwipeDown?.(absY, velocityY);
        } else {
          callbacks.onSwipeUp?.(absY, velocityY);
        }
      }
    }

    // Reset tracking
    touchStart.current = null;
    touchCurrent.current = null;
    isTracking.current = false;
    
    callbacks.onSwipeEnd?.();
  }, [callbacks, threshold, velocity, direction]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isTracking: isTracking.current
  };
}

// Edge swipe detection for opening menus from screen edges
export function useEdgeSwipe(
  side: 'left' | 'right' | 'top' | 'bottom',
  onEdgeSwipe: () => void,
  config: { 
    edgeThreshold?: number; 
    swipeThreshold?: number;
    velocity?: number;
  } = {}
) {
  const {
    edgeThreshold = 20, // Distance from edge to trigger
    swipeThreshold = 100, // Distance to swipe to trigger
    velocity = 0.3
  } = config;

  useEffect(() => {
    let touchStart: { x: number; y: number; time: number } | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const { clientX, clientY } = touch;
      
      // Check if touch started near the specified edge
      const nearEdge = (() => {
        switch (side) {
          case 'left':
            return clientX <= edgeThreshold;
          case 'right':
            return clientX >= window.innerWidth - edgeThreshold;
          case 'top':
            return clientY <= edgeThreshold;
          case 'bottom':
            return clientY >= window.innerHeight - edgeThreshold;
        }
      })();

      if (nearEdge) {
        touchStart = {
          x: clientX,
          y: clientY,
          time: Date.now()
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStart.time;
      const swipeVelocity = Math.sqrt(deltaX ** 2 + deltaY ** 2) / deltaTime;

      // Check if swipe was in the correct direction and meets thresholds
      const validSwipe = (() => {
        switch (side) {
          case 'left':
            return deltaX > swipeThreshold && Math.abs(deltaY) < swipeThreshold / 2;
          case 'right':
            return deltaX < -swipeThreshold && Math.abs(deltaY) < swipeThreshold / 2;
          case 'top':
            return deltaY > swipeThreshold && Math.abs(deltaX) < swipeThreshold / 2;
          case 'bottom':
            return deltaY < -swipeThreshold && Math.abs(deltaX) < swipeThreshold / 2;
        }
      })();

      if (validSwipe && swipeVelocity > velocity) {
        onEdgeSwipe();
      }

      touchStart = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [side, edgeThreshold, swipeThreshold, velocity, onEdgeSwipe]);
}