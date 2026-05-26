from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.generator import generate_test_cases
from services.model_runner import run_model, run_both_models

router = APIRouter(prefix="/api/battle", tags=["battle"])

class GenerateTestsRequest(BaseModel):
    domain: str
    count: int = Field(default=20)
    difficulty: str = Field(default="balanced")
    question_types: list[str] = Field(default=["Factual", "Reasoning", "Edge Cases"])
    model_a: str = Field(default="")
    model_b: str = Field(default="")

class RunModelsRequest(BaseModel):
    model_a_id: str
    model_b_id: str
    question: str

class ValidateModelRequest(BaseModel):
    model_id: str

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

@router.post("/run-models")
def run_models(payload: RunModelsRequest):
    return run_both_models(
        model_a_id=payload.model_a_id,
        model_b_id=payload.model_b_id,
        question=payload.question
    )

@router.post("/validate-model")
def validate_model(payload: ValidateModelRequest):
    result = run_model(model_id=payload.model_id, question="Hello, what is 2 + 2?", max_tokens=10)
    
    if result["is_loading"]:
        return {
            "valid": True,
            "model_id": payload.model_id,
            "status": "loading",
            "message": "Model found but still loading"
        }
    
    if result["error"] is not None:
        return {
            "valid": False,
            "model_id": payload.model_id,
            "error": "Model not found on HuggingFace"
        }
        
    return {
        "valid": True,
        "model_id": payload.model_id
    }

