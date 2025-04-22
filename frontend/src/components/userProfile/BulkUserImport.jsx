import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  LinearProgress,
  Tooltip,
  Autocomplete
} from '@mui/material';
import {
  CloudUpload,
  ArrowBack,
  Check,
  Error,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  Close,
  Download,
  Group,
  FilterList,
  Refresh,
  Business,
  Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import * as XLSX from 'xlsx';

const BulkUserImport = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [excelData, setExcelData] = useState(null);
  const [mappedData, setMappedData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({
    name: '',
    email: '',
    employeeId: '',
    userType: '',
    department: '',
    designation: '',
    gender: '',
    joiningDate: '',
    dob: '',
    PFNumber: '',
    ESINumber: '',
    accountNumber: '',
    bankName: '',
    IFSCCode: '',
    aadhaarNo: '',
    salary: '',
    address: '',
    contactNumber: ''
  });
  
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [defaultPassword, setDefaultPassword] = useState('Welcome@123');
  const [defaultSalary, setDefaultSalary] = useState(25000);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState(null);
  const [useFuzzyMatching, setUseFuzzyMatching] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    showOnlyInvalid: false,
    filterUserType: 'all',
    filterDepartment: 'all'
  });

  const steps = ['Upload Excel', 'Map Fields', 'Validate Data', 'Import Users'];

  // Fetch departments and teams on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptResponse = await axios.get(`${config.API_URL}/api/department`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (deptResponse.data.success) {
          setDepartments(deptResponse.data.departments);
        }
        
        // Fetch teams
        const teamResponse = await axios.get(`${config.API_URL}/api/team`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (teamResponse.data.success) {
          setTeams(teamResponse.data.teams);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load departments or teams. Please try again.");
      }
    };

    fetchData();
  }, []);

  // Create and download an Excel template
  const downloadTemplate = () => {
    // Create worksheet with sample data
    const ws = XLSX.utils.aoa_to_sheet([
      [
        'Name',
        'Email',
        'User Type',
        'Employee/Manager ID',
        'Department',
        'Designation',
        'Gender',
        'Joining Date',
        'Date of Birth',
        'Salary',
        'PF Number',
        'ESI Number',
        'Bank Account No',
        'Bank Name',
        'IFSC Code',
        'Aadhaar Number',
        'Contact Number',
        'Address'
      ],
      [
        'John Doe',
        'john.doe@example.com',
        'employee',
        'EMP001',
        'Engineering',
        'Software Developer',
        'male',
        '2023-01-01',
        '1990-05-15',
        '50000',
        'PF12345',
        'ESI67890',
        '1234567890',
        'HDFC Bank',
        'HDFC0001234',
        '123456789012',
        '9876543210',
        '123 Main St, City, State'
      ],
      [
        'Jane Smith',
        'jane.smith@example.com',
        'manager',
        'MGR001',
        'Marketing',
        'Marketing Manager',
        'female',
        '2022-06-15',
        '1985-10-20',
        '75000',
        'PF54321',
        'ESI09876',
        '0987654321',
        'ICICI Bank',
        'ICIC0005678',
        '987654321098',
        '8765432109',
        '456 Park Ave, City, State'
      ]
    ]);

    // Set column widths
    const wscols = [
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 12 }, // User Type
      { wch: 18 }, // Employee/Manager ID
      { wch: 15 }, // Department
      { wch: 20 }, // Designation
      { wch: 10 }, // Gender
      { wch: 12 }, // Joining Date
      { wch: 12 }, // Date of Birth
      { wch: 10 }, // Salary
      { wch: 15 }, // PF Number
      { wch: 15 }, // ESI Number
      { wch: 15 }, // Bank Account No
      { wch: 15 }, // Bank Name
      { wch: 15 }, // IFSC Code
      { wch: 15 }, // Aadhaar Number
      { wch: 15 }, // Contact Number
      { wch: 25 }  // Address
    ];
    ws['!cols'] = wscols;

    // Create workbook, add the worksheet, and save as Excel file
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users Template');
    
    // Generate file and trigger download
    XLSX.writeFile(wb, 'user_import_template.xlsx');
  };

  // Fuzzy match department names
  const fuzzyMatchDepartment = (inputName) => {
    if (!inputName || !departments.length) return '';
    
    // Normalize input: lowercase and trim
    const normalizedInput = inputName.toLowerCase().trim();
    
    // First try exact match
    const exactMatch = departments.find(
      dept => dept.dep_name.toLowerCase() === normalizedInput
    );
    
    if (exactMatch) return exactMatch._id;
    
    if (useFuzzyMatching) {
      // Try fuzzy matching by calculating similarity scores
      const getMatchScore = (source, target) => {
        // Simple matching algorithm that calculates percentage of matching characters
        source = source.toLowerCase();
        target = target.toLowerCase();
        
        // Check if one is a substring of the other
        if (source.includes(target) || target.includes(source)) {
          return 0.8; // High score for substring match
        }
        
        // Count matching characters
        let matchCount = 0;
        const sourceChars = source.split('');
        const targetChars = target.split('');
        
        for (const char of sourceChars) {
          if (targetChars.includes(char)) {
            matchCount++;
            // Remove the character to prevent double matching
            const index = targetChars.indexOf(char);
            targetChars.splice(index, 1);
          }
        }
        
        // Calculate match percentage based on the longer string
        return matchCount / Math.max(source.length, target.length);
      };
      
      // Calculate scores for each department
      const matchScores = departments.map(dept => ({
        dept,
        score: getMatchScore(dept.dep_name, normalizedInput)
      }));
      
      // Sort by score descending
      matchScores.sort((a, b) => b.score - a.score);
      
      // Use the best match if score is above threshold
      if (matchScores.length > 0 && matchScores[0].score > 0.6) {
        return matchScores[0].dept._id;
      }
    }
    
    return ''; // No match found
  };

  // Handle Excel file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          setError("The uploaded Excel file is empty.");
          return;
        }

        setExcelData(jsonData);
        
        // Auto-map fields based on common headers
        const sampleRow = jsonData[0];
        const headers = Object.keys(sampleRow);
        const newMapping = { ...fieldMapping };

        headers.forEach(header => {
          const headerLower = header.toLowerCase();
          
          // Map fields based on common header names
          if (headerLower.includes('name') && !headerLower.includes('bank') && !headerLower.includes('site')) {
            newMapping.name = header;
          } else if (headerLower.includes('email')) {
            newMapping.email = header;
          } else if (headerLower.includes('type') || headerLower.includes('role')) {
            newMapping.userType = header;
          } else if ((headerLower.includes('employee') || headerLower.includes('manager')) && 
                     (headerLower.includes('id') || headerLower.includes('code'))) {
            newMapping.employeeId = header;
          } else if (headerLower.includes('department') || headerLower.includes('dept')) {
            newMapping.department = header;
          } else if (headerLower.includes('designation') || headerLower.includes('position') || headerLower.includes('title')) {
            newMapping.designation = header;
          } else if (headerLower.includes('gender')) {
            newMapping.gender = header;
          } else if (headerLower.includes('joining')) {
            newMapping.joiningDate = header;
          } else if (headerLower.includes('birth') || headerLower === 'dob') {
            newMapping.dob = header;
          } else if (headerLower.includes('pf')) {
            newMapping.PFNumber = header;
          } else if (headerLower.includes('esi')) {
            newMapping.ESINumber = header;
          } else if (headerLower.includes('account') || headerLower.includes('a/c')) {
            newMapping.accountNumber = header;
          } else if (headerLower === 'bank' || headerLower.includes('bank name')) {
            newMapping.bankName = header;
          } else if (headerLower.includes('ifsc')) {
            newMapping.IFSCCode = header;
          } else if (headerLower.includes('aadhar') || headerLower.includes('aadhaar')) {
            newMapping.aadhaarNo = header;
          } else if (headerLower.includes('salary')) {
            newMapping.salary = header;
          } else if (headerLower.includes('address')) {
            newMapping.address = header;
          } else if (headerLower.includes('contact') || headerLower.includes('phone') || headerLower.includes('mobile')) {
            newMapping.contactNumber = header;
          }
        });

        setFieldMapping(newMapping);
        setActiveStep(1);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        setError("Invalid Excel file format. Please upload a valid Excel file.");
      }
    };

    reader.onerror = () => {
      setError("Error reading the file. Please try again.");
    };

    reader.readAsArrayBuffer(file);
  };

  // Update field mapping
  const handleFieldMappingChange = (field, value) => {
    setFieldMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Parse date from various formats
  const parseDate = (dateValue) => {
    if (!dateValue) return '';
    
    // Handle Excel numeric dates
    if (typeof dateValue === 'number') {
      try {
        const excelDate = XLSX.SSF.parse_date_code(dateValue);
        return `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
      } catch (e) {
        return '';
      }
    }
    
    // Handle string dates
    if (typeof dateValue === 'string') {
      // Try various date formats
      const formats = [
        // ISO format
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
        // DD/MM/YYYY
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        // MM/DD/YYYY
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        // DD-MM-YYYY
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/
      ];
      
      for (const format of formats) {
        const match = dateValue.match(format);
        if (match) {
          try {
            // Different date parts based on format
            let year, month, day;
            
            if (format === formats[0]) { // ISO
              [, year, month, day] = match;
            } else if (format === formats[1]) { // DD/MM/YYYY
              [, day, month, year] = match;
            } else if (format === formats[2]) { // MM/DD/YYYY
              [, month, day, year] = match;
            } else if (format === formats[3]) { // DD-MM-YYYY
              [, day, month, year] = match;
            }
            
            // Parse as numbers and format to ISO
            year = parseInt(year, 10);
            month = parseInt(month, 10);
            day = parseInt(day, 10);
            
            if (year < 100) year += 2000; // Handle 2-digit years
            
            // Validate date parts
            if (month < 1 || month > 12) return '';
            if (day < 1 || day > 31) return '';
            
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          } catch (e) {
            continue;
          }
        }
      }
      
      // Try direct Date parsing as last resort
      try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        // Ignore error and return empty string
      }
    }
    
    return '';
  };

  // Process and validate data based on mapping
  const processData = () => {
    if (!excelData) return;

    try {
      const processed = excelData.map((row, index) => {
        // Extract values based on mapping
        const name = row[fieldMapping.name] || '';
        
        // Generate email if not provided
        let email = '';
        if (fieldMapping.email && row[fieldMapping.email]) {
          email = row[fieldMapping.email];
        } else {
          // Generate email from name: convert to lowercase, replace spaces with dots, add domain
          email = `${name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')}@example.com`;
        }
        
        // Determine user type
        let userType = 'employee'; // Default to employee
        if (fieldMapping.userType && row[fieldMapping.userType]) {
          const typeValue = row[fieldMapping.userType].toString().toLowerCase();
          userType = typeValue.includes('manager') ? 'manager' : 'employee';
        }
        
        // Get ID based on user type
        const employeeId = row[fieldMapping.employeeId] || `${userType === 'manager' ? 'MGR' : 'EMP'}${index + 1000}`;
        
        // Extract other fields
        const departmentName = row[fieldMapping.department] || '';
        const designation = row[fieldMapping.designation] || (userType === 'manager' ? 'Team Manager' : 'Employee');
        const gender = row[fieldMapping.gender] || '';
        const salary = fieldMapping.salary ? parseFloat(row[fieldMapping.salary]) || defaultSalary : defaultSalary;
        
        // Process dates
        const joiningDate = fieldMapping.joiningDate ? parseDate(row[fieldMapping.joiningDate]) : '';
        const dob = fieldMapping.dob ? parseDate(row[fieldMapping.dob]) : '';
        
        // Extract contact info
        const contactNumber = fieldMapping.contactNumber ? row[fieldMapping.contactNumber] || '' : '';
        const address = fieldMapping.address ? row[fieldMapping.address] || '' : '';
        
        // Find department ID based on name
        let departmentId = '';
        if (departmentName) {
          departmentId = fuzzyMatchDepartment(departmentName);
        }
        
        // Format address
        const addressObj = address ? {
          street: address,
          city: '',
          state: '',
          postalCode: '',
          country: 'India'
        } : null;

        // Setup salary info with bank details
        const salaryInfo = {
          basicSalary: salary,
          allowances: {
            DA: 0,
            HRA: 0,
            conveyance: 0,
            medical: 0,
            education: 0,
            performance: 0,
            special: 0,
            other: 0
          },
          deductions: {
            PF: 0,
            ESI: 0,
            PT: 0,
            TDS: 0,
            MLWF: 0,
            advance: 0,
            loan: 0,
            other: 0
          },
          PFNumber: fieldMapping.PFNumber ? row[fieldMapping.PFNumber] || '' : '',
          ESINumber: fieldMapping.ESINumber ? row[fieldMapping.ESINumber] || '' : '',
          aadhaarNo: fieldMapping.aadhaarNo ? row[fieldMapping.aadhaarNo] || '' : '',
          bankDetails: {
            accountNumber: fieldMapping.accountNumber ? row[fieldMapping.accountNumber] || '' : '',
            bankName: fieldMapping.bankName ? row[fieldMapping.bankName] || '' : '',
            IFSCCode: fieldMapping.IFSCode ? row[fieldMapping.IFSCode] || '' : '',
            paymentType: 'Bank Transfer',
            accountType: 'Savings'
          }
        };

        // Validate the processed data
        const validations = [];
        if (!name) validations.push('Name is required');
        if (!email.includes('@')) validations.push('Invalid email format');
        if (!employeeId) validations.push('ID is required');
        if (!departmentId) validations.push('Department not found in system');

        return {
          name,
          email,
          password: defaultPassword,
          userType,
          employeeId,
          department: departmentId,
          departmentName,
          designation,
          gender,
          dob,
          joiningDate,
          salaryInfo,
          salary,
          company: 'Maximize Market Research Pvt. Ltd.',
          status: 'active',
          primaryContactNo: contactNumber,
          address: addressObj,
          validations,
          originalRow: row,
          selectedTeams: [] // For manager team assignment
        };
      });

      setMappedData(processed);
      setActiveStep(2);
    } catch (error) {
      console.error("Error processing data:", error);
      setError("Error processing your data. Please check your mappings and try again.");
    }
  };

  // Filter mapped data based on filter options
  const filteredMappedData = React.useMemo(() => {
    return mappedData.filter(item => {
      // Filter by validation status
      if (filterOptions.showOnlyInvalid && item.validations.length === 0) {
        return false;
      }
      
      // Filter by user type
      if (filterOptions.filterUserType !== 'all' && item.userType !== filterOptions.filterUserType) {
        return false;
      }
      
      // Filter by department
      if (filterOptions.filterDepartment !== 'all' && item.departmentName !== filterOptions.filterDepartment) {
        return false;
      }
      
      return true;
    });
  }, [mappedData, filterOptions]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      showOnlyInvalid: false,
      filterUserType: 'all',
      filterDepartment: 'all'
    });
  };

  // Start the import process
  const startImport = async () => {
    setProcessing(true);
    setResults([]);
    setUploadProgress(0);
    setCurrentProcessingIndex(-1);
    setIsPaused(false);
    
    // Filter out rows with validations
    const validRows = mappedData.filter(row => row.validations.length === 0);
    
    if (validRows.length === 0) {
      setError("No valid rows to import.");
      setProcessing(false);
      return;
    }
    
    setActiveStep(3);
    
    // Process each row one by one
    for (let i = 0; i < validRows.length; i++) {
      // Check if the process is paused
      if (isPaused) {
        // Wait until unpaused
        await new Promise(resolve => {
          const checkPause = () => {
            if (!isPaused) {
              resolve();
            } else {
              setTimeout(checkPause, 1000);
            }
          };
          checkPause();
        });
      }
      
      setCurrentProcessingIndex(i);
      const row = validRows[i];
      
      try {
        // Prepare data for API call
        const userData = {
          name: row.name,
          email: row.email,
          password: row.password,
          userType: row.userType,
          department: row.department,
          designation: row.designation,
          salary: row.salary,
          gender: row.gender,
          dob: row.dob,
          joiningDate: row.joiningDate,
          status: row.status,
          company: row.company,
          
          // Use different ID field name based on user type
          [row.userType === 'manager' ? 'managerId' : 'employeeId']: row.employeeId,
          
          // Additional contact info
          primaryContactNo: row.primaryContactNo,
          address: row.address,
          
          // Salary info with bank details
          salaryInfo: row.salaryInfo
        };
        
        // Create the user
        const response = await axios.post(
          `${config.API_URL}/api/user-profile/create`,
          userData,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('token')}`,
              "Content-Type": "application/json"
            }
          }
        );
        
        if (response.data.success) {
          // If manager and teams are selected, assign teams
          if (row.userType === 'manager' && row.selectedTeams && row.selectedTeams.length > 0) {
            try {
              // Get the manager ID from the response
              const managerId = response.data.managerId;
              
              // Assign teams to the manager
              for (const teamId of row.selectedTeams) {
                await axios.put(
                  `${config.API_URL}/api/team/${teamId}`,
                  { managerId },
                  {
                    headers: {
                      "Authorization": `Bearer ${localStorage.getItem('token')}`,
                      "Content-Type": "application/json"
                    }
                  }
                );
              }
            } catch (teamError) {
              console.error("Error assigning teams:", teamError);
            }
          }
          
          setResults(prev => [...prev, {
            index: i,
            row: row,
            success: true,
            message: `${row.userType === 'manager' ? 'Manager' : 'Employee'} created successfully`,
            id: response.data.userProfileId
          }]);
        } else {
          setResults(prev => [...prev, {
            index: i,
            row: row,
            success: false,
            message: response.data.error || "Failed to create user"
          }]);
        }
      } catch (error) {
        console.error(`Error creating user ${row.name}:`, error);
        setResults(prev => [...prev, {
          index: i,
          row: row,
          success: false,
          message: error.response?.data?.error || "Server error"
        }]);
      }
      
      // Update progress
      setUploadProgress(Math.round(((i + 1) / validRows.length) * 100));
      
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setCurrentProcessingIndex(-1);
    setProcessing(false);
  };

  // Toggle pause/resume
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Edit a mapped item
  const handleEditItem = (item) => {
    setCurrentEditingItem(item);
    setEditDialogOpen(true);
  };

  // Update the edited item
  const handleSaveEdit = () => {
    setMappedData(prev => prev.map(item => 
      item === currentEditingItem ? currentEditingItem : item
    ));
    setEditDialogOpen(false);
  };

  // Remove an item from import
  const handleRemoveItem = (index) => {
    setMappedData(prev => prev.filter((_, i) => i !== index));
  };

  // Extract unique departments from mapped data
  const uniqueDepartments = React.useMemo(() => {
    const deptSet = new Set();
    mappedData.forEach(item => {
      if (item.departmentName) {
        deptSet.add(item.departmentName);
      }
    });
    return Array.from(deptSet);
  }, [mappedData]);

  // Get statistics for the current data
  const dataStats = React.useMemo(() => {
    return {
      total: mappedData.length,
      valid: mappedData.filter(d => d.validations.length === 0).length,
      invalid: mappedData.filter(d => d.validations.length > 0).length,
      employees: mappedData.filter(d => d.userType === 'employee').length,
      managers: mappedData.filter(d => d.userType === 'manager').length
    };
  }, [mappedData]);

  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Upload your Excel file containing employee and manager data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The file should contain columns with user details like name, email, etc.
            </Typography>
            
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={downloadTemplate}
              >
                Download Template
              </Button>
              
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUpload />}
              >
                Upload Excel File
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            </Stack>
            
            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
              <Typography variant="h6" gutterBottom>
                Excel Format Guidelines
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                For best results, your Excel file should include these columns:
              </Typography>
              
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">Required Fields:</Typography>
                  <Typography variant="body2" component="div">
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Name</li>
                      <li>Email</li>
                      <li>User Type (employee/manager)</li>
                      <li>Employee/Manager ID</li>
                      <li>Department</li>
                    </ul>
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">Recommended Fields:</Typography>
                  <Typography variant="body2" component="div">
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Designation</li>
                      <li>Joining Date</li>
                      <li>Salary</li>
                      <li>Gender</li>
                      <li>Bank & PF/ESI Details</li></ul>
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="body2" color="text.secondary">
                Download the template above to see the recommended format. The system will attempt to automatically map your columns during import.
              </Typography>
            </Box>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Map Excel Columns to User Fields
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select which column from your Excel file corresponds to each user field.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.neutral' }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Required Fields
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Name Column</InputLabel>
                        <Select
                          value={fieldMapping.name}
                          onChange={(e) => handleFieldMappingChange('name', e.target.value)}
                          label="Name Column"
                          required
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Email Column</InputLabel>
                        <Select
                          value={fieldMapping.email}
                          onChange={(e) => handleFieldMappingChange('email', e.target.value)}
                          label="Email Column"
                        >
                          <MenuItem value="">&lt;Generate Email&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>User Type Column</InputLabel>
                        <Select
                          value={fieldMapping.userType}
                          onChange={(e) => handleFieldMappingChange('userType', e.target.value)}
                          label="User Type Column"
                        >
                          <MenuItem value="">&lt;Default to Employee&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Employee/Manager ID Column</InputLabel>
                        <Select
                          value={fieldMapping.employeeId}
                          onChange={(e) => handleFieldMappingChange('employeeId', e.target.value)}
                          label="Employee/Manager ID Column"
                        >
                          <MenuItem value="">&lt;Generate ID&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Department Column</InputLabel>
                        <Select
                          value={fieldMapping.department}
                          onChange={(e) => handleFieldMappingChange('department', e.target.value)}
                          label="Department Column"
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={useFuzzyMatching}
                            onChange={(e) => setUseFuzzyMatching(e.target.checked)}
                          />
                        }
                        label="Use fuzzy matching for department names"
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Helps match department names that don't match exactly
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Default Password"
                        value={defaultPassword}
                        onChange={(e) => setDefaultPassword(e.target.value)}
                        size="small"
                        helperText="Used for all imported users"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Default Salary"
                        type="number"
                        value={defaultSalary}
                        onChange={(e) => setDefaultSalary(Number(e.target.value))}
                        size="small"
                        helperText="Used if salary is not provided"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.neutral' }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Optional Fields
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Designation Column</InputLabel>
                        <Select
                          value={fieldMapping.designation}
                          onChange={(e) => handleFieldMappingChange('designation', e.target.value)}
                          label="Designation Column"
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Gender Column</InputLabel>
                        <Select
                          value={fieldMapping.gender}
                          onChange={(e) => handleFieldMappingChange('gender', e.target.value)}
                          label="Gender Column"
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Joining Date Column</InputLabel>
                        <Select
                          value={fieldMapping.joiningDate}
                          onChange={(e) => handleFieldMappingChange('joiningDate', e.target.value)}
                          label="Joining Date Column"
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Date of Birth Column</InputLabel>
                        <Select
                          value={fieldMapping.dob}
                          onChange={(e) => handleFieldMappingChange('dob', e.target.value)}
                          label="Date of Birth Column"
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Salary Column</InputLabel>
                        <Select
                          value={fieldMapping.salary}
                          onChange={(e) => handleFieldMappingChange('salary', e.target.value)}
                          label="Salary Column"
                        >
                          <MenuItem value="">&lt;Use Default Salary&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Contact Number Column</InputLabel>
                        <Select
                          value={fieldMapping.contactNumber}
                          onChange={(e) => handleFieldMappingChange('contactNumber', e.target.value)}
                          label="Contact Number Column"
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Address Column</InputLabel>
                        <Select
                          value={fieldMapping.address}
                          onChange={(e) => handleFieldMappingChange('address', e.target.value)}
                          label="Address Column"
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Divider sx={{ my: 2, width: '100%' }} />
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Bank & Statutory Information
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>PF Number Column</InputLabel>
                        <Select
                          value={fieldMapping.PFNumber}
                          onChange={(e) => handleFieldMappingChange('PFNumber', e.target.value)}
                          label="PF Number Column"
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>ESI Number Column</InputLabel>
                        <Select
                          value={fieldMapping.ESINumber}
                          onChange={(e) => handleFieldMappingChange('ESINumber', e.target.value)}
                          label="ESI Number Column"
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Bank Account Number</InputLabel>
                        <Select
                          value={fieldMapping.accountNumber}
                          onChange={(e) => handleFieldMappingChange('accountNumber', e.target.value)}
                          label="Bank Account Number"
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Bank Name Column</InputLabel>
                        <Select
                          value={fieldMapping.bankName}
                          onChange={(e) => handleFieldMappingChange('bankName', e.target.value)}
                          label="Bank Name Column"
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>IFSC Code Column</InputLabel>
                        <Select
                          value={fieldMapping.IFSCCode}
                          onChange={(e) => handleFieldMappingChange('IFSCCode', e.target.value)}
                          label="IFSC Code Column"
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Aadhaar Number Column</InputLabel>
                        <Select
                          value={fieldMapping.aadhaarNo}
                          onChange={(e) => handleFieldMappingChange('aadhaarNo', e.target.value)}
                          label="Aadhaar Number Column"
                        >
                          <MenuItem value="">&lt;Not Mapped&gt;</MenuItem>
                          {excelData && Object.keys(excelData[0]).map(header => (
                            <MenuItem key={header} value={header}>{header}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
            
            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="contained" 
                onClick={processData}
                disabled={!fieldMapping.name || (!fieldMapping.department && departments.length > 0)}
              >
                Continue
              </Button>
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Validate Data Before Import
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review the mapped data before importing. Edit or remove any rows with issues.
            </Typography>
            
            {/* Stats cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={4} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h4" color="primary.main">
                    {dataStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} sm={4} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {dataStats.valid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valid Records
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} sm={4} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h4" color="error.main">
                    {dataStats.invalid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Invalid Records
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} sm={6} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h4" color="info.main">
                    {dataStats.employees}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Employees
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} sm={6} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="h4" color="warning.main">
                    {dataStats.managers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Managers
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Filter controls */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
              <FilterList color="primary" />
              <Typography variant="subtitle2" sx={{ mr: 1 }}>
                Filters:
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={filterOptions.showOnlyInvalid}
                    onChange={(e) => handleFilterChange('showOnlyInvalid', e.target.checked)}
                  />
                }
                label="Show only invalid"
                sx={{ mr: 2 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>User Type</InputLabel>
                <Select
                  value={filterOptions.filterUserType}
                  onChange={(e) => handleFilterChange('filterUserType', e.target.value)}
                  label="User Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="employee">Employees Only</MenuItem>
                  <MenuItem value="manager">Managers Only</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterOptions.filterDepartment}
                  onChange={(e) => handleFilterChange('filterDepartment', e.target.value)}
                  label="Department"
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {uniqueDepartments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <IconButton 
                color="primary" 
                size="small" 
                onClick={resetFilters}
                title="Reset Filters"
              >
                <Refresh />
              </IconButton>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <Button
                variant="contained"
                onClick={startImport}
                disabled={dataStats.valid === 0}
              >
                Import Valid Records ({dataStats.valid})
              </Button>
            </Paper>
            
            {/* Table of records */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>User Type</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMappedData.length > 0 ? (
                    filteredMappedData.map((row, index) => (
                      <TableRow key={index} hover sx={{ 
                        bgcolor: row.validations.length > 0 ? 'rgba(239, 83, 80, 0.07)' : undefined
                      }}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>
                          <Chip
                            icon={row.userType === 'manager' ? <Business fontSize="small" /> : <Person fontSize="small" />}
                            label={row.userType === 'manager' ? 'Manager' : 'Employee'}
                            size="small"
                            color={row.userType === 'manager' ? 'primary' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{row.employeeId}</TableCell>
                        <TableCell>{row.departmentName}</TableCell>
                        <TableCell>{row.designation}</TableCell>
                        <TableCell>
                          {row.validations.length > 0 ? (
                            <Tooltip title={row.validations.join(', ')}>
                              <Chip 
                                icon={<Error fontSize="small" />}
                                label={`${row.validations.length} Issues`} 
                                color="error"
                                size="small"
                              />
                            </Tooltip>
                          ) : (
                            <Chip 
                              icon={<Check fontSize="small" />}
                              label="Valid" 
                              color="success"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleEditItem(row)} title="Edit">
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleRemoveItem(index)} title="Remove">
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No records found matching the current filters.
                        </Typography>
                        {Object.values(filterOptions).some(v => v !== 'all' && v !== false) && (
                          <Button
                            startIcon={<Refresh />}
                            onClick={resetFilters}
                            size="small"
                            sx={{ mt: 1 }}
                          >
                            Reset Filters
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
          </Box>
        );
      
      case 3:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Importing Users
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {processing ? (
                  isPaused ? 
                  'Import paused. Click resume to continue.' :
                  `Importing user ${currentProcessingIndex + 1} of ${mappedData.filter(d => d.validations.length === 0).length}...`
                ) : (
                  results.length > 0 ? 
                  `Import complete. ${results.filter(r => r.success).length} of ${results.length} users imported successfully.` :
                  'Ready to start importing users.'
                )}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${uploadProgress}%`}</Typography>
                </Box>
              </Box>
            </Box>
            
            {processing && (
              <Button
                variant="outlined"
                startIcon={isPaused ? <PlayArrow /> : <Pause />}
                onClick={togglePause}
                sx={{ mb: 3 }}
              >
                {isPaused ? 'Resume Import' : 'Pause Import'}
              </Button>
            )}
            
            {/* Results summary */}
            {results.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h4" color="primary.main">
                        {results.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Processed
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h4" color="success.main">
                        {results.filter(r => r.success).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Successful
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h4" color="error.main">
                        {results.filter(r => !r.success).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Failed
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Results table */}
            {results.length > 0 && (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>User Type</TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Message</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index} hover sx={{ 
                        bgcolor: result.success ? 'rgba(76, 175, 80, 0.07)' : 'rgba(239, 83, 80, 0.07)'
                      }}>
                        <TableCell>{result.row.name}</TableCell>
                        <TableCell>{result.row.email}</TableCell>
                        <TableCell>{result.row.userType === 'manager' ? 'Manager' : 'Employee'}</TableCell>
                        <TableCell>{result.row.employeeId}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={result.success ? <Check fontSize="small" /> : <Error fontSize="small" />}
                            label={result.success ? "Success" : "Failed"} 
                            color={result.success ? "success" : "error"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{result.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/admin-dashboard/user-profiles')}
                disabled={processing}
              >
                {results.length > 0 ? 'View All User Profiles' : 'Cancel'}
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };
  
  // Edit dialog content
  const renderEditDialog = () => {
    if (!currentEditingItem) return null;
    
    return (
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit User Information
          <IconButton
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={currentEditingItem.name}
                onChange={(e) => setCurrentEditingItem({
                  ...currentEditingItem,
                  name: e.target.value
                })}
                required
              /></Grid>
            
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={currentEditingItem.email}
                  onChange={(e) => setCurrentEditingItem({
                    ...currentEditingItem,
                    email: e.target.value
                  })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>User Type</InputLabel>
                  <Select
                    value={currentEditingItem.userType}
                    onChange={(e) => setCurrentEditingItem({
                      ...currentEditingItem,
                      userType: e.target.value
                    })}
                    label="User Type"
                  >
                    <MenuItem value="employee">Employee</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={currentEditingItem.userType === 'manager' ? "Manager ID" : "Employee ID"}
                  value={currentEditingItem.employeeId}
                  onChange={(e) => setCurrentEditingItem({
                    ...currentEditingItem,
                    employeeId: e.target.value
                  })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={currentEditingItem.department}
                    onChange={(e) => {
                      const dept = departments.find(d => d._id === e.target.value);
                      setCurrentEditingItem({
                        ...currentEditingItem,
                        department: e.target.value,
                        departmentName: dept ? dept.dep_name : ''
                      });
                    }}
                    label="Department"
                    required
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.dep_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={currentEditingItem.designation}
                  onChange={(e) => setCurrentEditingItem({
                    ...currentEditingItem,
                    designation: e.target.value
                  })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={currentEditingItem.gender}
                    onChange={(e) => setCurrentEditingItem({
                      ...currentEditingItem,
                      gender: e.target.value
                    })}
                    label="Gender"
                  >
                    <MenuItem value="">Not Specified</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={currentEditingItem.dob || ''}
                  onChange={(e) => setCurrentEditingItem({
                    ...currentEditingItem,
                    dob: e.target.value
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Joining Date"
                  type="date"
                  value={currentEditingItem.joiningDate || ''}
                  onChange={(e) => setCurrentEditingItem({
                    ...currentEditingItem,
                    joiningDate: e.target.value
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Salary"
                  type="number"
                  value={currentEditingItem.salary}
                  onChange={(e) => setCurrentEditingItem({
                    ...currentEditingItem,
                    salary: Number(e.target.value),
                    salaryInfo: {
                      ...currentEditingItem.salaryInfo,
                      basicSalary: Number(e.target.value)
                    }
                  })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  value={currentEditingItem.primaryContactNo || ''}
                  onChange={(e) => setCurrentEditingItem({
                    ...currentEditingItem,
                    primaryContactNo: e.target.value
                  })}
                />
              </Grid>
              
              {/* Team assignment for managers */}
              {currentEditingItem.userType === 'manager' && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Team Assignment
                  </Typography>
                  
                  <FormControl fullWidth>
                    <Autocomplete
                      multiple
                      options={teams}
                      getOptionLabel={(option) => option.name}
                      value={teams.filter(team => currentEditingItem.selectedTeams.includes(team._id))}
                      onChange={(e, newValue) => {
                        setCurrentEditingItem({
                          ...currentEditingItem,
                          selectedTeams: newValue.map(team => team._id)
                        });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Assign Teams"
                          placeholder="Select teams"
                        />
                      )}
                    />
                  </FormControl>
                  <Typography variant="caption" color="text.secondary">
                    Teams will be assigned to this manager after import
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Bank & Statutory Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="PF Number"
                  value={currentEditingItem.salaryInfo?.PFNumber || ''}
                  onChange={(e) => setCurrentEditingItem({
                    ...currentEditingItem,
                    salaryInfo: {
                      ...currentEditingItem.salaryInfo,
                      PFNumber: e.target.value
                    }
                  })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ESI Number"
                  value={currentEditingItem.salaryInfo?.ESINumber || ''}
                  onChange={(e) => setCurrentEditingItem({
                    ...currentEditingItem,
                    salaryInfo: {
                      ...currentEditingItem.salaryInfo,
                      ESINumber: e.target.value
                    }
                  })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bank Account Number"
                  value={currentEditingItem.salaryInfo?.bankDetails?.accountNumber || ''}
                  onChange={(e) => setCurrentEditingItem({
                    ...currentEditingItem,
                    salaryInfo: {
                      ...currentEditingItem.salaryInfo,
                      bankDetails: {
                        ...currentEditingItem.salaryInfo.bankDetails,
                        accountNumber: e.target.value
                      }
                    }
                  })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  value={currentEditingItem.salaryInfo?.bankDetails?.bankName || ''}
                  onChange={(e) => setCurrentEditingItem({
                    ...currentEditingItem,
                    salaryInfo: {
                      ...currentEditingItem.salaryInfo,
                      bankDetails: {
                        ...currentEditingItem.salaryInfo.bankDetails,
                        bankName: e.target.value
                      }
                    }
                  })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="IFSC Code"
                  value={currentEditingItem.salaryInfo?.bankDetails?.IFSCCode || ''}
                  onChange={(e) => setCurrentEditingItem({
                    ...currentEditingItem,
                    salaryInfo: {
                      ...currentEditingItem.salaryInfo,
                      bankDetails: {
                        ...currentEditingItem.salaryInfo.bankDetails,
                        IFSCCode: e.target.value
                      }
                    }
                  })}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Aadhaar Number"
                  value={currentEditingItem.salaryInfo?.aadhaarNo || ''}
                  onChange={(e) => setCurrentEditingItem({
                    ...currentEditingItem,
                    salaryInfo: {
                      ...currentEditingItem.salaryInfo,
                      aadhaarNo: e.target.value
                    }
                  })}
                />
              </Grid>
              
              {/* Display validation errors if any */}
              {currentEditingItem.validations && currentEditingItem.validations.length > 0 && (
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Please fix the following issues:
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {currentEditingItem.validations.map((validation, index) => (
                        <li key={index}>{validation}</li>
                      ))}
                    </ul>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      );
    };
  
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin-dashboard/user-profiles')}
          sx={{ mb: 4 }}
        >
          Back to User Profiles
        </Button>
  
        <Paper elevation={0} sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Bulk Import Users
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Import multiple employees and managers from an Excel file
            </Typography>
          </Box>
          
          <Box sx={{ px: 3, pt: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          
          <Box sx={{ p: 3 }}>
            {getStepContent(activeStep)}
          </Box>
        </Paper>
        
        {renderEditDialog()}
      </Box>
    );
  };
  
  export default BulkUserImport;