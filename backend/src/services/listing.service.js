import prisma from '../config/prisma.js';
import { v2 as cloudinary } from 'cloudinary';

class ListingService {
  /**
   * إنشاء إعلان جديد
   */
  async createListing(sellerId, data) {
    // تجهيز البيانات
    const { propertyDetails, carDetails, ...coreData } = data;

    // تطبيق القواعد الأمنية: 
    // 1. تجاهل أي حالة (status) ممررة وفرض ACTIVE دائماً
    coreData.status = 'ACTIVE';

    // 2. إذا كان البيع SALE نتأكد من مسح الـ rentPeriod
    if (coreData.listingType === 'SALE') {
      coreData.rentPeriod = null;
    }

    // إنشاء الإعلان مع تفاصيله المترابطة
    const listing = await prisma.listing.create({
      data: {
        ...coreData,
        sellerId, // هذا القادم من المصادقة (req.user.id) حصراً
        
        // ربط التفاصيل الخاصة إذا كانت موجودة
        ...(propertyDetails && { propertyDetails: { create: propertyDetails } }),
        ...(carDetails && { carDetails: { create: carDetails } }),
      },
      include: {
        propertyDetails: true,
        carDetails: true,
      },
    });

    return listing;
  }

  /**
   * جلب الإعلانات مع الفلترة والترقيم
   */
  async getListings(filters) {
    const { 
      page = 1, limit = 12, category, city, search,
      district, minPrice, maxPrice, listingType,
      propertyType, minArea, maxArea, bedrooms, bathrooms,
      brand, model, condition, minYear, maxYear, fuelType, transmission,
      sortBy
    } = filters;

    const skip = (page - 1) * limit;

    // بناء شروط الفلترة الأساسية
    const where = {
      // الشرط الأمني: لا نجلب إلا الإعلانات النشطة دائماً وبشكل إجباري
      status: 'ACTIVE',
    };

    if (category) where.category = category;
    if (listingType) where.listingType = listingType;
    if (city) where.city = city; // Exact match or contains based on preference, using exact for better index usage
    if (district) where.district = district;
    
    // فلتر السعر
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // بناء فلاتر العقار
    const propertyFilters = {};
    if (propertyType) propertyFilters.propertyType = propertyType;
    if (bedrooms) propertyFilters.bedrooms = parseInt(bedrooms);
    if (bathrooms) propertyFilters.bathrooms = parseInt(bathrooms);
    if (minArea || maxArea) {
      propertyFilters.area = {};
      if (minArea) propertyFilters.area.gte = parseFloat(minArea);
      if (maxArea) propertyFilters.area.lte = parseFloat(maxArea);
    }
    
    if (Object.keys(propertyFilters).length > 0) {
      where.propertyDetails = { is: propertyFilters };
    }

    // بناء فلاتر السيارة
    const carFilters = {};
    if (brand) carFilters.brand = { contains: brand, mode: 'insensitive' };
    if (model) carFilters.model = { contains: model, mode: 'insensitive' };
    if (condition) carFilters.condition = condition;
    if (fuelType) carFilters.fuelType = fuelType;
    if (transmission) carFilters.transmission = transmission;
    if (minYear || maxYear) {
      carFilters.year = {};
      if (minYear) carFilters.year.gte = parseInt(minYear);
      if (maxYear) carFilters.year.lte = parseInt(maxYear);
    }

    if (Object.keys(carFilters).length > 0) {
      where.carDetails = { is: carFilters };
    }

    // تحديد الترتيب (Sorting)
    let orderBy = { createdAt: 'desc' }; // الأحدث أولاً افتراضياً
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { price: 'desc' };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy,
        include: {
          seller: { select: { id: true, fullName: true, isVerified: true } },
          propertyDetails: true,
          carDetails: true,
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      listings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * جلب إعلانات المستخدم (البائع) بكل حالاتها
   */
  async getMyListings(sellerId) {
    return prisma.listing.findMany({
      where: { 
        sellerId,
        status: { not: 'DELETED' }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        propertyDetails: true,
        carDetails: true,
      }
    });
  }

  /**
   * جلب تفاصيل إعلان محدد
   */
  async getListingById(id, viewerId) {
    const listing = await prisma.listing.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        seller: { select: { id: true, fullName: true, isVerified: true, phoneNumber: true } },
        propertyDetails: true,
        carDetails: true,
      },
    });

    if (!listing) {
      const err = new Error('الإعلان غير موجود أو غير نشط');
      err.statusCode = 404;
      throw err;
    }

    // زيادة عداد المشاهدات إذا لم يكن المشاهد هو صاحب الإعلان نفسه
    if (!viewerId || viewerId !== listing.sellerId) {
      await prisma.listing.update({
        where: { id },
        data: { views: { increment: 1 } }
      }).catch(err => console.error('Error incrementing views:', err.message));
      listing.views = (listing.views || 0) + 1;
    }

    return listing;
  }

  // Extract public ID from Cloudinary URL
  _extractPublicId(url) {
    try {
      // URL format: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<filename>.<ext>
      const splitUrl = url.split('/');
      const filenameWithExt = splitUrl[splitUrl.length - 1];
      const folder = splitUrl[splitUrl.length - 2];
      const filename = filenameWithExt.split('.')[0];
      return `${folder}/${filename}`;
    } catch (e) {
      return null;
    }
  }

  async _deleteImagesFromCloudinary(urls) {
    if (!urls || urls.length === 0) return;
    try {
      const publicIds = urls.map(url => this._extractPublicId(url)).filter(Boolean);
      if (publicIds.length > 0) {
        await Promise.all(publicIds.map(id => cloudinary.uploader.destroy(id)));
      }
    } catch (error) {
      console.error('Error deleting old images from Cloudinary:', error);
    }
  }

  /**
   * تحديث إعلان
   */
  async updateListing(sellerId, listingId, data) {
    // التأكد من أن الإعلان موجود وأن هذا المستخدم هو المالك، مع جلب التفاصيل الحالية
    const listing = await prisma.listing.findUnique({ 
      where: { id: listingId },
      include: { propertyDetails: true, carDetails: true }
    });
    
    if (!listing || listing.status === 'DELETED') {
      const err = new Error('الإعلان غير موجود');
      err.statusCode = 404;
      throw err;
    }

    // 1. الأمان الحرج: التحقق من أن طالب التعديل هو مالك الإعلان الفعلي
    if (listing.sellerId !== sellerId) {
      const err = new Error('غير مصرح لك بتعديل هذا الإعلان');
      err.statusCode = 403; // Forbidden
      throw err;
    }

    // 2. فصل البيانات الخاصة بالتفاصيل عن البيانات الأساسية
    const { propertyDetails, carDetails, ...coreData } = data;

    // 3. التحديث الذكي: استخدام update إذا كانت التفاصيل موجودة مسبقاً، أو create إذا لم تكن موجودة
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        ...coreData,
        ...(propertyDetails && {
          propertyDetails: listing.propertyDetails 
            ? { update: propertyDetails } 
            : { create: propertyDetails }
        }),
        ...(carDetails && {
          carDetails: listing.carDetails 
            ? { update: carDetails } 
            : { create: carDetails }
        })
      },
      include: {
        propertyDetails: true,
        carDetails: true,
      }
    });

    // حذف الصور القديمة إذا تم تغيير الصور
    if (data.images && Array.isArray(data.images)) {
      const removedImages = listing.images.filter(img => !data.images.includes(img));
      if (removedImages.length > 0) {
        this._deleteImagesFromCloudinary(removedImages);
      }
    }

    return updatedListing;
  }

  /**
   * حذف الإعلان (Soft Delete)
   */
  async deleteListing(sellerId, listingId) {
    // التأكد من أن الإعلان موجود وأن هذا المستخدم هو المالك
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    
    if (!listing || listing.status === 'DELETED') {
      const err = new Error('الإعلان غير موجود مسبقاً');
      err.statusCode = 404;
      throw err;
    }

    if (listing.sellerId !== sellerId) {
      const err = new Error('غير مصرح لك بحذف هذا الإعلان');
      err.statusCode = 403; // Forbidden
      throw err;
    }

    // نقوم بالـ Soft Delete للحفاظ على الترابط في الداتا بيز
    await prisma.listing.update({
      where: { id: listingId },
      data: { status: 'DELETED' },
    });

    // حذف جميع الصور المرتبطة بالإعلان من السحابة لتوفير المساحة
    if (listing.images && listing.images.length > 0) {
       this._deleteImagesFromCloudinary(listing.images);
    }

    return { message: 'تم حذف الإعلان بنجاح' };
  }
}

export default new ListingService();
