import { useState, useEffect } from 'react';
import DevSignature from './DevSignature';

const KeySequenceDetector = () => {
  const [keySequence, setKeySequence] = useState([]);
  const [showSignature, setShowSignature] = useState(false);
  
  // The secret code - your GitHub username
  const secretCode = ['c', 'l', 'e', 'x', 'f', 'l', 'e', 'x'];
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only capture alphabetic keys
      if (!/^[a-zA-Z]$/.test(e.key)) return;
      
      // Add the key to sequence and limit the length to match secret code
      const newSequence = [...keySequence, e.key.toLowerCase()];
      if (newSequence.length > secretCode.length) newSequence.shift();
      setKeySequence(newSequence);
      
      // Check if sequence matches secret code
      if (JSON.stringify(newSequence) === JSON.stringify(secretCode)) {
        setShowSignature(true);
        
        // Log a message in console for extra discovery
        console.log(`
        %c ✨ Secret Code Discovered! ✨
        %c TeamSync was crafted by Yashraj Ghosalkar (@clexflex)
        `, 
        'color: #4caf50; font-size: 18px; font-weight: bold;', 
        'color: #2196f3; font-size: 14px;');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keySequence]);
  
  return (
    <DevSignature 
      open={showSignature} 
      onClose={() => setShowSignature(false)} 
    />
  );
};

export default KeySequenceDetector;