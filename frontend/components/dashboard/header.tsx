"use client"

import { ArrowLeft, Bell, ChevronDown, LayoutGrid } from "lucide-react"

interface HeaderProps {
  title: string
  showBackButton?: boolean
  onBack?: () => void
}

export function Header({ title, showBackButton = true, onBack }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between rounded-2xl bg-white px-5 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={onBack}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <LayoutGrid className="size-5" />
          <span className="text-sm font-medium">{title}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-orange-500" />
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-200">
            <span className="text-sm font-semibold text-amber-700">J</span>
          </div>
          <span className="text-sm font-medium text-foreground">John Doe</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}
