import prisma from '../config/prisma.js';

class OffersService {
  /**
   * إنشاء عرض جديد من قبل المشتري
   */
  async createOffer(buyerId, listingId, amount) {
    // 1. تحقق من الإعلان
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      const error = new Error('الإعلان غير موجود');
      error.statusCode = 404;
      throw error;
    }

    if (listing.status !== 'ACTIVE') {
      const error = new Error('لا يمكن تقديم عرض لأن الإعلان لم يعد متاحاً');
      error.statusCode = 400;
      throw error;
    }

    if (listing.sellerId === buyerId) {
      const error = new Error('لا يمكنك تقديم عرض على إعلانك الخاص');
      error.statusCode = 400;
      throw error;
    }

    // 2. تحقق إذا كان للمشتري عرض معلق مسبقاً على هذا الإعلان
    const existingOffer = await prisma.offer.findFirst({
      where: { buyerId, listingId, status: 'PENDING' }
    });

    if (existingOffer) {
      const error = new Error('لديك بالفعل عرض قيد الانتظار لهذا الإعلان');
      error.statusCode = 400;
      throw error;
    }

    // 3. إنشاء العرض
    const offer = await prisma.offer.create({
      data: {
        buyerId,
        listingId,
        amount
      },
      include: {
        buyer: { select: { id: true, fullName: true } },
        listing: { select: { id: true, title: true } }
      }
    });

    // 4. إرسال إشعار للبائع (عرض جديد)
    await prisma.notification.create({
      data: {
        userId: listing.sellerId,
        type: 'OFFER_RECEIVED',
        content: `تلقيت عرضاً جديداً بقيمة ${amount}$ على إعلانك "${listing.title}" من ${offer.buyer.fullName}.`
      }
    });

    return offer;
  }

  /**
   * جلب العروض الخاصة بإعلان معين (للبائع)
   */
  async getListingOffers(sellerId, listingId) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing || listing.sellerId !== sellerId) {
      const error = new Error('غير مصرح لك بمشاهدة عروض هذا الإعلان');
      error.statusCode = 403;
      throw error;
    }

    return prisma.offer.findMany({
      where: { listingId },
      include: {
        buyer: { select: { id: true, fullName: true, isVerified: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * جلب جميع العروض التي تلقاها البائع على جميع إعلاناته
   */
  async getReceivedOffers(sellerId) {
    return prisma.offer.findMany({
      where: {
        listing: { sellerId }
      },
      include: {
        buyer: { select: { id: true, fullName: true, isVerified: true } },
        listing: { select: { id: true, title: true, price: true, images: true, listingType: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * جلب العروض التي قدمها المشتري نفسه
   */
  async getMyOffers(buyerId) {
    return prisma.offer.findMany({
      where: { buyerId },
      include: {
        listing: { select: { id: true, title: true, price: true, images: true, listingType: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * الرد على عرض (موافقة أو رفض) من قبل البائع
   */
  async respondToOffer(sellerId, offerId, action) {
    if (!['ACCEPT', 'REJECT'].includes(action)) {
      const error = new Error('الإجراء غير صالح. يجب أن يكون ACCEPT أو REJECT');
      error.statusCode = 400;
      throw error;
    }

    // 1. جلب العرض داخل الـ Transaction لمنع الـ Race Condition
    const transaction = await prisma.$transaction(async (tx) => {
      const offer = await tx.offer.findUnique({
        where: { id: offerId },
        include: { listing: true }
      });

      if (!offer) {
        const error = new Error('العرض غير موجود');
        error.statusCode = 404;
        throw error;
      }

      if (offer.listing.sellerId !== sellerId) {
        const error = new Error('غير مصرح لك بالرد على هذا العرض');
        error.statusCode = 403;
        throw error;
      }

      if (offer.status !== 'PENDING') {
        const error = new Error('تم الرد على هذا العرض مسبقاً');
        error.statusCode = 400;
        throw error;
      }

      if (offer.listing.status !== 'ACTIVE') {
        const error = new Error('الإعلان لم يعد متاحاً لقبول هذا العرض');
        error.statusCode = 400;
        throw error;
      }

      // 2. معالجة الرفض (REJECT)
      if (action === 'REJECT') {
        const updatedOffer = await tx.offer.update({
          where: { id: offerId },
          data: { status: 'REJECTED' }
        });

        // إشعار للمشتري برفض العرض
        await tx.notification.create({
          data: {
            userId: offer.buyerId,
            type: 'INFO',
            content: `عذراً، قام البائع برفض عرضك بقيمة ${offer.amount}$ لإعلان "${offer.listing.title}".`
          }
        });

        return updatedOffer;
      }
      // أ) تحديث العرض الحالي ليكون مقبولاً
      const acceptedOffer = await tx.offer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED' }
      });

      // ب) إشعار المشتري بالقبول
      await tx.notification.create({
        data: {
          userId: offer.buyerId,
          type: 'INFO',
          content: `مبروك! تم قبول عرضك بقيمة ${offer.amount}$ لإعلان "${offer.listing.title}". يرجى التواصل مع البائع لإتمام الصفقة.`
        }
      });

      // إرسال رسالة نظام تلقائية في المحادثة
      await tx.message.create({
        data: {
          senderId: sellerId,
          receiverId: offer.buyerId,
          listingId: offer.listingId,
          content: `✅ تم قبول عرضك بقيمة ${offer.amount.toLocaleString()}$`
        }
      });

      // ج) تحديد الحالة الجديدة للإعلان (مباع أو مؤجر)
      const newListingStatus = offer.listing.listingType === 'SALE' ? 'SOLD' : 'RENTED';

      // د) تحديث حالة الإعلان
      await tx.listing.update({
        where: { id: offer.listingId },
        data: { status: newListingStatus }
      });

      // هـ) جلب جميع العروض الأخرى المعلقة لرفضها
      const otherPendingOffers = await tx.offer.findMany({
        where: {
          listingId: offer.listingId,
          id: { not: offerId },
          status: 'PENDING'
        }
      });

      if (otherPendingOffers.length > 0) {
        // رفض العروض الأخرى
        await tx.offer.updateMany({
          where: {
            listingId: offer.listingId,
            id: { not: offerId },
            status: 'PENDING'
          },
          data: { status: 'REJECTED' }
        });

        // إرسال إشعارات لأصحاب العروض المرفوضة تلقائياً (كما طلبت تماماً)
        const autoRejectNotifications = otherPendingOffers.map(otherOffer => ({
          userId: otherOffer.buyerId,
          type: 'INFO',
          content: `نأسف، تم إغلاق الإعلان "${offer.listing.title}" نظراً لقبول البائع لعرض آخر. حظاً أوفر في المرة القادمة!`
        }));

        await tx.notification.createMany({
          data: autoRejectNotifications
        });
      }

      return acceptedOffer;
    });

    return transaction;
  }
}

export default new OffersService();
