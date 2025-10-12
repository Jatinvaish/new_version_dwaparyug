import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/providers/providers";
import ToasterProvider from "@/components/ui/sooner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";

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
    "India's most trusted NGO",
    "India's Best NGO",
    "Dwaparyug",
    "underprivileged communities",
    "food distribution drive",
    "emergency food relief",
    "women hygiene programs",
    "volunteer opportunities in Delhi",
    "NGO welfare society India",
    "transparent donation platform",
    "relief campaigns India",
    "social development NGO",
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
      <head>
        {/* ✅ Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1216856133825801');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1216856133825801&ev=PageView&noscript=1"
          />
        </noscript>
        {/* ✅ End Meta Pixel Code */}
      </head>

      <body className={inter.className}>
        <NextAuthProvider>
          <ToasterProvider />
          <GoogleTagManager gtmId="GTM-P33WDTHR" />
          {children}
          <Analytics />
          <SpeedInsights />

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
              gtag('config', 'G-D9CYQ2RPGP');
            `}
          </Script>
        </NextAuthProvider>
      </body>
    </html>
  );
}
