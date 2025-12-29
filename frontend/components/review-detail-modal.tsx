"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import type { Review } from "./reviews-section"

interface ReviewDetailModalProps {
  review: Review
  onClose: () => void
}

export function ReviewDetailModal({ review, onClose }: ReviewDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl border-0 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-xl"
          >
            ×
          </button>

          {/* Rating */}
          <div className="flex gap-1 mb-4">
            {[...Array(review.rating)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-xl">
                ★
              </span>
            ))}
          </div>

          {/* Full Review Text */}
          <p className="text-lg text-foreground mb-6 leading-relaxed text-balance">
            "{review.fullText || review.text}"
          </p>

          {/* Treatment Badge */}
          {review.treatment && (
            <div className="mb-6">
              <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                {review.treatment}
              </span>
            </div>
          )}

          {/* Author Info */}
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={review.image || "/placeholder.svg"}
                alt={review.name}
                className="w-16 h-16 rounded-full object-cover bg-muted"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <div>
                <h3 className="font-bold text-lg">{review.name}</h3>
                <p className="text-muted-foreground">{review.role}</p>
                <p className="text-sm text-muted-foreground mt-1">{review.date}</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex gap-4 justify-end mt-8">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
