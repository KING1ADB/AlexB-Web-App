"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import { getFoodById, updateFood, FOOD_CATEGORIES, type AdditionalItem } from "@/lib/food-service"
import DirectImageUploader from "@/components/direct-image-uploader"
import AdditionalItemsManager from "@/components/additional-items-manager"

export default function EditFoodPage() {
  const params = useParams()
  const foodId = params.id as string

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [preparationTime, setPreparationTime] = useState("")
  const [available, setAvailable] = useState(true)
  const [imageUrl, setImageUrl] = useState("")
  const [additionalItems, setAdditionalItems] = useState<AdditionalItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const food = await getFoodById(foodId)
        if (food) {
          setName(food.name)
          setDescription(food.description)
          setPrice(food.price.toString())
          setCategory(food.category)
          setPreparationTime(food.preparationTime || "")
          setAvailable(food.available)
          setImageUrl(food.imageUrl || "")
          setAdditionalItems(food.additionalItems || [])
        } else {
          toast({
            title: "Food Not Found",
            description: "The food item you're trying to edit doesn't exist",
            variant: "destructive",
          })
          router.push("/admin/menu")
        }
      } catch (error) {
        console.error("Error fetching food:", error)
        toast({
          title: "Error",
          description: "Failed to load food details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFood()
  }, [foodId, toast, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !price || !category) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const updatedFood = {
        name,
        description,
        price: Number(price),
        category,
        preparationTime,
        available,
        imageUrl: imageUrl || undefined,
        additionalItems: additionalItems.length > 0 ? additionalItems : undefined,
      }

      await updateFood(foodId, updatedFood)

      toast({
        title: "Food Updated",
        description: "The food item has been updated successfully",
      })

      router.push("/admin/menu")
    } catch (error) {
      console.error("Error updating food:", error)
      toast({
        title: "Error",
        description: "Failed to update food item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUploaded = (url: string) => {
    setImageUrl(url)
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1 p-4 md:p-6 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-1 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Edit Food</h1>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Food Details</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (FCFA) *</Label>
                  <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {FOOD_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preparationTime">Preparation Time</Label>
                  <Input
                    id="preparationTime"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                    placeholder="e.g. 15-20 min"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="available" checked={available} onCheckedChange={setAvailable} />
                  <Label htmlFor="available">Available</Label>
                </div>

                <div className="space-y-2">
                  <Label>Food Image</Label>
                  {imageUrl ? (
                    <div className="relative h-48 w-full mb-4">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={name}
                        className="w-full h-full object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setImageUrl("")}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-48 bg-muted rounded-md mb-4">
                      <p className="text-muted-foreground">No image uploaded</p>
                    </div>
                  )}
                  <DirectImageUploader foodName={name || "edit-food"} onImageUploaded={handleImageUploaded} />
                </div>

                {/* Additional Items Manager */}
                <AdditionalItemsManager items={additionalItems} onChange={setAdditionalItems} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Update Food"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
