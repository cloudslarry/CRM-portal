import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Room as RoomIcon,
  Bed as BedIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import AdminLayout from '../../../components/AdminLayout';
import { assignStudentToRoom, unassignStudentFromRoom, fetchRoomsByHostel } from '../../../redux/actions/hostelAction';
import { adminGetAllStudent } from '../../../redux/actions/adminAction';
import toast from 'react-hot-toast';

const AssignStudentModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hostelId, roomId } = useParams();
  const { rooms, loading } = useSelector((state) => state.hostel);
  const { allStudent } = useSelector((state) => state.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const [studentToUnassign, setStudentToUnassign] = useState(null);

  useEffect(() => {
    fetchData();
  }, [hostelId, roomId]);

  useEffect(() => {
    // Filter students who are not already assigned to any hostel and match hostel gender
    let filtered = allStudent.filter(student => {
      const matchesSearch = !searchTerm || 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Only show students who are not assigned to any hostel
      const notAssigned = !student.hostelInfo || !student.hostelInfo.hostel;
      // Gender filter: infer from current hostel name (Boys Hostel => Male, Girls Hostel => Female)
      const selectedHostel = rooms.find(r => r._id === roomId)?.hostel || currentRoom?.hostel;
      let genderOk = true;
      if (selectedHostel && selectedHostel.name) {
        const name = (selectedHostel.name || '').toLowerCase();
        if (name.includes('boys')) genderOk = (student.gender === 'Male');
        if (name.includes('girls')) genderOk = (student.gender === 'Female');
      }
      
      return matchesSearch && notAssigned && genderOk;
    });
    
    setFilteredStudents(filtered);
  }, [allStudent, searchTerm]);

  const fetchData = async () => {
    // Fetch rooms for the hostel
    await dispatch(fetchRoomsByHostel(hostelId));
    
    // Fetch all students
    await dispatch(adminGetAllStudent());
  };

  useEffect(() => {
    if (rooms.length > 0 && roomId) {
      const room = rooms.find(r => r._id === roomId);
      setCurrentRoom(room);
    }
  }, [rooms, roomId]);

  const handleAssignStudent = async () => {
    if (!selectedStudent || !currentRoom) {
      toast.error('Please select a student');
      return;
    }

    if (currentRoom.occupied >= currentRoom.capacity) {
      toast.error('Room is at full capacity');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await dispatch(assignStudentToRoom({
        roomId: currentRoom._id,
        studentId: selectedStudent._id
      }));

      if (result.success) {
        toast.success('Student assigned to room successfully');
        setSelectedStudent(null);
        // Redirect back to the current hostel's room management page
        navigate(`/admin/hostels/${hostelId}/rooms`);
      } else {
        toast.error(result.error?.message || 'Failed to assign student');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassignStudent = (student) => {
    setStudentToUnassign(student);
    setShowUnassignDialog(true);
  };

  const confirmUnassign = async () => {
    if (!studentToUnassign || !currentRoom) return;

    setIsLoading(true);
    
    try {
      const result = await dispatch(unassignStudentFromRoom({
        roomId: currentRoom._id,
        studentId: studentToUnassign._id
      }));

      if (result.success) {
        toast.success('Student unassigned from room successfully');
        setShowUnassignDialog(false);
        setStudentToUnassign(null);
        fetchData(); // Refresh data
      } else {
        toast.error(result.error?.message || 'Failed to unassign student');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const studentColumns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.registrationNumber}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.row.department}
          color="primary"
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'year',
      headerName: 'Year',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.year}
          color="secondary"
          size="small"
        />
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
    },
  ];

  const getRowId = (row) => row._id || row.id;

  if (!currentRoom) {
    return (
      <AdminLayout title="Assign Student">
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">Room not found</Typography>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Assign Student to Room">
      <Box sx={{ 
        p: { xs: 0.5, sm: 1, md: 2 },
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <Container 
          maxWidth="lg"
          sx={{
            px: { xs: 0.5, sm: 1, md: 2 },
            py: { xs: 0.5, sm: 1 },
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Back to Room Management */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RoomIcon />}
              onClick={() => navigate(`/admin/hostels/${hostelId}/rooms`)}
            >
              Back to Room Management
            </Button>
          </Box>
          {/* Room Information */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                Room Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <RoomIcon color="primary" />
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {currentRoom.roomNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BedIcon color="primary" />
                    <Typography variant="body2">
                      Type: {currentRoom.type}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="body2">
                      Capacity: {currentRoom.occupied}/{currentRoom.capacity}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={currentRoom.status}
                      color={currentRoom.status === 'Active' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
              
              {currentRoom.occupied >= currentRoom.capacity && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This room is at full capacity. Cannot assign more students.
                </Alert>
              )}
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Current Students in Room */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                    Current Students ({currentRoom.students?.length || 0})
                  </Typography>
                  
                  {currentRoom.students && currentRoom.students.length > 0 ? (
                    <List>
                      {currentRoom.students.map((student, index) => (
                        <ListItem key={student._id} divider>
                          <ListItemText
                            primary={student.name}
                            secondary={`${student.registrationNumber} - ${student.department}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => handleUnassignStudent(student)}
                              color="error"
                              size="small"
                            >
                              <CloseIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No students assigned to this room
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Available Students */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                    Available Students
                  </Typography>
                  
                  <TextField
                    fullWidth
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ height: 400 }}>
                    <DataGrid
                      rows={filteredStudents}
                      columns={studentColumns}
                      getRowId={getRowId}
                      pageSize={5}
                      rowsPerPageOptions={[5, 10]}
                      onRowClick={(params) => setSelectedStudent(params.row)}
                      sx={{
                        border: 'none',
                        '& .MuiDataGrid-row:hover': {
                          backgroundColor: 'action.hover',
                          cursor: 'pointer'
                        },
                        '& .MuiDataGrid-row.Mui-selected': {
                          backgroundColor: 'primary.light',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Box>

                  {selectedStudent && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Selected Student:
                      </Typography>
                      <Typography variant="body2">
                        {selectedStudent.name} ({selectedStudent.registrationNumber})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedStudent.department} - {selectedStudent.year}
                      </Typography>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleAssignStudent}
                    disabled={!selectedStudent || currentRoom.occupied >= currentRoom.capacity || isLoading}
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                      }
                    }}
                  >
                    {isLoading ? 'Assigning...' : 'Assign Student'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Unassign Confirmation Dialog */}
      <Dialog
        open={showUnassignDialog}
        onClose={() => setShowUnassignDialog(false)}
      >
        <DialogTitle>Confirm Unassign Student</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to unassign {studentToUnassign?.name} from room {currentRoom?.roomNumber}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUnassignDialog(false)}>Cancel</Button>
          <Button onClick={confirmUnassign} color="error" variant="contained" disabled={isLoading}>
            {isLoading ? 'Unassigning...' : 'Unassign'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AssignStudentModal;
