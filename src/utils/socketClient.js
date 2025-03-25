import { io } from 'socket.io-client';

let socket;

export const initializeSocket = (token) => {
  if (!socket) {
    const apiUrl = 'https://timemanagementsystemserver.onrender.com/api';
    
    socket = io(apiUrl, {
      auth: { token },
      withCredentials: true, // Required for CORS
      transports: ['websocket'], // Avoid polling issues
      reconnectionAttempts: 3
    });
    
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection failed:', error.message);
    });
  }
  return socket;
};

// Keep your existing functions: getSocket, disconnectSocket, etc.

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
  
  socket.on('notification', (data) => {
    callback(data);
  });
  
  return () => {
    socket.off('notification');
  };
};

export const subscribeToStatusChanges = (callback) => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  
  socket.on('status-change', (data) => {
    callback(data);
  });
  
  return () => {
    socket.off('status-change');
  };
};