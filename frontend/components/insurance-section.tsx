"use client"

import { Shield, CheckCircle, Clock, Users, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"

const fetchInsuranceData = async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800))
  return [
    { name: "Blue Cross Blue Shield", accepted: true },
    { name: "Aetna", accepted: true },
    { name: "Cigna", accepted: true },
    { name: "UnitedHealthcare", accepted: true },
    { name: "Medicare", accepted: true },
    { name: "Medicaid", accepted: true },
    { name: "Anthem", accepted: true },
    { name: "Tricare", accepted: true },
    { name: "Workers' Compensation", accepted: true },
    { name: "WellCare", accepted: true },
  ]
}

export function InsuranceSection() {
  const [insuranceProviders, setInsuranceProviders] = useState([
    { name: "Blue Cross Blue Shield", accepted: true },
    { name: "Aetna", accepted: true },
    { name: "Cigna", accepted: true },
    { name: "UnitedHealthcare", accepted: true },
    { name: "Medicare", accepted: true },
    { name: "Medicaid", accepted: true },
    { name: "Anthem", accepted: true },
    { name: "Tricare", accepted: true },
    { name: "Workers' Compensation", accepted: true },
    { name: "WellCare", accepted: true },
  ])

  useEffect(() => {
    fetchInsuranceData().then(setInsuranceProviders)
  }, [])

  const keyFeatures = [
    {
      icon: Shield,
      title: "Insurance Verification",
      description: "We verify your insurance benefits before your first visit",
    },
    {
      icon: Clock,
      title: "Same-Day Appointments",
      description: "Often available for urgent physical therapy needs",
    },
    {
      icon: Users,
      title: "Direct Billing",
      description: "We handle all insurance paperwork and billing for you",
    },
    {
      icon: DollarSign,
      title: "Cash Pay Options",
      description: "Flexible payment plans available for uninsured patients",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Insurance & <span className="text-primary">Coverage</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            We accept most major insurance plans and work directly with your provider to ensure you get the care you
            need without the hassle. Don't have insurance? No problem—we offer affordable cash pay options too.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-4 gap-6 md:gap-8 mb-16">
          {keyFeatures.map((feature, index) => (
            <div
              key={index}
              className="service-card text-center animate-slide-in-bottom"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 modern-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{feature.title}</h3>
              <p className="text-muted-foreground text-pretty">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Insurance Providers Grid */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-border/50 mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">Accepted Insurance Plans</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {insuranceProviders.map((provider, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 animate-slide-in-left"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground font-medium text-sm">{provider.name}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
            <p className="text-center text-muted-foreground">
              <strong className="text-foreground">Don't see your insurance?</strong> Contact us at{" "}
              <a href="tel:737-368-2653" className="text-primary hover:underline font-semibold">
                (737) 368-2653
              </a>{" "}
              and we'll verify your coverage and benefits.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 border-2 border-primary/30">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-4">
              Affordable Cash Pay Options
            </h3>
            <p className="text-center text-muted-foreground mb-6 text-lg">
              Not insured or prefer to pay out-of-pocket? Peak Kinetics offers flexible, transparent pricing with no
              hidden fees. Our cash pay patients enjoy the same world-class physical therapy at competitive rates.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-xl">
                <p className="font-semibold text-foreground mb-2">Discounted Rates</p>
                <p className="text-sm text-muted-foreground">Special pricing for cash pay patients</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <p className="font-semibold text-foreground mb-2">Flexible Plans</p>
                <p className="text-sm text-muted-foreground">Payment plans available to fit your budget</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <p className="font-semibold text-foreground mb-2">No Insurance Hassle</p>
                <p className="text-sm text-muted-foreground">Skip the paperwork, get straight to healing</p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">Questions about cash pay pricing?</p>
              <a
                href="tel:737-368-2653"
                className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
              >
                Call us at (737) 368-2653
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
