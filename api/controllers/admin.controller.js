import prisma from "../lib/prisma.js";

// 获取仪表板统计数据
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    // 用户统计
    const totalUsers = await prisma.user.count();
    const newUsersToday = await prisma.user.count({
      where: { createdAt: { gte: today } },
    });
    const newUsersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: thisMonth } },
    });
    const activeUsersThisMonth = await prisma.user.count({
      where: {
        lastLoginAt: { gte: thisMonth },
      },
    });

    // 订单统计
    const totalOrders = await prisma.order.count();
    const ordersToday = await prisma.order.count({
      where: { createdAt: { gte: today } },
    });
    const ordersThisMonth = await prisma.order.count({
      where: { createdAt: { gte: thisMonth } },
    });
    const completedOrders = await prisma.order.count({
      where: { status: "completed" },
    });
    const pendingOrders = await prisma.order.count({
      where: { status: "pending" },
    });

    // 订单金额统计
    const revenueResult = await prisma.order.aggregate({
      where: { status: "completed" },
      _sum: { totalPrice: true },
    });
    const totalRevenue = revenueResult._sum.totalPrice || 0;

    const revenueThisMonth = await prisma.order.aggregate({
      where: {
        status: "completed",
        completedAt: { gte: thisMonth },
      },
      _sum: { totalPrice: true },
    });
    const monthlyRevenue = revenueThisMonth._sum.totalPrice || 0;

    // 护理员统计
    const totalSitters = await prisma.sitter.count();
    const activeSitters = await prisma.sitter.count({
      where: {
        lastActive: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 最近30天活跃
        },
      },
    });

    // 平均评分
    const avgRatingResult = await prisma.sitter.aggregate({
      _avg: { rating: true },
    });
    const avgRating = avgRatingResult._avg.rating || 0;

    // 帖子统计
    const totalPosts = await prisma.post.count();
    const postsThisMonth = await prisma.post.count({
      where: { createdAt: { gte: thisMonth } },
    });

    res.status(200).json({
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisMonth: newUsersThisMonth,
        activeThisMonth: activeUsersThisMonth,
      },
      orders: {
        total: totalOrders,
        today: ordersToday,
        thisMonth: ordersThisMonth,
        completed: completedOrders,
        pending: pendingOrders,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: monthlyRevenue,
      },
      sitters: {
        total: totalSitters,
        active: activeSitters,
        avgRating: parseFloat(avgRating.toFixed(2)),
      },
      posts: {
        total: totalPosts,
        thisMonth: postsThisMonth,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取统计数据失败！" });
  }
};

// 获取用户活跃度趋势（最近N天）
export const getUserActivityTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const trends = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      const activeUsers = await prisma.user.count({
        where: {
          lastLoginAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      trends.push({
        date: date.toISOString().split("T")[0],
        newUsers,
        activeUsers,
      });
    }

    res.status(200).json(trends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取用户活跃度趋势失败！" });
  }
};

// 获取订单趋势（最近N天）
export const getOrderTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const trends = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const orders = await prisma.order.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      const completed = await prisma.order.count({
        where: {
          status: "completed",
          completedAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      const revenueResult = await prisma.order.aggregate({
        where: {
          status: "completed",
          completedAt: {
            gte: date,
            lt: nextDate,
          },
        },
        _sum: { totalPrice: true },
      });

      trends.push({
        date: date.toISOString().split("T")[0],
        orders,
        completed,
        revenue: revenueResult._sum.totalPrice || 0,
      });
    }

    res.status(200).json(trends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取订单趋势失败！" });
  }
};

// 获取订单状态分布
export const getOrderStatusDistribution = async (req, res) => {
  try {
    const statuses = ["pending", "accepted", "in_progress", "completed", "cancelled"];
    const distribution = [];

    for (const status of statuses) {
      const count = await prisma.order.count({
        where: { status },
      });
      distribution.push({ status, count });
    }

    res.status(200).json(distribution);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取订单状态分布失败！" });
  }
};

// 获取服务类型分布
export const getServiceTypeDistribution = async (req, res) => {
  try {
    const serviceTypes = await prisma.order.groupBy({
      by: ["serviceType"],
      _count: { serviceType: true },
    });

    res.status(200).json(serviceTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取服务类型分布失败！" });
  }
};

// ==================== 用户管理API ====================

// 获取用户列表（分页）
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              orders: true,
              posts: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取用户列表失败！" });
  }
};

// 获取用户详情
export const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            orders: true,
            posts: true,
            sitterReviews: true,
          },
        },
        sitter: {
          select: {
            id: true,
            name: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "用户未找到！" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取用户详情失败！" });
  }
};

// 更新用户状态
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const updateData = {};
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }
    if (role && ["user", "admin"].includes(role)) {
      updateData.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "更新用户状态失败！" });
  }
};

// ==================== 订单管理API ====================

// 获取订单列表（分页）
export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";
    const skip = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          sitter: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取订单列表失败！" });
  }
};

// 获取订单详情
export const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        sitter: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
          },
        },
        userReview: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "订单未找到！" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取订单详情失败！" });
  }
};

// ==================== 护理员管理API ====================

// 获取护理员列表
export const getSitters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [sitters, total] = await Promise.all([
      prisma.sitter.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.sitter.count(),
    ]);

    res.status(200).json({
      sitters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取护理员列表失败！" });
  }
};

