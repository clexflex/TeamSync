import mongoose from "mongoose";

const { Schema } = mongoose;

const attendanceSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Employee or Manager
        teamId: { type: Schema.Types.ObjectId, ref: "Team" }, // Optional for managers
        date: { type: Date, required: true }, // Attendance date
        clockIn: { type: Date, required: true },
        clockOut: { type: Date },
        tasksDone: { type: String }, // Details of tasks completed
        status: {
            type: String,
            enum: ["Present", "Absent", "Half-Day", "Leave", "Extra-Work"],
            default: "Absent", // Default status until clock-in
        },
        approvalStatus: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Auto-Approved"],
            default: "Pending",
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: "User" }, // Admin or manager who approved
        role: { type: String, enum: ["employee", "manager"], required: true }, // Role of user
        managerApproval: { type: Boolean, default: false }, // Indicates manager approval for employees
        adminApproval: { type: Boolean, default: false }, // Indicates admin approval for employees/managers
        isWeekend: { type: Boolean, default: false }, // Automatically marked
        isHoliday: { type: Boolean, default: false }, // Automatically marked
        hoursWorked: { type: Number }, // Calculated hours worked
        workLocation: { type: String, enum: ["Onsite", "Remote"], default: "Onsite" }, // Location of work
        leaveId: { type: Schema.Types.ObjectId, ref: "Leave" }, // Linked leave record if applicable
        comments: { type: String }, // Additional comments
    },
    { timestamps: true }
);

// Ensure one attendance record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Pre-save hook to calculate hours worked
attendanceSchema.pre("save", function (next) {
    if (this.clockIn && this.clockOut) {
        this.hoursWorked = (this.clockOut - this.clockIn) / (1000 * 60 * 60); // Convert milliseconds to hours
    }
    next();
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
