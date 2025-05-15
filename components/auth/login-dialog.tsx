'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/context/auth-context"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export function LoginDialog() {
  const { showLoginDialog, setShowLoginDialog, login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = () => {
    setIsLoading(true)
    // Simulate OAuth flow delay
    setTimeout(() => {
      login()
      setIsLoading(false)
    }, 1500)
  }

  return (
    <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-lg font-semibold text-center">
          Welcome to StateMint
        </DialogTitle>
        
        <div className="flex flex-col items-center space-y-6 py-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              <span className="text-white">State</span>
              <span className="text-amber-400">Mint</span>
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Sign in to start trading collectible shares
          </p>

          <Button 
            variant="outline" 
            className="w-full relative h-12"
            onClick={handleGoogleLogin}
            disabled={isLoading}
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
                  className="mr-2"
                />
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to StateMint's Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 