'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';

interface TutorialButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  startStepId?: string;
  children?: React.ReactNode;
}

export function TutorialButton({ 
  variant = 'default',
  size = 'default',
  className = '',
  startStepId,
  children = 'Start Tutorial'
}: TutorialButtonProps) {
  const { state, dispatch, reset } = useTutorial();

  const handleClick = () => {
    if (state.isActive) {
      // If tutorial is already active, restart it
      reset();
    } else {
      // Start tutorial from beginning or specific step
      if (startStepId) {
        const stepIndex = state.steps.findIndex(step => step.id === startStepId);
        dispatch({ 
          type: 'START_TUTORIAL', 
          payload: { stepIndex: stepIndex !== -1 ? stepIndex : 0 }
        });
      } else {
        dispatch({ type: 'START_TUTORIAL' });
      }
    }
  };

  // Use gold colors when variant is default
  const goldClasses = variant === 'default' 
    ? 'bg-[#f2b418] hover:bg-[#d99f15] border-[#f2b418] hover:border-[#d99f15] text-white' 
    : '';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`${goldClasses} ${className}`}
      data-tutorial-id="tutorial-trigger-button"
    >
      {state.isActive ? 'Restart Tutorial' : children}
    </Button>
  );
} 