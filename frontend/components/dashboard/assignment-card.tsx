"use client"

import { useState, useRef, useEffect } from "react"
import { MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

export type AssignmentStatus = "pending" | "processing" | "completed" | "failed"

function statusDotTitle(status: AssignmentStatus): string {
  if (status === "completed") return "Generated — ready to view"
  if (status === "pending" || status === "processing") return "In generation"
  return "Generation failed"
}

interface AssignmentCardProps {
  id: string
  title: string
  assignedOn: string
  dueDate: string
  status: AssignmentStatus
  onView?: (id: string) => void
  onDelete?: (id: string) => void
}

export function AssignmentCard({
  id,
  title,
  assignedOn,
  dueDate,
  status,
  onView,
  onDelete,
}: AssignmentCardProps) {
  const canView = status === "completed"
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
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <span
            title={statusDotTitle(status)}
            className={cn(
              "mt-1.5 size-2.5 shrink-0 cursor-help rounded-full ring-2 ring-white",
              status === "completed" && "bg-green-500",
              status === "pending" && "bg-amber-400",
              status === "processing" && "animate-pulse bg-amber-400",
              status === "failed" && "bg-red-500"
            )}
            aria-label={statusDotTitle(status)}
          />
          <h3 className="min-w-0 flex-1 text-base font-semibold text-foreground">{title}</h3>
        </div>
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
                type="button"
                disabled={!canView}
                title={canView ? undefined : "Available when generation finishes"}
                onClick={() => {
                  if (!canView) return
                  onView?.(id)
                  setMenuOpen(false)
                }}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-sm text-left transition-colors",
                  canView
                    ? "text-foreground hover:bg-zinc-50"
                    : "cursor-not-allowed text-zinc-400"
                )}
              >
                View Assignment
              </button>
              <button
                onClick={() => {
                  onDelete?.(id)
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
