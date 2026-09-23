import prisma from '../config/prisma.js';

class NotificationsService {
  formatNotification(notif) {
    let parsed = null;
    try {
      if (typeof notif.content === 'string' && notif.content.startsWith('{')) {
        parsed = JSON.parse(notif.content);
      }
    } catch (e) {
      parsed = null;
    }

    if (parsed && typeof parsed === 'object') {
      return {
        id: notif.id,
        type: notif.type,
        title: parsed.title || 'رسالة جديدة',
        body: parsed.body || notif.content,
        content: parsed.body || notif.content,
        actorId: parsed.actorId || null,
        entityId: parsed.entityId || null,
        readAt: notif.isRead ? notif.createdAt : null,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
        userId: notif.userId
      };
    }

    return {
      id: notif.id,
      type: notif.type,
      title: notif.type === 'OFFER_RECEIVED' ? 'عرض جديد' : notif.type === 'MESSAGE_RECEIVED' ? 'رسالة جديدة' : 'إشعار',
      body: notif.content,
      content: notif.content,
      actorId: null,
      entityId: null,
      readAt: notif.isRead ? notif.createdAt : null,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
      userId: notif.userId
    };
  }

  async getNotifications(userId, { page, limit } = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      })
    ]);

    return {
      notifications: notifications.map(n => this.formatNotification(n)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  async getUnreadCount(userId) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
    return { unreadCount: count };
  }

  async markSingleAsRead(userId, notificationId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      const error = new Error('الإشعار غير موجود');
      error.statusCode = 404;
      throw error;
    }

    if (notification.userId !== userId) {
      const error = new Error('غير مصرح لك بتعديل هذا الإشعار');
      error.statusCode = 403;
      throw error;
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    return this.formatNotification(updated);
  }

  async markAllAsRead(userId) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    return { success: true };
  }

  // Alias for backward compatibility
  async markAsRead(userId) {
    return this.markAllAsRead(userId);
  }
}

export default new NotificationsService();
