"""
Builds a detailed, structured prompt from assignment details.
Keeps the agent.py clean and the prompt logic testable in isolation.
"""
from __future__ import annotations

from schemas import GenerateRequest, QuestionSpecItem

_QUESTION_TYPE_LABELS = {
    "mcq":        "Multiple Choice (exactly 4 options A–D; one correct; answer is A, B, C, or D)",
    "short":      "Short Answer",
    "long":       "Long Answer / Essay",
    "true-false": "True / False (answer must be the string \"True\" or \"False\")",
}


def _spec_lines(spec: list[QuestionSpecItem]) -> list[str]:
    lines: list[str] = []
    letter = ord("A")
    for item in spec:
        label = chr(letter)
        subtotal = item.count * item.marks_per_question
        q_label = _QUESTION_TYPE_LABELS.get(item.question_type, item.question_type)
        lines.append(
            f'  • Section {label} — {item.count} question(s) of type "{item.question_type}" '
            f"({q_label}); EACH question worth exactly {item.marks_per_question} mark(s); "
            f"subsection total = {subtotal} mark(s)."
        )
        letter += 1
    return lines


def build_prompt(req: GenerateRequest) -> str:
    """Return a prompt that forces the LLM to match the teacher's counts and marks."""

    type_list = "\n".join(
        f"  - {_QUESTION_TYPE_LABELS.get(t, t)} (JSON type value: \"{t}\")"
        for t in req.question_types
    )

    context_block = ""
    if req.file_text.strip():
        excerpt = req.file_text.strip()[:4000]
        context_block = f"""
---
REFERENCE MATERIAL (primary source for what to ask about):
{excerpt}
---
"""

    instructions_block = ""
    if req.additional_instructions.strip():
        instructions_block = (
            f"\nADDITIONAL INSTRUCTIONS FROM THE TEACHER:\n{req.additional_instructions.strip()}\n"
        )

    # ── Blueprint from UI (exact counts per type) ─────────────────────────────
    blueprint_block = ""
    if req.question_spec and len(req.question_spec) > 0:
        spec_lines = "\n".join(_spec_lines(req.question_spec))
        blueprint_block = f"""
MANDATORY BLUEPRINT (the teacher configured this in the app — follow EXACTLY):
{spec_lines}

BLUEPRINT CHECKS (you must satisfy all of these):
  • Total question count = {req.num_questions} (sum of all sections' questions).
  • Total marks = {req.total_marks} (sum of every question's "marks" field).
  • For each blueprint line: that section has exactly that many questions, that JSON "type",
    and every question in that section has exactly that many marks (no mixing mark values within the section).
  • Question numbers run 1 … {req.num_questions} in order across sections (Section A first, then B, …).
"""

    # ── When no spec: infer strict totals from aggregates only ────────────────
    fallback_distribution = ""
    if not req.question_spec:
        n_types = len(req.question_types)
        fallback_distribution = f"""
Without a per-type breakdown, you only know these aggregates:
  • Use EXACTLY {req.num_questions} questions in total.
  • Sum of all questions' "marks" must equal EXACTLY {req.total_marks}.
  • Include every question type listed at least once: {", ".join(req.question_types)}.
  • Split the {req.num_questions} questions across one section per type (in the order listed).
  • Split question counts across types as evenly as possible in whole numbers (e.g. 7 questions, 2 types → 4+3).
  • Split total marks across questions as whole numbers; prefer equal marks per question when possible.
"""

    diff = req.difficulty
    diff_note = (
        f'Use difficulty "{diff}" for every question.'
        if diff != "mixed"
        else 'Vary difficulty across questions: some "easy", some "medium", some "hard" (still valid JSON).'
    )

    school_block = ""
    name = (req.school_name or "").strip()
    addr = (req.school_address or "").strip()
    if name or addr:
        school_block = "\nISSUING SCHOOL (from the teacher's profile — weave into question stems where natural, e.g. \"At our school, …\"; keep JSON structure unchanged):\n"
        if name:
            school_block += f"  School name:    {name}\n"
        if addr:
            school_block += f"  School address: {addr}\n"

    return f"""You generate ONE exam question paper as structured JSON for the teacher's app.

SUBJECT & PAPER:
  Title:   {req.title}
  Subject: {req.subject}
{school_block}  Overall difficulty setting: {req.difficulty} — {diff_note}

QUESTION TYPES ALLOWED (JSON "type" must be one of these strings):
{type_list}
{blueprint_block}{fallback_distribution}{context_block}{instructions_block}

HARD RULES (violation means the response is wrong):
1) Output is JSON ONLY — no markdown, no code fences, no commentary before or after.
2) Top-level keys exactly: "sections" (array) and "total_marks" (integer).
3) "total_marks" MUST equal {req.total_marks} (same as the sum of every question's "marks").
4) Total number of question objects across ALL sections MUST be exactly {req.num_questions}.
5) Each question object MUST include: "number", "text", "type", "difficulty", "marks".
6) MCQ ("type": "mcq"): MUST include "options": [four strings] and "answer": one of "A","B","C","D"
   (options may be prefixed like "A. ..." or plain text; answer is ONLY the letter).
7) true-false: include "answer": "True" or "False".
8) short / long: include a brief "answer" (model answer or key points) when appropriate.
9) Do not invent extra sections or question types beyond what the blueprint / rules require.

JSON SHAPE (illustrative — yours must match counts and marks from above):
{{
  "sections": [
    {{
      "label": "Section A",
      "questions": [
        {{
          "number": 1,
          "text": "…",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 1,
          "options": ["A. …", "B. …", "C. …", "D. …"],
          "answer": "B"
        }}
      ]
    }}
  ],
  "total_marks": {req.total_marks}
}}
"""
