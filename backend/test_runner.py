import os
from dotenv import load_dotenv
load_dotenv()

from services.model_runner import run_model

print("Testing gpt2...")
res_gpt2 = run_model("gpt2", "Tell me a short joke.")
print("gpt2 response:", res_gpt2)

print("\nTesting Groq model llama-3.1-8b-instant...")
res_groq = run_model("llama-3.1-8b-instant", "Tell me a short joke.")
print("Groq response:", res_groq)
