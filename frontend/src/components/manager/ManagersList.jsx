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
  Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon 
} from '@mui/icons-material';
import axios from 'axios';
import config from "../../config";

const ManagersList = () => {
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/manager`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setManagers(response.data.managers);
      } catch (error) {
        setError('Failed to fetch managers.');
      }
    };
    fetchManagers();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id) => {
    navigate(`/admin-dashboard/managers/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/admin-dashboard/manager/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this manager?")) {
      try {
        await axios.delete(`${config.API_URL}/api/manager/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setManagers((prev) => prev.filter((manager) => manager._id !== id));
      } catch (error) {
        setError('Failed to delete manager.');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Managers List
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin-dashboard/add-manager")}
          >
            Add Manager
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {managers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((manager) => (
                  <TableRow key={manager._id}>
                    <TableCell>{manager.userId.name}</TableCell>
                    <TableCell>{manager.department?.dep_name || "N/A"}</TableCell>
                    <TableCell>{manager.designation || "N/A"}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleView(manager._id)}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(manager._id)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(manager._id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={managers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default ManagersList;