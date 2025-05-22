"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import CustomerNavigation from "@/components/customer-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowRight, ShoppingBag, UtensilsCrossed } from "lucide-react"
import { getAvailableFoods, FOOD_CATEGORIES } from "@/lib/food-service"
import { useCustomerAuth } from "@/contexts/customer-auth-context"
import FeaturedFoodCard from "@/components/featured-food-card"
import type { Food } from "@/lib/food-service"

export default function CustomerHomePage() {
  const [featuredFoods, setFeaturedFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { profile } = useCustomerAuth()

  useEffect(() => {
    const fetchFeaturedFoods = async () => {
      try {
        const foods = await getAvailableFoods()
        // Get a random selection of foods to feature
        const randomFoods = foods.sort(() => 0.5 - Math.random()).slice(0, 6)
        setFeaturedFoods(randomFoods)
      } catch (error) {
        console.error("Error fetching featured foods:", error)
        toast({
          title: "Error",
          description: "Failed to load featured menu items. Please try again later.",
          variant: "destructive",
        })
        // Set empty array to avoid showing loading spinner indefinitely
        setFeaturedFoods([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedFoods()
  }, [toast])

  return (
    <div className="flex min-h-screen flex-col">
      <CustomerNavigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[500px] flex items-center">
          <div className="absolute inset-0 z-0">
            <video
              src="/AlexB.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="object-cover brightness-50 w-full h-full absolute"
            />

          </div>
          <div className="container relative z-10 mx-auto px-4 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to AlexB Restaurant</h1>
            <p className="text-xl mb-8 max-w-2xl">
              Experience the finest dining with our delicious menu and robot delivery service.
            </p>
            {profile ? <p className="text-lg mb-6">Welcome back, {profile.name}!</p> : null}
            <Button asChild size="lg">
              <Link href="/customer/menu">
                View Our Menu
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Featured Foods Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Menu Items</h2>
              <Button asChild variant="outline">
                <Link href="/customer/menu">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : featuredFoods.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredFoods.map((food) => (
                  <FeaturedFoodCard key={food.id} food={food} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No featured items available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Browse by Category</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FOOD_CATEGORIES.map((category) => (
                <Link key={category} href={`/customer/menu?category=${category}`}>
                  <Card className="hover:shadow-md transition-shadow h-40 flex items-center justify-center">
                    <CardContent className="text-center p-6">
                      <h3 className="text-xl font-bold mb-2">{category}</h3>
                      <Button variant="outline">Browse {category}</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Browse & Order</h3>
                <p className="text-muted-foreground">Browse our menu and add your favorite items to your cart</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Chef Prepares</h3>
                <p className="text-muted-foreground">Our chef prepares your order with the freshest ingredients</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 4.5V6.5M19.5 12H17.5M12 17.5V19.5M6.5 12H4.5M16.5 7.5L15 9M7.5 16.5L9 15M7.5 7.5L9 9M16.5 16.5L15 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">3. Robot Delivers</h3>
                <p className="text-muted-foreground">AlexB robot delivers your order right to your table</p>
              </div>
            </div>
          </div>
        </section>
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
