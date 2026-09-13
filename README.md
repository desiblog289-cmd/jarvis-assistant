# J.A.R.V.I.S. — Futuristic AI Web Assistant

A dark, glowing, sci-fi themed AI assistant web app powered by Google's Gemini API,
with a secure serverless backend so your API key is never exposed to the browser.

## Project structure

```
jarvis-assistant/
├── public/
│   ├── index.html      # UI markup
│   ├── style.css       # Dark/blue sci-fi theme, animations, responsive layout
│   └── script.js       # Chat logic, voice input (STT), voice output (TTS)
├── api/
│   └── chat.js         # Serverless backend: calls Gemini securely
├── .env.example        # Template — copy to .env and fill in your key
├── .gitignore          # Keeps .env and node_modules out of git
├── package.json
└── vercel.json         # Routes /api and static files correctly on Vercel
```

---

## 1. Get a Gemini API key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in and click **Create API key**.
3. Copy the key — you'll need it below.

---

## 2. Install dependencies (local setup)

You need **Node.js 18+** installed.

```bash
# Move into the project folder
cd jarvis-assistant

# Install the Vercel CLI (used for local dev + deployment)
npm install
```

---

## 3. Add your API key

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste your real key:
   ```
   GEMINI_API_KEY=your_actual_key_here
   ```
3. **Do not** commit `.env` — it's already in `.gitignore`.

---

## 4. Run it locally

```bash
npx vercel dev
```

- The first time, the Vercel CLI will ask you to log in / link a project — follow the prompts (you can choose "no" for linking to an existing project, and let it create a new one).
- It will start a local server (usually at `http://localhost:3000`).
- Open that URL in your browser — you should see the JARVIS interface.
- Type a message or click the microphone icon and speak. JARVIS will reply in the chat and speak the response aloud (toggle voice with the speaker icon top-right).

> `vercel dev` automatically loads your local `.env` file and correctly runs `api/chat.js` as a serverless function, so the frontend's `fetch('/api/chat')` call works exactly like it will in production.

---

## 5. Deploy publicly (free) — Vercel

Vercel's free tier is ideal here because the project is already structured around
its `/api` serverless function convention.

### Option A — Deploy via CLI (fastest)

```bash
# From inside the jarvis-assistant folder
npx vercel
```

- Follow the prompts (log in with GitHub/Google/email if asked, accept defaults for project name and directory).
- When it finishes, it gives you a preview URL like `https://jarvis-assistant-xxxx.vercel.app`.
- **Add your API key to the deployed project** (the `.env` file is NOT uploaded, so you must set it in Vercel's dashboard):
  ```bash
  npx vercel env add GEMINI_API_KEY
  ```
  Paste your key when prompted, and select all environments (Production, Preview, Development).
- Redeploy so the new environment variable takes effect:
  ```bash
  npx vercel --prod
  ```
- Visit the printed production URL — your JARVIS assistant is now live.

### Option B — Deploy via GitHub + Vercel Dashboard

1. Push this project to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial JARVIS assistant"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/jarvis-assistant.git
   git push -u origin main
   ```
   (`.env` will NOT be pushed, because it's in `.gitignore` — this is correct and intentional.)
2. Go to https://vercel.com → **Add New... → Project** → Import your GitHub repo.
3. In the import screen, expand **Environment Variables** and add:
   - Key: `GEMINI_API_KEY`
   - Value: your real Gemini key
4. Click **Deploy**.
5. Once deployed, Vercel gives you a public URL (e.g. `https://jarvis-assistant.vercel.app`) that anyone can visit. The frontend automatically calls `/api/chat` on the same domain, so no extra configuration is needed.

---

## 6. Alternative free hosts

If you prefer not to use Vercel, this project structure (static frontend + a serverless-style function) also works with minor adaptation on:

- **Render** (as a small Node/Express web service — wrap `api/chat.js`'s handler logic in an Express route and serve `/public` as static files).
- **Netlify** (move `api/chat.js` into `netlify/functions/chat.js` using the same handler logic, adjusted to Netlify's `event`/`context` function signature).

The core backend logic in `api/chat.js` (reading `GEMINI_API_KEY` from `process.env` and calling the Gemini REST endpoint) stays the same on any platform — only the request/response wrapper changes.

---

## Security notes

- `GEMINI_API_KEY` is read only inside `api/chat.js`, on the server. It is never included in any file served to the browser.
- `.env` is excluded from git via `.gitignore`.
- On Vercel, environment variables are stored encrypted and injected at runtime — never visible in your deployed source.
- The frontend only ever talks to your own `/api/chat` endpoint, never directly to Google's API.

---

## Customizing JARVIS

- **Personality / tone:** edit `JARVIS_SYSTEM_PROMPT` in `api/chat.js`.
- **Model:** change `GEMINI_MODEL` in `api/chat.js` (e.g. to `gemini-1.5-pro` for more advanced but slower/costlier responses).
- **Voice:** in `public/script.js`, adjust `utterance.rate`, `utterance.pitch`, or the preferred-voice matching logic inside `speak()`.
- **Theme colors:** edit the CSS variables at the top of `public/style.css` (`--cyan`, `--blue`, `--bg-0`, etc.).
