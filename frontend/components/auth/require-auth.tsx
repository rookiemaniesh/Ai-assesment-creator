"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AUTH_TOKEN_KEY } from "@/lib/api"

/**
 * Blocks rendering until a JWT exists in localStorage; otherwise redirects to `/login`.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
      router.replace("/login")
      return
    }
    setAllowed(true)
  }, [router])

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-200">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}
