import React, { useState } from 'react'
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
  PersonAdd as PersonAddIcon,
  LibraryAdd as LibraryAddIcon,
  HowToReg as HowToRegIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  LibraryBooks as LibraryBooksIcon,
  ExitToApp as ExitToAppIcon,
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Home as HomeIcon,
  Room as RoomIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { adminLogout } from '../redux/actions/adminAction'
import toast from 'react-hot-toast'

const AdminSidebar = ({ open, onClose, isMobile, width = 280 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const admin = useSelector((state) => state.admin);
  const theme = useTheme();

  const [expandedItems, setExpandedItems] = useState({
    students: false,
    faculty: false,
    subjects: false,
    hostels: false,
    applicants: false
  });

  const handleLogout = () => {
    dispatch(adminLogout());
    toast.success("Logged Out Successfully");
    navigate('/admin/login');
  };

  const toggleExpanded = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin',
      color: 'primary'
    },
    {
      label: 'Applicants',
      icon: <GroupIcon />,
      color: 'primary',
      children: [
        {
          label: 'View Applicants',
          icon: <GroupIcon />,
          path: '/admin/applicants',
          color: 'primary'
        },
        {
          label: 'Applications',
          icon: <LibraryBooksIcon />,
          path: '/admin/applications',
          color: 'primary'
        }
      ]
    },
    {
      label: 'Students',
      icon: <PersonIcon />,
      color: 'info',
      children: [
        {
          label: 'Add Student',
          icon: <PersonAddIcon />,
          path: '/admin/add/students',
          color: 'info'
        },
        {
          label: 'View Students',
          icon: <PersonIcon />,
          path: '/admin/students',
          color: 'info'
        }
      ]
    },
    {
      label: 'Faculty',
      icon: <GroupIcon />,
      color: 'warning',
      children: [
        {
          label: 'Add Faculty',
          icon: <HowToRegIcon />,
          path: '/admin/add/faculties',
          color: 'warning'
        },
        {
          label: 'View Faculty',
          icon: <GroupIcon />,
          path: '/admin/faculties',
          color: 'warning'
        }
      ]
    },
    {
      label: 'Subjects',
      icon: <LibraryBooksIcon />,
      color: 'success',
      children: [
        {
          label: 'Add Subject',
          icon: <LibraryAddIcon />,
          path: '/admin/add/subjects',
          color: 'success'
        },
        {
          label: 'View Subjects',
          icon: <LibraryBooksIcon />,
          path: '/admin/subjects',
          color: 'success'
        }
      ]
    },
    {
      label: 'Departments',
      icon: <LibraryAddIcon />,
      color: 'secondary',
      children: [
        {
          label: 'Add Department',
          icon: <LibraryAddIcon />,
          path: '/admin/add/department',
          color: 'secondary'
        },
        {
          label: 'View Departments',
          icon: <LibraryBooksIcon />,
          path: '/admin/departments',
          color: 'secondary'
        }
      ]
    },
    {
      label: 'Hostels',
      icon: <HomeIcon />,
      color: 'info',
      children: [
        {
          label: 'Hostel List',
          icon: <HomeIcon />,
          path: '/admin/hostels',
          color: 'info'
        },
        {
          label: 'Choose Hostel',
          icon: <HomeIcon />,
          path: '/admin/hostels/add',
          color: 'info'
        },
        {
          label: 'Room Management',
          icon: <RoomIcon />,
          path: '/admin/hostels/rooms',
          color: 'info'
        },
        {
          label: 'Notices',
          icon: <NotificationsIcon />,
          path: '/admin/hostels/notices',
          color: 'info'
        },
        {
          label: 'Reports',
          icon: <AssessmentIcon />,
          path: '/admin/hostels/reports',
          color: 'info'
        }
      ]
    },
    {
      label: 'Fee Management',
      icon: <PaymentIcon />,
      color: 'info',
      children: [
        {
          label: 'Hostel Fees',
          icon: <PaymentIcon />,
          path: '/admin/fees/hostel',
          color: 'info'
        },
        {
          label: 'College Fees',
          icon: <PaymentIcon />,
          path: '/admin/fees/college',
          color: 'info'
        }
      ]
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      path: '/admin/settings',
      color: 'secondary'
    }
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
          src={admin.admin?.avatar}
        >
          <AdminIcon sx={{ fontSize: open ? 30 : 20 }} />
        </Avatar>
        {open && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {admin.admin?.name || 'Admin'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {admin.admin?.registrationNumber || 'Admin ID'}
            </Typography>
            <Chip
              label="Administrator"
              size="small"
              color="primary"
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

export default AdminSidebar;
