import React, { useMemo, useState } from 'react'
import { Box, Container, Card, CardContent, Typography, TextField, InputAdornment } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Search as SearchIcon, Domain as DomainIcon } from '@mui/icons-material'
import AdminLayout from '../../components/AdminLayout'
import { DEPARTMENTS } from '../../config/departments'

const AdminGetDepartments = () => {
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    return DEPARTMENTS.filter(d => d.toLowerCase().includes(query.toLowerCase())).map((name, idx) => ({ id: idx + 1, code: name.split(' ').map(w => w[0]).join('').toUpperCase(), name }))
  }, [query])

  const columns = [
    { field: 'code', headerName: 'Code', flex: 1, minWidth: 120 },
    { field: 'name', headerName: 'Department Name', flex: 2, minWidth: 220 }
  ]

  return (
    <AdminLayout title="Departments">
      <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 }, width: '100%' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DomainIcon color="primary" />
              <Typography variant="h5" fontWeight={700}>All Departments</Typography>
            </Box>
          </Box>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Search by department name..."
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
                <DataGrid rows={rows} columns={columns} pageSize={10} rowsPerPageOptions={[5,10,25]} disableSelectionOnClick sx={{ border: 0 }} />
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </AdminLayout>
  )
}

export default AdminGetDepartments


