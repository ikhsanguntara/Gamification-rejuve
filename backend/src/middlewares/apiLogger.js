'use strict';

const prisma = require('../config/db');

/**
 * @file apiLogger.js
 * Middleware untuk mencatat setiap request HTTP yang masuk ke database (m_apilog).
 * Menggunakan mekanisme Asynchronous Batch Processing (Queue).
 */

const LOG_BATCH_LIMIT = 50; 
const LOG_FLUSH_INTERVAL_MS = 5000; 

let logQueue = [];
let flushTimer = null;

// Eksekutor simpan ke database (Background Process)
const flushLogs = async () => {
  if (logQueue.length === 0) return;

  const logsToInsert = [...logQueue];
  logQueue = []; 

  try {
    await prisma.apiLog.createMany({
      data: logsToInsert
    });
  } catch (error) {
    console.error(`[API Logger] Gagal menyimpan log:`, error.message);
  }
};

const startFlushTimer = () => {
  if (!flushTimer) {
    flushTimer = setInterval(flushLogs, LOG_FLUSH_INTERVAL_MS);
  }
};
startFlushTimer();

// ─── SANITIZER ───────────────────────────────────────────────────────────────
const SENSITIVE_KEYS = ['password', 'token', 'pin', 'secret'];

const sanitizePayload = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizePayload(item));
  }

  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        sanitized[key] = '***MASKED***';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = sanitizePayload(sanitized[key]);
      }
    }
  }
  return sanitized;
};

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────
const apiLogger = (req, res, next) => {
  const start = Date.now();

  let resBody = null;
  const originalJson = res.json;
  const originalSend = res.send;

  res.json = function (body) {
    resBody = sanitizePayload(body);
    return originalJson.call(this, body);
  };

  res.send = function (body) {
    if (!resBody && typeof body === 'object') {
      resBody = sanitizePayload(body);
    }
    return originalSend.call(this, body);
  };

  res.on('finish', () => {
    // Ambil request body yang sudah disanitasi sekarang (karena express.json() sudah jalan)
    const reqBody = req.body && Object.keys(req.body).length > 0 ? sanitizePayload(req.body) : null;

    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    // --- CONSOLE LOGGING (VISUAL) ---
    let statusColor = '\x1b[32m'; 
    if (statusCode >= 400 && statusCode < 500) statusColor = '\x1b[33m'; 
    else if (statusCode >= 500) statusColor = '\x1b[31m'; 
    const resetColor = '\x1b[0m';

    console.log(`[${method}] ${originalUrl} - ${statusColor}${statusCode}${resetColor} (${duration}ms)`);

    // --- QUEUE LOGGING KE DB ---
    logQueue.push({
      method,
      url: originalUrl,
      statusCode,
      duration,
      requestData: reqBody,
      responseData: resBody,
      timestamp: new Date()
    });

    if (logQueue.length >= LOG_BATCH_LIMIT) {
      flushLogs();
    }
  });

  next();
};

module.exports = { apiLogger };
