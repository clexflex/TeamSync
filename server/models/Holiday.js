// server/models/Holiday.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const holidaySchema = new Schema(
    {
        name: { type: String, required: true }, // Name of the holiday (e.g., "Christmas")
        date: { type: Date, required: true, unique: true }, // Specific date for the holiday
        isCompanyWide: { type: Boolean, default: true }, // If the holiday applies to the entire company
        applicableDepartments: [{ type: Schema.Types.ObjectId, ref: "Department" }], // Optional department-specific holidays
        createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // Admin who created the holiday
        description: { type: String }, // Additional details about the holiday
    },
    { timestamps: true }
);

const Holiday = mongoose.model("Holiday", holidaySchema);
export default Holiday;
