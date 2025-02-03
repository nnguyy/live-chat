require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

// Initialize server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB error:', err));

// Simple message schema
const messageSchema = new mongoose.Schema({
  text: String,
  username: String,
  userId: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

let onlineUsers = 0;
const users = new Map();

// WebSocket setup
io.on('connection', (socket) => {
  console.log('User connected');
  onlineUsers++;

  // Retrieve the persistent userId from the handshake
  const userId = socket.handshake.auth.userId || 'default-user-id';
  let username = 'Anonymous'; // default username
  users.set(socket.id, username);
  io.emit('update online count', onlineUsers);

  // Handle username updates from the client
  socket.on('update username', (newUsername) => {
    const oldUsername = username;
    username = newUsername || 'Anonymous';
    users.set(socket.id, username);
    io.emit('user updated', {
      old: oldUsername,
      new: username
    });
  });

  // Handle chat messages from the client
  socket.on('chat message', async (data) => {
    // Expecting an object { msg, userId, username }
    const { msg, userId: clientUserId, username: clientUsername } = data;
    // Save the new message to MongoDB
    const newMsg = new Message({
      text: msg,
      username: clientUsername,
      userId: clientUserId
    });
    await newMsg.save();

    // Broadcast the message to all clients
    io.emit('chat message', { 
      msg, 
      username: clientUsername,
      userId: clientUserId,
      timestamp: new Date().toLocaleTimeString() 
    });
  });

  // Load the last 10 messages from the database and send to the client
  Message.find().sort({ timestamp: -1 }).limit(10)
    .then(messages => socket.emit('load history', messages.reverse()))
    .catch(err => console.error('Error loading message history:', err));

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
    onlineUsers--;
    io.emit('update online count', onlineUsers);
    users.delete(socket.id);
  });
});

// Serve static files from the "public" folder
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
