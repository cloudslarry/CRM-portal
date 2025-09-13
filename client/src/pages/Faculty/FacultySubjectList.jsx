import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Container, Card, CardContent, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FacultyLayout from '../../components/FacultyLayout';

const FacultySubjectList = () => {
  const facultyStore = useSelector((store) => store.faculty);
  const faculty = facultyStore?.faculty?.faculty || {};
  const subjects = faculty?.subjects || [];
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const mapped = (subjects || []).map((s, idx) => ({
      id: idx + 1,
      code: s.subjectCode || s.code || s.subjectId || '-',
      name: s.subjectName || s.name || '-',
      year: s.year || '-',
      total: s.totalLectures || s.total || '-',
    }));
    setRows(mapped);
  }, [subjects]);

  const columns = useMemo(() => [
    { field: 'id', headerName: 'No.', flex: 0.3 },
    { field: 'code', headerName: 'Subject Code', flex: 1 },
    { field: 'name', headerName: 'Subject Name', flex: 1.2 },
    { field: 'year', headerName: 'Year', flex: 0.4 },
    { field: 'total', headerName: 'Total Hours', flex: 0.6 },
  ], []);

  if (!facultyStore?.isAuthenticated) {
    return null;
  }

  return (
    <FacultyLayout title="My Subjects">
      <Container maxWidth="lg">
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ height: 560, width: '100%' }}>
              <DataGrid rows={rows} columns={columns} pageSize={10} rowsPerPageOptions={[5,10,25]} disableSelectionOnClick sx={{ border: 0 }} />
            </Box>
          </CardContent>
        </Card>
      </Container>
    </FacultyLayout>
  );
};

export default FacultySubjectList;


