"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bluetooth, BluetoothOff } from "lucide-react"
import bluetoothService from "@/lib/bluetooth-service"
import { useToast } from "@/hooks/use-toast"

export default function BluetoothConnector() {
  const [isConnected, setIsConnected] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const { toast } = useToast()

  // Check if the Bluetooth service is connected on component mount
  useEffect(() => {
    // Check if Bluetooth is supported
    if (typeof window !== "undefined") {
      setIsSupported(bluetoothService?.isBluetoothSupported() || false)

      // Set initial connection state
      if (bluetoothService) {
        setIsConnected(bluetoothService.isConnected)
      }
    }
  }, [])

  const handleConnect = async () => {
    if (!bluetoothService) return

    try {
      console.log("Attempting to connect to AlexB robot...")
      const connected = await bluetoothService.connect()
      setIsConnected(connected)

      if (connected) {
        toast({
          title: "Connected to AlexB",
          description: "Successfully connected to the robot.",
          variant: "default",
        })
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to the robot. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error connecting to Bluetooth device:", error)
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to the robot.",
        variant: "destructive",
      })
    }
  }

  const handleDisconnect = async () => {
    if (!bluetoothService) return

    try {
      await bluetoothService.disconnect()
      setIsConnected(false)
      toast({
        title: "Disconnected",
        description: "Disconnected from the robot.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error disconnecting from Bluetooth device:", error)
      toast({
        title: "Disconnection Error",
        description: "An error occurred while disconnecting from the robot.",
        variant: "destructive",
      })
    }
  }

  if (!isSupported) {
    return (
      <Button variant="outline" className="gap-2" disabled>
        <BluetoothOff className="h-4 w-4" />
        Bluetooth Not Supported
      </Button>
    )
  }

  return isConnected ? (
    <Button variant="outline" className="gap-2 bg-green-100" onClick={handleDisconnect}>
      <Bluetooth className="h-4 w-4" />
      Connected to AlexB
    </Button>
  ) : (
    <Button variant="outline" className="gap-2" onClick={handleConnect}>
      <Bluetooth className="h-4 w-4" />
      Connect to AlexB
    </Button>
  )
}
