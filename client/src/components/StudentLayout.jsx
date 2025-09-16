import React, { useState, useEffect } from 'react'
import { Box, IconButton, Typography, useTheme, useMediaQuery, Tooltip, Avatar, Menu, MenuItem, Divider, Badge, ListItemText } from '@mui/material'
import { Menu as MenuIcon, Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon, Notifications as NotificationsIcon, DoneAll as DoneAllIcon, Settings as SettingsIcon, Logout as LogoutIcon, AccountCircle as AccountIcon } from '@mui/icons-material'
import StudentSidebar from './StudentSidebar'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { studentLogout } from '../redux/actions/studentAction'
import api from '../config/api'

const StudentLayout = ({ title = 'Student', children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(!isMobile)
  const sidebarWidth = open ? 280 : 64
  const { darkMode, toggleTheme } = useCustomTheme()
  const [notifEl, setNotifEl] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const { student } = useSelector((s) => s.student)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (student.isAuthenticated && student.student?.student?._id) {
          const response = await api.get(`/api/chat/notifications/${student.student.student._id}`);
          if (response.data.success) {
            setNotifications(response.data.data.notifications);
            setUnreadCount(response.data.data.pagination.unreadCount);
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [student.isAuthenticated, student.student?.student?._id]);

  const markAllRead = async () => {
    try {
      if (student.student?.student?._id) {
        await api.put('/api/chat/notifications/mark-all-read', {
          userId: student.student.student._id
        });
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      if (student.student?.student?._id) {
        await api.put(`/api/chat/notifications/${notificationId}/read`, {
          userId: student.student.student._id
        });
        
        // Immediately update local state
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <StudentSidebar open={open} onClose={() => setOpen(false)} width={280} />
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${sidebarWidth}px)` } }}>
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1000, p: { xs: 0.5, sm: 1, md: 1.5 }, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => setOpen(v => !v)} size="small">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>{title}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton onClick={toggleTheme} size="small" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                {darkMode ? <LightModeIcon/> : <DarkModeIcon/>}
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton size="small" onClick={(e) => setNotifEl(e.currentTarget)}>
                <Badge color="error" badgeContent={unreadCount} invisible={unreadCount === 0}>
                  <NotificationsIcon/>
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* Notifications Menu */}
            <Menu 
              anchorEl={notifEl} 
              open={Boolean(notifEl)} 
              onClose={() => setNotifEl(null)}
              PaperProps={{ sx: { mt: 1, minWidth: 300, maxHeight: 400 } }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Notifications</Typography>
                  {unreadCount > 0 && (
                    <IconButton size="small" onClick={markAllRead}>
                      <DoneAllIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {notifications.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="body2">No notifications</Typography>
                  </Box>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <MenuItem 
                      key={notification._id}
                      onClick={() => {
                        setNotifEl(null);
                        
                        // Mark notification as read if not already read
                        if (!notification.isRead) {
                          markNotificationAsRead(notification._id);
                        }
                        
                        // Navigate to chat if it's a message notification
                        if (notification.relatedEntityType === 'message') {
                          navigate('/student/chat');
                        }
                      }}
                      sx={{ 
                        borderBottom: '1px solid', 
                        borderColor: 'divider',
                        bgcolor: notification.isRead ? 'transparent' : 'action.hover'
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: notification.isRead ? 400 : 600,
                            color: notification.isRead ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            mt: 0.5
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.disabled',
                            display: 'block',
                            mt: 0.5
                          }}
                        >
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Box>
            </Menu>
            
            <Tooltip title="Profile">
              <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 32, height: 32 }} src={student?.avatar?.url}><AccountIcon/></Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { mt: 1, minWidth: 180 } }}>
              <MenuItem onClick={() => { navigate('/student/update'); setAnchorEl(null) }}><SettingsIcon sx={{ mr: 1 }}/> Profile Settings</MenuItem>
              <Divider/>
              <MenuItem onClick={() => { dispatch(studentLogout()); navigate('/'); }} sx={{ color: 'error.main' }}><LogoutIcon sx={{ mr: 1 }}/> Logout</MenuItem>
            </Menu>
          </Box>
        </Box>
        <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default StudentLayout


