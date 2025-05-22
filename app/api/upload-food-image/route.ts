import { type NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const foodName = formData.get("foodName") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!foodName) {
      return NextResponse.json({ error: "No food name provided" }, { status: 400 })
    }

    console.log(`Processing upload for food: ${foodName}`)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a new FormData for Cloudinary
    const cloudinaryFormData = new FormData()

    // Convert buffer to blob
    const blob = new Blob([buffer])
    cloudinaryFormData.append("file", blob)
    cloudinaryFormData.append("upload_preset", "alexb_foods")

    // Add a public_id to ensure unique images in Cloudinary
    const timestamp = new Date().getTime()
    const publicId = `alexb_foods/${foodName.toLowerCase().replace(/\s+/g, "_")}_${timestamp}`
    cloudinaryFormData.append("public_id", publicId)

    // Get cloud name from environment variable
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

    if (!cloudName) {
      return NextResponse.json({ error: "Cloudinary cloud name not configured" }, { status: 500 })
    }

    console.log(`Uploading to Cloudinary with cloud name: ${cloudName}, public_id: ${publicId}`)

    // Upload to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: cloudinaryFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Cloudinary error:", errorData)
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to upload image" },
        { status: response.status },
      )
    }

    const data = await response.json()
    const imageUrl = data.secure_url
    console.log(`Image uploaded successfully for ${foodName}, URL: ${imageUrl}`)

    // Update all orders with this food name
    try {
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("name", "==", foodName))
      const querySnapshot = await getDocs(q)

      console.log(`Found ${querySnapshot.size} orders with food name: ${foodName}`)

      const updatePromises = querySnapshot.docs.map((doc) => {
        console.log(`Updating order ${doc.id} with new image URL`)
        return updateDoc(doc.ref, { imageUrl })
      })

      await Promise.all(updatePromises)
      console.log(`Successfully updated all orders for ${foodName}`)
    } catch (error) {
      console.error(`Error updating orders for ${foodName}:`, error)
      // Continue even if updating orders fails - at least return the image URL
    }

    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error("Error in upload-food-image API route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
