import os
from dotenv import load_dotenv
load_dotenv()

from services.generator import generate_test_cases

try:
    print("Calling generate_test_cases...")
    res = generate_test_cases(
        domain="sentence-similarity",
        count=20,
        difficulty="balanced",
        question_types=["factual", "reasoning", "edge_cases"]
    )
    print(f"Result count: {len(res)}")
    print(f"Result: {res}")
except Exception as e:
    print(f"Exception raised: {e}")
