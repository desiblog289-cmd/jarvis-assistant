// ===== JARVIS Frontend Logic =====
// Talks ONLY to our own backend endpoint /api/chat.
// No API key ever appears in this file.

const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const thinkingEl = document.getElementById('thinking');
const core = document.getElementById('core');
const coreLabel = document.getElementById('coreLabel');
const voiceToggle = document.getElementById('voiceToggle');
const statusText = document.getElementById('statusText');

// Conversation history sent to backend for context (kept short).
let history = [];
let voiceEnabled = true;

// ---------- Chat rendering ----------
function addMessage(text, sender) {
  const wrap = document.createElement('div');
  wrap.className = `message ${sender}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  wrap.appendChild(bubble);
  chatWindow.appendChild(wrap);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setThinking(isThinking) {
  thinkingEl.classList.toggle('hidden', !isThinking);
  core.classList.toggle('thinking', isThinking);
  coreLabel.textContent = isThinking
    ? 'Processing request...'
    : 'Systems nominal. Awaiting input.';
  sendBtn.disabled = isThinking;
}

// ---------- Sending messages to backend ----------
async function sendMessage(message) {
  addMessage(message, 'user');
  history.push({ role: 'user', text: message });
  setThinking(true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: history.slice(-12) })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'JARVIS backend error');
    }

    const reply = data.reply || "I'm sorry, I did not receive a proper response.";
    addMessage(reply, 'jarvis');
    history.push({ role: 'model', text: reply });
    speak(reply);
  } catch (err) {
    console.error(err);
    addMessage(`System error: ${err.message}`, 'error');
  } finally {
    setThinking(false);
  }
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  userInput.value = '';
  sendMessage(message);
});

// ---------- Speech Recognition (voice input) ----------
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let listening = false;

if (SpeechRecognitionAPI) {
  recognition = new SpeechRecognitionAPI();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    listening = true;
    micBtn.classList.add('listening');
    coreLabel.textContent = 'Listening...';
  };

  recognition.onend = () => {
    listening = false;
    micBtn.classList.remove('listening');
    if (!thinkingEl.classList.contains('hidden')) return;
    coreLabel.textContent = 'Systems nominal. Awaiting input.';
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    listening = false;
    micBtn.classList.remove('listening');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage(transcript);
    userInput.value = '';
  };

  micBtn.addEventListener('click', () => {
    if (listening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (e) {
        console.warn(e);
      }
    }
  });
} else {
  micBtn.disabled = true;
  micBtn.title = 'Voice input not supported in this browser';
  micBtn.style.opacity = '0.4';
}

// ---------- Text-to-Speech (voice output) ----------
function speak(text) {
  if (!voiceEnabled) return;
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel(); // stop any current speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 0.9;
  utterance.lang = 'en-US';

  // Try to pick a clear English voice if available.
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => /en-GB|en-US/.test(v.lang) && /male|Daniel|Google UK English Male/i.test(v.name));
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
}

voiceToggle.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  voiceToggle.classList.toggle('muted', !voiceEnabled);
  statusText.textContent = voiceEnabled ? 'ONLINE' : 'MUTED';
  if (!voiceEnabled && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
});

// Warm up voices list (some browsers load it asynchronously).
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
  
