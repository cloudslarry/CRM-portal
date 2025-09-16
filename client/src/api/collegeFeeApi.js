import api from "../config/api";

export const collegeFeeApi = {
	// Admin
	createFee: (data) => api.post("/api/admin/college/fees", data),
	getAllFees: (params) => api.get("/api/admin/college/fees", { params }),
	updateFee: (id, data) => api.put(`/api/admin/college/fees/${id}`, data),
	markPaid: (id, data) => api.patch(`/api/admin/college/fees/${id}/pay`, data),

	// Student
	getMyFees: () => api.get("/api/student/college/fees/my-fees"),
	downloadReceipt: (feeId) => api.get(`/api/student/receipts/college-fees/${feeId}/receipt`, { responseType: "blob" }),
};

export default collegeFeeApi;








