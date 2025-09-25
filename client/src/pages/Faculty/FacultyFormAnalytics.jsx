import React, { useEffect, useState } from 'react';
import FacultyLayout from '../../components/FacultyLayout';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Refresh as RefreshIcon, Download as DownloadIcon } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const FacultyFormAnalytics = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('facultyToken');

      const [formRes, analyticsRes, submissionsRes] = await Promise.all([
        axios.get(`/api/forms/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/forms/${id}/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/forms/${id}/submissions?limit=10`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setForm(formRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setSubmissions(submissionsRes.data.data.submissions || []);
    } catch (err) {
      console.error('Error loading analytics:', err);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <FacultyLayout title="Form Analytics">
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Skeleton variant="text" width={240} height={40} />
          <Skeleton variant="rectangular" width="100%" height={240} sx={{ mt: 2 }} />
        </Container>
      </FacultyLayout>
    );
  }

  if (!form) {
    return (
      <FacultyLayout title="Form Analytics">
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Card>
            <CardContent>
              <Typography color="error">Form not found or access denied.</Typography>
              <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/faculty/forms')}>Back</Button>
            </CardContent>
          </Card>
        </Container>
      </FacultyLayout>
    );
  }

  const deviceData = [
    { name: 'Desktop', value: analytics?.analytics?.deviceBreakdown?.filter(d => d === 'desktop').length || 0 },
    { name: 'Mobile', value: analytics?.analytics?.deviceBreakdown?.filter(d => d === 'mobile').length || 0 },
    { name: 'Tablet', value: analytics?.analytics?.deviceBreakdown?.filter(d => d === 'tablet').length || 0 }
  ];

  const submissionTrendData = [
    { name: 'Mon', submissions: 5 },
    { name: 'Tue', submissions: 8 },
    { name: 'Wed', submissions: 3 },
    { name: 'Thu', submissions: 6 },
    { name: 'Fri', submissions: 2 },
    { name: 'Sat', submissions: 4 },
    { name: 'Sun', submissions: 7 }
  ];

  return (
    <FacultyLayout title={`${form.title} - Analytics`}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/faculty/forms')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>{form.title} - Analytics</Typography>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData} sx={{ mr: 1 }}>Refresh</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>Export</Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent>
              <Typography color="textSecondary">Total Submissions</Typography>
              <Typography variant="h4">{analytics?.analytics?.totalSubmissions || 0}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent>
              <Typography color="textSecondary">Avg Completion Time</Typography>
              <Typography variant="h5">{Math.round(analytics?.analytics?.averageCompletionTime || 0)}s</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent>
              <Typography color="textSecondary">Spam Submissions</Typography>
              <Typography variant="h5">{analytics?.analytics?.spamSubmissions || 0}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Submission Trend</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={submissionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="submissions" stroke="#1976d2" fill="#1976d2" fillOpacity={0.25} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Device Distribution</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
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

        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Submissions</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Submitted By</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Completion Time</TableCell>
                      <TableCell>Submitted At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissions.map((s) => (
                      <TableRow key={s._id}>
                        <TableCell>{s.submittedBy?.name || 'Anonymous'}</TableCell>
                        <TableCell>
                          <Chip size="small" label={s.status} />
                        </TableCell>
                        <TableCell>{Math.round(s.completionTime || 0)}s</TableCell>
                        <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </FacultyLayout>
  );
};

export default FacultyFormAnalytics;
