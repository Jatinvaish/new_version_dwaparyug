import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/providers/providers";
import ToasterProvider from "@/components/ui/sooner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dwaparyug NGO - Welfare Society",
  description: "NGO Welfare Society dedicated to social causes and community development",
  generator: "v0.dev",
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
        </NextAuthProvider>
      </body>
    </html>
  );
}
