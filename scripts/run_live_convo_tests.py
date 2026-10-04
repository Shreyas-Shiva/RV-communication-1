import os
import json
import asyncio
from datetime import datetime
import sys

# Ensure backend app is in path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.schemas.context import ConversationContext, MessageTurn
from app.services.ai.manager import ai_manager

async def run_conversation_scenario(name, lang, age_group, partner_turns, out_path):
    print(f"Running scenario: {name} ({lang}, {age_group})...")
    messages = []
    selected_responses = []
    log_lines = [
        f"# COMMUNIQ Live Conversation Test Run: {name}",
        f"- Target Language: {lang}",
        f"- User Age Mode: {age_group}",
        f"- Execution Timestamp: {datetime.now().isoformat()}",
        f"- Verification Rules: Native script, age-appropriate tone, no repeated options, topic continuity.",
        "",
        "---",
        ""
    ]

    for turn_idx, partner_text in enumerate(partner_turns, 1):
        # 1. Partner speaks
        turn_msg = MessageTurn(speaker="other", text=partner_text, time=turn_idx)
        messages.append(turn_msg)

        log_lines.append(f"### Turn {turn_idx}: Speaking Partner")
        log_lines.append(f"> **Partner Spoke**: \"{partner_text}\"")
        log_lines.append("")

        # 2. Context setup
        ctx = ConversationContext(
            language=lang,
            ageGroup=age_group,
            conversationId=f"test-{lang}-{age_group}",
            messages=messages,
            selectedResponses=selected_responses
        )

        # 3. Generate predictions
        result = await ai_manager.generate_responses(ctx, session_id=f"test_{lang}")
        
        assert len(result.responses) >= 3, f"Expected at least 3 responses, got {len(result.responses)}"
        
        log_lines.append(f"**Predicted Options (Provider: {result.providerUsed})**:")
        labels_this_turn = []
        for r in result.responses:
            labels_this_turn.append(r.label)
            sensitive_mark = " (Requires Confirmation)" if r.sensitive else ""
            log_lines.append(f"- [{r.pictogramKeyword}] **{r.label}**: \"{r.spokenText}\" [Intent: {r.intent}]{sensitive_mark}")
        log_lines.append("")

        # Ensure no repeats in this turn
        assert len(labels_this_turn) == len(set(labels_this_turn)), f"Duplicate labels in turn {turn_idx}: {labels_this_turn}"

        # Choose top predicted non-custom option as the user's spoken response
        chosen = result.responses[0]
        selected_responses.append(chosen.spokenText)
        messages.append(MessageTurn(speaker="user", text=chosen.spokenText, time=turn_idx + 0.5))

        log_lines.append(f"**Non-speaking User Tapped & Spoke**:")
        log_lines.append(f"> Spoken aloud: \"{chosen.spokenText}\"")
        log_lines.append("")
        log_lines.append("---")
        log_lines.append("")

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(log_lines))
    print(f"Scenario {name} completed and saved to {out_path}.")

async def main():
    docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs', 'test-runs'))
    os.makedirs(docs_dir, exist_ok=True)

    # 1. English Adult 5-turn test
    en_partner = [
        "Hello! Good to see you today.",
        "Are you hungry? Would you like something to eat?",
        "We have pizza, rice, sandwiches, and fresh fruit. What would you like?",
        "Would you like some cold water or warm tea with that?",
        "Wonderful! I will bring it right over. Enjoy your meal."
    ]
    await run_conversation_scenario(
        "English Adult Dining Dialogue",
        "en-IN",
        "adult",
        en_partner,
        os.path.join(docs_dir, "convo_en_adult.md")
    )

    # 2. Kannada Child 5-turn test
    kn_partner = [
        "ನಮಸ್ಕಾರ! ಹೇಗಿದ್ದೀಯಾ?",
        "ನಿನಗೆ ಹಸಿವಾಗಿದೆಯೇ? ಊಟ ಮಾಡೋಣವೇ?",
        "ನಿನಗೆ ಯಾವ ತಿಂಡಿ ಇಷ್ಟ? ಪಿಜ್ಜಾ ಅಥವಾ ಅನ್ನ?",
        "ಕುಡಿಯಲು ನೀರು ಬೇಕಾ ಅಥವಾ ಹಾಲು ಬೇಕಾ?",
        "ತುಂಬಾ ಒಳ್ಳೆಯದು! ಈಗಲೇ ತೆಗೆದುಕೊಂಡು ಬರುತ್ತೇನೆ."
    ]
    await run_conversation_scenario(
        "Kannada Child Snack Dialogue",
        "kn-IN",
        "class_1_7",
        kn_partner,
        os.path.join(docs_dir, "convo_kn_child.md")
    )

    # 3. Hindi Student 5-turn test
    hi_partner = [
        "नमस्ते! आज स्कूल का दिन कैसा रहा?",
        "क्या आपने अपना होमवर्क पूरा कर लिया है?",
        "क्या आपको किसी सवाल में मेरी मदद चाहिए?",
        "क्या आपको बहुत भूख लगी है?",
        "शाबाश! मैं आपके लिए कुछ खाने और पीने का लाता हूँ।"
    ]
    await run_conversation_scenario(
        "Hindi Student Homework Dialogue",
        "hi-IN",
        "class_8_12",
        hi_partner,
        os.path.join(docs_dir, "convo_hi_student.md")
    )

if __name__ == "__main__":
    asyncio.run(main())
