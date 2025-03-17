import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon, 
  PersonAdd as AssignIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from "../../config";

const ViewLeavePolicy = () => {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolicyAndUsers = async () => {
      try {
        setLoading(true);
        // Fetch the leave policy
        const policyResponse = await axios.get(`${config.API_URL}/api/leave/policy/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPolicy(policyResponse.data.policy);

        // Fetch all user profiles
        const usersResponse = await axios.get(`${config.API_URL}/api/user-profile/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        // Filter user profiles that have this policy assigned
        const usersWithPolicy = usersResponse.data.userProfiles.filter(
          profile => profile.leavePolicyId === id
        );
        
        setAssignedUsers(usersWithPolicy);
        setError('');
      } catch (error) {
        setError('Failed to fetch policy or user details.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPolicyAndUsers();
    }
  }, [id]);

  const handleEditPolicy = () => {
    navigate(`/admin-dashboard/leave-policy/edit/${id}`);
  };

  const handleAssignPolicy = () => {
    navigate(`/admin-dashboard/leave-policy/assign/${id}`);
  };

  const handleGoBack = () => {
    navigate('/admin-dashboard/leave-policies');
  };

  const handleToggleStatus = async () => {
    try {
      const updatedPolicy = {
        ...policy,
        active: !policy.active
      };
      
      const response = await axios.put(
        `${config.API_URL}/api/leave/policy/${id}`,
        updatedPolicy,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      setPolicy(response.data.policy);
    } catch (error) {
      setError('Failed to update policy status.');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading policy details...</Typography>
      </Box>
    );
  }

  if (!policy) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Policy not found or has been deleted.</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Back to Policy List
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
          >
            Back to Policy List
          </Button>
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditPolicy}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              startIcon={<AssignIcon />}
              onClick={handleAssignPolicy}
            >
              Assign to Users
            </Button>
          </Box>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title={
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5">{policy.name}</Typography>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={policy.active} 
                          onChange={handleToggleStatus}
                          color="primary"
                        />
                      }
                      label={policy.active ? "Active" : "Inactive"}
                    />
                  </Stack>
                }
                subheader={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {policy.description || "No description provided"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(policy.createdAt).toLocaleDateString()}
                      {policy.updatedAt !== policy.createdAt && 
                        ` • Last updated: ${new Date(policy.updatedAt).toLocaleDateString()}`}
                    </Typography>
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="h6" gutterBottom>Applicable Roles</Typography>
                <Box sx={{ mb: 3 }}>
                  {policy.applicableRoles.map((role) => (
                    <Chip 
                      key={role} 
                      label={role} 
                      sx={{ m: 0.5, textTransform: 'capitalize' }} 
                    />
                  ))}
                </Box>

                <Typography variant="h6" gutterBottom>Leave Types</Typography>
                <List>
                  {policy.leaveTypes.map((type, index) => (
                    <React.Fragment key={type._id || index}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight="medium">
                              {type.type} 
                              <Chip 
                                label={`${type.daysAllowed} days per year`}
                                color="primary"
                                size="small"
                                sx={{ ml: 1 }}
                              />
                              {type.probationPeriod > 0 && (
                                <Chip 
                                  label={`${type.probationPeriod} months probation`}
                                  color="secondary"
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2">
                                    Paid Leave: {type.paid ? "Yes" : "No"}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2">
                                    Carry Forward: {type.carryForward ? "Yes" : "No"}
                                    {type.carryForward && type.maxCarryForward && (
                                      ` (Max: ${type.maxCarryForward} days)`
                                    )}
                                  </Typography>
                                </Grid>
                                {type.description && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                      {type.description}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < policy.leaveTypes.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Assigned Users Section */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Card>
              <CardHeader 
                title={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PeopleIcon color="primary" />
                    <Typography variant="h6">
                      Assigned Users
                      {assignedUsers.length > 0 && (
                        <Chip 
                          label={assignedUsers.length} 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1 }} 
                        />
                      )}
                    </Typography>
                  </Stack>
                }
              />
              <Divider />
              <CardContent>
                {assignedUsers.length === 0 ? (
                  <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
                    No users are currently assigned to this leave policy
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Designation</TableCell>
                          <TableCell>Joining Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {assignedUsers.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar 
                                  src={user.user?.profileImage ? `${config.API_URL}/uploads/${user.user.profileImage}` : null}
                                  alt={user.user?.name || 'User'}
                                  sx={{ width: 36, height: 36 }}
                                >
                                  {user.user?.name?.charAt(0) || 'U'}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1">{user.user?.name || 'Unknown'}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {user.user?.email || 'No email'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.user?.role || 'Unknown'}
                                size="small"
                                color={user.user?.role === 'manager' ? 'secondary' : 'default'}
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell>
                              {user.department?.dep_name || 'Not assigned'}
                            </TableCell>
                            <TableCell>
                              {user.designation || '-'}
                            </TableCell>
                            <TableCell>
                              {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ViewLeavePolicy;