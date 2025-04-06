import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  FormHelperText,
  Stack,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { ArrowBack, Info } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const AddAttendanceForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    userId: '',
    date: '',
    clockIn: '',
    clockOut: '', // Optional
    tasksDone: '', // Optional
    status: 'Present',
    approvalStatus: 'Approved',
    workLocation: 'Onsite',
    isWeekend: false,
    isHoliday: false,
    isHalfDay: false,
    useLeaveBalance: false,
    role: '',
    credits: 1, // Default credits for Present
    location: {
      latitude: 18.520430,
      longitude: 73.856743,
      accuracy: 10,
      altitude: 0,
      altitudeAccuracy: 0,
      heading: 0,
      speed: 0
    }
  });

  // Input validation state
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch users (employees and managers) on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Format the current date as YYYY-MM-DD for date input default
  useEffect(() => {
    const today = new Date();
    const formattedDate = formatDateForInput(today);
    setSelectedDate(formattedDate);
    setFormData(prev => ({ ...prev, date: formattedDate }));
  }, []);

  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const response = await axios.get(`${config.API_URL}/api/user-profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Format user data correctly from the API response
        const userData = response.data.userProfiles
          .filter(profile => profile.user && (profile.user.role === 'employee' || profile.user.role === 'manager'))
          .map(profile => ({
            id: profile.user._id,
            name: profile.user.name,
            email: profile.user.email,
            role: profile.user.role,
            employeeId: profile.employeeId || profile.managerId || 'N/A',
            department: profile.department?.dep_name || 'N/A'
          }));

        setUsers(userData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setUserLoading(false);
    }
  };

  // Helper function to format date for input field, preserving the local date
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (name === 'userId' && value) {
      // When user is selected, also set their role
      const selectedUser = users.find(user => user.id === value);
      if (selectedUser) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          role: selectedUser.role
        }));
      }
    }  else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  

  // Handle location field changes
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) : value
      }
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};

    if (!formData.userId) errors.userId = 'User is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.clockIn) errors.clockIn = 'Clock-in time is required';
    if (!formData.status) errors.status = 'Status is required';
    if (!formData.role) errors.role = 'Role is required';
    if (formData.credits === undefined || formData.credits === null)
      errors.credits = 'Credits are required';

    // If clockOut is provided, ensure it's after clockIn
    if (formData.clockOut) {
      const clockInDateTime = new Date(`${formData.date}T${formData.clockIn}`);
      const clockOutDateTime = new Date(`${formData.date}T${formData.clockOut}`);

      if (clockOutDateTime <= clockInDateTime) {
        errors.clockOut = 'Clock-out time must be after clock-in time';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Parse the selected date to create a proper date object
      const [year, month, day] = formData.date.split('-').map(Number);

      // Prepare the data with proper formatting
      const submitData = {
        ...formData,
        // Send date as ISO string, but let the server handle timezone conversion
        date: formData.date, // Send as YYYY-MM-DD string
        clockIn: formData.clockIn, // Send just the time
        clockOut: formData.clockOut || null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      console.log("Submitting attendance record with data:", submitData);

      const response = await axios.post(
        `${config.API_URL}/api/attendance/add-record`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess(true);
        // Redirect to the attendance management page after successful submission
        setTimeout(() => {
          navigate('/admin-dashboard/attendance-management');
        }, 1500); // Short delay to show success message
      }
    } catch (error) {
      console.error('Submission error:', error);
      if (error.response && error.response.data) {
        setError(error.response.data.error || 'Failed to add attendance record');
      } else {
        setError('An error occurred while adding the attendance record');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle alert close
  const handleAlertClose = () => {
    setSuccess(false);
    setError('');
  };

  // Set default clock in time to 9:00 AM when date changes
  const handleDateChange = (e) => {
    const { value } = e.target;
    setSelectedDate(value);

    // Check if selected date is a weekend
    const selectedDay = new Date(value).getDay();
    const isWeekend = selectedDay === 0 || selectedDay === 6; // 0 is Sunday, 6 is Saturday

    setFormData(prev => ({
      ...prev,
      date: value,
      clockIn: '09:00', // Default 9:00 AM
      clockOut: '18:00',  // Default 6:00 PM
      isWeekend: isWeekend
    }));
  };
  // Add this function after your existing functions
  const handleStatusChange = (e) => {
    const status = e.target.value;
    let defaultCredits = 1;

    // Set default credits based on status
    switch (status) {
      case 'Present':
      case 'Paid Leave':
      case 'Extra Work':
      case 'Weekly Off':
        defaultCredits = 1;
        break;
      case 'Incomplete Attendance':
      case 'Unpaid Half Leave':
      case 'Paid Half Leave':
        defaultCredits = 0.5;
        break;
      case 'Absent':
      case 'Unpaid Leave':
        defaultCredits = 0;
        break;
      default:
        defaultCredits = 1;
    }

    // Update both status and credits
    setFormData(prev => ({
      ...prev,
      status: status,
      credits: defaultCredits
    }));
  }
  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/admin-dashboard/attendance-management')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight="bold">
              Add New Attendance Record
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* User Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!validationErrors.userId}>
                <InputLabel id="user-select-label">Select User</InputLabel>
                <Select
                  labelId="user-select-label"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  label="Select User"
                  onChange={handleInputChange}
                  disabled={userLoading}
                >
                  {userLoading ? (
                    <MenuItem disabled>Loading users...</MenuItem>
                  ) : (
                    users.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} - {user.employeeId} ({user.role === 'employee' ? 'Employee' : 'Manager'})
                      </MenuItem>
                    ))
                  )}
                </Select>
                {validationErrors.userId && (
                  <FormHelperText>{validationErrors.userId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* User Role - Auto-populated based on selected user */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={formData.role ? (formData.role === 'employee' ? 'Employee' : 'Manager') : ''}
                disabled
                InputLabelProps={{ shrink: !!formData.role }}
              />
            </Grid>

            {/* Date picker */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleDateChange}
                required
                error={!!validationErrors.date}
                helperText={validationErrors.date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Status Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!validationErrors.status}>
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleStatusChange}
                >
                  <MenuItem value="Present">Present</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                  <MenuItem value="Paid Leave">Paid Leave</MenuItem>
                  <MenuItem value="Unpaid Leave">Unpaid Leave</MenuItem>
                  <MenuItem value="Paid Half Leave">Paid Half Leave</MenuItem>
                  <MenuItem value="Unpaid Half Leave">Unpaid Half Leave</MenuItem>
                  <MenuItem value="Extra Work">Extra Work</MenuItem>
                  <MenuItem value="Incomplete Attendance">Incomplete Attendance</MenuItem>
                  <MenuItem value="Weekly Off">Weekly Off</MenuItem>
                </Select>
                {validationErrors.status && (
                  <FormHelperText>{validationErrors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Clock In Time */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Clock In Time"
                type="time"
                name="clockIn"
                value={formData.clockIn}
                onChange={handleInputChange}
                required
                error={!!validationErrors.clockIn}
                helperText={validationErrors.clockIn}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Clock Out Time */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Clock Out Time"
                type="time"
                name="clockOut"
                value={formData.clockOut}
                onChange={handleInputChange}
                error={!!validationErrors.clockOut}
                helperText={validationErrors.clockOut}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Approval Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="approval-status-select-label">Approval Status</InputLabel>
                <Select
                  labelId="approval-status-select-label"
                  id="approvalStatus"
                  name="approvalStatus"
                  value={formData.approvalStatus}
                  label="Approval Status"
                  onChange={handleInputChange}
                >
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Auto-Approved">Auto-Approved</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Work Location */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="work-location-select-label">Work Location</InputLabel>
                <Select
                  labelId="work-location-select-label"
                  id="workLocation"
                  name="workLocation"
                  value={formData.workLocation}
                  label="Work Location"
                  onChange={handleInputChange}
                >
                  <MenuItem value="Onsite">Onsite</MenuItem>
                  <MenuItem value="Remote">Remote</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Credits Field */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="credits-select-label">Credits</InputLabel>
                <Select
                  labelId="credits-select-label"
                  id="credits"
                  name="credits"
                  value={formData.credits}
                  label="Credits"
                  onChange={handleInputChange}
                >
                  <MenuItem value={0}>0 Credit - No Pay</MenuItem>
                  <MenuItem value={0.5}>0.5 Credit - Half Day Pay</MenuItem>
                  <MenuItem value={1}>1 Credit - Full Day Pay</MenuItem>
                </Select>
                <FormHelperText>Credits determine salary calculation* </FormHelperText>
              </FormControl>
            </Grid>
            {/* Credits Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Credits"
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleInputChange}
                InputProps={{
                  step: 0.5,
                  min: 0,
                  max: 2,
                  inputProps: { min: 0, max: 2, step: 0.5 }
                }}
                helperText="Credits for this attendance (0, 0.5, or 1)"
              />
            </Grid>
            {/* Tasks Done */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tasks Done"
                name="tasksDone"
                value={formData.tasksDone}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Enter tasks completed (optional)"
              />
            </Grid>

            {/* Location Information - Shown when Work Location is Remote */}
            {formData.workLocation === 'Remote' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Location Information
                    <Tooltip title="For remote work, location information is required">
                      <IconButton size="small">
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="latitude"
                    type="number"
                    value={formData.location.latitude}
                    onChange={handleLocationChange}
                    InputProps={{ step: "any" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="longitude"
                    type="number"
                    value={formData.location.longitude}
                    onChange={handleLocationChange}
                    InputProps={{ step: "any" }}
                  />
                </Grid>
              </>
            )}

            {/* Additional Flags */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Additional Information</Typography>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isWeekend}
                      onChange={handleInputChange}
                      name="isWeekend"
                    />
                  }
                  label="Is Weekend"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isHoliday}
                      onChange={handleInputChange}
                      name="isHoliday"
                    />
                  }
                  label="Is Holiday"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isHalfDay}
                      onChange={handleInputChange}
                      name="isHalfDay"
                    />
                  }
                  label="Is Half Day"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.useLeaveBalance}
                      onChange={handleInputChange}
                      name="useLeaveBalance"
                    />
                  }
                  label="Use Leave Balance"
                />
              </Stack>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin-dashboard/attendance-management')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? 'Adding...' : 'Add Attendance Record'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleAlertClose} severity="success" sx={{ width: '100%' }}>
          Attendance record added successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddAttendanceForm;