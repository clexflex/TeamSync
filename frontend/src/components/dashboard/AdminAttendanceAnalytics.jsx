import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  FormControl,
  InputLabel,
  TextField,
  Tooltip,
  IconButton,
  Chip,
  Tabs,
  Tab,
  InputAdornment,
  Divider,
  Alert,
  Autocomplete
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  GetApp as DownloadIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Group as TeamIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectedIcon,
  MoreHoriz as PendingIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowDropDown as ArrowDownIcon,
  Clear as ClearIcon,
  CheckCircle,
  Star,
  CheckCircleOutline,
  Cancel
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminAttendanceAnalytics = () => {
  // State for data
  const [reportData, setReportData] = useState({
    dateRange: [],
    usersByRole: {},
    holidays: [],
    periodInfo: {
      totalDays: 0,
      totalHolidays: 0,
      workingDays: 0
    }
  });
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedDepartments, setExpandedDepartments] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState([]);
  
  // State for filters
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const month = today.getDate() > 25 ? today.getMonth() + 1 : today.getMonth();
    const year = today.getFullYear();
    return `${year}-${String(month).padStart(2, '0')}`;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [attendanceThreshold, setAttendanceThreshold] = useState(80);
  
  // Derived state
  const departments = useMemo(() => {
    const depts = new Set();
    Object.values(reportData.usersByRole).forEach(users => {
      users.forEach(user => {
        if (user.department) depts.add(user.department);
      });
    });
    return Array.from(depts);
  }, [reportData.usersByRole]);
  
  const teams = useMemo(() => {
    const teamsSet = new Set();
    Object.values(reportData.usersByRole).forEach(users => {
      users.forEach(user => {
        if (user.team) teamsSet.add(user.team);
      });
    });
    return Array.from(teamsSet);
  }, [reportData.usersByRole]);
  
  // Attendance statistics
  const attendanceStats = useMemo(() => {
    let totalUsers = 0;
    let totalAttendance = 0;
    let lowAttendanceCount = 0;
    let highAttendanceCount = 0;
    let perfectAttendanceCount = 0;
    
    Object.values(reportData.usersByRole).forEach(users => {
      users.forEach(user => {
        totalUsers++;
        const attendancePercentage = parseFloat(user.stats.attendancePercentage);
        totalAttendance += attendancePercentage;
        
        if (attendancePercentage < attendanceThreshold) {
          lowAttendanceCount++;
        } else if (attendancePercentage === 100) {
          perfectAttendanceCount++;
        } else if (attendancePercentage > 90) {
          highAttendanceCount++;
        }
      });
    });
    
    return {
      averageAttendance: totalUsers ? (totalAttendance / totalUsers).toFixed(2) : 0,
      lowAttendanceCount,
      highAttendanceCount,
      perfectAttendanceCount,
      totalUsers
    };
  }, [reportData.usersByRole, attendanceThreshold]);
  
  // Filtered users based on search and filters
  const filteredUsers = useMemo(() => {
    let result = {};
    
    Object.entries(reportData.usersByRole).forEach(([role, users]) => {
      const filtered = users.filter(user => {
        // Search filter
        const nameMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Department filter
        const departmentMatch = departmentFilter === 'all' || user.department === departmentFilter;
        
        // Team filter
        const teamMatch = teamFilter === 'all' || user.team === teamFilter;
        
        // Status filter
        let statusMatch = true;
        if (statusFilter === 'low') {
          statusMatch = parseFloat(user.stats.attendancePercentage) < attendanceThreshold;
        } else if (statusFilter === 'perfect') {
          statusMatch = parseFloat(user.stats.attendancePercentage) === 100;
        } else if (statusFilter === 'high') {
          statusMatch = parseFloat(user.stats.attendancePercentage) > 90 && parseFloat(user.stats.attendancePercentage) < 100;
        }
        
        return nameMatch && departmentMatch && teamMatch && statusMatch;
      });
      
      if (filtered.length > 0) {
        result[role] = filtered;
      }
    });
    
    return result;
  }, [reportData.usersByRole, searchQuery, departmentFilter, teamFilter, statusFilter, attendanceThreshold]);
  
  // Group users by department for department view
  const usersByDepartment = useMemo(() => {
    const result = {};
    
    Object.values(reportData.usersByRole).forEach(users => {
      users.forEach(user => {
        const dept = user.department || 'Unassigned';
        if (!result[dept]) {
          result[dept] = {
            users: [],
            totalAttendance: 0,
            avgAttendance: 0,
            presentDays: 0,
            absentDays: 0,
            leavesDays: 0,
            count: 0
          };
        }
        
        result[dept].users.push(user);
        result[dept].totalAttendance += parseFloat(user.stats.attendancePercentage);
        result[dept].presentDays += user.stats.totalPresent;
        result[dept].absentDays += user.stats.totalAbsent;
        result[dept].leavesDays += (user.stats.totalPaidLeave || 0) + (user.stats.totalUnpaidLeave || 0);
        result[dept].count++;
      });
    });
    
    // Calculate averages
    Object.keys(result).forEach(dept => {
      if (result[dept].count > 0) {
        result[dept].avgAttendance = (result[dept].totalAttendance / result[dept].count).toFixed(2);
      }
    });
    
    return result;
  }, [reportData.usersByRole]);
  
  // Group users by team for team view
  const usersByTeam = useMemo(() => {
    const result = {};
    
    Object.values(reportData.usersByRole).forEach(users => {
      users.forEach(user => {
        const team = user.team || 'Unassigned';
        if (!result[team]) {
          result[team] = {
            users: [],
            totalAttendance: 0,
            avgAttendance: 0,
            presentDays: 0,
            absentDays: 0,
            leavesDays: 0,
            count: 0
          };
        }
        
        result[team].users.push(user);
        result[team].totalAttendance += parseFloat(user.stats.attendancePercentage);
        result[team].presentDays += user.stats.totalPresent;
        result[team].absentDays += user.stats.totalAbsent;
        result[team].leavesDays += (user.stats.totalPaidLeave || 0) + (user.stats.totalUnpaidLeave || 0);
        result[team].count++;
      });
    });
    
    // Calculate averages
    Object.keys(result).forEach(team => {
      if (result[team].count > 0) {
        result[team].avgAttendance = (result[team].totalAttendance / result[team].count).toFixed(2);
      }
    });
    
    return result;
  }, [reportData.usersByRole]);
  
  // Fetch report data
  useEffect(() => {
    fetchReportData();
  }, [selectedMonth]);
  
  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-').map(Number);
      
      const currentMonth = month - 1; // Convert to 0-based
      const prevMonthDate = new Date(year, currentMonth - 1, 1); // Previous month's 1st day
      const startYear = prevMonthDate.getFullYear();
      const startMonth = prevMonthDate.getMonth();
      const startDate = new Date(startYear, startMonth, 26);
      const endDate = new Date(year, currentMonth, 25);
      
      const formatDate = (date) => {
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
      };
      
      const response = await axios.get(`${config.API_URL}/api/attendance/reports`, {
        params: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate)
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        const processedData = {
          ...response.data.data,
          dateRange: response.data.data.dateRange.map(date => ({
            ...date,
            date: date.date,
            dayName: new Date(date.date).toLocaleDateString('en-US', { weekday: 'short' }),
          }))
        };
        setReportData(processedData);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load attendance report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Export to CSV
  const exportToCSV = () => {
    const roles = Object.keys(reportData.usersByRole);
    const headers = [
      'Name',
      'Role',
      'Team',
      'Department',
      'Total Present',
      'Total Absent',
      'Attendance %',
      'Avg Hours/Day',
      ...reportData.dateRange.map(date => date.date)
    ].join(',');
    
    const rows = roles.flatMap(role =>
      reportData.usersByRole[role].map(user => {
        const dailyAttendance = reportData.dateRange.map(date => {
          const attendance = user.attendance[date.date];
          return attendance ? attendance.status : 'Absent';
        });
        
        return [
          user.name,
          role,
          user.team,
          user.department,
          user.stats.totalPresent,
          user.stats.totalAbsent,
          user.stats.attendancePercentage,
          user.stats.avgHoursPerDay,
          ...dailyAttendance
        ].join(',');
      })
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Export to detailed Excel
  const exportToDetailedExcel = () => {
    alert('This would generate a more detailed Excel report with all metrics, trends, and individual records');
    // This would be implemented with a more comprehensive export library
  };
  
  // Toggle department expansion
  const toggleDepartment = (department) => {
    if (expandedDepartments.includes(department)) {
      setExpandedDepartments(expandedDepartments.filter(d => d !== department));
    } else {
      setExpandedDepartments([...expandedDepartments, department]);
    }
  };
  
  // Toggle team expansion
  const toggleTeam = (team) => {
    if (expandedTeams.includes(team)) {
      setExpandedTeams(expandedTeams.filter(t => t !== team));
    } else {
      setExpandedTeams([...expandedTeams, team]);
    }
  };
  
  // Component for attendance status display
  const AttendanceStatus = ({ data }) => {
    const getStatusColor = (status, isHoliday) => {
      if (isHoliday) return {
        bgcolor: '#F3E5F5',
        color: '#6A1B9A'
      };
      
      const statusColors = {
        Present: {
          bgcolor: '#E8F5E9',
          color: '#2E7D32'
        },
        Absent: {
          bgcolor: '#FFEBEE',
          color: '#C62828'
        },
        'Half-Day': {
          bgcolor: '#FFF3E0',
          color: '#EF6C00'
        },
        'Paid Leave': {
          bgcolor: '#E1F5FE',
          color: '#0288D1'
        },
        'Unpaid Leave': {
          bgcolor: '#F3E5F5',
          color: '#7B1FA2'
        },
        Pending: {
          bgcolor: '#F5F5F5',
          color: '#424242'
        }
      };
      
      return statusColors[status] || statusColors.Pending;
    };
    
    const colors = getStatusColor(data.status, data.isHoliday);
    
    return (
      <Box sx={{ ...colors, p: 1, borderRadius: 1, minWidth: 80, textAlign: 'center' }}>
        <Typography variant="caption" display="block" fontWeight="medium">
          {data.status}
        </Typography>
        {data.hoursWorked > 0 && (
          <Typography variant="caption" display="block">
            {data.hoursWorked.toFixed(1)}h
          </Typography>
        )}
      </Box>
    );
  };
  
  // Component for attendance percentage visualization
  const AttendancePercentage = ({ percentage }) => {
    let color = '#4CAF50'; // Green for good attendance
    if (percentage < attendanceThreshold) {
      color = '#F44336'; // Red for poor attendance
    } else if (percentage < 90) {
      color = '#FF9800'; // Orange for moderate attendance
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ 
          width: 100, 
          height: 10, 
          bgcolor: '#e0e0e0', 
          borderRadius: 5,
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            width: `${percentage}%`, 
            height: '100%', 
            bgcolor: color,
            borderRadius: 5
          }} />
        </Box>
        <Typography variant="body2" fontWeight="medium" sx={{ color }}>
          {percentage}%
        </Typography>
      </Box>
    );
  };
  
  // Render summary cards
  const renderSummaryCards = () => (
    <Grid container spacing={3} mb={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={1}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                bgcolor: 'primary.light',
                display: 'flex'
              }}>
                <CalendarIcon color="primary" />
              </Box>
              <Typography color="textSecondary" variant="h6">
                Period Overview
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Total Days:</Typography>
                <Typography variant="body2" fontWeight="medium">{reportData.periodInfo.totalDays}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Working Days:</Typography>
                <Typography variant="body2" fontWeight="medium" color="success.main">
                  {reportData.periodInfo.workingDays}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Holidays:</Typography>
                <Typography variant="body2" fontWeight="medium" color="secondary.main">
                  {reportData.periodInfo.totalHolidays}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={1}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                bgcolor: 'success.light',
                display: 'flex'
              }}>
                <CheckCircle color="success" />
              </Box>
              <Typography color="textSecondary" variant="h6">
                Attendance Rate
              </Typography>
            </Stack>
            <Typography variant="h3" fontWeight="medium" sx={{ mb: 1 }}>
              {attendanceStats.averageAttendance}%
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Average attendance rate
              </Typography>
              <Chip 
                size="small" 
                label={attendanceStats.totalUsers + " users"} 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={1}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                bgcolor: '#FFF3E0',
                display: 'flex'
              }}>
                <WarningIcon sx={{ color: '#FF9800' }} />
              </Box>
              <Typography color="textSecondary" variant="h6">
                Attendance Issues
              </Typography>
            </Stack>
            <Typography variant="h3" fontWeight="medium" sx={{ mb: 1 }}>
              {attendanceStats.lowAttendanceCount}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Users below {attendanceThreshold}% attendance
              </Typography>
              <Chip 
                size="small" 
                label={`${((attendanceStats.lowAttendanceCount / attendanceStats.totalUsers) * 100).toFixed(1)}%`} 
                color="error" 
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={1}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                bgcolor: '#E8F5E9',
                display: 'flex'
              }}>
                <Star sx={{ color: '#4CAF50' }} />
              </Box>
              <Typography color="textSecondary" variant="h6">
                Perfect Attendance
              </Typography>
            </Stack>
            <Typography variant="h3" fontWeight="medium" sx={{ mb: 1 }}>
              {attendanceStats.perfectAttendanceCount}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Users with 100% attendance
              </Typography>
              <Chip 
                size="small" 
                label={`${((attendanceStats.perfectAttendanceCount / attendanceStats.totalUsers) * 100).toFixed(1)}%`} 
                color="success" 
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  
  // Render filters
  const renderFilters = () => (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight="medium" sx={{ minWidth: 100 }}>
          Period:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {
              Array.from({ length: 12 }, (_, i) => {
                const baseDate = new Date(); // Current date
                baseDate.setDate(1); // Avoid day overflow issues
                baseDate.setMonth(baseDate.getMonth() - i);
                const periodEndDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0); // Last day of the current month
                const value = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}`;
                return (
                  <MenuItem key={value} value={value}>
                    {periodEndDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
        
        <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
            size="small"
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportToDetailedExcel}
            size="small"
          >
            Detailed Report
          </Button>
        </Stack>
      </Stack>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" fontWeight="medium" mb={2}>
        Filters:
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              label="Department"
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Team</InputLabel>
            <Select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              label="Team"
            >
              <MenuItem value="all">All Teams</MenuItem>
              {teams.map(team => (
                <MenuItem key={team} value={team}>{team}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Attendance Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Attendance Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="low">Below Threshold</MenuItem>
              <MenuItem value="high">High (90%)</MenuItem>
              <MenuItem value="perfect">Perfect (100%)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Attendance Threshold %"
            type="number"
            size="small"
            value={attendanceThreshold}
            onChange={(e) => setAttendanceThreshold(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
  
  // Render the employee view table
  const renderEmployeeView = () => {
    return Object.entries(filteredUsers).map(([role, users]) => (
      <Paper key={role} elevation={1} sx={{ p: 0, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'grey.50', 
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
            {role}s
          </Typography>
          <Chip 
            size="small" 
            label={`${users.length} users`} 
            sx={{ ml: 2 }}
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Attendance Rate</TableCell>
                <TableCell align="center">Present</TableCell>
                <TableCell align="center">Absent</TableCell>
                <TableCell align="center">Leaves</TableCell>
                <TableCell align="center">Avg. Hours</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, idx) => {
                const attendancePercent = parseFloat(user.stats.attendancePercentage);
                let statusColor = 'success';
                let statusText = 'Good';
                
                if (attendancePercent < attendanceThreshold) {
                  statusColor = 'error';
                  statusText = 'Poor';
                } else if (attendancePercent < 90) {
                  statusColor = 'warning';
                  statusText = 'Average';
                } else if (attendancePercent === 100) {
                  statusText = 'Perfect';
                }
                
                return (
                  <TableRow 
                    key={idx} 
                    hover
                    sx={{
                      bgcolor: attendancePercent < attendanceThreshold ? 'rgba(244, 67, 54, 0.05)' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">{user.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {user.team}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {user.department}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <AttendancePercentage percentage={attendancePercent} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={user.stats.totalPresent}
                        color="success"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={user.stats.totalAbsent}
                        color="error"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={(user.stats.totalPaidLeave || 0) + (user.stats.totalUnpaidLeave || 0)}
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="medium">
                        {user.stats.avgHoursPerDay}h
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={statusText}
                        color={statusColor}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    ));
  };
  
  // Render the department view
  const renderDepartmentView = () => {
    return (
      <Paper elevation={1} sx={{ p: 0, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'grey.50', 
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6">
            Department Summary
          </Typography>
        </Box>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Department</TableCell>
                <TableCell align="center">Total Users</TableCell>
                <TableCell>Avg. Attendance</TableCell>
                <TableCell align="center">Present Days</TableCell>
                <TableCell align="center">Absent Days</TableCell>
                <TableCell align="center">Leave Days</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(usersByDepartment).map(([department, data]) => {
                const isExpanded = expandedDepartments.includes(department);
                
                return (
                  <React.Fragment key={department}>
                    <TableRow hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <BusinessIcon fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="medium">
                            {department}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          size="small" 
                          label={data.count}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <AttendancePercentage percentage={data.avgAttendance} />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{data.presentDays}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{data.absentDays}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{data.leavesDays}</Typography>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          onClick={() => toggleDepartment(department)}
                          endIcon={<ArrowDownIcon sx={{ 
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }} />}
                        >
                          {isExpanded ? 'Hide' : 'Show'} Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ p: 0, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                          <Box sx={{ py: 2, px: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Department Members
                            </Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Attendance Rate</TableCell>
                                    <TableCell align="center">Present</TableCell>
                                    <TableCell align="center">Absent</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {data.users.map((user, idx) => (
                                    <TableRow key={idx} hover>
                                      <TableCell>{user.name}</TableCell>
                                      <TableCell>{user.role}</TableCell>
                                      <TableCell>
                                        <AttendancePercentage percentage={user.stats.attendancePercentage} />
                                      </TableCell>
                                      <TableCell align="center">{user.stats.totalPresent}</TableCell>
                                      <TableCell align="center">{user.stats.totalAbsent}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };
  
  // Render the team view
  const renderTeamView = () => {
    return (
      <Paper elevation={1} sx={{ p: 0, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'grey.50', 
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6">
            Team Summary
          </Typography>
        </Box>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Team</TableCell>
                <TableCell align="center">Total Users</TableCell>
                <TableCell>Avg. Attendance</TableCell>
                <TableCell align="center">Present Days</TableCell>
                <TableCell align="center">Absent Days</TableCell>
                <TableCell align="center">Leave Days</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(usersByTeam).map(([team, data]) => {
                const isExpanded = expandedTeams.includes(team);
                
                return (
                  <React.Fragment key={team}>
                    <TableRow hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TeamIcon fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="medium">
                            {team}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          size="small" 
                          label={data.count}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <AttendancePercentage percentage={data.avgAttendance} />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{data.presentDays}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{data.absentDays}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{data.leavesDays}</Typography>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          onClick={() => toggleTeam(team)}
                          endIcon={<ArrowDownIcon sx={{ 
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }} />}
                        >
                          {isExpanded ? 'Hide' : 'Show'} Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ p: 0, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                          <Box sx={{ py: 2, px: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Team Members
                            </Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Attendance Rate</TableCell>
                                    <TableCell align="center">Present</TableCell>
                                    <TableCell align="center">Absent</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {data.users.map((user, idx) => (
                                    <TableRow key={idx} hover>
                                      <TableCell>{user.name}</TableCell>
                                      <TableCell>{user.role}</TableCell>
                                      <TableCell>
                                        <AttendancePercentage percentage={user.stats.attendancePercentage} />
                                      </TableCell>
                                      <TableCell align="center">{user.stats.totalPresent}</TableCell>
                                      <TableCell align="center">{user.stats.totalAbsent}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };
  
  // Render the calendar view
  const renderCalendarView = () => {
    return (
      <Paper elevation={1} sx={{ p: 0, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'grey.50', 
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6">
            Daily Attendance Calendar
          </Typography>
        </Box>
        
        <Box sx={{ p: 2 }}>
          <Grid container spacing={1}>
            {/* Legend */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#E8F5E9', borderRadius: 1 }} />
                  <Typography variant="caption">Present</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#FFEBEE', borderRadius: 1 }} />
                  <Typography variant="caption">Absent</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#E1F5FE', borderRadius: 1 }} />
                  <Typography variant="caption">Paid Leave</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#F3E5F5', borderRadius: 1 }} />
                  <Typography variant="caption">Unpaid Leave</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#F3E5F5', borderRadius: 1 }} />
                  <Typography variant="caption">Holiday</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#FFF3E0', borderRadius: 1 }} />
                  <Typography variant="caption">Half-Day</Typography>
                </Box>
              </Box>
            </Grid>
            
            {/* Calendar header */}
            {reportData.dateRange.slice(0, 7).map((date, index) => (
              <Grid item xs={12/7} key={`header-${index}`}>
                <Box sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  borderRadius: 1,
                  bgcolor: 'grey.100',
                  color: ['Sat', 'Sun'].includes(date.dayName) ? 'error.main' : 'text.primary',
                  fontWeight: 'medium'
                }}>
                  {date.dayName}
                </Box>
              </Grid>
            ))}
            
            {/* Calendar days */}
            {reportData.dateRange.map((date, index) => (
              <Grid item xs={12/7} key={`day-${index}`}>
                <Box sx={{ 
                  p: 1, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: date.isHoliday ? '#F3E5F5' : date.isWeekend ? '#E3F2FD' : 'transparent'
                }}>
                  <Typography variant="caption" sx={{ mb: 1 }}>
                    {new Date(date.date).getDate()}
                  </Typography>
                  
                  <Box sx={{ 
                    width: '100%', 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5
                  }}>
                    {date.isHoliday && (
                      <Chip
                        label="Holiday"
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ width: '100%' }}
                      />
                    )}
                    
                    {date.isWeekend && !date.isHoliday && (
                      <Chip
                        label="Weekend"
                        size="small"
                        color="primary"
                        variant="outlined" 
                        sx={{ width: '100%' }}
                      />
                    )}
                    
                    <Box sx={{ 
                      mt: 1,
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <Tooltip title={`Present: ${Object.values(reportData.usersByRole)
                        .flatMap(users => users)
                        .filter(user => 
                          user.attendance[date.date]?.status === 'Present'
                        ).length}`}
                      >
                        <Chip
                          icon={<CheckCircleOutline fontSize="small" />}
                          label={Object.values(reportData.usersByRole)
                            .flatMap(users => users)
                            .filter(user => 
                              user.attendance[date.date]?.status === 'Present'
                            ).length}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ mr: 0.5 }}
                        />
                      </Tooltip>
                      
                      <Tooltip title={`Absent: ${Object.values(reportData.usersByRole)
                        .flatMap(users => users)
                        .filter(user => 
                          user.attendance[date.date]?.status === 'Absent'
                        ).length}`}
                      >
                        <Chip
                          icon={<Cancel fontSize="small" />}
                          label={Object.values(reportData.usersByRole)
                            .flatMap(users => users)
                            .filter(user => 
                              user.attendance[date.date]?.status === 'Absent'
                            ).length}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    );
  };
  
  // Main render function
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Attendance Analytics Dashboard
      </Typography>
      
      {renderSummaryCards()}
      {renderFilters()}
      
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="By Employee" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="By Department" icon={<BusinessIcon />} iconPosition="start" />
          <Tab label="By Team" icon={<TeamIcon />} iconPosition="start" />
          <Tab label="Calendar View" icon={<CalendarIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      <TabPanel value={activeTab} index={0}>
        {Object.keys(filteredUsers).length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No users match the current filter criteria. Try adjusting your filters.
          </Alert>
        ) : (
          renderEmployeeView()
        )}
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        {renderDepartmentView()}
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
        {renderTeamView()}
      </TabPanel>
      
      <TabPanel value={activeTab} index={3}>
        {renderCalendarView()}
      </TabPanel>
    </Box>
  );
};

export default AdminAttendanceAnalytics;