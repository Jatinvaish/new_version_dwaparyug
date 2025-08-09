import type React from "react"
import type { Metadata } from "next"
import "../globals.css"
import HeaderSection from "@/components/shared/header-section"
import { ContactSection } from "@/components/shared/contact-section"
import { Footer } from "@/components/shared/footer"


export const metadata: Metadata = {
  title: "Dwaparyug NGO - Welfare Society",
  description: "NGO Welfare Society dedicated to social causes and community development",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      <HeaderSection />
      {children}
      <Footer />
    </section>
  )
}
