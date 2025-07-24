const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

// PostgreSQL pool
const pool = new Pool({
  user: 'resortuser',
  host: 'localhost',
  database: 'resortapp',
  password: 'resortpass',
  port: 5432,
});

// Test DB connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL');
  release();
});

// Placeholder routes
app.get('/', (req, res) => {
  res.send('Resort App API is running');
});

app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));

// Socket.IO for chat
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });
  socket.on('chatMessage', (data) => {
    io.to(data.roomId).emit('chatMessage', data);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 