const Message = require('../models/Message');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');
const path = require('path');

// Send a message
const sendMessage = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received files:', req.files);
    
    const {
      senderId,
      receiverId,
      message,
      senderName,
      receiverName,
      senderRegistrationNumber,
      receiverRegistrationNumber,
      roomId,
      replyTo,
      replyMessage,
      replySender,
      replySenderId
    } = req.body;

    console.log('Extracted fields:', {
      senderId,
      receiverId,
      message,
      senderName,
      receiverName,
      senderRegistrationNumber,
      receiverRegistrationNumber,
      roomId
    });

    // Validate required fields - IMPROVED: Better validation for file uploads
    if (!senderId || !receiverId) {
      console.error('Missing required fields:', { 
        senderId, 
        receiverId, 
        senderIdType: typeof senderId,
        receiverIdType: typeof receiverId,
        bodyKeys: Object.keys(req.body),
        filesCount: req.files ? req.files.length : 0
      });
      return res.status(400).json({
        success: false,
        message: 'Sender ID and Receiver ID are required'
      });
    }

    // Check if message or file is provided - IMPROVED: Better file validation
    if (!message && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Message text or file is required'
      });
    }

    // Handle file uploads - IMPROVED: Better file handling
    let fileData = null;
    if (req.files && req.files.length > 0) {
      const file = req.files[0]; // Take the first file
      
      console.log('Received file:', {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname
      });
      
      // Validate file data
      if (!file.filename || !file.originalname || !file.mimetype) {
        console.error('Invalid file data:', file);
        return res.status(400).json({
          success: false,
          message: 'Invalid file data received'
        });
      }
      
      fileData = {
        fileUrl: `/uploads/chatDocs/${file.filename}`,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size
      };
      console.log('File uploaded successfully:', fileData);
    }

    // Create message object
    const messageData = {
      senderId,
      receiverId,
      message: message || '',
      senderName,
      receiverName,
      senderRegistrationNumber,
      receiverRegistrationNumber,
      roomId,
      replyTo: replyTo || null,
      replyMessage: replyMessage || null,
      replySender: replySender || null,
      replySenderId: replySenderId || null,
      ...fileData
    };

    // Save message to database
    const newMessage = new Message(messageData);
    await newMessage.save();

    // Populate sender and receiver details
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'name registrationNumber')
      .populate('receiverId', 'name registrationNumber');

    // Create notification for the receiver
    try {
      const notification = new Notification({
        title: 'New Message',
        message: `You received a new message from ${senderName}`,
        type: 'info',
        recipient: receiverId,
        recipientType: 'student',
        relatedEntity: newMessage._id,
        relatedEntityType: 'message',
        isRead: false
      });
      await notification.save();
      console.log('Notification created for message:', notification._id);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the message sending if notification creation fails
    }

    // Real-time notifications are handled in server.js via socket events
    // No need to import socket.io-client on the server side

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get chat history between two users
const getChatHistory = async (req, res) => {
  try {
    const { userId, receiverId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Validate parameters
    if (!userId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Receiver ID are required'
      });
    }

    // Convert userIds to ObjectIds with validation
    const mongoose = require('mongoose');
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver ID format'
      });
    }
    
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get messages between the two users (excluding deleted messages)
    const messages = await Message.find({
      $or: [
        { senderId: userObjectId, receiverId: receiverObjectId },
        { senderId: receiverObjectId, receiverId: userObjectId }
      ],
      isDeleted: { $ne: true }
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .populate('senderId', 'name registrationNumber')
    .populate('receiverId', 'name registrationNumber');

    // Get total count for pagination
    const totalMessages = await Message.countDocuments({
      $or: [
        { senderId: userObjectId, receiverId: receiverObjectId },
        { senderId: receiverObjectId, receiverId: userObjectId }
      ]
    });

    // Get user details
    const [sender, receiver] = await Promise.all([
      Student.findById(userObjectId).select('name registrationNumber department'),
      Student.findById(receiverObjectId).select('name registrationNumber department')
    ]);

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to get chronological order
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / parseInt(limit)),
          totalMessages,
          hasNextPage: skip + messages.length < totalMessages,
          hasPrevPage: parseInt(page) > 1
        },
        users: {
          sender: sender || null,
          receiver: receiver || null
        }
      }
    });

  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all conversations for a user
const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Convert userId to ObjectId
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get all unique conversations for the user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userObjectId },
            { receiverId: userObjectId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', userObjectId] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', userObjectId] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userRegistrationNumber: '$user.registrationNumber',
          userDepartment: '$user.department',
          lastMessage: {
            message: '$lastMessage.message',
            fileUrl: '$lastMessage.fileUrl',
            fileName: '$lastMessage.fileName',
            createdAt: '$lastMessage.createdAt',
            senderId: '$lastMessage.senderId'
          },
          unreadCount: '$unreadCount'
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: conversations
    });

  } catch (error) {
    console.error('Error getting user conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { userId, senderId } = req.body;

    if (!userId || !senderId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Sender ID are required'
      });
    }

    // Mark messages as read
    await Message.updateMany(
      {
        senderId: senderId,
        receiverId: userId,
        isRead: { $ne: true }
      },
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    if (!messageId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID and User ID are required'
      });
    }

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Soft delete - mark as deleted instead of removing
    await Message.findByIdAndUpdate(messageId, {
      isDeleted: true,
      deletedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Edit a message
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, newMessage } = req.body;

    if (!messageId || !userId || !newMessage) {
      return res.status(400).json({
        success: false,
        message: 'Message ID, User ID, and new message are required'
      });
    }

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    // Check if message is not too old (e.g., within 15 minutes)
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const maxEditTime = 15 * 60 * 1000; // 15 minutes in milliseconds

    if (messageAge > maxEditTime) {
      return res.status(400).json({
        success: false,
        message: 'Message is too old to edit'
      });
    }

    // Update the message
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        message: newMessage,
        isEdited: true,
        editedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Message edited successfully',
      data: updatedMessage
    });

  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search messages
const searchMessages = async (req, res) => {
  try {
    const { userId, query } = req.query;
    const { page = 1, limit = 20 } = req.query;

    if (!userId || !query) {
      return res.status(400).json({
        success: false,
        message: 'User ID and search query are required'
      });
    }

    // Convert userId to ObjectId
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search messages containing the query
    const messages = await Message.find({
      $or: [
        { senderId: userObjectId },
        { receiverId: userObjectId }
      ],
      $text: { $search: query }
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .populate('senderId', 'name registrationNumber')
    .populate('receiverId', 'name registrationNumber');

    const totalMessages = await Message.countDocuments({
      $or: [
        { senderId: userObjectId },
        { receiverId: userObjectId }
      ],
      $text: { $search: query }
    });

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / parseInt(limit)),
          totalMessages,
          hasNextPage: skip + messages.length < totalMessages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalNotifications = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalNotifications / parseInt(limit)),
          totalNotifications,
          unreadCount,
          hasNextPage: skip + notifications.length < totalNotifications,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    if (!notificationId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Notification ID and User ID are required'
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getUserConversations,
  markAsRead,
  deleteMessage,
  editMessage,
  searchMessages,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
