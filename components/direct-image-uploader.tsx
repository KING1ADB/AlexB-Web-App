"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DirectImageUploaderProps {
  foodName: string
  onImageUploaded: (url: string) => void
}

export default function DirectImageUploader({ foodName, onImageUploaded }: DirectImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      console.log(`Starting upload for ${foodName}`)

      // Create a FormData object
      const formData = new FormData()
      formData.append("file", file)

      // Upload to Cloudinary directly
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      if (!cloudName) {
        throw new Error("Cloudinary cloud name not configured")
      }

      // Add a unique identifier to prevent overwriting
      const timestamp = new Date().getTime()
      const publicId = `alexb_foods/${foodName.toLowerCase().replace(/\s+/g, "_")}_${timestamp}`

      formData.append("upload_preset", "alexb_foods")
      formData.append("public_id", publicId)

      console.log(`Uploading to Cloudinary with cloud name: ${cloudName}, public_id: ${publicId}`)

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Failed to upload image")
      }

      const data = await response.json()
      console.log(`Upload successful for ${foodName}, URL:`, data.secure_url)

      onImageUploaded(data.secure_url)

      toast({
        title: "Image uploaded",
        description: `Image for ${foodName} has been uploaded successfully.`,
      })
    } catch (error) {
      console.error(`Error uploading image for ${foodName}:`, error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the file input
      e.target.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isUploading}
        onClick={() => document.getElementById(`file-upload-${foodName}`)?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </>
        )}
      </Button>
      <input
        id={`file-upload-${foodName}`}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={isUploading}
      />
    </div>
  )
}
