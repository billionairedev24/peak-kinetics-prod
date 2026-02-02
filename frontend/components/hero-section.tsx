"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, CheckCircle, Zap, Users, Award, Truck } from "lucide-react"
import { VideoPlayer } from "./video-player"
import { useState, useEffect } from "react"
import { useScheduling } from "./scheduling-context"

const fetchMetrics = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return {
    patientsTransformed: 1000,
    successRate: 96,
    yearsExperience: 18,
    supportHours: "24/7",
  }
}

export function HeroSection() {
  const { open: openScheduling } = useScheduling()
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false)
  const [metrics, setMetrics] = useState({
    patientsTransformed: 1000,
    successRate: 98,
    yearsExperience: 15,
    supportHours: "24/7",
  })

  useEffect(() => {
    fetchMetrics().then(setMetrics)
  }, [])

  const handleStartRecovery = () => {
    const contactSection = document.getElementById("contact")
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handlePlayVideo = () => {
    setIsVideoPlayerOpen(true)
  }

  return (
    <>
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url('/therapist-home-visit-welcoming-patient.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20"></div>
          <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-48 h-48 sm:w-72 sm:h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-64 h-64 sm:w-96 sm:h-96 bg-accent/20 rounded-full blur-3xl floating-element"></div>
          <div className="absolute top-1/2 left-1/4 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
          <div className="absolute top-2/3 left-1/3 w-1 h-1 sm:w-2 sm:h-2 bg-white/70 rounded-full animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 animate-slide-in-left text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-accent animate-glow" />
                  <span className="text-white font-semibold text-sm sm:text-base">Revolutionary Movement Science</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 sm:mb-8 leading-tight font-serif">
                  <span className="block mb-2">Peak</span>
                  <span className="block text-accent mb-2">Performance</span>
                  <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl">Awaits</span>
                </h1>

                <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 text-balance">
                  Experience cutting-edge physical therapy that combines advanced movement science with personalized
                  care. Your journey to optimal health starts here.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 sm:mb-12 justify-center lg:justify-start">
                  <Button
                    className="cta-button text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-6 animate-glow"
                    onClick={handleStartRecovery}
                  >
                    <Calendar className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                    Start Your Journey
                    <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                  <Button
                    className="cta-button text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-6 animate-glow"
                    onClick={handlePlayVideo}
                  >
                    Watch Video
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto lg:max-w-none lg:mx-0">
                  {[
                    { icon: CheckCircle, text: "No Referral Required" },
                    { icon: Calendar, text: "Same-Day Booking" },
                    { icon: Users, text: "Expert Therapists" },
                    { icon: Award, text: "Proven Results" },
                  ].map((benefit, index) => (
                    <div
                      key={benefit.text}
                      className="flex items-center gap-3 glass-card rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 animate-scale-in hover:scale-105 transition-transform duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <benefit.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0" />
                      <span className="text-white font-semibold text-sm sm:text-base">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 animate-slide-in-right mt-8 lg:mt-0">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center hover:scale-105 transition-all duration-300 hover:bg-white/15 backdrop-blur-md">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 font-serif animate-glow">
                      {metrics.patientsTransformed}+
                    </div>
                    <div className="text-white/80 font-semibold text-sm sm:text-base">Patients Transformed</div>
                  </div>
                  <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center hover:scale-105 transition-all duration-300 hover:bg-white/15 backdrop-blur-md">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 font-serif animate-glow">
                      {metrics.successRate}%
                    </div>
                    <div className="text-white/80 font-semibold text-sm sm:text-base">Success Rate</div>
                  </div>
                  <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center hover:scale-105 transition-all duration-300 hover:bg-white/15 backdrop-blur-md">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 font-serif animate-glow">
                      {metrics.yearsExperience}+
                    </div>
                    <div className="text-white/80 font-semibold text-sm sm:text-base">Years Experience</div>
                  </div>
                  <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center hover:scale-105 transition-all duration-300 hover:bg-white/15 backdrop-blur-md">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 font-serif">
                      {metrics.supportHours}
                    </div>
                    <div className="text-white/80 font-semibold text-sm sm:text-base">Support Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex flex-col items-center space-y-2 animate-bounce">
            <span className="text-white/70 text-xs sm:text-sm font-medium">Scroll to explore</span>
            <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-2 sm:h-3 bg-white/50 rounded-full mt-1 sm:mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {isVideoPlayerOpen && <VideoPlayer onClose={() => setIsVideoPlayerOpen(false)} />}
    </>
  )
}
