import anthropic

client = anthropic.Anthropic(api_key="YOUR_API_KEY")  # env variable use karna better hai

SYSTEM_PROMPT = """
You are JARVIS, a highly intelligent personal AI assistant.
... (aapka pura instruction text yahan paste karo)
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
