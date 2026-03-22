"""
Pydantic v2 schemas shared between the API layer and the PydanticAI agent.
These mirror the TypeScript types in backend/src/models/QuestionPaper.ts.
"""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator


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

class QuestionSpecItem(BaseModel):
    """One row from the teacher UI: how many questions of this type and marks each."""
    question_type:       QuestionType = Field(..., alias="questionType")
    count:               int          = Field(..., ge=1, le=100)
    marks_per_question:  int          = Field(..., ge=1, alias="marksPerQuestion")

    model_config = {"populate_by_name": True}


class GenerateRequest(BaseModel):
    title:                   str
    subject:                 str
    school_name:             str = Field(
        "",
        alias="schoolName",
        description="School name from the teacher profile (header/context).",
    )
    school_address:          str = Field(
        "",
        alias="schoolAddress",
        description="School address from the teacher profile (header/context).",
    )
    total_marks:             int  = Field(..., alias="totalMarks", ge=1)
    num_questions:           int  = Field(..., alias="numQuestions", ge=1, le=100)
    question_types:          list[QuestionType] = Field(..., alias="questionTypes")
    difficulty:              AnyDifficulty
    additional_instructions: str = Field("", alias="additionalInstructions")
    file_text:               str = Field("", alias="fileText")
    question_spec:           Optional[list[QuestionSpecItem]] = Field(
        None,
        alias="questionSpec",
        description="Per-section counts and marks from the UI; when set, the model must follow this exactly.",
    )

    model_config = {"populate_by_name": True}

    @model_validator(mode="after")
    def _question_spec_matches_totals(self) -> "GenerateRequest":
        if not self.question_spec:
            return self
        n = sum(x.count for x in self.question_spec)
        m = sum(x.count * x.marks_per_question for x in self.question_spec)
        if n != self.num_questions:
            raise ValueError(
                f"questionSpec counts sum to {n} but numQuestions is {self.num_questions}"
            )
        if m != self.total_marks:
            raise ValueError(
                f"questionSpec marks sum to {m} but totalMarks is {self.total_marks}"
            )
        return self
