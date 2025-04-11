// frontend/src/components/notifications/NotificationCreator.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Alert,
  CircularProgress,
  Grid,
  Snackbar
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const NotificationCreator = () => {
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'general',
    isGlobal: true,
    shouldSendEmail: false,
    userId: ''
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fetch users when component mounts or when isGlobal changes to false
  useEffect(() => {
    if (!form.isGlobal) {
      fetchUsers();
    }
  }, [form.isGlobal]);
  
  // Fetch users for individual selection
  const fetchUsers = async () => {
    try {
      setFetchingUsers(true);
      // Use the correct endpoint to fetch employees and managers
      const response = await axios.get(
        `${config.API_URL}/api/employee`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      if (response.data.success) {
        // Extract user details from employee records
        const employeeUsers = response.data.employees.map(employee => ({
          id: employee.userId._id,
          name: employee.userId.name,
          email: employee.userId.email,
          role: employee.userId.role,
          employeeId: employee.employeeId
        }));
        
        setUsers(employeeUsers);
      } else {
        console.error('Failed to fetch employees:', response.data.error);
        setError('Failed to load users. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setFetchingUsers(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'isGlobal') {
      setForm({
        ...form,
        isGlobal: checked,
        userId: '' // Clear userId when switching to global
      });
    } else {
      setForm({
        ...form,
        [name]: name === 'isGlobal' || name === 'shouldSendEmail' ? checked : value
      });
    }
    
    // Clear any previous messages
    setError('');
    setSuccess('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.title.trim() || !form.message.trim()) {
      setError('Title and message are required.');
      return;
    }
    
    if (!form.isGlobal && !form.userId) {
      setError('Please select a user for individual notification.');
      return;
    }
    
    // Prepare payload
    const payload = {
      title: form.title,
      message: form.message,
      type: form.type,
      isGlobal: form.isGlobal,
      shouldSendEmail: form.shouldSendEmail
    };
    
    if (!form.isGlobal) {
      payload.userId = form.userId;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${config.API_URL}/api/notifications/create`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      if (response.data.success) {
        setSuccess('Notification created successfully.');
        // Reset form
        setForm({
          title: '',
          message: '',
          type: 'general',
          isGlobal: true,
          shouldSendEmail: false,
          userId: ''
        });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      setError(error.response?.data?.error || 'Failed to create notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleCloseAlert = () => {
    setSuccess('');
    setError('');
  };
  
  return (
    <Paper elevation={0} sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Create Notification
        </Typography>
      </Box>
      
      <Paper variant="outlined" sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Notification Title"
                value={form.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="message"
                label="Notification Message"
                value={form.message}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Notification Type</InputLabel>
                <Select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  label="Notification Type"
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="birthday">Birthday</MenuItem>
                  <MenuItem value="work_anniversary">Work Anniversary</MenuItem>
                  <MenuItem value="leave_request">Leave Request</MenuItem>
                  <MenuItem value="attendance">Attendance</MenuItem>
                  <MenuItem value="document">Document</MenuItem>
                  <MenuItem value="task">Task</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {!form.isGlobal && (
                <FormControl fullWidth disabled={fetchingUsers}>
                  <InputLabel>Select User</InputLabel>
                  <Select
                    name="userId"
                    value={form.userId}
                    onChange={handleChange}
                    label="Select User"
                    required={!form.isGlobal}
                  >
                    {fetchingUsers ? (
                      <MenuItem value="">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading users...
                        </Box>
                      </MenuItem>
                    ) : users.length > 0 ? (
                      users.map(user => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name} ({user.employeeId || user.email})
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="">No users available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isGlobal"
                      checked={form.isGlobal}
                      onChange={handleChange}
                    />
                  }
                  label="Send to all users"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      name="shouldSendEmail"
                      checked={form.shouldSendEmail}
                      onChange={handleChange}
                    />
                  }
                  label="Send email notification"
                />
              </Box>
            </Grid>
            
            {(error || success) && (
              <Grid item xs={12}>
                {error && <Alert severity="error" onClose={handleCloseAlert}>{error}</Alert>}
                {success && <Alert severity="success" onClose={handleCloseAlert}>{success}</Alert>}
              </Grid>
            )}
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                disabled={loading}
                sx={{ px: 3, py: 1 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Send Notification"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Paper>
  );
};

export default NotificationCreator;