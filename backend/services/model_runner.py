import os
import socket
import requests
import urllib3
import ssl
import certifi
from groq import Groq
from dotenv import load_dotenv

# Disable SSL verification warnings for direct-IP HTTPS DNS requests
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Load environment variables
load_dotenv()

# Custom DNS-over-HTTP (DoH) resolver patch for HuggingFace
original_getaddrinfo = socket.getaddrinfo

def custom_resolve(host):
    """
    Bypasses broken system DNS resolvers by trying Google DoH,
    Cloudflare DoH, and falling back to a static CloudFront IP.
    """
    if host == "api-inference.huggingface.co":
        # 1. Try Google DoH over HTTPS (raw IP to prevent recursion)
        try:
            url = "https://8.8.8.8/resolve?name=api-inference.huggingface.co&type=A"
            r = requests.get(url, headers={"Host": "dns.google"}, verify=False, timeout=3)
            data = r.json()
            if "Answer" in data:
                for ans in data["Answer"]:
                    if ans.get("type") == 1:
                        return ans["data"]
        except Exception as e:
            print(f"Google DoH failed: {e}")
            
        # 2. Try Cloudflare DoH over HTTPS (raw IP to prevent recursion)
        try:
            url = "https://1.1.1.1/dns-query?name=api-inference.huggingface.co&type=A"
            r = requests.get(url, headers={"Host": "cloudflare-dns.com", "Accept": "application/dns-json"}, verify=False, timeout=3)
            data = r.json()
            if "Answer" in data:
                for ans in data["Answer"]:
                    if ans.get("type") == 1:
                        return ans["data"]
        except Exception as e:
            print(f"Cloudflare DoH failed: {e}")

        # 3. Fallback to a verified stable AWS CloudFront IP range for HuggingFace
        # Since api-inference.huggingface.co is routed via CloudFront, any valid CloudFront edge IP works when Host header is correct.
        print("Falling back to static CloudFront IP for Hugging Face")
        return "18.244.164.120"
    return None

def patched_getaddrinfo(host, port, *args, **kwargs):
    if host == "api-inference.huggingface.co":
        ip = custom_resolve(host)
        if ip:
            return [(socket.AF_INET, socket.SOCK_STREAM, socket.IPPROTO_TCP, '', (ip, port))]
    return original_getaddrinfo(host, port, *args, **kwargs)

socket.getaddrinfo = patched_getaddrinfo

# Known Groq models list
GROQ_MODELS = {
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "llama3-8b-8192",
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
    "gemma2-9b-it"
}

def run_model_hf(model_id: str, question: str, max_tokens: int = 300) -> dict:
    """Runs model using Hugging Face Inference API."""
    try:
        hf_token = os.getenv("HF_TOKEN", "")
        url = f"https://api-inference.huggingface.co/models/{model_id}"
        headers = {
            "Authorization": f"Bearer {hf_token}",
            "Content-Type": "application/json"
        }
        payload = {
            "inputs": question,
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": 0.7,
                "return_full_text": False,
                "do_sample": True
            }
        }
        response = requests.post(url, headers=headers, json=payload, timeout=30, verify=certifi.where())
        try:
            data = response.json()
        except Exception:
            response.raise_for_status()
            raise ValueError(f"HuggingFace API response was not JSON: {response.text}")
            
        if isinstance(data, dict) and "error" in data:
            error_msg = data["error"]
            if isinstance(error_msg, str) and "is currently loading" in error_msg:
                return {
                    "response": None,
                    "model_id": model_id,
                    "is_loading": True,
                    "error": "Model is loading, retry in 20 seconds"
                }
            return {
                "response": None,
                "model_id": model_id,
                "is_loading": False,
                "error": error_msg
            }
            
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
            answer_text = str(data)
            
        return {
            "response": answer_text,
            "model_id": model_id,
            "is_loading": False,
            "error": None
        }
    except Exception as e:
        print(f"HuggingFace API error: {e}")
        return {
            "response": None,
            "model_id": model_id,
            "is_loading": False,
            "error": str(e)
        }

def run_model_groq(model_id: str, question: str, max_tokens: int = 300) -> dict:
    """Runs model using Groq API."""
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set.")
        client = Groq(api_key=api_key)
        chat_completion = client.chat.completions.create(
            model=model_id,
            messages=[{"role": "user", "content": question}],
            max_tokens=max_tokens,
            temperature=0.7
        )
        response_text = chat_completion.choices[0].message.content
        return {
            "response": response_text,
            "model_id": model_id,
            "is_loading": False,
            "error": None
        }
    except Exception as e:
        print(f"Groq API error: {e}")
        return {
            "response": None,
            "model_id": model_id,
            "is_loading": False,
            "error": str(e)
        }

def run_model(model_id: str, question: str, max_tokens: int = 300) -> dict:
    """
    Runs a single question against either Groq or HuggingFace depending on the model_id.
    """
    try:
        if not question:
            raise ValueError("Question cannot be empty.")
            
        sanitized_question = question.strip()
        if not sanitized_question:
            raise ValueError("Question cannot be empty after stripping whitespace.")
            
        if len(sanitized_question) > 500:
            sanitized_question = sanitized_question[:500]
            
        # Route based on model ID
        if model_id in GROQ_MODELS:
            return run_model_groq(model_id, sanitized_question, max_tokens)
        else:
            return run_model_hf(model_id, sanitized_question, max_tokens)
            
    except Exception as e:
        print(f"Error in run_model for '{model_id}': {e}")
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
