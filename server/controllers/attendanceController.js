import logger from '../utils/logger.js';
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";
import Holiday from "../models/Holiday.js";

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
        const employee = await Employee.findOne({ userId }).populate('teamId');

        const response = {
            success: true,
            isHoliday: !!holiday,
            holidayDetails: holiday,
            attendance: todayAttendance,
            status: !todayAttendance ? 'not-started' :
                todayAttendance.clockOut ? 'completed' : 'clocked-in',
            teamId: employee?.teamId?._id || null
        };
        logger.info(`User ${userId} checked attendance status.`);
        return res.status(200).json(response);
    } catch (error) {
        logger.error(`Error fetching current status for user ${userId}: ${error.message}`);
        console.error("Error fetching current status:", error);
        return res.status(500).json({ success: false, error: "Failed to fetch current status." });
    }
};


// Add this function at the top of attendanceController.js
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

// Update the clockIn function
export const clockIn = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is missing." });
        }

        const { workLocation, location } = req.body;
        // console.log("Received location:", location);

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
            // console.log("Geofence check result:", isInside);

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

        const [existingAttendance, employee] = await Promise.all([
            Attendance.findOne({ userId, date: { $gte: todayUTC, $lt: tomorrowUTC } }),
            Employee.findOne({ userId }).populate("teamId")
        ]);

        if (existingAttendance) {
            return res.status(400).json({ success: false, error: "Already clocked in for today." });
        }

        // Check weekend based on UTC day
        const dayOfWeek = todayUTC.getUTCDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday (0) or Saturday (6)

        const newAttendance = new Attendance({
            userId,
            teamId: employee?.teamId?._id || null,
            date: todayUTC,
            clockIn: new Date(),
            status: "Present",
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
            isWeekend,
        });

        await newAttendance.save();
        logger.info(`User ${userId} successfully clocked in at ${new Date().toISOString()}`);
        return res.status(200).json({ success: true, attendance: newAttendance });
    } catch (error) {
        logger.error(`Error during clock-in: ${error.message}`);
        console.error("Error during clock-in:", error);
        return res.status(500).json({ success: false, error: "Failed to clock in." });
    }
};
// Clock-Out Functionality
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
            logger.info(`User ${userId} successfully clocked Out at ${new Date().toISOString()}`);
            return res.status(400).json({ success: false, error: "Clock-out already recorded for today." });
        }

        attendance.clockOut = new Date();
        attendance.tasksDone = tasksDone;
        attendance.hoursWorked = (attendance.clockOut - attendance.clockIn) / (1000 * 60 * 60);

        await attendance.save();
        logger.info(`User ${userId} clocked out at ${new Date().toISOString()}. Hours worked: ${attendance.hoursWorked}`);
        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        logger.error(`Error during clock-out for user ${userId}: ${error.message}`);
        console.error("Error during clock-out:", error);
        return res.status(500).json({ success: false, error: "Failed to clock out." });
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
// Approve Attendance
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

        if (approvalStatus === "Approved") {
            attendance.status = "Present";
        }

        await attendance.save();
        logger.info(`User ${userId} successfully approve at ${new Date().toISOString()}`);
        console.log("success")
        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        logger.error(`Error approving attendance ${attendanceId} by user ${userId}: ${error.message}`);
        console.error("Error during attendance approval:", error);
        return res.status(500).json({ success: false, error: "Failed to approve attendance." });
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

        // Get the manager's teams
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
                        totalHoursWorked: 0
                    }
                };
            }

            const status = record.approvalStatus === 'Approved'
                ? record.status
                : 'Pending';

            userAttendanceMap[record.userId].attendance[dateStr] = {
                status,
                hoursWorked: record.hoursWorked || 0,
                isHoliday: holidays.some(h => h.date.toISOString().split('T')[0] === dateStr)
            };

            // Update statistics for present days
            if (status === 'Present') userAttendanceMap[record.userId].stats.totalPresent++;
            if (status === 'Half-Day') userAttendanceMap[record.userId].stats.totalHalfDay++;
            userAttendanceMap[record.userId].stats.totalHoursWorked += record.hoursWorked || 0;
        });

        // Calculate absent days and other statistics
        Object.values(userAttendanceMap).forEach(user => {
            const totalWorkingDays = workingDays.size;
            const absentDays = totalWorkingDays - user.stats.totalPresent - (user.stats.totalHalfDay * 0.5);

            user.stats.totalAbsent = Math.max(0, absentDays);
            user.stats.workingDays = totalWorkingDays;
            user.stats.attendancePercentage = ((user.stats.totalPresent + (user.stats.totalHalfDay * 0.5)) / totalWorkingDays * 100).toFixed(2);
            user.stats.avgHoursPerDay = (user.stats.totalHoursWorked / user.stats.totalPresent || 0).toFixed(2);
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