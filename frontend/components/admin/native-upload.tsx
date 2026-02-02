"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, FileVideo } from "lucide-react"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/api-config"

interface NativeUploadProps {
    onUploadComplete: (url: string) => void
    onUploadError?: (error: Error) => void
    endpoint?: string
}

export function NativeUpload({ onUploadComplete, onUploadError }: NativeUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        console.log("Input onChange triggered. File:", file?.name)
        if (!file) return
        handleUpload(file)
        // Reset input value so same file can be selected again
        if (e.target) e.target.value = ""
    }

    const handleUpload = async (file: File | undefined) => {
        console.log("handleUpload started for:", file?.name, "Size:", file?.size, "Type:", file?.type)
        if (!file) {
            console.warn("handleUpload called with no file")
            return
        }

        // Basic validation
        if (file.size > 128 * 1024 * 1024) {
            console.error("File exceeds 128MB limit:", file.size)
            toast.error("File is too large (max 128MB)")
            return
        }

        setIsUploading(true)
        setProgress(0)

        const formData = new FormData()
        formData.append("file", file)

        try {
            console.log("Preparing XHR for POST to /api/upload")
            const xhr = new XMLHttpRequest()

            xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100)
                    console.log(`Upload progress: ${percentComplete}%`)
                    setProgress(percentComplete)
                }
            })

            xhr.onload = () => {
                setIsUploading(false)
                console.log("XHR onload status:", xhr.status)
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText)
                        console.log("Upload success! URL:", data.url)
                        onUploadComplete(data.url)
                        toast.success("File uploaded successfully")
                    } catch (e) {
                        console.error("Critical: Failed to parse success response:", xhr.responseText)
                        toast.error("Failed to parse upload response")
                    }
                } else {
                    console.error("Upload failed with body:", xhr.responseText)
                    const error = new Error(`Upload failed with status ${xhr.status}`)
                    if (onUploadError) onUploadError(error)
                    else toast.error(error.message)
                }
            }

            xhr.onerror = () => {
                setIsUploading(false)
                console.error("XHR Network error occurred during upload")
                const error = new Error("Upload failed due to a network error")
                if (onUploadError) onUploadError(error)
                else toast.error(error.message)
            }

            xhr.open("POST", `${API_BASE_URL}/upload`)
            xhr.withCredentials = true
            console.log("Sending FormData...")
            xhr.send(formData)

        } catch (error: any) {
            console.error("Exception in handleUpload setup:", error)
            setIsUploading(false)
            if (onUploadError) onUploadError(error)
            else toast.error(error.message || "An unexpected error occurred")
        }
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const onDragLeave = () => {
        setIsDragging(false)
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        console.log("File dropped:", file?.name)
        if (file && (file.type.startsWith("video/") || file.name.match(/\.(mp4|mov|m4v)$/i))) {
            handleUpload(file)
        } else if (file) {
            console.warn("Invalid file type dropped:", file.type)
            toast.error("Please upload a video file")
        }
    }

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    padding: '0',
                    margin: '-1px',
                    overflow: 'hidden',
                    clip: 'rect(0,0,0,0)',
                    border: '0',
                    pointerEvents: 'none'
                }}
                accept="video/*"
            />

            {!isUploading ? (
                <div
                    className={`w-full border-2 border-dashed rounded-xl py-12 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${isDragging ? "bg-primary/10 border-primary shadow-inner" : "hover:bg-muted/50 border-muted-foreground/20"
                        }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                        <Upload className={`w-6 h-6 ${isDragging ? "text-primary animate-bounce" : "text-primary/60"}`} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold">
                            {isDragging ? "Drop video here" : "Click or drag to upload video"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 px-4">
                            MP4, MOV up to 128MB
                        </p>
                    </div>
                </div>
            ) : (
                <div className="w-full p-8 border-2 border-dashed rounded-xl bg-muted/30 border-primary/20 flex flex-col items-center gap-6">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <Loader2 className="w-16 h-16 text-primary animate-spin opacity-20" />
                        <FileVideo className="w-8 h-8 text-primary absolute" />
                    </div>
                    <div className="w-full space-y-3">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-primary">
                            <span>Uploading Video...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-primary transition-all duration-300 relative overflow-hidden"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] -skew-x-12" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
