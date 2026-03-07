import prisma from "../lib/prisma.js";
import { generateOrderNumber } from "../utils/orderNumberGenerator.js";

// 创建订单（宠物主人下单）
export const createOrder = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    // 验证必填字段
    if (!body.sitterId || !body.serviceType || !body.serviceDate || !body.startTime || !body.endTime) {
      return res.status(400).json({ message: "缺少必填字段" });
    }

    // 检查护理员是否存在
    const sitter = await prisma.sitter.findUnique({
      where: { id: body.sitterId },
      include: {
        services: true,
      },
    });

    if (!sitter) {
      return res.status(404).json({ message: "护理员未找到" });
    }

    // 检查服务类型是否匹配
    const service = sitter.services.find(s => s.serviceType === body.serviceType);
    if (!service) {
      return res.status(400).json({ message: "该护理员不提供此服务类型" });
    }

    // 检查时间段是否冲突
    const serviceDate = new Date(body.serviceDate);
    const startOfDay = new Date(serviceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(serviceDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingOrder = await prisma.order.findFirst({
      where: {
        sitterId: body.sitterId,
        serviceDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        startTime: body.startTime,
        status: {
          in: ["pending", "accepted", "in_progress"],
        },
      },
    });

    if (existingOrder) {
      return res.status(400).json({ message: "该时间段已被预订" });
    }

    // 计算价格
    const basePrice = service.price || sitter.basePrice;
    const serviceFee = body.serviceFee || 0;
    const totalPrice = basePrice + serviceFee;

    // 生成订单号
    let orderNumber = generateOrderNumber();
    // 确保订单号唯一
    let orderExists = await prisma.order.findUnique({
      where: { orderNumber },
    });
    while (orderExists) {
      orderNumber = generateOrderNumber();
      orderExists = await prisma.order.findUnique({
        where: { orderNumber },
      });
    }

    // 创建订单
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        sitterId: body.sitterId,
        userId: tokenUserId,
        serviceType: body.serviceType,
        serviceDate: new Date(body.serviceDate),
        startTime: body.startTime,
        endTime: body.endTime,
        duration: body.duration || null,
        petInfo: body.petInfo || null,
        petName: body.petName || null,
        petType: body.petType || null,
        petSize: body.petSize || null,
        specialNeeds: body.specialNeeds || null,
        basePrice,
        serviceFee,
        totalPrice,
        serviceAddress: body.serviceAddress || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        contactPhone: body.contactPhone || null,
        contactNote: body.contactNote || null,
      },
      include: {
        sitter: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("创建订单错误:", err);
    console.error("错误详情:", err.message);
    console.error("错误堆栈:", err.stack);
    
    // 返回更详细的错误信息
    if (err.code === 'P2002') {
      return res.status(400).json({ message: "订单号已存在，请重试" });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ message: "关联的护理员或用户不存在" });
    }
    if (err.code === 'P2011') {
      return res.status(400).json({ message: "必填字段缺失" });
    }
    
    res.status(500).json({ 
      message: "创建订单失败",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// 获取订单列表
export const getOrders = async (req, res) => {
  const tokenUserId = req.userId;
  const { role, status, page = 1, limit = 10 } = req.query;

  try {
    const where = {};

    // 根据角色筛选订单
    if (role === "user") {
      where.userId = tokenUserId;
    } else if (role === "sitter") {
      // 需要先找到该用户对应的护理员
      const sitter = await prisma.sitter.findUnique({
        where: { userId: tokenUserId },
      });
      if (sitter) {
        where.sitterId = sitter.id;
      } else {
        return res.status(403).json({ message: "您不是护理员" });
      }
    } else {
      // 默认返回用户的所有订单（作为用户或护理员）
      const sitter = await prisma.sitter.findUnique({
        where: { userId: tokenUserId },
      });
      if (sitter) {
        where.OR = [
          { userId: tokenUserId },
          { sitterId: sitter.id },
        ];
      } else {
        where.userId = tokenUserId;
      }
    }

    // 状态筛选
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: "desc",
        },
        include: {
          sitter: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取订单列表失败" });
  }
};

// 获取订单详情
export const getOrder = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        sitter: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            services: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
        userReview: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "订单未找到" });
    }

    // 检查权限：只有订单的用户或护理员可以查看
    const sitter = await prisma.sitter.findUnique({
      where: { id: order.sitterId },
    });

    if (order.userId !== tokenUserId && sitter.userId !== tokenUserId) {
      return res.status(403).json({ message: "无权查看此订单" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取订单详情失败" });
  }
};

// 护理员接单
export const acceptOrder = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { note } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        sitter: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "订单未找到" });
    }

    // 验证订单状态
    if (order.status !== "pending") {
      return res.status(400).json({ message: "订单状态不允许接单" });
    }

    // 验证操作人是护理员本人
    if (order.sitter.userId !== tokenUserId) {
      return res.status(403).json({ message: "无权操作此订单" });
    }

    // 更新订单状态
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "accepted",
        acceptedAt: new Date(),
        contactNote: note || order.contactNote,
      },
      include: {
        sitter: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "接单失败" });
  }
};

// 开始服务
export const startOrder = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { note } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        sitter: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "订单未找到" });
    }

    // 验证订单状态
    if (order.status !== "accepted") {
      return res.status(400).json({ message: "订单状态不允许开始服务" });
    }

    // 验证操作人是护理员本人
    if (order.sitter.userId !== tokenUserId) {
      return res.status(403).json({ message: "无权操作此订单" });
    }

    // 更新订单状态
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "in_progress",
        startedAt: new Date(),
        contactNote: note || order.contactNote,
      },
      include: {
        sitter: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "开始服务失败" });
  }
};

// 确认完成
export const confirmComplete = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { confirmedBy, note } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        sitter: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "订单未找到" });
    }

    // 验证订单状态
    if (order.status !== "in_progress") {
      return res.status(400).json({ message: "订单状态不允许确认完成" });
    }

    // 验证操作人
    const isUser = order.userId === tokenUserId;
    const isSitter = order.sitter.userId === tokenUserId;

    if (!isUser && !isSitter) {
      return res.status(403).json({ message: "无权操作此订单" });
    }

    // 确定确认人
    let userConfirmed = order.userConfirmed;
    let sitterConfirmed = order.sitterConfirmed;

    if (confirmedBy === "user" && isUser) {
      userConfirmed = true;
    } else if (confirmedBy === "sitter" && isSitter) {
      sitterConfirmed = true;
    } else if (isUser) {
      userConfirmed = true;
    } else if (isSitter) {
      sitterConfirmed = true;
    }

    // 如果双方都确认，更新状态为已完成
    const updateData = {
      userConfirmed,
      sitterConfirmed,
      contactNote: note || order.contactNote,
    };

    if (userConfirmed && sitterConfirmed) {
      updateData.status = "completed";
      updateData.completedAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        sitter: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "确认完成失败" });
  }
};

// 取消订单
export const cancelOrder = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { reason, cancelBy } = req.body;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        sitter: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "订单未找到" });
    }

    // 验证订单状态
    if (order.status === "completed") {
      return res.status(400).json({ message: "已完成的订单无法取消" });
    }

    // 验证操作人
    const isUser = order.userId === tokenUserId;
    const isSitter = order.sitter.userId === tokenUserId;

    if (!isUser && !isSitter) {
      return res.status(403).json({ message: "无权取消此订单" });
    }

    // 确定取消人
    let cancelledBy = cancelBy;
    if (!cancelledBy) {
      cancelledBy = isUser ? "user" : "sitter";
    }

    // 更新订单状态
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy,
        cancelReason: reason || null,
      },
      include: {
        sitter: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "取消订单失败" });
  }
};

// 订单评价
export const reviewOrder = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { rating, comment, images, tags } = req.body;

  try {
    // 验证必填字段
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "评分必须在1-5之间" });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        sitter: true,
        userReview: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "订单未找到" });
    }

    // 验证订单状态
    if (order.status !== "completed") {
      return res.status(400).json({ message: "只能评价已完成的订单" });
    }

    // 验证操作人是订单用户
    if (order.userId !== tokenUserId) {
      return res.status(403).json({ message: "无权评价此订单" });
    }

    // 检查是否已评价
    if (order.userReview) {
      return res.status(400).json({ message: "该订单已评价" });
    }

    // 创建评价
    const review = await prisma.orderReview.create({
      data: {
        orderId: id,
        reviewerId: tokenUserId,
        revieweeId: order.sitter.userId,
        revieweeType: "sitter",
        rating: parseFloat(rating),
        comment: comment || null,
        images: images || [],
        tags: tags || [],
      },
    });

    // 更新护理员评分
    const sitterReviews = await prisma.orderReview.findMany({
      where: {
        revieweeId: order.sitter.userId,
        revieweeType: "sitter",
      },
    });

    const averageRating = sitterReviews.reduce((sum, r) => sum + r.rating, 0) / sitterReviews.length;
    const reviewCount = sitterReviews.length;

    await prisma.sitter.update({
      where: { id: order.sitterId },
      data: {
        rating: averageRating,
        reviewCount,
      },
    });

    // 更新订单状态为已评价
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "reviewed",
      },
      include: {
        sitter: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        userReview: true,
      },
    });

    res.status(201).json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "评价失败" });
  }
};

// 获取订单统计（可选）
export const getOrderStatistics = async (req, res) => {
  const tokenUserId = req.userId;
  const { role, startDate, endDate } = req.query;

  try {
    const where = {};

    // 根据角色筛选
    if (role === "user") {
      where.userId = tokenUserId;
    } else if (role === "sitter") {
      const sitter = await prisma.sitter.findUnique({
        where: { userId: tokenUserId },
      });
      if (sitter) {
        where.sitterId = sitter.id;
      } else {
        return res.status(403).json({ message: "您不是护理员" });
      }
    }

    // 日期筛选
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      orders,
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: "pending" } }),
      prisma.order.count({ where: { ...where, status: "completed" } }),
      prisma.order.count({ where: { ...where, status: "cancelled" } }),
      prisma.order.findMany({
        where: { ...where, status: "completed" },
        include: {
          userReview: true,
        },
      }),
    ]);

    // 计算平均评分
    const reviews = orders.filter(o => o.userReview).map(o => o.userReview.rating);
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r, 0) / reviews.length
      : 0;

    res.status(200).json({
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      averageRating: Math.round(averageRating * 10) / 10,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取订单统计失败" });
  }
};

