import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import logger from '../utils/logger.js';

const router = express.Router();

// This route should be temporary and removed after admin creation
router.post('/create-admin', async (req, res) => {
    try {
        // Check for secret key from request (add an extra layer of security)
        const { secretKey } = req.body;
        
        if (!secretKey || secretKey !== process.env.ADMIN_SEED_SECRET) {
            logger.warn(`Unauthorized attempt to access admin seed API from IP ${req.ip}`);
            return res.status(401).json({
                success: false,
                error: "Unauthorized: Invalid secret key"
            });
        }
        
        // // Check if admin already exists
        // const existingAdmin = await User.findOne({ role: "admin" });
        
        // if (existingAdmin) {
        //     return res.status(400).json({
        //         success: false,
        //         error: "Admin user already exists"
        //     });
        // }
        
        // Create new admin
        const hashPassword = await bcrypt.hash("hr#coffee", 10);
        const newUser = new User({
            name: "HR",
            email: "hr@maximizemarketresearch.com",
            password: hashPassword,
            role: "admin"
        });
        
        await newUser.save();
        
        logger.info("Admin user created successfully");
        
        return res.status(201).json({
            success: true,
            message: "Admin user created successfully",
            // Don't return the full user object for security
            user: {
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        logger.error(`Error creating admin user: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in creating admin user"
        });
    }
});

export default router;