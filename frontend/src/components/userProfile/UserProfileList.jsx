import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Badge,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  VerifiedUser as VerifiedUserIcon,
  NotInterested as InactiveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const UserProfileList = () => {
  const navigate = useNavigate();
  const [userProfiles, setUserProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Meta statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    managers: 0,
    employees: 0,
    departments: []
  });

  // Fetch user profiles
  useEffect(() => {
    const fetchUserProfiles = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get(`${config.API_URL}/api/user-profile`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setUserProfiles(response.data.userProfiles);
          processStatistics(response.data.userProfiles);
        } else {
          setError('Failed to fetch user profiles');
        }
      } catch (error) {
        console.error('Error fetching user profiles:', error);
        setError(error.response?.data?.error || 'Failed to fetch user profiles');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfiles();
  }, [refreshTrigger]);

  // Process statistics from user profiles
  const processStatistics = (profiles) => {
    const stats = {
      total: profiles.length,
      active: 0,
      inactive: 0,
      managers: 0,
      employees: 0,
      departments: []
    };
    
    const departmentSet = new Set();
    
    profiles.forEach(profile => {
      if (profile.user.role === 'manager') {
        stats.managers++;
      } else if (profile.user.role === 'employee') {
        stats.employees++;
      }
      
      if (profile.user.status === 'active') {
        stats.active++;
      } else {
        stats.inactive++;
      }
      
      if (profile.department?.dep_name) {
        departmentSet.add(profile.department.dep_name);
      }
    });
    
    stats.departments = Array.from(departmentSet);
    setStatistics(stats);
  };

  // Filter profiles based on search term, role, department, and status
  const filteredProfiles = useMemo(() => {
    return userProfiles.filter(profile => {
      const matchesSearch = 
        profile.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.employeeId && profile.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (profile.managerId && profile.managerId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = 
        roleFilter === 'all' || 
        profile.user.role === roleFilter;
      
      const matchesDepartment = 
        departmentFilter === 'all' || 
        (profile.department?.dep_name === departmentFilter);
      
      const matchesStatus = 
        statusFilter === 'all' || 
        profile.user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });
  }, [userProfiles, searchTerm, roleFilter, departmentFilter, statusFilter]);

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle menu open/close
  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle user actions
  const handleViewUser = (userId) => {
    navigate(`/admin-dashboard/user-profile/${userId}`);
    handleMenuClose();
  };

  const handleEditUser = (userId) => {
    navigate(`/admin-dashboard/user-profile/edit/${userId}`);
    handleMenuClose();
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`${config.API_URL}/api/user-profile/${userId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          // Refresh the user list
          setRefreshTrigger(prev => prev + 1);
        } else {
          setError('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setError(error.response?.data?.error || 'Failed to delete user');
      }
      handleMenuClose();
    }
  };

  // Render status badge
  const StatusBadge = ({ status }) => {
    return status === 'active' ? (
      <Chip 
        icon={<VerifiedUserIcon fontSize="small" />}
        label="Active" 
        size="small"
        color="success"
        variant="outlined"
      />
    ) : (
      <Chip 
        icon={<InactiveIcon fontSize="small" />}
        label="Inactive" 
        size="small"
        color="error"
        variant="outlined"
      />
    );
  };

  // Render role badge
  const RoleBadge = ({ role }) => {
    const roleConfig = {
      admin: { color: 'secondary', icon: <PersonIcon fontSize="small" /> },
      manager: { color: 'primary', icon: <BusinessIcon fontSize="small" /> },
      employee: { color: 'info', icon: <GroupIcon fontSize="small" /> }
    };
    
    const config = roleConfig[role] || roleConfig.employee;
    
    return (
      <Chip 
        icon={config.icon}
        label={role.charAt(0).toUpperCase() + role.slice(1)} 
        size="small"
        color={config.color}
        variant="outlined"
      />
    );
  };

  // Department list for filter
  const departments = useMemo(() => {
    return ['all', ...statistics.departments];
  }, [statistics.departments]);

  // Handle user row click
  const handleUserRowClick = (userId) => {
    navigate(`/admin-dashboard/user-profile/${userId}`);
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          User Profiles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin-dashboard/user-profile/create')}
        >
          Create User
        </Button>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                    {statistics.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main" sx={{ mt: 1 }}>
                    {statistics.active}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                  <VerifiedUserIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Managers
                  </Typography>
                  <Typography variant="h4" component="div" color="primary.main" sx={{ mt: 1 }}>
                    {statistics.managers}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Employees
                  </Typography>
                  <Typography variant="h4" component="div" color="info.main" sx={{ mt: 1 }}>
                    {statistics.employees}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light', color: 'info.main' }}>
                  <GroupIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search users..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<FilterListIcon />}
              label="All Roles"
              clickable
              color={roleFilter === 'all' ? 'primary' : 'default'}
              onClick={() => setRoleFilter('all')}
              sx={{ fontWeight: roleFilter === 'all' ? 'bold' : 'normal' }}
            />
            <Chip
              icon={<BusinessIcon />}
              label="Managers"
              clickable
              color={roleFilter === 'manager' ? 'primary' : 'default'}
              onClick={() => setRoleFilter('manager')}
              sx={{ fontWeight: roleFilter === 'manager' ? 'bold' : 'normal' }}
            />
            <Chip
              icon={<GroupIcon />}
              label="Employees"
              clickable
              color={roleFilter === 'employee' ? 'primary' : 'default'}
              onClick={() => setRoleFilter('employee')}
              sx={{ fontWeight: roleFilter === 'employee' ? 'bold' : 'normal' }}
            />
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Chip
              icon={<VerifiedUserIcon />}
              label="Active"
              clickable
              color={statusFilter === 'active' ? 'success' : 'default'}
              onClick={() => setStatusFilter('active')}
              sx={{ fontWeight: statusFilter === 'active' ? 'bold' : 'normal' }}
            />
            <Chip
              icon={<InactiveIcon />}
              label="Inactive"
              clickable
              color={statusFilter === 'inactive' ? 'error' : 'default'}
              onClick={() => setStatusFilter('inactive')}
              sx={{ fontWeight: statusFilter === 'inactive' ? 'bold' : 'normal' }}
            />
          </Box>
        </Box>

        {/* Department filter */}
        {departments.length > 1 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', borderTop: 1, borderColor: 'divider', pt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Departments:
            </Typography>
            {departments.map((dept) => (
              <Chip
                key={dept}
                label={dept === 'all' ? 'All Departments' : dept}
                size="small"
                clickable
                color={departmentFilter === dept ? 'primary' : 'default'}
                variant={departmentFilter === dept ? 'filled' : 'outlined'}
                onClick={() => setDepartmentFilter(dept)}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Users Table */}
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProfiles.length > 0 ? (
                filteredProfiles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((profile) => (
                    <TableRow 
                      key={profile._id} 
                      hover 
                      onClick={() => handleUserRowClick(profile._id)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { 
                          bgcolor: 'action.hover',
                          '& .action-buttons': {
                            opacity: 1
                          }
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={profile.user.profileImage 
                              ? profile.user.profileImage
                              : null
                            }
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: profile.user.role === 'manager'
                                ? 'primary.main'
                                : 'secondary.main'
                            }}
                          >
                            {profile.user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {profile.user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {profile.user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {profile.employeeId || profile.managerId || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {profile.department?.dep_name || 'Not assigned'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={profile.user.role} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={profile.user.status} />
                      </TableCell>
                      <TableCell align="right">
                        <Box 
                          className="action-buttons"
                          sx={{ 
                            opacity: 0.3,
                            transition: 'opacity 0.2s',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 1
                          }}
                          onClick={(e) => e.stopPropagation()} // Prevent row click
                        >
                          <Tooltip title="View details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewUser(profile._id);
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit user">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditUser(profile._id);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete user">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(profile._id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Stack spacing={1} alignItems="center">
                      <PersonIcon color="disabled" fontSize="large" />
                      <Typography variant="subtitle1" color="text.secondary">
                        No users found
                      </Typography>
                      {searchTerm || roleFilter !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all' ? (
                        <Button 
                          startIcon={<RefreshIcon />} 
                          variant="outlined" 
                          size="small"
                          onClick={() => {
                            setSearchTerm('');
                            setRoleFilter('all');
                            setDepartmentFilter('all');
                            setStatusFilter('all');
                          }}
                        >
                          Clear filters
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<PersonAddIcon />}
                          onClick={() => navigate('/admin-dashboard/user-profile/create')}
                          size="small"
                        >
                          Create your first user
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredProfiles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default UserProfileList;