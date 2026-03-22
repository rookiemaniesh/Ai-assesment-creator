"use client"

import { useEffect, useState } from "react"
import { fetchProfileOptional, type ProfilePublic } from "@/lib/api"

/** Loads `/api/auth/me` once (JWT from `localStorage`). */
export function useProfile() {
  const [profile, setProfile] = useState<ProfilePublic | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setProfileLoading(true)
      const p = await fetchProfileOptional()
      if (!cancelled) {
        setProfile(p)
        setProfileLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { profile, profileLoading }
}
