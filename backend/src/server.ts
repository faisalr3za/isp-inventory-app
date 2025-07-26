import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { db } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import inventoryRoutes from './routes/inventory';
import categoryRoutes from './routes/categories';
import supplierRoutes from './routes/suppliers';
import reportRoutes from './routes/reports';
import customerRoutes from './routes/customers';
import activityReportRoutes from './routes/activityReports';
import uploadRoutes from './routes/upload';
import barcodeRoutes from './routes/barcode';

// S3 Configuration
import { displayS3Setup, testS3Connection, createS3Bucket } from './config/s3';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CloudBit Inventory API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/activity-reports', activityReportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/barcode', barcodeRoutes);

// Socket.IO untuk real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('inventory_update', (data) => {
    socket.broadcast.emit('inventory_changed', data);
  });

  socket.on('report_submitted', (data) => {
    socket.broadcast.emit('new_report', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Export io untuk digunakan di controller lain
export { io };

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Start server
server.listen(PORT, async () => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    console.log('✅ Database terhubung');
    
    // Display S3 setup information
    displayS3Setup();
    
    // Test S3 connection and setup
    await testS3Connection();
    
    console.log(`🚀 Server berjalan di port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Backend URL: http://localhost:${PORT}`);
    console.log(`📋 API Documentation: http://localhost:${PORT}/health`);
    
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    db.destroy();
    process.exit(0);
  });
});
