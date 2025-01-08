import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to verify user token
const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(404).json({ success: false, error: "Token Not Provided" });
        }

        const decoded = await jwt.verify(token, process.env.JWT_KEY);
        if (!decoded) {
            return res.status(404).json({ success: false, error: "Token Not Valid" });
        }

        const user = await User.findById({ _id: decoded._id }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, error: "User Not Found" });
        }

        req.user = user; // Add user info to request object
        next();
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server Error" });
    }
};

// Middleware to verify user role
const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: "Unauthorized: No user data available" });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ success: false, error: "Access Denied: Insufficient Permissions" });
            }

            next(); // User has valid role, proceed to the next middleware or route
        } catch (error) {
            return res.status(500).json({ success: false, error: "Server Error in Role Verification" });
        }
    };
};

export { verifyUser, verifyRole };
