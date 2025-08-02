import dynamic from 'next/dynamic';
import { ComponentType, Suspense, useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Loading components for different contexts
export function ComponentSkeleton({ height = 'h-48' }: { height?: string }) {
  return (
    <div className={`${height} bg-muted/50 rounded-lg animate-pulse`}>
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

export function TutorialSkeleton() {
  return (
    <div className="fixed inset-0 z-[var(--z-tutorial-backdrop)] bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-center h-full">
        <div className="bg-card rounded-lg p-6 shadow-xl">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading tutorial...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DialogSkeleton() {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-10 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// HOC for adding suspense boundaries
export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function SuspenseWrapped(props: P) {
    return (
      <Suspense fallback={fallback || <ComponentSkeleton />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Lazy loaded components with proper fallbacks
export const LazyTutorialLayer = dynamic(
  () => import('@/lib/tutorial/tutorial-layer').then(mod => ({ default: mod.TutorialLayer })),
  {
    ssr: false,
    loading: () => <TutorialSkeleton />
  }
);

export const LazyAddFundsDialog = dynamic(
  () => import('@/components/shared/add-funds-dialog').then(mod => ({ default: mod.AddFundsDialog })),
  {
    ssr: false,
    loading: () => <DialogSkeleton />
  }
);

export const LazyLoginDialog = dynamic(
  () => import('@/components/auth/login-dialog').then(mod => ({ default: mod.LoginDialog })),
  {
    ssr: false,
    loading: () => <DialogSkeleton />
  }
);

export const LazyCoinDetail = dynamic(
  () => import('@/components/shared/coin/coin-detail').then(mod => ({ default: mod.CoinDetail })),
  {
    loading: () => <ComponentSkeleton height="h-96" />
  }
);

export const LazyPortfolioPage = dynamic(
  () => import('@/app/portfolio/page'),
  {
    loading: () => (
      <div className="container mx-auto p-6 space-y-6">
        <ComponentSkeleton height="h-32" />
        <ComponentSkeleton height="h-64" />
        <ComponentSkeleton height="h-48" />
      </div>
    )
  }
);

export const LazyMarketplacePage = dynamic(
  () => import('@/app/marketplace/page'),
  {
    loading: () => (
      <div className="container mx-auto p-6">
        <ComponentSkeleton height="h-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ComponentSkeleton key={i} height="h-80" />
          ))}
        </div>
      </div>
    )
  }
);

// Route-based code splitting
export const LazyRoutes = {
  Portfolio: LazyPortfolioPage,
  Marketplace: LazyMarketplacePage,
  CoinDetail: LazyCoinDetail,
};

// Utility function for dynamic imports with retry logic
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode,
  retries: number = 3
) {
  return dynamic(
    async () => {
      let lastError: Error | null = null;
      
      for (let i = 0; i < retries; i++) {
        try {
          return await importFn();
        } catch (error) {
          lastError = error as Error;
          // Wait before retrying (exponential backoff)
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          }
        }
      }
      
      throw lastError;
    },
    {
      loading: () => fallback || <ComponentSkeleton />,
      ssr: false
    }
  );
}

// Hook for lazy loading data
export function useLazyData<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}