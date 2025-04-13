import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import config from '../config';
import { useAuth } from '../context/authContext';
import { logger } from '../utils/logger';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    let socketInstance = null;
    
    try {
      socketInstance = io(config.API_URL, {
        auth: {
          token: localStorage.getItem('token')
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000
      });
      
      socketInstance.on('connect', () => {
        logger.info('Socket connected successfully');
        setConnected(true);
      });
      
      socketInstance.on('connect_error', (error) => {
        logger.error('Socket connection error:', error);
        setConnected(false);
      });
      
      socketInstance.on('disconnect', (reason) => {
        logger.warn(`Socket disconnected: ${reason}`);
        setConnected(false);
      });
      
      socketInstance.on('reconnect', (attemptNumber) => {
        logger.info(`Socket reconnected after ${attemptNumber} attempts`);
        setConnected(true);
      });

      setSocket(socketInstance);
    } catch (error) {
      logger.error('Error initializing socket:', error);
    }
    
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

  return { socket, connected };
};

export default useSocket;