import mongoose from "mongoose";
import { Schema } from "mongoose";

const leaveResetHistorySchema = new Schema({
    // Who performed the reset (admin user ID or "system" for automated resets)
    performedBy: { 
        type: Schema.Types.ObjectId, 
        ref: "User" 
    },
    
    // Whether this was an automated or manual reset
    isAutomated: { 
        type: Boolean, 
        default: false 
    },
    
    // Date when the reset was performed
    resetDate: { 
        type: Date, 
        required: true, 
        default: Date.now 
    },
    
    // Whether carry-forward rules were applied
    carryForwardApplied: { 
        type: Boolean, 
        default: true 
    },
    
    // Summary of reset operation
    summary: {
        totalProfiles: { type: Number, default: 0 },
        successfulResets: { type: Number, default: 0 },
        failedResets: { type: Number, default: 0 }
    },
    
    // Optional list of specific users that were reset
    // If empty, it means all users were reset
    targetUsers: [{ 
        type: Schema.Types.ObjectId, 
        ref: "User" 
    }],
    
    // For tracking any failures or issues during reset
    failureDetails: [{
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        error: { type: String }
    }],
    
    createdAt: { type: Date, default: Date.now }
});

// Add indexes for faster queries
leaveResetHistorySchema.index({ resetDate: -1 });
leaveResetHistorySchema.index({ isAutomated: 1 });

const LeaveResetHistory = mongoose.model("LeaveResetHistory", leaveResetHistorySchema);
export default LeaveResetHistory;