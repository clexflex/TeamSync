import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Cake as CakeIcon,
  Favorite as FavoriteIcon,
  CalendarMonth as CalendarMonthIcon,
  Update as UpdateIcon,
  Group as GroupIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/authContext';

const ViewUserProfile = () => {
  const { id } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAuth();

  // Determine if the current user is an admin
  const isAdmin = user?.role === 'admin';
  
  // Determine if the user is viewing their own profile
  const isOwnProfile = user?._id === id;

  // Determine which dashboard we're in based on URL path
  const isAdminDashboard = location.pathname.includes('/admin-dashboard');
  const isEmployeeDashboard = location.pathname.includes('/employee-dashboard');
  const isManagerDashboard = location.pathname.includes('/manager-dashboard');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/user-profile/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setUserProfile(response.data.userProfile);
        }
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch user profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
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

  if (!userProfile) {
    return (
      <Box p={3}>
        <Alert severity="info">No user profile data found</Alert>
      </Box>
    );
  }

  const { user: profileUser, joiningDate, leaveBalances } = userProfile;
  const isEmployee = profileUser.role === 'employee';
  const isManager = profileUser.role === 'manager';

  // Navigate back based on role and current dashboard
  const navigateBack = () => {
    if (isAdminDashboard) {
      navigate('/admin-dashboard/user-profiles');
    } else if (isEmployeeDashboard) {
      navigate('/employee-dashboard');
    } else if (isManagerDashboard) {
      navigate('/manager-dashboard');
    } else {
      navigate(-1);
    }
  };

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
            {value || 'Not specified'}
          </Typography>
        )}
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Only show back button if user is admin or viewing own profile */}
     
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={navigateBack}
          sx={{ mb: 3 }}
        >
          {isAdminDashboard 
            ? `Back to ${isEmployee ? 'Employees' : isManager ? 'Managers' : 'Dashboard'}`
            : 'Back to Dashboard'}
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
              src={profileUser.profileImage 
                ? `${config.API_URL}/uploads/${profileUser.profileImage}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=random`}
              alt={profileUser.name}
              sx={{ 
                width: 100, 
                height: 100,
                border: '4px solid white'
              }}
            />
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {profileUser.name}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {userProfile.designation || (isManager ? 'Team Manager' : 'Employee')}
              </Typography>
              <Chip 
                label={profileUser.role.charAt(0).toUpperCase() + profileUser.role.slice(1)}
                color="secondary"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Stack>
        </Box>

        {/* Information Grid */}
        <Grid container spacing={3} sx={{ p: 3 }}>
          {/* Basic Information */}
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
                Basic Information
              </Typography>
              
              <Stack divider={<Divider />}>
                <InfoItem
                  icon={<BadgeIcon />}
                  label={isEmployee ? "Employee ID" : "Manager ID"}
                  value={isEmployee ? userProfile.employeeId : userProfile.managerId}
                />
                <InfoItem
                  icon={<EmailIcon />}
                  label="Email"
                  value={profileUser.email}
                />
                <InfoItem
                  icon={<BusinessIcon />}
                  label="Department"
                  value={userProfile.department?.dep_name}
                />
                <InfoItem
                  icon={<PersonIcon />}
                  label="Designation"
                  value={userProfile.designation}
                />
                <InfoItem
                  icon={<PersonIcon />}
                  label="Status"
                  value={profileUser.status === 'active' ? 'Active' : 'Inactive'}
                  chipValue={true}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* Personal/Additional Details */}
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
                {isEmployee ? 'Personal Information' : 'Professional Details'}
              </Typography>
              
              <Stack divider={<Divider />}>
                <InfoItem
                  icon={<CalendarMonthIcon />}
                  label="Joining Date"
                  value={new Date(joiningDate).toLocaleDateString()}
                />
                
                {isEmployee && (
                  <>
                    {userProfile.dob && (
                      <InfoItem
                        icon={<CakeIcon />}
                        label="Date of Birth"
                        value={new Date(userProfile.dob).toLocaleDateString()}
                      />
                    )}
                    <InfoItem
                      icon={<PersonIcon />}
                      label="Gender"
                      value={userProfile.gender}
                    />
                    <InfoItem
                      icon={<FavoriteIcon />}
                      label="Marital Status"
                      value={userProfile.maritalStatus}
                    />
                    <InfoItem
                      icon={<AttachMoneyIcon />}
                      label="Salary"
                      value={userProfile.salary ? `$${userProfile.salary.toLocaleString()}` : 'Not specified'}
                    />
                  </>
                )}
                
                <InfoItem
                  icon={<UpdateIcon />}
                  label="Last Updated"
                  value={new Date(userProfile.updatedAt).toLocaleDateString()}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* Leave Balances */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'grey.50',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Leave Balances
              </Typography>
              
              <Grid container spacing={2}>
                {leaveBalances && leaveBalances.map((leave, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          {leave.leaveType}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2">
                            Available:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {leave.balance} days
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            Used:
                          </Typography>
                          <Typography variant="body1">
                            {leave.used} days
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Teams Section for Managers */}
          {isManager && userProfile.teams && userProfile.teams.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'grey.50',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Teams Under Management
                </Typography>
                <Grid container spacing={2}>
                  {userProfile.teams.map((team) => (
                    <Grid item xs={12} key={team._id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {team.name}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <GroupIcon fontSize="small" color="action" />
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

        {/* Action Buttons - Only show for admin users */}
        {isAdmin && isAdminDashboard && (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={navigateBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate(`/admin-dashboard/user-profile/edit/${id}`)}
            >
              Edit Profile
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ViewUserProfile;