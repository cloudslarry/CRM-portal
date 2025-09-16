import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import StudentLayout from '../../components/StudentLayout'
import { 
  Box, 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Button, 
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Badge
} from '@mui/material'
import { 
  Message as MessageIcon, 
  Inbox as InboxIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { useTheme } from '../../contexts/ThemeContext'
import api from '../../config/api'
import authToken from '../../redux/utils/authToken'
import toast from 'react-hot-toast'

const StudentChats = () => {
    const { darkMode } = useTheme();
    const student = useSelector((store) => store.student);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

    // Load conversations when component mounts
    useEffect(() => {
        if (student.isAuthenticated) {
            // Set up authentication token
            const token = localStorage.getItem('studentToken');
            if (token) {
                authToken(token);
            }
            loadConversations();
        }
    }, [student.isAuthenticated]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.get(`/api/chat/conversations/${student.student?.student?._id}`);

            if (response.data.success) {
                setConversations(response.data.data);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            setError('Failed to load conversations');
            toast.error('Failed to load conversations');
            
            // For testing purposes, add some mock data if API fails
            if (conversations.length === 0) {
                setConversations([
                    {
                        userId: '1',
                        userName: 'John Doe',
                        userRegistrationNumber: 'REG001',
                        userDepartment: 'Computer Science',
                        lastMessage: {
                            message: 'Hey, how are you doing?',
                            createdAt: new Date().toISOString()
                        },
                        unreadCount: 2
                    },
                    {
                        userId: '2',
                        userName: 'Jane Smith',
                        userRegistrationNumber: 'REG002',
                        userDepartment: 'Electronics',
                        lastMessage: {
                            message: 'Thanks for the help with the assignment!',
                            createdAt: new Date(Date.now() - 3600000).toISOString()
                        },
                        unreadCount: 0
                    },
                    {
                        userId: '3',
                        userName: 'Mike Johnson',
                        userRegistrationNumber: 'REG003',
                        userDepartment: 'Mechanical',
                        lastMessage: {
                            message: 'See you in class tomorrow',
                            createdAt: new Date(Date.now() - 86400000).toISOString()
                        },
                        unreadCount: 1
                    }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadConversations();
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const truncateMessage = (message, maxLength = 50) => {
        if (!message) return 'No messages yet';
        return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
    };

    // Check authentication
    if (!student.isAuthenticated) {
        navigate('/');
        return null;
    }

    return(
      <StudentLayout title="Messages">
        <Container maxWidth="md">
          <Card sx={{ 
            bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
            border: darkMode ? '1px solid #333' : '1px solid #e0e0e0'
          }}>
            <CardContent>
              {/* Header with refresh button */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}>
                <Typography 
                  variant="h5" 
                  fontWeight={700} 
                  sx={{ 
                    color: darkMode ? '#fff' : '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <ChatIcon />
                  Messages
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Box>

              {/* Loading state */}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {/* Error state */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Conversations list */}
              {!loading && !error && (
                <>
                  {conversations.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: darkMode ? '#b0b0b0' : '#666'
                    }}>
                      <MessageIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        No conversations yet
                      </Typography>
                      <Typography variant="body2">
                        Start a conversation by selecting a student from the chat page
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {conversations.map((conversation, index) => (
                        <React.Fragment key={conversation.userId || index}>
                          <ListItem 
                            sx={{
                              '&:hover': {
                                bgcolor: darkMode ? '#2d2d2d' : '#f5f5f5',
                              },
                              borderRadius: 1,
                              mb: 1
                            }}
                            secondaryAction={
                              <Button 
                                variant="contained" 
                                size="small" 
                                component={Link} 
                                to={`/chat`}
                                state={{ selectedStudent: {
                                  _id: conversation.userId,
                                  name: conversation.userName,
                                  registrationNumber: conversation.userRegistrationNumber,
                                  department: conversation.userDepartment
                                }}}
                                sx={{ 
                                  minWidth: 80,
                                  bgcolor: '#1976d2',
                                  '&:hover': {
                                    bgcolor: '#1565c0'
                                  }
                                }}
                              >
                                Chat
                              </Button>
                            }
                          >
                            <ListItemAvatar>
                              <Badge
                                badgeContent={conversation.unreadCount}
                                color="error"
                                invisible={conversation.unreadCount === 0}
                              >
                                <Avatar sx={{ 
                                  bgcolor: darkMode ? '#1976d2' : '#1976d2',
                                  width: 48,
                                  height: 48
                                }}>
                                  <PersonIcon />
                                </Avatar>
                              </Badge>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                      fontWeight: 'bold',
                                      color: darkMode ? '#fff' : '#333'
                                    }}
                                  >
                                    {conversation.userName}
                                  </Typography>
                                  <Chip 
                                    label={conversation.userRegistrationNumber}
                                    size="small"
                                    sx={{ 
                                      height: 20,
                                      fontSize: '0.7rem',
                                      bgcolor: darkMode ? '#333' : '#f0f0f0',
                                      color: darkMode ? '#fff' : '#666'
                                    }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: darkMode ? '#b0b0b0' : '#666',
                                      mb: 0.5
                                    }}
                                  >
                                    {truncateMessage(conversation.lastMessage?.message)}
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        color: darkMode ? '#888' : '#999',
                                        fontSize: '0.75rem'
                                      }}
                                    >
                                      {conversation.userDepartment}
                                    </Typography>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        color: darkMode ? '#888' : '#999',
                                        fontSize: '0.75rem'
                                      }}
                                    >
                                      {conversation.lastMessage?.createdAt && 
                                        formatTime(conversation.lastMessage.createdAt)
                                      }
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < conversations.length - 1 && (
                            <Divider component="li" sx={{ ml: 7 }} />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Container>
      </StudentLayout>
    )
}

export default StudentChats; 
