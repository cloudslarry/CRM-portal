import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  AdminPanelSettings as AdminIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  HowToReg as HowToRegIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../config/api';

const AdminDashboard = () => {
  const admin = useSelector((state) => state.admin);
  const navigate = useNavigate();
  const [isDayMode, setIsDayMode] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalSubjects: 0,
    totalAdmins: 0,
    totalDepartments: 0,
    studentsByYear: [],
    studentsByDepartment: [],
    facultyByDepartment: [],
    subjectsByYear: [],
    departments: [],
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch comprehensive statistics from API
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching statistics from API...');
      const response = await api.get('/api/admin/statistics');
      
      if (response.data.success) {
        const statistics = response.data.statistics || {};
        setStats({
          totalStudents: statistics.totalStudents || 0,
          totalFaculty: statistics.totalFaculty || 0,
          totalSubjects: statistics.totalSubjects || 0,
          totalAdmins: statistics.totalAdmins || 0,
          totalDepartments: statistics.totalDepartments || 0,
          studentsByYear: statistics.studentsByYear || [],
          studentsByDepartment: statistics.studentsByDepartment || [],
          facultyByDepartment: statistics.facultyByDepartment || [],
          subjectsByYear: statistics.subjectsByYear || [],
          departments: statistics.departments || [],
          lastUpdated: statistics.lastUpdated || new Date().toISOString()
        });
        console.log('✅ Statistics loaded successfully:', statistics);
      } else {
        throw new Error(response.data.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      setError(error.message);
      
      // Fallback to test endpoint if main endpoint fails
      try {
        console.log('Trying fallback test endpoint...');
        const testResponse = await api.get('/api/admin/test-statistics');
        if (testResponse.data.success) {
          const statistics = testResponse.data.statistics || {};
          setStats({
            totalStudents: statistics.totalStudents || 0,
            totalFaculty: statistics.totalFaculty || 0,
            totalSubjects: statistics.totalSubjects || 0,
            totalAdmins: statistics.totalAdmins || 0,
            totalDepartments: statistics.totalDepartments || 0,
            studentsByYear: statistics.studentsByYear || [],
            studentsByDepartment: statistics.studentsByDepartment || [],
            facultyByDepartment: statistics.facultyByDepartment || [],
            subjectsByYear: statistics.subjectsByYear || [],
            departments: statistics.departments || [],
            lastUpdated: statistics.lastUpdated || new Date().toISOString()
          });
          console.log('✅ Test statistics loaded:', statistics);
          setError(null);
        }
      } catch (testError) {
        console.error('❌ Test endpoint also failed:', testError);
        setError('Unable to fetch statistics from server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AdminDashboard: Component mounted, fetching statistics...');
    fetchStatistics();
  }, []);

  return (
    <AdminLayout title="Admin Dashboard">
      <Container 
        maxWidth="xl" 
        sx={{ 
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 1, sm: 2 },
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Welcome Section */}
        <Box sx={{ 
          mb: { xs: 2, sm: 3, md: 4 },
          textAlign: { xs: 'center', sm: 'left' },
          p: { xs: 1, sm: 2 }
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              mb: { xs: 0.5, sm: 1 },
              fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem', lg: '2.5rem' },
              lineHeight: 1.2
            }}
          >
            Welcome back, {admin.admin?.name || 'Admin'}!
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              lineHeight: 1.4
            }}
          >
            Here's what's happening with your system today.
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Grid 
          container 
          spacing={{ xs: 1.5, sm: 2, md: 3 }} 
          sx={{ 
            mb: { xs: 2, sm: 3, md: 4 },
            width: '100%',
            margin: 0
          }}
        >
          <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
            <Card sx={{ 
              textAlign: 'center', 
              p: { xs: 1, sm: 1.5, md: 2 }, 
              cursor: 'pointer', 
              '&:hover': { transform: 'translateY(-2px)' }, 
              transition: 'all 0.2s',
              height: '100%',
              width: '100%',
              boxSizing: 'border-box'
            }} onClick={() => navigate('/admin/add/students')}>
              <CardContent sx={{ 
                p: { xs: 0.5, sm: 1, md: 1.5 },
                '&:last-child': { pb: { xs: 0.5, sm: 1, md: 1.5 } }
              }}>
                <PersonAddIcon sx={{ 
                  fontSize: { xs: 28, sm: 32, md: 40 }, 
                  color: 'primary.main', 
                  mb: { xs: 0.5, sm: 1 }
                }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                    mb: { xs: 0.5, sm: 1 }
                  }}
                >
                  Add Student
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                    lineHeight: 1.2
                  }}
                >
                  Register new student
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
            <Card sx={{ 
              textAlign: 'center', 
              p: { xs: 1, sm: 1.5, md: 2 }, 
              cursor: 'pointer', 
              '&:hover': { transform: 'translateY(-2px)' }, 
              transition: 'all 0.2s',
              height: '100%',
              width: '100%',
              boxSizing: 'border-box'
            }} onClick={() => navigate('/admin/add/faculties')}>
              <CardContent sx={{ 
                p: { xs: 0.5, sm: 1, md: 1.5 },
                '&:last-child': { pb: { xs: 0.5, sm: 1, md: 1.5 } }
              }}>
                <HowToRegIcon sx={{ 
                  fontSize: { xs: 28, sm: 32, md: 40 }, 
                  color: 'warning.main', 
                  mb: { xs: 0.5, sm: 1 }
                }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                    mb: { xs: 0.5, sm: 1 }
                  }}
                >
                  Add Faculty
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                    lineHeight: 1.2
                  }}
                >
                  Register new faculty
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
            <Card sx={{ 
              textAlign: 'center', 
              p: { xs: 1, sm: 1.5, md: 2 }, 
              cursor: 'pointer', 
              '&:hover': { transform: 'translateY(-2px)' }, 
              transition: 'all 0.2s',
              height: '100%',
              width: '100%',
              boxSizing: 'border-box'
            }} onClick={() => navigate('/admin/students')}>
              <CardContent sx={{ 
                p: { xs: 0.5, sm: 1, md: 1.5 },
                '&:last-child': { pb: { xs: 0.5, sm: 1, md: 1.5 } }
              }}>
                <PersonIcon sx={{ 
                  fontSize: { xs: 28, sm: 32, md: 40 }, 
                  color: 'info.main', 
                  mb: { xs: 0.5, sm: 1 }
                }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                    mb: { xs: 0.5, sm: 1 }
                  }}
                >
                  View Students
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                    lineHeight: 1.2
                  }}
                >
                  Manage students
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
            <Card sx={{ 
              textAlign: 'center', 
              p: { xs: 1, sm: 1.5, md: 2 }, 
              cursor: 'pointer', 
              '&:hover': { transform: 'translateY(-2px)' }, 
              transition: 'all 0.2s',
              height: '100%',
              width: '100%',
              boxSizing: 'border-box'
            }} onClick={() => navigate('/admin/settings')}>
              <CardContent sx={{ 
                p: { xs: 0.5, sm: 1, md: 1.5 },
                '&:last-child': { pb: { xs: 0.5, sm: 1, md: 1.5 } }
              }}>
                <SettingsIcon sx={{ 
                  fontSize: { xs: 28, sm: 32, md: 40 }, 
                  color: 'secondary.main', 
                  mb: { xs: 0.5, sm: 1 }
                }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                    mb: { xs: 0.5, sm: 1 }
                  }}
                >
                  Settings
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                    lineHeight: 1.2
                  }}
                >
                  Account settings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Statistics and Profile */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} md={8}>
              <Card sx={{ 
                borderRadius: { xs: 2, sm: 3 }, 
                height: '100%',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <CardContent sx={{ 
                  p: { xs: 1.5, sm: 2, md: 3 }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    mb: { xs: 2, sm: 3 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'primary.main', 
                        fontWeight: 'bold',
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                    >
                      System Statistics
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 0.5, sm: 1 },
                      flexWrap: 'wrap'
                    }}>
                      {stats.lastUpdated && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: { xs: '0.625rem', sm: '0.75rem' },
                            display: { xs: 'none', sm: 'block' }
                          }}
                        >
                          Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
                        </Typography>
                      )}
                      <Button
                        size="small"
                        startIcon={<RefreshIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                        onClick={fetchStatistics}
                        disabled={loading}
                        sx={{ 
                          minWidth: 'auto', 
                          p: { xs: 0.5, sm: 1 },
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {loading ? 'Loading...' : 'Refresh'}
                      </Button>
                    </Box>
                  </Box>
                  
                  {error && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                      <Typography variant="body2" color="error.dark">
                        ⚠️ {error}
                      </Typography>
                    </Box>
                  )}

                  {/* Real-time statistics from database */}
                  <Grid container spacing={{ xs: 1, sm: 2 }}>
                    <Grid item xs={6} md={3}>
                      <Paper
                        sx={{
                          p: { xs: 1, sm: 1.5, md: 2 },
                          textAlign: 'center',
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                          color: 'white',
                          minHeight: { xs: 80, sm: 90, md: 100 },
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          borderRadius: { xs: 1, sm: 2 }
                        }}
                      >
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 'bold',
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                          }}
                        >
                          {loading ? '...' : stats.totalStudents}
                        </Typography>
                        <Typography 
                          variant="body2"
                          sx={{ 
                            fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        >
                          Total Students
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper
                        sx={{
                          p: { xs: 1, sm: 1.5, md: 2 },
                          textAlign: 'center',
                          background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                          color: 'white',
                          minHeight: { xs: 80, sm: 90, md: 100 },
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          borderRadius: { xs: 1, sm: 2 }
                        }}
                      >
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 'bold',
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                          }}
                        >
                          {loading ? '...' : stats.totalFaculty}
                        </Typography>
                        <Typography 
                          variant="body2"
                          sx={{ 
                            fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        >
                          Faculty Members
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper
                        sx={{
                          p: { xs: 1, sm: 1.5, md: 2 },
                          textAlign: 'center',
                          background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)',
                          color: 'white',
                          minHeight: { xs: 80, sm: 90, md: 100 },
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          borderRadius: { xs: 1, sm: 2 }
                        }}
                      >
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 'bold',
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                          }}
                        >
                          {loading ? '...' : stats.totalSubjects}
                        </Typography>
                        <Typography 
                          variant="body2"
                          sx={{ 
                            fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        >
                          Subjects
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper
                        sx={{
                          p: { xs: 1, sm: 1.5, md: 2 },
                          textAlign: 'center',
                          background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
                          color: 'white',
                          minHeight: { xs: 80, sm: 90, md: 100 },
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          borderRadius: { xs: 1, sm: 2 }
                        }}
                      >
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 'bold',
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                          }}
                        >
                          {loading ? '...' : stats.totalDepartments}
                        </Typography>
                        <Typography 
                          variant="body2"
                          sx={{ 
                            fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        >
                          Departments
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Additional Statistics */}
                  {!loading && !error && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        Detailed Breakdown
                      </Typography>
                      {console.log('AdminDashboard: Stats data:', stats)}
                      {console.log('AdminDashboard: studentsByDepartment:', stats.studentsByDepartment)}
                      {console.log('AdminDashboard: facultyByDepartment:', stats.facultyByDepartment)}
                      <Grid container spacing={2}>
                        {stats.studentsByDepartment && stats.studentsByDepartment.length > 0 && (
                          <Grid item xs={12} md={6}>
                            <Card sx={{ p: 2 }}>
                              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Students by Department
                              </Typography>
                              {stats.studentsByDepartment.map((dept, index) => (
                                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2">{dept._id}</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{dept.count}</Typography>
                                </Box>
                              ))}
                            </Card>
                          </Grid>
                        )}
                        {stats.facultyByDepartment && stats.facultyByDepartment.length > 0 && (
                          <Grid item xs={12} md={6}>
                            <Card sx={{ p: 2 }}>
                              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Faculty by Department
                              </Typography>
                              {stats.facultyByDepartment.map((dept, index) => (
                                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2">{dept._id}</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{dept.count}</Typography>
                                </Box>
                              ))}
                            </Card>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;
