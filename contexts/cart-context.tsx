"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Food, AdditionalItem } from "@/lib/food-service"

export interface SelectedAdditionalItem extends AdditionalItem {
  quantity: number
}

export interface CartItem {
  food: Food
  quantity: number
  notes?: string
  selectedAdditionalItems: SelectedAdditionalItem[]
}

interface CartContextType {
  items: CartItem[]
  addToCart: (food: Food, quantity?: number, notes?: string, selectedAdditionalItems?: SelectedAdditionalItem[]) => void
  removeFromCart: (foodId: string) => void
  updateQuantity: (foodId: string, quantity: number) => void
  updateNotes: (foodId: string, notes: string) => void
  updateAdditionalItems: (foodId: string, selectedAdditionalItems: SelectedAdditionalItem[]) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  getItemTotal: (item: CartItem) => number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  updateNotes: () => {},
  updateAdditionalItems: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  getItemTotal: () => 0,
})

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("alexb-cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error parsing saved cart:", error)
        localStorage.removeItem("alexb-cart")
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("alexb-cart", JSON.stringify(items))
  }, [items])

  // Calculate the total price for a single cart item including additional items
  const getItemTotal = (item: CartItem): number => {
    const basePrice = item.food.price * item.quantity
    const additionalItemsPrice = item.selectedAdditionalItems.reduce(
      (total, addItem) => total + addItem.price * addItem.quantity,
      0,
    )
    return basePrice + additionalItemsPrice
  }

  const addToCart = (food: Food, quantity = 1, notes = "", selectedAdditionalItems: SelectedAdditionalItem[] = []) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.food.id === food.id)

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          notes: notes || updatedItems[existingItemIndex].notes,
          // If new additional items are provided, use them, otherwise keep existing ones
          selectedAdditionalItems:
            selectedAdditionalItems.length > 0
              ? selectedAdditionalItems
              : updatedItems[existingItemIndex].selectedAdditionalItems,
        }
        return updatedItems
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            food,
            quantity,
            notes,
            selectedAdditionalItems,
          },
        ]
      }
    })
  }

  const removeFromCart = (foodId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.food.id !== foodId))
  }

  const updateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.food.id === foodId ? { ...item, quantity } : item)))
  }

  const updateNotes = (foodId: string, notes: string) => {
    setItems((prevItems) => prevItems.map((item) => (item.food.id === foodId ? { ...item, notes } : item)))
  }

  const updateAdditionalItems = (foodId: string, selectedAdditionalItems: SelectedAdditionalItem[]) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.food.id === foodId ? { ...item, selectedAdditionalItems } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  const totalPrice = items.reduce((total, item) => total + getItemTotal(item), 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
        updateAdditionalItems,
        clearCart,
        totalItems,
        totalPrice,
        getItemTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
