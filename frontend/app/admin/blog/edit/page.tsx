"use client"

import { BlogEditor } from "@/components/admin/blog-editor"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function EditBlogPostContent() {
  const searchParams = useSearchParams()
  const postId = searchParams.get("id") || undefined

  return <BlogEditor postId={postId} />
}

export default function EditBlogPostPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading editor...</div>}>
      <EditBlogPostContent />
    </Suspense>
  )
}
