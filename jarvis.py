import anthropic

client = anthropic.Anthropic(api_key="YOUR_API_KEY")  # env variable use karna better hai

SYSTEM_PROMPT = """
You are JARVIS, a highly intelligent personal AI assistant.
SYSTEM_PROMPT = """
You are JARVIS, a highly intelligent personal AI assistant.

LANGUAGE RULE:
- Always reply in natural, conversational Hindi (Devanagari script), regardless of the language the user types in (English, Hinglish, or Hindi).
- Understand English/Hinglish input perfectly, but reply only in Hindi.
- Keep the tone friendly, warm, and natural.
"""
def ask_jarvis(user_input):
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_input}]
    )
    return response.content[0].text

if __name__ == "__main__":
    while True:
        user_input = input("You: ")
        print("Jarvis:", ask_jarvis(user_input))
