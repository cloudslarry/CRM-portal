import React,{useEffect,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {DataGrid} from '@mui/x-data-grid'
import {useSelector,useDispatch} from 'react-redux'

import StudentNavbar from '../components/StudentNavbar'
import StudentLayout from '../components/StudentLayout'
import { Box, Container, Card, CardContent, Typography, Grid, TextField, InputAdornment, Button, Paper, Alert, CircularProgress } from '@mui/material'
import { CalendarMonth as CalendarMonthIcon, Search as SearchIcon, School as SchoolIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material'

import {fetchAttendance} from '../redux/actions/studentAction'

const StudentAttendance = () => {

    const student = useSelector(store => store.student)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [date, setDate] = useState(() => {
      const d = new Date();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${mm}-${dd}`;
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        dispatch(fetchAttendance(date)).finally(() => setIsLoading(false))
    },[dispatch])

    const refresh = () => {
      setIsLoading(true)
      dispatch(fetchAttendance(date)).finally(() => setIsLoading(false))
    }

    const columns = [
        {field:"id",headerName:"#",flex:0.3, minWidth:60},
        {field:"code",headerName:"Subject Code",flex:0.8, minWidth:140},
        {field:"name",headerName:"Subject Name",flex:1.5, minWidth:200},
        {field:"max",headerName:"Max Hours",flex:0.6, minWidth:120},
        {field:"absent",headerName:"Absent Hours",flex:0.6, minWidth:120},
        {field:"total",headerName:"Total Hours",flex:0.6, minWidth:120},
        {field:"attendance",headerName:"Attendance %",flex:0.8, minWidth:120, 
         renderCell: (params) => (
           <Box sx={{ 
             display: 'flex', 
             alignItems: 'center', 
             color: params.value >= 75 ? 'success.main' : params.value >= 50 ? 'warning.main' : 'error.main',
             fontWeight: 'bold'
           }}>
             {params.value}
           </Box>
         )
        },
    ]

    const rows = [];
    student?.attendence?.forEach((item,index) => {
        rows.push({
            id:index+1,
            code:item.subjectCode,
            name:item.subjectName,
            max:item.maxHours,
            absent:item.absentHours,
            total:item.totalLectures,
            attendance:parseFloat(item.attendance),
        })
    })

    // Calculate summary statistics
    const totalSubjects = rows.length;
    const totalLectures = rows.reduce((sum, row) => sum + row.total, 0);
    const totalAbsent = rows.reduce((sum, row) => sum + row.absent, 0);
    const totalPresent = totalLectures - totalAbsent;
    const overallAttendance = totalLectures > 0 ? ((totalPresent / totalLectures) * 100).toFixed(2) : 0;

    if (!student.isAuthenticated) { navigate('/'); return null }

    return(
      <StudentLayout title="Attendance">
        <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 } }}>
          <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>My Attendance</Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField 
                      fullWidth 
                      type="date" 
                      label="Filter by Date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      InputLabelProps={{ shrink: true }} 
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start"><CalendarMonthIcon /></InputAdornment> 
                      }} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Button 
                      variant="contained" 
                      startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />} 
                      onClick={refresh} 
                      fullWidth
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'View'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Summary Statistics Cards */}
            {rows.length > 0 && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Attendance Summary</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                        <SchoolIcon sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold">
                          {totalSubjects}
                        </Typography>
                        <Typography variant="body2">Total Subjects</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                        <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold">
                          {totalPresent}
                        </Typography>
                        <Typography variant="body2">Present Hours</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
                        <CancelIcon sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold">
                          {totalAbsent}
                        </Typography>
                        <Typography variant="body2">Absent Hours</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                        <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold">
                          {overallAttendance}%
                        </Typography>
                        <Typography variant="body2">Overall Attendance</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* No Data Message */}
            {rows.length === 0 && !isLoading && (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Attendance Records Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {date ? `No attendance records found for ${new Date(date).toLocaleDateString()}` : 'No attendance records available'}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Data Grid */}
            {rows.length > 0 && (
              <Card>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ height: 520, width: '100%' }}>
                    <DataGrid 
                      rows={rows} 
                      columns={columns} 
                      pageSize={10} 
                      rowsPerPageOptions={[5,10,25]} 
                      disableSelectionOnClick 
                      sx={{ 
                        border: 0,
                        '& .MuiDataGrid-columnHeaders': { 
                          backgroundColor: 'action.hover',
                          fontWeight: 'bold'
                        },
                        '& .MuiDataGrid-row:hover': { 
                          backgroundColor: 'action.hover' 
                        }
                      }} 
                    />
                  </Box>
                </CardContent>
              </Card>
            )}
          </Container>
        </Box>
      </StudentLayout>
    )
}

export default StudentAttendance;
