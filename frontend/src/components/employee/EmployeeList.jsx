import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, TextField, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Chip, Avatar, Stack,
  InputAdornment, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Home as LeaveIcon,
  AccountBalance
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${config.API_URL}/api/employee`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          const data = response.data.employees.map((emp, index) => ({
            _id: emp._id,
            sno: index + 1,
            name: emp.userId.name,
            employeeId: emp.employeeId,
            dep_name: emp.department.dep_name,
            status: emp.userId.status,
            profileImage: emp.userId.profileImage
              ? `${config.API_URL}/uploads/${emp.userId.profileImage}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.userId.name)}&background=random`
          }));
          setEmployees(data);
          setFilteredEmployees(data);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filtered = employees.filter((emp) =>
      emp.name.toLowerCase().includes(searchTerm) ||
      emp.employeeId.toLowerCase().includes(searchTerm) ||
      emp.dep_name.toLowerCase().includes(searchTerm)
    );
    setFilteredEmployees(filtered);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const ActionButtons = ({ employee }) => (
    <Stack direction="row" spacing={1}>
      <Tooltip title="View Details">
        <IconButton
          size="small"
          onClick={() => navigate(`/admin-dashboard/employees/${employee._id}`)}
          sx={{ color: 'primary.main' }}
        >
          <ViewIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Edit Employee">
        <IconButton
          size="small"
          onClick={() => navigate(`/admin-dashboard/employees/edit/${employee._id}`)}
          sx={{ color: 'primary.main' }}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Salary Details">
        <IconButton
          size="small"
          onClick={() => navigate(`/admin-dashboard/employees/salary/${employee._id}`)}
          sx={{ color: 'success.main' }}
        >
          <AccountBalance />
          
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Leave Management">
        <IconButton
          size="small"
          onClick={() => navigate(`/admin-dashboard/employees/leaves/${employee._id}`)}
          sx={{ color: 'error.main' }}
        >
          <LeaveIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Manage Employees
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin-dashboard/add-employee')}
          sx={{ px: 3 }}
        >
          Add Employee
        </Button>
      </Box>

      <Paper elevation={0} sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, ID, department..."
            onChange={handleSearch}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-label="employee table">
            <TableHead>
              <TableRow>
                <TableCell width={80}>S No</TableCell>
                <TableCell width={300}>Employee</TableCell>
                <TableCell width={200}>Department</TableCell>
                <TableCell width={120}>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          border: 2,
                          borderColor: 'primary.main',
                          borderTopColor: 'transparent',
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                          }
                        }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((employee) => (
                    <TableRow key={employee._id} hover>
                      <TableCell>{employee.sno}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={employee.profileImage}
                            alt={employee.name}
                            sx={{ width: 40, height: 40 }}
                          />
                          <Box>
                            <Typography variant="subtitle2">
                              {employee.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {employee.employeeId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{employee.dep_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={employee.status === 'active' ? 'Active' : 'Inactive'}
                          color={employee.status === 'active' ? 'success' : 'error'}
                          size="small"
                          sx={{ 
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <ActionButtons employee={employee} />
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
          count={filteredEmployees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default EmployeeList;