import { io } from 'socket.io-client';

let socket;

export const initializeSocket = (token) => {
  // Check if socket already exists to prevent re-initialization
  if (socket) {
    return socket;
  }

  // Validate token
  if (!token) {
    console.error('No authentication token provided');
    return null;
  }

  const apiUrl = 'https://timemanagementsystemserver.onrender.com';
  
  try {
    socket = io(apiUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000
    });

    // Connection success handler
    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    // Detailed error handling
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection failed:', {
        message: error.message,
        name: error.name,
        description: error.description || 'Unknown connection error'
      });
    });

    // Reconnection handling
    socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected to socket after ${attemptNumber} attempts`);
    });

    return socket;
  } catch (error) {
    console.error('Failed to initialize socket:', error);
    return null;
  }
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToNotifications = (callback) => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  
  socket.on('notification', callback);
  
  return () => {
    socket.off('notification', callback);
  };
};

export const subscribeToStatusChanges = (callback) => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  
  socket.on('status-change', callback);
  
  return () => {
    socket.off('status-change', callback);
  };
};