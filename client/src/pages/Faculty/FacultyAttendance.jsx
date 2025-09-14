import React,{useState,useEffect} from 'react'
import {useSelector,useDispatch} from 'react-redux'
import {DataGrid} from '@mui/x-data-grid'

import { Box, Container, Card, CardContent, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button, Divider, CircularProgress, TextField, InputAdornment, Alert, Chip, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { Person as PersonIcon, CalendarToday as CalendarIcon, Search as SearchIcon, Class as ClassIcon, Check as CheckIcon, CalendarMonth as CalendarMonthIcon, People as PeopleIcon, Download as DownloadIcon } from '@mui/icons-material'
import FacultyLayout from '../../components/FacultyLayout'

import {fetchStudents,markAttendance} from '../../redux/actions/facultyAction'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const FacultyAttendance = () => {
    const faculty = useSelector((store) => store.faculty);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const department = faculty.faculty.faculty.department;
    const [year, setYear] = useState("")
    const [section, setSection] = useState("")
    const [date, setDate] = useState(() => {
      const d = new Date();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${mm}-${dd}`;
    })
    const [subjectCode, setSubjectCode] = useState("")
    const [checkedValue, setCheckedValue] = useState([]);
    const [error, setError] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submittedIds, setSubmittedIds] = useState([])
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

    const columns = [
        {field:"_id",headerName:"No.",flex:0.3,minWidth:80},
        {field:"code",headerName:"Registration Number",flex:1,minWidth:180},
        {field:"name",headerName:"Name",flex:1.5,minWidth:200},
        {field:"email",headerName:"Email",flex:1.5,minWidth:220},
    ]

    const rows = [];
    faculty.fetchedStudents.forEach((item,index) => {
        rows.push({
            id:index + 1,
            _id:item._id,
            code:item.registrationNumber,
            name:item.name,
            email:item.email
        })
    })

    useEffect(() => {
        if (store.error) {
            setError(store.error)
            setIsLoading(false)
        }
    }, [store.error])

    const getStudents = (e) => {
        e.preventDefault();
        if (!year || !section) {
          toast.error('Please select year and section');
          return;
        }
        setIsLoading(true);
        dispatch(fetchStudents(department,year,section)).finally(() => setIsLoading(false))
    }

    const handleSubmitClick = (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        
        if (!subjectCode) {
          setErrorMessage('Please select a subject');
          toast.error('Please select a subject');
          return;
        }
        if (!date) {
          setErrorMessage('Please choose a date');
          toast.error('Please choose a date');
          return;
        }
        if (checkedValue.length === 0) {
          setErrorMessage('Please select at least one student');
          toast.error('Please select at least one student');
          return;
        }
        
        setConfirmDialogOpen(true);
    }

    const setAttendance = async () => {
        
        try {
          setIsSubmitting(true);
          console.log('Submitting attendance with data:', {
            selectedStudents: checkedValue,
            subjectCode,
            department,
            year,
            section,
            date
          });
          const result = await dispatch(
            markAttendance(checkedValue, subjectCode, department, year, section, date)
          );
          console.log('Attendance submission result:', result);
          
          if (result && result.error) {
            const error = result.error.response?.data;
            if (error.duplicateStudents) {
              const errorMsg = `Attendance already marked for ${error.duplicateStudents.length} students on ${new Date(date).toLocaleDateString()}`;
              setErrorMessage(errorMsg);
              toast.error(errorMsg, { duration: 5000 });
            } else {
              setErrorMessage(error.message || 'Failed to mark attendance');
              toast.error(error.message || 'Failed to mark attendance');
            }
            return;
          }
          
          setSubmittedIds(checkedValue);
          setCheckedValue([]);
          
          if (result && result.payload) {
            const { presentCount, absentCount, totalStudents } = result.payload;
            const successMsg = `Attendance marked for ${presentCount} of ${totalStudents} students (${absentCount} absent)`;
            setSuccessMessage(successMsg);
            toast.success(successMsg, { duration: 5000 });
          } else {
            setSuccessMessage('Attendance marked successfully!');
            toast.success('Attendance marked successfully!');
          }
          
          // Refresh the student list to show updated attendance
          dispatch(fetchStudents(department, year, section));
          
        } catch (error) {
          console.error('Error marking attendance:', error);
          const errorMsg = error.response?.data?.message || 'An error occurred while marking attendance';
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        } finally {
          setIsSubmitting(false);
          setConfirmDialogOpen(false);
        }
    }

    const downloadCSV = () => {
      const headers = ['Registration Number','Name','Email','Subject Code','Department','Year','Section','Date']
      const selected = faculty.fetchedStudents.filter(s => submittedIds.includes(s._id))
      const rows = selected.map(s => [
        s.registrationNumber,
        s.name,
        s.email,
        subjectCode,
        department,
        year,
        section,
        date
      ])
      const csv = [headers, ...rows].map(r => r.map(val => `"${String(val ?? '').replace(/"/g,'""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance_${subjectCode}_${date}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

  if (!faculty.isAuthenticated) {
    navigate('/')
    return null
  }

  return (
    <FacultyLayout title="Mark Attendance">
      <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Year</InputLabel>
                    <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)} startAdornment={<CalendarIcon sx={{ mr: 1 }} />}>
                      <MenuItem value="">Select Year</MenuItem>
                      <MenuItem value="1">1</MenuItem>
                      <MenuItem value="2">2</MenuItem>
                      <MenuItem value="3">3</MenuItem>
                      <MenuItem value="4">4</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Section</InputLabel>
                    <Select value={section} label="Section" onChange={(e) => setSection(e.target.value)} startAdornment={<PersonIcon sx={{ mr: 1 }} />}>
                      <MenuItem value="">Select Section</MenuItem>
                      <MenuItem value="A">A</MenuItem>
                      <MenuItem value="B">B</MenuItem>
                      <MenuItem value="C">C</MenuItem>
                      <MenuItem value="D">D</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthIcon /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button onClick={getStudents} variant="contained" fullWidth startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}>{isLoading ? 'Searching...' : 'Search'}</Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {faculty.allSubjectCodeList.length > 0 && (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Select students by checking the boxes, then choose a subject and date to submit attendance.
                    </Typography>
                  </Alert>
                  
                  {errorMessage && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
                      {errorMessage}
                    </Alert>
                  )}
                  
                  {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                      {successMessage}
                    </Alert>
                  )}
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth error={!subjectCode && checkedValue.length > 0}>
                        <InputLabel>Subject *</InputLabel>
                        <Select value={subjectCode} label="Subject *" onChange={(e) => setSubjectCode(e.target.value)} startAdornment={<ClassIcon sx={{ mr: 1 }} />}>
                          <MenuItem value="">Select Subject</MenuItem>
                          {faculty.allSubjectCodeList.map((code) => (
                            <MenuItem key={code} value={code}>{code}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Date *"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthIcon /></InputAdornment> }}
                        error={!date && checkedValue.length > 0}
                        helperText={!date && checkedValue.length > 0 ? "Date is required" : ""}
                      />
                    </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      onClick={handleSubmitClick} 
                      variant="contained" 
                      color="success" 
                      startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />} 
                      fullWidth 
                      disabled={isSubmitting || checkedValue.length === 0 || !subjectCode || !date}
                      sx={{ minHeight: 56 }}
                    >
                      {isSubmitting ? 'Submitting...' : `Submit Attendance (${checkedValue.length})`}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      variant="outlined" 
                      onClick={downloadCSV} 
                      fullWidth 
                      disabled={!submittedIds.length}
                      startIcon={<DownloadIcon />}
                      sx={{ minHeight: 56 }}
                    >
                      Download CSV
                    </Button>
                  </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>

          {/* Statistics Card */}
          {rows.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                      <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">
                        {rows.length}
                      </Typography>
                      <Typography variant="body2">Total Students</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                      <CheckIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">
                        {checkedValue.length}
                      </Typography>
                      <Typography variant="body2">Selected (Present)</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                      <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">
                        {rows.length - checkedValue.length}
                      </Typography>
                      <Typography variant="body2">Absent</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                      <CalendarMonthIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold">
                        {date ? new Date(date).toLocaleDateString() : 'N/A'}
                      </Typography>
                      <Typography variant="body2">Date</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ height: 520, width: '100%' }}>
                <DataGrid
                  checkboxSelection
                  onRowSelectionModelChange={(ids) => {
                    setCheckedValue([]);
                    const selectedRows = new Set(ids);
                    const selectedStudents = rows.filter((row) => selectedRows.has(row.id) )
                    const checkedArr = [];
                    selectedStudents.forEach((item) => { checkedArr.push(item._id); })
                    setCheckedValue(checkedArr);
                  }}
                  rows={rows}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[5,10,25]}
                  disableRowSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-columnHeaders': { backgroundColor: 'action.hover' },
                    '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Attendance Submission</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to submit attendance for the following details?
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="body2"><strong>Subject:</strong> {subjectCode}</Typography>
            <Typography variant="body2"><strong>Date:</strong> {new Date(date).toLocaleDateString()}</Typography>
            <Typography variant="body2"><strong>Department:</strong> {department}</Typography>
            <Typography variant="body2"><strong>Year:</strong> {year}</Typography>
            <Typography variant="body2"><strong>Section:</strong> {section}</Typography>
            <Typography variant="body2"><strong>Present Students:</strong> {checkedValue.length}</Typography>
            <Typography variant="body2"><strong>Absent Students:</strong> {rows.length - checkedValue.length}</Typography>
          </Box>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. Make sure all information is correct.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={setAttendance} 
            variant="contained" 
            color="success" 
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </FacultyLayout>
  )
}

export default FacultyAttendance
