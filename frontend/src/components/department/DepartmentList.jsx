import React, { useEffect, useState } from 'react';
import { 
  Box, Paper, Typography, TextField, Button, Table, 
  TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, IconButton, Stack,
  InputAdornment, CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from "../../config";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_URL}/api/department`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        const data = response.data.departments.map((dep, index) => ({
          ...dep,
          sno: index + 1
        }));
        setDepartments(data);
        setFilteredDepartments(data);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        const response = await axios.delete(`${config.API_URL}/api/department/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data.success) {
          fetchDepartments();
        }
      } catch (error) {
        console.error(error);
        if (error.response?.data?.error) {
          alert(error.response.data.error);
        }
      }
    }
  };

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filtered = departments.filter(dep =>
      dep.dep_name.toLowerCase().includes(searchTerm)
    );
    setFilteredDepartments(filtered);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Manage Departments
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin-dashboard/add-department')}
        >
          Add Department
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          placeholder="Search departments..."
          variant="outlined"
          size="small"
          onChange={handleSearch}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  <TableCell>Department Name</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDepartments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((department) => (
                    <TableRow key={department._id} hover>
                      <TableCell>{department.sno}</TableCell>
                      <TableCell>{department.dep_name}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin-dashboard/department/${department._id}`)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(department._id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredDepartments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default DepartmentList;