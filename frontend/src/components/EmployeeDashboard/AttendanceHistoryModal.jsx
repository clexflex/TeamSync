import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Grid,
  Paper,
  Divider,
  Box,
  Chip,
  Avatar,
  useTheme
} from '@mui/material';
import {
  X,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Calendar,
  ClipboardList,
  UserCheck,
  MessageSquare
} from 'lucide-react';

const AttendanceHistoryModal = ({ attendance, onClose }) => {
  const theme = useTheme();

  if (!attendance) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not recorded';
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) ?
      date.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'Asia/Kolkata'
      }) : 'Invalid Date';
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Approved': { color: 'success', Icon: CheckCircle2, bgColor: theme.palette.success.light },
      'Present': { color: 'success', Icon: CheckCircle2, bgColor: theme.palette.success.light },
      'Rejected': { color: 'error', Icon: XCircle, bgColor: theme.palette.error.light },
      'Absent': { color: 'error', Icon: XCircle, bgColor: theme.palette.error.light },
      'Auto-Approved': { color: 'info', Icon: CheckCircle2, bgColor: theme.palette.info.light },
      'Half-Day': { color: 'warning', Icon: Clock, bgColor: theme.palette.warning.light },
      'Leave': { color: 'primary', Icon: Calendar, bgColor: theme.palette.primary.light },
      'Extra-Work': { color: 'secondary', Icon: Clock, bgColor: theme.palette.secondary.light },
      'Pending': { color: 'default', Icon: Clock, bgColor: theme.palette.grey[200] }
    };
    return configs[status] || configs['Pending'];
  };

  const InfoSection = ({ icon: Icon, title, children, elevation = 0 }) => (
    <Paper 
      elevation={elevation} 
      sx={{ 
        p: 2.5,
        borderRadius: 2,
        height: '100%',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <Avatar 
          sx={{ 
            bgcolor: 'primary.soft', 
            color: 'primary.main',
            width: 36,
            height: 36
          }}
        >
          <Icon size={18} />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );

  const StatusChip = ({ label, status, size = "medium" }) => {
    const config = getStatusConfig(status);
    return (
      <Chip
        icon={<config.Icon size={size === "small" ? 14 : 16} />}
        label={label || status}
        color={config.color}
        size={size}
        sx={{
          fontWeight: 500,
          px: 0.5,
          '& .MuiChip-label': {
            px: 1
          }
        }}
      />
    );
  };

  const LabelValue = ({ label, value, valueComponent }) => (
    <Box mb={1.5}>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        gutterBottom
        sx={{ fontWeight: 500 }}
      >
        {label}
      </Typography>
      {valueComponent || (
        <Typography variant="body1">
          {value}
        </Typography>
      )}
    </Box>
  );

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 1,
          bgcolor: 'primary.soft'
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <Calendar size={20} />
          </Avatar>
          <Typography variant="h6" fontWeight={600}>
            Attendance Details
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { 
              bgcolor: 'background.paper',
              opacity: 0.9
            }
          }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, pt: 3 }}>
        <Box 
          display="flex" 
          gap={1} 
          flexWrap="wrap" 
          mb={3}
          pb={2.5}
          sx={{
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Chip
            icon={<Calendar size={16} />}
            label={formatDate(attendance.date)}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
          {attendance.approvalStatus && (
            <StatusChip 
              status={attendance.approvalStatus} 
            />
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Work Hours Summary */}
          <Grid item xs={12} md={6}>
            <InfoSection icon={Clock} title="Time & Hours">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LabelValue 
                    label="Clock In" 
                    value={formatDate(attendance.clockIn)} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LabelValue 
                    label="Clock Out" 
                    value={attendance.clockOut ? formatDate(attendance.clockOut) : 'Not clocked out'} 
                  />
                </Grid>
              </Grid>
              
              {attendance.hoursWorked && (
                <Box 
                  mt={2} 
                  py={1.5} 
                  px={2} 
                  borderRadius={2} 
                  bgcolor={theme.palette.primary.soft}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Hours Worked
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="primary.main" 
                    fontWeight={600}
                  >
                    {attendance.hoursWorked.toFixed(2)} hrs
                  </Typography>
                </Box>
              )}
            </InfoSection>
          </Grid>

          {/* Location & Status */}
          <Grid item xs={12} md={6}>
            <InfoSection icon={MapPin} title="Location & Status">
              <LabelValue 
                label="Work Location" 
                value={attendance.workLocation} 
              />
              
              <LabelValue 
                label="Status" 
                valueComponent={
                  attendance.status ? (
                    <Box mt={0.5}>
                      <StatusChip status={attendance.status} />
                    </Box>
                  ) : (
                    <Typography variant="body1">Not available</Typography>
                  )
                }
              />
            </InfoSection>
          </Grid>

          {/* Tasks Completed */}
          <Grid item xs={12}>
            <InfoSection icon={ClipboardList} title="Tasks Completed">
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.grey[50],
                  borderColor: theme.palette.divider
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    color: attendance.tasksDone ? 'text.primary' : 'text.secondary',
                    fontStyle: attendance.tasksDone ? 'normal' : 'italic'
                  }}
                >
                  {attendance.tasksDone || 'No tasks recorded for this session'}
                </Typography>
              </Paper>
            </InfoSection>
          </Grid>

          {/* Approvals */}
          <Grid item xs={12}>
            <InfoSection icon={UserCheck} title="Approval Status">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      borderColor: theme.palette.divider
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Manager Approval
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <StatusChip
                        label={attendance.managerApproval ? "Approved" : "Pending"}
                        status={attendance.managerApproval ? "Approved" : "Pending"}
                      />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      borderColor: theme.palette.divider
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Admin Approval
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <StatusChip
                        label={attendance.adminApproval ? "Approved" : "Pending"}
                        status={attendance.adminApproval ? "Approved" : "Pending"}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </InfoSection>
          </Grid>

          {/* Comments Section (conditional) */}
          {attendance.comments && (
            <Grid item xs={12}>
              <InfoSection icon={MessageSquare} title="Manager Comments">
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme.palette.grey[50],
                    borderColor: theme.palette.divider
                  }}
                >
                  <Typography variant="body1">
                    {attendance.comments}
                  </Typography>
                </Paper>
              </InfoSection>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceHistoryModal;