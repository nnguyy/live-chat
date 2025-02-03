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
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

let onlineUsers = 0;
const users = new Map();

// WebSocket setup
io.on('connection', (socket) => {
  console.log('User connected');
  onlineUsers++;

  // inialize user
  const username = socket.handshake.auth.username || 'Anonymous';
  users.set(socket.id, username);
  io.emit('update online count', onlineUsers);

  socket.on('update username', (newUsername) => {
    users.set(socket.id, newUsername);
    io.emit('user updated', {
      old: username,
      new: newUsername
    });
  });

  // Handle messages
  socket.on('chat message', async (msg) => {
    // Save to MongoDB
    const username = users.get(socket.id);
    const newMsg = new Message({ text: msg, username: username });
    await newMsg.save();

    // Broadcast to everyone
    io.emit('chat message', { 
      msg, 
      username: username,
      timestamp: new Date().toLocaleTimeString() 
    });
  });

  // Load last 10 messages (for simplicity)
  Message.find().sort({ timestamp: -1 }).limit(10)
    .then(messages => socket.emit('load history', messages.reverse()));

  socket.on('disconnect', () => {
    console.log('User disconnected')
    onlineUsers--;
    io.emit('update online count', onlineUsers);
    users.delete(socket.id);
  });
});

// Serve static files
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
