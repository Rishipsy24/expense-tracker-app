const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
app.use(helmet());

// FRONTEND_URL can contain one or more comma-separated origins.  This keeps
// local development available while allowing the deployed Vercel application.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:5173,https://expense-tracker-app-rho-pearl.vercel.app')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header (health checks, curl, server-to-server)
    // do not need browser CORS protection.
    // Vercel preview and production deployments use *.vercel.app origins. This
    // avoids breaking the deployed frontend when Render has a stale env value.
    const isVercelDeployment = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin || '');

    if (!origin || allowedOrigins.includes(origin) || isVercelDeployment) {
      return callback(null, true);
    }

    return callback(new Error(`CORS rejected origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('dev'));
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Expense Tracker API is running'
  });
});

// Root Endpoint for Render Health Checks
app.get('/', (req, res) => {
  res.status(200).send('Expense Tracker Backend is alive!');
});

// Fallback for 404
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
});

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
