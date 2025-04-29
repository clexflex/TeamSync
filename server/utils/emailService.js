// server/utils/emailService.js
import nodemailer from "nodemailer";
import logger from "./logger.js";

// Create a single transporter instance to be shared across the application
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.hostinger.com",
    port: process.env.EMAIL_PORT || 465,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER || "yashraj@researchmaximize.com",
        pass: process.env.EMAIL_PASS || "Yash@#1312"
    }
});

// Initialize the connection pool when the application starts
(async function() {
    try {
        // Verify connection configuration
        await transporter.verify();
        logger.info('Email service initialized successfully');
    } catch (error) {
        logger.error(`Failed to initialize email service: ${error.message}`);
        
        // Still allow the application to start even if email is not working
        // This prevents email issues from taking down the entire app
    }
})();

// General send email function
export const sendEmail = async (options) => {
    try {
        const result = await transporter.sendMail(options);
        logger.info(`Email sent to ${options.to}`);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
        return { success: false, error: error.message };
    }
};

// Welcome email function
export const sendWelcomeEmail = async (user, password, role) => {
    try {
        const mailOptions = {
            from: `"Maximize Market Research Pvt. Ltd." <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Welcome to Maximize Market Research Employee Management System - Your Account Information",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="background-color: #3f51b5; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0;">
                        <h2 style="margin: 0;">Welcome to TeamSync!</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear ${user.name},</p>
                        <p>Your account has been created. Below are your login credentials:</p>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Password:</strong> ${password}</p>
                            <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
                        </div>
                        
                        <p><strong>Getting Started:</strong></p>
                        <ol>
                            <li><strong>Login:</strong> Visit the MMR EMS(https://mmrems.com/login) portal and use the credentials above to log in.</li>
                            <li><strong>Clock-In:</strong> Once logged in, navigate to "Real-Time Attendance" to clock in and out each day.</li>
                            <li><strong>Leave Management:</strong> Request leaves through the "Leaves" section of your dashboard.</li>
                            <li><strong>Documents:</strong> Access important documents through the "Document Center".</li>
                            <li><strong>Change Password:</strong> For security, please change your password after first login.</li>
                        </ol>
                        
                        <p>For detailed instructions, please refer to the user guide or contact your administrator.</p>
                        <p>For technical support, please email yashrajj.mmr@gmail.com.</p>                        
                        
                        <p>Welcome aboard!</p>
                        <p>The MMR EMS Team </p>
                        
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                        <p style="font-size: 12px; color: #666;">This is an automated message from Maximize Market Research Pvt. Ltd. Please do not reply to this email.</p>
                    </div>
                </div>
            `
        };

        return await sendEmail(mailOptions);
    } catch (error) {
        logger.error(`Failed to send welcome email: ${error.message}`);
        return { success: false, error: error.message };
    }
};

// Profile update email function
export const sendProfileUpdateEmail = async (user, changes) => {
    try {
        let changesHTML = '<ul>';
        for (const [field, values] of Object.entries(changes)) {
            changesHTML += `<li><strong>${field}:</strong> Changed from "${values.old}" to "${values.new}"</li>`;
        }
        changesHTML += '</ul>';

        const mailOptions = {
            from: `"Maximize Market Research Pvt. Ltd." <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Your Profile Has Been Updated",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="background-color: #3f51b5; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0;">
                        <h2 style="margin: 0;">Profile Update Notification</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear ${user.name},</p>
                        <p>Your profile has been updated with the following changes:</p>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            ${changesHTML}
                        </div>
                        
                        <p>If you believe these changes were made in error, please contact your administrator.</p>
                        
                        <p>Thank you,</p>
                        <p>The TeamSync Team</p>
                        
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                        <p style="font-size: 12px; color: #666;">This is an automated message from Maximize Market Research Pvt. Ltd. Please do not reply to this email.</p>
                    </div>
                </div>
            `
        };

        return await sendEmail(mailOptions);
    } catch (error) {
        logger.error(`Failed to send profile update email: ${error.message}`);
        return { success: false, error: error.message };
    }
};

// Notification email function (used by notificationController)
export const sendNotificationEmail = async (notification, user) => {
    try {
        const mailOptions = {
            from: `"Maximize Market Research Pvt. Ltd." <${process.env.EMAIL_USER || "notifications@teamsync.com"}>`,
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
                        <p style="font-size: 12px; color: #666;">This is an automated message from Maximize Market Research Pvt. Ltd. Please do not reply to this email.</p>
                    </div>
                </div>
            `
        };

        return await sendEmail(mailOptions);
    } catch (error) {
        logger.error(`Failed to send notification email: ${error.message}`);
        return { success: false, error: error.message };
    }
};

export default {
    sendEmail,
    sendWelcomeEmail,
    sendProfileUpdateEmail,
    sendNotificationEmail
};