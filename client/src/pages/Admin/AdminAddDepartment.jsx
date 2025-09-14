import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material'
import { DomainAdd as DomainAddIcon, Save as SaveIcon, Clear as ClearIcon } from '@mui/icons-material'
import AdminLayout from '../../components/AdminLayout'
import { createDepartment, clearDepartmentError } from '../../redux/actions/departmentAction'
import toast from 'react-hot-toast'

const AdminAddDepartment = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.department)
  
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})

  const handleReset = () => {
    setName('')
    setCode('')
    setDescription('')
    setErrors({})
    dispatch(clearDepartmentError())
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!name.trim()) {
      newErrors.name = 'Department name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Department name must be at least 2 characters'
    }
    
    if (!code.trim()) {
      newErrors.code = 'Department code is required'
    } else if (code.trim().length < 2) {
      newErrors.code = 'Department code must be at least 2 characters'
    } else if (!/^[A-Za-z0-9]+$/.test(code.trim())) {
      newErrors.code = 'Department code must contain only letters and numbers'
    }
    
    if (description.trim().length > 500) {
      newErrors.description = 'Description must not exceed 500 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const departmentData = {
      name: name.trim(),
      code: code.trim(),
      description: description.trim()
    }

    const result = await dispatch(createDepartment(departmentData))
    
    if (result.success) {
      toast.success('Department added successfully!')
      handleReset()
    } else {
      toast.error(result.error?.message || 'Failed to add department')
    }
  }

  return (
    <AdminLayout title="Add Department">
      <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 }, width: '100%', maxWidth: '100%' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 3 } }}>
            <Avatar sx={{ width: 72, height: 72, mx: 'auto', mb: 1, bgcolor: 'primary.main' }}>
              <DomainAddIcon />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Add New Department</Typography>
            <Typography variant="body2" color="text.secondary">Create a new department for your institution</Typography>
          </Box>

          <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearDepartmentError())}>
                  {error.message || 'An error occurred while adding the department'}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      fullWidth 
                      label="Department Name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      error={!!errors.name}
                      helperText={errors.name}
                      required 
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      fullWidth 
                      label="Department Code" 
                      value={code} 
                      onChange={(e) => setCode(e.target.value)}
                      error={!!errors.code}
                      helperText={errors.code}
                      required 
                      disabled={loading}
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Description" 
                      multiline 
                      minRows={3} 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      error={!!errors.description}
                      helperText={errors.description || `${description.length}/500 characters`}
                      disabled={loading}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: { xs: 2, md: 3 } }} />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<ClearIcon />} 
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Department'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </AdminLayout>
  )
}

export default AdminAddDepartment


