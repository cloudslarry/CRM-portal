import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material'
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'
import {
  adminGetAllDepartments,
  adminDeleteDepartment,
  adminToggleDepartmentStatus
} from '../../redux/actions/adminAction'

const AdminViewDepartments = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, department: null })
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const result = await dispatch(adminGetAllDepartments(searchTerm, filterActive))
      if (result.success) {
        setDepartments(result.data || [])
      } else {
        toast.error(result.error?.message || 'Failed to fetch departments')
      }
    } catch (error) {
      toast.error('Error fetching departments')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchDepartments()
  }

  const handleDelete = async (department) => {
    setActionLoading({ ...actionLoading, [department._id]: true })
    try {
      const result = await dispatch(adminDeleteDepartment(department._id))
      if (result.success) {
        toast.success('Department deleted successfully!')
        fetchDepartments()
      } else {
        toast.error(result.error?.message || 'Failed to delete department')
      }
    } catch (error) {
      toast.error('Error deleting department')
    } finally {
      setActionLoading({ ...actionLoading, [department._id]: false })
      setDeleteDialog({ open: false, department: null })
    }
  }

  const handleToggleStatus = async (department) => {
    setActionLoading({ ...actionLoading, [department._id]: true })
    try {
      const result = await dispatch(adminToggleDepartmentStatus(department._id, !department.isActive))
      if (result.success) {
        toast.success(`Department ${!department.isActive ? 'activated' : 'deactivated'} successfully!`)
        fetchDepartments()
      } else {
        toast.error(result.error?.message || 'Failed to update department status')
      }
    } catch (error) {
      toast.error('Error updating department status')
    } finally {
      setActionLoading({ ...actionLoading, [department._id]: false })
    }
  }

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterActive === null || dept.isActive === filterActive
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <AdminLayout title="View Departments">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="View Departments">
      <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 }, width: '100%', maxWidth: '100%' }}>
        <Container maxWidth="xl">
          {/* Header Section */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Department Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage all departments in your institution
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/admin/add-department')}
                  sx={{ mr: 1 }}
                >
                  Add Department
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchDepartments}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Search and Filter Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Status Filter"
                    value={filterActive === null ? '' : filterActive}
                    onChange={(e) => setFilterActive(e.target.value === '' ? null : e.target.value === 'true')}
                    SelectProps={{ native: true }}
                  >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleSearch}
                    startIcon={<SearchIcon />}
                  >
                    Search
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Departments Table */}
          <Card>
            <CardContent>
              {filteredDepartments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No departments found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {searchTerm || filterActive !== null 
                      ? 'Try adjusting your search criteria' 
                      : 'Get started by adding your first department'
                    }
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/add-department')}
                  >
                    Add Department
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Department Name</strong></TableCell>
                        <TableCell><strong>Code</strong></TableCell>
                        <TableCell><strong>Description</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Created By</strong></TableCell>
                        <TableCell><strong>Created At</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredDepartments.map((department) => (
                        <TableRow key={department._id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {department.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={department.code} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 200, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {department.description || 'No description'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={department.isActive ? 'Active' : 'Inactive'}
                              color={department.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {department.createdBy?.name || 'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(department.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(department)}
                                disabled={actionLoading[department._id]}
                                color={department.isActive ? 'warning' : 'success'}
                                title={department.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {actionLoading[department._id] ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <ViewIcon />
                                )}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/edit-department/${department._id}`)}
                                color="primary"
                                title="Edit"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => setDeleteDialog({ open: true, department })}
                                color="error"
                                title="Delete"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialog.open}
            onClose={() => setDeleteDialog({ open: false, department: null })}
          >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete the department "{deleteDialog.department?.name}"?
                This action cannot be undone.
              </Typography>
              {deleteDialog.department && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <strong>Warning:</strong> This department cannot be deleted if it's being used by students or faculty members.
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setDeleteDialog({ open: false, department: null })}
                disabled={actionLoading[deleteDialog.department?._id]}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(deleteDialog.department)}
                color="error"
                variant="contained"
                disabled={actionLoading[deleteDialog.department?._id]}
                startIcon={actionLoading[deleteDialog.department?._id] ? <CircularProgress size={16} /> : <DeleteIcon />}
              >
                {actionLoading[deleteDialog.department?._id] ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </AdminLayout>
  )
}

export default AdminViewDepartments
