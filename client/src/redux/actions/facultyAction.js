import api from "../../config/api";
import authToken from "../utils/authToken";
import { jwtDecode } from "jwt-decode";
import {
  SET_FACULTY,
  SET_ERRORS,
  SET_FLAG,
  SET_ERRORS_HELPER,
} from "../actionTypes";

const setFaculty = (data) => {
  return {
    type: SET_FACULTY,
    payload: data,
  };
};

const fetchStudentsHelper = (data) => {
  return {
    type: "FETCH_STUDENTS",
    payload: data,
  };
};

const subjectCodeListHelper = (data) => {
  return {
    type: "GET_SUBJECTCODE_LIST",
    payload: data,
  };
};

export const facultyLogin = (credentials) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post("/api/faculty/login", credentials);
      const { token } = data;

      // FIXED: Strip "Bearer " prefix if present before storing
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      localStorage.setItem("facultyToken", cleanToken);
      authToken(cleanToken);

      const decoded = jwtDecode(cleanToken);
      dispatch(setFaculty(decoded));
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "An error occurred" },
      });
    }
  };
};

export const facultyUpdatePassword = (passwordData) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post(
        "/api/faculty/updatePassword",
        passwordData
      );
      alert("Password Updated Successfully");
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "An error occurred" },
      });
    }
  };
};

export const getOTPFaculty = (email) => {
  return async (dispatch) => {
    try {
      await api.post("/api/faculty/forgotPassword", email);
      alert("OTP sent to your email");
      dispatch({ type: SET_FLAG });
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "An error occurred" },
      });
    }
  };
};

export const submitOTPFaculty = (credentials) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post("/api/faculty/postOTP", credentials);
      alert("Password Updated, kindly login with updated password");
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "An error occurred" },
      });
    }
  };
};

export const fetchStudents = (department, year, section) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post("/api/faculty/fetchStudents", {
        department,
        year,
        section,
      });
      dispatch(fetchStudentsHelper(data.result));
      dispatch(subjectCodeListHelper(data.subjectCode));
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "An error occurred" },
      });
    }
  };
};

const facultyUpdateProfileFlag = (data) => {
  return {
    type: "FACULTY_UPDATE_PROFILE_FLAG",
    payload: data,
  };
};

export const facultyUpdate = (updatedData) => {
  return async (dispatch) => {
    try {
      const { data } = await api.put(
        "/api/faculty/updateProfile",
        updatedData
      );
      dispatch(facultyUpdateProfileFlag(true));
    } catch (err) {
      alert.error("Error in updating faculty");
    }
  };
};

export const markAttendance = (
  selectedStudents,
  subjectCode,
  department,
  year,
  section,
  date
) => {
  return async (dispatch) => {
    try {
      console.log('Redux: Sending attendance request:', {
        selectedStudents,
        subjectCode,
        department,
        year,
        section,
        date
      });
      
      const response = await api.post("/api/faculty/markAttendance", {
        selectedStudents,
        subjectCode,
        department,
        year,
        section,
        date,
      });
      
      console.log('Redux: Attendance response received:', response.data);
      
      dispatch({
        type: "HELPER",
        payload: true,
      });
      
      return { payload: response.data };
    } catch (err) {
      console.error('Redux: Error in markAttendance:', err);
      console.error('Redux: Error response:', err.response?.data);
      return { 
        error: err.response || { data: { message: 'Failed to mark attendance' } } 
      };
    }
  };
};

export const uploadMarks = (
  subjectCode,
  exam,
  totalMarks,
  marks,
  department,
  year,
  section
) => {
  return async (dispatch) => {
    try {
      await api.post("/api/faculty/uploadMarks", {
        subjectCode,
        exam,
        totalMarks,
        marks,
        department,
        year,
        section,
      });
      // alert("Marks uploaded successfully");
      dispatch({
        type: "HELPER",
        payload: true,
      });
    } catch (err) {
      dispatch({
        type: SET_ERRORS_HELPER,
        payload: err.response?.data || { message: "An error occurred" },
      });
    }
  };
};

export const fetchSubjects = (department, year) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post("/api/faculty/fetchStudents", {
        department,
        year,
        section: "A" // Default section, we only need subjects
      });
      dispatch(subjectCodeListHelper(data.subjectCode));
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "Failed to fetch subjects" },
      });
    }
  };
};

export const getAllSubjects = () => {
  return async (dispatch) => {
    try {
      const { data } = await api.get("/api/faculty/getAllSubjects");
      // Convert to subject codes for compatibility
      const subjectCodes = data.allSubjects.map(subject => subject.subjectCode);
      dispatch(subjectCodeListHelper(subjectCodes));
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "Failed to fetch all subjects" },
      });
    }
  };
};

export const setFacultyUser = (data) => {
  return {
    type: SET_FACULTY,
    payload: data,
  };
};

export const facultyLogout = () => (dispatch) => {
  // Remove token from localStorage
  localStorage.removeItem("facultyToken");
  // Remove auth header for future requests
  authToken(false);
  // Set current user to {} which will set isAuthenticated to false
  dispatch(setFaculty({}));
};
