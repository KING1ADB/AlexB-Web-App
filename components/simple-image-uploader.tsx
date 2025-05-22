"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SimpleImageUploaderProps {
  onImageUploaded: (url: string) => void
  className?: string
}

export default function SimpleImageUploader({ onImageUploaded, className = "" }: SimpleImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Create a base64 representation of the image
      const reader = new FileReader()

      reader.onload = async (event) => {
        if (!event.target?.result) return

        const base64 = event.target.result.toString()

        // Store the base64 image in localStorage (temporary solution)
        const imageKey = `food_image_${Date.now()}`
        localStorage.setItem(imageKey, base64)

        // In a real app, you'd upload to a server or cloud storage
        // For now, we'll just use the localStorage key as a pseudo-URL
        const pseudoUrl = `local://${imageKey}`

        onImageUploaded(pseudoUrl)

        toast({
          title: "Image saved",
          description: "Your image has been saved locally. In production, this would upload to Cloudinary.",
        })
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error handling image:", error)
      toast({
        title: "Upload failed",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={className}>
      <label htmlFor="simple-image-upload">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          disabled={isUploading}
          onClick={() => document.getElementById("simple-image-upload")?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Food Image (Local)
            </>
          )}
        </Button>
      </label>
      <input
        id="simple-image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  )
}
