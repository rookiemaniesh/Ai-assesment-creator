"""
Builds a detailed, structured prompt from assignment details.
Keeps the agent.py clean and the prompt logic testable in isolation.
"""
from __future__ import annotations

from schemas import GenerateRequest


_QUESTION_TYPE_LABELS = {
    "mcq":        "Multiple Choice Questions (4 options, 1 correct)",
    "short":      "Short Answer Questions",
    "long":       "Long Answer / Essay Questions",
    "true-false": "True / False Questions",
}


def build_prompt(req: GenerateRequest) -> str:
    """Return a zero-shot prompt asking the LLM to produce a question paper."""

    type_list = "\n".join(
        f"  - {_QUESTION_TYPE_LABELS.get(t, t)}"
        for t in req.question_types
    )

    context_block = ""
    if req.file_text.strip():
        # Truncate very long texts so we don't overflow the context window
        excerpt = req.file_text.strip()[:4000]
        context_block = f"""
---
REFERENCE MATERIAL (use this as the primary source for question content):
{excerpt}
---
"""

    instructions_block = ""
    if req.additional_instructions.strip():
        instructions_block = (
            f"\nADDITIONAL INSTRUCTIONS FROM TEACHER:\n{req.additional_instructions.strip()}\n"
        )

    return f"""You are an expert teacher creating a question paper.

ASSIGNMENT DETAILS:
  Title:           {req.title}
  Subject:         {req.subject}
  Total Marks:     {req.total_marks}
  Total Questions: {req.num_questions}
  Difficulty:      {req.difficulty}

QUESTION TYPES TO INCLUDE:
{type_list}
{context_block}{instructions_block}

RULES:
1. Organise questions into sections (Section A, Section B, …) — one section per question type.
2. Every question MUST have: number, text, type, difficulty, marks.
3. MCQ questions MUST include an "options" list of exactly 4 strings AND an "answer" field with the correct letter (A/B/C/D).
4. Marks per question should roughly sum to {req.total_marks} total.
5. Question numbers are sequential across all sections (1, 2, 3, …).
6. Do NOT add any commentary or explanation outside the JSON.

OUTPUT FORMAT — respond with valid JSON only, exactly matching this structure:
{{
  "sections": [
    {{
      "label": "Section A",
      "questions": [
        {{
          "number": 1,
          "text": "<question text>",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 1,
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "answer": "A"
        }}
      ]
    }}
  ],
  "total_marks": {req.total_marks}
}}
"""
