import { DEPARTMENT_ACTIONS } from "../actions/departmentAction";

const initialState = {
  departments: [],
  loading: false,
  error: null,
};

const departmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case DEPARTMENT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case DEPARTMENT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case DEPARTMENT_ACTIONS.SET_DEPARTMENTS:
      return {
        ...state,
        departments: action.payload,
        error: null,
        loading: false,
      };

    case DEPARTMENT_ACTIONS.ADD_DEPARTMENT:
      return {
        ...state,
        departments: [action.payload, ...state.departments],
        error: null,
        loading: false,
      };

    case DEPARTMENT_ACTIONS.UPDATE_DEPARTMENT:
      return {
        ...state,
        departments: state.departments.map((dept) =>
          dept._id === action.payload._id ? action.payload : dept
        ),
        error: null,
        loading: false,
      };

    case DEPARTMENT_ACTIONS.DELETE_DEPARTMENT:
      return {
        ...state,
        departments: state.departments.filter((dept) => dept._id !== action.payload),
        error: null,
        loading: false,
      };

    default:
      return state;
  }
};

export default departmentReducer;
