"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import CustomerNavigation from "@/components/customer-navigation"
import CustomerProtectedRoute from "@/components/customer-protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import { useCustomerAuth } from "@/contexts/customer-auth-context"
import { useRouter } from "next/navigation"

interface OrderAdditionalItem {
  name: string
  price: number
  quantity: number
}

interface OrderItem {
  name: string
  price: number
  quantity: number
  notes?: string
  additionalItems?: OrderAdditionalItem[]
}

interface CustomerOrder {
  id: string
  items: OrderItem[]
  totalPrice: number
  status: "pending" | "accepted" | "declined" | "delivered"
  date: string
  time: string
  table: number
  createdAt?: any
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useCustomerAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      try {
        // Try a simpler query without ordering first
        const ordersRef = collection(db, "orders")
        const q = query(ordersRef, where("customerId", "==", user.uid))

        const querySnapshot = await getDocs(q)

        const ordersData: CustomerOrder[] = []
        querySnapshot.forEach((doc) => {
          ordersData.push({
            id: doc.id,
            ...(doc.data() as Omit<CustomerOrder, "id">),
          })
        })

        // Sort in memory by createdAt (descending)
        ordersData.sort((a, b) => {
          // If createdAt exists, use it for sorting
          if (a.createdAt && b.createdAt) {
            // Convert Firebase timestamps to milliseconds if needed
            const aTime = a.createdAt.toMillis ? a.createdAt.toMillis() : a.createdAt
            const bTime = b.createdAt.toMillis ? b.createdAt.toMillis() : b.createdAt
            return bTime - aTime
          }
          // Fallback to date/time string comparison
          if (a.date === b.date) {
            return b.time.localeCompare(a.time)
          }
          return b.date.localeCompare(a.date)
        })

        setOrders(ordersData)
      } catch (error) {
        console.error("Error fetching orders:", error)

        // Fallback method if the first query fails
        try {
          console.log("Trying fallback method to fetch orders...")
          // Get all orders for this user without any sorting
          const ordersRef = collection(db, "orders")
          const q = query(ordersRef, where("customerId", "==", user.uid))

          const querySnapshot = await getDocs(q)

          const ordersData: CustomerOrder[] = []
          querySnapshot.forEach((doc) => {
            ordersData.push({
              id: doc.id,
              ...(doc.data() as Omit<CustomerOrder, "id">),
            })
          })

          // Sort manually by date and time
          ordersData.sort((a, b) => {
            if (a.date === b.date) {
              return b.time.localeCompare(a.time)
            }
            return b.date.localeCompare(a.date)
          })

          setOrders(ordersData)
        } catch (fallbackError) {
          console.error("Fallback method also failed:", fallbackError)
          toast({
            title: "Error",
            description: "Failed to load your orders. Please try again later.",
            variant: "destructive",
          })
          setOrders([]) // Set empty array to avoid showing loading spinner indefinitely
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "accepted":
        return "bg-green-500"
      case "declined":
        return "bg-red-500"
      case "delivered":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <CustomerProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <CustomerNavigation />
        <main className="flex-1 p-4 md:p-6">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">Your Orders</h1>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>Order #{order.id.slice(0, 6)}</CardTitle>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.date} at {order.time} • Table {order.table}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Items</h3>
                          <ul className="space-y-3">
                            {order.items.map((item, index) => (
                              <li key={index} className="text-sm">
                                <div className="flex justify-between">
                                  <span>
                                    {item.quantity}x {item.name}
                                  </span>
                                  <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
                                </div>

                                {/* Display additional items */}
                                {item.additionalItems && item.additionalItems.length > 0 && (
                                  <div className="mt-1 pl-4 text-xs text-muted-foreground">
                                    {item.additionalItems.map((addItem, addIndex) => (
                                      <div key={addIndex} className="flex justify-between">
                                        <span>
                                          + {addItem.name} x{addItem.quantity}
                                        </span>
                                        <span>{(addItem.price * addItem.quantity).toLocaleString()} FCFA</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {item.notes && (
                                  <div className="text-xs text-muted-foreground mt-1 pl-4">Note: {item.notes}</div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>{order.totalPrice.toLocaleString()} FCFA</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-bold mb-2">No orders yet</h2>
                <p className="text-muted-foreground mb-6">You haven't placed any orders yet</p>
                <Button onClick={() => router.push("/customer/menu")}>Browse Menu</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </CustomerProtectedRoute>
  )
}
