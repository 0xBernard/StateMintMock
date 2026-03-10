import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./tutorial.css";
import "./tutorial-enhanced.css";

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
  return (
    <html lang="en" className="dark">
      <head>
        {/* Site icon */}
        <link rel="icon" href="/images/33759.png" sizes="any" type="image/png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
