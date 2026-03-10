'use client';

import { useEffect, useRef } from 'react';
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';
import { clearTutorialAutoStart, hasTutorialAutoStart } from '@/lib/tutorial/autostart';

export function TutorialAutoStart() {
  const isActiveRef = useRef(false);
  const { state, dispatch } = useTutorial();

  useEffect(() => {
    isActiveRef.current = state.isActive;
    if (state.isActive) {
      clearTutorialAutoStart();
    }
  }, [state.isActive]);

  useEffect(() => {
    if (!hasTutorialAutoStart()) return;

    let attempts = 0;
    const maxAttempts = 40; // ~3 seconds

    const tryStart = () => {
      if (isActiveRef.current) {
        clearTutorialAutoStart();
        clearInterval(intervalId);
        return;
      }

      attempts += 1;
      dispatch({ type: 'START_TUTORIAL' });

      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
    };

    const intervalId = setInterval(tryStart, 75);
    tryStart();

    return () => clearInterval(intervalId);
  }, [dispatch]);

  return null;
}
