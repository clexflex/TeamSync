import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure the logs directory exists
const logDirectory = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        // Console Transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // File Transports
        new winston.transports.File({
            filename: path.join(logDirectory, 'error.log'),
            level: 'error',
            handleExceptions: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        new winston.transports.File({
            filename: path.join(logDirectory, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    ],
    exitOnError: false
});

// Flush logs to files before exit
process.on('exit', () => {
    logger.end(); // Ensures logs are written to files before process exits
});

export default logger;
