import { Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900/50 border-amber-600/30">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-amber-500/10 p-4 rounded-full w-fit">
            <div className="relative">
              <Monitor className="h-8 w-8 text-amber-500" />
              <Smartphone className="h-4 w-4 text-amber-400 absolute -bottom-1 -right-1" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-amber-400">
              Desktop Experience Required
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              StateMint Demo
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-3">
            <p className="text-muted-foreground">
              This demo is optimized for desktop viewing to showcase the full trading interface and portfolio management features.
            </p>
            <p className="text-sm text-amber-400/80">
              Please visit us on a desktop or laptop computer for the complete StateMint experience.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              className="w-full bg-amber-600 hover:bg-amber-500 text-black font-semibold"
              onClick={() => window.location.href = 'mailto:?subject=StateMint Demo&body=Check out the StateMint collectibles trading demo at ' + window.location.origin}
            >
              Email Myself This Link
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-amber-600/30 text-amber-400 hover:bg-amber-950/50"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'StateMint Demo',
                    text: 'Check out this collectibles trading demo',
                    url: window.location.origin,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.origin);
                  alert('Link copied to clipboard!');
                }
              }}
            >
              Share Demo Link
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              StateMint - Fractional Collectible Marketplace
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 