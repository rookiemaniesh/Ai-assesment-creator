"use client"

import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { AssignmentForm } from "@/components/dashboard/assignment-form"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function CreateAssignmentPage() {
  const router = useRouter()

  return (
    <div className="relative bg-gray-200 min-h-full">
      {/* Floating Sidebar — fixed so it stays while page scrolls */}
      <Sidebar activeItem="Assignments" onNavChange={() => { }} />

      {/* Sticky top bar — header stays fixed while page scrolls */}
      <div className="sticky top-0 z-20 pl-[244px] pr-4 pt-4 pb-2  backdrop-blur-md">
        <Header
          title="Assignment"
          showBackButton
          onBack={() => router.push("/")}
        />
      </div>

      {/* Main content — offset for sidebar, scrolls naturally */}
      <div className="flex flex-col pl-[244px] pr-4 pb-6">
        {/* Form area */}
        <main className="mt-3 flex flex-col items-center px-4">
          {/* Two-step progress bar — same width as form */}
          <div className="flex w-full max-w-2xl gap-2 mb-3">
            <div className="h-1 flex-1 rounded-full bg-zinc-900" />
            <div className="h-1 flex-1 rounded-full bg-zinc-100" />
          </div>

          {/* Form container with dotted border */}
          <div className="w-full max-w-2xl rounded-2xl border border-white bg-gray-100 p-6">
            <AssignmentForm />
          </div>

          {/* Footer nav */}
          <div className="mt-4 flex w-full max-w-2xl items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50"
            >
              <ArrowLeft className="size-4" />
              Previous
            </button>
            <button className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700">
              Next
              <ArrowRight className="size-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
