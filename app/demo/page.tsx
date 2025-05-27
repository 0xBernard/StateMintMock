'use client';

import React from 'react';
import Link from 'next/link';
import { TutorialButton } from '@/components/tutorial';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">
        <span className="text-white">State</span>
        <span className="text-amber-400">Mint</span>
        <span className="text-white"> Demo</span>
      </h1>
      
      <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4 text-white">Tutorial System Demo</h2>
        
        <p className="text-gray-300 mb-6">
          This page demonstrates our new tutorial system with the "hole-in-overlay" approach.
          Click the button below to start a guided tour of the application.
        </p>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <TutorialButton />
          
          <Link href="/" className="text-amber-400 hover:underline text-center sm:text-left">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
} 