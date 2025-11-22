import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';
import { SocketContext } from './SocketContext';

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      console.log('🔌 Connecting to socket server:', API_URL);
      
      const newSocket = io(API_URL, {
        query: {
          userId: user._id
        }
      });

      setSocket(newSocket);

      // Listen for online users
      newSocket.on('onlineUsers', (users) => {
        console.log('🟢 Online users updated:', users.length);
        setOnlineUsers(users);
      });

      // Listen for new messages
      newSocket.on('newMessage', (message) => {
        console.log('📩 New message received:', message);
        setMessages(prev => [...prev, message]);
      });

      // Load message history when socket connects
      newSocket.on('messageHistory', (history) => {
        console.log('📚 Message history loaded:', history.length);
        setMessages(history);
      });

      // Listen for typing indicators
      newSocket.on('userTyping', (data) => {
        console.log('⌨️ Typing indicator:', data);
        setTypingUsers(prev => ({
          ...prev,
          [data.senderId]: data.isTyping
        }));
      });

      // Notify server that user is online
      newSocket.emit('userOnline', user._id);

      return () => {
        console.log('🧹 Cleaning up socket connection');
        newSocket.close();
        setSocket(null);
        setMessages([]);
        setOnlineUsers([]);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setMessages([]);
        setOnlineUsers([]);
      }
    }
  }, [user]);

  const sendMessage = useCallback((receiverId, message) => {
    if (socket && user) {
      console.log('📤 Sending message to:', receiverId);
      socket.emit('sendMessage', { 
        senderId: user._id, 
        receiverId, 
        message 
      });
    }
  }, [socket, user]);

  const getMessageHistory = useCallback((otherUserId) => {
    if (socket && user) {
      console.log('📖 Requesting message history for:', otherUserId);
      socket.emit('getMessageHistory', {
        userId: user._id,
        otherUserId
      });
    }
  }, [socket, user]);

  const startTyping = useCallback((receiverId) => {
    if (socket && user) {
      socket.emit('typingStart', {
        senderId: user._id,
        receiverId
      });
    }
  }, [socket, user]);

  const stopTyping = useCallback((receiverId) => {
    if (socket && user) {
      socket.emit('typingStop', {
        senderId: user._id,
        receiverId
      });
    }
  }, [socket, user]);

  const value = {
    socket,
    onlineUsers,
    messages,
    typingUsers,
    sendMessage,
    getMessageHistory,
    startTyping,
    stopTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;