import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Users, Clock, MapPin } from "lucide-react"

export function AboutSection() {
  const stats = [
    { icon: Users, value: "1000+", label: "Patients Treated" },
    { icon: Clock, value: "15+", label: "Years Experience" },
    { icon: Award, value: "98%", label: "Success Rate" },
    { icon: MapPin, value: "3", label: "Locations" },
  ]

  const certifications = ["Doctor of Physical Therapy (DPT)", "Manual Therapy Trained and Expertise", "APTA Member"]

  return (
    <section id="about" className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Meet Your <span className="text-primary">Recovery Partner</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-6 leading-relaxed text-pretty">
              At PeakKinetics, we believe that movement is medicine. Our team of expert physical therapists combines
              cutting-edge techniques with personalized care to help you achieve your goals faster and more effectively.
            </p>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed text-pretty">
              Whether you're recovering from an injury, managing chronic pain, or looking to enhance your athletic
              performance, we're here to guide you every step of the way with evidence-based treatments and
              compassionate care.
            </p>

            {/* Certifications */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Certifications & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <Badge key={cert} variant="secondary" className="text-sm py-1 px-3">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <Card className="overflow-hidden border-0 shadow-2xl">
              <CardContent className="p-0">
                <img
                  src="/professional-physical-therapist-consultation.jpg"
                  alt="Physical therapist consulting with patient in modern clinic"
                  className="w-full h-[600px] object-cover"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
