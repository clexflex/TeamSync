import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {   Box,   Paper,   Typography,   TextField,   Button,   Grid,   FormControl,   InputLabel,   Select,   MenuItem,   FormControlLabel,   Checkbox,   IconButton,   Alert,   Stack,   Divider,   Chip } from '@mui/material';
import { ArrowBack, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const leaveTypeOptions = ["Casual Leave", "Sick Leave", "Paid Leave", "Half Leave"];
const roleOptions = ["employee", "manager"];

const CreateLeavePolicy = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leaveTypes: [
      {
        type: 'Casual Leave',
        daysAllowed: 10,
        carryForward: false,
        maxCarryForward: 0,
        paid: true,
        probationPeriod: 0,
        description: ''
      }
    ],
    applicableRoles: ['employee', 'manager']
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      applicableRoles: value
    }));
  };

  const handleLeaveTypeChange = (index, field, value) => {
    setFormData(prev => {
      const updatedLeaveTypes = [...prev.leaveTypes];
      
      if (field === 'carryForward' || field === 'paid') {
        updatedLeaveTypes[index][field] = !updatedLeaveTypes[index][field];
      } else {
        updatedLeaveTypes[index][field] = value;
      }
      
      return {
        ...prev,
        leaveTypes: updatedLeaveTypes
      };
    });
  };

  const addLeaveType = () => {
    setFormData(prev => ({
      ...prev,
      leaveTypes: [...prev.leaveTypes, {
        type: '',
        daysAllowed: 0,
        carryForward: false,
        maxCarryForward: 0,
        paid: true,
        probationPeriod: 0,
        description: ''
      }]
    }));
  };

  const removeLeaveType = (index) => {
    if (formData.leaveTypes.length <= 1) {
      setError('At least one leave type is required');
      return;
    }
    
    setFormData(prev => {
      const updatedLeaveTypes = [...prev.leaveTypes];
      updatedLeaveTypes.splice(index, 1);
      return {
        ...prev,
        leaveTypes: updatedLeaveTypes
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate form data
    if (!formData.name.trim()) {
      setError('Policy name is required');
      setLoading(false);
      return;
    }
    
    if (formData.leaveTypes.length === 0) {
      setError('At least one leave type is required');
      setLoading(false);
      return;
    }
    
    for (const leaveType of formData.leaveTypes) {
      if (!leaveType.type) {
        setError('Leave type cannot be empty');
        setLoading(false);
        return;
      }
      
      if (leaveType.daysAllowed < 0) {
        setError('Days allowed must be a positive number');
        setLoading(false);
        return;
      }
    }
    
    try {
      const response = await axios.post(
        `${config.API_URL}/api/leave/policy/create`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      setSuccess('Leave policy created successfully');
      setTimeout(() => {
        navigate('/admin-dashboard/leave-policies');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create leave policy');
      console.error('Error creating leave policy:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/admin-dashboard/leave-policies')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            Create Leave Policy
          </Typography>
        </Box>
        
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Policy Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Applicable Roles</InputLabel>
                <Select
                  multiple
                  value={formData.applicableRoles}
                  onChange={handleRoleChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {roleOptions.map(role => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Leave Types</Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={addLeaveType}
                >
                  Add Leave Type
                </Button>
              </Box>
              
              {formData.leaveTypes.map((leaveType, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Leave Type {index + 1}
                    </Typography>
                    <IconButton
                      color="error"
                      onClick={() => removeLeaveType(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Leave Type</InputLabel>
                        <Select
                          value={leaveType.type}
                          onChange={(e) => handleLeaveTypeChange(index, 'type', e.target.value)}
                          required
                        >
                          {leaveTypeOptions.map(type => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Days Allowed"
                        type="number"
                        value={leaveType.daysAllowed}
                        onChange={(e) => handleLeaveTypeChange(index, 'daysAllowed', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 0 } }}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Probation Period (months)"
                        type="number"
                        value={leaveType.probationPeriod}
                        onChange={(e) => handleLeaveTypeChange(index, 'probationPeriod', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" spacing={3}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={leaveType.paid}
                              onChange={() => handleLeaveTypeChange(index, 'paid')}
                            />
                          }
                          label="Paid Leave"
                        />
                        
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={leaveType.carryForward}
                              onChange={() => handleLeaveTypeChange(index, 'carryForward')}
                            />
                          }
                          label="Allow Carry Forward"
                        />
                      </Stack>
                    </Grid>
                    
                    {leaveType.carryForward && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Max Carry Forward Days"
                          type="number"
                          value={leaveType.maxCarryForward}
                          onChange={(e) => handleLeaveTypeChange(index, 'maxCarryForward', parseInt(e.target.value))}
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                      </Grid>
                    )}
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={leaveType.description}
                        onChange={(e) => handleLeaveTypeChange(index, 'description', e.target.value)}
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin-dashboard/leave-policies')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Policy'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateLeavePolicy;