import React from 'react';
import { 
  Dialog, DialogContent, DialogTitle, Grow, Box, Typography, 
  Avatar, Button, IconButton, Link, Divider 
} from '@mui/material';
import { 
  Code as CodeIcon, 
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Close as CloseIcon,
  Terminal as TerminalIcon
} from '@mui/icons-material';

const DevSignature = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Grow}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: { borderRadius: 2, overflow: 'hidden' }
      }}
    >
      <Box sx={{ 
        bgcolor: 'primary.dark',
        color: 'white',
        py: 4,
        position: 'relative'
      }}>
        <IconButton 
          onClick={onClose}
          sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white'
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <Box sx={{ textAlign: 'center' }}>
          <Avatar
            sx={{ 
              width: 100, 
              height: 100, 
              mx: 'auto', 
              mb: 2,
              bgcolor: 'primary.light',
              border: '4px solid white'
            }}
          >
            YG
          </Avatar>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Yashraj Ghosalkar
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Full Stack Developer
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
            <IconButton
              component="a"
              href="https://github.com/clexflex"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
            >
              <GitHubIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.linkedin.com/in/yashrajghosalkar/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
            >
              <LinkedInIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.linkedin.com/in/yashrajghosalkar/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
            >
              <TwitterIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      
      <DialogContent sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          About the Developer
        </Typography>
        
        <Typography variant="body1" paragraph>
          Hello! I'm Yashraj Ghosalkar, the developer behind TeamSync. I built this employee management system from the ground up for Maximize Market Research to streamline workforce management and HR processes.
        </Typography>
        
        <Typography variant="body1">
          As a full-stack developer passionate about creating efficient solutions, I designed TeamSync to be intuitive, responsive, and powerful enough to handle all aspects of employee management in one unified platform.
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          bgcolor: 'grey.50',
          p: 2,
          mt: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <TerminalIcon sx={{ mr: 2, color: 'success.main' }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Developer Note
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You discovered this easter egg by typing "clexflex"! Feel free to connect with me on GitHub or LinkedIn.
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={onClose}
          >
            Back to TeamSync
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DevSignature;