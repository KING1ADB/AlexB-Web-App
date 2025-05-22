"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { doc, setDoc, getDoc } from "firebase/firestore"

interface CustomerProfile {
  name: string
  email: string
  phone?: string
  address?: string
  preferredTable?: number
}

interface CustomerAuthContextType {
  user: User | null
  profile: CustomerProfile | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateCustomerProfile: (data: Partial<CustomerProfile>) => Promise<void>
  error: string | null
}

const CustomerAuthContext = createContext<CustomerAuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  logout: async () => {},
  updateCustomerProfile: async () => {},
  error: null,
})

export const useCustomerAuth = () => useContext(CustomerAuthContext)

export const CustomerAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          // Fetch customer profile
          const profileDoc = await getDoc(doc(db, "customerProfiles", user.uid))
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as CustomerProfile)
          } else {
            // Create a basic profile if it doesn't exist
            const basicProfile = {
              name: user.displayName || "",
              email: user.email || "",
            }
            setProfile(basicProfile)
            await setDoc(doc(db, "customerProfiles", user.uid), basicProfile)
          }
        } catch (error) {
          console.error("Error fetching customer profile:", error)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with name
      await updateProfile(userCredential.user, { displayName: name })

      // Create customer profile
      const customerProfile = {
        name,
        email,
      }

      await setDoc(doc(db, "customerProfiles", userCredential.user.uid), customerProfile)
      setProfile(customerProfile)

      router.push("/customer")
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/customer")
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      router.push("/customer/signin")
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  const updateCustomerProfile = async (data: Partial<CustomerProfile>) => {
    try {
      if (!user) throw new Error("No user logged in")

      const updatedProfile = { ...profile, ...data } as CustomerProfile
      await setDoc(doc(db, "customerProfiles", user.uid), updatedProfile)
      setProfile(updatedProfile)
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        logout,
        updateCustomerProfile,
        error,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  )
}
