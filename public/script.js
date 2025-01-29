const socket = io(); // Connect to WebSocket server
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');
const sendButton = document.getElementById('send-button');

sendButton.addEventListener('click', sendMessage);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const message = input.value.trim();
    if (message) {
        socket.emit('chat message', message); // Send message to server
        input.value = ''; // Clear input box after sending
    }
}

// Listen for new messages from the server
socket.on('chat message', function(data) {
    const { msg, sender } = data;
    const messageElement = document.createElement('li');

    const isUser = sender === socket.id;
    messageElement.classList.add('message', isUser ? 'sent' : 'received');

    messageElement.textContent = msg;
    document.getElementById('messages').appendChild(messageElement);

    //auto scroll
    const messageContainer = document.getElementById('messages');
    messageContainer.scrollTop = messageContainer.scrollHeight;
});
