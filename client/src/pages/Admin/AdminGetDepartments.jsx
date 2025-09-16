import React, { useMemo, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Box, 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  InputAdornment,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { 
  Search as SearchIcon, 
  Domain as DomainIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import AdminLayout from '../../components/AdminLayout'
import { fetchDepartments, deleteDepartmentById, clearDepartmentError } from '../../redux/actions/departmentAction'
import toast from 'react-hot-toast'

const AdminGetDepartments = () => {
  const dispatch = useDispatch()
  const { departments, loading, error } = useSelector((state) => state.department)
  
  const [query, setQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)

  useEffect(() => {
    dispatch(fetchDepartments())
  }, [dispatch])

  const filteredDepartments = useMemo(() => {
    if (!departments) return []
    return departments.filter(dept => 
      dept.name.toLowerCase().includes(query.toLowerCase()) ||
      dept.code.toLowerCase().includes(query.toLowerCase()) ||
      (dept.description && dept.description.toLowerCase().includes(query.toLowerCase()))
    )
  }, [departments, query])

  const handleDelete = async () => {
    if (selectedDepartment) {
      const result = await dispatch(deleteDepartmentById(selectedDepartment._id))
      if (result.success) {
        toast.success('Department deleted successfully!')
        setDeleteDialogOpen(false)
        setSelectedDepartment(null)
      } else {
        toast.error(result.error?.message || 'Failed to delete department')
      }
    }
  }

  const handleRefresh = () => {
    dispatch(fetchDepartments())
  }

  const columns = [
    { 
      field: 'code', 
      headerName: 'Code', 
      flex: 1, 
      minWidth: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color="primary" 
          variant="outlined"
          size="small"
        />
      )
    },
    { 
      field: 'name', 
      headerName: 'Department Name', 
      flex: 2, 
      minWidth: 220 
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      flex: 2, 
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {params.value || 'No description'}
        </Typography>
      )
    },
    { 
      field: 'isActive', 
      headerName: 'Status', 
      flex: 1, 
      minWidth: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Active' : 'Inactive'} 
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    { 
      field: 'createdAt', 
      headerName: 'Created', 
      flex: 1, 
      minWidth: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Delete Department">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedDepartment(params.row)
                setDeleteDialogOpen(true)
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  return (
    <AdminLayout title="Departments">
      <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 }, width: '100%' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DomainIcon color="primary" />
              <Typography variant="h5" fontWeight={700}>All Departments</Typography>
              <Chip 
                label={`${filteredDepartments.length} departments`} 
                color="primary" 
                variant="outlined" 
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }} 
              onClose={() => dispatch(clearDepartmentError())}
            >
              {error.message || 'Failed to load departments'}
            </Alert>
          )}

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Search by department name, code, or description..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ height: 520, width: '100%' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <DataGrid 
                    rows={filteredDepartments} 
                    columns={columns} 
                    pageSize={10} 
                    rowsPerPageOptions={[5,10,25]} 
                    disableSelectionOnClick 
                    sx={{ border: 0 }}
                    getRowId={(row) => row._id}
                  />
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Delete Department</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete the department "{selectedDepartment?.name}"? 
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleDelete} 
                color="error" 
                variant="contained"
                disabled={loading}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </AdminLayout>
  )
}

export default AdminGetDepartments


