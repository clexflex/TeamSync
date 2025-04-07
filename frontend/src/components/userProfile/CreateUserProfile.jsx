import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Select, MenuItem,
  Button, Grid, FormControl, InputLabel, IconButton,
  Stack, Alert, Avatar, styled, Stepper, Step, StepLabel, InputAdornment,
  Tabs, Tab, Divider, Card, CardContent, Radio, RadioGroup, FormControlLabel,
  FormLabel
} from '@mui/material';
import { ArrowBack, CloudUpload, Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import config from "../../config";

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const steps = ['User Type', 'Basic Information', 'Employment Details', 'Additional Information', 'Confirm'];

const CreateUserProfile = () => {
  const [departments, setDepartments] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    userType: '',
    name: '',
    email: '',
    password: '',
    employeeId: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    designation: '',
    department: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'active',

    // Personal Information
    companyEmail: '',
    location: '',
    primaryContactNo: '',
    bloodGroup: '',
    nationality: 'Indian',
    marriageDate: '',
    spouse: '',
    fatherName: '',
    religion: '',
    physicallyHandicapped: false,
    height: '',
    weight: '',
    
    // Address
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    },
    
    // Education Information
    education: [{
      degree: '',
      institute: '',
      startDate: '',
      endDate: '',
      grade: ''
    }],
    
    // Employment & Job Information
    confirmationDate: '',
    noticePeriod: '',
    employmentStatus: 'Probation',
    currentCompanyExperience: '',
    previousExperience: '',
    totalExperience: '',
    probationPeriod: '3',
    
    // Previous Employment
    previousEmployment: [{
      company: '',
      designation: '',
      startDate: '',
      endDate: '',
      reasonForLeaving: ''
    }],

    // Salary & Bank details
    salaryInfo: {
      basicSalary: 0,
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
      // Accounts & Statutory Information
      PFNumber: '',
      ESINumber: '',
      PAN: '',
      passportNo: '',
      aadhaarNo: '',
      bankDetails: {
        accountNumber: '',
        bankName: '',
        branchName: '',
        IFSCCode: '',
        paymentType: 'Bank Transfer',
        accountType: 'Savings',
        ddPayableAt: '',
        nameAsPerBank: ''
      }
    }
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/department`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("Failed to load departments. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "image" && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      setPreviewImage(URL.createObjectURL(files[0]));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData(prev => ({ ...prev, education: newEducation }));
  };

  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: '', institute: '', startDate: '', endDate: '', grade: '' }
      ]
    }));
  };

  const handleRemoveEducation = (index) => {
    const newEducation = [...formData.education];
    newEducation.splice(index, 1);
    setFormData(prev => ({ ...prev, education: newEducation }));
  };

  const handlePreviousEmploymentChange = (index, field, value) => {
    const newEmployment = [...formData.previousEmployment];
    newEmployment[index][field] = value;
    setFormData(prev => ({ ...prev, previousEmployment: newEmployment }));
  };

  const handleAddPreviousEmployment = () => {
    setFormData(prev => ({
      ...prev,
      previousEmployment: [
        ...prev.previousEmployment,
        { company: '', designation: '', startDate: '', endDate: '', reasonForLeaving: '' }
      ]
    }));
  };

  const handleRemovePreviousEmployment = (index) => {
    const newEmployment = [...formData.previousEmployment];
    newEmployment.splice(index, 1);
    setFormData(prev => ({ ...prev, previousEmployment: newEmployment }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateStep = (step) => {
    setError('');
    if (step === 0 && !formData.userType) {
      setError('Please select a user type');
      return false;
    }
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill all required fields');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.employeeId || !formData.department || !formData.designation) {
        setError('Please fill all required fields');
        return false;
      }
      if (formData.userType === 'employee' && !formData.salary) {
        setError('Please enter a salary');
        return false;
      }
    }
    return true;
  };

  const handleSalaryChange = (category, field, value) => {
    const numValue = category === 'allowances' || category === 'deductions' || field === 'basicSalary'
      ? (parseFloat(value) || 0)
      : value;

    if (category === 'bankDetails') {
      setFormData(prev => ({
        ...prev,
        salaryInfo: {
          ...prev.salaryInfo,
          bankDetails: {
            ...prev.salaryInfo.bankDetails,
            [field]: numValue
          }
        }
      }));
    } else if (category === 'allowances' || category === 'deductions') {
      setFormData(prev => ({
        ...prev,
        salaryInfo: {
          ...prev.salaryInfo,
          [category]: {
            ...prev.salaryInfo[category],
            [field]: numValue
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        salaryInfo: {
          ...prev.salaryInfo,
          [field]: numValue
        }
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formDataObj = new FormData();
      
      // Flatten nested objects for FormData
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (typeof formData[key] === 'object' && !(formData[key] instanceof File)) {
            formDataObj.append(key, JSON.stringify(formData[key]));
          } else {
            formDataObj.append(key, formData[key]);
          }
        }
      });

      const response = await axios.post(
        `${config.API_URL}/api/user-profile/create`,
        formDataObj,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data.success) {
        navigate("/admin-dashboard/user-profiles");
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create user profile');
    } finally {
      setLoading(false);
    }
  };

  // Render basic information step
  const renderBasicInfoStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} display="flex" justifyContent="center">
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={previewImage}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUpload />}
            size="small"
          >
            Upload Photo
            <VisuallyHiddenInput
              type="file"
              name="image"
              onChange={handleChange}
              accept="image/*"
            />
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Date of Birth"
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select
            name="gender"
            label="Gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Marital Status</InputLabel>
          <Select
            name="maritalStatus"
            label="Marital Status"
            value={formData.maritalStatus}
            onChange={handleChange}
          >
            <MenuItem value="single">Single</MenuItem>
            <MenuItem value="married">Married</MenuItem>
            <MenuItem value="divorced">Divorced</MenuItem>
            <MenuItem value="widowed">Widowed</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  // Render employment details step
  const renderEmploymentDetailsStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={formData.userType === 'employee' ? "Employee ID" : "Manager ID"}
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Designation"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Department</InputLabel>
          <Select
            name="department"
            label="Department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            {departments.map(dep => (
              <MenuItem key={dep._id} value={dep._id}>
                {dep.dep_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Joining Date"
          name="joiningDate"
          type="date"
          value={formData.joiningDate}
          onChange={handleChange}
          required
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {formData.userType === 'employee' && (
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Salary"
            name="salary"
            type="number"
            value={formData.salary}
            onChange={handleChange}
            required
          />
        </Grid>
      )}

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Confirmation Date"
          name="confirmationDate"
          type="date"
          value={formData.confirmationDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Notice Period (days)"
          name="noticePeriod"
          type="number"
          value={formData.noticePeriod}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Employment Status</InputLabel>
          <Select
            name="employmentStatus"
            label="Employment Status"
            value={formData.employmentStatus}
            onChange={handleChange}
          >
            <MenuItem value="Probation">Probation</MenuItem>
            <MenuItem value="Confirmed">Confirmed</MenuItem>
            <MenuItem value="Contract">Contract</MenuItem>
            <MenuItem value="Intern">Intern</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Probation Period (months)"
          name="probationPeriod"
          type="number"
          value={formData.probationPeriod}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Previous Experience (years)"
          name="previousExperience"
          type="number"
          value={formData.previousExperience}
          onChange={handleChange}
          InputProps={{ inputProps: { min: 0, step: 0.1 } }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Current Company Experience (years)"
          name="currentCompanyExperience"
          type="number"
          value={formData.currentCompanyExperience}
          onChange={handleChange}
          InputProps={{ inputProps: { min: 0, step: 0.1 } }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Total Experience (years)"
          name="totalExperience"
          type="number"
          value={formData.totalExperience}
          onChange={handleChange}
          InputProps={{ inputProps: { min: 0, step: 0.1 } }}
        />
      </Grid>
    </Grid>
  );

  // Render additional information step with tabs
  const renderAdditionalInfoStep = () => (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="user profile tabs">
          <Tab label="Personal Info" />
          <Tab label="Contact & Address" />
          <Tab label="Education" />
          <Tab label="Previous Employment" />
          <Tab label="Salary & Bank" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company Email"
              name="companyEmail"
              value={formData.companyEmail}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Primary Contact Number"
              name="primaryContactNo"
              value={formData.primaryContactNo}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Blood Group</InputLabel>
              <Select
                name="bloodGroup"
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
            />
          </Grid>
          {formData.maritalStatus === 'married' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Marriage Date"
                  name="marriageDate"
                  type="date"
                  value={formData.marriageDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Spouse Name"
                  name="spouse"
                  value={formData.spouse}
                  onChange={handleChange}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Father's Name"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Religion"
              name="religion"
              value={formData.religion}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Radio
                  checked={formData.physicallyHandicapped === true}
                  onChange={() => setFormData(prev => ({ ...prev, physicallyHandicapped: true }))}
                />
              }
              label="Yes"
            />
            <FormControlLabel
              control={
                <Radio
                  checked={formData.physicallyHandicapped === false}
                  onChange={() => setFormData(prev => ({ ...prev, physicallyHandicapped: false }))}
                />
              }
              label="No"
            />
            <FormLabel component="legend">Physically Challenged</FormLabel>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Height (cm)"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Weight (kg)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Address Information</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              name="street"
              value={formData.address.street}
              onChange={handleAddressChange}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.address.city}
              onChange={handleAddressChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="State/Province"
              name="state"
              value={formData.address.state}
              onChange={handleAddressChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Postal Code"
              name="postalCode"
              value={formData.address.postalCode}
              onChange={handleAddressChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.address.country}
              onChange={handleAddressChange}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Education Information</Typography>
          <Button 
            variant="outlined" 
            startIcon={<Add />} 
            onClick={handleAddEducation}
          >
            Add Education
          </Button>
        </Box>
        
        {formData.education.map((edu, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Education #{index + 1}
                </Typography>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => handleRemoveEducation(index)}
                  disabled={formData.education.length === 1}
                >
                  <Delete />
                </IconButton>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Degree/Certification"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Institute/University"
                    value={edu.institute}
                    onChange={(e) => handleEducationChange(index, 'institute', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={edu.startDate}
                    onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={edu.endDate}
                    onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Grade/Percentage"
                    value={edu.grade}
                    onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Previous Employment</Typography>
          <Button 
            variant="outlined" 
            startIcon={<Add />} 
            onClick={handleAddPreviousEmployment}
          >
            Add Employment
          </Button>
        </Box>
        
        {formData.previousEmployment.map((emp, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Previous Job #{index + 1}
                </Typography>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => handleRemovePreviousEmployment(index)}
                >
                  <Delete />
                </IconButton>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={emp.company}
                    onChange={(e) => handlePreviousEmploymentChange(index, 'company', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Designation"
                    value={emp.designation}
                    onChange={(e) => handlePreviousEmploymentChange(index, 'designation', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={emp.startDate}
                    onChange={(e) => handlePreviousEmploymentChange(index, 'startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={emp.endDate}
                    onChange={(e) => handlePreviousEmploymentChange(index, 'endDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Leaving"
                    value={emp.reasonForLeaving}
                    onChange={(e) => handlePreviousEmploymentChange(index, 'reasonForLeaving', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Salary Information
            </Typography>
          </Grid>

          {/* Basic Salary */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Basic Salary"
              type="number"
              value={formData.salaryInfo.basicSalary}
              onChange={(e) => handleSalaryChange(null, 'basicSalary', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>
              }}
            />
          </Grid>

          {/* PF Number */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="PF Number"
              value={formData.salaryInfo.PFNumber}
              onChange={(e) => handleSalaryChange(null, 'PFNumber', e.target.value)}
            />
          </Grid>

          {/* ESI Number */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ESI Number"
              value={formData.salaryInfo.ESINumber}
              onChange={(e) => handleSalaryChange(null, 'ESINumber', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="PAN Number"
              value={formData.salaryInfo.PAN}
              onChange={(e) => handleSalaryChange(null, 'PAN', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Passport Number"
              value={formData.salaryInfo.passportNo}
              onChange={(e) => handleSalaryChange(null, 'passportNo', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Aadhaar Number"
              value={formData.salaryInfo.aadhaarNo}
              onChange={(e) => handleSalaryChange(null, 'aadhaarNo', e.target.value)}
            />
          </Grid>

          {/* Allowances Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}>
              Allowances
            </Typography>
            <Divider />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Dearness Allowance (DA)"
              type="number"
              value={formData.salaryInfo.allowances.DA}
              onChange={(e) => handleSalaryChange('allowances', 'DA', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="House Rent Allowance (HRA)"
              type="number"
              value={formData.salaryInfo.allowances.HRA}
              onChange={(e) => handleSalaryChange('allowances', 'HRA', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Conveyance Allowance"
              type="number"
              value={formData.salaryInfo.allowances.conveyance}
              onChange={(e) => handleSalaryChange('allowances', 'conveyance', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>
              }}
            />
          </Grid>

          {/* Deductions Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}>
              Deductions
            </Typography>
            <Divider />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Provident Fund (PF)"
              type="number"
              value={formData.salaryInfo.deductions.PF}
              onChange={(e) => handleSalaryChange('deductions', 'PF', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Employee State Insurance (ESI)"
              type="number"
              value={formData.salaryInfo.deductions.ESI}
              onChange={(e) => handleSalaryChange('deductions', 'ESI', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Professional Tax (PT)"
              type="number"
              value={formData.salaryInfo.deductions.PT}
              onChange={(e) => handleSalaryChange('deductions', 'PT', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>
              }}
            />
          </Grid>

          {/* Bank Details Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}>
              Bank Details
            </Typography>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Bank Name"
              value={formData.salaryInfo.bankDetails.bankName}
              onChange={(e) => handleSalaryChange('bankDetails', 'bankName', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Number"
              value={formData.salaryInfo.bankDetails.accountNumber}
              onChange={(e) => handleSalaryChange('bankDetails', 'accountNumber', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Branch Name"
              value={formData.salaryInfo.bankDetails.branchName}
              onChange={(e) => handleSalaryChange('bankDetails', 'branchName', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="IFSC Code"
              value={formData.salaryInfo.bankDetails.IFSCCode}
              onChange={(e) => handleSalaryChange('bankDetails', 'IFSCCode', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Type</InputLabel>
              <Select
                value={formData.salaryInfo.bankDetails.paymentType}
                onChange={(e) => handleSalaryChange('bankDetails', 'paymentType', e.target.value)}
                label="Payment Type"
              >
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Check">Check</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={formData.salaryInfo.bankDetails.accountType}
                onChange={(e) => handleSalaryChange('bankDetails', 'accountType', e.target.value)}
                label="Account Type"
              >
                <MenuItem value="Savings">Savings</MenuItem>
                <MenuItem value="Current">Current</MenuItem>
                <MenuItem value="Salary">Salary</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="DD Payable At"
              value={formData.salaryInfo.bankDetails.ddPayableAt}
              onChange={(e) => handleSalaryChange('bankDetails', 'ddPayableAt', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name As Per Bank Records"
              value={formData.salaryInfo.bankDetails.nameAsPerBank}
              onChange={(e) => handleSalaryChange('bankDetails', 'nameAsPerBank', e.target.value)}
            />
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );

  // Render confirmation step
  const renderConfirmationStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Review User Details
        </Typography>
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2">User Type:</Typography>
              <Typography variant="body1" gutterBottom>
                {formData.userType.charAt(0).toUpperCase() + formData.userType.slice(1)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Name:</Typography>
              <Typography variant="body1" gutterBottom>{formData.name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Email:</Typography>
              <Typography variant="body1" gutterBottom>{formData.email}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">{formData.userType === 'employee' ? "Employee ID:" : "Manager ID:"}</Typography>
              <Typography variant="body1" gutterBottom>{formData.employeeId}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Department:</Typography>
              <Typography variant="body1" gutterBottom>
                {departments.find(dep => dep._id === formData.department)?.dep_name || ''}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Designation:</Typography>
              <Typography variant="body1" gutterBottom>{formData.designation}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Joining Date:</Typography>
              <Typography variant="body1" gutterBottom>{formData.joiningDate}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Basic Salary:</Typography>
              <Typography variant="body1" gutterBottom>₹ {formData.salaryInfo.basicSalary}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>User Type</InputLabel>
                <Select
                  name="userType"
                  label="User Type"
                  value={formData.userType}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderEmploymentDetailsStep();
      case 3:
        return renderAdditionalInfoStep();
      case 4:
        return renderConfirmationStep();
      default:
        return "Unknown step";
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1}
        onClick={() => navigate('/admin-dashboard/user-profiles')}
        sx={{
          mb: 4,
          cursor: 'pointer',
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            '& .MuiSvgIcon-root': {
              transform: 'translateX(-4px)'
            }
          }
        }}>
        <ArrowBack sx={{ transition: 'transform 0.2s' }} />
        <Typography>Back to User Profiles</Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Create New User Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new employee or manager to your organization
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2, mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateUserProfile;