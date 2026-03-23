"""
PydanticAI agent configured to use Groq's llama-3.1-8b-instant model.
Groq provides ultra-fast inference via their LPU hardware.
"""
from __future__ import annotations

import os
from dotenv import load_dotenv

from pydantic_ai import Agent
from pydantic_ai.models.groq import GroqModel

from schemas import GenerateRequest, QuestionPaper
from prompt_builder import build_prompt

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL   = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

# ── Model ─────────────────────────────────────────────────────────────────────
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is missing. Set it in ai-server/.env")

# Newer pydantic-ai versions read auth from the environment (GROQ_API_KEY).
_model = GroqModel(GROQ_MODEL)

# ── Agent ─────────────────────────────────────────────────────────────────────
_agent = Agent(
    _model,
    output_type=QuestionPaper,
    system_prompt=(
        "You are an expert teacher and exam paper setter. "
        "You MUST obey the user's question counts, section layout, marks per question, and total marks exactly. "
        "When parsed PDF context is provided, ground question stems and answers in that context (do not invent facts). "
        "Never add or remove questions relative to the specification. "
        "Output only structured data matching the QuestionPaper schema — no markdown fences, no prose outside JSON."
    ),
)


async def generate_question_paper(req: GenerateRequest) -> QuestionPaper:
    """Run the Groq agent and return a validated QuestionPaper."""
    prompt = build_prompt(req)
    result = await _agent.run(prompt)
    return result.output
