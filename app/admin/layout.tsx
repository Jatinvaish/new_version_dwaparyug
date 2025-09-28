"use client"

import type React from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  ListChecks,
  Users,
  DollarSign,
  Boxes,
  MenuIcon,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useState } from "react"

interface AdminLink {
  name: string
  href: string
  icon: React.ElementType
  subLinks?: AdminLink[]
}

const adminLinks: AdminLink[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    subLinks: [
      { name: "All Products", href: "/admin/products", icon: ListChecks },
      { name: "All units", href: "/admin/units", icon: Boxes },
    ],
  },
  {
    name: "Campaigns", href: "/admin/campaigns", icon: PlusCircle,
    subLinks: [
      { name: "All Campaigns", href: "/admin/campaigns", icon: ListChecks },
      { name: "Add Campaigns", href: "/admin/campaigns/create", icon: PlusCircle },
    ],
  },
  { name: "Donations", href: "/admin/donations", icon: DollarSign },
    {
    name: "Batches",
    href: "/admin/batches",
    icon: Package,
    subLinks: [
      { name: "All Batches", href: "/admin/batches", icon: ListChecks },
      { name: "Add Batches", href: "/admin/batches/add", icon: PlusCircle },
    ],
  },
  { name: "Users & Roles", href: "/admin/users", icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({})

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const renderLinks = (links: AdminLink[]) => {
    return links.map((link) => (
      <div key={link.name}>
        {link.subLinks ? (
          <div>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between items-center text-sm font-medium hover:bg-muted transition",
                pathname.startsWith(link.href) && "bg-muted font-semibold"
              )}
              onClick={() => toggleSubmenu(link.name)}
            >
              <div className="flex items-center gap-2">
                <link.icon className="h-4 w-4" />
                {link.name}
              </div>
              {openSubmenus[link.name] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {openSubmenus[link.name] && (
              <div className="ml-4 mt-1 space-y-1">
                {link.subLinks.map((subLink) => (
                  <Link
                    key={subLink.name}
                    href={subLink.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition",
                      pathname === subLink.href && "bg-muted font-semibold"
                    )}
                    onClick={() => setIsSheetOpen(false)}
                    prefetch={false}
                  >
                    <subLink.icon className="h-4 w-4" />
                    {subLink.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Link
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition",
              pathname === link.href && "bg-muted font-semibold"
            )}
            onClick={() => setIsSheetOpen(false)}
            prefetch={false}
          >
            <link.icon className="h-4 w-4" />
            {link.name}
          </Link>
        )}
      </div>
    ))
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-52 flex-col border-r bg-muted/40 sticky top-0 h-screen">
        {/* Logo Section */}
        <div className="pt-[15px] flex items-center gap-2 px-4 pb-4 border-b">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span>Dwaparyug</span>
          </Link>
        </div>

        <nav className="space-y-1 px-2 py-2">
          {renderLinks(adminLinks)}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background pl-0 px-4 md:px-6">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <div>
                <Button variant="ghost" size="icon" className="font-xl md:hidden">
                  {isSheetOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </div>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              {/* Logo inside mobile sheet */}
              <div className="  flex items-center gap-2 pb-4 border-b">
                <Link href="/admin" className="flex items-center gap-2 font-semibold" onClick={() => setIsSheetOpen(false)}>
                  <Package className="h-6 w-6" />
                  <span>Dwaparyug </span>
                </Link>
              </div>
              <nav className="grid gap-2">
                {renderLinks(adminLinks)}
              </nav>
            </SheetContent>
          </Sheet>
          <h1 className="text-base font-semibold md:text-lg">Admin</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-3 md:p-6 space-y-4">{children}</main>
      </div>
    </div >
  )
}