import os
import json
from fastapi import HTTPException
from groq import Groq

def generate_test_cases(
    domain: str, 
    count: int, 
    difficulty: str, 
    question_types: list, 
    model_a: str = "", 
    model_b: str = ""
) -> list:
    """
    Generates test questions using the Groq API (llama-3.1-8b-instant).
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("Error: GROQ_API_KEY environment variable is not set.")
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured in backend environment")

    try:
        client = Groq(api_key=api_key)
    except Exception as e:
        print(f"Error creating Groq client: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize Groq client: {str(e)}")

    # Format question types as a string representation
    types_str = ", ".join(question_types)

    # Format models compare section if provided
    models_context = ""
    if model_a and model_b:
        models_context = f"\nThe evaluation will compare these two models: Model A ({model_a}) and Model B ({model_b}). Generate challenging questions that can highlight the strengths, weaknesses, and differences between these specific models."

    prompt = f"""You are an expert benchmark creator for AI models.

Generate {count} test questions for evaluating 
AI models in the domain of: {domain}{models_context}

Requirements:
- Difficulty: {difficulty}
- Include these question types: {types_str}
- Questions must clearly separate good models from bad models
- Questions should be specific to {domain}
- No yes/no questions
- Each question should require a detailed answer

Return ONLY a valid JSON array, nothing else.
No explanation, no markdown, no code blocks.
Just the raw JSON array.

Format:
[
  {{
    "id": 1,
    "question": "question text here",
    "category": "Factual or Reasoning or Edge Cases",
    "difficulty": "easy or medium or hard",
    "expected_keywords": ["keyword1", "keyword2"]
  }}
]"""

    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            max_tokens=2000,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )
        response_text = chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Groq API call failed: {e}")
        raise HTTPException(status_code=500, detail=f"Groq API call failed: {str(e)}")

    # Parse response and strip markdown code blocks/conversational text if any
    try:
        cleaned_text = response_text.strip()
        
        # Extract content between first '[' and last ']' to ignore conversational text
        start_idx = cleaned_text.find('[')
        end_idx = cleaned_text.rfind(']')
        if start_idx != -1 and end_idx != -1:
            cleaned_text = cleaned_text[start_idx:end_idx + 1]
            
        test_cases = json.loads(cleaned_text)
        if not isinstance(test_cases, list):
            raise ValueError("Parsed JSON is not a list")
            
        return test_cases
    except Exception as e:
        print(f"JSON parsing failed for response: {e}")
        print(f"Raw Response Text: {response_text}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse AI response as valid JSON: {str(e)}. Please retry."
        )
