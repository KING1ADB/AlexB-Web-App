"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "./auth-context"

export interface AdditionalItem {
  name: string
  qty: number
}

export interface Order {
  id: string
  name: string
  description: string
  price: number
  table: number
  status: "pending" | "accepted" | "declined" | "delivered"
  date: string
  time: string
  duration: string
  rating: string
  imageUrl?: string // Add this field for food images
  additionalItems: AdditionalItem[]
}

interface OrderContextType {
  orders: Order[]
  pendingOrders: Order[]
  acceptedOrders: Order[]
  declinedOrders: Order[]
  loading: boolean
  error: string | null
  acceptOrder: (orderId: string) => Promise<void>
  declineOrder: (orderId: string) => Promise<void>
  confirmDelivery: (orderId: string) => Promise<void>
  getOrderById: (orderId: string) => Order | undefined
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  pendingOrders: [],
  acceptedOrders: [],
  declinedOrders: [],
  loading: true,
  error: null,
  acceptOrder: async () => {},
  declineOrder: async () => {},
  confirmDelivery: async () => {},
  getOrderById: () => undefined,
})

export const useOrders = () => useContext(OrderContext)

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const ordersRef = collection(db, "orders")

    // Use a simpler query that doesn't require a composite index
    // Just order by one field instead of two
    const ordersQuery = query(ordersRef, orderBy("date", "desc"))

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData: Order[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()

          // Transform additionalItems from Firebase format to our app format
          const additionalItems: AdditionalItem[] = []
          if (data.additionalItems) {
            Object.keys(data.additionalItems).forEach((key) => {
              const item = data.additionalItems[key]
              if (item.name && item.qty !== undefined) {
                additionalItems.push({
                  name: item.name,
                  qty: item.qty,
                })
              }
            })
          }

          ordersData.push({
            id: doc.id,
            name: data.name || "",
            description: data.description || "",
            price: data.price || 0,
            table: data.table || 0,
            status: data.status || "pending",
            date: data.date || "",
            time: data.time || "",
            duration: data.duration || "",
            rating: data.rating || "",
            imageUrl: data.imageUrl || "", // Add this line to get the image URL
            additionalItems,
          })
        })

        // Sort by time after fetching if needed
        ordersData.sort((a, b) => {
          // First sort by date (already done by Firestore)
          // Then sort by time for same dates
          if (a.date === b.date) {
            return b.time.localeCompare(a.time) // Descending time
          }
          return 0 // Keep the date ordering from Firestore
        })

        setOrders(ordersData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching orders:", error)

        // Check if it's an index error and provide more helpful message
        if (error.message && error.message.includes("index")) {
          setError(
            "This query requires a Firestore index. Please check the console for a link to create it, or contact your administrator.",
          )
        } else {
          setError("Failed to fetch orders. Please try again.")
        }

        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  const pendingOrders = orders.filter((order) => order.status === "pending")
  const acceptedOrders = orders.filter((order) => order.status === "accepted")
  const declinedOrders = orders.filter((order) => order.status === "declined")

  const updateOrderStatus = async (orderId: string, status: "accepted" | "declined" | "delivered") => {
    try {
      const orderRef = doc(db, "orders", orderId)
      await updateDoc(orderRef, { status })
    } catch (error) {
      console.error(`Error updating order status to ${status}:`, error)
      throw new Error(`Failed to update order status to ${status}`)
    }
  }

  const acceptOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "accepted")
  }

  const declineOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "declined")
  }

  const confirmDelivery = async (orderId: string) => {
    await updateOrderStatus(orderId, "delivered")
  }

  const getOrderById = (orderId: string) => {
    return orders.find((order) => order.id === orderId)
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        pendingOrders,
        acceptedOrders,
        declinedOrders,
        loading,
        error,
        acceptOrder,
        declineOrder,
        confirmDelivery,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}
