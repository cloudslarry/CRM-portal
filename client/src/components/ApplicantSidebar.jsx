import React, { useState, useEffect } from 'react'
import { 
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Collapse,
  Chip
} from '@mui/material'
import {
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  Info as InfoIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { studentLogout } from '../redux/actions/studentAction'
import toast from 'react-hot-toast'

const ApplicantSidebar = ({ open, onClose, isMobile, width = 280 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const student = useSelector((state) => state.student);
  const theme = useTheme();

  const [expandedItems, setExpandedItems] = useState({
    applications: false,
    information: false
  });
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

  const handleLogout = () => {
    dispatch(studentLogout());
    // Also clear applicant token if exists
    localStorage.removeItem('applicantToken');
    setIsAuthenticated(false);
    toast.success("Logged Out Successfully");
    navigate('/');
  };

  const toggleExpanded = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const navigationItems = [
    {
      label: 'Apply Admission',
      icon: <AssignmentIcon />,
      path: '/admissions/apply',
      color: 'primary'
    },
    {
      label: 'Applications',
      icon: <SearchIcon />,
      color: 'info',
      children: [
        {
          label: 'Check Status',
          icon: <SearchIcon />,
          path: '/admissions/status',
          color: 'info'
        }
      ]
    },
    {
      label: 'Information',
      icon: <InfoIcon />,
      color: 'success',
      children: [
        {
          label: 'Courses & Fees',
          icon: <SchoolIcon />,
          path: '/courses',
          color: 'success'
        },
        {
          label: 'College Info',
          icon: <InfoIcon />,
          path: '/college',
          color: 'success'
        }
      ]
    },
    // Only show account section for non-authenticated users
    ...(isAuthenticated ? [] : [{
      label: 'Account',
      icon: <PersonIcon />,
      color: 'secondary',
      children: [
        {
          label: 'Register',
          icon: <PersonAddIcon />,
          path: '/applicant/register',
          color: 'secondary'
        },
        {
          label: 'Login',
          icon: <LoginIcon />,
          path: '/applicant/login',
          color: 'secondary'
        }
      ]
    }])
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const renderNavigationItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.label.toLowerCase()];
    const isItemActive = isActive(item.path);

    return (
      <React.Fragment key={item.label}>
        <ListItem disablePadding sx={{ pl: level * 2 }}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                toggleExpanded(item.label.toLowerCase());
              } else if (item.path) {
                navigate(item.path);
                if (isMobile) onClose();
              }
            }}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              backgroundColor: isItemActive ? 'primary.main' : 'transparent',
              color: isItemActive ? 'white' : 'text.primary',
              '&:hover': {
                backgroundColor: isItemActive ? 'primary.dark' : 'action.hover',
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ListItemIcon
              sx={{
                color: isItemActive ? 'white' : item.color + '.main',
                minWidth: 40
              }}
            >
              {item.icon}
            </ListItemIcon>
            {open && (
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isItemActive ? 'bold' : 'normal'
                }}
              />
            )}
            {hasChildren && open && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && open && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => renderNavigationItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: open ? 3 : 2, 
        textAlign: 'center', 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        minHeight: open ? 'auto' : 64,
        display: 'flex',
        flexDirection: open ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: open ? 'center' : 'center'
      }}>
        <Avatar
          sx={{
            width: open ? 60 : 40,
            height: open ? 60 : 40,
            mx: open ? 'auto' : 0,
            mb: open ? 2 : 0,
            bgcolor: 'primary.main'
          }}
          src={student.student?.avatar?.url}
        >
          <PersonIcon sx={{ fontSize: open ? 30 : 20 }} />
        </Avatar>
        {open && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {isAuthenticated ? (student.student?.name || 'Applicant') : 'Guest User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {isAuthenticated ? (student.student?.email || 'applicant@college.edu') : 'Please login to access features'}
            </Typography>
            <Chip
              label={isAuthenticated ? "Applicant" : "Guest"}
              size="small"
              color={isAuthenticated ? "primary" : "default"}
              sx={{ fontWeight: 'bold' }}
            />
          </>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {navigationItems.map((item) => renderNavigationItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: open ? 2 : 1, borderTop: '1px solid', borderColor: 'divider' }}>
        {isAuthenticated ? (
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: 'error.main',
              justifyContent: open ? 'flex-start' : 'center',
              minHeight: open ? 'auto' : 48,
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'white'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', justifyContent: 'center' }}>
              <ExitToAppIcon color="error" />
            </ListItemIcon>
            {open && <ListItemText primary="Logout" />}
          </ListItemButton>
        ) : (
          <ListItemButton
            onClick={() => navigate('/applicant/login')}
            sx={{
              borderRadius: 2,
              color: 'primary.main',
              justifyContent: open ? 'flex-start' : 'center',
              minHeight: open ? 'auto' : 48,
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', justifyContent: 'center' }}>
              <LoginIcon color="primary" />
            </ListItemIcon>
            {open && <ListItemText primary="Login" />}
          </ListItemButton>
        )}
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          background: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default ApplicantSidebar;


