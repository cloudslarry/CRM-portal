import api from "../config/api";

// Hostel Management API
export const hostelApi = {
  // Hostel CRUD operations
  fetchHostels: () => api.get("/api/admin/hostel/hostels"),
  createHostel: (data) => api.post("/api/admin/hostel/hostels", data),
  getHostelById: (id) => api.get(`/api/admin/hostel/hostels/${id}`),
  updateHostel: (id, data) => api.put(`/api/admin/hostel/hostels/${id}`, data),
  deleteHostel: (id) => api.delete(`/api/admin/hostel/hostels/${id}`),

  // Room Management
  createRoom: (data) => api.post("/api/admin/hostel/rooms", data),
  getRoomsByHostel: (hostelId) => api.get(`/api/admin/hostel/hostels/${hostelId}/rooms`),
  updateRoom: (id, data) => api.put(`/api/admin/hostel/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/api/admin/hostel/rooms/${id}`),
  assignStudentToRoom: (data) => api.post("/api/admin/hostel/rooms/assign", data),
  unassignStudentFromRoom: (data) => api.post("/api/admin/hostel/rooms/unassign", data),

  // Fee Management
  createFeeRecord: (data) => api.post("/api/admin/hostel/fees", data),
  getAllFees: (params) => api.get("/api/admin/hostel/fees", { params }),
  getFeesByStudent: (studentId) => api.get(`/api/admin/hostel/fees/student/${studentId}`),
  updateFeeRecord: (feeId, data) => api.put(`/api/admin/hostel/fees/${feeId}`, data),
  markFeePaid: (feeId, data) => api.patch(`/api/admin/hostel/fees/${feeId}/pay`, data),
  getFeeSummary: (params) => api.get("/api/admin/hostel/fees/summary", { params }),

  // Notice Management
  createNotice: (data) => api.post("/api/admin/hostel/notices", data),
  getAllNotices: (params) => api.get("/api/admin/hostel/notices", { params }),
  getRecentNotices: (params) => api.get("/api/admin/hostel/notices/recent", { params }),
  getNoticeById: (id) => api.get(`/api/admin/hostel/notices/${id}`),
  getNoticesByHostel: (hostelId, params) => api.get(`/api/admin/hostel/hostels/${hostelId}/notices`, { params }),
  updateNotice: (id, data) => api.put(`/api/admin/hostel/notices/${id}`, data),
  deleteNotice: (id) => api.delete(`/api/admin/hostel/notices/${id}`),

  // Reports
  getOccupancyReport: (params) => api.get("/api/admin/hostel/reports/occupancy", { params }),
  getFeeReport: (params) => api.get("/api/admin/hostel/reports/fees", { params }),
  getComprehensiveReport: (params) => api.get("/api/admin/hostel/reports/comprehensive", { params }),
};

// Student Hostel API (read-only)
export const studentHostelApi = {
  fetchHostels: () => api.get("/api/student/hostel/hostels"),
  getHostelById: (id) => api.get(`/api/student/hostel/hostels/${id}`),
  getRoomsByHostel: (hostelId) => api.get(`/api/student/hostel/hostels/${hostelId}/rooms`),
  getMyFees: () => api.get("/api/student/hostel/fees/my-fees"),
  getMyHostelNotices: () => api.get("/api/student/hostel/notices/my-hostel"),
  getAllNotices: (params) => api.get("/api/student/hostel/notices", { params }),
  getRecentNotices: (params) => api.get("/api/student/hostel/notices/recent", { params }),
  getNoticeById: (id) => api.get(`/api/student/hostel/notices/${id}`),
  getMyRoom: () => api.get("/api/student/hostel/my-room"),
  getMyHostel: () => api.get("/api/student/hostel/my-hostel"),
  // Use canonical path mounted at /api/student/receipts
  downloadFeeReceipt: (feeId) => api.get(`/api/student/receipts/fees/${feeId}/receipt`, { responseType: 'blob' }),
};

export default hostelApi;
