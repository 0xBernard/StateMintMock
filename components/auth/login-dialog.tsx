'use client'

import { useState } from 'react'
import { useAuth } from "@/lib/context/auth-context"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useTutorial } from '@/lib/tutorial/ephemeral-provider'

export function LoginDialog() {
  const { showLoginDialog, setShowLoginDialog, login } = useAuth()
  const { state, dispatch } = useTutorial()
  const [isLoading, setIsLoading] = useState(false)

  // Debug logging
  console.log('LoginDialog render:', { 
    showLoginDialog, 
    isTutorialActive: state.isActive, 
    activeStepId: state.steps[state.currentStepIndex]?.id 
  })

  const handleGoogleLogin = () => {
    setIsLoading(true)
    // Simulate OAuth flow delay
    setTimeout(() => {
      login()
      setIsLoading(false)
      setShowLoginDialog(false)
      
      // If tutorial is active and on login-prompt step, advance immediately
      const currentStep = state.steps[state.currentStepIndex];
      if (state.isActive && currentStep?.id === 'login-prompt') {
        console.log('Login completed, advancing tutorial step immediately')
        dispatch({ type: 'NEXT_STEP' });
      } else {
        console.log('Login completed, tutorial should auto-detect and advance')
      }
    }, 1500)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !state.isActive) {
      setShowLoginDialog(false)
    }
  }

  if (!showLoginDialog) return null

  return (
    <div 
      className="fixed inset-0 z-[2005]"
      onClick={handleBackdropClick}
      data-tutorial-id="login-dialog"
    >
      {/* Custom backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Dialog content - using same positioning as Radix UI */}
      <div className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-amber-600/30 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">Welcome to StateMint</h2>
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Sign in to start trading collectible shares
          </p>
          <Button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-2 relative bg-white hover:bg-gray-50 text-black"
            disabled={isLoading}
            data-tutorial-id="google-oauth-button"
            aria-label="Continue with Google"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Image
                  src="/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="absolute left-3"
                />
                <span>Continue with Google</span>
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By continuing, you agree to StateMint&apos;s Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
} 