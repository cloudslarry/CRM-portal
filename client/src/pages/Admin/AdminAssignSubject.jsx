import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Chip,
  Avatar,
  Stack,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import AdminLayout from "../../components/AdminLayout";
import {
  adminGetAllFaculty,
  getAllSubjects,
  assignSubjectToFaculty,
} from "../../redux/actions/adminAction";
import toast from "react-hot-toast";

const AdminAssignSubject = () => {
  const dispatch = useDispatch();
  const admin = useSelector((store) => store.admin);
  const facultyFromStore = useSelector((store) => store.admin.faculty);
  const error = useSelector((store) => store.errors);

  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("oneToMany"); // toggle tabs

  // Update local state when Redux store changes
  useEffect(() => {
    console.log('Faculty from store:', facultyFromStore);
    if (facultyFromStore) {
      setFaculty(facultyFromStore);
    }
  }, [facultyFromStore]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching data...');
      const [facultyRes, subjectsRes] = await Promise.all([
        dispatch(adminGetAllFaculty()),
        dispatch(getAllSubjects()),
      ]);

      console.log('Faculty Response:', facultyRes);
      console.log('Subjects Response:', subjectsRes);

      if (facultyRes.success) {
        console.log('Setting faculty data:', facultyRes.result);
        setFaculty(facultyRes.result || []);
      } else {
        console.error('Faculty fetch error:', facultyRes);
        toast.error("Failed to fetch faculty data");
      }

      if (subjectsRes.success) {
        console.log('Setting subjects data:', subjectsRes.result);
        setSubjects(subjectsRes.result || []);
      } else {
        console.error('Subjects fetch error:', subjectsRes);
        toast.error("Failed to fetch subjects data");
      }

      // Log state after setting
      console.log('Current faculty state:', faculty);
      console.log('Current subjects state:', subjects);
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOneToMany = async () => {
    if (!selectedFaculty || selectedSubjects.length === 0) {
      toast.error("Please select a faculty member and at least one subject");
      return;
    }

    const response = await dispatch(
      assignSubjectToFaculty(selectedFaculty._id, selectedSubjects)
    );
    if (response.success) {
      toast.success("Subjects assigned successfully");
      setSelectedFaculty(null);
      setSelectedSubjects([]);
    } else toast.error("Failed to assign subjects");
  };

  const filteredFaculty = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubjects = subjects.filter(
    (s) =>
      s.subjectName.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.subjectCode.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Stack spacing={1} mb={4}>
          <Typography variant="h4" fontWeight={600}>
            Assign Subjects to Faculty
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Easily assign subjects to faculty members or allocate one subject to
            multiple faculty.
          </Typography>
        </Stack>

        {/* Tabs for Mode Switch */}
        <Paper elevation={1} sx={{ borderRadius: 2, mb: 4 }}>
          <Tabs
            value={mode}
            onChange={(e, newValue) => setMode(newValue)}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab value="oneToMany" label="One Faculty → Many Subjects" />
            <Tab value="manyToOne" label="One Subject → Many Faculty" />
          </Tabs>
        </Paper>

        {mode === "oneToMany" ? (
          <Grid container spacing={3}>
            {/* Faculty Section */}
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Faculty List
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            disabled={loading}
                            checked={false}
                            indeterminate={selectedFaculty !== null}
                          />
                        </TableCell>
                        <TableCell>Faculty ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Email</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            Loading faculty data...
                          </TableCell>
                        </TableRow>
                      ) : faculty.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No faculty members found
                          </TableCell>
                        </TableRow>
                      ) : (
                        faculty.map((f) => (
                          <TableRow
                            key={f._id}
                            hover
                            selected={selectedFaculty?._id === f._id}
                            onClick={() => setSelectedFaculty(f)}
                            sx={{
                              cursor: 'pointer',
                              '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                '& .MuiTableCell-root': { color: 'white' }
                              }
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedFaculty?._id === f._id}
                                onChange={() => setSelectedFaculty(f)}
                              />
                            </TableCell>
                            <TableCell>{f.registrationNumber || f.facultyId || 'N/A'}</TableCell>
                            <TableCell>{f.name}</TableCell>
                            <TableCell>{f.department}</TableCell>
                            <TableCell>{f.email}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Subjects Section */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Subjects
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search subjects..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            disabled={loading}
                            checked={subjects.length > 0 && selectedSubjects.length === subjects.length}
                            indeterminate={selectedSubjects.length > 0 && selectedSubjects.length < subjects.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSubjects(subjects.map(s => s._id));
                              } else {
                                setSelectedSubjects([]);
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>Subject Code</TableCell>
                        <TableCell>Subject Name</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Year</TableCell>
                        <TableCell>Semester</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            Loading subjects data...
                          </TableCell>
                        </TableRow>
                      ) : subjects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No subjects found
                          </TableCell>
                        </TableRow>
                      ) : (
                        subjects.map((subject) => (
                          <TableRow
                            key={subject._id}
                            hover
                            selected={selectedSubjects.includes(subject._id)}
                            onClick={() =>
                              setSelectedSubjects((prev) =>
                                prev.includes(subject._id)
                                  ? prev.filter((id) => id !== subject._id)
                                  : [...prev, subject._id]
                              )
                            }
                            sx={{
                              cursor: 'pointer',
                              '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                '& .MuiTableCell-root': { color: 'white' }
                              }
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedSubjects.includes(subject._id)}
                                onChange={() =>
                                  setSelectedSubjects((prev) =>
                                    prev.includes(subject._id)
                                      ? prev.filter((id) => id !== subject._id)
                                      : [...prev, subject._id]
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>{subject.subjectCode}</TableCell>
                            <TableCell>{subject.subjectName}</TableCell>
                            <TableCell>{subject.department}</TableCell>
                            <TableCell>{subject.year}</TableCell>
                            <TableCell>{subject.semester}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Assignment Summary */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h6">Assignment Summary</Typography>
                    {selectedFaculty && (
                      <Typography color="text.secondary">
                        Faculty: {selectedFaculty.name} (
                        {selectedFaculty.department})
                      </Typography>
                    )}
                    {selectedSubjects.length > 0 && (
                      <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                        {selectedSubjects.map((id) => {
                          const subject = subjects.find((s) => s._id === id);
                          return (
                            <Chip
                              key={id}
                              label={subject?.subjectName}
                              onDelete={() =>
                                setSelectedSubjects((prev) =>
                                  prev.filter((sid) => sid !== id)
                                )
                              }
                              color="primary"
                              size="small"
                            />
                          );
                        })}
                      </Stack>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAssignOneToMany}
                    disabled={!selectedFaculty || selectedSubjects.length === 0}
                  >
                    Assign Subjects
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              One Subject → Many Faculty (Work in Progress)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              UI and logic can be reused from the above section.
            </Typography>
          </Paper>
        )}
      </Container>
    </AdminLayout>
  );
};

export default AdminAssignSubject;
