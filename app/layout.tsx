import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./tutorial.css";
import "./tutorial-enhanced.css";
import { AuthProvider } from "@/lib/context/auth-context";
import { MarketProvider } from '@/lib/context/market-context';
import { FinancialProvider } from '@/lib/context/financial-context';
import { AddFundsProvider } from '@/lib/context/add-funds-context';
import { ClientTutorialWrapper } from '@/components/tutorial/client-tutorial-wrapper';
import { AddFundsDialogWrapper } from '@/components/shared/add-funds-dialog-wrapper';
import { Toaster } from 'sonner';
import { Toaster as RadixToaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <FinancialProvider>
            <MarketProvider>
              <AddFundsProvider>
                <ClientTutorialWrapper mode={tutorialMode}>
                  {children}
                  <AddFundsDialogWrapper />
                  <Toaster />
                  <RadixToaster />
                </ClientTutorialWrapper>
              </AddFundsProvider>
            </MarketProvider>
          </FinancialProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
