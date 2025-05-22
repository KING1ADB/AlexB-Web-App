"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ShoppingBag, UtensilsCrossed, ChevronDown, ChevronUp } from "lucide-react"
import { useCart, type SelectedAdditionalItem } from "@/contexts/cart-context"
import type { Food, AdditionalItem } from "@/lib/food-service"

interface FoodCardWithAddOnsProps {
  food: Food
}

export default function FoodCardWithAddOns({ food }: FoodCardWithAddOnsProps) {
  const [showAddOns, setShowAddOns] = useState(false)
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAdditionalItem[]>([])
  const { addToCart } = useCart()
  const { toast } = useToast()

  const toggleAddOn = (item: AdditionalItem, isChecked: boolean) => {
    if (isChecked) {
      setSelectedAddOns([...selectedAddOns, { ...item, quantity: 1 }])
    } else {
      setSelectedAddOns(selectedAddOns.filter((addOn) => addOn.id !== item.id))
    }
  }

  const isSelected = (id: string) => {
    return selectedAddOns.some((item) => item.id === id)
  }

  const handleAddToCart = () => {
    addToCart(food, 1, "", selectedAddOns)
    toast({
      title: "Added to Cart",
      description: `${food.name} has been added to your cart`,
    })
    setSelectedAddOns([])
  }

  const calculateTotal = () => {
    const basePrice = food.price
    const addOnsPrice = selectedAddOns.reduce((total, item) => total + item.price, 0)
    return basePrice + addOnsPrice
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        {food.imageUrl ? (
          <Image
            src={food.imageUrl || "/placeholder.svg"}
            alt={food.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <Badge className="absolute top-2 right-2">{food.category}</Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{food.name}</h3>
          <span className="font-bold">{food.price.toLocaleString()} FCFA</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{food.description}</p>

        {food.additionalItems && food.additionalItems.length > 0 && (
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full flex justify-between items-center"
              onClick={() => setShowAddOns(!showAddOns)}
            >
              <span>Additional Items</span>
              {showAddOns ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showAddOns && (
              <div className="mt-2 space-y-2 border rounded-md p-3 bg-muted/20">
                {food.additionalItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`addon-${item.id}`}
                        checked={isSelected(item.id)}
                        onCheckedChange={(checked) => toggleAddOn(item, checked === true)}
                      />
                      <Label htmlFor={`addon-${item.id}`} className="text-sm cursor-pointer">
                        {item.name}
                      </Label>
                    </div>
                    <span className="text-sm">{item.price.toLocaleString()} FCFA</span>
                  </div>
                ))}

                {selectedAddOns.length > 0 && (
                  <div className="pt-2 mt-2 border-t">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total:</span>
                      <span>{calculateTotal().toLocaleString()} FCFA</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <Button onClick={handleAddToCart} className="w-full">
          <ShoppingBag className="mr-2 h-4 w-4" />
          {selectedAddOns.length > 0 ? `Add to Cart (${calculateTotal().toLocaleString()} FCFA)` : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  )
}
