import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  getSitters,
  getSitter,
  createSitter,
  updateSitter,
  deleteSitter,
  addService,
  updateService,
  deleteService,
  addReview,
  getReviews,
  updateAvailability,
  getAvailability
} from "../controllers/sitter.controller.js";

const router = express.Router();

// 护理员基本操作
router.get("/", getSitters); // 获取护理员列表（支持筛选和排序）
router.get("/:id", getSitter); // 获取单个护理员详情
router.post("/", verifyToken, createSitter); // 创建护理员（需要登录）
router.put("/:id", verifyToken, updateSitter); // 更新护理员信息
router.delete("/:id", verifyToken, deleteSitter); // 删除护理员

// 服务管理
router.post("/:id/services", verifyToken, addService); // 添加服务
router.put("/:id/services/:serviceId", verifyToken, updateService); // 更新服务
router.delete("/:id/services/:serviceId", verifyToken, deleteService); // 删除服务

// 评价管理
router.get("/:id/reviews", getReviews); // 获取护理员的评价列表
router.post("/:id/reviews", verifyToken, addReview); // 添加评价

// 可用时间管理
router.get("/:id/availability", getAvailability); // 获取可用时间
router.post("/:id/availability", verifyToken, updateAvailability); // 更新可用时间

export default router;
