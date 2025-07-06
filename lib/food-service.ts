import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
  orderBy,
} from "firebase/firestore"
import { db } from "./firebase"

export interface AdditionalItem {
  id: string
  name: string
  price: number
}

export interface Food {
  id?: string
  name: string
  description: string
  price: number
  imageUrl?: string
  category: string
  available: boolean
  preparationTime?: string
  ingredients?: string[]
  additionalItems?: AdditionalItem[]
  createdAt?: number
  updatedAt?: number
}

export const FOOD_CATEGORIES = ["Appetizers", "Main Courses", "Desserts", "Beverages", "Sides", "Specials"]

// Get all foods
export async function getAllFoods(): Promise<Food[]> {
  try {
    // Try with ordering first
    const foodsRef = collection(db, "foods")
    const q = query(foodsRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const foods: Food[] = []
    querySnapshot.forEach((doc) => {
      foods.push({
        id: doc.id,
        ...(doc.data() as Food),
      })
    })

    return foods
  } catch (error) {
    console.error("Error getting foods with ordering:", error)

    // Fallback: get all foods without ordering
    try {
      console.log("Trying fallback method to get all foods...")
      const foodsRef = collection(db, "foods")
      const q = query(foodsRef)
      const querySnapshot = await getDocs(q)

      const foods: Food[] = []
      querySnapshot.forEach((doc) => {
        foods.push({
          id: doc.id,
          ...(doc.data() as Food),
        })
      })

      // Sort in memory
      return foods.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt - a.createdAt
        }
        return 0
      })
    } catch (fallbackError) {
      console.error("Fallback method also failed:", fallbackError)
      throw error // Throw the original error
    }
  }
}

// Get available foods
export async function getAvailableFoods(): Promise<Food[]> {
  try {
    // Try a simpler query that doesn't require a composite index
    const foodsRef = collection(db, "foods")
    const q = query(foodsRef, where("available", "==", true))
    const querySnapshot = await getDocs(q)

    const foods: Food[] = []
    querySnapshot.forEach((doc) => {
      foods.push({
        id: doc.id,
        ...(doc.data() as Food),
      })
    })

    // Sort in memory instead of in the query
    return foods.sort((a, b) => {
      // If createdAt exists on both documents, sort by it
      if (a.createdAt && b.createdAt) {
        return b.createdAt - a.createdAt
      }
      // Otherwise, keep the original order
      return 0
    })
  } catch (error) {
    console.error("Error getting available foods:", error)

    // Fallback: get all foods and filter in memory
    try {
      console.log("Trying fallback method to get available foods...")
      const foodsRef = collection(db, "foods")
      const q = query(foodsRef)
      const querySnapshot = await getDocs(q)

      const foods: Food[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Food
        if (data.available) {
          foods.push({
            id: doc.id,
            ...data,
          })
        }
      })

      return foods
    } catch (fallbackError) {
      console.error("Fallback method also failed:", fallbackError)
      throw error // Throw the original error
    }
  }
}

// Get foods by category
export async function getFoodsByCategory(category: string): Promise<Food[]> {
  try {
    // Use a simpler query without ordering
    const foodsRef = collection(db, "foods")
    const q = query(foodsRef, where("category", "==", category), where("available", "==", true))
    const querySnapshot = await getDocs(q)

    const foods: Food[] = []
    querySnapshot.forEach((doc) => {
      foods.push({
        id: doc.id,
        ...(doc.data() as Food),
      })
    })

    // Sort in memory
    return foods.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt - a.createdAt
      }
      return 0
    })
  } catch (error) {
    console.error(`Error getting foods by category ${category}:`, error)

    // Fallback: get all foods and filter in memory
    try {
      const foodsRef = collection(db, "foods")
      const q = query(foodsRef)
      const querySnapshot = await getDocs(q)

      const foods: Food[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Food
        if (data.available && data.category === category) {
          foods.push({
            id: doc.id,
            ...data,
          })
        }
      })

      return foods
    } catch (fallbackError) {
      console.error("Fallback method also failed:", fallbackError)
      throw error // Throw the original error
    }
  }
}

// Get food by ID
export async function getFoodById(id: string): Promise<Food | null> {
  try {
    const foodRef = doc(db, "foods", id)
    const foodDoc = await getDoc(foodRef)

    if (!foodDoc.exists()) {
      return null
    }

    return {
      id: foodDoc.id,
      ...(foodDoc.data() as Food),
    }
  } catch (error) {
    console.error(`Error getting food by ID ${id}:`, error)
    throw error
  }
}

// Add a new food
export async function addFood(food: Omit<Food, "id">): Promise<string> {
  try {
    const timestamp = Date.now()
    const foodsRef = collection(db, "foods")
    
    // Remove undefined values
    const cleanedFood = Object.entries(food).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    const docRef = await addDoc(foodsRef, {
      ...cleanedFood,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding food:", error)
    throw error
  }
}

// Update a food
export async function updateFood(id: string, data: Partial<Food>): Promise<void> {
  try {
    const foodRef = doc(db, "foods", id)
    await updateDoc(foodRef, {
      ...data,
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error("Error updating food:", error)
    throw error
  }
}

// Delete a food
export async function deleteFood(id: string): Promise<void> {
  try {
    const foodRef = doc(db, "foods", id)
    await deleteDoc(foodRef)
  } catch (error) {
    console.error("Error deleting food:", error)
    throw error
  }
}

// Toggle food availability
export async function toggleFoodAvailability(id: string, available: boolean): Promise<void> {
  try {
    const foodRef = doc(db, "foods", id)
    await updateDoc(foodRef, {
      available,
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error("Error toggling food availability:", error)
    throw error
  }
}

