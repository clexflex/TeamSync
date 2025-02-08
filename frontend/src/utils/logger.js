const LOG_STORAGE_KEY = "app_logs"; // Key for saving logs in localStorage

const levels = {
    INFO: "INFO",
    WARN: "WARN",
    ERROR: "ERROR",
};

// Function to format log messages
const logMessage = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...(data && { data }), // Include extra data if provided
    };

    console.log(`[${timestamp}] [${level}] ${message}`, data || ""); // Console log for debugging

    saveLog(logEntry); // Save log to local storage
};

// Save logs to local storage
const saveLog = (logEntry) => {
    const existingLogs = JSON.parse(localStorage.getItem(LOG_STORAGE_KEY)) || [];
    existingLogs.push(logEntry);

    // Keep only the last 100 logs to avoid excessive storage usage
    if (existingLogs.length > 100) {
        existingLogs.shift(); // Remove oldest log
    }

    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(existingLogs));
};

// Retrieve stored logs
const getStoredLogs = () => JSON.parse(localStorage.getItem(LOG_STORAGE_KEY)) || [];

// Clear logs manually (can be used in settings page)
const clearLogs = () => {
    localStorage.removeItem(LOG_STORAGE_KEY);
};

export const logger = {
    info: (message, data = null) => logMessage(levels.INFO, message, data),
    warn: (message, data = null) => logMessage(levels.WARN, message, data),
    error: (message, data = null) => logMessage(levels.ERROR, message, data),
    getStoredLogs,
    clearLogs,
};
