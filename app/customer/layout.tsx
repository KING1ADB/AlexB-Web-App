import type React from "react"
import { CustomerAuthProvider } from "@/contexts/customer-auth-context"
import { CartProvider } from "@/contexts/cart-context"

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <CustomerAuthProvider>
      <CartProvider>{children}</CartProvider>
    </CustomerAuthProvider>
  )
}
