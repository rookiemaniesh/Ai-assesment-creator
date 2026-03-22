"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  loginAccount,
  registerAccount,
  AUTH_TOKEN_KEY,
} from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<"login" | "register">("login")

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(AUTH_TOKEN_KEY)) {
      router.replace("/")
    }
  }, [router])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [loginUser, setLoginUser] = useState({ username: "", password: "" })
  const [reg, setReg] = useState({
    username: "",
    schoolName: "",
    schoolAddress: "",
    password: "",
  })

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await loginAccount(loginUser)
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await registerAccount(reg)
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-200 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-zinc-200">
        <h1 className="text-xl font-semibold text-foreground">VedaAI</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Sign in or create a school profile
        </p>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 rounded-full py-2 text-sm font-medium ${
              tab === "login"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-muted-foreground"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 rounded-full py-2 text-sm font-medium ${
              tab === "register"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-muted-foreground"
            }`}
          >
            Register
          </button>
        </div>

        {error ? (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {tab === "login" ? (
          <form onSubmit={onLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                value={loginUser.username}
                onChange={(e) =>
                  setLoginUser((s) => ({ ...s, username: e.target.value }))
                }
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                value={loginUser.password}
                onChange={(e) =>
                  setLoginUser((s) => ({ ...s, password: e.target.value }))
                }
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {loading ? "…" : "Sign in"}
            </button>
          </form>
        ) : (
          <form onSubmit={onRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                value={reg.username}
                onChange={(e) =>
                  setReg((s) => ({ ...s, username: e.target.value }))
                }
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">School name</label>
              <input
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                value={reg.schoolName}
                onChange={(e) =>
                  setReg((s) => ({ ...s, schoolName: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">School address</label>
              <textarea
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm min-h-[72px]"
                value={reg.schoolAddress}
                onChange={(e) =>
                  setReg((s) => ({ ...s, schoolAddress: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                value={reg.password}
                onChange={(e) =>
                  setReg((s) => ({ ...s, password: e.target.value }))
                }
                autoComplete="new-password"
                minLength={8}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {loading ? "…" : "Create account"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="underline hover:text-foreground">
            Back to dashboard
          </Link>
        </p>
      </div>
      <p className="mt-4 text-xs text-muted-foreground max-w-md text-center">
        Token stored in <code className="bg-zinc-100 px-1 rounded">{AUTH_TOKEN_KEY}</code>{" "}
        — sign in before creating assignments.
      </p>
    </div>
  )
}
