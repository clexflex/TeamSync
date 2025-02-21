import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import config from "../../config";

const EditManager = () => {
  const [manager, setManager] = useState({
    name: '',
    email: '',
    managerId: '',
    department: '',
    designation: '',
    password: ''
  });
  const [departments, setDepartments] = useState([]);
  const [originalManager, setOriginalManager] = useState(null);
  const [changedFields, setChangedFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [managerResponse, departmentsResponse] = await Promise.all([
          axios.get(`${config.API_URL}/api/manager/${id}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get(`${config.API_URL}/api/department`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        if (managerResponse.data.success) {
          const managerData = managerResponse.data.manager;
          const formattedManager = {
            name: managerData.userId.name,
            email: managerData.userId.email,
            managerId: managerData.managerId,
            department: managerData.department._id,
            designation: managerData.designation,
            password: ''
          };
          setManager(formattedManager);
          setOriginalManager(formattedManager);
        }

        if (departmentsResponse.data.success) {
          setDepartments(departmentsResponse.data.departments);
        }
      } catch (error) {
        setError(error.response?.data?.error || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setManager(prev => ({ ...prev, [name]: value }));
    
    if (originalManager[name] !== value) {
      setChangedFields(prev => ({ ...prev, [name]: true }));
    } else {
      setChangedFields(prev => {
        const newFields = { ...prev };
        delete newFields[name];
        return newFields;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateData = {};
    Object.keys(changedFields).forEach(field => {
      updateData[field] = manager[field];
    });

    if (!updateData.password) {
      delete updateData.password;
    }

    try {
      const response = await axios.put(
        `${config.API_URL}/api/manager/${id}`,
        updateData,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (response.data.success) {
        navigate("/admin-dashboard/managers");
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update manager');
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
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack 
        direction="row" 
        alignItems="center" 
        spacing={1}
        onClick={() => navigate('/admin-dashboard/managers')}
        sx={{ 
          mb: 4, 
          cursor: 'pointer',
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            '& .MuiSvgIcon-root': {
              transform: 'translateX(-4px)'
            }
          }
        }}
      >
        <ArrowBack sx={{ transition: 'transform 0.2s' }} />
        <Typography>Back to Managers</Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Edit Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Modify the manager profile details
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={manager.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={manager.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Manager ID"
                name="managerId"
                value={manager.managerId}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={manager.department}
                  onChange={handleChange}
                  label="Department"
                >
                  {departments.map(dep => (
                    <MenuItem key={dep._id} value={dep._id}>
                      {dep.dep_name}
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
                value={manager.designation}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="New Password (optional)"
                name="password"
                type="password"
                value={manager.password}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={Object.keys(changedFields).length === 0}
              sx={{
                px: 4,
                py: 1,
                '&.Mui-disabled': {
                  backgroundColor: 'action.disabledBackground'
                }
              }}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin-dashboard/managers')}
              sx={{ px: 4, py: 1 }}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditManager;