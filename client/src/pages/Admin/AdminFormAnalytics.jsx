import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Alert,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const AdminFormAnalytics = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const admin = useSelector((state) => state.admin);
  
  const [form, setForm] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [fieldAnalytics, setFieldAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [submissionPage, setSubmissionPage] = useState(1);
  const [submissionLimit] = useState(10);

  useEffect(() => {
    if (id) {
      fetchFormData();
    }
  }, [id, dateRange]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (dateRange) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const [formResponse, analyticsResponse, submissionsResponse] = await Promise.all([
        axios.get(`/api/forms/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/forms/${id}/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`/api/forms/${id}/submissions?page=${submissionPage}&limit=${submissionLimit}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setForm(formResponse.data.data);
      setAnalytics(analyticsResponse.data.data.analytics);
      setSubmissions(submissionsResponse.data.data.submissions);
      setFieldAnalytics(analyticsResponse.data.data.fieldAnalytics);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error('Failed to fetch form data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchFormData();
  };

  const handleExport = () => {
    // In a real implementation, this would export the data
    toast.success('Export functionality coming soon');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'success';
      case 'draft': return 'warning';
      case 'reviewed': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <AdminLayout title="Form Analytics">
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
          </Box>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={100} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </AdminLayout>
    );
  }

  if (!form) {
    return (
      <AdminLayout title="Form Analytics">
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">
            Form not found or you don't have permission to view it.
          </Alert>
        </Container>
      </AdminLayout>
    );
  }

  // Prepare chart data
  const submissionTrendData = [
    { name: 'Mon', submissions: 12 },
    { name: 'Tue', submissions: 19 },
    { name: 'Wed', submissions: 3 },
    { name: 'Thu', submissions: 5 },
    { name: 'Fri', submissions: 2 },
    { name: 'Sat', submissions: 3 },
    { name: 'Sun', submissions: 8 }
  ];

  const deviceData = [
    { name: 'Desktop', value: analytics?.deviceBreakdown?.filter(d => d === 'desktop').length || 0 },
    { name: 'Mobile', value: analytics?.deviceBreakdown?.filter(d => d === 'mobile').length || 0 },
    { name: 'Tablet', value: analytics?.deviceBreakdown?.filter(d => d === 'tablet').length || 0 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <AdminLayout title={`${form.title} - Analytics`}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/admin/forms')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
              {form.title} - Analytics
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {form.description}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="1d">Last 24 hours</MenuItem>
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Total Submissions
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {analytics?.totalSubmissions || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {form.analytics?.totalViews || 0} total views
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Conversion Rate
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {analytics?.conversionRate?.toFixed(1) || 0}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={analytics?.conversionRate || 0}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon color="info" sx={{ mr: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Avg. Completion Time
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {formatDuration(analytics?.averageCompletionTime)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  per submission
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SecurityIcon color="warning" sx={{ mr: 1 }} />
                  <Typography color="textSecondary" gutterBottom>
                    Spam Rate
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {analytics?.spamRate?.toFixed(1) || 0}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {analytics?.spamSubmissions || 0} flagged
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Submission Trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Submission Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={submissionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    stroke="#1976d2"
                    fill="#1976d2"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Field Analytics */}
      {fieldAnalytics.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Field Response Analysis
                </Typography>
                <Grid container spacing={2}>
                  {fieldAnalytics.map((field, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {field.fieldType} Field
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {field.totalResponses} responses
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {field.uniqueValues.length} unique values
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recent Submissions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Submissions
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Submitted By</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Completion Time</TableCell>
                  <TableCell>Device</TableCell>
                  <TableCell>Submitted At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {submission.submittedBy?.name || 'Anonymous'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={submission.status}
                        color={getStatusColor(submission.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDuration(submission.completionTime)}
                    </TableCell>
                    <TableCell>
                      {submission.metadata?.deviceType || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {formatDate(submission.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </TableContainer>
      </CardContent>
    </Card>
      </Container>
    </AdminLayout>
  );
};

export default AdminFormAnalytics;
