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
    <main className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-2">
      <div className="space-y-8">
        {/* Logo */}
        <h1 className="text-8xl font-bold tracking-tight -mt-16">
          <span className="text-white">State</span>
          <span className="text-amber-400">Mint</span>
        </h1>

        {/* Icon */}
        <div className="w-64 h-64 mx-auto relative">
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
        <p className="text-white text-3xl font-light tracking-wide">
          Fractional Collectible Marketplace
        </p>

        {/* Mode Selection */}
        <div className="space-y-4">
          <p className="text-white/70 text-xl tracking-wide">
            Demo Website
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleModeSelect('demo')}
              className="text-amber-400 border-amber-400/20 hover:bg-amber-400/10"
              data-tutorial-id="demo-mode-button"
            >
              Demo Mode
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => handleModeSelect('tutorial')}
              className="bg-amber-600 hover:bg-amber-500 text-black"
              data-tutorial-id="tutorial-mode-button"
            >
              Tutorial Mode
            </Button>
          </div>
        </div>

        {/* Seed Round */}
        <div className="mt-24">
          <p className="text-white/70 text-xl tracking-wide">
            Seed Round <span className="text-amber-400">|</span> 2025
          </p>
        </div>
      </div>
    </main>
  );
}
