class BluetoothService {
  device: BluetoothDevice | null = null
  characteristic: BluetoothRemoteGATTCharacteristic | null = null
  isConnected = false

  async connect() {
    try {
      console.log("Starting Bluetooth connection process...")

      // Check if Web Bluetooth API is available
      if (!navigator.bluetooth) {
        console.error("Web Bluetooth API is not available in this browser/device")
        return false
      }

      console.log("Requesting Bluetooth device...")

      // Request the Bluetooth device
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: "AlexB" }, // Filter devices with name starting with "AlexB"
          { services: ["0000ffe0-0000-1000-8000-00805f9b34fb"] }, // Standard UART service UUID
        ],
        optionalServices: ["0000ffe0-0000-1000-8000-00805f9b34fb"],
      })

      console.log("Device selected:", this.device.name)

      if (!this.device) {
        throw new Error("No device selected")
      }

      // Connect to GATT server
      console.log("Connecting to GATT server...")
      const server = await this.device.gatt?.connect()

      if (!server) {
        throw new Error("Failed to connect to GATT server")
      }

      // Get the UART service
      console.log("Getting UART service...")
      const service = await server.getPrimaryService("0000ffe0-0000-1000-8000-00805f9b34fb")

      // Get the TX characteristic
      console.log("Getting TX characteristic...")
      this.characteristic = await service.getCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb")

      this.isConnected = true
      console.log("Connected to device successfully")

      // Add disconnect listener
      this.device.addEventListener("gattserverdisconnected", () => {
        this.isConnected = false
        console.log("Device disconnected")
      })

      return true
    } catch (error) {
      console.error("Bluetooth connection error:", error)
      this.isConnected = false
      return false
    }
  }

  async disconnect() {
    if (this.device && this.device.gatt?.connected) {
      await this.device.gatt.disconnect()
      this.isConnected = false
      console.log("Disconnected from device")
    }
  }

  async sendTableNumber(tableNumber: number) {
    if (!this.isConnected || !this.characteristic) {
      console.error("Not connected to device")
      throw new Error("Not connected to device")
    }

    try {
      // Convert table number to string and then to bytes
      const tableNumberStr = `TABLE:${tableNumber}`
      console.log(`Sending table number: ${tableNumberStr}`)

      const encoder = new TextEncoder()
      const data = encoder.encode(tableNumberStr)

      // Send the data
      console.log("Writing value to characteristic...")
      await this.characteristic.writeValue(data)
      console.log(`Sent table number ${tableNumber} to robot successfully`)
      return true
    } catch (error) {
      console.error("Error sending data:", error)
      return false
    }
  }

  isBluetoothSupported() {
    return navigator.bluetooth !== undefined
  }
}

// Create a singleton instance
const bluetoothService = typeof window !== "undefined" ? new BluetoothService() : null

export default bluetoothService
