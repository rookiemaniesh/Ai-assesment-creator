"use client"

import { Bell, Menu } from "lucide-react"

interface MobileHeaderProps {
  userDisplayName?: string | null
  profileLoading?: boolean
  onMenuClick?: () => void
}

function displayInitial(name: string | null | undefined): string {
  if (!name?.trim()) return "?"
  return name.trim().charAt(0).toUpperCase()
}

export function MobileHeader({
  userDisplayName,
  profileLoading = false,
  onMenuClick,
}: MobileHeaderProps) {
  const label = profileLoading ? "…" : userDisplayName?.trim() || "Guest"

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between rounded-b-3xl bg-white px-5 shadow-sm md:hidden">
      {/* Left Section: Logo & Brand */}
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-900">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-4 text-white"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-lg font-bold text-zinc-900">VedaAI</span>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors">
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-orange-500 border border-white" />
        </button>

        {/* User Profile */}
        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800">
          {/* Typically an image, using initial as fallback based on standard design */}
          <span className="text-sm font-medium text-white">
             {displayInitial(userDisplayName ?? undefined)}
          </span>
        </div>

        {/* Hamburger Menu */}
        <button
          onClick={onMenuClick}
          className="flex size-9 items-center justify-center rounded-full text-zinc-600 transition-colors"
        >
          <Menu className="size-6" />
        </button>
      </div>
    </header>
  )
}
