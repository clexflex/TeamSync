import mongoose from "mongoose";
const { Schema } = mongoose;

const ticketSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Employee or Manager
        title: { type: String, required: true },
        description: { type: String, required: true },
        type: { 
            type: String, 
            enum: ["Tech Support", "HR", "Payroll", "Facility", "Other"], 
            required: true 
        },
        priority: { 
            type: String, 
            enum: ["Low", "Medium", "High", "Critical"], 
            default: "Medium" 
        },
        status: { 
            type: String, 
            enum: ["Open", "In Progress", "Resolved", "Closed", "Reopened"], 
            default: "Open" 
        },
        assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
        attachments: [{ type: String }], // File paths
        responses: [
            {
                userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
                message: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
                attachments: [{ type: String }]
            }
        ],
        dueDate: { type: Date },
        resolvedAt: { type: Date },
        closedAt: { type: Date },
    },
    { timestamps: true }
);

// Index for faster queries
ticketSchema.index({ userId: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;