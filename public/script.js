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

// When receiving messages
socket.on('chat message', (data) => {
  const li = document.createElement('li');
  li.className = `message ${data.sender === socket.id ? 'sent' : 'received'}`;
  li.textContent = `${data.sender}: ${data.msg}`;
  messages.appendChild(li);
});

// Load history
socket.on('load history', (history) => {
  history.forEach(msg => {
    messages.innerHTML = '';
    const li = document.createElement('li');
    li.textContent = `${msg.sender}: ${msg.text}`;
    messages.appendChild(li);
  });
});
