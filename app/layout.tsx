import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/providers/providers";
import ToasterProvider from "@/components/ui/sooner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
      <head>
        {/* ✅ Google Tag Manager */}
        <Script
          id="gtm-head"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-P33WDTHR');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {/* ✅ Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P33WDTHR"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        <NextAuthProvider>
          <ToasterProvider />
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
