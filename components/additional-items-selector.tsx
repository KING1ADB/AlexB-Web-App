"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus, Minus } from "lucide-react"
import type { AdditionalItem } from "@/lib/food-service"
import type { SelectedAdditionalItem } from "@/contexts/cart-context"

interface AdditionalItemsSelectorProps {
  availableItems: AdditionalItem[]
  selectedItems: SelectedAdditionalItem[]
  onChange: (items: SelectedAdditionalItem[]) => void
}

export default function AdditionalItemsSelector({
  availableItems,
  selectedItems,
  onChange,
}: AdditionalItemsSelectorProps) {
  const [selections, setSelections] = useState<SelectedAdditionalItem[]>(selectedItems)

  // Update local state when props change
  useEffect(() => {
    setSelections(selectedItems)
  }, [selectedItems])

  const handleToggleItem = (item: AdditionalItem, isChecked: boolean) => {
    if (isChecked) {
      // Add item with quantity 1
      const newItem: SelectedAdditionalItem = {
        ...item,
        quantity: 1,
      }
      const newSelections = [...selections, newItem]
      setSelections(newSelections)
      onChange(newSelections)
    } else {
      // Remove item
      const newSelections = selections.filter((selected) => selected.id !== item.id)
      setSelections(newSelections)
      onChange(newSelections)
    }
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      const newSelections = selections.filter((item) => item.id !== id)
      setSelections(newSelections)
      onChange(newSelections)
      return
    }

    // Update quantity
    const newSelections = selections.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    setSelections(newSelections)
    onChange(newSelections)
  }

  const isItemSelected = (id: string) => {
    return selections.some((item) => item.id === id)
  }

  const getItemQuantity = (id: string) => {
    const item = selections.find((item) => item.id === id)
    return item ? item.quantity : 0
  }

  if (availableItems.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 mt-4">
      <h4 className="font-medium">Additional Items</h4>
      <div className="space-y-2">
        {availableItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`item-${item.id}`}
                checked={isItemSelected(item.id)}
                onCheckedChange={(checked) => handleToggleItem(item, checked === true)}
              />
              <Label htmlFor={`item-${item.id}`} className="cursor-pointer">
                {item.name} - {item.price.toLocaleString()} FCFA
              </Label>
            </div>
            {isItemSelected(item.id) && (
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-r-none"
                  onClick={() => handleQuantityChange(item.id, getItemQuantity(item.id) - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={getItemQuantity(item.id)}
                  onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 0)}
                  className="h-7 w-12 rounded-none text-center p-0 border-x-0"
                  min="0"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-l-none"
                  onClick={() => handleQuantityChange(item.id, getItemQuantity(item.id) + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
