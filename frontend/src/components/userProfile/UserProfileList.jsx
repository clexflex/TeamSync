import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, TextField, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Chip, Avatar, Stack,
  InputAdornment, Tooltip, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as LeaveIcon,
  AccountBalance as SalaryIcon,
  People as TeamIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const UserProfileList = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfiles();
  }, []);

  const fetchUserProfiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_URL}/api/user-profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        const data = response.data.userProfiles.map((profile, index) => ({
          ...profile,
          sno: index + 1,
          profileImage: profile.user.profileImage
            ? `${config.API_URL}/uploads/${profile.user.profileImage}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.user.name)}&background=random`
        }));
        setUserProfiles(data);
        setFilteredProfiles(data);
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setError(error.response.data.error || 'Failed to fetch user profiles');
      } else {
        setError('An error occurred while fetching user profiles');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters when user profiles or filter changes
    if (filter === 'all') {
      setFilteredProfiles(userProfiles);
    } else {
      const filtered = userProfiles.filter(profile => 
        profile.user.role === filter
      );
      setFilteredProfiles(filtered);
    }
  }, [filter, userProfiles]);

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filtered = userProfiles.filter((profile) => {
      // Filter based on active filter first
      const roleMatch = filter === 'all' || profile.user.role === filter;
      
      // Then apply search term
      const nameMatch = profile.user.name.toLowerCase().includes(searchTerm);
      const emailMatch = profile.user.email.toLowerCase().includes(searchTerm);
      const idMatch = (profile.employeeId || profile.managerId || '').toLowerCase().includes(searchTerm);
      const departmentMatch = profile.department?.dep_name?.toLowerCase().includes(searchTerm) || false;
      
      return roleMatch && (nameMatch || emailMatch || idMatch || departmentMatch);
    });
    
    setFilteredProfiles(filtered);
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user profile?")) {
      try {
        const response = await axios.delete(`${config.API_URL}/api/user-profile/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        if (response.data.success) {
          setUserProfiles((prev) => prev.filter((profile) => profile._id !== id));
          setFilteredProfiles((prev) => prev.filter((profile) => profile._id !== id));
        }
      } catch (error) {
        setError('Failed to delete user profile.');
      }
    }
  };

  const ActionButtons = ({ profile }) => {
    const isEmployee = profile.user.role === 'employee';
    
    return (
      <Stack direction="row" spacing={1}>
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={() => navigate(`/admin-dashboard/user-profile/${profile._id}`)}
            sx={{ color: 'primary.main' }}
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Edit Profile">
          <IconButton
            size="small"
            onClick={() => navigate(`/admin-dashboard/user-profile/edit/${profile._id}`)}
            sx={{ color: 'primary.main' }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        
        {isEmployee && (
          <Tooltip title="Salary Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/admin-dashboard/employees/salary/${profile.user._id}`)}
              sx={{ color: 'success.main' }}
            >
              <SalaryIcon />
            </IconButton>
          </Tooltip>
        )}
        
        {isEmployee && (
          <Tooltip title="Leave Management">
            <IconButton
              size="small"
              onClick={() => navigate(`/admin-dashboard/employees/leaves/${profile.user._id}`)}
              sx={{ color: 'warning.main' }}
            >
              <LeaveIcon />
            </IconButton>
          </Tooltip>
        )}
        
        {profile.user.role === 'manager' && (
          <Tooltip title="Team Management">
            <IconButton
              size="small"
              onClick={() => navigate(`/admin-dashboard/manager/${profile._id}/teams`)}
              sx={{ color: 'info.main' }}
            >
              <TeamIcon />
            </IconButton>
          </Tooltip>
        )}
        
        <Tooltip title="Delete Profile">
          <IconButton
            size="small"
            onClick={() => handleDelete(profile._id)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          User Profiles
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin-dashboard/user-profile/create')}
          sx={{ px: 3 }}
        >
          Create User Profile
        </Button>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: 'error.light', 
              color: 'error.dark',
              borderRadius: 2 
            }}
          >
            {error}
          </Paper>
        </Box>
      )}

      <Paper elevation={0} sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
          <TextField
            sx={{ flexGrow: 1 }}
            variant="outlined"
            placeholder="Search by name, ID, email, department..."
            onChange={handleSearch}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="role-filter-label">Filter By Role</InputLabel>
            <Select
              labelId="role-filter-label"
              value={filter}
              label="Filter By Role"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All Profiles</MenuItem>
              <MenuItem value="employee">Employees</MenuItem>
              <MenuItem value="manager">Managers</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-label="user profiles table">
            <TableHead>
              <TableRow>
                <TableCell width={80}>S No</TableCell>
                <TableCell width={300}>Profile</TableCell>
                <TableCell width={200}>Department</TableCell>
                <TableCell width={120}>Role</TableCell>
                <TableCell width={120}>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          border: 2,
                          borderColor: 'primary.main',
                          borderTopColor: 'transparent',
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                          }
                        }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No user profiles found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((profile) => (
                    <TableRow key={profile._id} hover>
                      <TableCell>{profile.sno}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={profile.profileImage}
                            alt={profile.user.name}
                            sx={{ width: 40, height: 40 }}
                          />
                          <Box>
                            <Typography variant="subtitle2">
                              {profile.user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {profile.user.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {profile.employeeId || profile.managerId || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {profile.department?.dep_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={profile.user.role === 'employee' ? 'Employee' : 'Manager'}
                          color={profile.user.role === 'employee' ? 'info' : 'primary'}
                          size="small"
                          sx={{ 
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={profile.user.status === 'active' ? 'Active' : 'Inactive'}
                          color={profile.user.status === 'active' ? 'success' : 'error'}
                          size="small"
                          sx={{ 
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <ActionButtons profile={profile} />
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
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