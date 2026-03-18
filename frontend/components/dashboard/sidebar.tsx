"use client"

import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  Users,
  ClipboardList,
  FileText,
  Clock,
  Settings,
  Sparkles,
} from "lucide-react"

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

interface SidebarProps {
  activeItem?: string
  onNavChange?: (item: string) => void
}

export function Sidebar({ activeItem = "Assignments", onNavChange }: SidebarProps) {
  const navItems = [
    { icon: <LayoutGrid className="size-5" />, label: "Home" },
    { icon: <Users className="size-5" />, label: "My Groups" },
    { icon: <ClipboardList className="size-5" />, label: "Assignments" },
    { icon: <FileText className="size-5" />, label: "AI Teacher's Toolkit" },
    { icon: <Clock className="size-5" />, label: "My Library" },
  ]

  return (
    <aside className="fixed left-4 top-4 bottom-4 z-30 flex w-[220px] flex-col rounded-2xl bg-white shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-5 text-white"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-lg font-semibold text-foreground">VedaAI</span>
      </div>

      {/* Create Assignment Button */}
      <div className="px-4 pb-5">
        <button className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-zinc-900 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 hover:border-zinc-700">
          <Sparkles className="size-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.label}
            onClick={() => onNavChange?.(item.label)}
          />
        ))}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-2">
        <NavItem
          icon={<Settings className="size-5" />}
          label="Settings"
          active={activeItem === "Settings"}
          onClick={() => onNavChange?.("Settings")}
        />
      </div>

      {/* School Card */}
      <div className="mx-3 mb-4 flex items-center gap-3 rounded-xl bg-zinc-800 p-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-200">
          <span className="text-base font-bold text-amber-700">D</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-white">Delhi Public School</p>
          <p className="truncate text-xs text-zinc-400">Bokaro Steel City</p>
        </div>
      </div>
    </aside>
  )
}
