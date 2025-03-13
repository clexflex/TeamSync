import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Select, MenuItem,
  Button, Grid, FormControl, InputLabel, IconButton,
  Stack, Alert, Avatar, styled, Stepper, Step, StepLabel
} from '@mui/material';
import { ArrowBack, CloudUpload } from '@mui/icons-material';
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

const steps = ['User Type', 'Basic Information', 'Job Details', 'Confirm'];

const CreateUserProfile = () => {
  const [departments, setDepartments] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
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
    status: 'active'
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
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formDataObj = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataObj.append(key, formData[key]);
        }
      });

      const response = await axios.post(
        `${config.API_URL}/api/user-profile/create`,
        formDataObj,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
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
        return (
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
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 2:
        return (
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
          </Grid>
        );
      case 3:
        return (
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
                  {formData.userType === 'employee' && (
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Salary:</Typography>
                      <Typography variant="body1" gutterBottom>{formData.salary}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        );
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