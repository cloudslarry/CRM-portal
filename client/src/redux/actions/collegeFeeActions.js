import { collegeFeeApi } from "../../api/collegeFeeApi";

export const COLLEGE_FEE_ACTIONS = {
	SET_LOADING: "COLLEGE_FEE_SET_LOADING",
	SET_ERROR: "COLLEGE_FEE_SET_ERROR",
	SET_FEES: "COLLEGE_FEE_SET_FEES",
	CREATE_FEE: "COLLEGE_FEE_CREATE_FEE",
	UPDATE_FEE: "COLLEGE_FEE_UPDATE_FEE",
	MARK_PAID: "COLLEGE_FEE_MARK_PAID",
};

const setLoading = (value) => ({ type: COLLEGE_FEE_ACTIONS.SET_LOADING, payload: value });
const setError = (error) => ({ type: COLLEGE_FEE_ACTIONS.SET_ERROR, payload: error });
const setFees = (fees) => ({ type: COLLEGE_FEE_ACTIONS.SET_FEES, payload: fees });

export const fetchCollegeFees = (params) => {
	return async (dispatch) => {
		try {
			dispatch(setLoading(true));
			const { data } = await collegeFeeApi.getAllFees(params);
			dispatch(setFees(data.result || []));
			return { success: true, data: data.result };
		} catch (err) {
			const error = err.response?.data || { message: "Failed to fetch college fees" };
			dispatch(setError(error));
			return { success: false, error };
		} finally {
			dispatch(setLoading(false));
		}
	};
};

export const createCollegeFee = (payload) => {
	return async (dispatch) => {
		try {
			dispatch(setLoading(true));
			const { data } = await collegeFeeApi.createFee(payload);
			dispatch({ type: COLLEGE_FEE_ACTIONS.CREATE_FEE, payload: data.result });
			return { success: true, data: data.result };
		} catch (err) {
			const error = err.response?.data || { message: "Failed to create college fee" };
			dispatch(setError(error));
			return { success: false, error };
		} finally {
			dispatch(setLoading(false));
		}
	};
};

export const markCollegeFeePaid = (id, payload) => {
	return async (dispatch) => {
		try {
			dispatch(setLoading(true));
			const { data } = await collegeFeeApi.markPaid(id, payload);
			dispatch({ type: COLLEGE_FEE_ACTIONS.MARK_PAID, payload: data.result });
			return { success: true, data: data.result };
		} catch (err) {
			const error = err.response?.data || { message: "Failed to mark paid" };
			dispatch(setError(error));
			return { success: false, error };
		} finally {
			dispatch(setLoading(false));
		}
	};
};


