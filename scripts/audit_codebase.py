import os
import re
import sys

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
SRC_DIR = os.path.join(BASE_DIR, "frontend", "src")
INDEX_HTML = os.path.join(BASE_DIR, "frontend", "index.html")

EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "\U0001F900-\U0001F9FF"  # supplemental symbols
    "\U0001FA00-\U0001FA6F"  # chess, symbols
    "\U0001FA70-\U0001FAFF"
    "\U00002600-\U000026FF"  # misc symbols (stars, weather)
    "]+",
    flags=re.UNICODE
)

EM_DASH_PATTERN = re.compile(r"[\u2014\u2013]")  # em dash, en dash
GRADIENT_PATTERN = re.compile(r"(\bgradient\b|bg-gradient-)", re.IGNORECASE)
PURPLE_PATTERN = re.compile(r"\b(purple|violet)\b", re.IGNORECASE)
BUTTON_PILL_PATTERN = re.compile(r"<button[^>]*rounded-full", re.IGNORECASE)
MADE_WITH_PATTERN = re.compile(r"\b(made with|built with)\b", re.IGNORECASE)
LOREM_PATTERN = re.compile(r"\blorem ipsum\b", re.IGNORECASE)

issues = []

def scan_file(filepath):
    rel_path = os.path.relpath(filepath, BASE_DIR)
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        lines = content.splitlines()

    for idx, line in enumerate(lines, 1):
        # 1. Emoji check
        emoji_match = EMOJI_PATTERN.search(line)
        if emoji_match:
            issues.append(f"[EMOJI] {rel_path}:{idx} -> Found emoji: {emoji_match.group(0)}")

        # 2. Em / En dash check
        dash_match = EM_DASH_PATTERN.search(line)
        if dash_match:
            issues.append(f"[DASH] {rel_path}:{idx} -> Found em/en dash: {line.strip()}")

        # 3. Gradient check
        grad_match = GRADIENT_PATTERN.search(line)
        if grad_match:
            issues.append(f"[GRADIENT] {rel_path}:{idx} -> Found gradient reference: {line.strip()}")

        # 4. Purple / Violet check
        purple_match = PURPLE_PATTERN.search(line)
        if purple_match:
            issues.append(f"[PURPLE] {rel_path}:{idx} -> Found purple/violet reference: {line.strip()}")

        # 5. Pill button check
        pill_match = BUTTON_PILL_PATTERN.search(line)
        if pill_match:
            issues.append(f"[PILL_BUTTON] {rel_path}:{idx} -> Found button with rounded-full: {line.strip()}")

        # 6. Made with / Built with check
        made_match = MADE_WITH_PATTERN.search(line)
        if made_match:
            issues.append(f"[BUILDER_WATERMARK] {rel_path}:{idx} -> Found branding: {line.strip()}")

        # 7. Lorem ipsum check
        lorem_match = LOREM_PATTERN.search(line)
        if lorem_match:
            issues.append(f"[LOREM_IPSUM] {rel_path}:{idx} -> Found lorem ipsum: {line.strip()}")

def main():
    if os.path.exists(INDEX_HTML):
        scan_file(INDEX_HTML)

    for root, _, files in os.walk(SRC_DIR):
        for file in files:
            if file.endswith((".ts", ".tsx", ".css", ".html", ".js")):
                scan_file(os.path.join(root, file))

    print(f"Codebase Audit Complete. Scanned directory: {SRC_DIR}")
    if issues:
        print(f"FOUND {len(issues)} ISSUE(S):")
        for issue in issues:
            print(f"  {issue}")
        sys.exit(1)
    else:
        print("ALL CHECKS PASSED: Zero emoji, zero dashes, zero gradients, zero purple, zero pill buttons, zero builder marks.")

if __name__ == "__main__":
    main()
