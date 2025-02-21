import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  useTheme,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarMonthIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import config from "../../config";

const ViewEmployee = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
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

  if (!employee) {
    return (
      <Box p={3}>
        <Alert severity="info">No employee data found</Alert>
      </Box>
    );
  }

  const InfoItem = ({ icon, label, value, chipValue }) => (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{ py: 1.5 }}
    >
      <Box sx={{ color: 'primary.main' }}>
        {icon}
      </Box>
      <Box flex={1}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {chipValue ? (
          <Chip
            label={value}
            color={value.toLowerCase() === 'active' ? 'success' : 'error'}
            size="small"
            sx={{ mt: 0.5 }}
          />
        ) : (
          <Typography variant="body1" color="text.primary">
            {value}
          </Typography>
        )}
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/admin-dashboard/employees')}
        sx={{ mb: 3 }}
      >
        Back to Employees
      </Button>

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Header Section */}
        <Box
          sx={{
            background: theme.palette.primary.main,
            p: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.light} 90%)`,
              opacity: 0.7,
            }}
          />
          
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems="center"
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <Avatar
              src={employee.userId.profileImage 
                ? `${config.API_URL}/uploads/${employee.userId.profileImage}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.userId.name)}&background=random`}
              alt={employee.userId.name}
              sx={{ 
                width: 100, 
                height: 100,
                border: '4px solid white'
              }}
            />
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {employee.userId.name}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {employee.designation}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Information Grid */}
        <Grid container spacing={3} sx={{ p: 3 }}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                bgcolor: 'grey.50',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Personal Information
              </Typography>
              
              <Stack divider={<Divider />}>
                <InfoItem
                  icon={<BadgeIcon />}
                  label="Employee ID"
                  value={employee.employeeId}
                />
                <InfoItem
                  icon={<EmailIcon />}
                  label="Email"
                  value={employee.userId.email}
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
                  icon={<FavoriteIcon />}
                  label="Marital Status"
                  value={employee.maritalStatus}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* Professional Information */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                bgcolor: 'grey.50',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Professional Information
              </Typography>
              
              <Stack divider={<Divider />}>
                <InfoItem
                  icon={<BusinessIcon />}
                  label="Department"
                  value={employee.department.dep_name}
                />
                <InfoItem
                  icon={<BadgeIcon />}
                  label="Role"
                  value={employee.userId.role}
                />
                <InfoItem
                  icon={<PersonIcon />}
                  label="Status"
                  value={employee.userId.status === 'active' ? 'Active' : 'Inactive'}
                  chipValue={true}
                />
                <InfoItem
                  icon={<CalendarMonthIcon />}
                  label="Joined Date"
                  value={new Date(employee.createdAt).toLocaleDateString()}
                />
                <InfoItem
                  icon={<UpdateIcon />}
                  label="Last Updated"
                  value={new Date(employee.updatedAt).toLocaleDateString()}
                />
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ViewEmployee;