const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_warning')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// Routes
const weatherRoutes = require('./routes/weatherRoutes');
const alertRoutes = require('./routes/alertRoutes');
const riskRoutes = require('./routes/riskRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/weather', weatherRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'active', 
    time: new Date().toISOString(),
    services: ['weather', 'alerts', 'risks', 'ai']
  });
});

// Real-time alerts via Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  socket.on('subscribe-alerts', (city) => {
    socket.join(city);
    console.log(`📍 ${socket.id} subscribed to ${city}`);
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Real-time alerts enabled`);
});