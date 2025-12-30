export default function MarketplaceLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-border h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse" />
            <div className="hidden lg:flex items-center space-x-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 w-20 bg-zinc-800 rounded animate-pulse" />
              ))}
            </div>
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
              {/* Title skeleton */}
              <div className="py-2 sm:py-4 mb-4 sm:mb-8">
                <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse mb-4" />
              </div>

              {/* Cards grid skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-card border border-border rounded-lg overflow-hidden"
                  >
                    {/* Image skeleton */}
                    <div className="aspect-[2/1] bg-zinc-800 animate-pulse" />
                    {/* Content skeleton */}
                    <div className="p-4 space-y-3">
                      <div className="h-5 w-3/4 bg-zinc-800 rounded animate-pulse" />
                      <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
                      <div className="h-2 w-full bg-zinc-800 rounded-full animate-pulse" />
                      <div className="flex justify-between">
                        <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

