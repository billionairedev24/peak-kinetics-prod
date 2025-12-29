import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { AboutSection } from "@/components/about-section"
import { InsuranceSection } from "@/components/insurance-section"
import { PatientCareSection } from "@/components/patient-care-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { WhatsAppChat } from "@/components/whatsapp-chat"
import { ReviewsSection } from "@/components/reviews-section"
import { VideoSection } from "@/components/video-section"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <VideoSection />
        <AboutSection />
        <InsuranceSection />
        <PatientCareSection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppChat />
    </div>
  )
}
