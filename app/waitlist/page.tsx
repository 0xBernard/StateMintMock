import Image from 'next/image';
import { WaitlistForm } from '@/components/waitlist/waitlist-form';

export default function WaitlistPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,180,0,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,140,0,0.08),transparent_50%)]" />
      </div>

      {/* Floating elements for visual interest */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-amber-400/10 rounded-full blur-xl animate-pulse hidden md:block" />
      <div className="absolute bottom-32 right-16 w-40 h-40 bg-orange-400/10 rounded-full blur-xl animate-pulse hidden md:block" />
      <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-amber-300/10 rounded-full blur-lg animate-pulse hidden lg:block" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        <div className="min-h-screen flex flex-col justify-center">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left side - Content */}
              <div className="flex flex-col justify-center space-y-8 text-center lg:text-left order-1 lg:order-1">
                
                {/* Logo and brand */}
                <div className="flex flex-col items-center lg:items-start gap-6">
                  <div className="flex items-center gap-4">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
                      State<span className="text-amber-400">Mint</span>
                    </h1>
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-lg" />
                      <Image
                        src="/images/33759.png"
                        alt="StateMint Logo"
                        width={80}
                        height={80}
                        className="relative object-contain"
                      />
                    </div>
                  </div>
                  <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto lg:mx-0 rounded-full" />
                </div>

                {/* Main heading */}
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                      Join the Future
                    </span>
                    <br />
                    <span className="text-white">of Coin Trading</span>
                  </h2>
                </div>

                {/* Description */}
                <div className="space-y-6">
                  <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed">
                    Get exclusive early access to the most advanced platform for rare coin collection and trading.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-2 h-2 bg-amber-400 rounded-full" />
                      <span>AI-powered valuations</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-2 h-2 bg-amber-400 rounded-full" />
                      <span>Secure marketplace</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-2 h-2 bg-amber-400 rounded-full" />
                      <span>Expert authentication</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-2 h-2 bg-amber-400 rounded-full" />
                      <span>Portfolio tracking</span>
                    </div>
                  </div>
                </div>

                {/* Social proof - commented out until we have real stats */}
                {/* <div className="pt-8 border-t border-gray-700">
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                    <div className="text-center sm:text-left">
                      <div className="text-2xl font-bold text-white">2,500+</div>
                      <div className="text-sm text-gray-400">Collectors waiting</div>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-gray-600" />
                    <div className="text-center sm:text-left">
                      <div className="text-2xl font-bold text-white">$50M+</div>
                      <div className="text-sm text-gray-400">In collections</div>
                    </div>
                  </div>
                </div> */}
              </div>

              {/* Right side - Form */}
              <div className="flex w-full items-center justify-center order-2 lg:order-2">
                <div className="w-full max-w-md">
                  {/* Decorative backdrop for form */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-2xl blur-xl transform rotate-6" />
                    <div className="relative">
                      <WaitlistForm />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
    </div>
  );
} 