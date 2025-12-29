"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, ArrowLeft, CheckCircle, Calendar } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useScheduling } from "@/components/scheduling-context"

export default function SportsRehabilitationPage() {
  const { open: openScheduling } = useScheduling()

  const features = [
    {
      title: "Injury Assessment",
      description:
        "This is the critical first step where we play detective. We'll conduct a comprehensive evaluation, including a detailed history of your injury, hands-on testing of your strength and mobility, and special tests to pinpoint the exact source of your pain.",
      why: "We don't just treat your symptoms; we find the root cause. A precise diagnosis of the injured tissue (muscle, tendon, ligament, or bone) is the foundation for your entire recovery plan. This ensures your treatment is targeted, efficient, and effective from day one.",
    },
    {
      title: "Movement Analysis",
      description:
        "After we know what is wrong, we investigate why it happened. We will watch you move, run, jump, cut, or throw. This analysis helps us identify any faulty movement patterns, muscle imbalances, or biomechanical flaws that may have contributed to your injury.",
      why: "Injuries often happen because of underlying inefficiencies in how we move. By identifying and correcting these patterns, we not only help your current injury heal but also prevent it from happening again. This is the key to breaking the cycle of recurring injuries.",
    },
    {
      title: "Performance Training",
      description:
        "Healing is just the first half. Performance Training is where we rebuild your body to be better than it was before. As your pain subsides, we'll introduce advanced, sport-specific exercises designed to restore your power, agility, speed, and endurance.",
      why: "This phase is what makes you an athlete, not just a patient. We customize your training to meet the unique demands of your sport, making you more robust and less susceptible to future injuries. This is how you turn a setback into a comeback.",
    },
    {
      title: "Return-to-Sport Protocol",
      description:
        "This is the final, essential bridge from the clinic to the field. It's a structured, progressive, and data-driven plan that safely re-introduces you to the stress of your sport. We use objective tests (like strength goals and hop testing) to measure your readiness, rather than just guessing.",
      why: "Going back too soon, or without a plan, is the number one reason for re-injury. This protocol builds both physical and mental confidence. It ensures that when you step back on the field, court, or track, you are 100% ready and can play without hesitation.",
    },
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
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
                  <Activity className="h-5 w-5" />
                  <span className="font-semibold">Sports Rehabilitation</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                  Get Back in the <span className="text-primary">Game</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed text-pretty">
                  Our goal isn't just to treat your injury—it's to understand the "why" behind it and rebuild you into a
                  stronger, more resilient athlete. We bridge the gap between initial rehabilitation and high-level
                  performance, giving you the confidence to return to your sport safely and effectively.
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
                  src="/therapist-manual-therapy-session.jpg"
                  alt="Sports rehabilitation session"
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
                Our Comprehensive <span className="text-primary">Approach</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Every step designed to get you back to peak performance
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
                  Ready to Start Your Recovery Journey?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Let's work together to get you back to the sport you love, stronger and more confident than ever.
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
