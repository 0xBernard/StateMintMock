export default function CoinDetailLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-border h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse" />
            <div className="h-8 w-8 bg-zinc-800 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar skeleton - hidden on mobile */}
        <aside className="w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] p-6 border-r border-border hidden lg:block">
          <div className="space-y-6">
            {[...Array(2)].map((_, section) => (
              <div key={section} className="space-y-3">
                <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 w-full bg-zinc-800 rounded animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 lg:pl-64">
          <div className="pt-16">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
              {/* Back button skeleton */}
              <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse mb-6" />

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left column - Coin info */}
                <div className="space-y-6">
                  {/* Coin image skeleton */}
                  <div className="aspect-square bg-zinc-800 rounded-lg animate-pulse" />
                  
                  {/* Coin title skeleton */}
                  <div className="space-y-3">
                    <div className="h-8 w-3/4 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-zinc-800 rounded animate-pulse" />
                  </div>

                  {/* Tabs skeleton */}
                  <div className="flex gap-2 border-b border-border pb-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
                    ))}
                  </div>

                  {/* Tab content skeleton */}
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column - Buy widget */}
                <div className="lg:sticky lg:top-24 h-fit">
                  <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                    <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
                    
                    {/* Price info skeleton */}
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                      <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse" />
                    </div>

                    {/* Input fields skeleton */}
                    <div className="space-y-4">
                      <div className="h-12 w-full bg-zinc-800 rounded animate-pulse" />
                      <div className="h-12 w-full bg-zinc-800 rounded animate-pulse" />
                    </div>

                    {/* Button skeleton */}
                    <div className="h-12 w-full bg-amber-800/50 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

