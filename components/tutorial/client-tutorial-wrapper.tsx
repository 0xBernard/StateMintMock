'use client';

import { TutorialProvider } from '@/lib/tutorial/ephemeral-provider';
import { getTutorialSteps } from '@/lib/tutorial/enhanced-config';

interface ClientTutorialWrapperProps {
  children: React.ReactNode;
  mode?: 'full' | 'demo';
}

export function ClientTutorialWrapper({ 
  children, 
  mode = 'demo'
}: ClientTutorialWrapperProps) {
  const tutorialSteps = getTutorialSteps(mode);

  return (
    <TutorialProvider steps={tutorialSteps}>
      {children}
    </TutorialProvider>
  );
} 