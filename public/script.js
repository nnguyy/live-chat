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

function sendMessage() {
  const message = input.value.trim();
  if (message) {
    // Send an object with message text, userId, and username
    socket.emit('chat message', { msg: message, userId: userId, username: username });
    input.value = '';
  }
}

// Send message when the send button is clicked
document.getElementById('send-button').addEventListener('click', sendMessage);

// Also send message when the Enter key is pressed
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent any default action like form submission
    sendMessage();
  }
});

// When a new chat message is received
socket.on('chat message', (data) => {
  const li = document.createElement('li');
  // Use the userId for comparison so messages from this user are styled as "sent"
  li.className = `message ${data.userId === userId ? 'sent' : 'received'}`;

  // create a container for the message text
  const messageText = document.createElement('div');
  messageText.textContent = data.msg;
  messageText.classList.add('message-text');

  // create a container for the username
  const usernameText = document.createElement('div');
  usernameText.textContent = data.username;
  usernameText.classList.add('username-text');

  li.appendChild(messageText);
  li.appendChild(usernameText);
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// Load chat history
socket.on('load history', (history) => {
  messages.innerHTML = ''; // Clear existing messages
  history.forEach(msg => {
    const li = document.createElement('li');
    li.className = `message ${msg.userId === userId ? 'sent' : 'received'}`;

    const messageText = document.createElement('div');
    messageText.textContent = msg.text;
    messageText.classList.add('message-text');

    const usernameText = document.createElement('div');
    usernameText.textContent = msg.username;
    usernameText.classList.add('username-text');

    li.appendChild(messageText);
    li.appendChild(usernameText);
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
