import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Stack, Alert, CircularProgress, MenuItem, FormControl, InputLabel, Select, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import config from '../../config';

const EditTeam = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [managers, setManagers] = useState([]);
  const getBasePath = (user) => {
    return user.role === "admin" ? "/admin-dashboard" : "/manager-dashboard";
  };

  const basePath = getBasePath(user);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: '',
    department: '',
    members: []
  });

  useEffect(() => {
    fetchTeamData();
    if (user.role === 'admin') {
      fetchManagers();
    }
  }, [teamId, user.role]);

  const fetchManagers = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/manager`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setManagers(response.data.managers);
    } catch (error) {
      console.error('Error fetching managers:', error);
      setError('Failed to fetch managers');
    }
  };

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await axios.get(`${config.API_URL}/api/team/${teamId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const team = response.data.team;
      setFormData({
        name: team.name,
        description: team.description,
        managerId: team.managerId._id,
        department: team.department._id,
        members: team.members || []
      });

    } catch (error) {
      console.error('Error fetching team data:', error);
      setError(error.response?.data?.error || 'Failed to fetch team data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      await axios.put(`${config.API_URL}/api/team/${teamId}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccess('Team updated successfully');
      setTimeout(() => {
        navigate(`${basePath}/team`);
      }, 1500);

    } catch (error) {
      console.error('Error updating team:', error);
      setError(error.response?.data?.error || 'Failed to update team');
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
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          mb: 4,
          cursor: 'pointer',
          color: 'text.secondary',
          '&:hover': { color: 'primary.main' }
        }}
        onClick={() => navigate(`${basePath}/team`)}
      >
        <ArrowBack />
        <Typography>Back to Teams</Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Edit Team
        </Typography>

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
          <Stack spacing={3}>
            <TextField
              label="Team Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={4}
              fullWidth
            />

            {user.role === 'admin' && (
              <FormControl fullWidth>
                <InputLabel>Team Manager</InputLabel>
                <Select
                  value={formData.managerId}
                  label="Team Manager"
                  onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
                >
                  {managers.map((manager) => (
                    <MenuItem key={manager._id} value={manager._id}>
                      {manager.userId.name} ({manager.managerId})
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Only administrators can change team managers
                </Typography>
              </FormControl>
            )}

            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider'
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
                {isLoading ? 'Updating...' : 'Update Team'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default EditTeam;