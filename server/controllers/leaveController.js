import LeavePolicy from '../models/LeavePolicy.js';
import UserProfile from '../models/UserProfile.js';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Holiday from '../models/Holiday.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer for document uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads/leave-documents'));
    },
    filename: (req, file, cb) => {
        // Generate unique filename with random suffix
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'leave-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new Error('Only .jpeg, .jpg, .png, .pdf, .doc and .docx format allowed!'));
        }
    }
});

export const uploadLeaveDocument = upload.array('documents', 5);

// LEAVE POLICY CONTROLLERS
// Create a new leave policy
export const createLeavePolicy = async (req, res) => {
    try {
        const { 
            name, description, leaveTypes, applicableRoles
        } = req.body;

        // Validate leaveTypes structure
        if (!Array.isArray(leaveTypes) || leaveTypes.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: "At least one leave type is required" 
            });
        }

        // Parse leaveTypes if it's a string (from form data)
        const parsedLeaveTypes = Array.isArray(leaveTypes) 
            ? leaveTypes 
            : JSON.parse(leaveTypes);
            
        // Format leave types correctly
        const formattedLeaveTypes = parsedLeaveTypes.map(type => ({
            type: type.type,
            daysAllowed: Number(type.daysAllowed),
            carryForward: Boolean(type.carryForward),
            maxCarryForward: type.maxCarryForward ? Number(type.maxCarryForward) : undefined,
            paid: type.paid !== undefined ? Boolean(type.paid) : true,
            probationPeriod: type.probationPeriod ? Number(type.probationPeriod) : 0,
            description: type.description
        }));

        // Parse applicableRoles if it's a string
        const parsedRoles = Array.isArray(applicableRoles) 
            ? applicableRoles 
            : JSON.parse(applicableRoles);

        const newLeavePolicy = new LeavePolicy({
            name,
            description,
            leaveTypes: formattedLeaveTypes,
            applicableRoles: parsedRoles
        });

        await newLeavePolicy.save();
        
        logger.info(`Leave policy "${name}" created successfully`);
        return res.status(201).json({
            success: true,
            message: "Leave policy created successfully",
            policy: newLeavePolicy
        });
    } catch (error) {
        logger.error(`Error creating leave policy: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in creating leave policy: ${error.message}`
        });
    }
};

// Update an existing leave policy
export const updateLeavePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, description, leaveTypes, applicableRoles, active 
        } = req.body;

        // Find the policy
        const policy = await LeavePolicy.findById(id);
        if (!policy) {
            return res.status(404).json({
                success: false,
                error: "Leave policy not found"
            });
        }

        // Store original leave types before updating for comparison
        const originalLeaveTypes = [...policy.leaveTypes];

        // Parse leaveTypes if it's a string (from form data)
        const parsedLeaveTypes = Array.isArray(leaveTypes) 
            ? leaveTypes 
            : JSON.parse(leaveTypes);
            
        // Format leave types correctly
        const formattedLeaveTypes = parsedLeaveTypes.map(type => ({
            type: type.type,
            daysAllowed: Number(type.daysAllowed),
            carryForward: Boolean(type.carryForward),
            maxCarryForward: type.maxCarryForward ? Number(type.maxCarryForward) : undefined,
            paid: type.paid !== undefined ? Boolean(type.paid) : true,
            probationPeriod: type.probationPeriod ? Number(type.probationPeriod) : 0,
            description: type.description
        }));

        // Parse applicableRoles if it's a string
        const parsedRoles = Array.isArray(applicableRoles) 
            ? applicableRoles 
            : JSON.parse(applicableRoles);

        // Update fields
        policy.name = name || policy.name;
        policy.description = description || policy.description;
        policy.leaveTypes = formattedLeaveTypes || policy.leaveTypes;
        policy.applicableRoles = parsedRoles || policy.applicableRoles;
        policy.active = active !== undefined ? active : policy.active;
        policy.updatedAt = Date.now();

        // Save the updated policy
        await policy.save();
        
        // Now update all user profiles that use this policy
        const userProfiles = await UserProfile.find({ leavePolicy: id });
        
        // Track update statistics
        let updatedProfiles = 0;
        let failedUpdates = 0;
        
        // Create map of original leave types by type for easy lookup
        const originalLeaveTypesMap = {};
        originalLeaveTypes.forEach(lt => {
            originalLeaveTypesMap[lt.type] = lt;
        });
        
        // Create map of new leave types by type for easy lookup
        const newLeaveTypesMap = {};
        formattedLeaveTypes.forEach(lt => {
            newLeaveTypesMap[lt.type] = lt;
        });
        
        // Get sets of leave types for determining added/removed types
        const originalLeaveTypeSet = new Set(originalLeaveTypes.map(lt => lt.type));
        const newLeaveTypeSet = new Set(formattedLeaveTypes.map(lt => lt.type));
        
        // Find added and removed leave types
        const addedLeaveTypes = formattedLeaveTypes.filter(lt => !originalLeaveTypeSet.has(lt.type));
        const removedLeaveTypes = originalLeaveTypes.filter(lt => !newLeaveTypeSet.has(lt.type));
        
        // Update each user profile
        for (const profile of userProfiles) {
            try {
                let modified = false;
                
                // Create a map of user's current leave balances by type for easy lookup
                const userLeaveBalanceMap = {};
                profile.leaveBalances.forEach(lb => {
                    userLeaveBalanceMap[lb.leaveType] = lb;
                });
                
                // Handle updated leave types - check for daysAllowed changes
                for (const leaveType of formattedLeaveTypes) {
                    if (originalLeaveTypesMap[leaveType.type] && 
                        originalLeaveTypesMap[leaveType.type].daysAllowed !== leaveType.daysAllowed) {
                        
                        // This leave type's daysAllowed was changed
                        const userBalance = userLeaveBalanceMap[leaveType.type];
                        
                        if (userBalance) {
                            // Calculate the difference in allowed days
                            const difference = leaveType.daysAllowed - originalLeaveTypesMap[leaveType.type].daysAllowed;
                            
                            // Update the user's balance
                            userBalance.balance += difference;
                            modified = true;
                        }
                    }
                }
                
                // Handle added leave types
                for (const newLeaveType of addedLeaveTypes) {
                    // Add the new leave type to the user's balances
                    profile.leaveBalances.push({
                        leaveType: newLeaveType.type,
                        balance: newLeaveType.daysAllowed,
                        used: 0,
                        carryForward: 0
                    });
                    modified = true;
                }
                
                // Handle removed leave types
                if (removedLeaveTypes.length > 0) {
                    profile.leaveBalances = profile.leaveBalances.filter(
                        lb => !removedLeaveTypes.some(rlt => rlt.type === lb.leaveType)
                    );
                    modified = true;
                }
                
                // Save the profile if it was modified
                if (modified) {
                    profile.updatedAt = Date.now();
                    await profile.save();
                    updatedProfiles++;
                }
            } catch (error) {
                logger.error(`Error updating user profile ${profile.userId}: ${error.message}`);
                failedUpdates++;
            }
        }
        
        logger.info(`Leave policy "${policy.name}" updated successfully. Updated ${updatedProfiles} user profiles, ${failedUpdates} failures.`);
        return res.status(200).json({
            success: true,
            message: "Leave policy updated successfully",
            policy,
            profilesUpdated: updatedProfiles,
            profileUpdatesFailed: failedUpdates
        });
    } catch (error) {
        logger.error(`Error updating leave policy: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in updating leave policy: ${error.message}`
        });
    }
};

// Get all leave policies
export const getLeavePolicies = async (req, res) => {
    try {
        const policies = await LeavePolicy.find().sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            policies
        });
    } catch (error) {
        logger.error(`Error fetching leave policies: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in fetching leave policies"
        });
    }
};

// Get a single leave policy by ID
export const getLeavePolicyById = async (req, res) => {
    try {
        const { id } = req.params;
        const policy = await LeavePolicy.findById(id);
        
        if (!policy) {
            return res.status(404).json({
                success: false,
                error: "Leave policy not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            policy
        });
    } catch (error) {
        logger.error(`Error fetching leave policy: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in fetching leave policy"
        });
    }
};

// Assign leave policy to users
export const assignLeavePolicy = async (req, res) => {
    try {
        const { policyId, userIds } = req.body;
        
        // Validate inputs
        if (!policyId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Policy ID and at least one user ID are required"
            });
        }
        
        // Check if policy exists
        const policy = await LeavePolicy.findById(policyId);
        if (!policy) {
            return res.status(404).json({
                success: false,
                error: "Leave policy not found"
            });
        }

        // Update user profiles
        const updatePromises = userIds.map(async (userId) => {
            try {
                // Find user profile
                let userProfile = await UserProfile.findOne({ userId });
                
                // If no profile exists, try to create one
                if (!userProfile) {
                    const user = await User.findById(userId);
                    if (!user) {
                        return { userId, success: false, error: "User not found" };
                    }
                    
                    userProfile = new UserProfile({
                        userId,
                        leavePolicy: policyId,
                        leaveBalances: [],
                        joiningDate: new Date(), // Default to current date
                    });
                } else {
                    userProfile.leavePolicy = policyId;
                }
                
                // Create or update leave balances based on policy
                const existingLeaveTypes = new Set(userProfile.leaveBalances.map(lb => lb.leaveType));
                
                policy.leaveTypes.forEach(policyLeaveType => {
                    if (existingLeaveTypes.has(policyLeaveType.type)) {
                        // Update existing leave balance
                        const leaveBalance = userProfile.leaveBalances.find(
                            lb => lb.leaveType === policyLeaveType.type
                        );
                        leaveBalance.balance = policyLeaveType.daysAllowed;
                    } else {
                        // Add new leave type
                        userProfile.leaveBalances.push({
                            leaveType: policyLeaveType.type,
                            balance: policyLeaveType.daysAllowed,
                            used: 0,
                            carryForward: 0
                        });
                    }
                });
                
                userProfile.updatedAt = Date.now();
                await userProfile.save();
                
                return { userId, success: true };
            } catch (error) {
                return { 
                    userId, 
                    success: false, 
                    error: `Error processing user ${userId}: ${error.message}` 
                };
            }
        });
        
        const results = await Promise.all(updatePromises);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success);
        
        logger.info(`Leave policy assigned to ${successful} users, ${failed.length} failed`);
        
        return res.status(200).json({
            success: true,
            message: `Leave policy assigned to ${successful} users`,
            failedAssignments: failed.length > 0 ? failed : undefined,
            totalAssigned: successful,
            totalFailed: failed.length
        });
    } catch (error) {
        logger.error(`Error assigning leave policy: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in assigning leave policy"
        });
    }
};

// Delete a leave policy
export const deleteLeavePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        
        // First check if the policy exists
        const policy = await LeavePolicy.findById(id);
        if (!policy) {
            return res.status(404).json({
                success: false,
                error: "Leave policy not found"
            });
        }
        
        // Check if any user profiles are using this policy
        const userProfilesUsingPolicy = await UserProfile.find({ leavePolicy: id });
        
        if (userProfilesUsingPolicy.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete policy: It is assigned to ${userProfilesUsingPolicy.length} users. Please reassign these users to a different policy first.`,
                affectedUsers: userProfilesUsingPolicy.length
            });
        }
        
        // If no users are using the policy, proceed with deletion
        await LeavePolicy.findByIdAndDelete(id);
        
        logger.info(`Leave policy "${policy.name}" deleted successfully`);
        
        return res.status(200).json({
            success: true,
            message: "Leave policy deleted successfully"
        });
    } catch (error) {
        logger.error(`Error deleting leave policy: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in deleting leave policy"
        });
    }
};

// LEAVE BALANCE CONTROLLERS
// Get user leave balance
export const getUserLeaveBalance = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find user profile
        const userProfile = await UserProfile.findOne({ userId }).populate('leavePolicy');
        
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                error: "User profile not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            leaveBalances: userProfile.leaveBalances,
            leavePolicy: userProfile.leavePolicy,
            joiningDate: userProfile.joiningDate,
            lastLeaveBalanceReset: userProfile.lastLeaveBalanceReset
        });
    } catch (error) {
        logger.error(`Error fetching user leave balance: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in fetching user leave balance"
        });
    }
};

// Update user leave balance
export const updateLeaveBalance = async (req, res) => {
    try {
        const { userId } = req.params;
        const { leaveBalances } = req.body;
        
        // Find user profile
        const userProfile = await UserProfile.findOne({ userId });
        
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                error: "User profile not found"
            });
        }
        
        // Parse leaveBalances if it's a string
        const parsedBalances = Array.isArray(leaveBalances) 
            ? leaveBalances 
            : JSON.parse(leaveBalances);
        
        // Update leave balances
        parsedBalances.forEach(newBalance => {
            const existingBalance = userProfile.leaveBalances.find(
                lb => lb.leaveType === newBalance.leaveType
            );
            
            if (existingBalance) {
                existingBalance.balance = Number(newBalance.balance);
                existingBalance.used = Number(newBalance.used);
                existingBalance.carryForward = Number(newBalance.carryForward);
            } else {
                userProfile.leaveBalances.push({
                    leaveType: newBalance.leaveType,
                    balance: Number(newBalance.balance),
                    used: Number(newBalance.used),
                    carryForward: Number(newBalance.carryForward)
                });
            }
        });
        
        userProfile.updatedAt = Date.now();
        await userProfile.save();
        
        logger.info(`Leave balance updated for user ${userId}`);
        
        return res.status(200).json({
            success: true,
            message: "Leave balance updated successfully",
            leaveBalances: userProfile.leaveBalances
        });
    } catch (error) {
        logger.error(`Error updating leave balance: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in updating leave balance"
        });
    }
};

// Reset leave balances for all users (usually a yearly operation)
export const resetLeaveBalances = async (req, res) => {
    try {
        const { 
            carryForward = true, 
            resetDate = new Date(),
            userIds = [] // Optional: specific users to reset
        } = req.body;
        
        // Find user profiles - either all or specified ones
        const query = userIds.length > 0 ? { userId: { $in: userIds } } : {};
        const userProfiles = await UserProfile.find(query).populate('leavePolicy');
        
        if (userProfiles.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No user profiles found matching the criteria"
            });
        }
        
        const resetPromises = userProfiles.map(async (profile) => {
            try {
                if (!profile.leavePolicy) {
                    return {
                        userId: profile.userId,
                        success: false,
                        error: "No leave policy assigned"
                    };
                }
                
                // Reset each leave balance based on policy
                profile.leaveBalances.forEach(balance => {
                    const policyLeaveType = profile.leavePolicy.leaveTypes.find(
                        lt => lt.type === balance.leaveType
                    );
                    
                    if (policyLeaveType) {
                        // Calculate carry forward if enabled
                        let carryForwardDays = 0;
                        if (carryForward && policyLeaveType.carryForward && balance.balance > 0) {
                            carryForwardDays = Math.min(
                                balance.balance, 
                                policyLeaveType.maxCarryForward || Infinity
                            );
                        }
                        
                        // Reset balance
                        balance.carryForward = carryForwardDays;
                        balance.balance = policyLeaveType.daysAllowed + carryForwardDays;
                        balance.used = 0;
                    }
                });
                
                // Update the reset date to track when it was last reset
                profile.lastLeaveBalanceReset = resetDate;
                profile.updatedAt = new Date();
                await profile.save();
                
                return {
                    userId: profile.userId,
                    success: true
                };
            } catch (error) {
                return {
                    userId: profile.userId,
                    success: false,
                    error: error.message
                };
            }
        });
        
        const results = await Promise.all(resetPromises);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success);
        
        // Log detailed information about the reset operation
        logger.info(`Leave balances reset operation completed: ${successful} successful, ${failed.length} failed`);
        failed.forEach(f => logger.warn(`Failed to reset leave balance for user ${f.userId}: ${f.error}`));
        
        return res.status(200).json({
            success: true,
            message: `Leave balances reset for ${successful} users`,
            resetDate: resetDate,
            failedResets: failed.length > 0 ? failed : undefined,
            totalReset: successful,
            totalFailed: failed.length
        });
    } catch (error) {
        logger.error(`Error resetting leave balances: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in resetting leave balances"
        });
    }
};

// LEAVE MANAGEMENT CONTROLLERS
// Helper functions
const isWeekend = (date) => {
    const day = date.getUTCDay();
    return day === 0 || day === 6; // Sunday (0) or Saturday (6)
};

// Helper function to check if a date is a holiday
const isHoliday = async (date) => {
    const holidayDate = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    ));
    
    const holiday = await Holiday.findOne({ 
        date: { 
            $gte: holidayDate, 
            $lt: new Date(holidayDate.getTime() + 24 * 60 * 60 * 1000)
        } 
    });
    
    return !!holiday;
};

// Calculate working days (excluding weekends and holidays)
const calculateWorkingDays = async (startDate, endDate) => {
    let workingDays = 0;
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        if (!isWeekend(currentDate) && !(await isHoliday(currentDate))) {
            workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
};

// Count weekends and holidays in a date range
const countWeekendAndHolidayDays = async (startDate, endDate) => {
    let weekendHolidayCount = 0;
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        if (isWeekend(currentDate) || await isHoliday(currentDate)) {
            weekendHolidayCount++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return weekendHolidayCount;
};

// Create attendance records for approved leaves
const createAttendanceRecordsForLeave = async (leave) => {
    try {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        
        // Get employee info
        const employee = await Employee.findOne({ userId: leave.userId });
        const user = await User.findById(leave.userId);
        
        if (!user) {
            throw new Error(`User not found for ID: ${leave.userId}`);
        }
        
        // Loop through each day in the leave period
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateUTC = new Date(Date.UTC(
                currentDate.getUTCFullYear(),
                currentDate.getUTCMonth(),
                currentDate.getUTCDate()
            ));
            
            // Check if attendance record already exists for this day
            const existingAttendance = await Attendance.findOne({
                userId: leave.userId,
                date: {
                    $gte: dateUTC,
                    $lt: new Date(dateUTC.getTime() + 24 * 60 * 60 * 1000)
                }
            });
            
            // Determine if date is weekend or holiday
            const isWeekendDay = isWeekend(dateUTC);
            const isHolidayDay = await isHoliday(dateUTC);
            
            // Define default office hours for attendance records
            const clockInTime = new Date(dateUTC);
            clockInTime.setUTCHours(10, 0, 0, 0); // 10:00 AM IST
            
            const clockOutTime = new Date(dateUTC);
            clockOutTime.setUTCHours(19, 0, 0, 0); // 7:00 PM IST
            
            if (!existingAttendance) {
                // Determine status and credits based on leave type and date
                let status, credits;
                
                // Handle sandwich leave case for unpaid leaves
                if (!leave.useLeaveBalance && (isWeekendDay || isHolidayDay)) {
                    // If unpaid leave spans a weekend/holiday, mark as Absent (sandwich rule)
                    status = "Absent";
                    credits = 0;
                } else if (isWeekendDay || isHolidayDay) {
                    // If it's a weekend/holiday within a paid leave, mark as Weekly Off
                    status = "Weekly Off";
                    credits = 1;
                } else {
                    // Regular leave day
                    if (leave.leaveType === "Half Leave") {
                        if (leave.useLeaveBalance) {
                            status = "Paid Half Leave";
                            credits = 0.5;
                        } else {
                            status = "Unpaid Half Leave";
                            credits = 0;
                        }
                    } else {
                        if (leave.useLeaveBalance) {
                            status = "Paid Leave";
                            credits = 1;
                        } else {
                            status = "Unpaid Leave";
                            credits = 0;
                        }
                    }
                }
                
                // Create new attendance record
                const newAttendance = new Attendance({
                    userId: leave.userId,
                    teamId: employee?.teamId || null,
                    date: dateUTC,
                    clockIn: clockInTime,
                    clockOut: leave.leaveType !== "Half Leave" ? clockOutTime : null,
                    status: status,
                    credits: credits,
                    approvalStatus: "Approved",
                    role: user.role || "employee",
                    isWeekend: isWeekendDay,
                    isHoliday: isHolidayDay,
                    leaveId: leave._id,
                    approvedBy: leave.approvedBy,
                    adminApproval: true,
                    isHalfDay: leave.leaveType === "Half Leave",
                    useLeaveBalance: leave.useLeaveBalance,
                    comments: `Attendance record created for approved leave ID: ${leave._id}`
                });
                
                await newAttendance.save();
                logger.info(`Created attendance record for leave ID ${leave._id} on ${dateUTC.toISOString()}`);
            } else if (leave.leaveType === "Half Leave") {
                // If existing attendance and half-day leave
                existingAttendance.isHalfDay = true;
                existingAttendance.leaveId = leave._id;
                
                if (leave.useLeaveBalance) {
                    existingAttendance.status = "Paid Half Leave";
                    existingAttendance.credits = existingAttendance.clockIn ? 1 : 0.5;
                } else {
                    existingAttendance.status = "Unpaid Half Leave";
                    existingAttendance.credits = existingAttendance.clockIn ? 0.5 : 0;
                }
                
                existingAttendance.useLeaveBalance = leave.useLeaveBalance;
                await existingAttendance.save();
                logger.info(`Updated attendance record for half-day leave ID ${leave._id} on ${dateUTC.toISOString()}`);
            }
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return true;
    } catch (error) {
        logger.error(`Failed to create attendance records for leave: ${error.message}`);
        console.error("Error creating attendance for leave:", error);
        throw error;
    }
};

// Add a new leave request
export const addLeave = async (req, res) => {
    try {
        const { 
            startDate, endDate, leaveType, reason, 
            useLeaveBalance = true
        } = req.body;
        
        const userId = req.user?._id;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is missing"
            });
        }
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }
        
        // Parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // For Half Leave, ensure start and end dates are the same
        if (leaveType === "Half Leave" && start.getTime() !== end.getTime()) {
            return res.status(400).json({
                success: false,
                error: "Half Leave must be for a single day only"
            });
        }
        
        // Validate date range
        if (end < start) {
            return res.status(400).json({
                success: false,
                error: "End date cannot be before start date"
            });
        }
        
        // Calculate total days and working days
        const diffTime = Math.abs(end - start);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Calculate working days (excluding weekends and holidays)
        const workingDays = await calculateWorkingDays(start, end);
        
        // For sandwich leave (unpaid): Check weekends/holidays in between
        const weekendHolidayCount = !useLeaveBalance ? 
            await countWeekendAndHolidayDays(start, end) : 0;
        
        // Calculate total leave days to deduct from balance
        let leaveBalanceToDeduct = workingDays;
        
        // For half-day leave, only deduct 0.5 day
        if (leaveType === "Half Leave") {
            leaveBalanceToDeduct = 0.5;
        }
        
        // Check for overlapping leave requests
        const existingLeaves = await Leave.find({
            userId,
            status: { $in: ["Pending", "Approved"] },
            $or: [
                // Leave overlaps with start date
                { startDate: { $lte: start }, endDate: { $gte: start } },
                // Leave overlaps with end date
                { startDate: { $lte: end }, endDate: { $gte: end } },
                // Leave is contained within new request
                { startDate: { $gte: start }, endDate: { $lte: end } }
            ]
        });
        
        if (existingLeaves.length > 0) {
            return res.status(400).json({
                success: false,
                error: "Leave request overlaps with existing leave requests",
                conflictingLeaves: existingLeaves.map(leave => ({
                    id: leave._id,
                    status: leave.status,
                    startDate: leave.startDate,
                    endDate: leave.endDate
                }))
            });
        }
        
        // Check for approved attendance records within the date range
        if (leaveType !== "Half Leave") {
            const approvedAttendance = await Attendance.find({
                userId,
                approvalStatus: "Approved",
                date: { $gte: start, $lte: end }
            });
            
            if (approvedAttendance.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: "Cannot request leave for days with approved attendance",
                    conflictingDates: approvedAttendance.map(att => att.date)
                });
            }
        }
        
        // Check leave balance if using leave balance
        if (useLeaveBalance) {
            const userProfile = await UserProfile.findOne({ userId });
            
            if (!userProfile) {
                return res.status(404).json({
                    success: false,
                    error: "User profile not found"
                });
            }
            
            const leaveBalance = userProfile.leaveBalances.find(
                lb => lb.leaveType === leaveType
            );
            
            if (!leaveBalance) {
                return res.status(400).json({
                    success: false,
                    error: `No balance found for leave type: ${leaveType}`
                });
            }
            
            if (leaveBalance.balance < leaveBalanceToDeduct) {
                return res.status(400).json({
                    success: false,
                    error: `Insufficient leave balance. Available: ${leaveBalance.balance.toFixed(1)}, Required: ${leaveBalanceToDeduct.toFixed(1)}`
                });
            }
        }
        
        // Process uploaded documents if any
        const documents = req.files ? req.files.map(file => file.filename) : [];
        
        // Create new leave request
        const newLeave = new Leave({
            userId,
            leaveType,
            startDate: start,
            endDate: end,
            totalDays: leaveType === "Half Leave" ? 0.5 : totalDays,
            reason,
            isPaid: useLeaveBalance,
            useLeaveBalance,
            documents,
            appliedAt: Date.now()
        });
        
        await newLeave.save();
        
        logger.info(`New leave request created for user ${userId} from ${start.toISOString()} to ${end.toISOString()}`);
        
        return res.status(201).json({
            success: true,
            message: "Leave request submitted successfully",
            leave: newLeave
        });
    } catch (error) {
        logger.error(`Error adding leave: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in adding leave: ${error.message}`
        });
    }
};

// Approve a leave request
export const approveLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const approverId = req.user?._id;
        
        if (!approverId) {
            return res.status(400).json({
                success: false,
                error: "Approver ID is missing"
            });
        }
        
        // Check if user has appropriate role
        const approver = await User.findById(approverId);
        if (!approver || !["admin", "manager"].includes(approver.role)) {
            return res.status(403).json({
                success: false,
                error: "Unauthorized. Only managers and admins can approve leaves"
            });
        }
        
        const leave = await Leave.findById(id);
        
        if (!leave) {
            return res.status(404).json({
                success: false,
                error: "Leave request not found"
            });
        }
        
        if (leave.status === "Approved") {
            return res.status(400).json({
                success: false,
                error: "Leave request is already approved"
            });
        }
        
        if (leave.status === "Rejected") {
            return res.status(400).json({
                success: false,
                error: "Cannot approve a rejected leave request"
            });
        }
        
        // Update leave status
        leave.status = "Approved";
        leave.approvedBy = approverId;
        leave.approvalComment = comment || "";
        leave.updatedAt = Date.now();
        
        // Check leave balance again before approval
        if (leave.useLeaveBalance) {
            const userProfile = await UserProfile.findOne({ userId: leave.userId });
            
            if (!userProfile) {
                return res.status(404).json({
                    success: false,
                    error: "User profile not found"
                });
            }
            
            const leaveBalance = userProfile.leaveBalances.find(
                lb => lb.leaveType === leave.leaveType
            );
            
            if (!leaveBalance) {
                return res.status(400).json({
                    success: false,
                    error: `No balance for leave type: ${leave.leaveType}`
                });
            }
            
            // Calculate actual leave days to deduct
            let daysToDeduct = leave.totalDays;
            if (leave.leaveType === "Half Leave") {
                daysToDeduct = 0.5;
            }
            
            if (leaveBalance.balance < daysToDeduct) {
                return res.status(400).json({
                    success: false,
                    error: `Insufficient leave balance. Available: ${leaveBalance.balance.toFixed(1)}, Required: ${daysToDeduct.toFixed(1)}`
                });
            }
            
            // Deduct leave balance
            leaveBalance.balance -= daysToDeduct;
            leaveBalance.used += daysToDeduct;
            
            // Ensure balance doesn't go below 0
            if (leaveBalance.balance < 0) {
                leaveBalance.balance = 0;
            }
            
            userProfile.updatedAt = Date.now();
            await userProfile.save();
            
            logger.info(`Deducted ${daysToDeduct} days from ${leave.leaveType} balance for user ${leave.userId}`);
        }
        
        await leave.save();
        
        // Create attendance records for the approved leave
        try {
            await createAttendanceRecordsForLeave(leave);
            logger.info(`Successfully created attendance records for leave ID ${leave._id}`);
        } catch (error) {
            logger.error(`Failed to create attendance records for leave: ${error.message}`);
            // Continue with leave approval even if attendance creation fails
        }
        
        return res.status(200).json({
            success: true,
            message: "Leave request approved successfully",
            leave
        });
    } catch (error) {
        logger.error(`Error approving leave: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in approving leave: ${error.message}`
        });
    }
};

// Reject a leave request
export const rejectLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const rejecterId = req.user?._id;
        
        if (!rejecterId) {
            return res.status(400).json({
                success: false,
                error: "Rejecter ID is missing"
            });
        }
        
        // Check if user has appropriate role
        const rejecter = await User.findById(rejecterId);
        if (!rejecter || !["admin", "manager"].includes(rejecter.role)) {
            return res.status(403).json({
                success: false,
                error: "Unauthorized. Only managers and admins can reject leaves"
            });
        }
        
        const leave = await Leave.findById(id);
        
        if (!leave) {
            return res.status(404).json({
                success: false,
                error: "Leave request not found"
            });
        }
        
        if (leave.status !== "Pending") {
            return res.status(400).json({
                success: false,
                error: `Cannot reject a leave that is already ${leave.status.toLowerCase()}`
            });
        }
        
        // Update leave status
        leave.status = "Rejected";
        leave.approvedBy = rejecterId;
        leave.approvalComment = comment || "Leave request rejected";
        leave.updatedAt = Date.now();
        
        await leave.save();
        
        logger.info(`Leave request ${id} rejected by user ${rejecterId}`);
        
        return res.status(200).json({
            success: true,
            message: "Leave request rejected successfully",
            leave
        });
    } catch (error) {
        logger.error(`Error rejecting leave: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in rejecting leave: ${error.message}`
        });
    }
};

// Cancel a leave request
export const cancelLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is missing"
            });
        }
        
        const leave = await Leave.findById(id);
        
        if (!leave) {
            return res.status(404).json({
                success: false,
                error: "Leave request not found"
            });
        }
        
        // Ensure the user is canceling their own leave
        if (leave.userId.toString() !== userId.toString()) {
            const user = await User.findById(userId);
            
            // Allow admins to cancel others' leaves
            if (!user || user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    error: "You can only cancel your own leave requests"
                });
            }
        }
        
        // Only pending or approved leaves that haven't started yet can be canceled
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (leave.status === "Rejected") {
            return res.status(400).json({
                success: false,
                error: "Cannot cancel a rejected leave request"
            });
        }
        
        if (leave.status === "Approved" && new Date(leave.startDate) < today) {
            return res.status(400).json({
                success: false,
                error: "Cannot cancel a leave that has already started or ended"
            });
        }
        
        // If leave was approved and used leave balance, restore the balance
        if (leave.status === "Approved" && leave.useLeaveBalance) {
            const userProfile = await UserProfile.findOne({ userId: leave.userId });
            
            if (userProfile) {
                const leaveBalance = userProfile.leaveBalances.find(
                    lb => lb.leaveType === leave.leaveType
                );
                
                if (leaveBalance) {
                    // Calculate days to restore
                    let daysToRestore = leave.totalDays;
                    if (leave.leaveType === "Half Leave") {
                        daysToRestore = 0.5;
                    }
                    
                    // Restore leave balance
                    leaveBalance.balance += daysToRestore;
                    leaveBalance.used -= daysToRestore;
                    
                    userProfile.updatedAt = Date.now();
                    await userProfile.save();
                    
                    logger.info(`Restored ${daysToRestore} days to ${leave.leaveType} balance for user ${leave.userId}`);
                }
            }
            
            // Delete any attendance records created for this leave
            await Attendance.deleteMany({ leaveId: leave._id });
            logger.info(`Deleted attendance records for canceled leave ID ${leave._id}`);
        }
        
        // Remove the leave request
        await Leave.findByIdAndDelete(id);
        
        logger.info(`Leave request ${id} canceled by user ${userId}`);
        
        return res.status(200).json({
            success: true,
            message: "Leave request canceled successfully"
        });
    } catch (error) {
        logger.error(`Error canceling leave: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in canceling leave: ${error.message}`
        });
    }
};

// NOT USED ANYWHERE : FOR EDITING LEAVE APPLICATION
// Updated Leave function to handle leave balance when status changes to Approved
export const updateLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            startDate, endDate, reason, status, 
            isPaid, useLeaveBalance, approvalComment 
        } = req.body;
        
        // Find leave request
        const leave = await Leave.findById(id);
        
        if (!leave) {
            return res.status(404).json({
                success: false,
                error: "Leave request not found"
            });
        }

        // Keep original values for comparison
        const originalStartDate = new Date(leave.startDate);
        const originalEndDate = new Date(leave.endDate);
        const originalStatus = leave.status;
        
        // Update fields
        let dateChanged = false;
        if (startDate) {
            leave.startDate = startDate;
            dateChanged = true;
        }
        if (endDate) {
            leave.endDate = endDate;
            dateChanged = true;
        }
        
        // If dates changed, check for overlaps
        if (dateChanged) {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            
            // Validate date range
            if (end < start) {
                return res.status(400).json({
                    success: false,
                    error: "End date cannot be before start date"
                });
            }
            
            // Calculate new total days
            const diffTime = Math.abs(end - start);
            leave.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            // Check for overlapping leaves (excluding the current leave)
            const existingLeaves = await Leave.find({
                userId: leave.userId,
                _id: { $ne: id },  // Exclude the current leave
                $or: [
                    { status: "Pending" },
                    { status: "Approved" }
                ],
                $or: [
                    // Case 1: New leave start date falls within an existing leave
                    { startDate: { $lte: start }, endDate: { $gte: start } },
                    // Case 2: New leave end date falls within an existing leave
                    { startDate: { $lte: end }, endDate: { $gte: end } },
                    // Case 3: New leave completely contains an existing leave
                    { startDate: { $gte: start }, endDate: { $lte: end } }
                ]
            });
            
            if (existingLeaves.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: "Updated leave request overlaps with existing leave requests",
                    conflictingLeaves: existingLeaves.map(leave => ({
                        id: leave._id,
                        status: leave.status,
                        startDate: leave.startDate,
                        endDate: leave.endDate
                    }))
                });
            }
        }
        
        if (reason) leave.reason = reason;
        if (isPaid !== undefined) leave.isPaid = isPaid === 'true' || isPaid === true;
        if (useLeaveBalance !== undefined) leave.useLeaveBalance = useLeaveBalance === 'true' || useLeaveBalance === true;
        if (approvalComment) leave.approvalComment = approvalComment;
        
        leave.updatedAt = Date.now();
        
        // If status changed to approved, update approver
        if (status && status !== leave.status) {
            leave.status = status;
            
            if (status === "Approved" && originalStatus !== "Approved") {
                leave.approvedBy = req.user._id;
                
                // Handle leave balance deduction
                if (leave.useLeaveBalance) {
                    const userProfile = await UserProfile.findOne({ userId: leave.userId });
                    
                    if (userProfile) {
                        const leaveBalance = userProfile.leaveBalances.find(
                            lb => lb.leaveType === leave.leaveType
                        );
                        
                        if (leaveBalance) {
                            // Deduct leave days
                            leaveBalance.balance -= leave.totalDays;
                            leaveBalance.used += leave.totalDays;
                            
                            // Ensure balance doesn't go below 0
                            if (leaveBalance.balance < 0) leaveBalance.balance = 0;
                            
                            userProfile.updatedAt = Date.now();
                            await userProfile.save();
                        }
                    }
                }
            }
        }
        
        await leave.save();
        
        logger.info(`Leave request updated: ${id}`);
        
        return res.status(200).json({
            success: true,
            message: "Leave request updated successfully",
            leave
        });
    } catch (error) {
        logger.error(`Error updating leave: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in updating leave"
        });
    }
};

// Get all leaves (admin view)
export const getLeaves = async (req, res) => {
    try {
        const { status, from, to } = req.query;
        
        const query = {};
        
        // Apply filters
        if (status && status !== 'All') {
            query.status = status;
        }
        
        if (from && to) {
            query.startDate = { $gte: new Date(from) };
            query.endDate = { $lte: new Date(to) };
        } else if (from) {
            query.startDate = { $gte: new Date(from) };
        } else if (to) {
            query.endDate = { $lte: new Date(to) };
        }
        
        const leaves = await Leave.find(query)
            .populate({
                path: 'userId',
                select: 'name email role'
            })
            .populate({
                path: 'approvedBy',
                select: 'name email'
            })
            .sort({ appliedAt: -1 });
        
        return res.status(200).json({
            success: true,
            leaves
        });
    } catch (error) {
        logger.error(`Error fetching leaves: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in fetching leaves"
        });
    }
};

// Get leaves for a specific user
export const getLeave = async (req, res) => {
    try {
        const { id, role } = req.params;
        const { status, from, to } = req.query;
        
        // Basic query - get leaves for this user
        const query = { userId: id };
        
        // Apply filters
        if (status && status !== 'All') {
            query.status = status;
        }
        
        if (from && to) {
            query.startDate = { $gte: new Date(from) };
            query.endDate = { $lte: new Date(to) };
        } else if (from) {
            query.startDate = { $gte: new Date(from) };
        } else if (to) {
            query.endDate = { $lte: new Date(to) };
        }
        
        const leaves = await Leave.find(query)
            .populate({
                path: 'approvedBy',
                select: 'name email'
            })
            .sort({ appliedAt: -1 });
        
        return res.status(200).json({
            success: true,
            leaves
        });
    } catch (error) {
        console.log(error)
        logger.error(`Error fetching user leaves: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Server error in fetching user leaves"
        });
    }
};

// Get details of a specific leave
export const getLeaveDetail = async (req, res) => {
    try {
      const { id } = req.params;
      
      const leave = await Leave.findById(id)
        .populate({
          path: 'userId',
          select: 'name email role'
        })
        .populate({
          path: 'approvedBy',
          select: 'name email role'
        });
      
      if (!leave) {
        return res.status(404).json({
          success: false,
          error: "Leave request not found"
        });
      }
  
      // Get user details if needed
      let userProfile = null;
      if (leave.userId) {
        userProfile = await UserProfile.findOne({ userId: leave.userId._id })
          .populate('leavePolicy');
      }
      
      return res.status(200).json({
        success: true,
        leave,
        userProfile: userProfile ? {
          leaveBalances: userProfile.leaveBalances,
          joiningDate: userProfile.joiningDate
        } : null
      });
    } catch (error) {
      logger.error(`Error fetching leave details: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: "Server error in fetching leave details"
      });
    }
  };

