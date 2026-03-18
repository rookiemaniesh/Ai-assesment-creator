"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { EmptyState } from "@/components/dashboard/empty-state"

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState("Assignments")
  const router = useRouter()

  return (
    <div className="relative min-h-screen bg-zinc-200">
      {/* Floating Sidebar — always visible, overlays the main content */}
      <Sidebar activeItem={activeNav} onNavChange={setActiveNav} />

      {/* Main content — full width, sidebar floats on top */}
      <div className="min-h-screen pl-[244px] pr-4 pt-4 pb-4">
        {/* Floating Header */}
        <Header title="Assignment" />

        {/* Content Area */}
        <main className="mt-3 flex min-h-[calc(100vh-5.5rem)] items-center justify-center">
          <EmptyState
            title="No assignments yet"
            description="Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading."
            actionLabel="Create Your First Assignment"
            onAction={() => router.push("/create-assignment")}
          />
        </main>
      </div>
    </div>
  )
}
