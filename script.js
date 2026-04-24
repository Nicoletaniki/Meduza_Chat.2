function send() {
  const input = document.getElementById("msg");
  const text = input.value.trim();
  if (!text) return;

  const messages = document.getElementById("messages");

  const div = document.createElement("div");
  div.className = "message";

  const now = new Date();
  const time = now.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

  div.innerHTML = `<div class="msg-meta">Tu &nbsp;·&nbsp; ${time}</div>${escapeHtml(text)}`;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  input.value = "";
  input.focus();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Send on Enter
document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("msg");
  if (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") send();
    });
  }
});
