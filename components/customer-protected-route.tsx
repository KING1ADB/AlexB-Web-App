"use client"

import type React from "react"

import { useCustomerAuth } from "@/contexts/customer-auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function CustomerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCustomerAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/customer/signin")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
