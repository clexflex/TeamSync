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
  useTheme,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery, // Added for responsive design
  IconButton, // Added for better mobile UI
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
  AttachMoney as AttachMoneyIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Bloodtype as BloodtypeIcon,
  Flag as FlagIcon,
  Apartment as ApartmentIcon,
  AccountBalance as AccountBalanceIcon,
  Edit as EditIcon, // Added for mobile UI quick actions
} from '@mui/icons-material';
import { useAuth } from '../../context/authContext';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ViewUserProfile = () => {
  const { id } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAuth();

  // Media queries for responsive design
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  const { user: profileUser, joiningDate, leaveBalances, company } = userProfile;
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
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
          <Typography variant="body1" color="text.primary" sx={{ wordBreak: 'break-word' }}>
            {value || 'Not specified'}
          </Typography>
        )}
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Back button - hidden on small screens to save space */}
      {!isMobile && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={navigateBack}
          sx={{ mb: 3 }}
        >
          {isAdminDashboard
            ? `Back to ${isEmployee ? 'Employees' : isManager ? 'Managers' : 'Dashboard'}`
            : 'Back to Dashboard'}
        </Button>
      )}

      {/* Mobile header with back button */}
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={navigateBack}>
            <ArrowBackIcon />
          </IconButton>

          {/* Edit button (for admin) */}
          {isAdmin && isAdminDashboard && (
            <IconButton
              color="primary"
              onClick={() => navigate(`/admin-dashboard/user-profile/edit/${id}`)}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
      )}

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Header Section */}
        <Box
          sx={{
            background: theme.palette.primary.main,
            p: { xs: 2, sm: 3, md: 4 },
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
            alignItems={{ xs: 'center', sm: 'center' }}
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <Avatar
              src={profileUser.profileImage
                ? profileUser.profileImage
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=random`}
              alt={profileUser.name}
              sx={{
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                border: '4px solid white'
              }}
            />
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4" fontWeight="bold" sx={{
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }
              }}>
                {profileUser.name}
              </Typography>
              <Typography variant="h6" sx={{
                opacity: 0.9,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}>
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

        {/* Tabs for different sections */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minWidth: { xs: 'auto', sm: 100 },
                py: { xs: 1, sm: 1.5 },
                px: { xs: 1, sm: 2 }
              }
            }}
          >
            <Tab label="Basic Info" />
            <Tab label="Contact & Address" />
            <Tab label="Employment" />
            <Tab label="Education" />
            <Tab label="Previous Work" />
            <Tab label="Salary & Bank" />
            <Tab label="Leave Balances" />
          </Tabs>
        </Box>

        {/* Basic Information Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
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
                    icon={<ApartmentIcon />}
                    label="Company"
                    value={userProfile.company || 'Maximize Market Research Pvt. Ltd.'}
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
                  <InfoItem
                    icon={<CalendarMonthIcon />}
                    label="Joining Date"
                    value={formatDate(joiningDate)}
                  />
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  bgcolor: 'grey.50',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Personal Information
                </Typography>

                <Stack divider={<Divider />}>
                  {userProfile.dob && (
                    <InfoItem
                      icon={<CakeIcon />}
                      label="Date of Birth"
                      value={formatDate(userProfile.dob)}
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
                  {userProfile.bloodGroup && (
                    <InfoItem
                      icon={<BloodtypeIcon />}
                      label="Blood Group"
                      value={userProfile.bloodGroup}
                    />
                  )}
                  {userProfile.nationality && (
                    <InfoItem
                      icon={<FlagIcon />}
                      label="Nationality"
                      value={userProfile.nationality}
                    />
                  )}
                  {userProfile.fatherName && (
                    <InfoItem
                      icon={<PersonIcon />}
                      label="Father's Name"
                      value={userProfile.fatherName}
                    />
                  )}
                  {userProfile.religion && (
                    <InfoItem
                      icon={<PersonIcon />}
                      label="Religion"
                      value={userProfile.religion}
                    />
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Contact & Address Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  bgcolor: 'grey.50',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Contact Information
                </Typography>

                <Stack divider={<Divider />}>
                  <InfoItem
                    icon={<EmailIcon />}
                    label="Personal Email"
                    value={profileUser.email}
                  />
                  {userProfile.companyEmail && (
                    <InfoItem
                      icon={<EmailIcon />}
                      label="Company Email"
                      value={userProfile.companyEmail}
                    />
                  )}
                  {userProfile.primaryContactNo && (
                    <InfoItem
                      icon={<PhoneIcon />}
                      label="Primary Contact Number"
                      value={userProfile.primaryContactNo}
                    />
                  )}
                  {userProfile.location && (
                    <InfoItem
                      icon={<LocationOnIcon />}
                      label="Location"
                      value={userProfile.location}
                    />
                  )}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  bgcolor: 'grey.50',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Address Information
                </Typography>

                {userProfile.address ? (
                  <Card variant="outlined">
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Stack spacing={1}>
                        {userProfile.address.street && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <HomeIcon color="action" fontSize="small" sx={{ mt: 0.5 }} />
                            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                              {userProfile.address.street}
                            </Typography>
                          </Box>
                        )}

                        {(userProfile.address.city || userProfile.address.state || userProfile.address.postalCode) && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <LocationOnIcon color="action" fontSize="small" sx={{ mt: 0.5 }} />
                            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                              {[
                                userProfile.address.city,
                                userProfile.address.state,
                                userProfile.address.postalCode
                              ].filter(Boolean).join(', ')}
                            </Typography>
                          </Box>
                        )}

                        {userProfile.address.country && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <FlagIcon color="action" fontSize="small" sx={{ mt: 0.5 }} />
                            <Typography variant="body1">{userProfile.address.country}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ) : (
                  <Typography variant="body1" color="text.secondary">No address information available.</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Employment Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  bgcolor: 'grey.50',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Employment Details
                </Typography>

                <Stack divider={<Divider />}>
                  <InfoItem
                    icon={<BadgeIcon />}
                    label={isEmployee ? "Employee ID" : "Manager ID"}
                    value={isEmployee ? userProfile.employeeId : userProfile.managerId}
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
                    icon={<CalendarMonthIcon />}
                    label="Joining Date"
                    value={formatDate(userProfile.joiningDate)}
                  />

                  {userProfile.confirmationDate && (
                    <InfoItem
                      icon={<CalendarMonthIcon />}
                      label="Confirmation Date"
                      value={formatDate(userProfile.confirmationDate)}
                    />
                  )}

                  {userProfile.employmentStatus && (
                    <InfoItem
                      icon={<WorkIcon />}
                      label="Employment Status"
                      value={userProfile.employmentStatus}
                    />
                  )}

                  {userProfile.noticePeriod && (
                    <InfoItem
                      icon={<UpdateIcon />}
                      label="Notice Period"
                      value={`${userProfile.noticePeriod} days`}
                    />
                  )}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  bgcolor: 'grey.50',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Experience
                </Typography>

                <Stack divider={<Divider />}>
                  {userProfile.currentCompanyExperience && (
                    <InfoItem
                      icon={<WorkIcon />}
                      label="Current Company Experience"
                      value={`${userProfile.currentCompanyExperience} years`}
                    />
                  )}

                  {userProfile.previousExperience && (
                    <InfoItem
                      icon={<WorkIcon />}
                      label="Previous Experience"
                      value={`${userProfile.previousExperience} years`}
                    />
                  )}

                  {userProfile.totalExperience && (
                    <InfoItem
                      icon={<WorkIcon />}
                      label="Total Experience"
                      value={`${userProfile.totalExperience} years`}
                    />
                  )}

                  {isEmployee && userProfile.salary && (
                    <InfoItem
                      icon={<AttachMoneyIcon />}
                      label="Salary"
                      value={`₹ ${userProfile.salary.toLocaleString()}`}
                    />
                  )}

                  {userProfile.probationPeriod && (
                    <InfoItem
                      icon={<UpdateIcon />}
                      label="Probation Period"
                      value={`${userProfile.probationPeriod} months`}
                    />
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* Teams Section for Managers */}
            {isManager && userProfile.teams && userProfile.teams.length > 0 && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    mt: 2
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Teams Under Management
                  </Typography>
                  <Grid container spacing={2}>
                    {userProfile.teams.map((team) => (
                      <Grid item xs={12} sm={6} key={team._id}>
                        <Card variant="outlined">
                          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
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
        </TabPanel>

        {/* Education Tab */}
        <TabPanel value={activeTab} index={3}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: 'grey.50',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Education History
            </Typography>

            {userProfile.education && userProfile.education.length > 0 ? (
              <Grid container spacing={2}>
                {userProfile.education.map((edu, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined">
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
                          {edu.degree || 'Degree/Certification'}
                        </Typography>

                        <Stack spacing={1} sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <SchoolIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                              {edu.institute || 'Institution not specified'}
                            </Typography>
                          </Box>

                          {(edu.startDate || edu.endDate) && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {edu.startDate ? formatDate(edu.startDate) : 'Start date not specified'} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                              </Typography>
                            </Box>
                          )}

                          {edu.grade && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <BadgeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                Grade/Percentage: {edu.grade}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">No education information available.</Alert>
            )}
          </Paper>
        </TabPanel>

        {/* Previous Work Tab */}
        <TabPanel value={activeTab} index={4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: 'grey.50',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Previous Employment History
            </Typography>

            {userProfile.previousEmployment && userProfile.previousEmployment.length > 0 &&
              userProfile.previousEmployment[0].company ? (
              <Grid container spacing={2}>
                {userProfile.previousEmployment.map((job, index) => (
                  <Grid item xs={12} key={index}>
                    <Card variant="outlined">
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
                          {job.designation || 'Position'} at {job.company || 'Company'}
                        </Typography>

                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {(job.startDate || job.endDate) && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {job.startDate ? formatDate(job.startDate) : 'Start date not specified'} - {job.endDate ? formatDate(job.endDate) : 'Present'}
                              </Typography>
                            </Box>
                          )}

                          {job.reasonForLeaving && (
                            <Box>
                              <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                                Reason for Leaving:
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                                {job.reasonForLeaving}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">No previous employment information available.</Alert>
            )}
          </Paper>
        </TabPanel>

        {/* Salary & Bank Tab */}
        <TabPanel value={activeTab} index={5}>
          <Grid container spacing={2}>
            {/* Salary Information */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  bgcolor: 'grey.50',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Salary Information
                </Typography>

                {userProfile.salaryInfo ? (
                  <>
                    <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>
                      Basic Salary
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      ₹ {userProfile.salaryInfo.basicSalary?.toLocaleString() || '0'}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" fontWeight="medium">
                      Allowances
                    </Typography>
                    <List dense sx={{ py: 0 }}>
                      {Object.entries(userProfile.salaryInfo.allowances || {}).map(([key, value]) => (
                        value > 0 && (
                          <ListItem key={key} disableGutters sx={{ py: 1 }}>
                            <ListItemText
                              primary={key === 'DA' ? 'Dearness Allowance' :
                                key === 'HRA' ? 'House Rent Allowance' :
                                  key.charAt(0).toUpperCase() + key.slice(1)}
                              secondary={`₹ ${value.toLocaleString()}`}
                            />
                          </ListItem>
                        )
                      ))}
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" fontWeight="medium">
                      Deductions
                    </Typography>
                    <List dense sx={{ py: 0 }}>
                      {Object.entries(userProfile.salaryInfo.deductions || {}).map(([key, value]) => (
                        value > 0 && (
                          <ListItem key={key} disableGutters sx={{ py: 1 }}>
                            <ListItemText
                              primary={key === 'PF' ? 'Provident Fund' :
                                key === 'ESI' ? 'Employee State Insurance' :
                                  key === 'PT' ? 'Professional Tax' :
                                    key === 'TDS' ? 'Tax Deducted at Source' :
                                      key === 'MLWF' ? 'Maharashtra Labor Welfare Fund' :
                                        key.charAt(0).toUpperCase() + key.slice(1)}
                              secondary={`₹ ${value.toLocaleString()}`}
                            />
                          </ListItem>
                        )
                      ))}
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" fontWeight="medium">
                      Statutory Information
                    </Typography>
                    <List dense sx={{ py: 0 }}>
                      {userProfile.salaryInfo.PFNumber && (
                        <ListItem disableGutters sx={{ py: 1 }}>
                          <ListItemText primary="PF Number" secondary={userProfile.salaryInfo.PFNumber} />
                        </ListItem>
                      )}
                      {userProfile.salaryInfo.ESINumber && (
                        <ListItem disableGutters sx={{ py: 1 }}>
                          <ListItemText primary="ESI Number" secondary={userProfile.salaryInfo.ESINumber} />
                        </ListItem>
                      )}
                      {userProfile.salaryInfo.PAN && (
                        <ListItem disableGutters sx={{ py: 1 }}>
                          <ListItemText primary="PAN" secondary={userProfile.salaryInfo.PAN} />
                        </ListItem>
                      )}
                      {userProfile.salaryInfo.aadhaarNo && (
                        <ListItem disableGutters sx={{ py: 1 }}>
                          <ListItemText primary="Aadhaar Number" secondary={userProfile.salaryInfo.aadhaarNo} />
                        </ListItem>
                      )}
                      {userProfile.salaryInfo.passportNo && (
                        <ListItem disableGutters sx={{ py: 1 }}>
                          <ListItemText primary="Passport Number" secondary={userProfile.salaryInfo.passportNo} />
                        </ListItem>
                      )}
                    </List>
                  </>
                ) : (
                  <Alert severity="info">No salary information available.</Alert>
                )}
              </Paper>
            </Grid>

            {/* Bank Details */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  bgcolor: 'grey.50',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Bank Details
                </Typography>

                {userProfile.salaryInfo?.bankDetails && (
                  userProfile.salaryInfo.bankDetails.bankName ||
                  userProfile.salaryInfo.bankDetails.accountNumber
                ) ? (
                  <Card variant="outlined">
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Stack spacing={2}>
                        {userProfile.salaryInfo.bankDetails.bankName && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                            <Typography variant="body1">{userProfile.salaryInfo.bankDetails.bankName}</Typography>
                          </Box>
                        )}

                        {userProfile.salaryInfo.bankDetails.accountNumber && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Account Number</Typography>
                            <Typography variant="body1">
                              {/* Show only last 4 digits for security */}
                              {'•••• •••• •••• ' + userProfile.salaryInfo.bankDetails.accountNumber.slice(-4)}
                            </Typography>
                          </Box>
                        )}

                        {userProfile.salaryInfo.bankDetails.accountType && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Account Type</Typography>
                            <Typography variant="body1">{userProfile.salaryInfo.bankDetails.accountType}</Typography>
                          </Box>
                        )}

                        {userProfile.salaryInfo.bankDetails.IFSCCode && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                            <Typography variant="body1">{userProfile.salaryInfo.bankDetails.IFSCCode}</Typography>
                          </Box>
                        )}

                        {userProfile.salaryInfo.bankDetails.branchName && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Branch</Typography>
                            <Typography variant="body1">{userProfile.salaryInfo.bankDetails.branchName}</Typography>
                          </Box>
                        )}

                        {userProfile.salaryInfo.bankDetails.nameAsPerBank && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Name as per Bank Records</Typography>
                            <Typography variant="body1">{userProfile.salaryInfo.bankDetails.nameAsPerBank}</Typography>
                          </Box>
                        )}

                        {userProfile.salaryInfo.bankDetails.paymentType && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                            <Typography variant="body1">{userProfile.salaryInfo.bankDetails.paymentType}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert severity="info">No bank details available.</Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Leave Balances Tab */}
        <TabPanel value={activeTab} index={6}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: 'grey.50',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Leave Balances
            </Typography>

            {leaveBalances && leaveBalances.length > 0 ? (
              <Box sx={{ overflowX: 'auto' }}>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Leave Type</TableCell>
                        <TableCell align="center">Available Balance</TableCell>
                        <TableCell align="center">Used</TableCell>
                        <TableCell align="center">Carry Forward</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaveBalances.map((leave, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row">
                            <Typography fontWeight="medium">{leave.leaveType}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={leave.balance}
                              color={leave.balance > 0 ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">{leave.used}</TableCell>
                          <TableCell align="center">{leave.carryForward}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Alert severity="info">No leave balances available.</Alert>
            )}
          </Paper>
        </TabPanel>

        {/* Action Buttons - Only show for admin users and not on mobile */}
        {isAdmin && isAdminDashboard && !isMobile && (
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