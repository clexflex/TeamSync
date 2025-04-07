import mongoose from "mongoose";
const { Schema } = mongoose;

const documentSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        category: { 
            type: String, 
            enum: [
                "Address", 
                "Qualification", 
                "Previous Employment", 
                "Accounts & Statutory", 
                "Company Policies", 
                "Form 16", 
                "Forms"
            ],
            required: true 
        },
        subCategory: { type: String },
        title: { type: String, required: true },
        description: { type: String },
        fileUrl: { type: String, required: true },
        fileType: { type: String },
        fileSize: { type: Number },
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        isGlobal: { type: Boolean, default: false },  // If true, document is available to all users
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
export default Document;