"use client";
import CustomHomeSectionDonation from "@/components/shared/homePage/custome-donation"
import HeroSection from "@/components/shared/homePage/hero-section"
import ImpactSection from "@/components/shared/homePage/impact-section"
import { FestivalEventsSection } from "@/components/shared/festival-events-section"
import TestimonialsSection from "@/components/shared/testimonial"
import CauseSection from "@/components/shared/cause-secction"
import Faqsection from "@/components/shared/homePage/faq-section";


export default function HomePage() {

  return (
    <section className="min-h-screen bg-white overflow-x-hidden">
      <HeroSection />
      <CauseSection />
      <ImpactSection />
      <CustomHomeSectionDonation />
      <FestivalEventsSection />
      <TestimonialsSection />
      <Faqsection />
    </section>
  )
}