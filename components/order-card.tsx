"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { type Order, useOrders } from "@/contexts/order-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface OrderCardProps {
  order: Order
  showActions?: boolean
}

export default function OrderCard({ order, showActions = true }: OrderCardProps) {
  const { acceptOrder, declineOrder } = useOrders()
  const { toast } = useToast()
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)

  const handleAccept = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAccepting(true)
    try {
      await acceptOrder(order.id)
      toast({
        title: "Order Accepted",
        description: `Order #${order.id.slice(0, 4)} has been accepted.`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDeclining(true)
    try {
      await declineOrder(order.id)
      toast({
        title: "Order Declined",
        description: `Order #${order.id.slice(0, 4)} has been declined.`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeclining(false)
    }
  }

  const getOrderNumber = () => {
    return order.id.slice(0, 4).toUpperCase()
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
    <Link href={`/order/${order.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          {/* Add food image thumbnail */}
          <div className="relative w-full h-32">
            <Image
              src={getImageSrc(order.imageUrl) || "/placeholder.svg"}
              alt={order.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">#{getOrderNumber()}</span>
                <h3 className="font-semibold">{order.name}</h3>
              </div>
              <span
                className={`text-sm ${
                  order.status === "pending"
                    ? "text-yellow-500"
                    : order.status === "accepted"
                      ? "text-green-500"
                      : order.status === "declined"
                        ? "text-red-500"
                        : "text-blue-500"
                }`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{order.date}</span>
              <span>{order.time}</span>
            </div>

            <div className="text-sm font-medium text-primary">Table {order.table}</div>
          </div>

          {showActions && order.status === "pending" && (
            <div className="flex border-t">
              <Button
                className="flex-1 rounded-none bg-green-500 hover:bg-green-600 text-white h-10"
                onClick={handleAccept}
                disabled={isAccepting || isDeclining}
              >
                {isAccepting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
              </Button>
              <Button
                className="flex-1 rounded-none bg-red-500 hover:bg-red-600 text-white h-10"
                onClick={handleDecline}
                disabled={isAccepting || isDeclining}
              >
                {isDeclining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Decline"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
