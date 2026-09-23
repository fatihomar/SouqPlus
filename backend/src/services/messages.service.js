import prisma from '../config/prisma.js';

class MessagesService {
  async sendMessage(senderId, receiverId, listingId, content, imageUrl) {
    if (senderId === receiverId) {
      const error = new Error('لا يمكنك إرسال رسالة إلى نفسك');
      error.statusCode = 400;
      throw error;
    }

    if (imageUrl) {
      // Validate that the image comes from our Cloudinary
      if (!imageUrl.startsWith('https://res.cloudinary.com/')) {
        const error = new Error('رابط الصورة غير صالح أو غير مدعوم');
        error.statusCode = 400;
        throw error;
      }
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      const error = new Error('المستخدم المستلم غير موجود');
      error.statusCode = 404;
      throw error;
    }

    if (receiver.isBanned) {
      const error = new Error('لا يمكنك إرسال رسالة لهذا المستخدم لأنه محظور');
      error.statusCode = 403;
      throw error;
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        listingId: listingId || null,
        content: content || ''
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    // توليد إشعار للمستلم إذا لم يكن هو المرسل نفسه
    if (senderId !== receiverId) {
      // منع إنشاء إشعارات مكررة لنفس المحادثة إذا كان هناك إشعار غير مقروء مسبقاً من نفس المرسل
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId: receiverId,
          type: 'MESSAGE_RECEIVED',
          isRead: false,
          content: {
            contains: senderId
          }
        }
      });

      if (!existingNotif) {
        const notifPayload = {
          title: 'رسالة جديدة',
          body: `لديك رسالة جديدة من ${message.sender?.fullName || 'مستخدم'}`,
          actorId: senderId,
          entityId: senderId
        };

        await prisma.notification.create({
          data: {
            userId: receiverId,
            type: 'MESSAGE_RECEIVED',
            content: JSON.stringify(notifPayload),
            isRead: false
          }
        });
      }
    }

    return message;
  }

  async getConversations(userId) {
    // A simple query to get users we have talked to
    // In a production app, we would group by the latest message.
    // For simplicity, we just fetch distinct pairs.
    
    // Fetch all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        sender: {
          select: { id: true, fullName: true, role: true }
        },
        receiver: {
          select: { id: true, fullName: true, role: true }
        },
        listing: { select: { id: true, title: true, images: true } }
      }
    });

    // Process to unique conversations
    const conversationsMap = new Map();
    
    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationsMap.has(otherUser.id)) {
        conversationsMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: (msg.receiverId === userId && !msg.isRead) ? 1 : 0
        });
      } else {
        if (msg.receiverId === userId && !msg.isRead) {
          conversationsMap.get(otherUser.id).unreadCount += 1;
        }
      }
    }

    return Array.from(conversationsMap.values());
  }

  async getMessagesBetweenUsers(userId1, userId2) {
    // Verify the other user exists
    const user2 = await prisma.user.findUnique({ where: { id: userId2 } });
    if (!user2) {
      const err = new Error('المستخدم غير موجود');
      err.statusCode = 404;
      throw err;
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
      },
      orderBy: {
        createdAt: 'asc' // Oldest to newest
      },
      include: {
        sender: { select: { id: true, fullName: true } },
        listing: { select: { id: true, title: true, price: true, images: true, category: true, listingType: true } }
      }
    });

    // Mark as read
    await prisma.message.updateMany({
      where: {
        senderId: userId2,
        receiverId: userId1,
        isRead: false
      },
      data: { isRead: true }
    });

    return messages;
  }

  async getUnreadCount(userId) {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });
    return count;
  }
}

export default new MessagesService();
