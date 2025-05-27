'use client';

import React from 'react';
import { tutorialTarget, tutorialInteractive } from '@/lib/tutorial/utils';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';

/**
 * Example component showing how to properly integrate with the tutorial system
 */
export function TutorialExample() {
  const { dispatch } = useTutorial();
  
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Tutorial Integration Example</h2>
      
      <p className="text-sm text-muted-foreground">
        This example shows how to make elements targetable by the tutorial system
      </p>
      
      <div className="flex gap-4">
        {/* Use tutorialTarget for regular elements */}
        <Button 
          variant="outline"
          {...tutorialTarget('header-login-button')}
        >
          Login
        </Button>
        
        {/* Use tutorialInteractive for elements that need special handling */}
        <Button 
          variant="default"
          {...tutorialInteractive('deposit-button')}
        >
          Deposit Funds
        </Button>
        
        {/* Standard elements can also be targeted by data attributes directly */}
        <Button 
          variant="secondary"
          data-tutorial-id="portfolio-link"
        >
          View Portfolio
        </Button>
      </div>
      
      <div className="mt-8">
        <Button onClick={() => dispatch({ type: 'START_TUTORIAL' })}>
          Start Tutorial
        </Button>
      </div>
    </div>
  );
} 