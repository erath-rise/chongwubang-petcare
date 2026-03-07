import express from "express";
import {
  getDashboardStats,
  getUserActivityTrend,
  getOrderTrend,
  getOrderStatusDistribution,
  getServiceTypeDistribution,
  getUsers,
  getUserDetail,
  updateUserStatus,
  getOrders,
  getOrderDetail,
  getSitters,
} from "../controllers/admin.controller.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

// 统计数据路由
router.get("/dashboard/stats", verifyAdmin, getDashboardStats);
router.get("/dashboard/user-activity", verifyAdmin, getUserActivityTrend);
router.get("/dashboard/order-trend", verifyAdmin, getOrderTrend);
router.get("/dashboard/order-status", verifyAdmin, getOrderStatusDistribution);
router.get("/dashboard/service-type", verifyAdmin, getServiceTypeDistribution);

// 用户管理路由
router.get("/users", verifyAdmin, getUsers);
router.get("/users/:id", verifyAdmin, getUserDetail);
router.patch("/users/:id/status", verifyAdmin, updateUserStatus);

// 订单管理路由
router.get("/orders", verifyAdmin, getOrders);
router.get("/orders/:id", verifyAdmin, getOrderDetail);

// 护理员管理路由
router.get("/sitters", verifyAdmin, getSitters);

export default router;

