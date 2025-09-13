import React, { useState } from 'react';
import {
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Typography
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { adminLogout } from '../redux/actions/adminAction';
import AdminSidebar from './AdminSidebar';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const AdminLayout = ({ children, title = "Admin Dashboard" }) => {
  const admin = useSelector((state) => state.admin);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { darkMode, toggleTheme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(adminLogout());
    toast.success("Logged out successfully");
    navigate('/admin/login');
    handleProfileMenuClose();
  };

  const handleSettings = () => {
    navigate('/admin/settings');
    handleProfileMenuClose();
  };

  if (!admin.isAuthenticated) {
    navigate('/admin/login');
    return null;
  }

  const sidebarWidth = sidebarOpen ? 280 : 64;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Collapsible Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={handleDrawerToggle}
        isMobile={isMobile}
        width={sidebarWidth}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${sidebarWidth}px)` },
          minHeight: '100vh',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Top Bar with Controls */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            p: { xs: 0.5, sm: 1, md: 1.5, lg: 2 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            minHeight: { xs: 48, sm: 56, md: 64 },
            flexWrap: 'nowrap',
            overflow: 'hidden',
            width: '100%'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, sm: 1, md: 2 },
            minWidth: 0,
            flex: 1,
            overflow: 'hidden'
          }}>
            <IconButton
              onClick={handleDrawerToggle}
              size="small"
              sx={{ 
                color: 'text.primary',
                flexShrink: 0,
                minWidth: { xs: 36, sm: 40, md: 44 },
                minHeight: { xs: 36, sm: 40, md: 44 },
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              <MenuIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }} />
            </IconButton>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem', lg: '1.5rem' },
                display: { xs: 'none', sm: 'block' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
                maxWidth: '100%'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: { xs: 'block', sm: 'none' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
                maxWidth: '100%'
              }}
            >
              {title.length > 12 ? title.substring(0, 12) + '...' : title}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.25, sm: 0.5, md: 1 },
            flexShrink: 0,
            minWidth: 'auto'
          }}>
            {/* Theme Toggle */}
            <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton 
                onClick={toggleTheme} 
                color="inherit"
                size="small"
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  minWidth: { xs: 32, sm: 36, md: 40 },
                  minHeight: { xs: 32, sm: 36, md: 40 },
                  p: { xs: 0.5, sm: 1 }
                }}
              >
                {darkMode ? <LightModeIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} /> : <DarkModeIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
              </IconButton>
            </Tooltip>

            {/* Notifications - Hide on very small screens */}
            <Tooltip title="Notifications">
              <IconButton 
                size="small"
                onClick={() => navigate('/admin/notifications')}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  minWidth: { xs: 32, sm: 36, md: 40 },
                  minHeight: { xs: 32, sm: 36, md: 40 },
                  p: { xs: 0.5, sm: 1 }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* Profile Menu */}
            <Tooltip title="Profile">
              <IconButton 
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ 
                  minWidth: { xs: 32, sm: 36, md: 40 },
                  minHeight: { xs: 32, sm: 36, md: 40 },
                  p: { xs: 0.5, sm: 1 }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: { xs: 24, sm: 28, md: 32, lg: 36 }, 
                    height: { xs: 24, sm: 28, md: 32, lg: 36 },
                    fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' }
                  }}
                  src={admin.admin?.avatar}
                >
                  <AccountIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }} />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid',
              borderColor: 'divider'
            }
          }}
        >
          <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Avatar 
              sx={{ width: 48, height: 48, mx: 'auto', mb: 1 }}
              src={admin.admin?.avatar}
            >
              <AccountIcon />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {admin.admin?.name || 'Admin'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {admin.admin?.registrationNumber || 'Admin ID'}
            </Typography>
          </Box>
          
          <MenuItem onClick={handleSettings}>
            <SettingsIcon sx={{ mr: 2 }} />
            Settings
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Page Content */}
        <Box sx={{ 
          p: { xs: 0.5, sm: 1, md: 2, lg: 3 },
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
