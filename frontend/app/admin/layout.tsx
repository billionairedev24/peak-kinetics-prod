"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const publicRoutes = ["/admin", "/admin/login", "/admin/register", "/admin/forgot-password", "/admin/reset-password"]

  if (publicRoutes.includes(pathname)) {
    return <>{children}</>
  }

  return <AdminLayout>{children}</AdminLayout>
}
