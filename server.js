const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files for the frontend
app.use(express.static('public'));

// Handle incoming socket connections
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Handle chat messages
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
const handler = (req, res) => {
  app(req, res);  // Delegate to the Express app
};

module.exports = handler;
