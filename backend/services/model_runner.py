import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_model(model_id: str, question: str, max_tokens: int = 300) -> dict:
    """
    Runs a single question against a HuggingFace Inference API model.
    """
    # 8. Add input sanitization before calling API:
    # - Strip whitespace from question
    # - Limit question to 500 characters max
    # - If question empty raise ValueError
    try:
        if not question:
            raise ValueError("Question cannot be empty.")
            
        sanitized_question = question.strip()
        if not sanitized_question:
            raise ValueError("Question cannot be empty after stripping whitespace.")
            
        if len(sanitized_question) > 500:
            sanitized_question = sanitized_question[:500]
            
        # 1. Load HF_TOKEN from environment
        hf_token = os.getenv("HF_TOKEN", "")
        
        # 2. Build the API URL
        url = f"https://api-inference.huggingface.co/models/{model_id}"
        
        # 3. Set headers:
        # Authorization: Bearer {HF_TOKEN}
        # Content-Type: application/json
        headers = {
            "Authorization": f"Bearer {hf_token}",
            "Content-Type": "application/json"
        }
        
        # 4. Build payload
        payload = {
            "inputs": sanitized_question,
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": 0.7,
                "return_full_text": False,
                "do_sample": True
            }
        }
        
        # 5. Make POST request using requests library (timeout: 30 seconds)
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        # Parse response as JSON if possible
        try:
            data = response.json()
        except Exception:
            # If not JSON, check status code and raise
            response.raise_for_status()
            raise ValueError(f"HuggingFace API response was not JSON: {response.text}")
            
        # 6. Handle response formats:
        # Case 5: model still loading
        # data = {"error": "Model ... is currently loading"}
        # return None and set is_loading = True
        if isinstance(data, dict) and "error" in data:
            error_msg = data["error"]
            if isinstance(error_msg, str) and "is currently loading" in error_msg:
                return {
                    "response": None,
                    "model_id": model_id,
                    "is_loading": True,
                    "error": "Model is loading, retry in 20 seconds"
                }
            # Other API error
            return {
                "response": None,
                "model_id": model_id,
                "is_loading": False,
                "error": error_msg
            }
            
        # Case 1: list with generated_text
        # Case 2: list with translation_text
        # Case 3: list with summary_text
        # Case 4: dict with generated_text
        # Case 6: any other format (return str(data) as fallback)
        
        answer_text = None
        if isinstance(data, list) and len(data) > 0:
            item = data[0]
            if isinstance(item, dict):
                if "generated_text" in item:
                    answer_text = item["generated_text"]
                elif "translation_text" in item:
                    answer_text = item["translation_text"]
                elif "summary_text" in item:
                    answer_text = item["summary_text"]
        elif isinstance(data, dict):
            if "generated_text" in data:
                answer_text = data["generated_text"]
                
        if answer_text is None:
            # Fallback if no matching standard key was found but no error was present
            answer_text = str(data)
            
        return {
            "response": answer_text,
            "model_id": model_id,
            "is_loading": False,
            "error": None
        }
        
    except Exception as e:
        # Print all errors to console for debugging
        print(f"Error running model '{model_id}': {e}")
        return {
            "response": None,
            "model_id": model_id,
            "is_loading": False,
            "error": str(e)
        }

def run_both_models(model_a_id: str, model_b_id: str, question: str) -> dict:
    """
    Calls run_model sequentially for model_a_id and model_b_id.
    """
    result_a = run_model(model_id=model_a_id, question=question)
    result_b = run_model(model_id=model_b_id, question=question)
    
    return {
        "question": question,
        "model_a": result_a,
        "model_b": result_b
    }
