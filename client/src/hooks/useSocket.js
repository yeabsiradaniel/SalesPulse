import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (event, callback) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io({ transports: ['websocket', 'polling'] });
    }

    const socket = socketRef.current;
    if (event && callback) {
      socket.on(event, callback);
    }

    return () => {
      if (event && callback) {
        socket.off(event, callback);
      }
    };
  }, [event, callback]);

  return socketRef.current;
};

export default useSocket;
