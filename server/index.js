import logger from './utils/logger.js'; // Import the Winston logger
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRouter from './routes/auth.js';
import departmentRouter from './routes/department.js';
import employeeRouter from './routes/employee.js';
import salaryRouter from './routes/salary.js';
import leaveRouter from './routes/leave.js';
import settingRouter from './routes/setting.js';
import dashboardRouter from './routes/dashboard.js';
import connectToDatabase from './db/db.js';
import teamRouter from './routes/team.js';
import managerRouter from './routes/manager.js';
import attendanceRouter from './routes/attendance.js';
import holidayRouter from "./routes/holiday.js";
import userProfileRouter from './routes/userProfile.js';
import documentRouter from './routes/document.js';
import ticketRouter from './routes/ticket.js';
import resignationRouter from './routes/resignation.js';
import salaryExportRouter from './routes/salaryExport.js';
import path from 'path';
import http from 'http';
import setupSocket from './socket.js';
import notificationRouter from './routes/notification.js';
import seedAdminRouter from './routes/seedAdmin.js';

import setupCronJobs from './cron.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectToDatabase();
const app = express();
const server = http.createServer(app);
// Setup Socket.io
const { io } = setupSocket(server);
global.io = io;

// Add middleware to pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Basic middleware
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
app.use('/uploads/leave-documents', express.static(path.join(__dirname, 'public/uploads/leave-documents'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
app.use('/uploads/payslips', express.static(path.join(__dirname, 'public/uploads/payslips'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
app.use('/uploads/tickets', express.static(path.join(__dirname, 'public/uploads/tickets'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
// Routes
app.use('/api/auth', authRouter);
app.use('/api/department', departmentRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/salary', salaryRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/setting', settingRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/team', teamRouter);
app.use('/api/manager', managerRouter);
app.use('/api/attendance', attendanceRouter);
app.use("/api/holidays", holidayRouter);
app.use('/api/user-profile', userProfileRouter);
app.use('/api/documents', documentRouter);
app.use('/api/tickets', ticketRouter);
app.use('/api/resignation', resignationRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/seed-admin', seedAdminRouter);
app.use('/api/salary-export', salaryExportRouter);


// Setup cron jobs
if (!process.env.RENDER_SERVICE_ID || process.env.RENDER_INSTANCE_ID === '0' || !process.env.RENDER_INSTANCE_ID) {
  setupCronJobs();
  logger.info('Cron jobs initialized on primary instance');
} else {
  logger.info(`Skipping cron jobs on instance ${process.env.RENDER_INSTANCE_ID}`);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      instance: process.env.RENDER_INSTANCE_ID || 'unknown',
      mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime()
  });
});

// Detailed health check for cron jobs
app.get('/health/cron', async (req, res) => {
  try {
      const cronJobs = await getScheduledJobsStatus(); // You need to implement this function
      res.status(200).json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          instance: process.env.RENDER_INSTANCE_ID || 'unknown',
          isPrimaryCronInstance: !process.env.RENDER_INSTANCE_ID || process.env.RENDER_INSTANCE_ID === '0',
          cronJobs: cronJobs
      });
  } catch (error) {
      res.status(500).json({
          status: 'error',
          error: error.message
      });
  }
});
// Root directory route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working! Welcome to the server.',
  });
});
// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});
// Middleware to log all requests
app.use((req, res, next) => {
  logger.info(`📢 ${req.method} ${req.url}`);
  next();
});
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  logger.error(`❌ Error: ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Update the server startup
const PORT = process.env.PORT || 3000;
const serverInstance = server.listen(PORT, () => {
    logger.info(`🌍 Server running on port ${PORT}`);
});

// Set keepAliveTimeout higher than Render's load balancer timeout
serverInstance.keepAliveTimeout = 65000; // 65 seconds
serverInstance.headersTimeout = 66000; // 66 seconds

// Graceful shutdown handling
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received. Starting graceful shutdown...');
    
    // Stop accepting new connections
    serverInstance.close(() => {
        logger.info('HTTP server closed');
        
        // Close database connection
        mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed');
            process.exit(0);
        });
    });
    
    // Force shutdown after 30 seconds if graceful shutdown fails
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 30000);
});

// Handle unhandled rejections more gracefully
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
    // Don't exit the process, just log the error
});