import Image from 'next/image';
import { HomeButtons, AdditionalLinks } from './home-buttons';

export default function Home() {
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
          <HomeButtons />
        </div>

        {/* Additional Links */}
        <div className="mt-6 sm:mt-8 space-y-4">
          <AdditionalLinks />
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
