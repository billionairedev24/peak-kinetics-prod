"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SuccessToast } from "@/components/ui/success-toast"
import { API_ENDPOINTS } from "@/lib/api-config"

import type { Review } from "./reviews-section"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (review: Omit<Review, "id" | "date">) => void
}

export function ReviewModal({ isOpen, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [treatment, setTreatment] = useState("")
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

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
          name,
          role,
          rating,
          treatment,
          text,
          fullText: text,
          image: "/placeholder.svg",
        }),
      })

      const result = await response.json()

      if (result.success) {
        setToastMessage(result.message || "Review submitted successfully!")
        setShowSuccess(true)

        onSubmit({
          name,
          role,
          image: "/placeholder.svg",
          rating,
          text,
          fullText: text,
          treatment,
        })

        setName("")
        setRole("")
        setTreatment("")
        setText("")
        setRating(5)

        setTimeout(() => {
          onClose()
        }, 2000)
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

  if (!isOpen) return null

  return (
    <>
      {showSuccess && <SuccessToast message={toastMessage} type="success" onClose={() => setShowSuccess(false)} />}
      {showError && <SuccessToast message={toastMessage} type="error" onClose={() => setShowError(false)} />}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <Card className="w-full max-w-2xl border-0 shadow-2xl">
          <div className="relative p-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-xl"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold mb-2">Share Your Experience</h2>
            <p className="text-muted-foreground mb-8">Help other patients learn about your journey with PeakKinetics</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-all hover:scale-125 text-3xl focus:outline-none focus:scale-125"
                    >
                      <span className={star <= (hoveredRating || rating) ? "text-yellow-400" : "text-muted-foreground"}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {rating === 5 && "Excellent!"}
                  {rating === 4 && "Very good"}
                  {rating === 3 && "Good"}
                  {rating === 2 && "Fair"}
                  {rating === 1 && "Poor"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Your Role / Condition *</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Construction Worker, Tennis Player"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Treatment / Program</label>
                <input
                  type="text"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="e.g., Back Injury Recovery, Sports Performance"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Your Review *</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Tell us about your experience with PeakKinetics..."
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-32 resize-none"
                  required
                />
              </div>

              <div className="flex gap-4 justify-end">
                <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button disabled={!name || !role || !text || isSubmitting} className="gap-2">
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </>
  )
}
