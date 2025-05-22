"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import CustomerNavigation from "@/components/customer-navigation"
import CustomerProtectedRoute from "@/components/customer-protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Trash, ShoppingBag, ArrowLeft, Plus, Minus } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useCustomerAuth } from "@/contexts/customer-auth-context"
import { placeOrder } from "@/lib/customer-order-service"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, updateNotes, clearCart, totalItems, totalPrice, getItemTotal } =
    useCart()
  const { user, profile } = useCustomerAuth()
  const [tableNumber, setTableNumber] = useState(profile?.preferredTable?.toString() || "")
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handlePlaceOrder = async () => {
    if (!user || !profile) {
      toast({
        title: "Not Signed In",
        description: "Please sign in to place an order",
        variant: "destructive",
      })
      router.push("/customer/signin")
      return
    }

    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some items before placing an order.",
        variant: "destructive",
      })
      return
    }

    if (!tableNumber) {
      toast({
        title: "Table Number Required",
        description: "Please enter your table number",
        variant: "destructive",
      })
      return
    }

    try {
      setIsPlacingOrder(true)

      await placeOrder(user.uid, profile.name, profile.email, Number.parseInt(tableNumber), items)

      clearCart()

      toast({
        title: "Order Placed",
        description: "Your order has been placed successfully!",
      })

      router.push("/customer/orders")
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <CustomerProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <CustomerNavigation />
        <main className="flex-1 p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">Your Cart</h1>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">Add some delicious items to your cart</p>
                <Button onClick={() => router.push("/customer/menu")}>Browse Menu</Button>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cart Items ({totalItems})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {items.map((item) => (
                        <div key={item.food.id} className="flex gap-4 py-4 border-b last:border-0">
                          <div className="relative h-20 w-20 flex-shrink-0">
                            {item.food.imageUrl ? (
                              <Image
                                src={item.food.imageUrl || "/placeholder.svg"}
                                alt={item.food.name}
                                fill
                                className="object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{item.food.name}</h3>
                              <span className="font-medium">{getItemTotal(item).toLocaleString()} FCFA</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.food.price.toLocaleString()} FCFA each
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-r-none"
                                  onClick={() => updateQuantity(item.food.id!, Math.max(1, item.quantity - 1))}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <div className="h-8 px-3 flex items-center justify-center border-y">
                                  {item.quantity}
                                </div>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-l-none"
                                  onClick={() => updateQuantity(item.food.id!, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeFromCart(item.food.id!)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Display additional items */}
                            {item.selectedAdditionalItems.length > 0 && (
                              <div className="mt-3 pl-2 border-l-2 border-muted">
                                <p className="text-xs font-medium mb-1">Additional Items:</p>
                                <ul className="space-y-1">
                                  {item.selectedAdditionalItems.map((addItem) => (
                                    <li key={addItem.id} className="text-xs flex justify-between">
                                      <span>
                                        {addItem.name} x{addItem.quantity}
                                      </span>
                                      <span>{(addItem.price * addItem.quantity).toLocaleString()} FCFA</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="mt-2">
                              <Textarea
                                placeholder="Add special instructions..."
                                className="text-sm resize-none"
                                value={item.notes || ""}
                                onChange={(e) => updateNotes(item.food.id!, e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => clearCart()}>
                        Clear Cart
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.food.id} className="flex justify-between text-sm">
                            <span>
                              {item.food.name} x{item.quantity}
                            </span>
                            <span>{getItemTotal(item).toLocaleString()} FCFA</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>{totalPrice.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                      <div className="space-y-2 pt-4">
                        <Label htmlFor="table-number">Table Number</Label>
                        <Input
                          id="table-number"
                          type="number"
                          min="1"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder || items.length === 0 || !tableNumber}
                      >
                        {isPlacingOrder ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Placing Order...
                          </>
                        ) : (
                          "Place Order"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </CustomerProtectedRoute>
  )
}
