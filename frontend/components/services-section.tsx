"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Heart, Zap, Target, Users, Clock, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"

// BodyMap pulls Framer Motion + 17 lucide icons; ship it on demand only.
const BodyMap = dynamic(() => import("./BodyMap").then((m) => m.BodyMap), {
    loading: () => (
        <div className="aspect-[1/2] max-w-[360px] mx-auto rounded-3xl bg-muted/40 animate-pulse" />
    ),
})

export function ServicesSection() {
  const services = [
    {
      icon: Activity,
      title: "Sports Rehabilitation",
      description: "Get back in the game with specialized sports injury treatment and performance optimization.",
      image: "/therapist-manual-therapy-session.jpg",
      imagePosition: "center 30%", // Position to show faces
      href: "/services/sports-rehabilitation",
    },
    {
      icon: Heart,
      title: "Orthopedic Therapy",
      description: "Comprehensive care for joint, muscle, and bone conditions to restore optimal function.",
      image: "/orthopedic-therapy.jpg",
      imagePosition: "center 20%", // Position to show faces
      href: "/services/orthopedic-therapy",
    },
    {
      icon: Zap,
      title: "Pain Management",
      description: "Advanced techniques to reduce chronic pain and improve your quality of life.",
      image: "/pain-management.jpeg",
      href: "/services/pain-management",
    },
    {
      icon: Target,
      title: "Movement Screening",
      description: "Identify hidden limitations and unlock your full physical potential.",
      image: "/professional-physical-therapist-consultation.jpg",
      href: "/services/movement-screening",
    },
    {
      icon: Users,
      title: "Geriatric Care",
      description: "Stay independent, active, and confident at any age.",
      image: "/geriatric.jpg",
      href: "/services/geriatric-care",
    },
    {
      icon: Clock,
      title: "Wellness Program",
      description: "Go beyond rehabilitation and build a body that lasts a lifetime.",
      image: "/modern-physical-therapy-clinic-with-professional-e.jpg",
      href: "/services/wellness-program",
    },
  ]

  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Comprehensive Care for <span className="text-primary">Every Need</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            From injury recovery to performance enhancement, our expert team provides personalized treatment plans
            tailored to your unique goals and lifestyle.
          </p>
        </div>

        <BodyMap />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          {services.map((service) => (
            <Card
              key={service.title}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg flex flex-col h-full overflow-hidden"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  style={{ objectPosition: service.imagePosition || "center" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <service.icon className="h-8 w-8 text-white" />
                </div>
              </div>

              <CardHeader className="flex-grow">
                <CardTitle className="text-2xl mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">{service.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <Link href={service.href}>
                  <Button className="w-full group/btn bg-primary hover:bg-primary/90 text-white">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
