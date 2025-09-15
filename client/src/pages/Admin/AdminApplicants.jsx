import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { adminListApplicants, adminApproveApplicant, adminRejectApplicant, adminPendingApplicant, adminMarkApplicantSeen } from '../../redux/actions/adminAction';
import {
  Container,
  Typography,
  TextField,
  Stack,
  Box,
  Divider,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Button,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  HourglassBottom as HourglassBottomIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const AdminApplicants = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applicants } = useSelector((s) => s.admin);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | approved | rejected
  const [seenFilter, setSeenFilter] = useState('all'); // all | seen | unseen

  useEffect(() => {
    dispatch(adminListApplicants(q));
  }, [dispatch, q]);

  // Refresh when the window regains focus (e.g., after returning from details)
  useEffect(() => {
    const onFocus = () => dispatch(adminListApplicants(q));
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [dispatch, q]);

  const normalizeStatus = (s) => (s || 'pending').toString().trim().toLowerCase();

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

  // Stats
  const totalViews = (applicants || []).filter(a => !!a.seen).length;
  const unseenCount = (applicants || []).length - totalViews;
  const approvedCount = (applicants || []).filter(a => normalizeStatus(a.status) === 'approved').length;
  const pendingCount = (applicants || []).filter(a => normalizeStatus(a.status) === 'pending').length;
  const rejectedCount = (applicants || []).filter(a => normalizeStatus(a.status) === 'rejected').length;
  // Latest counters
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now);
  monthStart.setMonth(monthStart.getMonth() - 1);

  const getDate = (x) => (x && x.createdAt ? new Date(x.createdAt) : null);
  const todayCount = (applicants || []).filter(a => { const d = getDate(a); return d && d >= todayStart; }).length;
  const weekCount = (applicants || []).filter(a => { const d = getDate(a); return d && d >= weekStart; }).length;
  const monthCount = (applicants || []).filter(a => { const d = getDate(a); return d && d >= monthStart; }).length;

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const clearFilters = () => {
    setQ('');
    setSortBy('newest');
  };

  const onApprove = async (id) => {
    await dispatch(adminApproveApplicant(id));
  };
  const onReject = async (id) => {
    await dispatch(adminRejectApplicant(id));
  };
  const onPending = async (id) => {
    await dispatch(adminPendingApplicant(id));
  };

  // Table rows
  const rows = sortedApplicants
    .filter(a => a.name?.toLowerCase().includes(q.toLowerCase()) || a.email?.toLowerCase().includes(q.toLowerCase()))
    .filter(a => statusFilter === 'all' ? true : normalizeStatus(a.status) === statusFilter)
    .filter(a => seenFilter === 'all' ? true : ((a.seen || false) === (seenFilter === 'seen')))
    .map(a => ({
      id: a._id,
      name: a.name,
      email: a.email,
      department: a.department || '—',
      year: a.year || '—',
      status: a.status || 'pending',
      statusKey: normalizeStatus(a.status),
      seen: !!a.seen,
      createdAt: a.createdAt
    }));

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1.3, minWidth: 160 },
    { field: 'email', headerName: 'Email', flex: 1.6, minWidth: 220 },
    { field: 'department', headerName: 'Department', flex: 1, minWidth: 130 },
    { field: 'year', headerName: 'Year', width: 100 },
    {
      field: 'status', headerName: 'Status', width: 120,
      renderCell: (params) => (
        <Chip size="small" label={params.row.status} color={params.row.statusKey === 'approved' ? 'success' : params.row.statusKey === 'rejected' ? 'error' : 'default'} sx={{ textTransform: 'capitalize' }} />
      )
    },
    {
      field: 'seen', headerName: 'Seen', width: 90,
      renderCell: (params) => (
        <Chip size="small" label={params.value ? 'Seen' : 'Unseen'} color={params.value ? 'default' : 'warning'} />
      )
    },
    {
      field: 'createdAt', headerName: 'Applied On', width: 150,
      renderCell: (params) => {
        const d = params.value ? new Date(params.value) : null;
        return <Typography variant="body2">{d && !isNaN(d) ? d.toLocaleDateString() : '-'}</Typography>;
      }
    },
    {
      field: 'actions', headerName: 'Actions', width: 240, sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Approve">
            <span>
              <IconButton size="small" color="success" onClick={() => onApprove(params.row.id)}>
                <CheckIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Decline">
            <span>
              <IconButton size="small" color="error" onClick={() => onReject(params.row.id)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="View">
            <span>
              <IconButton size="small" onClick={async () => { await dispatch(adminMarkApplicantSeen(params.row.id)); navigate(`/admin/applicants/${params.row.id}`); }}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      )
    }
  ];

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
            textAlign: 'left',
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
                  variant="h6" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                    lineHeight: 1.2
                  }}
                >
                  Applicants Management
                </Typography>
                <Typography variant="caption" color="text.secondary">
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
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minHeight: 96 }} onClick={() => { setStatusFilter('all'); setSeenFilter('all'); }}>
              <PeopleIcon fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">Total</Typography>
              <Typography variant="h5">{applicants?.length || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Today {todayCount} • Week {weekCount} • Month {monthCount}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minHeight: 96 }} onClick={() => setStatusFilter('pending')}>
              <HourglassBottomIcon fontSize="small" color="warning" />
              <Typography variant="body2" color="text.secondary">Pending</Typography>
              <Typography variant="h5" color="warning.main">{pendingCount}</Typography>
              <Typography variant="caption" color="text.secondary">Today { (applicants||[]).filter(a=> (a.status||'pending').toLowerCase()==='pending' && new Date(a.createdAt) >= todayStart).length }</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minHeight: 96 }} onClick={() => setStatusFilter('approved')}>
              <CheckCircleIcon fontSize="small" color="success" />
              <Typography variant="body2" color="text.secondary">Approved</Typography>
              <Typography variant="h5" color="success.main">{approvedCount}</Typography>
              <Typography variant="caption" color="text.secondary">Today { (applicants||[]).filter(a=> (a.status||'pending').toLowerCase()==='approved' && new Date(a.createdAt) >= todayStart).length }</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minHeight: 96 }} onClick={() => setStatusFilter('rejected')}>
              <CancelIcon fontSize="small" color="error" />
              <Typography variant="body2" color="text.secondary">Rejected</Typography>
              <Typography variant="h5" color="error.main">{rejectedCount}</Typography>
              <Typography variant="caption" color="text.secondary">Today { (applicants||[]).filter(a=> (a.status||'pending').toLowerCase()==='rejected' && new Date(a.createdAt) >= todayStart).length }</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minHeight: 96 }} onClick={() => setSeenFilter(seenFilter==='seen'?'all':'seen')}>
              <VisibilityIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">Views</Typography>
              <Typography variant="h5">{totalViews}</Typography>
              <Typography variant="caption" color="text.secondary">Unseen { (applicants||[]).length - totalViews }</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minHeight: 96 }} onClick={() => setSeenFilter('unseen')}>
              <VisibilityOffIcon fontSize="small" color="warning" />
              <Typography variant="body2" color="text.secondary">Unseen</Typography>
              <Typography variant="h5" color="warning.main">{unseenCount}</Typography>
              <Typography variant="caption" color="text.secondary">Tap to filter unseen</Typography>
            </Paper>
          </Grid>
        </Grid>

          {/* Search and Filter Bar */}
          <Paper sx={{ 
            p: { xs: 0.5, sm: 0.75, md: 1 }, 
            mt: { xs: 1.5, sm: 2 },
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
            {showFilters && (
              <Box sx={{ mt: 1.25, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>Status:</Typography>
                {['all','pending','approved','rejected'].map(s => (
                  <Chip key={s} size="small" label={s.toUpperCase()} color={statusFilter===s?'primary':'default'} onClick={() => setStatusFilter(s)} sx={{ textTransform: 'uppercase' }} />
                ))}
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Typography variant="body2" sx={{ mr: 1 }}>Seen:</Typography>
                {['all','seen','unseen'].map(s => (
                  <Chip key={s} size="small" label={s.toUpperCase()} color={seenFilter===s?'primary':'default'} onClick={() => setSeenFilter(s)} sx={{ textTransform: 'uppercase' }} />
                ))}
              </Box>
            )}
          </Paper>

        {/* Applicants Table */}
        <Paper sx={{ p: 0, overflow: 'hidden' }}>
          <div style={{ width: '100%' }}>
            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              density="compact"
              sx={{ border: 0 }}
            />
          </div>
        </Paper>

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


