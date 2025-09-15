import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, Card, CardContent, Container, Grid, IconButton, Stack, TextField, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon, Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import { containerSx, cardSx, toolbarCardContentSx, toolbarGridSx, searchFieldSx, actionButtonSx, tableCardContentSx, dataGridSx, dialogActionsSx } from '../../styles/libraryStyles'
import { DataGrid } from '@mui/x-data-grid'
import FacultyLayout from '../../components/FacultyLayout'
import { listBooks, deleteBook, downloadBook } from '../../api/libraryApi'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const FacultyLibrary = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [confirm, setConfirm] = useState({ open: false, id: null })

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await listBooks({ q })
      const items = res.data?.data?.items || []
      setRows(items.map((b, idx) => ({ id: b._id, idx: idx + 1, title: b.title, authors: (b.authors||[]).join(', '), categories: (b.categories||[]).join(', '), copies: `${b.copiesAvailable}/${b.copiesTotal}` })))
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id) => {
    try {
      await deleteBook(id)
      toast.success('Book deleted')
      setConfirm({ open: false, id: null })
      fetchData()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed')
    }
  }

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
    { field: 'copies', headerName: 'Available/Total', width: 160 },
    {
      field: 'actions', headerName: 'Actions', width: 160, sortable: false, filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Download"><span><IconButton size="small" onClick={() => handleDownload(params.id)}><DownloadIcon fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/faculty/library/edit/${params.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setConfirm({ open: true, id: params.id })}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      )
    }
  ]), [])

  return (
    <FacultyLayout title="Library Management">
      <Box>
        <Container maxWidth="lg" sx={containerSx}>
          <Card sx={cardSx}>
            <CardContent sx={toolbarCardContentSx}>
              <Grid container spacing={1} sx={toolbarGridSx}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField size="small" fullWidth placeholder="Search books..." value={q} onChange={(e) => setQ(e.target.value)} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }} sx={searchFieldSx} />
                </Grid>
                <Grid item>
                  <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData} sx={actionButtonSx}>Refresh</Button>
                </Grid>
                <Grid item xs />
                <Grid item>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/faculty/library/new')} sx={actionButtonSx}>Upload New Book</Button>
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

      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null })}>
        <DialogTitle>Delete book?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this book? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions sx={dialogActionsSx}>
          <Button onClick={() => setConfirm({ open: false, id: null })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => handleDelete(confirm.id)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </FacultyLayout>
  )
}

export default FacultyLibrary


