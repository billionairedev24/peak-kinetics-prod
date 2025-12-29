"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, ArrowLeft, CheckCircle, Calendar } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useScheduling } from "@/components/scheduling-context"

export default function GeriatricCarePage() {
  const { open: openScheduling } = useScheduling()

  const features = [
    {
      title: "Fall Prevention & Balance Training",
      description:
        "We assess your risk of falling and create a safe, progressive environment to challenge your stability. We use specific drills to improve your reaction time, foot placement, and steadiness on uneven surfaces.",
      why: "Falls are the leading cause of injury in older adults, but they are preventable. Improving your balance builds confidence, allowing you to walk, garden, or play with grandchildren without the constant fear of falling.",
    },
    {
      title: "Functional Strengthening",
      description:
        "We don't just focus on gym muscles; we focus on life muscles. Our exercises mimic daily activities—like rising from a chair, carrying groceries, or reaching overhead—to ensure you have the strength to handle your daily routine.",
      why: "Muscle mass naturally decreases with age (sarcopenia), making everyday tasks harder. By reversing this loss through targeted strengthening, we help you maintain your independence and stay in your own home comfortably for longer.",
    },
    {
      title: "Osteoporosis & Bone Health",
      description:
        "A specialized program utilizing weight-bearing and resistance exercises designed to stimulate bone growth and improve posture. We also teach you safe movement patterns to protect your spine and hips.",
      why: "Bones need stress (the good kind) to stay strong. This program helps slow down bone density loss, significantly reducing the risk of fractures and keeping your skeletal system robust.",
    },
    {
      title: "Arthritis Management",
      description:
        'We teach you how to manage stiff and achy joints through gentle movement, "joint protection" strategies, and energy conservation techniques.',
      why: '"Motion is lotion." While we can\'t cure arthritis, we can significantly reduce the pain it causes. Regular, correct movement keeps joints lubricated and mobile, reducing the need for pain medication and invasive surgeries.',
    },
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_20%,rgba(251,146,60,0.1),transparent_50%)]" />
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
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">Geriatric Care</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                  Stay Independent at <span className="text-primary">Any Age</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed text-pretty">
                  Aging doesn't mean giving up the activities you love. Our geriatric care program is dedicated to
                  helping you maintain your independence and vitality. We focus on the unique needs of the aging body,
                  helping you build strength, improve balance, and manage age-related changes so you can continue living
                  life on your own terms.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="group" onClick={openScheduling}>
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Consultation
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
                  src="/geriatric.jpg"
                  alt="Happy senior patient"
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
                Our <span className="text-primary">Care Program</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Specialized care for the unique needs of older adults
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
                  Maintain Your Independence and Vitality
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Let's work together to keep you active, confident, and independent for years to come.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" className="group" onClick={openScheduling}>
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Your Consultation
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
