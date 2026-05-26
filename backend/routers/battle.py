from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.generator import generate_test_cases

router = APIRouter(prefix="/api/battle", tags=["battle"])

class GenerateTestsRequest(BaseModel):
    domain: str
    count: int = Field(default=20)
    difficulty: str = Field(default="balanced")
    question_types: list[str] = Field(default=["Factual", "Reasoning", "Edge Cases"])
    model_a: str = Field(default="")
    model_b: str = Field(default="")

@router.post("/generate-tests")
def generate_tests(payload: GenerateTestsRequest):
    try:
        questions = generate_test_cases(
            domain=payload.domain,
            count=payload.count,
            difficulty=payload.difficulty,
            question_types=payload.question_types,
            model_a=payload.model_a,
            model_b=payload.model_b
        )
        return {
            "success": True,
            "count": len(questions),
            "questions": questions
        }
    except Exception as e:
        error_msg = e.detail if isinstance(e, HTTPException) else str(e)
        return {
            "success": False,
            "error": error_msg
        }
