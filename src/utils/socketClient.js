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

  const apiUrl = 'https://timemanagementsystemserver.onrender.com/';
  
  try {
    socket = io(apiUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 15,
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

/**
 * 
 * import { io } from 'socket.io-client';

let socket;
let retryAttempts = 0;
const MAX_RETRY_ATTEMPTS = 15;

const exponentialBackoff = (attempt) => Math.min(1000 * Math.pow(2, attempt), 30000);

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

  const apiUrl = 'https://timemanagementsystemserver.onrender.com/';

  const connectSocket = () => {
    try {
      socket = io(apiUrl, {
        auth: { token },
        withCredentials: true,
        transports: ['websocket'],
        reconnection: false, // Disable built-in reconnection
        timeout: 5000
      });

      // Connection success handler
      socket.on('connect', () => {
        console.log('Socket connected successfully');
        retryAttempts = 0; // Reset retry attempts on successful connection
      });

      // Detailed error handling
      socket.on('connect_error', (error) => {
        console.error('WebSocket connection failed:', {
          message: error.message,
          name: error.name,
          description: error.description || 'Unknown connection error'
        });

        if (retryAttempts < MAX_RETRY_ATTEMPTS) {
          const delay = exponentialBackoff(retryAttempts);
          console.log(`Retrying connection in ${delay}ms (Attempt ${retryAttempts + 1})`);
          setTimeout(() => {
            retryAttempts++;
            connectSocket();
          }, delay);
        } else {
          console.error('Max retry attempts reached. Unable to connect to WebSocket.');
        }
      });

      // Reconnection handling
      socket.on('reconnect', (attemptNumber) => {
        console.log(`Reconnected to socket after ${attemptNumber} attempts`);
      });

    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  };

  connectSocket();
  return socket;
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
 */