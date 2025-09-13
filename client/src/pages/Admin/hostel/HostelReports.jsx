import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Skeleton,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Bed as BedIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import AdminLayout from '../../../components/AdminLayout';
import { fetchOccupancyReport, fetchFeeReport, fetchComprehensiveReport } from '../../../redux/actions/hostelAction';
import { fetchHostels } from '../../../redux/actions/hostelAction';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const HostelReports = () => {
  const dispatch = useDispatch();
  const { hostelId } = useParams();
  const { darkMode } = useTheme();
  const { occupancyReport, feeReport, comprehensiveReport, hostels, loading } = useSelector((state) => state.hostel);
  
  const [selectedHostel, setSelectedHostel] = useState('');
  const [reportType, setReportType] = useState('comprehensive');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (hostelId) {
      setSelectedHostel(hostelId);
    }
  }, [hostelId]);

  useEffect(() => {
    if (reportType) {
      fetchReportData();
    }
  }, [reportType, selectedHostel]);

  const fetchData = async () => {
    await dispatch(fetchHostels());
  };

  const fetchReportData = async () => {
    const params = selectedHostel ? { hostelId: selectedHostel } : {};
    
    switch (reportType) {
      case 'occupancy':
        await dispatch(fetchOccupancyReport(params));
        break;
      case 'fee':
        await dispatch(fetchFeeReport(params));
        break;
      case 'comprehensive':
        await dispatch(fetchComprehensiveReport(params));
        break;
      default:
        break;
    }
  };

  const renderOccupancyCharts = () => {
    if (!occupancyReport) return null;

    const { hostelOccupancy, roomTypeStats, departmentOccupancy } = occupancyReport;

    return (
      <Grid container spacing={3}>
        {/* Hostel Occupancy Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Hostel Occupancy Rate
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hostelOccupancy}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="occupancyRate" fill="#8884d8" name="Occupancy Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Room Type Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Room Type Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roomTypeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalRooms"
                  >
                    {roomTypeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Occupancy Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Department-wise Occupancy
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell>Student Count</TableCell>
                      <TableCell>Hostels</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentOccupancy.map((dept, index) => (
                      <TableRow key={index}>
                        <TableCell>{dept._id}</TableCell>
                        <TableCell>{dept.studentCount}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {dept.hostels.map((hostel, idx) => (
                              <Chip key={idx} label={hostel} size="small" />
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderFeeCharts = () => {
    if (!feeReport) return null;

    const { feeStats, monthlyTrend, paymentMethodStats } = feeReport;

    return (
      <Grid container spacing={3}>
        {/* Fee Status Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Fee Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={feeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {feeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Collection Trend */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Monthly Collection Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id.month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="totalAmount" stroke="#8884d8" name="Amount (₹)" />
                  <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Count" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Method Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Payment Method Statistics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Count</TableCell>
                      <TableCell>Total Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentMethodStats.map((method, index) => (
                      <TableRow key={index}>
                        <TableCell>{method._id || 'Unknown'}</TableCell>
                        <TableCell>{method.count}</TableCell>
                        <TableCell>₹{method.totalAmount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderComprehensiveReport = () => {
    if (!comprehensiveReport) return null;

    const { statistics, occupancySummary, feeSummary } = comprehensiveReport;

    return (
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', 
                color: 'white' 
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <HomeIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {statistics.totalHostels}
                  </Typography>
                  <Typography variant="body2">Total Hostels</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)', 
                color: 'white' 
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <BedIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {statistics.totalRooms}
                  </Typography>
                  <Typography variant="body2">Total Rooms</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)', 
                color: 'white' 
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {statistics.totalStudents}
                  </Typography>
                  <Typography variant="body2">Total Students</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)', 
                color: 'white' 
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MoneyIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {statistics.totalFees}
                  </Typography>
                  <Typography variant="body2">Total Fees</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Occupancy Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Occupancy Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total Rooms:</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>{occupancySummary.totalRooms}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total Capacity:</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>{occupancySummary.totalCapacity}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total Occupied:</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>{occupancySummary.totalOccupied}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Average Occupancy Rate:</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {occupancySummary.avgOccupancyRate ? (occupancySummary.avgOccupancyRate * 100).toFixed(1) : 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fee Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Fee Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total Fees:</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>{feeSummary.totalFees}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Paid Fees:</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>{feeSummary.paidFees}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Unpaid Fees:</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: 'error.main' }}>{feeSummary.unpaidFees}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total Amount:</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>₹{feeSummary.totalAmount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Paid Amount:</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>₹{feeSummary.paidAmount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Unpaid Amount:</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: 'error.main' }}>₹{feeSummary.unpaidAmount}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Hostel Reports">
        <Box sx={{ p: 3 }}>
          <Container maxWidth="xl">
            <Skeleton variant="rectangular" height={400} />
          </Container>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Hostel Reports">
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
                  Hostel Reports & Analytics
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    lineHeight: 1.4
                  }}
                >
                  Comprehensive reports and analytics for hostel management
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
                  onClick={fetchReportData}
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
              </Box>
            </Box>

            {/* Filter Controls */}
            <Paper sx={{ 
              p: { xs: 0.5, sm: 0.75, md: 1 }, 
              mb: { xs: 1, sm: 1.5 }, 
              borderRadius: { xs: 1, sm: 2 },
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <Grid container spacing={{ xs: 0.75, sm: 1 }} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Report Type</InputLabel>
                    <Select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      label="Report Type"
                      sx={{
                        minHeight: { xs: 36, sm: 40, md: 44 },
                        '& .MuiSelect-select': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    >
                      <MenuItem value="comprehensive" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Comprehensive</MenuItem>
                      <MenuItem value="occupancy" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Occupancy Report</MenuItem>
                      <MenuItem value="fee" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Fee Report</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Hostel</InputLabel>
                    <Select
                      value={selectedHostel}
                      onChange={(e) => setSelectedHostel(e.target.value)}
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

          {/* Report Content */}
          {reportType === 'comprehensive' && renderComprehensiveReport()}
          {reportType === 'occupancy' && renderOccupancyCharts()}
          {reportType === 'fee' && renderFeeCharts()}
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default HostelReports;
