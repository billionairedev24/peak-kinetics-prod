"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { API_ENDPOINTS } from "@/lib/api-config"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Calendar, User, Clock, ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImage?: string
  author: {
    id: number
    name: string
  }
  publishedAt: string
  tags: string[]
  content: string
}

function BlogPostContent() {
  const searchParams = useSearchParams()
  const postId = searchParams.get("id")
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (postId) {
      fetchPost(postId)
    } else {
      setError("No blog post specified")
      setLoading(false)
    }
  }, [postId])

  const fetchPost = async (postId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blog.list}/${postId}`)
      if (response.ok) {
        const result = await response.json()
        setPost(result.data)
      } else {
        setError("Blog post not found")
      }
    } catch (err) {
      setError("Error loading blog post")
      console.error("[v0] Error fetching blog post:", err)
    } finally {
      setLoading(false)
    }
  }

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  if (loading) {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-600 mb-4" />
              <p className="text-gray-500 text-lg">Loading article...</p>
            </div>
          </div>
        </main>
    )
  }

  if (error || !post) {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h2>
              <p className="text-gray-600 mb-8">{error || "The article you're looking for doesn't exist."}</p>
              <Link href="/blog">
                <Button className="bg-sky-600 hover:bg-sky-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
            </div>
          </div>
        </main>
    )
  }

  return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-20">
        <article className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Link href="/blog">
            <Button variant="ghost" className="mb-8 hover:bg-sky-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {/* Article Header */}
          <header className="mb-12">
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 px-3 py-1">
                    {tag}
                  </Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-sky-600" />
                <span className="font-medium">{post.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-sky-600" />
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-sky-600" />
                <span>{calculateReadTime(post.content)} min read</span>
              </div>
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
                <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-12 shadow-lg">
                  <img
                      src={post.featuredImage || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover"
                  />
                </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-200">
              {post.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-6 text-lg">
                    {paragraph}
                  </p>
              ))}
            </div>
          </div>

          {/* Back to Blog CTA */}
          <div className="mt-16 text-center">
            <Link href="/blog">
              <Button size="lg" className="bg-sky-600 hover:bg-sky-700">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Read More Articles
              </Button>
            </Link>
          </div>
        </article>
      </main>
  )
}

export default function BlogPostPage() {
  return (
      <>
        <Header />
        <Suspense
            fallback={
              <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-20">
                <div className="container mx-auto px-4 max-w-4xl">
                  <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-600 mb-4" />
                    <p className="text-gray-500 text-lg">Loading article...</p>
                  </div>
                </div>
              </main>
            }
        >
          <BlogPostContent />
        </Suspense>
        <Footer />
      </>
  )
}
