import mongoose from "mongoose";
import { Schema } from "mongoose";

const employeeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employeeId: { type: String, required: true, unique: true },
    dob: { type: Date },
    gender: { type: String },
    maritalStatus: { type: String },
    designation: { type: String },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    salary: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['active', 'inactive'], 
        default: 'active' 
    },
    teamId: { type: Schema.Types.ObjectId, ref: "Team" },
    managerId: { type: Schema.Types.ObjectId, ref: "Manager" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
// Remove pre-save validation hook completely since team assignment is handled by Team model
const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;