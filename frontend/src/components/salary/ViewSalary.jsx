import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import config from '../../config';

const ViewSalary = () => {
  const [salaries, setSalaries] = useState(null);
  const [filteredSalaries, setFilteredSalaries] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { user } = useAuth();

  const fetchSalaries = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/salary/${id}/${user.role}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.data.success) {
        setSalaries(response.data.salary);
        setFilteredSalaries(response.data.salary);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  const filterSalaries = (q) => {
    const filteredRecords = salaries.filter((salary) =>
      salary.employeeId.employeeId.toLowerCase().includes(q.toLowerCase())
    );
    setFilteredSalaries(filteredRecords);
  };

  const handleSort = (field) => {
    const sortedRecords = [...filteredSalaries].sort((a, b) => {
      if (field === 'payDate') {
        return new Date(a.payDate) - new Date(b.payDate);
      } else if (field === 'netSalary') {
        return b.netSalary - a.netSalary;
      }
      return 0;
    });
    setFilteredSalaries(sortedRecords);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
        Salary History
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {filteredSalaries && (
        <>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="flex-end"
            sx={{ mb: 3 }}
          >
            <TextField
              placeholder="Search By Emp ID"
              size="small"
              onChange={(e) => filterSalaries(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                displayEmpty
                defaultValue=""
                onChange={(e) => handleSort(e.target.value)}
              >
                <MenuItem value="">Sort By</MenuItem>
                <MenuItem value="payDate">Pay Date</MenuItem>
                <MenuItem value="netSalary">Net Salary</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {filteredSalaries.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SNO</TableCell>
                    <TableCell>Emp ID</TableCell>
                    <TableCell>Salary</TableCell>
                    <TableCell>Allowance</TableCell>
                    <TableCell>Deduction</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Pay Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSalaries.map((salary, index) => (
                    <TableRow key={salary._id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {salary.employeeId ? salary.employeeId.employeeId : 'N/A'}
                      </TableCell>
                      <TableCell>{salary.basicSalary}</TableCell>
                      <TableCell>{salary.allowances}</TableCell>
                      <TableCell>{salary.deductions}</TableCell>
                      <TableCell>{salary.netSalary}</TableCell>
                      <TableCell>
                        {new Date(salary.payDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" align="center">
              No Records Found
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
};


export default ViewSalary;
