const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const keys = require('../config/key');
const Message = require('../models/Message');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Admin = require('../models/Admin');

class ChatServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });
    this.clients = new Map(); // Store active connections
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection attempt');
      
      // Extract token from query parameters or headers
      const token = this.extractToken(req);
      
      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      try {
        const decoded = jwt.verify(token, keys.secretOrKey);
        const user = decoded.student || decoded.faculty || decoded;
        
        if (!user) {
          ws.close(1008, 'Invalid user data');
          return;
        }

        // Store user info with connection
        ws.user = {
          id: user.id || user._id,
          name: user.name,
          type: decoded.student ? 'student' : decoded.faculty ? 'faculty' : 'admin',
          registrationNumber: user.registrationNumber
        };

        // Store connection
        this.clients.set(ws.user.id, ws);
        
        console.log(`User ${ws.user.name} (${ws.user.type}) connected`);
        
        // Send connection confirmation
        this.sendToClient(ws, {
          type: 'connection',
          message: 'Connected successfully',
          user: ws.user
        });

        // Handle incoming messages
        ws.on('message', (data) => {
          this.handleMessage(ws, data);
        });

        // Handle disconnection
        ws.on('close', () => {
          console.log(`User ${ws.user.name} disconnected`);
          this.clients.delete(ws.user.id);
        });

        // Handle errors
        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.clients.delete(ws.user.id);
        });

      } catch (error) {
        console.error('JWT verification failed:', error);
        ws.close(1008, 'Invalid token');
      }
    });
  }

  extractToken(req) {
    // Try to get token from query parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
    let token = url.searchParams.get('token');
    
    // If not in query, try Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    return token;
  }

  async handleMessage(ws, data) {
    try {
      const messageData = JSON.parse(data);
      
      switch (messageData.type) {
        case 'chat':
          await this.handleChatMessage(ws, messageData);
          break;
        case 'typing':
          this.handleTyping(ws, messageData);
          break;
        case 'ping':
          this.sendToClient(ws, { type: 'pong' });
          break;
        default:
          console.log('Unknown message type:', messageData.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.sendToClient(ws, {
        type: 'error',
        message: 'Invalid message format'
      });
    }
  }

  async handleChatMessage(ws, messageData) {
    const { roomId, message, receiverId, receiverName, receiverRegistrationNumber } = messageData;
    
    if (!roomId || !message) {
      this.sendToClient(ws, {
        type: 'error',
        message: 'Room ID and message are required'
      });
      return;
    }

    try {
      // Get enrollment IDs from database
      const senderStudent = await Student.findOne({ registrationNumber: ws.user.registrationNumber }).select('enrollmentId');
      const receiverStudent = await Student.findOne({ registrationNumber: receiverRegistrationNumber }).select('enrollmentId');
      
      if (!senderStudent || !receiverStudent) {
        this.sendToClient(ws, {
          type: 'error',
          message: 'Sender or receiver not found'
        });
        return;
      }

      // Save message to database using enrollment IDs
      const newMessage = new Message({
        senderName: ws.user.name,
        senderId: ws.user.id,
        senderEnrollmentId: senderStudent.enrollmentId,
        receiverEnrollmentId: receiverStudent.enrollmentId,
        roomId,
        message,
        senderRegistrationNumber: ws.user.registrationNumber,
        receiverRegistrationNumber,
        receiverName,
        receiverId,
        createdAt: new Date()
      });

      await newMessage.save();

      // Send message to sender (confirmation)
      this.sendToClient(ws, {
        type: 'message_sent',
        message: newMessage
      });

      // Send message to receiver if online
      if (receiverId && this.clients.has(receiverId)) {
        const receiverWs = this.clients.get(receiverId);
        this.sendToClient(receiverWs, {
          type: 'new_message',
          message: newMessage,
          sender: {
            id: ws.user.id,
            name: ws.user.name,
            type: ws.user.type
          }
        });
      }

      // Broadcast to all clients in the same room (for group chats)
      this.broadcastToRoom(roomId, {
        type: 'room_message',
        message: newMessage,
        sender: {
          id: ws.user.id,
          name: ws.user.name,
          type: ws.user.type
        }
      }, ws.user.id);

    } catch (error) {
      console.error('Error saving message:', error);
      this.sendToClient(ws, {
        type: 'error',
        message: 'Failed to send message'
      });
    }
  }

  handleTyping(ws, messageData) {
    const { roomId, isTyping } = messageData;
    
    // Broadcast typing status to room
    this.broadcastToRoom(roomId, {
      type: 'typing',
      user: {
        id: ws.user.id,
        name: ws.user.name
      },
      isTyping
    }, ws.user.id);
  }

  broadcastToRoom(roomId, data, excludeUserId = null) {
    this.clients.forEach((ws, userId) => {
      if (excludeUserId && userId === excludeUserId) return;
      
      if (ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, data);
      }
    });
  }

  sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  sendToUser(userId, data) {
    const ws = this.clients.get(userId);
    if (ws) {
      this.sendToClient(ws, data);
    }
  }

  broadcastToAll(data) {
    this.clients.forEach((ws) => {
      this.sendToClient(ws, data);
    });
  }

  getOnlineUsers() {
    return Array.from(this.clients.values()).map(ws => ws.user);
  }

  getOnlineCount() {
    return this.clients.size;
  }
}

module.exports = ChatServer;
