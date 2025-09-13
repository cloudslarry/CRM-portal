import React, { useState } from 'react'
import { Box, IconButton, Typography, useTheme, useMediaQuery, Tooltip, Avatar, Menu, MenuItem, Divider, Badge, ListItemText } from '@mui/material'
import { Menu as MenuIcon, Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon, Notifications as NotificationsIcon, DoneAll as DoneAllIcon, Settings as SettingsIcon, Logout as LogoutIcon, AccountCircle as AccountIcon } from '@mui/icons-material'
import StudentSidebar from './StudentSidebar'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { studentLogout } from '../redux/actions/studentAction'

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

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New grade posted', body: 'Check your performance page.', read: false },
    { id: 2, title: 'Event tomorrow', body: 'Workshop at 2PM in Hall A.', read: false }
  ])
  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))

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
              <IconButton size="small" onClick={() => navigate('/student/notifications')}>
                <Badge color="error" badgeContent={unreadCount} invisible={unreadCount === 0}>
                  <NotificationsIcon/>
                </Badge>
              </IconButton>
            </Tooltip>
            
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


