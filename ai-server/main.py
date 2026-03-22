"""
FastAPI entry point for the VedaAI Python AI service.

Endpoints:
  GET  /health    → service health check
  POST /generate  → generate a question paper (called by Node.js BullMQ worker)
"""
from __future__ import annotations

import os
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import GenerateRequest, QuestionPaper
from agent import generate_question_paper

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


# ── App factory ───────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    groq_model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    groq_key   = os.getenv("GROQ_API_KEY", "")
    masked_key = f"{groq_key[:8]}…" if len(groq_key) > 8 else "(not set)"
    logger.info("🤖  VedaAI Python AI service starting…")
    logger.info(f"    Groq model   : {groq_model}")
    logger.info(f"    Groq API key : {masked_key}")
    yield
    logger.info("👋  AI service shutting down.")


app = FastAPI(
    title="VedaAI Question Generation Service",
    description="PydanticAI + Ollama microservice for structured question paper generation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten this in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
    }


@app.post("/generate", response_model=None)
async def generate(req: GenerateRequest) -> dict:
    """
    Receive assignment details from the Node.js worker,
    run the PydanticAI agent, and return the validated question paper.

    The response shape matches what generationWorker.ts expects:
      { sections: [...], totalMarks: number }
    """
    logger.info(f"📝  Generate request — subject={req.subject!r}, marks={req.total_marks}, q={req.num_questions}")

    try:
        paper: QuestionPaper = await generate_question_paper(req)
    except Exception as exc:
        logger.error(f"❌  Generation failed: {exc}")
        raise HTTPException(status_code=502, detail=f"LLM generation failed: {exc}") from exc

    # Serialise using Pydantic's alias-aware mode so Node.js receives camelCase
    paper_dict = paper.model_dump()

    # Map Python snake_case → camelCase expected by the Node.js worker
    return {
        "sections": [
            {
                "label": s["label"],
                "questions": [
                    {
                        "number":     q["number"],
                        "text":       q["text"],
                        "type":       q["type"],
                        "difficulty": q["difficulty"],
                        "marks":      q["marks"],
                        **({"options": q["options"]} if q.get("options") else {}),
                        **({"answer":  q["answer"]}  if q.get("answer")  else {}),
                    }
                    for q in s["questions"]
                ],
            }
            for s in paper_dict["sections"]
        ],
        "totalMarks": paper_dict["total_marks"],
    }


# ── Dev entrypoint ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
