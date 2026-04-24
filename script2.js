const adjective = [
  "Sis", "Silent", "Human", "Velvet", "Crimson", "Fading",
  "Misty", "HearMeOut", "Alpha", "Lonely", "Lunar", "Numb",
  "Echoing", "Pale", "Dark", "Mango", "Lost", "Whisper"
];

const noun = [
  "Wolf", "Rose", "Ghost", "Raven", "Storm", "Moon",
  "Tear", "Flame", "Soul", "Mist", "Void", "Echo",
  "Star", "Rain", "Thorn", "Ash", "Dream", "Crow"
];

// Genereaza un pseudonim de forma "SilentRaven42"
function generatePseudonym() {
  const adj  = adjective[Math.floor(Math.random() * adjective.length)];
  const n    = noun[Math.floor(Math.random() * noun.length)];
  const num  = Math.floor(Math.random() * 90) + 10; // numar intre 10-99
  return adj + n + num;
}

// Salveaza pseudonimul in sesiune ca sa nu se schimbe la refresh
function getPseudonym() {
  let saved = sessionStorage.getItem("meduza_pseudonym");
  if (!saved) {
    saved = generatePseudonym();
    sessionStorage.setItem("meduza_pseudonym", saved);
  }
  return saved;
}

// Butonul ↻ genereaza un pseudonim nou
function refreshPseudonym() {
  const newName = generatePseudonym();
  sessionStorage.setItem("meduza_pseudonym", newName);
  document.getElementById("pseudonym").textContent = newName;
}

// Afiseaza pseudonimul la incarcarea paginii
document.addEventListener("DOMContentLoaded", function () {
  const el = document.getElementById("pseudonym");
  if (el) el.textContent = getPseudonym();

  // Trimite cu tasta Enter
  const input = document.getElementById("msg");
  if (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") send();
    });
  }
});


// ── 2. TRIMITERE MESAJ ─────────────────────────
// Istoricul conversatiei trimis catre AI
// (AI-ul nu are memorie, asa ca trimitem tot istoricul de fiecare data)
const conversationHistory = [];

async function send() {
  const input = document.getElementById("msg");
  const text  = input.value.trim();
  if (!text) return;

  const pseudonym = getPseudonym();

  // Afiseaza mesajul utilizatorului
  addMessage(text, pseudonym, "user");
  input.value = "";
  input.focus();

  // Adauga mesajul in istoricul conversatiei
  conversationHistory.push({ role: "user", content: text });

  // Solicita raspuns de la AI
  await getAIResponse();
}

// Creeaza si afiseaza un mesaj in chat
function addMessage(text, author, type) {
  const messages = document.getElementById("messages");

  const now  = new Date();
  const time = now.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });

  const div = document.createElement("div");
  div.className = "message " + (type === "ai" ? "message-ai" : "message-user");

  // Reactiile disponibile
  const reactionsHTML = `
    <div class="msg-reactions">
      <button class="reaction-btn" onclick="addReaction(this, '❤️')">❤️ <span>0</span></button>
      <button class="reaction-btn" onclick="addReaction(this, '🕯️')">🕯️ <span>0</span></button>
      <button class="reaction-btn" onclick="addReaction(this, '🌙')">🌙 <span>0</span></button>
    </div>
  `;

  div.innerHTML = `
    <div class="msg-meta">${escapeHtml(author)} &nbsp;·&nbsp; ${time}</div>
    <div class="msg-text">${escapeHtml(text)}</div>
    ${reactionsHTML}
  `;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}


// ── 3. RASPUNS AI (Claude) ─────────────────────
async function getAIResponse() {
  // Arata indicatorul "scrie..."
  const indicator = document.getElementById("typing-indicator");
  indicator.style.display = "flex";

  // Dezactiveaza butonul cat timp AI-ul raspunde
  document.getElementById("sendBtn").disabled = true;

  try {
    // Apeleaza API-ul Anthropic
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,

        // Instructiunile pentru AI — poti modifica personalitatea aici!
        system: `Esti Meduza, un asistent empatic si misterios pentru un chat anonim.
Vorbesti in romana, cu un ton cald, poetic si intelegator.
Esti aici sa asculti, sa oferi suport emotional si sa ajuti utilizatorii sa se simta intelesi.
Raspunsurile tale sunt scurte (2-4 propozitii), sincere si fara judecata.
Niciodata nu dai sfaturi medicale concrete, dar intotdeauna incurajezi.
Folosesti uneori metafore poetice sau imagini subtile.`,

        // Istoricul complet al conversatiei
        messages: conversationHistory
      })
    });

    const data = await response.json();

    // Extrage textul raspunsului
    const aiText = data.content && data.content[0] && data.content[0].text
      ? data.content[0].text
      : "Ceva nu a mers bine. Mai incearca.";

    // Adauga raspunsul AI in istoricul conversatiei
    conversationHistory.push({ role: "assistant", content: aiText });

    // Afiseaza raspunsul
    addMessage(aiText, "Meduza AI", "ai");

  } catch (error) {
    // Eroare de retea sau API
    console.error("Eroare AI:", error);
    addMessage(
      "Umbra nu raspunde momentan... Incearca din nou.",
      "Meduza AI",
      "ai"
    );
  } finally {
    // Ascunde indicatorul si reactiveaza butonul
    indicator.style.display = "none";
    document.getElementById("sendBtn").disabled = false;
    document.getElementById("messages").scrollTop = 99999;
  }
}


// ── 4. REACTII EMOJI ──────────────────────────
// Cand dai click pe o reactie, contorul creste
function addReaction(btn, emoji) {
  const countEl = btn.querySelector("span");
  const current = parseInt(countEl.textContent) || 0;

  // Daca ai dat deja click (activ), anulezi reactia
  if (btn.classList.contains("active")) {
    btn.classList.remove("active");
    countEl.textContent = current - 1;
  } else {
    btn.classList.add("active");
    countEl.textContent = current + 1;
  }
}


// ── HELPER ────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
