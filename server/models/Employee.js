import mongoose from "mongoose";
import { Schema } from "mongoose";

const employeeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employeeId: { type: String, required: true, unique: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    designation: { type: String },
    teamId: { type: Schema.Types.ObjectId, ref: "Team" },
    managerId: { type: Schema.Types.ObjectId, ref: "Manager" },
    dob: { type: Date },
    gender: { type: String },
    maritalStatus: { type: String },
    salary: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;