import apiRequest from "./apiRequest";

// 统计数据
export const getDashboardStats = () => apiRequest.get("/admin/dashboard/stats");
export const getUserActivityTrend = (days = 30) =>
  apiRequest.get(`/admin/dashboard/user-activity?days=${days}`);
export const getOrderTrend = (days = 30) =>
  apiRequest.get(`/admin/dashboard/order-trend?days=${days}`);
export const getOrderStatusDistribution = () =>
  apiRequest.get("/admin/dashboard/order-status");
export const getServiceTypeDistribution = () =>
  apiRequest.get("/admin/dashboard/service-type");

// 用户管理
export const getUsers = (params) => apiRequest.get("/admin/users", { params });
export const getUserDetail = (id) => apiRequest.get(`/admin/users/${id}`);
export const updateUserStatus = (id, data) =>
  apiRequest.patch(`/admin/users/${id}/status`, data);

// 订单管理
export const getOrders = (params) => apiRequest.get("/admin/orders", { params });
export const getOrderDetail = (id) => apiRequest.get(`/admin/orders/${id}`);

// 护理员管理
export const getSitters = (params) => apiRequest.get("/admin/sitters", { params });

