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

      localStorage.setItem("adminToken", token);
      authToken(token);

      const decoded = jwtDecode(token);
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
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "An error occurred" },
      });
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

// Admissions (Admin)
const adminAdmissionsListHelper = (data) => ({ type: "ADMIN_ADMISSIONS_LIST", payload: data });
const adminAdmissionsUpdateHelper = (data) => ({ type: "ADMIN_ADMISSIONS_UPDATE", payload: data });

export const adminListAdmissions = (status) => {
  return async (dispatch) => {
    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : "";
      const { data } = await api.get(`/api/admin/admissions${query}`);
      dispatch(adminAdmissionsListHelper(data.result));
    } catch (err) {
      dispatch({ type: SET_ERRORS, payload: err.response?.data || { message: "Failed to fetch applications" } });
    }
  };
};

export const adminApproveAdmission = (applicationId, note) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post(`/api/admin/admissions/${applicationId}/approve`, { note });
      dispatch(adminAdmissionsUpdateHelper(data.result));
    } catch (err) {
      dispatch({ type: SET_ERRORS, payload: err.response?.data || { message: "Failed to approve application" } });
    }
  };
};

export const adminRejectAdmission = (applicationId, note) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post(`/api/admin/admissions/${applicationId}/reject`, { note });
      dispatch(adminAdmissionsUpdateHelper(data.result));
    } catch (err) {
      dispatch({ type: SET_ERRORS, payload: err.response?.data || { message: "Failed to reject application" } });
    }
  };
};
