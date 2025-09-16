import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import AdminLayout from '../../../components/AdminLayout';
import { fetchAllNotices, createNotice, updateNotice, deleteNotice } from '../../../redux/actions/hostelAction';
import { fetchHostels } from '../../../redux/actions/hostelAction';
import toast from 'react-hot-toast';

const HostelNotices = () => {
  const dispatch = useDispatch();
  const { darkMode } = useTheme();
  const { notices, hostels, loading } = useSelector((state) => state.hostel);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterHostel, setFilterHostel] = useState('');
  const [noticeData, setNoticeData] = useState({
    hostel: '',
    title: '',
    message: '',
    attachments: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = notices.filter(notice => {
      const matchesSearch = !searchTerm || 
        notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.hostel?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesHostel = !filterHostel || notice.hostel?._id === filterHostel;
      
      return matchesSearch && matchesHostel;
    });
    
    setFilteredNotices(filtered);
  }, [notices, searchTerm, filterHostel]);

  const fetchData = async () => {
    await dispatch(fetchAllNotices());
    await dispatch(fetchHostels());
  };

  const handleMenuClick = (event, notice) => {
    setSelectedNotice(notice);
  };

  const handleCreateNotice = () => {
    setNoticeData({ hostel: '', title: '', message: '', attachments: [] });
    setCreateDialogOpen(true);
  };

  const handleEditNotice = () => {
    setNoticeData({
      hostel: selectedNotice.hostel._id,
      title: selectedNotice.title,
      message: selectedNotice.message,
      attachments: selectedNotice.attachments || []
    });
    setEditDialogOpen(true);
  };

  const handleDeleteNotice = () => {
    setDeleteDialogOpen(true);
  };

  const confirmCreateNotice = async () => {
    if (!noticeData.hostel || !noticeData.title || !noticeData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await dispatch(createNotice(noticeData));
    if (result.success) {
      toast.success('Notice created successfully');
      setCreateDialogOpen(false);
      setNoticeData({ hostel: '', title: '', message: '', attachments: [] });
      fetchData();
    } else {
      toast.error(result.error?.message || 'Failed to create notice');
    }
  };

  const confirmUpdateNotice = async () => {
    if (!noticeData.title || !noticeData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await dispatch(updateNotice(selectedNotice._id, noticeData));
    if (result.success) {
      toast.success('Notice updated successfully');
      setEditDialogOpen(false);
      setSelectedNotice(null);
      fetchData();
    } else {
      toast.error(result.error?.message || 'Failed to update notice');
    }
  };

  const confirmDeleteNotice = async () => {
    if (!selectedNotice) return;
    const result = await dispatch(deleteNotice(selectedNotice._id));
    if (result.success) {
      toast.success('Notice deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedNotice(null);
      fetchData();
    } else {
      toast.error(result.error?.message || 'Failed to delete notice');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Hostel Notices">
        <Box sx={{ p: 3 }}>
          <Container maxWidth="xl">
            <Skeleton variant="rectangular" height={400} />
          </Container>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Hostel Notice Management">
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
          {/* Header */}
          <Box sx={{ 
            mb: { xs: 1, sm: 1.5, md: 2 },
            p: { xs: 0.25, sm: 1 }
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: { xs: 1, sm: 1.5 },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem', lg: '2.5rem' },
                    lineHeight: 1.2
                  }}
                >
                  Hostel Notice Management
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    lineHeight: 1.4
                  }}
                >
                  Create and manage hostel notices and announcements
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 1, sm: 1.5, md: 2 },
                flexDirection: { xs: 'column', sm: 'row' },
                width: { xs: '100%', sm: 'auto' }
              }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                  onClick={fetchData}
                  disabled={loading}
                  sx={{
                    borderRadius: { xs: 1, sm: 2 },
                    px: { xs: 1.25, sm: 1.5, md: 2 },
                    py: { xs: 0.5, sm: 0.75, md: 1 },
                    minHeight: { xs: 36, sm: 40, md: 44 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                  onClick={handleCreateNotice}
                  sx={{
                    borderRadius: { xs: 1, sm: 2 },
                    px: { xs: 1.25, sm: 1.5, md: 2 },
                    py: { xs: 0.5, sm: 0.75, md: 1 },
                    minHeight: { xs: 36, sm: 40, md: 44 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    width: { xs: '100%', sm: 'auto' },
                    background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                    }
                  }}
                >
                  Create Notice
                </Button>
              </Box>
            </Box>

            {/* Search and Filter Bar */}
            <Paper sx={{ 
              p: { xs: 0.5, sm: 0.75, md: 1 }, 
              mb: { xs: 1, sm: 1.5 }, 
              borderRadius: { xs: 1, sm: 2 },
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <Grid container spacing={{ xs: 0.75, sm: 1 }} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search notices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon 
                            color="primary" 
                            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      borderRadius: { xs: 1, sm: 2 },
                      '& .MuiInputBase-root': {
                        minHeight: { xs: 36, sm: 40, md: 44 }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Hostel</InputLabel>
                    <Select
                      value={filterHostel}
                      onChange={(e) => setFilterHostel(e.target.value)}
                      label="Hostel"
                      sx={{
                        minHeight: { xs: 36, sm: 40, md: 44 },
                        '& .MuiSelect-select': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>All Hostels</MenuItem>
                      {hostels.map((hostel) => (
                        <MenuItem key={hostel._id} value={hostel._id} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {hostel.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', 
                color: 'white',
                boxShadow: darkMode ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
                transition: darkMode ? 'none' : 'all 0.3s ease'
              }}>
                <CardContent sx={{ py: 1, px: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {filteredNotices.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Total Notices
                      </Typography>
                    </Box>
                    <NotificationsIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)', 
                color: 'white',
                boxShadow: darkMode ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
                transition: darkMode ? 'none' : 'all 0.3s ease'
              }}>
                <CardContent sx={{ py: 1, px: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {filteredNotices.filter(n => {
                          const noticeDate = new Date(n.createdAt);
                          const today = new Date();
                          const diffTime = Math.abs(today - noticeDate);
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return diffDays <= 7;
                        }).length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Recent Notices
                      </Typography>
                    </Box>
                    <CalendarIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)', 
                color: 'white',
                boxShadow: darkMode ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
                transition: darkMode ? 'none' : 'all 0.3s ease'
              }}>
                <CardContent sx={{ py: 1, px: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {new Set(filteredNotices.map(n => n.hostel?._id)).size}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Hostels with Notices
                      </Typography>
                    </Box>
                    <HomeIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)', 
                color: 'white',
                boxShadow: darkMode ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
                transition: darkMode ? 'none' : 'all 0.3s ease'
              }}>
                <CardContent sx={{ py: 1, px: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {filteredNotices.reduce((sum, notice) => sum + (notice.attachments?.length || 0), 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Total Attachments
                      </Typography>
                    </Box>
                    <DescriptionIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Notices List */}
          <Card sx={{ 
            borderRadius: { xs: 2, sm: 3 }, 
            boxShadow: darkMode 
              ? 'none' 
              : { xs: 1, sm: 2, md: '0 8px 32px rgba(0,0,0,0.1)' },
            width: '100%',
            boxSizing: 'border-box',
            transition: darkMode ? 'none' : 'all 0.3s ease'
          }}>
            <CardContent sx={{ p: 0 }}>
              {filteredNotices.length > 0 ? (
                <List>
                  {filteredNotices.map((notice, index) => (
                    <React.Fragment key={notice._id}>
                      <ListItem sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mt: 0.5 }}>
                            <NotificationsIcon />
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                {notice.title}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="View"><IconButton size="small" onClick={(e) => handleMenuClick(e, notice)}><ViewIcon fontSize="small" /></IconButton></Tooltip>
                                <Tooltip title="Edit"><IconButton size="small" onClick={() => { setSelectedNotice(notice); setEditDialogOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                <Tooltip title="Delete"><IconButton size="small" onClick={() => { setSelectedNotice(notice); setDeleteDialogOpen(true); }}><DeleteIcon fontSize="small" color="error" /></IconButton></Tooltip>
                              </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {notice.message}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                              <Chip
                                icon={<HomeIcon />}
                                label={notice.hostel?.name}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                              <Chip
                                icon={<PersonIcon />}
                                label={notice.author?.name}
                                color="secondary"
                                variant="outlined"
                                size="small"
                              />
                              <Chip
                                icon={<CalendarIcon />}
                                label={new Date(notice.createdAt).toLocaleDateString()}
                                color="info"
                                variant="outlined"
                                size="small"
                              />
                              {notice.attachments && notice.attachments.length > 0 && (
                                <Chip
                                  icon={<DescriptionIcon />}
                                  label={`${notice.attachments.length} attachment(s)`}
                                  color="warning"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </ListItem>
                      {index < filteredNotices.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No notices found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create your first notice to get started
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>

      

      {/* Create Notice Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Notice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Hostel</InputLabel>
                <Select
                  value={noticeData.hostel}
                  onChange={(e) => setNoticeData({ ...noticeData, hostel: e.target.value })}
                  label="Hostel"
                >
                  {hostels.map((hostel) => (
                    <MenuItem key={hostel._id} value={hostel._id}>
                      {hostel.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={noticeData.title}
                onChange={(e) => setNoticeData({ ...noticeData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={noticeData.message}
                onChange={(e) => setNoticeData({ ...noticeData, message: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmCreateNotice} variant="contained">
            Create Notice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Notice Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => { setEditDialogOpen(false); setSelectedNotice(null); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Notice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={noticeData.title}
                onChange={(e) => setNoticeData({ ...noticeData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={noticeData.message}
                onChange={(e) => setNoticeData({ ...noticeData, message: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmUpdateNotice} variant="contained">
            Update Notice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setSelectedNotice(null); }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedNotice?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteNotice} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default HostelNotices;
