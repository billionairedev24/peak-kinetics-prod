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

  // ✅ Auth bootstrap (async-safe)
  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const authenticated = adminAuth.isAuthenticated()

        if (!authenticated) {
          router.replace("/admin/login")
          return
        }

        const userData = await adminAuth.getUser()

        if (mounted) {
          setUser(userData)
          setLoading(false)
        }
      } catch {
        router.replace("/admin/login")
      }
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
        />
      )}

      {/* Sidebar */}
      <aside
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

            {/* ✅ Spring Security logout */}
            <form method="post" action="/logout">
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </form>
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
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
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
