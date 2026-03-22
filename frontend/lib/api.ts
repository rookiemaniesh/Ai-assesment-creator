const DEFAULT_API_BASE_URL = "http://localhost:5001"

export const AUTH_TOKEN_KEY = "vedaai-token"

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {}
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_BASE_URL

export const WS_BASE_URL = API_BASE_URL.replace(/^http/i, "ws")

type ApiEnvelope<T> = {
  success: boolean
  message?: string
  data: T
}

export type AssignmentListItem = {
  _id: string
  profileId: string
  title: string
  subject: string
  dueDate: string
  createdAt: string
  status: "pending" | "processing" | "completed" | "failed"
}

export async function fetchAssignments(): Promise<AssignmentListItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/assignments`, {
    method: "GET",
    cache: "no-store",
    headers: { ...authHeaders() },
  })

  if (!res.ok) {
    throw new Error("Failed to load assignments")
  }

  if (res.status === 401) {
    throw new Error("Please sign in to view assignments.")
  }

  const json = (await res.json()) as ApiEnvelope<AssignmentListItem[]>
  return json.data ?? []
}

export type QuestionSpecEntry = {
  questionType: "mcq" | "short" | "long" | "true-false"
  count: number
  marksPerQuestion: number
}

export type CreateAssignmentPayload = {
  title: string
  subject: string
  dueDate: string
  totalMarks: number
  numQuestions: number
  questionTypes: Array<"mcq" | "short" | "long" | "true-false">
  /** Exact counts and marks per question — must match totalMarks / numQuestions */
  questionSpec: QuestionSpecEntry[]
  difficulty: "easy" | "medium" | "hard" | "mixed"
  additionalInstructions?: string
  clientId?: string
  file?: File
}

export type CreateAssignmentResponse = {
  assignmentId: string
  jobId?: string
  status: string
}

export async function createAssignment(
  payload: CreateAssignmentPayload
): Promise<CreateAssignmentResponse> {
  const formData = new FormData()
  formData.append("title", payload.title)
  formData.append("subject", payload.subject)
  formData.append("dueDate", payload.dueDate)
  formData.append("totalMarks", String(payload.totalMarks))
  formData.append("numQuestions", String(payload.numQuestions))
  formData.append("difficulty", payload.difficulty)
  formData.append("questionSpec", JSON.stringify(payload.questionSpec))
  payload.questionTypes.forEach((questionType) =>
    formData.append("questionTypes", questionType)
  )

  if (payload.additionalInstructions?.trim()) {
    formData.append("additionalInstructions", payload.additionalInstructions.trim())
  }

  if (payload.clientId?.trim()) {
    formData.append("clientId", payload.clientId.trim())
  }

  if (payload.file) {
    formData.append("file", payload.file)
  }

  const res = await fetch(`${API_BASE_URL}/api/assignments`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  })

  const json = (await res.json()) as
    | ApiEnvelope<CreateAssignmentResponse>
    | { success: false; message?: string; errors?: Record<string, string[]> }

  if (!res.ok || !("success" in json) || !json.success) {
    const fieldErrors =
      "errors" in json && json.errors
        ? Object.values(json.errors).flat().join(", ")
        : ""
    const message =
      ("message" in json && json.message) || fieldErrors || "Failed to create assignment"
    throw new Error(message)
  }

  return json.data
}

export type AssignmentDetail = AssignmentListItem & {
  totalMarks: number
  numQuestions: number
  questionTypes: string[]
  difficulty: string
  additionalInstructions?: string
}

export async function fetchAssignment(id: string): Promise<AssignmentDetail> {
  const res = await fetch(`${API_BASE_URL}/api/assignments/${id}`, {
    method: "GET",
    cache: "no-store",
    headers: { ...authHeaders() },
  })

  if (!res.ok) {
    throw new Error("Failed to load assignment")
  }

  const json = (await res.json()) as ApiEnvelope<AssignmentDetail>
  return json.data
}

export type QuestionPaperResult = {
  _id: string
  profileId: string
  assignmentId: string
  sections: Array<{
    label: string
    questions: Array<{
      number: number
      text: string
      type: string
      marks: number
      difficulty: string
      options?: string[]
      answer?: string
    }>
  }>
  totalMarks: number
  generatedAt: string
}

export async function fetchAssignmentResult(id: string): Promise<QuestionPaperResult> {
  const res = await fetch(`${API_BASE_URL}/api/assignments/${id}/result`, {
    method: "GET",
    cache: "no-store",
    headers: { ...authHeaders() },
  })

  if (!res.ok) {
    if (res.status === 202) {
      throw new Error("Generation is still in progress")
    }
    if (res.status === 422) {
      throw new Error("Generation failed")
    }
    throw new Error("Failed to load assignment result")
  }

  const json = (await res.json()) as ApiEnvelope<QuestionPaperResult>
  return json.data
}

// ─── Auth (JWT) ───────────────────────────────────────────────────────────────

export type ProfilePublic = {
  id: string
  username: string
  schoolName: string
  schoolAddress: string
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

export async function registerAccount(input: {
  username: string
  schoolName: string
  schoolAddress: string
  password: string
}): Promise<{ token: string; profile: ProfilePublic }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const json = (await res.json()) as
    | { success: true; data: { token: string; profile: ProfilePublic } }
    | { success: false; message?: string; errors?: Record<string, string[]> }

  if (!res.ok || !json.success) {
    const msg =
      ("errors" in json && json.errors && Object.values(json.errors).flat().join(", ")) ||
      ("message" in json && json.message) ||
      "Registration failed"
    throw new Error(msg)
  }
  setAuthToken(json.data.token)
  return json.data
}

export async function loginAccount(input: {
  username: string
  password: string
}): Promise<{ token: string; profile: ProfilePublic }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const json = (await res.json()) as
    | { success: true; data: { token: string; profile: ProfilePublic } }
    | { success: false; message?: string; errors?: Record<string, string[]> }

  if (!res.ok || !json.success) {
    const msg =
      ("errors" in json && json.errors && Object.values(json.errors).flat().join(", ")) ||
      ("message" in json && json.message) ||
      "Login failed"
    throw new Error(msg)
  }
  setAuthToken(json.data.token)
  return json.data
}

export function logoutAccount(): void {
  setAuthToken(null)
}

export async function fetchMe(): Promise<ProfilePublic> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "GET",
    cache: "no-store",
    headers: { ...authHeaders() },
  })
  if (res.status === 401) {
    throw new Error("Not signed in")
  }
  if (!res.ok) {
    throw new Error("Failed to load profile")
  }
  const json = (await res.json()) as ApiEnvelope<ProfilePublic>
  return json.data
}

/** Returns profile when signed in; `null` when not authenticated or on failure (no throw). */
export async function fetchProfileOptional(): Promise<ProfilePublic | null> {
  try {
    return await fetchMe()
  } catch {
    return null
  }
}
