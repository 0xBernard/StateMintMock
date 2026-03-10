import { AddFundsProvider } from '@/lib/context/add-funds-context';
import { AuthProvider } from '@/lib/context/auth-context';
import { FinancialProvider } from '@/lib/context/financial-context';
import { MarketProvider } from '@/lib/context/market-context';
import { ClientTutorialWrapper } from '@/components/tutorial';
import { TutorialAutoStart } from '@/components/tutorial/tutorial-auto-start';
import { Toaster } from 'sonner';
import { Toaster as RadixToaster } from '@/components/ui/toaster';

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tutorialMode = process.env.NODE_ENV === 'development' ? 'full' : 'demo';

  return (
    <AuthProvider>
      <FinancialProvider>
        <MarketProvider>
          <AddFundsProvider>
            <ClientTutorialWrapper mode={tutorialMode}>
              <TutorialAutoStart />
              {children}
              <Toaster />
              <RadixToaster />
            </ClientTutorialWrapper>
          </AddFundsProvider>
        </MarketProvider>
      </FinancialProvider>
    </AuthProvider>
  );
}
