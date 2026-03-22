const DEFAULT_API_BASE_URL = "http://localhost:5000"

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
  })

  if (!res.ok) {
    throw new Error("Failed to load assignments")
  }

  const json = (await res.json()) as ApiEnvelope<AssignmentListItem[]>
  return json.data ?? []
}

export type CreateAssignmentPayload = {
  title: string
  subject: string
  dueDate: string
  totalMarks: number
  numQuestions: number
  questionTypes: Array<"mcq" | "short" | "long" | "true-false">
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
  })

  if (!res.ok) {
    throw new Error("Failed to load assignment")
  }

  const json = (await res.json()) as ApiEnvelope<AssignmentDetail>
  return json.data
}

export type QuestionPaperResult = {
  _id: string
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
