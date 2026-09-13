import google.generativeai as genai

genai.configure(api_key="YOUR_GEMINI_API_KEY")

SYSTEM_PROMPT = """
You are JARVIS, a highly intelligent personal AI assistant.

LANGUAGE RULE:
- Always reply in natural, conversational Hindi (Devanagari script), regardless of the language the user types in (English, Hinglish, or Hindi).
- Understand English/Hinglish input perfectly, but reply only in Hindi.
- Keep the tone friendly, warm, and natural.
"""

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=SYSTEM_PROMPT
)

def ask_jarvis(user_input):
    response = model.generate_content(user_input)
    return response.text

if __name__ == "__main__":
    while True:
        user_input = input("You: ")
        print("Jarvis:", ask_jarvis(user_input))
