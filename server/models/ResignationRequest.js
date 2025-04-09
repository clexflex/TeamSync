import mongoose from "mongoose";
import { Schema } from "mongoose";

const clearanceItemSchema = new Schema({
    item: { type: String, required: true },
    cleared: { type: Boolean, default: false },
    notes: { type: String },
    clearedDate: { type: Date },
    clearedBy: { type: Schema.Types.ObjectId, ref: "User" }
});

const resignationRequestSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee" },
    managerId: { type: Schema.Types.ObjectId, ref: "Manager" },
    submissionDate: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    noticePeriod: { type: Number, required: true }, // In days
    lastWorkingDay: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ["Pending", "Approved", "Rejected", "Withdrawn"],
        default: "Pending"
    },
    adminNotes: { type: String },
    withdrawalReason: { type: String },
    clearanceItems: [clearanceItemSchema],
    processedBy: { type: Schema.Types.ObjectId, ref: "User" },
    processedDate: { type: Date },
    exitInterviewDate: { type: Date },
    exitInterviewCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add pre-save hook to update the updatedAt field
resignationRequestSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const ResignationRequest = mongoose.model("ResignationRequest", resignationRequestSchema);
export default ResignationRequest;