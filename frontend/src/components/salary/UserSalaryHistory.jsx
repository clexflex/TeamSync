import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  AttachMoney,
  CalendarMonth,
  CloudDownload as DownloadIcon,
  Visibility as ViewIcon,
  ReceiptLong as ReceiptIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/authContext';

const UserSalaryHistory = () => {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchSalaryHistory();
    }
  }, [user]);

  const fetchSalaryHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${config.API_URL}/api/salary/history/${user._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSalaries(response.data.salaries);
      } else {
        setError('Failed to fetch salary history');
      }
    } catch (error) {
      console.error('Error fetching salary history:', error);
      setError(error.response?.data?.error || 'An error occurred while fetching salary history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${config.API_URL}/api/salary/detail/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSelectedSalary(response.data);
        setDetailDialogOpen(true);
      } else {
        setError('Failed to fetch salary details');
      }
    } catch (error) {
      console.error('Error fetching salary details:', error);
      setError(error.response?.data?.error || 'An error occurred while fetching salary details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedSalary(null);
  };

  const handleDownloadPayslip = async (id) => {
    try {
      setDownloadLoading(true);
  
      // Direct to the API endpoint that will provide a fresh signed URL
      window.location.href = `${config.API_URL}/api/salary/payslip/${id}`;
    } catch (error) {
      console.error('Error downloading payslip:', error);
      setError('Failed to download payslip');
    } finally {
      setDownloadLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return `₹ ${parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getStatusChip = (status) => {
    let color = 'default';

    switch (status) {
      case 'Draft':
        color = 'default';
        break;
      case 'Verified':
        color = 'info';
        break;
      case 'Approved':
        color = 'success';
        break;
      case 'Rejected':
        color = 'error';
        break;
      case 'Paid':
        color = 'primary';
        break;
      default:
        color = 'default';
    }

    return (
      <Chip
        label={status}
        color={color}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  if (loading && salaries.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        My Salary History
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: 'primary.light',
                    borderRadius: 1,
                    p: 1,
                    display: 'flex',
                    mr: 2
                  }}
                >
                  <AttachMoney color="primary" />
                </Box>
                <Typography variant="h6">
                  Latest Salary
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {salaries.length > 0 ? formatCurrency(salaries[0].netSalary) : 'N/A'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {salaries.length > 0 ? salaries[0].payPeriod : 'No salary records found'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: 'success.light',
                    borderRadius: 1,
                    p: 1,
                    display: 'flex',
                    mr: 2
                  }}
                >
                  <CalendarMonth color="success" />
                </Box>
                <Typography variant="h6">
                  Total Received
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(
                  salaries
                    .filter(salary => salary.status === 'Paid')
                    .reduce((sum, salary) => sum + salary.netSalary, 0)
                )}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {salaries.filter(salary => salary.status === 'Paid').length} salary payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: 'info.light',
                    borderRadius: 1,
                    p: 1,
                    display: 'flex',
                    mr: 2
                  }}
                >
                  <ReceiptIcon color="info" />
                </Box>
                <Typography variant="h6">
                  Payslips Available
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {salaries.filter(salary => salary.payslipGenerated).length}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Out of {salaries.length} salary records
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Salary History Table */}
      {salaries.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No salary records found.</Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pay Period</TableCell>
                  <TableCell>Period Dates</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Working Days</TableCell>
                  <TableCell>Credits</TableCell>
                  <TableCell align="right">Net Salary</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salaries.map((salary) => (
                  <TableRow key={salary._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {salary.payPeriod}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatDate(salary.periodStart)} to {formatDate(salary.periodEnd)}
                    </TableCell>
                    <TableCell>
                      {getStatusChip(salary.status)}
                    </TableCell>
                    <TableCell>
                      {salary.totalWorkingDays} / {salary.totalDays}
                    </TableCell>
                    <TableCell>
                      {salary.totalCredits.toFixed(1)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(salary.netSalary)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetail(salary._id)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {salary.payslipGenerated && (
                          <Tooltip title="Download Payslip">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleDownloadPayslip(salary._id)}
                              disabled={downloadLoading}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Salary Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Salary Details - {selectedSalary?.salary.payPeriod}
          </Typography>
          <IconButton onClick={handleCloseDetail} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedSalary && (
            <>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Period: {formatDate(selectedSalary.salary.periodStart)} to {formatDate(selectedSalary.salary.periodEnd)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: {getStatusChip(selectedSalary.salary.status)}
                  </Typography>
                </Box>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  {formatCurrency(selectedSalary.salary.netSalary)}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Attendance Summary */}
              <Typography variant="h6" gutterBottom>
                Attendance Summary
              </Typography>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Working Days</TableCell>
                          <TableCell align="right">{selectedSalary.salary.totalWorkingDays}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Weekly Offs</TableCell>
                          <TableCell align="right">{selectedSalary.salary.totalWeeklyOffs}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Holidays</TableCell>
                          <TableCell align="right">{selectedSalary.salary.totalHolidays}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Days</TableCell>
                          <TableCell align="right">{selectedSalary.salary.totalDays}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Present Days</TableCell>
                          <TableCell align="right">{selectedSalary.salary.presentDays}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Absent Days</TableCell>
                          <TableCell align="right">{selectedSalary.salary.absentDays}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Paid Leave Days</TableCell>
                          <TableCell align="right">{selectedSalary.salary.paidLeaveDays}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Credits</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {selectedSalary.salary.totalCredits.toFixed(1)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* Salary Breakdown */}
              <Typography variant="h6" gutterBottom>
                Salary Breakdown
              </Typography>

              <Grid container spacing={3}>
                {/* Earnings */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    Earnings
                  </Typography>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Basic Salary</TableCell>
                          <TableCell align="right">{formatCurrency(selectedSalary.salary.basicSalary)}</TableCell>
                        </TableRow>

                        {Object.entries(selectedSalary.salary.allowances).map(([key, value]) =>
                          value > 0 && (
                            <TableRow key={key}>
                              <TableCell>
                                {key === 'DA' ? 'Dearness Allowance' :
                                  key === 'HRA' ? 'House Rent Allowance' :
                                    key.charAt(0).toUpperCase() + key.slice(1)} Allowance
                              </TableCell>
                              <TableCell align="right">{formatCurrency(value)}</TableCell>
                            </TableRow>
                          )
                        )}

                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total Earnings</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(selectedSalary.salary.grossSalary)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* Deductions */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="error.main" gutterBottom>
                    Deductions
                  </Typography>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        {Object.entries(selectedSalary.salary.deductions).map(([key, value]) =>
                          value > 0 && (
                            <TableRow key={key}>
                              <TableCell>
                                {key === 'PF' ? 'Provident Fund' :
                                  key === 'ESI' ? 'Employee State Insurance' :
                                    key === 'PT' ? 'Professional Tax' :
                                      key === 'TDS' ? 'Tax Deducted at Source' :
                                        key === 'MLWF' ? 'Maharashtra Labor Welfare Fund' :
                                          key.charAt(0).toUpperCase() + key.slice(1)}
                              </TableCell>
                              <TableCell align="right">{formatCurrency(value)}</TableCell>
                            </TableRow>
                          )
                        )}

                        {selectedSalary.salary.attendanceAdjustment !== 0 && (
                          <TableRow>
                            <TableCell>Attendance Adjustment</TableCell>
                            <TableCell align="right">
                              {formatCurrency(selectedSalary.salary.attendanceAdjustment)}
                            </TableCell>
                          </TableRow>
                        )}

                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total Deductions</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(selectedSalary.salary.totalDeductions + selectedSalary.salary.attendanceAdjustment)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>

              {/* Net Salary */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: 'success.50',
                  border: '1px solid',
                  borderColor: 'success.light',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="h6">
                  Net Salary
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {formatCurrency(selectedSalary.salary.netSalary)}
                </Typography>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom color="primary.main">
                  Net Salary Calculation
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">Total Salary:</Typography>
                      <Typography variant="body1">
                        Basic + Allowances = {formatCurrency(selectedSalary.salary.grossSalary)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">Total Deductions:</Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedSalary.salary.totalDeductions)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">Step 1: Base Pay</Typography>
                      <Typography variant="body1">
                        Total Salary - Deductions = {formatCurrency(selectedSalary.salary.grossSalary - selectedSalary.salary.totalDeductions)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">Step 2: Attendance Adjustment</Typography>
                      <Typography variant="body1">
                        ({selectedSalary.salary.totalDays} days - {selectedSalary.salary.totalCredits.toFixed(1)} credits) × ({formatCurrency(selectedSalary.salary.grossSalary)} ÷ 30) = {formatCurrency(selectedSalary.salary.attendanceAdjustment)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">Step 3: Final Net Salary</Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        (Step 1) - (Step 2) = {formatCurrency(selectedSalary.salary.netSalary)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
              {/* Payment Information */}
              {selectedSalary.salary.status === 'Paid' && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Payment Date
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedSalary.salary.paymentDate)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Payment Method
                        </Typography>
                        <Typography variant="body1">
                          {selectedSalary.salary.paymentMethod}
                        </Typography>
                      </Grid>

                      {selectedSalary.salary.transactionId && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            Transaction ID
                          </Typography>
                          <Typography variant="body1">
                            {selectedSalary.salary.transactionId}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          {selectedSalary?.salary.payslipGenerated && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadPayslip(selectedSalary.salary._id)}
              disabled={downloadLoading}
            >
              Download Payslip
            </Button>
          )}
          <Button onClick={handleCloseDetail}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserSalaryHistory;