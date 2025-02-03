// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyUser = async (req, res, next) => {
    try {
        // Check for token in different places
        const token = req.headers.authorization?.split(' ')[1] || 
                     req.cookies?.token ||
                     req.query?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Access denied. Please login."
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const user = await User.findById(decoded._id).select('-password');

            if (!user) {
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