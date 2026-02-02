"use client"

import { Card } from "@/components/ui/card"
import { MessageSquare, Star, FileText, Video } from "lucide-react"
import Link from "next/link"
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api-config"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    messages: 0,
    reviews: 0,
    blogPosts: 0,
    videos: 0,
    unreadMessages: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, reviewsRes, blogsRes, videosRes] = await Promise.all([
          fetch(API_ENDPOINTS.messages.statistics, { credentials: "include" }),
          fetch(`${API_ENDPOINTS.reviews.list}?page=0&size=1`, { credentials: "include" }),
          fetch(`${API_ENDPOINTS.blog.list}?page=0&pageSize=1`, { credentials: "include" }),
          fetch(`${API_ENDPOINTS.videos.list}?page=0&size=1`, { credentials: "include" }),
        ])

        const statsData = statsRes.ok ? await statsRes.json() : { data: {} }
        const reviewsData = reviewsRes.ok ? await reviewsRes.json() : { data: [], total: 0 }
        const blogsData = blogsRes.ok ? await blogsRes.json() : { data: [], total: 0 }
        const videosData = videosRes.ok ? await videosRes.json() : { data: [], total: 0 }

        console.log("[v0] Dashboard API responses:", { statsData, reviewsData, blogsData, videosData })

        setStats({
          messages: statsData.data?.totalThreads || 0,
          reviews: reviewsData.total || 0,
          blogPosts: blogsData.total || 0,
          videos: videosData.total || 0,
          unreadMessages: statsData.data?.unreadMessages || 0,
        })
      } catch (error) {
        console.error("[v0] Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      label: "Total Messages",
      value: loading ? "..." : stats.messages.toString(),
      subtext: `${stats.unreadMessages} unread`,
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/admin/messages",
    },
    {
      label: "Reviews",
      value: loading ? "..." : stats.reviews.toString(),
      subtext: "Patient feedback",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      href: "/admin/reviews",
    },
    {
      label: "Blog Posts",
      value: loading ? "..." : stats.blogPosts.toString(),
      subtext: "Published articles",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/admin/blog",
    },
    {
      label: "Videos",
      value: loading ? "..." : stats.videos.toString(),
      subtext: "Impact & testimonials",
      icon: Video,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      href: "/admin/videos",
    },
  ]

  const quickActions = [
    {
      icon: Star,
      title: "Send Review Request",
      description: "Request feedback from clients",
      href: "/admin/reviews",
      color: "text-sky-600",
      bgColor: "bg-sky-50",
    },
    {
      icon: MessageSquare,
      title: "View Messages",
      description: "Check client inquiries",
      href: "/admin/messages",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: FileText,
      title: "Create Blog Post",
      description: "Share knowledge with clients",
      href: "/admin/blog/new",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Video,
      title: "Upload Video",
      description: "Manage impact videos",
      href: "/admin/videos",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
        <p className="text-gray-600">Here's an overview of your practice</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtext}</p>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href}>
                <div className="group p-6 border-2 border-gray-200 rounded-xl hover:border-sky-400 hover:shadow-md transition-all cursor-pointer">
                  <div className={`${action.bgColor} ${action.color} p-3 rounded-lg inline-block mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New message received</p>
              <p className="text-xs text-gray-500">From John Smith • 10 minutes ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-yellow-100 text-yellow-600 p-2 rounded-lg">
              <Star className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New review received</p>
              <p className="text-xs text-gray-500">5-star rating • 2 hours ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
