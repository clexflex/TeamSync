import mongoose from "mongoose";
import { Schema } from "mongoose";
const userProfileSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    leavePolicy: { type: Schema.Types.ObjectId, ref: "LeavePolicy" },
    leaveBalances: [{
        leaveType: {
            type: String,
            enum: ["Casual Leave", "Sick Leave", "Paid Leave", "Half Leave"],
        },
        balance: { type: Number, default: 0 },
        used: { type: Number, default: 0 },
        carryForward: { type: Number, default: 0 }
    }],
    joiningDate: { type: Date, required: true },
    lastLeaveBalanceReset: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
export default UserProfile;