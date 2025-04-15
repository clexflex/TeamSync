import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  ArrowBack,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  CreditCard as PaymentIcon,
  Description as PayslipIcon,
  DownloadOutlined as DownloadIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const SalaryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const actionParam = queryParams.get('action');

  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [convertToDraftDialogOpen, setConvertToDraftDialogOpen] = useState(false);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({
    basicSalary: 0,
    allowances: {},
    deductions: {},
    comments: ''
  });

  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [pendingDatesOpen, setPendingDatesOpen] = useState(false);
  const [pendingDates, setPendingDates] = useState([]);
  const [paymentData, setPaymentData] = useState({
    transactionId: '',
    paymentDate: '',
    paymentMethod: 'Bank Transfer',
    comments: ''
  });
  const [comments, setComments] = useState('');

  // Download state
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [payslipLoading, setPayslipLoading] = useState(false);
  const [regenerateLoading, setRegenerateLoading] = useState(false);

  useEffect(() => {
    fetchSalaryDetails();

    // Handle action parameter
    if (actionParam) {
      switch (actionParam) {
        case 'approve':
          setTimeout(() => setApproveDialogOpen(true), 500);
          break;
        case 'reject':
          setTimeout(() => setRejectDialogOpen(true), 500);
          break;
        case 'pay':
          setTimeout(() => setPaymentDialogOpen(true), 500);
          break;
        case 'edit':
          setTimeout(() => handleEditMode(), 500);
          break;
        case 'regenerate':
          setTimeout(() => setRegenerateDialogOpen(true), 500);
          break;
        case 'payslip':
          setTimeout(() => handleGeneratePayslip(), 500);
          break;
        default:
          break;
      }
    }
  }, [id, actionParam]);

  const fetchSalaryDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${config.API_URL}/api/salary/detail/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSalaryData(response.data);

        // Initialize edit form data
        setEditedData({
          basicSalary: response.data.salary.basicSalary,
          allowances: { ...response.data.salary.allowances },
          deductions: { ...response.data.salary.deductions },
          comments: ''
        });

        // Set default payment date to today
        setPaymentData({
          ...paymentData,
          paymentDate: new Date().toISOString().split('T')[0]
        });
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
  const handleConvertToDraft = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setConvertToDraftDialogOpen(false);

      const response = await axios.post(
        `${config.API_URL}/api/salary/${id}/convert-to-draft`,
        { comments },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Salary record converted to draft successfully');
        setSalaryData(prev => ({
          ...prev,
          salary: response.data.salary
        }));
        setComments('');
      } else {
        setError('Failed to convert salary record to draft');
      }
    } catch (error) {
      console.error('Error converting salary to draft:', error);
      setError(error.response?.data?.error || 'An error occurred while converting salary to draft');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMode = () => {
    setEditMode(true);
    setEditedData({
      basicSalary: salaryData.salary.basicSalary,
      allowances: { ...salaryData.salary.allowances },
      deductions: { ...salaryData.salary.deductions },
      comments: ''
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleInputChange = (e, category, field) => {
    const { value } = e.target;

    if (category) {
      setEditedData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: parseFloat(value) || 0
        }
      }));
    } else {
      setEditedData(prev => ({
        ...prev,
        [field]: field === 'comments' ? value : (parseFloat(value) || 0)
      }));
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await axios.put(
        `${config.API_URL}/api/salary/${id}`,
        {
          basicSalary: editedData.basicSalary,
          allowances: editedData.allowances,
          deductions: editedData.deductions,
          comments: editedData.comments
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Salary record updated successfully');
        setSalaryData(prev => ({
          ...prev,
          salary: response.data.salary
        }));
        setEditMode(false);
      } else {
        setError('Failed to update salary record');
      }
    } catch (error) {
      console.error('Error updating salary record:', error);
      setError(error.response?.data?.error || 'An error occurred while updating salary record');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setApproveDialogOpen(false);

      const response = await axios.post(
        `${config.API_URL}/api/salary/${id}/approve`,
        { comments },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Salary record approved successfully');
        setSalaryData(prev => ({
          ...prev,
          salary: response.data.salary
        }));
        setComments('');
      } else {
        setError('Failed to approve salary record');
      }
    } catch (error) {
      console.error('Error approving salary record:', error);
      setError(error.response?.data?.error || 'An error occurred while approving salary record');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      if (!comments.trim()) {
        setError('Comments are required for rejection');
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);
      setRejectDialogOpen(false);

      const response = await axios.post(
        `${config.API_URL}/api/salary/${id}/reject`,
        { comments },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Salary record rejected successfully');
        setSalaryData(prev => ({
          ...prev,
          salary: response.data.salary
        }));
        setComments('');
      } else {
        setError('Failed to reject salary record');
      }
    } catch (error) {
      console.error('Error rejecting salary record:', error);
      setError(error.response?.data?.error || 'An error occurred while rejecting salary record');
    } finally {
      setLoading(false);
    }
  };

  // New function to handle regeneration of salary draft
  const handleRegenerateSalary = async () => {
    try {
      setRegenerateLoading(true);
      setError(null);
      setSuccess(null);
      setRegenerateDialogOpen(false);

      const response = await axios.post(
        `${config.API_URL}/api/salary/${id}/regenerate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Salary draft regenerated successfully with latest attendance data');
        // Refresh salary data
        fetchSalaryDetails();
      } else {
        setError('Failed to regenerate salary draft');
      }
    } catch (error) {
      console.error('Error regenerating salary draft:', error);

      // Handle specific case of pending attendance records
      if (error.response?.data?.error?.includes('pending approval')) {
        if (error.response.data.pendingDates) {
          setPendingDates(error.response.data.pendingDates);
          setPendingDatesOpen(true);
        }
        setError('Cannot regenerate salary draft while attendance records are pending approval');
      } else {
        setError(error.response?.data?.error || 'An error occurred while regenerating salary draft');
      }
    } finally {
      setRegenerateLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      if (!paymentData.transactionId || !paymentData.paymentMethod) {
        setError('Transaction ID and payment method are required');
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);
      setPaymentDialogOpen(false);

      const response = await axios.post(
        `${config.API_URL}/api/salary/${id}/pay`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Salary record marked as paid successfully');
        setSalaryData(prev => ({
          ...prev,
          salary: response.data.salary
        }));
      } else {
        setError('Failed to mark salary record as paid');
      }
    } catch (error) {
      console.error('Error marking salary as paid:', error);
      setError(error.response?.data?.error || 'An error occurred while marking salary as paid');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslip = async () => {
    try {
      setPayslipLoading(true);
      setError(null);
      setSuccess(null);

      const response = await axios.post(
        `${config.API_URL}/api/salary/${id}/payslip`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Payslip generated successfully');
        // Refresh salary data to get updated payslip URL
        fetchSalaryDetails();
      } else {
        setError('Failed to generate payslip');
      }
    } catch (error) {
      console.error('Error generating payslip:', error);
      setError(error.response?.data?.error || 'An error occurred while generating payslip');
    } finally {
      setPayslipLoading(false);
    }
  };

  const handleDownloadPayslip = async () => {
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
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const StatusStepper = () => {
    const getStatusStep = (status) => {
      switch (status) {
        case 'Draft': return 0;
        case 'Verified': return 1;
        case 'Approved': return 2;
        case 'Paid': return 3;
        case 'Rejected': return -1;
        default: return 0;
      }
    };

    const steps = [
      'Draft',
      'Verified',
      'Approved',
      'Paid'
    ];

    const activeStep = getStatusStep(salaryData?.salary?.status);

    return (
      <Stepper activeStep={activeStep} alternativeLabel sx={{ my: 3 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              error={salaryData?.salary?.status === 'Rejected' && index === 0}
              optional={
                index === 0 && salaryData?.salary?.status === 'Rejected' ? (
                  <Typography variant="caption" color="error">
                    Rejected
                  </Typography>
                ) : null
              }
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    );
  };

  if (loading && !salaryData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !salaryData) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin-dashboard/salary/list')}
        >
          Back to Salary List
        </Button>
      </Box>
    );
  }

  if (!salaryData) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Salary record not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin-dashboard/salary/list')}
          sx={{ mt: 2 }}
        >
          Back to Salary List
        </Button>
      </Box>
    );
  }

  const { salary, employee, manager, departmentInfo, userProfile } = salaryData;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin-dashboard/salary/list')}
        >
          Back to Salary List
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {salary.payslipGenerated ? (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPayslip}
              disabled={downloadLoading}
            >
              {downloadLoading ? 'Downloading...' : 'Download Payslip'}
            </Button>
          ) : (
            (salary.status === 'Approved' || salary.status === 'Paid') && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<PayslipIcon />}
                onClick={handleGeneratePayslip}
                disabled={payslipLoading}
              >
                {payslipLoading ? 'Generating...' : 'Generate Payslip'}
              </Button>
            )
          )}

          {salary.status === 'Draft' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => setApproveDialogOpen(true)}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => setRejectDialogOpen(true)}
              >
                Reject
              </Button>
            </>
          )}

          {salary.status === 'Approved' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PaymentIcon />}
              onClick={() => setPaymentDialogOpen(true)}
            >
              Mark as Paid
            </Button>
          )}
          {salary.status === 'Rejected' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={() => setConvertToDraftDialogOpen(true)}
            >
              Convert to Draft
            </Button>
          )}

          {/* Regenerate Button - Only available for Draft or Rejected status */}
          {(salary.status === 'Draft' || salary.status === 'Rejected') && !editMode && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={() => setRegenerateDialogOpen(true)}
              disabled={regenerateLoading}
            >
              {regenerateLoading ? 'Regenerating...' : 'Regenerate'}
            </Button>
          )}

          {(salary.status === 'Draft' || salary.status === 'Rejected') && !editMode && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditMode}
            >
              Edit
            </Button>
          )}

          {editMode && (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveChanges}
                disabled={loading}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Box>

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

      {/* Salary Status */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Salary Record - {salary.payPeriod}
          </Typography>
          {getStatusChip(salary.status)}
        </Box>

        <StatusStepper />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Employee Name
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {salary.userId.name}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Department
            </Typography>
            <Typography variant="body1">
              {departmentInfo?.dep_name || 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Employee ID
            </Typography>
            <Typography variant="body1">
              {employee?.employeeId || manager?.managerId || 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Role
            </Typography>
            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
              {salary.userId.role}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Pay Period
            </Typography>
            <Typography variant="body1">
              {salary.payPeriod}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Period Dates
            </Typography>
            <Typography variant="body1">
              {formatDate(salary.periodStart)} to {formatDate(salary.periodEnd)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Total Days
            </Typography>
            <Typography variant="body1">
              {salary.totalDays} days
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Net Salary
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="primary.main">
              {formatCurrency(salary.netSalary)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>


      {/* Attendance Summary */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Attendance Summary
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Working Days</TableCell>
                    <TableCell align="right">{salary.totalWorkingDays}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Weekly Offs</TableCell>
                    <TableCell align="right">{salary.totalWeeklyOffs}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Holidays</TableCell>
                    <TableCell align="right">{salary.totalHolidays}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Days</TableCell>
                    <TableCell align="right">{salary.totalDays}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={6}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Attendance Type</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Present Days</TableCell>
                    <TableCell align="right">{salary.presentDays}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Absent Days</TableCell>
                    <TableCell align="right">{salary.absentDays}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Leave Days (Paid)</TableCell>
                    <TableCell align="right">{salary.paidLeaveDays}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Extra Work Days</TableCell>
                    <TableCell align="right">{salary.extraWorkDays}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                mt: 2,
                bgcolor: 'info.50',
                border: '1px solid',
                borderColor: 'info.light',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="subtitle1">
                Total Credits
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {salary.totalCredits.toFixed(1)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Salary Breakdown */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Salary Breakdown
        </Typography>

        <Grid container spacing={4}>
          {/* Earnings */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom color="success.main">
              Earnings
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Component</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    {editMode && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Basic Salary</TableCell>
                    <TableCell align="right">
                      {editMode ? (
                        <TextField
                          type="number"
                          value={editedData.basicSalary}
                          onChange={(e) => handleInputChange(e, null, 'basicSalary')}
                          variant="standard"
                          sx={{ width: 100 }}
                          InputProps={{
                            startAdornment: <Typography variant="body2">₹</Typography>
                          }}
                        />
                      ) : (
                        formatCurrency(salary.basicSalary)
                      )}
                    </TableCell>
                    {editMode && <TableCell align="right"></TableCell>}
                  </TableRow>

                  {Object.entries(editMode ? editedData.allowances : salary.allowances).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{key === 'DA' ? 'Dearness Allowance' :
                        key === 'HRA' ? 'House Rent Allowance' :
                          key.charAt(0).toUpperCase() + key.slice(1)} Allowance</TableCell>
                      <TableCell align="right">
                        {editMode ? (
                          <TextField
                            type="number"
                            value={value}
                            onChange={(e) => handleInputChange(e, 'allowances', key)}
                            variant="standard"
                            sx={{ width: 100 }}
                            InputProps={{
                              startAdornment: <Typography variant="body2">₹</Typography>
                            }}
                          />
                        ) : (
                          formatCurrency(value)
                        )}
                      </TableCell>
                      {editMode && <TableCell align="right"></TableCell>}
                    </TableRow>
                  ))}

                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Earnings</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(salary.grossSalary)}
                    </TableCell>
                    {editMode && <TableCell align="right"></TableCell>}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Deductions */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom color="error.main">
              Deductions
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Component</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    {editMode && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(editMode ? editedData.deductions : salary.deductions).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{key === 'PF' ? 'Provident Fund' :
                        key === 'ESI' ? 'Employee State Insurance' :
                          key === 'PT' ? 'Professional Tax' :
                            key === 'TDS' ? 'Tax Deducted at Source' :
                              key === 'MLWF' ? 'Maharashtra Labor Welfare Fund' :
                                key.charAt(0).toUpperCase() + key.slice(1)}</TableCell>
                      <TableCell align="right">
                        {editMode ? (
                          <TextField
                            type="number"
                            value={value}
                            onChange={(e) => handleInputChange(e, 'deductions', key)}
                            variant="standard"
                            sx={{ width: 100 }}
                            InputProps={{
                              startAdornment: <Typography variant="body2">₹</Typography>
                            }}
                          />
                        ) : (
                          formatCurrency(value)
                        )}
                      </TableCell>
                      {editMode && <TableCell align="right"></TableCell>}
                    </TableRow>
                  ))}

                  <TableRow>
                    <TableCell>Attendance Adjustment</TableCell>
                    <TableCell align="right">
                      {formatCurrency(salary.attendanceAdjustment)}
                    </TableCell>
                    {editMode && <TableCell align="right"></TableCell>}
                  </TableRow>

                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Deductions</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(salary.totalDeductions + salary.attendanceAdjustment)}
                    </TableCell>
                    {editMode && <TableCell align="right"></TableCell>}
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
            {formatCurrency(salary.netSalary)}
          </Typography>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Salary Calculation Breakdown
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" fontWeight="medium">Formula: Net Salary = (Total Salary - Deductions) - Attendance Adjustment</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">Total Salary (Basic + Allowances):</Typography>
                <Typography variant="body1">{formatCurrency(salaryData.salary.grossSalary)}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">Total Deductions:</Typography>
                <Typography variant="body1">{formatCurrency(salaryData.salary.totalDeductions)}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">Base Pay (Total Salary - Deductions):</Typography>
                <Typography variant="body1">{formatCurrency(salaryData.salary.grossSalary - salaryData.salary.totalDeductions)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">Attendance Adjustment Calculation:</Typography>
                <Typography variant="body1">
                  ({salaryData.salary.totalDays} days - {salaryData.salary.totalCredits.toFixed(1)} credits) × ({formatCurrency(salaryData.salary.grossSalary)} ÷ 30)
                  = {formatCurrency(salaryData.salary.attendanceAdjustment)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">Final Net Salary:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  ({formatCurrency(salaryData.salary.grossSalary - salaryData.salary.totalDeductions)}) - ({formatCurrency(salaryData.salary.attendanceAdjustment)})
                  = {formatCurrency(salaryData.salary.netSalary)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        {editMode && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Edit Comments
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add comments about the changes being made"
              value={editedData.comments}
              onChange={(e) => handleInputChange(e, null, 'comments')}
              variant="outlined"
            />
          </Box>
        )}
      </Paper>

      {/* Audit Log */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HistoryIcon sx={{ mr: 1 }} color="action" />
          <Typography variant="h6">
            Audit Log
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salary.auditLog.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                  <TableCell>{log.userId?.name || 'System'}</TableCell>
                  <TableCell>{log.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Regenerate Confirmation Dialog */}
      <Dialog
        open={regenerateDialogOpen}
        onClose={() => setRegenerateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <RefreshIcon color="secondary" />
          Regenerate Salary Draft
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This will recalculate the salary based on the latest attendance and leave data. Any manual edits made to this salary record will be lost.
          </DialogContentText>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="medium">
              This action will:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
              <li>Update all attendance metrics (days present, absent, leaves, etc.)</li>
              <li>Reset salary components to values from user profile</li>
              <li>Recalculate all credits, adjustments, and final salary</li>
            </Box>
          </Alert>

          <Typography variant="body2" color="text.secondary">
            Are you sure you want to regenerate this salary draft?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setRegenerateDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRegenerateSalary}
            variant="contained"
            color="secondary"
            startIcon={<RefreshIcon />}
            disabled={regenerateLoading}
          >
            {regenerateLoading ?
              <CircularProgress size={24} color="inherit" /> :
              'Regenerate Salary'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pending Attendance Dates Dialog */}
      <Dialog
        open={pendingDatesOpen}
        onClose={() => setPendingDatesOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Pending Attendance Records
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            The following dates have attendance records pending approval. Please approve or reject these records before regenerating the salary draft.
          </DialogContentText>

          {pendingDates.length > 0 ? (
            <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              {pendingDates.map((date, index) => (
                <ListItem key={index} divider={index < pendingDates.length - 1}>
                  <ListItemText
                    primary={formatDate(date)}
                    secondary={new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">
              No specific dates available. Please check attendance records.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => navigate('/admin-dashboard/attendance-approval')}
            color="primary"
            variant="contained"
          >
            Go to Attendance Approval
          </Button>
          <Button onClick={() => setPendingDatesOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
      >
        <DialogTitle>Approve Salary</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this salary record for {salary.userId.name} for the period {salary.payPeriod}?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Comments (Optional)"
            fullWidth
            variant="outlined"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApprove} variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
      >
        <DialogTitle>Reject Salary</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject this salary record for {salary.userId.name} for the period {salary.payPeriod}?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection (Required)"
            fullWidth
            variant="outlined"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
            required
            error={!comments.trim()}
            helperText={!comments.trim() ? "Reason is required for rejection" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={!comments.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={convertToDraftDialogOpen}
        onClose={() => setConvertToDraftDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Convert to Draft</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will change the status of this rejected salary record back to "Draft" status, allowing it to be approved again. Please add any comments explaining the conversion.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Comments (Optional)"
            fullWidth
            variant="outlined"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConvertToDraftDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConvertToDraft}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Convert to Draft'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mark Salary as Paid</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Record payment details for {salary.userId.name}'s salary for {salary.payPeriod}.
          </DialogContentText>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                required
                label="Transaction ID"
                fullWidth
                value={paymentData.transactionId}
                onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                margin="dense"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Payment Date"
                type="date"
                fullWidth
                value={paymentData.paymentDate}
                onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                margin="dense"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  label="Payment Method"
                >
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Check">Check</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Online Payment">Online Payment</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Comments (Optional)"
                fullWidth
                multiline
                rows={3}
                value={paymentData.comments}
                onChange={(e) => setPaymentData({ ...paymentData, comments: e.target.value })}
                margin="dense"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleMarkAsPaid}
            variant="contained"
            color="primary"
            disabled={!paymentData.transactionId || !paymentData.paymentMethod}
          >
            Mark as Paid
          </Button>
        </DialogActions>
      </Dialog>



    </Box>
  );
};

export default SalaryDetail;