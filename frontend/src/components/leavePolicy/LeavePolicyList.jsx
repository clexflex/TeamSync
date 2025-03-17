import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  Alert,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PersonAdd as AssignIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from "../../config";

const LeavePolicyList = () => {
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/leave/policy`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPolicies(response.data.policies);
      setError('');
    } catch (error) {
      setError('Failed to fetch leave policies.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id) => {
    navigate(`/admin-dashboard/leave-policy/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/admin-dashboard/leave-policy/${id}`);
  };

  const handleAssign = (id) => {
    navigate(`/admin-dashboard/leave-policy/assign/${id}`);
  };

  const openDeleteDialog = (policy) => {
    setPolicyToDelete(policy);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPolicyToDelete(null);
  };

  const handleDelete = async () => {
    if (!policyToDelete) return;
    
    try {
      setLoading(true);
      await axios.delete(`${config.API_URL}/api/leave/policy/${policyToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      setPolicies((prev) => prev.filter((policy) => policy._id !== policyToDelete._id));
      setSuccess(`Leave policy "${policyToDelete.name}" deleted successfully.`);
      closeDeleteDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Policy is in use by users
        setError(error.response.data.error || 'Failed to delete leave policy. It may be in use.');
      } else {
        setError('Failed to delete leave policy. Please try again.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Leave Policies
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin-dashboard/leave-policy/create")}
          >
            Create Policy
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Policy Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Leave Types</TableCell>
                <TableCell>Applicable Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {policies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {loading ? "Loading policies..." : "No leave policies found."}
                  </TableCell>
                </TableRow>
              ) : (
                policies
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((policy) => (
                    <TableRow key={policy._id}>
                      <TableCell>{policy.name}</TableCell>
                      <TableCell>{policy.description || "N/A"}</TableCell>
                      <TableCell>
                        {policy.leaveTypes.map((type) => (
                          <Chip
                            key={type._id || type.type}
                            label={`${type.type}: ${type.daysAllowed} days`}
                            size="small"
                            sx={{ m: 0.5 }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        {policy.applicableRoles.map((role) => (
                          <Chip 
                            key={role} 
                            label={role} 
                            size="small" 
                            sx={{ m: 0.5, textTransform: 'capitalize' }} 
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={policy.active ? "Active" : "Inactive"} 
                          color={policy.active ? "success" : "default"}
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleView(policy._id)}
                          size="small"
                          title="View details"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(policy._id)}
                          size="small"
                          title="Edit policy"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleAssign(policy._id)}
                          size="small"
                          title="Assign to users"
                        >
                          <AssignIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => openDeleteDialog(policy)}
                          size="small"
                          title="Delete policy"
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
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
          count={policies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Leave Policy
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the leave policy "{policyToDelete?.name}"? 
            This action cannot be undone. If users are assigned to this policy, the deletion will fail.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeavePolicyList;