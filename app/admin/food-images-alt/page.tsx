"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs, updateDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import ProtectedRoute from "@/components/protected-route"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import DirectImageUploader from "@/components/direct-image-uploader"

// Define a simple food interface
interface FoodItem {
  id: string
  name: string
  imageUrl?: string
}

export default function FoodImagesAltPage() {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

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

  // Handle image upload completion
  const handleImageUploaded = async (foodName: string, imageUrl: string) => {
    try {
      console.log(`Image uploaded for ${foodName}, updating orders...`)

      // Update all orders with this food name
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("name", "==", foodName))
      const querySnapshot = await getDocs(q)

      console.log(`Found ${querySnapshot.size} orders with food name: ${foodName}`)

      const updatePromises = querySnapshot.docs.map((doc) => {
        console.log(`Updating order ${doc.id} with new image URL`)
        return updateDoc(doc.ref, { imageUrl })
      })

      await Promise.all(updatePromises)
      console.log(`Successfully updated all orders for ${foodName}`)

      // Update the food item in our state
      setFoods(foods.map((f) => (f.name === foodName ? { ...f, imageUrl } : f)))

      toast({
        title: "Orders updated",
        description: `All orders for ${foodName} have been updated with the new image.`,
      })
    } catch (error) {
      console.error(`Error updating orders for ${foodName}:`, error)
      toast({
        title: "Update failed",
        description: "Failed to update orders with the new image. Please try again.",
        variant: "destructive",
      })
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
            <h1 className="text-2xl font-bold tracking-tight">Food Images (Alternative)</h1>
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

                    <DirectImageUploader
                      foodName={food.name}
                      onImageUploaded={(url) => handleImageUploaded(food.name, url)}
                    />
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
