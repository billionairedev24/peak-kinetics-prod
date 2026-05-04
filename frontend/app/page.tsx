import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { AboutSection } from "@/components/about-section"
import { Footer } from "@/components/footer"

// Below-the-fold sections — defer their JS off the initial paint.
const VideoSection = dynamic(() => import("@/components/video-section").then((m) => m.VideoSection))
const InsuranceSection = dynamic(() =>
  import("@/components/insurance-section").then((m) => m.InsuranceSection),
)
const PatientCareSection = dynamic(() =>
  import("@/components/patient-care-section").then((m) => m.PatientCareSection),
)
const ReviewsSection = dynamic(() =>
  import("@/components/reviews-section").then((m) => m.ReviewsSection),
)
const ContactSection = dynamic(() =>
  import("@/components/contact-section").then((m) => m.ContactSection),
)
const WhatsAppChat = dynamic(() =>
  import("@/components/whatsapp-chat").then((m) => m.WhatsAppChat),
)

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
