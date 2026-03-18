"""
Pydantic v2 schemas shared between the API layer and the PydanticAI agent.
These mirror the TypeScript types in backend/src/models/QuestionPaper.ts.
"""
from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field


# ── Type aliases ──────────────────────────────────────────────────────────────

QuestionType = Literal["mcq", "short", "long", "true-false"]
Difficulty    = Literal["easy", "medium", "hard"]
AnyDifficulty = Literal["easy", "medium", "hard", "mixed"]


# ── LLM output schema (PydanticAI validates against this) ─────────────────────

class Question(BaseModel):
    number:     int            = Field(..., ge=1)
    text:       str            = Field(..., min_length=5)
    type:       QuestionType
    difficulty: Difficulty
    marks:      int            = Field(..., ge=1)
    options:    Optional[list[str]] = Field(
        None,
        description="4 choices for MCQ questions only"
    )
    answer:     Optional[str]  = Field(
        None,
        description="Correct letter (A/B/C/D) for MCQ or model answer for others"
    )


class Section(BaseModel):
    label:     str              = Field(..., description='e.g. "Section A"')
    questions: list[Question]   = Field(..., min_length=1)


class QuestionPaper(BaseModel):
    """Structured output that the AI agent must produce."""
    sections:   list[Section] = Field(..., min_length=1)
    total_marks: int           = Field(..., ge=1)


# ── Incoming request from Node.js worker ─────────────────────────────────────

class GenerateRequest(BaseModel):
    title:                   str
    subject:                 str
    total_marks:             int  = Field(..., alias="totalMarks", ge=1)
    num_questions:           int  = Field(..., alias="numQuestions", ge=1, le=100)
    question_types:          list[QuestionType] = Field(..., alias="questionTypes")
    difficulty:              AnyDifficulty
    additional_instructions: str = Field("", alias="additionalInstructions")
    file_text:               str = Field("", alias="fileText")

    model_config = {"populate_by_name": True}
