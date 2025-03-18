import React, { useState, useEffect } from 'react';
import {   Box, Paper, Typography, Button, IconButton,    Table, TableBody, TableCell, TableContainer, TableHead,    TableRow, TablePagination, Stack, Alert, FormControlLabel,    Switch, Dialog, DialogActions, DialogContent, DialogContentText,    DialogTitle, Checkbox, Chip, FormControl, InputLabel, Select,    MenuItem, OutlinedInput, ListItemText } from '@mui/material';
import {
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from "../../config";

const LeaveBalanceReset = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [carryForward, setCarryForward] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchUserProfiles();
  }, []);

  const fetchUserProfiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/user-profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      // Make sure we're processing the data correctly
      const profiles = response.data.userProfiles || [];
      
      // Transform the data for easier consumption
      const transformedProfiles = profiles.map(profile => ({
        _id: profile._id,
        userId: profile.user?._id || profile.userId,
        userName: profile.user?.name || "Unknown User",
        joiningDate: profile.joiningDate,
        leavePolicy: {
          _id: profile.leavePolicyId || null,
          name: profile.leavePolicyName || "No policy assigned"
        },
        lastLeaveBalanceReset: profile.lastLeaveBalanceReset,
        leaveBalances: profile.leaveBalances || []
      }));
      
      setUserProfiles(transformedProfiles);
      setError('');
    } catch (error) {
      setError('Failed to fetch user profiles: ' + (error.response?.data?.error || error.message));
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

  // Fixed: Properly handle multiple selection in the dropdown
  const handleUserSelect = (event) => {
    const { value } = event.target;
    
    if (value.includes('all')) {
      // If "all" is selected, select all users
      setSelectedUsers(userProfiles.map(profile => profile.userId));
    } else {
      // Otherwise, use the selected values
      setSelectedUsers(value);
    }
  };

  const handleCarryForwardToggle = () => {
    setCarryForward(!carryForward);
  };

  const openConfirmDialog = () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user to reset leave balances.');
      return;
    }
    setConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  // Fixed: Handle individual row selection
  const handleRowClick = (userId) => {
    const selectedIndex = selectedUsers.indexOf(userId);
    let newSelected = [];
    
    if (selectedIndex === -1) {
      // Add the user ID to the selection
      newSelected = [...selectedUsers, userId];
    } else {
      // Remove the user ID from the selection
      newSelected = selectedUsers.filter(id => id !== userId);
    }
    
    setSelectedUsers(newSelected);
  };

  // Fixed: Properly handle checkbox click in the header
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelectedUsers(userProfiles.map(profile => profile.userId));
    } else {
      setSelectedUsers([]);
    }
  };

  const resetLeaveBalances = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user to reset leave balances.');
      return;
    }
    
    try {
      setLoading(true);
      // Prepare the payload with the proper format
      const payload = {
        carryForward: carryForward,
        resetDate: new Date().toISOString(),
        userIds: selectedUsers // Send the array of user IDs
      };
      
      const response = await axios.post(`${config.API_URL}/api/leave/balance/reset`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      setSuccess(`Leave balances reset successfully for ${response.data.totalReset} users`);
      closeConfirmDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      // Refresh user profiles to show updated balances
      fetchUserProfiles();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reset leave balances.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderUsersList = () => {
    return (
      <TableContainer sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedUsers.length > 0 && selectedUsers.length < userProfiles.length}
                  checked={userProfiles.length > 0 && selectedUsers.length === userProfiles.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Joining Date</TableCell>
              <TableCell>Leave Policy</TableCell>
              <TableCell>Last Reset</TableCell>
              <TableCell>Leave Balances</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {loading ? "Loading users..." : "No user profiles found."}
                </TableCell>
              </TableRow>
            ) : (
              userProfiles
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((profile) => (
                  <TableRow 
                    key={profile._id}
                    hover
                    selected={selectedUsers.includes(profile.userId)}
                    onClick={() => handleRowClick(profile.userId)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.includes(profile.userId)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, profile.userId]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== profile.userId));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{profile.userName}</TableCell>
                    <TableCell>
                      {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {profile.leavePolicy?.name || 'No policy assigned'}
                    </TableCell>
                    <TableCell>
                      {profile.lastLeaveBalanceReset 
                        ? new Date(profile.lastLeaveBalanceReset).toLocaleDateString() 
                        : 'Never reset'}
                    </TableCell>
                    <TableCell>
                      {profile.leaveBalances?.map((balance, index) => (
                        <Chip
                          key={index}
                          size="small"
                          label={`${balance.leaveType}: ${balance.balance} days`}
                          color={balance.balance > 0 ? "primary" : "default"}
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={userProfiles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Leave Balance Reset
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={openConfirmDialog}
            disabled={loading || selectedUsers.length === 0}
          >
            Reset Leave Balances
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

        <Box sx={{ mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={carryForward}
                  onChange={handleCarryForwardToggle}
                  color="primary"
                />
              }
              label="Apply Carry Forward Rules"
            />
          </Stack>
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="user-select-label">Select Users</InputLabel>
            <Select
              labelId="user-select-label"
              multiple
              value={selectedUsers}
              onChange={handleUserSelect}
              input={<OutlinedInput label="Select Users" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.length === 0 && "No Users Selected"}
                  {selected.length > 0 && selected.length === userProfiles.length && "All Users"}
                  {selected.length > 0 && selected.length < userProfiles.length && `${selected.length} Users Selected`}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 48 * 4.5 + 8,
                    width: 250,
                  },
                },
              }}
            >
              <MenuItem value="all">
                <Checkbox checked={selectedUsers.length === userProfiles.length} />
                <ListItemText primary="Select All" />
              </MenuItem>
              {userProfiles.map((profile) => (
                <MenuItem key={profile._id} value={profile.userId}>
                  <Checkbox checked={selectedUsers.includes(profile.userId)} />
                  <ListItemText primary={profile.userName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {renderUsersList()}
      </Paper>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={closeConfirmDialog}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
      >
        <DialogTitle id="reset-dialog-title">
          Reset Leave Balances
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-dialog-description">
            You are about to reset leave balances for {selectedUsers.length > 0 && selectedUsers.length < userProfiles.length 
              ? `${selectedUsers.length} selected users` 
              : "all users"}.
            {carryForward 
              ? " Carry forward rules from leave policies will be applied." 
              : " No carry forward will be applied."}
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="primary" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={resetLeaveBalances} color="primary" variant="contained" disabled={loading}>
            {loading ? "Processing..." : "Reset Balances"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveBalanceReset;