"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function MobileFab() {
  const router = useRouter()

  return (
    <div className="fixed bottom-28 right-6 z-40 md:hidden">
      <button
        onClick={() => router.push("/create-assignment")}
        className="flex size-14 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="size-6 text-red-500" strokeWidth={2.5} />
      </button>
    </div>
  )
}
