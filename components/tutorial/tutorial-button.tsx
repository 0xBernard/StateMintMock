'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTutorial } from './tutorial-provider';

interface TutorialButtonProps {
  className?: string;
  stepId?: string;
}

export function TutorialButton({ className, stepId }: TutorialButtonProps) {
  const { startTutorial } = useTutorial();
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={`${className || ''} bg-amber-600 hover:bg-amber-500 text-black`}
      onClick={() => startTutorial(stepId)}
    >
      Start Tutorial
    </Button>
  );
} 