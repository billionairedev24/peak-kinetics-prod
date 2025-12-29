"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { API_ENDPOINTS } from "@/lib/api-config"
import { useState, useEffect } from "react"
import { Search, Calendar, User, ArrowRight, BookOpen } from "lucide-react"
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

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      /*
       @RequestParam(required = false) String status,
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) String tags
      */
      const response = await fetch(`${API_ENDPOINTS.blog.list}?status=published&limit=100`)
      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Blog API response:", result)
        const postsArray = result.data || []
        setPosts(postsArray)
      } else {
        console.error("[v0] Failed to fetch blog posts. Status:", response.status)
      }
    } catch (error) {
      console.error("[v0] Error fetching blog posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(
      (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-24 pb-20">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white py-20 mb-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-8 w-8" />
                <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">Knowledge Hub</Badge>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Peak Kinetics Blog</h1>
              <p className="text-xl text-sky-100 max-w-3xl leading-relaxed">
                Expert insights on physical therapy, rehabilitation techniques, injury prevention, and optimal movement
                for peak performance
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 max-w-6xl">
            {/* Search Bar - Only show if there are posts */}
            {!loading && posts.length > 0 && (
                <div className="max-w-2xl mx-auto mb-16">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Search articles, topics, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-6 h-14 text-base border-gray-300 focus:border-sky-500 focus:ring-sky-500 rounded-xl shadow-sm"
                    />
                  </div>
                  {searchQuery && (
                      <p className="text-center text-sm text-gray-500 mt-4">
                        Found {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""}
                      </p>
                  )}
                </div>
            )}

            {/* Blog Posts */}
            {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-600 mb-4" />
                  <p className="text-gray-500 text-lg">Loading articles...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-10 w-10 text-sky-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    We're preparing expert content on physical therapy, rehabilitation, and wellness. Check back soon!
                  </p>
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Results Found</h3>
                  <p className="text-gray-600 text-lg">Try adjusting your search terms or browse all articles.</p>
                </div>
            ) : (
                <div className="space-y-12">
                  {filteredPosts.map((post) => (
                      <Link key={post.id} href={`/blog/post?id=${post.id}`}>
                        <article className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-sky-300">
                          <div className="grid md:grid-cols-5 gap-6 p-6 md:p-8">
                            {/* Article Content */}
                            <div className="md:col-span-3 flex flex-col justify-center">
                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.slice(0, 3).map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
                                    >
                                      {tag}
                                    </Badge>
                                ))}
                              </div>

                              <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-sky-600 transition-colors leading-tight">
                                {post.title}
                              </h2>

                              <p className="text-gray-600 text-lg mb-6 leading-relaxed line-clamp-3">{post.excerpt}</p>

                              <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-sky-500" />
                                  <span className="font-medium">{post.author.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-sky-500" />
                                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sky-600 font-medium mt-6 group-hover:gap-4 transition-all">
                                Read Article
                                <ArrowRight className="h-5 w-5" />
                              </div>
                            </div>

                            {/* Featured Image */}
                            <div className="md:col-span-2 order-first md:order-last">
                              <div className="relative h-64 md:h-full min-h-[250px] rounded-xl overflow-hidden bg-gradient-to-br from-sky-50 to-blue-50">
                                {post.featuredImage ? (
                                    <img
                                        src={post.featuredImage || "/placeholder.svg"}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <BookOpen className="h-20 w-20 text-sky-300" />
                                    </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      </Link>
                  ))}
                </div>
            )}
          </div>
        </main>
        <Footer />
      </>
  )
}