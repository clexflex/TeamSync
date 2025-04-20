// Create a new file: src/components/easter-eggs/HiddenSignature.jsx
import React, { useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import DevSignature from './DevSignature';

const HiddenSignature = () => {
  const [clicks, setClicks] = useState(0);
  const [showSignature, setShowSignature] = useState(false);
  
  const handleClick = () => {
    // Increment click counter
    const newClicks = clicks + 1;
    setClicks(newClicks);
    
    // Show signature after 5 consecutive clicks
    if (newClicks >= 5) {
      setShowSignature(true);
      setClicks(0);
    }
  };
  
  return (
    <>
      <Tooltip 
        title={clicks >= 3 ? "Almost there..." : ""} 
        placement="top"
        open={clicks >= 3}
      >
        <Box
          onClick={handleClick}
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            opacity: 0.2,
            cursor: 'default',
            transition: 'all 0.2s ease',
            '&:hover': {
              opacity: 0.3,
              transform: 'scale(1.2)'
            },
            // Special animation effect when approaching activation
            ...(clicks >= 3 && {
              animation: 'pulse 1s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 0.2, transform: 'scale(1)' },
                '50%': { opacity: 0.5, transform: 'scale(1.3)' },
                '100%': { opacity: 0.2, transform: 'scale(1)' }
              }
            })
          }}
        />
      </Tooltip>
      
      <DevSignature 
        open={showSignature} 
        onClose={() => setShowSignature(false)} 
      />
    </>
  );
};

export default HiddenSignature;