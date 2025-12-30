import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./tutorial.css";
import "./tutorial-enhanced.css";
import { AddFundsProvider } from '@/lib/context/add-funds-context';
import { AuthProvider } from '@/lib/context/auth-context';
import { FinancialProvider } from '@/lib/context/financial-context';
import { MarketProvider } from '@/lib/context/market-context';
import { ClientTutorialWrapper } from '@/components/tutorial';
import { Toaster } from 'sonner';
import { Toaster as RadixToaster } from '@/components/ui/toaster';
import { RecaptchaProvider } from '@/components/shared/recaptcha-provider';

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap", // Prevents FOIT - shows fallback font immediately
  preload: true,
});

export const metadata: Metadata = {
  title: "StateMint",
  description: "Fractional Collectible Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tutorialMode = process.env.NODE_ENV === 'development' ? 'full' : 'demo';

  return (
    <html lang="en" className="dark">
      <head>
        {/* Site icon */}
        <link rel="icon" href="/images/33759.png" sizes="any" type="image/png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <RecaptchaProvider>
          <AuthProvider>
            <FinancialProvider>
              <MarketProvider>
                <AddFundsProvider>
                  <ClientTutorialWrapper mode={tutorialMode}>
                    {children}
                    <Toaster />
                    <RadixToaster />
                  </ClientTutorialWrapper>
                </AddFundsProvider>
              </MarketProvider>
            </FinancialProvider>
          </AuthProvider>
        </RecaptchaProvider>
      </body>
    </html>
  );
}
