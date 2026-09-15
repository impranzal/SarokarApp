require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(mongoSanitize()); // strips $/. operators from user input -> no NoSQL injection
app.use(xss()); // sanitizes user input against XSS payloads
app.use(pinoHttp({ logger }));

// A general API-wide limiter as a backstop, in addition to the stricter
// per-route limiters on auth/feedback.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 300 : 1000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests, slow down.' },
  })
);

// --- Routes ---
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'degraded', service: 'sarokar-api', database: ready ? 'connected' : 'disconnected' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  if (process.env.NODE_ENV === 'production') {
    const required = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_ORIGIN'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
    if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }
  await connectDB();
  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'API listening');
  });
}

if (require.main === module) {
  start().catch((err) => {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  });
}

module.exports = app;
