import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import authToken from "./redux/utils/authToken";
import store from "./redux/store";

import { setFacultyUser, facultyLogout } from "./redux/actions/facultyAction";
import {
  setAdminUser,
  adminLogout,
  adminGetAllStudent,
} from "./redux/actions/adminAction";
import { setStudentUser, studentLogout } from "./redux/actions/studentAction";

import {
  FacultyStudentLogin,
  AdminLogin,
  AdminDashboard,
  AdminNotifications,
  AdminGetFaculty,
  AdminGetStudents,
  AdminGetSubjects,
  AdminAddFaculty,
  AdminAddStudent,
  AdminAddSubject,
  AdminAddDepartment,
  AdminGetDepartments,
  AdminAssignHostel,
  AdminSettings,
  AdminApplicantDetails,
  FacultySettings,
  AdminAssignSubject,
  StudentSettings,
  FacultyDashboard,
  FacultySubjectList,
  FacultyUploadMarks,
  FacultyAttendance,
  StudentDashboard,
  StudentSubjectList,
  StudentPerformance,
  StudentAttendance,
  StudentUpdateProfile,
  StudentUpdatePassword,
  StudentSearch,
  StudentLibrary,
  StudentDetails,
  FacultyUpdateProfile,
  FacultyUpdatePassword,
  ForgotPassword,
  Chat,
  StudentChats,
  StudentNotifications,
  FacultyNotifications,
  FacultyLibrary,
  FacultyLibraryForm,
  // Admin Hostel Management
  HostelList,
  HostelForm,
  RoomList,
  AllRoomsList,
  RoomForm,
  AddRoom,
  AssignStudentModal,
  HostelFees,
  AdminCollegeFees,
  HostelNotices,
  HostelReports,
  // Student Hostel Management
  MyHostel,
  StudentHostelNotices,
  MyHostelFees,
  StudentCollegeFees,
  //applicant
  ApplicantDashboard,
  ApplicantApply,
  ApplicantSettings,
  ApplicantStatusPage,
  ApplicantStatus,
  ApplicantCollegeInfo,
  ApplicantCourses,
  ApplicantAuth,
  ApplicantLogin,
  ApplicantRegistration,
  PublicAdmissionApply,
  Courses,
  CollegeInfo,
  AdminApplicants,
  AdminAddApplicant,
  // Form Builder
  AdminFormBuilder,
  AdminFormCreate,
  AdminFormAnalytics,
  FacultyFormBuilder,
  FacultyFormCreate,
  FacultyFormAnalytics,
  FacultyFormView,
  PublicFormView,
  StudentEvents,
} from "./pages";

//Handle JWT Token with validation
const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

if (window.localStorage.facultyToken) {
  try {
    // FIXED: Strip "Bearer " prefix if present before using
    const cleanToken = localStorage.facultyToken.startsWith('Bearer ') ? localStorage.facultyToken.substring(7) : localStorage.facultyToken;
    
    // Validate JWT format
    if (!jwtPattern.test(cleanToken)) {
      console.error('Invalid faculty token format, clearing...');
      localStorage.removeItem('facultyToken');
    } else {
      authToken(cleanToken);
      const decoded = jwtDecode(cleanToken);
      store.dispatch(setFacultyUser(decoded));

      //Check if token expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        store.dispatch(facultyLogout());
        window.location.href = "/";
      }
    }
  } catch (error) {
    console.error('Error processing faculty token:', error);
    localStorage.removeItem('facultyToken');
  }
} else if (window.localStorage.studentToken) {
  try {
    // FIXED: Strip "Bearer " prefix if present before using
    const cleanToken = localStorage.studentToken.startsWith('Bearer ') ? localStorage.studentToken.substring(7) : localStorage.studentToken;
    
    // Validate JWT format
    if (!jwtPattern.test(cleanToken)) {
      console.error('Invalid student token format, clearing...');
      localStorage.removeItem('studentToken');
    } else {
      authToken(cleanToken);
      const decoded = jwtDecode(cleanToken);
      store.dispatch(setStudentUser(decoded));

      //Check if token expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        store.dispatch(studentLogout());
        window.location.href = "/";
      }
    }
  } catch (error) {
    console.error('Error processing student token:', error);
    localStorage.removeItem('studentToken');
  }
} else if (window.localStorage.adminToken) {
  try {
    // FIXED: Strip "Bearer " prefix if present before using
    const cleanToken = localStorage.adminToken.startsWith('Bearer ') ? localStorage.adminToken.substring(7) : localStorage.adminToken;
    
    // Validate JWT format
    if (!jwtPattern.test(cleanToken)) {
      console.error('Invalid admin token format, clearing...');
      localStorage.removeItem('adminToken');
    } else {
      authToken(cleanToken);
      const decoded = jwtDecode(cleanToken);
      store.dispatch(setAdminUser(decoded));

      //Check if token expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        store.dispatch(adminLogout());
        window.location.href = "/";
      }
    }
  } catch (error) {
    console.error('Error processing admin token:', error);
    localStorage.removeItem('adminToken');
  }
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route exact path="/" element={<FacultyStudentLogin />} />
          <Route exact path="/admin/login" element={<AdminLogin />} />
          <Route exact path="/faculty" element={<FacultyDashboard />} />
          <Route exact path="/home" element={<StudentDashboard />} />
          <Route exact path="/admin" element={<AdminDashboard />} />
          {/* Public Admissions & Applicant auth */}
          <Route exact path="/admissions/apply" element={<PublicAdmissionApply />} />
          <Route exact path="/admissions/status" element={<ApplicantStatus />} />
          <Route exact path="/courses" element={<Courses />} />
          <Route exact path="/college" element={<CollegeInfo />} />
          <Route exact path="/applicant/auth" element={<ApplicantAuth />} />
          <Route exact path="/applicant/login" element={<ApplicantLogin />} />
          <Route exact path="/applicant/register" element={<ApplicantRegistration />} />
          <Route exact path="/admin/applicants" element={<AdminApplicants />} />
          <Route exact path="/admin/add-applicant" element={<AdminAddApplicant />} />
          <Route exact path="/admin/faculties" element={<AdminGetFaculty />} />
          <Route exact path="/admin/students" element={<AdminGetStudents />} />
          <Route exact path="/admin/subjects" element={<AdminGetSubjects />} />
          <Route
            exact
            path="/admin/add/faculties"
            element={<AdminAddFaculty />}
          />
          <Route
            exact
            path="/admin/add/students"
            element={<AdminAddStudent />}
          />
          <Route
            exact
            path="/admin/add/subjects"
            element={<AdminAddSubject />}
          />
          <Route exact path="/student/notifications" element={<StudentNotifications />} />
          <Route exact path="/admin/notifications" element={<AdminNotifications />} />
          <Route exact path="/admin/applications" element={<AdminApplicants />} />
          <Route exact path="/faculty/notifications" element={<FacultyNotifications />} />
          <Route exact path="/faculty/subjects" element={<FacultySubjectList />} />
          <Route
            exact
            path="/admin/departments"
            element={<AdminGetDepartments />}
          />
          <Route
            exact
            path="/admin/add/department"
            element={<AdminAddDepartment />}
          />
          <Route
            exact
            path="/admin/assign-subject"
            element={<AdminAssignSubject />}
          />
          <Route
            exact
            path="/admin/assign-hostel"
            element={<AdminAssignHostel />}
          />
          <Route exact path="/admin/applicants/:id" element={<AdminApplicantDetails />} />
          <Route
            exact
            path="/admin/settings"
            element={<AdminSettings />}
          />
          {/* Admin Hostel Management Routes */}
          <Route exact path="/admin/hostels" element={<HostelList />} />
          <Route exact path="/admin/hostels/add" element={<HostelForm />} />
          <Route exact path="/admin/hostels/:hostelId/edit" element={<HostelForm />} />
          <Route exact path="/admin/hostels/rooms" element={<AllRoomsList />} />
          <Route exact path="/admin/hostels/rooms/add" element={<AddRoom />} />
          <Route exact path="/admin/hostels/:hostelId/rooms" element={<RoomList />} />
          <Route exact path="/admin/hostels/:hostelId/rooms/add" element={<RoomForm />} />
          <Route exact path="/admin/hostels/:hostelId/rooms/edit/:roomId" element={<RoomForm />} />
          <Route exact path="/admin/hostels/:hostelId/rooms/:roomId/assign" element={<AssignStudentModal />} />
          <Route exact path="/admin/hostels/fees" element={<HostelFees />} />
          <Route exact path="/admin/fees/hostel" element={<HostelFees />} />
          <Route exact path="/admin/fees/college" element={<AdminCollegeFees />} />
          <Route exact path="/admin/hostels/notices" element={<HostelNotices />} />
          <Route exact path="/admin/hostels/reports" element={<HostelReports />} />
          <Route exact path="/admin/hostels/:hostelId/reports" element={<HostelReports />} />
          <Route
            exact
            path="/faculty/settings"
            element={<FacultySettings />}
          />
          <Route
            exact
            path="/student/settings"
            element={<StudentSettings />}
          />
          {/* Student Hostel Management Routes */}
          <Route exact path="/student/hostel" element={<MyHostel />} />
          <Route exact path="/student/hostel/notices" element={<StudentHostelNotices />} />
          <Route exact path="/student/hostel/fees" element={<MyHostelFees />} />
          <Route exact path="/student/college/fees" element={<StudentCollegeFees />} />
          <Route
            exact
            path="/student/subjects"
            element={<StudentSubjectList />}
          />
          <Route
            exact
            path="/student/performance"
            element={<StudentPerformance />}
          />
          <Route
            exact
            path="/student/attendance"
            element={<StudentAttendance />}
          />
          <Route exact path="/student/library" element={<StudentLibrary />} />
          <Route exact path="/student/search" element={<StudentSearch />} />
          <Route exact path="/student/events" element={<StudentEvents />} />
          <Route exact path="/student/chatList" element={<StudentChats />} />
          <Route exact path="/student/chat" element={<Chat />} />
          <Route
            exact
            path="/profile/:registrationNumber"
            element={<StudentDetails />}
          />
          <Route
            exact
            path="/student/update"
            element={<StudentUpdateProfile />}
          />
          <Route
            exact
            path="/faculty/update"
            element={<FacultyUpdateProfile />}
          />
          <Route exact path="/faculty/marks" element={<FacultyUploadMarks />} />
          <Route
            exact
            path="/faculty/attendance"
            element={<FacultyAttendance />}
          />
          <Route exact path="/faculty/library" element={<FacultyLibrary />} />
          <Route exact path="/faculty/library/new" element={<FacultyLibraryForm />} />
          <Route exact path="/faculty/library/edit/:id" element={<FacultyLibraryForm />} />
          <Route
            exact
            path="/student/updatePassword"
            element={<StudentUpdatePassword />}
          />
          <Route
            exact
            path="/faculty/updatePassword"
            element={<FacultyUpdatePassword />}
          />
          <Route
            exact
            path="/forgotPassword/:user"
            element={<ForgotPassword />}
          />
          <Route exact path="/chat/:room" element={<Chat />} />
          {/* Applicant Routes */}
          <Route exact path="/applicant/dashboard" element={<ApplicantDashboard />} />
          <Route exact path="/applicant/apply" element={<ApplicantApply />} />
          <Route exact path="/applicant/settings" element={<ApplicantSettings />} />
          <Route exact path="/applicant/status" element={<ApplicantStatusPage />} />
          <Route exact path="/applicant/courses" element={<ApplicantCourses />} />
          <Route exact path="/applicant/college-info" element={<ApplicantCollegeInfo />} />
          
          {/* Form Builder Routes */}
          <Route exact path="/admin/forms" element={<AdminFormBuilder />} />
          <Route exact path="/admin/forms/create" element={<AdminFormCreate />} />
          <Route exact path="/admin/forms/edit/:id" element={<AdminFormCreate />} />
          <Route exact path="/admin/forms/analytics/:id" element={<AdminFormAnalytics />} />
          <Route exact path="/faculty/forms" element={<FacultyFormBuilder />} />
          <Route exact path="/faculty/forms/create" element={<FacultyFormCreate />} />
          <Route exact path="/faculty/forms/edit/:id" element={<FacultyFormCreate />} />
          <Route exact path="/faculty/forms/view/:id" element={<FacultyFormView />} />
          <Route exact path="/faculty/forms/analytics/:id" element={<FacultyFormAnalytics />} />
          
          {/* Public Form Routes */}
          <Route exact path="/forms/:id" element={<PublicFormView />} />
        </Routes>
        {/* Removed fallback 404 route */}
      </Router>
    </>
  );
}

export default App;
