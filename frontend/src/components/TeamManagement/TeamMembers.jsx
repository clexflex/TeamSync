import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Select, MenuItem, FormControl, InputLabel, IconButton, Stack, Alert, CircularProgress, Divider, Grid, Chip } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import config from '../../config';

const TeamMembers = () => {
  const { teamId } = useParams();
  const [members, setMembers] = useState([]);
  const [team, setTeam] = useState(null);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useAuth();
  const navigate = useNavigate();
  const getBasePath = (user) => {
    return user.role === "admin" ? "/admin-dashboard" : "/manager-dashboard";
  };

  const basePath = getBasePath(user);

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [teamResponse, membersResponse] = await Promise.all([
        axios.get(`${config.API_URL}/api/team/${teamId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${config.API_URL}/api/team/${teamId}/members`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const teamData = teamResponse.data.team;
      setTeam(teamData);
      setMembers(membersResponse.data.employees);

      if (user.role === 'admin' || user.role === 'manager') {
        const availableResponse = await axios.get(
          `${config.API_URL}/api/employee/department/${teamData.department._id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        const availableEmps = availableResponse.data.employees.filter(
          emp => !emp.teamId || emp.teamId === teamId
        );
        setAvailableEmployees(availableEmps);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch team data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedEmployee) {
      setError('Please select an employee to add');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      await axios.post(
        `${config.API_URL}/api/team/${teamId}/members`,
        { employeeId: selectedEmployee },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setSuccess('Team member added successfully');
      setSelectedEmployee('');
      await fetchTeamData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add team member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return;

    try {
      setIsLoading(true);
      setError('');

      await axios.delete(
        `${config.API_URL}/api/team/${teamId}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setSuccess('Team member removed successfully');
      await fetchTeamData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to remove team member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading && !team) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1}
        onClick={() => navigate(`${basePath}/team`)}
        sx={{
          mb: 4,
          cursor: 'pointer',
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            '& .MuiSvgIcon-root': {
              transform: 'translateX(-4px)'
            }
          }
        }}>
        <ArrowBackIcon sx={{ transition: 'transform 0.2s' }} />
        <Typography>Back to Teams</Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {team?.name}
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Department</Typography>
              <Typography variant="body1" fontWeight="medium">
                {team?.department?.dep_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Manager</Typography>
              <Typography variant="body1" fontWeight="medium">
                {team?.managerId?.userId?.name}
              </Typography>
            </Grid>
            {team?.description && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body1">
                  {team.description}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Messages */}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Add Member Section */}
        {(user.role === 'admin' || user.role === 'manager') && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Add Team Member
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Select Employee</InputLabel>
                <Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  label="Select Employee"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {availableEmployees.map(emp => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {emp.userId?.name} - {emp.employeeId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleAddMember}
                disabled={!selectedEmployee || isLoading}
                sx={{ minWidth: 120, height: { xs: 40, sm: 56 } }}
              >
                {isLoading ? 'Adding...' : 'Add Member'}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Members Table */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Team Members ({members.length})
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  {(user.role === 'admin' || user.role === 'manager') && (
                    <TableCell align="right">Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {members
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((member) => (
                    <TableRow key={member._id} hover>
                      <TableCell>
                        <Chip
                          label={member.employeeId}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{member.userId?.name}</TableCell>
                      <TableCell>{member.userId?.email}</TableCell>
                      <TableCell>{member.department?.dep_name}</TableCell>
                      {(user.role === 'admin' || user.role === 'manager') && (
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveMember(member._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={members.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 30]}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default TeamMembers;