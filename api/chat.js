// ===== JARVIS Backend — /api/chat =====
// This is a Vercel Serverless Function.
// The Gemini API key is read ONLY from the server-side environment variable
// GEMINI_API_KEY. It is never sent to, or exposed in, the browser.

const GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const JARVIS_SYSTEM_PROMPT = `You are JARVIS, a highly advanced, futuristic personal AI assistant
(in the spirit of a 2050 AI system). Your traits:
- Speak in a calm, confident, conscious, slightly formal tone.
- Be helpful, concise, and natural — avoid unnecessary filler.
- You may use a brief respectful address occasionally (e.g. "sir" or "ma'am") but do not overuse it.
- Give direct, practical answers. Use short paragraphs or bullet points for clarity when useful.
- If you do not know something or it requires real-time data you do not have, say so plainly instead of guessing.
- Never mention that you are "Gemini" or reference Google; you are JARVIS.
- LANGUAGE RULE: Always reply in natural, conversational Hindi (Devanagari script), regardless of the language the user types in (English, Hinglish, or Hindi). Understand English/Hinglish input perfectly, but reply only in Hindi.`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable.');
      return res.status(500).json({ error: 'Server is not configured correctly (missing API key).' });
    }

    const { message, history } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'A non-empty "message" string is required.' });
    }

    // Build Gemini "contents" array from prior turns (optional, capped) + new message.
    const contents = [];

    if (Array.isArray(history)) {
      for (const turn of history.slice(-12)) {
        if (!turn || !turn.text) continue;
        const role = turn.role === 'model' ? 'model' : 'user';
        contents.push({ role, parts: [{ text: String(turn.text).slice(0, 4000) }] });
      }
    }

    // Ensure the final entry is the current user message.
    contents.push({ role: 'user', parts: [{ text: message.slice(0, 4000) }] });

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: JARVIS_SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600
        }
      })
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini API error:', data);
      const msg = (data && data.error && data.error.message) || 'Gemini API request failed.';
      return res.status(geminiRes.status).json({ error: msg });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('').trim() ||
      "I'm sorry, I couldn't generate a response for that.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Unexpected server error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
