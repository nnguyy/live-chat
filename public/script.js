const socket = io();
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');
const onlineCounter = document.getElementById('online-counter');

// Send message
document.getElementById('send-button').addEventListener('click', () => {
  const message = input.value.trim();
  if (message) {
    socket.emit('chat message', message);
    input.value = '';
  }
});

socket.on('update online count', (count) => {
  onlineCounter.textContent = `${count} user${count !== 1 ? 's' : ''} online`;
});

// When receiving messages
socket.on('chat message', (data) => {
  const li = document.createElement('li');
  li.className = `message ${data.sender === socket.id ? 'sent' : 'received'}`;
  li.textContent = `${data.sender}: ${data.msg}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// Clear once, then append all
socket.on('load history', (history) => {
  messages.innerHTML = ''; // Clear once here
  history.forEach(msg => {
    const li = document.createElement('li');
    li.className = `message ${msg.sender === socket.id ? 'sent' : 'received'}`; // Add style
    li.textContent = `${msg.sender}: ${msg.text}`;
    messages.appendChild(li);
  });
  messages.scrollTop = messages.scrollHeight;
});
