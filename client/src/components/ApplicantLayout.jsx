import React, { useState, useEffect } from 'react';
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
  Login as LoginIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { studentLogout } from '../redux/actions/studentAction';
import ApplicantSidebar from './ApplicantSidebar';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const ApplicantLayout = ({ children, title = "Applicant Portal" }) => {
  const student = useSelector((state) => state.student);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { darkMode, toggleTheme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on component mount and when student state changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const hasStudentAuth = student.isAuthenticated;
      const hasApplicantToken = localStorage.getItem('applicantToken');
      setIsAuthenticated(hasStudentAuth || !!hasApplicantToken);
    };

    checkAuthStatus();
    
    // Listen for storage changes (when applicant token is set/removed in other tabs)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [student.isAuthenticated]);

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
    dispatch(studentLogout());
    localStorage.removeItem('applicantToken');
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
    navigate('/');
    handleProfileMenuClose();
  };

  const handleLogin = () => {
    navigate('/applicant/login');
    handleProfileMenuClose();
  };

  const handleSettings = () => {
    navigate('/student/settings');
    handleProfileMenuClose();
  };

  const sidebarWidth = sidebarOpen ? 280 : 64;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Collapsible Sidebar */}
      <ApplicantSidebar
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

            {/* Notifications - Only show for authenticated users */}
            {isAuthenticated && (
              <Tooltip title="Notifications">
                <IconButton 
                  size="small"
                  onClick={() => navigate('/student/notifications')}
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    minWidth: { xs: 32, sm: 36, md: 40 },
                    minHeight: { xs: 32, sm: 36, md: 40 },
                    p: { xs: 0.5, sm: 1 }
                  }}
                >
                  <Badge badgeContent={0} color="error">
                    <NotificationsIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            
            {/* Login/Profile Button */}
            {isAuthenticated ? (
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
                    src={student.student?.avatar?.url}
                  >
                    <AccountIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }} />
                  </Avatar>
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Login">
                <IconButton 
                  onClick={handleLogin}
                  size="small"
                  sx={{ 
                    minWidth: { xs: 32, sm: 36, md: 40 },
                    minHeight: { xs: 32, sm: 36, md: 40 },
                    p: { xs: 0.5, sm: 1 },
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white',
                    }
                  }}
                >
                  <LoginIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }} />
                </IconButton>
              </Tooltip>
            )}
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
          {isAuthenticated ? (
            <>
              <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Avatar 
                  sx={{ width: 48, height: 48, mx: 'auto', mb: 1 }}
                  src={student.student?.avatar?.url}
                >
                  <AccountIcon />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {student.student?.name || 'Applicant'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.student?.email || 'applicant@college.edu'}
                </Typography>
              </Box>
              
              <MenuItem onClick={() => { navigate('/admissions/apply'); handleProfileMenuClose(); }}>
                <SettingsIcon sx={{ mr: 2 }} />
                Apply Admission
              </MenuItem>
              
              <MenuItem onClick={() => { navigate('/admissions/status'); handleProfileMenuClose(); }}>
                <SettingsIcon sx={{ mr: 2 }} />
                Check Status
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 2 }} />
                Logout
              </MenuItem>
            </>
          ) : (
            <>
              <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Avatar 
                  sx={{ width: 48, height: 48, mx: 'auto', mb: 1, bgcolor: 'primary.main' }}
                >
                  <AccountIcon />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Guest User
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please login to access features
                </Typography>
              </Box>
              
              <MenuItem onClick={() => { navigate('/applicant/register'); handleProfileMenuClose(); }}>
                <SettingsIcon sx={{ mr: 2 }} />
                Register
              </MenuItem>
              
              <MenuItem onClick={() => { navigate('/admissions/apply'); handleProfileMenuClose(); }}>
                <SettingsIcon sx={{ mr: 2 }} />
                Apply Admission
              </MenuItem>
              
              <MenuItem onClick={() => { navigate('/admissions/status'); handleProfileMenuClose(); }}>
                <SettingsIcon sx={{ mr: 2 }} />
                Check Status
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={handleLogin} sx={{ color: 'primary.main' }}>
                <LogoutIcon sx={{ mr: 2 }} />
                Login
              </MenuItem>
            </>
          )}
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

export default ApplicantLayout;


