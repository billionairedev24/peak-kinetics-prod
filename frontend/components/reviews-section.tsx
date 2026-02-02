"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ReviewDetailModal } from "./review-detail-modal"
import { API_ENDPOINTS } from "@/lib/api-config"
import Link from "next/link"

export interface Review {
  id: string
  name: string
  role: string
  image: string
  rating: number
  text: string
  date: string
  fullText?: string
  treatment?: string
  source?: 'LOCAL' | 'GOOGLE'
  authorUrl?: string
  authorPhotoUrl?: string
}

export function ReviewsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.reviews.list}?page=0&pageSize=20`)
        if (!response.ok) {
          console.error("[v0] Failed to fetch reviews. Status:", response.status)
          setLoading(false)
          return
        }
        const result = await response.json()
        console.log("[v0] Reviews API response:", result)
        if (result.success && result.data) {
          const backendReviews = result.data.map((review: any) => ({
            id: review.id?.toString() || Math.random().toString(),
            name: review.name?.split(" ")[0] || "Patient",
            role: "Patient",
            image: review.authorPhotoUrl || "/patient-consultation.png",
            rating: review.rating || 5,
            text: (review.text || "").length > 120 ? review.text.substring(0, 120) + "..." : (review.text || ""),
            date: review.date || (review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Recently"),
            fullText: review.text || "",
            treatment: review.source === 'GOOGLE' ? 'Verified on Google' : 'Local Review',
            source: review.source,
            authorUrl: review.authorUrl
          }))
          setReviews(backendReviews)
        }
      } catch (error) {
        console.error("[v0] Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || isPaused) return

    let animationId: number
    const scrollSpeed = 0.5 // pixels per frame

    const animate = () => {
      if (!container) return

      container.scrollLeft += scrollSpeed

      // When we reach the end, reset to beginning for infinite loop
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        container.scrollLeft = 0
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isPaused, reviews])

  if (loading) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-600 mb-4" />
          <p className="text-gray-500 text-lg">Loading reviews...</p>
        </div>
      </section>
    )
  }

  if (reviews.length === 0) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center py-20 max-w-md mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Patient Reviews</h2>
            <p className="text-lg text-muted-foreground mb-8">Be the first to share your experience!</p>
            <Link href="/review">
              <Button className="gap-2 h-12 px-6">
                <span>+</span>
                Leave a Review
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-16 gap-8 flex-col lg:flex-row">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Patient Reviews & <span className="text-primary">Success Stories</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
              Real stories from patients who've transformed their lives with PeakKinetics.
            </p>
          </div>
          <Link href="/review">
            <Button className="flex-shrink-0 gap-2 h-12 px-6">
              <span>+</span>
              Leave a Review
            </Button>
          </Link>
        </div>

        <div className="relative group">
          <div
            ref={scrollContainerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-6 overflow-x-hidden pb-4"
            style={{
              scrollBehavior: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {[...reviews, ...reviews].map((review, index) => (
              <Card
                key={`${review.id}-${index}`}
                className="flex-shrink-0 w-full sm:w-96 cursor-pointer group/card hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
                onClick={() => setSelectedReview(review)}
              >
                <div className="p-6 h-full flex flex-col">
                  {/* Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">
                          ★
                        </span>
                      ))}
                    </div>
                    {review.source === 'GOOGLE' && (
                      <div className="flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.36-2.08 4.48-1.52 1.48-3.84 3.08-7.84 3.08-6.16 0-11-4.84-11-11s4.84-11 11-11c3.48 0 5.92 1.36 7.84 3.2l2.32-2.32C18.6 1.44 15.76 0 12.48 0 6.48 0 1.6 4.84 1.6 10.92s4.88 10.92 10.88 10.92c3.28 0 5.8-1.08 7.8-3.16 2.08-2.08 2.72-5 2.72-7.32 0-.72-.04-1.36-.16-2.04H12.48z" />
                        </svg>
                        Google
                      </div>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-muted-foreground mb-6 leading-relaxed flex-1 text-balance">"{review.text}"</p>

                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <img
                        src={review.image}
                        alt={review.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{review.name}</div>
                      <div className="text-sm text-muted-foreground">{review.role}</div>
                    </div>
                  </div>

                  {/* Date and Treatment */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    <span>{review.date}</span>
                    {review.treatment && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${review.source === 'GOOGLE' ? 'bg-sky-100 text-sky-700' : 'bg-primary/10 text-primary'
                        }`}>
                        {review.treatment}
                      </span>
                    )}
                  </div>

                  {/* Click hint */}
                  <div className="text-xs text-primary mt-3 group-hover/card:underline">
                    Click to read full review →
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {isPaused && (
            <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">
              Paused
            </div>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">{reviews.length}+</div>
            <div className="text-muted-foreground">Patient Reviews</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">
              {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0"}
              /5
            </div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">
              {reviews.length > 0
                ? Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100)
                : 0}
              %
            </div>
            <div className="text-muted-foreground">Recommended</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedReview && <ReviewDetailModal review={selectedReview} onClose={() => setSelectedReview(null)} />}
    </section>
  )
}
