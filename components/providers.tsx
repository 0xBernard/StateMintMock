'use client'

import { AuthProvider } from "@/lib/context/auth-context"
import { TutorialProvider } from './tutorial/tutorial-provider';
 
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TutorialProvider>
      <AuthProvider>{children}</AuthProvider>
    </TutorialProvider>
  )
} 