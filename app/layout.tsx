import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/providers/providers";
import ToasterProvider from "@/components/ui/sooner";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dwaparyug.org"), // 👈 your domain here
  title: {
    default: "Dwaparyug NGO - Foundation",
    template: "%s | Dwaparyug Foundation",
  },
  description:
    "NGO Welfare Society dedicated to social causes and community development",
  generator: "AJPR WORLD",
  alternates: {
    canonical: "/", // 👈 this makes https://www.dwaparyug.org the default canonical
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
        </NextAuthProvider>
      </body>
    </html>
  );
}
