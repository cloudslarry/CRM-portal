import React, { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Container, Grid, Stack, TextField, Typography, FormControlLabel, Checkbox } from '@mui/material'
import { containerSx, cardSx, formStackSx, formGridSx, fileRowSx } from '../../styles/libraryStyles'
import FacultyLayout from '../../components/FacultyLayout'
import { createBook, getBook, updateBook } from '../../api/libraryApi'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

const initial = { title: '', authors: '', categories: '', publisher: '', publishedYear: '', copiesTotal: '1', copiesAvailable: '1', isPhysical: false }

const FacultyLibraryForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(initial)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (!isEdit) return
        const res = await getBook(id)
        const b = res.data?.data
        setForm({
          title: b.title || '',
          authors: (b.authors||[]).join(', '),
          categories: (b.categories||[]).join(', '),
          publisher: b.publisher || '',
          publishedYear: b.publishedYear || '',
          copiesTotal: String(b.copiesTotal ?? ''),
          copiesAvailable: String(b.copiesAvailable ?? '')
        })
      } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to load')
      }
    }
    load()
  }, [id])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') fd.append(k, v) })
      fd.set('isPhysical', String(form.isPhysical))
      if (form.authors) fd.set('authors', form.authors)
      if (form.categories) fd.set('categories', form.categories)
      if (!form.isPhysical && file) fd.append('file', file)
      if (isEdit) await updateBook(id, fd); else await createBook(fd)
      toast.success(isEdit ? 'Book updated' : 'Book created')
      navigate('/faculty/library')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FacultyLayout title={isEdit ? 'Edit Book' : 'Upload New Book'}>
      <Box>
        <Container maxWidth="md" sx={containerSx}>
          <Card sx={cardSx}>
            <CardContent>
              <form onSubmit={onSubmit}>
                <Stack spacing={2} sx={formStackSx}>
                  <TextField label="Title" name="title" value={form.title} onChange={onChange} required />
                  <TextField label="Authors (comma-separated)" name="authors" value={form.authors} onChange={onChange} required />
                  <TextField label="Categories (comma-separated)" name="categories" value={form.categories} onChange={onChange} />
                  <Grid container spacing={2} sx={formGridSx}>
                    <Grid item xs={12} sm={6}><TextField label="Publisher" name="publisher" value={form.publisher} onChange={onChange} /></Grid>
                    <Grid item xs={12} sm={6}><TextField type="number" label="Published Year" name="publishedYear" value={form.publishedYear} onChange={onChange} /></Grid>
                    <Grid item xs={12} sm={6}><TextField type="number" label="Total Copies" name="copiesTotal" value={form.copiesTotal} onChange={onChange} required /></Grid>
                    <Grid item xs={12} sm={6}><TextField type="number" label="Available Copies" name="copiesAvailable" value={form.copiesAvailable} onChange={onChange} required /></Grid>
                  </Grid>
                  <FormControlLabel control={<Checkbox checked={form.isPhysical} onChange={(e) => setForm(f => ({ ...f, isPhysical: e.target.checked }))} />} label="Physical copy (no file upload)" />
                  <Stack direction="row" spacing={2} alignItems="center" sx={fileRowSx}>
                    <Button variant="outlined" component="label" disabled={form.isPhysical}>
                      {file ? 'Change File' : (isEdit ? 'Replace File' : 'Choose File')}
                      <input type="file" hidden accept=".pdf,.epub,.mobi,.doc,.docx,application/pdf,application/epub+zip,application/x-mobipocket-ebook,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={form.isPhysical} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </Button>
                    {file ? (
                      <Typography variant="body2" color="text.primary">
                        Selected: {file.name} {file.size ? `(${Math.round(file.size / 1024)} KB)` : ''}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Allowed: pdf, epub, mobi, doc, docx</Typography>
                    )}
                    {form.isPhysical && (
                      <Typography variant="body2" color="text.secondary">Physical copy selected — file upload disabled</Typography>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Book')}</Button>
                    <Button variant="text" onClick={() => navigate('/faculty/library')}>Cancel</Button>
                  </Stack>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </FacultyLayout>
  )
}

export default FacultyLibraryForm


