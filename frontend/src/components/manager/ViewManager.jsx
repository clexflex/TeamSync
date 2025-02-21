import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Stack,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Email,
  Badge,
  Business,
  Person,
  Group
} from '@mui/icons-material';
import config from "../../config";

const ViewManager = () => {
  const { id } = useParams();
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchManager = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/manager/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setManager(response.data.manager);
        }
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to load manager data');
      } finally {
        setLoading(false);
      }
    };

    fetchManager();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!manager) {
    return (
      <Box p={3}>
        <Alert severity="info">Manager not found</Alert>
      </Box>
    );
  }

  const InfoItem = ({ icon, label, value }) => (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1.5 }}>
      <Box sx={{ color: 'primary.main' }}>
        {icon}
      </Box>
      <Box flex={1}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1">
          {value}
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admin-dashboard/managers')}
        sx={{ mb: 3 }}
      >
        Back to Managers
      </Button>

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.main', p: 4, color: 'white' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                src={manager.userId.profileImage ? 
                  `${config.API_URL}/uploads/${manager.userId.profileImage}` : 
                  undefined}
                sx={{ 
                  width: 100, 
                  height: 100,
                  border: '4px solid white'
                }}
              >
                {!manager.userId.profileImage && manager.userId.name.charAt(0)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" component="h1" fontWeight="bold">
                {manager.userId.name}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {manager.designation}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Basic Information
                </Typography>
                <Stack divider={<Divider />}>
                  <InfoItem
                    icon={<Badge />}
                    label="Manager ID"
                    value={manager.managerId}
                  />
                  <InfoItem
                    icon={<Email />}
                    label="Email"
                    value={manager.userId.email}
                  />
                  <InfoItem
                    icon={<Business />}
                    label="Department"
                    value={manager.department.dep_name}
                  />
                  <InfoItem
                    icon={<Person />}
                    label="Designation"
                    value={manager.designation}
                  />
                </Stack>
              </Paper>
            </Grid>

            {manager.teams && manager.teams.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Teams Under Management
                  </Typography>
                  <Grid container spacing={2}>
                    {manager.teams.map((team) => (
                      <Grid item xs={12} key={team._id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {team.name}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Group fontSize="small" color="action" />
                                  <Typography variant="body2" color="text.secondary">
                                    {team.members?.length || 0} members
                                  </Typography>
                                </Stack>
                              </Box>
                              <Chip 
                                label="Active"
                                color="success"
                                size="small"
                              />
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate(`/manager/edit/${manager._id}`)}
            >
              Edit Manager
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ViewManager;