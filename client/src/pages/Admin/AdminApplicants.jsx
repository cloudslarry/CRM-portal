import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { adminListApplicants } from '../../redux/actions/adminAction';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  Box,
  Divider,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Button,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  PersonAdd as PersonAddIcon,
  Add as AddIcon
} from '@mui/icons-material';

const AdminApplicants = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applicants } = useSelector((s) => s.admin);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(adminListApplicants(q));
  }, [dispatch, q]);

  const sortedApplicants = (applicants || []).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const clearFilters = () => {
    setQ('');
    setSortBy('newest');
  };

  return (
    <AdminLayout>
      <Box sx={{ 
        p: { xs: 0.5, sm: 1, md: 2 },
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <Container 
          maxWidth="lg"
          sx={{
            px: { xs: 0.5, sm: 1, md: 2 },
            py: { xs: 0.5, sm: 1 },
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <Box sx={{ 
            mb: { xs: 1.5, sm: 2, md: 3, lg: 4 }, 
            textAlign: 'center',
            p: { xs: 1, sm: 2 }
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
                  Applicants Management
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    lineHeight: 1.4
                  }}
                >
                  Manage and view all applicant information
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
                  onClick={() => dispatch(adminListApplicants(q))}
                  sx={{
                    borderRadius: { xs: 1, sm: 2 },
                    px: { xs: 1.25, sm: 1.5, md: 2 },
                    py: { xs: 0.5, sm: 0.75, md: 1 },
                    minHeight: { xs: 36, sm: 40, md: 44 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    width: { xs: '100%', sm: 'auto' },
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                      borderColor: '#1565c0',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    }
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                  onClick={() => navigate('/admin/add-applicant')}
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
                  Add Applicant
                </Button>
              </Box>
            </Box>
          </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
              }
            }}>
              <PeopleIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Total Applicants
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {applicants?.length || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(240, 147, 251, 0.4)'
              }
            }}>
              <PersonIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                This Month
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {(applicants || []).filter(a => {
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return new Date(a.createdAt) > monthAgo;
                }).length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(79, 172, 254, 0.4)'
              }
            }}>
              <CalendarIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                This Week
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {(applicants || []).filter(a => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(a.createdAt) > weekAgo;
                }).length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

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
                  placeholder="Search applicants..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: { xs: 1, sm: 2 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      height: { xs: 36, sm: 40, md: 44 },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                    Sort By
                  </InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                    sx={{
                      borderRadius: { xs: 1, sm: 2 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      height: { xs: 36, sm: 40, md: 44 },
                    }}
                  >
                    <MenuItem value="newest">Newest First</MenuItem>
                    <MenuItem value="oldest">Oldest First</MenuItem>
                    <MenuItem value="name">Name A-Z</MenuItem>
                    <MenuItem value="department">Department</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 0.5, sm: 1 },
                  justifyContent: { xs: 'center', md: 'flex-end' }
                }}>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    sx={{
                      borderRadius: { xs: 1, sm: 2 },
                      px: { xs: 1, sm: 1.5 },
                      py: { xs: 0.5, sm: 0.75 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      minHeight: { xs: 36, sm: 40 },
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{
                      borderRadius: { xs: 1, sm: 2 },
                      px: { xs: 1, sm: 1.5 },
                      py: { xs: 0.5, sm: 0.75 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      minHeight: { xs: 36, sm: 40 },
                    }}
                  >
                    Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

        {/* Applicants List */}
        <Grid container spacing={3}>
          {sortedApplicants.map((applicant) => (
            <Grid item xs={12} sm={6} md={4} key={applicant._id}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar 
                      sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        mr: 2,
                        width: 64,
                        height: 64,
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {getInitials(applicant.name)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {applicant.name}
                      </Typography>
                      <Chip 
                        label="Registered" 
                        color="success" 
                        size="small"
                        sx={{
                          borderRadius: 2,
                          fontWeight: 'bold',
                          background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                          color: 'white'
                        }}
                      />
                    </Box>
                  </Box>

                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5,
                      p: 1,
                      borderRadius: 2,
                      bgcolor: 'rgba(0,0,0,0.02)'
                    }}>
                      <EmailIcon fontSize="small" color="primary" />
                      {applicant.email}
                    </Typography>
                    {applicant.contactNumber && (
                      <Typography variant="body2" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5,
                        p: 1,
                        borderRadius: 2,
                        bgcolor: 'rgba(0,0,0,0.02)'
                      }}>
                        <PhoneIcon fontSize="small" color="primary" />
                        {applicant.contactNumber}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5,
                      p: 1,
                      borderRadius: 2,
                      bgcolor: 'rgba(0,0,0,0.02)'
                    }}>
                      <CalendarIcon fontSize="small" color="primary" />
                      Registered: {new Date(applicant.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      ID: {applicant._id.slice(-8)}
                    </Typography>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <PersonIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {sortedApplicants.length === 0 && (
          <Box sx={{ 
            py: 8, 
            textAlign: 'center',
            bgcolor: 'rgba(0,0,0,0.02)',
            borderRadius: 3,
            border: '2px dashed rgba(0,0,0,0.1)'
          }}>
            <PeopleIcon sx={{ 
              fontSize: 80, 
              color: 'primary.main', 
              mb: 3,
              opacity: 0.6
            }} />
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold', 
              color: 'text.primary',
              mb: 2
            }}>
              No applicants found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {q ? 'Try adjusting your search criteria' : 'No applicants have registered yet'}
            </Typography>
            {!q && (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/admin/add-applicant')}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                  },
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                Add First Applicant
              </Button>
            )}
          </Box>
        )}
        </Container>
      </Box>
    </AdminLayout>
  );
}

export default AdminApplicants;


