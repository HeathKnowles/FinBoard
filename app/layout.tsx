import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Script from "next/script";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinBoard",
  description: "Track your Financials",
  keywords: ["finance", "dashboard", "widgets", "real-time", "stocks"],
  authors: [{ name: "FinBoard Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Performance monitoring script */}
        <Script
          id="performance-monitor"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Mark app initialization
              if (window.performance) {
                window.performance.mark('app-init');
              }
            `
          }}
        />
        
        <Providers>
          <div suppressHydrationWarning>
            <Navbar />
          </div>
          <main>
            {children}
          </main>
        </Providers>

        {/* Initialize performance monitoring */}
        <Script
          src="/js/performance.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
