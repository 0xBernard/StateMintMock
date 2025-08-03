'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';

export default function Home() {
  const router = useRouter();
  const { dispatch } = useTutorial();

  const handleModeSelect = (selectedMode: 'demo' | 'tutorial') => {
    if (selectedMode === 'tutorial') {
      console.log('Tutorial mode selected, navigating to marketplace...');
      // First navigate to marketplace
      router.push('/marketplace');
      
      // Start the tutorial after a delay to ensure the page has fully loaded
      setTimeout(() => {
        console.log('Starting tutorial...');
        dispatch({ type: 'START_TUTORIAL' }); // Start at the first step
      }, 2000);
    } else {
      router.push('/marketplace');
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4 sm:p-6">
      <div className="flex flex-col items-center space-y-4 sm:space-y-6 lg:space-y-8 max-w-4xl">
        {/* Logo */}
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight">
          <span className="text-white">State</span>
          <span className="text-amber-400">Mint</span>
        </h1>

        {/* Icon */}
        <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 relative">
          <Image
            src="/images/33759.png"
            alt="StateMint Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Tagline */}
        <p className="text-white text-base sm:text-2xl lg:text-3xl font-light tracking-wide">
          Fractional Collectible Marketplace
        </p>

        {/* Mode Selection */}
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <p className="text-white/70 text-base sm:text-xl tracking-wide">
            Demo Website
          </p>
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
        </div>

        {/* Additional Links */}
        <div className="mt-6 sm:mt-8 space-y-4">
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
        </div>

        {/* Seed Round */}
        <div className="mt-6 sm:mt-8 lg:mt-12">
          <p className="text-white/70 text-base sm:text-xl tracking-wide">
            Seed Round <span className="text-amber-400">|</span> 2025
          </p>
        </div>
      </div>
    </main>
  );
}
