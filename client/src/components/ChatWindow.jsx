import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  DoubleArrow as DoubleArrowIcon
} from '@mui/icons-material';
import { getAvatarUrl, isValidAvatarUrl } from '../utils/avatarUtils';

const ChatWindow = ({ 
  selectedStudent, 
  messages = [], 
  onSendMessage, 
  onBack, 
  isMobile = false,
  currentUser,
  isLoading = false,
  isConnected = true,
  typingUsers = [],
  onTyping,
  darkMode = false,
  apiUrl = '',
  onEditMessage,
  onDeleteMessage,
  currentUserId
}) => {
  // Use darkMode from props or context
  const themeDarkMode = useTheme().darkMode;
  const isDarkMode = darkMode !== undefined ? darkMode : themeDarkMode;
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [messageStatus, setMessageStatus] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactingToMessage, setReactingToMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicators
  useEffect(() => {
    if (onTyping) {
      const timeout = setTimeout(() => {
        onTyping(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [message, onTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() || attachedFiles.length > 0) {
      const messageData = {
        text: message,
        files: attachedFiles,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        replyTo: replyingTo
      };
      
      onSendMessage(messageData);
      setMessage('');
      setAttachedFiles([]);
      setReplyingTo(null);
      
      // Stop typing indicator
      if (onTyping) {
        onTyping(false);
      }
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    
    // Start typing indicator
    if (onTyping && e.target.value.trim()) {
      onTyping(true);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    const validFiles = [];
    const errors = [];
    
    files.forEach(file => {
      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name} is not a supported file type.`);
        return;
      }
      
      // Check if file already exists
      const exists = attachedFiles.some(existingFile => existingFile.name === file.name);
      if (exists) {
        errors.push(`${file.name} is already attached.`);
        return;
      }
      
      validFiles.push(file);
    });
    
    // Show errors if any
    if (errors.length > 0) {
      errors.forEach(error => {
        console.error('File upload error:', error);
        // You could show toast notifications here
      });
    }
    
    // Add valid files - FIXED: Better file object structure for FormData
    if (validFiles.length > 0) {
      const newFiles = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'doc',
        size: formatFileSize(file.size),
        file: file, // Keep the original file object for FormData
        url: URL.createObjectURL(file)
      }));
      
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    
    // Clear the input
    e.target.value = '';
  };

  const removeFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <PdfIcon sx={{ fontSize: 16 }} />;
      case 'doc':
        return <DocIcon sx={{ fontSize: 16 }} />;
      case 'image':
        return <ImageIcon sx={{ fontSize: 16 }} />;
      default:
        return <AttachFileIcon sx={{ fontSize: 16 }} />;
    }
  };

  const handleMessageMenuOpen = (event, message) => {
    setMessageMenuAnchor(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMessageMenuClose = () => {
    setMessageMenuAnchor(null);
    setSelectedMessage(null);
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
    setMessageMenuAnchor(null);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleMessageReaction = (messageId, emoji) => {
    // This would be implemented with a backend API
    console.log('Reacting to message:', messageId, 'with emoji:', emoji);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleEditMessage = () => {
    if (selectedMessage) {
      setEditingMessage(selectedMessage);
      setEditText(selectedMessage.message || selectedMessage.text);
      setMessage(selectedMessage.message || selectedMessage.text);
    }
    handleMessageMenuClose();
  };

  const handleDeleteMessage = async () => {
    if (selectedMessage && onDeleteMessage) {
      await onDeleteMessage(selectedMessage._id);
    }
    handleMessageMenuClose();
  };

  const handleSaveEdit = async () => {
    if (editingMessage && onEditMessage) {
      await onEditMessage(editingMessage._id, editText);
      setEditingMessage(null);
      setEditText('');
      setMessage('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
    setMessage('');
  };

  const canEditMessage = (message) => {
    if (!message || message.senderId !== currentUserId) return false;
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const maxEditTime = 15 * 60 * 1000; // 15 minutes
    return messageAge <= maxEditTime;
  };

  // Format file size helper function
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!selectedStudent) {
    return (
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 4,
        bgcolor: isDarkMode ? '#1e1e1e' : '#f5f5f5'
      }}>
        <Avatar sx={{ 
          width: 80, 
          height: 80, 
          mb: 2,
          bgcolor: isDarkMode ? '#333' : '#e0e0e0'
        }}>
          <PersonIcon sx={{ fontSize: 40, color: isDarkMode ? '#666' : '#999' }} />
        </Avatar>
        <Typography variant="h5" sx={{ 
          mb: 1, 
          color: isDarkMode ? '#fff' : '#333',
          fontWeight: 500
        }}>
          Select a student to start chat
        </Typography>
        <Typography variant="body2" sx={{ 
          color: isDarkMode ? '#b0b0b0' : '#666',
          textAlign: 'center'
        }}>
          Choose a student from the list to begin your conversation
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: isDarkMode ? '#1e1e1e' : '#ffffff',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Chat Header */}
      <Paper elevation={1} sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        bgcolor: isDarkMode ? '#2d2d2d' : '#f5f5f5',
        borderRadius: 0
      }}>
        <IconButton
          onClick={onBack}
          sx={{ mr: 2, color: isDarkMode ? '#fff' : '#666' }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Avatar sx={{ 
          mr: 2,
          bgcolor: '#1976d2',
          width: 40,
          height: 40
        }}>
          {getAvatarUrl(selectedStudent.avatar) && isValidAvatarUrl(getAvatarUrl(selectedStudent.avatar)) ? (
            <img 
              src={getAvatarUrl(selectedStudent.avatar)} 
              alt={selectedStudent.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <PersonIcon style={{ display: getAvatarUrl(selectedStudent.avatar) ? 'none' : 'flex' }} />
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ 
              color: isDarkMode ? '#fff' : '#333',
              fontWeight: 600
            }}>
              {selectedStudent.name}
            </Typography>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#4caf50', // Online status - you can make this dynamic
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 }
              }
            }} />
          </Box>
          <Typography variant="body2" sx={{ 
            color: isDarkMode ? '#b0b0b0' : '#666'
          }}>
            {selectedStudent.registrationNumber} • {selectedStudent.department}
          </Typography>
        </Box>
        
      </Paper>

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        bgcolor: isDarkMode ? '#1e1e1e' : '#f5f5f5',
        height: 'calc(100vh - 200px)', // Fixed height for independent scrolling
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: isDarkMode ? '#333' : '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: isDarkMode ? '#666' : '#c1c1c1',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: isDarkMode ? '#888' : '#a8a8a8',
        },
      }}>
        {messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            textAlign: 'center'
          }}>
            <Typography variant="h6" sx={{ 
              color: isDarkMode ? '#b0b0b0' : '#666',
              mb: 1
            }}>
              No messages yet
            </Typography>
            <Typography variant="body2" sx={{ 
              color: isDarkMode ? '#888' : '#999'
            }}>
              Start the conversation by sending a message
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => (
            <Box
              key={msg.uniqueKey || msg.id || msg._id}
              sx={{ 
                display: 'flex', 
                justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                mb: 2,
                position: 'relative'
              }}
            >
              <Paper
                elevation={msg.sender === 'me' ? 2 : 1}
                sx={{
                  maxWidth: { xs: '80%', sm: '70%', md: '60%' },
                  px: 2,
                  py: 1,
                  bgcolor: msg.sender === 'me'
                    ? '#1976d2'
                    : isDarkMode
                      ? '#2d2d2d'
                      : '#ffffff',
                  color: msg.sender === 'me'
                    ? '#ffffff'
                    : isDarkMode
                      ? '#ffffff'
                      : '#333',
                  borderRadius: msg.sender === 'me' 
                    ? '18px 18px 4px 18px' 
                    : '18px 18px 18px 4px',
                  border: msg.sender === 'me' 
                    ? 'none' 
                    : isDarkMode 
                      ? '1px solid #444' 
                      : '1px solid #e0e0e0',
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: msg.sender === 'me' ? 3 : 2,
                    bgcolor: msg.sender === 'me'
                      ? '#1565c0'
                      : isDarkMode
                        ? '#333'
                        : '#f8f9fa'
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'messageSlideIn 0.3s ease-out',
                  '@keyframes messageSlideIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(10px) scale(0.95)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0) scale(1)'
                    }
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleMessageMenuOpen(e, msg);
                }}
              >
                {/* Reply Context */}
                {msg.replyTo && (
                  <Box sx={{
                    borderLeft: `3px solid ${msg.sender === 'me' ? 'rgba(255,255,255,0.5)' : '#1976d2'}`,
                    pl: 1,
                    mb: 1,
                    bgcolor: msg.sender === 'me' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    borderRadius: '4px'
                  }}>
                    <Typography variant="caption" sx={{ 
                      fontSize: '0.7rem',
                      opacity: 0.8,
                      display: 'block'
                    }}>
                      Replying to {msg.replyTo.sender === 'me' ? 'yourself' : selectedStudent?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontSize: '0.8rem',
                      opacity: 0.9,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {msg.replyTo.message || msg.replyTo.text}
                    </Typography>
                  </Box>
                )}

                {/* Message Menu Button (only for own messages) */}
                {msg.sender === 'me' && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleMessageMenuOpen(e, msg)}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: isDarkMode ? '#444' : '#f5f5f5',
                      color: isDarkMode ? '#fff' : '#666',
                      width: 24,
                      height: 24,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '&:hover': {
                        bgcolor: isDarkMode ? '#555' : '#e0e0e0',
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0';
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}

                <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                  {msg.text || msg.message}
                  {msg.isEdited && (
                    <Typography 
                      component="span" 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        fontStyle: 'italic', 
                        opacity: 0.7,
                        fontSize: '0.7rem'
                      }}
                    >
                      (edited)
                    </Typography>
                  )}
                </Typography>
                
                {/* File Attachments */}
                {(msg.fileUrl || (msg.files && msg.files.length > 0)) && (
                  <Box sx={{ mt: 1 }}>
                    {msg.fileUrl && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: msg.sender === 'me' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        border: `1px solid ${msg.sender === 'me' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: msg.sender === 'me' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                        }
                      }}
                      onClick={() => {
                        let fileUrl;
                        if (msg.fileUrl.startsWith('http')) {
                          fileUrl = msg.fileUrl;
                        } else if (msg.fileUrl.startsWith('/uploads/chatDocs/')) {
                          // Extract filename from the path
                          const filename = msg.fileUrl.split('/').pop();
                          fileUrl = `${apiUrl}/api/chat/files/${filename}`;
                        } else {
                          fileUrl = `${apiUrl}${msg.fileUrl}`;
                        }
                        
                        // IMPROVED: Better file download handling
                        try {
                          // For images, open in new tab
                          if (msg.fileType && msg.fileType.startsWith('image/')) {
                            window.open(fileUrl, '_blank');
                          } else {
                            // For other files, trigger download
                            const link = document.createElement('a');
                            link.href = fileUrl;
                            link.download = msg.fileName || 'download';
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        } catch (error) {
                          console.error('Error downloading file:', error);
                          // Fallback to opening in new tab
                          window.open(fileUrl, '_blank');
                        }
                      }}
                      >
                        {getFileIcon(msg.fileType)}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {msg.fileName || 'File'}
                          </Typography>
                          {msg.fileSize && (
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {formatFileSize ? formatFileSize(msg.fileSize) : `${(msg.fileSize / 1024).toFixed(1)} KB`}
                            </Typography>
                          )}
                        </Box>
                        <DownloadIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                      </Box>
                    )}
                    {msg.files && msg.files.map((file, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: msg.sender === 'me' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        border: `1px solid ${msg.sender === 'me' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: msg.sender === 'me' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                        }
                      }}
                      onClick={() => {
                        // IMPROVED: Better file download handling for attached files
                        try {
                          if (file.type === 'image') {
                            window.open(file.url, '_blank');
                          } else {
                            const link = document.createElement('a');
                            link.href = file.url;
                            link.download = file.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        } catch (error) {
                          console.error('Error downloading attached file:', error);
                          window.open(file.url, '_blank');
                        }
                      }}
                      >
                        {getFileIcon(file.type)}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {file.size}
                          </Typography>
                        </Box>
                        <DownloadIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                      </Box>
                    ))}
                  </Box>
                )}
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 0.5
                }}>
                  <Typography variant="caption" sx={{ 
                    opacity: 0.7,
                    fontSize: '0.7rem'
                  }}>
                    {formatTime(msg.createdAt || msg.timestamp)}
                  </Typography>
                  
                  {/* Message Status Indicators */}
                  {msg.sender === 'me' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                      {msg.isRead ? (
                        <CheckCircleIcon sx={{ fontSize: 12, color: '#4caf50' }} />
                      ) : (
                        <CheckIcon sx={{ fontSize: 12, opacity: 0.7 }} />
                      )}
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
        
        {/* Message Menu */}
        <Menu
          anchorEl={messageMenuAnchor}
          open={Boolean(messageMenuAnchor)}
          onClose={handleMessageMenuClose}
          PaperProps={{
            sx: { minWidth: 120 }
          }}
        >
          <MenuItem onClick={() => handleReplyToMessage(selectedMessage)}>
            <ReplyIcon sx={{ mr: 1, fontSize: 16 }} />
            Reply
          </MenuItem>
          {selectedMessage && canEditMessage(selectedMessage) && (
            <MenuItem onClick={handleEditMessage}>
              <EditIcon sx={{ mr: 1, fontSize: 16 }} />
              Edit
            </MenuItem>
          )}
          <MenuItem onClick={handleDeleteMessage} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1, fontSize: 16 }} />
            Delete
          </MenuItem>
        </Menu>
        
        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            p: 1,
            animation: 'fadeIn 0.3s ease-in',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: '20px',
              bgcolor: isDarkMode ? '#333' : '#e0e0e0',
              border: `1px solid ${isDarkMode ? '#444' : '#d0d0d0'}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: isDarkMode ? '#1976d2' : '#1976d2',
                      animation: 'bounce 1.4s infinite',
                      animationDelay: `${i * 0.16}s`,
                      '@keyframes bounce': {
                        '0%, 80%, 100%': { 
                          transform: 'scale(0)',
                          opacity: 0.3
                        },
                        '40%': { 
                          transform: 'scale(1)',
                          opacity: 1
                        }
                      }
                    }}
                  />
                ))}
              </Box>
              <Typography variant="caption" sx={{ 
                color: isDarkMode ? '#b0b0b0' : '#666',
                fontSize: '0.7rem',
                fontWeight: 500
              }}>
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}`,
          bgcolor: isDarkMode ? '#2d2d2d' : '#f5f5f5'
        }}>
          <Typography variant="body2" sx={{ 
            color: isDarkMode ? '#b0b0b0' : '#666',
            mb: 1,
            fontWeight: 'bold'
          }}>
            Attached Files ({attachedFiles.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {attachedFiles.map((file) => (
              <Box
                key={file.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: isDarkMode ? '#333' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}`,
                  minWidth: 200,
                  maxWidth: 300
                }}
              >
                {getFileIcon(file.type)}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: isDarkMode ? '#888' : '#666',
                    opacity: 0.8
                  }}>
                    {file.size}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => removeFile(file.id)}
                  sx={{ 
                    color: isDarkMode ? '#ff4444' : '#d32f2f',
                    '&:hover': {
                      bgcolor: isDarkMode ? 'rgba(255, 68, 68, 0.1)' : 'rgba(211, 47, 47, 0.1)'
                    }
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Reply Preview */}
      {replyingTo && (
        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}`,
          bgcolor: isDarkMode ? '#333' : '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <ReplyIcon sx={{ mr: 1, fontSize: 16, color: '#1976d2' }} />
            <Box>
              <Typography variant="caption" sx={{ 
                fontSize: '0.7rem',
                color: isDarkMode ? '#b0b0b0' : '#666',
                display: 'block'
              }}>
                Replying to {replyingTo.sender === 'me' ? 'yourself' : selectedStudent?.name}
              </Typography>
              <Typography variant="body2" sx={{ 
                fontSize: '0.8rem',
                color: isDarkMode ? '#fff' : '#333',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '200px'
              }}>
                {replyingTo.message || replyingTo.text}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            size="small" 
            onClick={handleCancelReply}
            sx={{ color: isDarkMode ? '#b0b0b0' : '#666' }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}

      {/* Message Input */}
      <Box sx={{ 
        p: 2, 
        borderTop: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}`,
        bgcolor: isDarkMode ? '#2d2d2d' : '#ffffff',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}>
        <Box component="form" onSubmit={handleSendMessage} sx={{ 
          display: 'flex', 
          gap: 1, 
          alignItems: 'flex-end',
          bgcolor: isDarkMode ? '#1e1e1e' : '#f8f9fa',
          borderRadius: '25px',
          p: 1,
          border: `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}`,
          '&:focus-within': {
            borderColor: '#1976d2',
            boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
          },
          transition: 'all 0.2s ease'
        }}>
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            sx={{ 
              color: isDarkMode ? '#b0b0b0' : '#666',
              '&:hover': {
                bgcolor: isDarkMode ? '#333' : '#e0e0e0',
                color: '#1976d2'
              },
              transition: 'all 0.2s ease'
            }}
            title="Attach file"
          >
            <AttachFileIcon />
          </IconButton>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={message}
            onChange={handleMessageChange}
            placeholder={editingMessage ? "Edit message..." : "Type a message..."}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '0.95rem',
                '& input': {
                  padding: '8px 0',
                },
                '& textarea': {
                  padding: '8px 0',
                }
              }
            }}
            sx={{
              '& .MuiInputBase-root': {
                color: isDarkMode ? '#fff' : '#333',
                '&::placeholder': {
                  color: isDarkMode ? '#888' : '#999',
                  opacity: 1,
                },
              },
            }}
          />
          
          {editingMessage ? (
            <>
              <IconButton
                onClick={handleCancelEdit}
                sx={{ 
                  color: isDarkMode ? '#666' : '#999',
                  '&:hover': {
                    bgcolor: isDarkMode ? '#333' : '#e0e0e0',
                    color: '#d32f2f'
                  },
                  transition: 'all 0.2s ease'
                }}
                title="Cancel edit"
              >
                <CloseIcon />
              </IconButton>
              <IconButton
                onClick={handleSaveEdit}
                disabled={!message.trim() || isLoading}
                sx={{
                  bgcolor: message.trim() && !isLoading ? '#1976d2' : 'transparent',
                  color: message.trim() && !isLoading ? '#fff' : (isDarkMode ? '#666' : '#999'),
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  '&:hover': {
                    bgcolor: message.trim() && !isLoading ? '#1565c0' : 'transparent',
                    transform: message.trim() && !isLoading ? 'scale(1.1)' : 'none'
                  },
                  '&:disabled': {
                    bgcolor: 'transparent',
                    color: isDarkMode ? '#666' : '#999',
                  },
                  transition: 'all 0.2s ease'
                }}
                title="Save changes"
              >
                {isLoading ? (
                  <CircularProgress size={20} sx={{ color: 'inherit' }} />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </>
          ) : (
            <IconButton
              type="submit"
              disabled={(!message.trim() && attachedFiles.length === 0) || isLoading}
              sx={{
                bgcolor: (message.trim() || attachedFiles.length > 0) && !isLoading ? '#1976d2' : 'transparent',
                color: (message.trim() || attachedFiles.length > 0) && !isLoading ? '#fff' : (isDarkMode ? '#666' : '#999'),
                borderRadius: '50%',
                width: 36,
                height: 36,
                '&:hover': {
                  bgcolor: (message.trim() || attachedFiles.length > 0) && !isLoading ? '#1565c0' : 'transparent',
                  transform: (message.trim() || attachedFiles.length > 0) && !isLoading ? 'scale(1.1)' : 'none'
                },
                '&:disabled': {
                  bgcolor: 'transparent',
                  color: isDarkMode ? '#666' : '#999',
                },
                transition: 'all 0.2s ease'
              }}
              title="Send message"
            >
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: 'inherit' }} />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatWindow;