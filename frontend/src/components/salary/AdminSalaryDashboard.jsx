import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  AttachMoney,
  PeopleAlt,
  Description,
  Paid,
  PersonAdd,
  TimerOutlined,
  CheckCircleOutline,
  Cancel,
  WarningAmber
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';

const AdminSalaryDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalaryStats();
  }, []);

  const fetchSalaryStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${config.API_URL}/api/salary/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        setError('Failed to fetch salary statistics');
      }
    } catch (error) {
      console.error('Error fetching salary statistics:', error);
      setError(error.response?.data?.error || 'An error occurred while fetching salary statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, suffix = '', prefix = '' }) => (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Box
              sx={{
                bgcolor: `${color}.light`,
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon sx={{ color: `${color}.main`, fontSize: 28 }} />
            </Box>
          </Grid>
          <Grid item xs>
            <Typography color="textSecondary" variant="body2">
              {title}
            </Typography>
            <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
              {prefix}{value}{suffix}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          Salary Dashboard
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Paid />}
            onClick={() => navigate('/admin-dashboard/salary/generate')}
          >
            Generate Salary
          </Button>
          <Button
            variant="outlined"
            startIcon={<Description />}
            onClick={() => navigate('/admin-dashboard/salary/list')}
          >
            View Salary Records
          </Button>
        </Stack>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 4, border: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Current Month ({stats?.currentMonth})
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={AttachMoney}
              title="Total Disbursement"
              value={stats?.totalDisbursement.toLocaleString('en-IN')}
              color="success"
              prefix="₹ "
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={PeopleAlt}
              title="Employees"
              value={stats?.employeeCount}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={PersonAdd}
              title="Managers"
              value={stats?.managerCount}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={Description}
              title="Total Salaries"
              value={(stats?.statusCounts?.Draft || 0) +
                (stats?.statusCounts?.Verified || 0) +
                (stats?.statusCounts?.Approved || 0) +
                (stats?.statusCounts?.Paid || 0) +
                (stats?.statusCounts?.Rejected || 0) || 0}
              color="warning"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Salary Status Breakdown
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ bgcolor: 'grey.50', height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <TimerOutlined color="action" />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                    Draft
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="medium">
                  {stats?.statusCounts?.Draft || 0}
                </Typography>
                <Box mt={1}>
                  <Chip
                    size="small"
                    label="Needs Review"
                    color="default"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ bgcolor: 'info.50', height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CheckCircleOutline color="info" />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                    Verified
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="medium">
                  {stats?.statusCounts?.Verified || 0}
                </Typography>
                <Box mt={1}>
                  <Chip
                    size="small"
                    label="Awaiting Approval"
                    color="info"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ bgcolor: 'success.50', height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CheckCircleOutline color="success" />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                    Approved
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="medium">
                  {stats?.statusCounts?.Approved || 0}
                </Typography>
                <Box mt={1}>
                  <Chip
                    size="small"
                    label="Ready for Payment"
                    color="success"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ bgcolor: 'primary.50', height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Paid color="primary" />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                    Paid
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="medium">
                  {stats?.statusCounts?.Paid || 0}
                </Typography>
                <Box mt={1}>
                  <Chip
                    size="small"
                    label="Disbursed"
                    color="primary"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ bgcolor: 'error.50', height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Cancel color="error" />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                    Rejected
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="medium">
                  {stats?.statusCounts?.Rejected || 0}
                </Typography>
                <Box mt={1}>
                  <Chip
                    size="small"
                    label="Needs Correction"
                    color="error"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body2" color="textSecondary">
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => navigate('/admin-dashboard/salary/list?status=Draft')}
              >
                Review Drafts
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="success"
                size="small"
                onClick={() => navigate('/admin-dashboard/salary/list?status=Approved')}
              >
                Process Payments
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => navigate('/admin-dashboard/salary/list?status=Rejected')}
              >
                Fix Rejected
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      <Paper elevation={0} sx={{ p: 3, mt: 3, border: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Salary Calculation Formula
        </Typography>
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom color="primary.main">
            Net Salary = (Total Salary - Deductions) - Attendance Adjustment
          </Typography>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'medium' }}>
                  Total Salary = Basic Pay + Allowances
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'medium' }}>
                  Deductions = PF + ESI + PT + TDS + Others
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'medium' }}>
                  Attendance Adjustment = (Total Days - Credits) * (Total Salary ÷ 30)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Typography variant="body2" color="textSecondary">
          The attendance adjustment may be positive (deduction) or negative (addition) based on the employee's attendance.
          When an employee has worked extra days (Credits &gt; Total Days), they receive a bonus in their salary.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminSalaryDashboard;