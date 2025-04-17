import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, CircularProgress, 
  Divider, Chip, Button, IconButton, Paper, Avatar, 
  List, ListItem, ListItemText, ListItemAvatar
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  CalendarToday as CalendarTodayIcon,
  NotificationsActive as NotificationsActiveIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelOutlinedIcon,
  WorkOutline as WorkOutlineIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import config from '../../config';

const EmployeeSummary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentSalary, setRecentSalary] = useState(null);
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user || !user._id) {
          setError("User information not available");
          setLoading(false);
          return;
        }
        
        // Fetch all required data in parallel
        await Promise.all([
          fetchProfileData(),
          fetchAttendanceStatus(),
          fetchLeaveBalance(),
          fetchRecentLeaves(),
          fetchUpcomingHolidays(),
          fetchNotifications(),
          fetchRecentSalary()
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [user]);
  
  // Fetch user profile
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/user-profile/${user._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.success) {
        setProfileData(response.data.userProfile);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };
  
  // Fetch current attendance status
  const fetchAttendanceStatus = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/attendance/current-status`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.success) {
        setAttendanceStatus(response.data);
      }
    } catch (error) {
      console.error("Error fetching attendance status:", error);
    }
  };
  
  // Fetch leave balances
  const fetchLeaveBalance = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/leave/balance/${user._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.success) {
        setLeaveBalance(response.data.leaveBalances);
      }
    } catch (error) {
      console.error("Error fetching leave balances:", error);
    }
  };
  
  // Fetch recent leaves
  const fetchRecentLeaves = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/leave/${user._id}/employee`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.success) {
        // Sort by applied date and take the 5 most recent
        const sortedLeaves = response.data.leaves
          .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
          .slice(0, 5);
        
        setRecentLeaves(sortedLeaves);
      }
    } catch (error) {
      console.error("Error fetching recent leaves:", error);
    }
  };
  
  // Fetch upcoming holidays
const fetchUpcomingHolidays = async () => {
  try {
    const response = await axios.get(
      `${config.API_URL}/api/holidays/public`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    );
    
    if (response.data.success) {
      // Filter and take the 5 nearest upcoming holidays
      const upcoming = response.data.holidays.slice(0, 5);      
      setUpcomingHolidays(upcoming);
    }
  } catch (error) {
    console.error("Error fetching holidays:", error);
  }
};
  
  // Fetch recent notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/notifications/my-notifications?limit=5`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  
  // Fetch most recent salary record
  const fetchRecentSalary = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/salary/history/${user._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.success && response.data.salaries.length > 0) {
        // Get the most recent salary
        setRecentSalary(response.data.salaries[0]);
      }
    } catch (error) {
      console.error("Error fetching salary history:", error);
    }
  };
  
  // Handle clock in/out action
  const handleClockAction = async (action) => {
    try {
      if (action === 'in') {
        await axios.post(
          `${config.API_URL}/api/attendance/clock-in`,
          { workLocation: "Onsite" },  // Default to onsite - can be enhanced
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      } else {
        await axios.post(
          `${config.API_URL}/api/attendance/clock-out`,
          { tasksDone: "Tasks completed for the day" },  // Default message - can be enhanced
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      }
      
      // Refresh attendance status
      fetchAttendanceStatus();
    } catch (error) {
      console.error(`Error clocking ${action}:`, error);
      // Handle error or show notification
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Get status chip based on leave status
  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
        return <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Approved" />;
      case 'Rejected':
        return <Chip size="small" color="error" icon={<CancelOutlinedIcon />} label="Rejected" />;
      case 'Pending':
        return <Chip size="small" color="warning" icon={<AccessTimeIcon />} label="Pending" />;
      default:
        return <Chip size="small" color="default" label={status} />;
    }
  };
  
  // Get attendance status message and action button
  const getAttendanceStatusUI = () => {
    if (!attendanceStatus) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={20} />
        </Box>
      );
    }
    
    if (attendanceStatus.isHoliday) {
      return (
        <Box>
          <Typography variant="h6" color="primary" gutterBottom>
            Today is a Holiday
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {attendanceStatus.holidayDetails?.name || 'Holiday'}
          </Typography>
        </Box>
      );
    }
    
    if (attendanceStatus.status === 'not-started') {
      return (
        <Box>
          <Typography variant="body1" gutterBottom>
            You haven't clocked in today
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AccessTimeIcon />}
            onClick={() => handleClockAction('in')}
          >
            Clock In
          </Button>
        </Box>
      );
    }
    
    if (attendanceStatus.status === 'clocked-in') {
      return (
        <Box>
          <Typography variant="body1" color="primary" gutterBottom>
            You are currently clocked in
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Clocked in at: {formatDate(attendanceStatus.attendance?.clockIn)} {new Date(attendanceStatus.attendance?.clockIn).toLocaleTimeString()}
          </Typography>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<AccessTimeIcon />}
            onClick={() => handleClockAction('out')}
          >
            Clock Out
          </Button>
        </Box>
      );
    }
    
    if (attendanceStatus.status === 'completed') {
      return (
        <Box>
          <Typography variant="body1" color="success.main" gutterBottom>
            Attendance completed for today
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Clocked in: {new Date(attendanceStatus.attendance?.clockIn).toLocaleTimeString()}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Clocked out: {new Date(attendanceStatus.attendance?.clockOut).toLocaleTimeString()}
          </Typography>
          {attendanceStatus.attendance?.hoursWorked && (
            <Typography variant="body2" color="textSecondary">
              Hours worked: {attendanceStatus.attendance.hoursWorked.toFixed(2)}
            </Typography>
          )}
        </Box>
      );
    }
    
    return (
      <Typography variant="body1">
        Status not available
      </Typography>
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ pb: 4 }}>
      {/* Welcome Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'white',
              color: 'primary.main',
              mr: 2,
              fontSize: 40
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Welcome, {user?.name}
            </Typography>
            <Typography variant="subtitle1">
              {profileData?.designation || 'Employee'} - {profileData?.department?.dep_name || 'Department'}
            </Typography>
            {profileData?.employeeId && (
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Employee ID: {profileData.employeeId}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Attendance Status Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Attendance Status
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {getAttendanceStatusUI()}
              
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/employee-dashboard/attendance-form')}
                >
                  View Attendance History
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Leave Balance Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Leave Balances
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {leaveBalance.length > 0 ? (
                <Grid container spacing={2}>
                  {leaveBalance.map((leave, index) => (
                    <Grid item xs={6} key={index}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 1.5, 
                          textAlign: 'center',
                          bgcolor: 'background.default',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="subtitle2" color="primary">
                          {leave.leaveType}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                          {leave.balance}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Used: {leave.used}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No leave balance information available
                </Typography>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/employee-dashboard/add-leave')}
                  fullWidth
                >
                  Apply for Leave
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Leaves Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Recent Leave Requests
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {recentLeaves.length > 0 ? (
                <List sx={{ width: '100%', p: 0 }}>
                  {recentLeaves.map((leave) => (
                    <ListItem 
                      key={leave._id}
                      sx={{ 
                        py: 1, 
                        px: 0,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemText
                        primary={leave.leaveType}
                        secondary={
                          <Box component="span">
                            <Typography variant="body2" component="span" display="block">
                              {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {getStatusChip(leave.status)}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No recent leave requests
                </Typography>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/employee-dashboard/leaves/${user._id}`)}
                >
                  View All Leave History
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Upcoming Holidays Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Upcoming Holidays
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {upcomingHolidays.length > 0 ? (
                <List sx={{ width: '100%', p: 0 }}>
                  {upcomingHolidays.map((holiday) => (
                    <ListItem 
                      key={holiday._id}
                      sx={{ 
                        py: 1, 
                        px: 0,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <EventIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={holiday.name}
                        secondary={formatDate(holiday.date)}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No upcoming holidays
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Notifications Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsActiveIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Recent Notifications
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {notifications.length > 0 ? (
                <List sx={{ width: '100%', p: 0 }}>
                  {notifications.map((notification) => (
                    <ListItem 
                      key={notification._id}
                      sx={{ 
                        py: 1, 
                        px: 0,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: notification.isRead ? 'transparent' : 'action.hover'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" noWrap>
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <Typography 
                            variant="body2" 
                            color="textSecondary" 
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {notification.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No recent notifications
                </Typography>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/employee-dashboard/notifications')}
                >
                  View All Notifications
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Latest Salary Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Salary Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {recentSalary ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Latest Salary Period
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {recentSalary.payPeriod}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 1.5, 
                          textAlign: 'center',
                          bgcolor: 'background.default',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="subtitle2" color="textSecondary">
                          Gross
                        </Typography>
                        <Typography variant="h6">
                          ₹{recentSalary.grossSalary.toLocaleString()}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 1.5, 
                          textAlign: 'center',
                          bgcolor: 'background.default',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="subtitle2" color="textSecondary">
                          Deductions
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          ₹{recentSalary.totalDeductions.toLocaleString()}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 1.5, 
                          textAlign: 'center',
                          bgcolor: 'success.light',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ color: 'white' }}>
                          Net
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                          ₹{recentSalary.netSalary.toLocaleString()}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Chip 
                      size="small" 
                      label={recentSalary.status} 
                      color={recentSalary.status === 'Paid' ? 'success' : 'primary'} 
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={!recentSalary.payslipGenerated}
                      onClick={() => window.open(`${config.API_URL}/api/salary/payslip/${recentSalary._id}`, '_blank')}
                    >
                      View Payslip
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No salary information available yet
                </Typography>
              )}
              <Divider sx={{ mt: 2 }} />
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/employee-dashboard/salary/history')}
                >
                  View Salary History
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Quick Access Card */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AccessTimeIcon />}
                    onClick={() => navigate('/employee-dashboard/realtime-attendance')}
                    sx={{ p: 1.5 }}
                  >
                    Attendance
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EventIcon />}
                    onClick={() => navigate('/employee-dashboard/add-leave')}
                    sx={{ p: 1.5 }}
                  >
                    Apply Leave
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PersonIcon />}
                    onClick={() => navigate(`/employee-dashboard/user-profile/${user._id}`)}
                    sx={{ p: 1.5 }}
                  >
                    My Profile
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    onClick={() => navigate('/employee-dashboard/add-ticket')}
                    sx={{ p: 1.5 }}
                  >
                    Raise Ticket
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeSummary;