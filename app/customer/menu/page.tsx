"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Search, UtensilsCrossed } from "lucide-react"
import { getAvailableFoods, FOOD_CATEGORIES } from "@/lib/food-service"
import CustomerNavigation from "@/components/customer-navigation"
import FoodCardWithAddOns from "@/components/food-card-with-add-ons"
import type { Food } from "@/lib/food-service"

export default function CustomerMenuPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    const category = searchParams.get("category")
    if (category && FOOD_CATEGORIES.includes(category)) {
      setActiveCategory(category)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const foodsList = await getAvailableFoods()
        setFoods(foodsList)
        setFilteredFoods(foodsList)
      } catch (error) {
        console.error("Error fetching foods:", error)
        toast({
          title: "Error",
          description: "Failed to load menu items. Please try again later.",
          variant: "destructive",
        })
        // Set empty arrays to avoid showing loading spinner indefinitely
        setFoods([])
        setFilteredFoods([])
      } finally {
        setLoading(false)
      }
    }

    fetchFoods()
  }, [toast])

  useEffect(() => {
    // Filter foods based on search query and active category
    let result = foods

    if (searchQuery) {
      result = result.filter(
        (food) =>
          food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          food.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (activeCategory !== "All") {
      result = result.filter((food) => food.category === activeCategory)
    }

    setFilteredFoods(result)
  }, [foods, searchQuery, activeCategory])

  return (
    <div className="flex min-h-screen flex-col">
      <CustomerNavigation />
      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Our Menu</h1>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for food..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Tabs */}
          <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="mb-6">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="All">All</TabsTrigger>
              {FOOD_CATEGORIES.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeCategory}>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredFoods.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFoods.map((food) => (
                    <FoodCardWithAddOns key={food.id} food={food} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No items found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : `No items available in ${activeCategory === "All" ? "any category" : activeCategory}`}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} AlexB Restaurant. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
