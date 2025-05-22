"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash, Plus } from "lucide-react"
import type { AdditionalItem } from "@/lib/food-service"

interface AdditionalItemsManagerProps {
  items: AdditionalItem[]
  onChange: (items: AdditionalItem[]) => void
}

export default function AdditionalItemsManager({ items, onChange }: AdditionalItemsManagerProps) {
  const [newItemName, setNewItemName] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")

  const handleAddItem = () => {
    if (!newItemName || !newItemPrice) return

    const newItem: AdditionalItem = {
      id: Date.now().toString(), // Generate a unique ID
      name: newItemName,
      price: Number(newItemPrice),
    }

    onChange([...items, newItem])
    setNewItemName("")
    setNewItemPrice("")
  }

  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const handleUpdateItem = (id: string, field: keyof AdditionalItem, value: string | number) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Additional Items</Label>
      </div>

      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-2 items-center">
              <Input
                placeholder="Item name"
                value={item.name}
                onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                className="flex-1"
              />
              <div className="w-32">
                <Input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => handleUpdateItem(item.id, "price", Number(e.target.value))}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(item.id)}
                className="text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label htmlFor="new-item-name" className="text-sm">
            Item Name
          </Label>
          <Input
            id="new-item-name"
            placeholder="e.g. Extra Cheese"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </div>
        <div className="w-32">
          <Label htmlFor="new-item-price" className="text-sm">
            Price
          </Label>
          <Input
            id="new-item-price"
            type="number"
            placeholder="Price"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
          />
        </div>
        <Button type="button" onClick={handleAddItem} className="flex-shrink-0">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  )
}
