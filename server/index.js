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
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectToDatabase();
const app = express();

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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`🌍 Server running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Don't crash the server, but log the error
});