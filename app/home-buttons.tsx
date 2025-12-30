'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';

export function HomeButtons() {
  const router = useRouter();
  const { dispatch } = useTutorial();

  const handleModeSelect = (selectedMode: 'demo' | 'tutorial') => {
    if (selectedMode === 'tutorial') {
      console.log('Tutorial mode selected, navigating to marketplace...');
      router.push('/marketplace');
      
      setTimeout(() => {
        console.log('Starting tutorial...');
        dispatch({ type: 'START_TUTORIAL' });
      }, 2000);
    } else {
      router.push('/marketplace');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
      <Button
        variant="outline"
        size="lg"
        onClick={() => handleModeSelect('demo')}
        className="text-amber-400 border-amber-400/20 hover:bg-amber-400/10 w-full sm:w-auto"
        data-tutorial-id="demo-mode-button"
      >
        Demo Mode
      </Button>
      <Button
        variant="default"
        size="lg"
        onClick={() => handleModeSelect('tutorial')}
        className="bg-amber-600 hover:bg-amber-500 text-black w-full sm:w-auto"
        data-tutorial-id="tutorial-mode-button"
      >
        Tutorial Mode
      </Button>
    </div>
  );
}

export function AdditionalLinks() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
      <Button
        variant="ghost"
        size="lg"
        onClick={() => router.push('/waitlist')}
        className="text-white border border-white/20 hover:bg-white/10 hover:border-white/40 w-full sm:w-auto"
      >
        Join Waitlist
      </Button>
      <Button
        variant="ghost"
        size="lg"
        onClick={() => window.open('/pitch-deck.pdf', '_blank')}
        className="text-amber-400 border border-amber-400/20 hover:bg-amber-400/10 hover:border-amber-400/40 w-full sm:w-auto"
      >
        View Pitch Deck
      </Button>
    </div>
  );
}

