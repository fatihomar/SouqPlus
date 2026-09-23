from services.ai_service import extract_search_filters
import json

queries = [
    "بدي فيلا بإسطنبول تحت 500 ألف مع حديقة",
    "I want a villa in Istanbul under 500,000 with a garden"
]

for q in queries:
    res = extract_search_filters(q)
    print(f"Query: {q}")
    print(f"Result: {json.dumps(res, ensure_ascii=False, indent=2)}\n")
