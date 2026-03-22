"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { MobileHeader } from "@/components/dashboard/mobile-header"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { MobileFab } from "@/components/dashboard/mobile-fab"
import { AssignmentCard } from "@/components/dashboard/assignment-card"
import { ChevronDown, Search, Plus } from "lucide-react"
import { WS_BASE_URL, fetchAssignments, type AssignmentListItem } from "@/lib/api"
import { useProfile } from "@/hooks/use-profile"

export default function DashboardPage() {
  const { profile, profileLoading } = useProfile()
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
      {/* Mobile Top Header (fixed, md:hidden) */}
      <MobileHeader
        userDisplayName={profile?.username}
        profileLoading={profileLoading}
        onMenuClick={() => setActiveNav("Menu")} // Optional: open a mobile menu
      />

      {/* Floating Sidebar — always visible on desktop, hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar
          activeItem={activeNav}
          onNavChange={setActiveNav}
          schoolName={profile?.schoolName}
          schoolAddress={profile?.schoolAddress}
          profileLoading={profileLoading}
        />
      </div>

      {/* Main content — full width on mobile, sidebar floats on top desktop */}
      <div className="min-h-screen pl-4 md:pl-[284px] pr-4 pt-20 md:pt-4 pb-[120px] md:pb-24">
        {/* Floating Header (Desktop) */}
        <div className="hidden md:block">
          <Header
            title="Assignment"
            userDisplayName={profile?.username}
            profileLoading={profileLoading}
          />
        </div>

        {/* Content Area */}
        {loading ? (
          <main className="mt-4 flex h-[calc(100vh-140px)] items-center justify-center rounded-2xl bg-zinc-100 p-5">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </main>
        ) : error ? (
          <main className="mt-4 flex h-[calc(100vh-140px)] flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-100 p-5">
            <p className="text-sm text-red-600 text-center">{error}</p>
            <Link
              href="/login"
              className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Sign in
            </Link>
          </main>
        ) : assignments.length === 0 ? (
          <main className="md:mt-4 flex min-h-[calc(100vh-140px)] flex-col items-center justify-center md:rounded-2xl bg-zinc-200 md:bg-[#EBEBEB] p-5">
            <div className="relative mb-6">
              <svg width="220" height="220" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                {/* Background blob/circle */}
                <circle cx="100" cy="100" r="90" fill="#F4F4F5" />
                {/* Document */}
                <rect x="75" y="60" width="50" height="70" rx="4" fill="white" stroke="#E4E4E7" strokeWidth="2" />
                <line x1="85" y1="75" x2="115" y2="75" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
                <line x1="85" y1="88" x2="115" y2="88" stroke="#E4E4E7" strokeWidth="3" strokeLinecap="round" />
                <line x1="85" y1="101" x2="115" y2="101" stroke="#E4E4E7" strokeWidth="3" strokeLinecap="round" />
                <line x1="85" y1="114" x2="105" y2="114" stroke="#E4E4E7" strokeWidth="3" strokeLinecap="round" />
                {/* Floating elements */}
                <rect x="135" y="55" width="25" height="15" rx="3" fill="white" stroke="#E4E4E7" strokeWidth="2" />
                <circle cx="142" cy="62" r="2.5" fill="#A1A1AA" />
                <circle cx="145" cy="115" r="4" fill="#64748B" />
                <path d="M65 80 C 50 80, 50 60, 65 60" stroke="#64748B" strokeWidth="2" strokeLinecap="round" fill="none" />
                {/* Star */}
                <path d="M70 130 L 71.5 133.5 L 75 135 L 71.5 136.5 L 70 140 L 68.5 136.5 L 65 135 L 68.5 133.5 Z" fill="#64748B" />
                {/* Magnifying Glass Outer Ring */}
                <circle cx="115" cy="110" r="24" fill="white" />
                <circle cx="115" cy="110" r="24" stroke="#D8D8DF" strokeWidth="8" />
                <line x1="131" y1="126" x2="151" y2="146" stroke="#D8D8DF" strokeWidth="8" strokeLinecap="round" />
                <line x1="131" y1="126" x2="151" y2="146" stroke="#D8D8DF" strokeWidth="10" strokeLinecap="round" />
                {/* Magnifying Glass Inner White */}
                <circle cx="115" cy="110" r="20" fill="white" />
                {/* Red Cross */}
                <line x1="105" y1="100" x2="125" y2="120" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
                <line x1="125" y1="100" x2="105" y2="120" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">No assignments yet</h3>
            <p className="text-sm text-zinc-500 text-center max-w-[420px] mb-8 leading-relaxed">
              Create your first assignment to start collecting and grading student
              submissions. You can set up rubrics, define marking criteria, and let AI
              assist with grading.
            </p>
            <button
              onClick={() => router.push("/create-assignment")}
              className="flex items-center gap-2 rounded-full bg-[#1A1A1A] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              <Plus className="size-4" />
              <span>Create Your First Assignment</span>
            </button>
          </main>
        ) : (
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment._id}
                  id={assignment._id}
                  title={assignment.title}
                  assignedOn={formatDate(assignment.createdAt)}
                  dueDate={formatDate(assignment.dueDate)}
                  status={assignment.status}
                  onView={(id) => router.push(`/assignments/${id}`)}
                  onDelete={(id) => console.log("Delete", id)}
                />
              ))}
              {filteredAssignments.length === 0 && (
                <div className="col-span-1 md:col-span-2 py-10 text-center">
                  <p className="text-sm text-zinc-500">
                    No assignments found matching &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}
            </div>
          </main>
        )}
      </div>

      {/* Floating Create Assignment Button (Desktop) */}
      {!loading && !error && assignments.length > 0 && (
        <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-20 pl-[244px]">
          <button
            onClick={() => router.push("/create-assignment")}
            className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-zinc-700 hover:shadow-xl"
          >
            <Plus className="size-4" />
            Create Assignment
          </button>
        </div>
      )}

      {/* Mobile Fixed Navigation & FAB (hidden on desktop natively via component) */}
      <MobileNav activeItem={activeNav} onNavChange={setActiveNav} />
      <MobileFab />
    </div>
  )
}
