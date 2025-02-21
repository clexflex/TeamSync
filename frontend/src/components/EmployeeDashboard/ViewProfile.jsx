import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Skeleton,
  Paper,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Badge as BadgeIcon,
  Cake as CakeIcon,
  Business as BusinessIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import config from "../../config";

const ViewProfile = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/employee/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data.success) {
          setEmployee(response.data.employee);
        }
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch employee data');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Alert severity="info">No employee data found</Alert>
      </Box>
    );
  }

  const InfoItem = ({ icon, label, value }) => (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1 }}>
      <Box sx={{ color: 'primary.main' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" color="text.primary" fontWeight="medium">
          {value}
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Card elevation={0} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
            Employee Details
          </Typography>

          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar
                  src={employee.userId.profileImage 
                    ? `${config.API_URL}/uploads/${employee.userId.profileImage}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.userId.name)}&background=random`}
                  alt={employee.userId.name}
                  sx={{
                    width: 200,
                    height: 200,
                    border: 3,
                    borderColor: 'primary.main'
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={7}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  bgcolor: 'grey.50',
                  borderRadius: 2
                }}
              >
                <Stack divider={<Divider />} spacing={1}>
                  <InfoItem
                    icon={<PersonIcon />}
                    label="Name"
                    value={employee.userId.name}
                  />
                  <InfoItem
                    icon={<BadgeIcon />}
                    label="Employee ID"
                    value={employee.employeeId}
                  />
                  <InfoItem
                    icon={<CakeIcon />}
                    label="Date of Birth"
                    value={new Date(employee.dob).toLocaleDateString()}
                  />
                  <InfoItem
                    icon={<PersonIcon />}
                    label="Gender"
                    value={employee.gender}
                  />
                  <InfoItem
                    icon={<BusinessIcon />}
                    label="Department"
                    value={employee.department.dep_name}
                  />
                  <InfoItem
                    icon={<FavoriteIcon />}
                    label="Marital Status"
                    value={employee.maritalStatus}
                  />
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ViewProfile;