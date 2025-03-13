import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import config from '../../config';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Divider,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { format } from 'date-fns';

const EmployeeSummary = () => {
  const { user } = useAuth();
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leavePolicy, setLeavePolicy] = useState(null);
  const [joiningDate, setJoiningDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.API_URL}/api/leave/balance/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setLeaveBalances(response.data.leaveBalances);
          setLeavePolicy(response.data.leavePolicy);
          setJoiningDate(response.data.joiningDate);
        } else {
          setError('Failed to fetch leave balance data');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'An error occurred while fetching leave balance');
        console.error('Error fetching leave balance:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLeaveBalance();
    }
  }, [user]);

  const getPolicyAllowance = (leaveType) => {
    if (!leavePolicy || !leavePolicy.leaveTypes) return null;
    
    const policyType = leavePolicy.leaveTypes.find(type => type.type === leaveType);
    return policyType ? policyType.daysAllowed : null;
  };

  // Calculate progress percentage for each leave type
  const calculateProgress = (balance, used, allowance) => {
    if (!allowance) return 0;
    const total = balance + used;
    return Math.min(Math.round((used / allowance) * 100), 100);
  };

  // Color logic for progress bars
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'error';
    if (percentage >= 50) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom component="div">
        Leave Balance
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Card */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">
                  <strong>Employee:</strong> {user?.name}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Role:</strong> {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">
                  <strong>Joining Date:</strong> {joiningDate ? format(new Date(joiningDate), 'dd MMM yyyy') : 'N/A'}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Leave Policy:</strong> {leavePolicy?.name || 'Not Assigned'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Leave Balance Cards */}
          <Grid container spacing={3}>
            {leaveBalances.map((leave) => {
              const allowance = getPolicyAllowance(leave.leaveType);
              const progress = calculateProgress(leave.balance, leave.used, allowance);
              const progressColor = getProgressColor(progress);
              
              return (
                <Grid item xs={12} sm={6} md={3} key={leave.leaveType}>
                  <Card elevation={2}>
                    <CardHeader 
                      title={leave.leaveType} 
                      titleTypographyProps={{ variant: 'h6' }}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Available
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {leave.balance} days
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Used
                        </Typography>
                        <Typography variant="body1">
                          {leave.used} days
                        </Typography>
                      </Box>
                      {allowance && (
                        <>
                          <Divider sx={{ mb: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Total Allowed
                            </Typography>
                            <Typography variant="body1">
                              {allowance} days
                            </Typography>
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress} 
                              color={progressColor}
                              sx={{ height: 10, borderRadius: 5 }}
                            />
                            <Typography variant="caption" align="right" display="block" sx={{ mt: 0.5 }}>
                              {progress}% Used
                            </Typography>
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Leave Policy Details */}
          {leavePolicy && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Leave Policy Details
              </Typography>
              <Paper>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Leave Type</TableCell>
                        <TableCell>Days Allowed</TableCell>
                        <TableCell>Carry Forward</TableCell>
                        <TableCell>Paid</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leavePolicy.leaveTypes.map((type) => (
                        <TableRow key={type.type}>
                          <TableCell>{type.type}</TableCell>
                          <TableCell>{type.daysAllowed}</TableCell>
                          <TableCell>
                            {type.carryForward ? 
                              `Yes (Max: ${type.maxCarryForward || 'Unlimited'})` : 
                              'No'}
                          </TableCell>
                          <TableCell>{type.paid ? 'Yes' : 'No'}</TableCell>
                          <TableCell>{type.description || 'No description'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default EmployeeSummary;