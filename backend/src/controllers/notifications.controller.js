import notificationsService from '../services/notifications.service.js';
import catchAsync from '../utils/catchAsync.js';

class NotificationsController {
  
  getNotifications = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { notifications, pagination } = await notificationsService.getNotifications(userId, req.query);
    
    res.status(200).json({
      success: true,
      data: notifications,
      pagination
    });
  });

  getUnreadCount = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const result = await notificationsService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  markSingleAsRead = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await notificationsService.markSingleAsRead(userId, id);

    res.status(200).json({
      success: true,
      message: 'تم تحديد الإشعار كمقروء',
      data: updated
    });
  });

  markAllAsRead = catchAsync(async (req, res) => {
    const userId = req.user.id;
    await notificationsService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'تم تحديد جميع الإشعارات كمقروءة'
    });
  });

  // Alias for backward compatibility
  markAsRead = this.markAllAsRead;
}

export default new NotificationsController();
