"use client"

import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminLoginPage() {
  const searchParams = useSearchParams()
  const hasError = searchParams.has("error")
  const hasLogout = searchParams.has("logout")

  return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                  src="/logo-pk-pt.jpg"
                  alt="Peak Kinetics Logo"
                  width={200}
                  height={80}
                  className="h-16 w-auto"
                  priority
              />
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
            {hasError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
                  Invalid credentials. Please try again.
                </div>
            )}

            {hasLogout && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm">
                  You have been logged out successfully.
                </div>
            )}

            {/* 🔑 IMPORTANT: Standard HTML form submission */}
            <form
                method="post"
                action="/admin/login"
                className="space-y-6"
            >
              <div className="space-y-2">
                <Label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <Input
                    id="username"
                    name="username"   // REQUIRED by Spring Security
                    type="email"
                    placeholder="admin@peakkinetics.com"
                    required
                    className="h-11"
                    autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Input
                    id="password"
                    name="password"   // REQUIRED by Spring Security
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-11"
                    autoComplete="current-password"
                />
              </div>

              <Button
                  type="submit"
                  className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white font-medium"
              >
                Sign In
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
