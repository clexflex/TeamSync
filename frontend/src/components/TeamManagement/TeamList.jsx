import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, CircularProgress, Stack, Chip } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonSearch as PersonSearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/authContext';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useAuth();
  const navigate = useNavigate();
  const getBasePath = (user) => {
    return user.role === "admin" ? "/admin-dashboard" : "/manager-dashboard";
  };

  const basePath = getBasePath(user);

  useEffect(() => {
    fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${config.API_URL}/api/team`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const transformedTeams = response.data.teams.map(team => ({
        ...team,
        managerName: team.managerId?.userId?.name || 'N/A',
        departmentName: team.department?.dep_name || 'N/A',
        memberCount: team.memberCount || 0,
        isTeamManager: user.role === 'manager' && team.managerId?.userId?._id === user._id
      }));

      setTeams(transformedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      await axios.delete(`${config.API_URL}/api/team/${teamId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Team Management
        </Typography>

        {(user.role === 'admin' || user.role === 'manager') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`${basePath}/team/create`)}
          >
            Add New Team
          </Button>
        )}
      </Stack>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team Name</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="center">Members</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((team) => (
                <TableRow key={team._id} hover>
                  <TableCell>
                    <Typography fontWeight="medium">{team.name}</Typography>
                  </TableCell>
                  <TableCell>{team.managerName}</TableCell>
                  <TableCell>{team.departmentName}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={team.memberCount}
                      size="small"
                      color="primary"
                      sx={{ minWidth: 60 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => navigate(`${basePath}/team/members/${team._id}`)}
                      >
                        <PersonSearchIcon />
                      </IconButton>

                      {(user.role === 'admin' || team.isTeamManager) && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => navigate(`${basePath}/team/edit/${team._id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(team._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={teams.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 30, 50]}
      />
    </Paper>
  );
};

export default TeamList;