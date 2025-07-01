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
      <div className="space-y-6 sm:space-y-8 w-full max-w-4xl">
        {/* Logo */}
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight px-4">
          <span className="text-white">State</span>
          <span className="text-amber-400">Mint</span>
        </h1>

        {/* Icon */}
        <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 mx-auto relative">
          <Image
            src="/images/33759.png"
            alt="StateMint Logo"
            width={256}
            height={256}
            className="object-contain"
            priority
          />
        </div>

        {/* Tagline */}
        <p className="text-white text-lg sm:text-2xl lg:text-3xl font-light tracking-wide px-4 text-center">
          Fractional Collectible Marketplace
        </p>

        {/* Mode Selection */}
        <div className="space-y-4 px-4">
          <p className="text-white/70 text-lg sm:text-xl tracking-wide">
            Demo Website
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
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

        {/* Seed Round */}
        <div className="mt-12 sm:mt-16 px-4">
          <p className="text-white/70 text-lg sm:text-xl tracking-wide">
            Seed Round <span className="text-amber-400">|</span> 2025
          </p>
        </div>
      </div>
    </main>
  );
}
