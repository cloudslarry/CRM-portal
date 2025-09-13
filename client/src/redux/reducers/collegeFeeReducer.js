import { COLLEGE_FEE_ACTIONS } from "../actions/collegeFeeActions";

const initialState = {
	fees: [],
	loading: false,
	error: null,
};

const collegeFeeReducer = (state = initialState, action) => {
	switch (action.type) {
		case COLLEGE_FEE_ACTIONS.SET_LOADING:
			return { ...state, loading: action.payload };
		case COLLEGE_FEE_ACTIONS.SET_ERROR:
			return { ...state, error: action.payload };
		case COLLEGE_FEE_ACTIONS.SET_FEES:
			return { ...state, fees: action.payload, error: null };
		case COLLEGE_FEE_ACTIONS.CREATE_FEE:
			return { ...state, fees: [...state.fees, action.payload], error: null };
		case COLLEGE_FEE_ACTIONS.UPDATE_FEE:
			return {
				...state,
				fees: state.fees.map((f) => (f._id === action.payload._id ? action.payload : f)),
				error: null,
			};
		case COLLEGE_FEE_ACTIONS.MARK_PAID:
			return {
				...state,
				fees: state.fees.map((f) => (f._id === action.payload._id ? action.payload : f)),
				error: null,
			};
		default:
			return state;
	}
};

export default collegeFeeReducer;


