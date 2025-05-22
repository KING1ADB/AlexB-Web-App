import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { app } from "./firebase"

const storage = getStorage(app)

// Upload a food image and get its URL
export async function uploadFoodImage(file: File, foodName: string): Promise<string> {
  try {
    // Create a unique filename
    const fileName = `foods/${foodName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`
    const storageRef = ref(storage, fileName)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error("Error uploading food image:", error)
    throw new Error("Failed to upload image")
  }
}

// Get a food image URL by its path
export async function getFoodImageURL(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path)
    return await getDownloadURL(storageRef)
  } catch (error) {
    console.error("Error getting food image URL:", error)
    throw new Error("Failed to get image URL")
  }
}
