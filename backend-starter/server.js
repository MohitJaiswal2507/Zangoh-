// server.js - Main server file
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const dotenv = require('dotenv');

// Routes
const conversationsRoutes = require('./routes/conversations');
const agentsRoutes = require('./routes/agents');
const knowledgeBaseRoutes = require('./routes/knowledgeBase');
const analyticsRoutes = require('./routes/analytics');
const interveneRoutes = require('./routes/intervene');
const templatesRoutes = require('./routes/templates');
const mockLlmRoutes = require('./mockLlmApi');
const vectorRoutes = require('./routes/vector');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

// WebSocket handlers
const socketHandler = require('./websocket/socketHandler');

// Config
dotenv.config();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zangoh';

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(requestLogger);

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API routes
app.use('/api/conversations', conversationsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/intervene', interveneRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/llm', mockLlmRoutes);
app.use('/api/vector', vectorRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

// WebSocket connection handling
wss.on('connection', socketHandler);

// Database connection & startup
async function startServer() {
  try {
    // Attempt connecting to configured MongoDB
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2500 });
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);
  } catch (err) {
    console.warn(`Could not connect to external MongoDB at ${MONGODB_URI} (${err.message}). Starting in-memory Mongo server fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`Connected to in-memory MongoDB at ${memUri}`);
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB:', memErr.message);
    }
  }

  // Ensure initial seed data exists
  try {
    const Conversation = require('./models/conversation');
    const count = await Conversation.countDocuments();
    if (count === 0) {
      console.log('Database empty, seeding default workstation data...');
      const seedData = require('./utils/seedData');
      await seedData.runSeed();
    }
  } catch (seedErr) {
    console.error('Error during auto-seed check:', seedErr.message);
  }

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
      console.error(`To free port ${PORT}, run in PowerShell:`);
      console.error(`  Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  });
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
