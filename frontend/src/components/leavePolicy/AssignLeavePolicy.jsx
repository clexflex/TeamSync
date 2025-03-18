import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {   Box,   Paper,   Typography,   Button,   FormControl,   InputLabel,   Select,   MenuItem,   Chip,   Checkbox,   ListItemText,   OutlinedInput,   FormHelperText,   CircularProgress,   Stack,   Divider,   Alert,   Card,   CardContent,   List,   ListItem,   ListItemIcon,   ListItemButton,   FormControlLabel,   Switch } from '@mui/material';
import {   ArrowBack as ArrowBackIcon,   Save as SaveIcon,   Person as PersonIcon,   PersonOutline as PersonOutlineIcon,   DateRange as DateRangeIcon,   Check as CheckIcon,   Cancel as CancelIcon } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const AssignLeavePolicy = () => {
  const navigate = useNavigate();
  
  // State variables
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [policyDetails, setPolicyDetails] = useState(null);
  const [showUsersWithPolicy, setShowUsersWithPolicy] = useState(false);
  
  // Fetch policies and users when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch leave policies
        const policyResponse = await axios.get(`${config.API_URL}/api/leave/policy`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Fetch users (employees and managers)
        const userResponse = await axios.get(`${config.API_URL}/api/user-profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setPolicies(policyResponse.data.policies);
        
        // Ensure userProfiles have valid userId objects with populated data
        const validUsers = userResponse.data.userProfiles.filter(profile => profile.user && profile.user._id);
        
        // Map the data to a more usable format
        setUsers(validUsers.map(profile => ({
          _id: profile._id,
          userId: profile.user._id,  // Store userId directly
          name: profile.user?.name || 'Unknown',
          email: profile.user?.email || 'Unknown',
          role: profile.user?.role || 'Unknown',
          hasLeavePolicy: profile.hasLeavePolicy || false,
          leavePolicyId: profile.leavePolicyId || null,
          leavePolicyName: profile.leavePolicyName || null
        })));
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Fetch policy details when a policy is selected
  useEffect(() => {
    if (selectedPolicy) {
      const fetchPolicyDetails = async () => {
        try {
          const response = await axios.get(`${config.API_URL}/api/leave/policy/${selectedPolicy}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          setPolicyDetails(response.data.policy);
        } catch (err) {
          setError('Failed to fetch policy details.');
          console.error(err);
        }
      };
      
      fetchPolicyDetails();
    } else {
      setPolicyDetails(null);
    }
  }, [selectedPolicy]);
  
  // Filter users based on selected role and policy status
  const filteredUsers = users.filter(user => {
    // Filter by role
    const roleMatch = selectedRole === 'all' || user.role === selectedRole;
    
    // Filter by policy status
    const policyMatch = showUsersWithPolicy || !user.hasLeavePolicy;
    
    return roleMatch && policyMatch;
  });
  
  // Handle policy selection
  const handlePolicyChange = (event) => {
    setSelectedPolicy(event.target.value);
    // Clear selected users when policy changes
    setSelectedUsers([]);
  };
  
  // Handle user selection
  const handleUserChange = (event) => {
    const selected = event.target.value;
    // Filter out users with existing policies if toggle is off
    const validUsers = showUsersWithPolicy ? selected : selected.filter(user => !user.hasLeavePolicy);
    setSelectedUsers(validUsers);
  };
  
  // Handle role filter change
  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setSelectedUsers([]);
  };
  
  // Handle show users with policy toggle
  const handleToggleChange = (event) => {
    setShowUsersWithPolicy(event.target.checked);
    // Reset selected users when toggle changes
    setSelectedUsers([]);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPolicy) {
      setError('Please select a leave policy');
      return;
    }
    
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Use the directly stored userId from each user object
      const userIds = selectedUsers.map(user => user.userId);
      
      const response = await axios.post(
        `${config.API_URL}/api/leave/policy/assign`,
        {
          policyId: selectedPolicy,
          userIds
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      setSuccess(`Leave policy assigned successfully to ${response.data.totalAssigned} users.`);
      
      // Show any failed assignments
      if (response.data.totalFailed > 0) {
        setError(`Failed to assign to ${response.data.totalFailed} users.`);
      }
      
      // Update local user data to reflect changes
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (selectedUsers.some(selected => selected.userId === user.userId)) {
            return {
              ...user,
              hasLeavePolicy: true,
              leavePolicyId: selectedPolicy,
              leavePolicyName: policies.find(p => p._id === selectedPolicy)?.name || null
            };
          }
          return user;
        })
      );
      
      // Clear selected users after successful assignment
      setSelectedUsers([]);
      
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.error || 'Failed to assign leave policy. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Assign Leave Policy
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin-dashboard/leave-policies')}
          >
            Back to Policies
          </Button>
        </Stack>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}
            
            <Stack spacing={3}>
              {/* Policy selection */}
              <FormControl fullWidth required>
                <InputLabel>Select Leave Policy</InputLabel>
                <Select
                  value={selectedPolicy}
                  onChange={handlePolicyChange}
                  label="Select Leave Policy"
                >
                  {policies.map((policy) => (
                    <MenuItem key={policy._id} value={policy._id}>
                      {policy.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Choose the leave policy you want to assign</FormHelperText>
              </FormControl>
              
              {/* Policy details card */}
              {policyDetails && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Policy Details: {policyDetails.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {policyDetails.description}
                    </Typography>
                    
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Leave Types:
                    </Typography>
                    
                    <List dense>
                      {policyDetails.leaveTypes.map((leaveType, index) => (
                        <ListItem key={index} disablePadding>
                          <ListItemButton dense sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <DateRangeIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`${leaveType.type}: ${leaveType.daysAllowed} days`} 
                              secondary={leaveType.description}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                    
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      Applicable to: {policyDetails.applicableRoles.join(', ')}
                    </Typography>
                  </CardContent>
                </Card>
              )}
              
              <Divider />
              
              {/* User filter options */}
              <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems="center">
                {/* Role filter */}
                <FormControl fullWidth>
                  <InputLabel>Filter by Role</InputLabel>
                  <Select
                    value={selectedRole}
                    onChange={handleRoleChange}
                    label="Filter by Role"
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="employee">Employees Only</MenuItem>
                    <MenuItem value="manager">Managers Only</MenuItem>
                  </Select>
                </FormControl>
                
                {/* Toggle to show users with existing policy */}
                <FormControlLabel
                  control={
                    <Switch 
                      checked={showUsersWithPolicy} 
                      onChange={handleToggleChange}
                      color="primary"
                    />
                  }
                  label="Include users with existing policy"
                  sx={{ ml: 2 }}
                />
              </Stack>
              
              {/* Users selection */}
              <FormControl fullWidth required>
                <InputLabel>Select Users</InputLabel>
                <Select
                  multiple
                  value={selectedUsers}
                  onChange={handleUserChange}
                  input={<OutlinedInput label="Select Users" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((user) => (
                        <Chip 
                          key={user._id} 
                          label={`${user.name} (${user.role})`}
                          size="small"
                          icon={user.role === 'manager' ? <PersonIcon fontSize="small" /> : <PersonOutlineIcon fontSize="small" />}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <MenuItem 
                        key={user._id} 
                        value={user}
                        disabled={!showUsersWithPolicy && user.hasLeavePolicy}
                        sx={{
                          opacity: (!showUsersWithPolicy && user.hasLeavePolicy) ? 0.5 : 1
                        }}
                      >
                        <Checkbox checked={selectedUsers.some(selected => selected._id === user._id)} />
                        <ListItemText 
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2">{user.name}</Typography>
                              {user.hasLeavePolicy && (
                                <Chip 
                                  size="small" 
                                  label={user.leavePolicyName || "Has Policy"} 
                                  color="info"
                                  icon={<CheckIcon fontSize="small" />}
                                  sx={{ height: 20 }}
                                />
                              )}
                            </Stack>
                          }
                          secondary={`${user.email} • ${user.role}`}
                        />
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        {showUsersWithPolicy ? 'No users found matching the selected criteria.' : 'No users without leave policy found.'}
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText>
                  Selected: {selectedUsers.length} users {showUsersWithPolicy && selectedUsers.some(u => u.hasLeavePolicy) && 
                  '(including ' + selectedUsers.filter(u => u.hasLeavePolicy).length + ' with existing policy)'}
                </FormHelperText>
              </FormControl>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={submitting || selectedUsers.length === 0}
                  sx={{ minWidth: 150 }}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Assign Policy'}
                </Button>
              </Box>
            </Stack>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default AssignLeavePolicy;