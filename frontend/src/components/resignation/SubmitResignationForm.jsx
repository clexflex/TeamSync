import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';

const SubmitResignationForm = () => {
  const [formData, setFormData] = useState({
    reason: '',
    noticePeriod: 30,
    lastWorkingDay: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user already has a resignation request
    checkExistingRequest();
    
    // Calculate default last working day (30 days from now)
    const defaultLastWorkingDay = new Date();
    defaultLastWorkingDay.setDate(defaultLastWorkingDay.getDate() + 30);
    
    setFormData(prev => ({
      ...prev,
      lastWorkingDay: formatDateForInput(defaultLastWorkingDay)
    }));
  }, []);
  
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };
  
  const checkExistingRequest = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${config.API_URL}/api/resignation/my-status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success && response.data.request) {
        setExistingRequest(response.data.request);
      }
    } catch (error) {
      console.error('Error checking existing request:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If notice period changes, update last working day
    if (name === 'noticePeriod') {
      const lastWorkingDay = new Date();
      lastWorkingDay.setDate(lastWorkingDay.getDate() + parseInt(value));
      
      setFormData(prev => ({
        ...prev,
        lastWorkingDay: formatDateForInput(lastWorkingDay)
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      setError('Please provide a reason for your resignation');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(
        `${config.API_URL}/api/resignation/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('Your resignation request has been submitted successfully');
        setExistingRequest(response.data.request);
      }
    } catch (error) {
      console.error('Error submitting resignation:', error);
      setError(error.response?.data?.error || 'Failed to submit resignation request');
    } finally {
      setLoading(false);
    }
  };
  
  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw your resignation request?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.put(
        `${config.API_URL}/api/resignation/withdraw`,
        { withdrawalReason: 'Changed my mind about resigning' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('Your resignation request has been withdrawn');
        setExistingRequest(response.data.request);
        
        // Refresh the page after a delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error withdrawing resignation:', error);
      setError(error.response?.data?.error || 'Failed to withdraw resignation request');
    } finally {
      setLoading(false);
    }
  };
  
  // Show existing request if one exists
  if (existingRequest) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Resignation Status
          </Typography>
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Status
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {existingRequest.status}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Submission Date
              </Typography>
              <Typography variant="body1">
                {new Date(existingRequest.submissionDate).toLocaleDateString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Notice Period
              </Typography>
              <Typography variant="body1">
                {existingRequest.noticePeriod} days
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Last Working Day
              </Typography>
              <Typography variant="body1">
                {new Date(existingRequest.lastWorkingDay).toLocaleDateString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Reason
              </Typography>
              <Typography variant="body1">
                {existingRequest.reason}
              </Typography>
            </Grid>
          </Grid>
          
          {existingRequest.status === 'Pending' && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleWithdraw}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Withdraw Resignation'}
              </Button>
            </Box>
          )}
          
          {existingRequest.status === 'Approved' && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Your resignation has been approved. Your account will be deactivated after your last working day.
            </Alert>
          )}
          
          {existingRequest.status === 'Rejected' && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                Your resignation request has been rejected.
              </Alert>
              
              {existingRequest.adminNotes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Admin Notes
                  </Typography>
                  <Typography variant="body1">
                    {existingRequest.adminNotes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Submit Resignation
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Please note that once submitted, your resignation request will be reviewed by HR and management.
          The standard notice period is 30 days, but it can be adjusted based on your role and responsibilities.
        </Alert>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Resignation"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
                helperText="Please provide a clear reason for your resignation"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Notice Period (Days)</InputLabel>
                <Select
                  name="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={handleInputChange}
                  label="Notice Period (Days)"
                >
                  <MenuItem value={15}>15 Days</MenuItem>
                  <MenuItem value={30}>30 Days (Standard)</MenuItem>
                  <MenuItem value={45}>45 Days</MenuItem>
                  <MenuItem value={60}>60 Days</MenuItem>
                  <MenuItem value={90}>90 Days</MenuItem>
                </Select>
                <FormHelperText>
                  Standard notice period is 30 days
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Working Day"
                type="date"
                name="lastWorkingDay"
                value={formData.lastWorkingDay}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Resignation'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default SubmitResignationForm;