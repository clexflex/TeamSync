import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logDirectory = process.env.NODE_ENV === 'production' ? '/persistent/logs' : './logs';
if (!fs.existsSync(logDirectory)){
    fs.mkdirSync(logDirectory, { recursive: true });
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { 
        service: 'teamsync-service',
        instance: process.env.RENDER_INSTANCE_ID || 'local'
    },
    transports: [
        // Error log
        new winston.transports.File({ 
            filename: path.join(logDirectory, 'error.log'), 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Combined log
        new winston.transports.File({ 
            filename: path.join(logDirectory, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 10,
        })
    ]
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Flush logs to files before exit
process.on('exit', () => {
    logger.end(); // Ensures logs are written to files before process exits
});

export default logger;
