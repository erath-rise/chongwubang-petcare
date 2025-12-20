import prisma from "../lib/prisma.js";

// 获取护理员列表（支持筛选和排序）
export const getSitters = async (req, res) => {
  const query = req.query;

  try {
    // 构建查询条件
    const where = {};

    // 城市筛选
    if (query.city) {
      where.city = query.city;
    }

    // 价格筛选
    if (query.minPrice || query.maxPrice) {
      where.basePrice = {};
      if (query.minPrice) {
        where.basePrice.gte = parseInt(query.minPrice);
      }
      if (query.maxPrice) {
        where.basePrice.lte = parseInt(query.maxPrice);
      }
    }

    // 服务类型筛选
    if (query.serviceType) {
      where.services = {
        some: {
          serviceType: query.serviceType,
        },
      };
    }

    // 日期可用性筛选
    if (query.date) {
      const searchDate = new Date(query.date);
      // 设置日期的开始和结束时间（当天的00:00:00到23:59:59）
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.availability = {
        some: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          isAvailable: true,
        },
      };
    }

    // 构建排序
    let orderBy = {};
    switch (query.sortBy) {
      case "价格从低到高":
        orderBy = { basePrice: "asc" };
        break;
      case "价格从高到低":
        orderBy = { basePrice: "desc" };
        break;
      case "评分":
        orderBy = { rating: "desc" };
        break;
      case "推荐":
      default:
        orderBy = { rating: "desc" }; // 默认按评分排序
        break;
    }

    const sitters = await prisma.sitter.findMany({
      where,
      orderBy,
      include: {
        services: true,
        availability: query.date ? {
          where: {
            date: {
              gte: new Date(new Date(query.date).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(query.date).setHours(23, 59, 59, 999)),
            },
            isAvailable: true,
          },
        } : false,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    res.status(200).json(sitters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取护理员列表失败" });
  }
};

// 获取单个护理员详情
export const getSitter = async (req, res) => {
  const id = req.params.id;

  try {
    const sitter = await prisma.sitter.findUnique({
      where: { id },
      include: {
        services: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        availability: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: "asc",
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
      },
    });

    if (!sitter) {
      return res.status(404).json({ message: "护理员未找到" });
    }

    res.status(200).json(sitter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取护理员详情失败" });
  }
};

// 创建护理员
export const createSitter = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    // 检查用户是否已经是护理员
    const existingSitter = await prisma.sitter.findUnique({
      where: { userId: tokenUserId },
    });

    if (existingSitter) {
      return res.status(400).json({ message: "您已经是护理员了" });
    }

    const newSitter = await prisma.sitter.create({
      data: {
        userId: tokenUserId,
        name: body.name,
        avatar: body.avatar,
        description: body.description,
        basePrice: body.basePrice,
        city: body.city,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        certifications: body.certifications || [],
        experience: body.experience,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(newSitter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "创建护理员失败" });
  }
};

// 更新护理员信息
export const updateSitter = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const body = req.body;

  try {
    const sitter = await prisma.sitter.findUnique({
      where: { id },
    });

    if (!sitter) {
      return res.status(404).json({ message: "护理员未找到" });
    }

    if (sitter.userId !== tokenUserId) {
      return res.status(403).json({ message: "无权操作" });
    }

    const updatedSitter = await prisma.sitter.update({
      where: { id },
      data: {
        name: body.name,
        avatar: body.avatar,
        description: body.description,
        basePrice: body.basePrice,
        city: body.city,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        certifications: body.certifications,
        experience: body.experience,
      },
      include: {
        services: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json(updatedSitter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "更新护理员信息失败" });
  }
};

// 删除护理员
export const deleteSitter = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const sitter = await prisma.sitter.findUnique({
      where: { id },
    });

    if (!sitter) {
      return res.status(404).json({ message: "护理员未找到" });
    }

    if (sitter.userId !== tokenUserId) {
      return res.status(403).json({ message: "无权操作" });
    }

    await prisma.sitter.delete({
      where: { id },
    });

    res.status(200).json({ message: "护理员已删除" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "删除护理员失败" });
  }
};

// 添加服务
export const addService = async (req, res) => {
  const sitterId = req.params.id;
  const tokenUserId = req.userId;
  const body = req.body;

  try {
    const sitter = await prisma.sitter.findUnique({
      where: { id: sitterId },
    });

    if (!sitter) {
      return res.status(404).json({ message: "护理员未找到" });
    }

    if (sitter.userId !== tokenUserId) {
      return res.status(403).json({ message: "无权操作" });
    }

    const newService = await prisma.sitterService.create({
      data: {
        sitterId,
        serviceType: body.serviceType,
        price: body.price,
        description: body.description,
        duration: body.duration,
      },
    });

    res.status(201).json(newService);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "添加服务失败" });
  }
};

// 更新服务
export const updateService = async (req, res) => {
  const { id: sitterId, serviceId } = req.params;
  const tokenUserId = req.userId;
  const body = req.body;

  try {
    const sitter = await prisma.sitter.findUnique({
      where: { id: sitterId },
    });

    if (!sitter) {
      return res.status(404).json({ message: "护理员未找到" });
    }

    if (sitter.userId !== tokenUserId) {
      return res.status(403).json({ message: "无权操作" });
    }

    const updatedService = await prisma.sitterService.update({
      where: { id: serviceId },
      data: {
        price: body.price,
        description: body.description,
        duration: body.duration,
      },
    });

    res.status(200).json(updatedService);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "更新服务失败" });
  }
};

// 删除服务
export const deleteService = async (req, res) => {
  const { id: sitterId, serviceId } = req.params;
  const tokenUserId = req.userId;

  try {
    const sitter = await prisma.sitter.findUnique({
      where: { id: sitterId },
    });

    if (!sitter) {
      return res.status(404).json({ message: "护理员未找到" });
    }

    if (sitter.userId !== tokenUserId) {
      return res.status(403).json({ message: "无权操作" });
    }

    await prisma.sitterService.delete({
      where: { id: serviceId },
    });

    res.status(200).json({ message: "服务已删除" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "删除服务失败" });
  }
};

// 添加评价
export const addReview = async (req, res) => {
  const sitterId = req.params.id;
  const tokenUserId = req.userId;
  const body = req.body;

  try {
    const newReview = await prisma.sitterReview.create({
      data: {
        sitterId,
        userId: tokenUserId,
        rating: body.rating,
        comment: body.comment,
        images: body.images || [],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // 更新护理员的平均评分和评论数
    const reviews = await prisma.sitterReview.findMany({
      where: { sitterId },
    });

    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await prisma.sitter.update({
      where: { id: sitterId },
      data: {
        rating: avgRating,
        reviewCount: reviews.length,
      },
    });

    res.status(201).json(newReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "添加评价失败" });
  }
};

// 获取评价列表
export const getReviews = async (req, res) => {
  const sitterId = req.params.id;

  try {
    const reviews = await prisma.sitterReview.findMany({
      where: { sitterId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取评价列表失败" });
  }
};

// 更新可用时间
export const updateAvailability = async (req, res) => {
  const sitterId = req.params.id;
  const tokenUserId = req.userId;
  const body = req.body;

  try {
    const sitter = await prisma.sitter.findUnique({
      where: { id: sitterId },
    });

    if (!sitter) {
      return res.status(404).json({ message: "护理员未找到" });
    }

    if (sitter.userId !== tokenUserId) {
      return res.status(403).json({ message: "无权操作" });
    }

    // 批量更新或创建可用时间
    const availabilities = await Promise.all(
      body.availabilities.map(async (item) => {
        return await prisma.sitterAvailability.upsert({
          where: {
            sitterId_date_startTime: {
              sitterId,
              date: new Date(item.date),
              startTime: item.startTime,
            },
          },
          update: {
            endTime: item.endTime,
            isAvailable: item.isAvailable,
            calendarUpdated: new Date(),
          },
          create: {
            sitterId,
            date: new Date(item.date),
            startTime: item.startTime,
            endTime: item.endTime,
            isAvailable: item.isAvailable,
          },
        });
      })
    );

    // 更新护理员的最后活跃时间
    await prisma.sitter.update({
      where: { id: sitterId },
      data: {
        lastActive: new Date(),
      },
    });

    res.status(200).json(availabilities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "更新可用时间失败" });
  }
};

// 获取可用时间
export const getAvailability = async (req, res) => {
  const sitterId = req.params.id;
  const { startDate, endDate } = req.query;

  try {
    const where = {
      sitterId,
    };

    if (startDate || endDate) {
      where.date = {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      };
    }

    const availability = await prisma.sitterAvailability.findMany({
      where,
      orderBy: {
        date: "asc",
      },
    });

    res.status(200).json(availability);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取可用时间失败" });
  }
};
