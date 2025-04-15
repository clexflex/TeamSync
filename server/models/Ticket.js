import mongoose from "mongoose";
const { Schema } = mongoose;

const attachmentSchema = new Schema({
    filename: { type: String, required: true },
    path: { type: String, required: true },    // Firebase storage path
    url: { type: String, required: true },     // Firebase signed URL
    contentType: { type: String },
    size: { type: Number }
});

const responseSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    attachments: [attachmentSchema],
    timestamp: { type: Date, default: Date.now }
});

const ticketSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
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
    attachments: [attachmentSchema],
    responses: [responseSchema],
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    dueDate: { type: Date },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;