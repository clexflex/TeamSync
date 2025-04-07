import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  CircularProgress,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/authContext';

const AddTicket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: 'Medium',
    dueDate: ''
  });
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle file uploads
  const handleFileChange = (e) => {
    if (e.target.files) {
      if (e.target.files.length > 5) {
        setErrors({
          ...errors,
          attachments: 'Maximum 5 files allowed'
        });
        return;
      }
      
      const selectedFiles = Array.from(e.target.files);
      
      // Check file sizes (10MB limit per file)
      const oversizedFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setErrors({
          ...errors,
          attachments: 'One or more files exceed the 10MB size limit'
        });
        return;
      }
      
      setFiles(selectedFiles);
      
      // Clear file error if it exists
      if (errors.attachments) {
        setErrors({
          ...errors,
          attachments: ''
        });
      }
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }
    
    // Due date validation if provided
    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setSubmitError('');
    setSubmitSuccess('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Create form data for file upload
      const ticketFormData = new FormData();
      ticketFormData.append('title', formData.title);
      ticketFormData.append('description', formData.description);
      ticketFormData.append('type', formData.type);
      ticketFormData.append('priority', formData.priority);
      
      if (formData.dueDate) {
        ticketFormData.append('dueDate', formData.dueDate);
      }
      
      // Add files if any
      if (files.length > 0) {
        files.forEach(file => {
          ticketFormData.append('attachments', file);
        });
      }
      
      const response = await axios.post(
        `${config.API_URL}/api/tickets/create`,
        ticketFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setSubmitSuccess('Ticket created successfully!');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          type: '',
          priority: 'Medium',
          dueDate: ''
        });
        setFiles([]);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate(`/${user.role}-dashboard/tickets`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setSubmitError(
        error.response?.data?.error || 
        'Failed to create ticket. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        Create New Support Ticket
      </Typography>
      
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError('')}>
          {submitError}
        </Alert>
      )}
      
      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSubmitSuccess('')}>
          {submitSuccess}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Ticket Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Ticket Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.type}
                helperText={errors.type}
              >
                <MenuItem value="">Select a type</MenuItem>
                <MenuItem value="Tech Support">Tech Support</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Payroll">Payroll</MenuItem>
                <MenuItem value="Facility">Facility</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.priority}
                helperText={errors.priority}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Due Date (Optional)"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!errors.dueDate}
                helperText={errors.dueDate}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.attachments}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{ height: '56px' }}
                >
                  {files.length > 0 ? `${files.length} file(s) selected` : 'Upload Attachments'}
                  <input
                    type="file"
                    multiple
                    hidden
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                </Button>
                {errors.attachments && (
                  <FormHelperText error>{errors.attachments}</FormHelperText>
                )}
                {files.length > 0 && (
                  <FormHelperText>
                    Max 5 files, 10MB each (images, PDFs, Office documents, text files)
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={6}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate(`/${user.role}-dashboard/tickets`)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddTicket;