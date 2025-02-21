import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import {
  Box,
  Paper,
  Typography,
  Grid,
  MenuItem,
  TextField,
  Button,
  Stack,
  Alert,
  IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import config from "../../config";

const leaveTypes = [
  { value: 'Sick Leave', label: 'Sick Leave' },
  { value: 'Casual Leave', label: 'Casual Leave' },
  { value: 'Annual Leave', label: 'Annual Leave' },
  { value: 'Paid Leave', label: 'Paid Leave' }
];

const AddLeave = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leave, setLeave] = useState({
    userId: user._id,
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeave((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${config.API_URL}/api/leave/add`,
        leave,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        navigate(`/${user.role}-dashboard/leaves/${user._id}`);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Stack 
        direction="row" 
        spacing={1} 
        alignItems="center" 
        sx={{ 
          mb: 4, 
          cursor: 'pointer',
          color: 'text.secondary',
          '&:hover': { color: 'primary.main' }
        }}
        onClick={() => navigate(`/${user.role}-dashboard/leaves/${user._id}`)}
      >
        <IconButton size="small">
          <ArrowBack />
        </IconButton>
        <Typography>Back to Leaves</Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>
          Request For Leave
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Leave Type"
                name="leaveType"
                value={leave.leaveType}
                onChange={handleChange}
                required
              >
                <MenuItem value="" disabled>
                  Select Leave Type
                </MenuItem>
                {leaveTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="startDate"
                value={leave.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                name="endDate"
                value={leave.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="reason"
                value={leave.reason}
                onChange={handleChange}
                placeholder="Enter reason for leave"
                required
              />
            </Grid>
          </Grid>

          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(`/${user.role}-dashboard/leaves/${user._id}`)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default AddLeave;