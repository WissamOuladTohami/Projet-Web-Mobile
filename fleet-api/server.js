const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// HTTP server (IMPORTANT for socket.io)
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // later you can restrict to your frontend URL
  },
});

// make io accessible everywhere (routes/services)
app.set('io', io);

// When client connects
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// your routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/vehicles', require('./routes/vehicles.routes'));
app.use('/api/drivers', require('./routes/drivers.routes'));
app.use('/api/positions', require('./routes/positions.routes'));
app.use('/api/fuel-logs', require('./routes/fuellogs.routes'));

app.get('/', (req, res) => res.json({ message: 'Fleet API running' }));

const PORT = process.env.PORT || 3000;

// IMPORTANT: use server.listen (not app.listen)
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});