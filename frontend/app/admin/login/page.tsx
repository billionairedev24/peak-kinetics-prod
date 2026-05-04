"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminAuth } from "@/lib/admin-auth"

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasLogout = searchParams.has("logout")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(searchParams.has("error") ? "Invalid credentials. Please try again." : null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const user = await adminAuth.login(email, password)
      if (user) {
        router.push("/admin/dashboard")
      } else {
        setError("Invalid credentials. Please try again.")
      }
    } catch {
      setError("Sign-in failed. Please try again later.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Logo — prominent display, source PNG is 1024px so it's sharp */}
            <div className="flex justify-center mb-6">
              <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 p-3 shadow-md ring-1 ring-sky-100">
                <Image
                    src="/logo-pk-pt.jpg"
                    alt="Peak Kinetics Logo"
                    width={512}
                    height={512}
                    className="h-28 w-28 object-contain"
                    priority
                />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Portal
              </h1>
              <p className="text-gray-600">
                Sign in to manage your practice
              </p>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
                  {error}
                </div>
            )}

            {hasLogout && !error && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm">
                  You have been logged out successfully.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@peakkineticspt.com"
                    required
                    autoComplete="username"
                    className="h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                />
              </div>

              <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-medium"
              >
                {submitting ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            {/* Links */}
            <p className="mt-6 text-center text-sm text-gray-500">
              <Link
                  href="/admin/forgot-password"
                  className="text-sky-600 hover:text-sky-700 font-medium"
              >
                Forgot your password?
              </Link>
            </p>

            <p className="mt-2 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                  href="/admin/register"
                  className="text-sky-600 hover:text-sky-700 font-medium"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
  )
}
