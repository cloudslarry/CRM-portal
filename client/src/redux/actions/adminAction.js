import api from "../../config/api";
import authToken from "../utils/authToken";
import { jwtDecode } from "jwt-decode";
import { SET_ADMIN, SET_ERRORS, GET_SUBJECTS } from "../actionTypes";

const setAdmin = (data) => {
  return {
    type: SET_ADMIN,
    payload: data,
  };
};

const adminAddFacultyFlag = (data) => {
  return {
    type: "ADMIN_ADD_FACULTY_FLAG",
    payload: data,
  };
};

const adminAddStudentFlag = (data) => {
  return {
    type: "ADMIN_ADD_STUDENT_FLAG",
    payload: data,
  };
};

const adminAddSubjectFlag = (data) => {
  return {
    type: "ADMIN_ADD_SUBJECT_FLAG",
    payload: data,
  };
};

const adminAddAdminFlag = (data) => {
  return {
    type: "ADMIN_ADD_ADMIN_FLAG",
    payload: data,
  };
};

const getSubjectsHelper = (data) => {
  return {
    type: GET_SUBJECTS,
    payload: data,
  };
};

export const getAllSubjects = () => async (dispatch) => {
  try {
    const { data } = await api.post('/api/admin/getAllSubject');
    console.log('Subject data from API:', data);
    dispatch(getSubjectsHelper(data.result));
    return {
      success: true,
      result: data.result
    };
  } catch (error) {
    dispatch({
      type: SET_ERRORS,
      payload: error.response.data
    });
    return {
      success: false,
      error: error.response.data
    };
  }
};

export const assignSubjectToFaculty = (facultyId, subjects) => async (dispatch) => {
  try {
    const { data } = await api.post('/api/admin/assign-subject', { facultyId, subjects });
    console.log('Dispatching faculty data:', data);
      return {
        type: "GET_ALL_FACULTY",
        payload: data,
      };

    if (data.success) {
      return {
        success: true,
        result: data.result
      };
    }
    return {
      success: false,
      error: data
    };
  } catch (error) {
    console.error('Error assigning subjects:', error);
    dispatch({
      type: SET_ERRORS,
      payload: error.response.data
    });
    return {
      success: false,
      error: error.response.data
    };
  }
};

const adminGetAllFacultyHelper = (data) => {
  console.log('Dispatching faculty data:', data);
  return {
    type: "GET_ALL_FACULTY",
    payload: data,
  };
};

const adminGetAllStudentHelper = (data) => {
  console.log('Dispatching student data:', data);
  return { 
    type: "GET_ALL_STUDENT",
    payload: data,
  };
};

const adminGetAllApplicantsHelper = (data) => {
  return {
    type: "GET_ALL_APPLICANTS",
    payload: data,
  };
};

const adminGetAllSubjectHelper = (data) => {
  return {
    type: "GET_ALL_SUBJECT",
    payload: data,
  };
};

const getStatisticsHelper = (data) => {
  return {
    type: "GET_STATISTICS",
    payload: data,
  };
};

export const adminLogin = (credentials) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post("/api/admin/login", credentials);
      const { token } = data;

      // FIXED: Strip "Bearer " prefix if present before storing
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      localStorage.setItem("adminToken", cleanToken);
      authToken(cleanToken);

      const decoded = jwtDecode(cleanToken);
      dispatch(setAdmin(decoded));
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "An error occurred" },
      });
    }
  };
};

export const adminGetAllSubjects = () => {
  return async (dispatch) => {
    try {
      const { data } = await api.get("/api/admin/getSubjects");
      dispatch(getSubjectsHelper(data));
    } catch (err) {
      alert("Error in fetching subjects");
    }
  };
};

export const adminAddFaculty = (facultyCredential) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post(
        "/api/admin/addFaculty",
        facultyCredential
      );
      dispatch(adminAddFacultyFlag(true));
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "An error occurred" },
      });
    }
  };
};

export const adminAddStudent = (studentCredential) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post(
        "/api/admin/addStudent",
        studentCredential
      );
      dispatch(adminAddStudentFlag(true));
      return { success: true, data };
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "An error occurred" },
      });
      return { success: false, error: err.response?.data || { message: "An error occurred" } };
    }
  };
};

export const adminAddSubject = (subjectCredential) => {
  return async (dispatch) => {
    try {
      console.log('Adding subject with data:', subjectCredential);
      const { data } = await api.post(
        "/api/admin/addSubject",
        subjectCredential
      );
      console.log('Subject added successfully:', data);
      dispatch(adminAddSubjectFlag(true));
      return { success: true, data };
    } catch (err) {
      console.log('Error adding subject:', err.response?.data || err.message);
      const errorData = err.response?.data || { message: "An error occurred" };
      dispatch({
        type: SET_ERRORS,
        payload: errorData,
      });
      return { success: false, error: errorData };
    }
  };
};

export const adminAddAdmin = (adminCredentails) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post(
        "/api/admin/addStudent",
        adminCredentails
      );
      dispatch(adminAddAdminFlag(true));
      alert("Admin Added Successfully");
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "An error occurred" },
      });
    }
  };
};

export const adminGetAllFaculty = () => {
  return async (dispatch) => {
    try {
      console.log('Fetching all faculty...');
      const { data } = await api.post("/api/admin/getAllFaculty");
      console.log('Faculty API response:', data);
      dispatch(adminGetAllFacultyHelper(data?.result ?? []));
    } catch (err) {
      console.error('Faculty fetch error:', err);
      // If API returns 404 or no result, normalize to empty list to avoid stale UI
      if (err.response && (err.response.status === 404 || err.response.status === 204)) {
        dispatch(adminGetAllFacultyHelper([]));
      } else {
        dispatch({
          type: SET_ERRORS,
          payload: err.response?.data || { message: "Failed to fetch faculty" },
        });
      }
    }
  };
};

export const adminViewFaculty = (id) => {
  return async (dispatch) => {
    try {
      const { data } = await api.get(`/api/admin/faculty/${id}`);
      return { payload: data.result };
    } catch (err) {
      return { error: err.response?.data || { message: "Failed to fetch faculty" } };
    }
  };
};

export const adminUpdateFaculty = (id, updates) => {
  return async (dispatch) => {
    try {
      const { data } = await api.put(`/api/admin/faculty/${id}`, updates);
      await dispatch(adminGetAllFaculty());
      return { payload: data.result };
    } catch (err) {
      return { error: err.response?.data || { message: "Failed to update faculty" } };
    }
  };
};

export const adminDeleteFaculty = (id) => {
  return async (dispatch) => {
    try {
      await api.delete(`/api/admin/faculty/${id}`);
      await dispatch(adminGetAllFaculty());
      return { payload: true };
    } catch (err) {
      return { error: err.response?.data || { message: "Failed to delete faculty" } };
    }
  };
};

export const adminBulkDeleteFaculty = (ids) => {
  return async (dispatch) => {
    try {
      await api.post(`/api/admin/faculty/bulk-delete`, { ids });
      await dispatch(adminGetAllFaculty());
      return { payload: true };
    } catch (err) {
      return { error: err.response?.data || { message: "Failed to delete selected faculty" } };
    }
  };
};

export const adminGetAllStudent = () => {
  return async (dispatch) => {
    try {
      console.log('Fetching all students...');
      const { data } = await api.post("/api/admin/getAllStudent");
      console.log('Student API response:', data);
      dispatch(adminGetAllStudentHelper(data?.result ?? []));
    } catch (err) {
      console.error('Student fetch error:', err);
      if (err.response && (err.response.status === 404 || err.response.status === 204)) {
        dispatch(adminGetAllStudentHelper([]));
      } else {
        dispatch({
          type: SET_ERRORS,
          payload: err.response?.data || { message: "Failed to fetch students" },
        });
      }
    }
  };
};

export const adminListApplicants = (q = "") => {
  return async (dispatch) => {
    try {
      const { data } = await api.post("/api/admin/getAllApplicants", q ? { q } : {});
      dispatch(adminGetAllApplicantsHelper(data?.result ?? []));
    } catch (err) {
      if (err.response && (err.response.status === 404 || err.response.status === 204)) {
        dispatch(adminGetAllApplicantsHelper([]));
      } else {
        dispatch({
          type: SET_ERRORS,
          payload: err.response?.data || { message: "Failed to fetch applicants" },
        });
      }
    }
  };
};

export const adminAddApplicant = (applicantData) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post("/api/admin/addApplicant", applicantData);
      // Refresh the applicants list after adding
      dispatch(adminListApplicants());
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data || { message: "Failed to add applicant" } 
      };
    }
  };
};

// Applicant status updates
export const adminUpdateApplicantStatus = (applicantId, status, note) => {
  return async (dispatch) => {
    try {
      const { data } = await api.put(`/api/admin/applicant/${applicantId}/status`, { status, note });
      // Optimistically refresh list
      await dispatch(adminListApplicants());
      return { success: true, data: data.result };
    } catch (err) {
      return { success: false, error: err.response?.data || { message: 'Failed to update status' } };
    }
  };
};

export const adminApproveApplicant = (applicantId, note) => adminUpdateApplicantStatus(applicantId, 'approved', note);
export const adminRejectApplicant = (applicantId, note) => adminUpdateApplicantStatus(applicantId, 'rejected', note);
export const adminPendingApplicant = (applicantId, note) => adminUpdateApplicantStatus(applicantId, 'pending', note);

export const adminGetApplicantById = (id) => {
  return async (dispatch) => {
    try {
      const { data } = await api.get(`/api/admin/applicant/${id}`);
      return { success: true, data: data.result };
    } catch (err) {
      return { success: false, error: err.response?.data || { message: 'Failed to fetch applicant' } };
    }
  };
};

// Optionally refresh seen state for a single id without navigating
export const adminMarkApplicantSeen = (id) => {
  return async (dispatch) => {
    try {
      const { data } = await api.get(`/api/admin/applicant/${id}`);
      await dispatch(adminListApplicants());
      return { success: true, data: data.result };
    } catch (err) {
      return { success: false };
    }
  };
};

// Applications management
export const adminFetchApplications = (status) => {
  return async (dispatch) => {
    try {
      const url = status ? `/api/admin/applications?status=${encodeURIComponent(status)}` : `/api/admin/applications`;
      const { data } = await api.get(url);
      return { payload: data.result };
    } catch (err) {
      return { error: err.response?.data || { message: "Failed to fetch applications" } };
    }
  };
};

export const adminApproveApplication = (applicationId, note) => {
  return async (dispatch) => {
    try {
      const { data } = await api.put(`/api/admin/applications/${applicationId}/approve`, { note });
      return { payload: data.result };
    } catch (err) {
      return { error: err.response?.data || { message: "Failed to approve application" } };
    }
  };
};

export const adminRejectApplication = (applicationId, note) => {
  return async (dispatch) => {
    try {
      const { data } = await api.put(`/api/admin/applications/${applicationId}/reject`, { note });
      return { payload: data.result };
    } catch (err) {
      return { error: err.response?.data || { message: "Failed to reject application" } };
    }
  };
};

export const adminDeleteStudent = (id) => {
  return async (dispatch) => {
    try {
      await api.delete(`/api/admin/student/${id}`);
      await dispatch(adminGetAllStudent());
      return { payload: true };
    } catch (err) {
      return { error: err.response?.data || { message: "Failed to delete student" } };
    }
  };
};

export const adminGetAllSubject = () => {
  return async (dispatch) => {
    try {
      console.log('Fetching all subjects...');
      // Server expects POST /getAllSubject (singular)
      const { data } = await api.post("/api/admin/getAllSubject");
      console.log('Subjects fetched successfully:', data);
      dispatch(adminGetAllSubjectHelper(data?.result ?? []));
      return { success: true, data };
    } catch (err) {
      console.log('Error fetching subjects:', err.response?.data || err.message);
      if (err.response && (err.response.status === 404 || err.response.status === 204)) {
        dispatch(adminGetAllSubjectHelper([]));
        return { success: true, data: { result: [] } };
      }
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "Failed to fetch subjects" },
      });
      return { success: false, error: err.response?.data || err.message };
    }
  };
};

export const getStatistics = () => {
  return async (dispatch) => {
    try {
      const { data } = await api.get("/api/admin/statistics");
      console.log("Statistics API Response:", data);
      dispatch(getStatisticsHelper(data.statistics));
    } catch (err) {
      console.log("Statistics API Error:", err);
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "Failed to fetch statistics" },
      });
    }
  };
};

export const adminUpdatePassword = (passwordData) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post("/api/admin/updatePassword", passwordData);
      return data;
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "Failed to update password" },
      });
      throw err;
    }
  };
};

export const setAdminUser = (data) => {
  return {
    type: SET_ADMIN,
    payload: data,
  };
};

export const adminLogout = () => (dispatch) => {
  // Remove token from localStorage
  localStorage.removeItem("adminToken");
  // Remove auth header for future requests
  authToken(false);
  // Set current user to {} which will set isAuthenticated to false
  dispatch(setAdmin({}));
};

// Assign student to hostel
export const assignStudentToHostel = (studentId, roomId) => async (dispatch) => {
  try {
    const { data } = await api.post('/api/admin/assign-student-to-hostel', {
      studentId,
      roomId
    });
    
    if (data.success) {
      return { success: true, data: data.result };
    } else {
      return { success: false, error: data.message };
    }
  } catch (err) {
    console.error('Error assigning student to hostel:', err);
    return { 
      success: false, 
      error: err.response?.data?.message || 'Failed to assign student to hostel' 
    };
  }
};