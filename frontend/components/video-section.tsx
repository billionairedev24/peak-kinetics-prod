"use client"

import { Play, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { API_ENDPOINTS } from "@/lib/api-config"

export function VideoSection() {
  const [videos, setVideos] = useState<any[]>([])
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch(`${API_ENDPOINTS.videos.list}?page=0&size=10`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.data && data.data.length > 0) {
            setVideos(data.data)
          }
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVideos()
  }, [])

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </section>
    )
  }

  if (videos.length === 0) {
    return null // Hide section if no videos are available
  }

  const currentVideo = videos[activeVideoIndex]

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif">See Our Impact</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch how we transform lives through innovative physical therapy
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video group">
            {!isPlaying ? (
              <>
                <img
                  src={currentVideo.thumbnailUrl || "/placeholder.svg"}
                  alt={currentVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all transform hover:scale-110 group-hover:scale-110"
                    aria-label="Play video"
                  >
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h3 className="text-white text-2xl font-bold">{currentVideo.title}</h3>
                </div>
              </>
            ) : (
              <video
                key={activeVideoIndex}
                className="w-full h-full object-cover"
                controls
                autoPlay
                controlsList="nodownload"
                onEnded={() => setIsPlaying(false)}
              >
                <source src={currentVideo.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Video selector */}
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            {videos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => {
                  setActiveVideoIndex(index)
                  setIsPlaying(false)
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeVideoIndex === index ? "bg-blue-600 text-white shadow-lg" : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
              >
                {video.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
