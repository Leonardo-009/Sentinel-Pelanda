"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Brain, Home, Menu, Search, Shield } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navigation = [
  { name: "Início", href: "/", icon: Home },
  { name: "Análise de Logs", href: "/analise", icon: Brain },
  { name: "Verificação", href: "/verificacao", icon: Search },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/95 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">Sentinel-Pelanda</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    className={cn(
                      "flex items-center space-x-2",
                      pathname === item.href && "bg-purple-600 hover:bg-purple-700",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )
            })}
            <ThemeToggle />
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-6 w-6 text-purple-600" />
                <span className="text-lg font-bold dark:text-white">Sentinel-Pelanda</span>
              </div>
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                      <Button
                        variant={pathname === item.href ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start space-x-2",
                          pathname === item.href && "bg-purple-600 hover:bg-purple-700",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  )
                })}
                <div className="pt-4 border-t">
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
