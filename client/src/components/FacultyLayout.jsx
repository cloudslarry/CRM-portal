import React, { useState } from 'react'
import { Box, IconButton, Typography, useTheme, useMediaQuery, Avatar, Tooltip, Menu, MenuItem, Divider, Badge, ListItemText } from '@mui/material'
import { Menu as MenuIcon, Logout as LogoutIcon, Settings as SettingsIcon, AccountCircle as AccountIcon, Notifications as NotificationsIcon, DoneAll as DoneAllIcon, Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon } from '@mui/icons-material'
import FacultySidebar from './FacultySidebar'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { facultyLogout } from '../redux/actions/facultyAction'
import toast from 'react-hot-toast'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext'

const FacultyLayout = ({ title = 'Faculty', children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(!isMobile)
  const [anchorEl, setAnchorEl] = useState(null)
  const sidebarWidth = open ? 280 : 64
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const facultyStore = useSelector((s) => s.faculty)
  const { darkMode, toggleTheme } = useCustomTheme()

  // Simple in-memory notifications demo (replace with backend later)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New message from Admin', body: 'Staff meeting at 4 PM today.', read: false },
    { id: 2, title: 'Attendance Reminder', body: 'Mark attendance within 24 hours.', read: false },
  ])
  const unreadCount = notifications.filter(n => !n.read).length

  const handleProfileMenuOpen = (e) => setAnchorEl(e.currentTarget)
  const handleProfileMenuClose = () => setAnchorEl(null)
  const handleNotifNavigate = () => navigate('/faculty/notifications')
  const handleLogout = () => {
    dispatch(facultyLogout())
    toast.success('Logged out successfully')
    handleProfileMenuClose()
    navigate('/')
  }
  const markAllRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <FacultySidebar open={open} onClose={() => setOpen(false)} width={280} />
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${sidebarWidth}px)` } }}>
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1000, p: { xs: 0.5, sm: 1, md: 1.5 }, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: { xs: 0.5, sm: 1 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => setOpen((v) => !v)} size="small" sx={{ color: 'text.primary' }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>{title}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton onClick={toggleTheme} size="small" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton onClick={handleNotifNavigate} size="small">
                <Badge color="error" badgeContent={unreadCount} invisible={unreadCount === 0}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            

            <Tooltip title="Profile">
              <IconButton onClick={handleProfileMenuOpen} size="small">
                <Avatar sx={{ width: 32, height: 32 }} src={facultyStore.faculty?.faculty?.avatar?.url}>
                  <AccountIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose} PaperProps={{ sx: { mt: 1, minWidth: 180 } }}>
              <MenuItem onClick={() => { navigate('/faculty/update'); handleProfileMenuClose() }}>
                <SettingsIcon sx={{ mr: 1 }} /> Profile Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 }, width: '100%', boxSizing: 'border-box' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default FacultyLayout


