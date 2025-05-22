"use client"

import { useOrders } from "@/contexts/order-context"
import ProtectedRoute from "@/components/protected-route"
import Navigation from "@/components/navigation"
import OrderCard from "@/components/order-card"
import { Loader2 } from "lucide-react"
import ErrorDisplay from "@/components/error-display"

export default function DeclinedOrdersPage() {
  const { declinedOrders, loading, error } = useOrders()

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Declined Orders</h1>
            <p className="text-muted-foreground">Orders that have been declined</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <ErrorDisplay title="Failed to load orders" message={error} retry={() => window.location.reload()} />
          ) : declinedOrders.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {declinedOrders.map((order) => (
                <OrderCard key={order.id} order={order} showActions={false} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h3 className="text-lg font-medium">No declined orders</h3>
              <p className="text-muted-foreground mt-1">Orders you decline will appear here</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
