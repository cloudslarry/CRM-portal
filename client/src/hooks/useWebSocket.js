import { useEffect, useRef, useState } from 'react';
import websocketService from '../services/websocketService';

const useWebSocket = (token) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('CLOSED');
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [error, setError] = useState(null);
  
  const messageHandlers = useRef(new Map());
  const typingTimeout = useRef(new Map());

  useEffect(() => {
    if (!token) return;

    // Connect to WebSocket
    websocketService.connect(token);

    // Set up event listeners
    const handleConnected = () => {
      setIsConnected(true);
      setConnectionState('OPEN');
      setError(null);
    };

    const handleDisconnected = (event) => {
      setIsConnected(false);
      setConnectionState('CLOSED');
      if (event.code !== 1000) {
        setError('Connection lost. Attempting to reconnect...');
      }
    };

    const handleNewMessage = (data) => {
      const { message } = data;
      setMessages(prev => [...prev, message]);
      
      // Call custom message handler if registered
      if (messageHandlers.current.has('new_message')) {
        messageHandlers.current.get('new_message')(data);
      }
    };

    const handleMessageSent = (data) => {
      const { message } = data;
      setMessages(prev => [...prev, message]);
      
      // Call custom message handler if registered
      if (messageHandlers.current.has('message_sent')) {
        messageHandlers.current.get('message_sent')(data);
      }
    };

    const handleRoomMessage = (data) => {
      const { message } = data;
      setMessages(prev => [...prev, message]);
      
      // Call custom message handler if registered
      if (messageHandlers.current.has('room_message')) {
        messageHandlers.current.get('room_message')(data);
      }
    };

    const handleTyping = (data) => {
      const { user, isTyping } = data;
      
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(user.name);
        } else {
          newSet.delete(user.name);
        }
        return newSet;
      });

      // Auto-remove typing indicator after 3 seconds
      if (isTyping) {
        if (typingTimeout.current.has(user.name)) {
          clearTimeout(typingTimeout.current.get(user.name));
        }
        
        const timeout = setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(user.name);
            return newSet;
          });
          typingTimeout.current.delete(user.name);
        }, 3000);
        
        typingTimeout.current.set(user.name, timeout);
      }

      // Call custom typing handler if registered
      if (messageHandlers.current.has('typing')) {
        messageHandlers.current.get('typing')(data);
      }
    };

    const handleError = (error) => {
      setError(error.message || 'WebSocket error occurred');
    };

    const handleReconnectFailed = () => {
      setError('Failed to reconnect. Please refresh the page.');
    };

    // Register event listeners
    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('new_message', handleNewMessage);
    websocketService.on('message_sent', handleMessageSent);
    websocketService.on('room_message', handleRoomMessage);
    websocketService.on('typing', handleTyping);
    websocketService.on('error', handleError);
    websocketService.on('reconnect_failed', handleReconnectFailed);

    // Update connection state periodically
    const stateInterval = setInterval(() => {
      setConnectionState(websocketService.getConnectionState());
    }, 1000);

    // Cleanup
    return () => {
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.off('new_message', handleNewMessage);
      websocketService.off('message_sent', handleMessageSent);
      websocketService.off('room_message', handleRoomMessage);
      websocketService.off('typing', handleTyping);
      websocketService.off('error', handleError);
      websocketService.off('reconnect_failed', handleReconnectFailed);
      
      clearInterval(stateInterval);
      
      // Clear typing timeouts
      typingTimeout.current.forEach(timeout => clearTimeout(timeout));
      typingTimeout.current.clear();
    };
  }, [token]);

  // Send message function
  const sendMessage = (roomId, message, receiverId, receiverName, receiverRegistrationNumber) => {
    if (isConnected) {
      websocketService.sendChatMessage(roomId, message, receiverId, receiverName, receiverRegistrationNumber);
    } else {
      setError('Not connected to chat server');
    }
  };

  // Send typing indicator
  const sendTyping = (roomId, isTyping) => {
    if (isConnected) {
      websocketService.sendTyping(roomId, isTyping);
    }
  };

  // Register custom message handler
  const onMessage = (eventType, handler) => {
    messageHandlers.current.set(eventType, handler);
  };

  // Clear messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Get messages for a specific room
  const getRoomMessages = (roomId) => {
    return messages.filter(msg => msg.roomId === roomId);
  };

  // Ping server
  const ping = () => {
    if (isConnected) {
      websocketService.ping();
    }
  };

  return {
    isConnected,
    connectionState,
    messages,
    typingUsers: Array.from(typingUsers),
    error,
    sendMessage,
    sendTyping,
    onMessage,
    clearMessages,
    getRoomMessages,
    ping
  };
};

export default useWebSocket;
