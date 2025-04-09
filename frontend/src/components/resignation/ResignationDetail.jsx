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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  CheckBox as CheckBoxIcon,
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const ResignationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const actionParam = queryParams.get('action');
  
  const [resignationData, setResignationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [clearanceDialogOpen, setClearanceDialogOpen] = useState(false);
  
  // Form data
  const [adminNotes, setAdminNotes] = useState('');
  const [clearanceItems, setClearanceItems] = useState([]);
  
  useEffect(() => {
    fetchResignationDetails();
    
    // Handle action parameter
    if (actionParam) {
      switch (actionParam) {
        case 'approve':
          setTimeout(() => setApproveDialogOpen(true), 500);
          break;
        case 'reject':
          setTimeout(() => setRejectDialogOpen(true), 500);
          break;
        default:
          break;
      }
    }
  }, [id, actionParam]);
  
  const fetchResignationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${config.API_URL}/api/resignation/detail/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setResignationData(response.data);
        setClearanceItems(response.data.request.clearanceItems);
      } else {
        setError('Failed to fetch resignation details');
      }
    } catch (error) {
      console.error('Error fetching resignation details:', error);
      setError(error.response?.data?.error || 'An error occurred while fetching resignation details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async () => {
    try {
      // Check if all clearance items are completed
      const allCleared = clearanceItems.every(item => item.cleared);
      
      if (!allCleared) {
        setError('All clearance items must be completed before approval');
        setApproveDialogOpen(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      setSuccess(null);
      setApproveDialogOpen(false);
      
      const response = await axios.put(
        `${config.API_URL}/api/resignation/${id}/status`,
        { 
          status: 'Approved',
          adminNotes: adminNotes 
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('Resignation request approved successfully');
        fetchResignationDetails(); // Refresh data
      } else {
        setError('Failed to approve resignation request');
      }
    } catch (error) {
      console.error('Error approving resignation:', error);
      setError(error.response?.data?.error || 'An error occurred while approving resignation request');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    try {
      if (!adminNotes.trim()) {
        setError('Please provide a reason for rejection');
        return;
      }
      
      setLoading(true);
      setError(null);
      setSuccess(null);
      setRejectDialogOpen(false);
      
      const response = await axios.put(
        `${config.API_URL}/api/resignation/${id}/status`,
        { 
          status: 'Rejected',
          adminNotes: adminNotes 
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('Resignation request rejected successfully');
        fetchResignationDetails(); // Refresh data
      } else {
        setError('Failed to reject resignation request');
      }
    } catch (error) {
      console.error('Error rejecting resignation:', error);
      setError(error.response?.data?.error || 'An error occurred while rejecting resignation request');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearanceUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setClearanceDialogOpen(false);
      
      // Prepare clearance items for API
      const updatedItems = clearanceItems.map(item => ({
        id: item._id,
        cleared: item.cleared,
        notes: item.notes || ''
      }));
      
      const response = await axios.put(
        `${config.API_URL}/api/resignation/${id}/clearance`,
        { clearanceItems: updatedItems },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('Clearance items updated successfully');
        fetchResignationDetails(); // Refresh data
      } else {
        setError('Failed to update clearance items');
      }
    } catch (error) {
      console.error('Error updating clearance items:', error);
      setError(error.response?.data?.error || 'An error occurred while updating clearance items');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearanceItemChange = (index, cleared) => {
    const updatedItems = [...clearanceItems];
    updatedItems[index].cleared = cleared;
    setClearanceItems(updatedItems);
  };
  
  const handleClearanceItemNotes = (index, notes) => {
    const updatedItems = [...clearanceItems];
    updatedItems[index].notes = notes;
    setClearanceItems(updatedItems);
  };
  
  const getStatusChip = (status) => {
    let color = 'default';
    
    switch (status) {
      case 'Pending':
        color = 'warning';
        break;
      case 'Approved':
        color = 'success';
        break;
      case 'Rejected':
        color = 'error';
        break;
      case 'Withdrawn':
        color = 'info';
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
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  if (loading && !resignationData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !resignationData) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin-dashboard/resignations/list')}
        >
          Back to Resignation List
        </Button>
      </Box>
    );
  }
  
  if (!resignationData) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Resignation request not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin-dashboard/resignations/list')}
          sx={{ mt: 2 }}
        >
          Back to Resignation List
        </Button>
      </Box>
    );
  }
  
  const { request, employee, manager, departmentInfo, userProfile } = resignationData;
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin-dashboard/resignations/list')}
        >
          Back to Resignation List
        </Button>
        
        {request.status === 'Pending' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
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
          </Box>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      {/* Employee and Resignation Info Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Employee Information
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {request.userId?.name || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Role
                </Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {request.userId?.role || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Department
                </Typography>
                <Typography variant="body1">
                  {departmentInfo?.dep_name || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Employee ID
                </Typography>
                <Typography variant="body1">
                  {employee?.employeeId || manager?.managerId || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {request.userId?.email || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Joining Date
                </Typography>
                <Typography variant="body1">
                  {userProfile?.joiningDate ? formatDate(userProfile.joiningDate) : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AssignmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Resignation Details
              </Typography>
              <Box sx={{ ml: 'auto' }}>
                {getStatusChip(request.status)}
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Submission Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(request.submissionDate)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Last Working Day
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {formatDate(request.lastWorkingDay)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Notice Period
                </Typography>
                <Typography variant="body1">
                  {request.noticePeriod} days
                </Typography>
              </Grid>
              
              {request.processedDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Processed Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(request.processedDate)}
                  </Typography>
                </Grid>
              )}
              
              {request.processedBy && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Processed By
                  </Typography>
                  <Typography variant="body1">
                    {request.processedBy.name || 'N/A'}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Reason for Resignation
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                  {request.reason}
                </Typography>
              </Grid>
              
              {request.adminNotes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Admin Notes
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                    {request.adminNotes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Clearance Items Section */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckBoxIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Clearance Checklist
            </Typography>
          </Box>
          
          {request.status === 'Pending' && (
            <Button
              variant="outlined"
              onClick={() => setClearanceDialogOpen(true)}
            >
              Update Clearance Items
            </Button>
          )}
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {request.clearanceItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%',
                  bgcolor: item.cleared ? 'success.soft' : 'grey.50'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Checkbox 
                      checked={item.cleared}
                      color="success"
                      disabled
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {item.item}
                    </Typography>
                  </Box>
                  
                  {item.cleared && (
                    <>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                          Cleared On
                        </Typography>
                        <Typography variant="body2">
                          {item.clearedDate ? formatDate(item.clearedDate) : 'N/A'}
                        </Typography>
                      </Box>
                      {item.clearedBy && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            Cleared By
                          </Typography>
                          <Typography variant="body2">
                            {item.clearedBy.name || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                  
                  {item.notes && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Notes
                      </Typography>
                      <Typography variant="body2">
                        {item.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Approve Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Resignation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to approve the resignation request for <strong>{request.userId?.name}</strong>. 
            Their account will be deactivated after approval.
          </DialogContentText>
          
          {!clearanceItems.every(item => item.cleared) && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              All clearance items must be completed before approval. Please update the clearance checklist first.
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Notes (Optional)"
            fullWidth
            variant="outlined"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleApprove} 
            variant="contained" 
            color="success"
            disabled={!clearanceItems.every(item => item.cleared) || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
      >
        <DialogTitle>Reject Resignation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to reject the resignation request for <strong>{request.userId?.name}</strong>.
            Please provide a reason for rejection.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection (Required)"
            fullWidth
            variant="outlined"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
            required
            error={!adminNotes.trim()}
            helperText={!adminNotes.trim() ? "Reason is required for rejection" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={!adminNotes.trim() || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Clearance Items Dialog */}
      <Dialog
        open={clearanceDialogOpen}
        onClose={() => setClearanceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Clearance Items</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the status of clearance items for <strong>{request.userId?.name}</strong>'s resignation.
          </DialogContentText>
          
          <List>
            {clearanceItems.map((item, index) => (
              <React.Fragment key={item._id || index}>
                <ListItem>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={item.cleared}
                      onChange={(e) => handleClearanceItemChange(index, e.target.checked)}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.item}
                    secondary={
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder="Add notes (optional)"
                        value={item.notes || ''}
                        onChange={(e) => handleClearanceItemNotes(index, e.target.value)}
                        sx={{ mt: 1 }}
                      />
                    }
                  />
                </ListItem>
                {index < clearanceItems.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearanceDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleClearanceUpdate} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResignationDetail;