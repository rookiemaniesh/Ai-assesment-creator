import { RequireAuth } from "@/components/auth/require-auth"

/**
 * All routes in this group require login (JWT in localStorage).
 * URLs are unchanged: `/`, `/create-assignment`, `/assignments/[id]`.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireAuth>{children}</RequireAuth>
}
