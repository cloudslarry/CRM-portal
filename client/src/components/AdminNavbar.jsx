import React, { useState, useEffect } from 'react'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Avatar,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material'
import {
  PersonAdd as PersonAddIcon,
  LibraryAdd as LibraryAddIcon,
  HowToReg as HowToRegIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  LibraryBooks as LibraryBooksIcon,
  ExitToApp as ExitToAppIcon,
  AdminPanelSettings as AdminIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { adminLogout } from '../redux/actions/adminAction'
import toast from 'react-hot-toast'

const AdminNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const admin = useSelector((state) => state.admin);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = () => {
    navigate('/admin/notifications');
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const logoutHandler = () => {
    dispatch(adminLogout());
    toast.success("Logged Out Successfully");
    navigate('/admin/login');
    handleMenuClose();
  };

  const navigationItems = [
    {
      label: 'Add Student',
      icon: <PersonAddIcon />,
      action: () => navigate('/admin/add/students'),
      color: 'primary'
    },
    {
      label: 'Add Faculty',
      icon: <HowToRegIcon />,
      action: () => navigate('/admin/add/faculties'),
      color: 'secondary'
    },
    {
      label: 'Add Subject',
      icon: <LibraryAddIcon />,
      action: () => navigate('/admin/add/subjects'),
      color: 'success'
    },
    {
      label: 'Students',
      icon: <PersonIcon />,
      action: () => navigate('/admin/students'),
      color: 'info'
    },
    {
      label: 'Faculty',
      icon: <GroupIcon />,
      action: () => navigate('/admin/faculties'),
      color: 'warning'
    },
    {
      label: 'Subjects',
      icon: <LibraryBooksIcon />,
      action: () => navigate('/admin/subjects'),
      color: 'error'
    }
  ];

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
          <Avatar
            sx={{
              mr: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              width: 40,
              height: 40
            }}
          >
            <AdminIcon />
          </Avatar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              color: 'white'
            }}
          >
            Smart ERP
          </Typography>
          <Chip
            label="Admin"
            size="small"
            sx={{
              ml: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem'
            }}
          />
        </Box>

        {/* Navigation Items - Desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {navigationItems.map((item, index) => (
              <Tooltip key={index} title={item.label} arrow>
                <IconButton
                  onClick={item.action}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        )}

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <Tooltip title="Notifications" arrow>
            <IconButton
              onClick={handleNotificationOpen}
              sx={{
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <Tooltip title="Profile Menu" arrow>
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'rgba(255,255,255,0.2)'
                }}
                src={admin.admin?.avatar}
              >
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }
          }}
        >
          <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
            <PersonIcon sx={{ mr: 2 }} color="primary" />
            <Typography>Dashboard</Typography>
          </MenuItem>
          <MenuItem onClick={() => { navigate('/admin/profile'); handleMenuClose(); }}>
            <AccountCircleIcon sx={{ mr: 2 }} color="primary" />
            <Typography>Profile</Typography>
          </MenuItem>
          <MenuItem onClick={() => { navigate('/admin/settings'); handleMenuClose(); }}>
            <AdminIcon sx={{ mr: 2 }} color="primary" />
            <Typography>Settings</Typography>
          </MenuItem>
          <MenuItem onClick={logoutHandler} sx={{ color: 'error.main' }}>
            <ExitToAppIcon sx={{ mr: 2 }} color="error" />
            <Typography>Logout</Typography>
          </MenuItem>
        </Menu>

        
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;
