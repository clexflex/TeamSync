import Excel from 'exceljs';
import Salary from '../models/Salary.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Manager from '../models/Manager.js';
import UserProfile from '../models/UserProfile.js';
import Department from '../models/Department.js';
import { format, parseISO } from 'date-fns';
import logger from '../utils/logger.js';

// Function to generate and export salary data to Excel
export const exportSalaryData = async (req, res) => {
  try {
    const { month, year, company } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: 'Month and year are required'
      });
    }
    
    // Create date range for the selected month
    // Typically salary period is from 26th of previous month to 25th of current month
    const startMonth = month === 1 ? 12 : month - 1;
    const startYear = month === 1 ? year - 1 : year;
    const endMonth = month;
    const endYear = year;
    
    const startDate = new Date(startYear, startMonth - 1, 26);
    const endDate = new Date(endYear, endMonth - 1, 25);
    
    // Generate period string (e.g., "March 2025")
    const periodString = format(new Date(year, month - 1, 1), 'MMMM yyyy');
    
    logger.info(`Generating salary export for period: ${periodString}, company: ${company || 'All'}`);
    
    // Query for approved and paid salary records
    const query = {
      status: { $in: ['Approved', 'Paid'] },
      payPeriod: periodString
    };
    
    // Fetch salary records
    const salaryRecords = await Salary.find(query)
      .populate({
        path: 'userId',
        select: 'name email role status'
      })
      .sort({ 'userId.name': 1 });
    
    if (salaryRecords.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No approved salary records found for ${periodString}`
      });
    }
    
    // Fetch additional data for each salary record
    const salaryData = await Promise.all(salaryRecords.map(async (record) => {
      // Get user profile for bank details and company info
      const userProfile = await UserProfile.findOne({ userId: record.userId._id });
      
      // Get employee or manager details
      let employeeData = null;
      let managerData = null;
      let departmentName = 'N/A';
      
      if (record.userId.role === 'employee') {
        employeeData = await Employee.findOne({ userId: record.userId._id })
          .populate('department', 'dep_name');
          
        if (employeeData?.department) {
          departmentName = employeeData.department.dep_name;
        }
      } else if (record.userId.role === 'manager') {
        managerData = await Manager.findOne({ userId: record.userId._id })
          .populate('department', 'dep_name');
          
        if (managerData?.department) {
          departmentName = managerData.department.dep_name;
        }
      }
      
      // Filter by company if specified
      if (company && userProfile && userProfile.company !== company) {
        return null; // Skip this record if company doesn't match
      }
      
      // Format data for Excel
      return {
        name: record.userId.name,
        employeeId: employeeData?.employeeId || managerData?.managerId || 'N/A',
        designation: employeeData?.designation || managerData?.designation || 'N/A',
        department: departmentName,
        company: userProfile?.company || 'Maximize Market Research Pvt. Ltd.',
        role: record.userId.role,
        
        // Salary details
        basicSalary: record.basicSalary,
        totalAllowances: record.totalAllowances,
        totalDeductions: record.totalDeductions,
        netSalary: record.netSalary,
        
        // Allowances breakdown
        DA: record.allowances.DA,
        HRA: record.allowances.HRA,
        conveyance: record.allowances.conveyance,
        medical: record.allowances.medical,
        education: record.allowances.education,
        performance: record.allowances.performance,
        special: record.allowances.special,
        otherAllowance: record.allowances.other,
        
        // Deductions breakdown
        PF: record.deductions.PF,
        ESI: record.deductions.ESI,
        PT: record.deductions.PT,
        TDS: record.deductions.TDS,
        MLWF: record.deductions.MLWF,
        advance: record.deductions.advance,
        loan: record.deductions.loan,
        otherDeduction: record.deductions.other,
        
        // Attendance details
        totalDays: record.totalDays,
        totalWorkingDays: record.totalWorkingDays,
        totalCredits: record.totalCredits,
        presentDays: record.presentDays,
        absentDays: record.absentDays,
        paidLeaveDays: record.paidLeaveDays,
        
        // Bank details
        bankName: userProfile?.salaryInfo?.bankDetails?.bankName || 'N/A',
        accountNumber: userProfile?.salaryInfo?.bankDetails?.accountNumber || 'N/A',
        IFSCCode: userProfile?.salaryInfo?.bankDetails?.IFSCCode || 'N/A',
        branchName: userProfile?.salaryInfo?.bankDetails?.branchName || 'N/A',
        accountHolderName: userProfile?.salaryInfo?.bankDetails?.nameAsPerBank || record.userId.name,
        PFNumber: userProfile?.salaryInfo?.PFNumber || 'N/A',
        ESINumber: userProfile?.salaryInfo?.ESINumber || 'N/A',
        // Status
        paymentStatus: record.status,
        
        // IDs for reference
        salaryId: record._id,
        userId: record.userId._id
      };
    }));
    
    // Remove null entries (filtered out by company)
    const filteredData = salaryData.filter(entry => entry !== null);
    
    if (filteredData.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No salary records found for the specified criteria`
      });
    }
    
    // Create Excel workbook and worksheet
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Salary Report');
    
    // Set column headers and formatting
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Employee/Manager ID', key: 'employeeId', width: 20 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Company', key: 'company', width: 30 },
      { header: 'Role', key: 'role', width: 12 },
      
      // Salary details
      { header: 'Basic Salary', key: 'basicSalary', width: 15, style: { numFmt: '₹#,##0.00' } },
      { header: 'Gross Salary', key: 'grossSalary', width: 15, style: { numFmt: '₹#,##0.00' } },
      { header: 'Net Salary', key: 'netSalary', width: 15, style: { numFmt: '₹#,##0.00' } },
      
      // Allowances
      { header: 'DA', key: 'DA', width: 12, style: { numFmt: '₹#,##0.00' } },
      { header: 'HRA', key: 'HRA', width: 12, style: { numFmt: '₹#,##0.00' } },
      { header: 'Conveyance', key: 'conveyance', width: 12, style: { numFmt: '₹#,##0.00' } },
      { header: 'Medical', key: 'medical', width: 12, style: { numFmt: '₹#,##0.00' } },
      
      // Deductions
      { header: 'PF', key: 'PF', width: 12, style: { numFmt: '₹#,##0.00' } },
      { header: 'ESI', key: 'ESI', width: 12, style: { numFmt: '₹#,##0.00' } },
      { header: 'Professional Tax', key: 'PT', width: 15, style: { numFmt: '₹#,##0.00' } },
      { header: 'TDS', key: 'TDS', width: 12, style: { numFmt: '₹#,##0.00' } },
      
      // Attendance
      { header: 'Total Days', key: 'totalDays', width: 12 },
      { header: 'Working Days', key: 'totalWorkingDays', width: 12 },
      { header: 'Credits', key: 'totalCredits', width: 12 },
      
      // Bank details
      { header: 'Bank Name', key: 'bankName', width: 20 },
      { header: 'Account Number', key: 'accountNumber', width: 20 },
      { header: 'IFSC Code', key: 'IFSCCode', width: 15 },
      { header: 'Branch', key: 'branchName', width: 15 },
      { header: 'Account Holder', key: 'accountHolderName', width: 25 },
      { header: 'PF Number', key: 'PFNumber', width: 20 },
      { header: 'ESI Number', key: 'ESINumber', width: 20 },
      // Status
      { header: 'Payment Status', key: 'paymentStatus', width: 15 }
    ];
    
    // Add headers with styling
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Add report title
    worksheet.insertRow(1, []);
    worksheet.insertRow(1, [`Salary Report for ${periodString}`]);
    worksheet.getRow(1).font = { bold: true, size: 16 };
    worksheet.mergeCells('A1:Z1');
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Calculate summary values
    const totalEmployees = filteredData.length;
    const totalNetSalary = filteredData.reduce((sum, item) => sum + item.netSalary, 0);
    const totalPF = filteredData.reduce((sum, item) => sum + item.PF, 0);
    const totalESI = filteredData.reduce((sum, item) => sum + item.ESI, 0);
    
    // Add summary info
    worksheet.insertRow(2, [`Company: ${company || 'All Companies'} | Total Employees: ${totalEmployees} | Total Net Salary: ₹${totalNetSalary.toFixed(2)} | Total PF: ₹${totalPF.toFixed(2)} | Total ESI: ₹${totalESI.toFixed(2)}`]);
    worksheet.getRow(2).font = { italic: true, size: 11 };
    worksheet.mergeCells('A2:Z2');
    
    // Add data rows
    filteredData.forEach(record => {
      // Calculate gross salary
      record.grossSalary = record.basicSalary + record.totalAllowances;
      
      worksheet.addRow(record);
    });
    
    // Apply basic styling to the data
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 3) { // Skip header rows
        row.eachCell({ includeEmpty: false }, (cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
    });
    
    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Salary_Report_${periodString.replace(' ', '_')}.xlsx`);
    
    // Send the buffer
    res.send(buffer);
    
    logger.info(`Salary export for ${periodString} generated successfully. ${filteredData.length} records exported.`);
    
  } catch (error) {
    logger.error(`Error generating salary export: ${error.message}`);
    console.error('Error generating salary export:', error);
    return res.status(500).json({
      success: false,
      error: `Server error in generating salary export: ${error.message}`
    });
  }
};

// Function to get available companies for dropdown
export const getCompanyList = async (req, res) => {
  try {
    // Get unique companies from UserProfile collection
    const companies = await UserProfile.distinct('company');
    
    return res.status(200).json({
      success: true,
      companies: companies.filter(c => c) // Filter out any null/undefined values
    });
  } catch (error) {
    logger.error(`Error fetching company list: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch company list'
    });
  }
};