import React, { useState } from 'react'
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
  Divider
} from '@mui/material'
import { DomainAdd as DomainAddIcon, Save as SaveIcon, Clear as ClearIcon } from '@mui/icons-material'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { adminAddDepartment } from '../../redux/actions/adminAction'

const AdminAddDepartment = () => {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = () => {
    setName('')
    setCode('')
    setDescription('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!name.trim() || !code.trim()) {
      toast.error('Name and code are required')
      return
    }

    console.log('Submitting department:', {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim()
    })

    setIsLoading(true)
    try {
      const result = await dispatch(adminAddDepartment({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim()
      }))

      console.log('Department result:', result)

      if (result.success) {
        toast.success('Department added successfully!')
        handleReset()
      } else {
        console.error('Department error:', result.error)
        toast.error(result.error?.message || 'Failed to add department')
      }
    } catch (error) {
      console.error('Department catch error:', error)
      toast.error('An error occurred while adding department')
    } finally {
      setIsLoading(false)
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
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Department Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Department Code" value={code} onChange={(e) => setCode(e.target.value)} required />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Description" multiline minRows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                  </Grid>
                </Grid>

                <Divider sx={{ my: { xs: 2, md: 3 } }} />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<ClearIcon />} 
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    Reset
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Department'}
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


