"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ArrowLeft, CheckCircle, Calendar } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useScheduling } from "@/components/scheduling-context"

export default function OrthopedicTherapyPage() {
  const { open: openScheduling } = useScheduling()

  const features = [
    {
      title: "Joint Mobilization",
      description:
        'This is a skilled, hands-on technique where your therapist uses gentle, precise movements to glide and stretch your joints. Unlike a high-velocity "crack," this is a controlled and comfortable method to "un-stick" a stiff or painful joint.',
      why: "Stiff joints are often painful and are a primary cause of limited movement. By safely restoring your joint's natural motion, we can immediately decrease pain, reduce muscle guarding, and improve your flexibility. This makes it easier and more comfortable to bend, reach, walk, and twist.",
    },
    {
      title: "Strength Training",
      description:
        "This is not your typical gym workout. This is a highly specific, customized exercise program designed to strengthen the exact muscles that support your injured area or weak joints. We focus on correcting muscular imbalances and improving your body's stability.",
      why: "Strong muscles are your body's natural brace and shock absorber. They protect your joints, reduce the strain on painful tissues (like tendons or cartilage), and provide long-term stability. This is the most effective way to create lasting pain relief and prevent the injury from returning.",
    },
    {
      title: "Pain Management",
      description:
        "Our first priority is to break the pain cycle. We use a variety of strategies—including gentle hands-on techniques, education on activity modification, and specific, safe exercises—to calm down irritated nerves and tissues and provide immediate relief.",
      why: "You can't heal effectively if you're in constant pain. By managing your symptoms, we create a \"window of opportunity\" for your body to heal. This also allows you to comfortably participate in the strength and mobility exercises needed to fix the underlying problem for good.",
    },
    {
      title: "Surgical Recovery",
      description:
        "Rehabilitation after an operation (like a joint replacement, rotator cuff repair, or ACL reconstruction) is just as important as the surgery itself. We work closely with your surgeon to create a structured, step-by-step plan to guide your recovery.",
      why: "The surgery fixes the structure; the therapy restores your function. We are experts at helping you manage post-operative swelling and pain, safely regain your range of motion, and progressively rebuild your strength. This expert guidance ensures you protect the surgical repair, maximize the success of your procedure, and return to your activities safely and confidently.",
    },
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(239,68,68,0.1),transparent_50%)]" />
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
                  <Heart className="h-5 w-5" />
                  <span className="font-semibold">Orthopedic Therapy</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                  Comprehensive <span className="text-primary">Orthopedic Care</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed text-pretty">
                  Whether you're dealing with a new injury, chronic aches and pains, or recovery from surgery, our
                  orthopedic therapy is designed to get to the root of your problem. We use a combination of hands-on
                  care, targeted exercise, and patient education to reduce your pain, improve your mobility, and get you
                  back to living your life.
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
                  src="/orthopedic-therapy.jpg"
                  alt="Orthopedic therapy session"
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
                Our Treatment <span className="text-primary">Methods</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Evidence-based techniques to restore function and eliminate pain
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Restore Your Mobility?</h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Let's work together to eliminate your pain and get you back to the activities you love.
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
