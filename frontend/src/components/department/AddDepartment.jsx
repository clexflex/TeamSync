import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from "../../config";

const AddDepartment = () => {
  const [department, setDepartment] = useState({
    dep_name: '',
    description: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${config.API_URL}/api/department/add`,
        department,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (response.data.success) {
        navigate("/admin-dashboard/departments");
      }
    } catch (error) {
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Stack 
        direction="row" 
        alignItems="center" 
        spacing={1}
        onClick={() => navigate('/admin-dashboard/departments')}
        sx={{ 
          mb: 4, 
          cursor: 'pointer',
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main'
          }
        }}
      >
        <ArrowBackIcon />
        <Typography>Back to Departments</Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Add New Department
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new department in your organization
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Department Name"
              name="dep_name"
              value={department.dep_name}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Description"
              name="description"
              value={department.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <Button
                type="submit"
                variant="contained"
                size="large"
              >
                Create Department
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/admin-dashboard/departments')}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default AddDepartment;