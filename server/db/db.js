import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectToDatabase = async () => {
    const options = {
        maxPoolSize: 10,  // Increased pool size for multiple instances
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        family: 4, // Force IPv4
        retryWrites: true,
        writeConcern: {
            w: 'majority'
        }
    };
    
    try {
        await mongoose.connect(process.env.MONGODB_URL, options);
        
        // Set up connection event handlers
        mongoose.connection.on('connected', () => {
            logger.info('✅ MongoDB connected successfully');
        });
        
        mongoose.connection.on('error', (err) => {
            logger.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });
        
        // Handle process termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        });
        
        logger.info("✅ MongoDB initial connection established");
        
    } catch (error) {
        logger.error("❌ MongoDB connection error:", error.message);
        // Exit process if cannot connect to DB
        process.exit(1);
    }
}

export default connectToDatabase;