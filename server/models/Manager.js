import mongoose from "mongoose";
import { Schema } from "mongoose";

const managerSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    managerId: { type: String, required: true, unique: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    designation: { type: String, default: "Team Manager" },
    teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
    attendance: [{ type: Schema.Types.ObjectId, ref: "Attendance" }], // Link to attendance records
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Manager = mongoose.model("Manager", managerSchema);
export default Manager;