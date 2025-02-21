import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
  CircularProgress,
  Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import config from "../../config";

const EditEmployee = () => {
  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    status: '',
    employeeId: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    designation: '',
    department: '',
    salary: 0,
    password: ''
  });
  const [departments, setDepartments] = useState(null);
  const [originalEmployee, setOriginalEmployee] = useState(null);
  const [changedFields, setChangedFields] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchDepartments = async () => {
    let departments;
    try {
        const response = await axios.get(`${config.API_URL}/api/department`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (response.data.success) {
            departments = response.data.departments
        }
    } catch (error) {
        if (error.response && !error.response.data.success) {
            alert(error.response.data.error)
        }
    }
    return departments
};
  useEffect(() => {
    const getDepartments = async () => {
      const departments = await fetchDepartments();
      setDepartments(departments);
    };
    getDepartments();
  }, []);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/employee/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data.success) {
          const employeeData = response.data.employee;
          const formattedEmployee = {
            name: employeeData.userId.name,
            email: employeeData.userId.email,
            status: employeeData.userId.status,
            employeeId: employeeData.employeeId,
            dob: employeeData.dob?.split('T')[0] || '',
            gender: employeeData.gender,
            maritalStatus: employeeData.maritalStatus,
            designation: employeeData.designation,
            department: employeeData.department._id,
            salary: employeeData.salary,
            password: ''
          };
          setEmployee(formattedEmployee);
          setOriginalEmployee(formattedEmployee);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee(prev => ({ ...prev, [name]: value }));
    
    if (originalEmployee[name] !== value) {
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
      updateData[field] = employee[field];
    });

    if (!updateData.password) {
      delete updateData.password;
    }

    try {
      const response = await axios.put(
        `${config.API_URL}/api/employee/${id}`,
        updateData,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (response.data.success) {
        navigate("/admin-dashboard/employees");
      }
    } catch (error) {
      if (error.response && !error.response.data.error) {
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admin-dashboard/employees')}
        sx={{ mb: 4 }}
      >
        Back to Employees
      </Button>

      <Paper elevation={0} sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Edit Employee
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Modify the employee profile details
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={employee.name}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={employee.email}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee ID"
                name="employeeId"
                value={employee.employeeId}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={employee.status}
                onChange={handleChange}
                variant="outlined"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dob"
                type="date"
                value={employee.dob}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Gender"
                name="gender"
                value={employee.gender}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Marital Status"
                name="maritalStatus"
                value={employee.maritalStatus}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={employee.designation}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Department"
                name="department"
                value={employee.department}
                onChange={handleChange}
                variant="outlined"
              >
                {departments?.map(dep => (
                  <MenuItem key={dep._id} value={dep._id}>
                    {dep.dep_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Salary"
                name="salary"
                type="number"
                value={employee.salary}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={employee.password}
                onChange={handleChange}
                variant="outlined"
                helperText="Leave blank to keep current password"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={Object.keys(changedFields).length === 0}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin-dashboard/employees')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditEmployee;