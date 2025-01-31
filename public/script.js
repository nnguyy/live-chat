const socket = io();
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');

// Send message
document.getElementById('send-button').addEventListener('click', () => {
  const message = input.value.trim();
  if (message) {
    socket.emit('chat message', message);
    input.value = '';
  }
});

// Receive messages
socket.on('chat message', (data) => {
  const li = document.createElement('li');
  li.textContent = `${data.sender}: ${data.msg}`; // Basic display
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight; // Auto-scroll
});

// Load history
socket.on('load history', (history) => {
  history.forEach(msg => {
    const li = document.createElement('li');
    li.textContent = `${msg.sender}: ${msg.text}`;
    messages.appendChild(li);
  });
});
