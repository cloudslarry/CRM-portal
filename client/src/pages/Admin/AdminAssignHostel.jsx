import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Avatar,
  Badge
} from '@mui/material'
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Bed as BedIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import AdminLayout from '../../components/AdminLayout'
import { fetchHostels, fetchRoomsByHostel } from '../../redux/actions/hostelAction'
import { adminGetAllStudent, assignStudentToHostel } from '../../redux/actions/adminAction'
import toast from 'react-hot-toast'

const AdminAssignHostel = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Redux state
  const { hostels, rooms, loading: hostelLoading } = useSelector((state) => state.hostel)
  const { allStudent: students, loading: studentLoading } = useSelector((state) => state.admin)
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedHostel, setSelectedHostel] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [availableRooms, setAvailableRooms] = useState([])
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchHostels())
    dispatch(adminGetAllStudent())
  }, [dispatch])

  // Filter students based on search term
  const filteredStudents = (students || []).filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter students who don't have hostel assignment
  const unassignedStudents = filteredStudents.filter(student => 
    !student.hostelInfo || !student.hostelInfo.hostel
  )

  // Handle hostel selection
  const handleHostelChange = async (hostelId) => {
    setSelectedHostel(hostelId)
    setSelectedRoom('')
    setAvailableRooms([])
    
    if (hostelId) {
      try {
        setLoading(true)
        const result = await dispatch(fetchRoomsByHostel(hostelId))
        if (result.success) {
          // Filter rooms that have available beds
          const available = result.data.filter(room => 
            room.capacity > (room.occupiedBeds || 0)
          )
          setAvailableRooms(available)
        }
      } catch (error) {
        toast.error('Failed to load rooms')
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle student selection for assignment
  const handleAssignStudent = (student) => {
    setSelectedStudent(student)
    setAssignmentDialogOpen(true)
  }

  // Handle hostel assignment
  const handleAssignHostel = async () => {
    if (!selectedStudent || !selectedHostel || !selectedRoom) {
      toast.error('Please select student, hostel, and room')
      return
    }

    try {
      setLoading(true)
      
      const result = await dispatch(assignStudentToHostel(selectedStudent._id, selectedRoom))
      
      if (result.success) {
        toast.success(`Successfully assigned ${selectedStudent.name} to room ${result.data.room.roomNumber}`)
        setAssignmentDialogOpen(false)
        setSelectedStudent(null)
        setSelectedHostel('')
        setSelectedRoom('')
        setAvailableRooms([])
        
        // Refresh data
        dispatch(adminGetAllStudent())
      } else {
        toast.error(result.error || 'Failed to assign hostel')
      }
      
    } catch (error) {
      toast.error('Failed to assign hostel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Assign Hostel">
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Hostel Assignment
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Assign students to hostels and rooms
          </Typography>
        </Box>

        {/* Search Bar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search students by name, registration number, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </CardContent>
        </Card>

        {/* Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {students?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Students
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {(students?.length || 0) - unassignedStudents.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Assigned Students
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {unassignedStudents.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unassigned Students
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Students List */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Students ({unassignedStudents.length} unassigned)
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => dispatch(adminGetAllStudent())}
                disabled={studentLoading}
              >
                Refresh
              </Button>
            </Box>

            {studentLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : unassignedStudents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  {searchTerm ? 'No students found matching your search' : 'All students have been assigned to hostels'}
                </Typography>
              </Box>
            ) : (
              <List>
                {unassignedStudents.map((student, index) => (
                  <React.Fragment key={student._id}>
                    <ListItem>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <ListItemText
                        primary={student.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {student.registrationNumber} • {student.department} • Year {student.year}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip 
                                label="Unassigned" 
                                color="warning" 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="contained"
                          startIcon={<AssignmentIcon />}
                          onClick={() => handleAssignStudent(student)}
                          disabled={loading}
                        >
                          Assign Hostel
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < unassignedStudents.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Assignment Dialog */}
        <Dialog 
          open={assignmentDialogOpen} 
          onClose={() => setAssignmentDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Assign Hostel - {selectedStudent?.name}
          </DialogTitle>
          <DialogContent>
            {selectedStudent && (
              <Box sx={{ mb: 3 }}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    Student Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Name: {selectedStudent.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Registration: {selectedStudent.registrationNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Department: {selectedStudent.department}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Year: {selectedStudent.year}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Hostel</InputLabel>
                  <Select
                    value={selectedHostel}
                    onChange={(e) => handleHostelChange(e.target.value)}
                    disabled={loading}
                  >
                    {hostels.map((hostel) => (
                      <MenuItem key={hostel._id} value={hostel._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <HomeIcon sx={{ mr: 1 }} />
                          {hostel.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Room</InputLabel>
                  <Select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    disabled={!selectedHostel || loading}
                  >
                    {availableRooms.map((room) => (
                      <MenuItem key={room._id} value={room._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BedIcon sx={{ mr: 1 }} />
                          Room {room.roomNumber} (Available: {room.capacity - (room.occupiedBeds || 0)}/{room.capacity})
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {selectedHostel && availableRooms.length === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No available rooms in the selected hostel
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignHostel}
              variant="contained"
              disabled={!selectedStudent || !selectedHostel || !selectedRoom || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
            >
              {loading ? 'Assigning...' : 'Assign Hostel'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  )
}

export default AdminAssignHostel
