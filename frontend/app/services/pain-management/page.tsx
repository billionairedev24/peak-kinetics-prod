"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, ArrowLeft, CheckCircle, Calendar } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useScheduling } from "@/components/scheduling-context"

export default function PainManagementPage() {
  const { open: openScheduling } = useScheduling()

  const features = [
    {
      title: "Manual Therapy",
      description:
        "This involves skilled, hands-on techniques performed by your therapist, such as joint manipulation, soft tissue mobilization, myofascial release, and gentle joint traction. It is designed to relax tense muscles, improve circulation, and desensitize painful areas.",
      why: 'When you are in pain, your muscles often tighten up as a protective mechanism, which can actually make the pain worse. Manual therapy helps break this "pain-spasm" cycle, providing immediate relief and making it easier for you to move without guarding or hesitation.',
    },
    {
      title: "Therapeutic Exercise",
      description:
        '"Motion is lotion." We prescribe specific, low-impact movements and graded exercises that are safe for your current pain levels. We start slowly and gradually build up your tolerance, focusing on flexibility, stability, and gentle strengthening.',
      why: "Chronic pain often leads to fear of movement, which causes weakness and stiffness. Controlled exercise flushes fresh oxygen and nutrients to injured tissues and stimulates the release of endorphins—your body's natural painkillers. It builds the physical resilience needed to handle daily activities without flaring up.",
    },
    {
      title: "Education & Prevention",
      description:
        'We believe that understanding your pain is the first step to conquering it. We teach you about "pain science"—how your nerves process signals—and provide practical advice on posture, ergonomics, and pacing your daily activities to avoid doing too much, too soon.',
      why: "Pain does not always equal harm. By understanding your triggers and learning how to move smartly, you regain a sense of control. This empowers you to make lifestyle changes that prevent flare-ups and reduces the anxiety often associated with chronic conditions.",
    },
    {
      title: "Modalities",
      description:
        "We utilize evidence-based technologies as helpful adjuncts to your treatment. This may include electrical stimulation (TENS/NMES) to block pain signals, ultrasound for deep heating, or cryotherapy/heat therapy to manage inflammation and stiffness.",
      why: 'These tools provide a "window of relief." While they don\'t fix the root cause on their own, they are excellent for dampening acute pain signals and reducing inflammation. This makes the active parts of your therapy—like stretching and strengthening—more comfortable and effective.',
    },
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(168,85,247,0.1),transparent_50%)]" />
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
                  <Zap className="h-5 w-5" />
                  <span className="font-semibold">Pain Management</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                  Advanced <span className="text-primary">Pain Relief</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed text-pretty">
                  Living with pain can feel overwhelming, but it doesn't have to dictate your life. Our approach goes
                  beyond just masking symptoms. We focus on calming your nervous system, addressing the biological and
                  mechanical sources of your discomfort, and giving you the tools to manage your condition independently
                  so you can get back to doing what you love.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="group" onClick={openScheduling}>
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Evaluation
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
                  src="/pain-management.jpeg"
                  alt="Pain management therapy session"
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
                Our <span className="text-primary">Treatment Approach</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive strategies to manage and eliminate chronic pain
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Take Control of Your Pain</h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Don't let chronic pain hold you back. Let's create a personalized plan to help you live pain-free.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" className="group" onClick={openScheduling}>
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Your Evaluation
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
