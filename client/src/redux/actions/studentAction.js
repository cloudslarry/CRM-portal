import api from "../../config/api";
import authToken from "../utils/authToken";
import { jwtDecode } from "jwt-decode";
import {
  SET_STUDENT,
  SET_ERRORS_HELPER,
  SET_ERRORS,
  SET_FLAG,
} from "../actionTypes";

// This is a plain action creator, useful in multiple places
export const setStudentUser = (data) => {
  return {
    type: SET_STUDENT,
    payload: data,
  };
};

export const studentLogin = (studentCredentials) => async (dispatch) => {
  try {
    const { data } = await api.post("/api/student/login", studentCredentials);
    const { token } = data;
    
    // FIXED: Strip "Bearer " prefix if present before storing
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    localStorage.setItem("studentToken", cleanToken);
    authToken(cleanToken);
    const decoded = jwtDecode(cleanToken);
    dispatch(setStudentUser(decoded)); // Using the action creator
  } catch (err) {
    dispatch({
      type: SET_ERRORS,
      payload: err.response?.data || { message: "Network Error" },
    });
  }
};

export const studentLogout = () => (dispatch) => {
  localStorage.removeItem("studentToken");
  authToken(false);
  dispatch(setStudentUser({})); // Using the action creator
};

export const studentUpdatePassword = (passwordData) => async (dispatch) => {
  try {
    await api.post("/api/student/updatePassword", passwordData);
  } catch (err) {
    dispatch({
      type: SET_ERRORS_HELPER,
      payload: err.response?.data || { message: "An error occurred" },
    });
  }
};

export const getStudentByRegNum = (registrationNumber) => async (dispatch) => {
  try {
    const { data } = await api.post("/api/student/getStudentByRegNum", {
      registrationNumber,
    });
    dispatch({ type: "GET_STUDENT_BY_REG_NUM", payload: data.result });
  } catch (err) {
    dispatch({
      type: SET_ERRORS,
      payload: err.response?.data || { message: "An error occurred" },
    });
  }
};

export const getAllSubjects = () => async (dispatch) => {
  try {
    const { data } = await api.get("/api/student/getAllSubjects");
    dispatch({ type: "GET_ALL_SUBJECTS", payload: data.result });
  } catch (err) {
    dispatch({
      type: SET_ERRORS,
      payload: err.response?.data || { message: "An error occurred" },
    });
  }
};

export const getMarks = () => async (dispatch) => {
  try {
    const { data } = await api.get("/api/student/getMarks");
    dispatch({ type: "GET_MARKS", payload: data.result || {} });
  } catch (err) {
    dispatch({
      type: SET_ERRORS,
      payload: err.response?.data || { message: "An error occurred" },
    });
  }
};

export const fetchAttendance = (date) => async (dispatch) => {
    try {
        const { data } = await api.get(`/api/student/checkAttendance${date ? `?date=${date}` : ''}`);
        dispatch({ type: "GET_ATTENDENCE", payload: data.result });
    } catch (err) {
        dispatch({
            type: SET_ERRORS,
            payload: err.response?.data || { message: "An error occurred" },
        });
    }
};

export const studentUpdate = (updatedData) => async (dispatch) => {
  try {
    const config = { headers: { "Content-Type": "multipart/form-data" } };
    await api.put(`/api/student/updateProfile`, updatedData, config);
  } catch (err) {
     dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "An error occurred" },
    });
  }
};

export const getOTPStudent = (email) => async (dispatch) => {
  try {
    await api.post("/api/student/forgotPassword", email);
    alert("OTP sent to your email");
    dispatch({ type: SET_FLAG });
  } catch (err) {
    dispatch({
      type: SET_ERRORS,
      payload: err.response?.data || { message: "An error occurred" },
    });
  }
};

export const submitOTPStudent = (credentials) => async (dispatch) => {
  try {
    await api.post("/api/student/postOTP", credentials);
    alert("Password updated. Please login again");
  } catch (err) {
    dispatch({
      type: SET_ERRORS,
      payload: err.response?.data || { message: "An error occurred" },
    });
  }
};

// --- RE-ADDED CHAT AND OTHER ACTIONS ---

export const sendMessage = (room, messageObj) => async (dispatch) => {
  try {
    await api.post(`/api/student/chat/${room}`, messageObj);
  } catch (err) {
    dispatch({
      type: SET_ERRORS,
      payload: err.response?.data || { message: "An error occurred" },
    });
  }
};

export const getPrivateConversation = (roomId) => async (dispatch) => {
  try {
    const { data } = await api.get(`/api/student/chat/${roomId}`);
    dispatch({ type: "GET_PRIVATE_CONVERSATION", payload: data.result });
  } catch (err) {
    dispatch({
      type: SET_ERRORS,
      payload: err.response?.data || { message: "An error occurred" },
    });
  }
};

// NOTE: getPrivateConversation2 was a duplicate and is not needed.
// If you need it for a special purpose, you can add it back here.

export const previousChats = (senderName) => async (dispatch) => {
  try {
    const { data } = await api.get(`/api/student/chat/previousChats/${senderName}`);
    dispatch({ type: "GET_PREVIOUS_CHATS", payload: data.result });
  } catch (err) {
    dispatch({
      type: SET_ERRORS,
      payload: err.response?.data || { message: "An error occurred" },
    });
  }
};

export const newerChats = (receiverName) => async (dispatch) => {
  try {
    const { data } = await api.get(`/api/student/chat/newerChats/${receiverName}`);
    dispatch({ type: "GET_NEWER_CHATS", payload: data.result });
  } catch (err) {
     dispatch({
      type: SET_ERRORS,
      payload: err.response?.data || { message: "An error occurred" },
    });
  }
};