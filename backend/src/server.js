'use strict';

const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

const { apiLogger } = require('./middlewares/apiLogger');

// ─── Core Middlewares ──────────────────────────────────────────────────────────
app.use(apiLogger);
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Gamification API is running',
    data: {
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    },
    meta: null,
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/v1', require('./routes/index'));
app.use('/api', require('./routes/index'));

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Harus dipasang SETELAH semua route agar bisa menangkap next(error)
app.use(require('./middlewares/errorHandler').errorHandler);


// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    data: null,
    meta: null,
  });
});

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const httpServer = http.createServer(app);

// ─── WebSocket (Socket.IO) ───────────────────────────────────────────────────
const { initSocket } = require('./config/socket');
initSocket(httpServer);

// ─── MinIO Storage Initialization ────────────────────────────────────────────
const { initMinIO } = require('./config/minio');
initMinIO();

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 Gamification API running on port ${PORT}`);
    console.log(`📌 Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
  });
}

module.exports = { app, httpServer };
