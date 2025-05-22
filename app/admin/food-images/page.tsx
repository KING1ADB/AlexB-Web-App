"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { collection, query, getDocs, updateDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import ProtectedRoute from "@/components/protected-route"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

// Define a simple food interface
interface FoodItem {
  id: string
  name: string
  imageUrl?: string
}

export default function FoodImagesPage() {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const { toast } = useToast()

  // Create refs for file inputs
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Fetch unique food items from orders
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const ordersRef = collection(db, "orders")
        const q = query(ordersRef)
        const querySnapshot = await getDocs(q)

        // Create a map to track unique food items by name
        const foodMap = new Map<string, FoodItem>()

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.name && !foodMap.has(data.name)) {
            foodMap.set(data.name, {
              id: doc.id, // Using the first order ID as a reference
              name: data.name,
              imageUrl: data.imageUrl || "",
            })
          }
        })

        const foodsList = Array.from(foodMap.values())
        console.log("Fetched foods:", foodsList)
        setFoods(foodsList)
      } catch (error) {
        console.error("Error fetching foods:", error)
        toast({
          title: "Error",
          description: "Failed to load food items",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFoods()
  }, [toast])

  // Handle button click to trigger file input
  const handleUploadClick = (foodName: string) => {
    console.log(`Upload button clicked for ${foodName}`)
    const fileInput = fileInputRefs.current[foodName]
    if (fileInput) {
      fileInput.click()
    } else {
      console.error(`File input ref not found for ${foodName}`)
    }
  }

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, food: FoodItem) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(food.name)
      console.log(`Starting upload for ${food.name}`)

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
      const publicId = `alexb_foods/${food.name.toLowerCase().replace(/\s+/g, "_")}_${timestamp}`

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
      const imageUrl = data.secure_url
      console.log(`Upload successful for ${food.name}, URL:`, imageUrl)

      // Update all orders with this food name
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("name", "==", food.name))
      const querySnapshot = await getDocs(q)

      console.log(`Found ${querySnapshot.size} orders with food name: ${food.name}`)

      const updatePromises = querySnapshot.docs.map((doc) => {
        console.log(`Updating order ${doc.id} with new image URL`)
        return updateDoc(doc.ref, { imageUrl })
      })

      await Promise.all(updatePromises)
      console.log(`Successfully updated all orders for ${food.name}`)

      // Update the food item in our state
      setFoods(foods.map((f) => (f.name === food.name ? { ...f, imageUrl } : f)))

      toast({
        title: "Image uploaded",
        description: `Image for ${food.name} has been uploaded successfully.`,
      })
    } catch (error) {
      console.error(`Error uploading image for ${food.name}:`, error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(null)
      // Reset the file input
      if (fileInputRefs.current[food.name]) {
        fileInputRefs.current[food.name]!.value = ""
      }
    }
  }

  // Force image refresh by adding a cache-busting parameter
  const getImageSrc = (imageUrl?: string) => {
    if (!imageUrl) return "/placeholder.svg?height=200&width=400"

    // Add a timestamp to force refresh
    const cacheBuster = `t=${Date.now()}`
    const separator = imageUrl.includes("?") ? "&" : "?"

    return `${imageUrl}${separator}${cacheBuster}`
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Food Images</h1>
            <p className="text-muted-foreground">Upload and manage food images for your menu</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {foods.map((food) => (
                <Card key={food.name}>
                  <CardHeader>
                    <CardTitle>{food.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-48 mb-4 bg-muted rounded-md overflow-hidden">
                      {food.imageUrl ? (
                        <Image
                          src={getImageSrc(food.imageUrl) || "/placeholder.svg"}
                          alt={food.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No image available
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Hidden file input */}
                      <input
                        ref={(el) => (fileInputRefs.current[food.name] = el)}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, food)}
                        disabled={uploading === food.name}
                      />

                      {/* Direct button instead of label */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={uploading === food.name}
                        onClick={() => handleUploadClick(food.name)}
                      >
                        {uploading === food.name ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image for {food.name}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
