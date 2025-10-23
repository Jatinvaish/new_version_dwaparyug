"use client";
import CustomHomeSectionDonation from "@/components/shared/homePage/custome-donation"
import HeroSection from "@/components/shared/homePage/hero-section"
import TestimonialsSection from "@/components/shared/testimonial"
import CauseSection from "@/components/shared/cause-secction"
import Faqsection from "@/components/shared/homePage/faq-section";
import ContactPage from "./contact-us/page";


export default function HomePage() {

  return (
    <section className="min-h-screen bg-white overflow-x-hidden">
      <HeroSection />
      <CauseSection />
      <TestimonialsSection />
      <Faqsection />
      <ContactPage isHomePage ={true}/>
    </section>
  )
}