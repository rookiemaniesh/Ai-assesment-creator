"use client"

import { cn } from "@/lib/utils"
import { LayoutGrid, Calendar, BookMarked, Sparkles } from "lucide-react"

interface MobileNavProps {
  activeItem: string
  onNavChange: (item: string) => void
}

export function MobileNav({ activeItem, onNavChange }: MobileNavProps) {
  const navItems = [
    { id: "Home", icon: LayoutGrid, label: "Home" },
    { id: "Assignments", icon: Calendar, label: "Assignments" },
    { id: "Library", icon: BookMarked, label: "Library" },
    { id: "AIToolkit", icon: Sparkles, label: "AI Toolkit" },
  ]

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
      <nav className="flex h-[72px] items-center justify-between rounded-[32px] bg-[#111111] px-6 shadow-xl">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id || (activeItem === "Assignments" && item.id === "Assignments") // fallback logic if needed
          
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                isActive ? "text-white" : "text-zinc-500 hover:text-white"
              )}
            >
              <Icon className="size-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
