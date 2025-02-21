import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import config from "../../config";

const EditDepartment = () => {
  const { id } = useParams();
  const [department, setDepartment] = useState({
    dep_name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartment = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${config.API_URL}/api/department/${id}`,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        if (response.data.success) {
          setDepartment(response.data.department);
        }
      } catch (error) {
        if (error.response?.data?.error) {
          alert(error.response.data.error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDepartment();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${config.API_URL}/api/department/${id}`,
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

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
            Edit Department
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update department information
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
                Update Department
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

export default EditDepartment;