import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"
import type { CartItem } from "@/contexts/cart-context"

export interface OrderItem {
  name: string
  price: number
  quantity: number
  notes?: string
  imageUrl?: string
  additionalItems?: {
    name: string
    price: number
    quantity: number
  }[]
}

export interface CustomerOrder {
  customerId: string
  customerName: string
  customerEmail: string
  table: number
  items: OrderItem[]
  totalPrice: number
  status: "pending" | "accepted" | "declined" | "delivered"
  date: string
  time: string
  createdAt: any // Firestore timestamp
}

export async function placeOrder(
  customerId: string,
  customerName: string,
  customerEmail: string,
  table: number,
  cartItems: CartItem[],
): Promise<string> {
  try {
    // Format date and time
    const now = new Date()
    const date = now.toLocaleDateString()
    const time = now.toLocaleTimeString()

    // Calculate total price including additional items
    const totalPrice = cartItems.reduce((total, item) => {
      const basePrice = item.food.price * item.quantity
      const additionalItemsPrice = item.selectedAdditionalItems.reduce(
        (sum, addItem) => sum + addItem.price * addItem.quantity,
        0,
      )
      return total + basePrice + additionalItemsPrice
    }, 0)

    // Format items for Firestore
    const items = cartItems.map((item) => ({
      name: item.food.name,
      price: item.food.price,
      quantity: item.quantity,
      notes: item.notes,
      imageUrl: item.food.imageUrl,
      additionalItems: item.selectedAdditionalItems.map((addItem) => ({
        name: addItem.name,
        price: addItem.price,
        quantity: addItem.quantity,
      })),
    }))

    // Create order object
    const order: Omit<CustomerOrder, "createdAt"> & { createdAt: any } = {
      customerId,
      customerName,
      customerEmail,
      table,
      items,
      totalPrice,
      status: "pending",
      date,
      time,
      createdAt: serverTimestamp(),
      // Add these fields to match your existing order structure
      duration: "30-45 min",
      rating: "4.5",
      description: items.map((item) => item.name).join(", "),
      // Map the first item as the main order item for compatibility
      name: items[0]?.name || "Unknown",
      price: totalPrice,
      imageUrl: items[0]?.imageUrl || "",
      additionalItems: items.slice(1).map((item) => ({
        name: item.name,
        qty: item.quantity,
      })),
    }

    // Add to Firestore
    const ordersRef = collection(db, "orders")
    const docRef = await addDoc(ordersRef, order)

    return docRef.id
  } catch (error) {
    console.error("Error placing order:", error)
    throw error
  }
}

export async function getCustomerOrders(customerId: string) {
  // Implementation for getting customer orders history
  // This would be added later
}
