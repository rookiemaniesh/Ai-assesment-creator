"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { AssignmentCard } from "@/components/dashboard/assignment-card"
import { ChevronDown, Search, Plus } from "lucide-react"
import { WS_BASE_URL, fetchAssignments, type AssignmentListItem } from "@/lib/api"

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState("Assignments")
  const [searchQuery, setSearchQuery] = useState("")
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const pollRef = useRef<number | null>(null)
  const router = useRouter()

  const loadAssignments = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true)
      setError(null)
      const data = await fetchAssignments()
      setAssignments(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to fetch assignments")
    } finally {
      if (isInitialLoad) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAssignments(true)
  }, [loadAssignments])

  useEffect(() => {
    const clientId = window.localStorage.getItem("vedaai-client-id")
    if (!clientId) return

    const ws = new WebSocket(`${WS_BASE_URL}?clientId=${encodeURIComponent(clientId)}`)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string) as { event?: string }
        if (
          payload.event === "job:progress" ||
          payload.event === "job:complete" ||
          payload.event === "job:failed"
        ) {
          void loadAssignments(false)
        }
      } catch {
        // Ignore malformed non-JSON messages
      }
    }

    pollRef.current = window.setInterval(() => {
      void loadAssignments(false)
    }, 15000)

    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [loadAssignments])

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB")

  return (
    <div className="relative min-h-screen bg-zinc-200">
      {/* Floating Sidebar — always visible, overlays the main content */}
      <Sidebar activeItem={activeNav} onNavChange={setActiveNav} />

      {/* Main content — full width, sidebar floats on top */}
      <div className="min-h-screen pl-[244px] pr-4 pt-4 pb-24">
        {/* Floating Header */}
        <Header title="Assignment" />

        {/* Content Area */}
        <main className="mt-4 rounded-2xl bg-zinc-100 p-5">
          {/* Page Title */}
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-green-500"></span>
              <h1 className="text-xl font-semibold text-foreground">Assignments</h1>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground pl-[18px]">
              Manage and create assignments for your classes.
            </p>
          </div>

          {/* Filter & Search Row */}
          <div className="flex items-center justify-between gap-4 mb-5">
            {/* Filter Dropdown */}
            <button className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-zinc-50">
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter By
              <ChevronDown className="size-4" />
            </button>

            {/* Search Input */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Assignment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-zinc-300"
              />
            </div>
          </div>

          {/* Assignment Cards Grid */}
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading assignments...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment._id}
                  id={assignment._id}
                  title={assignment.title}
                  assignedOn={formatDate(assignment.createdAt)}
                  dueDate={formatDate(assignment.dueDate)}
                  onView={(id) => router.push(`/assignments/${id}`)}
                  onDelete={(id) => console.log("Delete", id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating Create Assignment Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 pl-[244px]">
        <button
          onClick={() => router.push("/create-assignment")}
          className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-zinc-700 hover:shadow-xl"
        >
          <Plus className="size-4" />
          Create Assignment
        </button>
      </div>
    </div>
  )
}
