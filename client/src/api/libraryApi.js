import api from '../config/api'

const authHeader = () => {
  const t = localStorage.getItem('facultyToken') || localStorage.getItem('studentToken') || localStorage.getItem('adminToken')
  if (!t) return {}
  return {
    Authorization: t.startsWith('Bearer ') ? t : `Bearer ${t}`
  }
}

export const listBooks = (params = {}) => api.get('/api/books', { params })

export const getBook = (id) => api.get(`/api/books/${id}`)

export const downloadBook = (id) => api.get(`/api/books/${id}/download`, { responseType: 'blob', headers: { ...authHeader() } })

export const createBook = (formData) => api.post('/api/books', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

export const updateBook = (id, formData) => api.put(`/api/books/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

export const deleteBook = (id) => api.delete(`/api/books/${id}`)


