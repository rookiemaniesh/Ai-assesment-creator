"use client"

import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { MobileHeader } from "@/components/dashboard/mobile-header"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { AssignmentForm } from "@/components/dashboard/assignment-form"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useProfile } from "@/hooks/use-profile"

export default function CreateAssignmentPage() {
  const router = useRouter()
  const { profile, profileLoading } = useProfile()

  return (
    <div className="relative bg-[#C9C9C9] md:bg-gray-200 min-h-full">
      {/* Mobile Top Header */}
      <MobileHeader
        userDisplayName={profile?.username}
        profileLoading={profileLoading}
      />

      {/* Floating Sidebar — fixed so it stays while page scrolls (hidden on mobile) */}
      <div className="hidden md:block">
        <Sidebar
          activeItem="Assignments"
          onNavChange={() => {}}
          schoolName={profile?.schoolName}
          schoolAddress={profile?.schoolAddress}
          profileLoading={profileLoading}
        />
      </div>

      {/* Sticky top bar — header stays fixed while page scrolls (Desktop only) */}
      <div className="hidden md:block sticky top-0 z-20 pl-[284px] pr-4 pt-4 pb-2 backdrop-blur-md">
        <Header
          title="Assignment"
          showBackButton
          onBack={() => router.push("/")}
          userDisplayName={profile?.username}
          profileLoading={profileLoading}
        />
      </div>

      {/* Main content — offset for sidebar, scrolls naturally */}
      <div className="flex flex-col pl-4 md:pl-[244px] pr-4 pb-[120px] md:pb-6 pt-20 md:pt-0">
        
        {/* Mobile Page Title area (matches the image) */}
        <div className="flex md:hidden items-center justify-center relative mb-6 w-full max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="absolute left-0 flex size-10 items-center justify-center rounded-full bg-[#E0E0E0] text-zinc-800 transition-colors hover:bg-[#D0D0D0]"
          >
            <ArrowLeft className="size-5" />
          </button>
          <span className="text-[16px] font-bold text-zinc-900">Create Assignment</span>
        </div>

        {/* Form area */}
        <main className="md:mt-3 flex flex-col items-center px-0 md:px-4">
          {/* Two-step progress bar — same width as form */}
          <div className="flex w-full max-w-2xl gap-2 mb-4 md:mb-3">
            <div className="h-1 flex-1 rounded-full bg-zinc-900" />
            <div className="h-1 flex-1 rounded-full bg-zinc-300 md:bg-zinc-100" />
          </div>

          {/* Form container with dotted border */}
          <div className="w-full max-w-2xl rounded-2xl border border-white bg-gray-100 p-6">
            <AssignmentForm />
          </div>

          {/* Footer nav */}
          <div className="mt-4 flex w-full max-w-2xl items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 rounded-full border border-zinc-300 md:bg-white bg-[#ffffff] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50"
            >
              <ArrowLeft className="size-4" />
              Previous
            </button>
            <button
              type="submit"
              form="assignment-form"
              className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Next
              <ArrowRight className="size-4" />
            </button>
          </div>
        </main>
      </div>

      {/* Mobile Fixed Navigation */}
      <MobileNav activeItem="Assignments" onNavChange={() => {}} />
    </div>
  )
}
