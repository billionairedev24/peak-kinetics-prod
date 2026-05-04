"use client"

import { API_ENDPOINTS } from "./api-config"

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  lastLogin?: string
}

interface RegisterData {
  title: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export const adminAuth = {
  login: async (email: string, password: string): Promise<AdminUser | null> => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) return null

      const data = await response.json()
      return data.user || null
    } catch (error) {
      console.error("Login error:", error)
      return null
    }
  },

  register: async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })

      return response.ok
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  },

  requestPasswordReset: async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      })

      return response.ok
    } catch (error) {
      console.error("Password reset request error:", error)
      return false
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.resetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, newPassword }),
      })

      return response.ok
    } catch (error) {
      console.error("Password reset error:", error)
      return false
    }
  },

  /**
   * Returns the signed-in user, or null if:
   *  - no session / JWT present (backend returns 401)
   *  - backend is unreachable (network error)
   *  - response is malformed
   */
  getUser: async (): Promise<AdminUser | null> => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.user, {
        credentials: "include",
      })

      if (!response.ok) return null

      const data = await response.json()
      if (!data || !data.email) return null
      return data as AdminUser
    } catch (error) {
      console.error("Get user error:", error)
      return null
    }
  },

  /**
   * Truly async auth check — hits the backend and only resolves true when
   * a valid user object comes back. Callers must await this.
   */
  isAuthenticated: async (): Promise<boolean> => {
    const user = await adminAuth.getUser()
    return user !== null
  },
}
