import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/auth-context";
import { MarketProvider } from '@/lib/context/market-context';
import { FinancialProvider } from '@/lib/context/financial-context';
import { TutorialProvider } from '@/lib/context/tutorial-context';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StateMint",
  description: "Fractional ownership marketplace for rare coins",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <FinancialProvider>
            <MarketProvider>
              <TutorialProvider>
                {children}
                <Toaster />
              </TutorialProvider>
            </MarketProvider>
          </FinancialProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
