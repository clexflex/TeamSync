// server/cron.js
import cron from "node-cron";
import { createBirthdayNotifications, createWorkAnniversaryNotifications } from "./controllers/notificationController.js";
import logger from "./utils/logger.js";
import mongoose from "mongoose";

// Setup all cron jobs for scheduled tasks
const setupCronJobs = () => {
    logger.info("Initializing cron jobs for the application");

    // ======================================================
    // DAILY JOBS
    // ======================================================
    
    // Daily notification job - runs at 00:01 AM every day
    cron.schedule("1 0 * * *", async () => {
        logger.info("Running daily notification checks");
        
        try {
            // Generate birthday notifications
            const birthdayResult = await createBirthdayNotifications();
            logger.info(`Birthday notification job: ${birthdayResult.success ? 'Success' : 'Failed'}`);
            
            // Generate work anniversary notifications
            const anniversaryResult = await createWorkAnniversaryNotifications();
            logger.info(`Work anniversary notification job: ${anniversaryResult.success ? 'Success' : 'Failed'}`);
        } catch (error) {
            logger.error(`Error in notification cron job: ${error.message}`);
        }
    });
    
    // Auto clock-out job - runs at 11:59 PM (23:59) every day
    cron.schedule("59 23 * * *", async () => {
        logger.info("Running automatic end-of-day clock-out");
        
        try {
            // Import required models and controllers dynamically to avoid circular dependencies
            const Attendance = mongoose.model("Attendance");
            const User = mongoose.model("User");
            const Team = mongoose.model("Team");
            const { createNotification } = await import("./controllers/notificationController.js");
            
            // Create today's date boundaries
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Find all attendance records from today with clock-in but no clock-out
            const incompleteAttendances = await Attendance.find({
                date: {
                    $gte: today,
                    $lt: tomorrow
                },
                clockIn: { $ne: null },
                clockOut: null
            }).populate({
                path: 'userId',
                select: 'name email role'
            });
            
            if (incompleteAttendances.length === 0) {
                logger.info("No incomplete attendance records found for today");
                return;
            }
            
            logger.info(`Found ${incompleteAttendances.length} incomplete attendance records to auto clock-out`);
            
            // Store users to notify to avoid duplicate processing
            const notifiedUsers = new Set();
            
            // Process each incomplete attendance
            for (const attendance of incompleteAttendances) {
                try {
                    // Set clock-out time to current time (11.59 PM)
                    const now = new Date();
                    attendance.clockOut = now;
                    
                    // Set status to Incomplete Attendance
                    attendance.status = "Incomplete Attendance";
                    
                    // Set credits to 0.5 (half day)
                    attendance.credits = 0.5;
                    
                    // Generate default task message
                    attendance.tasksDone = "Auto clock-out by system at end of day. No tasks were recorded.";
                    
                    // Calculate hours worked
                    if (attendance.clockIn) {
                        const clockInTime = new Date(attendance.clockIn);
                        const diffMs = now - clockInTime;
                        attendance.hoursWorked = diffMs / (1000 * 60 * 60); // Convert ms to hours
                    }
                    
                    // Add comment about auto clock-out
                    const comment = attendance.comments 
                        ? `${attendance.comments}\n\nAuto clock-out triggered at ${now.toLocaleTimeString()} due to missing manual clock-out.`
                        : `Auto clock-out triggered at ${now.toLocaleTimeString()} due to missing manual clock-out.`;
                    
                    attendance.comments = comment;
                    
                    // Set approval status to Auto-Approved
                    attendance.approvalStatus = "Auto-Approved";
                    
                    // Save the updated attendance record
                    await attendance.save();
                    
                    // Track this user as processed
                    if (attendance.userId && attendance.userId._id) {
                        notifiedUsers.add(attendance.userId._id.toString());
                    }
                    
                    // Mock response object for notification controller
                    const mockRes = {
                        status: (code) => ({
                            json: (data) => data
                        })
                    };
                    
                    // Notify the user
                    if (attendance.userId) {
                        const notifReq = {
                            body: {
                                userId: attendance.userId._id,
                                title: "Automatic Clock-Out",
                                message: `You have been automatically clocked out at 8:00 PM because you did not clock out manually. Your attendance for today has been marked as 'Incomplete Attendance' with only 0.5 credits. This will affect your monthly salary calculation. Please remember to clock out properly in the future.`,
                                type: "attendance",
                                shouldSendEmail: false
                            },
                            io: global.io
                        };
                        
                        await createNotification(notifReq, mockRes);
                    }
                    
                    // Notify managers if applicable
                    if (attendance.teamId) {
                        try {
                            // Find the manager of this team
                            const team = await Team.findById(attendance.teamId).populate('managerId');
                            
                            if (team && team.managerId) {
                                const managerUser = await User.findById(team.managerId.userId);
                                
                                if (managerUser) {
                                    const managerNotifReq = {
                                        body: {
                                            userId: managerUser._id,
                                            title: "Team Member Auto Clock-Out",
                                            message: `${attendance.userId.name} was automatically clocked out at 8:00 PM due to missing manual clock-out. Their attendance has been marked as 'Incomplete Attendance' with 0.5 credits.`,
                                            type: "attendance",
                                            shouldSendEmail: false
                                        },
                                        io: global.io
                                    };
                                    
                                    await createNotification(managerNotifReq, mockRes);
                                }
                            }
                        } catch (teamError) {
                            logger.error(`Error notifying manager for team ${attendance.teamId}: ${teamError.message}`);
                        }
                    }
                    
                    logger.info(`Auto clock-out completed for user ${attendance.userId?.name || 'Unknown'} (ID: ${attendance.userId?._id || 'Unknown'})`);
                } catch (attendanceError) {
                    logger.error(`Error processing auto clock-out for attendance ${attendance._id}: ${attendanceError.message}`);
                }
            }
            
            // Notify admins with a summary
            try {
                const admins = await User.find({ role: 'admin', status: 'active' });
                if (admins.length > 0 && incompleteAttendances.length > 0) {
                    // Create a detailed message with user names
                    const userNames = incompleteAttendances
                        .filter(att => att.userId && att.userId.name)
                        .map(att => att.userId.name)
                        .join(', ');
                    
                    const detailedMessage = userNames 
                        ? `The following users were automatically clocked out: ${userNames}.` 
                        : '';
                    
                    const mockRes = {
                        status: (code) => ({
                            json: (data) => data
                        })
                    };
                    
                    const adminNotifReq = {
                        body: {
                            userId: admins[0]._id, // Send to first admin
                            title: "Daily Auto Clock-Out Summary",
                            message: `${incompleteAttendances.length} users were automatically clocked out at 8:00 PM today because they did not clock out manually. Their attendance has been marked as 'Incomplete Attendance' with 0.5 credits each. ${detailedMessage}`,
                            type: "attendance",
                            shouldSendEmail: false
                        },
                        io: global.io
                    };
                    
                    await createNotification(adminNotifReq, mockRes);
                }
            } catch (adminNotifError) {
                logger.error(`Error sending admin notifications for auto clock-out: ${adminNotifError.message}`);
            }
            
            logger.info(`Auto clock-out job completed: processed ${incompleteAttendances.length} records`);
        } catch (error) {
            logger.error(`Error in auto clock-out job: ${error.message}`);
        }
    });

    // ======================================================
    // WEEKLY JOBS
    // ======================================================
    
    // Weekly attendance verification - Run every Sunday at 22:00
    cron.schedule("0 22 * * 0", async () => {
        logger.info("Running weekly attendance verification");
        
        try {
            // Import required modules dynamically
            const { getAttendanceReports } = await import("./controllers/attendanceController.js");
            const { createNotification } = await import("./controllers/notificationController.js");
            const User = mongoose.model("User");
            
            // Get current date and prepare date range for past week
            const today = new Date();
            const endDate = new Date(today);
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - 6); // Go back 6 days
            
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            // Mock request for getting attendance reports
            const mockReq = {
                query: { startDate: startDateStr, endDate: endDateStr }
            };
            
            // Mock response
            const mockRes = {
                status: (code) => {
                    return {
                        json: (data) => {
                            return { statusCode: code, data };
                        }
                    };
                }
            };
            
            // Get attendance reports
            const reportResponse = await getAttendanceReports(mockReq, mockRes);
            
            if (reportResponse.statusCode === 200 && reportResponse.data.success) {
                const reportData = reportResponse.data.data;
                
                // Find users with high absent counts
                let usersWithMissingAttendance = [];
                
                // Check both employees and managers
                for (const role in reportData.usersByRole) {
                    reportData.usersByRole[role].forEach(user => {
                        if (user.stats.totalAbsent > 1) { // More than 1 absent day in a week
                            usersWithMissingAttendance.push({
                                name: user.name,
                                role: user.role,
                                absentDays: user.stats.totalAbsent,
                                workingDays: user.stats.workingDays
                            });
                        }
                    });
                }
                
                // If there are users with missing attendance, notify admins
                if (usersWithMissingAttendance.length > 0) {
                    // Create a detailed message with user details
                    const detailedMessage = usersWithMissingAttendance
                        .map(user => `${user.name} (${user.role}): ${user.absentDays}/${user.workingDays} days absent`)
                        .join('\n');
                    
                    // Get admin users
                    const admins = await User.find({ role: 'admin', status: 'active' });
                    
                    for (const admin of admins) {
                        const notifReq = {
                            body: {
                                userId: admin._id,
                                title: "Weekly Attendance Report",
                                message: `${usersWithMissingAttendance.length} users have missing attendance for the week of ${startDateStr} to ${endDateStr}.\n\nDetails:\n${detailedMessage}\n\nPlease check the attendance reports for more information.`,
                                type: "attendance",
                                shouldSendEmail: false
                            },
                            io: global.io
                        };
                        
                        await createNotification(notifReq, mockRes);
                    }
                    
                    logger.info(`Weekly attendance verification: ${usersWithMissingAttendance.length} users with missing attendance`);
                } else {
                    logger.info("Weekly attendance verification: No missing attendance detected");
                }
            } else {
                logger.warn("Failed to generate attendance report for verification");
            }
        } catch (error) {
            logger.error(`Error in weekly attendance verification: ${error.message}`);
        }
    });

    // ======================================================
    // MONTHLY JOBS
    // ======================================================
    
    // Monthly leave balance notification - Run on the 1st of each month at 9 AM
    cron.schedule("0 9 1 * *", async () => {
        logger.info("Running monthly leave balance notifications");
        
        try {
            const { createNotification } = await import("./controllers/notificationController.js");
            const UserProfile = mongoose.model("UserProfile");
            
            // Mock response object
            const mockRes = {
                status: (code) => {
                    return {
                        json: (data) => {
                            return data;
                        }
                    };
                }
            };
            
            // Get all active users with their profiles
            const userProfiles = await UserProfile.find()
                .populate({
                    path: 'userId',
                    match: { status: 'active' },
                    select: 'name email role'
                });
            
            // Filter out profiles with inactive users
            const activeProfiles = userProfiles.filter(profile => profile.userId);
            
            // Current month and year
            const date = new Date();
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            
            // Send notifications to each user
            let notificationsSent = 0;
            
            for (const profile of activeProfiles) {
                if (!profile.leaveBalances || profile.leaveBalances.length === 0) continue;
                
                // Format leave balances for notification
                const balanceMessage = profile.leaveBalances
                    .map(lb => `${lb.leaveType}: ${lb.balance} days available (${lb.used} used)`)
                    .join('\n');
                
                const notifReq = {
                    body: {
                        userId: profile.userId._id,
                        title: `${month} ${year} Leave Balance Update`,
                        message: `Here is your current leave balance:\n\n${balanceMessage}\n\nPlease plan your leaves accordingly.`,
                        type: "leave_request",
                        shouldSendEmail: false
                    },
                    io: global.io
                };
                
                await createNotification(notifReq, mockRes);
                notificationsSent++;
            }
            
            logger.info(`Monthly leave balance notifications sent to ${notificationsSent} users`);
        } catch (error) {
            logger.error(`Error in monthly leave balance notification: ${error.message}`);
        }
    });

    // ======================================================
    // YEARLY JOBS
    // ======================================================
    
    // Annual leave balance reset - Run on December 31st at 23:59
    cron.schedule("59 23 31 12 *", async () => {
        logger.info("Running annual leave balance reset");
        
        try {
            const { resetLeaveBalances } = await import("./controllers/leaveController.js");
            const { createNotification } = await import("./controllers/notificationController.js");
            const User = mongoose.model("User");
            const UserProfile = mongoose.model("UserProfile");
            
            // Create a mock request with the necessary fields to use the controller function
            const mockReq = {
                body: {
                    carryForward: true, 
                    resetDate: new Date(),
                    userIds: [] // Empty array means reset for all users
                }
            };
            
            // Create a mock response object
            const mockRes = {
                status: (code) => {
                    return {
                        json: (data) => {
                            return data;
                        }
                    };
                }
            };
            
            // Call the resetLeaveBalances function
            const resetResult = await resetLeaveBalances(mockReq, mockRes);
            
            if (resetResult.success) {
                logger.info(`Annual leave balance reset complete: ${resetResult.totalReset} successful, ${resetResult.totalFailed} failed`);
                
                // Notify all users about their new leave balances
                try {
                    // Get all active users
                    const activeUsers = await User.find({ status: 'active' });
                    
                    const newYear = new Date().getFullYear() + 1;
                    
                    for (const user of activeUsers) {
                        // Get user's profile with leave balances
                        const userProfile = await UserProfile.findOne({ userId: user._id });
                        
                        if (userProfile && userProfile.leaveBalances) {
                            // Format leave balances for notification
                            const balanceMessage = userProfile.leaveBalances
                                .map(lb => {
                                    const carryForwardMsg = lb.carryForward > 0 ? ` (including ${lb.carryForward} carried forward days)` : '';
                                    return `${lb.leaveType}: ${lb.balance} days available${carryForwardMsg}`;
                                })
                                .join('\n');
                            
                            // Create notification for the user
                            const notifReq = {
                                body: {
                                    userId: user._id,
                                    title: `${newYear} Leave Balance Reset`,
                                    message: `Your leave balances have been reset for the new year ${newYear}:\n\n${balanceMessage}\n\nWishing you a Happy New Year!`,
                                    type: "leave_request",
                                    shouldSendEmail: false
                                },
                                io: global.io
                            };
                            
                            await createNotification(notifReq, mockRes);
                        }
                    }
                    
                    logger.info(`Leave balance reset notifications sent to ${activeUsers.length} users`);
                } catch (notifError) {
                    logger.error(`Error sending leave balance reset notifications: ${notifError.message}`);
                }
                
                // If there were any failures, log them for admin review
                if (resetResult.failedResets && resetResult.failedResets.length > 0) {
                    logger.warn(`Failed leave balance resets: ${JSON.stringify(resetResult.failedResets)}`);
                    
                    // Notify admins about the failures
                    try {
                        const admins = await User.find({ role: 'admin', status: 'active' });
                        
                        if (admins.length > 0) {
                            const failureMessage = resetResult.failedResets
                                .map(failure => `User ID: ${failure.userId}, Error: ${failure.error}`)
                                .join('\n');
                            
                            const adminNotifReq = {
                                body: {
                                    userId: admins[0]._id,
                                    title: "Leave Balance Reset Issues",
                                    message: `There were issues resetting leave balances for ${resetResult.failedResets.length} users:\n\n${failureMessage}\n\nPlease review these users' leave balances manually.`,
                                    type: "leave_request",
                                    shouldSendEmail: false
                                },
                                io: global.io
                            };
                            
                            await createNotification(adminNotifReq, mockRes);
                        }
                    } catch (adminNotifError) {
                        logger.error(`Error notifying admins about failed leave resets: ${adminNotifError.message}`);
                    }
                }
            } else {
                logger.error(`Leave balance reset failed: ${resetResult.error}`);
            }
        } catch (error) {
            logger.error(`Error in annual leave balance reset cron job: ${error.message}`);
        }
    });
    
    logger.info("All cron jobs successfully initialized");
};

export default setupCronJobs;