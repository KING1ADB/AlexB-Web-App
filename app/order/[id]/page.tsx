"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useOrders } from "@/contexts/order-context"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import Navigation from "@/components/navigation"
import BluetoothConnector from "@/components/bluetooth-connector"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Clock, Star, Loader2, AlertCircle } from "lucide-react"
import bluetoothService from "@/lib/bluetooth-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { getOrderById, confirmDelivery, loading } = useOrders()
  const { toast } = useToast()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSendingToRobot, setIsSendingToRobot] = useState(false)
  const [bluetoothStatus, setBluetoothStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const { user } = useAuth()

  const orderId = params.id as string
  const order = getOrderById(orderId)

  // Check Bluetooth connection status on component mount
  useEffect(() => {
    if (typeof window !== "undefined" && bluetoothService) {
      setBluetoothStatus(bluetoothService.isConnected ? "connected" : "disconnected")
    } else {
      setBluetoothStatus("disconnected")
    }
  }, [])

  if (!user) {
    router.push("/signin")
    return null
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1 p-4 md:p-6 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1 p-4 md:p-6">
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h3 className="text-lg font-medium">Order not found</h3>
              <p className="text-muted-foreground mt-1">The order you are looking for does not exist</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
                Go back to orders
              </Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  // Force image refresh by adding a cache-busting parameter
  const getImageSrc = (imageUrl?: string) => {
    if (!imageUrl) return "/placeholder.svg?height=400&width=600"

    // Add a timestamp to force refresh
    const cacheBuster = `t=${Date.now()}`
    const separator = imageUrl.includes("?") ? "&" : "?"

    return `${imageUrl}${separator}${cacheBuster}`
  }

  const handleConfirmDelivery = async () => {
    // First check if Bluetooth is connected
    if (!bluetoothService?.isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to AlexB robot first using the Bluetooth button in the top right.",
        variant: "destructive",
      })
      return
    }

    setIsSendingToRobot(true)
    try {
      console.log(`Attempting to send table number ${order.table} to robot...`)

      // Send table number to robot
      const success = await bluetoothService.sendTableNumber(order.table)

      if (success) {
        toast({
          title: "Table Number Sent",
          description: `Table ${order.table} sent to AlexB robot.`,
          variant: "default",
        })

        // Update order status
        setIsConfirming(true)
        console.log(`Updating order status to delivered...`)
        await confirmDelivery(order.id)

        toast({
          title: "Delivery Confirmed",
          description: "Order has been sent for delivery.",
          variant: "default",
        })

        // Navigate back to orders page
        router.push("/")
      } else {
        throw new Error("Failed to send table number to robot")
      }
    } catch (error) {
      console.error("Error confirming delivery:", error)
      toast({
        title: "Error",
        description: "Failed to confirm delivery. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingToRobot(false)
      setIsConfirming(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-1 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
            </div>
            <div className="mt-4 md:mt-0">
              <BluetoothConnector />
            </div>
          </div>

          {order.status === "accepted" && !bluetoothService?.isConnected && (
            <Alert variant="warning" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Bluetooth Connection Required</AlertTitle>
              <AlertDescription>
                Please connect to the AlexB robot using the Bluetooth button in the top right before confirming
                delivery.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-0">
                <div className="relative h-48 md:h-64 w-full">
                  <Image
                    src={getImageSrc(order.imageUrl) || "/placeholder.svg"}
                    alt={order.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{order.name}</h2>
                      <p className="text-muted-foreground">{order.description}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-medium">{order.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{order.duration}</span>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-bold">
                      Price: {typeof order.price === "number" ? order.price.toLocaleString() : order.price} FCFA
                    </div>
                    <div className="text-lg font-bold text-primary">Table {order.table}</div>
                  </div>

                  {order.additionalItems && order.additionalItems.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Additional Items</h3>
                      <ul className="space-y-2">
                        {order.additionalItems.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span>{item.name}</span>
                            <span>x{item.qty}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {order.status === "accepted" && (
                    <Button
                      className="w-full mt-6"
                      onClick={handleConfirmDelivery}
                      disabled={isConfirming || isSendingToRobot || !bluetoothService?.isConnected}
                    >
                      {isSendingToRobot ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending to AlexB...
                        </>
                      ) : isConfirming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirming...
                        </>
                      ) : !bluetoothService?.isConnected ? (
                        "Connect to Robot First"
                      ) : (
                        "Confirm Delivery"
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">{order.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium">{order.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span
                        className={`font-medium ${
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
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Delivery Instructions</h3>
                  <ol className="space-y-2 list-decimal pl-5">
                    <li className="text-muted-foreground">Accept the order to start preparation</li>
                    <li className="text-muted-foreground">Connect to AlexB robot via Bluetooth</li>
                    <li className="text-muted-foreground">Click "Confirm Delivery" when the order is ready</li>
                    <li className="text-muted-foreground">AlexB will deliver the order to Table {order.table}</li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Bluetooth Connection</h3>
                  <p className="text-muted-foreground mb-4">
                    To send the order to the robot, you must first connect to it via Bluetooth. Use the "Connect to
                    AlexB" button in the top right corner.
                  </p>
                  <div className="flex justify-center">
                    <BluetoothConnector />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
