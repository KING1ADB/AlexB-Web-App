"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void
  className?: string
}

export default function ImageUploader({ onImageUploaded, className = "" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const uploadToCloudinary = async (file: File) => {
    try {
      setIsUploading(true)

      // Create a FormData object
      const formData = new FormData()
      formData.append("file", file)

      console.log("Starting upload to API route")

      // Upload to our API route instead of directly to Cloudinary
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      console.log("API response status:", response.status)

      if (!response.ok) {
        let errorMessage = "Failed to upload image"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          console.error("Upload error details:", errorData)
        } catch (e) {
          console.error("Could not parse error response:", e)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("Upload successful, image URL:", data.url)

      onImageUploaded(data.url)

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("Selected file:", file.name, "Size:", file.size, "Type:", file.type)
      uploadToCloudinary(file)
    }
  }

  return (
    <div className={className}>
      <label htmlFor="image-upload">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          disabled={isUploading}
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Food Image
            </>
          )}
        </Button>
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  )
}
