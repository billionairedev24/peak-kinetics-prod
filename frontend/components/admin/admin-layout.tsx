"use client"

import { type ReactNode, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { adminAuth } from "@/lib/admin-auth"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  MessageSquare,
  Star,
  FileText,
  Video,
  LogOut,
  Menu,
  X,
} from "lucide-react"

interface AdminLayoutProps {
  children: ReactNode
}

interface AdminUser {
  name?: string
  role?: string
  lastLogin?: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function formatLastLogin(lastLogin?: string): string {
  if (!lastLogin) return "First login"
  const date = new Date(lastLogin)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  return date.toLocaleDateString()
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [greeting, setGreeting] = useState(getGreeting())

  // Auth bootstrap: only let the dashboard mount after we have a real user.
  useEffect(() => {
    let mounted = true

    async function initAuth() {
      const userData = await adminAuth.getUser()
      if (!mounted) return

      if (!userData) {
        // Either unauthenticated, or backend unreachable. Either way: bounce.
        router.replace("/admin/login")
        return
      }

      setUser(userData)
      setLoading(false)
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [router])

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Close mobile sidebar on Escape
  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [sidebarOpen])

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      const original = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = original
      }
    }
  }, [sidebarOpen])

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/videos", label: "Videos", icon: Video },
    { href: "/admin/blog", label: "Blog Posts", icon: FileText },
  ]

  // ⏳ Prevent hydration mismatch
  if (loading) {
    return null // or spinner
  }

  const firstName = user?.name?.split(" ")[0] || "Admin"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        role="navigation"
        aria-label="Admin navigation"
        aria-hidden={!sidebarOpen ? undefined : false}
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-sky-600">Peak Kinetics</h2>
            <p className="text-sm text-gray-600 mt-1">Admin Portal</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? "bg-sky-50 text-sky-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center">
                <span className="text-sm font-medium text-sky-700">
                  {firstName.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role || "Administrator"}
                </p>
              </div>
            </div>

            {user?.lastLogin && (
              <p className="text-xs text-gray-500 px-4 mb-3">
                Last login: {formatLastLogin(user.lastLogin)}
              </p>
            )}

            {/* Cloudflare Access logout — clears the CF session cookie */}
            <a href="/cdn-cgi/access/logout" className="block">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-11 w-11"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>

            <h1 className="text-xl font-semibold text-gray-900">
              {greeting}, {firstName}!
            </h1>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
