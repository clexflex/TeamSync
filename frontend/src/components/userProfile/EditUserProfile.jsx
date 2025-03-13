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
  Tab
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import config from "../../config";

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
    userType: ''
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
            password: ''
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
              designation: profileData.designation || ''
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
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
    
    if (originalUserProfile && originalUserProfile[name] !== value) {
      setChangedFields(prev => ({ ...prev, [name]: true }));
    } else {
      setChangedFields(prev => {
        const newFields = { ...prev };
        delete newFields[name];
        return newFields;
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
          <Tab label="Role-specific Information" />
          {userProfile.userType === 'employee' && <Tab label="Employment Details" />}
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

          {/* Role-specific Information tab */}
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
            </Grid>
          )}

          {/* Employee-specific tab */}
          {activeTab === 2 && userProfile.userType === 'employee' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={userProfile.dob || ''}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  name="gender"
                  value={userProfile.gender || ''}
                  onChange={handleChange}
                  variant="outlined"
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                  <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Marital Status"
                  name="maritalStatus"
                  value={userProfile.maritalStatus || ''}
                  onChange={handleChange}
                  variant="outlined"
                >
                  <MenuItem value="">Select Status</MenuItem>
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                  <MenuItem value="Widowed">Widowed</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          )}

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            {activeTab > 0 && (
              <Button
                variant="outlined"
                onClick={() => setActiveTab(activeTab - 1)}
              >
                Previous
              </Button>
            )}
            
            {activeTab < (userProfile.userType === 'employee' ? 2 : 1) && (
              <Button
                variant="outlined"
                onClick={() => setActiveTab(activeTab + 1)}
              >
                Next
              </Button>
            )}
            
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