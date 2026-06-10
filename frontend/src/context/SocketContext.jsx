import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      return;
    }

    const nextSocket = io(import.meta.env.VITE_SOCKET_URL || '', {
      withCredentials: true,
    });

    nextSocket.on('connect_error', (err) => {
      console.error('Socket connection failed:', err.message);
    });

    nextSocket.on('onlineUsers', setOnlineUsers);
    setSocket(nextSocket);

    return () => nextSocket.close();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
