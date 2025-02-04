import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ["admin", "employee", "manager"], required: true},
    profileImage: {type: String},
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }, 
    createAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

const User = mongoose.model("User", userSchema);
export default User;