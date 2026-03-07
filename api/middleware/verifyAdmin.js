import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const verifyAdmin = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "未认证！" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = payload.id;

    // 从数据库验证用户角色
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "无权限访问！" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "账户已被禁用！" });
    }

    req.userRole = user.role;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token无效！" });
  }
};

