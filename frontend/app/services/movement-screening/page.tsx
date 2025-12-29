"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Target, ArrowLeft, CheckCircle, Calendar } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useScheduling } from "@/components/scheduling-context"

export default function MovementScreeningPage() {
  const { open: openScheduling } = useScheduling()

  const features = [
    {
      title: "Functional Movement Evaluation",
      description:
        "We take you through a series of fundamental movement patterns—such as squatting, lunging, reaching, and balancing. This standardized testing allows us to observe how your body coordinates motion from head to toe.",
      why: 'The body is a master of compensation; it will find a way to move even if it has to cheat to do it. This evaluation exposes those "cheats" and reveals the weak links in your kinetic chain that could lead to breakdowns down the road.',
    },
    {
      title: "Mobility vs. Stability Testing",
      description:
        "We break down your movement to distinguish between mobility issues (stiff joints or tight muscles) and stability issues (lack of motor control or weakness).",
      why: "Treating a stability problem with stretching can actually make it worse, and strengthening a stiff joint won't help it move. Distinguishing between the two ensures we solve the right problem, saving you time and frustration.",
    },
    {
      title: "Postural & Gait Analysis",
      description:
        "We analyze your static alignment (how you stand) and your dynamic alignment (how you walk or run). We look for asymmetries, such as collapsing arches, pelvic tilts, or forward head posture.",
      why: '"Micro-traumas" occur when your alignment is slightly off during repetitive movements like walking or running. Correcting these subtle deviations reduces wear and tear on your joints, keeping you active longer.',
    },
    {
      title: "Corrective Strategy",
      description:
        'Based on your screen, we build a personalized "pre-hab" program. This includes specific corrective exercises, drills, and stretches designed to fix your unique imbalances before they become painful injuries.',
      why: "This is the ultimate preventative medicine. By addressing inefficiencies now, you improve your movement efficiency, decrease your risk of injury, and build a body that is resilient enough to handle whatever activities you love.",
    },
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(34,197,94,0.1),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <Link href="/#services">
              <Button variant="ghost" className="mb-8 group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Services
              </Button>
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                  <Target className="h-5 w-5" />
                  <span className="font-semibold">Movement Screening</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                  Unlock Your Full <span className="text-primary">Potential</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed text-pretty">
                  You don't need to be injured to benefit from expert analysis. Our Movement Screening is a proactive
                  "check-up" for your musculoskeletal system. We identify subtle imbalances, restrictions, and
                  weaknesses that—while not painful yet—are robbing you of performance or setting the stage for future
                  injury.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="group" onClick={openScheduling}>
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Screening
                  </Button>
                  <a href="tel:737-368-2653">
                    <Button size="lg" variant="outline">
                      Call: (737) 368-2653
                    </Button>
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-3xl" />
                <Image
                  src="/professional-physical-therapist-consultation.jpg"
                  alt="Movement screening session"
                  width={600}
                  height={700}
                  className="relative rounded-3xl shadow-2xl object-cover w-full h-[500px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Our Screening <span className="text-primary">Process</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive assessment to identify and prevent future issues
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">{feature.title}</h3>
                      </div>
                    </div>

                    <div className="space-y-4 ml-16">
                      <div>
                        <h4 className="font-semibold text-primary mb-2">What It Is:</h4>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-primary mb-2">Why It Matters:</h4>
                        <p className="text-muted-foreground leading-relaxed">{feature.why}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-background">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Invest in Your Future Performance
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Prevent injuries before they happen and optimize your movement patterns for peak performance.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" className="group" onClick={openScheduling}>
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Your Screening
                  </Button>
                  <Link href="/#services">
                    <Button size="lg" variant="outline">
                      View All Services
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
