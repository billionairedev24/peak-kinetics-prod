"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, MessageSquare, AlertCircle, Map } from "lucide-react"
import { SuccessToast } from "@/components/ui/success-toast"
import { API_ENDPOINTS } from "@/lib/api-config"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  message: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  email?: string
  message?: string
}

export function ContactSection() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const handleGetDirections = () => {
    const address = "1 Chisholm Trail, Suite 450, Round Rock, TX 78681"
    const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`
    window.open(googleMapsUrl, "_blank")
  }

  const handleCallNow = () => {
    window.location.href = "tel:+17373682653"
  }

  const handleSendEmail = () => {
    const subject = encodeURIComponent("Inquiry from Peak Kinetics Website")
    const body = encodeURIComponent("Hello Peak Kinetics team,\n\nI would like to inquire about...")
    window.location.href = `mailto:info@peakkineticspt.com?subject=${subject}&body=${body}`
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSendMessage = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const requestData = {
        firstName: formData.firstName.trim() || null,
        lastName: formData.lastName.trim() || null,
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        message: formData.message.trim(),
      }

      console.log("[v0] Sending message with data:", requestData)

      const response = await fetch(API_ENDPOINTS.messages.create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()

      if (result.success) {
        setToastMessage(result.message || "Message sent successfully!")
        setShowSuccess(true)

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          message: "",
        })
      } else {
        setToastMessage(result.error || "Error sending message. Please try again.")
        setShowError(true)
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      setToastMessage("Error sending message. Please try again.")
      setShowError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["1 Chisholm Trail, Suite 450", "Round Rock, TX 78681"],
      action: "Get Directions",
      handler: handleGetDirections,
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["737-368-2653", "Available 24/7"],
      action: "Call Now",
      handler: handleCallNow,
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["info@peakkineticspt.com", "We respond within 2 hours"],
      action: "Send Email",
      handler: handleSendEmail,
    },
  ]

  const hours = [
    { day: "Monday - Friday", time: "7:00 AM - 7:00 PM" },
    { day: "Saturday", time: "8:00 AM - 2:00 PM" },
    { day: "Sunday", time: "Closed" },
  ]

  return (
      <>
        {showSuccess && <SuccessToast message={toastMessage} type="success" onClose={() => setShowSuccess(false)} />}
        {showError && <SuccessToast message={toastMessage} type="error" onClose={() => setShowError(false)} />}

        <section id="contact" className="py-24 bg-linear-to-b from-background to-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Ready to <span className="text-primary">Get Started?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                Take the first step toward a pain-free, active lifestyle. Contact us today to schedule your comprehensive
                evaluation.
              </p>
            </div>

            <div className="space-y-12">
              {/* Quick Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contactInfo.map((info) => (
                    <Card
                        key={info.title}
                        className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center gap-4">
                          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                            <info.icon className="h-7 w-7 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                            {info.details.map((detail, index) => (
                                <p key={index} className="text-muted-foreground text-sm mb-1">
                                  {detail}
                                </p>
                            ))}
                            <Button
                                variant="link"
                                className="p-0 h-auto text-primary hover:text-primary/80 text-sm mt-3 font-semibold"
                                onClick={info.handler}
                            >
                              {info.action} →
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>

              {/* Form and Map Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Form */}
                <Card className="border-0 shadow-lg h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground text-2xl">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      Send Us a Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">First Name</label>
                        <Input
                            placeholder="John"
                            className="bg-background"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Last Name</label>
                        <Input
                            placeholder="Doe"
                            className="bg-background"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Phone</label>
                      <Input
                          type="tel"
                          placeholder="737-368-2653"
                          className="bg-background"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Address</label>
                      <Input
                          placeholder="123 Main Street, City, State 12345"
                          className="bg-background"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                          type="email"
                          placeholder="john.doe@example.com"
                          className={`bg-background ${errors.email ? "border-red-500" : ""}`}
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                      {errors.email && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email}
                          </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                          placeholder="Tell us about your condition, goals, or any questions you have..."
                          className={`bg-background min-h-[100px] ${errors.message ? "border-red-500" : ""}`}
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                      />
                      {errors.message && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                            <AlertCircle className="h-3 w-3" />
                            {errors.message}
                          </div>
                      )}
                    </div>

                    <Button
                        size="lg"
                        className="modern-button bg-primary hover:bg-primary/90 shadow-lg w-full"
                        onClick={handleSendMessage}
                        disabled={isSubmitting}
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                      We'll get back to you within 2 hours during business hours.
                    </p>
                  </CardContent>
                </Card>

                {/* Map and Hours */}
                <div className="space-y-6">
                  {/* Map */}
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                        <Map className="h-5 w-5 text-primary" />
                        Our Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="w-full h-80 rounded-b-lg overflow-hidden">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.7891234567!2d-97.7299!3d30.4969!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b3b3b3b3b3b3%3A0x1234567890abcdef!2s1%20Chisholm%20Trail%2C%20Suite%20450%2C%20Round%20Rock%2C%20TX%2078681!5e0!3m2!1sen!2sus!4v1234567890"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full"
                        ></iframe>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hours */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Clock className="h-5 w-5 text-primary" />
                        Office Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {hours.map((schedule) => (
                            <div
                                key={schedule.day}
                                className="flex justify-between items-center pb-3 border-b last:border-0"
                            >
                              <span className="text-muted-foreground text-sm font-medium">{schedule.day}</span>
                              <span className="text-foreground font-semibold text-sm">{schedule.time}</span>
                            </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
  )
}
