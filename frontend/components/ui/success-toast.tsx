"use client"

import { CheckCircle2, XCircle, X } from "lucide-react"
import { useEffect, useState } from "react"

interface ToastProps {
  message: string
  onClose: () => void
  duration?: number
  type?: "success" | "error"
}

export function SuccessToast({ message, onClose, duration = 5000, type = "success" }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const bgColor = type === "success" ? "bg-emerald-500" : "bg-red-500"
  const Icon = type === "success" ? CheckCircle2 : XCircle

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 ${bgColor} text-white px-4 py-3 rounded-lg shadow-2xl transition-all duration-300 min-w-[340px] border border-white/20 ${
        isExiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
      }`}
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 flex-shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        onClick={handleClose}
        className="hover:bg-white/20 rounded-md p-1 transition-colors flex-shrink-0"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
