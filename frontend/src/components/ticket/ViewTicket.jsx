import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  TextField,
  MenuItem,
  CircularProgress,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  FormControl,
  Select,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Send as SendIcon,
  Attachment as AttachmentIcon,
  Update as UpdateIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Download as DownloadIcon,
  AssignmentInd as AssignmentIndIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/authContext';

const ViewTicket = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const responseRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const [response, setResponse] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Fetch ticket details
  const fetchTicket = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${config.API_URL}/api/tickets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setTicket(response.data.ticket);
        if (response.data.ticket.status) {
          setNewStatus(response.data.ticket.status);
        }
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      setError(error.response?.data?.error || 'Failed to fetch ticket details.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin users for assignment
  const fetchAdmins = async () => {
    if (user.role !== 'admin') return;

    try {
      const response = await axios.get(
        `${config.API_URL}/api/auth/users?role=admin`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setAdmins(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTicket();
    if (user.role === 'admin') {
      fetchAdmins();
    }
  }, [id, user.role]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'info';
      case 'Medium': return 'success';
      case 'High': return 'warning';
      case 'Critical': return 'error';
      default: return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'info';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      case 'Reopened': return 'error';
      default: return 'default';
    }
  };

  // Handle file uploads for responses
  const handleFileChange = (e) => {
    if (e.target.files) {
      if (e.target.files.length > 5) {
        setSubmitError('Maximum 5 files allowed');
        return;
      }

      const selectedFiles = Array.from(e.target.files);

      // Check file sizes (10MB limit per file)
      const oversizedFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setSubmitError('One or more files exceed the 10MB size limit');
        return;
      }

      setUploadedFiles(selectedFiles);
      setSubmitError('');
    }
  };

  // Handle response submission
  const handleSubmitResponse = async (e) => {
    e.preventDefault();

    if (!response.trim()) {
      setSubmitError('Response message is required');
      return;
    }

    setSubmitError('');
    setSubmitSuccess('');

    try {
      const formData = new FormData();
      formData.append('message', response);

      // Add files if any
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const res = await axios.post(
        `${config.API_URL}/api/tickets/${id}/response`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (res.data.success) {
        setTicket(res.data.ticket);
        setResponse('');
        setUploadedFiles([]);
        setSubmitSuccess('Response added successfully');

        // Scroll to the latest response
        setTimeout(() => {
          if (responseRef.current) {
            responseRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setSubmitError(error.response?.data?.error || 'Failed to submit response');
    }
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!newStatus) {
      return;
    }

    try {
      const response = await axios.put(
        `${config.API_URL}/api/tickets/${id}/status`,
        {
          status: newStatus,
          note: statusNote
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setTicket(response.data.ticket);
        setStatusUpdateOpen(false);
        setStatusNote('');
        setSubmitSuccess(`Ticket status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setSubmitError(error.response?.data?.error || 'Failed to update status');
    }
  };

  // Handle ticket assignment
  const handleAssignTicket = async () => {
    if (!selectedAdmin) {
      return;
    }

    try {
      const response = await axios.put(
        `${config.API_URL}/api/tickets/${id}/assign`,
        {
          assignedTo: selectedAdmin
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setTicket(response.data.ticket);
        setAssignDialogOpen(false);
        setSubmitSuccess(response.data.message);
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
      setSubmitError(error.response?.data?.error || 'Failed to assign ticket');
    }
  };

  // Handle ticket deletion
  const handleDeleteTicket = async () => {
    try {
      const response = await axios.delete(
        `${config.API_URL}/api/tickets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setConfirmDeleteOpen(false);
        setSubmitSuccess('Ticket deleted successfully');

        // Redirect after a short delay
        setTimeout(() => {
          navigate('/admin-dashboard/tickets');
        }, 1500);
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setSubmitError(error.response?.data?.error || 'Failed to delete ticket');
      setConfirmDeleteOpen(false);
    }
  };

  // Download attachment
  const handleDownloadAttachment = (attachment) => {
    if (attachment && attachment.url) {
      window.open(attachment.url, '_blank');
    } else {
      setSubmitError('Download link not available');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/${user.role}-dashboard/tickets`)}
        >
          Back to Tickets
        </Button>
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="warning">Ticket not found</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/${user.role}-dashboard/tickets`)}
          sx={{ mt: 2 }}
        >
          Back to Tickets
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/${user.role}-dashboard/tickets`)}
        >
          Back to Tickets
        </Button>

        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTicket}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>

          {user.role === 'admin' && (
            <>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AssignmentIndIcon />}
                onClick={() => setAssignDialogOpen(true)}
                sx={{ mr: 2 }}
              >
                Assign
              </Button>

              <Button
                variant="outlined"
                color="warning"
                startIcon={<UpdateIcon />}
                onClick={() => setStatusUpdateOpen(true)}
                sx={{ mr: 2 }}
              >
                Update Status
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmDeleteOpen(true)}
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError('')}>
          {submitError}
        </Alert>
      )}

      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSubmitSuccess('')}>
          {submitSuccess}
        </Alert>
      )}

      {/* Ticket details card */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h1" gutterBottom>
              {ticket.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={ticket.status}
                color={getStatusColor(ticket.status)}
              />
              <Chip
                label={ticket.priority}
                color={getPriorityColor(ticket.priority)}
              />
              <Chip
                label={ticket.type}
                variant="outlined"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Submitted By
            </Typography>
            <Typography variant="body1" gutterBottom>
              {ticket.userId?.name} ({ticket.userId?.role})
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Created At
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(ticket.createdAt)}
            </Typography>

            {ticket.resolvedAt && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Resolved At
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(ticket.resolvedAt)}
                </Typography>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Assigned To
            </Typography>
            <Typography variant="body1" gutterBottom>
              {ticket.assignedTo ?
                `${ticket.assignedTo.name} (${ticket.assignedTo.email})` :
                'Not assigned'
              }
            </Typography>

            {ticket.dueDate && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Due Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(ticket.dueDate)}
                </Typography>
              </>
            )}

            {ticket.closedAt && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Closed At
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(ticket.closedAt)}
                </Typography>
              </>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {ticket.description}
            </Typography>
          </Grid>

          {ticket.attachments && ticket.attachments.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Attachments
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ticket.attachments.map((attachment, index) => (
                  <Chip
                    key={index}
                    icon={<AttachmentIcon />}
                    label={attachment.filename || `Attachment ${index + 1}`}
                    onClick={() => handleDownloadAttachment(attachment)}
                    variant="outlined"
                    clickable
                  />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Ticket responses */}
      <Typography variant="h6" gutterBottom>
        Responses ({ticket.responses?.length || 0})
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        {ticket.responses && ticket.responses.length > 0 ? (
          <List>
            {ticket.responses.map((resp, index) => (
              <React.Fragment key={index}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: resp.userId._id === user._id ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
                    borderRadius: 1,
                    mb: 2
                  }}
                  ref={index === ticket.responses.length - 1 ? responseRef : null}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: resp.userId.role === 'admin' ? 'primary.main' : 'success.main' }}>
                      {resp.userId.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1">
                          {resp.userId.name}
                          <Chip
                            size="small"
                            label={resp.userId.role}
                            sx={{ ml: 1, fontSize: '0.7rem' }}
                            color={resp.userId.role === 'admin' ? 'primary' : 'success'}
                          />
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(resp.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{
                            display: 'inline',
                            whiteSpace: 'pre-line'
                          }}
                        >
                          {resp.message}
                        </Typography>

                        {resp.attachments && resp.attachments.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Attachments:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                              {resp.attachments.map((attachment, idx) => (
                                <Chip
                                  key={idx}
                                  size="small"
                                  icon={<AttachmentIcon />}
                                  label={attachment.filename || `Attachment ${idx + 1}`}
                                  onClick={() => handleDownloadAttachment(attachment)}
                                  variant="outlined"
                                  clickable
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < ticket.responses.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No responses yet</Typography>
          </Box>
        )}
      </Paper>

      {/* Reply form */}
      {!['Closed'].includes(ticket.status) && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add Response
          </Typography>
          <form onSubmit={handleSubmitResponse}>
            <TextField
              label="Your response"
              multiline
              rows={4}
              fullWidth
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              sx={{ mb: 2 }}
              required
            />

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachmentIcon />}
                  fullWidth
                >
                  {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) selected` : 'Attach Files'}
                  <input
                    type="file"
                    multiple
                    hidden
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                </Button>
                {uploadedFiles.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Max 5 files, 10MB each
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendIcon />}
                  fullWidth
                >
                  Send Response
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onClose={() => setStatusUpdateOpen(false)}>
        <DialogTitle>Update Ticket Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
              <MenuItem value="Reopened">Reopened</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Add a note (optional)"
            multiline
            rows={3}
            fullWidth
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Ticket Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Assign Ticket</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={selectedAdmin}
              label="Assign To"
              onChange={(e) => setSelectedAdmin(e.target.value)}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {admins.map((admin) => (
                <MenuItem key={admin._id} value={admin._id}>
                  {admin.name} ({admin.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignTicket} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Delete Ticket</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this ticket? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteTicket} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewTicket;