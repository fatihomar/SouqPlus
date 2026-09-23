import messagesService from '../services/messages.service.js';
import catchAsync from '../utils/catchAsync.js';

class MessagesController {
  
  sendMessage = catchAsync(async (req, res) => {
    // 1. Force senderId to be the logged in user to prevent spoofing
    const senderId = req.user.id;
    const { receiverId, listingId, content, imageUrl } = req.body;

    if (!receiverId || (!content && !imageUrl)) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء توفير معرف المستلم ونص الرسالة أو الصورة'
      });
    }

    const message = await messagesService.sendMessage(senderId, receiverId, listingId, content, imageUrl);

    res.status(201).json({
      success: true,
      message: 'تم إرسال الرسالة بنجاح',
      data: message
    });
  });

  getConversations = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const conversations = await messagesService.getConversations(userId);
    
    res.status(200).json({
      success: true,
      data: conversations
    });
  });

  getMessages = catchAsync(async (req, res) => {
    // 2. Ensure the user can only read their own messages with the other party
    const userId1 = req.user.id;
    const userId2 = req.params.userId; // The other person

    const messages = await messagesService.getMessagesBetweenUsers(userId1, userId2);

    res.status(200).json({
      success: true,
      data: messages
    });
  });

  getUnreadCount = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const count = await messagesService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  });
}

export default new MessagesController();
