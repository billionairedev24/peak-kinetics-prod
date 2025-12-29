"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface SchedulingIframeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SchedulingIframeModal({ isOpen, onClose }: SchedulingIframeModalProps) {
  const [isLoading, setIsLoading] = useState(true)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden">
      {/* Close Button - Subtle and positioned top right */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 bg-white shadow-md"
        aria-label="Close scheduling"
      >
        <X className="h-5 w-5 text-gray-700" />
      </button>

      {isLoading && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Loading scheduling system...</p>
          </div>
        </div>
      )}

      <iframe
        src="https://scheduling.go.promptemr.com/onlineScheduling?w=2467&s=DL"
        className="w-full h-full border-0"
        title="Schedule Appointment"
        onLoad={() => setIsLoading(false)}
        allow="clipboard-write; clipboard-read"
      />
    </div>
  )
}
