"use client"

import { Play } from "lucide-react"
import { useState } from "react"

export function VideoSection() {
  const [activeVideo, setActiveVideo] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)

  const videos = {
    1: {
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      title: "Patient Success Story",
      thumbnail: "/pain-management.jpeg",
    },
    2: {
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      title: "Our Treatment Approach",
      thumbnail: "/modern-physical-therapy-clinic-with-professional-e.jpg",
    },
  }

  const currentVideo = videos[activeVideo as keyof typeof videos]

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
                  src={currentVideo.thumbnail || "/placeholder.svg"}
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
                key={activeVideo}
                className="w-full h-full object-cover"
                controls
                autoPlay
                controlsList="nodownload"
                onEnded={() => setIsPlaying(false)}
              >
                <source src={currentVideo.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Video selector */}
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={() => {
                setActiveVideo(1)
                setIsPlaying(false)
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeVideo === 1 ? "bg-blue-600 text-white shadow-lg" : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              Patient Story
            </button>
            <button
              onClick={() => {
                setActiveVideo(2)
                setIsPlaying(false)
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeVideo === 2 ? "bg-blue-600 text-white shadow-lg" : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              Our Approach
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
