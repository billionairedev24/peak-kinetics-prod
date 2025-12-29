"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { adminAuth } from "@/lib/admin-auth"

export default function AdminRootPage() {
  const router = useRouter()

  useEffect(() => {
    if (adminAuth.isAuthenticated()) {
      router.replace("/admin/dashboard")
    } else {
      router.replace("/admin/login")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
    </div>
  )
}
