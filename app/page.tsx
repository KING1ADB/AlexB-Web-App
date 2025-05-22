"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useOrders } from "@/contexts/order-context"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import Navigation from "@/components/navigation"
import OrderCard from "@/components/order-card"
import BluetoothConnector from "@/components/bluetooth-connector"
import { Loader2 } from "lucide-react"
import ErrorDisplay from "@/components/error-display"

export default function CurrentOrdersPage() {
  const { pendingOrders, loading, error } = useOrders()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/signin")
    }
  }, [user, router])

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-1 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Current Orders</h1>
              <p className="text-muted-foreground">Manage pending orders and send them to AlexB for delivery</p>
            </div>
            <div className="mt-4 md:mt-0">
              <BluetoothConnector />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <ErrorDisplay title="Failed to load orders" message={error} retry={() => window.location.reload()} />
          ) : pendingOrders.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h3 className="text-lg font-medium">No pending orders</h3>
              <p className="text-muted-foreground mt-1">New orders will appear here when customers place them</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
