import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Alert,
  TextField,
  InputAdornment,
  Chip,
  Paper,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Description as DescriptionIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import StudentLayout from '../../../components/StudentLayout';
import { studentHostelApi } from '../../../api/hostelApi';
import toast from 'react-hot-toast';

const HostelNotices = () => {
  const studentStore = useSelector((store) => store.student);
  const student = studentStore?.student?.student || {};
  
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, recent, my-hostel

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    filterNotices();
  }, [notices, searchTerm, filterType]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch notices for student's hostel
      const response = await studentHostelApi.getMyHostelNotices();
      setNotices(response.data.result || []);

    } catch (err) {
      console.error('Error fetching notices:', err);
      setError('Failed to load hostel notices');
      toast.error('Failed to load hostel notices');
    } finally {
      setLoading(false);
    }
  };

  const filterNotices = () => {
    let filtered = notices.filter(notice => {
      const matchesSearch = !searchTerm || 
        notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.message?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterType === 'all' || 
        (filterType === 'recent' && isRecentNotice(notice)) ||
        (filterType === 'my-hostel' && notice.hostel);

      return matchesSearch && matchesFilter;
    });

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredNotices(filtered);
  };

  const isRecentNotice = (notice) => {
    const noticeDate = new Date(notice.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - noticeDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNoticePriority = (notice) => {
    // Simple priority based on keywords in title/message
    const text = (notice.title + ' ' + notice.message).toLowerCase();
    if (text.includes('urgent') || text.includes('important') || text.includes('emergency')) {
      return 'high';
    }
    if (text.includes('reminder') || text.includes('deadline')) {
      return 'medium';
    }
    return 'low';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <StudentLayout title="Hostel Notices">
        <Container maxWidth="lg">
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="text" width={300} height={20} />
          </Box>
          <Grid container spacing={3}>
            {[1, 2, 3].map((index) => (
              <Grid item xs={12} key={index}>
                <Skeleton variant="rectangular" height={150} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Hostel Notices">
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Hostel Notices
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Important announcements and updates from your hostel
          </Typography>
        </Box>

        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant={filterType === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilterType('all')}
                startIcon={<FilterIcon />}
              >
                All Notices
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant={filterType === 'recent' ? 'contained' : 'outlined'}
                onClick={() => setFilterType('recent')}
                startIcon={<CalendarIcon />}
              >
                Recent (7 days)
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {notices.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Notices
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {notices.filter(isRecentNotice).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recent Notices
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {notices.filter(n => getNoticePriority(n) === 'high').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                High Priority
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Notices List */}
        {filteredNotices.length > 0 ? (
          <Grid container spacing={3}>
            {filteredNotices.map((notice, index) => {
              const priority = getNoticePriority(notice);
              return (
                <Grid item xs={12} key={notice._id || index}>
                  <Card sx={{ 
                    borderLeft: `4px solid ${
                      priority === 'high' ? '#f44336' : 
                      priority === 'medium' ? '#ff9800' : '#2196f3'
                    }`
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mt: 0.5 }}>
                          <NotificationsIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                              {notice.title}
                            </Typography>
                            <Chip
                              label={priority.toUpperCase()}
                              color={getPriorityColor(priority)}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {notice.message}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <HomeIcon color="primary" sx={{ fontSize: 16 }} />
                              <Typography variant="caption" color="text.secondary">
                                {notice.hostel?.name || 'Hostel'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PersonIcon color="primary" sx={{ fontSize: 16 }} />
                              <Typography variant="caption" color="text.secondary">
                                {notice.author?.name || 'Admin'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarIcon color="primary" sx={{ fontSize: 16 }} />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(notice.createdAt)}
                              </Typography>
                            </Box>
                            {notice.attachments && notice.attachments.length > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <DescriptionIcon color="primary" sx={{ fontSize: 16 }} />
                                <Typography variant="caption" color="text.secondary">
                                  {notice.attachments.length} attachment(s)
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No notices found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No notices have been posted yet'
                }
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchNotices}
              >
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Refresh Button */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchNotices}
            disabled={loading}
          >
            Refresh Notices
          </Button>
        </Box>
      </Container>
    </StudentLayout>
  );
};

export default HostelNotices;
