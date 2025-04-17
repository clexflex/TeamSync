import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, CircularProgress, 
  Divider, Chip, Button, IconButton, Paper, Avatar, 
  List, ListItem, ListItemText, ListItemAvatar, ListItemIcon,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Tooltip
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
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  PieChart as PieChartIcon,
  People as PeopleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  BarChart as BarChartIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import config from '../../config';

const ManagerSummary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [managerData, setManagerData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [pendingAttendance, setPendingAttendance] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState(null);
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
          fetchManagerData(),
          fetchAttendanceStatus(),
          fetchLeaveBalance(),
          fetchPendingLeaves(),
          fetchPendingAttendance(),
          fetchTeamMembers(),
          fetchTeamAttendance(),
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
  
  // Fetch manager data
  const fetchManagerData = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/manager/${user._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.success) {
        setManagerData(response.data.manager);
      }
    } catch (error) {
      console.error("Error fetching manager data:", error);
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
  
  // Fetch pending leave requests from team members
  const fetchPendingLeaves = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/leave`,
        {
          params: { status: 'Pending' },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.success) {
        // Filter leaves from team members
        const teamLeaves = response.data.leaves.filter(leave => {
          if (!leave.userId || !leave.userId._id) return false;
          
          // Check if user's manager is the current logged-in manager
          // This would need a more complex check in reality
          return true; // Simplified for now
        }).slice(0, 5);
        
        setPendingLeaves(teamLeaves);
      }
    } catch (error) {
      console.error("Error fetching pending leaves:", error);
    }
  };
  
  // Fetch pending attendance approvals
  const fetchPendingAttendance = async () => {
    try {
      const today = new Date();
      const date = today.toISOString().split('T')[0];
      
      const response = await axios.get(
        `${config.API_URL}/api/attendance/team`,
        {
          params: { date },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.success) {
        // Get pending attendance records
        const pendingRecords = response.data.attendance.filter(record => 
          record.approvalStatus === 'Pending'
        ).slice(0, 5);
        
        setPendingAttendance(pendingRecords);
      }
    } catch (error) {
      console.error("Error fetching pending attendance:", error);
    }
  };
  
  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      if (!managerData || !managerData.teams || managerData.teams.length === 0) {
        return;
      }
      
      const teamData = [];
      
      for (const team of managerData.teams) {
        const response = await axios.get(
          `${config.API_URL}/api/team/${team._id}/members`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        
        if (response.data.success) {
          teamData.push(...response.data.employees);
        }
      }
      
      setTeamMembers(teamData);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };
  
  // Fetch team attendance summary
  const fetchTeamAttendance = async () => {
    try {
      const today = new Date();
      const date = today.toISOString().split('T')[0];
      
      const response = await axios.get(
        `${config.API_URL}/api/attendance/team`,
        {
          params: { date },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.success) {
        // Analyze attendance data
        const total = response.data.attendance.length;
        const present = response.data.attendance.filter(record => 
          record.status === 'Present'
        ).length;
        const absent = response.data.attendance.filter(record => 
          record.status === 'Absent'
        ).length;
        const leave = response.data.attendance.filter(record => 
          record.status.includes('Leave')
        ).length;
        const pending = response.data.attendance.filter(record => 
          record.approvalStatus === 'Pending'
        ).length;
        
        setTeamAttendance({
          total,
          present,
          absent,
          leave,
          pending,
          presentPercentage: total > 0 ? (present / total) * 100 : 0,
          absentPercentage: total > 0 ? (absent / total) * 100 : 0,
          leavePercentage: total > 0 ? (leave / total) * 100 : 0,
          pendingPercentage: total > 0 ? (pending / total) * 100 : 0
        });
      }
    } catch (error) {
      console.error("Error fetching team attendance:", error);
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
        // Take the 5 nearest upcoming holidays
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
  
  // Handle leave approval
  const handleLeaveAction = async (leaveId, action) => {
    try {
      if (action === 'approve') {
        await axios.post(
          `${config.API_URL}/api/leave/${leaveId}/approve`,
          { comment: "Approved by manager" },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      } else {
        await axios.post(
          `${config.API_URL}/api/leave/${leaveId}/reject`,
          { comment: "Rejected by manager" },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      }
      
      // Refresh pending leaves
      fetchPendingLeaves();
    } catch (error) {
      console.error(`Error ${action}ing leave:`, error);
    }
  };
  
  // Handle attendance approval
  const handleAttendanceAction = async (attendanceId, action) => {
    try {
      await axios.put(
        `${config.API_URL}/api/attendance/approve`,
        { 
          attendanceId,
          approvalStatus: action === 'approve' ? 'Approved' : 'Rejected'
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      // Refresh pending attendance
      fetchPendingAttendance();
      fetchTeamAttendance();
    } catch (error) {
      console.error(`Error ${action}ing attendance:`, error);
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
        return <Chip size="small" color="warning" icon={<HourglassEmptyIcon />} label="Pending" />;
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
  
  // Generate team stats UI
  const getTeamStatsUI = () => {
    if (!teamAttendance) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      );
    }
    
    return (
      <Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Today's Team Attendance ({teamAttendance.total} members)
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              label={`Present: ${teamAttendance.present}`} 
              color="success"
              size="small"
              icon={<CheckCircleIcon />} 
            />
            <Chip 
              label={`Absent: ${teamAttendance.absent}`} 
              color="error"
              size="small"
              icon={<CancelOutlinedIcon />} 
            />
            <Chip 
              label={`On Leave: ${teamAttendance.leave}`} 
              color="primary"
              size="small"
              icon={<EventIcon />} 
            />
            <Chip 
              label={`Pending: ${teamAttendance.pending}`} 
              color="warning"
              size="small"
              icon={<HourglassEmptyIcon />} 
            />
          </Box>
        </Box>
        
        <Box>
          <Typography variant="caption" color="textSecondary">
            Present Rate
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={teamAttendance.presentPercentage} 
                color="success"
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="success.main">{`${Math.round(teamAttendance.presentPercentage)}%`}</Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Approval Pending
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={teamAttendance.pendingPercentage} 
                color="warning"
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="warning.main">{`${Math.round(teamAttendance.pendingPercentage)}%`}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
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
          background: 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'white',
              color: 'success.main',
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
              {profileData?.designation || 'Team Manager'} - {managerData?.department?.dep_name || 'Department'}
            </Typography>
            {managerData?.managerId && (
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Manager ID: {managerData.managerId}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Team Summary Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Team Management Summary
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {/* Team statistics */}
                <Grid item xs={12} md={6}>
                  {getTeamStatsUI()}
                </Grid>
                
                {/* Team action buttons */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PeopleIcon />}
                      onClick={() => navigate('/manager-dashboard/team')}
                      fullWidth
                    >
                      Manage Teams
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<AccessTimeIcon />}
                      onClick={() => navigate('/manager-dashboard/attendance-approval')}
                      fullWidth
                    >
                      Approve Attendance
                    </Button>

                  </Box>
                </Grid>
              </Grid>
              
              {/* Team member list */}
              {teamMembers.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Recent Team Members
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'background.default' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Designation</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teamMembers.slice(0, 5).map((member) => (
                          <TableRow key={member._id}>
                            <TableCell>
                              {member.userId?.name || 'Unknown'}
                            </TableCell>
                            <TableCell>{member.designation || 'N/A'}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/manager-dashboard/user-profile/${member.userId?._id}`)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Attendance Status Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Your Attendance Status
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {getAttendanceStatusUI()}
              
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/manager-dashboard/attendance-form')}
                >
                  View Attendance History
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Pending Approval Cards */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HourglassEmptyIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Pending Approvals
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                
                
                {/* Pending Attendance Approvals */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Pending Attendance Approvals
                  </Typography>
                  
                  {pendingAttendance.length > 0 ? (
                    <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'background.default' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Employee</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pendingAttendance.map((record) => (
                            <TableRow key={record._id}>
                              <TableCell>{record.userId?.name || 'Unknown'}</TableCell>
                              <TableCell>{formatDate(record.date)}</TableCell>
                              <TableCell>
                                <Tooltip title={`Clock in: ${new Date(record.clockIn).toLocaleTimeString()}${
                                  record.clockOut ? `, Clock out: ${new Date(record.clockOut).toLocaleTimeString()}` : ''
                                }`}>
                                  <Chip 
                                    size="small"
                                    label={record.status}
                                    sx={{ cursor: 'help' }}
                                  />
                                </Tooltip>
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                  <IconButton 
                                    size="small" 
                                    color="success"
                                    onClick={() => handleAttendanceAction(record._id, 'approve')}
                                  >
                                    <ThumbUpIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleAttendanceAction(record._id, 'reject')}
                                  >
                                    <ThumbDownIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No pending attendance records to approve
                    </Typography>
                  )}
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/manager-dashboard/attendance-approval')}
                >
                  View All Pending Approvals
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
                  Your Leave Balances
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {leaveBalance.length > 0 ? (
                <Grid container spacing={2}>
                  {leaveBalance.map((leave, index) => (
                    <Grid item xs={6} sm={3} key={index}>
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
                  onClick={() => navigate('/manager-dashboard/add-leave')}
                  fullWidth
                >
                  Apply for Leave
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
                <EventIcon color="primary" sx={{ mr: 1 }} />
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
              
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/manager-dashboard/salary/history')}
                >
                  View Salary History
                </Button>
              </Box>
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
                  onClick={() => navigate('/manager-dashboard/notifications')}
                >
                  View All Notifications
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
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/manager-dashboard/team')}
                    sx={{ p: 1.5 }}
                  >
                    Manage Teams
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AccessTimeIcon />}
                    onClick={() => navigate('/manager-dashboard/attendance-approval')}
                    sx={{ p: 1.5 }}
                  >
                    Approve Attendance
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EventIcon />}
                    onClick={() => navigate('/manager-dashboard/add-leave')}
                    sx={{ p: 1.5 }}
                  >
                    Apply Leave
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ViewListIcon />}
                    onClick={() => navigate('/manager-dashboard/tickets')}
                    sx={{ p: 1.5 }}
                  >
                    View Tickets
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

export default ManagerSummary;