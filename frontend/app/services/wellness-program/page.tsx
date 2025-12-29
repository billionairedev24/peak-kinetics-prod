"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, ArrowLeft, CheckCircle, Calendar } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useScheduling } from "@/components/scheduling-context"

export default function WellnessProgramPage() {
  const { open: openScheduling } = useScheduling()

  const features = [
    {
      title: "Post-Rehab Maintenance",
      description:
        "Once you've graduated from injury rehab, insurance often stops coverage, but your fitness journey isn't over. This program provides ongoing access to our facility and expertise to maintain the gains you've made.",
      why: "Stopping exercise abruptly after rehab often leads to regression. This maintenance phase ensures you don't lose your progress and solidifies your recovery, preventing old injuries from creeping back.",
    },
    {
      title: "Medically Oriented Gym Program",
      description:
        "A personalized fitness routine designed not by a generic trainer, but by a Doctor of Physical Therapy. We take into account your medical history, past injuries, and specific physical limitations to build a workout plan that is safe and effective.",
      why: "Generic gym workouts can often lead to injury if they don't account for your unique body mechanics. Our guidance gives you the peace of mind to push yourself safely, knowing your program is built around your medical needs.",
    },
    {
      title: "Mobility & Flexibility Sessions",
      description:
        "Dedicated one-on-one sessions focused entirely on joint health and muscle length. We utilize assisted stretching and advanced mobility drills to counteract the stiffness of modern life (like sitting at a desk or driving).",
      why: "Stiffness is often the precursor to pain. By proactively maintaining your flexibility, you reduce tension, improve your posture, and ensure your body moves fluidly and efficiently during your favorite sports or hobbies.",
    },
    {
      title: "Lifestyle & Ergonomic Coaching",
      description:
        "We look at the other 23 hours of your day. We provide coaching on sleep positioning, workstation setup, footwear choices, and activity pacing to ensure your lifestyle supports your physical goals.",
      why: "You can't out-exercise a bad lifestyle. Small adjustments to how you sit, sleep, and stand can have a massive cumulative effect on your health, preventing chronic strain and keeping you pain-free in the long run.",
    },
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(14,165,233,0.1),transparent_50%)]" />
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
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">Wellness Program</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                  Build a Body That <span className="text-primary">Lasts</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed text-pretty">
                  Healthcare shouldn't end just because your pain is gone. Our Wellness Program is designed for those
                  who have finished formal physical therapy but want to continue improving, or for those looking for a
                  medically guided approach to fitness. We bridge the gap between healthcare and fitness to help you
                  thrive.
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
                  src="/modern-physical-therapy-clinic-with-professional-e.jpg"
                  alt="Modern wellness program facility"
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
                Program <span className="text-primary">Features</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive wellness support beyond traditional rehabilitation
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Elevate Your Wellness?</h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join our wellness program and build a foundation for lifelong health and performance.
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
