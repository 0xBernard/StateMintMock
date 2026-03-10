const TUTORIAL_AUTOSTART_KEY = 'statemint_tutorial_autostart';

export function queueTutorialAutoStart(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(TUTORIAL_AUTOSTART_KEY, '1');
}

export function clearTutorialAutoStart(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TUTORIAL_AUTOSTART_KEY);
}

export function hasTutorialAutoStart(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(TUTORIAL_AUTOSTART_KEY) === '1';
}
