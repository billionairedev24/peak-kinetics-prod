"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { API_ENDPOINTS } from "@/lib/api-config"
import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Eye, Calendar, Search, FileText } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  author: string
  publishedAt: string
  status: "published" | "draft"
  tags: string[]
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; postId: string | null; postTitle: string }>({
    open: false,
    postId: null,
    postTitle: "",
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.blog.list, {
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Blog API response:", result)
        setPosts(result.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const deletePost = async (postId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.blog.delete(Number(postId)), {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== postId))
        showNotification("success", "Blog post deleted successfully")
      } else {
        showNotification("error", "Failed to delete blog post")
      }
    } catch (error) {
      showNotification("error", "An error occurred")
    } finally {
      setDeleteDialog({ open: false, postId: null, postTitle: "" })
    }
  }

  const filteredPosts = posts.filter(
      (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
      <div className="space-y-6">
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, postId: null, postTitle: "" })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Blog Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteDialog.postTitle}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog({ open: false, postId: null, postTitle: "" })}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => deleteDialog.postId && deletePost(deleteDialog.postId)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notification */}
        {notification && (
            <div
                className={`fixed bottom-6 right-6 z-50 rounded-lg border-2 px-6 py-4 shadow-lg ${
                    notification.type === "success"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                        : "border-red-500 bg-red-50 text-red-800"
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                    className={`h-2 w-2 rounded-full ${notification.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}
                />
                <span className="font-medium">{notification.message}</span>
              </div>
            </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Posts</h2>
            <p className="text-gray-600">{posts.length} total posts</p>
          </div>
          <Link href="/admin/blog/new">
            <Button className="bg-sky-600 hover:bg-sky-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Post
            </Button>
          </Link>
        </div>

        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
                placeholder="Search posts by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
            />
          </div>
        </Card>

        {loading ? (
            <Card className="p-12 text-center text-gray-500">
              <div className="animate-pulse">Loading posts...</div>
            </Card>
        ) : filteredPosts.length === 0 ? (
            <Card className="p-16 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? "Try adjusting your search" : "Get started by creating your first blog post"}
              </p>
              <Link href="/admin/blog/new">
                <Button className="bg-sky-600 hover:bg-sky-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Post
                </Button>
              </Link>
            </Card>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all group">
                    <div className="flex flex-col h-full">
                      {post.featuredImage ? (
                          <div className="relative h-48 bg-gray-100 overflow-hidden">
                            <Image
                                src={post.featuredImage || "/placeholder.svg"}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                      ) : (
                          <div className="h-48 bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                            <FileText className="h-16 w-16 text-sky-300" />
                          </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <Badge className={post.status === "published" ? "bg-green-600" : "bg-gray-600"}>
                            {post.status}
                          </Badge>
                          {post.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                          ))}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{post.excerpt}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Link href={`/blog/post?id=${post.id}`} target="_blank">
                              <Button size="sm" variant="ghost" title="View post">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/blog/edit?id=${post.id}`}>
                              <Button size="sm" variant="ghost" title="Edit post">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteDialog({ open: true, postId: post.id, postTitle: post.title })}
                                title="Delete post"
                            >
                              <Trash2 className="h-4 w-4 text-red-600 hover:text-red-700" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
              ))}
            </div>
        )}
      </div>
  )
}
