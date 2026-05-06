const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database initializer (auto-creates DB, tables, seeds)
const initializeDatabase = require('./config/initDb');

const app = express();

// =============================================
// Middleware
// =============================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// =============================================
// Initialize DB & Start Server
// Uses process.env.PORT for Railway deployment
// =============================================
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Auto-create database, tables, and seed data FIRST
    await initializeDatabase();
    
    // 2. Load routes ONLY AFTER the database exists
    const authRoutes = require('./routes/auth');
    const taskRoutes = require('./routes/tasks');
    const projectRoutes = require('./routes/projects');
    const userRoutes = require('./routes/users');
    const dashboardRoutes = require('./routes/dashboard');

    // 3. Mount API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/tasks', taskRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/dashboard', dashboardRoutes);

    // Serve static files from the React app in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/dist')));

      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
      });
    } else {
      // 404 handler for development
      app.use((req, res) => {
        res.status(404).json({ success: false, message: 'Route not found.' });
      });
    }

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    });

    // 4. Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
