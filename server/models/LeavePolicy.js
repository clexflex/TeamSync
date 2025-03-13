import mongoose from "mongoose";
import { Schema } from "mongoose";

const leavePolicySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    leaveTypes: [{
        type: { 
            type: String, 
            enum: ["Casual Leave", "Sick Leave", "Paid Leave", "Half Leave"],
            required: true 
        },
        daysAllowed: { type: Number, required: true },
        carryForward: { type: Boolean, default: false },
        maxCarryForward: { type: Number },
        paid: { type: Boolean, default: true },
        probationPeriod: { type: Number, default: 0 }, // In months
        description: String
    }],
    applicableRoles: [{
        type: String,
        enum: ["employee", "manager"],
        required: true
    }],
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const LeavePolicy = mongoose.model("LeavePolicy", leavePolicySchema);
export default LeavePolicy; 