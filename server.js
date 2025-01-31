require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

// MongoDB Atlas connection
mongoose.connect(process.env.MONGODB_URI)
    .then(()=> console.log('Connected to MongoDB Atlas'))
    .catch(()=> console.log('MongoDB error:', err));

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve frontend files

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('chat message', (msg) => {
      io.emit('chat message', {msg, sender : socket.id}); // Send message to all clients
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
