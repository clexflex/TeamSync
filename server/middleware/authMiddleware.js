import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from '../utils/logger.js';

const verifyUser = async (req, res, next) => {
    try {
        // Check for token in different places
        const token = req.headers.authorization?.split(' ')[1] || 
                     req.cookies?.token ||
                     req.query?.token;

        if (!token) {
            logger.warn('Authentication failed: No token provided.');
            return res.status(401).json({
                success: false,
                error: "Access denied. Please login."
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const user = await User.findById(decoded._id).select('-password');

            if (!user) {
                logger.warn('Authentication failed: User not found.');

                return res.status(401).json({
                    success: false,
                    error: "User not found."
                });
            }

            // Add user info to request
            req.user = user;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                logger.error('Invalid token or token expired: ' + error.message);

                return res.status(401).json({
                    success: false,
                    error: "Token expired. Please login again."
                });
            }
            return res.status(401).json({
                success: false,
                error: "Invalid token."
            });
        }
    } catch (error) {
        logger.error('Server error in authentication: ' + error.message);

        return res.status(500).json({
            success: false,
            error: "Server error in authentication."
        });
    }
};

const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "User not authenticated."
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    error: "Access denied. Insufficient permissions."
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: "Server error in role verification."
            });
        }
    };
};

export { verifyUser, verifyRole };