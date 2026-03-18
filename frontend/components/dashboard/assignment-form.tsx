"use client"

import { useState, useCallback } from "react"
import { Upload, Calendar, Plus, X, Minus, Mic } from "lucide-react"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface QuestionRow {
  id: number
  type: string
  count: number
  marks: number
}

const QUESTION_TYPES = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "True/False Questions",
  "Fill in the Blanks",
]

function Stepper({
  value,
  onChange,
}: {
  value: number
  onChange: (val: number) => void
}) {
  return (
    <div className="flex items-center gap-1">

      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex size-6 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100"
      >
        <Minus className="size-3" />
      </button>
      <span className="w-6 text-center text-sm font-medium text-foreground">
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="flex size-6 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100"
      >
        <Plus className="size-3" />
      </button>
    </div>
  )
}

export function AssignmentForm() {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState<Date>()
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [rows, setRows] = useState<QuestionRow[]>([
    { id: 1, type: "Multiple Choice Questions", count: 4, marks: 1 },
    { id: 2, type: "Short Questions", count: 3, marks: 2 },
    { id: 3, type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
    { id: 4, type: "Numerical Problems", count: 5, marks: 5 },
  ])

  const totalQuestions = rows.reduce((s, r) => s + r.count, 0)
  const totalMarks = rows.reduce((s, r) => s + r.count * r.marks, 0)

  const updateRow = (id: number, field: keyof QuestionRow, value: number | string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  const addRow = () => {
    const used = rows.map((r) => r.type)
    const next = QUESTION_TYPES.find((t) => !used.includes(t)) ?? QUESTION_TYPES[0]
    setRows((prev) => [
      ...prev,
      { id: Date.now(), type: next, count: 3, marks: 1 },
    ])
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setFileName(file.name)
  }, [])

  return (
    <div className="flex flex-col">
      {/* Page heading */}
      <div className="mb-3 flex items-center gap-2">
        <span className="size-2 rounded-full bg-green-500" />
        <div>
          <h1 className="text-lg font-semibold text-foreground">Create Assignment</h1>
          <p className="text-xs text-muted-foreground">
            Set up a new assignment for your students
          </p>
        </div>
      </div>

      {/* Progress bar */}


      {/* Scrollable card */}
      <div className="rounded-2xl bg-gray-50 p-5 shadow-sm">
        {/* Section title */}
        <h2 className="text-sm font-semibold text-foreground">Assignment Details</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Basic information about your assignment
        </p>

        {/* File upload */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "mb-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-6 transition-colors",
            dragging
              ? "border-zinc-400 bg-zinc-50"
              : "border-zinc-200 bg-white hover:border-zinc-300"
          )}
        >
          <Upload className="mb-2 size-7 text-zinc-400" />
          <p className="text-sm font-medium text-foreground">
            {fileName ?? "Choose a file or drag & drop it here"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">JPEG, PNG, upto 10MB</p>
          <label className="mt-3 cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-zinc-50">
            Browse Files
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setFileName(f.name)
              }}
            />
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            Upload images of your preferred document/image
          </p>
        </div>


        {/* Due Date */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Due Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "relative flex w-full items-center justify-between rounded-[14px] border border-zinc-200 bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-300",
                  !dueDate && "text-muted-foreground"
                )}
              >
                {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                <Calendar className="size-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50 rounded-[14px]" align="start">
              <CalendarComponent
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Question Type Table */}
        <div className="mb-2">
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 pb-1.5">
            <span className="text-xs font-semibold text-foreground">Question Type</span>
            <span className="text-xs font-semibold text-foreground">No. of Questions</span>
            <span className="text-xs font-semibold text-foreground">Marks</span>
            <span />
          </div>

          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3"
              >
                {/* Dropdown + X button inline */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <select
                      value={row.type}
                      onChange={(e) => updateRow(row.id, "type", e.target.value)}
                      className="w-full appearance-none rounded-3xl border border-zinc-200 bg-white px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-300"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {/* Remove — sits immediately beside the dropdown chevron */}
                  <button
                    onClick={() => removeRow(row.id)}
                    className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-zinc-100 hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                {/* Count stepper */}
                <Stepper
                  value={row.count}
                  onChange={(v) => updateRow(row.id, "count", v)}
                />

                {/* Marks stepper */}
                <Stepper
                  value={row.marks}
                  onChange={(v) => updateRow(row.id, "marks", v)}
                />
              </div>
            ))}
          </div>

          {/* Add row */}
          <button
            onClick={addRow}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="size-4" />
            Add Question Type
          </button>
        </div>

        {/* Totals */}
        <div className="mb-4 flex flex-col items-end gap-0.5 text-xs font-medium text-foreground">
          <span>Total Questions : {totalQuestions}</span>
          <span>Total Marks : {totalMarks}</span>
        </div>

        {/* Additional Info */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Additional Information{" "}
            <span className="font-normal text-muted-foreground">(For better output)</span>
          </label>
          <div className="relative">
            <textarea
              rows={3}
              placeholder="e.g. Generate a question paper for 3 hour exam duration..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
            <button className="absolute bottom-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-zinc-100 text-muted-foreground transition-colors hover:bg-zinc-200 hover:text-foreground">
              <Mic className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
