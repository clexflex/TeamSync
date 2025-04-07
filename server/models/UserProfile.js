// server/models/UserProfile.js
import mongoose from "mongoose";
import { Schema } from "mongoose";

// Education schema
const educationSchema = new Schema({
    degree: { type: String },
    institute: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    grade: { type: String }
});

// Previous employment schema
const previousEmploymentSchema = new Schema({
    company: { type: String },
    designation: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    reasonForLeaving: { type: String }
});

// Address schema
const addressSchema = new Schema({
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'India' }
});

// Bank details schema
const bankDetailsSchema = new Schema({
    accountNumber: { type: String },
    bankName: { type: String },
    branchName: { type: String },
    IFSCCode: { type: String },
    paymentType: { type: String, enum: ['Bank Transfer', 'Check', 'Cash'], default: 'Bank Transfer' },
    accountType: { type: String, enum: ['Savings', 'Current', 'Salary'], default: 'Savings' },
    ddPayableAt: { type: String },
    nameAsPerBank: { type: String }
});

// Salary information schema
const salaryInfoSchema = new Schema({
    basicSalary: { type: Number, default: 0 },
    allowances: {
        DA: { type: Number, default: 0 }, // Dearness Allowance
        HRA: { type: Number, default: 0 }, // House Rent Allowance
        conveyance: { type: Number, default: 0 },
        medical: { type: Number, default: 0 },
        education: { type: Number, default: 0 },
        performance: { type: Number, default: 0 },
        special: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    deductions: {
        PF: { type: Number, default: 0 }, // Provident Fund
        ESI: { type: Number, default: 0 }, // Employee State Insurance
        PT: { type: Number, default: 0 }, // Professional Tax
        TDS: { type: Number, default: 0 }, // Tax Deducted at Source
        MLWF: { type: Number, default: 0 }, // Maharashtra Labor Welfare Fund
        advance: { type: Number, default: 0 },
        loan: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    PFNumber: { type: String },
    ESINumber: { type: String },
    PAN: { type: String },     // Permanent Account Number
    passportNo: { type: String },
    aadhaarNo: { type: String },
    bankDetails: { type: bankDetailsSchema, default: () => ({}) }
});

const userProfileSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    leavePolicy: { type: Schema.Types.ObjectId, ref: "LeavePolicy" },
    leaveBalances: [{
        leaveType: {
            type: String,
            enum: ["Casual Leave", "Sick Leave", "Paid Leave", "Half Leave"],
        },
        balance: { type: Number, default: 0 },
        used: { type: Number, default: 0 },
        carryForward: { type: Number, default: 0 }
    }],
    joiningDate: { type: Date, required: true },
    lastLeaveBalanceReset: { type: Date },
    
    // Personal Information
    companyEmail: { type: String },
    location: { type: String },
    primaryContactNo: { type: String },
    bloodGroup: { type: String },
    nationality: { type: String, default: 'Indian' },
    marriageDate: { type: Date },
    spouse: { type: String },
    fatherName: { type: String },
    religion: { type: String },
    physicallyHandicapped: { type: Boolean, default: false },
    height: { type: String },
    weight: { type: String },
    
    // Address
    address: { type: addressSchema, default: () => ({}) },
    
    // Education Information
    education: { type: [educationSchema], default: [] },
    
    // Employment & Job Information
    confirmationDate: { type: Date },
    noticePeriod: { type: String },
    employmentStatus: { type: String, enum: ['Probation', 'Confirmed', 'Contract', 'Intern'], default: 'Probation' },
    currentCompanyExperience: { type: String },
    previousExperience: { type: String },
    totalExperience: { type: String },
    probationPeriod: { type: String, default: '3' },
    
    // Previous Employment
    previousEmployment: { type: [previousEmploymentSchema], default: [] },
    
    // Salary Information
    salaryInfo: { type: salaryInfoSchema, default: () => ({}) },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
export default UserProfile;