import mongoose from "mongoose";
import { Schema } from "mongoose";

const salarySchema = new Schema({
    // Linking information
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    managerId: { type: Schema.Types.ObjectId, ref: 'Manager' },
    
    // Time period
    payPeriod: { 
        type: String, 
        required: true,
        trim: true 
    }, // e.g. "March 2025"
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    
    // Base salary components
    basicSalary: { type: Number, required: true },
    
    // Attendance calculation
    totalDays: { type: Number, required: true }, // Days in the pay period
    totalWorkingDays: { type: Number, required: true }, // Excluding weekends and holidays
    totalWeeklyOffs: { type: Number, required: true },
    totalHolidays: { type: Number, required: true },
    totalCredits: { type: Number, required: true }, // Sum of all credits
    
    // Attendance breakdown
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    paidLeaveDays: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    extraWorkDays: { type: Number, default: 0 },
    
    // Allowances
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
    
    // Deductions
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
    
    // Calculated values
    grossSalary: { type: Number, required: true },
    totalAllowances: { type: Number, required: true },
    totalDeductions: { type: Number, required: true },
    attendanceAdjustment: { type: Number, required: true },
    netSalary: { type: Number, required: true },
    
    // Processing information
    status: { 
        type: String, 
        enum: ['Draft', 'Verified', 'Approved', 'Rejected', 'Paid', 'Failed'],
        default: 'Draft'
    },
    
    // Admin adjustments
    adminAdjustments: [{
        amount: Number,
        reason: String,
        date: { type: Date, default: Date.now },
        adjustedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }],
    
    // Payment information
    transactionId: { type: String },
    paymentDate: { type: Date },
    paymentMethod: { type: String },
    
    // Audit information
    auditLog: [{
        action: String,
        timestamp: { type: Date, default: Date.now },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        notes: String
    }],
    
    // Payslip information
    payslipGenerated: { type: Boolean, default: false },
    payslipUrl: { type: String },       // Firebase signed URL
    payslipPath: { type: String },      // Firebase storage path
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Method to recalculate derived fields
salarySchema.methods.recalculate = function() {
    // Calculate total allowances
    this.totalAllowances = Object.values(this.allowances).reduce((sum, val) => sum + val, 0);
    
    // Calculate total deductions
    this.totalDeductions = Object.values(this.deductions).reduce((sum, val) => sum + val, 0);
    
    // Calculate gross salary
    this.grossSalary = this.basicSalary + this.totalAllowances;
    
    // Calculate attendance adjustment
    // Formula: (No. of days in month - Total Credits) * (Gross Pay/30)
    this.attendanceAdjustment = (this.totalDays - this.totalCredits) * (this.grossSalary / 30);
    
    // Calculate net salary
    // Net Salary = Gross Salary - Total Deductions - Attendance Adjustment
    this.netSalary = this.grossSalary - this.totalDeductions - this.attendanceAdjustment;
    
    return this;
};

// Pre-save hook to ensure calculations are updated
salarySchema.pre('save', function(next) {
    this.recalculate();
    this.updatedAt = Date.now();
    next();
});

const Salary = mongoose.model("Salary", salarySchema);
export default Salary;