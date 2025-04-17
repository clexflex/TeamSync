import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Divider, 
  Card, 
  CardContent, 
  CardHeader, 
  Button, 
  Tabs, 
  Tab, 
  Alert,
  Menu,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress
} from '@mui/material';

import { 
  People as PeopleIcon, 
  Business as BusinessIcon,
  MonetizationOn as MoneyIcon, 
  Description as FileIcon,
  CheckCircle as CheckIcon, 
  HourglassEmpty as PendingIcon,
  Cancel as RejectIcon, 
  AccessTime as ClockIcon,
  EventNote as CalendarIcon,
  Group as TeamIcon,
  Celebration as HolidayIcon,
  MoreVert as MoreIcon,
  InsertChartOutlined as ChartIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  FilterList as FilterIcon,
  Cancel
} from '@mui/icons-material';

import axios from 'axios';
import config from "../../config";

// Summary Card component used for dashboard metrics
const SummaryCard = ({ icon, text, number, subtext, color, trend }) => (
  <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Box sx={{ 
        p: 1.5, 
        borderRadius: 2, 
        backgroundColor: `${color}.light`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {React.cloneElement(icon, { sx: { color: `${color}.main`, fontSize: 28 } })}
      </Box>
      {trend && (
        <Chip 
          icon={trend > 0 ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />} 
          label={`${Math.abs(trend)}%`}
          size="small"
          color={trend > 0 ? "success" : "error"}
          sx={{ height: 24 }}
        />
      )}
    </Box>
    <Typography color="text.secondary" variant="body2" fontWeight="medium" gutterBottom>
      {text}
    </Typography>
    <Typography variant="h4" fontWeight="bold" gutterBottom>
      {number}
    </Typography>
    {subtext && (
      <Typography variant="body2" color="text.secondary">
        {subtext}
      </Typography>
    )}
  </Paper>
);

// StatusChip component for displaying status with appropriate colors
const StatusChip = ({ status }) => {
  const getColorByStatus = () => {
    switch(status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      case 'Present': return 'success';
      case 'Absent': return 'error';
      case 'Paid Leave': return 'info';
      case 'Unpaid Leave': return 'default';
      case 'Draft': return 'default';
      case 'Paid': return 'success';
      default: return 'default';
    }
  };
  
  return (
    <Chip 
      label={status} 
      size="small" 
      color={getColorByStatus()} 
      sx={{ fontWeight: 'medium' }}
    />
  );
};

const AdminSummary = () => {
  // State for various dashboard data
  const [summary, setSummary] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [salaryStats, setSalaryStats] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Date filters
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30); // Default to last 30 days
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  });
  
  // Filter menu state
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterMenuOpen = Boolean(filterAnchorEl);
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate percentage difference (for trends)
  const calculateTrend = (current, previous) => {
    if (!previous) return null;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Fetch dashboard summary data
  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/dashboard/summary`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setError('Failed to load dashboard summary data');
    }
  };

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's attendance summary
      const todayResponse = await axios.get(`${config.API_URL}/api/attendance/reports`, {
        params: { startDate: today, endDate: today },
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Fetch attendance report for selected date range
      const rangeResponse = await axios.get(`${config.API_URL}/api/attendance/reports`, {
        params: dateRange,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setAttendanceData({
        today: todayResponse.data.data,
        range: rangeResponse.data.data
      });
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to load attendance data');
    }
  };

  // Fetch salary statistics
  const fetchSalaryStats = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/salary/stats`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSalaryStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching salary stats:', error);
      setError('Failed to load salary statistics');
    }
  };

  // Fetch recent leave applications
  const fetchRecentLeaves = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/leave`, {
        params: { limit: 5, status: 'Pending' },
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRecentLeaves(response.data.leaves || []);
    } catch (error) {
      console.error('Error fetching recent leaves:', error);
      setError('Failed to load recent leave applications');
    }
  };

  // Fetch pending tickets
  const fetchPendingTickets = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/tickets`, {
        params: { status: 'Open', limit: 5 },
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPendingTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Error fetching pending tickets:', error);
      setError('Failed to load pending tickets');
    }
  };

  // Fetch upcoming holidays
  const fetchUpcomingHolidays = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/holidays`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Filter to get only upcoming holidays
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcoming = response.data.holidays
        .filter(holiday => new Date(holiday.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
        
      setUpcomingHolidays(upcoming);
    } catch (error) {
      console.error('Error fetching upcoming holidays:', error);
      setError('Failed to load upcoming holidays');
    }
  };

  // Fetch department statistics
  const fetchDepartmentStats = async () => {
    try {
      // Get all departments
      const deptResponse = await axios.get(`${config.API_URL}/api/department`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Prepare empty stats for each department
      const deptStats = deptResponse.data.departments.map(dept => ({
        ...dept,
        employeeCount: 0,
        managerCount: 0,
        teamCount: 0,
        averageSalary: 0
      }));
      
      // Get employee data by department
      const promises = deptStats.map(async (dept) => {
        try {
          const empResponse = await axios.get(`${config.API_URL}/api/employee/department/${dept._id}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const employees = empResponse.data.employees || [];
          let totalSalary = 0;
          
          employees.forEach(emp => {
            totalSalary += emp.salary || 0;
          });
          
          return {
            ...dept,
            employeeCount: employees.length,
            averageSalary: employees.length ? Math.round(totalSalary / employees.length) : 0,
          };
        } catch (error) {
          console.error(`Error fetching employees for department ${dept._id}:`, error);
          return dept;
        }
      });
      
      const updatedDeptStats = await Promise.all(promises);
      setDepartmentStats(updatedDeptStats.sort((a, b) => b.employeeCount - a.employeeCount));
    } catch (error) {
      console.error('Error fetching department statistics:', error);
      setError('Failed to load department statistics');
    }
  };

  // Load all dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchSummary(),
          fetchAttendanceData(),
          fetchSalaryStats(),
          fetchRecentLeaves(),
          fetchPendingTickets(),
          fetchUpcomingHolidays(),
          fetchDepartmentStats()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load one or more dashboard components');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      loadDashboardData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [dateRange]); // Reload when date range changes

  // Handle date range filter changes
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setFilterAnchorEl(null);
  };

  // Handle opening filter menu
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Stats totals for today's attendance
  const todayStats = useMemo(() => {
    if (!attendanceData?.today) return null;
    
    const stats = {
      total: 0,
      present: 0,
      absent: 0,
      leave: 0,
      late: 0
    };
    
    // Count employees by status
    Object.values(attendanceData.today.usersByRole).forEach(users => {
      users.forEach(user => {
        stats.total++;
        
        if (user.stats.totalPresent > 0) stats.present++;
        else if (user.stats.totalAbsent > 0) stats.absent++;
        
        if (user.stats.totalLeave > 0) stats.leave++;
        
        // Assuming late if checked in but with incomplete attendance
        if (user.stats.totalIncompleteAttendance > 0) stats.late++;
      });
    });
    
    return stats;
  }, [attendanceData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Dashboard Overview
        </Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<FilterIcon />}
            onClick={handleFilterClick}
            size="small"
          >
            Filter: {dateRange.startDate} to {dateRange.endDate}
          </Button>
          <Menu
            anchorEl={filterAnchorEl}
            open={filterMenuOpen}
            onClose={() => setFilterAnchorEl(null)}
          >
            <MenuItem onClick={() => handleDateRangeChange({
              startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0]
            })}>
              Last 7 days
            </MenuItem>
            <MenuItem onClick={() => handleDateRangeChange({
              startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0]
            })}>
              Last 30 days
            </MenuItem>
            <MenuItem onClick={() => handleDateRangeChange({
              startDate: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0]
            })}>
              Last 3 months
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* Main Dashboard Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <SummaryCard
            icon={<PeopleIcon />}
            text="Total Employees"
            number={summary?.totalEmployees || 0}
            subtext="Active staff members"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard
            icon={<TeamIcon />}
            text="Teams"
            number={attendanceData?.range?.usersByRole?.manager?.length || 0}
            subtext="Active teams"
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard
            icon={<BusinessIcon />}
            text="Departments"
            number={summary?.totalDepartments || 0}
            subtext="Company departments"
            color="warning"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard
            icon={<MoneyIcon />}
            text="Monthly Salary"
            number={`₹${salaryStats?.totalDisbursement?.toLocaleString() || summary?.totalSalary?.toLocaleString() || 0}`}
            subtext={`For ${salaryStats?.currentMonth || 'current month'}`}
            color="success"
          />
        </Grid>
      </Grid>
      
      {/* Today's Stats */}
      <Typography variant="h5" fontWeight="bold" color="text.primary" mb={2}>
        Today's Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <SummaryCard
            icon={<ClockIcon />}
            text="Present Today"
            number={todayStats?.present || 0}
            subtext={`${todayStats?.present && todayStats?.total ? Math.round((todayStats.present / todayStats.total) * 100) : 0}% of workforce`}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard
            icon={<Cancel />}
            text="Absent Today"
            number={todayStats?.absent || 0}
            subtext={`${todayStats?.absent && todayStats?.total ? Math.round((todayStats.absent / todayStats.total) * 100) : 0}% of workforce`}
            color="error"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard
            icon={<CalendarIcon />}
            text="On Leave Today"
            number={todayStats?.leave || 0}
            subtext={`${todayStats?.leave && todayStats?.total ? Math.round((todayStats.leave / todayStats.total) * 100) : 0}% of workforce`}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard
            icon={<PendingIcon />}
            text="Pending Approvals"
            number={summary?.leaveSummary?.pending || 0}
            subtext="Waiting for response"
            color="warning"
          />
        </Grid>
      </Grid>
      
      {/* Tabs for different sections */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Activity & Approvals" />
          <Tab label="Department Analytics" />
          <Tab label="Attendance & Leave" />
        </Tabs>
      </Box>
      
      {/* Tab 1: Activity & Approvals */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Pending Leave Requests */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader 
                title="Pending Leave Requests" 
                action={
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => window.location.href = '/admin-dashboard/leaves'}
                  >
                    View All
                  </Button>
                }
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                {recentLeaves.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee</TableCell>
                          <TableCell>Leave Type</TableCell>
                          <TableCell>Dates</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentLeaves.map((leave) => (
                          <TableRow key={leave._id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  sx={{ width: 30, height: 30, mr: 1, bgcolor: 'primary.main' }}
                                >
                                  {leave.userId?.name?.charAt(0) || 'U'}
                                </Avatar>
                                {leave.userId?.name || 'Unknown'}
                              </Box>
                            </TableCell>
                            <TableCell>{leave.leaveType}</TableCell>
                            <TableCell>
                              {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                            </TableCell>
                            <TableCell>
                              <StatusChip status={leave.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No pending leave requests
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent Tickets */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader 
                title="Open Support Tickets" 
                action={
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => window.location.href = '/admin-dashboard/tickets'}
                  >
                    View All
                  </Button>
                }
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                {pendingTickets.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Ticket Title</TableCell>
                          <TableCell>Submitted By</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pendingTickets.map((ticket) => (
                          <TableRow key={ticket._id} hover>
                            <TableCell>{ticket.title}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  sx={{ width: 30, height: 30, mr: 1, bgcolor: 'primary.main' }}
                                >
                                  {ticket.userId?.name?.charAt(0) || 'U'}
                                </Avatar>
                                {ticket.userId?.name || 'Unknown'}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={ticket.priority} 
                                size="small" 
                                color={
                                  ticket.priority === 'High' || ticket.priority === 'Critical' ? 'error' :
                                  ticket.priority === 'Medium' ? 'warning' : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <StatusChip status={ticket.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No open tickets
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Upcoming Holidays */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader 
                title="Upcoming Holidays" 
                action={
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => window.location.href = '/admin-dashboard/holidays'}
                  >
                    View All
                  </Button>
                }
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                {upcomingHolidays.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Holiday</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Day</TableCell>
                          <TableCell>Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {upcomingHolidays.map((holiday) => (
                          <TableRow key={holiday._id} hover>
                            <TableCell>{holiday.name}</TableCell>
                            <TableCell>{formatDate(holiday.date)}</TableCell>
                            <TableCell>
                              {new Date(holiday.date).toLocaleDateString(undefined, { weekday: 'long' })}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={holiday.isCompanyWide ? "Company-wide" : "Department"} 
                                size="small" 
                                color={holiday.isCompanyWide ? "primary" : "default"}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No upcoming holidays
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Salary Status */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader 
                title="Salary Processing Status" 
                subheader={salaryStats?.currentMonth || ''}
                action={
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => window.location.href = '/admin-dashboard/salary-management'}
                  >
                    Manage
                  </Button>
                }
              />
              <Divider />
              <CardContent>
                {salaryStats ? (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Draft</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {salaryStats.statusCounts?.Draft || 0}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={((salaryStats.statusCounts?.Draft || 0) / 
                          (salaryStats.employeeCount + salaryStats.managerCount)) * 100} 
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Approved</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {salaryStats.statusCounts?.Approved || 0}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={((salaryStats.statusCounts?.Approved || 0) / 
                          (salaryStats.employeeCount + salaryStats.managerCount)) * 100} 
                        color="success"
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Paid</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {salaryStats.statusCounts?.Paid || 0}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={((salaryStats.statusCounts?.Paid || 0) / 
                          (salaryStats.employeeCount + salaryStats.managerCount)) * 100} 
                        color="info"
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                    </Box>
                    
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Total Staff: {(salaryStats.employeeCount || 0) + (salaryStats.managerCount || 0)}
                      </Typography>
                      <Typography variant="body2">
                        Employees: {salaryStats.employeeCount || 0}
                      </Typography>
                      <Typography variant="body2">
                        Managers: {salaryStats.managerCount || 0}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No salary data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Tab 2: Department Analytics */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardHeader 
                title="Department Analytics" 
                action={
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => window.location.href = '/admin-dashboard/departments'}
                  >
                    Manage Departments
                  </Button>
                }
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Department</TableCell>
                        <TableCell>Employees</TableCell>
                        <TableCell align="right">Avg. Salary</TableCell>
                        <TableCell>Distribution</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {departmentStats.map((dept) => (
                        <TableRow key={dept._id} hover>
                          <TableCell>
                            <Typography variant="body1" fontWeight="medium">
                              {dept.dep_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {dept.description || 'No description'}
                            </Typography>
                          </TableCell>
                          <TableCell>{dept.employeeCount}</TableCell>
                          <TableCell align="right">₹{dept.averageSalary.toLocaleString()}</TableCell>
                          <TableCell width="30%">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={(dept.employeeCount / summary.totalEmployees) * 100}
                                  sx={{ height: 8, borderRadius: 5 }}
                                  color="primary"
                                />
                              </Box>
                              <Box minWidth={35}>
                                <Typography variant="body2" color="text.secondary">
                                  {Math.round((dept.employeeCount / summary.totalEmployees) * 100)}%
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Tab 3: Attendance & Leave */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Leave Summary */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader title="Leave Summary" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        bgcolor: 'success.light', 
                        borderRadius: 2 
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" color="success.dark">
                        {summary?.leaveSummary?.approved || 0}
                      </Typography>
                      <Typography variant="body2" color="success.dark">
                        Approved
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        bgcolor: 'warning.light', 
                        borderRadius: 2 
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" color="warning.dark">
                        {summary?.leaveSummary?.pending || 0}
                      </Typography>
                      <Typography variant="body2" color="warning.dark">
                        Pending
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        bgcolor: 'error.light', 
                        borderRadius: 2 
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" color="error.dark">
                        {summary?.leaveSummary?.rejected || 0}
                      </Typography>
                      <Typography variant="body2" color="error.dark">
                        Rejected
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        bgcolor: 'info.light', 
                        borderRadius: 2 
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" color="info.dark">
                        {summary?.leaveSummary?.appliedFor || 0}
                      </Typography>
                      <Typography variant="body2" color="info.dark">
                        Total Applied
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => window.location.href = '/admin-dashboard/leaves'}
                  >
                    Manage Leave Requests
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Attendance Summary */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader title="Attendance Insights" />
              <Divider />
              <CardContent>
                {attendanceData?.range ? (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom>
                        Attendance Rate
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={todayStats?.present && todayStats?.total ? 
                              (todayStats.present / todayStats.total) * 100 : 0}
                            sx={{ height: 10, borderRadius: 5 }}
                            color="success"
                          />
                        </Box>
                        <Box minWidth={35}>
                          <Typography variant="body2" color="text.secondary">
                            {todayStats?.present && todayStats?.total ? 
                              Math.round((todayStats.present / todayStats.total) * 100) : 0}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom>
                        Absence Rate
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={todayStats?.absent && todayStats?.total ? 
                              (todayStats.absent / todayStats.total) * 100 : 0}
                            sx={{ height: 10, borderRadius: 5 }}
                            color="error"
                          />
                        </Box>
                        <Box minWidth={35}>
                          <Typography variant="body2" color="text.secondary">
                            {todayStats?.absent && todayStats?.total ? 
                              Math.round((todayStats.absent / todayStats.total) * 100) : 0}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom>
                        On Leave
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={todayStats?.leave && todayStats?.total ? 
                              (todayStats.leave / todayStats.total) * 100 : 0}
                            sx={{ height: 10, borderRadius: 5 }}
                            color="info"
                          />
                        </Box>
                        <Box minWidth={35}>
                          <Typography variant="body2" color="text.secondary">
                            {todayStats?.leave && todayStats?.total ? 
                              Math.round((todayStats.leave / todayStats.total) * 100) : 0}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 3 }}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        onClick={() => window.location.href = '/admin-dashboard/attendance/reports'}
                      >
                        View Detailed Reports
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No attendance data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminSummary;