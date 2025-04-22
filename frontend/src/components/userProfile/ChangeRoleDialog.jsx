import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Loop as LoopIcon,
  Check as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const ChangeRoleDialog = ({ open, onClose, user, onRoleChanged }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    newRole: '',
    newId: '',
    department: '',
    designation: '',
    salary: '',
    keepTeamAssignments: false
  });
  const [step, setStep] = useState(0); // 0: initial, 1: confirm, 2: result

  useEffect(() => {
    // Reset the form when the dialog opens or user changes
    if (open && user) {
      setStep(0);
      setError('');
      setSuccess('');
      
      setFormData({
        newRole: user.user.role === 'employee' ? 'manager' : 'employee',
        newId: '', // Will need to be filled in by admin
        department: user.department?._id || '',
        designation: user.designation || '',
        salary: user.user.role === 'employee' ? user.salary || '' : '',
        keepTeamAssignments: false
      });
      
      // Fetch departments
      fetchDepartments();
    }
  }, [open, user]);

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
      setError("Failed to load departments");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.newId) {
      setError(`New ${formData.newRole === 'employee' ? 'Employee' : 'Manager'} ID is required`);
      return false;
    }
    
    if (!formData.department) {
      setError("Department is required");
      return false;
    }
    
    if (formData.newRole === 'employee' && !formData.salary) {
      setError("Salary is required when converting to employee");
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep(1);
      setError('');
    }
  };

  const handleBack = () => {
    setStep(0);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.put(
        `${config.API_URL}/api/user-profile/${user._id}/change-role`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccess(response.data.message);
        setStep(2);
        
        // Call the callback function to update the parent component
        if (onRoleChanged) {
          onRoleChanged();
        }
      } else {
        setError(response.data.error || "Failed to change user role");
      }
    } catch (error) {
      console.error("Error changing role:", error);
      setError(error.response?.data?.error || "Failed to change user role");
    } finally {
      setLoading(false);
    }
  };

  const renderInitialForm = () => (
    <>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center">
          <SwapIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Change Role: {user?.user?.name}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          You are about to change this user's role from 
          <strong> {user?.user?.role} </strong> 
          to 
          <strong> {formData.newRole}</strong>. 
          This will affect their permissions and data.
        </Alert>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={formData.newRole === 'employee' ? "New Employee ID" : "New Manager ID"}
              name="newId"
              value={formData.newId}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={formData.department}
                onChange={handleChange}
                label="Department"
                required
              >
                {departments.map(dept => (
                  <MenuItem key={dept._id} value={dept._id}>
                    {dept.dep_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {formData.newRole === 'employee' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleNext} 
          variant="contained" 
          startIcon={<LoopIcon />}
        >
          Continue
        </Button>
      </DialogActions>
    </>
  );

  const renderConfirmation = () => (
    <>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center">
          <SwapIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Confirm Role Change
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Please confirm the following changes:
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Current Role
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {user?.user?.role === 'employee' ? (
                  <PersonIcon color="info" sx={{ mr: 1 }} />
                ) : (
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                )}
                <Typography variant="h6" component="span" sx={{ textTransform: 'capitalize' }}>
                  {user?.user?.role}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>ID:</strong> {user?.user?.role === 'employee' ? user?.employeeId : user?.managerId}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Department:</strong> {user?.department?.dep_name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Designation:</strong> {user?.designation || 'Not specified'}
              </Typography>
              {user?.user?.role === 'employee' && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Salary:</strong> ₹{user?.salary?.toLocaleString() || 'Not specified'}
                </Typography>
              )}
              {user?.user?.role === 'manager' && user.teams?.length > 0 && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Teams:</strong> {user.teams.length}
                </Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, border: 1, borderColor: 'primary.main', borderRadius: 1, bgcolor: 'primary.soft', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                New Role
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {formData.newRole === 'employee' ? (
                  <PersonIcon color="info" sx={{ mr: 1 }} />
                ) : (
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                )}
                <Typography variant="h6" component="span" sx={{ textTransform: 'capitalize' }}>
                  {formData.newRole}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>ID:</strong> {formData.newId}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Department:</strong> {departments.find(d => d._id === formData.department)?.dep_name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Designation:</strong> {formData.designation || 'Not specified'}
              </Typography>
              {formData.newRole === 'employee' && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Salary:</strong> ₹{parseFloat(formData.salary).toLocaleString() || 'Not specified'}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
        
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" fontWeight="medium">
            Important: This action will:
          </Typography>
          <ul style={{ marginTop: 8, marginBottom: 8, paddingLeft: 24 }}>
            <li>Change the user's permissions and access levels</li>
            <li>Create a new {formData.newRole} record</li>
            <li>Delete their existing {user?.user?.role} record</li>
            {user?.user?.role === 'manager' && user.teams?.length > 0 && (
              <li>Their teams will need to be reassigned to other managers</li>
            )}
            <li>The user will need to log out and log back in</li>
          </ul>
        </Alert>
        
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleBack} color="inherit">
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SwapIcon />}
        >
          {loading ? "Processing..." : "Change Role"}
        </Button>
      </DialogActions>
    </>
  );

  const renderResult = () => (
    <>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center">
          {success ? <CheckIcon color="success" sx={{ mr: 1 }} /> : <ErrorIcon color="error" sx={{ mr: 1 }} />}
          <Typography variant="h6">
            {success ? "Role Changed Successfully" : "Error Changing Role"}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        ) : (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" paragraph>
          {success ? 
            `The user's role has been changed from ${user?.user?.role} to ${formData.newRole}.` : 
            "The role change operation could not be completed. Please try again or contact support."
          }
        </Typography>
        
        {success && (
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> The user will need to log out and log back in for the changes to take full effect. A notification has been sent to inform them of this change.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          variant="contained"
        >
          Close
        </Button>
      </DialogActions>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={step === 2 ? onClose : undefined}
      maxWidth="md"
      fullWidth
    >
      {step === 0 && renderInitialForm()}
      {step === 1 && renderConfirmation()}
      {step === 2 && renderResult()}
    </Dialog>
  );
};

export default ChangeRoleDialog;