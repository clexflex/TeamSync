/**
 * Adjusts a date to respect the user's timezone boundaries
 * @param {Date} date - The date to adjust
 * @param {string} timezone - User's timezone
 * @param {boolean} setToEndOfDay - If true, sets time to 23:59:59.999, otherwise 00:00:00.000
 * @returns {Date} Adjusted date in UTC that represents the start/end of the user's local day
 */
const adjustDateForTimezone = (date, timezone, setToEndOfDay = false) => {
    if (!timezone) return date;
    
    try {
        // Convert the input date to user's timezone
        const userDateString = date.toLocaleString('en-US', { timeZone: timezone });
        const userDate = new Date(userDateString);
        
        // Get the date components in user's timezone
        const year = userDate.getFullYear();
        const month = userDate.getMonth();
        const day = userDate.getDate();
        
        let localDate;
        
        if (setToEndOfDay) {
            // End of day in user's timezone
            localDate = new Date(year, month, day, 23, 59, 59, 999);
        } else {
            // Start of day in user's timezone
            localDate = new Date(year, month, day, 0, 0, 0, 0);
        }
        
        // Convert local date to UTC
        const utcDate = new Date(localDate.toLocaleString('en-US', { timeZone: 'UTC' }));
        
        // Calculate the offset and adjust
        const timezoneOffset = localDate.getTime() - utcDate.getTime();
        return new Date(localDate.getTime() - timezoneOffset);
    } catch (error) {
        logger.error(`Error adjusting date for timezone: ${error.message}`);
        return date;
    }
};
  
  /**
   * Convert UTC date to user's local date representation for display
   * @param {Date} date - UTC date to convert
   * @param {string} timezone - User's timezone
   * @returns {string} Formatted date string in user's timezone
   */
  const formatDateInTimezone = (date, timezone) => {
    if (!date) return '';
    
    try {
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      logger.error(`Error formatting date in timezone: ${error.message}`);
      return date.toISOString().split('T')[0];
    }
  };
  
  /**
   * Check if a date is a weekend in the user's timezone
   * @param {Date} date - Date to check
   * @param {string} timezone - User's timezone
   * @returns {boolean} True if date is a weekend in user's timezone
   */
  const isWeekendInTimezone = (date, timezone) => {
    try {
      const dayOfWeek = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
        .getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    } catch (error) {
      logger.error(`Error checking weekend in timezone: ${error.message}`);
      return isWeekend(date); // Fall back to regular function
    }
  };

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

// Updated clockIn function in attendanceController.js
export const clockIn = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is missing." });
        }

        const { workLocation, location, timezone } = req.body;

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

        // Get current user time based on their timezone
        let userLocalDate = new Date();
        
        // If timezone is provided, use it to calculate user's local date
        if (timezone) {
            // Create user's local date based on their timezone
            userLocalDate = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
            logger.info(`Using user timezone ${timezone}, local date: ${userLocalDate.toISOString()}`);
        }

        // Create the start and end of day in user's local time, then convert to UTC for DB queries
        const userLocalStartOfDay = new Date(
            userLocalDate.getFullYear(),
            userLocalDate.getMonth(),
            userLocalDate.getDate(),
            0, 0, 0, 0
        );
        
        const userLocalEndOfDay = new Date(
            userLocalDate.getFullYear(),
            userLocalDate.getMonth(),
            userLocalDate.getDate(),
            23, 59, 59, 999
        );

        // Convert to UTC for database query
        const userLocalStartOfDayUTC = new Date(userLocalStartOfDay.toISOString());
        const userLocalEndOfDayUTC = new Date(userLocalEndOfDay.toISOString());

        logger.info(`User local day boundaries: ${userLocalStartOfDayUTC.toISOString()} to ${userLocalEndOfDayUTC.toISOString()}`);

        // Check if already clocked in for the user's current day
        const existingAttendance = await Attendance.findOne({
            userId,
            date: { 
                $gte: userLocalStartOfDayUTC, 
                $lt: userLocalEndOfDayUTC 
            }
        });

        if (existingAttendance) {
            return res.status(400).json({ success: false, error: "Already clocked in for today." });
        }

        // Check for any approved leave for the user's current day
        const existingLeave = await Leave.findOne({
            userId,
            status: "Approved",
            startDate: { $lte: userLocalStartOfDayUTC },
            endDate: { $gte: userLocalStartOfDayUTC }
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

        // Check if today is a weekend or holiday in user's local time
        const dayOfWeek = userLocalDate.getDay();
        const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6; // Sunday (0) or Saturday (6)
        const isHolidayDay = await isHoliday(userLocalStartOfDayUTC);

        // Create attendance record with the current local date converted to UTC
        // Store the date as the beginning of the user's day in UTC
        const newAttendance = new Attendance({
            userId,
            teamId: employee?.teamId?._id || null,
            date: userLocalStartOfDayUTC, // Store the date as the start of user's local day in UTC
            clockIn: new Date(), // Current UTC time
            status: "Present", // Initial status, will be updated on approval
            workLocation: workLocation,
            location: location ? {
                accuracy: location.accuracy,
                latitude: location.latitude,
                longitude: location.longitude,
                altitude: location.altitude,
                altitudeAccuracy: location.altitudeAccuracy,
                heading: location.heading,
                speed: location.speed
            } : undefined,
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
        
        // Handle socket notifications
        if (req.io) {
            const eventData = {
                type: 'clock-in',
                userId: userId.toString(),
                userName: req.user.name,
                attendance: newAttendance,
                timestamp: new Date()
            };

            // Emit to admins and managers
            req.io.to('role:admin').emit('attendance_update', eventData);
            req.io.to('role:manager').emit('attendance_update', eventData);

            // Also emit to the user themselves
            req.io.to(`user:${userId}`).emit('attendance_update', eventData);

            logger.info(`Emitted attendance_update (clock-in) for user ${userId}`);
        }
        
        logger.info(`User ${userId} successfully clocked in at ${new Date().toISOString()}, local time: ${userLocalDate.toISOString()}`);
        return res.status(200).json({ success: true, attendance: newAttendance });
    } catch (error) {
        logger.error(`Error during clock-in: ${error.message}`);
        console.error("Error during clock-in:", error);
        return res.status(500).json({ success: false, error: "Failed to clock in." });
    }
};

// Updated clockOut function with timezone support
export const clockOut = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is missing." });
        }

        const { tasksDone, timezone } = req.body;

        if (!tasksDone) {
            return res.status(400).json({ success: false, error: "Tasks done must be provided for clock-out." });
        }

        // Get current user time based on their timezone
        let userLocalDate = new Date();
        
        // If timezone is provided, use it to calculate user's local date
        if (timezone) {
            // Create user's local date based on their timezone
            userLocalDate = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
            logger.info(`Using user timezone ${timezone}, local date: ${userLocalDate.toISOString()}`);
        }

        // Create the start and end of day in user's local time, then convert to UTC for DB queries
        const userLocalStartOfDay = new Date(
            userLocalDate.getFullYear(),
            userLocalDate.getMonth(),
            userLocalDate.getDate(),
            0, 0, 0, 0
        );
        
        const userLocalEndOfDay = new Date(
            userLocalDate.getFullYear(),
            userLocalDate.getMonth(),
            userLocalDate.getDate(),
            23, 59, 59, 999
        );

        // Convert to UTC for database query
        const userLocalStartOfDayUTC = new Date(userLocalStartOfDay.toISOString());
        const userLocalEndOfDayUTC = new Date(userLocalEndOfDay.toISOString());

        const attendance = await Attendance.findOne({
            userId,
            date: {
                $gte: userLocalStartOfDayUTC,
                $lt: userLocalEndOfDayUTC,
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
            startDate: { $lte: userLocalStartOfDayUTC },
            endDate: { $gte: userLocalStartOfDayUTC }
        });

        // Recalculate credits based on complete attendance
        await calculateCredits(attendance, existingLeave);

        await attendance.save();
        
        // Handle socket notifications
        if (req.io) {
            const eventData = {
                type: 'clock-out',
                userId: userId.toString(),
                userName: req.user.name,
                attendance: attendance,
                timestamp: new Date()
            };

            // Emit to admins and managers
            req.io.to('role:admin').emit('attendance_update', eventData);
            req.io.to('role:manager').emit('attendance_update', eventData);

            // Also emit to the user themselves
            req.io.to(`user:${userId}`).emit('attendance_update', eventData);

            logger.info(`Emitted attendance_update (clock-out) for user ${userId}`);
        }
        
        logger.info(`User ${userId} clocked out at ${new Date().toISOString()}, local time: ${userLocalDate.toISOString()}. Hours worked: ${attendance.hoursWorked}`);
        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        logger.error(`Error during clock-out for user ${req.user?._id}: ${error.message}`);
        console.error("Error during clock-out:", error);
        return res.status(500).json({ success: false, error: "Failed to clock out." });
    }
};

// Update getCurrentStatus to respect user's timezone
export const getCurrentStatus = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is missing." });
        }

        const { timezone } = req.query;

        // Get current user time based on their timezone
        let userLocalDate = new Date();
        
        // If timezone is provided, use it to calculate user's local date
        if (timezone) {
            // Create user's local date based on their timezone
            userLocalDate = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
            logger.info(`Using user timezone ${timezone}, local date: ${userLocalDate.toISOString()}`);
        }

        // Create the start and end of day in user's local time, then convert to UTC for DB queries
        const userLocalStartOfDay = new Date(
            userLocalDate.getFullYear(),
            userLocalDate.getMonth(),
            userLocalDate.getDate(),
            0, 0, 0, 0
        );
        
        const userLocalEndOfDay = new Date(
            userLocalDate.getFullYear(),
            userLocalDate.getMonth(),
            userLocalDate.getDate(),
            23, 59, 59, 999
        );

        // Convert to UTC for database query
        const userLocalStartOfDayUTC = new Date(userLocalStartOfDay.toISOString());
        const userLocalEndOfDayUTC = new Date(userLocalEndOfDay.toISOString());

        // Get today's attendance based on user's local day
        const todayAttendance = await Attendance.findOne({
            userId,
            date: {
                $gte: userLocalStartOfDayUTC,
                $lt: userLocalEndOfDayUTC
            }
        });

        // Check for holiday
        const holiday = await Holiday.findOne({
            date: {
                $gte: userLocalStartOfDayUTC,
                $lt: userLocalEndOfDayUTC
            },
            $or: [
                { isCompanyWide: true },
                { applicableDepartments: req.user.department }
            ]
        });

        // Get employee details for team info
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
            teamId: teamId,
            userLocalDate: userLocalDate.toISOString()
        };

        logger.info(`User ${userId} checked attendance status. Local date: ${userLocalDate.toISOString()}`);
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
        const { month, year, timezone } = req.query;

        if (!userId || !month || !year) {
            return res.status(400).json({
                success: false,
                error: "Missing required parameters"
            });
        }

        // Create date range for the month in user's timezone
        let startDate, endDate;

        if (timezone) {
            // Create start and end dates for the month in user's timezone
            const userLocalStartDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const userLocalEndDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
            
            // Adjust for timezone
            startDate = adjustDateForTimezone(userLocalStartDate, timezone, false);
            endDate = adjustDateForTimezone(userLocalEndDate, timezone, true);
        } else {
            // Fallback to UTC if no timezone provided
            startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0));
            endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59));
        }

        logger.info(`Fetching monthly attendance for ${userId} from ${startDate.toISOString()} to ${endDate.toISOString()}, timezone: ${timezone}`);

        // Find all attendance records for the user in this month
        const attendance = await Attendance.find({
            userId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: 1 });

        logger.info(`Found ${attendance.length} attendance records`);

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

        // Create a map of attendance records with dates in user's timezone
        const attendanceMap = {};

        // Initialize each day of the month
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            // Format the date in user's timezone for consistent display
            const userLocalDateStr = currentDate.toLocaleDateString('en-US', {
                timeZone: timezone || 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).split('/');
            
            // Format as YYYY-MM-DD
            const localDateStr = `${userLocalDateStr[2]}-${userLocalDateStr[0].padStart(2, '0')}-${userLocalDateStr[1].padStart(2, '0')}`;
            
            // Get day of week in user's timezone
            const dayOfWeek = currentDate.toLocaleDateString('en-US', {
                timeZone: timezone || 'UTC',
                weekday: 'long'
            });
            const isWeekend = ['Saturday', 'Sunday'].includes(dayOfWeek);

            // Check if it's a holiday
            const holiday = holidays.find(h => {
                const holidayDateStr = h.date.toLocaleDateString('en-US', {
                    timeZone: timezone || 'UTC',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).split('/');
                const holidayLocalDateStr = `${holidayDateStr[2]}-${holidayDateStr[0].padStart(2, '0')}-${holidayDateStr[1].padStart(2, '0')}`;
                return holidayLocalDateStr === localDateStr;
            });

            // Store attendance data for this day
            attendanceMap[localDateStr] = {
                date: currentDate,
                isWeekend,
                isHoliday: !!holiday,
                holidayName: holiday?.name || null,
                attendance: null // Will be populated below
            };

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Populate attendance records
        for (const record of attendance) {
            // Convert the attendance date to user's local date string
            const recordLocalDateStr = new Date(record.date).toLocaleDateString('en-US', {
                timeZone: timezone || 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).split('/');
            
            const localDateStr = `${recordLocalDateStr[2]}-${recordLocalDateStr[0].padStart(2, '0')}-${recordLocalDateStr[1].padStart(2, '0')}`;
            
            // Add the attendance record to the correct date
            if (attendanceMap[localDateStr]) {
                attendanceMap[localDateStr].attendance = {
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
                    workLocation: record.workLocation,
                    date: record.date // Keep the original date for reference
                };
            }
        }

        // Special handling for today
        const today = new Date();
        const todayLocalStr = today.toLocaleDateString('en-US', {
            timeZone: timezone || 'UTC',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).split('/');
        const todayStr = `${todayLocalStr[2]}-${todayLocalStr[0].padStart(2, '0')}-${todayLocalStr[1].padStart(2, '0')}`;
        
        if (attendanceMap[todayStr]) {
            // Get today's attendance directly if not already present
            if (!attendanceMap[todayStr].attendance) {
                const todayAttendance = await Attendance.findOne({
                    userId,
                    date: {
                        $gte: adjustDateForTimezone(new Date(today.setHours(0, 0, 0, 0)), timezone, false),
                        $lt: adjustDateForTimezone(new Date(today.setHours(23, 59, 59, 999)), timezone, true)
                    }
                });
                
                if (todayAttendance) {
                    logger.info(`Found today's attendance with ID ${todayAttendance._id}`);
                    attendanceMap[todayStr].attendance = {
                        _id: todayAttendance._id,
                        clockIn: todayAttendance.clockIn,
                        clockOut: todayAttendance.clockOut,
                        status: todayAttendance.status,
                        approvalStatus: todayAttendance.approvalStatus,
                        hoursWorked: todayAttendance.hoursWorked,
                        tasksDone: todayAttendance.tasksDone,
                        managerApproval: todayAttendance.managerApproval,
                        adminApproval: todayAttendance.adminApproval,
                        comments: todayAttendance.comments,
                        workLocation: todayAttendance.workLocation,
                        date: todayAttendance.date
                    };
                }
            }
        }

        return res.status(200).json({
            success: true,
            attendance: attendanceMap
        });

    } catch (error) {
        logger.error(`Error fetching monthly attendance: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch monthly attendance"
        });
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
            attendance.approvalStatus = "Rejected";
        }

        await attendance.save();
        // Add this before the return statement in the approveAttendance function
        if (req.io) {
            // Get the user name for the attendance record
            const attendanceUser = await User.findById(attendance.userId);

            const eventData = {
                type: 'approval_status',
                userId: attendance.userId.toString(),
                userName: attendanceUser?.name || "Employee",
                approvedBy: req.user.name,
                status: approvalStatus,
                attendance: attendance,
                timestamp: new Date()
            };

            // Emit to admins and managers
            req.io.to('role:admin').emit('attendance_update', eventData);
            req.io.to('role:manager').emit('attendance_update', eventData);

            // Also emit to the user who owns the attendance record
            req.io.to(`user:${attendance.userId}`).emit('attendance_update', eventData);

            logger.info(`Emitted attendance_update (approval) for attendance ${attendanceId}`);
        }
        logger.info(`User ${userId} successfully processed attendance approval at ${new Date().toISOString()}`);
        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        logger.error(`Error approving attendance ${req.body?.attendanceId} by user ${req.user?._id}: ${error.message}`);
        console.error("Error during attendance approval:", error);
        return res.status(500).json({ success: false, error: "Failed to approve attendance." });
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

// Function to manually add an attendance record
export const addAttendanceRecord = async (req, res) => {
    try {
        const {
            userId,
            date,
            clockIn,
            clockOut,
            tasksDone,
            status,
            approvalStatus,
            workLocation,
            isWeekend,
            isHoliday,
            isHalfDay,
            useLeaveBalance,
            role,
            credits,
            location,
            timezone
        } = req.body;

        // Validate required fields
        if (!userId || !date || !clockIn || !status || !role) {
            return res.status(400).json({
                success: false,
                error: "Required fields missing. User ID, date, clock-in time, status, and role are required."
            });
        }

        // Parse date correctly to ensure midnight UTC
        const dateArray = date.split('-');
        const year = parseInt(dateArray[0]);
        const month = parseInt(dateArray[1]) - 1; // Month is 0-indexed in JavaScript Date
        const day = parseInt(dateArray[2]);

        // Create a UTC date at midnight
        const attendanceDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

        // Get user details to verify existence and retrieve team info if applicable
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Get team ID if the user is an employee
        let teamId = null;
        if (role === "employee") {
            const employee = await Employee.findOne({ userId }).populate("teamId");
            teamId = employee?.teamId?._id || null;
        }

        // Check for existing attendance record on the same date
        const existingAttendance = await Attendance.findOne({
            userId,
            date: {
                $gte: attendanceDate,
                $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                error: "An attendance record already exists for this user on the selected date."
            });
        }

        // Check for associated leave (if any)
        const existingLeave = await Leave.findOne({
            userId,
            status: "Approved",
            startDate: { $lte: attendanceDate },
            endDate: { $gte: attendanceDate }
        });

        // Parse clock-in time
        const [clockInHours, clockInMinutes] = clockIn.split(':').map(Number);

        // Create a local date object representing the attendance date at the specified clock-in time
        // This properly accounts for timezone differences as the Date constructor uses local time
        const clockInDate = new Date(year, month, day, clockInHours, clockInMinutes, 0, 0);

        // Create new attendance record
        const newAttendance = new Attendance({
            userId,
            teamId,
            date: attendanceDate, // UTC midnight
            clockIn: clockInDate, // Local date will be automatically converted to UTC when saved
            status,
            role,
            approvalStatus: approvalStatus || "Approved", // Default to approved for admin-created records
            adminApproval: true, // Auto-approve admin-created records
            workLocation: workLocation || "Onsite",
            isWeekend: isWeekend || false,
            isHoliday: isHoliday || false,
            isHalfDay: isHalfDay || false,
            useLeaveBalance: useLeaveBalance || false,
            leaveId: existingLeave?._id || null,
            approvedBy: req.user._id, // Admin who created the record
            comments: `Manually added by admin ${req.user.name} on ${new Date().toLocaleString()}`,
            credits: credits !== undefined ? parseFloat(credits) : undefined
        });

        // Add clock-out time if provided
        if (clockOut) {
            const [clockOutHours, clockOutMinutes] = clockOut.split(':').map(Number);
            // Similarly create a local date for clock-out
            const clockOutDate = new Date(year, month, day, clockOutHours, clockOutMinutes, 0, 0);
            newAttendance.clockOut = clockOutDate;
        }

        if (tasksDone) {
            newAttendance.tasksDone = tasksDone;
        }

        if (location) {
            newAttendance.location = location;
        }


        await newAttendance.save();
        logger.info(`Admin ${req.user._id} manually added attendance record for user ${userId} on ${date}`);

        return res.status(201).json({
            success: true,
            message: "Attendance record added successfully",
            attendance: newAttendance
        });

    } catch (error) {
        logger.error(`Error adding attendance record: ${error.message}`);
        console.error("Error adding attendance record:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to add attendance record"
        });
    }
};

// Function to delete an attendance record
export const deleteAttendanceRecord = async (req, res) => {
    try {
        const { attendanceId } = req.params;

        if (!attendanceId) {
            return res.status(400).json({
                success: false,
                error: "Attendance ID is required"
            });
        }

        // Find and delete the attendance record
        const deletedAttendance = await Attendance.findByIdAndDelete(attendanceId);

        if (!deletedAttendance) {
            return res.status(404).json({
                success: false,
                error: "Attendance record not found"
            });
        }

        logger.info(`Admin ${req.user._id} deleted attendance record ${attendanceId}`);

        return res.status(200).json({
            success: true,
            message: "Attendance record deleted successfully",
            deletedAttendance
        });

    } catch (error) {
        logger.error(`Error deleting attendance record: ${error.message}`);
        console.error("Error deleting attendance record:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to delete attendance record"
        });
    }
};

// Function to get all attendance records with filtering options
export const getAllAttendanceRecords = async (req, res) => {
    try {
        // Extract query parameters for filtering
        const {
            search, // New search parameter
            dateFrom,
            dateTo,
            status,
            role,
            limit = 50,
            page = 1,
            timezone
        } = req.query;

        // Get user timezone or use default
        const userTimezone = timezone || 'UTC';

        // Build query object
        const query = {};

        // Add search filter for name, email, or ID
        if (search) {
            const userQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };

            // If search looks like MongoDB ObjectId, also search by ID
            if (search.match(/^[0-9a-fA-F]{24}$/)) {
                userQuery.$or.push({ _id: search });
            }

            // Find users matching the search criteria
            const matchingUsers = await User.find(userQuery).select('_id');
            const userIds = matchingUsers.map(user => user._id);

            // If search looks like employee ID or manager ID, also search those
            if (search.match(/^EMP-|^MGR-/)) {
                const employeeQuery = { employeeId: search };
                const managerQuery = { managerId: search };

                const [matchingEmployees, matchingManagers] = await Promise.all([
                    Employee.find(employeeQuery).select('userId'),
                    Manager.find(managerQuery).select('userId')
                ]);

                matchingEmployees.forEach(emp => userIds.push(emp.userId));
                matchingManagers.forEach(mgr => userIds.push(mgr.userId));
            }

            // Add user IDs to main query
            if (userIds.length > 0) {
                query.userId = { $in: userIds };
            } else {
                // No matching users found, return empty result
                return res.status(200).json({
                    success: true,
                    attendanceRecords: [],
                    pagination: {
                        total: 0,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        pages: 0
                    }
                });
            }
        }

        // Add other filters
        if (status) query.status = status;
        if (role) query.role = role;

        // Date range filter with timezone adjustment
        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom) {
                const fromDate = adjustDateForTimezone(
                    new Date(dateFrom),
                    userTimezone,
                    false // Start of day
                );
                query.date.$gte = fromDate;
            }
            if (dateTo) {
                const toDate = adjustDateForTimezone(
                    new Date(dateTo),
                    userTimezone,
                    true // End of day
                );
                query.date.$lte = toDate;
            }
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query with pagination
        const attendanceRecords = await Attendance.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate({
                path: 'userId',
                select: 'name email'
            })
            .populate({
                path: 'teamId',
                select: 'name'
            });

        // Get total count for pagination
        const totalRecords = await Attendance.countDocuments(query);

        // Fetch additional information for each record
        const enhancedRecords = await Promise.all(attendanceRecords.map(async (record) => {
            const recordObj = record.toObject();
            
            // Fetch employee/manager ID if applicable
            if (record.role === 'employee') {
                const employee = await Employee.findOne({ userId: record.userId }).select('employeeId');
                if (employee) {
                    recordObj.employeeId = employee.employeeId;
                }
            } else if (record.role === 'manager') {
                const manager = await Manager.findOne({ userId: record.userId }).select('managerId');
                if (manager) {
                    recordObj.managerId = manager.managerId;
                }
            }
            
            return recordObj;
        }));

        return res.status(200).json({
            success: true,
            attendanceRecords: enhancedRecords,
            pagination: {
                total: totalRecords,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalRecords / parseInt(limit))
            }
        });

    } catch (error) {
        logger.error(`Error fetching attendance records: ${error.message}`);
        console.error("Error fetching attendance records:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch attendance records"
        });
    }
};