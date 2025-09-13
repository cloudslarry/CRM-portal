import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Home as HomeIcon,
  Room as RoomIcon,
  Bed as BedIcon,
  Person as PersonIcon,
  SupervisorAccount as WardenIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Notifications as NotificationsIcon,
  Wifi as WifiIcon,
  LocalLaundryService as LaundryIcon,
  FitnessCenter as GymIcon,
  Restaurant as RestaurantIcon,
  DirectionsCar as ParkingIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import StudentLayout from '../../../components/StudentLayout';
import { studentHostelApi } from '../../../api/hostelApi';
import toast from 'react-hot-toast';

const MyHostel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const studentStore = useSelector((store) => store.student);
  const student = studentStore?.student?.student || {};
  
  const [hostelData, setHostelData] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHostelData();
  }, []);

  const fetchHostelData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch student's hostel information
      const [hostelResponse, roomResponse, feeResponse] = await Promise.allSettled([
        studentHostelApi.getMyHostel(),
        studentHostelApi.getMyRoom(),
        studentHostelApi.getMyFees()
      ]);

      if (hostelResponse.status === 'fulfilled') {
        // API returns { result: { hostel, studentInfo } }
        setHostelData(hostelResponse.value.data?.result?.hostel || null);
      }

      if (roomResponse.status === 'fulfilled') {
        // API returns { result: { room, studentInfo } }
        setRoomData(roomResponse.value.data?.result?.room || null);
      }

      if (feeResponse.status === 'fulfilled') {
        setFeeData(feeResponse.value.data.result);
      }

      // Check if student is not assigned to any hostel
      if (hostelResponse.status === 'rejected' && hostelResponse.reason.response?.status === 404) {
        setError('You are not assigned to any hostel yet.');
      }

    } catch (err) {
      console.error('Error fetching hostel data:', err);
      setError('Failed to load hostel information');
      toast.error('Failed to load hostel information');
    } finally {
      setLoading(false);
    }
  };

  const getFacilityIcon = (facility) => {
    const facilityLower = facility.toLowerCase();
    if (facilityLower.includes('wifi') || facilityLower.includes('internet')) return <WifiIcon />;
    if (facilityLower.includes('laundry')) return <LaundryIcon />;
    if (facilityLower.includes('gym') || facilityLower.includes('fitness')) return <GymIcon />;
    if (facilityLower.includes('mess') || facilityLower.includes('food')) return <RestaurantIcon />;
    if (facilityLower.includes('parking')) return <ParkingIcon />;
    if (facilityLower.includes('security')) return <SecurityIcon />;
    return <HomeIcon />;
  };

  const getFeeStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Unpaid': return 'error';
      default: return 'default';
    }
  };

  const handleDownloadReceipt = async (feeId, status) => {
    try {
      if (status !== 'Paid') {
        toast.error('Pay fees before downloading receipt');
        return;
      }
      const response = await studentHostelApi.downloadFeeReceipt(feeId);
      // Handle cases where API may return JSON error
      const contentType = response?.headers?.['content-type'] || 'application/pdf';
      const dataIsBlob = response?.data instanceof Blob;
      const blob = dataIsBlob ? response.data : new Blob([response.data], { type: contentType });
      if (!dataIsBlob && contentType.includes('application/json')) {
        const text = await blob.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json?.message || 'Failed to download receipt');
        } catch (e) {
          // Not JSON or error parsed: proceed to save as PDF fallback
        }
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hostel-receipt-${feeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Receipt download failed', err);
      toast.error('Failed to download receipt');
    }
  };

  if (loading) {
    return (
      <StudentLayout title="My Hostel">
        <Container maxWidth="lg">
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="text" width={300} height={20} />
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
          </Grid>
        </Container>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout title="My Hostel">
        <Container maxWidth="lg">
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              My Hostel
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your hostel and accommodation details
            </Typography>
          </Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchHostelData}
          >
            Refresh
          </Button>
        </Container>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="My Hostel">
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            My Hostel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your hostel and accommodation details
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Hostel Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <HomeIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {hostelData?.name || 'Hostel Name'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hostelData?.location || 'Location'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <WardenIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Warden" 
                      secondary={hostelData?.warden || 'Not specified'} 
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Location" 
                      secondary={hostelData?.location || 'Not specified'} 
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Capacity" 
                      secondary={`${hostelData?.capacity || 0} students`} 
                    />
                  </ListItem>
                </List>

                {hostelData?.description && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hostelData.description}
                    </Typography>
                  </>
                )}

                {hostelData?.facilities && hostelData.facilities.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Facilities
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {hostelData.facilities.map((facility, index) => (
                        <Chip
                          key={index}
                          icon={getFacilityIcon(facility)}
                          label={facility}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Room Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <RoomIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Room {roomData?.roomNumber || 'Not Assigned'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {roomData?.type || 'Room Type'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <RoomIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Room Number" 
                      secondary={roomData?.roomNumber || 'Not assigned'} 
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <BedIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Room Type" 
                      secondary={roomData?.type || 'Not specified'} 
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Capacity" 
                      secondary={`${roomData?.occupied || 0}/${roomData?.capacity || 0} students`} 
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <HomeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Status" 
                      secondary={
                        <Chip
                          label={roomData?.status || 'Unknown'}
                          color={roomData?.status === 'Active' ? 'success' : 'warning'}
                          size="small"
                        />
                      } 
                    />
                  </ListItem>
                </List>

                {roomData?.students && roomData.students.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Roommates
                    </Typography>
                    <List dense>
                      {roomData.students.map((roommate, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <PersonIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={roommate.name}
                            secondary={roommate.registrationNumber}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Fee Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <MoneyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Hostel Fees
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your fee payment status
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<NotificationsIcon />}
                    onClick={() => navigate('/student/hostel/notices')}
                  >
                    View Notices
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                {feeData && feeData.length > 0 ? (
                  <List>
                    {feeData.map((fee, index) => (
                      <React.Fragment key={fee._id || index}>
                        <ListItem sx={{ px: 0, alignItems: 'flex-start' }}
                          secondaryAction={
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleDownloadReceipt(fee._id, fee.status)}
                              disabled={fee.status !== 'Paid'}
                            >
                              Download Receipt
                            </Button>
                          }
                        >
                          <ListItemIcon>
                            <MoneyIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={`₹${fee.amount} - ${fee.hostel?.name || 'Hostel Fee'}`}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Due Date: {new Date(fee.dueDate).toLocaleDateString()}
                                </Typography>
                                <Chip
                                  label={fee.status}
                                  color={getFeeStatusColor(fee.status)}
                                  size="small"
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < feeData.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <MoneyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No fee records found
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/student/hostel/fees')}
                    sx={{ mr: 1 }}
                  >
                    View All Fees
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchHostelData}
                  >
                    Refresh
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </StudentLayout>
  );
};

export default MyHostel;
