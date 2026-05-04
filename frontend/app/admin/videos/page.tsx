"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { NativeUpload } from "@/components/admin/native-upload"
import { Trash2, Video as VideoIcon, Plus, ExternalLink, Loader2, Play } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api-config"

interface Video {
    id: number
    title: string
    description: string
    videoUrl: string
    thumbnailUrl: string
    category: string
    createdAt: string
}

export default function AdminVideosPage() {
    const [videos, setVideos] = useState<Video[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)

    // New Video Form State
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [videoUrl, setVideoUrl] = useState("")
    const [thumbnailUrl, setThumbnailUrl] = useState("")
    const [category, setCategory] = useState("Impact")

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_ENDPOINTS.videos.list}?page=0&size=50`, {
                credentials: "include"
            })
            if (response.ok) {
                const data = await response.json()
                setVideos(data.data || [])
            }
        } catch (error) {
            console.error("Failed to fetch videos:", error)
            toast.error("Failed to load videos")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveVideo = async () => {
        if (!title || !videoUrl) {
            toast.error("Title and Video URL are required")
            return
        }

        try {
            const response = await fetch(API_ENDPOINTS.videos.create, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ title, description, videoUrl, thumbnailUrl, category }),
            })

            if (response.ok) {
                toast.success("Video saved successfully")
                setTitle("")
                setDescription("")
                setVideoUrl("")
                setThumbnailUrl("")
                setIsAdding(false)
                fetchVideos()
            } else {
                toast.error("Failed to save video")
            }
        } catch (error) {
            console.error("Error saving video:", error)
            toast.error("Error saving video")
        }
    }

    const handleDeleteVideo = async (id: number) => {
        if (!confirm("Are you sure you want to delete this video?")) return

        try {
            const response = await fetch(API_ENDPOINTS.videos.delete(id), {
                method: "DELETE",
                credentials: "include"
            })

            if (response.ok) {
                toast.success("Video deleted")
                fetchVideos()
            } else {
                toast.error("Failed to delete video")
            }
        } catch (error) {
            console.error("Error deleting video:", error)
            toast.error("Error deleting video")
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Video Showcase</h1>
                    <p className="text-muted-foreground">Manage "See Our Impact" videos</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Video</>}
                </Button>
            </div>

            {isAdding && (
                <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle>Add New Video</CardTitle>
                        <CardDescription>Upload a video and provide metadata</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Patient Success Story"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <select
                                        id="category"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="Impact">Impact</option>
                                        <option value="Testimonial">Testimonial</option>
                                        <option value="Educational">Educational</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        className="h-24"
                                        placeholder="Details about this impact story..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Video Content</Label>
                                    {videoUrl ? (
                                        <div className="p-4 border rounded-lg bg-green-500/10 border-green-500/20 flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <VideoIcon className="w-4 h-4 text-green-500" />
                                                <span className="truncate max-w-[200px] text-xs font-medium text-green-500">Video Uploaded</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setVideoUrl("")}>Change</Button>
                                        </div>
                                    ) : (
                                        <NativeUpload
                                            onUploadComplete={(url) => {
                                                setVideoUrl(url)
                                                toast.success("Video uploaded successfully")
                                            }}
                                            onUploadError={(error: Error) => {
                                                toast.error(`Upload failed: ${error.message}`)
                                            }}
                                        />
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
                                    <Input
                                        id="thumbnailUrl"
                                        placeholder="https://..."
                                        value={thumbnailUrl}
                                        onChange={(e) => setThumbnailUrl(e.target.value)}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Provide a direct link to an image for the video preview</p>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full mt-4 bg-primary hover:bg-primary/90" onClick={handleSaveVideo} disabled={!videoUrl || !title}>
                            <Plus className="w-4 h-4 mr-2" /> Save Video Entry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="aspect-video w-full" />
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </Card>
                    ))
                ) : videos.length === 0 ? (
                    <div className="col-span-full text-center py-20 border rounded-2xl bg-muted/30">
                        <VideoIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No videos found. Upload your first one!</p>
                    </div>
                ) : (
                    videos.map((v) => (
                        <Card key={v.id} className="overflow-hidden group border-2 border-transparent hover:border-sky-500 transition-all duration-300">
                            <div className="aspect-video bg-gray-900 relative flex items-center justify-center overflow-hidden">
                                {v.thumbnailUrl ? (
                                    <img
                                        src={v.thumbnailUrl as string}
                                        alt={v.title as string}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <VideoIcon className="w-10 h-10 text-white/20" />
                                        <span className="text-[10px] text-white/30 font-medium">NO THUMBNAIL</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white">
                                        <Play className="w-6 h-6 fill-current" />
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8 shadow-lg"
                                        onClick={() => handleDeleteVideo(v.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="absolute bottom-2 left-2">
                                    <span className="bg-sky-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                        {v.category}
                                    </span>
                                </div>
                            </div>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-lg truncate group-hover:text-sky-600 transition-colors">{v.title}</CardTitle>
                                <CardDescription className="line-clamp-2 text-xs h-8">
                                    {v.description || "No description provided."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 flex justify-end items-center mt-2">
                                <a
                                    href={v.videoUrl as string}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sky-600 hover:text-sky-700 hover:underline text-xs font-semibold flex items-center gap-1.5"
                                >
                                    Watch Video <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
