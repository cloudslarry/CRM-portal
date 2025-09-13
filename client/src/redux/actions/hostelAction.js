import { hostelApi } from "../../api/hostelApi";
import { SET_ERRORS } from "../actionTypes";

// Action Types
export const HOSTEL_ACTIONS = {
  // Hostel Management
  GET_HOSTELS: "GET_HOSTELS",
  GET_HOSTEL_BY_ID: "GET_HOSTEL_BY_ID",
  CREATE_HOSTEL: "CREATE_HOSTEL",
  UPDATE_HOSTEL: "UPDATE_HOSTEL",
  DELETE_HOSTEL: "DELETE_HOSTEL",
  
  // Room Management
  GET_ROOMS: "GET_ROOMS",
  CREATE_ROOM: "CREATE_ROOM",
  UPDATE_ROOM: "UPDATE_ROOM",
  DELETE_ROOM: "DELETE_ROOM",
  ASSIGN_STUDENT: "ASSIGN_STUDENT",
  UNASSIGN_STUDENT: "UNASSIGN_STUDENT",
  
  // Fee Management
  GET_FEES: "GET_FEES",
  CREATE_FEE: "CREATE_FEE",
  UPDATE_FEE: "UPDATE_FEE",
  MARK_FEE_PAID: "MARK_FEE_PAID",
  GET_FEE_SUMMARY: "GET_FEE_SUMMARY",
  
  // Notice Management
  GET_NOTICES: "GET_NOTICES",
  CREATE_NOTICE: "CREATE_NOTICE",
  UPDATE_NOTICE: "UPDATE_NOTICE",
  DELETE_NOTICE: "DELETE_NOTICE",
  
  // Reports
  GET_OCCUPANCY_REPORT: "GET_OCCUPANCY_REPORT",
  GET_FEE_REPORT: "GET_FEE_REPORT",
  GET_COMPREHENSIVE_REPORT: "GET_COMPREHENSIVE_REPORT",
  
  // Loading States
  SET_LOADING: "SET_HOSTEL_LOADING",
  SET_ERROR: "SET_HOSTEL_ERROR",
};

// Helper functions
const setHostels = (data) => ({
  type: HOSTEL_ACTIONS.GET_HOSTELS,
  payload: data,
});

const setHostelById = (data) => ({
  type: HOSTEL_ACTIONS.GET_HOSTEL_BY_ID,
  payload: data,
});

const setRooms = (data) => ({
  type: HOSTEL_ACTIONS.GET_ROOMS,
  payload: data,
});

const setFees = (data) => ({
  type: HOSTEL_ACTIONS.GET_FEES,
  payload: data,
});

const setNotices = (data) => ({
  type: HOSTEL_ACTIONS.GET_NOTICES,
  payload: data,
});

const setLoading = (loading) => ({
  type: HOSTEL_ACTIONS.SET_LOADING,
  payload: loading,
});

const setError = (error) => ({
  type: HOSTEL_ACTIONS.SET_ERROR,
  payload: error,
});

// Hostel Management Actions
export const fetchHostels = () => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.fetchHostels();
      dispatch(setHostels(data.result || []));
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to fetch hostels" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const createHostel = (hostelData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.createHostel(hostelData);
      dispatch({ type: HOSTEL_ACTIONS.CREATE_HOSTEL, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to create hostel" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const updateHostel = (id, hostelData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.updateHostel(id, hostelData);
      dispatch({ type: HOSTEL_ACTIONS.UPDATE_HOSTEL, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to update hostel" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const deleteHostel = (id) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      await hostelApi.deleteHostel(id);
      dispatch({ type: HOSTEL_ACTIONS.DELETE_HOSTEL, payload: id });
      return { success: true };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to delete hostel" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

// Room Management Actions
export const fetchRoomsByHostel = (hostelId) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.getRoomsByHostel(hostelId);
      dispatch(setRooms(data.result || []));
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to fetch rooms" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const createRoom = (roomData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.createRoom(roomData);
      dispatch({ type: HOSTEL_ACTIONS.CREATE_ROOM, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to create room" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const updateRoom = (id, roomData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.updateRoom(id, roomData);
      dispatch({ type: HOSTEL_ACTIONS.UPDATE_ROOM, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to update room" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const deleteRoom = (id) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      await hostelApi.deleteRoom(id);
      dispatch({ type: HOSTEL_ACTIONS.DELETE_ROOM, payload: id });
      return { success: true };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to delete room" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const assignStudentToRoom = (assignmentData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.assignStudentToRoom(assignmentData);
      dispatch({ type: HOSTEL_ACTIONS.ASSIGN_STUDENT, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to assign student" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const unassignStudentFromRoom = (unassignmentData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.unassignStudentFromRoom(unassignmentData);
      dispatch({ type: HOSTEL_ACTIONS.UNASSIGN_STUDENT, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to unassign student" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

// Fee Management Actions
export const fetchAllFees = (params = {}) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.getAllFees(params);
      dispatch(setFees(data.result || []));
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to fetch fees" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const createFeeRecord = (feeData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.createFeeRecord(feeData);
      dispatch({ type: HOSTEL_ACTIONS.CREATE_FEE, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to create fee record" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const markFeePaid = (feeId, paymentData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.markFeePaid(feeId, paymentData);
      dispatch({ type: HOSTEL_ACTIONS.MARK_FEE_PAID, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to mark fee as paid" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchFeeSummary = (params = {}) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.getFeeSummary(params);
      dispatch({ type: HOSTEL_ACTIONS.GET_FEE_SUMMARY, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to fetch fee summary" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

// Notice Management Actions
export const fetchAllNotices = (params = {}) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.getAllNotices(params);
      dispatch(setNotices(data.result || []));
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to fetch notices" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const createNotice = (noticeData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.createNotice(noticeData);
      dispatch({ type: HOSTEL_ACTIONS.CREATE_NOTICE, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to create notice" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const updateNotice = (id, noticeData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.updateNotice(id, noticeData);
      dispatch({ type: HOSTEL_ACTIONS.UPDATE_NOTICE, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to update notice" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const deleteNotice = (id) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      await hostelApi.deleteNotice(id);
      dispatch({ type: HOSTEL_ACTIONS.DELETE_NOTICE, payload: id });
      return { success: true };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to delete notice" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

// Report Actions
export const fetchOccupancyReport = (params = {}) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.getOccupancyReport(params);
      dispatch({ type: HOSTEL_ACTIONS.GET_OCCUPANCY_REPORT, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to fetch occupancy report" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchFeeReport = (params = {}) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.getFeeReport(params);
      dispatch({ type: HOSTEL_ACTIONS.GET_FEE_REPORT, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to fetch fee report" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchComprehensiveReport = (params = {}) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await hostelApi.getComprehensiveReport(params);
      dispatch({ type: HOSTEL_ACTIONS.GET_COMPREHENSIVE_REPORT, payload: data.result });
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to fetch comprehensive report" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

// Clear error action
export const clearHostelError = () => ({
  type: HOSTEL_ACTIONS.SET_ERROR,
  payload: null,
});
