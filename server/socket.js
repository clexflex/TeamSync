import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import logger from "./utils/logger.js";

// Map to store active user connections
const userSockets = new Map();

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // JWT Authentication middleware for socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const user = await User.findById(decoded._id).select('-password');

            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            // Attach user to socket
            socket.user = user;
            next();
        } catch (error) {
            logger.error(`Socket authentication error: ${error.message}`);
            next(new Error("Authentication error"));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        logger.info(`User ${userId} connected to socket`);

        // Store user's socket connection
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);

        // Join user to their private room for direct messages
        socket.join(`user:${userId}`);

        // Join rooms based on user role
        socket.join(`role:${socket.user.role}`);

        // Handle disconnection
        socket.on('disconnect', () => {
            logger.info(`User ${userId} disconnected from socket`);
            const userSocketSet = userSockets.get(userId);
            if (userSocketSet) {
                userSocketSet.delete(socket.id);
                if (userSocketSet.size === 0) {
                    userSockets.delete(userId);
                }
            }
        });
    });

    return { io, userSockets };
};

export default setupSocket;