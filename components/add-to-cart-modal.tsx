"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ShoppingBag, Plus, Minus } from "lucide-react"
import { useCart, type SelectedAdditionalItem } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import type { Food } from "@/lib/food-service"
import AdditionalItemsSelector from "./additional-items-selector"

interface AddToCartModalProps {
  food: Food
  isOpen: boolean
  onClose: () => void
}

export default function AddToCartModal({ food, isOpen, onClose }: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [selectedAdditionalItems, setSelectedAdditionalItems] = useState<SelectedAdditionalItem[]>([])
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = () => {
    addToCart(food, quantity, notes, selectedAdditionalItems)
    toast({
      title: "Added to Cart",
      description: `${food.name} has been added to your cart`,
    })
    resetAndClose()
  }

  const resetAndClose = () => {
    setQuantity(1)
    setNotes("")
    setSelectedAdditionalItems([])
    onClose()
  }

  const calculateTotal = () => {
    const basePrice = food.price * quantity
    const additionalItemsPrice = selectedAdditionalItems.reduce((total, item) => total + item.price * item.quantity, 0)
    return basePrice + additionalItemsPrice
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{food.name}</DialogTitle>
          <DialogDescription>{food.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <Label>Base Price:</Label>
            <span className="font-medium">{food.price.toLocaleString()} FCFA</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                className="w-16 mx-2 text-center"
                min="1"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {food.additionalItems && food.additionalItems.length > 0 && (
            <AdditionalItemsSelector
              availableItems={food.additionalItems}
              selectedItems={selectedAdditionalItems}
              onChange={setSelectedAdditionalItems}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Label className="text-lg">Total:</Label>
            <span className="text-lg font-bold">{calculateTotal().toLocaleString()} FCFA</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button onClick={handleAddToCart}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
