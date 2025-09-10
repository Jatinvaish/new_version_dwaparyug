import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/providers/providers";
import ToasterProvider from "@/components/ui/sooner";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script"; // ✅ import Next.js Script

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dwaparyug.org"),
  title: {
    default: "Dwaparyug NGO - Foundation",
    template: "%s | Dwaparyug Foundation",
  },
  description:
    "NGO Welfare Society dedicated to social causes and community development",
  keywords: [
    "India's most trusted humanitarian nonprofit",
    "underprivileged communities",
    "food distribution drive",
    "emergency food relief",
    "women hygiene programs",
    "volunteer opportunities in Delhi",
    "NGO welfare society India",
    "transparent donation platform",
    "relief campaigns India",
    "social development NGO"
  ],
  generator: "AJPR WORLD",
  alternates: {
    canonical: "https://www.dwaparyug.org/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <ToasterProvider />
          {children}
          <Analytics />

          {/* ✅ Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-D9CYQ2RPGP"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-D9CYQ2RPGP', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </NextAuthProvider>
      </body>
    </html>
  );
}
