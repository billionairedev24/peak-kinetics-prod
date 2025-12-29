import { Suspense } from "react"
import ReviewFormContent from "@/components/review-form-content"

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ReviewFormContent />
    </Suspense>
  )
}
