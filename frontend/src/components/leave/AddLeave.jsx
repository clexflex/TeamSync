import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import config from "../../config";

const AddLeave = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    userId: user?._id || '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    isPaid: true, // This is now managed internally based on useLeaveBalance
    useLeaveBalance: true,
    documents: []
  });
  
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const getBasePath = (user) => {
    return user.role === "employee" ? "/employee-dashboard" : "/manager-dashboard";
  };

  const basePath = getBasePath(user);
  useEffect(() => {
    fetchLeaveBalances();
  }, []);
  
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      calculateTotalDays();
    }
  }, [formData.startDate, formData.endDate]);
  
  // When useLeaveBalance changes, update isPaid accordingly
  useEffect(() => {
    // If using leave balance, it's a paid leave, otherwise unpaid
    setFormData(prev => ({
      ...prev,
      isPaid: prev.useLeaveBalance
    }));
  }, [formData.useLeaveBalance]);
  
  const fetchLeaveBalances = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/leave/balance/${user._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setLeaveBalances(response.data.leaveBalances || []);
      }
    } catch (error) {
      console.error('Error fetching leave balances:', error);
      setError('Failed to fetch leave balances. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const calculateTotalDays = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setTotalDays(0);
      return;
    }
    
    if (end < start) {
      setError('End date cannot be before start date');
      setTotalDays(0);
      return;
    }
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setTotalDays(diffDays);
    setError('');
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
      // If useLeaveBalance is toggled, automatically set isPaid to match
      ...(name === 'useLeaveBalance' ? { isPaid: checked } : {})
    });
  };
  
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      documents: e.target.files
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.leaveType) {
      setError('Please select a leave type');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    if (!formData.reason) {
      setError('Please provide a reason for leave');
      return;
    }
    
    // Check if user has sufficient leave balance if using leave balance
    if (formData.useLeaveBalance) {
      const selectedLeaveBalance = leaveBalances.find(lb => lb.leaveType === formData.leaveType);
      
      if (!selectedLeaveBalance) {
        setError(`No balance found for ${formData.leaveType}`);
        return;
      }
      
      if (selectedLeaveBalance.balance < totalDays) {
        setError(`Insufficient leave balance. Available: ${selectedLeaveBalance.balance}, Required: ${totalDays}`);
        return;
      }
    }
    
    try {
      setLoading(true);
      setError('');
      
      const formDataObj = new FormData();
      formDataObj.append('userId', formData.userId);
      formDataObj.append('leaveType', formData.leaveType);
      formDataObj.append('startDate', formData.startDate);
      formDataObj.append('endDate', formData.endDate);
      formDataObj.append('reason', formData.reason);
      // isPaid is now determined by useLeaveBalance
      formDataObj.append('isPaid', formData.useLeaveBalance);
      formDataObj.append('useLeaveBalance', formData.useLeaveBalance);
      
      if (formData.documents && formData.documents.length > 0) {
        for (let i = 0; i < formData.documents.length; i++) {
          formDataObj.append('documents', formData.documents[i]);
        }
      }
      
      const response = await axios.post(`${config.API_URL}/api/leave/add`, formDataObj, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setSuccess('Leave application submitted successfully');
        // Reset form
        setFormData({
          userId: user?._id || '',
          leaveType: '',
          startDate: '',
          endDate: '',
          reason: '',
          isPaid: true,
          useLeaveBalance: true,
          documents: []
        });
        // Refresh leave balances
        fetchLeaveBalances();
        
        // Navigate to leave list after successful submission
        setTimeout(() => {
          navigate(`${basePath}/leaves/${user?._id}`)
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting leave application:', error);
      setError(error.response?.data?.error || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };
  
  const getLeaveBalance = (leaveType) => {
    const balance = leaveBalances.find(lb => lb.leaveType === leaveType);
    return balance ? balance.balance : 0;
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, marginTop: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Apply for Leave
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required margin="normal">
              <InputLabel id="leave-type-label">Leave Type</InputLabel>
              <Select
                labelId="leave-type-label"
                id="leaveType"
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                label="Leave Type"
              >
                <MenuItem value="">Select Leave Type</MenuItem>
                <MenuItem value="Casual Leave">Casual Leave (Balance: {getLeaveBalance("Casual Leave")})</MenuItem>
                <MenuItem value="Sick Leave">Sick Leave (Balance: {getLeaveBalance("Sick Leave")})</MenuItem>
                <MenuItem value="Paid Leave">Paid Leave (Balance: {getLeaveBalance("Paid Leave")})</MenuItem>
                <MenuItem value="Half Leave">Half Leave (Balance: {getLeaveBalance("Half Leave")})</MenuItem>
              </Select>
              <FormHelperText>
                {formData.leaveType && `Available balance: ${getLeaveBalance(formData.leaveType)} days`}
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              margin="normal"
              label="Start Date"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              margin="normal"
              label="End Date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="body1">
                Total Days: <strong>{totalDays}</strong>
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin="normal"
              label="Reason for Leave"
              multiline
              rows={4}
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.useLeaveBalance}
                  onChange={handleSwitchChange}
                  name="useLeaveBalance"
                />
              }
              label={formData.useLeaveBalance ? "Using Leave Balance (Paid Leave)" : "Not Using Leave Balance (Unpaid Leave)"}
            />
            <FormHelperText>
              {formData.useLeaveBalance 
                ? "Leave days will be deducted from your balance" 
                : "No leave balance will be used (Unpaid leave)"}
            </FormHelperText>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin="normal"
              type="file"
              inputProps={{ multiple: true }}
              onChange={handleFileChange}
              helperText="Upload supporting documents (optional)"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Submitting...' : 'Submit Leave Application'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate(-1)}
              sx={{ mt: 2, ml: 2 }}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default AddLeave;