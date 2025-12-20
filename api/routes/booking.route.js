import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  getSitterBookings,
  getUserBookings,
} from "../controllers/booking.controller.js";

const router = express.Router();

// 预订基本操作
router.get("/", verifyToken, getBookings); // 获取所有预订（管理员）
router.get("/:id", verifyToken, getBooking); // 获取单个预订详情
router.post("/", verifyToken, createBooking); // 创建预订
router.put("/:id", verifyToken, updateBooking); // 更新预订状态
router.delete("/:id", verifyToken, cancelBooking); // 取消预订

// 特定查询
router.get("/sitter/:sitterId", verifyToken, getSitterBookings); // 获取护理员的预订列表
router.get("/user/my-bookings", verifyToken, getUserBookings); // 获取用户的预订列表

export default router;
