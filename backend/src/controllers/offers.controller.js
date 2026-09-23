import offersService from '../services/offers.service.js';
import catchAsync from '../utils/catchAsync.js';

class OffersController {
  
  /**
   * تقديم عرض مالي جديد من قبل المشتري
   */
  createOffer = catchAsync(async (req, res) => {
    // الأمان 1: استخراج المعرف حصراً من الـ JWT
    const buyerId = req.user.id;
    const { listingId, amount } = req.body;

    if (!listingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء توفير معرف الإعلان وقيمة العرض'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب أن تكون قيمة العرض أكبر من صفر'
      });
    }

    const offer = await offersService.createOffer(buyerId, listingId, parseFloat(amount));

    res.status(201).json({
      success: true,
      message: 'تم تقديم العرض بنجاح',
      data: offer
    });
  });

  /**
   * جلب العروض الخاصة بإعلان معين (مخصص للبائع)
   */
  getListingOffers = catchAsync(async (req, res) => {
    const sellerId = req.user.id;
    const { listingId } = req.params;

    const offers = await offersService.getListingOffers(sellerId, listingId);

    res.status(200).json({
      success: true,
      data: offers
    });
  });

  /**
   * جلب جميع العروض التي تلقاها البائع على جميع إعلاناته
   */
  getReceivedOffers = catchAsync(async (req, res) => {
    const sellerId = req.user.id;

    const offers = await offersService.getReceivedOffers(sellerId);

    res.status(200).json({
      success: true,
      data: offers
    });
  });

  /**
   * جلب العروض التي قدمها المشتري نفسه (مخصص للمشتري)
   */
  getMyOffers = catchAsync(async (req, res) => {
    const buyerId = req.user.id;

    const offers = await offersService.getMyOffers(buyerId);

    res.status(200).json({
      success: true,
      data: offers
    });
  });

  /**
   * الموافقة أو الرفض على العرض (مخصص للبائع)
   */
  respondToOffer = catchAsync(async (req, res) => {
    const sellerId = req.user.id;
    const { id: offerId } = req.params;
    const { action } = req.body; // 'ACCEPT' or 'REJECT'

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء تحديد الإجراء (ACCEPT أو REJECT)'
      });
    }

    const result = await offersService.respondToOffer(sellerId, offerId, action.toUpperCase());

    res.status(200).json({
      success: true,
      message: action.toUpperCase() === 'ACCEPT' ? 'تم قبول العرض بنجاح' : 'تم رفض العرض',
      data: result
    });
  });
}

export default new OffersController();
