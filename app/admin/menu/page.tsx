"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import ProtectedRoute from "@/components/protected-route"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Edit, Trash, ImageIcon } from "lucide-react"
import { getAllFoods, toggleFoodAvailability, deleteFood, type Food, FOOD_CATEGORIES } from "@/lib/food-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdditionalItemsPreview from "@/components/additional-items-preview"

export default function MenuManagementPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const foodsList = await getAllFoods()
        setFoods(foodsList)
      } catch (error) {
        console.error("Error fetching foods:", error)
        toast({
          title: "Error",
          description: "Failed to load menu items. You may need to create a Firestore index.",
          variant: "destructive",
        })
        // Set empty array to avoid showing loading spinner indefinitely
        setFoods([])
      } finally {
        setLoading(false)
      }
    }

    fetchFoods()
  }, [toast])

  const handleToggleAvailability = async (id: string, currentAvailability: boolean) => {
    try {
      setToggling(id)
      await toggleFoodAvailability(id, !currentAvailability)

      // Update local state
      setFoods(foods.map((food) => (food.id === id ? { ...food, available: !currentAvailability } : food)))

      toast({
        title: "Availability Updated",
        description: `Food is now ${!currentAvailability ? "available" : "unavailable"}`,
      })
    } catch (error) {
      console.error("Error toggling availability:", error)
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      })
    } finally {
      setToggling(null)
    }
  }

  const handleDeleteFood = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return
    }

    try {
      setDeleting(id)
      await deleteFood(id)

      // Update local state
      setFoods(foods.filter((food) => food.id !== id))

      toast({
        title: "Food Deleted",
        description: "The food item has been deleted from the menu",
      })
    } catch (error) {
      console.error("Error deleting food:", error)
      toast({
        title: "Error",
        description: "Failed to delete food item",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleAddFood = () => {
    router.push("/admin/menu/add")
  }

  const handleEditFood = (id: string) => {
    router.push(`/admin/menu/edit/${id}`)
  }

  // Group foods by category
  const foodsByCategory = FOOD_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = foods.filter((food) => food.category === category)
      return acc
    },
    {} as Record<string, Food[]>,
  )

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-1 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Menu Management</h1>
              <p className="text-muted-foreground">Add, edit, and manage food items on your menu</p>
            </div>
            <Button onClick={handleAddFood} className="mt-4 md:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              Add New Food
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="All">
              <TabsList className="mb-6">
                <TabsTrigger value="All">All</TabsTrigger>
                {FOOD_CATEGORIES.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="All">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {foods.length > 0 ? (
                    foods.map((food) => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        onToggleAvailability={handleToggleAvailability}
                        onEdit={handleEditFood}
                        onDelete={handleDeleteFood}
                        isToggling={toggling === food.id}
                        isDeleting={deleting === food.id}
                      />
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center h-64 text-center">
                      <h3 className="text-lg font-medium">No food items found</h3>
                      <p className="text-muted-foreground mt-1">Add your first food item to get started</p>
                      <Button onClick={handleAddFood} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Food Item
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {FOOD_CATEGORIES.map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {foodsByCategory[category]?.length > 0 ? (
                      foodsByCategory[category].map((food) => (
                        <FoodCard
                          key={food.id}
                          food={food}
                          onToggleAvailability={handleToggleAvailability}
                          onEdit={handleEditFood}
                          onDelete={handleDeleteFood}
                          isToggling={toggling === food.id}
                          isDeleting={deleting === food.id}
                        />
                      ))
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center h-64 text-center">
                        <h3 className="text-lg font-medium">No {category.toLowerCase()} found</h3>
                        <p className="text-muted-foreground mt-1">Add your first {category.toLowerCase()} item</p>
                        <Button onClick={handleAddFood} className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Add {category} Item
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}

interface FoodCardProps {
  food: Food
  onToggleAvailability: (id: string, currentAvailability: boolean) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  isToggling: boolean
  isDeleting: boolean
}

function FoodCard({ food, onToggleAvailability, onEdit, onDelete, isToggling, isDeleting }: FoodCardProps) {
  return (
    <Card>
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          {food.imageUrl ? (
            <Image
              src={food.imageUrl || "/placeholder.svg"}
              alt={food.name}
              fill
              className="object-cover rounded-t-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted rounded-t-lg">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <Badge className={`absolute top-2 right-2 ${food.available ? "bg-green-500" : "bg-red-500"}`}>
            {food.available ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <CardTitle>{food.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{food.description}</p>
          </div>
          <div className="text-lg font-bold">{food.price.toLocaleString()} FCFA</div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="outline">{food.category}</Badge>
          {food.preparationTime && <Badge variant="outline">{food.preparationTime}</Badge>}
        </div>

        {/* Show additional items preview */}
        {food.additionalItems && food.additionalItems.length > 0 && (
          <AdditionalItemsPreview items={food.additionalItems} />
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Switch
              id={`available-${food.id}`}
              checked={food.available}
              onCheckedChange={() => onToggleAvailability(food.id!, food.available)}
              disabled={isToggling}
            />
            <Label htmlFor={`available-${food.id}`}>
              {isToggling ? <Loader2 className="h-4 w-4 animate-spin" /> : food.available ? "Available" : "Unavailable"}
            </Label>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(food.id!)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onDelete(food.id!)} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
