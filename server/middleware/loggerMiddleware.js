// server/middleware/loggerMiddleware.js
import logger from '../utils/logger.js';

// Middleware to log all incoming requests
const requestLogger = (req, res, next) => {
    logger.info(`Request Method: ${req.method}, Request URL: ${req.originalUrl}`);
    next();
};

// Global error handler with logging
const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}, Stack: ${err.stack}`);
    res.status(500).json({ success: false, error: 'Internal server error' });
};

export { requestLogger, errorHandler };
