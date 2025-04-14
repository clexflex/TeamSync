import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import UserProfile from "../models/UserProfile.js";
import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

// Email transporter setup - configure in production
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.example.com",
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER || "notifications@teamsync.com",
        pass: process.env.EMAIL_PASS || "password"
    }
});

// Helper function to send email notification

const sendEmail = async (notification, user) => {
    try {
        if (!notification.sendEmail || notification.emailSent) {
            return;
        }

        const mailOptions = {
            from: `"Mximize Market Research Pvt. Ltd." <${process.env.EMAIL_USER || "notifications@teamsync.com"}>`,
            to: user.email,
            subject: notification.title,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="background-color: #3f51b5; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0;">
                        <h2 style="margin: 0;">${notification.title}</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>${notification.message}</p>
                        <p>Sent on: ${new Date(notification.createdAt).toLocaleString()}</p>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                        <p style="font-size: 12px; color: #666;">This is an automated message from Mximize Market Research Pvt. Ltd.. Please do not reply to this email.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        
        // Mark email as sent
        await Notification.findByIdAndUpdate(notification._id, { emailSent: true });
        logger.info(`Email sent to ${user.email} for notification ${notification._id}`);
    } catch (error) {
        logger.error(`Failed to send email notification: ${error.message}`);
    }
};

// Create a new notification
export const createNotification = async (req, res) => {
    try {
        // Change from sendEmail to shouldSendEmail to avoid name collision
        const { userId, title, message, type, relatedTo, metadata, isGlobal, shouldSendEmail } = req.body;
        
        // Validation
        if (!userId && !isGlobal) {
            return res.status(400).json({
                success: false,
                error: "Either userId or isGlobal must be provided"
            });
        }

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                error: "Title and message are required"
            });
        }

        // For global notifications, create one for each user
        if (isGlobal) {
            const users = await User.find({ status: 'active' });
            const notifications = [];

            for (const user of users) {
                const notification = new Notification({
                    userId: user._id,
                    title,
                    message,
                    type: type || "general",
                    relatedTo,
                    metadata,
                    isGlobal,
                    sendEmail: shouldSendEmail || false
                });

                await notification.save();
                notifications.push(notification);

                // Send socket notification to connected user
                if (req.io) {
                    req.io.to(`user:${user._id}`).emit('new_notification', notification);
                }

                // Send email if requested - renamed variable here
                if (shouldSendEmail) {
                    await sendEmail(notification, user);
                }
            }

            logger.info(`Created global notification "${title}" for ${users.length} users`);
            return res.status(201).json({
                success: true,
                message: `Created notification for ${users.length} users`,
                count: users.length
            });
        } else {
            // For individual notification
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: "User not found"
                });
            }

            const notification = new Notification({
                userId,
                title,
                message,
                type: type || "general",
                relatedTo,
                metadata,
                isGlobal: false,
                sendEmail: shouldSendEmail || false
            });

            await notification.save();

            // Send socket notification
            if (req.io) {
                req.io.to(`user:${userId}`).emit('new_notification', notification);
            }

            // Send email if requested - renamed variable here
            if (shouldSendEmail) {
                await sendEmail(notification, user);
            }

            logger.info(`Created notification "${title}" for user ${userId}`);
            return res.status(201).json({
                success: true,
                notification
            });
        }
    } catch (error) {
        console.log(error)
        logger.error(`Error creating notification: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in creating notification: ${error.message}`
        });
    }
};

// Get notifications for the current user
export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, isRead } = req.query;
        
        const query = { userId };
        
        // Filter by read status if provided
        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }
        
        const options = {
            sort: { createdAt: -1 },
            skip: (parseInt(page) - 1) * parseInt(limit),
            limit: parseInt(limit)
        };
        
        const notifications = await Notification.find(query, null, options);
        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });
        
        return res.status(200).json({
            success: true,
            notifications,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            },
            unreadCount
        });
    } catch (error) {
        logger.error(`Error fetching notifications: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in fetching notifications: ${error.message}`
        });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        const notification = await Notification.findOne({ _id: id, userId });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: "Notification not found"
            });
        }
        
        notification.isRead = true;
        await notification.save();
        
        return res.status(200).json({
            success: true,
            message: "Notification marked as read"
        });
    } catch (error) {
        logger.error(`Error marking notification as read: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in marking notification: ${error.message}`
        });
    }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const result = await Notification.updateMany(
            { userId, isRead: false },
            { $set: { isRead: true } }
        );
        
        return res.status(200).json({
            success: true,
            message: `Marked ${result.modifiedCount} notifications as read`
        });
    } catch (error) {
        logger.error(`Error marking all notifications as read: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in marking notifications: ${error.message}`
        });
    }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        const notification = await Notification.findOne({ _id: id, userId });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: "Notification not found"
            });
        }
        
        await Notification.findByIdAndDelete(id);
        
        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });
    } catch (error) {
        logger.error(`Error deleting notification: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in deleting notification: ${error.message}`
        });
    }
};

// Clear all notifications for a user
export const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const result = await Notification.deleteMany({ userId });
        
        return res.status(200).json({
            success: true,
            message: `Cleared ${result.deletedCount} notifications`
        });
    } catch (error) {
        logger.error(`Error clearing notifications: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in clearing notifications: ${error.message}`
        });
    }
};

// Create a system notification for birthdays
export const createBirthdayNotifications = async () => {
    try {
        // Get current date
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // Month is 0-indexed
        const currentDay = today.getDate();
        
        // Find users with birthdays today
        const users = await User.find({});
        const birthdayUsers = [];
        
        for (const user of users) {
            // Find employee record to get DOB
            const employee = await Employee.findOne({ userId: user._id });
            
            if (employee && employee.dob) {
                const dob = new Date(employee.dob);
                const birthMonth = dob.getMonth() + 1;
                const birthDay = dob.getDate();
                
                // Check if today is the user's birthday
                if (birthMonth === currentMonth && birthDay === currentDay) {
                    birthdayUsers.push({ user, employee });
                }
            }
        }
        
        // Create notifications for each birthday user
        for (const { user, employee } of birthdayUsers) {
            // Create a notification for all other users
            const otherUsers = await User.find({ _id: { $ne: user._id }, status: 'active' });
            
            for (const otherUser of otherUsers) {
                const notification = new Notification({
                    userId: otherUser._id,
                    title: "Birthday Celebration!",
                    message: `Today is ${user.name}'s birthday. Wish them a happy birthday!`,
                    type: "birthday",
                    relatedTo: {
                        model: "User",
                        id: user._id
                    },
                    metadata: {
                        birthday: employee.dob,
                        employeeId: employee.employeeId
                    },
                    sendEmail: true
                });
                
                await notification.save();
                
                // Send socket notification
                if (global.io) {
                    global.io.to(`user:${otherUser._id}`).emit('new_notification', notification);
                }
                
                // Send email
                await sendEmail(notification, otherUser);
            }
            
            logger.info(`Created birthday notifications for ${user.name}`);
        }
        
        return {
            success: true,
            message: `Created birthday notifications for ${birthdayUsers.length} users`
        };
    } catch (error) {
        logger.error(`Error creating birthday notifications: ${error.message}`);
        return {
            success: false,
            error: `Error creating birthday notifications: ${error.message}`
        };
    }
};

// Create work anniversary notifications
export const createWorkAnniversaryNotifications = async () => {
    try {
        // Get current date
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        
        // Find all user profiles to check joining dates
        const userProfiles = await UserProfile.find({});
        const anniversaryUsers = [];
        
        for (const profile of userProfiles) {
            if (profile.joiningDate) {
                const joiningDate = new Date(profile.joiningDate);
                const joinMonth = joiningDate.getMonth() + 1;
                const joinDay = joiningDate.getDate();
                
                // Check if today is a work anniversary
                if (joinMonth === currentMonth && joinDay === currentDay) {
                    const user = await User.findById(profile.userId);
                    if (user && user.status === 'active') {
                        // Calculate years of service
                        const years = today.getFullYear() - joiningDate.getFullYear();
                        if (years > 0) {
                            anniversaryUsers.push({ user, profile, years });
                        }
                    }
                }
            }
        }
        
        // Create notifications for each anniversary
        for (const { user, profile, years } of anniversaryUsers) {
            // Create a notification for all users
            const allUsers = await User.find({ status: 'active' });
            
            for (const recipient of allUsers) {
                const notification = new Notification({
                    userId: recipient._id,
                    title: "Work Anniversary",
                    message: `Congratulations to ${user.name} for completing ${years} ${years === 1 ? 'year' : 'years'} with the company!`,
                    type: "work_anniversary",
                    relatedTo: {
                        model: "User",
                        id: user._id
                    },
                    metadata: {
                        joiningDate: profile.joiningDate,
                        years
                    },
                    sendEmail: true
                });
                
                await notification.save();
                
                // Send socket notification
                if (global.io) {
                    global.io.to(`user:${recipient._id}`).emit('new_notification', notification);
                }
                
                // Send email
                await sendEmail(notification, recipient);
            }
            
            logger.info(`Created work anniversary notifications for ${user.name} (${years} years)`);
        }
        
        return {
            success: true,
            message: `Created work anniversary notifications for ${anniversaryUsers.length} users`
        };
    } catch (error) {
        logger.error(`Error creating work anniversary notifications: ${error.message}`);
        return {
            success: false,
            error: `Error creating work anniversary notifications: ${error.message}`
        };
    }
};