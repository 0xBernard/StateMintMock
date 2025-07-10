'use client'

import { useState, useEffect } from 'react'
import { useAuth } from "@/lib/context/auth-context"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useTutorial } from '@/lib/tutorial/ephemeral-provider'
import React from 'react'

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

  // Handle tutorial advancement when dialog opens
  useEffect(() => {
    if (showLoginDialog && state.isActive) {
      const currentStep = state.steps[state.currentStepIndex];
      if (currentStep?.id === 'login-prompt') {
        console.log('Login dialog opened during login-prompt step - advancing to google-login-button step');
        setTimeout(() => {
          dispatch({ type: 'NEXT_STEP' });
        }, 200); // Reduced delay to better sync with dialog appearance
      }
    }
  }, [showLoginDialog, state.isActive, state.currentStepIndex, state.steps, dispatch]);

  const handleGoogleLogin = () => {
    setIsLoading(true)
    // Simulate OAuth flow delay
    setTimeout(() => {
      login()
      setIsLoading(false)
      setShowLoginDialog(false)
      
      // If tutorial is active, advance step based on current step
      const currentStep = state.steps[state.currentStepIndex];
      if (state.isActive) {
        if (currentStep?.id === 'google-login-button') {
          console.log('Google login button clicked during tutorial - advancing from google-login-button step')
          dispatch({ type: 'NEXT_STEP' });
        } else if (currentStep?.id === 'login-prompt') {
          console.log('Login completed during login-prompt step - advancing to login-completion')
          dispatch({ type: 'NEXT_STEP' });
        } else {
          console.log('Login completed during tutorial, auto-detect should handle advancement')
        }
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
      className="fixed inset-0 z-[2000]"
      onClick={handleBackdropClick}
    >
      {/* Custom backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Dialog content - using same positioning as Radix UI */}
      <div 
        className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-amber-600/30 rounded-lg p-6 w-[90vw] max-w-md"
        data-tutorial-id="login-dialog"
      >
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-amber-400">Welcome to StateMint</h2>
            <p className="text-sm text-muted-foreground">
            Sign in to start trading collectible shares
          </p>
          </div>
          
          <Button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-2 relative bg-white hover:bg-gray-50 text-black h-12"
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
                <span className="font-medium">Continue with Google</span>
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to StateMint&apos;s Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
} 