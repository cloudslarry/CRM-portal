import api from "../../config/api";
import { SET_ERRORS } from "../actionTypes";

// Action Types
export const DEPARTMENT_ACTIONS = {
  SET_LOADING: "DEPARTMENT_SET_LOADING",
  SET_ERROR: "DEPARTMENT_SET_ERROR",
  SET_DEPARTMENTS: "DEPARTMENT_SET_DEPARTMENTS",
  ADD_DEPARTMENT: "DEPARTMENT_ADD_DEPARTMENT",
  UPDATE_DEPARTMENT: "DEPARTMENT_UPDATE_DEPARTMENT",
  DELETE_DEPARTMENT: "DEPARTMENT_DELETE_DEPARTMENT",
};

// Action Creators
const setLoading = (loading) => ({
  type: DEPARTMENT_ACTIONS.SET_LOADING,
  payload: loading,
});

const setError = (error) => ({
  type: DEPARTMENT_ACTIONS.SET_ERROR,
  payload: error,
});

const setDepartments = (departments) => ({
  type: DEPARTMENT_ACTIONS.SET_DEPARTMENTS,
  payload: departments,
});

const addDepartment = (department) => ({
  type: DEPARTMENT_ACTIONS.ADD_DEPARTMENT,
  payload: department,
});

const updateDepartment = (department) => ({
  type: DEPARTMENT_ACTIONS.UPDATE_DEPARTMENT,
  payload: department,
});

const deleteDepartment = (id) => ({
  type: DEPARTMENT_ACTIONS.DELETE_DEPARTMENT,
  payload: id,
});

// Async Actions
export const fetchDepartments = (params = {}) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await api.get("/api/department", { params });
      dispatch(setDepartments(data.data || []));
      return { success: true, data: data.data };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to fetch departments" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const createDepartment = (departmentData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await api.post("/api/department/add", departmentData);
      dispatch(addDepartment(data.data));
      return { success: true, data: data.data };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to create department" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const updateDepartmentById = (id, departmentData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const { data } = await api.put(`/api/department/${id}`, departmentData);
      dispatch(updateDepartment(data.result));
      return { success: true, data: data.result };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to update department" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const deleteDepartmentById = (id) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      await api.delete(`/api/department/${id}`);
      dispatch(deleteDepartment(id));
      return { success: true };
    } catch (err) {
      const error = err.response?.data || { message: "Failed to delete department" };
      dispatch(setError(error));
      return { success: false, error };
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const clearDepartmentError = () => {
  return (dispatch) => {
    dispatch(setError(null));
  };
};
