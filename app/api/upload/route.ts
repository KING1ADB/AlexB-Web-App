import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API route called")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("File received:", file.name, "Size:", file.size, "Type:", file.type)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a new FormData for Cloudinary
    const cloudinaryFormData = new FormData()

    // Convert buffer to blob
    const blob = new Blob([buffer])
    cloudinaryFormData.append("file", blob)
    cloudinaryFormData.append("upload_preset", "alexb_foods")

    // Get cloud name from environment variable
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

    if (!cloudName) {
      console.error("Cloudinary cloud name not found in environment variables")
      return NextResponse.json({ error: "Cloudinary cloud name not configured" }, { status: 500 })
    }

    console.log("Uploading to Cloudinary with cloud name:", cloudName)

    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    console.log("Cloudinary URL:", cloudinaryUrl)

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: cloudinaryFormData,
    })

    console.log("Cloudinary response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Cloudinary error:", errorData)
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to upload image" },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Cloudinary upload successful, URL:", data.secure_url)

    return NextResponse.json({ url: data.secure_url })
  } catch (error) {
    console.error("Error in upload API route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
