import mongoose from "mongoose";
import { Schema } from "mongoose";

const leaveSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    leaveType: {
        type: String,
        enum: ["Casual Leave", "Sick Leave", "Paid Leave", "Half Leave"],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },
    isPaid: { type: Boolean, default: true },
    useLeaveBalance: { type: Boolean, default: true },
    documents: [{ type: String }], // For medical certificates etc.
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvalComment: { type: String },
    appliedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to calculate total days
leaveSchema.pre('save', function(next) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    next();
});

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;