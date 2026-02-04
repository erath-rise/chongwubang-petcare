import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    for (const chat of chats) {
      const receiverId = chat.userIDs.find((id) => id !== tokenUserId);

      if (receiverId) {
        const receiver = await prisma.user.findUnique({
          where: {
            id: receiverId,
          },
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        });
        chat.receiver = receiver;
      } else {
        // 如果找不到 receiver，设置为 null
        chat.receiver = null;
      }
    }

    res.status(200).json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};

export const getChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    // 先查找聊天，然后检查用户权限
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    // 检查用户是否有权限访问这个聊天
    if (!chat || !chat.userIDs.includes(tokenUserId)) {
      return res.status(403).json({ message: "Access denied!" });
    }

    // 更新已读状态：如果用户ID不在seenBy中，则添加
    const seenBy = chat.seenBy || [];
    if (!seenBy.includes(tokenUserId)) {
      await prisma.chat.update({
        where: {
          id: req.params.id,
        },
        data: {
          seenBy: {
            push: [tokenUserId],
          },
        },
      });
    }
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};




export const addChat = async (req, res) => {
  const tokenUserId = req.userId;
  const receiverId = req.body.receiverId;

  console.log('tokenUserId:', tokenUserId);
  console.log('receiverId:', receiverId);

  try {
    // check if user IDs are provided
    if (!tokenUserId || !receiverId) {
      return res.status(400).json({ message: "Missing required user IDs" });
    }

    if (typeof tokenUserId !== 'string' || typeof receiverId !== 'string') {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // find users
    const users = await prisma.user.findMany({
      where: {
        id: { in: [tokenUserId, receiverId] }
      }
    });

    if (users.length !== 2) {
      return res.status(404).json({ message: "One or both users not found" });
    }

    // check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [
          { userIDs: { has: tokenUserId } },
          { userIDs: { has: receiverId } }
        ]
      }
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    // create new chat
    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, receiverId],
      },
    });

    res.status(201).json(newChat);
  } catch (err) {
    console.error('Error in addChat:', err);
    res.status(500).json({ message: "Failed to add chat", error: err.message });
  }
};



export const readChat = async (req, res) => {
  const tokenUserId = req.userId;

  
  try {
    // 先查找聊天，然后检查用户权限
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
      },
    });

    // 检查用户是否有权限访问这个聊天
    if (!chat || !chat.userIDs.includes(tokenUserId)) {
      return res.status(403).json({ message: "Access denied!" });
    }

    // 更新已读状态：如果用户ID不在seenBy中，则添加
    const seenBy = chat.seenBy || [];
    const updatedSeenBy = seenBy.includes(tokenUserId) 
      ? seenBy 
      : [...seenBy, tokenUserId];

    const updatedChat = await prisma.chat.update({
      where: {
        id: req.params.id,
      },
      data: {
        seenBy: {
          set: updatedSeenBy,
        },
      },
    });
    res.status(200).json(updatedChat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to read chat!" });
  }
};
