"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SuccessToast } from "@/components/ui/success-toast"
import { API_ENDPOINTS } from "@/lib/api-config"
import Link from "next/link"

export default function ReviewFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [firstName, setFirstName] = useState("")
  const [reviewText, setReviewText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(API_ENDPOINTS.reviews.create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: firstName,
          role: "Patient", // Default role
          rating,
          text: reviewText,
          fullText: reviewText,
          image: "/placeholder.svg",
        }),
      })

      const result = await response.json()

      if (result.success) {
        setToastMessage(result.message || "Thank you for your review!")
        setShowSuccess(true)
        setIsSubmitted(true)
      } else {
        setToastMessage(result.error || "Error submitting review. Please try again.")
        setShowError(true)
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      setToastMessage("Error submitting review. Please try again.")
      setShowError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
        <Card className="w-full max-w-2xl border-0 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-cyan-600 p-8 text-white text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">Thank You!</h2>
            <p className="text-blue-100 text-lg">Your review has been successfully submitted</p>
          </div>
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-6 text-lg">
              We appreciate you taking the time to share your experience with Peak Kinetics Physical Therapy.
            </p>
            <Link href="/">
              <Button size="lg" className="gap-2">
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <>
      {showSuccess && <SuccessToast message={toastMessage} type="success" onClose={() => setShowSuccess(false)} />}
      {showError && <SuccessToast message={toastMessage} type="error" onClose={() => setShowError(false)} />}

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
        <Card className="w-full max-w-2xl border-0 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-cyan-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Share Your Experience</h1>
                <p className="text-blue-100 mt-1">Peak Kinetics Physical Therapy</p>
              </div>
            </div>
            <p className="text-blue-100 text-lg">
              Your feedback helps us improve and helps others make informed decisions about their care.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Rating Section */}
            <div className="text-center">
              <label className="block text-xl font-semibold mb-4 text-foreground">
                How would you rate your experience?
              </label>
              <div className="flex gap-3 justify-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-all hover:scale-110 text-5xl focus:outline-none focus:scale-110"
                    aria-label={`Rate ${star} stars`}
                  >
                    <span className={star <= (hoveredRating || rating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {rating === 5 && "Excellent! We're thrilled to hear that!"}
                {rating === 4 && "Very Good! Thank you for your feedback"}
                {rating === 3 && "Good! We appreciate your honesty"}
                {rating === 2 && "Fair - We'd love to know how we can improve"}
                {rating === 1 && "We're sorry to hear that. Your feedback is valuable"}
              </p>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-foreground">What's your first name?</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-foreground">Tell us about your experience</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share details about your treatment, therapist, results, or anything else you'd like others to know..."
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-40 resize-none"
                required
              />
              <p className="text-sm text-muted-foreground mt-2">Minimum 20 characters</p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!firstName.trim() || reviewText.trim().length < 20 || isSubmitting}
                className="w-full h-14 text-lg font-semibold gap-2 hover:scale-[1.02] transition-transform"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    Submit Review
                  </>
                )}
              </Button>
            </div>

            {/* Footer Note */}
            <p className="text-center text-sm text-muted-foreground">
              By submitting this review, you agree to our{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline font-medium">
                privacy policy
              </Link>{" "}
              and{" "}
              <Link href="/terms-of-service" className="text-primary hover:underline font-medium">
                terms of service
              </Link>
              .
            </p>
          </form>
        </Card>
      </div>
    </>
  )
}
