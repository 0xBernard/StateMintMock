import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./tutorial.css";
import "./tutorial-enhanced.css";
import { AuthProvider } from "@/lib/context/auth-context";
import { MarketProvider } from '@/lib/context/market-context';
import { FinancialProvider } from '@/lib/context/financial-context';
import { ClientTutorialWrapper } from '@/components/tutorial/client-tutorial-wrapper';
import { Toaster } from 'sonner';

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
              <ClientTutorialWrapper mode={tutorialMode}>
                {children}
                <Toaster />
              </ClientTutorialWrapper>
            </MarketProvider>
          </FinancialProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
