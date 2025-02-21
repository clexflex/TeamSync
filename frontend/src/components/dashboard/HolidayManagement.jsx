import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';

const HolidayManagement = () => {
  const [holidays, setHolidays] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: '',
    date: '',
    isCompanyWide: true,
    applicableDepartments: [],
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [holidayResponse, departmentResponse] = await Promise.all([
          axios.get(`${config.API_URL}/api/holidays`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get(`${config.API_URL}/api/department`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        setHolidays(holidayResponse.data.holidays);
        setDepartments(departmentResponse.data.departments);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({
        ...prev,
        applicableDepartments: checked
          ? [...prev.applicableDepartments, value]
          : prev.applicableDepartments.filter(id => id !== value)
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const endpoint = form.id
        ? `${config.API_URL}/api/holidays/update/${form.id}`
        : `${config.API_URL}/api/holidays/add`;

      const method = form.id ? 'put' : 'post';

      await axios[method](
        endpoint,
        {
          name: form.name,
          date: form.date,
          isCompanyWide: form.isCompanyWide,
          applicableDepartments: form.isCompanyWide ? [] : form.applicableDepartments,
          description: form.description
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setSuccess(`Holiday ${form.id ? 'updated' : 'added'} successfully`);
      navigate(0);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save holiday');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;

    try {
      setLoading(true);
      setError('');

      await axios.delete(`${config.API_URL}/api/holidays/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccess('Holiday deleted successfully');
      navigate(0);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete holiday');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (holiday) => {
    setForm({
      id: holiday._id,
      name: holiday.name,
      date: holiday.date.split('T')[0],
      isCompanyWide: holiday.isCompanyWide,
      applicableDepartments: holiday.applicableDepartments.map(d => d._id),
      description: holiday.description
    });
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      date: '',
      isCompanyWide: true,
      applicableDepartments: [],
      description: ''
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Holiday Management
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Holiday Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              type="date"
              label="Date"
              name="date"
              value={form.date}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <InputLabel>Is Company-Wide?</InputLabel>
              <Select
                name="isCompanyWide"
                value={form.isCompanyWide}
                onChange={(e) => {
                  setForm(prev => ({
                    ...prev,
                    isCompanyWide: e.target.value === 'true',
                    applicableDepartments: []
                  }));
                }}
                label="Is Company-Wide?"
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>

            {!form.isCompanyWide && (
              <FormGroup>
                <Typography variant="subtitle2" gutterBottom>
                  Applicable Departments
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {departments.map((dep) => (
                    <FormControlLabel
                      key={dep._id}
                      control={
                        <Checkbox
                          checked={form.applicableDepartments.includes(dep._id)}
                          onChange={handleChange}
                          value={dep._id}
                        />
                      }
                      label={dep.dep_name}
                    />
                  ))}
                </Box>
              </FormGroup>
            )}

            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
            />

            <Stack direction="row" spacing={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Saving...' : (form.id ? 'Update Holiday' : 'Add Holiday')}
              </Button>
              {form.id && (
                <Button
                  variant="outlined"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              )}
            </Stack>
          </Stack>
        </form>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Existing Holidays
        </Typography>

        {loading && !holidays.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Company-Wide</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holidays.map((holiday) => (
                  <TableRow key={holiday._id} hover>
                    <TableCell>{holiday.name}</TableCell>
                    <TableCell>{holiday.date.split('T')[0]}</TableCell>
                    <TableCell>{holiday.isCompanyWide ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(holiday)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(holiday._id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default HolidayManagement;