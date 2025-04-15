import puppeteer from 'puppeteer';
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
import { fileURLToPath } from 'url';
import { uploadFileToFirebase, deleteFileFromFirebase, getFileSignedUrl, streamFileToResponse } from '../config/firebase.js';

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

        // Generate unique filename for the payslip
        let payPeriodClean = salary.payPeriod.replace(/\s+/g, '_');
        let employeeName = salary.userId.name.replace(/\s+/g, '_');
        const payslipFilename = `payslip_${employeeName}_${payPeriodClean}_${Date.now()}.pdf`;

        // Function to convert number to words
        const numberToWords = (num) => {
            const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

            const convertLessThanOneThousand = (num) => {
                if (num === 0) return '';

                let result = '';

                // Handle hundreds place
                if (num >= 100) {
                    result += ones[Math.floor(num / 100)] + ' Hundred';
                    num %= 100;
                    if (num > 0) result += ' and '; // Add 'and' if there are tens/ones
                }

                // Handle tens and ones places
                if (num > 0) {
                    if (num < 20) {
                        result += ones[num];
                    } else {
                        const ten = Math.floor(num / 10);
                        const one = num % 10;
                        result += tens[ten];
                        if (one > 0) {
                            result += '-' + ones[one];
                        }
                    }
                }

                return result;
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

        // Generate HTML for the payslip
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Payslip - ${salary.userId.name}</title>
            <style>
                @page {
                    size: A4;
                    margin: 15mm 10mm;
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    color: #333;
                    font-size: 10pt;
                }
                .container {
                    max-width: 100%;
                }
                .header {
                    text-align: center;
                    padding: 10px;
                    margin-bottom: 15px;
                    background-color: #f5f5f5;
                    border: 1px solid #ddd;
                }
                .company-name {
                    font-size: 18pt;
                    font-weight: bold;
                    color: #1e3e67;
                    margin-bottom: 5px;
                }
                .payslip-title {
                    font-size: 12pt;
                    margin-top: 5px;
                }
                .panel {
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    margin-bottom: 10px;
                }
                .panel-header {
                    background-color: #f5f5f5;
                    padding: 5px 10px;
                    font-weight: bold;
                    border-bottom: 1px solid #ddd;
                }
                .panel-body {
                    padding: 8px;
                }
                .employee-name {
                    font-size: 14pt;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #1e3e67;
                    text-align: center;
                }
                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .info-row {
                    display: grid;
                    grid-template-columns: 40% 60%;
                    padding: 3px 0;
                    font-size: 9pt;
                }
                .label {
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 9pt;
                }
                th {
                    background-color: #f5f5f5;
                    text-align: left;
                    padding: 5px;
                }
                td {
                    padding: 4px 5px;
                    border-bottom: 1px solid #eee;
                }
                .amount {
                    text-align: right;
                }
                .total-row {
                    font-weight: bold;
                    border-top: 1px solid #ddd;
                    background-color: #f9f9f9;
                }
                .net-salary {
                    border: 1px solid #5cb85c;
                    background-color: #ebfaeb;
                    padding: 10px;
                    margin-top: 10px;
                }
                .net-amount {
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                    font-size: 12pt;
                    margin-bottom: 5px;
                }
                .amount-words {
                    font-size: 9pt;
                    margin-top: 5px;
                }
                .footer {
                    margin-top: 15px;
                    text-align: center;
                    font-size: 8pt;
                    color: #777;
                }
                .section-title {
                    font-weight: bold;
                    font-size: 10pt;
                    margin-bottom: 5px;
                    color: #555;
                }
                
                /* For print */
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Company Header -->
                <div class="header">
                    <div class="company-name">Maximize Market Research Pvt. Ltd.</div>
                    <div class="payslip-title">SALARY SLIP</div>
                    <div>FOR THE MONTH OF ${month.toUpperCase()} ${year}</div>
                </div>
                
                <!-- Payment Information -->
                ${salary.status === 'Paid' ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 9pt;">
                    <div>Payment Date: ${format(new Date(salary.paymentDate), 'dd MMM yyyy')}</div>
                    <div>Payment Method: ${salary.paymentMethod}</div>
                    ${salary.transactionId ? `<div>Transaction ID: ${salary.transactionId}</div>` : ''}
                </div>` : ''}
                
                <!-- Combined Employee Information -->
                <div class="panel">
                    <div class="panel-header">EMPLOYEE INFORMATION</div>
                    <div class="panel-body">
                        <div class="employee-name">${salary.userId.name || 'N/A'}</div>
                        
                        <div class="grid-2" style="gap: 10px;">
                            <!-- Employee Details -->
                            <div>
                                <table>
                                    <tr>
                                        <th>Description</th>
                                        <th>Details</th>
                                    </tr>
                                    <tr>
                                        <td>Employee ID</td>
                                        <td>${employeeId || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td>Designation</td>
                                        <td>${designation || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td>Department</td>
                                        <td>${departmentName || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td>PF Number</td>
                                        <td>${userProfile?.salaryInfo?.PFNumber || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td>ESI Number</td>
                                        <td>${userProfile?.salaryInfo?.ESINumber || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td>Bank Name</td>
                                        <td>${userProfile?.salaryInfo?.bankDetails?.bankName || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td>Account Number</td>
                                        <td>${userProfile?.salaryInfo?.bankDetails?.accountNumber
                                ? `XXXX${userProfile.salaryInfo.bankDetails.accountNumber.slice(-4)}`
                                : 'N/A'}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Attendance Details -->
                            <div>
                                <table>
                                    <tr>
                                        <th>Description</th>
                                        <th>Count</th>
                                    </tr>
                                    <tr>
                                        <td>Total Days in Period</td>
                                        <td>${salary.totalDays}</td>
                                    </tr>
                                    <tr>
                                        <td>Working Days</td>
                                        <td>${salary.totalWorkingDays}</td>
                                    </tr>
                                    <tr>
                                        <td>Holidays + Weekly Offs</td>
                                        <td>${salary.totalHolidays + salary.totalWeeklyOffs}</td>
                                    </tr>
                                    <tr>
                                        <td>Present Days</td>
                                        <td>${salary.presentDays}</td>
                                    </tr>
                                    <tr>
                                        <td>Absent Days</td>
                                        <td>${salary.absentDays}</td>
                                    </tr>
                                    <tr>
                                        <td>Paid Leave Days</td>
                                        <td>${salary.paidLeaveDays}</td>
                                    </tr>
                                    <tr>
                                        <td>Unpaid Leave Days</td>
                                        <td>${salary.unpaidLeaveDays}</td>
                                    </tr>
                                    <tr class="total-row">
                                        <td>Total Credits</td>
                                        <td><strong>${salary.totalCredits.toFixed(1)}</strong></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Earnings and Deductions -->
                <div class="grid-2" style="gap: 10px;">
                    <!-- Earnings -->
                    <div class="panel">
                        <div class="panel-header">EARNINGS</div>
                        <div class="panel-body" style="padding: 0;">
                            <table>
                                <tr>
                                    <th>Description</th>
                                    <th class="amount">Amount (₹)</th>
                                </tr>
                                
                                <tr>
                                    <td>Basic Salary</td>
                                    <td class="amount">${salary.basicSalary.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Dearness Allowance</td>
                                    <td class="amount">${salary.allowances.DA.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>House Rent Allowance</td>
                                    <td class="amount">${salary.allowances.HRA.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Conveyance Allowance</td>
                                    <td class="amount">${salary.allowances.conveyance.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Medical Allowance</td>
                                    <td class="amount">${salary.allowances.medical.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Education Allowance</td>
                                    <td class="amount">${salary.allowances.education.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Performance Bonus</td>
                                    <td class="amount">${salary.allowances.performance.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Special Allowance</td>
                                    <td class="amount">${salary.allowances.special.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Other Allowances</td>
                                    <td class="amount">${salary.allowances.other.toFixed(2)}</td>
                                </tr>
                                
                                <tr class="total-row">
                                    <td>Total Earnings</td>
                                    <td class="amount">${salary.grossSalary.toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Deductions -->
                    <div class="panel">
                        <div class="panel-header">DEDUCTIONS</div>
                        <div class="panel-body" style="padding: 0;">
                            <table>
                                <tr>
                                    <th>Description</th>
                                    <th class="amount">Amount (₹)</th>
                                </tr>
                                
                                <tr>
                                    <td>Provident Fund</td>
                                    <td class="amount">${salary.deductions.PF.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>ESI</td>
                                    <td class="amount">${salary.deductions.ESI.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Professional Tax</td>
                                    <td class="amount">${salary.deductions.PT.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Income Tax (TDS)</td>
                                    <td class="amount">${salary.deductions.TDS.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Labor Welfare Fund</td>
                                    <td class="amount">${salary.deductions.MLWF.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Advance Recovery</td>
                                    <td class="amount">${salary.deductions.advance.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Loan Recovery</td>
                                    <td class="amount">${salary.deductions.loan.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Other Deductions</td>
                                    <td class="amount">${salary.deductions.other.toFixed(2)}</td>
                                </tr>
                                
                                <tr>
                                    <td>Attendance Adjustment</td>
                                    <td class="amount">${salary.attendanceAdjustment.toFixed(2)}</td>
                                </tr>
                                
                                <tr class="total-row">
                                    <td>Total Deductions</td>
                                    <td class="amount">${(salary.totalDeductions + salary.attendanceAdjustment).toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- Net Salary -->
                <div class="net-salary">
                    <div class="net-amount">
                        <div>NET SALARY:</div>
                        <div>₹ ${salary.netSalary.toFixed(2)}</div>
                    </div>
                    <div class="amount-words">
                        <strong>Amount in words:</strong> ${numberToWords(salary.netSalary)}
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="footer" style="position: absolute; bottom: 2mm; left: 10mm; right: 10mm; text-align: center;">
                    <div>This is a computer-generated payslip. No signature is required.</div>
                    <div>For any queries regarding this payslip, please contact the HR department.</div>
                    <div style="margin-top: 8px;">
                        <strong>Registered Office</strong><br>
                        3rd Floor, Navale IT Park Phase 2, Pune Bangalore Highway, Narhe, Pune, Maharashtra 411041, India.
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        // Use Puppeteer to generate PDF
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generate PDF as a buffer
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });

        await browser.close();

        // Upload PDF buffer to Firebase Storage
        const fileObj = {
            buffer: pdfBuffer,
            mimetype: 'application/pdf',
            originalname: payslipFilename
        };

        const fileData = await uploadFileToFirebase(fileObj, 'payslips', payslipFilename);

        // Update salary record with payslip information
        salary.payslipGenerated = true;
        salary.payslipUrl = fileData.url;
        salary.payslipPath = fileData.path;

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
        if (!salary.payslipGenerated || !salary.payslipPath) {
            return res.status(400).json({
                success: false,
                error: 'Payslip not generated for this salary record'
            });
        }

        // Get a fresh signed URL for the payslip
        const signedUrl = await getFileSignedUrl(salary.payslipPath, 15 * 60); // 15 minutes expiry

        if (!signedUrl) {
            return res.status(404).json({
                success: false,
                error: 'Payslip file not found in storage'
            });
        }

        // Set the filename for download
        const filename = path.basename(salary.payslipPath);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        // Redirect to the signed URL for download
        return res.redirect(signedUrl);
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