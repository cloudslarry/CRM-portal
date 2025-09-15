import React, { useEffect, useMemo, useState } from 'react'
import { Box, Card, CardContent, Container, Grid, IconButton, TextField, Tooltip, Button } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Download as DownloadIcon, Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import StudentLayout from '../../components/StudentLayout'
import { listBooks, downloadBook } from '../../api/libraryApi'
import toast from 'react-hot-toast'
import { containerSx, cardSx, toolbarCardContentSx, toolbarGridSx, searchFieldSx, tableCardContentSx, dataGridSx } from '../../styles/libraryStyles'

const StudentLibrary = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await listBooks({ q })
      const items = res.data?.data?.items || []
      setRows(items.map((b, idx) => ({ id: b._id, idx: idx + 1, title: b.title, authors: (b.authors||[]).join(', '), categories: (b.categories||[]).join(', '), available: b.copiesAvailable })))
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleDownload = async (id) => {
    try {
      const res = await downloadBook(id)
      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'book'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Download failed')
    }
  }

  const columns = useMemo(() => ([
    { field: 'idx', headerName: '#', width: 60 },
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
    { field: 'authors', headerName: 'Authors', flex: 1, minWidth: 180 },
    { field: 'categories', headerName: 'Categories', flex: 1, minWidth: 160 },
    { field: 'available', headerName: 'Available', width: 120 },
    { field: 'actions', headerName: 'Actions', width: 120, sortable: false, filterable: false, renderCell: (params) => (
      <Tooltip title="Download"><span><IconButton size="small" onClick={() => handleDownload(params.id)}><DownloadIcon fontSize="small" /></IconButton></span></Tooltip>
    ) }
  ]), [])

  return (
    <StudentLayout title="Library">
      <Box>
        <Container maxWidth="lg" sx={containerSx}>
          <Card sx={cardSx}>
            <CardContent sx={toolbarCardContentSx}>
              <Grid container spacing={1} sx={toolbarGridSx}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField size="small" fullWidth placeholder="Search books..." value={q} onChange={(e) => setQ(e.target.value)} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }} sx={searchFieldSx} />
                </Grid>
                <Grid item>
                  <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={tableCardContentSx}>
              <div style={{ height: 520, width: '100%' }}>
                <DataGrid rows={rows} columns={columns} loading={loading} pageSize={10} rowsPerPageOptions={[5,10,25]} disableSelectionOnClick sx={dataGridSx} />
              </div>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </StudentLayout>
  )
}

export default StudentLibrary


