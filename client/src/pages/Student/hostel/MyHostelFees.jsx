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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import StudentLayout from '../../../components/StudentLayout';
import { studentHostelApi } from '../../../api/hostelApi';
import toast from 'react-hot-toast';

const MyHostelFees = () => {
  const studentStore = useSelector((store) => store.student);
  const student = studentStore?.student?.student || {};
  
  const [fees, setFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, paid, unpaid

  useEffect(() => {
    fetchFees();
  }, []);

  useEffect(() => {
    filterFees();
  }, [fees, searchTerm, filterStatus]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await studentHostelApi.getMyFees();
      setFees(response.data.result || []);

    } catch (err) {
      console.error('Error fetching fees:', err);
      setError('Failed to load fee information');
      toast.error('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  const filterFees = () => {
    let filtered = fees.filter(fee => {
      const matchesSearch = !searchTerm || 
        fee.hostel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.amount?.toString().includes(searchTerm);

      const matchesStatus = filterStatus === 'all' || fee.status === filterStatus;

      return matchesSearch && matchesStatus;
    });

    // Sort by due date (oldest first for unpaid, newest first for paid)
    filtered.sort((a, b) => {
      if (a.status === b.status) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return a.status === 'Unpaid' ? -1 : 1;
    });
    
    setFilteredFees(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Unpaid': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return <CheckCircleIcon />;
      case 'Unpaid': return <CancelIcon />;
      default: return <MoneyIcon />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'Paid') return false;
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
  };

  const calculateTotalAmount = () => {
    return fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
  };

  const calculatePaidAmount = () => {
    return fees
      .filter(fee => fee.status === 'Paid')
      .reduce((sum, fee) => sum + (fee.amount || 0), 0);
  };

  const calculateUnpaidAmount = () => {
    return fees
      .filter(fee => fee.status === 'Unpaid')
      .reduce((sum, fee) => sum + (fee.amount || 0), 0);
  };

  if (loading) {
    return (
      <StudentLayout title="My Hostel Fees">
        <Container maxWidth="lg">
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="text" width={300} height={20} />
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Skeleton variant="rectangular" height={300} />
          </Box>
        </Container>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="My Hostel Fees">
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            My Hostel Fees
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your hostel fee payments and status
          </Typography>
        </Box>

        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by hostel name or amount..."
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
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('all')}
              >
                All Fees
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant={filterStatus === 'Paid' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('Paid')}
                color="success"
              >
                Paid
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant={filterStatus === 'Unpaid' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('Unpaid')}
                color="error"
              >
                Unpaid
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
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', 
              color: 'white' 
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <MoneyIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ₹{calculateTotalAmount()}
                </Typography>
                <Typography variant="body2">
                  Total Fees
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)', 
              color: 'white' 
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ₹{calculatePaidAmount()}
                </Typography>
                <Typography variant="body2">
                  Paid Amount
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)', 
              color: 'white' 
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CancelIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ₹{calculateUnpaidAmount()}
                </Typography>
                <Typography variant="body2">
                  Unpaid Amount
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Fees Table */}
        {filteredFees.length > 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Fee Records ({filteredFees.length})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hostel</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Payment History</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFees.map((fee, index) => (
                      <TableRow key={fee._id || index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HomeIcon color="primary" sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                              {fee.hostel?.name || 'Unknown Hostel'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            ₹{fee.amount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon color="primary" sx={{ fontSize: 16 }} />
                            <Typography 
                              variant="body2"
                              color={isOverdue(fee.dueDate, fee.status) ? 'error.main' : 'text.primary'}
                            >
                              {formatDate(fee.dueDate)}
                            </Typography>
                            {isOverdue(fee.dueDate, fee.status) && (
                              <Chip
                                label="Overdue"
                                color="error"
                                size="small"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(fee.status)}
                            label={fee.status}
                            color={getStatusColor(fee.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {fee.paymentHistory && fee.paymentHistory.length > 0 ? (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {fee.paymentHistory.length} payment(s)
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                {fee.paymentHistory.slice(0, 2).map((payment, idx) => (
                                  <Typography key={idx} variant="caption" sx={{ display: 'block' }}>
                                    ₹{payment.amount} - {formatDate(payment.date)}
                                  </Typography>
                                ))}
                                {fee.paymentHistory.length > 2 && (
                                  <Typography variant="caption" color="text.secondary">
                                    +{fee.paymentHistory.length - 2} more
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No payments
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No fee records found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No fee records have been created yet'
                }
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchFees}
              >
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary Card */}
        {fees.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Fee Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {fees.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Fee Records
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {fees.filter(f => f.status === 'Paid').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Paid Records
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      {fees.filter(f => f.status === 'Unpaid').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unpaid Records
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Refresh Button */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchFees}
            disabled={loading}
          >
            Refresh Fees
          </Button>
        </Box>
      </Container>
    </StudentLayout>
  );
};

export default MyHostelFees;
