'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/lib/context/tutorial-context';

export default function Home() {
  const router = useRouter();
  const { mode, setMode } = useTutorial();

  const handleModeSelect = (selectedMode: 'demo' | 'tutorial') => {
    setMode(selectedMode);
    router.push('/marketplace');
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
              variant={mode === 'demo' ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleModeSelect('demo')}
              className={mode === 'demo' ? 'bg-amber-600 hover:bg-amber-500 text-black' : 'text-amber-400 border-amber-400/20 hover:bg-amber-400/10'}
            >
              Demo Mode
            </Button>
            <Button
              variant={mode === 'tutorial' ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleModeSelect('tutorial')}
              className={mode === 'tutorial' ? 'bg-amber-600 hover:bg-amber-500 text-black' : 'text-amber-400 border-amber-400/20 hover:bg-amber-400/10'}
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
