import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  InputAdornment,
  Chip,
  Badge,
  useMediaQuery,
  useTheme as useMuiTheme,
  CircularProgress,
  Link,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Phone as PhoneIcon,
  VideoCall as VideoCallIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Image as ImageIcon,
  Add as AddIcon
} from '@mui/icons-material';
import Message from '../components/Message';
import ChatWindow from '../components/ChatWindow';
import { getPrivateConversation, sendMessage } from '../redux/actions/studentAction';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '../config/api';
import authToken from '../redux/utils/authToken';
import { jwtDecode } from 'jwt-decode';
import { setStudentUser } from '../redux/actions/studentAction';
import { setAdminUser } from '../redux/actions/adminAction';

const Chat = () => {
  const { darkMode } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef();

  // Redux state
  const student = useSelector((store) => store.student);
  const admin = useSelector((store) => store.admin);

  // Local state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [messageArray, setMessageArray] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [socket, setSocket] = useState(null);
  const [room1, setRoom1] = useState('');
  const [room2, setRoom2] = useState('');
  const [receiverRegistrationNumber, setReceiverRegistrationNumber] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [authLoadingTimeout, setAuthLoadingTimeout] = useState(false);
  const [userIdFromToken, setUserIdFromToken] = useState(null);

  // Student data loaded from API - FIXED: Better state management
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [showAllStudents, setShowAllStudents] = useState(false); // Start with recent chats only
  const [lastLoadTime, setLastLoadTime] = useState(0); // Prevent rapid reloads
  const [recentChats, setRecentChats] = useState(new Set()); // Track students who have been chatted with
  const [processedMessages, setProcessedMessages] = useState(new Set()); // Track processed messages to prevent duplicates
  const [isSwitchingChat, setIsSwitchingChat] = useState(false); // Track when switching chats
  const [sentMessages, setSentMessages] = useState(new Set()); // Track messages sent by current user

  // Load recent chats from localStorage on component mount - IMPROVED: Better persistence
  useEffect(() => {
    const savedRecentChats = localStorage.getItem('recentChats');
    if (savedRecentChats) {
      try {
        const parsedChats = JSON.parse(savedRecentChats);
        setRecentChats(new Set(parsedChats));
        console.log('Loaded recent chats from localStorage:', parsedChats);
      } catch (error) {
        console.error('Error loading recent chats from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('recentChats');
      }
    }
  }, []);

  // Save recent chats to localStorage whenever it changes - IMPROVED: Better persistence
  useEffect(() => {
    if (recentChats.size > 0) {
      try {
        localStorage.setItem('recentChats', JSON.stringify([...recentChats]));
        console.log('Saved recent chats to localStorage:', [...recentChats]);
      } catch (error) {
        console.error('Error saving recent chats to localStorage:', error);
      }
    }
  }, [recentChats]);


  const socketUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
  const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Debounced search to improve performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter students based on search term - FIXED: Better search functionality
  const filteredStudents = React.useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return students;
    }
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchLower) ||
      student.registrationNumber.toLowerCase().includes(searchLower) ||
      student.department.toLowerCase().includes(searchLower)
    );
    
    console.log('Search results:', { 
      searchTerm: debouncedSearchTerm, 
      totalStudents: students.length, 
      filteredCount: filtered.length 
    });
    
    return filtered;
  }, [students, debouncedSearchTerm]);

  // Get current user info - IMPROVED: Better fallbacks for file uploads
  const currentUser = student.isAuthenticated ? student : admin;
  const currentUserId = student.isAuthenticated 
    ? student.student?._id 
    : admin.isAuthenticated 
      ? admin.admin?._id 
      : null;
  
  // Get user data with better fallbacks - IMPROVED: More robust user data retrieval
  const getUserDataFromToken = () => {
    try {
      const studentToken = localStorage.getItem('studentToken');
      const adminToken = localStorage.getItem('adminToken');
      const token = localStorage.getItem('token');
      
      console.log('Available tokens:', { studentToken: !!studentToken, adminToken: !!adminToken, token: !!token });
      
      if (studentToken) {
        const decoded = jwtDecode(studentToken);
        console.log('Decoded student token:', decoded);
        return {
          name: decoded.name || decoded.userName || decoded.user?.name || 'Student User',
          registrationNumber: decoded.registrationNumber || decoded.regNumber || decoded.user?.registrationNumber || 'STU000000',
          id: decoded._id || decoded.id || decoded.userId || decoded.user?._id
        };
      } else if (adminToken) {
        const decoded = jwtDecode(adminToken);
        console.log('Decoded admin token:', decoded);
        return {
          name: decoded.name || decoded.userName || decoded.user?.name || 'Admin User',
          registrationNumber: decoded.registrationNumber || decoded.regNumber || decoded.user?.registrationNumber || 'ADMIN',
          id: decoded._id || decoded.id || decoded.userId || decoded.user?._id
        };
      } else if (token) {
        const decoded = jwtDecode(token);
        console.log('Decoded generic token:', decoded);
        return {
          name: decoded.name || decoded.userName || decoded.user?.name || 'User',
          registrationNumber: decoded.registrationNumber || decoded.regNumber || decoded.user?.registrationNumber || 'USER',
          id: decoded._id || decoded.id || decoded.userId || decoded.user?._id
        };
      }
    } catch (error) {
      console.error('Error getting user data from token:', error);
    }
    return {
      name: 'Unknown User',
      registrationNumber: 'UNKNOWN',
      id: null
    };
  };
  
  const tokenUserData = getUserDataFromToken();
  
  const currentUserName = student.isAuthenticated 
    ? (student.student?.name || student.student?.userName || tokenUserData.name)
    : admin.isAuthenticated 
      ? (admin.admin?.name || admin.admin?.userName || tokenUserData.name)
      : tokenUserData.name;
      
  const currentUserRegNumber = student.isAuthenticated 
    ? (student.student?.registrationNumber || student.student?.regNumber || tokenUserData.registrationNumber)
    : admin.isAuthenticated 
      ? (admin.admin?.registrationNumber || admin.admin?.regNumber || tokenUserData.registrationNumber)
      : tokenUserData.registrationNumber;

  // Fallback: Try to get user ID from token if Redux state is not populated
  const getUserIdFromToken = () => {
    try {
      const studentToken = localStorage.getItem('studentToken');
      const adminToken = localStorage.getItem('adminToken');
      const token = localStorage.getItem('token');
      
      if (studentToken) {
        const decoded = jwtDecode(studentToken);
        console.log('Student token decoded:', decoded);
        return decoded._id || decoded.id || decoded.userId;
      } else if (adminToken) {
        const decoded = jwtDecode(adminToken);
        console.log('Admin token decoded:', decoded);
        return decoded._id || decoded.id || decoded.userId;
      } else if (token) {
        const decoded = jwtDecode(token);
        console.log('Generic token decoded:', decoded);
        return decoded._id || decoded.id || decoded.userId;
      }
    } catch (error) {
      console.error('Error getting user ID from token:', error);
    }
    return null;
  };

  const userIdFromTokenLocal = getUserIdFromToken();

  // Use fallback if currentUserId is null - IMPROVED: Better fallback logic
  const effectiveUserId = currentUserId || userIdFromToken || userIdFromTokenLocal || tokenUserData.id;

  // Debug user info - IMPROVED: More comprehensive debugging (moved after effectiveUserId declaration)
  console.log('Current user info:', {
    currentUserId,
    currentUserName,
    currentUserRegNumber,
    studentAuth: student.isAuthenticated,
    adminAuth: admin.isAuthenticated,
    studentData: student.student,
    adminData: admin.admin,
    tokenUserData,
    effectiveUserId,
    userIdFromToken,
    userIdFromTokenLocal
  });
  
  // FIXED: Additional debugging for file uploads
  console.log('User data sources:', {
    'student.student': student.student,
    'admin.admin': admin.admin,
    'tokenUserData': tokenUserData,
    'localStorage.studentToken': localStorage.getItem('studentToken') ? 'exists' : 'missing',
    'localStorage.adminToken': localStorage.getItem('adminToken') ? 'exists' : 'missing',
    'localStorage.token': localStorage.getItem('token') ? 'exists' : 'missing'
  });

  // Force refresh conversations when needed
  const refreshConversations = async () => {
    if (effectiveUserId && allStudents.length > 0) {
      console.log('Force refreshing conversations...');
      await loadUnreadCounts(allStudents);
    }
  };

  // Periodic refresh to keep conversations updated - IMPROVED: Less frequent updates
  useEffect(() => {
    if (effectiveUserId && allStudents.length > 0) {
      const interval = setInterval(() => {
        // Only refresh if not currently loading
        if (!studentsLoading) {
          refreshConversations();
        }
      }, 60000); // Refresh every 60 seconds instead of 30

      return () => clearInterval(interval);
    }
  }, [effectiveUserId, allStudents.length, studentsLoading]);
  
  console.log('User ID Debug:', {
    currentUserId,
    userIdFromToken,
    userIdFromTokenLocal,
    effectiveUserId,
    hasStudentToken: !!localStorage.getItem('studentToken'),
    hasAdminToken: !!localStorage.getItem('adminToken'),
    hasToken: !!localStorage.getItem('token')
  });

  // Set up authentication token and load user data
  useEffect(() => {
    const studentToken = localStorage.getItem('studentToken');
    const adminToken = localStorage.getItem('adminToken');
    const token = localStorage.getItem('token');
    
    if (studentToken) {
      console.log('Found student token, decoding...');
      authToken(studentToken);
      const decoded = jwtDecode(studentToken);
      console.log('Decoded student token:', decoded);
      dispatch(setStudentUser(decoded));
      
      // Set user ID from token
      const userId = decoded._id || decoded.id || decoded.userId;
      setUserIdFromToken(userId);
      console.log('Set userIdFromToken:', userId);
      
      // Check if token expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.log('Student token expired');
        localStorage.removeItem('studentToken');
        navigate('/');
        return;
      }
    } else if (adminToken) {
      console.log('Found admin token, decoding...');
      authToken(adminToken);
      const decoded = jwtDecode(adminToken);
      console.log('Decoded admin token:', decoded);
      dispatch(setAdminUser(decoded));
      
      // Set user ID from token
      const userId = decoded._id || decoded.id || decoded.userId;
      setUserIdFromToken(userId);
      console.log('Set userIdFromToken:', userId);
      
      // Check if token expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.log('Admin token expired');
        localStorage.removeItem('adminToken');
        navigate('/');
        return;
      }
    } else if (token) {
      console.log('Found generic token, decoding...');
      authToken(token);
      // Try to decode and determine user type
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded generic token:', decoded);
        
        // Set user ID from token
        const userId = decoded._id || decoded.id || decoded.userId;
        setUserIdFromToken(userId);
        console.log('Set userIdFromToken:', userId);
        
        // You might need to adjust this based on your token structure
        if (decoded.userType === 'student') {
          dispatch(setStudentUser(decoded));
        } else if (decoded.userType === 'admin') {
          dispatch(setAdminUser(decoded));
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.log('No authentication tokens found');
    }
  }, [dispatch, navigate]);

  // Immediate user ID extraction from token
  useEffect(() => {
    const extractUserIdFromToken = () => {
      try {
        const studentToken = localStorage.getItem('studentToken');
        const adminToken = localStorage.getItem('adminToken');
        const token = localStorage.getItem('token');
        
        if (studentToken) {
          const decoded = jwtDecode(studentToken);
          const userId = decoded._id || decoded.id || decoded.userId;
          if (userId && !userIdFromToken) {
            setUserIdFromToken(userId);
            console.log('Immediate userIdFromToken set:', userId);
          }
        } else if (adminToken) {
          const decoded = jwtDecode(adminToken);
          const userId = decoded._id || decoded.id || decoded.userId;
          if (userId && !userIdFromToken) {
            setUserIdFromToken(userId);
            console.log('Immediate userIdFromToken set:', userId);
          }
        } else if (token) {
          const decoded = jwtDecode(token);
          const userId = decoded._id || decoded.id || decoded.userId;
          if (userId && !userIdFromToken) {
            setUserIdFromToken(userId);
            console.log('Immediate userIdFromToken set:', userId);
          }
        }
      } catch (error) {
        console.error('Error in immediate user ID extraction:', error);
      }
    };

    extractUserIdFromToken();
  }, []);

  // Set timeout for authentication loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!effectiveUserId) {
        setAuthLoadingTimeout(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [effectiveUserId]);

  // Debug authentication state
  useEffect(() => {
    console.log('Authentication Debug:', {
      studentAuth: student.isAuthenticated,
      adminAuth: admin.isAuthenticated,
      studentData: student.student,
      adminData: admin.admin,
      currentUserId,
      effectiveUserId,
      currentUserName
    });
  }, [student, admin, currentUserId, effectiveUserId, currentUserName]);

  // Load students for chat selection - FIXED: Prevent infinite loops and continuous loading
  useEffect(() => {
    if (effectiveUserId && !studentsLoading) {
      console.log('Effective user ID found, loading students...', effectiveUserId);
      loadStudents();
    } else if (!effectiveUserId) {
      console.log('No effective user ID, waiting for authentication...');
      // FIXED: Clear loading state if no user ID after timeout
      const timeoutId = setTimeout(() => {
        if (!effectiveUserId) {
          setStudentsLoading(false);
        }
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [effectiveUserId]); // Removed studentsLoading dependency to prevent loops

  // Fallback: Load students even if effectiveUserId is not available after timeout
  useEffect(() => {
    if (authLoadingTimeout && !effectiveUserId && !studentsLoading) {
      console.log('Authentication timeout, trying to load students anyway...');
      loadStudents();
    }
  }, [authLoadingTimeout, effectiveUserId]);

  // FIXED: Additional fallback to ensure students are loaded
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (studentsLoading && allStudents.length === 0) {
        console.log('Fallback: Loading students after timeout...');
        loadStudents();
      }
    }, 5000); // 5 second fallback

    return () => clearTimeout(fallbackTimer);
  }, [studentsLoading, allStudents.length]);

  // Load unread message counts for each student - FIXED: Prevent loops and continuous loading
  useEffect(() => {
    if (effectiveUserId && allStudents.length > 0 && !studentsLoading) {
      // Add a small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        loadUnreadCounts();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [effectiveUserId, allStudents.length]); // Only depend on length, not the array itself

  // Debug effect to log student data
  useEffect(() => {
    console.log('Students state updated:', {
      studentsCount: students.length,
      allStudentsCount: allStudents.length,
      showAllStudents,
      studentsWithMessages: students.filter(s => s.lastMessage !== 'No messages yet').length,
      studentsData: students.map(s => ({
        name: s.name,
        lastMessage: s.lastMessage,
        lastMessageTime: s.lastMessageTime,
        unreadCount: s.unreadCount
      }))
    });
  }, [students, allStudents, showAllStudents]);

  // Update students list when showAllStudents changes - FIXED: Better recent chats functionality
  useEffect(() => {
    if (allStudents.length > 0) {
      let filteredStudents;
      
      if (showAllStudents) {
        // Show all students sorted by activity
        filteredStudents = [...allStudents].sort((a, b) => {
          // First, prioritize unread messages
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
          
          // Then sort by most recent message time
          return new Date(b.lastMessageDate) - new Date(a.lastMessageDate);
        });
      } else {
        // Show only students with messages (recent chats) - IMPROVED: Permanent like WhatsApp
        const messagedStudents = allStudents.filter(student => {
          // Show students who have messages OR unread messages OR recent activity OR have been chatted with before
          const hasMessages = student.lastMessage && student.lastMessage !== 'No messages yet';
          const hasUnread = student.unreadCount > 0;
          const hasRecentActivity = student.lastMessageDate && new Date(student.lastMessageDate).getTime() > 0;
          const hasBeenChattedWith = recentChats.has(student._id);
          
          return hasMessages || hasUnread || hasRecentActivity || hasBeenChattedWith;
        });
        
        // Sort by most recent activity (WhatsApp-like behavior)
        filteredStudents = messagedStudents.sort((a, b) => {
          // First, prioritize unread messages
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
          
          // Then sort by most recent message time
          return new Date(b.lastMessageDate) - new Date(a.lastMessageDate);
        });
      }
      
      console.log('Filtered students:', filteredStudents);
      console.log('Show all students:', showAllStudents);
      console.log('Recent chats count:', showAllStudents ? filteredStudents.length : filteredStudents.length);
      
      // Always update the students list
      setStudents(filteredStudents);
      // FIXED: Clear loading state when students are loaded
      setStudentsLoading(false);
    }
  }, [showAllStudents, allStudents.length, recentChats]); // FIXED: Added recentChats dependency


  const loadStudents = async () => {
    try {
      // FIXED: Prevent rapid reloads (rate limiting)
      const now = Date.now();
      if (now - lastLoadTime < 2000) { // 2 second cooldown
        console.log('Rate limiting: Skipping loadStudents call');
        return;
      }
      setLastLoadTime(now);
      
      console.log('Loading students...', { effectiveUserId });
      setStudentsLoading(true);
      
      // Check if we have a valid user ID (but allow loading for debugging)
      if (!effectiveUserId) {
        console.warn('No effective user ID available, loading students anyway for debugging...');
      }
      
      const response = await api.get('/api/student/getAllStudentsForChat');
      
      console.log('Students API response:', response.data);
      
      if (response.data.success) {
        // Filter out the current user from the list (if we have a user ID)
        const filteredStudents = effectiveUserId 
          ? response.data.data.filter(student => student._id !== effectiveUserId)
          : response.data.data;
        
        console.log('Filtered students:', filteredStudents);
        console.log('Number of students found:', filteredStudents.length);
        
        if (filteredStudents.length === 0) {
          console.log('No students found after filtering');
          setAllStudents([]);
          setStudents([]);
          setStudentsLoading(false); // FIXED: Ensure loading state is cleared
          return;
        }
        
        // Add default data for last message and unread count
        const studentsWithChatData = filteredStudents.map(student => ({
          ...student,
          lastMessage: 'No messages yet',
          lastMessageTime: '',
          lastMessageDate: new Date(0), // Default to epoch for sorting
          unreadCount: 0
        }));
        
        console.log('Students with chat data:', studentsWithChatData);
        setAllStudents(studentsWithChatData);
        
        // Load conversations to get actual chat data
        if (effectiveUserId) {
          await loadUnreadCounts(studentsWithChatData);
        } else {
          // If no user ID, just show all students
          setStudents(studentsWithChatData);
          setStudentsLoading(false); // FIXED: Clear loading state immediately
        }
      } else {
        console.error('API returned success: false', response.data);
        toast.error('Failed to load students: ' + (response.data.message || 'Unknown error'));
        setStudentsLoading(false); // FIXED: Clear loading state on API failure
      }
    } catch (error) {
      console.error('Error loading students:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Failed to load students: ' + (error.response?.data?.message || error.message));
      setStudentsLoading(false); // FIXED: Clear loading state on error
    }
  };

  const loadUnreadCounts = async (studentsData = null) => {
    try {
      const studentsToUpdate = studentsData || allStudents;
      console.log('Loading unread counts...', { effectiveUserId, studentsLength: studentsToUpdate.length });
      
      if (!effectiveUserId || studentsToUpdate.length === 0) {
        console.log('Skipping unread counts - no user ID or students');
        setStudentsLoading(false); // FIXED: Clear loading state when skipping
        return;
      }
      
      // Get conversations to get unread counts
      const response = await api.get(`/api/chat/conversations/${effectiveUserId}`);
      
      console.log('Conversations API response:', response.data);
      
      if (response.data.success) {
        const conversations = response.data.data;
        console.log('Conversations data:', conversations);
        
        // Update all students with unread counts and recent messages - FIXED: Better message handling
        const updatedAllStudents = studentsToUpdate.map(student => {
          const conversation = conversations.find(conv => conv.userId === student._id);
          if (conversation && conversation.lastMessage) {
            // Add to recent chats if they have a conversation - IMPROVED: Better persistence
            setRecentChats(prev => {
              const newSet = new Set([...prev, student._id]);
              // Save to localStorage immediately for persistence
              try {
                localStorage.setItem('recentChats', JSON.stringify([...newSet]));
              } catch (error) {
                console.error('Error saving recent chats to localStorage:', error);
              }
              return newSet;
            });
            
            // IMPROVED: Better message display like WhatsApp
            let displayMessage = conversation.lastMessage.message || '';
            if (conversation.lastMessage.fileUrl) {
              // Show file type for file messages
              const fileType = conversation.lastMessage.fileType || '';
              if (fileType.startsWith('image/')) {
                displayMessage = '📷 Photo';
              } else if (fileType.includes('pdf')) {
                displayMessage = '📄 PDF';
              } else if (fileType.includes('document') || fileType.includes('word')) {
                displayMessage = '📝 Document';
              } else {
                displayMessage = '📎 File';
              }
            }
            
            return {
              ...student,
              unreadCount: conversation.unreadCount || 0,
              lastMessage: displayMessage,
              lastMessageTime: conversation.lastMessage.createdAt ? 
                new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              lastMessageDate: conversation.lastMessage.createdAt ? 
                new Date(conversation.lastMessage.createdAt) : new Date(0)
            };
          } else {
            // If no conversation found, keep existing data but ensure proper defaults
            return {
              ...student,
              unreadCount: 0,
              lastMessage: 'No messages yet',
              lastMessageTime: '',
              lastMessageDate: new Date(0)
            };
          }
        });
        
        console.log('Updated all students with conversations:', updatedAllStudents);
        setAllStudents(updatedAllStudents);
        
        // The useEffect will handle filtering and sorting based on showAllStudents
        // This prevents duplicate logic and reduces flicking
      } else {
        console.error('Conversations API returned success: false', response.data);
        // If API fails, ensure students have proper default values
        const updatedAllStudents = studentsToUpdate.map(student => ({
          ...student,
          unreadCount: 0,
          lastMessage: 'No messages yet',
          lastMessageTime: '',
          lastMessageDate: new Date(0)
        }));
        setAllStudents(updatedAllStudents);
      }
    } catch (error) {
      console.error('Error loading unread counts:', error);
      // If there's an error, ensure students have proper default values
      const studentsToUpdate = studentsData || allStudents;
      const updatedAllStudents = studentsToUpdate.map(student => ({
        ...student,
        unreadCount: 0,
        lastMessage: 'No messages yet',
        lastMessageTime: '',
        lastMessageDate: new Date(0)
      }));
      setAllStudents(updatedAllStudents);
    } finally {
      setStudentsLoading(false); // FIXED: Always clear loading state
      console.log('Unread counts loading completed');
    }
  };

  // Handle selected student from navigation state
  useEffect(() => {
    if (location.state?.selectedStudent) {
      setSelectedStudent(location.state.selectedStudent);
      if (isMobile) {
        setShowChat(true);
      }
    }
  }, [location.state, isMobile]);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('studentToken') || localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    if (!token) {
      console.log('No authentication token found, skipping socket connection');
      return;
    }
    
    const newSocket = io(socketUrl, {
      auth: {
        token: token
      }
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      // Removed toast notification for connection
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
      // Removed toast notification for disconnection
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      // Removed toast notification for connection error
    });

    // Room join confirmation
    newSocket.on('room joined', (data) => {
      console.log('Room joined successfully:', data);
    });

    // Message events - FIXED: Prevent duplicates from socket
    newSocket.on('new Message', (data) => {
      console.log('New message received from socket:', data);
      
      // FIXED: Don't handle socket messages when switching chats
      if (isSwitchingChat) {
        console.log('Switching chats, ignoring socket message');
        return;
      }
      
      // FIXED: Don't add messages from socket if they were sent by current user (already added locally)
      if (data.senderId === effectiveUserId) {
        console.log('Message sent by current user, skipping socket duplicate');
        return;
      }
      
      // FIXED: Additional check against sent messages cache
      if (sentMessages.has(data._id)) {
        console.log('Message was sent locally, skipping socket duplicate');
        return;
      }
      
      // Only add message if it's for the current conversation
      const isCurrentConversation = (data.senderId === effectiveUserId && data.receiverId === selectedStudent?._id) ||
                                  (data.senderId === selectedStudent?._id && data.receiverId === effectiveUserId);
      
      if (!isCurrentConversation) {
        console.log('Message not for current conversation, ignoring');
        return;
      }
      
      // FIXED: Additional check to prevent adding messages when switching chats
      if (!selectedStudent || (selectedStudent._id !== data.senderId && selectedStudent._id !== data.receiverId)) {
        console.log('Message not for currently selected student, ignoring');
        return;
      }
      
      // FIXED: Simple duplicate check by message ID
      setMessageArray(prev => {
        const messageExists = prev.some(msg => msg._id === data._id);
        if (messageExists) {
          console.log('Message already exists, skipping duplicate');
          return prev;
        }
        
        // Format the message for display
        const formattedMessage = {
          ...data,
          sender: data.senderId === effectiveUserId ? 'me' : 'other',
          timestamp: new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          replyTo: data.replyTo ? {
            _id: data.replyTo,
            message: data.replyMessage,
            text: data.replyMessage,
            sender: data.replySenderId === effectiveUserId ? 'me' : 'other'
          } : null,
          // FIXED: Add unique key for React rendering
          uniqueKey: `${data._id}_${data.senderId}_${data.receiverId}_${data.createdAt}_${Date.now()}`
        };
        
        console.log('Adding new message to chat from socket:', formattedMessage);
        
        // Refresh unread counts and reorder list when new message arrives
        if (data.senderId !== effectiveUserId) {
          // Add to recent chats when receiving a message - IMPROVED: Better persistence
          setRecentChats(prev => {
            const newSet = new Set([...prev, data.senderId]);
            // Save to localStorage immediately for persistence
            try {
              localStorage.setItem('recentChats', JSON.stringify([...newSet]));
            } catch (error) {
              console.error('Error saving recent chats to localStorage:', error);
            }
            return newSet;
          });
          
          // Update the student list immediately for the sender - FIXED: Better message display
          setStudents(prevStudents => {
            const updatedStudents = prevStudents.map(student => {
              if (student._id === data.senderId) {
                // IMPROVED: Better message display like WhatsApp
                let displayMessage = data.message || '';
                if (data.fileUrl) {
                  const fileType = data.fileType || '';
                  if (fileType.startsWith('image/')) {
                    displayMessage = '📷 Photo';
                  } else if (fileType.includes('pdf')) {
                    displayMessage = '📄 PDF';
                  } else if (fileType.includes('document') || fileType.includes('word')) {
                    displayMessage = '📝 Document';
                  } else {
                    displayMessage = '📎 File';
                  }
                }
                
                return {
                  ...student,
                  lastMessage: displayMessage,
                  lastMessageTime: new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  lastMessageDate: new Date(data.createdAt),
                  unreadCount: (student.unreadCount || 0) + 1
                };
              }
              return student;
            });
            
            // Move the updated student to the top
            const updatedStudent = updatedStudents.find(s => s._id === data.senderId);
            if (updatedStudent) {
              const otherStudents = updatedStudents.filter(s => s._id !== data.senderId);
              return [updatedStudent, ...otherStudents];
            }
            return updatedStudents;
          });
          
          // Also update allStudents
          setAllStudents(prevAllStudents => {
            const updatedAllStudents = prevAllStudents.map(student => {
              if (student._id === data.senderId) {
                // IMPROVED: Better message display like WhatsApp
                let displayMessage = data.message || '';
                if (data.fileUrl) {
                  const fileType = data.fileType || '';
                  if (fileType.startsWith('image/')) {
                    displayMessage = '📷 Photo';
                  } else if (fileType.includes('pdf')) {
                    displayMessage = '📄 PDF';
                  } else if (fileType.includes('document') || fileType.includes('word')) {
                    displayMessage = '📝 Document';
                  } else {
                    displayMessage = '📎 File';
                  }
                }
                
                return {
                  ...student,
                  lastMessage: displayMessage,
                  lastMessageTime: new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  lastMessageDate: new Date(data.createdAt),
                  unreadCount: (student.unreadCount || 0) + 1
                };
              }
              return student;
            });
            
            // Move the updated student to the top
            const updatedStudent = updatedAllStudents.find(s => s._id === data.senderId);
            if (updatedStudent) {
              const otherStudents = updatedAllStudents.filter(s => s._id !== data.senderId);
              return [updatedStudent, ...otherStudents];
            }
            return updatedAllStudents;
          });
        }
        
        return [...prev, formattedMessage];
      });
    });

    // Handle message edit events
    newSocket.on('message edited', (data) => {
      console.log('Message edited received:', data);
      setMessageArray(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, message: data.newMessage, isEdited: true, editedAt: data.editedAt }
            : msg
        )
      );
    });

    // Handle message delete events
    newSocket.on('message deleted', (data) => {
      console.log('Message deleted received:', data);
      setMessageArray(prev => prev.filter(msg => msg._id !== data.messageId));
    });

    // Handle new notifications
    newSocket.on('new notification', (data) => {
      console.log('New notification received:', data);
      toast.success(data.message);
      
      // REMOVED: Excessive API calls that were causing loops
      // The socket message handling above already updates the UI in real-time
      // No need for additional API calls here
    });

    // Typing events
    newSocket.on('user typing', (data) => {
      if (data.user !== currentUserName) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return [...prev.filter(user => user !== data.user), data.user];
          } else {
            return prev.filter(user => user !== data.user);
          }
        });
      }
    });

    // User status events
    newSocket.on('user status', (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.status === 'online') {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    // Error handling
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      // Only show toast for critical socket errors, not for message sending issues
      if (error.message && !error.message.includes('Failed to send message')) {
        toast.error(error.message || 'Socket connection error');
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [socketUrl, currentUserName]);

  // Join room when student is selected
  useEffect(() => {
    if (selectedStudent && socket && isConnected && effectiveUserId) {
      const tempRoom1 = `${effectiveUserId}_${selectedStudent._id}`;
      const tempRoom2 = `${selectedStudent._id}_${effectiveUserId}`;
      
      console.log('Joining rooms:', { room1: tempRoom1, room2: tempRoom2 });
      
      setRoom1(tempRoom1);
      setRoom2(tempRoom2);
      setReceiverRegistrationNumber(selectedStudent.registrationNumber);

      socket.emit('join room', { room1: tempRoom1, room2: tempRoom2 });
      
      // Always load fresh chat history when joining a room
      console.log('Loading chat history for:', selectedStudent.name);
      loadChatHistory(selectedStudent._id);
    }
  }, [selectedStudent, socket, isConnected, effectiveUserId]);

  // Load chat history from API
  const loadChatHistory = async (receiverId) => {
    if (!effectiveUserId) {
      console.log('Cannot load chat history: effectiveUserId is not available');
      return;
    }
    
    try {
      setIsLoading(true);
      // FIXED: Clear messages before loading new ones to prevent duplicates
      setMessageArray([]);
      setProcessedMessages(new Set());
      setSentMessages(new Set());
      
      console.log('Loading chat history for receiver:', receiverId);
      const response = await api.get(`/api/chat/${effectiveUserId}/${receiverId}`);

      if (response.data.success) {
        // Convert API messages to the format expected by the UI
        const formattedMessages = response.data.data.messages.map((msg, index) => ({
          _id: msg._id,
          message: msg.message,
          text: msg.message, // Add text field for consistency
          sender: msg.senderId === effectiveUserId ? 'me' : 'other',
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileType: msg.fileType,
          fileSize: msg.fileSize,
          createdAt: msg.createdAt,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          replyTo: msg.replyTo ? {
            _id: msg.replyTo,
            message: msg.replyMessage,
            text: msg.replyMessage,
            sender: msg.replySenderId === effectiveUserId ? 'me' : 'other'
          } : null,
          // FIXED: Add unique key for React rendering
          uniqueKey: `${msg._id}_${msg.senderId}_${msg.receiverId}_${msg.createdAt}_${index}`
        }));
        
        console.log('Loaded chat history:', formattedMessages.length, 'messages');
        setMessageArray(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Don't show error toast for 404 - just means no chat history yet
      if (error.response?.status !== 404) {
        toast.error('Failed to load chat history');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto scroll to bottom when new messages arrive - optimized
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [messageArray.length]); // Only depend on message count, not the entire array

  // FIXED: Cleanup effect to clear messages when component unmounts
  useEffect(() => {
    return () => {
      // Clear messages and processed messages when component unmounts
      setMessageArray([]);
      setProcessedMessages(new Set());
      setSentMessages(new Set());
    };
  }, []);

  const handleStudentSelect = (student) => {
    console.log('Selecting student:', student.name, 'Previous student:', selectedStudent?.name);
    
    // FIXED: Set switching flag to prevent socket message handling
    setIsSwitchingChat(true);
    
    // FIXED: Always clear messages and processed messages when selecting any student
    setMessageArray([]);
    setProcessedMessages(new Set());
    setSentMessages(new Set());
    
    // FIXED: Clear any pending socket messages for previous conversation
    if (socket && selectedStudent) {
      const oldRoom1 = `${effectiveUserId}_${selectedStudent._id}`;
      const oldRoom2 = `${selectedStudent._id}_${effectiveUserId}`;
      socket.emit('leave room', { room1: oldRoom1, room2: oldRoom2 });
    }
    
    setSelectedStudent(student);
    
    if (isMobile) {
      setShowChat(true);
    }
    
    // Mark messages as read when opening conversation
    markMessagesAsRead(student._id);
    
    // FIXED: Re-enable socket message handling after a longer delay to ensure clean state
    setTimeout(() => {
      setIsSwitchingChat(false);
      console.log('Chat switching completed, socket message handling re-enabled');
    }, 1500);
  };

  const markMessagesAsRead = async (senderId) => {
    try {
      await api.put('/api/chat/mark-read', {
        userId: effectiveUserId,
        senderId: senderId
      });
      
      // Immediately update local state to remove red dot
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student._id === senderId 
            ? { ...student, unreadCount: 0 }
            : student
        )
      );
      
      // Also update allStudents to keep it in sync
      setAllStudents(prevAllStudents => 
        prevAllStudents.map(student => 
          student._id === senderId 
            ? { ...student, unreadCount: 0 }
            : student
        )
      );
      
      // REMOVED: Excessive API calls that were causing loops
      // Local state updates are sufficient for immediate UI feedback
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleBackToStudents = () => {
    // FIXED: Always clear messages when going back
    setMessageArray([]);
    setProcessedMessages(new Set());
    setSentMessages(new Set());
    
    // FIXED: Set switching flag to prevent socket message handling
    setIsSwitchingChat(true);
    
    if (isMobile) {
      setShowChat(false);
      setSelectedStudent(null);
    } else {
      // Navigate back to student dashboard
      navigate('/home');
    }
    
    // FIXED: Re-enable socket message handling after cleanup
    setTimeout(() => {
      setIsSwitchingChat(false);
    }, 500);
  };

  const handleSendMessage = async (messageData) => {
    if (messageData.text.trim().length > 0 || messageData.files.length > 0) {
      try {
        setIsLoading(true);
        
        // Validate required data - FIXED: Better validation for file uploads
        if (!effectiveUserId || effectiveUserId === 'null' || effectiveUserId === 'undefined') {
          console.error('Invalid effectiveUserId:', effectiveUserId);
          toast.error('User authentication required. Please refresh the page and login again.');
          return;
        }
        
        if (!selectedStudent || !selectedStudent._id) {
          console.error('Invalid selectedStudent:', selectedStudent);
          toast.error('Please select a student to chat with');
          return;
        }
        
        // Additional validation for user data
        if (!currentUserName || currentUserName === 'Unknown User') {
          console.error('Invalid currentUserName:', currentUserName);
          toast.error('User information not available. Please refresh the page and try again.');
          return;
        }
        
        if (!currentUserRegNumber || currentUserRegNumber === 'UNKNOWN') {
          console.error('Invalid currentUserRegNumber:', currentUserRegNumber);
          toast.error('User registration information not available. Please refresh the page and try again.');
          return;
        }
        
        // FIXED: Additional validation to ensure all required data is present
        if (!selectedStudent.name) {
          console.error('Invalid selectedStudent.name:', selectedStudent.name);
          toast.error('Selected student information is incomplete. Please try again.');
          return;
        }
        
        if (!selectedStudent.registrationNumber) {
          console.error('Invalid selectedStudent.registrationNumber:', selectedStudent.registrationNumber);
          toast.error('Selected student registration number is missing. Please try again.');
          return;
        }
        
        console.log('Sending message with:', {
          senderId: effectiveUserId,
          receiverId: selectedStudent._id,
          message: messageData.text,
          effectiveUserIdType: typeof effectiveUserId,
          effectiveUserIdValue: effectiveUserId,
          hasFiles: messageData.files && messageData.files.length > 0,
          currentUserName: currentUserName,
          currentUserRegNumber: currentUserRegNumber,
          selectedStudentName: selectedStudent.name,
          selectedStudentRegNumber: selectedStudent.registrationNumber
        });
        
        // Additional validation for file uploads
        if (messageData.files && messageData.files.length > 0) {
          console.log('File upload validation:', {
            effectiveUserId,
            selectedStudentId: selectedStudent._id,
            currentUserName,
            currentUserRegNumber,
            selectedStudentName: selectedStudent.name,
            selectedStudentRegNumber: selectedStudent.registrationNumber,
            filesCount: messageData.files.length
          });
          
          // Validate file data
          for (let i = 0; i < messageData.files.length; i++) {
            const file = messageData.files[i];
            if (!file.file) {
              toast.error(`File ${i + 1} is missing file data. Please try again.`);
              return;
            }
          }
        }
        
        // Prepare message data with proper fallbacks - FIXED: Better validation for file uploads
        const messagePayload = {
          senderId: String(effectiveUserId),
          receiverId: String(selectedStudent._id),
          message: String(messageData.text || ''),
          senderName: String(currentUserName),
          receiverName: String(selectedStudent.name || 'Unknown Receiver'),
          senderRegistrationNumber: String(currentUserRegNumber),
          receiverRegistrationNumber: String(selectedStudent.registrationNumber || 'Unknown'),
          roomId: String(room1 || `${effectiveUserId}_${selectedStudent._id}`),
          replyTo: messageData.replyTo?._id ? String(messageData.replyTo._id) : null,
          replyMessage: messageData.replyTo?.message || messageData.replyTo?.text || null,
          replySender: messageData.replyTo?.sender === 'me' ? String(currentUserName) : String(selectedStudent.name || 'Unknown Receiver'),
          replySenderId: messageData.replyTo?.sender === 'me' ? String(effectiveUserId) : String(selectedStudent._id)
        };
        
        // Additional validation for file uploads
        if (messageData.files && messageData.files.length > 0) {
          console.log('File upload payload validation:', {
            senderId: messagePayload.senderId,
            receiverId: messagePayload.receiverId,
            senderName: messagePayload.senderName,
            receiverName: messagePayload.receiverName,
            senderRegistrationNumber: messagePayload.senderRegistrationNumber,
            receiverRegistrationNumber: messagePayload.receiverRegistrationNumber,
            filesCount: messageData.files.length
          });
          
          // Validate that we have proper user data
          if (!messagePayload.senderId || !messagePayload.receiverId) {
            toast.error('User authentication required. Please refresh the page and try again.');
            return;
          }
          
          if (!messagePayload.senderName || messagePayload.senderName === 'Unknown User') {
            toast.error('User information not available. Please refresh the page and try again.');
            return;
          }
        }

        console.log('Message payload:', messagePayload);

        // If there are files, use FormData, otherwise use JSON
        let response;
        if (messageData.files && messageData.files.length > 0) {
          // Use FormData for file uploads - FIXED: Better FormData preparation
          const formData = new FormData();
          
          // Add all message payload fields explicitly with proper validation
          formData.append('senderId', String(messagePayload.senderId));
          formData.append('receiverId', String(messagePayload.receiverId));
          formData.append('message', String(messagePayload.message || ''));
          formData.append('senderName', String(messagePayload.senderName));
          formData.append('receiverName', String(messagePayload.receiverName));
          formData.append('senderRegistrationNumber', String(messagePayload.senderRegistrationNumber));
          formData.append('receiverRegistrationNumber', String(messagePayload.receiverRegistrationNumber));
          formData.append('roomId', String(messagePayload.roomId));
          
          // Add reply fields if they exist
          if (messagePayload.replyTo) {
            formData.append('replyTo', String(messagePayload.replyTo));
          }
          if (messagePayload.replyMessage) {
            formData.append('replyMessage', String(messagePayload.replyMessage));
          }
          if (messagePayload.replySender) {
            formData.append('replySender', String(messagePayload.replySender));
          }
          if (messagePayload.replySenderId) {
            formData.append('replySenderId', String(messagePayload.replySenderId));
          }
          
          // Add files - FIXED: Ensure files are properly added
          messageData.files.forEach((file, index) => {
            if (file.file && file.file instanceof File) {
              formData.append('files', file.file);
              console.log(`Added file ${index + 1}:`, file.name, file.file);
            } else {
              console.error(`Invalid file object at index ${index}:`, file);
            }
          });

          console.log('FormData contents:');
          for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
              console.log(`${key}:`, `File(${value.name}, ${value.size} bytes, ${value.type})`);
            } else {
              console.log(`${key}:`, value, `(type: ${typeof value})`);
            }
          }
          
          // FIXED: Additional validation before sending FormData
          const formDataValidation = {
            senderId: formData.get('senderId'),
            receiverId: formData.get('receiverId'),
            senderName: formData.get('senderName'),
            receiverName: formData.get('receiverName'),
            senderRegistrationNumber: formData.get('senderRegistrationNumber'),
            receiverRegistrationNumber: formData.get('receiverRegistrationNumber')
          };
          
          console.log('FormData validation:', formDataValidation);
          
          // Check if any required fields are missing or undefined
          const missingFields = Object.entries(formDataValidation)
            .filter(([key, value]) => !value || value === 'undefined' || value === 'null')
            .map(([key]) => key);
          
          if (missingFields.length > 0) {
            console.error('Missing or invalid FormData fields:', missingFields);
            toast.error(`Missing required data: ${missingFields.join(', ')}. Please refresh and try again.`);
            return;
          }

          response = await api.post('/api/chat/send', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } else {
          // Use JSON for text-only messages
          response = await api.post('/api/chat/send', messagePayload, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
        
        console.log('API Response:', response.data);

        if (response.data.success) {
          console.log('Message sent successfully:', response.data.data);
          
          // Show success message for file uploads
          if (messageData.files && messageData.files.length > 0) {
            toast.success(`File${messageData.files.length > 1 ? 's' : ''} sent successfully!`);
          }
          
          // Add message to local state immediately for instant UI update
          const newMessage = {
            _id: response.data.data._id,
            message: messageData.text || '',
            text: messageData.text || '',
            sender: 'me',
            senderId: effectiveUserId,
            receiverId: selectedStudent._id,
            fileUrl: response.data.data.fileUrl || null,
            fileName: response.data.data.fileName || null,
            fileType: response.data.data.fileType || null,
            fileSize: response.data.data.fileSize || null,
            createdAt: response.data.data.createdAt,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            replyTo: messageData.replyTo ? {
              _id: messageData.replyTo._id || messageData.replyTo,
              message: messageData.replyTo.message || messageData.replyTo.text,
              text: messageData.replyTo.message || messageData.replyTo.text,
              sender: messageData.replyTo.sender === 'me' ? 'me' : 'other'
            } : null,
            // FIXED: Add unique key for React rendering
            uniqueKey: `${response.data.data._id}_${effectiveUserId}_${selectedStudent._id}_${response.data.data.createdAt}_${Date.now()}`
          };

        // Add message locally for immediate UI update - FIXED: Enhanced duplicate prevention
        setMessageArray(prev => {
          // Simple duplicate check by message ID
          const messageExists = prev.some(msg => msg._id === newMessage._id);
          if (messageExists) {
            console.log('Message already exists locally, skipping duplicate');
            return prev;
          }
          
          // FIXED: Track sent message ID to prevent socket duplicates
          setSentMessages(prev => new Set([...prev, newMessage._id]));
          
          console.log('Adding new message to local state:', newMessage);
          return [...prev, newMessage];
        });
        
        // Immediately update the conversation order (WhatsApp-like behavior)
        let messageText = messageData.text || '';
        if (messageData.files.length > 0) {
          // IMPROVED: Better file message display like WhatsApp
          const file = messageData.files[0];
          if (file.type === 'image') {
            messageText = '📷 Photo';
          } else if (file.name.toLowerCase().includes('.pdf')) {
            messageText = '📄 PDF';
          } else if (file.name.toLowerCase().includes('.doc')) {
            messageText = '📝 Document';
          } else {
            messageText = '📎 File';
          }
        }
        const currentTime = new Date();
        const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Add to recent chats when sending a message - IMPROVED: Better persistence
        setRecentChats(prev => {
          const newSet = new Set([...prev, selectedStudent._id]);
          // Save to localStorage immediately for persistence
          try {
            localStorage.setItem('recentChats', JSON.stringify([...newSet]));
          } catch (error) {
            console.error('Error saving recent chats to localStorage:', error);
          }
          return newSet;
        });
        
        setStudents(prevStudents => {
          // Find the current student and move them to top
          const currentStudent = prevStudents.find(s => s._id === selectedStudent._id);
          if (currentStudent) {
            const updatedStudent = {
              ...currentStudent,
              lastMessage: messageText,
              lastMessageTime: timeString,
              lastMessageDate: currentTime
            };
            
            // Remove current student and add to top
            const otherStudents = prevStudents.filter(s => s._id !== selectedStudent._id);
            return [updatedStudent, ...otherStudents];
          } else {
            // If student not in list, add them to the top
            const newStudent = {
              _id: selectedStudent._id,
              name: selectedStudent.name,
              registrationNumber: selectedStudent.registrationNumber,
              department: selectedStudent.department,
              lastMessage: messageText,
              lastMessageTime: timeString,
              lastMessageDate: currentTime,
              unreadCount: 0
            };
            return [newStudent, ...prevStudents];
          }
        });

        // Also update allStudents to keep it in sync
        setAllStudents(prevAllStudents => {
          const currentStudent = prevAllStudents.find(s => s._id === selectedStudent._id);
          if (currentStudent) {
            const updatedStudent = {
              ...currentStudent,
              lastMessage: messageText,
              lastMessageTime: timeString,
              lastMessageDate: currentTime
            };
            
            // Remove current student and add to top
            const otherStudents = prevAllStudents.filter(s => s._id !== selectedStudent._id);
            return [updatedStudent, ...otherStudents];
          } else {
            // If student not in list, add them to the top
            const newStudent = {
              _id: selectedStudent._id,
              name: selectedStudent.name,
              registrationNumber: selectedStudent.registrationNumber,
              department: selectedStudent.department,
              lastMessage: messageText,
              lastMessageTime: timeString,
              lastMessageDate: currentTime,
              unreadCount: 0
            };
            return [newStudent, ...prevAllStudents];
          }
        });
        
          // FIXED: Don't emit socket event for sender's own messages to prevent duplicates
          // The message is already added locally, and the server will handle delivery to other users
          console.log('Message sent successfully, not emitting socket event to prevent duplicates');
        
        // REMOVED: Excessive API calls that were causing loops
        // The local state updates above are sufficient for immediate UI updates
        // The socket events will handle real-time updates for other users
        } else {
          console.error('API returned success: false', response.data);
          toast.error(response.data.message || 'Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Provide more specific error messages
        if (error.response?.status === 413) {
          toast.error('File too large. Maximum size is 10MB.');
        } else if (error.response?.status === 400) {
          toast.error(error.response.data?.message || 'Invalid message data.');
        } else if (error.response?.status === 401) {
          toast.error('Authentication required. Please login again.');
        } else if (error.response?.status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error('Failed to send message. Please check your connection.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Message cannot be empty");
    }
  };

  // Handle typing indicators
  const handleTyping = (isTyping) => {
    if (socket && isConnected && selectedStudent) {
      socket.emit('typing', {
        room: room1,
        user: currentUserName,
        isTyping: isTyping
      });
    }
  };

  const handleEditMessage = async (messageId, newMessage) => {
    try {
      const response = await api.put(`/api/chat/${messageId}/edit`, {
        userId: effectiveUserId,
        newMessage: newMessage
      });

      if (response.data.success) {
        // Update local message state
        setMessageArray(prev => 
          prev.map(msg => 
            msg._id === messageId 
              ? { ...msg, message: newMessage, text: newMessage, isEdited: true, editedAt: new Date() }
              : msg
          )
        );

        // Emit socket event for real-time sync
        if (socket && isConnected) {
          socket.emit('message edited', {
            messageId,
            newMessage,
            editedAt: new Date(),
            room: room1 || `${effectiveUserId}_${selectedStudent._id}`
          });
        }

        toast.success('Message edited successfully');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await api.delete(`/api/chat/${messageId}`, {
        data: { userId: effectiveUserId }
      });

      if (response.data.success) {
        // Remove message from local state
        setMessageArray(prev => prev.filter(msg => msg._id !== messageId));

        // Emit socket event for real-time sync
        if (socket && isConnected) {
          socket.emit('message deleted', {
            messageId,
            room: room1 || `${effectiveUserId}_${selectedStudent._id}`
          });
        }

        toast.success('Message deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) return <ImageIcon className="w-4 h-4" />;
    if (fileType?.includes('pdf')) return <PdfIcon className="w-4 h-4" />;
    if (fileType?.includes('document') || fileType?.includes('word')) return <DocIcon className="w-4 h-4" />;
    return <AttachFileIcon className="w-4 h-4" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check authentication
  if (!student.isAuthenticated && !admin.isAuthenticated) {
    navigate('/');
    return null;
  }

  // Check if user ID is available
  if (!effectiveUserId) {
    // Check if we have any authentication tokens
    const hasToken = localStorage.getItem('studentToken') || localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    if (!hasToken) {
      // No token found, redirect to login
      navigate('/');
      return null;
    }
    
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: darkMode ? '#121212' : '#f5f5f5'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#333' }}>
            {authLoadingTimeout ? 'Authentication Error' : 'Loading user information...'}
          </Typography>
          <Typography variant="body2" sx={{ color: darkMode ? '#b0b0b0' : '#666', mt: 1 }}>
            {authLoadingTimeout 
              ? 'Please refresh the page or login again' 
              : 'If this takes too long, please refresh the page'
            }
          </Typography>
          {authLoadingTimeout && (
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()} 
              sx={{ mt: 2 }}
            >
              Refresh Page
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: darkMode ? '#121212' : '#f5f5f5',
      overflow: 'hidden'
    }}>
      {/* Main Container */}
      <Box sx={{ 
        display: 'flex', 
        height: '100%',
        flexDirection: { xs: showChat ? 'column' : 'row', md: 'row' },
        overflow: 'hidden'
      }}>
        
        {/* Left Panel - Student List */}
        <Box sx={{ 
          display: { xs: showChat ? 'none' : 'flex', md: 'flex' },
          flexDirection: 'column',
          width: { xs: '100%', md: '400px' },
          minWidth: { md: '400px' },
          borderRight: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
          bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
            bgcolor: darkMode ? '#2d2d2d' : '#f8f9fa'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={() => navigate('/home')}
                  sx={{ 
                    color: darkMode ? '#fff' : '#333',
                    '&:hover': {
                      bgcolor: darkMode ? '#333' : '#f0f0f0'
                    }
                  }}
                  title="Back to Dashboard"
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold',
                  color: darkMode ? '#fff' : '#333'
                }}>
                  Chat
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ 
                  color: darkMode ? '#b0b0b0' : '#666',
                  fontSize: '0.75rem'
                }}>
                  {showAllStudents ? `All Students (${allStudents.length})` : `Recent Chats (${students.filter(s => s.lastMessage !== 'No messages yet' || s.unreadCount > 0).length})`}
                </Typography>
                <IconButton
                  onClick={() => {
                    if (!studentsLoading) {
                      console.log('Manual refresh triggered');
                      loadStudents();
                      refreshConversations();
                      toast.success('Refreshing students and conversations...');
                    } else {
                      toast('Please wait, already loading...', {
                        icon: '⏳',
                        style: {
                          borderRadius: '10px',
                          background: '#333',
                          color: '#fff',
                        },
                      });
                    }
                  }}
                  sx={{
                    color: darkMode ? '#fff' : '#333',
                    '&:hover': {
                      bgcolor: darkMode ? '#333' : '#f0f0f0'
                    },
                    transition: 'all 0.2s ease',
                    width: 32,
                    height: 32
                  }}
                  title="Refresh students list"
                >
                  <SearchIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setShowAllStudents(!showAllStudents);
                    // Show feedback to user
                    toast.success(showAllStudents ? 'Showing recent chats only' : 'Showing all students');
                  }}
                  sx={{
                    color: darkMode ? '#fff' : '#333',
                    bgcolor: showAllStudents ? (darkMode ? '#1976d2' : '#e3f2fd') : 'transparent',
                    '&:hover': {
                      bgcolor: showAllStudents ? (darkMode ? '#1565c0' : '#bbdefb') : (darkMode ? '#333' : '#f0f0f0')
                    },
                    transition: 'all 0.2s ease',
                    width: 32,
                    height: 32
                  }}
                  title={showAllStudents ? 'Show recent chats only' : 'Show all students'}
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
            
            {/* Search Bar */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => {
                console.log('Search term changed:', e.target.value);
                setSearchTerm(e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: darkMode ? '#b0b0b0' : '#666' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: darkMode ? '#1e1e1e' : '#fff',
                  '& fieldset': {
                    borderColor: darkMode ? '#444' : '#ddd',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? '#666' : '#999',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputBase-input': {
                  color: darkMode ? '#fff' : '#333',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: darkMode ? '#b0b0b0' : '#666',
                },
              }}
            />
          </Box>

          {/* Student List */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            height: 'calc(100vh - 120px)' // Fixed height to prevent scrolling with main content
          }}>
            {studentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2, color: darkMode ? '#b0b0b0' : '#666' }}>
                  Loading students...
                </Typography>
              </Box>
            ) : filteredStudents.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: 200,
                textAlign: 'center',
                p: 3
              }}>
                <ChatIcon sx={{ 
                  fontSize: 48, 
                  color: darkMode ? '#666' : '#ccc',
                  mb: 2,
                  opacity: 0.5
                }} />
                <Typography variant="h6" sx={{ 
                  color: darkMode ? '#b0b0b0' : '#666',
                  mb: 1
                }}>
                  {searchTerm ? 'No students found matching your search' : (showAllStudents ? 'No students found' : 'No recent chats')}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: darkMode ? '#888' : '#999',
                  mb: 2
                }}>
                  {searchTerm 
                    ? `No students match "${searchTerm}". Try a different search term.`
                    : (showAllStudents 
                      ? 'Try adjusting your search or check back later' 
                      : 'Start a conversation by selecting a student from the list')
                  }
                </Typography>
                {!showAllStudents && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowAllStudents(true)}
                    sx={{
                      color: darkMode ? '#1976d2' : '#1976d2',
                      borderColor: darkMode ? '#1976d2' : '#1976d2',
                      '&:hover': {
                        borderColor: darkMode ? '#1565c0' : '#1565c0',
                        bgcolor: darkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)'
                      }
                    }}
                  >
                    Show All Students
                  </Button>
                )}
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredStudents.map((studentItem) => (
                <ListItem key={studentItem._id} disablePadding>
                    <ListItemButton
                      onClick={() => handleStudentSelect(studentItem)}
                      selected={selectedStudent?._id === studentItem._id}
                      sx={{
                        '&.Mui-selected': {
                          bgcolor: darkMode ? '#2d4a6b' : '#e3f2fd',
                          '&:hover': {
                            bgcolor: darkMode ? '#2d4a6b' : '#e3f2fd',
                          },
                        },
                        '&:hover': {
                          bgcolor: darkMode ? '#2d2d2d' : '#f5f5f5',
                        },
                        borderBottom: `1px solid ${darkMode ? '#333' : '#f0f0f0'}`,
                        // Add subtle highlight for conversations with unread messages
                        bgcolor: studentItem.unreadCount > 0 ? 
                          (darkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)') : 
                          'transparent'
                      }}
                    >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={studentItem.unreadCount}
                        color="primary"
                        invisible={studentItem.unreadCount === 0}
                      >
                        <Avatar
                          sx={{
                            bgcolor: darkMode ? '#1976d2' : '#1976d2',
                            width: 48,
                            height: 48,
                          }}
                        >
                          {studentItem.avatar ? (
                            <img 
                              src={studentItem.avatar} 
                              alt={studentItem.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <PersonIcon />
                          )}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: selectedStudent?._id === studentItem._id ? 'bold' : 'normal',
                              color: darkMode ? '#fff' : '#333',
                            }}
                          >
                            {studentItem.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: darkMode ? '#b0b0b0' : '#666',
                              fontSize: '0.75rem',
                              fontWeight: studentItem.unreadCount > 0 ? 'bold' : 'normal'
                            }}
                          >
                            {studentItem.lastMessageTime}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: darkMode ? '#b0b0b0' : '#666',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px',
                              fontWeight: studentItem.unreadCount > 0 ? 'bold' : 'normal',
                              mb: 0.5
                            }}
                          >
                            {studentItem.lastMessage || 'No messages yet'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.7rem',
                                color: darkMode ? '#888' : '#999',
                                fontWeight: 'bold',
                                bgcolor: darkMode ? '#333' : '#f0f0f0',
                                px: 1,
                                py: 0.25,
                                borderRadius: '4px',
                                border: `1px solid ${darkMode ? '#444' : '#ddd'}`
                              }}
                            >
                              {studentItem.registrationNumber}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.7rem',
                                color: darkMode ? '#1976d2' : '#1976d2',
                                fontWeight: 'normal',
                                bgcolor: darkMode ? 'rgba(25, 118, 210, 0.1)' : '#e3f2fd',
                                px: 1,
                                py: 0.25,
                                borderRadius: '4px'
                              }}
                            >
                              {studentItem.department}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            )}
          </Box>
        </Box>

        {/* Right Panel - Chat Window */}
        <Box sx={{ 
          display: { xs: showChat ? 'flex' : 'none', md: 'flex' },
          flexDirection: 'column',
          flex: 1,
          bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* Connection Status Indicator */}
          {!isConnected && (
            <Box sx={{ 
              p: 1, 
              bgcolor: darkMode ? '#d32f2f' : '#f44336', 
              color: 'white',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
              Connecting to chat server...
            </Box>
          )}
          
          <ChatWindow
            selectedStudent={selectedStudent}
            messages={messageArray}
            onSendMessage={handleSendMessage}
            onBack={handleBackToStudents}
            isMobile={isMobile}
            currentUser={currentUser}
            isLoading={isLoading}
            isConnected={isConnected}
            typingUsers={typingUsers}
            onTyping={handleTyping}
            darkMode={darkMode}
            apiUrl={apiUrl}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            currentUserId={effectiveUserId}
          />
        </Box>
              </Box>
              </Box>
  );
};

export default Chat;
