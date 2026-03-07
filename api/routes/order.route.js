import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  createOrder,
  getOrders,
  getOrder,
  acceptOrder,
  startOrder,
  confirmComplete,
  cancelOrder,
  reviewOrder,
  getOrderStatistics,
} from "../controllers/order.controller.js";

const router = express.Router();

// 订单基本操作
router.post("/", verifyToken, createOrder); // 创建订单
router.get("/", verifyToken, getOrders); // 获取订单列表
router.get("/statistics", verifyToken, getOrderStatistics); // 获取订单统计
router.get("/:id", verifyToken, getOrder); // 获取订单详情

// 订单状态操作
router.put("/:id/accept", verifyToken, acceptOrder); // 接单
router.put("/:id/start", verifyToken, startOrder); // 开始服务
router.put("/:id/confirm-complete", verifyToken, confirmComplete); // 确认完成
router.put("/:id/cancel", verifyToken, cancelOrder); // 取消订单
router.post("/:id/review", verifyToken, reviewOrder); // 评价订单

export default router;

