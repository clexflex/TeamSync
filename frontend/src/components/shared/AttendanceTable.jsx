import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Chip,
  Stack,
  Avatar,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme,
  Collapse,
  Grid,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Task as TaskIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const AttendanceTable = ({ records, title, icon: Icon }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedRow, setExpandedRow] = useState(null);

  const formatTime = (time) =>
    time
      ? new Date(time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
      : '-';

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return {
          bg: 'success.light',
          text: 'success.dark',
          border: 'success.main'
        };
      case 'Rejected':
        return {
          bg: 'error.light',
          text: 'error.dark',
          border: 'error.main'
        };
      default:
        return {
          bg: 'warning.light',
          text: 'warning.dark',
          border: 'warning.main'
        };
    }
  };

  const toggleRowExpansion = (recordId) => {
    setExpandedRow(expandedRow === recordId ? null : recordId);
  };

  // Mobile layout - card-based design
  const MobileLayout = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {records.map((record) => (
        <Card key={record._id} elevation={0} sx={{ 
          border: 1, 
          borderColor: 'divider',
          overflow: 'visible'
        }}>
          <CardHeader
            avatar={
              <Avatar
                alt={record.userId.name}
                src={record.userId.profileImage}
                sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
              >
                {record.userId.name.charAt(0)}
              </Avatar>
            }
            title={
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                {record.userId.name}
              </Typography>
            }
            subheader={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  label={record.approvalStatus}
                  size="small"
                  sx={{
                    bgcolor: getStatusColor(record.approvalStatus).bg,
                    color: getStatusColor(record.approvalStatus).text,
                    borderColor: getStatusColor(record.approvalStatus).border,
                    borderWidth: 1,
                    borderStyle: 'solid'
                  }}
                />
                <Typography variant="caption">
                  {record.workLocation}
                </Typography>
              </Box>
            }
            action={
              <IconButton
                onClick={() => toggleRowExpansion(record._id)}
                aria-expanded={expandedRow === record._id}
                aria-label="show more"
              >
                {expandedRow === record._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            }
            sx={{ pb: 1 }}
          />
          
          <Collapse in={expandedRow === record._id} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, pt: 0 }}>
              <Divider sx={{ my: 1 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      In: {formatTime(record.clockIn)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Out: {formatTime(record.clockOut)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 2 }}>
                Duration: {record.hoursWorked?.toFixed(2) || '-'} hrs
              </Typography>
              
              {record.workLocation === 'Remote' && record.location && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Remote Location
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 0.5 }}>
                    <a
                      href={`https://www.google.com/maps?q=${record.location.latitude},${record.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2563EB', textDecoration: 'none', fontSize: '0.75rem' }}
                    >
                      Lat: {record.location.latitude}, Lon: {record.location.longitude}
                    </a>
                  </Box>
                </Box>
              )}
              
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => record.onViewTasks?.(record)}
                    sx={{
                      color: 'primary.main',
                      bgcolor: 'primary.light',
                      '&:hover': { bgcolor: 'primary.main', color: 'white' }
                    }}
                  >
                    <TaskIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Approve">
                  <IconButton
                    size="small"
                    onClick={() => record.onApprove?.(record._id, 'Approved')}
                    disabled={record.approvalStatus === 'Approved'}
                    sx={{
                      color: 'success.main',
                      bgcolor: 'success.light',
                      '&:hover': { bgcolor: 'success.main', color: 'white' },
                      '&.Mui-disabled': { opacity: 0.5 }
                    }}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                  <IconButton
                    size="small"
                    onClick={() => record.onReject?.(record)}
                    disabled={record.approvalStatus === 'Rejected'}
                    sx={{
                      color: 'error.main',
                      bgcolor: 'error.light',
                      '&:hover': { bgcolor: 'error.main', color: 'white' },
                      '&.Mui-disabled': { opacity: 0.5 }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          </Collapse>
        </Card>
      ))}
    </Box>
  );

  // Desktop layout - table-based design
  const DesktopLayout = () => (
    <TableContainer>
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Schedule</TableCell>
            <TableCell>Location</TableCell>
            <TableCell width="15%">Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((record) => (
            <TableRow
              key={record._id}
              hover
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    alt={record.userId.name}
                    src={record.userId.profileImage}
                    sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                  >
                    {record.userId.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {record.userId.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {record.userId.employeeId || record.userId.email}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      In: {formatTime(record.clockIn)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Out: {formatTime(record.clockOut)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Duration: {record.hoursWorked?.toFixed(2) || '-'} hrs
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocationIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2">
                      {record.workLocation}
                    </Typography>
                    {record.workLocation === 'Remote' && record.location && (
                      <Box sx={{ mt: 0.5 }}>
                        <a
                          href={`https://www.google.com/maps?q=${record.location.latitude},${record.location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#2563EB', textDecoration: 'none', fontSize: '0.75rem' }}
                        >
                          Lat: {record.location.latitude}, Lon: {record.location.longitude}
                        </a>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </TableCell>

              <TableCell>
                <Chip
                  label={record.approvalStatus}
                  size="small"
                  sx={{
                    bgcolor: getStatusColor(record.approvalStatus).bg,
                    color: getStatusColor(record.approvalStatus).text,
                    borderColor: getStatusColor(record.approvalStatus).border,
                    borderWidth: 1,
                    borderStyle: 'solid'
                  }}
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => record.onViewTasks?.(record)}
                      sx={{
                        color: 'primary.main',
                        bgcolor: 'primary.light',
                        '&:hover': { bgcolor: 'primary.main', color: 'white' }
                      }}
                    >
                      <TaskIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Approve">
                    <IconButton
                      size="small"
                      onClick={() => record.onApprove?.(record._id, 'Approved')}
                      disabled={record.approvalStatus === 'Approved'}
                      sx={{
                        color: 'success.main',
                        bgcolor: 'success.light',
                        '&:hover': { bgcolor: 'success.main', color: 'white' },
                        '&.Mui-disabled': { opacity: 0.5 }
                      }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton
                      size="small"
                      onClick={() => record.onReject?.(record)}
                      disabled={record.approvalStatus === 'Rejected'}
                      sx={{
                        color: 'error.main',
                        bgcolor: 'error.light',
                        '&:hover': { bgcolor: 'error.main', color: 'white' },
                        '&.Mui-disabled': { opacity: 0.5 }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardHeader
          avatar={Icon && <Icon color="primary" />}
          title={
            <Typography variant="h6" color="text.primary" fontWeight="medium">
              {title}
            </Typography>
          }
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}
        />
        
        {isMobile ? <MobileLayout /> : <DesktopLayout />}
      </Card>
    </Box>
  );
};

export default AttendanceTable;