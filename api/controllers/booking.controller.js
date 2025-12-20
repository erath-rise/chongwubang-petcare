import prisma from "../lib/prisma.js";

// 获取所有预订（管理员功能）
export const getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
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
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取预订列表失败" });
  }
};

// 获取单个预订详情
export const getBooking = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const booking = await prisma.booking.findUnique({
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
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "预订未找到" });
    }

    // 检查权限：只有预订的用户或护理员可以查看
    const sitter = await prisma.sitter.findUnique({
      where: { id: booking.sitterId },
    });

    if (booking.userId !== tokenUserId && sitter.userId !== tokenUserId) {
      return res.status(403).json({ message: "无权查看此预订" });
    }

    res.status(200).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取预订详情失败" });
  }
};

// 创建预订
export const createBooking = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    // 检查护理员是否存在
    const sitter = await prisma.sitter.findUnique({
      where: { id: body.sitterId },
    });

    if (!sitter) {
      return res.status(404).json({ message: "护理员未找到" });
    }

    // 检查时间是否可用
    const availability = await prisma.sitterAvailability.findFirst({
      where: {
        sitterId: body.sitterId,
        date: new Date(body.date),
        startTime: body.startTime,
        isAvailable: true,
      },
    });

    if (!availability) {
      return res.status(400).json({ message: "该时间段不可用" });
    }

    // 检查是否已有预订冲突
    const existingBooking = await prisma.booking.findFirst({
      where: {
        sitterId: body.sitterId,
        date: new Date(body.date),
        startTime: body.startTime,
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    if (existingBooking) {
      return res.status(400).json({ message: "该时间段已被预订" });
    }

    const newBooking = await prisma.booking.create({
      data: {
        sitterId: body.sitterId,
        userId: tokenUserId,
        serviceType: body.serviceType,
        date: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime,
        price: body.price,
        petInfo: body.petInfo,
        specialNeeds: body.specialNeeds,
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

    res.status(201).json(newBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "创建预订失败" });
  }
};

// 更新预订状态
export const updateBooking = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const body = req.body;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ message: "预订未找到" });
    }

    // 检查权限
    const sitter = await prisma.sitter.findUnique({
      where: { id: booking.sitterId },
    });

    const isSitterOwner = sitter.userId === tokenUserId;
    const isBookingOwner = booking.userId === tokenUserId;

    if (!isSitterOwner && !isBookingOwner) {
      return res.status(403).json({ message: "无权操作此预订" });
    }

    // 护理员可以确认预订，用户只能取消
    if (body.status === "confirmed" && !isSitterOwner) {
      return res.status(403).json({ message: "只有护理员可以确认预订" });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: body.status,
        lastContacted: body.status === "confirmed" ? new Date() : undefined,
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

    res.status(200).json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "更新预订失败" });
  }
};

// 取消预订
export const cancelBooking = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ message: "预订未找到" });
    }

    // 检查权限
    const sitter = await prisma.sitter.findUnique({
      where: { id: booking.sitterId },
    });

    if (booking.userId !== tokenUserId && sitter.userId !== tokenUserId) {
      return res.status(403).json({ message: "无权取消此预订" });
    }

    // 不能取消已完成的预订
    if (booking.status === "completed") {
      return res.status(400).json({ message: "已完成的预订无法取消" });
    }

    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "cancelled",
      },
    });

    res.status(200).json({ message: "预订已取消", booking: cancelledBooking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "取消预订失败" });
  }
};

// 获取护理员的预订列表
export const getSitterBookings = async (req, res) => {
  const sitterId = req.params.sitterId;
  const tokenUserId = req.userId;

  try {
    // 检查权限：只有护理员本人可以查看
    const sitter = await prisma.sitter.findUnique({
      where: { id: sitterId },
    });

    if (!sitter) {
      return res.status(404).json({ message: "护理员未找到" });
    }

    if (sitter.userId !== tokenUserId) {
      return res.status(403).json({ message: "无权查看此护理员的预订" });
    }

    const bookings = await prisma.booking.findMany({
      where: { sitterId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取预订列表失败" });
  }
};

// 获取用户的预订列表
export const getUserBookings = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: tokenUserId },
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
      },
      orderBy: {
        date: "desc",
      },
    });

    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "获取预订列表失败" });
  }
};
