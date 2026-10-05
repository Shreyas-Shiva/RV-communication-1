import re
import json

with open('frontend/src/data/coreBoard.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find all id: '...' in coreBoard.ts
ids = list(dict.fromkeys(re.findall(r"id:\s*['\"]([^'\"]+)['\"]", text)))
print(f"Total unique IDs in coreBoard.ts: {len(ids)}")
print("IDs:", ids)
