import mongoose from "mongoose";
const { Schema } = mongoose;

const notificationSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { 
            type: String, 
            enum: ["general", "birthday", "work_anniversary", "leave_request", "attendance", "document", "salary", "task", "system"],
            default: "general"
        },
        isRead: { type: Boolean, default: false },
        relatedTo: { 
            model: { type: String },
            id: { type: Schema.Types.ObjectId }
        },
        metadata: { type: Object },
        isGlobal: { type: Boolean, default: false }, // For company-wide notifications
        sendEmail: { type: Boolean, default: false }, // Whether to send an email for this notification
        emailSent: { type: Boolean, default: false }, // Whether the email has been sent
    },
    { timestamps: true }
);

// Create index for faster queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;