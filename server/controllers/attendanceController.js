import logger from '../utils/logger.js';
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";
import Holiday from "../models/Holiday.js";
import UserProfile from "../models/UserProfile.js";
import User from "../models/User.js";
import Leave from "../models/Leave.js";

const isInsideGeoFence = (lat, lon, geoFencePoints) => {
    let inside = false;
    for (let i = 0, j = geoFencePoints.length - 1; i < geoFencePoints.length; j = i++) {
        const xi = geoFencePoints[i].lat, yi = geoFencePoints[i].lon;
        const xj = geoFencePoints[j].lat, yj = geoFencePoints[j].lon;

        const intersect = ((yi > lon) !== (yj > lon)) &&
            (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};
// For testing
// { lat: 20.338010, lon: 74.167355 },
// { lat: 20.338010, lon: 73.268880 },
// { lat: 19.659858, lon: 73.268880 },
// { lat: 19.659858, lon: 74.167355 }

const checkGeoFence = (lat, lon) => {
    // Define the geofence coordinates (same as frontend)
    const geoFencePoints = [
        { lat: 18.886617, lon: 74.288205 },
        { lat: 18.886617, lon: 73.389729 },
        { lat: 18.202419, lon: 73.389729 },
        { lat: 18.202419, lon: 74.288205 }
    ];

    return isInsideGeoFence(lat, lon, geoFencePoints);
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

// Helper function to check if a date is a weekend
const isWeekend = (date) => {
    const day = date.getUTCDay();
    return day === 0 || day === 6; // Sunday (0) or Saturday (6)
};

// Helper function to calculate credits based on attendance status and conditions
const calculateCredits = async (attendance, existingLeave = null) => {
    const date = new Date(attendance.date);
    const isDateWeekend = attendance.isWeekend || isWeekend(date);
    const isDateHoliday = attendance.isHoliday || await isHoliday(date);
    
    // 1. If it's a weekend or holiday with no attendance, it's a Weekly Off (1 Credit)
    if ((isDateWeekend || isDateHoliday) && !attendance.clockIn) {
        attendance.status = "Weekly Off";
        attendance.credits = 1;
        return;
    }
    
    // 2. If it's a weekend or holiday with attendance, it's Extra Work (1 Credit)
    if ((isDateWeekend || isDateHoliday) && attendance.clockIn) {
        attendance.status = "Extra Work";
        // Check if it's incomplete attendance (clocked in but not clocked out)
        if (!attendance.clockOut) {
            attendance.credits = 0.5; // Partial Extra Work (0.5 Credit)
        } else {
            attendance.credits = 1; // Complete Extra Work (1 Credit)
        }
        return;
    }
    
    // 3. Check for leave status if existingLeave is provided
    if (existingLeave) {
        if (existingLeave.leaveType === "Half Leave") {
            attendance.isHalfDay = true;
            
            // If the leave uses leave balance, it's Paid Half Leave
            if (existingLeave.useLeaveBalance) {
                // If user has also clocked in/out, give full credit
                if (attendance.clockIn) {
                    attendance.status = "Paid Half Leave";
                    attendance.credits = 1; // Present + Paid Half Leave = 1 Credit
                } else {
                    attendance.status = "Paid Half Leave";
                    attendance.credits = 0.5; // Just Paid Half Leave = 0.5 Credit
                }
            } else {
                // Unpaid Half Leave
                if (attendance.clockIn) {
                    attendance.status = "Unpaid Half Leave";
                    attendance.credits = 0.5; // Present + Unpaid Half Leave = 0.5 Credit
                } else {
                    attendance.status = "Unpaid Half Leave";
                    attendance.credits = 0; // Just Unpaid Half Leave = 0 Credit
                }
            }
            return;
        } else {
            // Full day leave
            if (existingLeave.useLeaveBalance) {
                attendance.status = "Paid Leave";
                attendance.credits = 1; // Paid Leave = 1 Credit
            } else {
                attendance.status = "Unpaid Leave";
                attendance.credits = 0; // Unpaid Leave = 0 Credit
            }
            return;
        }
    }
    
    // 4. Regular weekday attendance scenarios
    if (attendance.clockIn) {
        if (!attendance.clockOut) {
            // Incomplete attendance (clocked in but not out)
            attendance.status = "Incomplete Attendance";
            attendance.credits = 0.5; // Incomplete Attendance = 0.5 Credit
        } else {
            // Complete attendance (clocked in and out)
            attendance.status = "Present";
            attendance.credits = 1; // Present = 1 Credit
        }
    } else {
        // No attendance record for a weekday
        attendance.status = "Absent";
        attendance.credits = 0; // Absent = 0 Credit
    }
};

export const clockIn = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is missing." });
        }

        const { workLocation, location } = req.body;

        // Handle Remote Employees: Capture location
        if (workLocation === "Remote" && !location) {
            return res.status(400).json({ success: false, error: "Location is required for remote employees." });
        }

        // Handle Onsite Employees: Validate if inside geofencing area
        if (workLocation === "Onsite") {
            if (!location || !location.latitude || !location.longitude) {
                return res.status(400).json({ success: false, error: "Location data is required for onsite check-in." });
            }

            const isInside = checkGeoFence(location.latitude, location.longitude);

            if (!isInside) {
                return res.status(400).json({ success: false, error: "You are not within the allowed geofencing area." });
            }
        }

        // Create today's date in UTC
        const today = new Date();
        const todayUTC = new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate()
        ));

        const tomorrowUTC = new Date(todayUTC);
        tomorrowUTC.setUTCDate(todayUTC.getUTCDate() + 1);

        // Check if already clocked in
        const existingAttendance = await Attendance.findOne({ 
            userId, 
            date: { $gte: todayUTC, $lt: tomorrowUTC } 
        });

        if (existingAttendance) {
            return res.status(400).json({ success: false, error: "Already clocked in for today." });
        }

        // Check for any approved leave for today
        const existingLeave = await Leave.findOne({
            userId,
            status: "Approved",
            startDate: { $lte: todayUTC },
            endDate: { $gte: todayUTC }
        });

        // If there's a full-day approved leave, don't allow clock-in
        if (existingLeave && existingLeave.leaveType !== "Half Leave") {
            return res.status(400).json({ 
                success: false, 
                error: "Cannot clock in during an approved leave period." 
            });
        }

        // Get team info from Employee collection
        const employee = await Employee.findOne({ userId }).populate("teamId");

        // Check if today is a weekend or holiday
        const dayOfWeek = todayUTC.getUTCDay();
        const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6; // Sunday (0) or Saturday (6)
        const isHolidayDay = await isHoliday(todayUTC);

        const newAttendance = new Attendance({
            userId,
            teamId: employee?.teamId?._id || null,
            date: todayUTC,
            clockIn: new Date(),
            status: "Present", // Initial status, will be updated on approval
            workLocation: workLocation,
            location: {
                accuracy: location.accuracy,
                latitude: location.latitude,
                longitude: location.longitude,
                altitude: location.altitude,
                altitudeAccuracy: location.altitudeAccuracy,
                heading: location.heading,
                speed: location.speed
            },
            role: req.user.role,
            isWeekend: isWeekendDay,
            isHoliday: isHolidayDay,
            leaveId: existingLeave ? existingLeave._id : null,
        });

        // If it's a half-day leave, mark as half-day in attendance
        if (existingLeave && existingLeave.leaveType === "Half Leave") {
            newAttendance.isHalfDay = true;
        }

        // Calculate initial credits
        await calculateCredits(newAttendance, existingLeave);

        await newAttendance.save();
        logger.info(`User ${userId} successfully clocked in at ${new Date().toISOString()}`);
        return res.status(200).json({ success: true, attendance: newAttendance });
    } catch (error) {
        logger.error(`Error during clock-in: ${error.message}`);
        console.error("Error during clock-in:", error);
        return res.status(500).json({ success: false, error: "Failed to clock in." });
    }
};

export const clockOut = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is missing." });
        }

        const { tasksDone } = req.body;

        if (!tasksDone) {
            return res.status(400).json({ success: false, error: "Tasks done must be provided for clock-out." });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            userId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
        });

        if (!attendance) {
            return res.status(404).json({ success: false, error: "No clock-in record found for today." });
        }

        if (attendance.clockOut) {
            logger.info(`User ${userId} attempted to clock out but was already clocked out at ${new Date().toISOString()}`);
            return res.status(400).json({ success: false, error: "Clock-out already recorded for today." });
        }

        attendance.clockOut = new Date();
        attendance.tasksDone = tasksDone;
        
        // Check for any approved leave for today
        const existingLeave = await Leave.findOne({
            userId,
            status: "Approved",
            startDate: { $lte: today },
            endDate: { $gte: today }
        });

        // Recalculate credits based on complete attendance
        await calculateCredits(attendance, existingLeave);

        await attendance.save();
        logger.info(`User ${userId} clocked out at ${new Date().toISOString()}. Hours worked: ${attendance.hoursWorked}`);
        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        logger.error(`Error during clock-out for user ${req.user?._id}: ${error.message}`);
        console.error("Error during clock-out:", error);
        return res.status(500).json({ success: false, error: "Failed to clock out." });
    }
};

export const approveAttendance = async (req, res) => {
    try {
        const { attendanceId, approvalStatus } = req.body;
        const userId = req.user._id;
        const userRole = req.user.role;

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) {
            return res.status(404).json({ success: false, error: "Attendance record not found." });
        }

        // Check if the user is authorized
        if (!["manager", "admin"].includes(userRole)) {
            return res.status(403).json({ success: false, error: "Unauthorized action." });
        }

        // Update approval status based on the role
        if (userRole === "manager") {
            attendance.managerApproval = approvalStatus === "Approved";
        } else if (userRole === "admin") {
            attendance.adminApproval = approvalStatus === "Approved";
        }

        // Append comment history
        const approvalComment = `Attendance ${approvalStatus} by ${req.user.name} (${userRole}) on ${new Date().toLocaleString()}`;
        attendance.comments = attendance.comments ? `${attendance.comments}\n${approvalComment}` : approvalComment;

        attendance.approvedBy = userId;
        attendance.approvalStatus = approvalStatus;

        // Find any leave for this day to properly calculate credits
        const attendanceDate = new Date(attendance.date);
        const existingLeave = await Leave.findOne({
            userId: attendance.userId,
            status: "Approved",
            startDate: { $lte: attendanceDate },
            endDate: { $gte: attendanceDate }
        });

        // Recalculate credits based on approved status
        if (approvalStatus === "Approved") {
            await calculateCredits(attendance, existingLeave);
        } else if (approvalStatus === "Rejected") {
            // If rejected, set credits to 0
            attendance.credits = 0;
            attendance.status = "Rejected";
        }

        await attendance.save();
        logger.info(`User ${userId} successfully processed attendance approval at ${new Date().toISOString()}`);
        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        logger.error(`Error approving attendance ${req.body?.attendanceId} by user ${req.user?._id}: ${error.message}`);
        console.error("Error during attendance approval:", error);
        return res.status(500).json({ success: false, error: "Failed to approve attendance." });
    }
};

// Function to create attendance records for approved leaves
export const createAttendanceForLeave = async (leave) => {
    try {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        
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
            
            if (!existingAttendance) {
                // Get employee info for team assignment
                const employee = await Employee.findOne({ userId: leave.userId });
                
                // Check if the day is a weekend or holiday
                const isWeekendDay = isWeekend(dateUTC);
                const isHolidayDay = await isHoliday(dateUTC);
                
                let leaveStatus, leaveCredits;
                
                // Handle sandwich leave case for unpaid leaves
                if (!leave.useLeaveBalance && (isWeekendDay || isHolidayDay)) {
                    // If unpaid leave covers a weekend/holiday, mark as Absent (sandwich rule)
                    leaveStatus = "Absent";
                    leaveCredits = 0;
                } else if (isWeekendDay || isHolidayDay) {
                    // If it's a weekend/holiday, mark as Weekly Off
                    leaveStatus = "Weekly Off";
                    leaveCredits = 1;
                } else {
                    // Normal leave day
                    if (leave.leaveType === "Half Leave") {
                        if (leave.useLeaveBalance) {
                            leaveStatus = "Paid Half Leave";
                            leaveCredits = 0.5;
                        } else {
                            leaveStatus = "Unpaid Half Leave";
                            leaveCredits = 0;
                        }
                    } else {
                        if (leave.useLeaveBalance) {
                            leaveStatus = "Paid Leave";
                            leaveCredits = 1;
                        } else {
                            leaveStatus = "Unpaid Leave";
                            leaveCredits = 0;
                        }
                    }
                }
                
                // Create attendance record for the leave day
                const newAttendance = new Attendance({
                    userId: leave.userId,
                    teamId: employee?.teamId || null,
                    date: dateUTC,
                    status: leaveStatus,
                    credits: leaveCredits,
                    approvalStatus: "Approved", // Auto-approved since leave is approved
                    role: "employee", // Assuming leaves are for employees
                    isWeekend: isWeekendDay,
                    isHoliday: isHolidayDay,
                    leaveId: leave._id,
                    isHalfDay: leave.leaveType === "Half Leave",
                    useLeaveBalance: leave.useLeaveBalance,
                    approvedBy: leave.approvedBy,
                    adminApproval: true, // Auto-approved
                    comments: `Automatically created for approved leave: ${leave._id}`
                });
                
                await newAttendance.save();
                logger.info(`Attendance record created for leave ID ${leave._id} on date ${dateUTC.toISOString()}`);
            } else if (leave.leaveType === "Half Leave") {
                // If it's a half-day leave and attendance already exists, update it
                existingAttendance.isHalfDay = true;
                existingAttendance.leaveId = leave._id;
                
                if (leave.useLeaveBalance) {
                    // For paid half-day leave with attendance, award full credit
                    existingAttendance.status = "Paid Half Leave";
                    existingAttendance.credits = 1; // Full credit for half-day + attendance
                } else {
                    // For unpaid half-day leave with attendance, award half credit
                    existingAttendance.status = "Unpaid Half Leave";
                    existingAttendance.credits = 0.5; // Half credit for attendance only
                }
                
                await existingAttendance.save();
                logger.info(`Attendance record updated for half-day leave ID ${leave._id} on date ${dateUTC.toISOString()}`);
            }
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return true;
    } catch (error) {
        logger.error(`Error creating attendance records for leave: ${error.message}`);
        console.error("Error creating attendance for leave:", error);
        return false;
    }
};

export const getAttendanceReports = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: "Start and end dates are required"
            });
        }

        const startDateObj = new Date(startDate + 'T00:00:00.000Z');
        const endDateObj = new Date(endDate + 'T23:59:59.999Z');

        // Get holidays within the date range
        const holidays = await Holiday.find({
            date: {
                $gte: startDateObj,
                $lte: endDateObj
            }
        });

        const dateQuery = {
            date: {
                $gte: startDateObj,
                $lte: endDateObj
            }
        };

        // Modified to include UserProfile in the lookup and include credits
        const attendanceRecords = await Attendance.aggregate([
            { $match: dateQuery },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $lookup: {
                    from: "userprofiles",
                    localField: "userId",
                    foreignField: "userId",
                    as: "userProfileDetails"
                }
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "userId",
                    foreignField: "userId",
                    as: "employeeDetails"
                }
            },
            {
                $lookup: {
                    from: "managers",
                    localField: "userId",
                    foreignField: "userId",
                    as: "managerDetails"
                }
            },
            {
                $lookup: {
                    from: "teams",
                    localField: "teamId",
                    foreignField: "_id",
                    as: "teamDetails"
                }
            },
            {
                $lookup: {
                    from: "departments",
                    let: {
                        empDeptId: { $arrayElemAt: ["$employeeDetails.department", 0] },
                        mgrDeptId: { $arrayElemAt: ["$managerDetails.department", 0] }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ["$_id", "$$empDeptId"] },
                                        { $eq: ["$_id", "$$mgrDeptId"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "departmentDetails"
                }
            },
            {
                $lookup: {
                    from: "leaves",
                    localField: "leaveId",
                    foreignField: "_id",
                    as: "leaveDetails"
                }
            }
        ]);

        const userAttendanceMap = {};
        const workingDays = new Set();

        // Calculate total working days excluding holidays and weekends
        let currentDate = new Date(startDateObj);
        while (currentDate <= endDateObj) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayOfWeek = currentDate.getDay();
            const isHoliday = holidays.some(h => h.date.toISOString().split('T')[0] === dateStr);
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            if (!isHoliday && !isWeekend) {
                workingDays.add(dateStr);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Create users attendance data and calculate total credits
        attendanceRecords.forEach(record => {
            const dateStr = record.date.toISOString().split('T')[0];
            const userRole = record.userDetails[0]?.role;

            if (!userAttendanceMap[record.userId]) {
                userAttendanceMap[record.userId] = {
                    name: record.userDetails[0]?.name,
                    role: userRole,
                    team: record.teamDetails[0]?.name || 'N/A',
                    department: record.departmentDetails[0]?.dep_name || 'N/A',
                    attendance: {},
                    stats: {
                        totalPresent: 0,
                        totalAbsent: 0,
                        totalHalfDay: 0,
                        totalLeave: 0,
                        totalPaidLeave: 0,
                        totalUnpaidLeave: 0,
                        totalExtraWork: 0,
                        totalIncompleteAttendance: 0,
                        totalWeeklyOff: 0,
                        totalHoursWorked: 0,
                        totalCredits: 0
                    }
                };
            }

            const status = record.approvalStatus === 'Approved'
                ? record.status
                : 'Pending';

            userAttendanceMap[record.userId].attendance[dateStr] = {
                status,
                hoursWorked: record.hoursWorked || 0,
                isHoliday: record.isHoliday || holidays.some(h => h.date.toISOString().split('T')[0] === dateStr),
                isWeekend: record.isWeekend,
                credits: record.credits || 0
            };

            // Update statistics based on status
            if (status === 'Present') userAttendanceMap[record.userId].stats.totalPresent++;
            if (status === 'Absent') userAttendanceMap[record.userId].stats.totalAbsent++;
            if (status === 'Paid Leave' || status === 'Paid Half Leave') {
                userAttendanceMap[record.userId].stats.totalPaidLeave++;
                userAttendanceMap[record.userId].stats.totalLeave++;
            }
            if (status === 'Unpaid Leave' || status === 'Unpaid Half Leave') {
                userAttendanceMap[record.userId].stats.totalUnpaidLeave++;
                userAttendanceMap[record.userId].stats.totalLeave++;
            }
            if (status === 'Extra Work') userAttendanceMap[record.userId].stats.totalExtraWork++;
            if (status === 'Incomplete Attendance') userAttendanceMap[record.userId].stats.totalIncompleteAttendance++;
            if (status === 'Weekly Off') userAttendanceMap[record.userId].stats.totalWeeklyOff++;
            if (record.isHalfDay) userAttendanceMap[record.userId].stats.totalHalfDay++;
            
            userAttendanceMap[record.userId].stats.totalHoursWorked += record.hoursWorked || 0;
            userAttendanceMap[record.userId].stats.totalCredits += record.credits || 0;
        });

        // Check for any missing days and count as absent with 0 credits
        Object.values(userAttendanceMap).forEach(user => {
            workingDays.forEach(dateStr => {
                if (!user.attendance[dateStr]) {
                    user.attendance[dateStr] = {
                        status: 'Absent',
                        hoursWorked: 0,
                        isHoliday: false,
                        isWeekend: false,
                        credits: 0
                    };
                    user.stats.totalAbsent++;
                }
            });

            // Calculate other statistics
            const totalWorkingDays = workingDays.size;
            user.stats.workingDays = totalWorkingDays;
            user.stats.attendancePercentage = ((user.stats.totalPresent + (user.stats.totalHalfDay * 0.5)) / totalWorkingDays * 100).toFixed(2);
            user.stats.avgHoursPerDay = (user.stats.totalHoursWorked / user.stats.totalPresent || 0).toFixed(2);
            user.stats.creditsPercentage = ((user.stats.totalCredits) / (totalWorkingDays + user.stats.totalExtraWork) * 100).toFixed(2);
        });

        // Generate date range for the report
        const dateRange = [];
        currentDate = new Date(startDateObj);
        while (currentDate <= endDateObj) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayOfWeek = currentDate.getDay();
            dateRange.push({
                date: dateStr,
                dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
                isHoliday: holidays.some(h => h.date.toISOString().split('T')[0] === dateStr),
                isWeekend: dayOfWeek === 0 || dayOfWeek === 6
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Group users by role
        const usersByRole = Object.values(userAttendanceMap).reduce((acc, user) => {
            if (!acc[user.role]) acc[user.role] = [];
            acc[user.role].push(user);
            return acc;
        }, {});

        return res.status(200).json({
            success: true,
            data: {
                dateRange,
                usersByRole,
                holidays,
                periodInfo: {
                    startDate: startDateObj.toISOString().split('T')[0],
                    endDate: endDateObj.toISOString().split('T')[0],
                    totalDays: dateRange.length,
                    totalHolidays: holidays.length,
                    workingDays: workingDays.size
                }
            }
        });
    } catch (error) {
        console.error("Error in getAttendanceReports:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to generate attendance reports"
        });
    }
};

export const getCurrentStatus = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is missing." });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's attendance
        const todayAttendance = await Attendance.findOne({
            userId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        // Check for holiday
        const holiday = await Holiday.findOne({
            date: {
                $gte: today,
                $lt: tomorrow
            },
            $or: [
                { isCompanyWide: true },
                { applicableDepartments: req.user.department }
            ]
        });

        // Get employee details for team info
        // Using UserProfile + Employee to ensure we get the team info
        const userProfile = await UserProfile.findOne({ userId });
        let teamId = null;
        
        // If we still need teamId, we need to query Employee collection
        if (!teamId) {
            const employee = await Employee.findOne({ userId }).populate('teamId');
            teamId = employee?.teamId?._id || null;
        }

        const response = {
            success: true,
            isHoliday: !!holiday,
            holidayDetails: holiday,
            attendance: todayAttendance,
            status: !todayAttendance ? 'not-started' :
                todayAttendance.clockOut ? 'completed' : 'clocked-in',
            teamId: teamId
        };
        
        logger.info(`User ${userId} checked attendance status.`);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(`Error fetching current status for user ${req.user?._id}: ${error.message}`);
        console.error("Error fetching current status:", error);
        return res.status(500).json({ success: false, error: "Failed to fetch current status." });
    }
};





export const getMonthlyAttendance = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { month, year } = req.query;

        if (!userId || !month || !year) {
            return res.status(400).json({
                success: false,
                error: "Missing required parameters"
            });
        }

        // Create dates in UTC to avoid timezone issues
        const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

        const attendance = await Attendance.find({
            userId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: 1 });

        // Get holidays for the month
        const holidays = await Holiday.find({
            date: {
                $gte: startDate,
                $lte: endDate
            },
            $or: [
                { isCompanyWide: true },
                { applicableDepartments: req.user.department }
            ]
        });

        // Create a map of attendance records
        const attendanceMap = {};

        // Initialize each day of the month
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);
            const dateStr = currentDate.toISOString().split('T')[0];

            // Get day of week in local time (0 = Sunday, 6 = Saturday)
            const dayOfWeek = currentDate.getUTCDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

            const holiday = holidays.find(h =>
                new Date(h.date).toISOString().split('T')[0] === dateStr
            );

            attendanceMap[dateStr] = {
                date: currentDate,
                isWeekend,
                isHoliday: !!holiday,
                holidayName: holiday?.name || null,
                attendance: null
            };
        }

        // Populate attendance records
        attendance.forEach(record => {
            const dateStr = new Date(record.date).toISOString().split('T')[0];
            if (attendanceMap[dateStr]) {
                attendanceMap[dateStr].attendance = {
                    _id: record._id,
                    clockIn: record.clockIn,
                    clockOut: record.clockOut,
                    status: record.status,
                    approvalStatus: record.approvalStatus,
                    hoursWorked: record.hoursWorked,
                    tasksDone: record.tasksDone,
                    managerApproval: record.managerApproval,
                    adminApproval: record.adminApproval,
                    comments: record.comments,
                    workLocation: record.workLocation
                };
            }
        });

        return res.status(200).json({
            success: true,
            attendance: attendanceMap
        });

    } catch (error) {
        console.error("Error fetching monthly attendance:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch monthly attendance"
        });
    }
};


// Fetch Attendance for a User
export const getMyAttendance = async (req, res) => {
    try {
        const { userId } = req.user;
        const { startDate, endDate } = req.query;

        const query = { userId };
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const attendance = await Attendance.find(query)
            .select("clockIn clockOut status approvalStatus managerApproval adminApproval hoursWorked tasksDone workLocation comments")
            .sort({ date: -1 });
        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.error("Error fetching user's attendance:", error);
        return res.status(500).json({ success: false, error: "Failed to fetch attendance." });
    }
};

export const getTeamAttendance = async (req, res) => {
    try {
        const { date } = req.query;
        const managerId = req.user._id; // Get logged-in manager's ID

        // Get the manager's teams - still need to use Manager collection for teams
        const manager = await Manager.findOne({ userId: managerId });
        if (!manager) {
            return res.status(404).json({
                success: false,
                error: "Manager not found"
            });
        }

        // Create date range for the selected date
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Find attendance records for employees in manager's teams
        const attendance = await Attendance.find({
            teamId: { $in: manager.teams }, // Filter by manager's team IDs
            date: {
                $gte: queryDate,
                $lt: nextDay
            },
            role: "employee" // Only get employee attendance, not managers
        }).populate([
            {
                path: "userId",
                select: "name email" // Include user details
            },
            {
                path: "teamId",
                select: "name" // Include team name
            }
        ]).sort({ "userId.name": 1 }); // Sort by employee name

        // Group attendance by team
        const groupedAttendance = attendance.reduce((acc, record) => {
            const teamName = record.teamId?.name || "Unassigned";
            if (!acc[teamName]) {
                acc[teamName] = [];
            }
            acc[teamName].push(record);
            return acc;
        }, {});

        return res.status(200).json({
            success: true,
            attendance: attendance,
            groupedAttendance: groupedAttendance
        });

    } catch (error) {
        console.error("Error in getTeamAttendance:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch team attendance"
        });
    }
};

export const getAttendanceSummary = async (req, res) => {
    try {
        const { date } = req.query;

        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);

        const summary = await Attendance.aggregate([
            {
                $match: {
                    date: {
                        $gte: queryDate,
                        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
                    },
                },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        return res.status(200).json({ success: true, summary });
    } catch (error) {
        console.error("Error fetching attendance summary:", error);
        return res.status(500).json({ success: false, error: "Failed to fetch summary." });
    }
};

export const getAllAttendance = async (req, res) => {
    try {
        const { date } = req.query;

        // Create date range
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Get all attendance records for the date
        const attendance = await Attendance.find({
            date: {
                $gte: queryDate,
                $lt: nextDay
            }
        }).populate([
            {
                path: "userId",
                select: "name email" // Include basic user details
            },
            {
                path: "teamId",
                select: "name" // Include team name
            }
        ]).sort({ "userId.name": 1 });

        return res.status(200).json({
            success: true,
            attendance
        });
    } catch (error) {
        console.error("Error in getAllAttendance:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch attendance records"
        });
    }
};

