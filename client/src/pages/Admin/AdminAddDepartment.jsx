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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { DomainAdd as DomainAddIcon, Save as SaveIcon, Clear as ClearIcon } from '@mui/icons-material'
import AdminLayout from '../../components/AdminLayout'
import { createDepartment, clearDepartmentError } from '../../redux/actions/departmentAction'
import toast from 'react-hot-toast'

const AdminAddDepartment = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.department)
  
  const [shortForm, setShortForm] = useState('')
  const [fullForm, setFullForm] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Engineering')
  const [errors, setErrors] = useState({})

  const handleReset = () => {
    setShortForm('')
    setFullForm('')
    setDescription('')
    setCategory('Engineering')
    setErrors({})
    dispatch(clearDepartmentError())
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!fullForm.trim()) {
      newErrors.fullForm = 'Department full form is required'
    } else if (fullForm.trim().length < 5) {
      newErrors.fullForm = 'Department full form must be at least 5 characters'
    }
    
    if (!shortForm.trim()) {
      newErrors.shortForm = 'Department short form is required'
    } else if (shortForm.trim().length < 2) {
      newErrors.shortForm = 'Department short form must be at least 2 characters'
    } else if (!/^[A-Z0-9._-]+$/.test(shortForm.trim())) {
      newErrors.shortForm = 'Short form can only contain uppercase letters, numbers, dots, underscores, and hyphens'
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
      shortForm: shortForm.trim().toUpperCase(),
      fullForm: fullForm.trim(),
      description: description.trim(),
      category: category,
      degreeTypes: ['Bachelor', 'Master'],
      years: [1, 2, 3, 4],
      sections: ['A', 'B', 'C', 'D'],
      allowedRoles: ['admin', 'faculty', 'student', 'applicant'],
      isActive: true,
      isPublic: true
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
                      label="Department Full Form" 
                      value={fullForm} 
                      onChange={(e) => setFullForm(e.target.value)}
                      error={!!errors.fullForm}
                      helperText={errors.fullForm}
                      required 
                      disabled={loading}
                      placeholder="e.g., Computer Science Engineering"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      fullWidth 
                      label="Department Short Form" 
                      value={shortForm} 
                      onChange={(e) => setShortForm(e.target.value)}
                      error={!!errors.shortForm}
                      helperText={errors.shortForm}
                      required 
                      disabled={loading}
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                      placeholder="e.g., CSE"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required disabled={loading}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        label="Category"
                      >
                        <MenuItem value="Engineering">Engineering</MenuItem>
                        <MenuItem value="Management">Management</MenuItem>
                        <MenuItem value="Arts">Arts</MenuItem>
                        <MenuItem value="Science">Science</MenuItem>
                        <MenuItem value="Medical">Medical</MenuItem>
                        <MenuItem value="Law">Law</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
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


