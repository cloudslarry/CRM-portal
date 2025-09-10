import api from "../../config/api";
import authToken from "../utils/authToken";
import { jwtDecode } from "jwt-decode";
import {
  SET_STUDENT,
  SET_ERRORS_HELPER,
  SET_ERRORS,
  STUDENT_UPDATE_PASSWORD,
  SET_OTP,
  SET_FLAG,
} from "../actionTypes";

export const chatHistory = (data) => {
  return {
    type: "SET_CHAT",
    payload: data,
  };
};

export const chatHelp = (data) => {
  return {
    type: "CHAT_HELPER",
    payload: data,
  };
};

export const getStudentByRegNumHelper = (data) => {
  return {
    type: "GET_STUDENT_BY_REG_NUM",
    payload: data,
  };
};

export const setStudent = (data) => {
  return {
    type: "SET_STUDENT",
    payload: data,
  };
};

const privateConversation = (data) => {
  return {
    type: "GET_PRIVATE_CONVERSATION",
    payload: data,
  };
};

const privateConversation2 = (data) => {
  return {
    type: "GET_PRIVATE_CONVERSATION2",
    payload: data,
  };
};

const newerChatsHelper = (data) => {
  return {
    type: "GET_NEWER_CHATS",
    payload: data,
  };
};

const previousChatsHelper = (data) => {
  return {
    type: "GET_PREVIOUS_CHATS",
    payload: data,
  };
};

const getAllSubjectsHelper = (data) => {
  console.log('StudentAction: Dispatching subjects data:', data);
  return {
    type: "GET_ALL_SUBJECTS",
    payload: data,
  };
};

const fetchAttendenceHelper = (data) => {
  return {
    type: "GET_ATTENDENCE",
    payload: data,
  };
};

const getMarksHelper = (data) => {
  console.log('StudentAction: Dispatching marks data:', data);
  return {
    type: "GET_MARKS",
    payload: data,
  };
};

export const studentLogin = (studentCredentials) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post(
        "/api/student/login",
        studentCredentials
      );
      const { token } = data;

      localStorage.setItem("studentToken", token);
      authToken(token);

      const decoded = jwtDecode(token);
      dispatch(setStudent(decoded));
    } catch (err) {
      dispatch({
        type: SET_ERRORS_HELPER,
        payload: err.response?.data || { message: "An error occurred" },
      });
    }
  };
};

export const studentUpdatePassword = (passwordData) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post(
        "/api/student/updatePassword",
        passwordData
      );
      //alert("Password Updated Successfully");
    } catch (err) {
      dispatch({
        type: SET_ERRORS_HELPER,
        payload: err.response?.data || { message: "An error occurred" },
      });
    }
  };
};

export const chatHelper = (name) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post("/api/student/getStudentByName", name);
      dispatch(chatHelp(data.result));
    } catch (err) {
      console.log("Error in getting recent messages");
    }
  };
};

export const getStudentByRegNum = (registrationNumber) => {
  return async (dispatch) => {
    try {
      // console.log(registrationNumber);
      const { data } = await api.post("/api/student/getStudentByRegNum", {
        registrationNumber,
      });
      dispatch(getStudentByRegNumHelper(data.result));
    } catch (err) {
      console.log(err);
    }
  };
};

export const getOTPStudent = (email) => {
  return async (dispatch) => {
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
};

export const submitOTPStudent = (credentials) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post("/api/student/postOTP", credentials);
      alert("Password updated. Please login again");
    } catch (err) {
      dispatch({
        type: SET_ERRORS,
        payload: err.response?.data || { message: "An error occurred" },
      });
    }
  };
};

export const sendMessage = (room, messageObj) => {
  return async () => {
    try {
      const { data } = await api.post(
        `/api/student/chat/${room}`,
        messageObj
      );
    } catch (err) {
      console.log("Error in sending message", err.message);
    }
  };
};

export const getPrivateConversation = (roomId) => {
  return async (dispatch) => {
    try {
      const { data } = await api.get(`/api/student/chat/${roomId}`);
      dispatch(privateConversation(data.result));
    } catch (err) {
      console.log("Error in sending message", err.message);
    }
  };
};

export const getPrivateConversation2 = (roomId) => {
  return async (dispatch) => {
    try {
      const { data } = await api.get(`/api/student/chat/${roomId}`);
      dispatch(privateConversation2(data.result));
    } catch (err) {
      console.log("Error in sending message", err.emssage);
    }
  };
};

export const previousChats = (senderName) => {
  return async (dispatch) => {
    try {
      const { data } = await api.get(
        `/api/student/chat/previousChats/${senderName}`
      );
      dispatch(previousChatsHelper(data.result));
    } catch (err) {
      console.log("Error in sending message", err.message);
    }
  };
};

export const newerChats = (receiverName) => {
  return async (dispatch) => {
    try {
      const { data } = await api.get(
        `/api/student/chat/newerChats/${receiverName}`
      );
      dispatch(newerChatsHelper(data.result));
    } catch (err) {
      console.log("Error in sending message", err.message);
    }
  };
};

export const studentUpdate = (updatedData) => {
  return async () => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await api.put(
        `/api/student/updateProfile`,
        updatedData,
        config
      );
    } catch (err) {
      console.log("Error in updating student info", err.message);
    }
  };
};

export const getAllSubjects = () => {
  return async (dispatch) => {
    try {
      console.log('StudentAction: Fetching all subjects...');
      const { data } = await api.get("/api/student/getAllSubjects");
      console.log('StudentAction: Subjects API response:', data);
      dispatch(getAllSubjectsHelper(data.result));
    } catch (err) {
      console.error("Error in getting subjects", err.message);
    }
  };
};

export const fetchAttendance = (date) => {
  return async (dispatch) => {
    try {
      const endpoint = date ? `/api/student/checkAttendance?date=${encodeURIComponent(date)}` : "/api/student/checkAttendance";
      const { data } = await api.get(endpoint);
      dispatch(fetchAttendenceHelper(data.result));
    } catch (err) {
      console.log("Error in fetching attendance", err.message);
    }
  };
};

export const getMarks = () => {
  return async (dispatch) => {
    try {
      console.log('StudentAction: Fetching marks...');
      const { data } = await api.get("/api/student/getMarks");
      console.log('StudentAction: Marks API response:', data);
      if (data && data.result) {
        dispatch(getMarksHelper(data.result));
      } else {
        console.log('StudentAction: No marks data received, dispatching empty object');
        dispatch(getMarksHelper({}));
      }
    } catch (err) {
      console.error("Error in getting marks", err.message);
      console.error("Error response:", err.response?.data);
      dispatch(getMarksHelper({}));
    }
  };
};

export const setStudentUser = (data) => {
  return {
    type: SET_STUDENT,
    payload: data,
  };
};

export const studentLogout = () => (dispatch) => {
  localStorage.removeItem("studentToken");
  authToken(false);
  dispatch(setStudent({}));
};

// New API actions for enhanced functionality
export const getDashboardData = () => {
  return async (dispatch) => {
    try {
      const { data } = await api.get("/api/student/dashboard");
      dispatch({
        type: "GET_DASHBOARD_DATA",
        payload: data.result
      });
    } catch (err) {
      console.log("Error in getting dashboard data", err.message);
    }
  };
};

export const getNotifications = () => {
  return async (dispatch) => {
    try {
      const { data } = await api.get("/api/student/notifications");
      dispatch({
        type: "GET_NOTIFICATIONS",
        payload: data.result
      });
    } catch (err) {
      console.log("Error in getting notifications", err.message);
    }
  };
};

export const markNotificationAsRead = (notificationId) => {
  return async (dispatch) => {
    try {
      await api.put(`/api/student/notifications/${notificationId}/read`);
      dispatch({
        type: "MARK_NOTIFICATION_READ",
        payload: notificationId
      });
    } catch (err) {
      console.log("Error in marking notification as read", err.message);
    }
  };
};

// Admissions
const admissionsListHelper = (data) => ({ type: "STUDENT_ADMISSIONS_LIST", payload: data });
const admissionsSubmitHelper = (data) => ({ type: "STUDENT_ADMISSIONS_SUBMIT_SUCCESS", payload: data });

export const studentSubmitAdmission = (form) => {
  return async (dispatch) => {
    try {
      const { data } = await api.post("/api/student/admissions", form);
      dispatch(admissionsSubmitHelper(data.result));
    } catch (err) {
      dispatch({ type: SET_ERRORS_HELPER, payload: err.response?.data || { message: "Failed to submit application" } });
    }
  };
};

export const studentListAdmissions = () => {
  return async (dispatch) => {
    try {
      const { data } = await api.get("/api/student/admissions");
      dispatch(admissionsListHelper(data.result));
    } catch (err) {
      dispatch({ type: SET_ERRORS_HELPER, payload: err.response?.data || { message: "Failed to load applications" } });
    }
  };
};