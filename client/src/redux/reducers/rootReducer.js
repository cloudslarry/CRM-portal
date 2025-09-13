import { combineReducers } from "redux";
import facultyReducer from "./facultyReducer";
import adminReducer from "./adminReducer";
import studentReducer from "./studentReducer";
import hostelReducer from "./hostelReducer";
import collegeFeeReducer from "./collegeFeeReducer";
import errorReducerHelper from "./errorReducerHelper";
import errorReducer from "./errorReducer";

export default combineReducers({
  faculty: facultyReducer,
  admin: adminReducer,
  student: studentReducer,
  hostel: hostelReducer,
  collegeFees: collegeFeeReducer,
  error: errorReducer,
  errorHelper: errorReducerHelper,
});
