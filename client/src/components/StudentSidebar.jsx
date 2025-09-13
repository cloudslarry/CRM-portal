import React from 'react'
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Avatar, Typography, useTheme, useMediaQuery } from '@mui/material'
import { Dashboard as DashboardIcon, LibraryBooks as SubjectsIcon, Assessment as PerformanceIcon, Group as AttendanceIcon, Search as SearchIcon, Chat as ChatIcon, ExitToApp as ExitToAppIcon, Settings as SettingsIcon, Person as PersonIcon, Home as HomeIcon } from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { studentLogout } from '../redux/actions/studentAction'

const StudentSidebar = ({ open, onClose, width = 280 }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()
  const student = useSelector((s) => s.student)

  const items = [
    { label: 'Dashboard', icon: <DashboardIcon/>, path: '/home', color: 'primary' },
    { label: 'Subjects', icon: <SubjectsIcon/>, path: '/student/subjects', color: 'info' },
    { label: 'Performance', icon: <PerformanceIcon/>, path: '/student/performance', color: 'success' },
    { label: 'Attendance', icon: <AttendanceIcon/>, path: '/student/attendance', color: 'warning' },
    { label: 'My Hostel', icon: <HomeIcon/>, path: '/student/hostel', color: 'info' },
    { label: 'College Fees', icon: <HomeIcon/>, path: '/student/college/fees', color: 'info' },
    { label: 'Hostel Fees', icon: <HomeIcon/>, path: '/student/hostel/fees', color: 'info' },
    { label: 'Search', icon: <SearchIcon/>, path: '/student/search', color: 'secondary' },
    { label: 'Chat List', icon: <ChatIcon/>, path: '/student/chatList', color: 'error' },
    { label: 'Settings', icon: <SettingsIcon/>, path: '/student/settings', color: 'secondary' },
  ]

  const isActive = (path) => location.pathname === path
  const drawerWidth = open ? width : 64

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open || !isMobile}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Box sx={{ p: open ? 2 : 1, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: open ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', minHeight: open ? 120 : 64 }}>
        <Avatar sx={{ mx: 'auto', mb: open ? 1 : 0, bgcolor: 'primary.main', width: open ? 56 : 36, height: open ? 56 : 36 }} src={student.student?.student?.avatar?.url}>
          <PersonIcon />
        </Avatar>
        {open && (
          <>
            <Typography variant="subtitle1" fontWeight={600}>{student.student?.student?.name || 'Student'}</Typography>
            <Typography variant="caption" color="text.secondary">{student.student?.student?.registrationNumber || ''}</Typography>
          </>
        )}
      </Box>
      <List sx={{ flexGrow: 1 }}>
        {items.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              onClick={() => { navigate(item.path); if (isMobile) onClose?.() }}
              sx={{
                mx: 1, my: 0.25, borderRadius: 1,
                backgroundColor: isActive(item.path) ? 'primary.main' : 'transparent',
                color: isActive(item.path) ? 'common.white' : 'text.primary',
                '&:hover': { backgroundColor: isActive(item.path) ? 'primary.dark' : 'action.hover' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'common.white' : `${item.color}.main` }}>{item.icon}</ListItemIcon>
              {open && <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive(item.path) ? 600 : 400 }} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: open ? 2 : 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItemButton
          onClick={() => { dispatch(studentLogout()); navigate('/') }}
          sx={{ borderRadius: 2, color: 'error.main', justifyContent: open ? 'flex-start' : 'center', minHeight: open ? 'auto' : 48, '&:hover': { backgroundColor: 'error.light', color: 'common.white' } }}
        >
          <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', justifyContent: 'center' }}>
            <ExitToAppIcon color="error" />
          </ListItemIcon>
          {open && <ListItemText primary="Logout" />}
        </ListItemButton>
      </Box>
    </Drawer>
  )
}

export default StudentSidebar


