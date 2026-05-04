"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { adminAuth } from "@/lib/admin-auth"

export default function AdminRootPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const user = await adminAuth.getUser()
      if (cancelled) return
      router.replace(user ? "/admin/dashboard" : "/admin/login")
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
    </div>
  )
}
