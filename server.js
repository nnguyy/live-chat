require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

// Initialize server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB Atlas (replace URI in .env)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB error:', err));

// Simple message schema
const messageSchema = new mongoose.Schema({
  text: String,
  sender: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

let onlineUsers = 0;

// WebSocket setup
io.on('connection', (socket) => {
  console.log('User connected');
  onlineUsers++;

  const othersCount = onlineUsers - 1;
  io.emit('update others count', othersCount);

  // Load last 10 messages (for simplicity)
  Message.find().sort({ timestamp: -1 }).limit(10)
    .then(messages => socket.emit('load history', messages.reverse()));

  // Handle messages
  socket.on('chat message', async (msg) => {
    // Save to MongoDB (no sanitization)
    const newMsg = new Message({ text: msg, sender: socket.id });
    await newMsg.save();

    // Broadcast to everyone
    io.emit('chat message', { 
      msg, 
      sender: socket.id, 
      timestamp: new Date().toLocaleTimeString() 
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected')
    onlineUsers--;
    io.emit('update online count', onlineUsers);
  });
});

// Serve static files
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
