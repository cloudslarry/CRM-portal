const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { upload, handleMulterError } = require('../utils/chatMulter');
const { verifyToken } = require('../middleware/authMiddleware');
const path = require('path');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Serve uploaded files
router.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../../uploads/chatDocs', filename);
  
  // Check if file exists
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
});

// Send a message (with optional file upload)
router.post('/send', upload.array('files', 5), handleMulterError, chatController.sendMessage);

// Get all conversations for a user (must come before /:userId/:receiverId)
router.get('/conversations/:userId', chatController.getUserConversations);

// Search messages (must come before /:userId/:receiverId)
router.get('/search/:userId', chatController.searchMessages);

// Get chat history between two users using enrollment IDs
router.get('/:senderEnrollmentId/:receiverEnrollmentId', chatController.getChatHistory);

// Mark messages as read
router.put('/mark-read', chatController.markAsRead);

// Delete a message
router.delete('/:messageId', chatController.deleteMessage);

// Edit a message
router.put('/:messageId/edit', chatController.editMessage);

// Get notifications for a user
router.get('/notifications/:userId', chatController.getUserNotifications);

// Mark notification as read
router.put('/notifications/:notificationId/read', chatController.markNotificationAsRead);

// Mark all notifications as read
router.put('/notifications/mark-all-read', chatController.markAllNotificationsAsRead);

module.exports = router;
