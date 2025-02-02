const socket = io();
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');
const onlineCounter = document.getElementById('online-counter');
const usernameDisplay = document.getElementById('username-display');

// update online count
socket.on('update online count', (count) => {
  onlineCounter.textContent = `${count} user${count !== 1 ? 's' : ''} online`;
});

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
  li.className = `message ${data.sender === username ? 'sent' : 'received'}`;
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

function updateUsername(newUsername) {
  username = newUsername || 'Anonymous';
  localStorage.setItem('chatUsername', username);
  usernameDisplay.textContent = username;
  socket.emit('update username', username);
}

document.getElementById('change-username').addEventListener('click', () => {
  const newUsername = prompt('Enter new username:', username);
  if (newUsername !== null) updateUsername(newUsername);
});

// Initialize username
updateUsername(localStorage.getItem('chatUsername'));
