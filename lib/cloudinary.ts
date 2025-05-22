// Function to upload an image to Cloudinary
export async function uploadImage(file: File): Promise<string> {
  try {
    // Create a FormData object
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "alexb_foods") // Create this upload preset in your Cloudinary dashboard

    // Upload to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/dqwp1b09c/image/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

// Function to get a transformed/optimized image URL
export function getOptimizedImageUrl(url: string, width = 500): string {
  if (!url) return ""

  // If it's already a Cloudinary URL, add transformations
  if (url.includes("cloudinary.com")) {
    // Extract the base URL and add transformations
    const parts = url.split("/upload/")
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_${width},c_fill,q_auto,f_auto/${parts[1]}`
    }
  }

  // Return the original URL if it's not from Cloudinary
  return url
}
