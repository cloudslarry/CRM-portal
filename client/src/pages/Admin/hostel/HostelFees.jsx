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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import AdminLayout from '../../../components/AdminLayout';
import { fetchAllFees, markFeePaid, createFeeRecord } from '../../../redux/actions/hostelAction';
import { fetchHostels } from '../../../redux/actions/hostelAction';
import { adminGetAllStudent } from '../../../redux/actions/adminAction';
import toast from 'react-hot-toast';

const HostelFees = () => {
  const dispatch = useDispatch();
  const { darkMode } = useTheme();
  const { fees, hostels, loading } = useSelector((state) => state.hostel);
  const { allStudent } = useSelector((state) => state.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFees, setFilteredFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [feeToMarkPaid, setFeeToMarkPaid] = useState(null);
  
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [createFeeDialogOpen, setCreateFeeDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHostel, setFilterHostel] = useState('');
  const [paymentData, setPaymentData] = useState({ amount: '', method: 'Cash' });
  const [newFeeData, setNewFeeData] = useState({
    student: '',
    hostel: '',
    amount: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = fees.filter(fee => {
      const matchesSearch = !searchTerm || 
        fee.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.student?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.hostel?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filterStatus || fee.status === filterStatus;
      const matchesHostel = !filterHostel || fee.hostel?._id === filterHostel;
      
      return matchesSearch && matchesStatus && matchesHostel;
    });
    
    setFilteredFees(filtered);
  }, [fees, searchTerm, filterStatus, filterHostel]);

  const fetchData = async () => {
    await dispatch(fetchAllFees());
    await dispatch(fetchHostels());
    await dispatch(adminGetAllStudent());
  };

  const handleMenuClick = (event, fee) => {
    setSelectedFee(fee);
  };

  const handleMarkPaid = () => {
    if (!selectedFee) {
      toast.error('No fee selected');
      return;
    }
    
    setFeeToMarkPaid(selectedFee);
    setPaymentData({ amount: selectedFee.amount, method: 'Cash' });
    setMarkPaidDialogOpen(true);
  };

  const confirmMarkPaid = async () => {
    if (!feeToMarkPaid || !feeToMarkPaid._id) {
      toast.error('No fee selected');
      setMarkPaidDialogOpen(false);
      return;
    }

    const result = await dispatch(markFeePaid(feeToMarkPaid._id, paymentData));
    if (result.success) {
      toast.success('Fee marked as paid successfully');
      fetchData();
    } else {
      toast.error(result.error?.message || 'Failed to mark fee as paid');
    }
    setMarkPaidDialogOpen(false);
    setFeeToMarkPaid(null);
  };

  const handleCreateFee = () => {
    setCreateFeeDialogOpen(true);
  };

  const confirmCreateFee = async () => {
    if (!newFeeData.student || !newFeeData.hostel || !newFeeData.amount || !newFeeData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await dispatch(createFeeRecord(newFeeData));
    if (result.success) {
      toast.success('Fee record created successfully');
      setCreateFeeDialogOpen(false);
      setNewFeeData({ student: '', hostel: '', amount: '', dueDate: '' });
      fetchData();
    } else {
      toast.error(result.error?.message || 'Failed to create fee record');
    }
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
      default: return null;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Hostel Fees">
        <Box sx={{ p: 3 }}>
          <Container maxWidth="xl">
            <Skeleton variant="rectangular" height={400} />
          </Container>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Hostel Fee Management">
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
                  Hostel Fee Management
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    lineHeight: 1.4
                  }}
                >
                  Manage hostel fees and payment records
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
                  onClick={handleCreateFee}
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
                  Create Fee Record
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
                    placeholder="Search fees..."
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
                    <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      label="Status"
                      sx={{
                        minHeight: { xs: 36, sm: 40, md: 44 },
                        '& .MuiSelect-select': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>All Status</MenuItem>
                      <MenuItem value="Paid" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Paid</MenuItem>
                      <MenuItem value="Unpaid" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Unpaid</MenuItem>
                    </Select>
                  </FormControl>
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
                        {filteredFees.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Total Fees
                      </Typography>
                    </Box>
                    <PaymentIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
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
                        {filteredFees.filter(f => f.status === 'Paid').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Paid Fees
                      </Typography>
                    </Box>
                    <CheckCircleIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
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
                        {filteredFees.filter(f => f.status === 'Unpaid').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Unpaid Fees
                      </Typography>
                    </Box>
                    <CancelIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
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
                        ₹{filteredFees.reduce((sum, fee) => sum + (fee.amount || 0), 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Total Amount
                      </Typography>
                    </Box>
                    <MoneyIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Fees Table */}
          <Card sx={{ 
            borderRadius: { xs: 2, sm: 3 }, 
            boxShadow: darkMode 
              ? 'none' 
              : { xs: 1, sm: 2, md: '0 8px 32px rgba(0,0,0,0.1)' },
            width: '100%',
            boxSizing: 'border-box',
            transition: darkMode ? 'none' : 'all 0.3s ease'
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Hostel</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFees.map((fee) => (
                    <TableRow key={fee._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {fee.student?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {fee.student?.registrationNumber}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HomeIcon color="primary" sx={{ fontSize: 16 }} />
                          <Typography variant="body2">
                            {fee.hostel?.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MoneyIcon color="primary" sx={{ fontSize: 16 }} />
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            ₹{fee.amount}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon color="primary" sx={{ fontSize: 16 }} />
                          <Typography variant="body2">
                            {new Date(fee.dueDate).toLocaleDateString()}
                          </Typography>
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
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {fee.status === 'Unpaid' ? (
                            <Tooltip title="Mark as Paid">
                              <IconButton size="small" onClick={(e) => handleMenuClick(e, fee)}>
                                <CheckCircleIcon fontSize="small" color="success" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Paid">
                              <span>
                                <IconButton size="small" disabled>
                                  <CheckCircleIcon fontSize="small" color="success" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Container>
      </Box>

      

      {/* Mark Paid Dialog */}
      <Dialog
        open={markPaidDialogOpen}
        onClose={() => {
          setMarkPaidDialogOpen(false);
          setFeeToMarkPaid(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mark Fee as Paid</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  label="Payment Method"
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Cheque">Cheque</MenuItem>
                  <MenuItem value="Online">Online</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setMarkPaidDialogOpen(false);
            setFeeToMarkPaid(null);
          }}>Cancel</Button>
          <Button onClick={confirmMarkPaid} variant="contained">
            Mark as Paid
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Fee Dialog */}
      <Dialog
        open={createFeeDialogOpen}
        onClose={() => setCreateFeeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Fee Record</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select
                  value={newFeeData.student}
                  onChange={(e) => setNewFeeData({ ...newFeeData, student: e.target.value })}
                  label="Student"
                >
                  {allStudent.map((student) => (
                    <MenuItem key={student._id} value={student._id}>
                      {student.name} ({student.registrationNumber})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Hostel</InputLabel>
                <Select
                  value={newFeeData.hostel}
                  onChange={(e) => setNewFeeData({ ...newFeeData, hostel: e.target.value })}
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
                label="Amount"
                type="number"
                value={newFeeData.amount}
                onChange={(e) => setNewFeeData({ ...newFeeData, amount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={newFeeData.dueDate}
                onChange={(e) => setNewFeeData({ ...newFeeData, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFeeDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmCreateFee} variant="contained">
            Create Fee Record
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default HostelFees;
