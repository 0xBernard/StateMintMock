'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MobilePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to marketplace since we now have a mobile-responsive design
    router.replace('/marketplace');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="text-2xl font-bold">
          <span className="text-white">State</span>
          <span className="text-amber-400">Mint</span>
        </div>
        <p className="text-muted-foreground">Redirecting to marketplace...</p>
      </div>
    </div>
  );
} 