import Salary from '../models/Salary.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Manager from '../models/Manager.js';
import UserProfile from '../models/UserProfile.js';
import Attendance from '../models/Attendance.js';
import Holiday from '../models/Holiday.js';
import logger from '../utils/logger.js';
import { startOfDay, endOfDay, format, parse, addDays, isWeekend, parseISO, isSameDay } from 'date-fns';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Check if a date is a holiday
const isHoliday = async (date, departmentId = null) => {
    const dateStart = startOfDay(new Date(date));
    const dateEnd = endOfDay(new Date(date));
    
    const query = {
        date: { $gte: dateStart, $lte: dateEnd }
    };
    
    if (departmentId) {
        query.$or = [
            { isCompanyWide: true },
            { applicableDepartments: departmentId }
        ];
    }
    
    const holiday = await Holiday.findOne(query);
    return !!holiday;
};

// Generate salary draft for a specific user for a specific period
export const generateSalaryDraft = async (req, res) => {
    try {
        const { userId, periodStart, periodEnd } = req.body;
        
        if (!userId || !periodStart || !periodEnd) {
            return res.status(400).json({
                success: false,
                error: 'User ID, period start, and period end are required'
            });
        }
        
        // Validate period dates
        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid date format for period start or end'
            });
        }
        
        if (endDate < startDate) {
            return res.status(400).json({
                success: false,
                error: 'Period end date must be after start date'
            });
        }
        
        // Check if a salary record already exists for this user and period
        const existingSalary = await Salary.findOne({
            userId,
            periodStart: startDate,
            periodEnd: endDate
        });
        
        if (existingSalary) {
            return res.status(400).json({
                success: false,
                error: 'A salary record already exists for this user and period'
            });
        }
        
        // Get user information
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Get user profile for salary information
        const userProfile = await UserProfile.findOne({ userId });
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }
        
        // Get employee or manager info
        let employeeId = null;
        let managerId = null;
        let departmentId = null;
        
        if (user.role === 'employee') {
            const employee = await Employee.findOne({ userId });
            if (employee) {
                employeeId = employee._id;
                departmentId = employee.department;
            }
        } else if (user.role === 'manager') {
            const manager = await Manager.findOne({ userId });
            if (manager) {
                managerId = manager._id;
                departmentId = manager.department;
            }
        }
        
        // Calculate days in the period
        const totalDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Initialize attendance breakdown
        let presentDays = 0;
        let absentDays = 0;
        let paidLeaveDays = 0;
        let unpaidLeaveDays = 0;
        let halfDays = 0;
        let extraWorkDays = 0;
        let totalHolidays = 0;
        let totalWeeklyOffs = 0;
        let totalWorkingDays = 0;
        
        // Calculate total credits for the period
        let totalCredits = 0;
        
        // Get all the attendance records for the user for the period
        const attendanceRecords = await Attendance.find({
            userId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });
        
        // Check if any attendance records are pending approval
        const pendingRecords = attendanceRecords.filter(record => 
            record.approvalStatus === 'Pending'
        );
        
        if (pendingRecords.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot generate salary draft while attendance records are pending approval',
                pendingDates: pendingRecords.map(record => record.date)
            });
        }
        
        // Process each day in the period
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            let dayCheck1Credit = 0; // Default for working day
            let dayCheck2Credit = 0;
            
            // Check 1: Type of day
            const isWeekendDay = isWeekend(currentDate);
            const isHolidayDay = await isHoliday(currentDate, departmentId);
            
            if (isWeekendDay) {
                totalWeeklyOffs++;
                dayCheck1Credit = 1; // Weekly off
            }
            
            if (isHolidayDay) {
                totalHolidays++;
                dayCheck1Credit = 1; // Holiday
            }
            
            if (!isWeekendDay && !isHolidayDay) {
                totalWorkingDays++;
            }
            
            // Find attendance record for this day
            const attendance = attendanceRecords.find(record => 
                isSameDay(new Date(record.date), currentDate)
            );
            
            if (attendance) {
                if (attendance.approvalStatus === 'Approved' || attendance.approvalStatus === 'Auto-Approved') {
                    // Check 2: Attendance status
                    dayCheck2Credit = attendance.credits || 0;
                    
                    // Update attendance breakdown
                    switch (attendance.status) {
                        case 'Present':
                            presentDays++;
                            break;
                        case 'Absent':
                            absentDays++;
                            break;
                        case 'Paid Leave':
                        case 'Paid Half Leave':
                            paidLeaveDays += attendance.isHalfDay ? 0.5 : 1;
                            halfDays += attendance.isHalfDay ? 1 : 0;
                            break;
                        case 'Unpaid Leave':
                        case 'Unpaid Half Leave':
                            unpaidLeaveDays += attendance.isHalfDay ? 0.5 : 1;
                            halfDays += attendance.isHalfDay ? 1 : 0;
                            break;
                        case 'Extra Work':
                            extraWorkDays++;
                            break;
                        case 'Incomplete Attendance':
                            presentDays += 0.5;
                            absentDays += 0.5;
                            break;
                        case 'Weekly Off':
                            // Already counted in totalWeeklyOffs
                            break;
                    }
                } else if (attendance.approvalStatus === 'Rejected') {
                    dayCheck2Credit = 0;
                    absentDays++;
                }
            } else {
                // No attendance record - count as absent for regular days
                if (!isWeekendDay && !isHolidayDay) {
                    absentDays++;
                }
            }
            
            // Add day's credits to total
            totalCredits += dayCheck1Credit + dayCheck2Credit;
            
            // Move to next day
            currentDate = addDays(currentDate, 1);
        }
        
        // Get salary information from user profile
        const { basicSalary, allowances, deductions } = userProfile.salaryInfo || {
            basicSalary: 0,
            allowances: {},
            deductions: {}
        };
        
        // Calculate total allowances and deductions
        const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
        const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
        
        // Calculate gross salary
        const grossSalary = basicSalary + totalAllowances;
        
        // Calculate attendance adjustment
        // Formula: (No. of days in month - Total Credits) * (Gross Pay/30)
        const attendanceAdjustment = (totalDays - totalCredits) * (grossSalary / 30);
        
        // Calculate net salary
        // Net Salary = Gross Salary - Total Deductions - Attendance Adjustment
        const netSalary = grossSalary - totalDeductions - attendanceAdjustment;
        
        // Format the pay period (e.g., "March 2025")
        const payPeriod = `${format(startDate, 'MMMM yyyy')}`;
        
        // Create new salary record
        const newSalary = new Salary({
            userId,
            employeeId,
            managerId,
            payPeriod,
            periodStart: startDate,
            periodEnd: endDate,
            basicSalary,
            totalDays,
            totalWorkingDays,
            totalWeeklyOffs,
            totalHolidays,
            totalCredits,
            presentDays,
            absentDays,
            paidLeaveDays,
            unpaidLeaveDays,
            halfDays,
            extraWorkDays,
            allowances,
            deductions,
            grossSalary,
            totalAllowances,
            totalDeductions,
            attendanceAdjustment,
            netSalary,
            status: 'Draft',
            auditLog: [{
                action: 'Salary Draft Generated',
                userId: req.user._id,
                notes: `Salary draft for ${payPeriod} generated automatically`
            }]
        });
        
        await newSalary.save();
        
        logger.info(`Salary draft generated for user ${userId} for period ${payPeriod}`);
        
        return res.status(201).json({
            success: true,
            message: 'Salary draft generated successfully',
            salaryId: newSalary._id,
            payPeriod,
            netSalary
        });
        
    } catch (error) {
        logger.error(`Error generating salary draft: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in generating salary draft: ${error.message}`
        });
    }
};

// Generate salary drafts for all users for a specific period
export const generateAllSalaryDrafts = async (req, res) => {
    try {
        const { periodStart, periodEnd, roleFilter } = req.body;
        
        if (!periodStart || !periodEnd) {
            return res.status(400).json({
                success: false,
                error: 'Period start and end dates are required'
            });
        }
        
        // Validate period dates
        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid date format for period start or end'
            });
        }
        
        if (endDate < startDate) {
            return res.status(400).json({
                success: false,
                error: 'Period end date must be after start date'
            });
        }
        
        // Build query for users based on roleFilter
        const userQuery = {};
        if (roleFilter && roleFilter !== 'all') {
            userQuery.role = roleFilter;
        } else {
            userQuery.role = { $in: ['employee', 'manager'] }; // Exclude admin
        }
        
        // Get all eligible users
        const users = await User.find(userQuery);
        
        // Get existing salary records for this period
        const existingSalaries = await Salary.find({
            periodStart: startDate,
            periodEnd: endDate
        });
        
        const existingUserIds = existingSalaries.map(salary => salary.userId.toString());
        
        // Filter out users who already have salary records for this period
        const eligibleUsers = users.filter(user => 
            !existingUserIds.includes(user._id.toString())
        );
        
        if (eligibleUsers.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No eligible users found for salary generation'
            });
        }
        
        // Generate salary drafts for each eligible user
        const results = {
            success: [],
            failed: []
        };
        
        for (const user of eligibleUsers) {
            try {
                // Instead of creating mock request/response, we'll call a helper function
                // that doesn't require the req/res objects
                const salaryResult = await generateSalaryDraftForUser(
                    user._id, 
                    periodStart, 
                    periodEnd, 
                    req.user._id
                );
                
                if (salaryResult.success) {
                    results.success.push({
                        userId: user._id,
                        name: user.name,
                        salaryId: salaryResult.salaryId,
                        payPeriod: salaryResult.payPeriod,
                        netSalary: salaryResult.netSalary
                    });
                } else {
                    results.failed.push({
                        userId: user._id,
                        name: user.name,
                        error: salaryResult.error
                    });
                }
            } catch (error) {
                results.failed.push({
                    userId: user._id,
                    name: user.name,
                    error: error.message
                });
            }
        }
        
        logger.info(`Generated salary drafts for ${results.success.length} users, failed for ${results.failed.length} users`);
        
        return res.status(200).json({
            success: true,
            message: `Generated salary drafts for ${results.success.length} users, failed for ${results.failed.length} users`,
            results
        });
        
    } catch (error) {
        logger.error(`Error generating all salary drafts: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in generating salary drafts: ${error.message}`
        });
    }
};

// Helper function to generate salary draft for a user without using req/res
async function generateSalaryDraftForUser(userId, periodStart, periodEnd, creatorId) {
    try {
        // Validate period dates
        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return {
                success: false,
                error: 'Invalid date format for period start or end'
            };
        }
        
        if (endDate < startDate) {
            return {
                success: false,
                error: 'Period end date must be after start date'
            };
        }
        
        // Check if a salary record already exists for this user and period
        const existingSalary = await Salary.findOne({
            userId,
            periodStart: startDate,
            periodEnd: endDate
        });
        
        if (existingSalary) {
            return {
                success: false,
                error: 'A salary record already exists for this user and period'
            };
        }
        
        // Get user information
        const user = await User.findById(userId);
        if (!user) {
            return {
                success: false,
                error: 'User not found'
            };
        }
        
        // Get user profile for salary information
        const userProfile = await UserProfile.findOne({ userId });
        if (!userProfile) {
            return {
                success: false,
                error: 'User profile not found'
            };
        }
        
        // Get employee or manager info
        let employeeId = null;
        let managerId = null;
        let departmentId = null;
        
        if (user.role === 'employee') {
            const employee = await Employee.findOne({ userId });
            if (employee) {
                employeeId = employee._id;
                departmentId = employee.department;
            }
        } else if (user.role === 'manager') {
            const manager = await Manager.findOne({ userId });
            if (manager) {
                managerId = manager._id;
                departmentId = manager.department;
            }
        }
        
        // Calculate days in the period
        const totalDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Initialize attendance breakdown
        let presentDays = 0;
        let absentDays = 0;
        let paidLeaveDays = 0;
        let unpaidLeaveDays = 0;
        let halfDays = 0;
        let extraWorkDays = 0;
        let totalHolidays = 0;
        let totalWeeklyOffs = 0;
        let totalWorkingDays = 0;
        
        // Calculate total credits for the period
        let totalCredits = 0;
        
        // Get all the attendance records for the user for the period
        const attendanceRecords = await Attendance.find({
            userId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });
        
        // Check if any attendance records are pending approval
        const pendingRecords = attendanceRecords.filter(record => 
            record.approvalStatus === 'Pending'
        );
        
        if (pendingRecords.length > 0) {
            return {
                success: false,
                error: 'Cannot generate salary draft while attendance records are pending approval',
                pendingDates: pendingRecords.map(record => record.date)
            };
        }
        
        // Process each day in the period
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            let dayCheck1Credit = 0; // Default for working day
            let dayCheck2Credit = 0;
            
            // Check 1: Type of day
            const isWeekendDay = isWeekend(currentDate);
            const isHolidayDay = await isHoliday(currentDate, departmentId);
            
            if (isWeekendDay) {
                totalWeeklyOffs++;
                dayCheck1Credit = 1; // Weekly off
            }
            
            if (isHolidayDay) {
                totalHolidays++;
                dayCheck1Credit = 1; // Holiday
            }
            
            if (!isWeekendDay && !isHolidayDay) {
                totalWorkingDays++;
            }
            
            // Find attendance record for this day
            const attendance = attendanceRecords.find(record => 
                isSameDay(new Date(record.date), currentDate)
            );
            
            if (attendance) {
                if (attendance.approvalStatus === 'Approved' || attendance.approvalStatus === 'Auto-Approved') {
                    // Check 2: Attendance status
                    dayCheck2Credit = attendance.credits || 0;
                    
                    // Update attendance breakdown
                    switch (attendance.status) {
                        case 'Present':
                            presentDays++;
                            break;
                        case 'Absent':
                            absentDays++;
                            break;
                        case 'Paid Leave':
                        case 'Paid Half Leave':
                            paidLeaveDays += attendance.isHalfDay ? 0.5 : 1;
                            halfDays += attendance.isHalfDay ? 1 : 0;
                            break;
                        case 'Unpaid Leave':
                        case 'Unpaid Half Leave':
                            unpaidLeaveDays += attendance.isHalfDay ? 0.5 : 1;
                            halfDays += attendance.isHalfDay ? 1 : 0;
                            break;
                        case 'Extra Work':
                            extraWorkDays++;
                            break;
                        case 'Incomplete Attendance':
                            presentDays += 0.5;
                            absentDays += 0.5;
                            break;
                        case 'Weekly Off':
                            // Already counted in totalWeeklyOffs
                            break;
                    }
                } else if (attendance.approvalStatus === 'Rejected') {
                    dayCheck2Credit = 0;
                    absentDays++;
                }
            } else {
                // No attendance record - count as absent for regular days
                if (!isWeekendDay && !isHolidayDay) {
                    absentDays++;
                }
            }
            
            // Add day's credits to total
            totalCredits += dayCheck1Credit + dayCheck2Credit;
            
            // Move to next day
            currentDate = addDays(currentDate, 1);
        }
        
        // Get salary information from user profile
        const { basicSalary, allowances, deductions } = userProfile.salaryInfo || {
            basicSalary: 0,
            allowances: {},
            deductions: {}
        };
        
        // Calculate total allowances and deductions
        const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
        const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
        
        // Calculate gross salary
        const grossSalary = basicSalary + totalAllowances;
        
        // Calculate attendance adjustment
        // Formula: (No. of days in month - Total Credits) * (Gross Pay/30)
        const attendanceAdjustment = (totalDays - totalCredits) * (grossSalary / 30);
        
        // Calculate net salary
        // Net Salary = Gross Salary - Total Deductions - Attendance Adjustment
        const netSalary = grossSalary - totalDeductions - attendanceAdjustment;
        
        // Format the pay period (e.g., "March 2025")
        const payPeriod = `${format(startDate, 'MMMM yyyy')}`;
        
        // Create new salary record
        const newSalary = new Salary({
            userId,
            employeeId,
            managerId,
            payPeriod,
            periodStart: startDate,
            periodEnd: endDate,
            basicSalary,
            totalDays,
            totalWorkingDays,
            totalWeeklyOffs,
            totalHolidays,
            totalCredits,
            presentDays,
            absentDays,
            paidLeaveDays,
            unpaidLeaveDays,
            halfDays,
            extraWorkDays,
            allowances,
            deductions,
            grossSalary,
            totalAllowances,
            totalDeductions,
            attendanceAdjustment,
            netSalary,
            status: 'Draft',
            auditLog: [{
                action: 'Salary Draft Generated',
                userId: creatorId,
                notes: `Salary draft for ${payPeriod} generated automatically`
            }]
        });
        
        await newSalary.save();
        
        logger.info(`Salary draft generated for user ${userId} for period ${payPeriod}`);
        
        return {
            success: true,
            message: 'Salary draft generated successfully',
            salaryId: newSalary._id,
            payPeriod,
            netSalary
        };
        
    } catch (error) {
        logger.error(`Error generating salary draft: ${error.message}`);
        return {
            success: false,
            error: `Server error in generating salary draft: ${error.message}`
        };
    }
}

// Function to regenerate a salary draft
export const regenerateSalaryDraft = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the existing salary record
        const existingSalary = await Salary.findById(id);
        
        if (!existingSalary) {
            return res.status(404).json({
                success: false,
                error: 'Salary record not found'
            });
        }
        
        // Check if the record is in Draft or Rejected status
        if (!['Draft', 'Rejected'].includes(existingSalary.status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot regenerate salary record in ${existingSalary.status} status`
            });
        }
        
        // Extract user ID and period dates from the existing record
        const userId = existingSalary.userId;
        const periodStart = existingSalary.periodStart;
        const periodEnd = existingSalary.periodEnd;
        
        // Get user information
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Get user profile for salary information
        const userProfile = await UserProfile.findOne({ userId });
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }
        
        // Get employee or manager info
        let employeeId = existingSalary.employeeId;
        let managerId = existingSalary.managerId;
        let departmentId = null;
        
        if (user.role === 'employee') {
            const employee = await Employee.findOne({ userId });
            if (employee) {
                departmentId = employee.department;
            }
        } else if (user.role === 'manager') {
            const manager = await Manager.findOne({ userId });
            if (manager) {
                departmentId = manager.department;
            }
        }
        
        // Calculate days in the period
        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);
        const totalDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Initialize attendance breakdown
        let presentDays = 0;
        let absentDays = 0;
        let paidLeaveDays = 0;
        let unpaidLeaveDays = 0;
        let halfDays = 0;
        let extraWorkDays = 0;
        let totalHolidays = 0;
        let totalWeeklyOffs = 0;
        let totalWorkingDays = 0;
        
        // Calculate total credits for the period
        let totalCredits = 0;
        
        // Get all the attendance records for the user for the period
        const attendanceRecords = await Attendance.find({
            userId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });
        
        // Check if any attendance records are pending approval
        const pendingRecords = attendanceRecords.filter(record => 
            record.approvalStatus === 'Pending'
        );
        
        if (pendingRecords.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot regenerate salary draft while attendance records are pending approval',
                pendingDates: pendingRecords.map(record => record.date)
            });
        }
        
        // Process each day in the period
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            let dayCheck1Credit = 0; // Default for working day
            let dayCheck2Credit = 0;
            
            // Check 1: Type of day
            const isWeekendDay = isWeekend(currentDate);
            const isHolidayDay = await isHoliday(currentDate, departmentId);
            
            if (isWeekendDay) {
                totalWeeklyOffs++;
                dayCheck1Credit = 1; // Weekly off
            }
            
            if (isHolidayDay) {
                totalHolidays++;
                dayCheck1Credit = 1; // Holiday
            }
            
            if (!isWeekendDay && !isHolidayDay) {
                totalWorkingDays++;
            }
            
            // Find attendance record for this day
            const attendance = attendanceRecords.find(record => 
                isSameDay(new Date(record.date), currentDate)
            );
            
            if (attendance) {
                if (attendance.approvalStatus === 'Approved' || attendance.approvalStatus === 'Auto-Approved') {
                    // Check 2: Attendance status
                    dayCheck2Credit = attendance.credits || 0;
                    
                    // Update attendance breakdown
                    switch (attendance.status) {
                        case 'Present':
                            presentDays++;
                            break;
                        case 'Absent':
                            absentDays++;
                            break;
                        case 'Paid Leave':
                        case 'Paid Half Leave':
                            paidLeaveDays += attendance.isHalfDay ? 0.5 : 1;
                            halfDays += attendance.isHalfDay ? 1 : 0;
                            break;
                        case 'Unpaid Leave':
                        case 'Unpaid Half Leave':
                            unpaidLeaveDays += attendance.isHalfDay ? 0.5 : 1;
                            halfDays += attendance.isHalfDay ? 1 : 0;
                            break;
                        case 'Extra Work':
                            extraWorkDays++;
                            break;
                        case 'Incomplete Attendance':
                            presentDays += 0.5;
                            absentDays += 0.5;
                            break;
                        case 'Weekly Off':
                            // Already counted in totalWeeklyOffs
                            break;
                    }
                } else if (attendance.approvalStatus === 'Rejected') {
                    dayCheck2Credit = 0;
                    absentDays++;
                }
            } else {
                // No attendance record - count as absent for regular days
                if (!isWeekendDay && !isHolidayDay) {
                    absentDays++;
                }
            }
            
            // Add day's credits to total
            totalCredits += dayCheck1Credit + dayCheck2Credit;
            
            // Move to next day
            currentDate = addDays(currentDate, 1);
        }
        
        // Get salary information from user profile
        const { basicSalary, allowances, deductions } = userProfile.salaryInfo || {
            basicSalary: 0,
            allowances: {},
            deductions: {}
        };
        
        // Calculate total allowances and deductions
        const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
        const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
        
        // Calculate gross salary
        const grossSalary = basicSalary + totalAllowances;
        
        // Calculate attendance adjustment
        // Formula: (No. of days in month - Total Credits) * (Gross Pay/30)
        const attendanceAdjustment = (totalDays - totalCredits) * (grossSalary / 30);
        
        // Calculate net salary
        // Net Salary = Gross Salary - Total Deductions - Attendance Adjustment
        const netSalary = grossSalary - totalDeductions - attendanceAdjustment;
        
        // Update the existing salary record
        existingSalary.basicSalary = basicSalary;
        existingSalary.totalDays = totalDays;
        existingSalary.totalWorkingDays = totalWorkingDays;
        existingSalary.totalWeeklyOffs = totalWeeklyOffs;
        existingSalary.totalHolidays = totalHolidays;
        existingSalary.totalCredits = totalCredits;
        existingSalary.presentDays = presentDays;
        existingSalary.absentDays = absentDays;
        existingSalary.paidLeaveDays = paidLeaveDays;
        existingSalary.unpaidLeaveDays = unpaidLeaveDays;
        existingSalary.halfDays = halfDays;
        existingSalary.extraWorkDays = extraWorkDays;
        existingSalary.allowances = allowances;
        existingSalary.deductions = deductions;
        existingSalary.grossSalary = grossSalary;
        existingSalary.totalAllowances = totalAllowances;
        existingSalary.totalDeductions = totalDeductions;
        existingSalary.attendanceAdjustment = attendanceAdjustment;
        existingSalary.netSalary = netSalary;
        
        // Add audit log entry
        existingSalary.auditLog.push({
            action: 'Salary Draft Regenerated',
            userId: req.user._id,
            notes: `Salary draft for ${format(startDate, 'MMMM yyyy')} regenerated with updated attendance data`
        });
        
        await existingSalary.save();
        
        logger.info(`Salary draft ${id} regenerated for user ${userId}`);
        
        return res.status(200).json({
            success: true,
            message: 'Salary draft regenerated successfully',
            salary: existingSalary
        });
        
    } catch (error) {
        logger.error(`Error regenerating salary draft: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in regenerating salary draft: ${error.message}`
        });
    }
};
// Get all salary records with filtering options
export const getSalaries = async (req, res) => {
    try {
        const { status, period, userId, role } = req.query;
        
        // Build query
        const query = {};
        
        if (status && status !== 'All') {
            query.status = status;
        }
        
        if (period) {
            query.payPeriod = period;
        }
        
        if (userId) {
            query.userId = userId;
        }
        
        // Add role filtering if provided
        if (role) {
            const users = await User.find({ role });
            const userIds = users.map(user => user._id);
            query.userId = { $in: userIds };
        }
        
        // Get salary records
        const salaries = await Salary.find(query)
            .populate('userId', 'name email role')
            .sort({ updatedAt: -1 });
        
        return res.status(200).json({
            success: true,
            count: salaries.length,
            salaries
        });
        
    } catch (error) {
        logger.error(`Error fetching salaries: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in fetching salaries: ${error.message}`
        });
    }
};

// Get a specific salary record by ID
export const getSalaryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const salary = await Salary.findById(id)
            .populate('userId', 'name email role')
            .populate('auditLog.userId', 'name email');
        
        if (!salary) {
            return res.status(404).json({
                success: false,
                error: 'Salary record not found'
            });
        }
        
        // Get additional user information
        let employee = null;
        let manager = null;
        let departmentInfo = null;
        
        if (salary.employeeId) {
            employee = await Employee.findById(salary.employeeId)
                .populate('department', 'dep_name');
            if (employee) {
                departmentInfo = employee.department;
            }
        } else if (salary.managerId) {
            manager = await Manager.findById(salary.managerId)
                .populate('department', 'dep_name');
            if (manager) {
                departmentInfo = manager.department;
            }
        }
        
        // Get user profile with bank details
        const userProfile = await UserProfile.findOne({ userId: salary.userId });
        
        return res.status(200).json({
            success: true,
            salary,
            employee,
            manager,
            departmentInfo,
            userProfile: userProfile ? {
                joiningDate: userProfile.joiningDate,
                PFNumber: userProfile.salaryInfo?.PFNumber,
                ESINumber: userProfile.salaryInfo?.ESINumber,
                bankDetails: userProfile.salaryInfo?.bankDetails
            } : null
        });
        
    } catch (error) {
        logger.error(`Error fetching salary by ID: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in fetching salary: ${error.message}`
        });
    }
};

// Get salary history for a specific user
export const getUserSalaryHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Get all salary records for the user
        const salaries = await Salary.find({ userId })
            .sort({ periodEnd: -1 });
        
        return res.status(200).json({
            success: true,
            count: salaries.length,
            salaries
        });
        
    } catch (error) {
        logger.error(`Error fetching user salary history: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in fetching salary history: ${error.message}`
        });
    }
};

// Update salary record (for admin adjustments)
export const updateSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            basicSalary,
            allowances,
            deductions,
            adminAdjustment,
            status,
            comments
        } = req.body;
        
        // Find the salary record
        const salary = await Salary.findById(id);
        
        if (!salary) {
            return res.status(404).json({
                success: false,
                error: 'Salary record not found'
            });
        }
        
        // Check if the record is in Draft or Rejected status
        if (!['Draft', 'Rejected'].includes(salary.status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot update salary record in ${salary.status} status`
            });
        }
        
        // Update basic fields if provided
        if (basicSalary !== undefined) {
            salary.basicSalary = basicSalary;
        }
        
        // Update allowances if provided
        if (allowances) {
            for (const [key, value] of Object.entries(allowances)) {
                if (salary.allowances[key] !== undefined) {
                    salary.allowances[key] = value;
                }
            }
        }
        
        // Update deductions if provided
        if (deductions) {
            for (const [key, value] of Object.entries(deductions)) {
                if (salary.deductions[key] !== undefined) {
                    salary.deductions[key] = value;
                }
            }
        }
        
        // Add admin adjustment if provided
        if (adminAdjustment) {
            salary.adminAdjustments.push({
                amount: adminAdjustment.amount,
                reason: adminAdjustment.reason,
                date: new Date(),
                adjustedBy: req.user._id
            });
        }
        
        // Update status if provided
        if (status) {
            salary.status = status;
        }
        
        // Add to audit log
        salary.auditLog.push({
            action: 'Salary Updated',
            userId: req.user._id,
            notes: comments || 'Salary record updated by admin'
        });
        
        // Recalculate derived fields
        salary.recalculate();
        
        // Save the updated record
        await salary.save();
        
        logger.info(`Salary record ${id} updated by user ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: 'Salary record updated successfully',
            salary
        });
        
    } catch (error) {
        logger.error(`Error updating salary: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in updating salary: ${error.message}`
        });
    }
};

// Approve a salary record
export const approveSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        
        // Find the salary record
        const salary = await Salary.findById(id);
        
        if (!salary) {
            return res.status(404).json({
                success: false,
                error: 'Salary record not found'
            });
        }
        
        // Check if the record is in Draft or Verified status
        if (!['Draft', 'Verified'].includes(salary.status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot approve salary record in ${salary.status} status`
            });
        }
        
        // Update status to Approved
        salary.status = 'Approved';
        
        // Add to audit log
        salary.auditLog.push({
            action: 'Salary Approved',
            userId: req.user._id,
            notes: comments || 'Salary record approved by admin'
        });
        
        // Save the updated record
        await salary.save();
        
        logger.info(`Salary record ${id} approved by user ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: 'Salary record approved successfully',
            salary
        });
        
    } catch (error) {
        logger.error(`Error approving salary: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in approving salary: ${error.message}`
        });
    }
};

// Reject a salary record
export const rejectSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        
        if (!comments) {
            return res.status(400).json({
                success: false,
                error: 'Comments are required for rejecting a salary record'
            });
        }
        
        // Find the salary record
        const salary = await Salary.findById(id);
        
        if (!salary) {
            return res.status(404).json({
                success: false,
                error: 'Salary record not found'
            });
        }
        
        // Check if the record is in Draft or Verified status
        if (!['Draft', 'Verified'].includes(salary.status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot reject salary record in ${salary.status} status`
            });
        }
        
        // Update status to Rejected
        salary.status = 'Rejected';
        
        // Add to audit log
        salary.auditLog.push({
            action: 'Salary Rejected',
            userId: req.user._id,
            notes: comments
        });
        
        // Save the updated record
        await salary.save();
        
        logger.info(`Salary record ${id} rejected by user ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: 'Salary record rejected successfully',
            salary
        });
        
    } catch (error) {
        logger.error(`Error rejecting salary: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in rejecting salary: ${error.message}`
        });
    }
};
// Convert a salary record back to draft status
export const convertToDraft = async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        
        // Find the salary record
        const salary = await Salary.findById(id);
        
        if (!salary) {
            return res.status(404).json({
                success: false,
                error: 'Salary record not found'
            });
        }
        
        // Check if the record is in Rejected status
        if (salary.status !== 'Rejected') {
            return res.status(400).json({
                success: false,
                error: `Only rejected salary records can be converted to draft status`
            });
        }
        
        // Update status to Draft
        salary.status = 'Draft';
        
        // Add to audit log
        salary.auditLog.push({
            action: 'Converted to Draft',
            userId: req.user._id,
            notes: comments || 'Salary record converted back to draft status'
        });
        
        // Save the updated record
        await salary.save();
        
        logger.info(`Salary record ${id} converted to draft by user ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: 'Salary record converted to draft successfully',
            salary
        });
        
    } catch (error) {
        logger.error(`Error converting salary to draft: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in converting salary to draft: ${error.message}`
        });
    }
};
// Mark a salary record as paid
export const markSalaryAsPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            transactionId, 
            paymentDate, 
            paymentMethod,
            comments
        } = req.body;
        
        if (!transactionId || !paymentMethod) {
            return res.status(400).json({
                success: false,
                error: 'Transaction ID and payment method are required'
            });
        }
        
        // Find the salary record
        const salary = await Salary.findById(id);
        
        if (!salary) {
            return res.status(404).json({
                success: false,
                error: 'Salary record not found'
            });
        }
        
        // Check if the record is in Approved status
        if (salary.status !== 'Approved') {
            return res.status(400).json({
                success: false,
                error: `Cannot mark salary record as paid when in ${salary.status} status`
            });
        }
        
        // Update payment information
        salary.status = 'Paid';
        salary.transactionId = transactionId;
        salary.paymentDate = paymentDate || new Date();
        salary.paymentMethod = paymentMethod;
        
        // Add to audit log
        salary.auditLog.push({
            action: 'Salary Paid',
            userId: req.user._id,
            notes: comments || `Salary paid via ${paymentMethod}, Transaction ID: ${transactionId}`
        });
        
        // Save the updated record
        await salary.save();
        
        logger.info(`Salary record ${id} marked as paid by user ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: 'Salary record marked as paid successfully',
            salary
        });
        
    } catch (error) {
        logger.error(`Error marking salary as paid: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in marking salary as paid: ${error.message}`
        });
    }
};

// Generate a payslip for a salary record
// export const generatePayslip = async (req, res) => {
//     try {
//         const { id } = req.params;
        
//         // Find the salary record with user information
//         const salary = await Salary.findById(id)
//             .populate('userId', 'name email role');
        
//         if (!salary) {
//             return res.status(404).json({
//                 success: false,
//                 error: 'Salary record not found'
//             });
//         }
        
//         // Check if the record is in Approved or Paid status
//         if (!['Approved', 'Paid'].includes(salary.status)) {
//             return res.status(400).json({
//                 success: false,
//                 error: `Cannot generate payslip for salary record in ${salary.status} status`
//             });
//         }
        
//         // Get additional user information
//         let employeeId = null;
//         let designation = null;
//         let departmentName = null;
        
//         if (salary.employeeId) {
//             const employee = await Employee.findById(salary.employeeId)
//                 .populate('department', 'dep_name');
//             if (employee) {
//                 employeeId = employee.employeeId;
//                 designation = employee.designation;
//                 departmentName = employee.department.dep_name;
//             }
//         } else if (salary.managerId) {
//             const manager = await Manager.findById(salary.managerId)
//                 .populate('department', 'dep_name');
//             if (manager) {
//                 employeeId = manager.managerId;
//                 designation = manager.designation;
//                 departmentName = manager.department.dep_name;
//             }
//         }
        
//         // Get user profile with bank details and other info
//         const userProfile = await UserProfile.findOne({ userId: salary.userId });
        
//         // Create payslip directory if it doesn't exist
//         const payslipDir = path.join(__dirname, '../public/uploads/payslips');
//         if (!fs.existsSync(payslipDir)) {
//             fs.mkdirSync(payslipDir, { recursive: true });
//             console.log(`Created payslip directory at: ${payslipDir}`);
//         }
        
//         // Generate unique filename for the payslip
//         let payPeriodClean = salary.payPeriod.replace(/\s+/g, '_');
//         let employeeName = salary.userId.name.replace(/\s+/g, '_');
//         const payslipFilename = `payslip_${employeeName}_${payPeriodClean}_${Date.now()}.pdf`;
//         const payslipPath = path.join(payslipDir, payslipFilename);
        
//         // Function to convert number to words
// const numberToWords = (num) => {
//     const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
//     const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
//     const convertLessThanOneThousand = (num) => {
//         if (num === 0) return '';
        
//         if (num < 20) {
//             return ones[num];
//         }
        
//         const ten = Math.floor(num / 10) % 10;
//         const one = num % 10;
        
//         return (ten > 0 ? tens[ten] + (one > 0 ? '-' + ones[one] : '') : ones[one]);
//     };
    
//     if (num === 0) return 'Zero';
    
//     // Split the number into whole and decimal parts
//     const parts = num.toFixed(2).split('.');
//     let wholeNum = parseInt(parts[0]);
//     const decimalPart = parseInt(parts[1]);
    
//     let result = '';
    
//     if (wholeNum >= 10000000) {
//         result += convertLessThanOneThousand(Math.floor(wholeNum / 10000000)) + ' Crore ';
//         wholeNum %= 10000000;
//     }
    
//     if (wholeNum >= 100000) {
//         result += convertLessThanOneThousand(Math.floor(wholeNum / 100000)) + ' Lakh ';
//         wholeNum %= 100000;
//     }
    
//     if (wholeNum >= 1000) {
//         result += convertLessThanOneThousand(Math.floor(wholeNum / 1000)) + ' Thousand ';
//         wholeNum %= 1000;
//     }
    
//     if (wholeNum > 0) {
//         result += convertLessThanOneThousand(wholeNum);
//     }
    
//     // Add 'Rupees' at the beginning
//     result = 'Rupees ' + result;
    
//     // Add decimal part
//     if (decimalPart > 0) {
//         result += ' and ' + convertLessThanOneThousand(decimalPart) + ' Paise';
//     }
    
//     return result + ' Only';
// };
        
//         // Extract month and year for header
//         const periodDate = new Date(salary.periodStart);
//         const month = periodDate.toLocaleString('en-US', { month: 'long' });
//         const year = periodDate.getFullYear();
//         const financialYear = periodDate.getMonth() >= 3 
//             ? `${year} - ${year + 1}` 
//             : `${year - 1} - ${year}`;
        
//         // Generate PDF payslip
//         const doc = new PDFDocument({ 
//             margin: 30,
//             size: 'A4'
//         });
        
//         // Create write stream for the PDF
//         const stream = fs.createWriteStream(payslipPath);
//         doc.pipe(stream);
        
//         // Define page dimensions for easier reference
//         const pageWidth = doc.page.width - 60; // Accounting for margins
        
//         // Company Header with border and background
//         doc.rect(30, 30, pageWidth, 70).fill('#f0f7ff').stroke('#000080');
//         doc.fillColor('#000080').fontSize(18).font('Helvetica-Bold').text('TeamSync', 30 + pageWidth/2, 45, { align: 'center' });
//         doc.fontSize(12).text('PAY SLIP FOR THE MONTH OF ' + month.toUpperCase() + ' ' + year, 30 + pageWidth/2, 70, { align: 'center' });
//         doc.fontSize(10).text('FINANCIAL PERIOD - ' + financialYear, 30 + pageWidth/2, 90, { align: 'center' });
        
//         // Set starting position after header
//         let yPos = 120;
        
//         // Employee Information section
//         doc.rect(30, yPos, pageWidth, 20).fill('#d9edf7').stroke('#337ab7');
//         doc.fillColor('#337ab7').fontSize(10).font('Helvetica-Bold').text('EMPLOYEE INFORMATION', 40, yPos + 7);
        
//         yPos += 20;
        
//         // Employee details table with borders
//         const employeeDetails = [
//             ['Employee Name', salary.userId.name || 'N/A'],
//             ['Employee ID', employeeId || 'N/A'],
//             ['Designation', designation || 'N/A'],
//             ['Department', departmentName || 'N/A']
//         ];
        
//         const bankDetails = [
//             ['PF Number', userProfile?.salaryInfo?.PFNumber || 'N/A'],
//             ['ESI Number', userProfile?.salaryInfo?.ESINumber || 'N/A'],
//             ['Bank Name', userProfile?.salaryInfo?.bankDetails?.bankName || 'N/A'],
//             ['Account Number', userProfile?.salaryInfo?.bankDetails?.accountNumber 
//                 ? `XXXX${userProfile.salaryInfo.bankDetails.accountNumber.slice(-4)}` : 'N/A']
//         ];
        
//         // Create a table grid for employee details
//         doc.rect(30, yPos, pageWidth, employeeDetails.length * 20).stroke('#337ab7');
        
//         // Draw vertical dividers for columns
//         doc.moveTo(30 + pageWidth/2, yPos).lineTo(30 + pageWidth/2, yPos + employeeDetails.length * 20).stroke('#337ab7');
//         doc.moveTo(30 + pageWidth/4, yPos).lineTo(30 + pageWidth/4, yPos + employeeDetails.length * 20).stroke('#337ab7');
//         doc.moveTo(30 + (pageWidth/4)*3, yPos).lineTo(30 + (pageWidth/4)*3, yPos + employeeDetails.length * 20).stroke('#337ab7');
        
//         // Fill in employee details
//         doc.font('Helvetica');
//         doc.fillColor('#000000').fontSize(9);
        
//         for (let i = 0; i < employeeDetails.length; i++) {
//             // Draw horizontal row dividers
//             if (i > 0) {
//                 doc.moveTo(30, yPos + i * 20).lineTo(30 + pageWidth, yPos + i * 20).stroke('#337ab7');
//             }
            
//             // Left side details
//             doc.font('Helvetica-Bold').text(employeeDetails[i][0], 35, yPos + i * 20 + 7);
//             doc.font('Helvetica').text(employeeDetails[i][1], 40 + pageWidth/4, yPos + i * 20 + 7);
            
//             // Right side details
//             doc.font('Helvetica-Bold').text(bankDetails[i][0], 35 + pageWidth/2, yPos + i * 20 + 7);
//             doc.font('Helvetica').text(bankDetails[i][1], 40 + (pageWidth/4)*3, yPos + i * 20 + 7);
//         }
        
//         yPos += employeeDetails.length * 20 + 15;
        
//         // Attendance Information section
//         doc.rect(30, yPos, pageWidth, 20).fill('#d9edf7').stroke('#337ab7');
//         doc.fillColor('#337ab7').fontSize(10).font('Helvetica-Bold').text('ATTENDANCE INFORMATION', 40, yPos + 7);
        
//         yPos += 20;
        
//         // Attendance details
//         const leftAttendanceDetails = [
//             ['Total Days in Period', salary.totalDays.toString()],
//             ['Working Days', salary.totalWorkingDays.toString()],
//             ['Weekly Offs', salary.totalWeeklyOffs.toString()],
//             ['Holidays', salary.totalHolidays.toString()],
//             ['Present Days', salary.presentDays.toString()]
//         ];
        
//         const rightAttendanceDetails = [
//             ['Absent Days', salary.absentDays.toString()],
//             ['Paid Leave Days', salary.paidLeaveDays.toString()],
//             ['Half Days', salary.halfDays.toString()],
//             ['Extra Work Days', salary.extraWorkDays.toString()],
//             ['Total Credits', salary.totalCredits.toFixed(1)]
//         ];
        
//         // Create a table grid for attendance details
//         doc.rect(30, yPos, pageWidth, leftAttendanceDetails.length * 20).stroke('#337ab7');
        
//         // Draw vertical dividers for columns
//         doc.moveTo(30 + pageWidth/2, yPos).lineTo(30 + pageWidth/2, yPos + leftAttendanceDetails.length * 20).stroke('#337ab7');
//         doc.moveTo(30 + pageWidth/4, yPos).lineTo(30 + pageWidth/4, yPos + leftAttendanceDetails.length * 20).stroke('#337ab7');
//         doc.moveTo(30 + (pageWidth/4)*3, yPos).lineTo(30 + (pageWidth/4)*3, yPos + leftAttendanceDetails.length * 20).stroke('#337ab7');
        
//         // Fill in attendance details
//         for (let i = 0; i < leftAttendanceDetails.length; i++) {
//             // Draw horizontal row dividers
//             if (i > 0) {
//                 doc.moveTo(30, yPos + i * 20).lineTo(30 + pageWidth, yPos + i * 20).stroke('#337ab7');
//             }
            
//             // Left side attendance details
//             doc.font('Helvetica-Bold').text(leftAttendanceDetails[i][0], 35, yPos + i * 20 + 7);
//             doc.font('Helvetica').text(leftAttendanceDetails[i][1], 40 + pageWidth/4, yPos + i * 20 + 7);
            
//             // Right side attendance details
//             doc.font('Helvetica-Bold').text(rightAttendanceDetails[i][0], 35 + pageWidth/2, yPos + i * 20 + 7);
//             doc.font('Helvetica').text(rightAttendanceDetails[i][1], 40 + (pageWidth/4)*3, yPos + i * 20 + 7);
//         }
        
//         yPos += leftAttendanceDetails.length * 20 + 15;
        
//         // Salary Details section
//         doc.rect(30, yPos, pageWidth, 20).fill('#dff0d8').stroke('#5cb85c');
//         doc.fillColor('#5cb85c').fontSize(10).font('Helvetica-Bold').text('SALARY DETAILS', 40, yPos + 7);
        
//         yPos += 20;
        
//         // Earnings and Deductions headers
//         doc.rect(30, yPos, pageWidth/2, 20).fill('#f5f5f5').stroke('#5cb85c');
//         doc.rect(30 + pageWidth/2, yPos, pageWidth/2, 20).fill('#f5f5f5').stroke('#5cb85c');
        
//         doc.fillColor('#5cb85c').fontSize(9).font('Helvetica-Bold');
//         doc.text('EARNINGS', 30 + pageWidth/4, yPos + 7, { align: 'center' });
//         doc.text('DEDUCTIONS', 30 + pageWidth/4*3, yPos + 7, { align: 'center' });
        
//         yPos += 20;
        
//         // Prepare earnings and deductions lists
//         const earnings = [
//             ['Basic Salary', salary.basicSalary.toFixed(2)],
//             ['DA', salary.allowances.DA.toFixed(2)],
//             ['HRA', salary.allowances.HRA.toFixed(2)],
//             ['Conveyance', salary.allowances.conveyance.toFixed(2)],
//             ['Medical', salary.allowances.medical.toFixed(2)],
//             ['Education', salary.allowances.education.toFixed(2)],
//             ['Performance', salary.allowances.performance.toFixed(2)],
//             ['Special', salary.allowances.special.toFixed(2)],
//             ['Other', salary.allowances.other.toFixed(2)]
//         ];
        
//         const deductions = [
//             ['PF', salary.deductions.PF.toFixed(2)],
//             ['ESI', salary.deductions.ESI.toFixed(2)],
//             ['PT', salary.deductions.PT.toFixed(2)],
//             ['TDS', salary.deductions.TDS.toFixed(2)],
//             ['MLWF', salary.deductions.MLWF.toFixed(2)],
//             ['Advance', salary.deductions.advance.toFixed(2)],
//             ['Loan', salary.deductions.loan.toFixed(2)],
//             ['Other', salary.deductions.other.toFixed(2)],
//             ['Attendance Adjustment', salary.attendanceAdjustment.toFixed(2)]
//         ];
        
//         // Draw earnings and deductions side by side
//         const maxSalaryRows = Math.max(earnings.length, deductions.length);
        
//         // Create a table grid for salary details
//         doc.rect(30, yPos, pageWidth, maxSalaryRows * 16).stroke('#5cb85c');
        
//         // Draw vertical dividers for columns
//         doc.moveTo(30 + pageWidth/2, yPos).lineTo(30 + pageWidth/2, yPos + maxSalaryRows * 16).stroke('#5cb85c');
//         doc.moveTo(30 + pageWidth/4, yPos).lineTo(30 + pageWidth/4, yPos + maxSalaryRows * 16).stroke('#5cb85c');
//         doc.moveTo(30 + (pageWidth/4)*3, yPos).lineTo(30 + (pageWidth/4)*3, yPos + maxSalaryRows * 16).stroke('#5cb85c');
        
//         // Fill in salary details
//         doc.fillColor('#000000').fontSize(8);
        
//         for (let i = 0; i < maxSalaryRows; i++) {
//             // Draw horizontal row dividers
//             if (i > 0) {
//                 doc.moveTo(30, yPos + i * 16).lineTo(30 + pageWidth, yPos + i * 16).stroke('#5cb85c');
//             }
            
//             // Earnings column
//             if (i < earnings.length) {
//                 doc.font('Helvetica-Bold').text(earnings[i][0], 35, yPos + i * 16 + 5);
//                 doc.font('Helvetica').text(earnings[i][1], 30 + pageWidth/4 - 5, yPos + i * 16 + 5, { width: pageWidth/4, align: 'right' });
//             }
            
//             // Deductions column
//             if (i < deductions.length) {
//                 doc.font('Helvetica-Bold').text(deductions[i][0], 35 + pageWidth/2, yPos + i * 16 + 5);
//                 doc.font('Helvetica').text(deductions[i][1], 30 + (pageWidth/4)*3 - 5, yPos + i * 16 + 5, { width: pageWidth/4, align: 'right' });
//             }
//         }
        
//         yPos += maxSalaryRows * 16;
        
//         // Total Earnings and Deductions
//         doc.rect(30, yPos, pageWidth/2, 20).fill('#dff0d8').stroke('#5cb85c');
//         doc.rect(30 + pageWidth/2, yPos, pageWidth/2, 20).fill('#dff0d8').stroke('#5cb85c');
        
//         doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold');
//         doc.text('Total Earnings', 35, yPos + 7);
//         doc.text(`₹ ${salary.grossSalary.toFixed(2)}`, 30 + pageWidth/4 - 5, yPos + 7, { width: pageWidth/4, align: 'right' });
        
//         doc.text('Total Deductions', 35 + pageWidth/2, yPos + 7);
//         doc.text(`₹ ${(salary.totalDeductions + salary.attendanceAdjustment).toFixed(2)}`, 30 + (pageWidth/4)*3 - 5, yPos + 7, { width: pageWidth/4, align: 'right' });
        
//         yPos += 25;
        
//         // Net Salary with border
//         doc.rect(30, yPos, pageWidth, 60).fill('#ebfaeb').stroke('#3c763d');
        
//         doc.fillColor('#3c763d').fontSize(11).font('Helvetica-Bold');
//         doc.text('NET SALARY:', 40, yPos + 10);
//         doc.text(`₹ ${salary.netSalary.toFixed(2)}`, 30 + pageWidth - 40, yPos + 10, { align: 'right' });
        
//         // Add amount in words
//         const amountInWords = numberToWords(salary.netSalary);
//         doc.fillColor('#000000').fontSize(9);
//         doc.text('Amount in words:', 40, yPos + 30);
//         doc.font('Helvetica-Bold').text(amountInWords, 40, yPos + 45, { width: pageWidth - 20 });
        
//         yPos += 75;
        
//         // Payment Information (if paid)
//         if (salary.status === 'Paid') {
//             doc.rect(30, yPos, pageWidth, 40).fill('#f5f5f5').stroke('#777777');
            
//             doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold');
//             doc.text('Payment Information', 40, yPos + 10);
            
//             doc.font('Helvetica').fontSize(8);
//             doc.text(`Payment Date: ${format(new Date(salary.paymentDate), 'dd MMM yyyy')}`, 40, yPos + 25);
//             doc.text(`Payment Method: ${salary.paymentMethod}`, 250, yPos + 25);
            
//             if (salary.transactionId) {
//                 doc.text(`Transaction ID: ${salary.transactionId}`, 40, yPos + 35);
//             }
            
//             yPos += 45;
//         }
        
//         // Note and Disclaimer at bottom
//         doc.fillColor('#777777').fontSize(7);
//         doc.text('This is a computer-generated payslip and does not require a signature.', 30, doc.page.height - 50);
//         doc.text('For any queries regarding this payslip, please contact the HR department.', 30, doc.page.height - 40);
        
//         // Finalize the PDF and end the stream
//         doc.end();
        
//         // Wait for the stream to finish
//         await new Promise((resolve, reject) => {
//             stream.on('finish', resolve);
//             stream.on('error', reject);
//         });
        
//         // Update salary record with payslip information
//         salary.payslipGenerated = true;
//         salary.payslipUrl = `/uploads/payslips/${payslipFilename}`;
        
//         // Add to audit log
//         salary.auditLog.push({
//             action: 'Payslip Generated',
//             userId: req.user._id,
//             notes: 'Payslip generated successfully'
//         });
        
//         await salary.save();
        
//         logger.info(`Payslip generated for salary record ${id}`);
        
//         return res.status(200).json({
//             success: true,
//             message: 'Payslip generated successfully',
//             payslipUrl: salary.payslipUrl
//         });
        
//     } catch (error) {
//         logger.error(`Error generating payslip: ${error.message}`);
//         console.log(error)
//         return res.status(500).json({
//             success: false,
//             error: `Server error in generating payslip: ${error.message}`
//         });
//     }
// };
// Generate a payslip for a salary record
export const generatePayslip = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the salary record with user information
        const salary = await Salary.findById(id)
            .populate('userId', 'name email role');
        
        if (!salary) {
            return res.status(404).json({
                success: false,
                error: 'Salary record not found'
            });
        }
        
        // Check if the record is in Approved or Paid status
        if (!['Approved', 'Paid'].includes(salary.status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot generate payslip for salary record in ${salary.status} status`
            });
        }
        
        // Get additional user information
        let employeeId = null;
        let designation = null;
        let departmentName = null;
        
        if (salary.employeeId) {
            const employee = await Employee.findById(salary.employeeId)
                .populate('department', 'dep_name');
            if (employee) {
                employeeId = employee.employeeId;
                designation = employee.designation;
                departmentName = employee.department.dep_name;
            }
        } else if (salary.managerId) {
            const manager = await Manager.findById(salary.managerId)
                .populate('department', 'dep_name');
            if (manager) {
                employeeId = manager.managerId;
                designation = manager.designation;
                departmentName = manager.department.dep_name;
            }
        }
        
        // Get user profile with bank details and other info
        const userProfile = await UserProfile.findOne({ userId: salary.userId });
        
        // Create payslip directory if it doesn't exist
        const payslipDir = path.join(__dirname, '../public/uploads/payslips');
        if (!fs.existsSync(payslipDir)) {
            fs.mkdirSync(payslipDir, { recursive: true });
            console.log(`Created payslip directory at: ${payslipDir}`);
        }
        
        // Generate unique filename for the payslip
        let payPeriodClean = salary.payPeriod.replace(/\s+/g, '_');
        let employeeName = salary.userId.name.replace(/\s+/g, '_');
        const payslipFilename = `payslip_${employeeName}_${payPeriodClean}_${Date.now()}.pdf`;
        const payslipPath = path.join(payslipDir, payslipFilename);
        
        // Function to convert number to words
        const numberToWords = (num) => {
            const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            
            const convertLessThanOneThousand = (num) => {
                if (num === 0) return '';
                
                if (num < 20) {
                    return ones[num];
                }
                
                const ten = Math.floor(num / 10) % 10;
                const one = num % 10;
                
                return (ten > 0 ? tens[ten] + (one > 0 ? '-' + ones[one] : '') : ones[one]);
            };
            
            if (num === 0) return 'Zero';
            
            // Split the number into whole and decimal parts
            const parts = num.toFixed(2).split('.');
            let wholeNum = parseInt(parts[0]);
            const decimalPart = parseInt(parts[1]);
            
            let result = '';
            
            if (wholeNum >= 10000000) {
                result += convertLessThanOneThousand(Math.floor(wholeNum / 10000000)) + ' Crore ';
                wholeNum %= 10000000;
            }
            
            if (wholeNum >= 100000) {
                result += convertLessThanOneThousand(Math.floor(wholeNum / 100000)) + ' Lakh ';
                wholeNum %= 100000;
            }
            
            if (wholeNum >= 1000) {
                result += convertLessThanOneThousand(Math.floor(wholeNum / 1000)) + ' Thousand ';
                wholeNum %= 1000;
            }
            
            if (wholeNum > 0) {
                result += convertLessThanOneThousand(wholeNum);
            }
            
            // Add 'Rupees' at the beginning
            result = 'Rupees ' + result;
            
            // Add decimal part
            if (decimalPart > 0) {
                result += ' and ' + convertLessThanOneThousand(decimalPart) + ' Paise';
            }
            
            return result + ' Only';
        };
        
        // Extract month and year for header
        const periodDate = new Date(salary.periodStart);
        const month = periodDate.toLocaleString('en-US', { month: 'long' });
        const year = periodDate.getFullYear();
        const financialYear = periodDate.getMonth() >= 3 
            ? `${year} - ${year + 1}` 
            : `${year - 1} - ${year}`;
        
        // Generate PDF payslip
        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4',
            autoFirstPage: true,
            bufferPages: false // Prevent multiple pages creation
        });
        
        // Create write stream for the PDF
        const stream = fs.createWriteStream(payslipPath);
        doc.pipe(stream);
        
        // Define page dimensions for easier reference
        const pageWidth = doc.page.width - 100; // Accounting for margins
        
        // Helper function to draw a line
        const drawHorizontalLine = (y) => {
            doc.moveTo(50, y).lineTo(50 + pageWidth, y).stroke();
        };
        
        // Clean table-like layout similar to Excel
        // ---------------------------------------
        
        // Company Header with clean border
        doc.lineWidth(1);
        doc.rect(50, 50, pageWidth, 80).stroke();
        doc.fontSize(18).font('Helvetica-Bold').text('TeamSync', 50, 60, { width: pageWidth, align: 'center' });
        doc.fontSize(12).text('SALARY SLIP', 50, 85, { width: pageWidth, align: 'center' });
        doc.fontSize(10).text(`FOR THE MONTH OF ${month.toUpperCase()} ${year}`, 50, 105, { width: pageWidth, align: 'center' });
        
        let yPos = 150;
        
        // Payment Information
        if (salary.status === 'Paid') {
            doc.fontSize(9).font('Helvetica');
            doc.text(`Payment Date: ${format(new Date(salary.paymentDate), 'dd MMM yyyy')}`, 50, yPos);
            doc.text(`Payment Method: ${salary.paymentMethod}`, 50 + pageWidth/2, yPos);
            
            if (salary.transactionId) {
                yPos += 15;
                doc.text(`Transaction ID: ${salary.transactionId}`, 50, yPos);
            }
            yPos += 25;
        }
        
        // Employee Information section - clean table layout
        doc.lineWidth(0.5);
        doc.rect(50, yPos, pageWidth, 100).stroke();
        
        // Draw column dividers
        doc.moveTo(50 + pageWidth/2, yPos).lineTo(50 + pageWidth/2, yPos + 100).stroke();
        
        // Add employee details headers
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('EMPLOYEE DETAILS', 60, yPos + 10);
        doc.text('BANK & STATUTORY DETAILS', 60 + pageWidth/2, yPos + 10);
        
        drawHorizontalLine(yPos + 25);
        
        // Employee information - left column
        doc.fontSize(8).font('Helvetica');
        let rowY = yPos + 35;
        
        // Employee details - row by row with proper alignment
        doc.font('Helvetica-Bold').text('Employee Name:', 60, rowY);
        doc.font('Helvetica').text(salary.userId.name || 'N/A', 150, rowY);
        rowY += 15;
        
        doc.font('Helvetica-Bold').text('Employee ID:', 60, rowY);
        doc.font('Helvetica').text(employeeId || 'N/A', 150, rowY);
        rowY += 15;
        
        doc.font('Helvetica-Bold').text('Designation:', 60, rowY);
        doc.font('Helvetica').text(designation || 'N/A', 150, rowY);
        rowY += 15;
        
        doc.font('Helvetica-Bold').text('Department:', 60, rowY);
        doc.font('Helvetica').text(departmentName || 'N/A', 150, rowY);
        
        // Bank and statutory details - right column
        rowY = yPos + 35;
        doc.font('Helvetica-Bold').text('PF Number:', 60 + pageWidth/2, rowY);
        doc.font('Helvetica').text(userProfile?.salaryInfo?.PFNumber || 'N/A', 150 + pageWidth/2, rowY);
        rowY += 15;
        
        doc.font('Helvetica-Bold').text('ESI Number:', 60 + pageWidth/2, rowY);
        doc.font('Helvetica').text(userProfile?.salaryInfo?.ESINumber || 'N/A', 150 + pageWidth/2, rowY);
        rowY += 15;
        
        doc.font('Helvetica-Bold').text('Bank Name:', 60 + pageWidth/2, rowY);
        doc.font('Helvetica').text(userProfile?.salaryInfo?.bankDetails?.bankName || 'N/A', 150 + pageWidth/2, rowY);
        rowY += 15;
        
        doc.font('Helvetica-Bold').text('Account Number:', 60 + pageWidth/2, rowY);
        doc.font('Helvetica').text(userProfile?.salaryInfo?.bankDetails?.accountNumber 
            ? `XXXX${userProfile.salaryInfo.bankDetails.accountNumber.slice(-4)}` : 'N/A', 150 + pageWidth/2, rowY);
        
        yPos += 120;
        
        // Attendance Information
        doc.font('Helvetica-Bold').fontSize(9).text('ATTENDANCE SUMMARY', 50, yPos);
        yPos += 15;
        
        // Attendance table
        doc.rect(50, yPos, pageWidth, 70).stroke();
        
        // Draw column dividers
        doc.moveTo(50 + pageWidth/2, yPos).lineTo(50 + pageWidth/2, yPos + 70).stroke();
        
        // Draw horizontal dividers
        drawHorizontalLine(yPos + 20); // After headers
        
        // Headers
        doc.font('Helvetica-Bold').fontSize(8);
        doc.text('DAYS', 70, yPos + 7);
        doc.text('COUNT', pageWidth/4 + 30, yPos + 7, { width: 50, align: 'right' });
        doc.text('ATTENDANCE', 70 + pageWidth/2, yPos + 7);
        doc.text('COUNT', 50 + pageWidth - 70, yPos + 7, { width: 50, align: 'right' });
        
        // Attendance data - first column
        yPos += 25;
        doc.fontSize(8).font('Helvetica');
        
        doc.text('Total Days in Period:', 60, yPos);
        doc.text(salary.totalDays.toString(), pageWidth/4 + 30, yPos, { width: 50, align: 'right' });
        yPos += 12;
        
        doc.text('Working Days:', 60, yPos);
        doc.text(salary.totalWorkingDays.toString(), pageWidth/4 + 30, yPos, { width: 50, align: 'right' });
        yPos += 12;
        
        doc.text('Holidays + Weekly Offs:', 60, yPos);
        doc.text((salary.totalHolidays + salary.totalWeeklyOffs).toString(), pageWidth/4 + 30, yPos, { width: 50, align: 'right' });
        
        // Attendance data - second column
        yPos = yPos - 24;
        doc.text('Present Days:', 60 + pageWidth/2, yPos);
        doc.text(salary.presentDays.toString(), 50 + pageWidth - 70, yPos, { width: 50, align: 'right' });
        yPos += 12;
        
        doc.text('Leaves (Paid/Unpaid):', 60 + pageWidth/2, yPos);
        doc.text((salary.paidLeaveDays + salary.unpaidLeaveDays).toString(), 50 + pageWidth - 70, yPos, { width: 50, align: 'right' });
        yPos += 12;
        
        doc.text('Total Credits:', 60 + pageWidth/2, yPos);
        doc.font('Helvetica-Bold');
        doc.text(salary.totalCredits.toFixed(1), 50 + pageWidth - 70, yPos, { width: 50, align: 'right' });
        
        yPos += 40;
        
        // Earnings and Deductions section
        doc.font('Helvetica-Bold').fontSize(9).text('EARNINGS AND DEDUCTIONS', 50, yPos);
        yPos += 15;
        
        // Main table for earnings and deductions
        doc.rect(50, yPos, pageWidth, 180).stroke();
        
        // Vertical divider
        doc.moveTo(50 + pageWidth/2, yPos).lineTo(50 + pageWidth/2, yPos + 180).stroke();
        
        // Table headers
        doc.font('Helvetica-Bold').fontSize(8);
        doc.text('EARNINGS', 60, yPos + 7);
        doc.text('AMOUNT (₹)', pageWidth/4 + 30, yPos + 7, { width: 50, align: 'right' });
        doc.text('DEDUCTIONS', 60 + pageWidth/2, yPos + 7);
        doc.text('AMOUNT (₹)', 50 + pageWidth - 70, yPos + 7, { width: 50, align: 'right' });
        
        // Divider after headers
        drawHorizontalLine(yPos + 20);
        
        // Include all earnings and deductions, even with zero values
        const earnings = [
            ['Basic Salary', salary.basicSalary],
            ['Dearness Allowance', salary.allowances.DA],
            ['House Rent Allowance', salary.allowances.HRA],
            ['Conveyance Allowance', salary.allowances.conveyance],
            ['Medical Allowance', salary.allowances.medical],
            ['Education Allowance', salary.allowances.education],
            ['Performance Bonus', salary.allowances.performance],
            ['Special Allowance', salary.allowances.special],
            ['Other Allowances', salary.allowances.other]
        ];
        
        const deductions = [
            ['Provident Fund', salary.deductions.PF],
            ['ESI', salary.deductions.ESI],
            ['Professional Tax', salary.deductions.PT],
            ['Income Tax (TDS)', salary.deductions.TDS],
            ['Labor Welfare Fund', salary.deductions.MLWF],
            ['Advance Recovery', salary.deductions.advance],
            ['Loan Recovery', salary.deductions.loan],
            ['Other Deductions', salary.deductions.other],
            ['Attendance Adjustment', salary.attendanceAdjustment]
        ];
        
        // Print earnings
        yPos += 30;
        doc.font('Helvetica').fontSize(8);
        
        earnings.forEach((item, index) => {
            doc.text(item[0], 60, yPos + (index * 15));
            doc.text(item[1].toFixed(2), pageWidth/4 + 30, yPos + (index * 15), { width: 50, align: 'right' });
        });
        
        // Print deductions
        deductions.forEach((item, index) => {
            doc.text(item[0], 60 + pageWidth/2, yPos + (index * 15));
            doc.text(item[1].toFixed(2), 50 + pageWidth - 70, yPos + (index * 15), { width: 50, align: 'right' });
        });
        
        // Total row
        drawHorizontalLine(yPos + 165);
        
        doc.font('Helvetica-Bold');
        doc.text('Total Earnings', 60, yPos + 170);
        doc.text(salary.grossSalary.toFixed(2), pageWidth/4 + 30, yPos + 170, { width: 50, align: 'right' });
        
        doc.text('Total Deductions', 60 + pageWidth/2, yPos + 170);
        doc.text((salary.totalDeductions + salary.attendanceAdjustment).toFixed(2), 50 + pageWidth - 70, yPos + 170, { width: 50, align: 'right' });
        
        yPos += 200;
        
        // Net Salary section
        doc.rect(50, yPos, pageWidth, 60).stroke();
        
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('NET SALARY:', 60, yPos + 15);
        doc.text(`₹ ${salary.netSalary.toFixed(2)}`, 50 + pageWidth - 70, yPos + 15, { width: 60, align: 'right' });
        
        // Amount in words
        const amountInWords = numberToWords(salary.netSalary);
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Amount in words:', 60, yPos + 35);
        doc.font('Helvetica').text(amountInWords, 150, yPos + 35, { width: pageWidth - 160 });
        
        // Footer with disclaimer - only added on the first and only page
        doc.fontSize(7).font('Helvetica');
        
        // Register callback to add footer content only on the first (and only) page
        const footerY = doc.page.height - 40;
        doc.text('This is a computer-generated payslip. No signature is required.', 50, footerY, { width: pageWidth, align: 'center' });
        doc.text('For any queries regarding this payslip, please contact the HR department.', 50, footerY + 10, { width: pageWidth, align: 'center' });
        
        // Finalize the PDF and end the stream
        doc.end();
        
        // Wait for the stream to finish
        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
        
        // Update salary record with payslip information
        salary.payslipGenerated = true;
        salary.payslipUrl = `/uploads/payslips/${payslipFilename}`;
        
        // Add to audit log
        salary.auditLog.push({
            action: 'Payslip Generated',
            userId: req.user._id,
            notes: 'Payslip generated successfully'
        });
        
        await salary.save();
        
        logger.info(`Payslip generated for salary record ${id}`);
        
        return res.status(200).json({
            success: true,
            message: 'Payslip generated successfully',
            payslipUrl: salary.payslipUrl
        });
        
    } catch (error) {
        logger.error(`Error generating payslip: ${error.message}`);
        console.error(error);
        return res.status(500).json({
            success: false,
            error: `Server error in generating payslip: ${error.message}`
        });
    }
};
// Download a payslip
export const downloadPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the salary record
        const salary = await Salary.findById(id);
        
        if (!salary) {
            return res.status(404).json({
                success: false,
                error: 'Salary record not found'
            });
        }
        
        // Check if payslip is generated
        if (!salary.payslipGenerated || !salary.payslipUrl) {
            return res.status(400).json({
                success: false,
                error: 'Payslip not generated for this salary record'
            });
        }
        
        // Send the file
        const payslipPath = path.join(__dirname, '../public/uploads/payslips', path.basename(salary.payslipUrl));

        
        if (!fs.existsSync(payslipPath)) {
            return res.status(404).json({
                success: false,
                error: 'Payslip file not found'
            });
        }
        
        // Set the appropriate headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=payslip_${salary.payPeriod.replace(/\s+/g, '_')}.pdf`);
        
        // Stream the file
        const fileStream = fs.createReadStream(payslipPath);
        fileStream.pipe(res);
        
    } catch (error) {
        logger.error(`Error downloading payslip: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in downloading payslip: ${error.message}`
        });
    }
};

// Get salary statistics for dashboard
export const getSalaryStats = async (req, res) => {
    try {
        // Get statistics for the current month
        const currentDate = new Date();
        const currentMonth = format(currentDate, 'MMMM yyyy');
        
        // Total salary disbursement for current month
        const currentMonthSalaries = await Salary.find({
            payPeriod: currentMonth,
            status: { $in: ['Approved', 'Paid'] }
        });
        
        const totalDisbursement = currentMonthSalaries.reduce(
            (sum, salary) => sum + salary.netSalary, 0
        );
        
        // Count of salary records by status
        const salaryStatusCounts = await Salary.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Format the status counts
        const statusCounts = {};
        salaryStatusCounts.forEach(status => {
            statusCounts[status._id] = status.count;
        });
        
        // Get the count of employees and managers
        const employeeCount = await User.countDocuments({ role: 'employee' });
        const managerCount = await User.countDocuments({ role: 'manager' });
        
        return res.status(200).json({
            success: true,
            stats: {
                totalDisbursement,
                employeeCount,
                managerCount,
                statusCounts,
                currentMonth
            }
        });
        
    } catch (error) {
        logger.error(`Error getting salary statistics: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in getting salary statistics: ${error.message}`
        });
    }
};

// Bulk approve salary records
export const bulkApproveSalaries = async (req, res) => {
    try {
        const { salaryIds, comments } = req.body;
        
        if (!salaryIds || !Array.isArray(salaryIds) || salaryIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No salary records provided for approval'
            });
        }
        
        // Get all the salary records
        const salaries = await Salary.find({ _id: { $in: salaryIds } });
        
        if (salaries.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No matching salary records found'
            });
        }
        
        // Filter out records that are not in Draft or Verified status
        const validSalaries = salaries.filter(salary => 
            ['Draft', 'Verified'].includes(salary.status)
        );
        
        if (validSalaries.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'None of the provided salary records are eligible for approval'
            });
        }
        
        // Update all valid salaries
        const updatedSalaries = [];
        for (const salary of validSalaries) {
            salary.status = 'Approved';
            salary.auditLog.push({
                action: 'Bulk Approved',
                userId: req.user._id,
                notes: comments || 'Salary record approved in bulk operation'
            });
            
            await salary.save();
            updatedSalaries.push(salary);
        }
        
        logger.info(`${updatedSalaries.length} salary records approved in bulk by user ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: `Successfully approved ${updatedSalaries.length} salary records`,
            count: updatedSalaries.length,
            skipped: salaries.length - updatedSalaries.length
        });
        
    } catch (error) {
        logger.error(`Error in bulk approval of salaries: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in bulk approving salaries: ${error.message}`
        });
    }
};

// Bulk reject salary records
export const bulkRejectSalaries = async (req, res) => {
    try {
        const { salaryIds, comments } = req.body;
        
        if (!salaryIds || !Array.isArray(salaryIds) || salaryIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No salary records provided for rejection'
            });
        }
        
        if (!comments) {
            return res.status(400).json({
                success: false,
                error: 'Comments are required for rejecting salary records'
            });
        }
        
        // Get all the salary records
        const salaries = await Salary.find({ _id: { $in: salaryIds } });
        
        if (salaries.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No matching salary records found'
            });
        }
        
        // Filter out records that are not in Draft or Verified status
        const validSalaries = salaries.filter(salary => 
            ['Draft', 'Verified'].includes(salary.status)
        );
        
        if (validSalaries.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'None of the provided salary records are eligible for rejection'
            });
        }
        
        // Update all valid salaries
        const updatedSalaries = [];
        for (const salary of validSalaries) {
            salary.status = 'Rejected';
            salary.auditLog.push({
                action: 'Bulk Rejected',
                userId: req.user._id,
                notes: comments
            });
            
            await salary.save();
            updatedSalaries.push(salary);
        }
        
        logger.info(`${updatedSalaries.length} salary records rejected in bulk by user ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: `Successfully rejected ${updatedSalaries.length} salary records`,
            count: updatedSalaries.length,
            skipped: salaries.length - updatedSalaries.length
        });
        
    } catch (error) {
        logger.error(`Error in bulk rejection of salaries: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: `Server error in bulk rejecting salaries: ${error.message}`
        });
    }
};