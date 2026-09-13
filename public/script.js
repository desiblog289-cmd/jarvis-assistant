// ===== JARVIS Frontend Logic =====
// Talks ONLY to our own backend endpoint /api/chat. No API key ever appears here.

const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const thinkingEl = document.getElementById('thinking');
const voiceToggle = document.getElementById('voiceToggle');
const coreStage = document.getElementById('coreStage');
const activateLabel = document.getElementById('activateLabel');
const commandBtn = document.getElementById('commandBtn');
const scanBtn = document.getElementById('scanBtn');
const chatPanel = document.getElementById('chatPanel');
const cpuStat = document.getElementById('cpuStat');

let history = [];
let voiceEnabled = true;
let activated = false;

// ---------- Activation (visual only) ----------
function activateCore() {
  if (activated) return;
  activated = true;
  coreStage.classList.add('active');
  activateLabel.textContent = 'Systems nominal. Awaiting input.';
  chatPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  userInput.focus();
}

coreStage.addEventListener('click', activateCore);
activateLabel.addEventListener('click', activateCore);
commandBtn.addEventListener('click', activateCore);

// Fake fluctuating CPU stat for atmosphere (purely cosmetic).
setInterval(() => {
  const val = 30 + Math.floor(Math.random() * 40);
  if (cpuStat) cpuStat.textContent = `${val}%`;
}, 2500);

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
  sendBtn.disabled = isThinking;
}

// ---------- Sending messages to backend ----------
async function sendMessage(message) {
  activateCore();
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
    activateCore();
  };

  recognition.onend = () => {
    listening = false;
    micBtn.classList.remove('listening');
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
      try { recognition.start(); } catch (e) { console.warn(e); }
    }
  });

  scanBtn.addEventListener('click', () => {
    if (listening) {
      recognition.stop();
    } else {
      try { recognition.start(); } catch (e) { console.warn(e); }
    }
  });
} else {
  micBtn.disabled = true;
  micBtn.title = 'Voice input not supported in this browser';
  micBtn.style.opacity = '0.4';
  if (scanBtn) scanBtn.disabled = true;
}

// ---------- Text-to-Speech (voice output) ----------
function speak(text) {
  if (!voiceEnabled) return;
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 0.9;
  utterance.lang = 'en-US';

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => /en-GB|en-US/.test(v.lang) && /male|Daniel|Google UK English Male/i.test(v.name));
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
}

voiceToggle.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  voiceToggle.classList.toggle('muted', !voiceEnabled);
  if (!voiceEnabled && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
});

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
