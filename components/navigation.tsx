"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ChefHat, CheckCircle, XCircle, ImageIcon, UtensilsCrossed } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Navigation() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  const routes = [
    { href: "/", label: "Current Orders", icon: ChefHat },
    { href: "/accepted", label: "Accepted Orders", icon: CheckCircle },
    { href: "/declined", label: "Declined Orders", icon: XCircle },
    { href: "/admin/menu", label: "Menu Management", icon: UtensilsCrossed },
    { href: "/admin/food-images", label: "Food Images", icon: ImageIcon },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                {routes.map((route) => {
                  const Icon = route.icon
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                        isActive(route.href) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {route.label}
                    </Link>
                  )
                })}
                <Button variant="ghost" className="justify-start" onClick={() => logout()}>
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 ml-2 md:ml-0">
            <ChefHat className="h-6 w-6" />
            <span className="font-bold">AlexB Chef Portal</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center ml-auto space-x-4">
          {routes.map((route) => {
            const Icon = route.icon
            return (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                  isActive(route.href) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                {route.label}
              </Link>
            )
          })}
          <Button variant="ghost" onClick={() => logout()}>
            Logout
          </Button>
        </nav>
      </div>
    </header>
  )
}
