const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const complaintRoutes = require('./routes/complaintRoutes');
const portalRoutes = require('./routes/portalRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Security & logging
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/portals', portalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'CivicVoice API',
    version: '1.0.0',
    docs: '/api/health',
    endpoints: [
      'GET    /api/health',
      'GET    /api/complaints',
      'POST   /api/complaints',
      'GET    /api/complaints/stats',
      'GET    /api/complaints/nearby',
      'GET    /api/complaints/:id',
      'GET    /api/portals'
    ]
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler — must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CivicVoice backend running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
