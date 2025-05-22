"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { AdditionalItem } from "@/lib/food-service"

interface AdditionalItemsPreviewProps {
  items: AdditionalItem[]
}

export default function AdditionalItemsPreview({ items }: AdditionalItemsPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="mt-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{items.length} Additional Items</span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isExpanded && (
        <div className="mt-2 space-y-1 text-sm border rounded-md p-2 bg-muted/20">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name}</span>
              <span>{item.price.toLocaleString()} FCFA</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
