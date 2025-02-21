import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Select, MenuItem, Button, Grid, FormControl, InputLabel, FormGroup, FormControlLabel, Checkbox, Stack, Alert, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/authContext';

const AddTeam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    managerId: '',
    department: '',
    description: '',
  });
  const getBasePath = (user) => {
    return user.role === "admin" ? "/admin-dashboard" : "/manager-dashboard";
  };
  const basePath = getBasePath(user);


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError('');

        if (user.role === 'admin') {
          const [managersRes, departmentsRes] = await Promise.all([
            axios.get(`${config.API_URL}/api/manager`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }),
            axios.get(`${config.API_URL}/api/department`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
          ]);

          setManagers(managersRes.data.managers);
          setDepartments(departmentsRes.data.departments);
        } else if (user.role === 'manager') {
          const managerRes = await axios.get(`${config.API_URL}/api/manager/${user._id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });

          const managerData = managerRes.data.manager;
          setFormData(prev => ({
            ...prev,
            managerId: managerData._id,
            department: managerData.department._id
          }));

          const employeesRes = await axios.get(
            `${config.API_URL}/api/employee/department/${managerData.department._id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          setEmployees(employeesRes.data.employees);
        }
      } catch (error) {
        setError('Failed to load required data');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  const handleManagerSelect = async (managerId) => {
    try {
      setIsLoading(true);
      setError('');
      const managerInfo = managers.find(m => m._id === managerId);

      if (managerInfo) {
        setFormData(prev => ({
          ...prev,
          managerId,
          department: managerInfo.department._id
        }));

        const response = await axios.get(
          `${config.API_URL}/api/employee/department/${managerInfo.department._id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setEmployees(response.data.employees);
      }
    } catch (error) {
      setError('Failed to load department employees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');

      await axios.post(
        `${config.API_URL}/api/team/create`,
        { ...formData, members: selectedEmployees },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      navigate(`${basePath}/team`);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create team');
    } finally {
      setIsLoading(false);
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
      <Stack direction="row" alignItems="center" spacing={1}
        onClick={() => navigate(`${basePath}/team`)}
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
        }}>
        <ArrowBack sx={{ transition: 'transform 0.2s' }} />
        <Typography>Back to Teams</Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
          Create New Team
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Team Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>

            {user.role === 'admin' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Manager</InputLabel>
                  <Select
                    value={formData.managerId}
                    label="Manager"
                    onChange={(e) => handleManagerSelect(e.target.value)}
                    required
                  >
                    {managers.map(manager => (
                      <MenuItem key={manager._id} value={manager._id}>
                        {manager.userId.name} - {manager.department.dep_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Select Team Members
              </Typography>

              <Paper variant="outlined" sx={{
                p: 2,
                maxHeight: 300,
                overflow: 'auto',
                bgcolor: 'grey.50'
              }}>
                {employees.length === 0 ? (
                  <Typography color="text.secondary" align="center">
                    No available employees found
                  </Typography>
                ) : (
                  <FormGroup>
                    {employees.map((employee) => (
                      <FormControlLabel
                        key={employee._id}
                        control={
                          <Checkbox
                            checked={selectedEmployees.includes(employee._id)}
                            onChange={() => handleEmployeeSelect(employee._id)}
                          />
                        }
                        label={`${employee.userId?.name} - ${employee.employeeId}`}
                        sx={{
                          py: 0.5,
                          px: 1,
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: 'background.paper'
                          }
                        }}
                      />
                    ))}
                  </FormGroup>
                )}
              </Paper>
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
              onClick={() => navigate(`${basePath}/team`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Team'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddTeam;