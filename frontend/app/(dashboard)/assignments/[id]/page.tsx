"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { fetchAssignment, fetchAssignmentResult, type AssignmentDetail, type QuestionPaperResult } from "@/lib/api"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { useProfile } from "@/hooks/use-profile"

export default function AssignmentViewPage() {
  const { profile, profileLoading } = useProfile()
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null)
  const [result, setResult] = useState<QuestionPaperResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const pdfContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [assignmentData, resultData] = await Promise.all([
          fetchAssignment(id),
          fetchAssignmentResult(id).catch((err: unknown) => {
            throw err
          }),
        ])

        setAssignment(assignmentData)
        setResult(resultData)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load assignment details"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [id])

  const handleDownloadPdf = () => {
    window.print()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-GB")
  }

  return (
    <div className="relative min-h-screen bg-zinc-200 print:bg-white print:min-h-0">
      <div className="print:hidden">
        <Sidebar
          activeItem="Assignments"
          onNavChange={() => {}}
          schoolName={profile?.schoolName}
          schoolAddress={profile?.schoolAddress}
          profileLoading={profileLoading}
        />
      </div>

      <div className="min-h-screen pl-[284px] pr-4 pt-4 pb-24 print:p-0 print:m-0 print:min-h-0">
        <div className="print:hidden">
          <Header
            title="View Assignment"
            userDisplayName={profile?.username}
            profileLoading={profileLoading}
          />
        </div>

        <main className="mt-4 rounded-2xl bg-zinc-100 p-5 min-h-[calc(100vh-100px)] print:m-0 print:p-0 print:bg-white print:min-h-0">
          {/* Top Bar Navigation & Actions */}
          <div className="flex items-center justify-between mb-6 print:hidden">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Assignments
            </button>

            {result && (
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-zinc-700 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Download className="size-4" />
                {downloading ? "Generating PDF..." : "Download as PDF"}
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="size-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900"></div>
              <p className="mt-4 text-sm text-zinc-500">Loading assignment data...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <FileText className="mx-auto size-12 text-red-500 opacity-50 mb-3" />
              <h3 className="text-lg font-medium text-red-900 mb-1">Could not load assignment</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : assignment && result ? (
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
              <div
                id="pdf-content"
                ref={pdfContentRef}
                className="p-8 md:p-12 xl:p-16 max-w-4xl mx-auto bg-white text-zinc-900 print:p-0 print:shadow-none"
              >
                <div className="text-center mb-10 border-b border-zinc-200 pb-8">
                  <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Delhi Public School, Sector-4, Bokaro
                  </h1>
                  <h2 className="text-xl font-semibold text-zinc-700 mb-1">
                    Subject: {assignment.subject}
                  </h2>
                  <h3 className="text-lg font-medium text-zinc-600">
                    Grade: 8th {/* Or derive from assignment config if present */}
                  </h3>
                </div>

                <div className="flex justify-between text-sm font-medium text-zinc-800 mb-8 pb-4 border-b border-zinc-100">
                  <span>Time Allowed: 45 minutes</span>
                  <span>Maximum Marks: {assignment.totalMarks}</span>
                </div>

                <div className="text-sm font-medium text-zinc-600 mb-8 italic">
                  All questions are compulsory unless stated otherwise.
                </div>

                <div className="flex flex-col gap-3 mb-12 text-sm">
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold min-w-[100px]">Name:</span>
                    <div className="border-b border-zinc-400 flex-1 max-w-[300px]"></div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold min-w-[100px]">Roll Number:</span>
                    <div className="border-b border-zinc-400 flex-1 max-w-[300px]"></div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold min-w-[100px]">Section:</span>
                    <div className="border-b border-zinc-400 flex-1 max-w-[300px]"></div>
                  </div>
                </div>

                <div className="space-y-12">
                  {result.sections?.map((section, sIdx) => (
                    <div key={sIdx}>
                      <h4 className="text-center text-xl font-bold mb-4">{section.label}</h4>
                      <p className="text-sm italic text-zinc-600 mb-6 text-center">
                        Attempt all questions.
                      </p>

                      <div className="space-y-6">
                        {section.questions.map((q, qIdx) => (
                          <div key={q.number || qIdx} className="flex gap-4 text-base">
                            <span className="font-semibold shrink-0">{q.number || qIdx + 1}.</span>
                            <div className="flex-1">
                              <p className="mb-2">
                                <span className="font-medium text-zinc-500 mr-2">
                                  [
                                  {q.difficulty
                                    ? q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)
                                    : "Mixed"}
                                  ]
                                </span>
                                {q.text}
                                <span className="ml-2 font-medium text-zinc-500">[{q.marks} Marks]</span>
                              </p>

                              {q.type === "mcq" && q.options && q.options.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pl-2">
                                  {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-start gap-2">
                                      <span className="font-medium text-zinc-600">
                                        {String.fromCharCode(97 + oIdx)})
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {(q.type === "short" || q.type === "long") && (
                                <div className="mt-4 space-y-4">
                                  {Array.from({ length: q.type === "long" ? 6 : 3 }).map((_, lIdx) => (
                                    <div key={lIdx} className="border-b border-dashed border-zinc-300 w-full"></div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  End of Question Paper
                </div>

                <div className="mt-20 pt-10 border-t-2 border-dashed border-zinc-200 html2pdf__page-break">
                  <h4 className="text-xl font-bold mb-6 flex justify-between items-center">
                    <span>Answer Key</span>
                    <span className="text-sm font-normal text-zinc-500">Teachers Only</span>
                  </h4>
                  <div className="space-y-10 text-sm text-zinc-700">
                    {result.sections?.map((section, sIdx) => (
                      <div key={`ans-sec-${sIdx}`}>
                        <h5 className="font-semibold text-lg mb-4 text-zinc-800 border-b border-zinc-100 pb-2">
                          {section.label}
                        </h5>
                        <div className="space-y-6">
                          {section.questions.map((q, qIdx) => (
                            <div key={`ans-${q.number || qIdx}`} className="flex gap-4">
                              <span className="font-semibold shrink-0">{q.number || qIdx + 1}.</span>
                              <div>
                                {q.answer ? (
                                  <p className="mb-1">
                                    <span className="font-semibold text-zinc-900">Answer:</span> {q.answer}
                                  </p>
                                ) : (
                                  <p className="italic text-zinc-400">No answer key provided.</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
