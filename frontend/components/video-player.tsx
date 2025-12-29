"use client"

import { X } from "lucide-react"
import { useState } from "react"

interface VideoPlayerProps {
  onClose: () => void
}

export function VideoPlayer({ onClose }: VideoPlayerProps) {
  const [activeVideo, setActiveVideo] = useState(1)

  const videos = {
    1: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    2: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl">
        <div className="relative bg-black rounded-2xl overflow-hidden group aspect-video">
          <video key={activeVideo} className="w-full h-full object-cover" controls autoPlay controlsList="nodownload">
            <source src={videos[activeVideo as keyof typeof videos]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors text-white z-10"
            aria-label="Close video"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video switcher buttons */}
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={() => setActiveVideo(1)}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeVideo === 1 ? "bg-blue-600 text-white" : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Video 1
          </button>
          <button
            onClick={() => setActiveVideo(2)}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeVideo === 2 ? "bg-blue-600 text-white" : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Video 2
          </button>
        </div>
      </div>
    </div>
  )
}
