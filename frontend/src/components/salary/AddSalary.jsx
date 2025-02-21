import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {   Box,   Paper,   Typography,   TextField,   Select,   MenuItem,   FormControl,   InputLabel,   Button,   Grid,   Stack,   CircularProgress,   Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const AddSalary = () => {
  
  const [salary, setSalary] = useState({
    employeeId: '',
    basicSalary: '',
    allowances: '',
    deductions: '',
    payDate: ''
  });
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

 const getEmployees = async (id) => {
    let employees;
    try {
        const response = await axios.get(`${config.API_URL}/api/employee/department/${id}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (response.data.success) {
            employees = response.data.employees;
        }
    } catch (error) {
        if (error.response && !error.response.data.success) {
            alert(error.response.data.error);
        }
    }
    return employees || [];
};
  useEffect(() => {
    const getDepartments = async () => {
      try {
        const deps = await fetchDepartments();
        setDepartments(deps || []);
      } catch (err) {
        setError('Failed to fetch departments');
      } finally {
        setIsLoading(false);
      }
    };
    getDepartments();
  }, []);

  const handleDepartment = async (e) => {
    try {
      setIsLoading(true);
      const emps = await getEmployees(e.target.value);
      setEmployees(emps || []);
    } catch (err) {
      setError('Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSalary((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${config.API_URL}/api/salary/add`,
        salary,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.data.success) {
        navigate('/admin-dashboard/employees');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add salary');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Stack 
        direction="row" 
        alignItems="center" 
        spacing={1}
        onClick={() => navigate('/admin-dashboard/employees')}
        sx={{ 
          mb: 4,
          cursor: 'pointer',
          color: 'text.secondary',
          '&:hover': { color: 'primary.main' }
        }}
      >
        <ArrowBack />
        <Typography>Back to Employees</Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Add Salary
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  onChange={handleDepartment}
                  defaultValue=""
                >
                  <MenuItem value="">Select Department</MenuItem>
                  {departments.map((dep) => (
                    <MenuItem key={dep._id} value={dep._id}>
                      {dep.dep_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Employee</InputLabel>
                <Select
                  name="employeeId"
                  label="Employee"
                  value={salary.employeeId}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select Employee</MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {emp.employeeId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Basic Salary"
                type="number"
                name="basicSalary"
                value={salary.basicSalary}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Allowances"
                type="number"
                name="allowances"
                value={salary.allowances}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Deductions"
                type="number"
                name="deductions"
                value={salary.deductions}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pay Date"
                type="date"
                name="payDate"
                value={salary.payDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Box sx={{ 
            mt: 4,
            pt: 3,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end'
          }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin-dashboard/employees')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
            >
              Save Changes
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
export default AddSalary;
