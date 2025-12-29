import { Heart, Clock, MapPin, Phone, Calendar, FileText, Users, Award } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PatientCareSection() {
  const careFeatures = [
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Early morning, evening, and weekend appointments available to fit your busy lifestyle.",
    },
    {
      icon: MapPin,
      title: "Convenient Locations",
      description: "Multiple clinic locations with easy parking and public transportation access.",
    },
    {
      icon: FileText,
      title: "Comprehensive Evaluations",
      description: "Thorough initial assessments with personalized treatment plans tailored to your goals.",
    },
    {
      icon: Users,
      title: "Family-Centered Care",
      description: "We involve your family in the recovery process and provide education for home care.",
    },
  ]

  const patientRights = [
    "Receive respectful, compassionate care regardless of background",
    "Understand your treatment plan and participate in care decisions",
    "Access your medical records and receive copies when requested",
    "Receive care in a safe, clean, and comfortable environment",
    "Voice concerns or complaints without fear of retaliation",
    "Receive information about costs and payment options upfront",
  ]

  const specialtyServices = [
    {
      title: "Post-Surgical Rehabilitation",
      description: "Specialized care following orthopedic, cardiac, or neurological surgeries",
    },
    {
      title: "Chronic Pain Management",
      description: "Evidence-based approaches to reduce pain and improve quality of life",
    },
    {
      title: "Sports Injury Recovery",
      description: "Get back to your sport safely with our performance-focused treatments",
    },
    {
      title: "Geriatric Physical Therapy",
      description: "Age-appropriate care focusing on mobility, balance, and fall prevention",
    },
    {
      title: "Pediatric Services",
      description: "Specialized care for children with developmental or injury-related needs",
    },
    {
      title: "Women's Health PT",
      description: "Specialized care for pregnancy, postpartum, and pelvic health concerns",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Patient-Centered Care */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Patient-Centered <span className="text-primary">Healthcare</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Your health, comfort, and recovery are our top priorities. We provide comprehensive care designed around
            your unique needs and goals.
          </p>
        </div>

        {/* Facility Showcase with Background Image */}
        <div className="relative mb-20 rounded-3xl overflow-hidden">
          <div
            className="h-96 bg-cover bg-center relative"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url('/modern-physical-therapy-clinic-with-professional-e.jpg')`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-3xl md:text-4xl font-bold mb-4">State-of-the-Art Facilities</h3>
                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                  Modern equipment and comfortable treatment spaces designed for your optimal recovery experience
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Care Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {careFeatures.map((feature, index) => (
            <div
              key={index}
              className="service-card text-center animate-slide-in-bottom"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 modern-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm text-pretty">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Specialty Services */}
        <div className="mb-20">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Specialized Treatment Areas
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialtyServices.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 animate-slide-in-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-2">{service.title}</h4>
                    <p className="text-muted-foreground text-sm text-pretty">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Rights & Responsibilities */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-border/50 mb-20">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">Your Rights as Our Patient</h3>
              </div>
              <div className="space-y-4">
                {patientRights.map((right, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground text-pretty">{right}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">Quality Assurance</h3>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <h4 className="font-bold text-foreground mb-2">Licensed Professionals</h4>
                  <p className="text-muted-foreground text-sm">
                    All our therapists are state-licensed with ongoing continuing education requirements.
                  </p>
                </div>
                <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                  <h4 className="font-bold text-foreground mb-2">Evidence-Based Care</h4>
                  <p className="text-muted-foreground text-sm">
                    We use the latest research and proven techniques for optimal patient outcomes.
                  </p>
                </div>
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <h4 className="font-bold text-foreground mb-2">Outcome Tracking</h4>
                  <p className="text-muted-foreground text-sm">
                    We monitor your progress with standardized assessments and adjust treatment accordingly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl p-8 md:p-12 border border-primary/20">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Ready to Start Your Recovery Journey?</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Contact us today to schedule your comprehensive evaluation and take the first step toward better health and
            mobility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="cta-button">
              <Calendar className="h-5 w-5 mr-2" />
              Schedule Evaluation
            </Button>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call 737-368-2653
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
