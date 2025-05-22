"use client"

import { useState } from "react"
import ProtectedRoute from "@/components/protected-route"
import Navigation from "@/components/navigation"
import BluetoothConnector from "@/components/bluetooth-connector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import bluetoothService from "@/lib/bluetooth-service"

export default function BluetoothTestPage() {
  const [tableNumber, setTableNumber] = useState<number>(1)
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleSendTableNumber = async () => {
    if (!bluetoothService?.isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to AlexB robot first.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      console.log(`Testing: Sending table number ${tableNumber} to robot...`)
      const success = await bluetoothService.sendTableNumber(tableNumber)

      if (success) {
        toast({
          title: "Table Number Sent",
          description: `Table ${tableNumber} sent to AlexB robot successfully.`,
          variant: "default",
        })
      } else {
        throw new Error("Failed to send table number to robot")
      }
    } catch (error) {
      console.error("Error sending table number:", error)
      toast({
        title: "Error",
        description: "Failed to send table number. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-1 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bluetooth Test</h1>
              <p className="text-muted-foreground">Test the Bluetooth connection with AlexB robot</p>
            </div>
            <div className="mt-4 md:mt-0">
              <BluetoothConnector />
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Send Table Number Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="table-number">Table Number</Label>
                  <Input
                    id="table-number"
                    type="number"
                    min="1"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(Number.parseInt(e.target.value) || 1)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleSendTableNumber}
                  disabled={isSending || !bluetoothService?.isConnected}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : !bluetoothService?.isConnected ? (
                    "Connect to Robot First"
                  ) : (
                    `Send Table ${tableNumber} to Robot`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
