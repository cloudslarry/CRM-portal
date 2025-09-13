import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Room as RoomIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import AdminLayout from '../../../components/AdminLayout';
import { fetchHostels } from '../../../redux/actions/hostelAction';
import toast from 'react-hot-toast';

const AllRoomsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hostels, loading } = useSelector((state) => state.hostel);

  useEffect(() => {
    if (hostels.length === 0) {
      dispatch(fetchHostels());
    }
  }, [dispatch, hostels.length]);

  const goToHostel = (name) => {
    const hostel = hostels.find(h => (h.name || '').toLowerCase() === name.toLowerCase());
    if (hostel) {
      navigate(`/admin/hostels/${hostel._id}/rooms`);
      return;
    }
    toast.error(`${name} not found. Please create or select it first.`);
  };

  return (
    <AdminLayout title="Room Management">
      <Box sx={{ 
        p: { xs: 0.25, sm: 0.5, md: 1, lg: 1.5 },
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <Container 
          maxWidth="xl"
          sx={{
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Breadcrumbs */}
          <Box sx={{ mb: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link
                color="inherit"
                href="/admin"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/admin');
                }}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <HomeIcon sx={{ fontSize: 16 }} />
                Admin
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <RoomIcon sx={{ fontSize: 16 }} />
                Room Management
              </Typography>
            </Breadcrumbs>
          </Box>

          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Choose Hostel Room Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Select Boys or Girls Hostel to manage rooms
              </Typography>
            </Box>
          </Box>

          {/* Selection Cards */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ bgcolor: 'info.main' }}><HomeIcon /></Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Boys Hostel Rooms</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Manage rooms and assignments for Boys Hostel.
                  </Typography>
                  <Button variant="contained" onClick={() => goToHostel('Boys Hostel')}>Go to Boys Hostel Management</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}><HomeIcon /></Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Girls Hostel Rooms</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Manage rooms and assignments for Girls Hostel.
                  </Typography>
                  <Button variant="contained" onClick={() => goToHostel('Girls Hostel')}>Go to Girls Hostel Management</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default AllRoomsList;
