"use client"

import { useState, useRef, useEffect } from "react"
import { MoreVertical } from "lucide-react"

interface AssignmentCardProps {
  title: string
  assignedOn: string
  dueDate: string
  onView?: () => void
  onDelete?: () => void
}

export function AssignmentCard({
  title,
  assignedOn,
  dueDate,
  onView,
  onDelete,
}: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Title and Menu */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-zinc-100 hover:text-foreground"
          >
            <MoreVertical className="size-4" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-10 min-w-[140px] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  onView?.()
                  setMenuOpen(false)
                }}
                className="flex w-full items-center px-3 py-2 text-sm text-foreground transition-colors hover:bg-zinc-50"
              >
                View Assignment
              </button>
              <button
                onClick={() => {
                  onDelete?.()
                  setMenuOpen(false)
                }}
                className="flex w-full items-center px-3 py-2 text-sm text-red-600 transition-colors hover:bg-zinc-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">Assigned on :</span> {assignedOn}
        </span>
        <span>
          <span className="font-medium text-foreground">Due :</span> {dueDate}
        </span>
      </div>
    </div>
  )
}
