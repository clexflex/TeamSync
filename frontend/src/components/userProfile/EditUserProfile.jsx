import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Stack
} from '@mui/material';
import { ArrowBack, Add, Delete } from '@mui/icons-material';
import config from "../../config";

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

const EditUserProfile = () => {
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    status: 'active',
    employeeId: '', // Used for both employee ID and manager ID
    department: '',
    designation: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    salary: 0,
    joiningDate: '',
    password: '',
    userType: '',
    leaveBalances: [],
    company: 'Maximize Market Research Pvt. Ltd.',

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

  const [departments, setDepartments] = useState([]);
  const [originalUserProfile, setOriginalUserProfile] = useState(null);
  const [changedFields, setChangedFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/department`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        return response.data.departments;
      }
      return [];
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError(error.response?.data?.error || "Error fetching departments");
      return [];
    }
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch user profile directly using the user profile ID
        const userProfileResponse = await axios.get(`${config.API_URL}/api/user-profile/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });

        const departmentsData = await fetchDepartments();
        setDepartments(departmentsData);

        if (userProfileResponse.data.success) {
          const profileData = userProfileResponse.data.userProfile;
          const userData = profileData.user; // Changed from userId to user based on API response

          // Determine if it's an employee or manager
          let formattedUserProfile = {
            name: userData.name,
            email: userData.email,
            status: userData.status,
            userType: userData.role,
            joiningDate: profileData.joiningDate?.split('T')[0] || '',
            password: '',
            leaveBalances: profileData.leaveBalances || [],
            company: profileData.company , 


            // Personal Information (initialize with default values if not present)
            companyEmail: profileData.companyEmail || '',
            location: profileData.location || '',
            primaryContactNo: profileData.primaryContactNo || '',
            bloodGroup: profileData.bloodGroup || '',
            nationality: profileData.nationality || 'Indian',
            marriageDate: profileData.marriageDate ? new Date(profileData.marriageDate).toISOString().split('T')[0] : '',
            spouse: profileData.spouse || '',
            fatherName: profileData.fatherName || '',
            religion: profileData.religion || '',
            physicallyHandicapped: profileData.physicallyHandicapped || false,
            height: profileData.height || '',
            weight: profileData.weight || '',

            // Address
            address: profileData.address || {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: 'India'
            },

            // Education Information
            education: profileData.education && profileData.education.length > 0 ?
              profileData.education.map(edu => ({
                degree: edu.degree || '',
                institute: edu.institute || '',
                startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
                endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
                grade: edu.grade || ''
              })) :
              [{
                degree: '',
                institute: '',
                startDate: '',
                endDate: '',
                grade: ''
              }],

            // Employment & Job Information
            confirmationDate: profileData.confirmationDate ? new Date(profileData.confirmationDate).toISOString().split('T')[0] : '',
            noticePeriod: profileData.noticePeriod || '',
            employmentStatus: profileData.employmentStatus || 'Probation',
            currentCompanyExperience: profileData.currentCompanyExperience || '',
            previousExperience: profileData.previousExperience || '',
            totalExperience: profileData.totalExperience || '',
            probationPeriod: profileData.probationPeriod || '3',

            // Previous Employment
            previousEmployment: profileData.previousEmployment && profileData.previousEmployment.length > 0 ?
              profileData.previousEmployment.map(emp => ({
                company: emp.company || '',
                designation: emp.designation || '',
                startDate: emp.startDate ? new Date(emp.startDate).toISOString().split('T')[0] : '',
                endDate: emp.endDate ? new Date(emp.endDate).toISOString().split('T')[0] : '',
                reasonForLeaving: emp.reasonForLeaving || ''
              })) :
              [{
                company: '',
                designation: '',
                startDate: '',
                endDate: '',
                reasonForLeaving: ''
              }]
          };

          if (userData.role === 'employee') {
            // Employee specific fields
            formattedUserProfile = {
              ...formattedUserProfile,
              employeeId: profileData.employeeId || '',
              department: profileData.department?._id || '',
              designation: profileData.designation || '',
              dob: profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : '',
              gender: profileData.gender || '',
              maritalStatus: profileData.maritalStatus || '',
              salary: profileData.salary || 0
            };
          } else if (userData.role === 'manager') {
            // Manager specific fields
            formattedUserProfile = {
              ...formattedUserProfile,
              employeeId: profileData.managerId || '', // Store managerId in employeeId field
              department: profileData.department?._id || '',
              designation: profileData.designation || '',
              dob: profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : '',
              gender: profileData.gender || '',
              maritalStatus: profileData.maritalStatus || ''
            };
          }

          // Handle salary info
          if (profileData.salaryInfo) {
            formattedUserProfile.salaryInfo = {
              basicSalary: profileData.salaryInfo.basicSalary || 0,
              allowances: profileData.salaryInfo.allowances || {
                DA: 0, HRA: 0, conveyance: 0, medical: 0, education: 0,
                performance: 0, special: 0, other: 0
              },
              deductions: profileData.salaryInfo.deductions || {
                PF: 0, ESI: 0, PT: 0, TDS: 0, MLWF: 0, advance: 0, loan: 0, other: 0
              },
              PFNumber: profileData.salaryInfo.PFNumber || '',
              ESINumber: profileData.salaryInfo.ESINumber || '',
              PAN: profileData.salaryInfo.PAN || '',
              passportNo: profileData.salaryInfo.passportNo || '',
              aadhaarNo: profileData.salaryInfo.aadhaarNo || '',
              bankDetails: profileData.salaryInfo.bankDetails || {
                accountNumber: '', bankName: '', branchName: '', IFSCCode: '',
                paymentType: 'Bank Transfer', accountType: 'Savings',
                ddPayableAt: '', nameAsPerBank: ''
              }
            };
          } else {
            formattedUserProfile.salaryInfo = {
              basicSalary: 0,
              allowances: {
                DA: 0, HRA: 0, conveyance: 0, medical: 0, education: 0,
                performance: 0, special: 0, other: 0
              },
              deductions: {
                PF: 0, ESI: 0, PT: 0, TDS: 0, MLWF: 0, advance: 0, loan: 0, other: 0
              },
              PFNumber: '',
              ESINumber: '',
              PAN: '',
              passportNo: '',
              aadhaarNo: '',
              bankDetails: {
                accountNumber: '', bankName: '', branchName: '', IFSCCode: '',
                paymentType: 'Bank Transfer', accountType: 'Savings',
                ddPayableAt: '', nameAsPerBank: ''
              }
            };
          }

          setUserProfile(formattedUserProfile);
          setOriginalUserProfile(formattedUserProfile);
        } else {
          setError("Failed to load user profile data");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError(error.response?.data?.error || "Error loading user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setUserProfile(prev => ({ ...prev, [name]: checked }));
      if (originalUserProfile && originalUserProfile[name] !== checked) {
        setChangedFields(prev => ({ ...prev, [name]: true }));
      }
    } else {
      setUserProfile(prev => ({ ...prev, [name]: value }));
      if (originalUserProfile && originalUserProfile[name] !== value) {
        setChangedFields(prev => ({ ...prev, [name]: true }));
      }
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));

    // Mark address as changed
    setChangedFields(prev => ({ ...prev, address: true }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...userProfile.education];
    newEducation[index][field] = value;
    setUserProfile(prev => ({ ...prev, education: newEducation }));

    // Mark education as changed
    setChangedFields(prev => ({ ...prev, education: true }));
  };

  const handleAddEducation = () => {
    setUserProfile(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: '', institute: '', startDate: '', endDate: '', grade: '' }
      ]
    }));

    // Mark education as changed
    setChangedFields(prev => ({ ...prev, education: true }));
  };

  const handleRemoveEducation = (index) => {
    const newEducation = [...userProfile.education];
    newEducation.splice(index, 1);
    setUserProfile(prev => ({ ...prev, education: newEducation }));

    // Mark education as changed
    setChangedFields(prev => ({ ...prev, education: true }));
  };

  const handlePreviousEmploymentChange = (index, field, value) => {
    const newEmployment = [...userProfile.previousEmployment];
    newEmployment[index][field] = value;
    setUserProfile(prev => ({ ...prev, previousEmployment: newEmployment }));

    // Mark previous employment as changed
    setChangedFields(prev => ({ ...prev, previousEmployment: true }));
  };

  const handleAddPreviousEmployment = () => {
    setUserProfile(prev => ({
      ...prev,
      previousEmployment: [
        ...prev.previousEmployment,
        { company: '', designation: '', startDate: '', endDate: '', reasonForLeaving: '' }
      ]
    }));

    // Mark previous employment as changed
    setChangedFields(prev => ({ ...prev, previousEmployment: true }));
  };

  const handleRemovePreviousEmployment = (index) => {
    const newEmployment = [...userProfile.previousEmployment];
    newEmployment.splice(index, 1);
    setUserProfile(prev => ({ ...prev, previousEmployment: newEmployment }));

    // Mark previous employment as changed
    setChangedFields(prev => ({ ...prev, previousEmployment: true }));
  };

  // Handle leave balance changes
  const handleLeaveBalanceChange = (index, field, value) => {
    const updatedLeaveBalances = [...userProfile.leaveBalances];
    updatedLeaveBalances[index][field] = value;

    setUserProfile(prev => ({
      ...prev,
      leaveBalances: updatedLeaveBalances
    }));

    // Mark leaveBalances as changed
    setChangedFields(prev => ({ ...prev, leaveBalances: true }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSalaryChange = (category, field, value) => {
    const numValue = category === 'allowances' || category === 'deductions' || field === 'basicSalary'
      ? (parseFloat(value) || 0)
      : value;

    if (category === 'bankDetails') {
      setUserProfile(prev => ({
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
      setUserProfile(prev => ({
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
      setUserProfile(prev => ({
        ...prev,
        salaryInfo: {
          ...prev.salaryInfo,
          [field]: numValue
        }
      }));
    }

    // Mark salaryInfo as changed
    setChangedFields(prev => ({ ...prev, salaryInfo: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Prepare update data
      const updateData = {};

      // Include all changed fields
      Object.keys(changedFields).forEach(field => {
        if (field !== 'userType') { // Skip userType as it's not meant to be changed
          updateData[field] = userProfile[field];
        }
      });

      // Don't send empty password
      if (updateData.password === '') {
        delete updateData.password;
      }

      // Add userId to identify the user in the backend
      const userData = {
        ...updateData,
        userId: userProfile.userId // Make sure userId is available
      };

      console.log("Sending update with data:", userData);

      const response = await axios.put(
        `${config.API_URL}/api/user-profile/${id}`,
        userData,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        navigate("/admin-dashboard/user-profiles");
      } else {
        setError(response.data.error || "Failed to update user profile");
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      setError(error.response?.data?.error || "Failed to update user profile");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
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
            Edit {userProfile.userType === 'employee' ? 'Employee' : 'Manager'} Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Modify the user profile details
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 3, mt: 0 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Basic Information" />
          <Tab label="Employment Details" />
          <Tab label="Personal Information" />
          <Tab label="Address" />
          <Tab label="Education" />
          <Tab label="Previous Employment" />
          <Tab label="Salary & Bank Details" />
          <Tab label="Leave Balances" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          {/* Basic Information tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={userProfile.name || ''}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={userProfile.email || ''}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={userProfile.status || 'active'}
                  onChange={handleChange}
                  variant="outlined"
                  required
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Company</InputLabel>
                  <Select
                    name="company"
                    label="Company"
                    value={userProfile.company || 'Maximize Market Research Pvt. Ltd.'}
                    onChange={handleChange}
                    variant="outlined"
                  >
                    <MenuItem value="Maximize Market Research Pvt. Ltd.">Maximize Market Research Pvt. Ltd.</MenuItem>
                    <MenuItem value="Stellar Market Research Pvt. Ltd.">Stellar Market Research Pvt. Ltd.</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={userProfile.password || ''}
                  onChange={handleChange}
                  variant="outlined"
                  helperText="Leave blank to keep current password"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Role"
                  value={userProfile.userType === 'employee' ? 'Employee' : 'Manager'}
                  variant="outlined"
                  disabled
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Joining Date"
                  name="joiningDate"
                  type="date"
                  value={userProfile.joiningDate || ''}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
            </Grid>
          )}

          {/* Employment Details tab */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={userProfile.userType === 'employee' ? 'Employee ID' : 'Manager ID'}
                  name="employeeId"
                  value={userProfile.employeeId || ''}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  name="designation"
                  value={userProfile.designation || ''}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  name="department"
                  value={userProfile.department || ''}
                  onChange={handleChange}
                  variant="outlined"
                  required
                >
                  {departments?.map(dep => (
                    <MenuItem key={dep._id} value={dep._id}>
                      {dep.dep_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {userProfile.userType === 'employee' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Salary"
                    name="salary"
                    type="number"
                    value={userProfile.salary || 0}
                    onChange={handleChange}
                    variant="outlined"
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
                  value={userProfile.confirmationDate || ''}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Notice Period (days)"
                  name="noticePeriod"
                  type="number"
                  value={userProfile.noticePeriod || ''}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Employment Status</InputLabel>
                  <Select
                    name="employmentStatus"
                    label="Employment Status"
                    value={userProfile.employmentStatus || 'Probation'}
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
                  value={userProfile.probationPeriod || ''}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Previous Experience (years)"
                  name="previousExperience"
                  type="number"
                  value={userProfile.previousExperience || ''}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Company Experience (years)"
                  name="currentCompanyExperience"
                  type="number"
                  value={userProfile.currentCompanyExperience || ''}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Experience (years)"
                  name="totalExperience"
                  type="number"
                  value={userProfile.totalExperience || ''}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>
            </Grid>
          )}

          {/* Personal Information tab */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Email"
                  name="companyEmail"
                  value={userProfile.companyEmail || ''}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={userProfile.location || ''}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Primary Contact Number"
                  name="primaryContactNo"
                  value={userProfile.primaryContactNo || ''}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Blood Group</InputLabel>
                  <Select
                    name="bloodGroup"
                    label="Blood Group"
                    value={userProfile.bloodGroup || ''}
                    onChange={handleChange}
                  >
                    <MenuItem value="">Select Blood Group</MenuItem>
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
                  value={userProfile.nationality || ''}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              {userProfile.maritalStatus === 'married' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Marriage Date"
                      name="marriageDate"
                      type="date"
                      value={userProfile.marriageDate || ''}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Spouse Name"
                      name="spouse"
                      value={userProfile.spouse || ''}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Father's Name"
                  name="fatherName"
                  value={userProfile.fatherName || ''}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Religion"
                  name="religion"
                  value={userProfile.religion || ''}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Physically Challenged</FormLabel>
                  <RadioGroup
                    row
                    name="physicallyHandicapped"
                    value={userProfile.physicallyHandicapped.toString()}
                    onChange={(e) => {
                      const newValue = e.target.value === 'true';
                      setUserProfile({
                        ...userProfile,
                        physicallyHandicapped: newValue
                      });
                      setChangedFields({
                        ...changedFields,
                        physicallyHandicapped: true
                      });
                    }}
                  >
                    <FormControlLabel value="true" control={<Radio />} label="Yes" />
                    <FormControlLabel value="false" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={userProfile.height || ''}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={userProfile.weight || ''}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={userProfile.dob || ''}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    label="Gender"
                    value={userProfile.gender || ''}
                    onChange={handleChange}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Marital Status</InputLabel>
                  <Select
                    name="maritalStatus"
                    label="Marital Status"
                    value={userProfile.maritalStatus || ''}
                    onChange={handleChange}
                  >
                    <MenuItem value="">Select Status</MenuItem>
                    <MenuItem value="single">Single</MenuItem>
                    <MenuItem value="married">Married</MenuItem>
                    <MenuItem value="divorced">Divorced</MenuItem>
                    <MenuItem value="widowed">Widowed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {/* Address tab */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Address Information</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="street"
                  value={userProfile.address?.street || ''}
                  onChange={handleAddressChange}
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={userProfile.address?.city || ''}
                  onChange={handleAddressChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="State/Province"
                  name="state"
                  value={userProfile.address?.state || ''}
                  onChange={handleAddressChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  name="postalCode"
                  value={userProfile.address?.postalCode || ''}
                  onChange={handleAddressChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={userProfile.address?.country || ''}
                  onChange={handleAddressChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          )}

          {/* Education tab */}
          {activeTab === 4 && (
            <Box>
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

              {userProfile.education && userProfile.education.map((edu, index) => (
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
                        disabled={userProfile.education.length === 1}
                      >
                        <Delete />
                      </IconButton>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Degree/Certification"
                          value={edu.degree || ''}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Institute/University"
                          value={edu.institute || ''}
                          onChange={(e) => handleEducationChange(index, 'institute', e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Start Date"
                          type="date"
                          value={edu.startDate || ''}
                          onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="End Date"
                          type="date"
                          value={edu.endDate || ''}
                          onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Grade/Percentage"
                          value={edu.grade || ''}
                          onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Previous Employment tab */}
          {activeTab === 5 && (
            <Box>
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

              {userProfile.previousEmployment && userProfile.previousEmployment.map((emp, index) => (
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
                          value={emp.company || ''}
                          onChange={(e) => handlePreviousEmploymentChange(index, 'company', e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Designation"
                          value={emp.designation || ''}
                          onChange={(e) => handlePreviousEmploymentChange(index, 'designation', e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Start Date"
                          type="date"
                          value={emp.startDate || ''}
                          onChange={(e) => handlePreviousEmploymentChange(index, 'startDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="End Date"
                          type="date"
                          value={emp.endDate || ''}
                          onChange={(e) => handlePreviousEmploymentChange(index, 'endDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Reason for Leaving"
                          value={emp.reasonForLeaving || ''}
                          onChange={(e) => handlePreviousEmploymentChange(index, 'reasonForLeaving', e.target.value)}
                          multiline
                          rows={2}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Salary & Bank Details tab */}
          {activeTab === 6 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 3 }}>
                Salary Information
              </Typography>

              <Grid container spacing={3}>
                {/* Basic Salary */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Basic Salary"
                    type="number"
                    value={userProfile.salaryInfo.basicSalary}
                    onChange={(e) => handleSalaryChange(null, 'basicSalary', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                    variant="outlined"
                  />
                </Grid>

                {/* PF Number */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="PF Number"
                    value={userProfile.salaryInfo.PFNumber}
                    onChange={(e) => handleSalaryChange(null, 'PFNumber', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                {/* ESI Number */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="ESI Number"
                    value={userProfile.salaryInfo.ESINumber}
                    onChange={(e) => handleSalaryChange(null, 'ESINumber', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="PAN Number"
                    value={userProfile.salaryInfo.PAN}
                    onChange={(e) => handleSalaryChange(null, 'PAN', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Passport Number"
                    value={userProfile.salaryInfo.passportNo}
                    onChange={(e) => handleSalaryChange(null, 'passportNo', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Aadhaar Number"
                    value={userProfile.salaryInfo.aadhaarNo}
                    onChange={(e) => handleSalaryChange(null, 'aadhaarNo', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                {/* Allowances Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} fontWeight="medium">
                    Allowances
                  </Typography>
                  <Divider />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Dearness Allowance (DA)"
                    type="number"
                    value={userProfile.salaryInfo.allowances.DA}
                    onChange={(e) => handleSalaryChange('allowances', 'DA', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="House Rent Allowance (HRA)"
                    type="number"
                    value={userProfile.salaryInfo.allowances.HRA}
                    onChange={(e) => handleSalaryChange('allowances', 'HRA', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Conveyance Allowance"
                    type="number"
                    value={userProfile.salaryInfo.allowances.conveyance}
                    onChange={(e) => handleSalaryChange('allowances', 'conveyance', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                    variant="outlined"
                  />
                </Grid>

                {/* Deductions Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} fontWeight="medium">
                    Deductions
                  </Typography>
                  <Divider />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Provident Fund (PF)"
                    type="number"
                    value={userProfile.salaryInfo.deductions.PF}
                    onChange={(e) => handleSalaryChange('deductions', 'PF', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Employee State Insurance (ESI)"
                    type="number"
                    value={userProfile.salaryInfo.deductions.ESI}
                    onChange={(e) => handleSalaryChange('deductions', 'ESI', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Professional Tax (PT)"
                    type="number"
                    value={userProfile.salaryInfo.deductions.PT}
                    onChange={(e) => handleSalaryChange('deductions', 'PT', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                    variant="outlined"
                  />
                </Grid>

                {/* Bank Details Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} fontWeight="medium">
                    Bank Details
                  </Typography>
                  <Divider />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    value={userProfile.salaryInfo.bankDetails.bankName}
                    onChange={(e) => handleSalaryChange('bankDetails', 'bankName', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    value={userProfile.salaryInfo.bankDetails.accountNumber}
                    onChange={(e) => handleSalaryChange('bankDetails', 'accountNumber', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Branch Name"
                    value={userProfile.salaryInfo.bankDetails.branchName}
                    onChange={(e) => handleSalaryChange('bankDetails', 'branchName', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="IFSC Code"
                    value={userProfile.salaryInfo.bankDetails.IFSCCode}
                    onChange={(e) => handleSalaryChange('bankDetails', 'IFSCCode', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Payment Type</InputLabel>
                    <Select
                      value={userProfile.salaryInfo.bankDetails.paymentType}
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
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Account Type</InputLabel>
                    <Select
                      value={userProfile.salaryInfo.bankDetails.accountType}
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
                    value={userProfile.salaryInfo.bankDetails.ddPayableAt}
                    onChange={(e) => handleSalaryChange('bankDetails', 'ddPayableAt', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name As Per Bank Records"
                    value={userProfile.salaryInfo.bankDetails.nameAsPerBank}
                    onChange={(e) => handleSalaryChange('bankDetails', 'nameAsPerBank', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Leave Balances tab */}
          {activeTab === 7 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 3 }}>
                Leave Balance Management
              </Typography>

              <Grid container spacing={3}>
                {userProfile.leaveBalances?.map((leave, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                          {leave.leaveType}
                        </Typography>
                        <Divider sx={{ my: 1.5 }} />

                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              label="Available Balance"
                              type="number"
                              value={leave.balance}
                              onChange={(e) => handleLeaveBalanceChange(index, 'balance', parseInt(e.target.value) || 0)}
                              InputProps={{ inputProps: { min: 0 } }}
                              variant="outlined"
                              size="small"
                              sx={{ mb: 2 }}
                            />
                          </Grid>

                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              label="Used"
                              type="number"
                              value={leave.used}
                              onChange={(e) => handleLeaveBalanceChange(index, 'used', parseInt(e.target.value) || 0)}
                              InputProps={{ inputProps: { min: 0 } }}
                              variant="outlined"
                              size="small"
                              sx={{ mb: 2 }}
                            />
                          </Grid>

                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              label="Carry Forward"
                              type="number"
                              value={leave.carryForward}
                              onChange={(e) => handleLeaveBalanceChange(index, 'carryForward', parseInt(e.target.value) || 0)}
                              InputProps={{ inputProps: { min: 0 } }}
                              variant="outlined"
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}

                {(!userProfile.leaveBalances || userProfile.leaveBalances.length === 0) && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      No leave balances found for this user.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={Object.keys(changedFields).length === 0}
              sx={{ ml: 'auto' }}
            >
              Save Changes
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/admin-dashboard/user-profiles')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditUserProfile;