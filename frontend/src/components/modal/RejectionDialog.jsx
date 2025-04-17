import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const RejectionDialog = ({ open, onClose, onConfirm, attendanceRecord }) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!comment.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    onConfirm(comment);
    setComment('');
    setError('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Reject Attendance
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {attendanceRecord && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1">
              Rejecting attendance for: {attendanceRecord.userId?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date: {new Date(attendanceRecord.date).toLocaleDateString()}
            </Typography>
          </Box>
        )}

        <TextField
          label="Reason for Rejection"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (e.target.value.trim()) setError('');
          }}
          fullWidth
          error={!!error}
          helperText={error}
          placeholder="Please provide a reason for rejecting this attendance record"
          variant="outlined"
          sx={{ mt: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          color="error" 
          variant="contained"
        >
          Reject Attendance
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectionDialog;