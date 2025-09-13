import { HOSTEL_ACTIONS } from "../actions/hostelAction";

const initialState = {
  // Hostel data
  hostels: [],
  currentHostel: null,
  
  // Room data
  rooms: [],
  currentRoom: null,
  
  // Fee data
  fees: [],
  feeSummary: null,
  
  // Notice data
  notices: [],
  currentNotice: null,
  
  // Report data
  occupancyReport: null,
  feeReport: null,
  comprehensiveReport: null,
  
  // UI state
  loading: false,
  error: null,
};

const hostelReducer = (state = initialState, action) => {
  switch (action.type) {
    // Hostel Management
    case HOSTEL_ACTIONS.GET_HOSTELS:
      return {
        ...state,
        hostels: action.payload,
        error: null,
      };
      
    case HOSTEL_ACTIONS.GET_HOSTEL_BY_ID:
      return {
        ...state,
        currentHostel: action.payload,
        error: null,
      };
      
    case HOSTEL_ACTIONS.CREATE_HOSTEL:
      return {
        ...state,
        hostels: [...state.hostels, action.payload],
        error: null,
      };
      
    case HOSTEL_ACTIONS.UPDATE_HOSTEL:
      return {
        ...state,
        hostels: state.hostels.map(hostel =>
          hostel._id === action.payload._id ? action.payload : hostel
        ),
        currentHostel: state.currentHostel?._id === action.payload._id 
          ? action.payload 
          : state.currentHostel,
        error: null,
      };
      
    case HOSTEL_ACTIONS.DELETE_HOSTEL:
      return {
        ...state,
        hostels: state.hostels.filter(hostel => hostel._id !== action.payload),
        currentHostel: state.currentHostel?._id === action.payload 
          ? null 
          : state.currentHostel,
        error: null,
      };

    // Room Management
    case HOSTEL_ACTIONS.GET_ROOMS:
      return {
        ...state,
        rooms: action.payload,
        error: null,
      };
      
    case HOSTEL_ACTIONS.CREATE_ROOM:
      return {
        ...state,
        rooms: [...state.rooms, action.payload],
        error: null,
      };
      
    case HOSTEL_ACTIONS.UPDATE_ROOM:
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room._id === action.payload._id ? action.payload : room
        ),
        currentRoom: state.currentRoom?._id === action.payload._id 
          ? action.payload 
          : state.currentRoom,
        error: null,
      };
      
    case HOSTEL_ACTIONS.DELETE_ROOM:
      return {
        ...state,
        rooms: state.rooms.filter(room => room._id !== action.payload),
        currentRoom: state.currentRoom?._id === action.payload 
          ? null 
          : state.currentRoom,
        error: null,
      };
      
    case HOSTEL_ACTIONS.ASSIGN_STUDENT:
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room._id === action.payload.room._id ? action.payload.room : room
        ),
        error: null,
      };
      
    case HOSTEL_ACTIONS.UNASSIGN_STUDENT:
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room._id === action.payload.room._id ? action.payload.room : room
        ),
        error: null,
      };

    // Fee Management
    case HOSTEL_ACTIONS.GET_FEES:
      return {
        ...state,
        fees: action.payload,
        error: null,
      };
      
    case HOSTEL_ACTIONS.CREATE_FEE:
      return {
        ...state,
        fees: [...state.fees, action.payload],
        error: null,
      };
      
    case HOSTEL_ACTIONS.UPDATE_FEE:
      return {
        ...state,
        fees: state.fees.map(fee =>
          fee._id === action.payload._id ? action.payload : fee
        ),
        error: null,
      };
      
    case HOSTEL_ACTIONS.MARK_FEE_PAID:
      return {
        ...state,
        fees: state.fees.map(fee =>
          fee._id === action.payload._id ? action.payload : fee
        ),
        error: null,
      };
      
    case HOSTEL_ACTIONS.GET_FEE_SUMMARY:
      return {
        ...state,
        feeSummary: action.payload,
        error: null,
      };

    // Notice Management
    case HOSTEL_ACTIONS.GET_NOTICES:
      return {
        ...state,
        notices: action.payload,
        error: null,
      };
      
    case HOSTEL_ACTIONS.CREATE_NOTICE:
      return {
        ...state,
        notices: [action.payload, ...state.notices],
        error: null,
      };
      
    case HOSTEL_ACTIONS.UPDATE_NOTICE:
      return {
        ...state,
        notices: state.notices.map(notice =>
          notice._id === action.payload._id ? action.payload : notice
        ),
        currentNotice: state.currentNotice?._id === action.payload._id 
          ? action.payload 
          : state.currentNotice,
        error: null,
      };
      
    case HOSTEL_ACTIONS.DELETE_NOTICE:
      return {
        ...state,
        notices: state.notices.filter(notice => notice._id !== action.payload),
        currentNotice: state.currentNotice?._id === action.payload 
          ? null 
          : state.currentNotice,
        error: null,
      };

    // Reports
    case HOSTEL_ACTIONS.GET_OCCUPANCY_REPORT:
      return {
        ...state,
        occupancyReport: action.payload,
        error: null,
      };
      
    case HOSTEL_ACTIONS.GET_FEE_REPORT:
      return {
        ...state,
        feeReport: action.payload,
        error: null,
      };
      
    case HOSTEL_ACTIONS.GET_COMPREHENSIVE_REPORT:
      return {
        ...state,
        comprehensiveReport: action.payload,
        error: null,
      };

    // Loading and Error States
    case HOSTEL_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
      
    case HOSTEL_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    // Default case
    default:
      return state;
  }
};

export default hostelReducer;
