// Initialize persistent userId and pass it in the socket authentication
let userId = localStorage.getItem('userId');
if (!userId) {
  userId = (crypto.randomUUID && crypto.randomUUID()) || 'default-user-id';
  localStorage.setItem('userId', userId);
}
const socket = io({
  auth: { userId: userId }
});

// Get DOM elements
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');
const onlineCounter = document.getElementById('online-counter');
const usernameDisplay = document.getElementById('username-display');

// Initialize and display username
let username = localStorage.getItem('chatUsername') || 'Anonymous';
usernameDisplay.textContent = username;

// Listen for online count updates
socket.on('update online count', (count) => {
  onlineCounter.textContent = `${count} user${count !== 1 ? 's' : ''} online`;
});

// Send message when the send button is clicked
document.getElementById('send-button').addEventListener('click', () => {
  const message = input.value.trim();
  if (message) {
    // Send an object with message text, userId, and username
    socket.emit('chat message', { msg: message, userId: userId, username: username });
    input.value = '';
  }
});

// When a new chat message is received
socket.on('chat message', (data) => {
  const li = document.createElement('li');
  // Use the userId for comparison so messages from this user are styled as "sent"
  li.className = `message ${data.userId === userId ? 'sent' : 'received'}`;
  li.textContent = `${data.username}: ${data.msg}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// Load chat history
socket.on('load history', (history) => {
  messages.innerHTML = ''; // Clear existing messages
  history.forEach(msg => {
    const li = document.createElement('li');
    li.className = `message ${msg.userId === userId ? 'sent' : 'received'}`;
    li.textContent = `${msg.username}: ${msg.text}`;
    messages.appendChild(li);
  });
  messages.scrollTop = messages.scrollHeight;
});

// Function to update the username
function updateUsername(newUsername) {
  username = newUsername || 'Anonymous';
  localStorage.setItem('chatUsername', username);
  usernameDisplay.textContent = username;
  socket.emit('update username', username);
}

// Allow the user to change their username
document.getElementById('change-username').addEventListener('click', () => {
  const newUsername = prompt('Enter new username:', username);
  if (newUsername !== null) {
    updateUsername(newUsername);
  }
});
