import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import logger from "../utils/logger.js"; 
// Rate limiting for failed login attempts
const loginAttempts = new Map();

const handleLoginAttempts = (ip) => {
    const attempts = loginAttempts.get(ip) || { count: 0, timestamp: Date.now() };
    
    // Reset attempts after 15 minutes
    if (Date.now() - attempts.timestamp > 15 * 60 * 1000) {
        attempts.count = 0;
        attempts.timestamp = Date.now();
    }
    
    if (attempts.count >= 20) {
        logger.warn(`IP ${ip} blocked due to too many failed login attempts.`);
        throw new Error("Too many login attempts. Please try again after 15 minutes.");
    }
    
    loginAttempts.set(ip, {
        count: attempts.count + 1,
        timestamp: attempts.timestamp
    });
};

const login = async (req, res) => {
    try {
        // Rate limiting check
        handleLoginAttempts(req.ip);

        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            logger.warn(`Login attempt failed: Missing email or password from IP ${req.ip}`);
            return res.status(400).json({
                success: false,
                error: "Email and password are required."
            });
        }

        // Find user and include necessary fields
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            // Increment failed attempts
            logger.warn(`Login failed for email: ${email} from IP ${req.ip}`);
            handleLoginAttempts(req.ip);
            return res.status(401).json({
                success: false,
                error: "Invalid credentials."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            // Increment failed attempts
            logger.warn(`Invalid password attempt for email: ${email} from IP ${req.ip}`);
            handleLoginAttempts(req.ip);
            return res.status(401).json({
                success: false,
                error: "Invalid credentials."
            });
        }

        // Reset login attempts on successful login
        loginAttempts.delete(req.ip);

        // Create token with appropriate expiration
        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: "24h" }
        );
        logger.info(`User ${email} successfully logged in from IP ${req.ip}`);
        // Remove sensitive data before sending response
        const userResponse = {
            _id: user._id,
            name: user.name,
            role: user.role
        };

        // Set secure cookie with token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(200).json({
            success: true,
            token,
            user: userResponse
        });

    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message || "An error occurred during login."
        });
    }
};

const verify = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            logger.warn(`User verification failed: User ID ${req.user._id} not found.`);
            return res.status(404).json({
                success: false,
                error: "User not found."
            });
        }
        logger.info(`User ${user.email} successfully verified.`);
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        logger.error(`User verification error: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Error verifying user."
        });
    }
};

export { login, verify };