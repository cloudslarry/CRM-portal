import { SET_ADMIN, GET_SUBJECTS } from "../actionTypes";
import isEmpty from "../validation/is-empty";

const initialState = {
  isAuthenticated: false,
  admin: {},
  adminAddFacultyFlag: false,
  adminAddStudentFlag: false,
  adminAddAdminFlag: false,
  adminAddSubjectFlag: false,
  subjects: {},
  allFaculty: [],
  allStudent: [],
  allSubject: [],
  statistics: {
    totalStudents: 0,
    facultyMembers: 0,
    subjects: 0,
    departments: 0
  },
  admissions: [],
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ADMIN:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        admin: action.payload,
      };
    case GET_SUBJECTS: {
      return {
        ...state,
        subjects: action.payload,
      };
    }
    case "ADMIN_ADD_FACULTY_FLAG": {
      return {
        ...state,
        adminAddFacultyFlag: action.payload,
      };
    }
    case "ADMIN_ADD_STUDENT_FLAG": {
      return {
        ...state,
        adminAddStudentFlag: action.payload,
      };
    }
    case "ADMIN_ADD_SUBJECT_FLAG": {
      return {
        ...state,
        adminAddSubjectFlag: action.payload,
      };
    }
    case "ADMIN_ADD_ADMIN_FLAG": {
      return {
        ...state,
        adminAddAdminFlag: action.payload,
      };
    }
    case "GET_ALL_FACULTY": {
      console.log('Reducer: Setting allFaculty to:', action.payload);
      return {
        ...state,
        allFaculty: action.payload,
      };
    }
    case "GET_ALL_STUDENT": {
      console.log('Reducer: Setting allStudent to:', action.payload);
      return {
        ...state,
        allStudent: action.payload,
      };
    }
    case "GET_ALL_SUBJECT": {
      return {
        ...state,
        allSubject: action.payload,
      };
    }
    case "GET_STATISTICS": {
      return {
        ...state,
        statistics: action.payload,
      };
    }
    case "ADMIN_ADMISSIONS_LIST": {
      return {
        ...state,
        admissions: action.payload || [],
      };
    }
    case "ADMIN_ADMISSIONS_UPDATE": {
      return {
        ...state,
        admissions: (state.admissions || []).map((item) =>
          item._id === action.payload?._id ? action.payload : item
        ),
      };
    }
    default:
      return state;
  }
};

export default adminReducer;
